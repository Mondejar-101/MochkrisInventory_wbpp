import React, { useState } from "react";
import { useSystem } from "../context/SystemContext";
import {
  CheckCircle,
  XCircle,
  ClipboardCheck,
  FileText,
  AlertTriangle
} from "lucide-react";

export default function PendingApprovals() {
  const { requisitions, purchaseOrders, vpSignRequisition, vpSignPO } =
    useSystem();

  const [confirmData, setConfirmData] = useState(null);

  const pendingRF = requisitions.filter(
    (r) => r.status === "PENDING_VP_APPROVAL"
  );
  const pendingPO = purchaseOrders.filter(
    (p) => p.status === "PENDING_PO_APPROVAL"
  );

  const openConfirm = (item, type, approved) =>
    setConfirmData({ item, type, approved });
  const closeConfirm = () => setConfirmData(null);

  const executeAction = () => {
    const { item, type, approved } = confirmData;
    if (type === "RF") vpSignRequisition(item.id, approved);
    else vpSignPO(item.id, approved);

    closeConfirm();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fadeIn">

      {/* ---------------- RF APPROVALS ---------------- */}
      <div className="card animate-slideUp border-l-4 border-amber-500">
        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2 mb-4">
          <ClipboardCheck size={20} className="text-amber-600" />
          Requisition Form Approvals (RF)
        </h3>

        {pendingRF.length === 0 && (
          <p className="text-slate-400 text-sm text-center py-6">
            No pending Requisition Forms.
          </p>
        )}

        {pendingRF.map((r) => (
          <div
            key={r.id}
            className="bg-white border border-slate-200 rounded-lg p-4 mb-3 shadow-sm hover:shadow-md transition"
          >
            <div className="flex justify-between">
              <div>
                <p className="font-semibold text-slate-800">{r.item}</p>
                <p className="text-xs text-slate-500">Qty: {r.qty}</p>
                <span className="badge bg-amber-100 text-amber-700 mt-1">
                  Pending RF Approval
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  className="text-green-600 hover:bg-green-50 p-2 rounded-md transition"
                  onClick={() => openConfirm(r, "RF", true)}
                >
                  <CheckCircle size={20} />
                </button>

                <button
                  className="text-red-600 hover:bg-red-50 p-2 rounded-md transition"
                  onClick={() => openConfirm(r, "RF", false)}
                >
                  <XCircle size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ---------------- PO APPROVALS ---------------- */}
      <div className="card animate-slideUp border-l-4 border-indigo-500">
        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2 mb-4">
          <FileText size={20} className="text-indigo-600" />
          Purchase Order Approvals (PO)
        </h3>

        {pendingPO.length === 0 && (
          <p className="text-slate-400 text-sm text-center py-6">
            No pending Purchase Orders.
          </p>
        )}

        {pendingPO.map((po) => (
          <div
            key={po.id}
            className="bg-white border border-slate-200 rounded-lg p-4 mb-3 shadow-sm hover:shadow-md transition"
          >
            <div className="flex justify-between">
              <div>
                <p className="font-semibold text-slate-800">{po.item}</p>
                <p className="text-xs text-slate-500">
                  Supplier: {po.supplier}
                </p>

                <span className="badge bg-indigo-100 text-indigo-700 mt-1">
                  Pending PO Approval
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  className="text-green-600 hover:bg-green-50 p-2 rounded-md transition"
                  onClick={() => openConfirm(po, "PO", true)}
                >
                  <CheckCircle size={20} />
                </button>

                <button
                  className="text-red-600 hover:bg-red-50 p-2 rounded-md transition"
                  onClick={() => openConfirm(po, "PO", false)}
                >
                  <XCircle size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ---------------- CONFIRM POPUP ---------------- */}
      {confirmData && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn">
          <div className="card w-full max-w-md animate-scaleIn">
            <h3 className="text-lg font-bold text-slate-800 mb-3">
              {confirmData.approved ? "Approve" : "Reject"}{" "}
              {confirmData.type === "RF" ? "Requisition" : "Purchase Order"}
            </h3>

            <p className="text-slate-600 mb-6">
              You are about to{" "}
              <strong>
                {confirmData.approved ? "APPROVE" : "REJECT"}
              </strong>{" "}
              the{" "}
              {confirmData.type === "RF" ? "RF" : "PO"} for{" "}
              <span className="font-semibold">{confirmData.item.item}</span>.
            </p>

            {confirmData.approved ? (
              <ul className="text-sm space-y-2 text-slate-700 mb-4">
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-600" />
                  Continue the workflow to the next responsible department.
                </li>
              </ul>
            ) : (
              <p className="text-sm flex items-center gap-2 text-red-600 mb-4">
                <AlertTriangle size={16} />
                This will stop the workflow for this request.
              </p>
            )}

            <div className="flex justify-end gap-3">
              <button className="btn-soft" onClick={closeConfirm}>
                Cancel
              </button>
              <button
                className={`btn-primary ${
                  !confirmData.approved ? "bg-red-600 hover:bg-red-700" : ""
                }`}
                onClick={executeAction}
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
