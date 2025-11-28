// Redis client for caching
import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = createClient({
  url: redisUrl,
});

redis.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

// Connect to Redis
redis.connect().catch((err) => {
  console.error('Failed to connect to Redis:', err);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await redis.quit();
});

process.on('SIGTERM', async () => {
  await redis.quit();
});

