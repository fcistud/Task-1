const express = require('express');
const router = express.Router();
const { orderSchema } = require('../validators/schemas');
const db = require('../data/database');

router.get('/', (req, res) => {
  const orders = Array.from(db.orders.values());
  res.json(orders);
});

router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const order = db.orders.get(id);
  
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  
  res.json(order);
});

router.post('/', (req, res) => {
  const { error } = orderSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  
  const { customerId, items } = req.body;
  
  const customer = db.customers.get(customerId);
  if (!customer) {
    return res.status(400).json({ error: 'Customer not found' });
  }
  
  try {
    const orderItems = items.map(item => {
      const shopItem = db.shopItems.get(item.shopItemId);
      if (!shopItem) {
        throw new Error(`Shop item with id ${item.shopItemId} not found`);
      }
      
      const orderItem = {
        id: db.getNextId(db.orderItems),
        shopItem,
        quantity: item.quantity
      };
      
      db.orderItems.set(orderItem.id, orderItem);
      return orderItem;
    });
    
    const newOrder = {
      id: db.getNextId(db.orders),
      customer,
      items: orderItems
    };
    
    db.orders.set(newOrder.id, newOrder);
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const order = db.orders.get(id);
  
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  
  const { error } = orderSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  
  const { customerId, items } = req.body;
  
  const customer = db.customers.get(customerId);
  if (!customer) {
    return res.status(400).json({ error: 'Customer not found' });
  }
  
  try {
    order.items.forEach(item => {
      db.orderItems.delete(item.id);
    });
    
    const orderItems = items.map(item => {
      const shopItem = db.shopItems.get(item.shopItemId);
      if (!shopItem) {
        throw new Error(`Shop item with id ${item.shopItemId} not found`);
      }
      
      const orderItem = {
        id: db.getNextId(db.orderItems),
        shopItem,
        quantity: item.quantity
      };
      
      db.orderItems.set(orderItem.id, orderItem);
      return orderItem;
    });
    
    const updatedOrder = {
      id,
      customer,
      items: orderItems
    };
    
    db.orders.set(id, updatedOrder);
    res.json(updatedOrder);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const order = db.orders.get(id);
  
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  
  order.items.forEach(item => {
    db.orderItems.delete(item.id);
  });
  
  db.orders.delete(id);
  res.status(204).send();
});

module.exports = router;