const express = require('express');
const db = require('./data/database');

const customersRouter = require('./routes/customers');
const categoriesRouter = require('./routes/categories');
const shopItemsRouter = require('./routes/shopItems');
const ordersRouter = require('./routes/orders');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/customers', customersRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/shop-items', shopItemsRouter);
app.use('/api/orders', ordersRouter);

app.get('/', (req, res) => {
  res.json({
    message: 'Online Shop API',
    endpoints: {
      customers: '/api/customers',
      categories: '/api/categories',
      shopItems: '/api/shop-items',
      orders: '/api/orders'
    }
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

if (process.env.NODE_ENV !== 'test') {
  db.initializeTestData();
  
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;