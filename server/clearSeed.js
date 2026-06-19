import { query } from './src/config/db.js';

async function clear() {
  const names = ['Vortex Pro Wireless Headphones', 'Quantum Mechanical Keyboard', 'AeroLight Running Shoes', 'Urban Explorer Waterproof Backpack', 'Luxe Minimalist Leather Wallet', 'Nordic Ceramic Coffee Set', 'ActiveCharge MagSafe Power Bank', 'Performance Athletic Zip Hoodie'];
  await query('DELETE FROM products WHERE name = ANY($1)', [names]);
  await query(`DELETE FROM categories WHERE name IN ('Electronics', 'Apparel', 'Accessories', 'Home')`);
  console.log('E-Commerce seed data cleared');
}

clear().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
