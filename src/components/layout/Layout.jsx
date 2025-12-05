import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout({
  children,
  currentRole,
  setCurrentRole,
  activeTab,
  setActiveTab
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-800 font-sans">

      {/* ---- SIDEBAR ---- */}
      <Sidebar
        currentRole={currentRole}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* ---- MAIN CONTAINER ---- */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-0 md:ml-64"
        }`}
      >
        {/* ---- HEADER ---- */}
        <Header
          currentRole={currentRole}
          setCurrentRole={setCurrentRole}
          setSidebarOpen={setSidebarOpen}
        />

        {/* ---- PAGE CONTENT ---- */}
        <main className="flex-1 mt-16 p-6 md:p-8 overflow-y-auto min-h-[calc(100vh-4rem)]">
          <div className="max-w-7xl mx-auto fade-in">
            {children}
          </div>
        </main>
      </div>

      {/* ---- CUSTOM FADE IN ANIMATION ---- */}
      <style>
        {`
          .fade-in {
            animation: fadeIn 0.35s ease-in-out;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(6px); }
            to { opacity: 1; transform: translateY(0px); }
          }
        `}
      </style>
    </div>
  );
}
