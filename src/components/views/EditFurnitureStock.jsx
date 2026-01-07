import React, { useState } from 'react';
import { Package, Save, X } from 'lucide-react';
import { useSystem } from '../../context/SystemContext';

export default function EditFurnitureStock({ item, onClose }) {
  const { updateFurnitureItem } = useSystem();
  const [formData, setFormData] = useState({
    name: item.name || '',
    type: item.type || '',
    material: item.material || '',
    quantity: item.quantity || 1,
    restockThreshold: item.restockThreshold || 5,
    price: item.price || ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // Validate required fields
    if (!formData.name.trim()) {
      alert('Item name is required');
      return;
    }
    if (!formData.type) {
      alert('Furniture type is required');
      return;
    }
    if (!formData.material) {
      alert('Material is required');
      return;
    }
    if (formData.quantity < 0) {
      alert('Quantity must be greater than 0');
      return;
    }
    if (formData.restockThreshold < 1) {
      alert('Restock threshold must be greater than 0');
      return;
    }
    if (formData.price < 0) {
      alert('Price must be greater than or equal to 0');
      return;
    }

    // Update the item
    updateFurnitureItem(item.id, {
      name: formData.name,
      type: formData.type,
      material: formData.material,
      quantity: parseInt(formData.quantity),
      restockThreshold: parseInt(formData.restockThreshold),
      price: parseFloat(formData.price)
    });

    alert('Furniture item updated successfully!');
    onClose();
  };

  const furnitureTypes = [
    'Seating (chairs, sofas, stools)',
    'Sleeping (beds, cribs)',
    'Storage (wardrobes, dressers, shelves, cabinets)',
    'Surfaces/Tables (dining tables, coffee tables, desks)',
    'Decorative/Other (mirrors, clocks, room dividers)'
  ];

  const materials = ['Wood', 'Metal', 'Plastic'];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Package size={20} className="text-indigo-600" />
            Edit Furniture Stock
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Item Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Item Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g., Office Chair, Dining Table"
              required
            />
          </div>

          {/* Furniture Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Furniture Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="">Select Type</option>
              {furnitureTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Material */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Material *
            </label>
            <select
              value={formData.material}
              onChange={(e) => handleInputChange('material', e.target.value)}
              className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="">Select Material</option>
              {materials.map((material) => (
                <option key={material} value={material}>
                  {material}
                </option>
              ))}
            </select>
          </div>

          {/* Current Quantity */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Current Quantity *
            </label>
            <input
              type="number"
              min="0"
              value={formData.quantity}
              onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
              className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="0"
              required
            />
          </div>

          {/* Restock Threshold */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Restock Threshold *
            </label>
            <input
              type="number"
              min="1"
              value={formData.restockThreshold}
              onChange={(e) => handleInputChange('restockThreshold', parseInt(e.target.value) || 1)}
              className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="5"
              required
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Price *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 text-lg">₱</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                className="w-full border border-slate-300 rounded-md px-3 py-2 pl-8 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="0.00"
                required
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Save size={18} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
