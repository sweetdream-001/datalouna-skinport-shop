import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCachedItems, setCachedItems } from '../cache.js';
import type { ItemPrice } from '../../types/index.js';
import { redis } from '../../db/redis.js';

// Mock Redis
vi.mock('../../db/redis.js', () => ({
  redis: {
    get: vi.fn(),
    setEx: vi.fn(),
  },
}));

describe('Cache Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCachedItems', () => {
    it('should return cached items when cache exists', async () => {
      const mockItems: ItemPrice[] = [
        {
          name: 'AK-47 | Redline',
          tradablePrice: 25.99,
          nonTradablePrice: 22.09,
        },
      ];

      (redis.get as any).mockResolvedValueOnce(JSON.stringify(mockItems));

      const result = await getCachedItems('USD');

      expect(result).toEqual(mockItems);
      expect(redis.get).toHaveBeenCalledWith('items:USD');
    });

    it('should return null when cache does not exist', async () => {
      (redis.get as any).mockResolvedValueOnce(null);

      const result = await getCachedItems('USD');

      expect(result).toBeNull();
    });

    it('should return null on cache read error', async () => {
      (redis.get as any).mockRejectedValueOnce(new Error('Redis error'));

      const result = await getCachedItems('USD');

      expect(result).toBeNull();
    });

    it('should use different keys for different currencies', async () => {
      (redis.get as any).mockResolvedValueOnce(null);

      await getCachedItems('EUR');
      await getCachedItems('GBP');

      expect(redis.get).toHaveBeenCalledWith('items:EUR');
      expect(redis.get).toHaveBeenCalledWith('items:GBP');
    });
  });

  describe('setCachedItems', () => {
    it('should cache items with correct key and TTL', async () => {
      const items: ItemPrice[] = [
        {
          name: 'AK-47 | Redline',
          tradablePrice: 25.99,
          nonTradablePrice: 22.09,
        },
      ];

      (redis.setEx as any).mockResolvedValueOnce(undefined);

      await setCachedItems(items, 'USD', 300);

      expect(redis.setEx).toHaveBeenCalledWith(
        'items:USD',
        300,
        JSON.stringify(items)
      );
    });

    it('should use default TTL when not provided', async () => {
      const items: ItemPrice[] = [];
      (redis.setEx as any).mockResolvedValueOnce(undefined);

      await setCachedItems(items, 'USD');

      expect(redis.setEx).toHaveBeenCalledWith(
        'items:USD',
        300, // Default TTL
        JSON.stringify(items)
      );
    });

    it('should not throw on cache write error', async () => {
      const items: ItemPrice[] = [];
      (redis.setEx as any).mockRejectedValueOnce(new Error('Redis error'));

      // Should not throw
      await expect(setCachedItems(items, 'USD')).resolves.toBeUndefined();
    });

    it('should cache items for different currencies', async () => {
      const items: ItemPrice[] = [];
      (redis.setEx as any).mockResolvedValueOnce(undefined);

      await setCachedItems(items, 'EUR', 300);
      await setCachedItems(items, 'GBP', 300);

      expect(redis.setEx).toHaveBeenCalledWith('items:EUR', 300, expect.any(String));
      expect(redis.setEx).toHaveBeenCalledWith('items:GBP', 300, expect.any(String));
    });
  });
});

