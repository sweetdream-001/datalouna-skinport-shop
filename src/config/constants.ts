// Application constants
export const APP_CONFIG = {
  // Server
  DEFAULT_PORT: 3000,
  
  // Skinport API
  SKINPORT_API_URL: 'https://api.skinport.com/v1/items',
  // As a CS2 fan, I defaulted to app_id=730 for CS:GO skins—pulled real AK-47 prices! 🎮
  DEFAULT_APP_ID: 730, // CS:GO app_id
  DEFAULT_CURRENCY: 'USD',
  
  // Business Logic
  NON_TRADABLE_DISCOUNT: 0.85, // 15% discount for non-tradable items
  MAX_ITEMS: 50,
  DECIMAL_PLACES: 2,
  
  // Cache
  CACHE_TTL: 300, // 5 minutes in seconds
  CACHE_KEY_PREFIX: 'items:',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  USER_NOT_FOUND: 'User not found',
  PRODUCT_NOT_FOUND: 'Product not found',
  INSUFFICIENT_BALANCE: 'Insufficient balance',
  INVALID_REQUEST: 'Invalid request. userId and productId must be positive integers.',
} as const;

