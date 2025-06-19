const express = require('express');
const { sequelize } = require('./models');
const seedDatabase = require('./seeders/initialData');

// Import routes
const customerRoutes = require('./routes/customers');
const categoryRoutes = require('./routes/categories');
const shopItemRoutes = require('./routes/shopItems');
const orderRoutes = require('./routes/orders');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.use('/customers', customerRoutes);
app.use('/categories', categoryRoutes);
app.use('/shop-items', shopItemRoutes);
app.use('/orders', orderRoutes);

// Root route for API status
app.get('/', (req, res) => {
  res.json({ message: 'Online Shop API is running' });
});

// Initialize database and start server
async function startServer() {
  try {
    // Sync database models
    await sequelize.sync({ force: true });
    
    // Seed database with initial data
    await seedDatabase();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
}

// Start the server if this file is run directly
if (require.main === module) {
  startServer();
}

// Export for testing
module.exports = { app, startServer };