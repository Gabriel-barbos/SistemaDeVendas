const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Product = require('../models/Product');

router.post('/', async (req, res) => {
  try {
    const { items, payment } = req.body;
    let total = 0;
    const saleItems = [];

    // Processa cada item da venda
    for (let item of items) {
      // Busca o produto pelo ID
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ error: `Produto com ID ${item.productId} não encontrado` });
      }
      // Verifica se a quantidade em estoque é suficiente
      if (product.quantity < item.quantity) {
        return res.status(400).json({ error: `Estoque insuficiente para o produto ${product.name}` });
      }

      // Atualiza o total da venda e subtrai a quantidade vendida do estoque
      total += product.price * item.quantity;
      product.quantity -= item.quantity;
      await product.save();

      // Prepara os dados do item da venda
      saleItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price
      });
    }

    //salva o registro da venda
    const sale = new Sale({
      items: saleItems,
      total: total,
      payment: payment,
      date: new Date() 
    });

    await sale.save();
    res.status(201).json(sale);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// EXIBIR VENDAS - CORRIGIDA
router.get('/', async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate('items.product', 'name price category') // Especifica os campos do produto
      .sort({ date: -1 }); // Ordena por data mais recente
    res.status(200).json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// NOVA ROTA: PRODUTOS MAIS VENDIDOS PARA GRÁFICOS
router.get('/top-products', async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate('items.product', 'name price category')
      .exec();

    // Agrupa os produtos e conta quantidades
    const productStats = {};
    
    sales.forEach(sale => {
      sale.items.forEach(item => {
        // Verifica se o produto existe e foi populado corretamente
        if (item.product && item.product._id && item.product.name) {
          const productId = item.product._id.toString();
          
          if (!productStats[productId]) {
            productStats[productId] = {
              name: item.product.name,
              totalQuantity: 0,
              totalRevenue: 0,
              category: item.product.category || 'Sem categoria'
            };
          }
          
          productStats[productId].totalQuantity += item.quantity;
          productStats[productId].totalRevenue += (item.quantity * item.price);
        }
      });
    });

    // Converte para array e ordena por quantidade vendida
    const topProducts = Object.entries(productStats)
      .map(([id, stats]) => ({
        productId: id,
        name: stats.name,
        totalQuantity: stats.totalQuantity,
        totalRevenue: parseFloat(stats.totalRevenue.toFixed(2)),
        category: stats.category
      }))
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 10); // Top 10 produtos

    res.status(200).json(topProducts);
  } catch (error) {
    console.error('Erro ao buscar produtos mais vendidos:', error);
    res.status(500).json({ error: error.message });
  }
});

// NOVA ROTA: VENDAS POR PERÍODO PARA GRÁFICOS
router.get('/sales-by-period', async (req, res) => {
  try {
    const { period = 'month' } = req.query; // day, week, month, year
    
    let groupFormat;
    switch (period) {
      case 'day':
        groupFormat = '%Y-%m-%d';
        break;
      case 'week':
        groupFormat = '%Y-%U'; // Ano e semana
        break;
      case 'year':
        groupFormat = '%Y';
        break;
      default:
        groupFormat = '%Y-%m'; // mês
    }

    const salesByPeriod = await Sale.aggregate([
      {
        $group: {
          _id: {
            $dateToString: {
              format: groupFormat,
              date: '$date'
            }
          },
          totalSales: { $sum: '$total' },
          totalOrders: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    res.status(200).json(salesByPeriod);
  } catch (error) {
    console.error('Erro ao buscar vendas por período:', error);
    res.status(500).json({ error: error.message });
  }
});

// NOVA ROTA: MÉTODOS DE PAGAMENTO MAIS USADOS
router.get('/payment-methods', async (req, res) => {
  try {
    const paymentStats = await Sale.aggregate([
      {
        $group: {
          _id: '$payment.method',
          count: { $sum: 1 },
          totalValue: { $sum: '$total' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.status(200).json(paymentStats);
  } catch (error) {
    console.error('Erro ao buscar métodos de pagamento:', error);
    res.status(500).json({ error: error.message });
  }
});

// NOVA ROTA: RESUMO GERAL PARA DASHBOARD
router.get('/dashboard-summary', async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const [
      totalSales,
      todaySales,
      monthSales,
      totalOrders,
      todayOrders,
      monthOrders
    ] = await Promise.all([
      Sale.aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }]),
      Sale.aggregate([
        { $match: { date: { $gte: startOfDay } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Sale.aggregate([
        { $match: { date: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Sale.countDocuments(),
      Sale.countDocuments({ date: { $gte: startOfDay } }),
      Sale.countDocuments({ date: { $gte: startOfMonth } })
    ]);

    const summary = {
      totalRevenue: totalSales[0]?.total || 0,
      todayRevenue: todaySales[0]?.total || 0,
      monthRevenue: monthSales[0]?.total || 0,
      totalOrders: totalOrders,
      todayOrders: todayOrders,
      monthOrders: monthOrders
    };

    res.status(200).json(summary);
  } catch (error) {
    console.error('Erro ao buscar resumo do dashboard:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;