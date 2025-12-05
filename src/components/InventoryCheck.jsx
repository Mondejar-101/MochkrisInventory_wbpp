import React, { useState } from "react";
import { useSystem } from "../context/SystemContext";
import { Search, Package, AlertTriangle, CheckCircle, ShoppingCart } from "lucide-react";

export default function InventoryCheck() {
  const { requisitions, inventory, custodianCheckInventory } = useSystem();
  const [confirmData, setConfirmData] = useState(null);

  // RFs approved by VP but not yet processed by Custodian
  const toCheck = requisitions.filter((r) => r.status === "APPROVED_BY_VP");

  const openConfirm = (rf) => setConfirmData(rf);
  const closeConfirm = () => setConfirmData(null);

  const proceedCheck = () => {
    custodianCheckInventory(confirmData.id);
    closeConfirm();
  };

  return (
    <div className="space-y-6 animate-fadeIn">

      <h2 className="text-xl font-bold text-slate-800 mb-4">
        Inventory Verification for Approved Requisitions
      </h2>

      {toCheck.length === 0 && (
        <p className="text-slate-500 card text-center py-10">
          No approved requisitions to process.
        </p>
      )}

      {toCheck.map((r) => {
        const stock = inventory.find((i) => i.name === r.item);
        const stockQty = stock ? stock.qty : 0;
        const isAvailable = stockQty >= r.qty;

        return (
          <div
            key={r.id}
            className="card card-hover animate-slideUp border-l-4 border-amber-500"
          >
            {/* Header */}
            <div className="flex items-center gap-4 mb-4">
              <Package size={26} className="text-amber-600" />
              <div>
                <p className="font-bold text-lg">Requisition #{r.id}</p>
                <p className="text-slate-600 text-sm">
                  Requested: <span className="font-medium">{r.item}</span> (Qty: {r.qty})
                </p>
              </div>

              <span className="ml-auto badge bg-amber-100 text-amber-700">
                VP Approved
              </span>
            </div>

            {/* Stock Check Section */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <p className="font-semibold text-slate-700 mb-1">Current Stock Level</p>

              <p className="text-sm mb-3">
                On-hand:{" "}
                <span
                  className={`font-bold ${
                    isAvailable ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stockQty}
                </span>
              </p>

              {/* Availability Badge */}
              {isAvailable ? (
                <div className="flex items-center gap-2 text-green-700 text-sm mb-3">
                  <CheckCircle size={16} />
                  Stock Available — ready for delivery to requesting department.
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600 text-sm mb-3">
                  <AlertTriangle size={16} />
                  Insufficient stock — this RF will be forwarded to Purchasing.
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={() => openConfirm(r)}
                className="btn-primary w-full flex items-center justify-center gap-2 mt-3"
              >
                <Search size={16} />
                Process Inventory Check
              </button>
            </div>

            <p className="text-xs text-slate-400 mt-2">
              *Processing will automatically route this RF based on stock availability.
            </p>
          </div>
        );
      })}

      {/* ------------ Modal Confirmation ------------ */}
      {confirmData && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn">
          <div className="card w-full max-w-md animate-scaleIn">
            <h3 className="font-bold text-lg text-slate-800 mb-3">
              Confirm Inventory Check
            </h3>

            <p className="text-slate-600 mb-6">
              Requisition <strong>#{confirmData.id}</strong> will be processed.  
              Depending on stock availability, the system will:
            </p>

            <ul className="text-sm space-y-2 text-slate-700 mb-4">
              <li className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-600" />
                Deliver item to requesting department (if stock is enough)
              </li>
              <li className="flex items-center gap-2">
                <ShoppingCart size={16} className="text-amber-600" />
                Forward RF to Purchasing (if not enough stock)
              </li>
            </ul>

            <div className="flex justify-end gap-3">
              <button className="btn-soft" onClick={closeConfirm}>
                Cancel
              </button>
              <button className="btn-primary" onClick={proceedCheck}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
