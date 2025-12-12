import React from 'react';
import {
  LayoutDashboard,
  FilePlus,
  CheckSquare,
  Package,
  ShoppingCart,
  Truck,
  Boxes,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({
  currentRole,
  activeTab,
  setActiveTab,
  sidebarOpen,
  setSidebarOpen
}) {

  const getMenuItems = () => {
    const base = [
      { id: "dashboard", label: "Dashboard Overview", icon: LayoutDashboard }
    ];

    switch (currentRole) {
      case "DEPARTMENT":
        return [
          ...base,
          { id: "requisition", label: "New Material Request (RF)", icon: FilePlus }
        ];

      case "VP":
        return [
          ...base,
          { id: "approvals", label: "Pending RF Approvals", icon: CheckSquare }
        ];

      case "CUSTODIAN":
        return [
          ...base,
          { id: "inventory", label: "Inventory Monitoring", icon: Boxes },
          { id: "delivery", label: "Receiving & Delivery (RM/AR)", icon: Truck }
        ];

    case "PURCHASING":
  return [
    ...base,
    { id: "purchasing", label: "Procurement & PO Creation", icon: ShoppingCart },
    { id: "direct_purchase", label: "Direct Purchase", icon: ShoppingCart }
  ];

      default:
        return base;
    }
  };

  const items = getMenuItems();

  return (
    <aside
      className={`
        fixed top-0 left-0 h-full z-50 bg-slate-900 text-white
        w-64 transform transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-64 md:translate-x-0"}
      `}
    >
      {/* ---- BRAND HEADER ---- */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="w-9 h-9 bg-indigo-500 rounded-lg flex items-center justify-center shadow-md">
          <Package size={20} className="text-white" />
        </div>
        <h1 className="font-semibold text-lg tracking-wide">FurniTrack</h1>
      </div>

      {/* ---- NAVIGATION ---- */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scroll">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === activeTab;

          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false); // auto-close on mobile
              }}
              className={`
                group w-full flex items-center justify-between px-4 py-3 rounded-lg
                transition-all duration-200 relative
                ${isActive
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"}
              `}
            >
              <div className="flex items-center gap-3">
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </div>

              {/* Active indicator */}
              {isActive && (
                <ChevronRight size={18} className="opacity-80" />
              )}
            </button>
          );
        })}
      </nav>

      {/* ---- FOOTER ---- */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-400">
        <div className="bg-slate-800 rounded-lg p-3">
          <p className="font-semibold text-slate-200">System v1.0.0</p>
          <p className="opacity-75">Material Inventory Workflow</p>
        </div>
      </div>

      {/* Custom scroll styling */}
      <style>{`
        .custom-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.15);
          border-radius: 10px;
        }
      `}</style>
    </aside>
  );
}
