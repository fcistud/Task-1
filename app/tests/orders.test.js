const request = require('supertest');
const { app } = require('../server');
const { sequelize, Customer, ShopItem } = require('../models');

beforeAll(async () => {
  // Sync database before tests
  await sequelize.sync({ force: true });
  
  // Create test customer and shop item for order tests
  await Customer.create({
    name: 'Test',
    surname: 'Customer',
    email: 'test.customer@example.com'
  });
  
  await ShopItem.create({
    title: 'Test Product',
    description: 'A product for testing orders',
    price: 49.99,
    stockQuantity: 100 // Add stock quantity for the new check
  });
});

afterAll(async () => {
  // Close database connection after tests
  await sequelize.close();
});

describe('Order API endpoints', () => {
  let createdOrderId;
  let customerId;
  let shopItemId;

  test('Setup - Get customer and shop item IDs for testing', async () => {
    const customerResponse = await request(app).get('/customers');
    expect(customerResponse.status).toBe(200);
    expect(customerResponse.body.length).toBeGreaterThan(0);
    customerId = customerResponse.body[0].id;

    const itemResponse = await request(app).get('/shop-items');
    expect(itemResponse.status).toBe(200);
    expect(itemResponse.body.length).toBeGreaterThan(0);
    shopItemId = itemResponse.body[0].id;
  });

  test('POST /orders - Create a new order', async () => {
    const response = await request(app)
      .post('/orders')
      .send({
        customerId: customerId,
        items: [
          {
            shopItemId: shopItemId,
            quantity: 2
          }
        ]
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.CustomerId).toBe(customerId);
    expect(response.body.OrderItems).toHaveLength(1);
    expect(response.body.OrderItems[0].quantity).toBe(2);
    expect(response.body.OrderItems[0].ShopItem.id).toBe(shopItemId);
    expect(response.body).toHaveProperty('status', 'pending');
    expect(response.body).toHaveProperty('orderDate');

    createdOrderId = response.body.id;
  });

  test('POST /orders - Should fail with missing customer', async () => {
    const response = await request(app)
      .post('/orders')
      .send({
        items: [
          {
            shopItemId: shopItemId,
            quantity: 1
          }
        ]
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message');
  });

  test('POST /orders - Should fail with non-existent customer', async () => {
    const response = await request(app)
      .post('/orders')
      .send({
        customerId: 9999,
        items: [
          {
            shopItemId: shopItemId,
            quantity: 1
          }
        ]
      });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message');
  });

  test('POST /orders - Should fail with non-existent shop item', async () => {
    const response = await request(app)
      .post('/orders')
      .send({
        customerId: customerId,
        items: [
          {
            shopItemId: 9999,
            quantity: 1
          }
        ]
      });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message');
  });

  test('GET /orders - Get all orders', async () => {
    const response = await request(app).get('/orders');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toHaveProperty('Customer');
    expect(response.body[0]).toHaveProperty('OrderItems');
  });

  test('GET /orders/:id - Get order by ID', async () => {
    const response = await request(app).get(`/orders/${createdOrderId}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', createdOrderId);
    expect(response.body.CustomerId).toBe(customerId);
    expect(response.body.OrderItems).toHaveLength(1);
    expect(response.body.OrderItems[0].ShopItem.id).toBe(shopItemId);
  });

  test('GET /orders/:id - Should return 404 for non-existent ID', async () => {
    const response = await request(app).get('/orders/9999');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message');
  });

  test('GET /orders/status/:status - Get orders by status', async () => {
    const response = await request(app).get('/orders/status/pending');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toHaveProperty('status', 'pending');
  });

  test('PUT /orders/:id - Update order', async () => {
    const response = await request(app)
      .put(`/orders/${createdOrderId}`)
      .send({
        customerId: customerId,
        status: 'processing',
        items: [
          {
            shopItemId: shopItemId,
            quantity: 3 // Changed quantity from 2 to 3
          }
        ]
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', createdOrderId);
    expect(response.body.CustomerId).toBe(customerId);
    expect(response.body.status).toBe('processing');
    expect(response.body.OrderItems).toHaveLength(1);
    expect(response.body.OrderItems[0].quantity).toBe(3);
    expect(response.body.OrderItems[0].ShopItem.id).toBe(shopItemId);
  });

  test('PUT /orders/:id - Should return 404 for non-existent ID', async () => {
    const response = await request(app)
      .put('/orders/9999')
      .send({
        customerId: customerId,
        items: [
          {
            shopItemId: shopItemId,
            quantity: 1
          }
        ]
      });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message');
  });

  test('DELETE /orders/:id - Delete order', async () => {
    const response = await request(app).delete(`/orders/${createdOrderId}`);

    expect(response.status).toBe(204);
  });

  test('DELETE /orders/:id - Should return 404 for non-existent ID', async () => {
    const response = await request(app).delete('/orders/9999');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message');
  });
});