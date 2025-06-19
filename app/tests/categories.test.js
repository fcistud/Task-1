const request = require('supertest');
const { app } = require('../server');
const { sequelize } = require('../models');

beforeAll(async () => {
  // Sync database before tests
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  // Close database connection after tests
  await sequelize.close();
});

describe('Category API endpoints', () => {
  let createdCategoryId;

  test('POST /categories - Create a new category', async () => {
    const response = await request(app)
      .post('/categories')
      .send({
        title: 'Test Category',
        description: 'A category for testing'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.title).toBe('Test Category');
    expect(response.body.description).toBe('A category for testing');

    createdCategoryId = response.body.id;
  });

  test('POST /categories - Should fail with missing title', async () => {
    const response = await request(app)
      .post('/categories')
      .send({
        description: 'Missing title'
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message');
  });

  test('GET /categories - Get all categories', async () => {
    const response = await request(app).get('/categories');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  test('GET /categories/:id - Get category by ID', async () => {
    const response = await request(app).get(`/categories/${createdCategoryId}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', createdCategoryId);
    expect(response.body.title).toBe('Test Category');
    expect(response.body.description).toBe('A category for testing');
  });

  test('GET /categories/:id - Should return 404 for non-existent ID', async () => {
    const response = await request(app).get('/categories/9999');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message');
  });

  test('PUT /categories/:id - Update category', async () => {
    const response = await request(app)
      .put(`/categories/${createdCategoryId}`)
      .send({
        title: 'Updated Category',
        description: 'An updated description'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', createdCategoryId);
    expect(response.body.title).toBe('Updated Category');
    expect(response.body.description).toBe('An updated description');
  });

  test('PUT /categories/:id - Should return 404 for non-existent ID', async () => {
    const response = await request(app)
      .put('/categories/9999')
      .send({
        title: 'Nonexistent Category',
        description: 'This category does not exist'
      });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message');
  });

  test('DELETE /categories/:id - Delete category', async () => {
    const response = await request(app).delete(`/categories/${createdCategoryId}`);

    expect(response.status).toBe(204);
  });

  test('DELETE /categories/:id - Should return 404 for non-existent ID', async () => {
    const response = await request(app).delete('/categories/9999');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message');
  });
});