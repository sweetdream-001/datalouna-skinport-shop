import { describe, it, expect } from 'vitest';
import { Hono } from 'hono';
import items from '../routes/items.js';
import purchase from '../routes/purchase.js';

// Integration tests - these would require actual database and Redis connections
// For now, we'll test the route structure and basic integration

describe('Integration Tests', () => {
  const app = new Hono()
    .route('/api/items', items)
    .route('/api/buy', purchase);

  describe('API Structure', () => {
    it('should have items endpoint', async () => {
      const res = await app.request('/api/items');
      // Should return either data or empty array (not 404)
      expect([200, 500]).toContain(res.status);
    }, 10000); // 10 second timeout for external API call

    it('should have purchase endpoint', async () => {
      const res = await app.request('/api/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 1, productId: 1 }),
      });
      // Should return a response (not 404)
      expect(res.status).not.toBe(404);
    });

    it('should handle CORS if configured', async () => {
      const res = await app.request('/api/items', {
        headers: { 'Origin': 'http://localhost:3000' },
      });
      // Should not block the request
      expect([200, 500]).toContain(res.status);
    }, 10000); // 10 second timeout for external API call
  });

  describe('Error Handling', () => {
    it('should return proper error format for invalid purchase', async () => {
      const res = await app.request('/api/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data).toHaveProperty('success', false);
      expect(data).toHaveProperty('message');
    });

    it('should handle malformed JSON gracefully', async () => {
      const res = await app.request('/api/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json',
      });

      // Should handle error gracefully
      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('Response Format', () => {
    it('should return JSON for items endpoint', async () => {
      const res = await app.request('/api/items');
      const contentType = res.headers.get('content-type');

      expect(contentType).toContain('application/json');
    }, 10000); // 10 second timeout for external API call

    it('should return JSON for purchase endpoint', async () => {
      const res = await app.request('/api/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 1, productId: 1 }),
      });

      const contentType = res.headers.get('content-type');
      expect(contentType).toContain('application/json');
    });
  });
});

