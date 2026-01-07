import React, { useState } from 'react';
import { Package, Plus, Save, X } from 'lucide-react';
import { useSystem } from '../../context/SystemContext';

export default function AddFurnitureStock() {
  const { addFurnitureItems } = useSystem();
  const [furnitureItems, setFurnitureItems] = useState([
    { name: '', type: '', material: '', quantity: 1, restockThreshold: 5, price: '' }
  ]);

  const furnitureTypes = [
    'Seating (e.g., chairs, sofas, stools)',
    'Sleeping (e.g., beds, cribs)',
    'Storage (e.g., wardrobes, dressers, shelves, cabinets)',
    'Surfaces/Tables (e.g., dining tables, coffee tables, desks)',
    'Decorative/Other (e.g., mirrors, clocks, room dividers)'
  ];

  const materials = ['Wood', 'Metal', 'Plastic'];

  const handleAddItem = () => {
    setFurnitureItems([
      ...furnitureItems,
      { name: '', type: '', material: '', quantity: 1, restockThreshold: 5, price: '' }
    ]);
  };

  const handleRemoveItem = (index) => {
    const newItems = furnitureItems.filter((_, i) => i !== index);
    setFurnitureItems(newItems);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...furnitureItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setFurnitureItems(newItems);
  };

  const handleSave = () => {
    // Validate at least one item has a name
    const validItems = furnitureItems.filter(item => item.name.trim() !== '');
    
    if (validItems.length === 0) {
      alert('Please add at least one furniture item with a name');
      return;
    }

    // Save to system state
    const addedItems = addFurnitureItems(validItems);
    alert(`Successfully added ${addedItems.length} furniture item(s) to stock!`);
    
    // Reset form
    setFurnitureItems([{ name: '', type: '', material: '', quantity: 1, restockThreshold: 5, price: '' }]);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Plus size={20} className="text-indigo-600" />
            Add Furniture Stock
          </h2>
        </div>

        {/* Form Items */}
        <div className="space-y-4">
          {furnitureItems.map((item, index) => (
            <div key={index} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-slate-800">Furniture Item {index + 1}</h3>
                {furnitureItems.length > 1 && (
                  <button
                    onClick={() => handleRemoveItem(index)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Item Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleItemChange(index, 'name', e.target.value)}
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
                    value={item.type}
                    onChange={(e) => handleItemChange(index, 'type', e.target.value)}
                    className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="">-- Select Type --</option>
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
                    value={item.material}
                    onChange={(e) => handleItemChange(index, 'material', e.target.value)}
                    className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="">-- Select Material --</option>
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
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
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
                    value={item.restockThreshold}
                    onChange={(e) => handleItemChange(index, 'restockThreshold', parseInt(e.target.value) || 1)}
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
                      value={item.price}
                      onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value) || 0)}
                      className="w-full border border-slate-300 rounded-md px-3 py-2 pl-8 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={handleAddItem}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus size={18} />
            Add Another Item
          </button>
          
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Save size={18} />
            Save to Stock
          </button>
        </div>

              </div>
    </div>
  );
}
