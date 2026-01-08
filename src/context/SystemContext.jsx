import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

const SystemContext = createContext();

// Helper function to format dates
const formatDate = (date) => new Date(date).toISOString();

export const SystemProvider = ({ children }) => {
  // Load state from localStorage on initial render
  const loadState = (key, defaultValue) => {
    try {
      const saved = localStorage.getItem(`mochkris_${key}`);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return defaultValue;
    }
  };

  // Save state to localStorage whenever it changes
  const usePersistedState = (key, defaultValue) => {
    const [state, setState] = useState(() => loadState(key, defaultValue));

    useEffect(() => {
      try {
        localStorage.setItem(`mochkris_${key}`, JSON.stringify(state));
      } catch (error) {
        console.error(`Error saving ${key} to localStorage:`, error);
      }
    }, [key, state]);

    return [state, setState];
  };

  // Inventory state with persistence - starting empty
  const [inventory, setInventory] = usePersistedState("inventory", []);

  // Suppliers state with persistence - starting empty
  const [suppliers, setSuppliers] = usePersistedState("suppliers", []);

  // Other state with persistence
  const [requisitions, setRequisitions] = usePersistedState("requisitions", []);
  const [purchaseOrders, setPurchaseOrders] = usePersistedState(
    "purchaseOrders",
    []
  );
  const [purchaseRequests, setPurchaseRequests] = usePersistedState(
    "purchaseRequests",
    []
  );
  const [managers, setManagers] = usePersistedState("managers", []);
  
  // State for pre-filling forms from dashboard
  const [prefillData, setPrefillData] = useState(null);

  // Furniture stock state with persistence
  const [furnitureStock, setFurnitureStock] = usePersistedState("furnitureStock", []);

  // Material dispense history state with persistence
  const [materialDispenseHistory, setMaterialDispenseHistory] = usePersistedState("materialDispenseHistory", []);

  // Furniture dispense history state with persistence
  const [furnitureDispenseHistory, setFurnitureDispenseHistory] = usePersistedState("furnitureDispenseHistory", []);

  // Helper function to generate ID in format: YYYYMMDD-XXXXXX
  const generateId = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `${year}${month}${day}-${random}`;
  };

  // Add furniture items to stock
  const addFurnitureItems = useCallback((items) => {
    const newItems = items.map(item => ({
      ...item,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: formatDate(new Date()),
      status: item.quantity === 0 ? 'Out of Stock' : item.quantity < item.restockThreshold ? 'Low Stock' : 'In Stock'
    }));
    
    setFurnitureStock(prev => [...prev, ...newItems]);
    return newItems;
  }, []);

  // Update furniture item
  const updateFurnitureItem = useCallback((itemId, updatedData) => {
    setFurnitureStock(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, ...updatedData, updatedAt: formatDate(new Date()) }
          : item
      )
    );
  }, []);

  // Delete furniture item
  const deleteFurnitureItem = useCallback((itemId) => {
    setFurnitureStock(prev => prev.filter(item => item.id !== itemId));
  }, []);

  // Add material dispense record
  const addMaterialDispense = useCallback((dispenseData) => {
    const newDispense = {
      ...dispenseData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      dispensedAt: formatDate(new Date()),
      type: 'material'
    };
    
    setMaterialDispenseHistory(prev => [newDispense, ...prev]);
    return newDispense;
  }, []);

  // Add furniture dispense record
  const addFurnitureDispense = useCallback((dispenseData) => {
    const newDispense = {
      ...dispenseData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      dispensedAt: formatDate(new Date()),
      type: 'furniture'
    };
    
    setFurnitureDispenseHistory(prev => [newDispense, ...prev]);
    return newDispense;
  }, []);

  // Create new PO
  const createPO = useCallback((poData) => {
    const newPO = {
      ...poData,
      id: Date.now().toString(),
      poNumber: Math.floor(1000 + Math.random() * 9000).toString(),
      status: "draft",
      createdAt: formatDate(new Date()),
      items: poData.items || [],
      history: [
        {
          timestamp: formatDate(new Date()),
          status: "draft",
          user: poData.createdBy,
          notes: "Purchase order created",
        },
      ],
      totalAmount: poData.items.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0
      ),
    };

    setPurchaseOrders((prev) => [...prev, newPO]);
    return newPO;
  }, []);

  // Approve and assign PO to manager
  const approveAndAssignPO = useCallback(
    (poId, { assignedTo, approvedBy, notes = "" }) => {
      setPurchaseOrders((prev) =>
        prev.map((po) => {
          if (po.id === poId) {
            return {
              ...po,
              status: "approved",
              assignedTo,
              approvedBy,
              approvedAt: formatDate(new Date()),
              history: [
                ...(po.history || []),
                {
                  timestamp: formatDate(new Date()),
                  status: "approved",
                  user: approvedBy,
                  notes: `Approved and assigned to ${
                    managers.find((m) => m.id === assignedTo)?.name || "manager"
                  }`,
                },
              ],
            };
          }
          return po;
        })
      );
    },
    [managers]
  );

  // Mark PO as purchased
  const markAsPurchased = useCallback(
    (poId, { purchasedBy, purchaseDate, invoiceNumber, notes = "" }) => {
      setPurchaseOrders((prev) =>
        prev.map((po) => {
          if (po.id === poId) {
            return {
              ...po,
              status: "purchased",
              purchaseDate: purchaseDate || formatDate(new Date()),
              invoiceNumber,
              history: [
                ...(po.history || []),
                {
                  timestamp: formatDate(new Date()),
                  status: "purchased",
                  user: purchasedBy,
                  notes: `Marked as purchased${
                    invoiceNumber ? ` (Invoice: ${invoiceNumber})` : ""
                  }`,
                },
              ],
            };
          }
          return po;
        })
      );
    },
    []
  );

  // Receive items from PO
  const receiveItems = useCallback(
    (
      poId,
      { receivedBy, itemsReceived, notes = "", hasDiscrepancies = false }
    ) => {
      setPurchaseOrders((prev) =>
        prev.map((po) => {
          if (po.id === poId) {
            // Update inventory
            itemsReceived.forEach((receivedItem) => {
              const item = po.items.find(
                (i) => i.productId === receivedItem.productId
              );
              if (item) {
                setInventory((prevInv) =>
                  prevInv.map((invItem) =>
                    invItem.product_id === item.productId
                      ? {
                          ...invItem,
                          qty:
                            (invItem.qty || 0) +
                            (receivedItem.quantityReceived || 0),
                        }
                      : invItem
                  )
                );
              }
            });

            return {
              ...po,
              status: hasDiscrepancies ? "partially_received" : "completed",
              receivedAt: formatDate(new Date()),
              items: po.items.map((item) => {
                const received = itemsReceived.find(
                  (ri) => ri.productId === item.productId
                );
                return received
                  ? { ...item, quantityReceived: received.quantityReceived }
                  : item;
              }),
              history: [
                ...(po.history || []),
                {
                  timestamp: formatDate(new Date()),
                  status: hasDiscrepancies ? "partially_received" : "completed",
                  user: receivedBy,
                  notes: `Items received${
                    hasDiscrepancies ? " (with discrepancies)" : ""
                  }${notes ? ` - ${notes}` : ""}`,
                },
              ],
            };
          }
          return po;
        })
      );
    },
    []
  );

  // Rate supplier after PO completion
  const rateSupplier = useCallback(
    (poId, { supplierId, rating, comment, ratedBy }) => {
      // Update supplier's rating
      setSuppliers((prevSuppliers) =>
        prevSuppliers.map((supplier) => {
          if (supplier.id === supplierId) {
            const newRating = {
              value: rating,
              comment,
              date: formatDate(new Date()),
              poId,
              ratedBy,
            };

            const updatedRatings = [...(supplier.ratings || []), newRating];
            const newAverage =
              updatedRatings.reduce((sum, r) => sum + r.value, 0) /
              updatedRatings.length;

            return {
              ...supplier,
              rating: parseFloat(newAverage.toFixed(1)),
              ratings: updatedRatings,
            };
          }
          return supplier;
        })
      );

      // Update PO with rating info
      setPurchaseOrders((prev) =>
        prev.map((po) =>
          po.id === poId
            ? {
                ...po,
                supplierRated: true,
                supplierRating: rating,
                supplierRatingComment: comment,
                supplierRatingDate: formatDate(new Date()),
                history: [
                  ...(po.history || []),
                  {
                    message:
                      `Supplier rated ${rating} stars` +
                      (comment ? `: ${comment}` : ""),
                    timestamp: formatDate(new Date()),
                    userId: "system",
                    userName: "System",
                  },
                ],
              }
            : po
        )
      );
    },
    [formatDate]
  ); // Add formatDate to the dependency array

  // Get POs based on user role
  const getUserPOs = (userId, role) => {
    if (role === "OWNER") {
      return purchaseOrders;
    } else if (role === "MANAGER") {
      return purchaseOrders.filter(
        (po) =>
          po.assignedTo === userId ||
          po.status === "approved" ||
          po.status === "purchased" ||
          po.status === "partially_received"
      );
    }
    return [];
  };


  // -------------------------
  // Manual create RF (department)
  // -------------------------
  const createRequisition = (
    itemName,
    qty,
    product_id,
    supplier = null,
    price = 0,
    additionalData = {}
  ) => {
    console.log('createRequisition called with:', { itemName, qty, product_id, supplier, price });
    
    // Use the provided product_id directly - items should already exist in inventory
    const itemId = product_id;

    const newReq = {
      id: generateId(),
      item: itemName,
      qty: parseInt(qty),
      product_id: itemId,
      price: parseFloat(price) || 0,
      status: "PENDING APPROVAL",
      history: [
        "Created by General Manager" +
          (supplier ? ` (Preferred Supplier: ${supplier.name})` : ""),
      ],
      requestDate: new Date().toISOString(),
      ...(supplier && { supplier }),
      ...additionalData
    };

    setRequisitions((prev) => {
      const newRequisitions = [...prev, newReq];
      console.log('setRequisitions called - newReq:', newReq);
      console.log('setRequisitions called - newRequisitions:', newRequisitions);
      return newRequisitions;
    });
    return newReq;
  };

  // -------------------------
  // VP approve RF
  // -------------------------
  const vpSignRequisition = (id, isApproved) => {
    setRequisitions((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: isApproved ? "APPROVED" : "REJECTED",
              history: [
                ...r.history,
                isApproved ? "Approved" : "Returned to Dept (Not Signed)",
              ],
            }
          : r
      )
    );
  };

  // -------------------------
  // Custodian checks inventory for approved RF (delivers if enough stock)
  // -------------------------
  const custodianCheckInventory = (reqId) => {
    const req = requisitions.find((r) => r.id === reqId);
    if (!req) return;
    
    // Check if this is a temporary item
    const isTemporary = req.product_id && req.product_id.toString().startsWith('temp-');
    
    let item;
    if (isTemporary) {
      // For temporary items, find the item in the requisition items array
      item = req.items && req.items.find(i => i.product_id === req.product_id);
      if (!item) {
        // Fallback to creating item from requisition data
        item = {
          product_id: req.product_id,
          name: req.item,
          qty: 0,
          unit: 'pcs',
          restockThreshold: 3,
          restockQty: 10,
          isTemporary: true
        };
      }
    } else {
      // For existing items, find in inventory
      item = inventory.find((i) => i.product_id === req.product_id);
      if (!item) return;
    }

    // For temporary items, we can't check stock since they don't exist in inventory yet
    // So we always forward to purchasing for temporary items
    if (isTemporary || item.qty < req.qty) {
      // forward to purchasing
      setRequisitions((prev) =>
        prev.map((r) =>
          r.id === reqId
            ? {
                ...r,
                status: "FORWARDED_TO_PURCHASING",
                history: [
                  ...r.history,
                  isTemporary 
                    ? "New item. Forwarded to Purchasing for procurement"
                    : "Insufficient stock. Forwarded to Purchasing",
                ],
              }
            : r
        )
      );
    } else {
      // Deduct stock for existing items
      setInventory((prev) =>
        prev.map((i) =>
          i.product_id === item.product_id ? { ...i, qty: i.qty - req.qty } : i
        )
      );

      // mark delivered
      setRequisitions((prev) =>
        prev.map((r) =>
          r.id === reqId
            ? {
                ...r,
                status: "DELIVERED_TO_DEPT",
                history: [...r.history, "Delivered to Department"],
              }
            : r
        )
      );

    }
  };

  // -------------------------
  // Create PO from RF (normal flow)
  // -------------------------
  const createPurchaseOrder = (reqId, supplierName) => {
    console.log('createPurchaseOrder called with:', { reqId, supplierName });
    const req = requisitions.find((r) => r.id === reqId);
    if (!req) {
      console.error('Requisition not found:', reqId);
      return null;
    }

    // Check if this is a temporary item
    const isTemporary = req.product_id && req.product_id.toString().startsWith('temp-');
    
    // Find the item details from the requisition items array if available
    let itemDetails = {};
    if (req.items && req.items.length > 0) {
      const reqItem = req.items.find(i => i.product_id === req.product_id);
      if (reqItem) {
        itemDetails = {
          unit: reqItem.unit,
          restockThreshold: reqItem.restockThreshold,
          restockQty: reqItem.restockQty,
          isTemporary: reqItem.isTemporary
        };
      }
    }

    const newPO = {
      id: generateId(),
      reqId,
      items: req.items || [{
        name: req.item,
        product_id: req.product_id,
        quantity: req.qty,
        unit_price: req.price || 0,
        unit: 'pcs'
      }],
      supplier: supplierName,
      status: "PENDING_PO_APPROVAL",
      history: ["PO Created after Canvassing"],
      type: "RF_LINKED",
      createdAt: new Date().toISOString(),
      // Preserve temporary item information
      ...(isTemporary && {
        isTemporary: true,
        ...itemDetails
      })
    };

    console.log('Creating new PO:', newPO);

    setPurchaseOrders((prev) => {
      const updated = [...prev, newPO];
      console.log('Updated purchaseOrders array:', updated);
      return updated;
    });

    setRequisitions((prev) =>
      prev.map((r) =>
        r.id === reqId
          ? {
              ...r,
              status: "PO_GENERATED",
              history: [...r.history, "PO Generated"],
            }
          : r
      )
    );

    return newPO; // Return the created PO
  };

  const vpSignPO = (poId, isApproved) => {
    setPurchaseOrders((prev) =>
      prev.map((po) =>
        po.id === poId
          ? {
              ...po,
              status: isApproved ? "SENT TO MANAGER" : "RETURNED_TO_PURCHASING",
              history: [
                ...po.history,
                isApproved
                  ? "Approved. Sent to Manager."
                  : "Unsigned. Returned.",
              ],
            }
          : po
      )
    );
  };

  // Mark PO as ready for delivery (after PDF generation)
  const markPOReadyForDelivery = (poId) => {
    console.log('markPOReadyForDelivery called with poId:', poId);
    console.log('Current purchaseOrders before update:', purchaseOrders);
    
    setPurchaseOrders((prev) => {
      const updated = prev.map((po) => {
        const isMatch = po.id === poId || po.id?.toString() === poId?.toString();
        console.log(`Checking PO ${po.id} (type: ${typeof po.id}) against ${poId} (type: ${typeof poId}):`, isMatch);
        
        return isMatch
          ? {
              ...po,
              status: "SENT TO MANAGER",
              history: [
                ...(po.history || []),
                "PO Generated. Ready for Delivery.",
              ],
            }
          : po;
      });
      
      console.log('Updated purchaseOrders:', updated);
      return updated;
    });
  };

  // -------------------------
  // Direct purchasing (Purchasing role can create PO w/o RF)
  // Accepts either a complete order object or just items array
  // -------------------------
  const purchaseStockDirect = (
    orderOrItems,
    supplierName = "Direct Supplier"
  ) => {
    let newPO;

    if (Array.isArray(orderOrItems)) {
      // Backward compatibility: if first arg is items array
      newPO = {
        id: generateId(),
        createdAt: new Date().toISOString(),
        items: orderOrItems,
        supplier: supplierName,
        status: "SENT TO MANAGER",
        history: ["Direct Purchase Created"],
        type: "DIRECT_PURCHASE",
      };
    } else {
      // If first arg is a complete order object
      newPO = {
        ...orderOrItems,
        id: orderOrItems.id || generateId(),
        createdAt: orderOrItems.createdAt || new Date().toISOString(),
        status: orderOrItems.status || "SENT TO MANAGER",
        type: orderOrItems.type || "DIRECT_PURCHASE",
        history: [...(orderOrItems.history || []), 
                  ...(orderOrItems.history && orderOrItems.history.includes("Direct Purchase Created") 
                    ? [] 
                    : ["Direct Purchase Created"])],
      };
    }

    setPurchaseOrders((prev) => [...prev, newPO]);
    return newPO;
  };

  // Mark direct PO as delivered and add stock
  const completeDirectPurchase = (poId) => {
    const po = purchaseOrders.find((p) => p.id === poId);
    if (!po) return;

    // add each item to inventory
    setInventory((prev) => {
      const next = [...prev];
      po.items.forEach((pi) => {
        const idx = next.findIndex((i) => i.product_id === pi.product_id);
        if (idx >= 0) {
          next[idx] = { ...next[idx], qty: next[idx].qty + pi.qty };
        } else {
          // create new inventory item if not exist
          next.push({
            product_id: pi.product_id,
            name: `Product ${pi.product_id}`,
            qty: pi.qty,
            unit: "pcs",
            restockThreshold: 3,
            restockQty: 10,
          });
        }
      });
      return next;
    });

    setPurchaseOrders((prev) =>
      prev.map((p) =>
        p.id === poId
          ? {
              ...p,
              status: "COMPLETED",
              history: [...p.history, "Direct Purchase Received"],
            }
          : p
      )
    );
  };

  // -------------------------
  // Receive delivery for PO (updates inventory)
  // -------------------------
  const receiveDelivery = (poId, isDamaged = false, processingData = null) => {
    console.log('receiveDelivery called with:', { poId, isDamaged, processingData });
    const po = purchaseOrders.find((p) => p.id === poId);
    if (!po) {
      console.error('PO not found:', poId);
      return;
    }
    console.log('Processing PO:', po);

    // Get current timestamp for processing
    const currentTimestamp = new Date().toISOString();

    if (isDamaged) {
      setPurchaseOrders((prev) =>
        prev.map((p) =>
          p.id === poId
            ? {
                ...p,
                status: "RETURNED_TO_SUPPLIER",
                history: [...p.history, "Items Damaged. Returned to Supplier."],
                processedAt: processingData?.processedAt || currentTimestamp,
                updatedAt: currentTimestamp
              }
            : p
        )
      );
      return;
    }

    // mark completed
    setPurchaseOrders((prev) =>
      prev.map((p) =>
        p.id === poId
          ? {
              ...p,
              status: "COMPLETED",
              history: [...p.history, "Items Good. Delivered."],
              processedAt: processingData?.processedAt || currentTimestamp,
              acceptedAt: processingData?.acceptedAt || currentTimestamp,
              updatedAt: currentTimestamp
            }
          : p
      )
    );

    // Update inventory for all PO types
    // Handle both items array format and single item format
    setInventory((prev) => {
      console.log('Current inventory before update:', prev);
      const updated = [...prev];

      if (po.items && Array.isArray(po.items) && po.items.length > 0) {
        // Multiple items format - update all items in one batch
        po.items.forEach((item) => {
          const productId = item.product_id || item.productId;
          const quantity = item.quantity || item.qty || 0;

          if (productId) {
            // Check if this is a temporary item (starts with 'temp-')
            if (productId.toString().startsWith('temp-')) {
              // This is a new item that needs to be added to inventory
              const newItem = {
                product_id: Math.max(0, ...updated.map((i) => i.product_id)) + 1,
                name: item.name || `Item ${productId}`,
                qty: quantity,
                unit: item.unit || 'pcs',
                price: item.unit_price || item.price || item.unitPrice || 0,
                restockThreshold: item.restockThreshold || 3,
                restockQty: item.restockQty || 10,
              };
              updated.push(newItem);
              console.log(`Added new item to inventory: ${newItem.name} with quantity ${quantity}`);
            } else {
              // Existing item - update quantity
              const itemIndex = updated.findIndex(
                (i) => i.product_id?.toString() === productId.toString()
              );
              if (itemIndex >= 0) {
                const oldQty = updated[itemIndex].qty || 0;
                updated[itemIndex] = {
                  ...updated[itemIndex],
                  qty: oldQty + quantity,
                };
                console.log(`Updated item ${productId}: ${oldQty} + ${quantity} = ${updated[itemIndex].qty}`);
              } else {
                console.log('Item not found in inventory:', productId);
              }
            }
          }
        });
      } else if (po.product_id && po.qty) {
        // Single item format (RF_LINKED)
        // Check if this is a temporary item
        if (po.product_id.toString().startsWith('temp-')) {
          // This is a new item that needs to be added to inventory
          const newItem = {
            product_id: Math.max(0, ...updated.map((i) => i.product_id)) + 1,
            name: po.item || po.name || `Item ${po.product_id}`,
            qty: po.qty || 0,
            unit: po.unit || 'pcs',
            price: po.price || 0,
            restockThreshold: 3,
            restockQty: 10,
          };
          updated.push(newItem);
          console.log(`Added new single item to inventory: ${newItem.name} with quantity ${po.qty}`);
        } else {
          // Existing item - update quantity
          const itemIndex = updated.findIndex(
            (i) => i.product_id?.toString() === po.product_id?.toString()
          );
          if (itemIndex >= 0) {
            const oldQty = updated[itemIndex].qty || 0;
            updated[itemIndex] = {
              ...updated[itemIndex],
              qty: oldQty + (po.qty || 0),
            };
            console.log(`Updated single item ${po.product_id}: ${oldQty} + ${po.qty} = ${updated[itemIndex].qty}`);
          } else {
            console.log('Single item not found in inventory:', po.product_id);
          }
        }
      }

      console.log('Updated inventory:', updated);
      return updated;
    });

    // update requisition if RF-linked
    if (po.type === "RF_LINKED" && po.reqId) {
      setRequisitions((prev) =>
        prev.map((r) =>
          r.id === po.reqId
            ? {
                ...r,
                status: "COMPLETED",
                history: [
                  ...r.history,
                  "Item Received from Supplier and Delivered.",
                ],
              }
            : r
        )
      );
    }
  };

  // Function to update inventory when new stock is received
  const updateInventory = (productId, quantity) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.product_id === productId
          ? { ...item, qty: item.qty + quantity }
          : item
      )
    );
  };

  // Update inventory item
  const updateInventoryItem = (updatedItem) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.product_id === updatedItem.product_id
          ? { ...item, ...updatedItem }
          : item
      )
    );
  };

  // Update supplier
  const updateSupplier = useCallback((updatedSupplier) => {
    setSuppliers((prevSuppliers) =>
      prevSuppliers.map((supplier) =>
        supplier.id === updatedSupplier.id
          ? {
              ...supplier,
              ...updatedSupplier,
              // Ensure ratings array is preserved if not provided
              ratings: updatedSupplier.ratings || supplier.ratings || [],
            }
          : supplier
      )
    );
  }, []);

  // Add new supplier
  const addNewSupplier = (supplier) => {
    const newSupplier = {
      ...supplier,
      id: `supplier-${Date.now()}`,
    };
    setSuppliers((prev) => [...prev, newSupplier]);
    return newSupplier;
  };

  // Delete inventory item
  const deleteInventoryItem = (productId) => {
    setInventory((prev) =>
      prev.filter((item) => item.product_id !== productId)
    );
  };

  // Delete supplier
  const deleteSupplier = (supplierId) => {
    setSuppliers((prev) =>
      prev.filter((supplier) => supplier.id !== supplierId)
    );
  };

  // Add new inventory item with price
  const addNewInventoryItem = (item) => {
    const newItem = {
      ...item,
      product_id: Math.max(0, ...inventory.map((i) => i.product_id)) + 1,
      price: item.price || 0,
      qty: item.qty || 0,
      restockThreshold: item.restockThreshold || 3,
      restockQty: item.restockQty || 10,
      unit: item.unit || "pcs",
    };
    setInventory((prev) => [...prev, newItem]);
    return newItem;
  };

  // Create a new purchase request
  const createPurchaseRequest = (requestData) => {
    // Check if item exists in inventory by name (case insensitive)
    const existingItem = inventory.find(
      (item) => item.name.toLowerCase() === requestData.item.toLowerCase()
    );

    let productId = existingItem ? existingItem.product_id : null;

    // If item doesn't exist, add it to inventory
    if (!existingItem) {
      const newItem = {
        name: requestData.item,
        qty: 0, // Start with 0 quantity since we're requesting it
        price: requestData.price || 0,
        unit: requestData.unit || "pcs",
        restockThreshold: 3, // Default threshold
        restockQty: 10, // Default restock quantity
      };
      const addedItem = addNewInventoryItem(newItem);
      productId = addedItem.product_id;
    }

    // Create the purchase request
    const newRequest = {
      id: `PR-${Date.now()}`,
      item: requestData.item,
      quantity: requestData.quantity,
      unit: requestData.unit || "pcs",
      price: requestData.price || 0,
      total: requestData.quantity * (requestData.price || 0),
      purpose: requestData.purpose || "",
      neededBy: requestData.neededBy || "",
      product_id: productId,
      status: "PENDING",
      requestDate: new Date().toISOString().split("T")[0],
    };

    // Add to purchase requests
    setPurchaseRequests((prev) => [...prev, newRequest]);
    return newRequest;
  };

  return (
    <SystemContext.Provider
      value={{
        inventory,
        requisitions,
        purchaseOrders: getUserPOs("system", "OWNER"),
        purchaseRequests,
        createPurchaseRequest,
        suppliers,
        createRequisition,
        vpSignRequisition,
        custodianCheckInventory,
        createPurchaseOrder,
        receiveDelivery,
        updateInventory,
        updateInventoryItem,
        updateSupplier,
        addNewSupplier,
        addNewInventoryItem,
        deleteInventoryItem,
        purchaseStockDirect,
        completeDirectPurchase,
        vpSignPO,
        markPOReadyForDelivery,
        deleteSupplier,
        createPO,
        approveAndAssignPO,
        markAsPurchased,
        receiveItems,
        rateSupplier,
        prefillData,
        setPrefillData,
        furnitureStock,
        addFurnitureItems,
        updateFurnitureItem,
        deleteFurnitureItem,
        materialDispenseHistory,
        furnitureDispenseHistory,
        addMaterialDispense,
        addFurnitureDispense,
      }}
    >
      {children}
    </SystemContext.Provider>
  );
};

export const useSystem = () => useContext(SystemContext);
