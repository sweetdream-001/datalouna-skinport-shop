import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchItemsFromSkinport } from '../skinport.js';
import type { SkinportItem } from '../../types/index.js';

// Mock global fetch
global.fetch = vi.fn();

describe('fetchItemsFromSkinport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch and transform items from Skinport API', async () => {
    const mockSkinportItems: SkinportItem[] = [
      {
        market_hash_name: 'AK-47 | Redline (Field-Tested)',
        currency: 'USD',
        suggested_price: 30,
        item_page: 'https://skinport.com/item/ak47-redline',
        market_page: 'https://skinport.com/market/ak47-redline',
        min_price: 25.99,
        max_price: 30.50,
        mean_price: 28.25,
        quantity: 150,
        created_at: 1234567890,
        updated_at: 1234567890,
      },
      {
        market_hash_name: 'AWP | Dragon Lore (Factory New)',
        currency: 'USD',
        suggested_price: 1000,
        item_page: 'https://skinport.com/item/awp-dragonlore',
        market_page: 'https://skinport.com/market/awp-dragonlore',
        min_price: 999.99,
        max_price: 1200.00,
        mean_price: 1100.00,
        quantity: 5,
        created_at: 1234567890,
        updated_at: 1234567890,
      },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSkinportItems,
    });

    const result = await fetchItemsFromSkinport(730, 'USD');

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      name: 'AK-47 | Redline (Field-Tested)',
      tradablePrice: 25.99,
      nonTradablePrice: 22.09, // 25.99 * 0.85 = 22.0915, rounded to 22.09
    });
    expect(result[1]).toEqual({
      name: 'AWP | Dragon Lore (Factory New)',
      tradablePrice: 999.99,
      nonTradablePrice: 849.99, // 999.99 * 0.85 = 849.9915, rounded to 849.99
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.skinport.com/v1/items?app_id=730&currency=USD',
      {
        headers: {
          'Accept-Encoding': 'br',
        },
      }
    );
  });

  it('should filter out items with zero or negative prices', async () => {
    const mockSkinportItems: SkinportItem[] = [
      {
        market_hash_name: 'Valid Item',
        currency: 'USD',
        suggested_price: 10,
        item_page: '',
        market_page: '',
        min_price: 10.50,
        max_price: 12.00,
        mean_price: 11.00,
        quantity: 100,
        created_at: 1234567890,
        updated_at: 1234567890,
      },
      {
        market_hash_name: 'Invalid Item',
        currency: 'USD',
        suggested_price: 0,
        item_page: '',
        market_page: '',
        min_price: 0,
        max_price: 0,
        mean_price: 0,
        quantity: 0,
        created_at: 1234567890,
        updated_at: 1234567890,
      },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSkinportItems,
    });

    const result = await fetchItemsFromSkinport(730, 'USD');

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Valid Item');
  });

  it('should limit results to 50 items', async () => {
    const mockItems: SkinportItem[] = Array.from({ length: 100 }, (_, i) => ({
      market_hash_name: `Item ${i}`,
      currency: 'USD',
      suggested_price: 10,
      item_page: '',
      market_page: '',
      min_price: 10 + i,
      max_price: 15 + i,
      mean_price: 12 + i,
      quantity: 100,
      created_at: 1234567890,
      updated_at: 1234567890,
    }));

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockItems,
    });

    const result = await fetchItemsFromSkinport(730, 'USD');

    expect(result).toHaveLength(50);
  });

  it('should handle API errors', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      text: async () => 'Server error',
    });

    await expect(fetchItemsFromSkinport(730, 'USD')).rejects.toThrow(
      'Skinport API error'
    );
  });

  it('should handle network errors', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    await expect(fetchItemsFromSkinport(730, 'USD')).rejects.toThrow(
      'Network error'
    );
  });

  it('should use default parameters when not provided', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    await fetchItemsFromSkinport();

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.skinport.com/v1/items?app_id=730&currency=USD',
      expect.any(Object)
    );
  });
});

