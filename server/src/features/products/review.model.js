import pool from '../../config/db.js';

/**
 * Creates a review for a specific product by an authenticated user.
 */
export const create = async ({ userId, productId, rating, comment }) => {
  const text = `
    INSERT INTO reviews (user_id, product_id, rating, comment)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const { rows } = await pool.query(text, [userId, productId, rating, comment]);
  return rows[0];
};

/**
 * Checks if a user has already written a review for a product.
 */
export const hasUserReviewed = async (userId, productId) => {
  const text = "SELECT 1 FROM reviews WHERE user_id = $1 AND product_id = $2;";
  const { rows } = await pool.query(text, [userId, productId]);
  return rows.length > 0;
};

/**
 * Retrieves all reviews for a product with the author's name.
 */
export const findByProduct = async (productId) => {
  const text = `
    SELECT r.*, u.name as user_name
    FROM reviews r
    LEFT JOIN users u ON r.user_id = u.id
    WHERE r.product_id = $1
    ORDER BY r.created_at DESC;
  `;
  const { rows } = await pool.query(text, [productId]);
  return rows;
};
