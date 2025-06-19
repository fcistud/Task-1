const request = require('supertest');
const app = require('../src/server');
const db = require('../src/data/database');

describe('Order API', () => {
  beforeEach(() => {
    db.reset();
    db.initializeTestData();
  });

  describe('GET /api/orders', () => {
    it('should get all orders', async () => {
      const res = await request(app).get('/api/orders');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/orders/:id', () => {
    it('should get an order by id', async () => {
      const res = await request(app).get('/api/orders/1');
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(1);
      expect(res.body.customer).toBeDefined();
      expect(res.body.items).toBeDefined();
      expect(res.body.items.length).toBeGreaterThan(0);
    });

    it('should return 404 for non-existent order', async () => {
      const res = await request(app).get('/api/orders/999');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/orders', () => {
    it('should create a new order', async () => {
      const newOrder = {
        customerId: 2,
        items: [
          { shopItemId: 1, quantity: 2 },
          { shopItemId: 3, quantity: 1 }
        ]
      };
      
      const res = await request(app)
        .post('/api/orders')
        .send(newOrder);
      
      expect(res.status).toBe(201);
      expect(res.body.customer.id).toBe(2);
      expect(res.body.items).toBeDefined();
      expect(res.body.items.length).toBe(2);
      expect(res.body.id).toBeDefined();
    });

    it('should validate order data', async () => {
      const invalidOrder = {
        customerId: 1
      };
      
      const res = await request(app)
        .post('/api/orders')
        .send(invalidOrder);
      
      expect(res.status).toBe(400);
    });

    it('should validate customer existence', async () => {
      const newOrder = {
        customerId: 999,
        items: [{ shopItemId: 1, quantity: 1 }]
      };
      
      const res = await request(app)
        .post('/api/orders')
        .send(newOrder);
      
      expect(res.status).toBe(400);
    });

    it('should validate shop item existence', async () => {
      const newOrder = {
        customerId: 1,
        items: [{ shopItemId: 999, quantity: 1 }]
      };
      
      const res = await request(app)
        .post('/api/orders')
        .send(newOrder);
      
      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/orders/:id', () => {
    it('should update an order', async () => {
      const updatedData = {
        customerId: 2,
        items: [
          { shopItemId: 3, quantity: 3 }
        ]
      };
      
      const res = await request(app)
        .put('/api/orders/1')
        .send(updatedData);
      
      expect(res.status).toBe(200);
      expect(res.body.customer.id).toBe(2);
      expect(res.body.items.length).toBe(1);
      expect(res.body.items[0].quantity).toBe(3);
      expect(res.body.id).toBe(1);
    });

    it('should return 404 for non-existent order', async () => {
      const res = await request(app)
        .put('/api/orders/999')
        .send({ customerId: 1, items: [{ shopItemId: 1, quantity: 1 }] });
      
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/orders/:id', () => {
    it('should delete an order', async () => {
      const res = await request(app).delete('/api/orders/1');
      expect(res.status).toBe(204);
      
      const getRes = await request(app).get('/api/orders/1');
      expect(getRes.status).toBe(404);
    });

    it('should return 404 for non-existent order', async () => {
      const res = await request(app).delete('/api/orders/999');
      expect(res.status).toBe(404);
    });
  });
});