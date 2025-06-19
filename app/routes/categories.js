const express = require('express');
const router = express.Router();
const { ShopItemCategory } = require('../models');

// GET all categories
router.get('/', async (req, res) => {
  try {
    const categories = await ShopItemCategory.findAll();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving categories', error: error.message });
  }
});

// GET category by ID
router.get('/:id', async (req, res) => {
  try {
    const category = await ShopItemCategory.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving category', error: error.message });
  }
});

// POST new category
router.post('/', async (req, res) => {
  try {
    const { title, description } = req.body;
    
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }
    
    const category = await ShopItemCategory.create({ title, description });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error creating category', error: error.message });
  }
});

// PUT (update) category
router.put('/:id', async (req, res) => {
  try {
    const { title, description } = req.body;
    const category = await ShopItemCategory.findByPk(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    await category.update({ title, description });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error updating category', error: error.message });
  }
});

// DELETE category
router.delete('/:id', async (req, res) => {
  try {
    const category = await ShopItemCategory.findByPk(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    await category.destroy();
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category', error: error.message });
  }
});

module.exports = router;