const express = require('express');
const router = express.Router();
const { Order, OrderItem, Customer, ShopItem } = require('../models');

// GET all orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        { model: Customer },
        { 
          model: OrderItem,
          include: [{ model: ShopItem }]
        }
      ]
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving orders', error: error.message });
  }
});

// GET order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        { model: Customer },
        { 
          model: OrderItem,
          include: [{ model: ShopItem }]
        }
      ]
    });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving order', error: error.message });
  }
});

// GET orders by status
router.get('/status/:status', async (req, res) => {
  try {
    const { status } = req.params;
    
    if (!['pending', 'processing', 'shipped', 'delivered', 'canceled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }
    
    const orders = await Order.findAll({
      where: { status },
      include: [
        { model: Customer },
        { 
          model: OrderItem,
          include: [{ model: ShopItem }]
        }
      ]
    });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving orders', error: error.message });
  }
});

// POST new order
router.post('/', async (req, res) => {
  try {
    const { customerId, items, shippingAddress, notes, status } = req.body;
    
    if (!customerId || !items || !items.length) {
      return res.status(400).json({ message: 'Customer ID and at least one item are required' });
    }
    
    // Check if customer exists
    const customer = await Customer.findByPk(customerId);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    // Create order
    const order = await Order.create({ 
      CustomerId: customerId,
      status: status || 'pending',
      orderDate: new Date(),
      shippingAddress: shippingAddress || customer.address,
      notes
    });
    
    // Create order items
    const orderItems = [];
    for (const item of items) {
      // Check if shop item exists
      const shopItem = await ShopItem.findByPk(item.shopItemId);
      if (!shopItem) {
        await order.destroy();
        return res.status(404).json({ message: `Shop item with ID ${item.shopItemId} not found` });
      }
      
      if (!item.quantity || item.quantity < 1) {
        await order.destroy();
        return res.status(400).json({ message: 'Quantity must be at least 1' });
      }
      
      // Check if enough stock is available
      if (shopItem.stockQuantity < item.quantity) {
        await order.destroy();
        return res.status(400).json({ 
          message: `Not enough stock for item ${shopItem.title}. Available: ${shopItem.stockQuantity}` 
        });
      }
      
      // Decrease stock quantity
      await shopItem.update({ stockQuantity: shopItem.stockQuantity - item.quantity });
      
      const orderItem = await OrderItem.create({
        OrderId: order.id,
        ShopItemId: item.shopItemId,
        quantity: item.quantity
      });
      
      orderItems.push(orderItem);
    }
    
    // Fetch the created order with its items
    const createdOrder = await Order.findByPk(order.id, {
      include: [
        { model: Customer },
        { 
          model: OrderItem,
          include: [{ model: ShopItem }]
        }
      ]
    });
    
    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
});

// PUT (update) order
router.put('/:id', async (req, res) => {
  try {
    const { customerId, items, status, shippingAddress, notes } = req.body;
    const order = await Order.findByPk(req.params.id, {
      include: [
        { 
          model: OrderItem,
          include: [{ model: ShopItem }]
        }
      ]
    });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Update order properties
    const updateData = {};
    
    if (customerId) {
      const customer = await Customer.findByPk(customerId);
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }
      updateData.CustomerId = customerId;
    }
    
    if (status) {
      if (!['pending', 'processing', 'shipped', 'delivered', 'canceled'].includes(status)) {
        return res.status(400).json({ message: 'Invalid order status' });
      }
      
      // If canceling an order, restore the stock quantities
      if (status === 'canceled' && order.status !== 'canceled') {
        for (const orderItem of order.OrderItems) {
          const shopItem = orderItem.ShopItem;
          await shopItem.update({ 
            stockQuantity: shopItem.stockQuantity + orderItem.quantity 
          });
        }
      }
      
      updateData.status = status;
    }
    
    if (shippingAddress !== undefined) updateData.shippingAddress = shippingAddress;
    if (notes !== undefined) updateData.notes = notes;
    
    await order.update(updateData);
    
    // Update items if provided
    if (items && items.length > 0) {
      // If order status is not canceled, restore the stock for current items before removing them
      if (order.status !== 'canceled') {
        for (const orderItem of order.OrderItems) {
          const shopItem = orderItem.ShopItem;
          await shopItem.update({ 
            stockQuantity: shopItem.stockQuantity + orderItem.quantity 
          });
        }
      }
      
      // Remove existing order items
      await OrderItem.destroy({ where: { OrderId: order.id } });
      
      // Create new order items
      for (const item of items) {
        // Check if shop item exists
        const shopItem = await ShopItem.findByPk(item.shopItemId);
        if (!shopItem) {
          return res.status(404).json({ message: `Shop item with ID ${item.shopItemId} not found` });
        }
        
        if (!item.quantity || item.quantity < 1) {
          return res.status(400).json({ message: 'Quantity must be at least 1' });
        }
        
        // Check if enough stock is available (skip check if order is already canceled)
        if (updateData.status !== 'canceled' && shopItem.stockQuantity < item.quantity) {
          return res.status(400).json({ 
            message: `Not enough stock for item ${shopItem.title}. Available: ${shopItem.stockQuantity}` 
          });
        }
        
        // Decrease stock quantity (skip if order is already canceled)
        if (updateData.status !== 'canceled') {
          await shopItem.update({ stockQuantity: shopItem.stockQuantity - item.quantity });
        }
        
        await OrderItem.create({
          OrderId: order.id,
          ShopItemId: item.shopItemId,
          quantity: item.quantity
        });
      }
    }
    
    // Fetch the updated order with its items
    const updatedOrder = await Order.findByPk(order.id, {
      include: [
        { model: Customer },
        { 
          model: OrderItem,
          include: [{ model: ShopItem }]
        }
      ]
    });
    
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Error updating order', error: error.message });
  }
});

// DELETE order
router.delete('/:id', async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{ 
        model: OrderItem,
        include: [{ model: ShopItem }]
      }]
    });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // If order is not canceled, restore stock quantities
    if (order.status !== 'canceled') {
      for (const orderItem of order.OrderItems) {
        const shopItem = orderItem.ShopItem;
        await shopItem.update({ 
          stockQuantity: shopItem.stockQuantity + orderItem.quantity 
        });
      }
    }
    
    await order.destroy();
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting order', error: error.message });
  }
});

module.exports = router;