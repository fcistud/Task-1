const request = require('supertest');
const app = require('../src/server');
const db = require('../src/data/database');

describe('Customer API', () => {
  beforeEach(() => {
    db.reset();
    db.initializeTestData();
  });

  describe('GET /api/customers', () => {
    it('should get all customers', async () => {
      const res = await request(app).get('/api/customers');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/customers/:id', () => {
    it('should get a customer by id', async () => {
      const res = await request(app).get('/api/customers/1');
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(1);
      expect(res.body.email).toBe('john.doe@example.com');
    });

    it('should return 404 for non-existent customer', async () => {
      const res = await request(app).get('/api/customers/999');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/customers', () => {
    it('should create a new customer', async () => {
      const newCustomer = {
        name: 'Test',
        surname: 'User',
        email: 'test@example.com'
      };
      
      const res = await request(app)
        .post('/api/customers')
        .send(newCustomer);
      
      expect(res.status).toBe(201);
      expect(res.body.name).toBe(newCustomer.name);
      expect(res.body.email).toBe(newCustomer.email);
      expect(res.body.id).toBeDefined();
    });

    it('should validate customer data', async () => {
      const invalidCustomer = {
        name: 'Test',
        email: 'invalid-email'
      };
      
      const res = await request(app)
        .post('/api/customers')
        .send(invalidCustomer);
      
      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/customers/:id', () => {
    it('should update a customer', async () => {
      const updatedData = {
        name: 'Updated',
        surname: 'Customer',
        email: 'updated@example.com'
      };
      
      const res = await request(app)
        .put('/api/customers/1')
        .send(updatedData);
      
      expect(res.status).toBe(200);
      expect(res.body.name).toBe(updatedData.name);
      expect(res.body.id).toBe(1);
    });

    it('should return 404 for non-existent customer', async () => {
      const res = await request(app)
        .put('/api/customers/999')
        .send({ name: 'Test', surname: 'User', email: 'test@example.com' });
      
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/customers/:id', () => {
    it('should delete a customer', async () => {
      const res = await request(app).delete('/api/customers/1');
      expect(res.status).toBe(204);
      
      const getRes = await request(app).get('/api/customers/1');
      expect(getRes.status).toBe(404);
    });

    it('should return 404 for non-existent customer', async () => {
      const res = await request(app).delete('/api/customers/999');
      expect(res.status).toBe(404);
    });
  });
});