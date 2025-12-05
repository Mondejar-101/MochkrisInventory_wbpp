import React, { createContext, useContext, useState } from 'react';

const SystemContext = createContext();

export const SystemProvider = ({ children }) => {
  // --- DATABASE MOCK ---
  const [inventory, setInventory] = useState([
    { id: 1, name: 'Mahogany Wood Plank', qty: 5, unit: 'pcs' },
    { id: 2, name: 'Wood Glue (Industrial)', qty: 2, unit: 'gals' },
    { id: 3, name: 'Upholstery Fabric', qty: 0, unit: 'meters' }, // Out of stock example
  ]);

  const [requisitions, setRequisitions] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);

  // --- FLOW 1: REQUISITION SYSTEM ACTIONS ---

  const createRequisition = (item, qty, type = 'Item') => {
    const newReq = {
      id: Date.now(),
      item,
      qty: parseInt(qty),
      type, // 'Item' or 'Job'
      status: 'PENDING_VP_APPROVAL', // Start
      history: ['Created by Department'],
      requestDate: new Date().toLocaleDateString()
    };
    setRequisitions([...requisitions, newReq]);
  };

  const vpSignRequisition = (id, isApproved) => {
    setRequisitions(prev => prev.map(req => {
      if (req.id !== id) return req;
      return {
        ...req,
        status: isApproved ? 'APPROVED_BY_VP' : 'REJECTED',
        history: [...req.history, isApproved ? 'Signed by VP' : 'Returned to Dept (Not Signed)']
      };
    }));
  };

  const custodianCheckInventory = (reqId) => {
    // Logic from Page 1: Check Inventory -> Available?
    const req = requisitions.find(r => r.id === reqId);
    const stockItem = inventory.find(i => i.name === req.item);
    
    let nextStatus = '';
    let historyMsg = '';

    if (stockItem && stockItem.qty >= req.qty) {
      // YES Available -> Deliver
      nextStatus = 'DELIVERED_TO_DEPT';
      historyMsg = 'Stock Available. Delivered to Requesting Party.';
      // Deduct Stock
      setInventory(prev => prev.map(i => i.name === req.item ? { ...i, qty: i.qty - req.qty } : i));
    } else {
      // NO -> Proceed to Purchasing
      nextStatus = 'FORWARDED_TO_PURCHASING';
      historyMsg = 'Out of Stock. Forwarded to Purchasing.';
    }

    setRequisitions(prev => prev.map(r => r.id === reqId ? { ...r, status: nextStatus, history: [...r.history, historyMsg] } : r));
  };

  // --- FLOW 2: PURCHASING FLOW ACTIONS ---

  const createPurchaseOrder = (reqId, supplierName) => {
    // Logic from Page 2: Canvass -> Create PO
    const req = requisitions.find(r => r.id === reqId);
    const newPO = {
      id: `PO-${Date.now()}`,
      reqId,
      item: req.item,
      qty: req.qty,
      supplier: supplierName,
      status: 'PENDING_PO_APPROVAL', // Waiting for VP/Finance
      history: ['PO Created after Canvassing']
    };
    
    setPurchaseOrders([...purchaseOrders, newPO]);
    
    // Update Req status
    setRequisitions(prev => prev.map(r => r.id === reqId ? { ...r, status: 'PO_GENERATED' } : r));
  };

  const vpSignPO = (poId, isApproved) => {
    // Logic from Page 2: PO Approval
    setPurchaseOrders(prev => prev.map(po => {
      if (po.id !== poId) return po;
      return {
        ...po,
        status: isApproved ? 'SENT_TO_SUPPLIER' : 'RETURNED_TO_PURCHASING',
        history: [...po.history, isApproved ? 'Signed by VP. Sent to Supplier.' : 'Unsigned. Returned.']
      };
    }));
  };

  // --- FLOW 3: DELIVERY SYSTEM ACTIONS ---

  const receiveDelivery = (poId, isDamaged) => {
    // Logic from Page 3: Physical Check -> Damage?
    const po = purchaseOrders.find(p => p.id === poId);

    if (isDamaged) {
      // YES Damage -> Return to Supplier
      setPurchaseOrders(prev => prev.map(p => p.id === poId ? { 
        ...p, 
        status: 'RETURNED_TO_SUPPLIER',
        history: [...p.history, 'Items Damaged. Returned to Supplier.']
      } : p));
    } else {
      // NO Damage -> Process RM -> Add Inventory -> Deliver
      
      // 1. Update PO
      setPurchaseOrders(prev => prev.map(p => p.id === poId ? { 
        ...p, 
        status: 'COMPLETED',
        history: [...p.history, 'Items Good. RM Processed. Delivered to Requester.']
      } : p));

      // 2. Add to Inventory (and immediately deduct or reserve for the original requester)
      // Note: In your flow, it goes Inventory -> Deliver to Requesting Party.
      // So technically it hits inventory then leaves. We will just update the Requisition to "Fulfilled"
      
      setRequisitions(prev => prev.map(r => r.id === po.reqId ? { 
        ...r, 
        status: 'COMPLETED',
        history: [...r.history, 'Item Received from Supplier and Delivered.']
      } : r));

      // Optional: Add to stock if it was a bulk order, but assuming just-in-time for this logic
    }
  };

  return (
    <SystemContext.Provider value={{
      inventory, requisitions, purchaseOrders,
      createRequisition, vpSignRequisition, custodianCheckInventory,
      createPurchaseOrder, vpSignPO, receiveDelivery
    }}>
      {children}
    </SystemContext.Provider>
  );
};

export const useSystem = () => useContext(SystemContext);