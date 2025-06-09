const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// Criar nova categoria
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Nome da categoria é obrigatório' });

    const existing = await Category.findOne({ name });
    if (existing) return res.status(400).json({ error: 'Categoria já existe' });

    const newCategory = new Category({ name });
    const saved = await newCategory.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Listar todas as categorias
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 }); // ordena por nome
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Atualizar uma categoria
router.put('/:id', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Nome da categoria é obrigatório' });

    const updated = await Category.findByIdAndUpdate(req.params.id, { name }, { new: true });
    if (!updated) return res.status(404).json({ error: 'Categoria não encontrada' });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Deletar uma categoria
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Categoria não encontrada' });

    res.json({ message: 'Categoria deletada com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
