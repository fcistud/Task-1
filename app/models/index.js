const { Sequelize, DataTypes } = require('sequelize');

// Initialize Sequelize with SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false
});

// Define models
const Customer = require('./customer')(sequelize, DataTypes);
const ShopItemCategory = require('./shopItemCategory')(sequelize, DataTypes);
const ShopItem = require('./shopItem')(sequelize, DataTypes);
const OrderItem = require('./orderItem')(sequelize, DataTypes);
const Order = require('./order')(sequelize, DataTypes);

// Set up associations
ShopItem.belongsToMany(ShopItemCategory, { through: 'ShopItemCategoryShopItems', as: 'categories' });
ShopItemCategory.belongsToMany(ShopItem, { through: 'ShopItemCategoryShopItems', as: 'items' });

OrderItem.belongsTo(ShopItem);
ShopItem.hasMany(OrderItem);

Order.belongsTo(Customer);
Customer.hasMany(Order);

Order.hasMany(OrderItem);
OrderItem.belongsTo(Order);

// Export models and Sequelize instance
const db = {
  sequelize,
  Customer,
  ShopItemCategory,
  ShopItem,
  OrderItem,
  Order
};

module.exports = db;