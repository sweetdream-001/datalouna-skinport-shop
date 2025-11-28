// Endpoint 1: Get items with prices (tradable and non-tradable)
import { Hono } from 'hono';
import { fetchItemsFromSkinport } from '../services/skinport.js';
import { getCachedItems, setCachedItems } from '../services/cache.js';
import { APP_CONFIG } from '../config/constants.js';

const items = new Hono();

items.get('/', async (c) => {
  const currency = (c.req.query('currency') || APP_CONFIG.DEFAULT_CURRENCY).toUpperCase();
  
  // Check cache first
  const cachedItems = await getCachedItems(currency);
  if (cachedItems) {
    return c.json(cachedItems);
  }
  
  // Fetch from Skinport API
  try {
    const items = await fetchItemsFromSkinport(APP_CONFIG.DEFAULT_APP_ID, currency);
    await setCachedItems(items, currency);
    return c.json(items);
  } catch (error) {
    console.error('Error fetching from Skinport API:', error);
    
    // Graceful degradation: try to return stale cache if API fails
    const staleCache = await getCachedItems(currency);
    if (staleCache) {
      return c.json(staleCache);
    }
    
    // Return empty array if no cache available
    return c.json([]);
  }
});

export default items;

