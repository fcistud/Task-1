const request = require('supertest');
const { app } = require('../server');
const { sequelize, ShopItemCategory } = require('../models');

beforeAll(async () => {
  // Sync database before tests
  await sequelize.sync({ force: true });
  
  // Create a test category for use in shop item tests
  await ShopItemCategory.create({
    title: 'Test Category',
    description: 'Category for testing shop items'
  });
});

afterAll(async () => {
  // Close database connection after tests
  await sequelize.close();
});

describe('Shop Item API endpoints', () => {
  let createdItemId;
  let categoryId;

  test('Setup - Get category ID for testing', async () => {
    const response = await request(app).get('/categories');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    categoryId = response.body[0].id;
  });

  test('POST /shop-items - Create a new shop item', async () => {
    const response = await request(app)
      .post('/shop-items')
      .send({
        title: 'Test Item',
        description: 'A test shop item',
        price: 99.99,
        categoryIds: [categoryId]
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.title).toBe('Test Item');
    expect(response.body.description).toBe('A test shop item');
    expect(response.body.price).toBe(99.99);
    expect(response.body.categories).toHaveLength(1);
    expect(response.body.categories[0].id).toBe(categoryId);

    createdItemId = response.body.id;
  });

  test('POST /shop-items - Should fail with missing required fields', async () => {
    const response = await request(app)
      .post('/shop-items')
      .send({
        description: 'Missing title and price'
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message');
  });

  test('GET /shop-items - Get all shop items', async () => {
    const response = await request(app).get('/shop-items');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toHaveProperty('categories');
  });

  test('GET /shop-items/:id - Get shop item by ID', async () => {
    const response = await request(app).get(`/shop-items/${createdItemId}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', createdItemId);
    expect(response.body.title).toBe('Test Item');
    expect(response.body.description).toBe('A test shop item');
    expect(response.body.price).toBe(99.99);
    expect(response.body.categories).toHaveLength(1);
  });

  test('GET /shop-items/:id - Should return 404 for non-existent ID', async () => {
    const response = await request(app).get('/shop-items/9999');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message');
  });

  test('PUT /shop-items/:id - Update shop item', async () => {
    const response = await request(app)
      .put(`/shop-items/${createdItemId}`)
      .send({
        title: 'Updated Item',
        description: 'An updated test item',
        price: 149.99,
        categoryIds: [categoryId]
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', createdItemId);
    expect(response.body.title).toBe('Updated Item');
    expect(response.body.description).toBe('An updated test item');
    expect(response.body.price).toBe(149.99);
    expect(response.body.categories).toHaveLength(1);
  });

  test('PUT /shop-items/:id - Should return 404 for non-existent ID', async () => {
    const response = await request(app)
      .put('/shop-items/9999')
      .send({
        title: 'Nonexistent Item',
        description: 'This item does not exist',
        price: 99.99
      });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message');
  });

  test('DELETE /shop-items/:id - Delete shop item', async () => {
    const response = await request(app).delete(`/shop-items/${createdItemId}`);

    expect(response.status).toBe(204);
  });

  test('DELETE /shop-items/:id - Should return 404 for non-existent ID', async () => {
    const response = await request(app).delete('/shop-items/9999');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message');
  });
});