// PostgreSQL database client using the postgres package
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL || 
  'postgresql://postgres:postgres@localhost:5432/datalouna';

export const sql = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await sql.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await sql.end();
  process.exit(0);
});

