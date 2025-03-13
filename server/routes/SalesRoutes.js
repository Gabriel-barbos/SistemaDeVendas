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

// EXIBIR VENDAS
router.get('/', async (req, res) => {
  try {
    const sales = await Sale.find().populate('items.product');
    res.status(200).json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
