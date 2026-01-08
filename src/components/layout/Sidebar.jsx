import React, { useState } from 'react';
import {
  LayoutDashboard,
  FilePlus,
  CheckSquare,
  Package,
  ShoppingCart,
  Truck,
  Boxes,
  ChevronRight,
  ChevronDown,
  Settings,
  Home,
  PlusCircle,
  Clock
} from 'lucide-react';

// Sidebar component for navigation

export default function Sidebar({
  currentRole,
  activeTab,
  setActiveTab,
  sidebarOpen,
  setSidebarOpen
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getMenuItems = () => {
    const base = [
      { id: "dashboard", label: "Dashboard Overview", icon: LayoutDashboard }
    ];

    switch (currentRole) {
      case "DEPARTMENT":
        return [
          ...base,
          { id: "material_order", label: "New Material Order (PO)", icon: ShoppingCart },
          { 
            id: "inventory_stocks", 
            label: "Inventory Stocks", 
            icon: Boxes,
            isDropdown: true,
            children: [
              { id: "material_stock", label: "Material Stocks", icon: Package },
              { id: "furniture_stock", label: "Furniture Stocks", icon: Home }
            ]
          },
          { 
            id: "dispense_history", 
            label: "Dispense History", 
            icon: Clock,
            isDropdown: true,
            children: [
              { id: "material_dispense", label: "Material", icon: Package },
              { id: "furniture_dispense", label: "Furniture", icon: Home }
            ]
          },
          { id: "approvals", label: "Pending RF Approvals", icon: CheckSquare },
          { id: "management", label: "Manage Items & Suppliers", icon: Settings }
        ];

      case "VP":
        return [
          ...base
        ];

      case "CUSTODIAN":
        return [
          ...base,
          { id: "requisition", label: "New Material Request (RF)", icon: FilePlus },
          { id: "add_furniture", label: "Add Furniture Stocks", icon: PlusCircle },
          { 
            id: "inventory_stocks", 
            label: "Inventory", 
            icon: Boxes,
            isDropdown: true,
            children: [
              { id: "material_stock", label: "Material Stocks", icon: Package },
              { id: "furniture_stock", label: "Furniture Stocks", icon: Home }
            ]
          },
          { 
            id: "dispense_history", 
            label: "Dispense History", 
            icon: Clock,
            isDropdown: true,
            children: [
              { id: "material_dispense", label: "Material", icon: Package },
              { id: "furniture_dispense", label: "Furniture", icon: Home }
            ]
          },
          { id: "purchasing", label: "Procurement & PO Creation", icon: ShoppingCart },
          { id: "delivery", label: "Receiving & Delivery (RM/AR)", icon: Truck },
          { id: "management", label: "Manage Items & Suppliers", icon: Settings }
        ];

    case "PURCHASING":
      return [
        ...base
      ];
    
    case "ADMIN":
      return [
        ...base,
        { id: "management", label: "Manage Items & Suppliers", icon: Settings }
      ];
      
    case "GENERAL_MANAGER":
      return [
        ...base,
        { id: "material_request", label: "New Material Request (RF)", icon: FilePlus },
        { id: "approvals", label: "Pending RF Approvals", icon: CheckSquare },
        { 
          id: "inventory_stocks", 
          label: "Inventory Stocks", 
          icon: Boxes,
          isDropdown: true,
          children: [
            { id: "material_stock", label: "Material Stocks", icon: Package },
            { id: "furniture_stock", label: "Furniture Stocks", icon: Home }
          ]
        },
        { id: "management", label: "Manage Items & Suppliers", icon: Settings }
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
          const isDropdownActive = item.children?.some(child => child.id === activeTab);

          if (item.isDropdown) {
            return (
              <div key={item.id} className="space-y-1">
                <button
                  onClick={() => setDropdownOpen(dropdownOpen === item.id ? false : item.id)}
                  className={`
                    group w-full flex items-center justify-between px-4 py-3 rounded-lg
                    transition-all duration-200 relative
                    ${isDropdownActive || dropdownOpen === item.id
                      ? "bg-indigo-600 text-white shadow-lg"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <ChevronDown 
                    size={18} 
                    className={`transition-transform duration-200 ${
                      dropdownOpen === item.id ? "rotate-180" : ""
                    }`} 
                  />
                </button>
                
                {dropdownOpen === item.id && (
                  <div className="ml-4 space-y-1 animate-slideDown">
                    {item.children.map((child) => {
                      const ChildIcon = child.icon;
                      const isChildActive = child.id === activeTab;
                      
                      return (
                        <button
                          key={child.id}
                          onClick={() => {
                            setActiveTab(child.id);
                            setSidebarOpen(false); // auto-close on mobile
                          }}
                          className={`
                            w-full flex items-center gap-3 px-4 py-2 rounded-lg
                            transition-all duration-200
                            ${isChildActive
                              ? "bg-indigo-400 text-white"
                              : "text-slate-400 hover:bg-slate-700 hover:text-white"}
                          `}
                        >
                          <ChildIcon size={16} />
                          <span className="text-sm font-medium">{child.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

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
