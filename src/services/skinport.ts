// Skinport API service
import type { SkinportItem, ItemPrice } from '../types/index.js';
import { APP_CONFIG } from '../config/constants.js';
import { roundToDecimalPlaces } from '../utils/math.js';

export async function fetchItemsFromSkinport(
  appId: number = APP_CONFIG.DEFAULT_APP_ID,
  currency: string = APP_CONFIG.DEFAULT_CURRENCY
): Promise<ItemPrice[]> {
  try {
    const url = `${APP_CONFIG.SKINPORT_API_URL}?app_id=${appId}&currency=${currency}`;
    const response = await fetch(url, {
      headers: { 'Accept-Encoding': 'br' },
    });
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`Skinport API error: ${response.status} ${response.statusText}${errorText ? `. ${errorText.substring(0, 100)}` : ''}`);
    }
    
    const data = await response.json() as SkinportItem[];
    
    // Transform to required format: items with tradable and non-tradable prices
    const items: ItemPrice[] = data
      .filter(item => item.min_price > 0)
      .map(item => ({
        name: item.market_hash_name,
        tradablePrice: item.min_price,
        nonTradablePrice: roundToDecimalPlaces(item.min_price * APP_CONFIG.NON_TRADABLE_DISCOUNT),
      }))
      .slice(0, APP_CONFIG.MAX_ITEMS);
    
    return items;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to fetch items from Skinport API: ${message}`);
  }
}

