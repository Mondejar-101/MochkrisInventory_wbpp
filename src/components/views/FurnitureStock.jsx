import React, { useState } from 'react';
import { Package, Filter, Plus, Edit, PackageOpen } from 'lucide-react';
import { useSystem } from '../../context/SystemContext';
import EditFurnitureStock from './EditFurnitureStock';

export default function FurnitureStock() {
  const { furnitureStock, updateFurnitureItem } = useSystem();
  const [selectedType, setSelectedType] = useState('');
  const [editingItem, setEditingItem] = useState(null);

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

  // Filter furniture items by selected type
  const filteredItems = selectedType 
    ? furnitureStock.filter(item => {
        // Check if the item type contains the selected main type
        const itemMainType = getMainType(item.type);
        const selectedMainType = getMainType(selectedType);
        return itemMainType === selectedMainType;
      })
    : furnitureStock;

  // Handle edit action
  const handleEdit = (item) => {
    setEditingItem(item);
  };

  // Handle dispense action
  const handleDispense = (item) => {
    console.log('Dispense item:', item);
    // TODO: Implement dispense functionality - could update quantity or create dispense record
    alert(`Dispense functionality for "${item.name}" will be implemented`);
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

        {/* Furniture Type Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <Filter size={16} className="inline mr-2" />
            Furniture Types
          </label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full md:w-96 border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">-- Select Furniture Type --</option>
            {furnitureTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
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
      </div>
    </div>
  );
}
