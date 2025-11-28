import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import purchase from '../purchase.js';
import { sql } from '../../db/client.js';
import type { PurchaseResponse } from '../../types/index.js';

// Mock database - postgres package uses template literals
vi.mock('../../db/client.js', () => {
  const mockSql = (strings: TemplateStringsArray) => {
    const query = strings[0];
    // Return mock data based on query content
    if (query.includes('SELECT') && query.includes('users')) {
      return [{ id: 1, username: 'alice', balance: 1000.50 }];
    }
    if (query.includes('SELECT') && query.includes('products')) {
      return [{ id: 1, name: 'AK-47 | Redline', price: 25.99 }];
    }
    return [];
  };

  // Make it callable as a template literal
  return {
    sql: Object.assign(mockSql, {
      begin: vi.fn(),
    }),
  };
});

describe('Purchase Route', () => {
  const app = new Hono().route('/api/buy', purchase);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully purchase a product', async () => {
    // Mock the transaction callback
    (sql.begin as any).mockImplementation(async (callback: any) => {
      // Create a mock sql object for the transaction
      const mockTransactionSql = (strings: TemplateStringsArray) => {
        const query = strings[0];
        if (query.includes('SELECT') && query.includes('users')) {
          return [{ id: 1, username: 'alice', balance: 1000.50 }];
        }
        if (query.includes('SELECT') && query.includes('products')) {
          return [{ id: 1, name: 'AK-47 | Redline', price: 25.99 }];
        }
        return [];
      };
      
      return await callback(mockTransactionSql);
    });

    const res = await app.request('/api/buy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 1, productId: 1 }),
    });

    const data = await res.json() as PurchaseResponse;

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.newBalance).toBe(974.51); // 1000.50 - 25.99
  });

  it('should reject purchase with insufficient balance', async () => {
    (sql.begin as any).mockImplementation(async (callback: any) => {
      const mockTransactionSql = (strings: TemplateStringsArray) => {
        const query = strings[0];
        if (query.includes('SELECT') && query.includes('users')) {
          return [{ id: 3, username: 'charlie', balance: 500.00 }];
        }
        if (query.includes('SELECT') && query.includes('products')) {
          return [{ id: 2, name: 'AWP | Dragon Lore', price: 999.99 }];
        }
        return [];
      };
      
      return await callback(mockTransactionSql);
    });

    const res = await app.request('/api/buy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 3, productId: 2 }),
    });

    const data = await res.json() as PurchaseResponse;

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.message).toBe('Insufficient balance');
  });

  it('should reject purchase with invalid user', async () => {
    (sql.begin as any).mockImplementation(async (callback: any) => {
      const mockTransactionSql = (strings: TemplateStringsArray) => {
        const query = strings[0];
        if (query.includes('SELECT') && query.includes('users')) {
          return []; // User not found
        }
        return [];
      };
      
      return await callback(mockTransactionSql);
    });

    const res = await app.request('/api/buy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 999, productId: 1 }),
    });

    const data = await res.json() as PurchaseResponse;

    expect(res.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.message).toBe('User not found');
  });

  it('should reject purchase with invalid product', async () => {
    (sql.begin as any).mockImplementation(async (callback: any) => {
      const mockTransactionSql = (strings: TemplateStringsArray) => {
        const query = strings[0];
        if (query.includes('SELECT') && query.includes('users')) {
          return [{ id: 1, username: 'alice', balance: 1000.50 }];
        }
        if (query.includes('SELECT') && query.includes('products')) {
          return []; // Product not found
        }
        return [];
      };
      
      return await callback(mockTransactionSql);
    });

    const res = await app.request('/api/buy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 1, productId: 999 }),
    });

    const data = await res.json() as PurchaseResponse;

    expect(res.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.message).toBe('Product not found');
  });

  it('should reject invalid request with missing fields', async () => {
    const res = await app.request('/api/buy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 1 }),
    });

    const data = await res.json() as PurchaseResponse;

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.message).toContain('Invalid request');
  });

  it('should reject invalid request with wrong data types', async () => {
    const res = await app.request('/api/buy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'not_a_number', productId: 1 }),
    });

    const data = await res.json() as PurchaseResponse;

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.message).toContain('Invalid request');
  });

  it('should coerce string numbers to integers', async () => {
    (sql.begin as any).mockImplementation(async (callback: any) => {
      const mockTransactionSql = (strings: TemplateStringsArray) => {
        const query = strings[0];
        if (query.includes('SELECT') && query.includes('users')) {
          return [{ id: 1, username: 'alice', balance: 1000.50 }];
        }
        if (query.includes('SELECT') && query.includes('products')) {
          return [{ id: 1, name: 'Product', price: 10.00 }];
        }
        return [];
      };
      
      return await callback(mockTransactionSql);
    });

    const res = await app.request('/api/buy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: '1', productId: '1' }), // String numbers
    });

    const data = await res.json() as PurchaseResponse;

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('should round balance to 2 decimal places', async () => {
    (sql.begin as any).mockImplementation(async (callback: any) => {
      const mockTransactionSql = (strings: TemplateStringsArray) => {
        const query = strings[0];
        if (query.includes('SELECT') && query.includes('users')) {
          return [{ id: 1, username: 'alice', balance: 100.123456 }];
        }
        if (query.includes('SELECT') && query.includes('products')) {
          return [{ id: 1, name: 'Product', price: 10.111111 }];
        }
        return [];
      };
      
      return await callback(mockTransactionSql);
    });

    const res = await app.request('/api/buy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 1, productId: 1 }),
    });

    const data = await res.json() as PurchaseResponse;

    expect(res.status).toBe(200);
    expect(data.newBalance).toBe(90.01); // Rounded to 2 decimals
  });
});

