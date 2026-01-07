import React, { useState } from 'react';
import { useSystem } from '../../context/SystemContext';
import { Edit, Save, X, Plus } from 'lucide-react';

export default function ManagementView() {
  const { 
    inventory, 
    updateInventoryItem,
    deleteInventoryItem,
    suppliers,
    updateSupplier,
    addNewInventoryItem,
    addNewSupplier,
    deleteSupplier
  } = useSystem();

  const [editingItem, setEditingItem] = useState(null);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [newItem, setNewItem] = useState({
    name: '',
    price: 0,
    unit: 'pcs',
    restockThreshold: 3,
    restockQty: 10
  });

  const [newSupplier, setNewSupplier] = useState({
    name: '',
    contact: '',
    email: ''
  });

  const handleItemUpdate = (e) => {
    e.preventDefault();
    if (!editingItem.name) return;
    
    updateInventoryItem(editingItem);
    setEditingItem(null);
  };

  const handleSupplierUpdate = (e) => {
    e.preventDefault();
    if (!editingSupplier.name) return;
    
    updateSupplier(editingSupplier);
    setEditingSupplier(null);
  };

  const handleAddNewItem = (e) => {
    e.preventDefault();
    if (!newItem.name) return;
    
    addNewInventoryItem({
      ...newItem,
      qty: 0,
      price: parseFloat(newItem.price) || 0,
      restockThreshold: parseInt(newItem.restockThreshold) || 3,
      restockQty: parseInt(newItem.restockQty) || 10
    });
    
    setNewItem({
      name: '',
      price: 0,
      unit: 'pcs',
      restockThreshold: 3,
      restockQty: 10
    });
  };

  const handleAddNewSupplier = (e) => {
    e.preventDefault();
    if (!newSupplier.name) return;
    
    addNewSupplier({
      ...newSupplier,
      id: `supplier-${Date.now()}`,
      rating: '' // Default empty rating
    });
    
    setNewSupplier({
      name: '',
      contact: '',
      email: ''
    });
  };
  
  const handleDeleteItem = (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      deleteInventoryItem(itemId);
    }
  };
  
  const handleDeleteSupplier = (supplierId) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      deleteSupplier(supplierId);
    }
  };

  // Helper function to get color class based on rating
  const getRatingColor = (rating) => {
    switch(rating) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'average': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

   return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-slate-800">Management</h2>
      
      {/* Items Management */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-4 border-b bg-slate-50">
          <h3 className="font-semibold">Manage Items</h3>
        </div>
        
        <div className="p-4">
          <form onSubmit={handleAddNewItem} className="mb-6 p-4 bg-slate-50 rounded-lg border">
            <h4 className="font-medium text-sm text-slate-700 mb-3 flex items-center gap-2">
              <Plus size={16} /> Add New Item
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
              <div className="md:col-span-2">
                <input
                  type="text"
                  placeholder="Item Name"
                  className="w-full border p-2 rounded text-sm"
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-500 text-sm">₱</span>
                  </div>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    placeholder="Price"
                    className="w-full border p-2 pl-8 rounded text-sm"
                    value={newItem.price === 0 ? '' : newItem.price}
                    onChange={(e) => setNewItem({...newItem, price: e.target.value ? parseFloat(e.target.value) : 0})}
                    required
                  />
                </div>
              </div>
              <div className="md:col-span-1">
                <select
                  className="w-full border p-2 rounded text-sm"
                  value={newItem.unit}
                  onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
                >
                  {/* Countable Items (most commonly used) */}
                  <optgroup label="Countable Items">
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
                    <option value="ft">Feet (ft)</option>
                  </optgroup>
                  
                  {/* Weight */}
                  <optgroup label="Weight">
                    <option value="kg">Kilograms (kg)</option>
                    <option value="g">Grams (g)</option>
                    <option value="mg">Milligrams (mg)</option>
                    <option value="lb">Pounds (lb)</option>
                  </optgroup>
                  
                  {/* Volume (least commonly used) */}
                  <optgroup label="Volume">
                    <option value="L">Liters (L)</option>
                    <option value="mL">Milliliters (mL)</option>
                    <option value="gals">Gallons (gals)</option>
                  </optgroup>
                </select>
              </div>
              <div>
                <input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Restock At"
                  className="w-full border p-2 rounded text-sm"
                  value={newItem.restockThreshold || ''}
                  onChange={(e) => setNewItem({...newItem, restockThreshold: e.target.value ? parseInt(e.target.value) : ''})}
                  required
                />
              </div>
              <div>
                <input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Restock Qty"
                  className="w-full border p-2 rounded text-sm"
                  value={newItem.restockQty || ''}
                  onChange={(e) => setNewItem({...newItem, restockQty: e.target.value ? parseInt(e.target.value) : ''})}
                  required
                />
              </div>
              <div className="flex gap-2">
                <button 
                  type="submit" 
                  className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 flex-1 flex items-center justify-center gap-1"
                >
                  <Plus size={16} /> Add
                </button>
              </div>
            </div>
          </form>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr className="border-b">
                  <th className="p-3">Item Name</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Unit</th>
                  <th className="p-3">Restock At</th>
                  <th className="p-3">Restock Qty</th>
                  <th className="p-3 w-20">Actions</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map(item => (
                  <tr key={item.product_id} className="border-b hover:bg-slate-50">
                    {editingItem?.product_id === item.product_id ? (
                      <>
                        <td className="p-3">
                          <input
                            type="text"
                            className="w-full border p-1 rounded text-sm pr-20"
                            value={editingItem.name}
                            onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            className="w-full border p-1 rounded text-sm pr-20"
                            value={editingItem.price}
                            onChange={(e) => setEditingItem({...editingItem, price: parseFloat(e.target.value) || 0})}
                          />
                        </td>
                        <td className="p-3">
                          <select
                            className="w-full border p-1 rounded text-sm pr-20"
                            value={editingItem.unit}
                            onChange={(e) => setEditingItem({...editingItem, unit: e.target.value})}
                          >
                            {/* Countable Items (most commonly used) */}
                            <optgroup label="Countable Items">
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
                              <option value="ft">Feet (ft)</option>
                              <option value="in">Inches (in)</option>
                              <option value="yd">Yards (yd)</option>
                            </optgroup>
                            
                            {/* Weight */}
                            <optgroup label="Weight">
                              <option value="kg">Kilograms (kg)</option>
                              <option value="g">Grams (g)</option>
                              <option value="mg">Milligrams (mg)</option>
                              <option value="lb">Pounds (lb)</option>
                              <option value="oz">Ounces (oz)</option>
                            </optgroup>
                            
                            {/* Volume (least commonly used) */}
                            <optgroup label="Volume">
                              <option value="L">Liters (L)</option>
                              <option value="mL">Milliliters (mL)</option>
                              <option value="gals">Gallons (gals)</option>
                              <option value="pt">Pints (pt)</option>
                              <option value="qt">Quarts (qt)</option>
                            </optgroup>
                          </select>
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            min="0"
                            className="w-full border p-1 rounded text-sm pr-20"
                            value={editingItem.restockThreshold}
                            onChange={(e) => setEditingItem({...editingItem, restockThreshold: parseInt(e.target.value) || 0})}
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            min="0"
                            className="w-full border p-1 rounded text-sm pr-20"
                            value={editingItem.restockQty}
                            onChange={(e) => setEditingItem({...editingItem, restockQty: parseInt(e.target.value) || 0})}
                          />
                        </td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            <button
                              onClick={handleItemUpdate}
                              className="p-1 text-green-600 hover:text-green-800"
                              title="Save"
                            >
                              <Save size={16} />
                            </button>
                            <button
                              onClick={() => setEditingItem(null)}
                              className="p-1 text-red-600 hover:text-red-800"
                              title="Cancel"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="p-3">{item.name}</td>
                        <td className="p-3">₱{item.price?.toFixed(2) || '0.00'}</td>
                        <td className="p-3">{item.unit}</td>
                        <td className="p-3">{item.restockThreshold}</td>
                        <td className="p-3">{item.restockQty}</td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingItem({...item})}
                              className="p-1 text-blue-600 hover:text-blue-800"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.product_id)}
                              className="p-1 text-red-600 hover:text-red-800"
                              title="Delete"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Suppliers Management */}
      <div className="bg-white rounded-xl shadow-sm border mt-8">
        <div className="p-4 border-b bg-slate-50">
          <h3 className="font-semibold">Manage Suppliers</h3>
        </div>
        
        <div className="p-4">
          <form onSubmit={handleAddNewSupplier} className="mb-6 p-4 bg-slate-50 rounded-lg border">
            <h4 className="font-medium text-sm text-slate-700 mb-3 flex items-center gap-2">
              <Plus size={16} /> Add New Supplier
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-1">
                <input
                  type="text"
                  placeholder="Supplier Name"
                  className="w-full border p-2 rounded text-sm"
                  value={newSupplier.name}
                  onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
                  required
                />
              </div>
              <div className="md:col-span-1">
                <input
                  type="text"
                  placeholder="Contact Person"
                  className="w-full border p-2 rounded text-sm"
                  value={newSupplier.contact}
                  onChange={(e) => setNewSupplier({...newSupplier, contact: e.target.value})}
                />
              </div>
              <div className="md:col-span-1">
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full border p-2 rounded text-sm"
                  value={newSupplier.email}
                  onChange={(e) => setNewSupplier({...newSupplier, email: e.target.value})}
                />
              </div>
              <div className="md:col-span-1 flex gap-2">
                <button 
                  type="submit" 
                  className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 flex-1 flex items-center justify-center gap-1"
                >
                  <Plus size={16} /> Add
                </button>
              </div>
            </div>
          </form>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr className="border-b">
                  <th className="p-3">Supplier Name</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Rating</th>
                  <th className="p-3 w-20">Actions</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map(supplier => (
                  <tr key={supplier.id} className="border-b hover:bg-slate-50">
                    {editingSupplier?.id === supplier.id ? (
                      <>
                        <td className="p-3">
                          <input
                            type="text"
                            className="w-full border p-1 rounded text-sm pr-20"
                            value={editingSupplier.name}
                            onChange={(e) => setEditingSupplier({...editingSupplier, name: e.target.value})}
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="text"
                            className="w-full border p-1 rounded text-sm pr-20"
                            value={editingSupplier.contact || ''}
                            onChange={(e) => setEditingSupplier({...editingSupplier, contact: e.target.value})}
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="email"
                            className="w-full border p-1 rounded text-sm pr-20"
                            value={editingSupplier.email || ''}
                            onChange={(e) => setEditingSupplier({...editingSupplier, email: e.target.value})}
                          />
                        </td>
                        <td className="p-3">
                          <select
                            className="w-full border p-1 rounded text-sm pr-20"
                            value={editingSupplier.rating || ''}
                            onChange={(e) => setEditingSupplier({...editingSupplier, rating: e.target.value})}
                          >
                            <option value="">Select Rating</option>
                            <option value="excellent">Excellent</option>
                            <option value="good">Good</option>
                            <option value="average">Average</option>
                            <option value="poor">Poor</option>
                          </select>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            <button
                              onClick={handleSupplierUpdate}
                              className="p-1 text-green-600 hover:text-green-800"
                              title="Save"
                            >
                              <Save size={16} />
                            </button>
                            <button
                              onClick={() => setEditingSupplier(null)}
                              className="p-1 text-red-600 hover:text-red-800"
                              title="Cancel"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="p-3">{supplier.name}</td>
                        <td className="p-3">{supplier.contact || '-'}</td>
                        <td className="p-3">{supplier.email || '-'}</td>
                        <td className="p-3">
                          <select
                            className={`text-xs font-medium px-2.5 py-1 rounded-full ${getRatingColor(supplier.rating)} border-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-200`}
                            value={supplier.rating || ''}
                            onChange={(e) => {
                              updateSupplier({
                                ...supplier,
                                rating: e.target.value || undefined
                              });
                            }}
                          >
                            <option value="">Set Rating</option>
                            <option value="excellent">Excellent</option>
                            <option value="good">Good</option>
                            <option value="average">Average</option>
                            <option value="poor">Poor</option>
                          </select>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingSupplier({...supplier})}
                              className="p-1 text-blue-600 hover:text-blue-800"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteSupplier(supplier.id)}
                              className="p-1 text-red-600 hover:text-red-800"
                              title="Delete"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    );
}
