const request = require('supertest');
const app = require('../src/server');
const db = require('../src/data/database');

describe('Category API', () => {
  beforeEach(() => {
    db.reset();
    db.initializeTestData();
  });

  describe('GET /api/categories', () => {
    it('should get all categories', async () => {
      const res = await request(app).get('/api/categories');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/categories/:id', () => {
    it('should get a category by id', async () => {
      const res = await request(app).get('/api/categories/1');
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(1);
      expect(res.body.title).toBe('Electronics');
    });

    it('should return 404 for non-existent category', async () => {
      const res = await request(app).get('/api/categories/999');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/categories', () => {
    it('should create a new category', async () => {
      const newCategory = {
        title: 'Sports',
        description: 'Sports equipment and accessories'
      };
      
      const res = await request(app)
        .post('/api/categories')
        .send(newCategory);
      
      expect(res.status).toBe(201);
      expect(res.body.title).toBe(newCategory.title);
      expect(res.body.description).toBe(newCategory.description);
      expect(res.body.id).toBeDefined();
    });

    it('should validate category data', async () => {
      const invalidCategory = {
        title: 'Sports'
      };
      
      const res = await request(app)
        .post('/api/categories')
        .send(invalidCategory);
      
      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/categories/:id', () => {
    it('should update a category', async () => {
      const updatedData = {
        title: 'Updated Electronics',
        description: 'Updated description'
      };
      
      const res = await request(app)
        .put('/api/categories/1')
        .send(updatedData);
      
      expect(res.status).toBe(200);
      expect(res.body.title).toBe(updatedData.title);
      expect(res.body.id).toBe(1);
    });

    it('should return 404 for non-existent category', async () => {
      const res = await request(app)
        .put('/api/categories/999')
        .send({ title: 'Test', description: 'Test desc' });
      
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/categories/:id', () => {
    it('should delete a category', async () => {
      const res = await request(app).delete('/api/categories/2');
      expect(res.status).toBe(204);
      
      const getRes = await request(app).get('/api/categories/2');
      expect(getRes.status).toBe(404);
    });

    it('should return 404 for non-existent category', async () => {
      const res = await request(app).delete('/api/categories/999');
      expect(res.status).toBe(404);
    });
  });
});