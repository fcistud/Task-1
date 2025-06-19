const { v4: uuidv4 } = require('uuid');

class Database {
  constructor() {
    this.customers = new Map();
    this.categories = new Map();
    this.shopItems = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
  }

  reset() {
    this.customers.clear();
    this.categories.clear();
    this.shopItems.clear();
    this.orders.clear();
    this.orderItems.clear();
  }

  initializeTestData() {
    const category1 = {
      id: 1,
      title: 'Electronics',
      description: 'Electronic devices and accessories'
    };
    const category2 = {
      id: 2,
      title: 'Books',
      description: 'Physical and digital books'
    };
    const category3 = {
      id: 3,
      title: 'Clothing',
      description: 'Men and women clothing'
    };

    this.categories.set(category1.id, category1);
    this.categories.set(category2.id, category2);
    this.categories.set(category3.id, category3);

    const customer1 = {
      id: 1,
      name: 'John',
      surname: 'Doe',
      email: 'john.doe@example.com'
    };
    const customer2 = {
      id: 2,
      name: 'Jane',
      surname: 'Smith',
      email: 'jane.smith@example.com'
    };

    this.customers.set(customer1.id, customer1);
    this.customers.set(customer2.id, customer2);

    const item1 = {
      id: 1,
      title: 'Laptop',
      description: 'High-performance laptop',
      price: 999.99,
      categories: [category1]
    };
    const item2 = {
      id: 2,
      title: 'JavaScript Guide',
      description: 'Complete guide to JavaScript',
      price: 49.99,
      categories: [category2]
    };
    const item3 = {
      id: 3,
      title: 'T-Shirt',
      description: 'Cotton T-Shirt',
      price: 19.99,
      categories: [category3]
    };

    this.shopItems.set(item1.id, item1);
    this.shopItems.set(item2.id, item2);
    this.shopItems.set(item3.id, item3);

    const orderItem1 = {
      id: 1,
      shopItem: item1,
      quantity: 1
    };
    const orderItem2 = {
      id: 2,
      shopItem: item2,
      quantity: 2
    };

    this.orderItems.set(orderItem1.id, orderItem1);
    this.orderItems.set(orderItem2.id, orderItem2);

    const order1 = {
      id: 1,
      customer: customer1,
      items: [orderItem1, orderItem2]
    };

    this.orders.set(order1.id, order1);
  }

  getNextId(collection) {
    if (collection.size === 0) return 1;
    return Math.max(...Array.from(collection.keys())) + 1;
  }
}

module.exports = new Database();