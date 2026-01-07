import React, { useState } from 'react';
import { useSystem } from '../../context/SystemContext';
import { PackagePlus, Plus, Trash2 } from 'lucide-react';

export default function DirectPurchaseOrderView() {
  const { inventory, suppliers, purchaseStockDirect } = useSystem();
  const [selectedItems, setSelectedItems] = useState([{ product_id: '', qty: 1 }]);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddItem = () => {
    setSelectedItems([...selectedItems, { product_id: '', qty: 1 }]);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...selectedItems];
    newItems[index] = { ...newItems[index], [field]: field === 'qty' ? parseInt(value) || 0 : value };
    setSelectedItems(newItems);
  };

  const handleRemoveItem = (index) => {
    if (selectedItems.length > 1) {
      const newItems = selectedItems.filter((_, i) => i !== index);
      setSelectedItems(newItems);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const itemsToOrder = selectedItems
        .filter(item => item.product_id && item.qty > 0)
        .map(item => ({
          product_id: parseInt(item.product_id),
          qty: item.qty,
          name: inventory.find(i => i.product_id === parseInt(item.product_id))?.name || 'Unknown Item',
          price: inventory.find(i => i.product_id === parseInt(item.product_id))?.price || 0
        }));

      if (itemsToOrder.length === 0 || !selectedSupplier) {
        alert('Please select at least one item and a supplier');
        return;
      }

      const supplier = suppliers.find(s => s.id === selectedSupplier);
      await purchaseStockDirect(itemsToOrder, supplier?.name || 'Direct Supplier', notes);
      
      // Reset form
      setSelectedItems([{ product_id: '', qty: 1 }]);
      setSelectedSupplier('');
      setNotes('');
      alert('Purchase order created successfully!');
    } catch (error) {
      console.error('Error creating purchase order:', error);
      alert('Failed to create purchase order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">New Material Order (PO)</h2>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Supplier Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Supplier</label>
            <div className="relative">
              <select
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
                className="w-full p-2.5 border rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="">Select Supplier</option>
                {suppliers.map(supplier => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name} {supplier.contact ? `(${supplier.contact})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Items List */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-slate-800">Items to Order</h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Item
              </button>
            </div>

            {selectedItems.map((item, index) => {
              const selectedItem = inventory.find(i => i.product_id === parseInt(item.product_id));
              return (
                <div key={index} className="grid grid-cols-12 gap-3 items-end p-3 bg-slate-50 rounded-lg">
                  <div className="col-span-6">
                    <label className="block text-xs font-medium text-slate-700 mb-1">Item</label>
                    <select
                      value={item.product_id}
                      onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      <option value="">Select Item</option>
                      {inventory.map(invItem => (
                        <option key={invItem.product_id} value={invItem.product_id}>
                          {invItem.name} ({invItem.qty} {invItem.unit} in stock)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-4">
                    <label className="block text-xs font-medium text-slate-700 mb-1">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={item.qty}
                      onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="w-full flex items-center justify-center p-2 text-red-600 hover:bg-red-50 rounded-md text-sm transition-colors"
                      disabled={selectedItems.length <= 1}
                      title="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  {selectedItem && (
                    <div className="col-span-12 mt-2 text-xs text-slate-500">
                      <p>Unit Price: ₱{selectedItem.price?.toFixed(2) || '0.00'}</p>
                      <p>Total: ₱{(selectedItem.price * item.qty)?.toFixed(2) || '0.00'}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="3"
              className="w-full p-2.5 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Any special instructions or notes..."
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Creating Order...' : 'Create Purchase Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
