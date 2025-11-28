// Database setup script - run this to initialize the database
import { readFileSync } from 'fs';
import { join } from 'path';
import { sql } from './client.js';

async function setup() {
  try {
    console.log('Setting up database...');
    
    const schemaPath = join(process.cwd(), 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');
    
    await sql.unsafe(schema);
    
    console.log('Database setup completed successfully!');
    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('Database setup failed:', error);
    await sql.end();
    process.exit(1);
  }
}

setup();

