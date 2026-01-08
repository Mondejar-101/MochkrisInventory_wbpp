import React from 'react';
import { Package, AlertTriangle, CheckCircle, Clock, ClipboardList, ShoppingCart, Truck, PlusCircle } from "lucide-react";
import { useSystem } from "../../context/SystemContext";

export default function DashboardStats({ role, onCreatePO, onCreateRF }) {
  const { inventory, requisitions, purchaseOrders } = useSystem();

  // Check if data is still loading (initial render or data fetching)
  const [isLoading, setIsLoading] = React.useState(false);
  
  // Log inventory changes
  React.useEffect(() => {
    console.log('DashboardStats - inventory updated:', inventory);
  }, [inventory]);

  React.useEffect(() => {
    // Set loading to false once we have data
    if (inventory && requisitions) {
      setIsLoading(false);
    }
  }, [inventory, requisitions]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Filter inventory to only show items with actual stock (same as inventory table)
  const visibleInventory = inventory.filter(item => item.qty > 0);
  
  const totalItems = visibleInventory.length;
  const lowStock = visibleInventory.filter(i => i.qty < i.restockThreshold).length;
  const pendingRF = requisitions.filter(r => r.status === "PENDING APPROVAL").length;
  const forPurchasing = requisitions.filter(r => r.status === "FORWARDED_TO_PURCHASING").length;
  const ongoingPO = purchaseOrders.filter(p => p.status !== "COMPLETED").length;
  const completedTransactions = requisitions.filter(r => r.status === "COMPLETED").length;

  return (
    <div className="space-y-8 animate-fadeIn">
      <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
        <Clock size={20} className="text-indigo-600" />
        Dashboard Overview
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <StatCard title="Total Inventory Items" value={totalItems} icon={Package} color="bg-blue-600" />
        <StatCard title="Low Stock Items" value={lowStock} icon={AlertTriangle} color="bg-orange-500" />
        <StatCard title="Req. Pending" value={pendingRF} icon={ClipboardList} color="bg-amber-600" />
        <StatCard title="Forwarded to Purchasing" value={forPurchasing} icon={ShoppingCart} color="bg-indigo-600" />
        <StatCard title="Active Purchase Orders" value={ongoingPO} icon={Truck} color="bg-emerald-600" />
        <StatCard title="Completed Requests" value={completedTransactions} icon={CheckCircle} color="bg-green-600" />
      </div>

      {/* Inventory table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 card-hover">
        <h3 className="font-semibold text-lg text-slate-800 mb-4">Current Inventory Levels</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="text-slate-500 bg-slate-100 border-b border-slate-200 text-xs uppercase tracking-wide">
                <th className="py-3 px-3 text-center">Item</th>
                <th className="py-3 px-3 text-center">Stock Level</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[...inventory]
                .filter(item => item.qty > 0) // Only show items with actual stock
                .sort((a, b) => {
                // Sort by creation date (newest first) - use product_id as fallback since inventory items don't have creation date
                return b.product_id - a.product_id;
              }).map((item, idx) => (
                  <tr key={item.product_id} className={`border-b border-slate-100 ${idx % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-slate-100 transition`}>
                    <td className="py-3 px-3 text-slate-700 font-medium text-center">
                      {item.name}
                    </td>
                    <td className="py-3 px-3 text-slate-700 text-center">{item.qty}</td>
                    <td className="py-3 px-3 text-center">
                      {item.qty === 0 ? (
                        <span className="badge bg-red-100 text-red-700">Out of Stock</span>
                      ) : item.qty < item.restockThreshold ? (
                        <span className="badge bg-orange-100 text-orange-700">Low Stock • Restock Needed</span>
                      ) : (
                        <span className="badge bg-emerald-100 text-emerald-700">In Stock</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex gap-2 justify-center">
                        {role === 'DEPARTMENT' && onCreatePO && (
                          <button
                            className="flex items-center gap-1 text-sm bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 transition"
                            onClick={() => onCreatePO(item)}
                          >
                            <PlusCircle size={16} /> Create PO
                          </button>
                        )}
                        {role === 'CUSTODIAN' && onCreateRF && (
                          <button
                            className="flex items-center gap-1 text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                            onClick={() => onCreateRF(item)}
                          >
                            <PlusCircle size={16} /> Create RF
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const StatCard = ({ title, value, icon: Icon, color }) => {
  // Abbreviate longer titles
  const getAbbreviatedTitle = (text) => {
    const abbreviations = {
      'Active Purchase Orders': 'Active POs',
      'Requisitions Pending VP': 'Req. Pending VP',
      'Forwarded to Purchasing': 'To Purchasing',
      'Total Inventory Items': 'Total Items',
      'Low Stock Items': 'Low Stock',
      'Completed Requests': 'Completed',
    };
    return abbreviations[text] || text;
  };

  return (
    <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-300 card-hover animate-fadeIn h-20 flex items-center">
      <div className={`p-2 rounded-full ${color} shadow-inner flex-shrink-0 mr-3`}>
        {Icon && <Icon size={18} className="text-white" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-slate-500 text-xs font-medium leading-tight whitespace-nowrap">
          {getAbbreviatedTitle(title)}
        </p>
        <h3 className="text-xl font-bold text-slate-800">{value}</h3>
      </div>
    </div>
  );
};
