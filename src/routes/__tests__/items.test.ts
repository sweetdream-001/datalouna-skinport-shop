import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import items from '../items.js';
import { getCachedItems, setCachedItems } from '../../services/cache.js';
import { fetchItemsFromSkinport } from '../../services/skinport.js';
import type { ItemPrice } from '../../types/index.js';

// Mock dependencies
vi.mock('../../services/cache.js');
vi.mock('../../services/skinport.js');

describe('Items Route', () => {
  const app = new Hono().route('/api/items', items);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return cached items when available', async () => {
    const cachedItems: ItemPrice[] = [
      {
        name: 'Cached Item',
        tradablePrice: 10.50,
        nonTradablePrice: 8.93,
      },
    ];

    (getCachedItems as any).mockResolvedValueOnce(cachedItems);

    const res = await app.request('/api/items');
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual(cachedItems);
    expect(getCachedItems).toHaveBeenCalledWith('USD');
    expect(fetchItemsFromSkinport).not.toHaveBeenCalled();
  });

  it('should fetch from API and cache when no cache exists', async () => {
    const apiItems: ItemPrice[] = [
      {
        name: 'API Item',
        tradablePrice: 20.00,
        nonTradablePrice: 17.00,
      },
    ];

    (getCachedItems as any).mockResolvedValueOnce(null);
    (fetchItemsFromSkinport as any).mockResolvedValueOnce(apiItems);
    (setCachedItems as any).mockResolvedValueOnce(undefined);

    const res = await app.request('/api/items');
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual(apiItems);
    expect(fetchItemsFromSkinport).toHaveBeenCalledWith(730, 'USD');
    expect(setCachedItems).toHaveBeenCalledWith(apiItems, 'USD');
  });

  it('should handle currency parameter', async () => {
    const apiItems: ItemPrice[] = [];
    (getCachedItems as any).mockResolvedValueOnce(null);
    (fetchItemsFromSkinport as any).mockResolvedValueOnce(apiItems);
    (setCachedItems as any).mockResolvedValueOnce(undefined);

    await app.request('/api/items?currency=EUR');

    expect(getCachedItems).toHaveBeenCalledWith('EUR');
    expect(fetchItemsFromSkinport).toHaveBeenCalledWith(730, 'EUR');
  });

  it('should return stale cache when API fails and cache exists', async () => {
    const staleItems: ItemPrice[] = [
      {
        name: 'Stale Item',
        tradablePrice: 15.00,
        nonTradablePrice: 12.75,
      },
    ];

    (getCachedItems as any)
      .mockResolvedValueOnce(null) // First call - no cache
      .mockResolvedValueOnce(staleItems); // Second call - stale cache
    (fetchItemsFromSkinport as any).mockRejectedValueOnce(
      new Error('API Error')
    );

    const res = await app.request('/api/items');
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual(staleItems);
  });

  it('should return empty array when API fails and no cache exists', async () => {
    (getCachedItems as any)
      .mockResolvedValueOnce(null) // No cache
      .mockResolvedValueOnce(null); // No stale cache either
    (fetchItemsFromSkinport as any).mockRejectedValueOnce(
      new Error('API Error')
    );

    const res = await app.request('/api/items');
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual([]);
  });

  it('should default to USD when currency not provided', async () => {
    const cachedItems: ItemPrice[] = [];
    (getCachedItems as any).mockResolvedValueOnce(cachedItems);

    await app.request('/api/items');

    expect(getCachedItems).toHaveBeenCalledWith('USD');
  });

  it('should uppercase currency parameter', async () => {
    const cachedItems: ItemPrice[] = [];
    (getCachedItems as any).mockResolvedValueOnce(cachedItems);

    await app.request('/api/items?currency=eur');

    expect(getCachedItems).toHaveBeenCalledWith('EUR');
  });
});

