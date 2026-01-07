import React, { useState } from 'react';
import { Clock, Package, Search, Calendar } from 'lucide-react';
import { useSystem } from '../../context/SystemContext';

export default function FurnitureDispenseHistory() {
  const { furnitureDispenseHistory } = useSystem();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter dispense history by search term
  const filteredHistory = furnitureDispenseHistory.filter(record => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      record.itemName?.toLowerCase().includes(searchLower) ||
      record.soldTo?.toLowerCase().includes(searchLower) ||
      record.dispensedBy?.toLowerCase().includes(searchLower) ||
      record.quantity?.toString().includes(searchLower) ||
      record.unitPrice?.toString().includes(searchLower) ||
      record.totalPrice?.toString().includes(searchLower)
    );
  });

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Clock size={20} className="text-indigo-600" />
            Furniture Dispense History
          </h2>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <Search size={16} className="inline mr-2" />
            Search Dispense History
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by item name, customer, user, quantity, or price..."
            className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Dispense History Table */}
        {filteredHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="text-slate-500 bg-slate-100 border-b border-slate-200 text-xs uppercase tracking-wide">
                  <th className="py-3 px-4 text-center">Date & Time</th>
                  <th className="py-3 px-4 text-center">Item Name</th>
                  <th className="py-3 px-4 text-center">Quantity</th>
                  <th className="py-3 px-4 text-center">Unit Price</th>
                  <th className="py-3 px-4 text-center">Total Price</th>
                  <th className="py-3 px-4 text-center">Remaining Stock</th>
                  <th className="py-3 px-4 text-center">Sold To</th>
                  <th className="py-3 px-4 text-center">Dispensed By</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((record) => (
                  <tr 
                    key={record.id} 
                    className="border-b border-slate-100 hover:bg-slate-50 transition"
                  >
                    <td className="py-3 px-4 text-slate-700 text-center">
                      <div className="flex items-center gap-1 justify-center">
                        <Calendar size={14} className="text-slate-400" />
                        {formatDate(record.dispensedAt)}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 text-center">
                      {record.itemName}
                    </td>
                    <td className="py-3 px-4 text-slate-700 text-center font-medium">
                      {record.quantity}
                    </td>
                    <td className="py-3 px-4 text-slate-700 text-center">
                      ₱{record.unitPrice ? parseFloat(record.unitPrice).toFixed(2) : '0.00'}
                    </td>
                    <td className="py-3 px-4 text-slate-700 text-center font-medium">
                      ₱{record.totalPrice ? parseFloat(record.totalPrice).toFixed(2) : '0.00'}
                    </td>
                    <td className="py-3 px-4 text-slate-700 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        record.remainingStock === 0 
                          ? 'bg-red-100 text-red-700'
                          : record.remainingStock < 3
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {record.remainingStock}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 text-center">
                      {record.soldTo}
                    </td>
                    <td className="py-3 px-4 text-slate-700 text-center">
                      {record.dispensedBy}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Clock size={48} className="text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">
              {searchTerm ? 'No dispense records found matching your search' : 'No furniture dispense records found'}
            </p>
            <p className="text-slate-400 text-sm mt-2">
              {searchTerm ? 'Try different search terms' : 'Furniture dispense history will appear here once items are dispensed'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
