const express = require('express');
const router = express.Router();
const { customerSchema } = require('../validators/schemas');
const db = require('../data/database');

router.get('/', (req, res) => {
  const customers = Array.from(db.customers.values());
  res.json(customers);
});

router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const customer = db.customers.get(id);
  
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }
  
  res.json(customer);
});

router.post('/', (req, res) => {
  const { error } = customerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  
  const newCustomer = {
    id: db.getNextId(db.customers),
    ...req.body
  };
  
  db.customers.set(newCustomer.id, newCustomer);
  res.status(201).json(newCustomer);
});

router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const customer = db.customers.get(id);
  
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }
  
  const { error } = customerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  
  const updatedCustomer = {
    id,
    ...req.body
  };
  
  db.customers.set(id, updatedCustomer);
  res.json(updatedCustomer);
});

router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const customer = db.customers.get(id);
  
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }
  
  db.customers.delete(id);
  res.status(204).send();
});

module.exports = router;