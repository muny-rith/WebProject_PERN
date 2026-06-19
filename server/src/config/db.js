import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Standard local connection credentials with safe fallbacks
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ecommerce_db',
  port: parseInt(process.env.DB_PORT || '5432', 10),
});
 
/**
 * Executes a query with logging & safety.
 */
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    // Log in development if needed
    return res;
  } catch (err) {
    console.error('Database query error:', { text, error: err.message });
    throw err;
  }
};

/**
 * Initializes database structures automatically.
 * Reads the schema definition from db/init.sql and runs it.
 */
export const initDB = async () => {
  try {
    console.log('Connecting to PostgreSQL database...');
    // Simple test query
    await pool.query('SELECT NOW()');
    console.log('PostgreSQL connection established successfully.');

    // Read the SQL init file
    const sqlPath = path.join(__dirname, '../db/init.sql');
    if (fs.existsSync(sqlPath)) {
      console.log('Running database schema and seeding script...');
      const sqlContent = fs.readFileSync(sqlPath, 'utf8');
      await pool.query(sqlContent);
      console.log('Database tables verified and seeded successfully.');
    } else {
      console.warn('init.sql script not found. Skipping table generation.');
    }
  } catch (err) {
    console.error('Database connection / initialization failed!');
    console.error(err.message);
    console.error('Ensure that PostgreSQL is running and database specified exists.');
    process.exit(1);
  }
};

export default pool;
