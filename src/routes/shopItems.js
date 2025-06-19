const express = require('express');
const router = express.Router();
const { shopItemSchema } = require('../validators/schemas');
const db = require('../data/database');

router.get('/', (req, res) => {
  const shopItems = Array.from(db.shopItems.values());
  res.json(shopItems);
});

router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const shopItem = db.shopItems.get(id);
  
  if (!shopItem) {
    return res.status(404).json({ error: 'Shop item not found' });
  }
  
  res.json(shopItem);
});

router.post('/', (req, res) => {
  const { error } = shopItemSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  
  const { categoryIds, ...itemData } = req.body;
  
  try {
    const categories = categoryIds.map(id => {
      const category = db.categories.get(id);
      if (!category) {
        throw new Error(`Category with id ${id} not found`);
      }
      return category;
    });
    
    const newShopItem = {
      id: db.getNextId(db.shopItems),
      ...itemData,
      categories
    };
    
    db.shopItems.set(newShopItem.id, newShopItem);
    res.status(201).json(newShopItem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const shopItem = db.shopItems.get(id);
  
  if (!shopItem) {
    return res.status(404).json({ error: 'Shop item not found' });
  }
  
  const { error } = shopItemSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  
  const { categoryIds, ...itemData } = req.body;
  
  try {
    const categories = categoryIds.map(catId => {
      const category = db.categories.get(catId);
      if (!category) {
        throw new Error(`Category with id ${catId} not found`);
      }
      return category;
    });
    
    const updatedShopItem = {
      id,
      ...itemData,
      categories
    };
    
    db.shopItems.set(id, updatedShopItem);
    res.json(updatedShopItem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const shopItem = db.shopItems.get(id);
  
  if (!shopItem) {
    return res.status(404).json({ error: 'Shop item not found' });
  }
  
  db.shopItems.delete(id);
  res.status(204).send();
});

module.exports = router;