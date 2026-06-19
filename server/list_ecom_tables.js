import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;
const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'myPanda@20030711',
  database: 'ecommerce_db',
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

async function main() {
  await client.connect();
  const res = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public';
  `);
  console.log("Tables in database:");
  console.log(res.rows.map(r => r.table_name));
  await client.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
