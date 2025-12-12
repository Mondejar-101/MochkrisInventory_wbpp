import React, { useState } from "react";
import { useSystem } from "../../context/SystemContext";
import { Plus } from "lucide-react";

export default function RequisitionView() {
  const { inventory, createRequisition, requisitions } = useSystem();
  const [selectedProductId, setSelectedProductId] = useState('');
  const [qty, setQty] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedProductId || !qty) return;
    const product = inventory.find(i => i.product_id === parseInt(selectedProductId));
    if (!product) return;
    createRequisition(product.name, qty, product.product_id);
    setSelectedProductId('');
    setQty('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Department Requests</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 sticky top-24">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Plus size={20} className="text-indigo-600" /> Create Request</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-500 mb-1">Select Item</label>
                <select value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)} className="w-full border p-2 rounded">
                  <option value=''>-- Choose Item --</option>
                  {inventory.map(i => <option key={i.product_id} value={i.product_id}>{i.name} (Stock: {i.qty})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-500 mb-1">Quantity</label>
                <input type="number" min="1" value={qty} onChange={e => setQty(e.target.value)} className="w-full border p-2 rounded" />
              </div>
              <button className="w-full bg-indigo-600 text-white py-2 rounded">Submit Requisition</button>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-4 border-b bg-slate-50">
              <h3 className="font-bold">My Requests</h3>
            </div>
            <div>
              {requisitions.length === 0 && <div className="p-8 text-center text-slate-400">No requests found.</div>}
              {requisitions.slice().reverse().map(r => (
                <div key={r.id} className="p-4 flex items-center justify-between border-b">
                  <div>
                    <div className="font-semibold">{r.item}</div>
                    <div className="text-xs text-slate-500">Qty: {r.qty} • {r.requestDate}</div>
                  </div>
                  <div className="text-right">
                    <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">{r.status.replace(/_/g, ' ')}</div>
                    <div className="text-[10px] text-slate-400 mt-1">{r.history[r.history.length-1]}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
