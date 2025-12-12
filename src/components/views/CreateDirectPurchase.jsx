import React, { useState } from "react";
import { useSystem } from "../../context/SystemContext";

export default function CreateDirectPurchase() {
  const { inventory, purchaseStockDirect } = useSystem();
  const [selectedItems, setSelectedItems] = useState([]);

  const toggleSelect = (item) => {
    setSelectedItems(prev => {
      const exists = prev.find(i => i.product_id === item.product_id);
      if (exists) return prev.filter(i => i.product_id !== item.product_id);
      return [...prev, { product_id: item.product_id, qty: 1 }];
    });
  };

  const updateQty = (product_id, qty) => {
    setSelectedItems(prev => prev.map(i => i.product_id === product_id ? { ...i, qty } : i));
  };

  const createPO = () => {
    if (selectedItems.length === 0) return alert('Select items to purchase');
    purchaseStockDirect(selectedItems, 'Local Supplier');
    setSelectedItems([]);
    alert('Direct Purchase Order created');
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Direct Purchase (Purchasing)</h3>

      <div className="grid gap-3">
        {inventory.map(item => (
          <div key={item.product_id} className="flex items-center justify-between p-3 bg-white rounded border">
            <div>
              <div className="font-semibold">{item.name}</div>
              <div className="text-xs text-slate-500">Stock: {item.qty} {item.unit}</div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleSelect(item)}
                className={`px-3 py-1 rounded ${selectedItems.find(si => si.product_id === item.product_id) ? 'bg-red-500 text-white' : 'bg-indigo-600 text-white'}`}
              >
                {selectedItems.find(si => si.product_id === item.product_id) ? 'Remove' : 'Add'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedItems.length > 0 && (
        <div className="bg-white p-4 rounded border">
          <h4 className="font-semibold mb-2">Selected</h4>
          {selectedItems.map(si => {
            const inv = inventory.find(i => i.product_id === si.product_id);
            return (
              <div key={si.product_id} className="flex items-center gap-3 mb-2">
                <div className="w-40">{inv?.name}</div>
                <input type="number" value={si.qty} min="1" onChange={(e) => updateQty(si.product_id, Number(e.target.value))} className="border p-1 w-24" />
              </div>
            );
          })}

          <button onClick={createPO} className="mt-3 bg-green-600 text-white px-4 py-2 rounded">Create Direct PO</button>
        </div>
      )}
    </div>
  );
}
