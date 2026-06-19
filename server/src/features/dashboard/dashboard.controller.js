import pool from '../../config/db.js';

/**
 * Fetch executive administration analytical widgets.
 */
export const getStats = async (req, res, next) => {
  try {
    // 1. Total Cumulative Sales Revenue
    const revenueQuery = "SELECT COALESCE(SUM(total_amount), 0)::FLOAT as total_revenue FROM orders WHERE payment_status = 'paid';";
    const revenueRes = await pool.query(revenueQuery);
    const totalRevenue = revenueRes.rows[0].total_revenue;

    // 2. Cumulative User Signups
    const userCountQuery = "SELECT COUNT(*)::INTEGER as user_count FROM users WHERE role = 'customer';";
    const userCountRes = await pool.query(userCountQuery);
    const totalUsers = userCountRes.rows[0].user_count;

    // 3. Cumulative Orders Placed
    const orderCountQuery = "SELECT COUNT(*)::INTEGER as order_count FROM orders;";
    const orderCountRes = await pool.query(orderCountQuery);
    const totalOrders = orderCountRes.rows[0].order_count;

    // 4. Stock warning indicator: Products with low inventory (under 5 units)
    const lowStockQuery = "SELECT COUNT(*)::INTEGER as low_stock_count FROM products WHERE stock < 5;";
    const lowStockRes = await pool.query(lowStockQuery);
    const lowStockCount = lowStockRes.rows[0].low_stock_count;

    // 5. Category distribution count: Number of products in each category
    const categoryQuery = `
      SELECT category, COUNT(*)::INTEGER as count
      FROM products
      GROUP BY category
      ORDER BY count DESC;
    `;
    const categoryRes = await pool.query(categoryQuery);
    const categoriesDistribution = categoryRes.rows;

    // 6. Recent sales timeline (last 5 orders)
    const recentOrdersQuery = `
      SELECT o.id, o.total_amount, o.order_status, o.created_at, u.name as user_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 5;
    `;
    const recentOrdersRes = await pool.query(recentOrdersQuery);
    const recentOrders = recentOrdersRes.rows;

    res.status(200).json({
      status: 'success',
      data: {
        totalRevenue,
        totalUsers,
        totalOrders,
        lowStockCount,
        categoriesDistribution,
        recentOrders,
      },
    });
  } catch (err) {
    next(err);
  }
};
