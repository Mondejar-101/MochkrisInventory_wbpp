import React, { useState } from "react";
import { useSystem } from "../context/SystemContext";
import {
  CheckCircle,
  XCircle,
  ClipboardCheck,
  FileText,
  AlertTriangle,
  Eye
} from "lucide-react";

export default function PendingApprovals() {
  const { requisitions, purchaseOrders, vpSignRequisition, vpSignPO, inventory, suppliers } =
    useSystem();

  const [confirmData, setConfirmData] = useState(null);
  const [selectedRequisition, setSelectedRequisition] = useState(null);
  const [showRequisitionModal, setShowRequisitionModal] = useState(false);

  const pendingRF = requisitions.filter(
    (r) => r.status === "PENDING APPROVAL"
  );
  const pendingPO = purchaseOrders.filter(
    (p) => p.status === "PENDING APPROVAL"
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

  const handleViewRequisition = (requisition) => {
    setSelectedRequisition(requisition);
    setShowRequisitionModal(true);
  };

  const closeRequisitionModal = () => {
    setShowRequisitionModal(false);
    setSelectedRequisition(null);
  };

  // Helper function to format unit types
  const formatUnitType = (unit) => {
    if (!unit) return 'Unit';
    const unitMap = {
      'piece': 'Piece (pcs)', 'pieces': 'Pieces (pcs)', 'pcs': 'Pieces (pcs)',
      'meter': 'Meter (m)', 'meters': 'Meters (m)', 'm': 'Meters (m)',
      'kilogram': 'Kilogram (kg)', 'kilograms': 'Kilograms (kg)', 'kg': 'Kilograms (kg)',
      'liter': 'Liter (L)', 'liters': 'Liters (L)', 'l': 'Liters (L)',
      'gram': 'Gram (g)', 'grams': 'Grams (g)', 'g': 'Grams (g)',
      'box': 'Box (box)', 'boxes': 'Boxes (box)',
      'pack': 'Pack (pk)', 'packs': 'Packs (pk)', 'pk': 'Packs (pk)',
      'set': 'Set (set)', 'sets': 'Sets (set)',
      'bottle': 'Bottle (btl)', 'bottles': 'Bottles (btl)', 'btl': 'Bottles (btl)'
    };
    const unitLower = unit.toLowerCase().trim();
    return unitMap[unitLower] || unit.charAt(0).toUpperCase() + unit.slice(1);
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
                {r.items && r.items.length > 1 && (
                  <p className="text-xs text-slate-500">Multiple items ({r.items.length})</p>
                )}
                <span className="badge bg-amber-100 text-amber-700 mt-1">
                  Pending RF Approval
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  className="text-blue-600 hover:bg-blue-50 p-2 rounded-md transition"
                  onClick={() => handleViewRequisition(r)}
                  title="View Details"
                >
                  <Eye size={20} />
                </button>
                <button
                  className="text-green-600 hover:bg-green-50 p-2 rounded-md transition"
                  onClick={() => openConfirm(r, "RF", true)}
                  title="Approve"
                >
                  <CheckCircle size={20} />
                </button>

                <button
                  className="text-red-600 hover:bg-red-50 p-2 rounded-md transition"
                  onClick={() => openConfirm(r, "RF", false)}
                  title="Reject"
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

      {/* Requisition Details Modal */}
      {showRequisitionModal && selectedRequisition && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold">Requisition Details</h3>
                  <p className="text-sm text-slate-500">Material Request (RF)</p>
                </div>
                <button 
                  onClick={closeRequisitionModal}
                  className="text-slate-500 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-slate-700">Request ID</h4>
                    <p className="text-sm text-slate-500">{selectedRequisition.id || 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-700">Status</h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedRequisition.status === 'PENDING APPROVAL' ? 'bg-blue-100 text-blue-800' :
                      selectedRequisition.status === 'APPROVED_BY_VP' || selectedRequisition.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                      selectedRequisition.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedRequisition.status || 'UNKNOWN'}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-700">Request Date</h4>
                    <p className="text-sm text-slate-500">
                      {selectedRequisition.requestDate ? new Date(selectedRequisition.requestDate).toLocaleString() : 
                       selectedRequisition.id ? new Date(selectedRequisition.id).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Supplier Details */}
                {selectedRequisition.supplier && (
                  <div className="border-t border-b border-slate-200 py-4">
                    <h4 className="font-medium text-slate-800 mb-3">Supplier Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h5 className="text-sm font-medium text-slate-600">Supplier Name</h5>
                        <p className="text-sm text-slate-500">{selectedRequisition.supplier?.name || selectedRequisition.supplier || 'N/A'}</p>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-slate-600">Contact</h5>
                        <p className="text-sm text-slate-500">
                          {selectedRequisition.supplier?.contact || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-slate-600">Email</h5>
                        <p className="text-sm text-slate-500">
                          {selectedRequisition.supplier?.email || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Request Items */}
                <div className="border-t border-b border-slate-200 py-4">
                  <h4 className="font-medium text-slate-800 mb-3">Request Items</h4>
                  {selectedRequisition.items && selectedRequisition.items.length > 0 ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-12 gap-2 text-sm font-medium text-slate-500 pb-2 border-b-2 border-slate-200">
                        <div className="col-span-5">Item</div>
                        <div className="col-span-1 text-center">Unit</div>
                        <div className="col-span-2 text-right">Unit Price</div>
                        <div className="col-span-2 text-center">Qty</div>
                        <div className="col-span-2 text-right">Total</div>
                      </div>
                      
                      {selectedRequisition.items.map((item, index) => {
                        const quantity = Number(item.quantity || item.qty) || 1; 
                        const unitPrice = Number(item.unit_price || item.price || item.unitPrice) || 0;
                        const total = quantity * unitPrice;
                        const product = inventory.find(p => p.product_id?.toString() === (item.product_id || item.productId)?.toString());
                        
                        return (
                          <div key={index} className="grid grid-cols-12 gap-2 items-center py-2 border-b border-slate-200 last:border-0">
                            <div className="col-span-5">
                              <p className="font-medium text-slate-800">{item.name || selectedRequisition.item || `Item #${index + 1}`}</p>
                              {item.productId && (
                                <p className="text-xs text-slate-500">ID: {item.productId}</p>
                              )}
                            </div>
                            <div className="col-span-1 text-center">
                              <p className="text-slate-800">{formatUnitType(item.unit || product?.unit)}</p>
                            </div>
                            <div className="col-span-2 text-right">
                              <p className="text-slate-800">₱{unitPrice.toFixed(2)}</p>
                            </div>
                            <div className="col-span-2 text-center">
                              <p className="text-slate-800">{quantity}</p>
                            </div>
                            <div className="col-span-2 text-right">
                              <p className="font-medium text-slate-900">₱{total.toFixed(2)}</p>
                            </div>
                          </div>
                        );
                      })}
                      
                      {/* Request Total */}
                      <div className="border-t-2 border-slate-200 pt-3 mt-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Request Total:</span>
                          <span className="text-lg font-semibold">
                            ₱{selectedRequisition.items.reduce((sum, item) => {
                              const qty = Number(item.quantity || item.qty) || 1;
                              const price = Number(item.unit_price || item.price || item.unitPrice) || 0;
                              return sum + (qty * price);
                            }, 0).toFixed(2)}
                          </span>
                        </div>
                        {selectedRequisition.notes && (
                          <div className="mt-2 pt-2 border-t-2 border-slate-100">
                            <div className="font-medium mb-1">Notes:</div>
                            <div className="text-sm text-slate-600 bg-slate-50 p-2 rounded">
                              {selectedRequisition.notes}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-slate-800 font-medium">{selectedRequisition.item}</p>
                      <p className="text-sm text-slate-500">Quantity: {selectedRequisition.qty}</p>
                      <p className="text-sm text-slate-500">Price: ₱{selectedRequisition.price?.toFixed(2) || '0.00'}</p>
                      <p className="text-sm text-slate-500">Total: ₱{((selectedRequisition.qty || 1) * (selectedRequisition.price || 0)).toFixed(2)}</p>
                    </div>
                  )}
                </div>

                {/* Request History */}
                {selectedRequisition.history && selectedRequisition.history.length > 0 && (
                  <div className="border-b border-slate-200 pb-4">
                    <h4 className="font-medium text-slate-700 mb-2">Request History</h4>
                    <div className="space-y-2 text-sm">
                      {selectedRequisition.history.map((entry, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-2 bg-slate-50 rounded">
                          <div className="flex-shrink-0 w-2 h-2 mt-1.5 rounded-full bg-blue-500"></div>
                          <div>
                            <div className="font-medium">{typeof entry === 'string' ? entry : (entry.status || 'Status Update')}</div>
                            {typeof entry === 'object' && entry.timestamp && (
                              <div className="text-xs text-slate-500">
                                {new Date(entry.timestamp).toLocaleString()}
                                {entry.userName && ` • ${entry.userName}`}
                              </div>
                            )}
                            {typeof entry === 'object' && entry.notes && (
                              <div className="mt-1 text-sm text-slate-600">{entry.notes}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={closeRequisitionModal}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
