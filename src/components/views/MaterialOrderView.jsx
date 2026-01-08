import React, { useState, useEffect } from "react";
import { useSystem } from "../../context/SystemContext";
import { Plus, PackagePlus, Building2 } from "lucide-react";

// Helper function to convert numeric rating to text
const getRatingText = (rating) => {
  if (rating === null || rating === undefined) return '';
  // Convert to number in case it's a string
  const numRating = Number(rating);
  if (isNaN(numRating)) return '';
  
  if (numRating >= 4.5) return 'Excellent';
  if (numRating >= 3.5) return 'Good';
  if (numRating >= 2.5) return 'Average';
  return 'Needs Improvement';
};

// Helper function to format unit types with their abbreviations
const formatUnitType = (unit) => {
  if (!unit) return 'Unit';
  
  const unitMap = {
    'piece': 'Piece (pcs)',
    'pieces': 'Pieces (pcs)',
    'pcs': 'Pieces (pcs)',
    'meter': 'Meter (m)',
    'meters': 'Meters (m)',
    'm': 'Meters (m)',
    'kilogram': 'Kilogram (kg)',
    'kilograms': 'Kilograms (kg)',
    'kg': 'Kilograms (kg)',
    'liter': 'Liter (L)',
    'liters': 'Liters (L)',
    'l': 'Liters (L)',
    'gram': 'Gram (g)',
    'grams': 'Grams (g)',
    'g': 'Grams (g)',
    'box': 'Box (box)',
    'boxes': 'Boxes (box)',
    'pack': 'Pack (pk)',
    'packs': 'Packs (pk)',
    'pk': 'Packs (pk)',
    'set': 'Set (set)',
    'sets': 'Sets (set)',
    'bottle': 'Bottle (btl)',
    'bottles': 'Bottles (btl)',
    'btl': 'Bottles (btl)'
  };
  
  // Convert to lowercase and trim whitespace for matching
  const unitLower = unit.toLowerCase().trim();
  return unitMap[unitLower] || unit.charAt(0).toUpperCase() + unit.slice(1);
};

function MaterialOrderView() {
  const { 
    inventory, 
    purchaseStockDirect, 
    purchaseOrders,
    suppliers, 
    addNewSupplier,
    addNewInventoryItem,
    currentUser, // Get currentUser from the context
    prefillData,
    setPrefillData
  } = useSystem();
  
  // State for controlling form and modal visibility
  const [showCreateForm, setShowCreateForm] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  
  // Debug: Log when suppliers data changes
  useEffect(() => {
    console.log('Suppliers updated:', suppliers);
  }, [suppliers]);

  // Handle pre-filled data from dashboard
  useEffect(() => {
    if (prefillData && prefillData.type === 'PO' && prefillData.item) {
      const item = prefillData.item;
      console.log('PO prefill data:', item);
      console.log('Inventory:', inventory);
      const inventoryItem = inventory.find(i => i.product_id === item.product_id);
      console.log('Found inventory item:', inventoryItem);
      
      // Pre-fill the first item with the selected inventory item
      setItems([{
        productId: item.product_id,
        quantity: inventoryItem?.restockQty || item.restockQty || 1,
        unitPrice: '',
        showNewItemForm: false
      }]);
      // Clear prefill data after using it
      setPrefillData(null);
    }
  }, [prefillData, setPrefillData, inventory]);
  
  // Filter to show only direct purchase orders (created through this interface)
  const myOrders = purchaseOrders
    .filter(po => po.type === 'DIRECT_PURCHASE')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  // State for multiple items
  const [items, setItems] = useState([
    { productId: '', quantity: 1, unitPrice: '', showNewItemForm: false }
  ]);
  
  // Function to update an item in the items array
  const updateItem = (index, updates) => {
    setItems(prevItems => {
      const newItems = [...prevItems];
      newItems[index] = { ...newItems[index], ...updates };
      return newItems;
    });
  };
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [showNewSupplierForm, setShowNewSupplierForm] = useState(false);
  const [notes, setNotes] = useState('');
  
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    contact: '',
    email: ''
  });
  
  const [newItem, setNewItem] = useState({
    name: '',
    price: 0,
    qty: 1,
    unit: 'pcs',
    restockThreshold: 3,
    restockQty: 10
  });

  const handleAddSupplier = (e) => {
    e.preventDefault();
    if (!newSupplier.name) {
      alert('Please enter a supplier name');
      return;
    }
    
    const newSupplierObj = addNewSupplier({
      name: newSupplier.name,
      contact: newSupplier.contact,
      email: newSupplier.email
    });
    
    setSelectedSupplier(newSupplierObj.id);
    setNewSupplier({ name: '', contact: '', email: '' });
    setShowNewSupplierForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Filter out any empty items
    const validItems = items.filter(item => {
      // Check if productId is not empty and not the default placeholder
      const hasValidProductId = item.productId && item.productId !== '' && item.productId !== null;
      const hasValidQuantity = item.quantity && parseInt(item.quantity) > 0;
      return hasValidProductId && hasValidQuantity;
    });
    
    // Validate form
    if (validItems.length === 0) {
      alert('Please select an item from the dropdown and enter a valid quantity');
      return;
    }
    
    if (!selectedSupplier) {
      alert('Please select a supplier');
      return;
    }
    
    // Get supplier details
    const supplier = suppliers.find(s => s.id === selectedSupplier) || {};
    
    // Prepare order items with product details
    const orderItems = validItems.map(item => {
      const product = inventory.find(p => p.product_id.toString() === item.productId) || {};
      const quantity = parseInt(item.quantity) || 1;
      const unitPrice = parseFloat(item.unitPrice) || 0;
      
      return {
        product_id: item.productId,
        name: item.name || product.name || 'Unknown Product',
        quantity: quantity,
        unit_price: unitPrice,
        unit: product.unit || 'pcs',
        price: unitPrice,
        total: (quantity * unitPrice).toFixed(2)
      };
    });
    
    // Create a clean order object with all necessary fields including supplier details
    const cleanOrder = {
      type: 'DIRECT_PURCHASE',
      supplierId: selectedSupplier,
      supplier: supplier.name || 'Unknown Supplier',
      supplier_contact: supplier.contact || 'Not provided',
      supplierContact: supplier.contact || 'Not provided', // Add both snake_case and camelCase for compatibility
      supplier_email: supplier.email || 'Not provided',
      supplierEmail: supplier.email || 'Not provided', // Add both snake_case and camelCase for compatibility
      notes: notes || '',
      status: 'SENT_TO_MANAGER',
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.id || 'system',
      createdByName: currentUser?.name || 'System User',
      history: ['Direct Purchase Created']
    };
    
    console.log('Submitting order items:', orderItems);
    console.log('Order metadata:', cleanOrder);
    
    try {
      // Create the complete order object with items and all metadata
      const newOrder = {
        ...cleanOrder,
        items: orderItems
      };
      
      // Pass the complete order to purchaseStockDirect
      await purchaseStockDirect(newOrder);
      
      // Reset form
      setItems([{ productId: '', quantity: 1, unitPrice: '' }]);
      setSelectedSupplier('');
      setNotes('');
      
      alert('Material Order (PO) created successfully!');
    } catch (error) {
      console.error('Error creating material order:', error);
      alert('Failed to create material order. Please try again.');
    }
  };

  const handleAddNewItem = async (e, index) => {
    e.preventDefault();
    if (!newItem.name) return;
    
    try {
      // Check if item already exists in inventory (case insensitive)
      const existingItem = inventory.find(
        (item) => item.name.toLowerCase() === newItem.name.toLowerCase()
      );
      
      let addedItem;
      if (existingItem) {
        // Use existing item
        addedItem = existingItem;
      } else {
        // Immediately add the new item to inventory
        addedItem = addNewInventoryItem({
          name: newItem.name,
          price: parseFloat(newItem.price) || 0,
          qty: 0, // Start with 0 quantity
          unit: newItem.unit || 'pcs',
          restockThreshold: newItem.restockThreshold || 3,
          restockQty: newItem.restockQty || 10
        });
      }
      
      // Update the current item with the product (existing or new)
      updateItem(index, {
        productId: addedItem.product_id.toString(),
        quantity: newItem.qty || 1,
        unitPrice: parseFloat(newItem.price) || 0,
        showNewItemForm: false,
        name: addedItem.name // Store the name for display
      });
      
      // Add a new empty item for the next entry if this is the last item
      if (index === items.length - 1) {
        setItems(prevItems => [
          ...prevItems,
          { productId: '', quantity: 1, unitPrice: '', showNewItemForm: false }
        ]);
      }
      
      // Reset the new item form
      setNewItem({
        name: '',
        price: 0,
        qty: 1,
        unit: 'pcs',
        restockThreshold: 3,
        restockQty: 10
      });
    } catch (error) {
      console.error('Error adding new item:', error);
      alert('Failed to add new item. Please try again.');
    }
  };

  // Debugging output - check supplier ratings
  // Log suppliers when they change
  useEffect(() => {
    if (suppliers && suppliers.length > 0) {
      console.log('Suppliers with ratings:', suppliers.map(s => ({
        name: s.name, 
        rating: s.rating,
        ratingText: getRatingText(s.rating)
      })));
    }
  }, [suppliers]);

  // Function to handle viewing order details
  const handleViewOrder = (order) => {
    console.log('Viewing order:', order);
    
    // Ensure items is an array and handle cases where it might be an object
    let itemsArray = [];
    if (Array.isArray(order.items)) {
      itemsArray = order.items;
    } else if (order.items && typeof order.items === 'object') {
      // If items is an object, convert it to an array of its values
      itemsArray = Object.values(order.items);
    }

    // Transform the order data to match the expected structure
    const fullOrder = {
      ...order,
      // Map items to the expected format
      items: itemsArray.map(item => {
        // Get the product details from inventory if available
        const product = inventory.find(p => 
          p.product_id?.toString() === item.product_id?.toString() || 
          p.product_id?.toString() === item.productId?.toString()
        );

        // Calculate quantity and unit price with proper defaults
        const quantity = parseInt(item.qty || item.quantity || 1);
        const unitPrice = parseFloat(
          item.unit_price || 
          item.price || 
          item.unitPrice || 
          product?.price || 
          0
        );
        
        return {
          ...item,
          name: item.name || product?.name || `Item ${item.product_id || item.productId || ''}`,
          quantity: quantity,
          unitPrice: unitPrice,
          unit: item.unit || product?.unit || 'pcs',
          productId: item.product_id || item.productId || null,
          // Calculate total if not present
          total: item.total || (quantity * unitPrice).toFixed(2)
        };
      }),
      // Ensure supplier information is properly set with fallbacks
      supplier: order.supplier || (order.supplierId && suppliers.find(s => s.id === order.supplierId)?.name) || 'N/A',
      supplierId: order.supplier_id || order.supplierId || null,
      supplierContact: order.supplier_contact || 
                      order.supplierContact || 
                      (order.supplierId && suppliers.find(s => s.id === order.supplierId)?.contact) || 
                      'Not provided',
      supplierEmail: order.supplier_email || 
                    order.supplierEmail || 
                    (order.supplierId && suppliers.find(s => s.id === order.supplierId)?.email) || 
                    'Not provided'
    };
    
    console.log('Processed order:', fullOrder);
    setSelectedOrder(fullOrder);
    setShowOrderModal(true);
  };

  // Function to close the order modal
  const closeOrderModal = () => {
    setShowOrderModal(false);
    setSelectedOrder(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Material Orders</h2>
        <p className="text-slate-600">Create and manage your material purchase orders</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Form */}
        {showCreateForm && (
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border-2 border-slate-200 sticky top-24 h-full">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Plus size={20} className="text-indigo-600" /> 
              Create Material Order (PO)
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
                {items && items.map((item, index) => (
                  <div key={index} className="space-y-2 border-b pb-4 bg-blue-100 p-4 rounded-lg mb-4">
                    <div className="flex justify-between items-center">
                      <label className="block text-sm text-slate-500">
                        {index === 0 ? 'Select Item' : `Item ${index + 1}`}
                      </label>
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newItems = [...items];
                            newItems.splice(index, 1);
                            setItems(newItems);
                          }}
                          className="text-xs text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  <div className="text-right">
                    <button 
                      type="button"
                      onClick={() => {
                        const newItems = [...items];
                        newItems[index].showNewItemForm = true;
                        setItems(newItems);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm hover:underline focus:outline-none"
                    >
                      + Add New Item
                    </button>
                  </div>
                  
                  {item.showNewItemForm && (
                    <div className="space-y-3 p-3 bg-slate-50 rounded-md border mt-2">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Item Name</label>
                        <input 
                          type="text" 
                          value={newItem.name}
                          onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                          className="w-full border p-2 rounded text-sm"
                          placeholder="Enter item name"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Unit</label>
                          <select 
                            value={newItem.unit}
                            onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
                            className="w-full border p-2 rounded text-sm"
                          >
                            {/* Countable Items */}
                            <optgroup label="Countable">
                              <option value="pcs">Pieces (pcs)</option>
                              <option value="box">Boxes (box)</option>
                              <option value="pack">Packs (pack)</option>
                              <option value="bottle">Bottles (bottle)</option>
                              <option value="bag">Bags (bag)</option>
                              <option value="roll">Rolls (roll)</option>
                              <option value="set">Sets (set)</option>
                              <option value="pair">Pairs (pair)</option>
                              <option value="doz">Dozens (doz)</option>
                              <option value="sheet">Sheets (sheet)</option>
                              <option value="ea">Each (ea)</option>
                              <option value="case">Cases (case)</option>
                            </optgroup>
                            
                            {/* Length */}
                            <optgroup label="Length">
                              <option value="m">Meters (m)</option>
                              <option value="cm">Centimeters (cm)</option>
                              <option value="mm">Millimeters (mm)</option>
                              <option value="mm">Feet (ft)</option>
                            </optgroup>
                            
                            {/* Weight */}
                            <optgroup label="Weight">
                              <option value="kg">Kilograms (kg)</option>
                              <option value="g">Grams (g)</option>
                              <option value="mg">Milligrams (mg)</option>
                              <option value="lb">Pounds (lb)</option>
                            </optgroup>
                            
                            {/* Volume */}
                            <optgroup label="Volume">
                              <option value="L">Liters (L)</option>
                              <option value="mL">Milliliters (mL)</option>
                              <option value="gals">Gallons (gals)</option>
                            </optgroup>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Price</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-slate-500 text-sm">₱</span>
                            </div>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={newItem.price === 0 ? '' : newItem.price}
                              onChange={(e) => setNewItem({...newItem, price: e.target.value ? parseFloat(e.target.value) : 0})}
                              className="w-full border p-2 pl-8 rounded text-sm"
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Restock At</label>
                          <input 
                            type="number" 
                            min="1"
                            value={newItem.restockThreshold}
                            onChange={(e) => setNewItem({...newItem, restockThreshold: parseInt(e.target.value) || 0})}
                            className="w-full border p-2 rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Restock Qty</label>
                          <input 
                            type="number" 
                            min="1"
                            value={newItem.restockQty}
                            onChange={(e) => setNewItem({...newItem, restockQty: parseInt(e.target.value) || 0})}
                            className="w-full border p-2 rounded text-sm"
                          />
                        </div>
                        <div className="flex items-end gap-2 col-span-2">
                          <button 
                            type="button"
                            onClick={() => {
                              const newItems = [...items];
                              newItems[index].showNewItemForm = false;
                              setItems(newItems);
                              setNewItem({
                                name: '',
                                price: 0,
                                qty: 1,
                                unit: 'pcs',
                                restockThreshold: 3,
                                restockQty: 10
                              });
                            }}
                            className="flex-1 bg-white text-slate-700 border border-slate-300 py-2 rounded text-sm hover:bg-slate-50 transition"
                          >
                            Cancel
                          </button>
                          <button 
                            type="button"
                            onClick={(e) => handleAddNewItem(e, index)}
                            className="flex-1 bg-green-600 text-white py-2 rounded text-sm hover:bg-green-700 transition"
                            disabled={!newItem.name.trim()}
                          >
                            Add Item
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                <select 
                  value={item.productId} 
                  onChange={e => {
                    const newItems = [...items];
                    const productId = e.target.value;
                    newItems[index].productId = productId;
                    
                    // Auto-set unit price to match inventory price (1:1 ratio)
                    if (productId) {
                      const selectedProduct = inventory.find(p => p.product_id.toString() === productId);
                      if (selectedProduct) {
                        newItems[index].unitPrice = selectedProduct.price || 0;
                      } else {
                        // Check if it's a temporary item
                        const tempItem = items.find(item => item.productId === productId);
                        if (tempItem && tempItem.name) {
                          newItems[index].unitPrice = tempItem.unitPrice || 0;
                        }
                      }
                    }
                    
                    setItems(newItems);
                  }} 
                  className="w-full border p-2 rounded text-sm"
                  required
                >
                  <option value=''>-- Choose Item --</option>
                  {/* Include inventory items */}
                  {inventory.map(i => (
                    <option key={`inventory-${i.product_id}`} value={i.product_id}>
                      {i.name} (Stock: {i.qty} {i.unit})
                    </option>
                  ))}
                  {/* Include temporary items from current form that aren't already in inventory */}
                  {items
                    .filter(formItem => 
                      formItem.productId && 
                      formItem.productId.toString().startsWith('temp-') &&
                      !inventory.some(invItem => invItem.product_id.toString() === formItem.productId.toString())
                    )
                    .map(formItem => (
                      <option key={`temp-${formItem.productId}`} value={formItem.productId}>
                        {formItem.name} (New Item)
                      </option>
                    ))}
                </select>

                  <div className="mt-2">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block text-xs text-slate-500 mb-1">Quantity</label>
                        <input 
                          type="number" 
                          min="1" 
                          value={item.quantity} 
                          onChange={e => {
                            const newItems = [...items];
                            newItems[index].quantity = e.target.value;
                            setItems(newItems);
                          }} 
                          className="w-full border p-2 rounded text-sm"
                          required
                          placeholder="Quantity"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs text-slate-500 mb-1">Unit Price</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-slate-500 text-sm">₱</span>
                          </div>
                          <input 
                            type="number" 
                            min="0" 
                            step="0.01"
                            value={item.unitPrice} 
                            onChange={e => {
                              const newItems = [...items];
                              newItems[index].unitPrice = e.target.value;
                              setItems(newItems);
                            }} 
                            className="w-full border p-2 pl-8 rounded text-sm"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {index === items.length - 1 && (
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setItems([...items, { productId: '', quantity: 1, unitPrice: '' }]);
                        }}
                        className="w-full flex items-center justify-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 py-1 border border-dashed border-indigo-200 rounded-md hover:bg-indigo-50 transition-colors"
                      >
                        <Plus size={14} /> Add Another Item
                      </button>
                    </div>
                  )}
                </div>
              ))}
              
              {/* Supplier Selection */}
              <div className="mt-6 pt-4 border-t border-slate-200">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Supplier
                  </label>
                  {!showNewSupplierForm && (
                    <button
                      type="button"
                      onClick={() => setShowNewSupplierForm(true)}
                      className="text-blue-600 hover:text-blue-800 text-sm hover:underline focus:outline-none"
                    >
                      + Add New Supplier
                    </button>
                  )}
                </div>
                
                {!showNewSupplierForm ? (
                  <select
                    value={selectedSupplier}
                    onChange={(e) => setSelectedSupplier(e.target.value)}
                    className="w-full border p-2 rounded text-sm"
                    required
                  >
                    <option value="">-- Select Supplier --</option>
                    {suppliers.map(supplier => {
                      const rating = parseFloat(supplier.rating);
                      const displayRating = !isNaN(rating) && rating > 0 ? `★ ${rating.toFixed(1)}` : '';
                      return (
                        <option key={supplier.id} value={supplier.id}>
                          {supplier.name} (Contact: {supplier.contact || 'N/A'}, Email: {supplier.email || 'N/A'}) {displayRating}
                        </option>
                      );
                    })}
                  </select>
                ) : (
                  <div className="space-y-4 p-5 bg-blue-100 rounded-lg border border-blue-200 shadow-sm">
                    <h4 className="font-medium text-blue-800 text-sm">Add New Supplier</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Name *</label>
                        <input
                          type="text"
                          value={newSupplier.name}
                          onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
                          className="w-full border p-2 rounded text-sm"
                          placeholder="Supplier name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Contact Number</label>
                        <input
                          type="tel"
                          value={newSupplier.contact}
                          onChange={(e) => setNewSupplier({...newSupplier, contact: e.target.value})}
                          className="w-full border p-2 rounded text-sm"
                          placeholder="Phone number"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs text-slate-500 mb-1">Email</label>
                        <input
                          type="email"
                          value={newSupplier.email}
                          onChange={(e) => setNewSupplier({...newSupplier, email: e.target.value})}
                          className="w-full border p-2 rounded text-sm"
                          placeholder="Email address"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-4 mt-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewSupplierForm(false);
                          setNewSupplier({ name: '', contact: '', email: '' });
                        }}
                        className="text-sm text-slate-600 hover:text-slate-800 hover:underline"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleAddSupplier}
                        disabled={!newSupplier.name.trim()}
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline disabled:opacity-50 disabled:no-underline"
                      >
                        Add Supplier
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Notes */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border p-2 rounded text-sm h-20"
                  placeholder="Any special instructions or notes..."
                />
              </div>
              
              {/* Submit Button */}
              <div className="mt-6">
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Create Material Order
                </button>
              </div>
            </div>
            </form>
          </div>
        </div>
        )}

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* My Orders Section */}
          <div>
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="p-4 border-b bg-slate-50">
                <h3 className="font-bold">My Orders</h3>
              </div>
              <div>
                {myOrders.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">No orders found.</div>
                ) : (
                  <div className="divide-y">
                    {myOrders.map(order => (
                      <div key={order.id} className="p-4 hover:bg-slate-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-sm font-medium text-slate-700 mb-1">
                              Supplier: {order.supplier || 'N/A'}
                            </div>
                            <div className="text-sm text-slate-600">
                              {order.items && order.items.length > 0 ? (
                                order.items.map((item, idx) => (
                                  <div key={idx} className="mt-1">
                                    {item.quantity} × {item.name || `Item ${item.product_id}`}
                                  </div>
                                ))
                              ) : (
                                <div className="text-slate-400">No items</div>
                              )}
                            </div>
                            <div className="text-xs text-slate-400 mt-1">
                              {new Date(order.createdAt).toLocaleString()}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              order.status === 'SENT_TO_MANAGER' 
                                ? 'bg-blue-50 text-blue-800' // Light blue background, dark blue text (matching PENDING APPROVAL style)
                                : order.status === 'REJECTED' || order.status === 'RETURNED_TO_PURCHASING'
                                ? 'bg-red-50 text-red-800'  // Light red background, dark red text
                                : order.status === 'APPROVED' || order.status === 'COMPLETED' || order.status === 'PO_GENERATED'
                                ? 'bg-green-50 text-green-800' // Light green background, dark green text
                                : 'bg-yellow-50 text-yellow-800' // Light yellow background, dark yellow text
                            }`}>
                              {order.status.replace(/_/g, ' ')}
                            </span>
                            <div className="text-xs text-slate-500 mt-1">
                              {order.history?.[order.history.length - 1] || 'Order created'}
                            </div>
                            <button
                              onClick={() => handleViewOrder(order)}
                              className="mt-2 px-3 py-1 text-sm text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* About Material Orders Section */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-4 border-b bg-slate-50">
              <h3 className="font-bold">About Material Orders (PO)</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h4 className="font-semibold text-blue-800 mb-2">Direct Purchase Order</h4>
                <p className="text-sm text-slate-600">
                  This is a direct purchase order that will be processed immediately without requiring approval. 
                  Use this for urgent or small purchases that don't need management approval.
                </p>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold">How to create a Material Order:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-slate-600">
                  <li>Select an item from the inventory or add a new one</li>
                  <li>Enter the quantity needed</li>
                  <li>Select a supplier or add a new one</li>
                  <li>Add any special notes if needed</li>
                  <li>Click "Create Material Order" to submit</li>
                </ol>
              </div>
              
              <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-100">
                <h4 className="font-semibold text-amber-800 mb-2">Note</h4>
                <p className="text-sm text-slate-600">
                  This order will be sent directly to the purchasing department for processing. 
                  You can track its status in the dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold">Order Details</h3>
                  <p className="text-sm text-slate-500">
                    {selectedOrder.type === 'DIRECT_PURCHASE' ? 'Direct Purchase Order' : 'Purchase Order'}
                  </p>
                </div>
                <button 
                  onClick={closeOrderModal}
                  className="text-slate-500 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-slate-700">Order ID</h4>
                    <p className="text-sm text-slate-500">{selectedOrder.id || 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-700">Status</h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedOrder.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      selectedOrder.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                      selectedOrder.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedOrder.status || 'UNKNOWN'}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-700">Created</h4>
                    <p className="text-sm text-slate-500">
                      {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-700">Created By</h4>
                    <p className="text-sm text-slate-500">
                      Department Head
                    </p>
                  </div>
                </div>

                {/* Supplier Details */}
                <div className="border-t border-b border-slate-200 py-4">
                  <h4 className="font-medium text-slate-800 mb-3">Supplier Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h5 className="text-sm font-medium text-slate-600">Supplier Name</h5>
                      <p className="text-sm text-slate-500">{selectedOrder.supplier || 'N/A'}</p>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-slate-600">Contact</h5>
                      <p className="text-sm text-slate-500">
                        {selectedOrder.contact || selectedOrder.supplier_contact || selectedOrder.supplierContact || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-slate-600">Email</h5>
                      <p className="text-sm text-slate-500">
                        {selectedOrder.email || selectedOrder.supplier_email || selectedOrder.supplierEmail || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-b border-slate-200 py-4">
                  <h4 className="font-medium text-slate-800 mb-3">Order Items</h4>
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-12 gap-2 text-sm font-medium text-slate-500 pb-2 border-b-2 border-slate-200">
                        <div className="col-span-5">Item</div>
                        <div className="col-span-1 text-center">Unit Type</div>
                        <div className="col-span-2 text-right">Unit Price</div>
                        <div className="col-span-2 text-center">Qty</div>
                        <div className="col-span-2 text-right">Total</div>
                      </div>
                      
                      {selectedOrder.items.map((item, index) => {
                        const quantity = Number(item.quantity) || 1; 
                        const unitPrice = Number(item.unitPrice) || 0;
                        const total = quantity * unitPrice;
                        
                        return (
                          <div key={index} className="grid grid-cols-12 gap-2 items-center py-2 border-b border-slate-200 last:border-0">
                            <div className="col-span-5">
                              <p className="font-medium text-slate-800">{item.name || `Item #${index + 1}`}</p>
                              {item.productId && (
                                <p className="text-xs text-slate-500">ID: {item.productId}</p>
                              )}
                            </div>
                            <div className="col-span-1 text-center">
                              <p className="text-slate-800">{formatUnitType(item.unit)}</p>
                            </div>
                            <div className="col-span-2 text-right">
                              <p className="text-slate-800">₱{unitPrice.toFixed(2)}</p>
                            </div>
                            <div className="col-span-2 text-center">
                              <p className="text-slate-800">{quantity}</p>
                            </div>
                            <div className="col-span-2 text-right">
                              <p className="font-medium text-slate-900">₱{total.toFixed(2)}</p>
                            </div>
                          </div>
                        );
                      })}
                      
                      {/* Order Total */}
                      <div className="border-t-2 border-slate-200 pt-3 mt-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Order Total:</span>
                          <span className="text-lg font-semibold">
                            ₱{selectedOrder.items.reduce((sum, item) => {
                              const qty = Number(item.quantity) || 1;
                              const price = Number(item.unitPrice) || 0;
                              return sum + (qty * price);
                            }, 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="mt-2 pt-2 border-t-2 border-slate-100">
                          <div className="font-medium mb-1">Notes (Optional):</div>
                          <div className="text-sm text-slate-600 bg-slate-50 p-2 rounded">
                            {selectedOrder.notes || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">No items in this order.</p>
                  )}
                </div>

                {/* Order History */}
                {selectedOrder.history && selectedOrder.history.length > 0 && (
                  <div className="border-b border-slate-200 pb-4">
                    <h4 className="font-medium text-slate-700 mb-2">Order History</h4>
                    <div className="space-y-2 text-sm">
                      {selectedOrder.history.map((entry, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-2 bg-slate-50 rounded">
                          <div className="flex-shrink-0 w-2 h-2 mt-1.5 rounded-full bg-blue-500"></div>
                          <div>
                            <div className="font-medium">
                              {typeof entry === 'string' ? entry : (entry.status || 'Status Update')}
                            </div>
                            <div className="text-xs text-slate-500">
                              {typeof entry === 'object' && entry.timestamp ? new Date(entry.timestamp).toLocaleString() : 
                               typeof entry === 'string' ? '' : 'Unknown date'}
                              {typeof entry === 'object' && entry.userName && ` • ${entry.userName}`}
                            </div>
                            {typeof entry === 'object' && entry.notes && (
                              <div className="mt-1 text-sm text-slate-600">{entry.notes}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={closeOrderModal}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MaterialOrderView;
