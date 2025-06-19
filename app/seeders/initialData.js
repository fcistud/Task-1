const { Customer, ShopItemCategory, ShopItem, Order, OrderItem } = require('../models');

async function seedDatabase() {
  console.log('Seeding database with initial data...');

  try {
    // Create customers
    const customers = await Customer.bulkCreate([
      { 
        name: 'John', 
        surname: 'Doe', 
        email: 'john.doe@example.com',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
        phone: '555-123-4567'
      },
      { 
        name: 'Jane', 
        surname: 'Smith', 
        email: 'jane.smith@example.com',
        address: '456 Park Ave',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
        country: 'USA',
        phone: '555-987-6543'
      },
      { 
        name: 'Robert', 
        surname: 'Johnson', 
        email: 'robert.johnson@example.com',
        address: '789 Broadway',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        country: 'USA',
        phone: '555-456-7890'
      }
    ]);

    // Create categories
    const categories = await ShopItemCategory.bulkCreate([
      { title: 'Electronics', description: 'Electronic devices and accessories' },
      { title: 'Books', description: 'Printed and digital books' },
      { title: 'Clothing', description: 'Apparel and fashion items' }
    ]);

    // Create shop items
    const items = await ShopItem.bulkCreate([
      { 
        title: 'Smartphone', 
        description: 'Latest model smartphone', 
        price: 699.99,
        stockQuantity: 50,
        imageUrl: 'https://example.com/images/smartphone.jpg',
        isActive: true,
        sku: 'PHONE-001'
      },
      { 
        title: 'Laptop', 
        description: 'High-performance laptop', 
        price: 1299.99,
        stockQuantity: 30,
        imageUrl: 'https://example.com/images/laptop.jpg',
        isActive: true,
        sku: 'LAPT-001'
      },
      { 
        title: 'Headphones', 
        description: 'Wireless noise-cancelling headphones', 
        price: 149.99,
        stockQuantity: 100,
        imageUrl: 'https://example.com/images/headphones.jpg',
        isActive: true,
        sku: 'AUDIO-001'
      },
      { 
        title: 'Novel', 
        description: 'Bestselling fiction novel', 
        price: 19.99,
        stockQuantity: 200,
        imageUrl: 'https://example.com/images/novel.jpg',
        isActive: true,
        sku: 'BOOK-001'
      },
      { 
        title: 'T-shirt', 
        description: 'Cotton t-shirt', 
        price: 24.99,
        stockQuantity: 150,
        imageUrl: 'https://example.com/images/tshirt.jpg',
        isActive: true,
        sku: 'SHIRT-001'
      },
      { 
        title: 'Jeans', 
        description: 'Denim jeans', 
        price: 49.99,
        stockQuantity: 75,
        imageUrl: 'https://example.com/images/jeans.jpg',
        isActive: true,
        sku: 'PANTS-001'
      }
    ]);

    // Associate items with categories
    await items[0].addCategory(categories[0]); // Smartphone -> Electronics
    await items[1].addCategory(categories[0]); // Laptop -> Electronics
    await items[2].addCategory(categories[0]); // Headphones -> Electronics
    await items[3].addCategory(categories[1]); // Novel -> Books
    await items[4].addCategory(categories[2]); // T-shirt -> Clothing
    await items[5].addCategory(categories[2]); // Jeans -> Clothing

    // Create orders with status and dates
    const orders = await Order.bulkCreate([
      { 
        CustomerId: customers[0].id,
        status: 'delivered',
        orderDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        shippingAddress: customers[0].address,
        notes: 'Please deliver before noon'
      },
      { 
        CustomerId: customers[1].id,
        status: 'processing',
        orderDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        shippingAddress: customers[1].address,
        notes: 'Gift wrap requested'
      },
      { 
        CustomerId: customers[2].id,
        status: 'pending',
        orderDate: new Date(), // today
        shippingAddress: customers[2].address
      }
    ]);

    // Create order items
    await OrderItem.bulkCreate([
      { OrderId: orders[0].id, ShopItemId: items[0].id, quantity: 1 },
      { OrderId: orders[0].id, ShopItemId: items[2].id, quantity: 1 },
      { OrderId: orders[1].id, ShopItemId: items[1].id, quantity: 1 },
      { OrderId: orders[1].id, ShopItemId: items[3].id, quantity: 2 },
      { OrderId: orders[2].id, ShopItemId: items[4].id, quantity: 3 },
      { OrderId: orders[2].id, ShopItemId: items[5].id, quantity: 1 }
    ]);

    // Update stock quantities to reflect orders
    await items[0].update({ stockQuantity: items[0].stockQuantity - 1 }); // Smartphone
    await items[1].update({ stockQuantity: items[1].stockQuantity - 1 }); // Laptop
    await items[2].update({ stockQuantity: items[2].stockQuantity - 1 }); // Headphones
    await items[3].update({ stockQuantity: items[3].stockQuantity - 2 }); // Novel
    await items[4].update({ stockQuantity: items[4].stockQuantity - 3 }); // T-shirt
    await items[5].update({ stockQuantity: items[5].stockQuantity - 1 }); // Jeans

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

module.exports = seedDatabase;