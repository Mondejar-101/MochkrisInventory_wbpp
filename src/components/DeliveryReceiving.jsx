import React, { useState } from "react";
import { useSystem } from "../context/SystemContext";
import {
  Truck,
  AlertTriangle,
  CheckSquare,
  FileText,
  Package,
} from "lucide-react";

export default function DeliveryReceiving() {
  const { purchaseOrders, receiveDelivery } = useSystem();
  const [selectedPO, setSelectedPO] = useState(null);

  const incomingDeliveries = purchaseOrders.filter(
    (po) => po.status === "SENT TO MANAGER"
  );

  const openConfirm = (po, damaged) => {
    setSelectedPO({ po, damaged });
  };

  const closeConfirm = () => setSelectedPO(null);

  const confirmAction = () => {
    receiveDelivery(selectedPO.po.id, selectedPO.damaged);
    closeConfirm();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <h2 className="text-xl font-bold text-slate-800 mb-4">
        Incoming Deliveries (RM / DR / AR Processing)
      </h2>

      {incomingDeliveries.length === 0 && (
        <p className="text-slate-500 text-center card py-10">
          No incoming deliveries at the moment.
        </p>
      )}

      {incomingDeliveries.map((po) => (
        <div
          key={po.id}
          className="card card-hover animate-slideUp border-l-4 border-indigo-500"
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-4">
            <Truck size={28} className="text-indigo-600" />
            <div>
              <p className="font-bold text-lg">Purchase Order #{po.id}</p>
              <p className="text-slate-500 text-sm">
                Supplier: <span className="font-medium">{po.supplier}</span>
              </p>
            </div>
            <span className="ml-auto badge bg-indigo-100 text-indigo-700">
              Expected Delivery
            </span>
          </div>

          {/* PO Content */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <Package size={20} className="text-slate-500 mb-3" />
            {po.items && Array.isArray(po.items) && po.items.length > 0 ? (
              <div className="space-y-2">
                <p className="font-semibold text-slate-700 mb-2">Items:</p>
                {po.items.map((item, idx) => (
                  <div key={idx} className="text-sm text-slate-600">
                    <span className="font-medium">
                      {item.name || item.item || `Item ${idx + 1}`}
                    </span>
                    <span className="ml-2">
                      Qty: {item.quantity || item.qty || 0}
                    </span>
                    {item.unit && <span className="ml-1">({item.unit})</span>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-4 text-slate-700">
                <div>
                  <p className="font-semibold">{po.item || "Unknown Item"}</p>
                  <p className="text-sm">Quantity: {po.qty || 0}</p>
                </div>
              </div>
            )}

            {/* Documents Overview */}
            <div className="mt-4 flex gap-6 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <FileText size={14} /> DR (Delivery Receipt)
              </div>
              <div className="flex items-center gap-2">
                <FileText size={14} /> RM (Receiving Memo)
              </div>
              <div className="flex items-center gap-2">
                <FileText size={14} /> AR (Acknowledgement Receipt)
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-6 flex gap-4">
              {/* Reject */}
              <button
                onClick={() => openConfirm(po, true)}
                className="flex-1 py-2 rounded-lg border border-red-300 bg-red-50 text-red-700 text-sm 
                           flex items-center justify-center gap-2 hover:bg-red-100 transition"
              >
                <AlertTriangle size={16} />
                Reject (Damaged)
              </button>

              {/* Accept */}
              <button
                onClick={() => openConfirm(po, false)}
                className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm 
                           flex items-center justify-center gap-2 hover:bg-green-700 transition"
              >
                <CheckSquare size={16} />
                Accept & Process RM / AR
              </button>
            </div>

            <p className="text-xs text-slate-400 mt-2 text-center">
              Accepting generates RM and routes items to the requester.
            </p>
          </div>
        </div>
      ))}

      {/* --- Confirm Modal --- */}
      {selectedPO && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn">
          <div className="card w-full max-w-md animate-scaleIn">
            <h3 className="font-bold text-lg text-slate-800 mb-3">
              {selectedPO.damaged ? "Return to Supplier?" : "Accept Delivery?"}
            </h3>

            <p className="text-slate-600 mb-6">
              {selectedPO.damaged
                ? `You are marking PO #${selectedPO.po.id} as damaged. Items will be returned to the supplier.`
                : `You are accepting PO #${selectedPO.po.id}. RM and AR will be generated.`}
            </p>

            <div className="flex justify-end gap-3">
              <button onClick={closeConfirm} className="btn-soft px-4 py-2">
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className={`btn-primary px-4 py-2 ${
                  selectedPO.damaged ? "bg-red-600 hover:bg-red-700" : ""
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
