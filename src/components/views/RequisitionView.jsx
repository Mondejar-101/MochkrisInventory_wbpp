import React, { useState } from 'react';
import { useSystem } from '../../context/SystemContext';
import { Plus } from 'lucide-react';

export default function RequisitionView() {
  const { createRequisition, requisitions } = useSystem();
  const [item, setItem] = useState('');
  const [qty, setQty] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if(!item || !qty) return;
    createRequisition(item, qty);
    setItem('');
    setQty('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Department Requests</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Card */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 sticky top-24">
            <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
              <Plus size={20} className="text-indigo-600" />
              Create Request
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Item Description</label>
                <input 
                  type="text" 
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  placeholder="e.g. Mahogany Wood"
                  value={item} onChange={e => setItem(e.target.value)} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Quantity</label>
                <input 
                  type="number" 
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="0"
                  value={qty} onChange={e => setQty(e.target.value)} 
                />
              </div>
              <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg transition-all shadow-lg shadow-indigo-600/30">
                Submit Requisition
              </button>
            </form>
          </div>
        </div>

        {/* List Card */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-700">My History</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {requisitions.length === 0 && (
                <div className="p-8 text-center text-slate-400">No requests found.</div>
              )}
              {requisitions.slice().reverse().map((r) => (
                <div key={r.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="font-bold text-slate-800">{r.item}</p>
                    <p className="text-xs text-slate-500">Requested on {r.requestDate} • Qty: {r.qty}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                      r.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 
                      r.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 
                      'bg-indigo-50 text-indigo-700'
                    }`}>
                      {r.status.replace(/_/g, " ")}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1 max-w-[150px] truncate">{r.history[r.history.length-1]}</p>
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