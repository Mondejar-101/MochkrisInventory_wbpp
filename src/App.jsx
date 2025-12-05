import React, { useState, useEffect } from "react";
import { SystemProvider } from "./context/SystemContext";
import Layout from "./components/layout/Layout";

// Views
import DashboardStats from "./components/views/DashboardStats";
import RequisitionView from "./components/views/RequisitionView";
import ApprovalsView from "./components/PendingApprovals";
import InventoryView from "./components/InventoryCheck";
import PurchasingView from "./components/PurchasingView";
import DeliveryView from "./components/DeliveryReceiving";

export default function App() {
  const [currentRole, setCurrentRole] = useState("DEPARTMENT");
  const [activeTab, setActiveTab] = useState("dashboard");

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Allowed pages per role (Business Flow Based)
  const rolePermissions = {
    DEPARTMENT: ["dashboard", "requisition"],
    VP: ["dashboard", "approvals"],
    CUSTODIAN: ["dashboard", "inventory", "delivery"],
    PURCHASING: ["dashboard", "purchasing"],
  };

  // Reset to dashboard when role changes
  useEffect(() => {
    setActiveTab("dashboard");
  }, [currentRole]);

  // Auto-block unauthorized tab access
  useEffect(() => {
    const allowed = rolePermissions[currentRole] || ["dashboard"];
    if (!allowed.includes(activeTab)) {
      setActiveTab("dashboard");
    }
  }, [activeTab, currentRole]);

  // Render the content based on tab
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":   return <DashboardStats />;
      case "requisition": return <RequisitionView />;
      case "approvals":   return <ApprovalsView />;
      case "inventory":   return <InventoryView />;
      case "delivery":    return <DeliveryView />;
      case "purchasing":  return <PurchasingView />;
      default:            return <DashboardStats />;
    }
  };

  return (
    <SystemProvider>
      <Layout
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      >
        {renderContent()}
      </Layout>
    </SystemProvider>
  );
}
