const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all inventory items
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT i.id, i.stock_qty, i.unit, i.location, p.name AS product_name
      FROM inventory i
      JOIN products p ON i.product_id = p.id
    `);
    res.json({ inventory: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET inventory by product ID
router.get('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const result = await pool.query(
      'SELECT * FROM inventory WHERE product_id = $1',
      [productId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    res.json({ inventory: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADD inventory record
router.post('/', async (req, res) => {
  try {
    const { product_id, stock_qty, unit, location } = req.body;
    const result = await pool.query(
      'INSERT INTO inventory (product_id, stock_qty, unit, location) VALUES ($1, $2, $3, $4) RETURNING *',
      [product_id, stock_qty, unit, location]
    );
    res.json({ message: 'Inventory added', inventory: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE stock quantity
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { stock_qty, unit, location } = req.body;
    const result = await pool.query(
      'UPDATE inventory SET stock_qty=$1, unit=$2, location=$3, last_updated=NOW() WHERE id=$4 RETURNING *',
      [stock_qty, unit, location, id]
    );
    res.json({ message: 'Inventory updated', inventory: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE inventory record
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM inventory WHERE id=$1', [id]);
    res.json({ message: 'Inventory deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
