const express = require('express');
const router = express.Router();
const { Customer } = require('../models');

// GET all customers
router.get('/', async (req, res) => {
  try {
    const customers = await Customer.findAll();
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving customers', error: error.message });
  }
});

// GET customer by ID
router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving customer', error: error.message });
  }
});

// POST new customer
router.post('/', async (req, res) => {
  try {
    const { name, surname, email, address, city, state, zipCode, country, phone } = req.body;
    
    if (!name || !surname || !email) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const customer = await Customer.create({ 
      name, 
      surname, 
      email, 
      address, 
      city, 
      state, 
      zipCode, 
      country, 
      phone 
    });
    res.status(201).json(customer);
  } catch (error) {
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Validation error', error: error.message });
    }
    res.status(500).json({ message: 'Error creating customer', error: error.message });
  }
});

// PUT (update) customer
router.put('/:id', async (req, res) => {
  try {
    const { name, surname, email, address, city, state, zipCode, country, phone } = req.body;
    const customer = await Customer.findByPk(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    await customer.update({ 
      name, 
      surname, 
      email, 
      address, 
      city, 
      state, 
      zipCode, 
      country, 
      phone 
    });
    res.json(customer);
  } catch (error) {
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Validation error', error: error.message });
    }
    res.status(500).json({ message: 'Error updating customer', error: error.message });
  }
});

// DELETE customer
router.delete('/:id', async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    await customer.destroy();
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting customer', error: error.message });
  }
});

module.exports = router;