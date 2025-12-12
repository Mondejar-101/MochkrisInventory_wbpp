const pool = require('../db');

const updateInventoryForRequisition = async (reqId, quantity) => {
  const reqResult = await pool.query('SELECT * FROM requisitions WHERE id = $1', [reqId]);
  if (!reqResult.rows.length) throw new Error('Requisition not found');

  const productId = reqResult.rows[0].product_id;

  const inventoryResult = await pool.query(
    'UPDATE inventory SET stock_qty = stock_qty - $1, last_updated = NOW() WHERE product_id = $2 RETURNING *',
    [quantity, productId]
  );

  await pool.query(
    'INSERT INTO inventory_transactions (inventory_id, change_qty, type, related_id) VALUES ($1, $2, $3, $4)',
    [inventoryResult.rows[0].id, -quantity, 'DEDUCTED', reqId]
  );

  return inventoryResult.rows[0];
};

const receivePurchaseOrder = async (poId, receivedQty) => {
  const poResult = await pool.query('SELECT * FROM purchase_orders WHERE id=$1', [poId]);
  if (!poResult.rows.length) throw new Error('PO not found');

  const productId = poResult.rows[0].product_id;

  const inventoryResult = await pool.query(
    'UPDATE inventory SET stock_qty = stock_qty + $1, last_updated = NOW() WHERE product_id = $2 RETURNING *',
    [receivedQty, productId]
  );

  await pool.query(
    'INSERT INTO inventory_transactions (inventory_id, change_qty, type, related_id) VALUES ($1, $2, $3, $4)',
    [inventoryResult.rows[0].id, receivedQty, 'RECEIVED', poId]
  );

  await pool.query('UPDATE purchase_orders SET status=$1 WHERE id=$2', ['COMPLETED', poId]);

  return inventoryResult.rows[0];
};

module.exports = { updateInventoryForRequisition, receivePurchaseOrder };
