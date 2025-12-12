const express = require('express');
const router = express.Router();
const pool = require('../db');
const { updateInventoryForRequisition } = require('../services/inventoryService');

router.put('/approve/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { approve } = req.body;

    if (!approve) {
      await pool.query('UPDATE requisitions SET status=$1 WHERE id=$2', ['REJECTED', id]);
      return res.json({ message: 'Requisition rejected' });
    }

    const reqRow = await pool.query('SELECT * FROM requisitions WHERE id=$1', [id]);
    const quantity = reqRow.rows[0].qty;

    const updatedInventory = await updateInventoryForRequisition(id, quantity);

    await pool.query('UPDATE requisitions SET status=$1 WHERE id=$2', ['DELIVERED_TO_DEPT', id]);

    res.json({ message: 'Requisition approved and stock updated', inventory: updatedInventory });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
