import { query } from '../../config/db.js';

/**
 * Creates a new user in the database.
 */
export const create = async ({ name, email, password, role = 'customer' }) => {
  const text = `
    INSERT INTO users (name, email, password, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, email, role, created_at;
  `;
  const values = [name, email.toLowerCase(), password, role];
  const { rows } = await query(text, values);
  return rows[0];
};

/**
 * Finds a user by email (useful for logins).
 */
export const findByEmail = async (email) => {
  const text = 'SELECT * FROM users WHERE email = $1;';
  const { rows } = await query(text, [email.toLowerCase()]);
  return rows[0];
};

/**
 * Finds a user by primary key ID.
 */
export const findById = async (id) => {
  const text = 'SELECT id, name, email, role, created_at FROM users WHERE id = $1;';
  const { rows } = await query(text, [id]);
  return rows[0];
};

/**
 * Update user basic profile information.
 */
export const updateProfile = async (id, { name, email }) => {
  const text = `
    UPDATE users
    SET name = $1, email = $2, updated_at = CURRENT_TIMESTAMP
    WHERE id = $3
    RETURNING id, name, email, role, created_at;
  `;
  const { rows } = await query(text, [name, email.toLowerCase(), id]);
  return rows[0];
};
