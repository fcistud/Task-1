const request = require('supertest');
const { app, startServer } = require('../server');
const { sequelize } = require('../models');

beforeAll(async () => {
  // Sync database and seed data before tests
  await sequelize.sync({ force: true });
  // We'll let the tests create their own data
});

afterAll(async () => {
  // Close database connection after tests
  await sequelize.close();
});

describe('Customer API endpoints', () => {
  let createdCustomerId;

  test('POST /customers - Create a new customer', async () => {
    const response = await request(app)
      .post('/customers')
      .send({
        name: 'Test',
        surname: 'User',
        email: 'test.user@example.com'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe('Test');
    expect(response.body.surname).toBe('User');
    expect(response.body.email).toBe('test.user@example.com');

    createdCustomerId = response.body.id;
  });

  test('POST /customers - Should fail with missing fields', async () => {
    const response = await request(app)
      .post('/customers')
      .send({
        name: 'Incomplete'
        // Missing surname and email
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message');
  });

  test('GET /customers - Get all customers', async () => {
    const response = await request(app).get('/customers');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  test('GET /customers/:id - Get customer by ID', async () => {
    const response = await request(app).get(`/customers/${createdCustomerId}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', createdCustomerId);
    expect(response.body.name).toBe('Test');
    expect(response.body.surname).toBe('User');
    expect(response.body.email).toBe('test.user@example.com');
  });

  test('GET /customers/:id - Should return 404 for non-existent ID', async () => {
    const response = await request(app).get('/customers/9999');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message');
  });

  test('PUT /customers/:id - Update customer', async () => {
    const response = await request(app)
      .put(`/customers/${createdCustomerId}`)
      .send({
        name: 'Updated',
        surname: 'Person',
        email: 'updated.person@example.com'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', createdCustomerId);
    expect(response.body.name).toBe('Updated');
    expect(response.body.surname).toBe('Person');
    expect(response.body.email).toBe('updated.person@example.com');
  });

  test('PUT /customers/:id - Should return 404 for non-existent ID', async () => {
    const response = await request(app)
      .put('/customers/9999')
      .send({
        name: 'Nonexistent',
        surname: 'User',
        email: 'nonexistent@example.com'
      });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message');
  });

  test('DELETE /customers/:id - Delete customer', async () => {
    const response = await request(app).delete(`/customers/${createdCustomerId}`);

    expect(response.status).toBe(204);
  });

  test('DELETE /customers/:id - Should return 404 for non-existent ID', async () => {
    const response = await request(app).delete('/customers/9999');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message');
  });
});