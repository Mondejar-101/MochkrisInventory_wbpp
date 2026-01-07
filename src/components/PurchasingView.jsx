import React, { useState } from "react";
import { useSystem } from "../context/SystemContext";
import {
  ShoppingCart,
  FileText,
  BadgeCheck,
  AlertTriangle,
  Eye,
  Download,
} from "lucide-react";
import {
  generatePurchaseOrderPDF,
  generateRequisitionPDF,
} from "../services/pdfService";

export default function PurchasingView() {
  const {
    requisitions,
    createPurchaseOrder,
    purchaseOrders,
    inventory,
    suppliers,
    markPOReadyForDelivery,
  } = useSystem();

  // Get POs sent from department head (status: SENT_TO_MANAGER)
  const pendingPOs = purchaseOrders.filter(
    (po) => po.status === "SENT_TO_MANAGER" || po.status === "SENT_TO_MANAGER"
  );

  // Get approved RFs (status: APPROVED_BY_VP)
  const approvedRFs = requisitions.filter(
    (r) => r.status === "APPROVED_BY_VP" || r.status === "APPROVED"
  );

  // Combine both for display
  const itemsToProcess = [
    ...pendingPOs.map((po) => ({ type: "PO", data: po })),
    ...approvedRFs.map((rf) => ({ type: "RF", data: rf })),
  ];

  const [selectedItem, setSelectedItem] = useState(null);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [pdfBlob, setPdfBlob] = useState(null);

  const handleViewPDF = async (item) => {
    try {
      setSelectedItem(item);
      let pdfBlob;

      if (item.type === "PO") {
        // Prepare PO data with proper structure
        const poData = {
          ...item.data,
          poNumber: item.data.id || `PO-${Date.now()}`,
          items: item.data.items || [
            {
              name: item.data.item || "Unknown Item",
              quantity: item.data.qty || 1,
              unitPrice: item.data.price || 0,
              price: item.data.price || 0,
            },
          ],
          supplier: item.data.supplier?.name || item.data.supplier || "N/A",
          createdAt: item.data.createdAt || new Date().toISOString(),
        };
        pdfBlob = await generatePurchaseOrderPDF(poData, false); // false = don't download
      } else {
        pdfBlob = await generateRequisitionPDF(item.data, false); // false = don't download
      }

      if (pdfBlob) {
        setPdfBlob(pdfBlob);
        setShowPDFModal(true);
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    }
  };

  const handleGeneratePO = async (item) => {
    try {
      let poData;
      if (item.type === "PO") {
        // Prepare PO data with proper structure
        poData = {
          ...item.data,
          poNumber: item.data.id || Date.now().toString(),
          items: item.data.items || [
            {
              name: item.data.item || "Unknown Item",
              quantity: item.data.qty || 1,
              unitPrice: item.data.price || 0,
              price: item.data.price || 0,
            },
          ],
          supplier: item.data.supplier?.name || item.data.supplier || "N/A",
          createdAt: item.data.createdAt || new Date().toISOString(),
        };
      } else {
        // Convert RF to PO format and generate
        poData = {
          ...item.data,
          poNumber: item.data.id?.toString() || Date.now().toString(),
          items: item.data.items || [
            {
              name: item.data.item,
              quantity: item.data.qty,
              unitPrice: item.data.price || 0,
              price: item.data.price || 0,
            },
          ],
          supplier: item.data.supplier?.name || item.data.supplier || "N/A",
          createdAt: item.data.requestDate || new Date().toISOString(),
        };
      }

      // Generate and download PDF
      await generatePurchaseOrderPDF(poData, true);

      // Update PO status to "SENT TO MANAGER" so it appears in Receiving & Delivery
      const poId = item.data.id || item.data.id?.toString();
      if (poId && markPOReadyForDelivery) {
        markPOReadyForDelivery(poId);
      }

      alert(
        "Purchase Order PDF generated and downloaded successfully! The PO has been sent to Receiving & Delivery."
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    }
  };

  const closePDFModal = () => {
    setShowPDFModal(false);
    setSelectedItem(null);
    setPdfBlob(null);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <h2 className="text-xl font-bold text-slate-800 mb-2">
        Procurement & PO Creation
      </h2>
      <p className="text-slate-500 text-sm mb-4">
        Purchase Orders and approved Requisition Forms from Department Head
        ready for processing.
      </p>

      {/* ---------------- Items to Process ---------------- */}
      <div className="grid gap-6">
        {itemsToProcess.length === 0 && (
          <p className="text-slate-400 card text-center py-8">
            No items need processing at the moment.
          </p>
        )}

        {itemsToProcess.map((item) => {
          const isPO = item.type === "PO";
          const data = item.data;
          const items = isPO
            ? data.items || []
            : data.items || [
                {
                  name: data.item,
                  quantity: data.qty,
                  unitPrice: data.price || 0,
                  price: data.price || 0,
                },
              ];
          const supplier = isPO
            ? data.supplier?.name || data.supplier || "N/A"
            : data.supplier?.name || data.supplier || "N/A";

          return (
            <div
              key={`${item.type}-${data.id}`}
              className="card card-hover animate-slideUp border-l-4 border-indigo-500"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-bold text-lg">
                    {isPO ? "Purchase Order" : "Requisition Form"}
                  </p>
                  <p className="text-slate-500 text-sm">
                    {isPO ? `PO ID: ${data.id}` : `RF ID: ${data.id}`}
                  </p>
                  <p className="text-slate-500 text-sm">Supplier: {supplier}</p>
                  {items.length > 0 && (
                    <p className="text-slate-500 text-sm mt-1">
                      Items: {items.length} item(s)
                    </p>
                  )}
                </div>

                <span
                  className={`badge ${
                    isPO
                      ? "bg-blue-100 text-blue-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {isPO ? "Purchase Order" : "Approved RF"}
                </span>
              </div>

              {/* Items List */}
              {items.length > 0 && (
                <div className="bg-white p-4 rounded-lg border border-slate-200 mb-4">
                  <p className="font-semibold text-sm text-slate-700 mb-2">
                    Items:
                  </p>
                  <div className="space-y-2">
                    {items.map((it, idx) => (
                      <div
                        key={idx}
                        className="text-sm text-slate-600 border-b pb-2 last:border-0"
                      >
                        <span className="font-medium">
                          {it.name || it.item}
                        </span>
                        <span className="ml-2">
                          Qty: {it.quantity || it.qty} × ₱
                          {parseFloat(it.unitPrice || it.price || 0).toFixed(2)}
                        </span>
                        <span className="ml-2 text-slate-500">
                          = ₱
                          {(
                            (it.quantity || it.qty) *
                            (it.unitPrice || it.price || 0)
                          ).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-2 border-t">
                    <p className="text-sm font-semibold text-slate-800">
                      Total: ₱
                      {items
                        .reduce((sum, it) => {
                          const qty = it.quantity || it.qty || 0;
                          const price = it.unitPrice || it.price || 0;
                          return sum + qty * price;
                        }, 0)
                        .toFixed(2)}
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleViewPDF(item)}
                  className="flex-1 btn-soft flex items-center justify-center gap-2"
                >
                  <Eye size={16} />
                  View PDF
                </button>
                <button
                  onClick={() => handleGeneratePO(item)}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  <Download size={16} />
                  Generate Purchase Order (PO)
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ---------------- PDF Preview Modal ---------------- */}
      {showPDFModal && pdfBlob && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">
                {selectedItem?.type === "PO"
                  ? "Purchase Order PDF"
                  : "Requisition Form PDF"}
              </h3>
              <button
                onClick={closePDFModal}
                className="text-slate-500 hover:text-slate-700 text-2xl"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <iframe
                src={URL.createObjectURL(pdfBlob)}
                className="w-full h-full"
                title="PDF Preview"
              />
            </div>
            <div className="p-4 border-t flex justify-end gap-3">
              <button onClick={closePDFModal} className="btn-soft">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
