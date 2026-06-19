import pool from '../../config/db.js';
import ApiError from '../../shared/errors/ApiError.js';

export const handleImsCategoryWebhook = async (req, res, next) => {
  try {
    const { name, oldName, description } = req.body;

    if (!name) {
      return next(new ApiError(400, 'Category name is required for sync.'));
    }

    const lookupName = oldName || name;
    const checkRes = await pool.query('SELECT id FROM categories WHERE name = $1;', [lookupName]);

    let category;
    if (checkRes.rows.length > 0) {
      const existing = checkRes.rows[0];
      const updateText = `
        UPDATE categories
        SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING *;
      `;
      const updateRes = await pool.query(updateText, [name, description || null, existing.id]);
      category = updateRes.rows[0];
      console.log(`[Webhook IMS-Category] Updated category "${name}" (ID: ${category.id})`);
    } else {
      const insertText = `
        INSERT INTO categories (name, description)
        VALUES ($1, $2)
        RETURNING *;
      `;
      const insertRes = await pool.query(insertText, [name, description || null]);
      category = insertRes.rows[0];
      console.log(`[Webhook IMS-Category] Created category "${name}" (ID: ${category.id})`);
    }

    res.status(200).json({ status: 'success', data: { category } });
  } catch (err) {
    next(err);
  }
};

export const handleImsCategoryDeleteWebhook = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name) {
      return next(new ApiError(400, 'Category name is required for deletion sync.'));
    }

    const deleteRes = await pool.query('DELETE FROM categories WHERE name = $1 RETURNING *;', [name]);
    if (deleteRes.rows.length > 0) {
      console.log(`[Webhook IMS-Category] Deleted category "${name}".`);
    } else {
      console.log(`[Webhook IMS-Category] Deletion skipped. Category "${name}" not found.`);
    }

    res.status(200).json({ status: 'success' });
  } catch (err) {
    next(err);
  }
};

export const handleImsProductWebhook = async (req, res, next) => {
  try {
    const { name, oldName, price, imageUrl, categoryName, isActive } = req.body;

    if (!name || price === undefined || !categoryName) {
      return next(new ApiError(400, 'Product name, price, and category name are required for sync.'));
    }

    // Resolve category_id
    let categoryRes = await pool.query('SELECT id FROM categories WHERE name = $1;', [categoryName]);
    let categoryId;
    if (categoryRes.rows.length > 0) {
      categoryId = categoryRes.rows[0].id;
    } else {
      // Auto-create category if missing
      const insertCat = await pool.query('INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING id;', [categoryName, `Auto-created for product ${name}`]);
      categoryId = insertCat.rows[0].id;
    }

    // Check if product exists by name or oldName
    const lookupName = oldName || name;
    const checkRes = await pool.query('SELECT id, name, description FROM products WHERE name = $1;', [lookupName]);
    
    let product;
    if (checkRes.rows.length > 0) {
      const existing = checkRes.rows[0];
      const updateText = `
        UPDATE products
        SET name = $1, price = $2, image_url = $3, category_id = $4, updated_at = CURRENT_TIMESTAMP
        WHERE id = $5
        RETURNING *;
      `;
      const updateRes = await pool.query(updateText, [name, price, imageUrl || '', categoryId, existing.id]);
      product = updateRes.rows[0];
      console.log(`[Webhook IMS-Product] Updated product "${name}"`);
    } else {
      const insertText = `
        INSERT INTO products (name, description, price, image_url, category_id, stock)
        VALUES ($1, $2, $3, $4, $5, 0)
        RETURNING *;
      `;
      const defaultDesc = `Product "${name}" imported from IMS.`;
      const insertRes = await pool.query(insertText, [name, defaultDesc, price, imageUrl || '', categoryId]);
      product = insertRes.rows[0];
      console.log(`[Webhook IMS-Product] Created product "${name}"`);
    }

    res.status(200).json({
      status: 'success',
      message: 'Product synchronized successfully.',
      data: { product }
    });
  } catch (err) {
    next(err);
  }
};

export const handleImsProductDeleteWebhook = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name) {
      return next(new ApiError(400, 'Product name is required for deletion sync.'));
    }

    const deleteRes = await pool.query('DELETE FROM products WHERE name = $1 RETURNING *;', [name]);
    if (deleteRes.rows.length > 0) {
      console.log(`[Webhook IMS-Product] Deleted product "${name}" due to IMS deletion.`);
    } else {
      console.log(`[Webhook IMS-Product] Deletion skipped. Product "${name}" not found in Ecom.`);
    }

    res.status(200).json({
      status: 'success',
      message: 'Product deletion synced successfully.'
    });
  } catch (err) {
    next(err);
  }
};

