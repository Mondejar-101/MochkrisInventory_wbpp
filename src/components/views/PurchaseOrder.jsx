import React from "react";
import { useSystem } from "../../context/SystemContext";

export default function PurchaseOrdersView() {
  const { purchaseOrders, receiveDelivery, completeDirectPurchase } = useSystem();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Purchase Orders</h2>

      {purchaseOrders.length === 0 && <div className="p-6 bg-white rounded">No POs yet.</div>}

      <div className="grid gap-3">
        {purchaseOrders.map(po => (
          <div key={po.id} className="bg-white p-4 rounded border flex justify-between items-center">
            <div>
              <div className="font-semibold">{po.type === 'DIRECT_PURCHASE' ? 'Direct Purchase' : 'PO for ' + po.item}</div>
              <div className="text-xs text-slate-500">{po.supplier} • {po.status}</div>
            </div>

            <div className="flex gap-2">
              {po.type === 'DIRECT_PURCHASE' ? (
                <>
                  <button onClick={() => completeDirectPurchase(po.id)} className="px-3 py-1 bg-indigo-600 text-white rounded">Mark Delivered</button>
                </>
              ) : (
                <>
                  <button onClick={() => receiveDelivery(po.id, false)} className="px-3 py-1 bg-green-600 text-white rounded">Receive</button>
                  <button onClick={() => receiveDelivery(po.id, true)} className="px-3 py-1 bg-red-500 text-white rounded">Reject (Damaged)</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
