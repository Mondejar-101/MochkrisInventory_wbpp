import React from "react";
import { UserCircle, Bell, Menu } from "lucide-react";

export default function Header({
  currentRole,
  setCurrentRole,
  activeTab,
  setSidebarOpen
}) {
  // Dynamic page title based on active tab
  const pageTitles = {
    dashboard: "Dashboard Overview",
    requisition: "New Material Request (RF)",
    approvals: "Requisition Approvals",
    inventory: "Inventory Monitoring",
    delivery: "Receiving & Delivery (RM/AR)",
    purchasing: "Procurement & Purchase Orders",
  };

  const title = pageTitles[activeTab] || "FurniTrack System";

  return (
    <header
      className="
        h-16 bg-white border-b border-slate-200 
        flex items-center justify-between px-4 md:px-8 
        fixed top-0 right-0 left-0 md:left-64
        z-20 shadow-sm
      "
    >
      {/* ---- MOBILE MENU BUTTON ---- */}
      <button
        className="md:hidden text-slate-600 hover:text-indigo-600 p-2"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu size={24} />
      </button>

      {/* ---- PAGE TITLE / BREADCRUMB ---- */}
      <div className="flex flex-col">
        <span className="text-[11px] text-slate-400 uppercase tracking-wide">
          {currentRole === "VP"
            ? "Top Management"
            : currentRole === "DEPARTMENT"
            ? "Department Head"
            : currentRole === "CUSTODIAN"
            ? "Warehouse / Property Custodian"
            : currentRole === "PURCHASING"
            ? "Purchasing Officer"
            : "System User"}
        </span>
        <h2 className="text-slate-700 font-semibold text-lg leading-tight">
          {title}
        </h2>
      </div>

      {/* ---- RIGHT SECTION ---- */}
      <div className="flex items-center gap-6">

        {/* ROLE SIMULATOR */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
          <span className="text-[10px] font-semibold text-slate-400 uppercase">
            Simulate As:
          </span>
          <select
            value={currentRole}
            onChange={(e) => setCurrentRole(e.target.value)}
            className="bg-transparent text-sm font-bold text-indigo-600 outline-none cursor-pointer"
          >
            <option value="DEPARTMENT">Department Head</option>
            <option value="VP">VP / Top Mgmt</option>
            <option value="CUSTODIAN">Custodian / Warehouse</option>
            <option value="PURCHASING">Purchasing Officer</option>
          </select>
        </div>

        {/* ---- Separator ---- */}
        <div className="hidden md:block h-6 w-px bg-slate-200"></div>

        {/* ---- Notification Icon ---- */}
        <button className="relative text-slate-400 hover:text-indigo-600 transition-colors">
          <Bell size={20} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* ---- Profile ---- */}
        <div className="flex items-center gap-2 cursor-pointer">
          <UserCircle size={32} className="text-slate-300" />
          <div className="hidden md:block leading-tight">
            <p className="text-sm font-bold text-slate-700">Admin User</p>
            <p className="text-xs text-slate-400">Logged in</p>
          </div>
        </div>
      </div>
    </header>
  );
}
