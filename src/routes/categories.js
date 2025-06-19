const express = require('express');
const router = express.Router();
const { categorySchema } = require('../validators/schemas');
const db = require('../data/database');

router.get('/', (req, res) => {
  const categories = Array.from(db.categories.values());
  res.json(categories);
});

router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const category = db.categories.get(id);
  
  if (!category) {
    return res.status(404).json({ error: 'Category not found' });
  }
  
  res.json(category);
});

router.post('/', (req, res) => {
  const { error } = categorySchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  
  const newCategory = {
    id: db.getNextId(db.categories),
    ...req.body
  };
  
  db.categories.set(newCategory.id, newCategory);
  res.status(201).json(newCategory);
});

router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const category = db.categories.get(id);
  
  if (!category) {
    return res.status(404).json({ error: 'Category not found' });
  }
  
  const { error } = categorySchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  
  const updatedCategory = {
    id,
    ...req.body
  };
  
  db.categories.set(id, updatedCategory);
  res.json(updatedCategory);
});

router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const category = db.categories.get(id);
  
  if (!category) {
    return res.status(404).json({ error: 'Category not found' });
  }
  
  db.categories.delete(id);
  res.status(204).send();
});

module.exports = router;