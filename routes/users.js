// routes/users.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');

// --------------------
// Helper: error handler
// --------------------
const handleError = (res, err) => {
  console.error(err);
  return res.status(500).json({ error: 'Internal server error' });
};

// --------------------
// GET all users
// --------------------
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, role, created_at FROM users');
    res.json({ users: result.rows });
  } catch (err) {
    handleError(res, err);
  }
});

// --------------------
// GET user by ID
// --------------------
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    res.json({ user: result.rows[0] });
  } catch (err) {
    handleError(res, err);
  }
});

// --------------------
// POST new user
// --------------------
router.post(
  '/',
  body('name').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('role').optional().isIn(['user', 'admin', 'vp', 'department', 'custodian', 'purchasing']),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { name, email, password, role = 'user' } = req.body;

      // Check if email already exists
      const exists = await pool.query('SELECT 1 FROM users WHERE email = $1', [email]);
      if (exists.rows.length) return res.status(400).json({ error: 'Email already registered' });

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await pool.query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at',
        [name, email, hashedPassword, role]
      );

      res.status(201).json({ message: 'User created', user: result.rows[0] });
    } catch (err) {
      handleError(res, err);
    }
  }
);

// --------------------
// PUT update user (name, email, role)
// --------------------
router.put(
  '/:id',
  body('name').optional().notEmpty(),
  body('email').optional().isEmail(),
  body('role').optional().isIn(['user', 'admin', 'vp', 'department', 'custodian', 'purchasing']),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { id } = req.params;
      const { name, email, role } = req.body;

      // Build dynamic query for only provided fields
      const fields = [];
      const values = [];
      let idx = 1;

      if (name) { fields.push(`name = $${idx++}`); values.push(name); }
      if (email) { fields.push(`email = $${idx++}`); values.push(email); }
      if (role) { fields.push(`role = $${idx++}`); values.push(role); }

      if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });

      values.push(id);
      const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, name, email, role, created_at`;
      const result = await pool.query(query, values);

      if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });

      res.json({ message: 'User updated', user: result.rows[0] });
    } catch (err) {
      handleError(res, err);
    }
  }
);

// --------------------
// DELETE user
// --------------------
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id, name, email, role',
      [id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    res.json({ message: 'User deleted', user: result.rows[0] });
  } catch (err) {
    handleError(res, err);
  }
});

module.exports = router;
