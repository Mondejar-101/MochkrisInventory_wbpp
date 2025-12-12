import React, { createContext, useContext, useState } from 'react';

const SystemContext = createContext();

export const SystemProvider = ({ children }) => {
  // Inventory mock
  const [inventory, setInventory] = useState([
    { product_id: 1, name: 'Mahogany Wood Plank', qty: 5, unit: 'pcs', restockThreshold: 3, restockQty: 10 },
    { product_id: 2, name: 'Wood Glue (Industrial)', qty: 2, unit: 'gals', restockThreshold: 5, restockQty: 20 },
    { product_id: 3, name: 'Upholstery Fabric', qty: 0, unit: 'meters', restockThreshold: 2, restockQty: 15 },
  ]);

  const [requisitions, setRequisitions] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [autoRestockedItems, setAutoRestockedItems] = useState([]); // stores auto-created RF logs

  // -------------------------
  // Auto-create Requisition (when low stock)
  // -------------------------
  const autoCreateRequisition = (item) => {
    const newReq = {
      id: Date.now(),
      item: item.name,
      qty: item.restockQty,
      product_id: item.product_id,
      status: 'PENDING_VP_APPROVAL',
      auto: true,
      history: ['Auto-generated due to low stock'],
      requestDate: new Date().toLocaleDateString(),
    };
    setRequisitions(prev => [...prev, newReq]);
    setAutoRestockedItems(prev => [...prev, { product_id: item.product_id, name: item.name, restockQty: item.restockQty, autoCreatedAt: new Date().toLocaleTimeString() }]);
    console.log(`📄 Auto-Requisition Created for ${item.name}`);
  };

  // -------------------------
  // Manual create RF (department)
  // -------------------------
  const createRequisition = (itemName, qty, product_id) => {
    const newReq = {
      id: Date.now(),
      item: itemName,
      qty: parseInt(qty),
      product_id,
      status: 'PENDING_VP_APPROVAL',
      history: ['Created by Department'],
      requestDate: new Date().toLocaleDateString(),
    };
    setRequisitions(prev => [...prev, newReq]);
  };

  // -------------------------
  // VP approve RF
  // -------------------------
  const vpSignRequisition = (id, isApproved) => {
    setRequisitions(prev => prev.map(r => r.id === id ? { ...r,
      status: isApproved ? 'APPROVED_BY_VP' : 'REJECTED',
      history: [...r.history, isApproved ? 'Signed by VP' : 'Returned to Dept (Not Signed)']
    } : r));
  };

  // -------------------------
  // Custodian checks inventory for approved RF (delivers if enough stock)
  // If stock becomes < threshold after delivery, auto-create RF
  // -------------------------
  const custodianCheckInventory = (reqId) => {
    const req = requisitions.find(r => r.id === reqId);
    if (!req) return;
    const item = inventory.find(i => i.product_id === req.product_id);
    if (!item) return;

    if (item.qty >= req.qty) {
      // Deduct stock
      setInventory(prev => prev.map(i => i.product_id === item.product_id ? { ...i, qty: i.qty - req.qty } : i));

      // mark delivered
      setRequisitions(prev => prev.map(r => r.id === reqId ? { ...r, status: 'DELIVERED_TO_DEPT', history: [...r.history, 'Delivered to Department'] } : r));

      // check threshold and auto-create RF if needed
      const newQty = item.qty - req.qty;
      if (newQty < item.restockThreshold) {
        // use the current item snapshot (before setInventory takes effect)
        autoCreateRequisition(item);
      }
    } else {
      // forward to purchasing
      setRequisitions(prev => prev.map(r => r.id === reqId ? { ...r, status: 'FORWARDED_TO_PURCHASING', history: [...r.history, 'Insufficient stock. Forwarded to Purchasing'] } : r));
    }
  };

  // -------------------------
  // Create PO from RF (normal flow)
  // -------------------------
  const createPurchaseOrder = (reqId, supplierName) => {
    const req = requisitions.find(r => r.id === reqId);
    if (!req) return;

    const newPO = {
      id: `PO-${Date.now()}`,
      reqId,
      item: req.item,
      product_id: req.product_id,
      qty: req.qty,
      supplier: supplierName,
      status: 'PENDING_PO_APPROVAL',
      history: ['PO Created after Canvassing'],
      type: 'RF_LINKED'
    };

    setPurchaseOrders(prev => [...prev, newPO]);
    setRequisitions(prev => prev.map(r => r.id === reqId ? { ...r, status: 'PO_GENERATED', history: [...r.history, 'PO Generated'] } : r));
  };

  const vpSignPO = (poId, isApproved) => {
    setPurchaseOrders(prev => prev.map(po => po.id === poId ? { ...po, status: isApproved ? 'SENT_TO_SUPPLIER' : 'RETURNED_TO_PURCHASING', history: [...po.history, isApproved ? 'Signed by VP. Sent to Supplier.' : 'Unsigned. Returned.'] } : po));
  };

  // -------------------------
  // Direct purchasing (Purchasing role can create PO w/o RF)
  // items: [{ product_id, qty }]
  // -------------------------
  const purchaseStockDirect = (items, supplierName = 'Direct Supplier') => {
    const newPO = {
      id: `PO-DIRECT-${Date.now()}`,
      createdAt: new Date().toISOString(),
      items, // array of { product_id, qty }
      supplier: supplierName,
      status: 'SENT_TO_SUPPLIER',
      history: ['Direct Purchase Created'],
      type: 'DIRECT_PURCHASE'
    };
    setPurchaseOrders(prev => [...prev, newPO]);
    return newPO;
  };

  // Mark direct PO as delivered and add stock
  const completeDirectPurchase = (poId) => {
    const po = purchaseOrders.find(p => p.id === poId);
    if (!po) return;

    // add each item to inventory
    setInventory(prev => {
      const next = [...prev];
      po.items.forEach(pi => {
        const idx = next.findIndex(i => i.product_id === pi.product_id);
        if (idx >= 0) {
          next[idx] = { ...next[idx], qty: next[idx].qty + pi.qty };
        } else {
          // create new inventory item if not exist
          next.push({ product_id: pi.product_id, name: `Product ${pi.product_id}`, qty: pi.qty, unit: 'pcs', restockThreshold: 3, restockQty: 10 });
        }
      });
      return next;
    });

    setPurchaseOrders(prev => prev.map(p => p.id === poId ? { ...p, status: 'COMPLETED', history: [...p.history, 'Direct Purchase Received'] } : p));
  };

  // -------------------------
  // Receive delivery for RF-linked PO
  // -------------------------
  const receiveDelivery = (poId, isDamaged = false) => {
    const po = purchaseOrders.find(p => p.id === poId);
    if (!po) return;

    if (isDamaged) {
      setPurchaseOrders(prev => prev.map(p => p.id === poId ? { ...p, status: 'RETURNED_TO_SUPPLIER', history: [...p.history, 'Items Damaged. Returned to Supplier.'] } : p));
      return;
    }

    // mark completed
    setPurchaseOrders(prev => prev.map(p => p.id === poId ? { ...p, status: 'COMPLETED', history: [...p.history, 'Items Good. Delivered.'] } : p));

    // update requisition and inventory if RF-linked
    if (po.type === 'RF_LINKED') {
      setRequisitions(prev => prev.map(r => r.id === po.reqId ? { ...r, status: 'COMPLETED', history: [...r.history, 'Item Received from Supplier and Delivered.'] } : r));
      setInventory(prev => prev.map(i => i.product_id === po.product_id ? { ...i, qty: i.qty + po.qty } : i));
    }
  };

  return (
    <SystemContext.Provider value={{
      inventory,
      requisitions,
      purchaseOrders,
      autoRestockedItems,

      // requisition flows
      createRequisition,
      vpSignRequisition,
      custodianCheckInventory,

      // purchase flows
      createPurchaseOrder,
      vpSignPO,
      receiveDelivery,

      // direct purchase
      purchaseStockDirect,
      completeDirectPurchase,

      // expose auto-create for manual "Restock" button
      autoCreateRequisition
    }}>
      {children}
    </SystemContext.Provider>
  );
};

export const useSystem = () => useContext(SystemContext);
