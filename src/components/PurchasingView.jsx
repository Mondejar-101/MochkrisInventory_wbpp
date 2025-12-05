import React, { useState } from "react";
import { useSystem } from "../context/SystemContext";
import { ShoppingCart, FileText, BadgeCheck, AlertTriangle } from "lucide-react";

export default function PurchasingView() {
  const { requisitions, createPurchaseOrder, purchaseOrders } = useSystem();

  const toPurchase = requisitions.filter(
    (r) => r.status === "FORWARDED_TO_PURCHASING"
  );

  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [confirmData, setConfirmData] = useState(null);

  const suppliersMock = [
    { name: "WoodWorks Inc.", price: 500, lead: "3 days" },
    { name: "Global Furnishings", price: 520, lead: "2 days" },
    { name: "Local Supply Co.", price: 480, lead: "4 days" },
  ];

  const openConfirm = (rf) =>
    setConfirmData({ rf, supplier: selectedSupplier });
  const closeConfirm = () => setConfirmData(null);

  const finalizePO = () => {
    createPurchaseOrder(confirmData.rf.id, confirmData.supplier);
    closeConfirm();
  };

  return (
    <div className="space-y-8 animate-fadeIn">

      <h2 className="text-xl font-bold text-slate-800 mb-2">
        Purchasing – Canvassing & PO Creation
      </h2>
      <p className="text-slate-500 text-sm mb-4">
        These items were forwarded by the Custodian due to insufficient stock.
      </p>

      {/* ---------------- Pending Canvass ---------------- */}
      <div className="grid gap-6">
        {toPurchase.length === 0 && (
          <p className="text-slate-400 card text-center py-8">
            No requisitions need purchasing at the moment.
          </p>
        )}

        {toPurchase.map((r) => (
          <div
            key={r.id}
            className="card card-hover animate-slideUp border-l-4 border-orange-500"
          >
            {/* RF Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-bold text-lg">{r.item}</p>
                <p className="text-slate-500 text-sm">Quantity Needed: {r.qty}</p>
              </div>

              <span className="badge bg-orange-100 text-orange-700">
                Needs PO
              </span>
            </div>

            {/* Supplier Canvassing */}
            <div className="bg-white p-4 rounded-lg border border-slate-200">
              <p className="font-semibold text-sm text-slate-700 mb-2">
                Canvass Supplier Quotes
              </p>

              <table className="w-full text-sm border-collapse mb-3">
                <thead>
                  <tr className="text-left text-xs text-slate-500 border-b">
                    <th className="py-1">Supplier</th>
                    <th className="py-1">Price</th>
                    <th className="py-1">Lead Time</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {suppliersMock.map((s) => (
                    <tr
                      key={s.name}
                      className="border-b last:border-0 text-slate-700"
                    >
                      <td className="py-2">{s.name}</td>
                      <td className="py-2">₱ {s.price.toLocaleString()}</td>
                      <td className="py-2">{s.lead}</td>
                      <td className="py-2 text-right">
                        <button
                          className={`px-3 py-1 rounded text-xs font-medium border ${
                            selectedSupplier === s.name
                              ? "bg-indigo-600 text-white border-indigo-600"
                              : "bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200"
                          }`}
                          onClick={() => setSelectedSupplier(s.name)}
                        >
                          {selectedSupplier === s.name ? "Selected" : "Choose"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* PO Button */}
              <button
                onClick={() => openConfirm(r)}
                disabled={!selectedSupplier}
                className={`w-full btn-primary flex items-center justify-center gap-2 ${
                  !selectedSupplier ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <FileText size={16} />
                Generate Purchase Order (PO)
              </button>
            </div>

            <p className="text-xs text-slate-400 mt-2">
              *PO will be submitted to VP for approval.
            </p>
          </div>
        ))}
      </div>

      {/* ---------------- PO Timeline ---------------- */}
      <div className="border-t pt-8">
        <h3 className="font-bold text-slate-600 mb-3">
          Recent Purchase Orders
        </h3>

        <div className="space-y-2">
          {purchaseOrders.map((po) => (
            <div
              key={po.id}
              className="bg-white border border-slate-200 rounded p-3 flex justify-between items-center text-sm shadow-sm"
            >
              <div>
                <p className="font-semibold">{po.item}</p>
                <p className="text-xs text-slate-500">Supplier: {po.supplier}</p>
              </div>

              <span
                className={`badge ${
                  po.status === "PENDING_PO_APPROVAL"
                    ? "bg-amber-100 text-amber-700"
                    : po.status === "SENT_TO_SUPPLIER"
                    ? "bg-indigo-100 text-indigo-700"
                    : po.status === "COMPLETED"
                    ? "bg-green-100 text-green-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {po.status.replace(/_/g, " ")}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ---------------- Confirm Modal ---------------- */}
      {confirmData && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn">
          <div className="card w-full max-w-md animate-scaleIn">
            <h3 className="text-lg font-bold text-slate-800 mb-3">
              Confirm Purchase Order
            </h3>

            <p className="text-slate-700 mb-5">
              You are about to create a Purchase Order for{" "}
              <strong>{confirmData.rf.item}</strong> using supplier:{" "}
              <strong className="text-indigo-600">{confirmData.supplier}</strong>.
            </p>

            <p className="text-xs text-slate-500 mb-5">
              This PO will be forwarded to the **VP / Top Management** for
              approval before sending to supplier.
            </p>

            <div className="flex justify-end gap-3">
              <button className="btn-soft" onClick={closeConfirm}>
                Cancel
              </button>
              <button className="btn-primary" onClick={finalizePO}>
                Confirm PO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
