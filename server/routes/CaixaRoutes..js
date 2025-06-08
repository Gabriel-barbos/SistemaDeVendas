const express = require('express');
const router = express.Router();
const Caixa = require('../models/Caixa');
const Sale = require('../models/Sale');

// ROTA PARA FECHAR O CAIXA
router.post('/fechar', async (req, res) => {
  try {
    const { valorFechamento } = req.body;

    // Busca o caixa aberto
    const caixaAberto = await Caixa.findOne({ status: 'aberto' });
    if (!caixaAberto) {
      return res.status(404).json({ msg: 'Nenhum caixa aberto encontrado.' });
    }

    // Busca vendas feitas em dinheiro desde a data de abertura
    const vendasDinheiro = await Sale.find({
      'payment.method': 'dinheiro',
      date: {
        $gte: caixaAberto.dataAbertura,
        $lte: new Date()
      }
    });

    // Calcula total vendido em dinheiro
    const totalVendasDinheiro = vendasDinheiro.reduce((acc, venda) => acc + venda.total, 0);

    // Calcula diferença entre o valor que deveria estar no caixa e o informado
    const esperado = caixaAberto.valorAbertura + totalVendasDinheiro;
    const diferenca = valorFechamento - esperado;

    // Atualiza os dados do caixa
    caixaAberto.dataFechamento = new Date();
    caixaAberto.valorFechamento = valorFechamento;
    caixaAberto.totalVendasDinheiro = totalVendasDinheiro;
    caixaAberto.diferenca = diferenca;
    caixaAberto.status = 'fechado';

    await caixaAberto.save();

    res.status(200).json({
      msg: 'Caixa fechado com sucesso.',
      caixa: caixaAberto
    });
  } catch (error) {
    console.error('Erro ao fechar o caixa:', error);
    res.status(500).json({ error: 'Erro ao fechar o caixa.' });
  }
});

// POST /caixa/abrir
router.post('/abrir', async (req, res) => {
    try {
      const { valorAbertura } = req.body;
  
      const caixaAberto = await Caixa.findOne({ status: 'aberto' });
      if (caixaAberto) {
        return res.status(400).json({ msg: 'Já existe um caixa aberto.' });
      }
  
      const novoCaixa = new Caixa({
        dataAbertura: new Date(),
        valorAbertura
      });
  
      await novoCaixa.save();
      res.status(201).json({ msg: 'Caixa aberto com sucesso.', caixa: novoCaixa });
    } catch (err) {
      res.status(500).json({ msg: 'Erro ao abrir o caixa.', error: err.message });
    }
  });

  


// GET /caixa/aberto
router.get('/aberto', async (req, res) => {
    try {
      const caixaAberto = await Caixa.findOne({ status: 'aberto' });
  
      if (!caixaAberto) {
        return res.status(404).json({ msg: 'Nenhum caixa aberto no momento.' });
      }
  
      res.status(200).json(caixaAberto);
    } catch (error) {
      res.status(500).json({ msg: 'Erro ao buscar caixa aberto.', error: error.message });
    }
  });
  
// GET /caixa
router.get('/', async (req, res) => {
    try {
      const caixas = await Caixa.find().sort({ dataAbertura: -1 });
  
      res.status(200).json(caixas);
    } catch (error) {
      res.status(500).json({ msg: 'Erro ao buscar caixas.', error: error.message });
    }
  });
  
module.exports = router;
