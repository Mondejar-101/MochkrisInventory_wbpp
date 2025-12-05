import React from "react";
import { useSystem } from "../../context/SystemContext";
import { 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  ClipboardList, 
  ShoppingCart, 
  Truck 
} from "lucide-react";

// --- Card Component ---
const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4 hover:shadow-md transition-all duration-300 card-hover animate-fadeIn">
    <div className={`p-4 rounded-full ${color} shadow-inner`}>
      {Icon && <Icon size={26} className="text-white" />}
    </div>
    <div>
      <p className="text-slate-500 text-xs font-medium">{title}</p>
      <h3 className="text-xl font-bold text-slate-800 mt-1">{value}</h3>
    </div>
  </div>
);

// --- Dashboard ---
export default function DashboardStats() {
  const { inventory, requisitions, purchaseOrders } = useSystem();

  if (!inventory || !requisitions) {
    return <div className="p-4">Loading system data...</div>;
  }

  // --- BUSINESS-FLOW ACCURATE COUNTS ---
  const lowStock = inventory.filter(i => i.qty < 3).length;

  const pendingRF = requisitions.filter(
    r => r.status === "PENDING_VP_APPROVAL"
  ).length;

  const forPurchasing = requisitions.filter(
    r => r.status === "FORWARDED_TO_PURCHASING"
  ).length;

  const ongoingPO = purchaseOrders.filter(
    p => p.status !== "COMPLETED"
  ).length;

  const completedTransactions = requisitions.filter(
    r => r.status === "COMPLETED"
  ).length;

  return (
    <div className="space-y-8 animate-fadeIn">

      {/* Title */}
      <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
        <Clock size={20} className="text-indigo-600" />
        Dashboard Overview
      </h2>

      {/* --- Stat Cards ---- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">

        <StatCard 
          title="Total Inventory Items"
          value={inventory.length}
          icon={Package}
          color="bg-blue-600"
        />

        <StatCard  
          title="Low Stock Items"
          value={lowStock}
          icon={AlertTriangle}
          color="bg-orange-500"
        />

        <StatCard  
          title="Requisitions Pending VP"
          value={pendingRF}
          icon={ClipboardList}
          color="bg-amber-600"
        />

        <StatCard  
          title="Forwarded to Purchasing"
          value={forPurchasing}
          icon={ShoppingCart}
          color="bg-indigo-600"
        />

        <StatCard  
          title="Active Purchase Orders"
          value={ongoingPO}
          icon={Truck}
          color="bg-emerald-600"
        />

        <StatCard  
          title="Completed Requests"
          value={completedTransactions}
          icon={CheckCircle}
          color="bg-green-600"
        />
      </div>

      {/* --- Inventory Table ---- */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 card-hover">
        <h3 className="font-semibold text-lg text-slate-800 mb-4">
          Current Inventory Levels
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="text-slate-500 bg-slate-100 border-b border-slate-200 text-xs uppercase tracking-wide">
                <th className="py-3 px-3">Item</th>
                <th className="py-3 px-3">Stock Level</th>
                <th className="py-3 px-3">Status</th>
              </tr>
            </thead>

            <tbody>
              {inventory.map((item, idx) => (
                <tr 
                  key={item.id}
                  className={`border-b border-slate-100 ${
                    idx % 2 === 0 ? "bg-white" : "bg-slate-50"
                  } hover:bg-slate-100 transition`}
                >
                  <td className="py-3 px-3 text-slate-700 font-medium">{item.name}</td>
                  <td className="py-3 px-3 text-slate-700">{item.qty} {item.unit}</td>

                  <td className="py-3 px-3">
                    {item.qty === 0 ? (
                      <span className="badge bg-red-100 text-red-700">
                        Out of Stock
                      </span>
                    ) : item.qty < 5 ? (
                      <span className="badge bg-orange-100 text-orange-700">
                        Low Stock
                      </span>
                    ) : (
                      <span className="badge bg-emerald-100 text-emerald-700">
                        In Stock
                      </span>
                    )}
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
