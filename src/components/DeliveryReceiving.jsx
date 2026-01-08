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
  const { purchaseOrders, receiveDelivery, suppliers } = useSystem();
  const [selectedPO, setSelectedPO] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [historySearchTerm, setHistorySearchTerm] = useState('');

  console.log('All purchaseOrders in DeliveryReceiving:', purchaseOrders);
  
  // Helper function to get supplier details
  const getSupplierDetails = (supplierName) => {
    if (!supplierName || !suppliers) return { contact: 'N/A', email: 'N/A' };
    const supplier = suppliers.find(s => s.name === supplierName);
    return supplier ? { 
      contact: supplier.contact || 'N/A', 
      email: supplier.email || 'N/A' 
    } : { contact: 'N/A', email: 'N/A' };
  };

  // Helper function to normalize PO data
  const normalizePO = (po) => {
    console.log('=== Normalizing PO ===');
    console.log('Original PO:', po);
    
    // Handle different date field names
    const createdAt = po.createdAt || po.created || po.updatedAt;
    console.log('Date fields found:', {
      createdAt: po.createdAt,
      created: po.created,
      updatedAt: po.updatedAt,
      selected: createdAt
    });
    
    // Handle different item field structures
    let items = [];
    if (po.items && Array.isArray(po.items) && po.items.length > 0) {
      items = po.items.map(item => ({
        ...item,
        // Ensure unitPrice is set from price field if missing
        unitPrice: item.unitPrice || item.price || item.unit_price || 0
      }));
      console.log('Using items array with unitPrice mapping:', items);
    } else if (po.item && po.qty) {
      // Single item format - include all possible price fields
      items = [{
        name: po.item,
        quantity: po.qty,
        unitPrice: po.price || po.unitPrice || po.unit_price || 0,
        unit: po.unit || 'pcs',
        productId: po.product_id
      }];
      console.log('Created single item:', items);
    } else {
      console.log('No items found, checking all possible fields:', {
        items: po.items,
        item: po.item,
        qty: po.qty,
        quantity: po.quantity
      });
    }
    
    const normalized = { ...po, createdAt, items };
    console.log('Normalized PO:', normalized);
    console.log('=== End Normalization ===');
    
    return normalized;
  };
  
  const incomingDeliveries = purchaseOrders
    .filter((po) => {
      const isMatch = po.status === "SENT TO MANAGER";
      console.log(`PO ${po.id} status: ${po.status} - ${isMatch ? 'MATCH' : 'no match'}`);
      console.log(`Raw PO data:`, po);
      return isMatch;
    });

  // Create delivery history from all purchase orders (both incoming and processed)
  const deliveryHistory = purchaseOrders
    .filter(po => po.status !== "SENT TO MANAGER") // Exclude incoming deliveries
    .map(po => ({
      poId: po.id,
      action: po.status === "COMPLETED" ? "Accepted" : 
             po.status === "RETURNED_TO_SUPPLIER" ? "Rejected" : 
             po.status,
      supplier: po.supplier,
      items: po.items || [],
      timestamp: po.processedAt || po.acceptedAt || po.updatedAt || po.createdAt // Use processing time first
    }))
    .sort((a, b) => {
      // Sort by date only - newer dates first
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      
      // Debug: Log actual timestamps and comparison
      console.log('Sorting comparison:', {
        a_timestamp: a.timestamp,
        b_timestamp: b.timestamp,
        a_date: dateA.toDateString(),
        b_date: dateB.toDateString(),
        result: dateB - dateA
      });
      
      return dateB - dateA;
    });

  console.log('All purchaseOrders:', purchaseOrders);
  console.log('Delivery history:', deliveryHistory);

  // Filter delivery history based on search term
  const filteredDeliveryHistory = deliveryHistory.filter(entry => {
    const searchLower = historySearchTerm.toLowerCase();
    const matchesId = entry.poId.toLowerCase().includes(searchLower);
    const matchesStatus = entry.action.toLowerCase().includes(searchLower);
    
    // Date matching - check if search term matches date format or parts of date
    const entryDate = new Date(entry.timestamp);
    const dateStr = entryDate.toLocaleString().toLowerCase();
    const dateStrShort = entryDate.toLocaleDateString().toLowerCase();
    const matchesDate = dateStr.includes(searchLower) || dateStrShort.includes(searchLower);
    
    return matchesId || matchesStatus || matchesDate;
  }).sort((a, b) => {
      // Sort by date only - newer dates first
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return dateB - dateA;
    });

  console.log('Filtered incomingDeliveries:', incomingDeliveries);

  const openConfirm = (po, damaged) => {
    console.log('openConfirm called with PO:', po);
    const normalizedPO = normalizePO(po);
    console.log('Normalized PO:', normalizedPO);
    setSelectedPO({ ...normalizedPO, damaged });
  };

  const closeConfirm = () => setSelectedPO(null);

  const confirmAction = async () => {
    console.log('Confirming delivery for PO:', selectedPO.id, 'Damaged:', selectedPO.damaged);
    try {
      // Add processing timestamp to track when delivery was actually processed
      const processingData = {
        ...selectedPO,
        processedAt: new Date().toISOString(),
        acceptedAt: selectedPO.damaged ? null : new Date().toISOString()
      };
      
      await receiveDelivery(selectedPO.id, selectedPO.damaged, processingData);
      console.log('Delivery processed successfully at:', processingData.processedAt);
      closeConfirm();
      // Force a refresh by clearing and resetting modal
      setSelectedPO(null);
    } catch (error) {
      console.error('Error processing delivery:', error);
      alert('Error processing delivery. Please try again.');
    }
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

      {/* History Section */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <FileText size={20} className="text-indigo-600" />
            History
          </h3>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <FileText size={16} />
            {showHistory ? 'Hide History' : 'Show History'}
          </button>
        </div>
        
        {showHistory && (
          <div className="space-y-3">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search by PO ID, Status (Accepted/Rejected), and Date (MM/DD/YYYY)"
                value={historySearchTerm}
                onChange={(e) => setHistorySearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            {filteredDeliveryHistory.length === 0 ? (
              <p className="text-slate-400 text-center py-4">
                {historySearchTerm ? 'No matching delivery history found.' : 'No delivery history found.'}
              </p>
            ) : (
              filteredDeliveryHistory.map((entry, idx) => (
                <div key={idx} className="border-b border-slate-100 pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-slate-800">
                        PO #{entry.poId} - <span className={
                          entry.action === 'Accepted' ? 'text-green-600 font-semibold' :
                          entry.action === 'Rejected' ? 'text-red-600 font-semibold' :
                          'text-slate-800'
                        }>{entry.action}</span>
                      </p>
                      <p className="text-sm text-slate-600">
                        {entry.supplier && `Supplier: ${entry.supplier}`}
                        {entry.items && ` • ${entry.items.length} item(s)`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">
                        {new Date(entry.timestamp).toLocaleString()}
                      </p>
                      <button
                        onClick={() => {
                          // Find the original PO from purchaseOrders to view details
                          const originalPO = purchaseOrders.find(po => po.id === entry.poId);
                          if (originalPO) {
                            // Open the same modal as incoming deliveries
                            setSelectedPO({ ...originalPO, isHistoryView: true });
                          }
                        }}
                        className="px-3 py-1 bg-indigo-600 text-white text-xs rounded-md hover:bg-indigo-700 transition-colors"
                        title="View Details"
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* --- Purchase Order Details Modal --- */}
      {selectedPO && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              {console.log('Complete selectedPO object:', selectedPO)}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold">
                    {selectedPO.isHistoryView ? 'Purchase Order Details' : 
                     (selectedPO.damaged ? "Return to Supplier?" : "Accept Delivery?")}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {selectedPO.isHistoryView ? 'Historical Purchase Order Record' :
                     (selectedPO.damaged ? 'Marking as damaged and returning to supplier' :
                      'Processing incoming delivery')}
                  </p>
                </div>
                <button 
                  onClick={closeConfirm}
                  className="text-slate-500 hover:text-slate-700"
                >
                  ✕
                </button>  
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <h4 className="font-medium text-slate-700">Purchase Order ID</h4>
                    <p className="text-sm text-slate-500">{selectedPO.id || 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-700">Created</h4>
                    <p className="text-sm text-slate-500">
                      {selectedPO.createdAt ? new Date(selectedPO.createdAt).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                  {selectedPO.isHistoryView && (
                    <div>
                      <h4 className="font-medium text-slate-700">Received</h4>
                      <p className="text-sm text-slate-500">
                        {selectedPO.processedAt ? new Date(selectedPO.processedAt).toLocaleString() :
                         selectedPO.acceptedAt ? new Date(selectedPO.acceptedAt).toLocaleString() :
                         selectedPO.updatedAt ? new Date(selectedPO.updatedAt).toLocaleString() :
                         selectedPO.createdAt ? new Date(selectedPO.createdAt).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                  )}
                  <div>
                    <h4 className="font-medium text-slate-700 text-center">Status</h4>
                    <div className="flex justify-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedPO.status === 'SENT TO MANAGER' ? 'bg-blue-100 text-blue-800' :
                        selectedPO.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        selectedPO.status === 'RETURNED_TO_SUPPLIER' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedPO.status === 'SENT TO MANAGER' ? 'Pending' :
                         selectedPO.status === 'COMPLETED' ? 'Accepted' :
                         selectedPO.status === 'RETURNED_TO_SUPPLIER' ? 'Rejected' :
                         selectedPO.status || 'UNKNOWN'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Supplier Details */}
                <div className="border-t border-b border-slate-200 py-4">
                  <h4 className="font-medium text-slate-800 mb-3">Supplier Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h5 className="text-sm font-medium text-slate-600">Supplier Name</h5>
                      <p className="text-sm text-slate-500">{selectedPO.supplier || 'N/A'}</p>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-slate-600">Contact</h5>
                      <p className="text-sm text-slate-500">
                        {(() => {
                          const supplierDetails = getSupplierDetails(selectedPO.supplier);
                          return supplierDetails.contact;
                        })()}
                      </p>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-slate-600">Email</h5>
                      <p className="text-sm text-slate-500">
                        {(() => {
                          const supplierDetails = getSupplierDetails(selectedPO.supplier);
                          return supplierDetails.email;
                        })()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-b border-slate-200 py-4">
                  <h4 className="font-medium text-slate-800 mb-3">Order Items</h4>
                  {console.log('Selected PO items:', selectedPO.items)}
                  {selectedPO.items && selectedPO.items.length > 0 ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-12 gap-2 text-sm font-medium text-slate-500 pb-2 border-b-2 border-slate-200">
                        <div className="col-span-5">Item</div>
                        <div className="col-span-1 text-center">Unit Type</div>
                        <div className="col-span-2 text-right">Unit Price</div>
                        <div className="col-span-2 text-center">Qty</div>
                        <div className="col-span-2 text-right">Total</div>
                      </div>
                      
                      {selectedPO.items.map((item, index) => {
                        const quantity = Number(item.quantity || item.qty) || 1; 
                        const unitPrice = Number(item.price || item.unitPrice || item.unit_price || 0);
                        const total = quantity * unitPrice;
                        const hasValidPrice = unitPrice > 0;
                        
                        return (
                          <div key={index} className="grid grid-cols-12 gap-2 items-center py-2 border-b border-slate-200 last:border-0">
                            <div className="col-span-5">
                              <p className="font-medium text-slate-800">{item.name || item.item || `Item #${index + 1}`}</p>
                              {item.productId && (
                                <p className="text-xs text-slate-500">ID: {item.productId}</p>
                              )}
                            </div>
                            <div className="col-span-1 text-center text-sm text-slate-600">
                              {item.unit || 'pcs'}
                            </div>
                            <div className="col-span-2 text-right text-sm text-slate-600">
                              {hasValidPrice ? `₱${unitPrice.toFixed(2)}` : 'N/A'}
                            </div>
                            <div className="col-span-2 text-center text-sm text-slate-600">
                              {quantity}
                            </div>
                            <div className="col-span-2 text-right font-medium text-slate-800">
                              {hasValidPrice ? `₱${total.toFixed(2)}` : 'N/A'}
                            </div>
                          </div>
                        );
                      })}
                      
                      <div className="flex justify-between items-center pt-2 border-t-2 border-slate-200">
                        <span className="font-semibold text-slate-700">Total Amount:</span>
                        <span className="text-lg font-bold text-slate-800">
                          {(() => {
                            const total = selectedPO.items.reduce((sum, item) => {
                              const quantity = Number(item.quantity || item.qty) || 1;
                              const unitPrice = Number(item.price || item.unitPrice || item.unit_price || 0);
                              return sum + (quantity * unitPrice);
                            }, 0);
                            return total > 0 ? `₱${total.toFixed(2)}` : 'N/A';
                          })()}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Package className="mx-auto text-slate-400 mb-2" size={32} />
                      <p className="text-slate-500">No items found</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons for Incoming Deliveries */}
                {!selectedPO.isHistoryView && (
                  <div className="border-t border-slate-200 pt-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                      <p className="text-sm text-blue-800">
                        {selectedPO.damaged 
                          ? `You are marking PO #${selectedPO.id} as damaged. Items will be returned to the supplier.`
                          : `You are accepting PO #${selectedPO.id}. RM and AR will be generated and items will be routed to the requester.`}
                      </p>
                    </div>
                    
                    <div className="flex gap-3">
                      <button onClick={closeConfirm} className="btn-soft px-4 py-2">
                        Cancel
                      </button>
                      <button
                        onClick={confirmAction}
                        className={`btn-primary px-4 py-2 ${
                          selectedPO.damaged ? "bg-red-600 hover:bg-red-700" : ""
                        }`}
                      >
                        {selectedPO.damaged ? "Confirm Return" : "Accept Delivery"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Close Button for History View */}
                {selectedPO.isHistoryView && (
                  <div className="border-t border-slate-200 pt-4">
                    <div className="flex justify-end">
                      <button onClick={closeConfirm} className="btn-primary px-4 py-2">
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
