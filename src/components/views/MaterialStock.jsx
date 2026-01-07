import React, { useState } from 'react';
import { Package, Search, PackageOpen, AlertTriangle } from 'lucide-react';
import { useSystem } from '../../context/SystemContext';

export default function MaterialStock() {
  const { inventory } = useSystem();
  const [searchTerm, setSearchTerm] = useState('');
  const [stockStatusFilter, setStockStatusFilter] = useState('');

  console.log('MaterialStock component - inventory:', inventory);

  // Filter inventory by search term and stock status
  const filteredItems = inventory.filter(item => {
    // Search filter
    let passesSearch = true;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      
      // Get status text for this item
      const stockLevel = item.qty || 0;
      const restockThreshold = item.restockThreshold || 3;
      let statusText = '';
      if (stockLevel === 0) {
        statusText = 'out of stock';
      } else if (stockLevel < restockThreshold) {
        statusText = 'low stock';
      } else {
        statusText = 'in stock';
      }
      
      passesSearch = (
        item.name?.toLowerCase().includes(searchLower) ||
        item.unit?.toLowerCase().includes(searchLower) ||
        item.category?.toLowerCase().includes(searchLower) ||
        statusText.includes(searchLower)
      );
    }
    
    // Stock status filter
    let passesStockStatus = true;
    if (stockStatusFilter) {
      const stockLevel = item.qty || 0;
      const restockThreshold = item.restockThreshold || 3;
      let statusText = '';
      if (stockLevel === 0) {
        statusText = 'out of stock';
      } else if (stockLevel < restockThreshold) {
        statusText = 'low stock';
      } else {
        statusText = 'in stock';
      }
      
      passesStockStatus = (
        stockStatusFilter === 'in_stock' && stockLevel >= restockThreshold ||
        stockStatusFilter === 'low_stock' && stockLevel > 0 && stockLevel < restockThreshold ||
        stockStatusFilter === 'out_of_stock' && stockLevel === 0
      );
    }
    
    return passesSearch && passesStockStatus;
  });

  // Handle dispense action
  const handleDispense = (item) => {
    console.log('Dispense item:', item);
    // TODO: Implement dispense functionality - could update quantity or create dispense record
    alert(`Dispense functionality for "${item.name}" will be implemented`);
  };

  // Get status badge based on stock level
  const getStatusBadge = (item) => {
    const stockLevel = item.qty || 0;
    const restockThreshold = item.restockThreshold || 3;
    
    if (stockLevel === 0) {
      return <span className="badge bg-red-100 text-red-700">Out of Stock</span>;
    } else if (stockLevel < restockThreshold) {
      return <span className="badge bg-orange-100 text-orange-700">Low Stock</span>;
    } else {
      return <span className="badge bg-emerald-100 text-emerald-700">In Stock</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Package size={20} className="text-indigo-600" />
            Material Stock
          </h2>
        </div>

        {/* Search Bar and Filter */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Search size={16} className="inline mr-2" />
              Search Materials
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, unit, category, or status (e.g., 'low stock', 'out of stock')..."
              className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
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

        {/* Material Items Table */}
        {filteredItems.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="text-slate-500 bg-slate-100 border-b border-slate-200 text-xs uppercase tracking-wide">
                  <th className="py-3 px-4 text-center">Item Name</th>
                  <th className="py-3 px-4 text-center">Unit</th>
                  <th className="py-3 px-4 text-center">Stock Level</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item, index) => (
                  <tr 
                    key={item.product_id} 
                    className={`border-b border-slate-100 ${index % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-slate-100 transition`}
                  >
                    <td className="py-3 px-4 text-slate-700 font-medium text-center">
                      {item.name}
                    </td>
                    <td className="py-3 px-4 text-slate-700 text-center">
                      {item.unit || 'pcs'}
                    </td>
                    <td className="py-3 px-4 text-slate-700 text-center">
                      {item.qty || 0}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {getStatusBadge(item)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleDispense(item)}
                          className="flex items-center gap-1 text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                          disabled={(item.qty || 0) === 0}
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
              {searchTerm ? 'No materials found matching your search' : 'No material items found'}
            </p>
            <p className="text-slate-400 text-sm mt-2">
              {searchTerm ? 'Try different search terms' : 'Add items through the "Manage Items & Suppliers" feature'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
