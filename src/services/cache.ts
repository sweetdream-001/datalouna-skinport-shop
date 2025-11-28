// Redis caching service
import { redis } from '../db/redis.js';
import type { ItemPrice } from '../types/index.js';
import { APP_CONFIG } from '../config/constants.js';

export async function getCachedItems(currency: string = APP_CONFIG.DEFAULT_CURRENCY): Promise<ItemPrice[] | null> {
  try {
    const key = `${APP_CONFIG.CACHE_KEY_PREFIX}${currency}`;
    const cached = await redis.get(key);
    
    if (cached) {
      return JSON.parse(cached) as ItemPrice[];
    }
    
    return null;
  } catch (error) {
    console.error('Error reading from cache:', error);
    return null;
  }
}

export async function setCachedItems(
  items: ItemPrice[],
  currency: string = APP_CONFIG.DEFAULT_CURRENCY,
  ttl: number = APP_CONFIG.CACHE_TTL
): Promise<void> {
  try {
    const key = `${APP_CONFIG.CACHE_KEY_PREFIX}${currency}`;
    await redis.setEx(key, ttl, JSON.stringify(items));
  } catch (error) {
    console.error('Error writing to cache:', error);
    // Don't throw - caching failures shouldn't break the API
  }
}

