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
  const [autoRestockedItems, setAutoRestockedItems] = usePersistedState(
    "autoRestockedItems",
    []
  );
  const [managers, setManagers] = usePersistedState("managers", []);
  
  // State for pre-filling forms from dashboard
  const [prefillData, setPrefillData] = useState(null);

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
  // Auto-create Requisition (when low stock)
  // -------------------------
  const autoCreateRequisition = (item) => {
    const newReq = {
      id: Date.now(),
      item: item.name,
      qty: item.restockQty,
      product_id: item.product_id,
      status: "PENDING APPROVAL",
      auto: true,
      history: ["Auto-generated due to low stock"],
      requestDate: new Date().toLocaleDateString(),
    };
    setRequisitions((prev) => [...prev, newReq]);
    setAutoRestockedItems((prev) => [
      ...prev,
      {
        product_id: item.product_id,
        name: item.name,
        restockQty: item.restockQty,
        autoCreatedAt: new Date().toLocaleTimeString(),
      },
    ]);
    console.log(`📄 Auto-Requisition Created for ${item.name}`);
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
    // Check if we have a valid product_id (not 0 or undefined)
    let itemId = product_id;
    let itemExists =
      !isNaN(product_id) &&
      product_id > 0 &&
      inventory.some((item) => item.product_id === product_id);

    // If item doesn't exist in inventory, add it
    if (!itemExists) {
      const newItem = {
        name: itemName,
        qty: 0, // Start with 0 since we're requesting it
        price: parseFloat(price) || 0,
        unit: "pcs", // Default unit, can be updated later
        restockThreshold: 3, // Default threshold
        restockQty: 10, // Default restock quantity
      };
      const addedItem = addNewInventoryItem(newItem);
      itemId = addedItem.product_id;
    }

    const newReq = {
      id: Date.now(),
      item: itemName,
      qty: parseInt(qty),
      product_id: itemId, // Use existing or new item ID
      price: parseFloat(price) || 0,
      status: "PENDING APPROVAL",
      history: [
        "Created by Department" +
          (supplier ? ` (Preferred Supplier: ${supplier.name})` : ""),
      ],
      requestDate: new Date().toLocaleDateString(),
      ...(supplier && { supplier }),
      ...additionalData, // Allow additional data like items array, notes, etc.
    };

    setRequisitions((prev) => [...prev, newReq]);
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
              status: isApproved ? "APPROVED_BY_VP" : "REJECTED",
              history: [
                ...r.history,
                isApproved ? "Signed by VP" : "Returned to Dept (Not Signed)",
              ],
            }
          : r
      )
    );
  };

  // -------------------------
  // Custodian checks inventory for approved RF (delivers if enough stock)
  // If stock becomes < threshold after delivery, auto-create RF
  // -------------------------
  const custodianCheckInventory = (reqId) => {
    const req = requisitions.find((r) => r.id === reqId);
    if (!req) return;
    const item = inventory.find((i) => i.product_id === req.product_id);
    if (!item) return;

    if (item.qty >= req.qty) {
      // Deduct stock
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

      // check threshold and auto-create RF if needed
      const newQty = item.qty - req.qty;
      if (newQty < item.restockThreshold) {
        // use the current item snapshot (before setInventory takes effect)
        autoCreateRequisition(item);
      }
    } else {
      // forward to purchasing
      setRequisitions((prev) =>
        prev.map((r) =>
          r.id === reqId
            ? {
                ...r,
                status: "FORWARDED_TO_PURCHASING",
                history: [
                  ...r.history,
                  "Insufficient stock. Forwarded to Purchasing",
                ],
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
    const req = requisitions.find((r) => r.id === reqId);
    if (!req) return;

    const newPO = {
      id: Date.now().toString(),
      reqId,
      item: req.item,
      product_id: req.product_id,
      qty: req.qty,
      supplier: supplierName,
      status: "PENDING_PO_APPROVAL",
      history: ["PO Created after Canvassing"],
      type: "RF_LINKED",
    };

    setPurchaseOrders((prev) => [...prev, newPO]);
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
                  ? "Signed by VP. Sent to Manager."
                  : "Unsigned. Returned.",
              ],
            }
          : po
      )
    );
  };

  // Mark PO as ready for delivery (after PDF generation)
  const markPOReadyForDelivery = (poId) => {
    setPurchaseOrders((prev) =>
      prev.map((po) =>
        po.id === poId || po.id?.toString() === poId?.toString()
          ? {
              ...po,
              status: "SENT TO MANAGER",
              history: [
                ...(po.history || []),
                "PO Generated. Ready for Delivery.",
              ],
            }
          : po
      )
    );
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
        id: Date.now().toString(),
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
        id: orderOrItems.id || Date.now().toString(),
        createdAt: orderOrItems.createdAt || new Date().toISOString(),
        status: orderOrItems.status || "SENT TO MANAGER",
        type: orderOrItems.type || "DIRECT_PURCHASE",
        history: [...(orderOrItems.history || []), "Direct Purchase Created"],
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
  const receiveDelivery = (poId, isDamaged = false) => {
    const po = purchaseOrders.find((p) => p.id === poId);
    if (!po) return;

    if (isDamaged) {
      setPurchaseOrders((prev) =>
        prev.map((p) =>
          p.id === poId
            ? {
                ...p,
                status: "RETURNED_TO_SUPPLIER",
                history: [...p.history, "Items Damaged. Returned to Supplier."],
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
            }
          : p
      )
    );

    // Update inventory for all PO types
    // Handle both items array format and single item format
    setInventory((prev) => {
      const updated = [...prev];

      if (po.items && Array.isArray(po.items) && po.items.length > 0) {
        // Multiple items format - update all items in one batch
        po.items.forEach((item) => {
          const productId = item.product_id || item.productId;
          const quantity = item.quantity || item.qty || 0;

          if (productId) {
            const itemIndex = updated.findIndex(
              (i) => i.product_id?.toString() === productId.toString()
            );
            if (itemIndex >= 0) {
              updated[itemIndex] = {
                ...updated[itemIndex],
                qty: (updated[itemIndex].qty || 0) + quantity,
              };
            }
          }
        });
      } else if (po.product_id && po.qty) {
        // Single item format (RF_LINKED)
        const itemIndex = updated.findIndex(
          (i) => i.product_id?.toString() === po.product_id?.toString()
        );
        if (itemIndex >= 0) {
          updated[itemIndex] = {
            ...updated[itemIndex],
            qty: (updated[itemIndex].qty || 0) + (po.qty || 0),
          };
        }
      }

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
        autoRestockedItems,
        createRequisition,
        vpSignRequisition,
        custodianCheckInventory,
        createPurchaseOrder,
        receiveDelivery,
        autoCreateRequisition,
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
      }}
    >
      {children}
    </SystemContext.Provider>
  );
};

export const useSystem = () => useContext(SystemContext);
