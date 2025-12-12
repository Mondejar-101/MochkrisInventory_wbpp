// routes/products.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const { body, validationResult } = require('express-validator');

// --------------------
// Helper: error handler
// --------------------
const handleError = (res, err) => {
  console.error(err);
  return res.status(500).json({ error: 'Internal server error' });
};

// --------------------
// GET all products
// --------------------
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, description, price, created_at FROM products ORDER BY id ASC');
    res.json({ products: result.rows });
  } catch (err) {
    handleError(res, err);
  }
});

// --------------------
// GET product by ID
// --------------------
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT id, name, description, price, created_at FROM products WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });

    res.json({ product: result.rows[0] });
  } catch (err) {
    handleError(res, err);
  }
});

// --------------------
// POST new product
// --------------------
router.post(
  '/',
  body('name').notEmpty().withMessage('Product name is required'),
  body('description').optional().isString(),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { name, description = '', price } = req.body;

      // Optional: check if product name already exists
      const exists = await pool.query('SELECT 1 FROM products WHERE name = $1', [name]);
      if (exists.rows.length) return res.status(400).json({ error: 'Product name already exists' });

      const result = await pool.query(
        'INSERT INTO products (name, description, price) VALUES ($1, $2, $3) RETURNING id, name, description, price, created_at',
        [name, description, price]
      );

      res.status(201).json({ message: 'Product created', product: result.rows[0] });
    } catch (err) {
      handleError(res, err);
    }
  }
);

// --------------------
// PUT update product
// --------------------
router.put(
  '/:id',
  body('name').optional().notEmpty(),
  body('description').optional().isString(),
  body('price').optional().isFloat({ min: 0 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { id } = req.params;
      const { name, description, price } = req.body;

      // Build dynamic query
      const fields = [];
      const values = [];
      let idx = 1;

      if (name) { fields.push(`name = $${idx++}`); values.push(name); }
      if (description) { fields.push(`description = $${idx++}`); values.push(description); }
      if (price !== undefined) { fields.push(`price = $${idx++}`); values.push(price); }

      if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });

      values.push(id);
      const query = `UPDATE products SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, name, description, price, created_at`;
      const result = await pool.query(query, values);

      if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });

      res.json({ message: 'Product updated', product: result.rows[0] });
    } catch (err) {
      handleError(res, err);
    }
  }
);

// --------------------
// DELETE product
// --------------------
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM products WHERE id = $1 RETURNING id, name, description, price',
      [id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });

    res.json({ message: 'Product deleted', product: result.rows[0] });
  } catch (err) {
    handleError(res, err);
  }
});

module.exports = router;
