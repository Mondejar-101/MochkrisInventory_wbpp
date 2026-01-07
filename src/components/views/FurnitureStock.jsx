import React, { useState } from 'react';
import { Package, Filter } from 'lucide-react';

export default function FurnitureStock() {
  const [selectedType, setSelectedType] = useState('');
  const [furnitureItems, setFurnitureItems] = useState([]);

  const furnitureTypes = [
    'Seating (chairs, sofas, stools)',
    'Sleeping (beds, cribs)',
    'Storage (wardrobes, dressers, shelves, cabinets)',
    'Surfaces/Tables (dining tables, coffee tables, desks)',
    'Decorative/Other (mirrors, clocks, room dividers)'
  ];

  const materials = ['Wood', 'Metal', 'Plastic'];

  // Mock data for demonstration
  const mockFurnitureData = {
    'Seating (chairs, sofas, stools)': [
      { id: 1, name: 'Office Chair', type: 'Seating', material: 'Wood', quantity: 15 },
      { id: 2, name: 'Sofa', type: 'Seating', material: 'Plastic', quantity: 8 },
      { id: 3, name: 'Bar Stool', type: 'Seating', material: 'Metal', quantity: 12 }
    ],
    'Sleeping (beds, cribs)': [
      { id: 4, name: 'Queen Bed', type: 'Sleeping', material: 'Wood', quantity: 6 },
      { id: 5, name: 'Crib', type: 'Sleeping', material: 'Wood', quantity: 4 }
    ],
    'Storage (wardrobes, dressers, shelves, cabinets)': [
      { id: 6, name: 'Wardrobe', type: 'Storage', material: 'Wood', quantity: 9 },
      { id: 7, name: 'Dresser', type: 'Storage', material: 'Wood', quantity: 7 },
      { id: 8, name: 'Bookshelf', type: 'Storage', material: 'Metal', quantity: 11 }
    ],
    'Surfaces/Tables (dining tables, coffee tables, desks)': [
      { id: 9, name: 'Dining Table', type: 'Surfaces', material: 'Wood', quantity: 5 },
      { id: 10, name: 'Coffee Table', type: 'Surfaces', material: 'Glass', quantity: 8 },
      { id: 11, name: 'Office Desk', type: 'Surfaces', material: 'Wood', quantity: 10 }
    ],
    'Decorative/Other (mirrors, clocks, room dividers)': [
      { id: 12, name: 'Wall Mirror', type: 'Decorative', material: 'Wood', quantity: 14 },
      { id: 13, name: 'Grandfather Clock', type: 'Decorative', material: 'Wood', quantity: 3 },
      { id: 14, name: 'Room Divider', type: 'Decorative', material: 'Metal', quantity: 6 }
    ]
  };

  const handleTypeChange = (e) => {
    const type = e.target.value;
    setSelectedType(type);
    setFurnitureItems(mockFurnitureData[type] || []);
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
            onChange={handleTypeChange}
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
        {selectedType && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="text-slate-500 bg-slate-100 border-b border-slate-200 text-xs uppercase tracking-wide">
                  <th className="py-3 px-4 text-center">Item Name</th>
                  <th className="py-3 px-4 text-center">Type</th>
                  <th className="py-3 px-4 text-center">Material</th>
                  <th className="py-3 px-4 text-center">Quantity</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {furnitureItems.map((item, index) => (
                  <tr key={item.id} className={`border-b border-slate-100 ${index % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-slate-100 transition`}>
                    <td className="py-3 px-4 text-slate-700 font-medium text-center">{item.name}</td>
                    <td className="py-3 px-4 text-slate-700 text-center">{item.type}</td>
                    <td className="py-3 px-4 text-slate-700 text-center">{item.material}</td>
                    <td className="py-3 px-4 text-slate-700 text-center">{item.quantity}</td>
                    <td className="py-3 px-4 text-center">
                      {item.quantity === 0 ? (
                        <span className="badge bg-red-100 text-red-700">Out of Stock</span>
                      ) : item.quantity < 5 ? (
                        <span className="badge bg-orange-100 text-orange-700">Low Stock</span>
                      ) : (
                        <span className="badge bg-emerald-100 text-emerald-700">In Stock</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* No Selection State */}
        {!selectedType && (
          <div className="text-center py-12">
            <Package size={48} className="text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">Select a furniture type to view inventory</p>
            <p className="text-slate-400 text-sm mt-2">
              Choose from seating, sleeping, storage, surfaces/tables, or decorative items
            </p>
          </div>
        )}

        {/* No Results State */}
        {selectedType && furnitureItems.length === 0 && (
          <div className="text-center py-12">
            <Package size={48} className="text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">No items found for this furniture type</p>
          </div>
        )}
      </div>
    </div>
  );
}
