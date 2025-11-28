// Main application entry point
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { APP_CONFIG } from './config/constants.js';
import items from './routes/items.js';
import purchase from './routes/purchase.js';

const app = new Hono();

// Health check
app.get('/', (c) => {
  return c.json({ 
    message: 'DataLouna Skinport Shop API',
    endpoints: {
      items: '/api/items',
      purchase: '/api/buy',
    }
  });
});

// Routes
app.route('/api/items', items);
app.route('/api/buy', purchase);

// Error handling
app.onError((err: Error, c) => {
  console.error('Unhandled error:', err);
  return c.json({ error: 'Internal server error' }, 500);
});

// Start server
const port = Number(process.env.PORT) || APP_CONFIG.DEFAULT_PORT;

serve({
  fetch: app.fetch,
  port,
}, (info: { port: number; address: string }) => {
  console.log(`🚀 Server running on http://localhost:${info.port}`);
  console.log(`📦 Items endpoint: http://localhost:${info.port}/api/items`);
  console.log(`🛒 Purchase endpoint: http://localhost:${info.port}/api/buy`);
});

