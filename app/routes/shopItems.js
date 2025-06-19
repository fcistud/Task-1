const express = require('express');
const router = express.Router();
const { ShopItem, ShopItemCategory } = require('../models');
const { Op } = require('sequelize');

// GET all shop items
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      minPrice, 
      maxPrice, 
      search, 
      inStock, 
      isActive, 
      sortBy, 
      sortOrder 
    } = req.query;
    
    // Build filter condition
    const whereConditions = {};
    
    if (minPrice !== undefined) {
      whereConditions.price = { ...whereConditions.price, [Op.gte]: parseFloat(minPrice) };
    }
    
    if (maxPrice !== undefined) {
      whereConditions.price = { ...whereConditions.price, [Op.lte]: parseFloat(maxPrice) };
    }
    
    if (search) {
      whereConditions[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }
    
    if (inStock === 'true') {
      whereConditions.stockQuantity = { [Op.gt]: 0 };
    }
    
    if (isActive !== undefined) {
      whereConditions.isActive = isActive === 'true';
    }
    
    // Build include for category filter
    const includeOptions = [{ model: ShopItemCategory, as: 'categories' }];
    
    if (category) {
      includeOptions[0].where = { id: category };
    }
    
    // Build order options
    let orderOptions = [];
    if (sortBy) {
      const validSortColumns = ['title', 'price', 'stockQuantity', 'createdAt'];
      const validSortOrders = ['ASC', 'DESC'];
      
      if (validSortColumns.includes(sortBy)) {
        const order = validSortOrders.includes(sortOrder?.toUpperCase()) 
          ? sortOrder.toUpperCase() 
          : 'ASC';
        orderOptions = [[sortBy, order]];
      }
    }
    
    const shopItems = await ShopItem.findAll({
      where: whereConditions,
      include: includeOptions,
      order: orderOptions.length ? orderOptions : undefined
    });
    
    res.json(shopItems);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving shop items', error: error.message });
  }
});

// GET shop item by ID
router.get('/:id', async (req, res) => {
  try {
    const shopItem = await ShopItem.findByPk(req.params.id, {
      include: [{ model: ShopItemCategory, as: 'categories' }]
    });

    if (!shopItem) {
      return res.status(404).json({ message: 'Shop item not found' });
    }

    res.json(shopItem);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving shop item', error: error.message });
  }
});

// POST new shop item
router.post('/', async (req, res) => {
  try {
    const { 
      title, 
      description, 
      price, 
      categoryIds, 
      stockQuantity, 
      imageUrl, 
      isActive, 
      sku 
    } = req.body;

    if (!title || price === undefined) {
      return res.status(400).json({ message: 'Title and price are required' });
    }

    const shopItem = await ShopItem.create({ 
      title, 
      description, 
      price, 
      stockQuantity: stockQuantity || 0, 
      imageUrl, 
      isActive: isActive !== undefined ? isActive : true, 
      sku 
    });

    // Add categories if provided
    if (categoryIds && categoryIds.length > 0) {
      const categories = await ShopItemCategory.findAll({
        where: { id: categoryIds }
      });
      await shopItem.setCategories(categories);
    }

    // Fetch the created item with its categories
    const createdItem = await ShopItem.findByPk(shopItem.id, {
      include: [{ model: ShopItemCategory, as: 'categories' }]
    });

    res.status(201).json(createdItem);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: 'Validation error', error: error.message });
    }
    res.status(500).json({ message: 'Error creating shop item', error: error.message });
  }
});

// PUT (update) shop item
router.put('/:id', async (req, res) => {
  try {
    const { 
      title, 
      description, 
      price, 
      categoryIds, 
      stockQuantity, 
      imageUrl, 
      isActive, 
      sku 
    } = req.body;
    const shopItem = await ShopItem.findByPk(req.params.id);

    if (!shopItem) {
      return res.status(404).json({ message: 'Shop item not found' });
    }

    await shopItem.update({ 
      title, 
      description, 
      price, 
      stockQuantity: stockQuantity !== undefined ? stockQuantity : shopItem.stockQuantity, 
      imageUrl, 
      isActive: isActive !== undefined ? isActive : shopItem.isActive, 
      sku 
    });

    // Update categories if provided
    if (categoryIds) {
      const categories = await ShopItemCategory.findAll({
        where: { id: categoryIds }
      });
      await shopItem.setCategories(categories);
    }

    // Fetch the updated item with its categories
    const updatedItem = await ShopItem.findByPk(shopItem.id, {
      include: [{ model: ShopItemCategory, as: 'categories' }]
    });

    res.json(updatedItem);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: 'Validation error', error: error.message });
    }
    res.status(500).json({ message: 'Error updating shop item', error: error.message });
  }
});

// PATCH update stock quantity
router.patch('/:id/stock', async (req, res) => {
  try {
    const { stockQuantity } = req.body;
    const shopItem = await ShopItem.findByPk(req.params.id);

    if (!shopItem) {
      return res.status(404).json({ message: 'Shop item not found' });
    }

    if (stockQuantity === undefined || stockQuantity < 0) {
      return res.status(400).json({ message: 'Valid stock quantity is required' });
    }

    await shopItem.update({ stockQuantity });
    
    res.json({ 
      id: shopItem.id, 
      title: shopItem.title, 
      stockQuantity: shopItem.stockQuantity 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating stock quantity', error: error.message });
  }
});

// DELETE shop item
router.delete('/:id', async (req, res) => {
  try {
    const shopItem = await ShopItem.findByPk(req.params.id);

    if (!shopItem) {
      return res.status(404).json({ message: 'Shop item not found' });
    }

    await shopItem.destroy();
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting shop item', error: error.message });
  }
});

module.exports = router;