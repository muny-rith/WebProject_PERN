import pool from '../../config/db.js';
import ApiError from '../../shared/errors/ApiError.js';

/**
 * Creates an order with items in a single, safe database TRANSACTION.
 * Automatically deducts stock and fails if products have insufficient inventory.
 */
export const createOrder = async (userId, { totalAmount, shippingAddress, items }) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Insert order record
    const insertOrderText = `
      INSERT INTO orders (user_id, total_amount, shipping_address, payment_status, order_status)
      VALUES ($1, $2, $3, 'paid', 'processing')
      RETURNING *;
    `;
    const orderRes = await client.query(insertOrderText, [userId, totalAmount, shippingAddress]);
    const order = orderRes.rows[0];

    // 2. Loop and process each order item
    for (const item of items) {
      // Check product stock and locking it for update
      const productCheckText = 'SELECT stock, name FROM products WHERE id = $1 FOR UPDATE;';
      const prodRes = await client.query(productCheckText, [item.product_id]);
      const product = prodRes.rows[0];

      if (!product) {
        throw new ApiError(404, `Product ID ${item.product_id} not found.`);
      }

      if (product.stock < item.quantity) {
        throw new ApiError(400, `Insufficient stock for product "${product.name}". Available: ${product.stock}, requested: ${item.quantity}.`);
      }

      // Deduct inventory stock
      const deductStockText = 'UPDATE products SET stock = stock - $1 WHERE id = $2;';
      await client.query(deductStockText, [item.quantity, item.product_id]);

      // Insert item detail row
      const insertItemText = `
        INSERT INTO order_items (order_id, product_id, quantity, price)
        VALUES ($1, $2, $3, $4);
      `;
      await client.query(insertItemText, [order.id, item.product_id, item.quantity, item.price]);
    }

    await client.query('COMMIT');
    return order;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Find orders for a particular user, including details of purchased products.
 */
export const findByUser = async (userId) => {
  const orderText = 'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC;';
  const { rows: orders } = await pool.query(orderText, [userId]);

  // Aggregate items for each order
  for (const order of orders) {
    const itemsText = `
      SELECT oi.*, p.name as product_name, p.image_url as product_image
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1;
    `;
    const { rows: items } = await pool.query(itemsText, [order.id]);
    order.items = items;
  }

  return orders;
};

/**
 * Find all orders (admin console) aggregated with buyer user details.
 */
export const findAll = async () => {
  const orderText = `
    SELECT o.*, u.name as user_name, u.email as user_email
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    ORDER BY o.created_at DESC;
  `;
  const { rows: orders } = await pool.query(orderText);

  for (const order of orders) {
    const itemsText = `
      SELECT oi.*, p.name as product_name, p.image_url as product_image
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1;
    `;
    const { rows: items } = await pool.query(itemsText, [order.id]);
    order.items = items;
  }

  return orders;
};

/**
 * Update shipment/delivery progress or payment status (admin).
 */
export const updateStatus = async (orderId, { order_status, payment_status }) => {
  let text = 'UPDATE orders SET ';
  const values = [];
  let paramIdx = 1;

  if (order_status) {
    text += `order_status = $${paramIdx}, `;
    values.push(order_status);
    paramIdx++;
  }

  if (payment_status) {
    text += `payment_status = $${paramIdx}, `;
    values.push(payment_status);
    paramIdx++;
  }

  // Remove trailing comma & space
  text = text.slice(0, -2);
  text += ` , updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIdx} RETURNING *;`;
  values.push(orderId);

  const { rows } = await pool.query(text, values);
  return rows[0];
};

export const getOrderItemsWithNames = async (orderId) => {
  const text = `
    SELECT oi.product_id, oi.quantity, oi.price, p.name as "productName"
    FROM order_items oi
    LEFT JOIN products p ON oi.product_id = p.id
    WHERE oi.order_id = $1;
  `;
  const { rows } = await pool.query(text, [orderId]);
  return rows;
};

