import React, { useState } from 'react';
import { Package, Filter, Plus, Edit, PackageOpen } from 'lucide-react';
import { useSystem } from '../../context/SystemContext';
import EditFurnitureStock from './EditFurnitureStock';

export default function FurnitureStock() {
  const { furnitureStock, updateFurnitureItem, addFurnitureDispense } = useSystem();
  const [selectedType, setSelectedType] = useState('');
  const [stockStatusFilter, setStockStatusFilter] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [dispenseModal, setDispenseModal] = useState({ isOpen: false, item: null, quantity: '', soldTo: '' });

  // If furnitureStock is undefined or empty, show a message
  if (!furnitureStock || furnitureStock.length === 0) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Package size={20} className="text-indigo-600" />
              Furniture Stock
            </h2>
          </div>
          <div className="text-center py-12">
            <Package size={48} className="text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">No furniture items found</p>
            <p className="text-slate-400 text-sm mt-2">
              Use "Add Furniture Stock" feature to add furniture items
            </p>
          </div>
        </div>
      </div>
    );
  }

  const furnitureTypes = [
    'Seating (e.g., chairs, sofas, stools)',
    'Sleeping (e.g., beds, cribs)',
    'Storage (e.g., wardrobes, dressers, shelves, cabinets)',
    'Surfaces/Tables (e.g., dining tables, coffee tables, desks)',
    'Decorative/Other (e.g., mirrors, clocks, room dividers)'
  ];
  
  // Extract main type from full description
  const getMainType = (fullType) => {
    return fullType.split(' ')[0]; // Get first word before the parenthesis
  };

  // Filter furniture items by selected type and stock status
  const filteredItems = furnitureStock.filter(item => {
    // Type filter
    let passesTypeFilter = true;
    if (selectedType) {
      const itemMainType = getMainType(item.type);
      const selectedMainType = getMainType(selectedType);
      passesTypeFilter = itemMainType === selectedMainType;
    }
    
    // Stock status filter
    let passesStockStatusFilter = true;
    if (stockStatusFilter) {
      const stockLevel = item.quantity || 0;
      const restockThreshold = item.restockThreshold || 3;
      passesStockStatusFilter = (
        stockStatusFilter === 'in_stock' && stockLevel >= restockThreshold ||
        stockStatusFilter === 'low_stock' && stockLevel > 0 && stockLevel < restockThreshold ||
        stockStatusFilter === 'out_of_stock' && stockLevel === 0
      );
    }
    
    return passesTypeFilter && passesStockStatusFilter;
  });

  // Handle edit action
  const handleEdit = (item) => {
    setEditingItem(item);
  };

  // Handle dispense action
  const handleDispense = (item) => {
    setDispenseModal({ isOpen: true, item, quantity: '', soldTo: '' });
  };

  // Handle dispense confirmation
  const handleConfirmDispense = () => {
    const { item, quantity, soldTo } = dispenseModal;
    const dispenseQty = parseInt(quantity);
    
    console.log('Furniture dispense - item:', item);
    console.log('Furniture dispense - current quantity:', item.quantity);
    console.log('Furniture dispense - dispenseQty:', dispenseQty);
    
    if (!dispenseQty || dispenseQty <= 0) {
      alert('Please enter a valid quantity');
      return;
    }
    
    if (!soldTo || soldTo.trim() === '') {
      alert('Please enter who the furniture was sold to');
      return;
    }
    
    if (dispenseQty > (item.quantity || 0)) {
      alert('Cannot dispense more than available stock');
      return;
    }
    
    // Update furniture item quantity
    const newQuantity = (item.quantity || 0) - dispenseQty;
    
    console.log('Furniture dispense - new quantity:', newQuantity);
    
    updateFurnitureItem(item.id, { quantity: newQuantity });
    
    // Add dispense record to history
    const unitPrice = item.price || 0;
    const totalPrice = dispenseQty * unitPrice;
    
    addFurnitureDispense({
      itemName: item.name,
      itemId: item.id,
      quantity: dispenseQty,
      unitPrice: unitPrice,
      totalPrice: totalPrice,
      soldTo: soldTo,
      remainingStock: newQuantity,
      dispensedBy: 'Current User' // You can get this from auth context if needed
    });
    
    // Close modal and reset
    setDispenseModal({ isOpen: false, item: null, quantity: '', soldTo: '' });
    
    alert(`Successfully dispensed ${dispenseQty} ${item.name} to ${soldTo}`);
  };

  // Handle cancel dispense
  const handleCancelDispense = () => {
    setDispenseModal({ isOpen: false, item: null, quantity: '', soldTo: '' });
  };

  // Handle close edit modal
  const handleCloseEdit = () => {
    setEditingItem(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Package size={20} className="text-indigo-600" />
            Furniture Stock
          </h2>
        </div>

        {/* Furniture Type and Stock Status Filters */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Filter size={16} className="inline mr-2" />
              Furniture Types
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">-- Select Furniture Type --</option>
              {furnitureTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          
          <div className="md:w-64">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Package size={16} className="inline mr-2" />
              Stock Status
            </label>
            <select
              value={stockStatusFilter}
              onChange={(e) => setStockStatusFilter(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">-- All Statuses --</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>
        </div>

        {/* Furniture Items Table */}
        {filteredItems.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="text-slate-500 bg-slate-100 border-b border-slate-200 text-xs uppercase tracking-wide">
                  <th className="py-3 px-4 text-center">Item Name</th>
                  <th className="py-3 px-4 text-center">Type</th>
                  <th className="py-3 px-4 text-center">Material</th>
                  <th className="py-3 px-4 text-center">Quantity</th>
                  <th className="py-3 px-4 text-center">Price</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item, index) => (
                  <tr key={item.id} className={`border-b border-slate-100 ${index % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-slate-100 transition`}>
                    <td className="py-3 px-4 text-slate-700 font-medium text-center">{item.name}</td>
                    <td className="py-3 px-4 text-slate-700 text-center">{getMainType(item.type)}</td>
                    <td className="py-3 px-4 text-slate-700 text-center">{item.material}</td>
                    <td className="py-3 px-4 text-slate-700 text-center">{item.quantity}</td>
                    <td className="py-3 px-4 text-slate-700 text-center">₱{item.price ? parseFloat(item.price).toFixed(2) : '0.00'}</td>
                    <td className="py-3 px-4 text-center">
                      {item.status === 'Out of Stock' ? (
                        <span className="badge bg-red-100 text-red-700">Out of Stock</span>
                      ) : item.status === 'Low Stock' ? (
                        <span className="badge bg-orange-100 text-orange-700">Low Stock</span>
                      ) : (
                        <span className="badge bg-emerald-100 text-emerald-700">In Stock</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleEdit(item)}
                          className="flex items-center gap-1 text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                        >
                          <Edit size={14} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDispense(item)}
                          className="flex items-center gap-1 text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                        >
                          <PackageOpen size={14} />
                          Dispense
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* No Items State */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <Package size={48} className="text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">
              {selectedType ? 'No furniture items found for this type' : 'No furniture items found'}
            </p>
            <p className="text-slate-400 text-sm mt-2">
              Use "Add Furniture Stock" feature to add furniture items
            </p>
          </div>
        )}

        {/* Edit Modal */}
        {editingItem && (
          <EditFurnitureStock 
            item={editingItem} 
            onClose={handleCloseEdit} 
          />
        )}

        {/* Dispense Modal */}
        {dispenseModal.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Dispense Furniture</h3>
              
              <div className="mb-4">
                <p className="text-sm text-slate-600 mb-2">
                  <strong>Item:</strong> {dispenseModal.item?.name}
                </p>
                <p className="text-sm text-slate-600 mb-2">
                  <strong>Available Stock:</strong> {dispenseModal.item?.quantity || 0}
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Quantity to Dispense
                </label>
                <input
                  type="number"
                  min="1"
                  max={dispenseModal.item?.quantity || 0}
                  value={dispenseModal.quantity}
                  onChange={(e) => setDispenseModal(prev => ({ ...prev, quantity: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter quantity"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Who was it sold to? *
                </label>
                <input
                  type="text"
                  value={dispenseModal.soldTo}
                  onChange={(e) => setDispenseModal(prev => ({ ...prev, soldTo: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter customer name"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleConfirmDispense}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                >
                  Confirm Dispense
                </button>
                <button
                  onClick={handleCancelDispense}
                  className="flex-1 bg-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-400 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
