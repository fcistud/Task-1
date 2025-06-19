const request = require('supertest');
const app = require('../src/server');
const db = require('../src/data/database');

describe('Shop Item API', () => {
  beforeEach(() => {
    db.reset();
    db.initializeTestData();
  });

  describe('GET /api/shop-items', () => {
    it('should get all shop items', async () => {
      const res = await request(app).get('/api/shop-items');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/shop-items/:id', () => {
    it('should get a shop item by id', async () => {
      const res = await request(app).get('/api/shop-items/1');
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(1);
      expect(res.body.title).toBe('Laptop');
      expect(res.body.categories).toBeDefined();
      expect(res.body.categories.length).toBeGreaterThan(0);
    });

    it('should return 404 for non-existent shop item', async () => {
      const res = await request(app).get('/api/shop-items/999');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/shop-items', () => {
    it('should create a new shop item', async () => {
      const newItem = {
        title: 'Gaming Mouse',
        description: 'High precision gaming mouse',
        price: 59.99,
        categoryIds: [1]
      };
      
      const res = await request(app)
        .post('/api/shop-items')
        .send(newItem);
      
      expect(res.status).toBe(201);
      expect(res.body.title).toBe(newItem.title);
      expect(res.body.price).toBe(newItem.price);
      expect(res.body.categories).toBeDefined();
      expect(res.body.categories.length).toBe(1);
      expect(res.body.id).toBeDefined();
    });

    it('should validate shop item data', async () => {
      const invalidItem = {
        title: 'Gaming Mouse',
        price: -10
      };
      
      const res = await request(app)
        .post('/api/shop-items')
        .send(invalidItem);
      
      expect(res.status).toBe(400);
    });

    it('should validate category existence', async () => {
      const newItem = {
        title: 'Gaming Mouse',
        description: 'High precision gaming mouse',
        price: 59.99,
        categoryIds: [999]
      };
      
      const res = await request(app)
        .post('/api/shop-items')
        .send(newItem);
      
      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/shop-items/:id', () => {
    it('should update a shop item', async () => {
      const updatedData = {
        title: 'Updated Laptop',
        description: 'Updated description',
        price: 1199.99,
        categoryIds: [1, 2]
      };
      
      const res = await request(app)
        .put('/api/shop-items/1')
        .send(updatedData);
      
      expect(res.status).toBe(200);
      expect(res.body.title).toBe(updatedData.title);
      expect(res.body.price).toBe(updatedData.price);
      expect(res.body.categories.length).toBe(2);
      expect(res.body.id).toBe(1);
    });

    it('should return 404 for non-existent shop item', async () => {
      const res = await request(app)
        .put('/api/shop-items/999')
        .send({ title: 'Test', description: 'Test', price: 10, categoryIds: [1] });
      
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/shop-items/:id', () => {
    it('should delete a shop item', async () => {
      const res = await request(app).delete('/api/shop-items/2');
      expect(res.status).toBe(204);
      
      const getRes = await request(app).get('/api/shop-items/2');
      expect(getRes.status).toBe(404);
    });

    it('should return 404 for non-existent shop item', async () => {
      const res = await request(app).delete('/api/shop-items/999');
      expect(res.status).toBe(404);
    });
  });
});