import { query } from '../../config/db.js';

/**
 * Advanced query fetching products with filters, sorting, and rating aggregations.
 */
export const findAll = async ({ search = '', category = '', minPrice = 0, maxPrice = 1000000, sortBy = 'newest' }) => {
  let text = `
    SELECT p.*, c.name as category, COALESCE(AVG(r.rating), 0)::FLOAT as rating_avg, COUNT(r.id)::INTEGER as rating_count
    FROM products p
    JOIN categories c ON p.category_id = c.id
    LEFT JOIN reviews r ON p.id = r.product_id
    WHERE 1=1
  `;
  
  const values = [];
  let paramIdx = 1;

  if (search) {
    text += ` AND (p.name ILIKE $${paramIdx} OR p.description ILIKE $${paramIdx})`;
    values.push(`%${search}%`);
    paramIdx++;
  }

  if (category) {
    text += ` AND c.name = $${paramIdx}`;
    values.push(category);
    paramIdx++;
  }

  if (minPrice) {
    text += ` AND p.price >= $${paramIdx}`;
    values.push(minPrice);
    paramIdx++;
  }

  if (maxPrice) {
    text += ` AND p.price <= $${paramIdx}`;
    values.push(maxPrice);
    paramIdx++;
  }

  text += ` GROUP BY p.id, c.name`;

  // Apply sorting
  if (sortBy === 'price-low') {
    text += ' ORDER BY p.price ASC';
  } else if (sortBy === 'price-high') {
    text += ' ORDER BY p.price DESC';
  } else if (sortBy === 'popular') {
    text += ' ORDER BY rating_avg DESC, rating_count DESC';
  } else {
    text += ' ORDER BY p.created_at DESC'; // default newest
  }

  const { rows } = await query(text, values);
  return rows;
};

/**
 * Find single product details aggregated with overall reviews score.
 */
export const findById = async (id) => {
  const text = `
    SELECT p.*, c.name as category, COALESCE(AVG(r.rating), 0)::FLOAT as rating_avg, COUNT(r.id)::INTEGER as rating_count
    FROM products p
    JOIN categories c ON p.category_id = c.id
    LEFT JOIN reviews r ON p.id = r.product_id
    WHERE p.id = $1
    GROUP BY p.id, c.name;
  `;
  const { rows } = await query(text, [id]);
  return rows[0];
};

/**
 * Create a new product (admin).
 */
export const create = async ({ name, description, price, image_url, category, stock }) => {
  // First ensure category exists or get its ID
  const catRes = await query('SELECT id FROM categories WHERE name = $1', [category]);
  let categoryId;
  if (catRes.rows.length > 0) {
    categoryId = catRes.rows[0].id;
  } else {
    const insertCat = await query('INSERT INTO categories (name) VALUES ($1) RETURNING id', [category]);
    categoryId = insertCat.rows[0].id;
  }

  const text = `
    INSERT INTO products (name, description, price, image_url, category_id, stock)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;
  const values = [name, description, price, image_url, categoryId, stock];
  const { rows } = await query(text, values);
  const newProduct = rows[0];
  newProduct.category = category; // attach string for response
  return newProduct;
};

/**
 * Update an existing product (admin).
 */
export const update = async (id, { name, description, price, image_url, category, stock }) => {
  let categoryId;
  if (category) {
    const catRes = await query('SELECT id FROM categories WHERE name = $1', [category]);
    if (catRes.rows.length > 0) {
      categoryId = catRes.rows[0].id;
    } else {
      const insertCat = await query('INSERT INTO categories (name) VALUES ($1) RETURNING id', [category]);
      categoryId = insertCat.rows[0].id;
    }
  }

  const text = `
    UPDATE products
    SET name = $1, description = $2, price = $3, image_url = $4, stock = $5, 
        category_id = COALESCE($6, category_id), updated_at = CURRENT_TIMESTAMP
    WHERE id = $7
    RETURNING *;
  `;
  const values = [name, description, price, image_url, stock, categoryId || null, id];
  const { rows } = await query(text, values);
  const updatedProduct = rows[0];
  if (category) updatedProduct.category = category;
  return updatedProduct;
};

/**
 * Delete a product (admin).
 */
export const remove = async (id) => {
  const text = 'DELETE FROM products WHERE id = $1 RETURNING id;';
  const { rows } = await query(text, [id]);
  return rows[0];
};

/**
 * Retrieves list of distinct categories currently present in products.
 */
export const getCategories = async () => {
  const text = 'SELECT name FROM categories ORDER BY name;';
  const { rows } = await query(text);
  return rows.map(r => r.name);
};
