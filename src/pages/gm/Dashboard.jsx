import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { SystemProvider, useSystem } from '../../context/SystemContext';
import Layout from '../../components/layout/Layout';

// Views
import DashboardStats from '../../components/views/DashboardStats';
import RequisitionView from '../../components/views/RequisitionView';
import ApprovalsView from '../../components/PendingApprovals';
import InventoryView from '../../components/InventoryCheck';
import PurchasingView from '../../components/PurchasingView';
import DeliveryView from '../../components/DeliveryReceiving';
import ManagementView from '../../components/views/ManagementView';
import MaterialOrderView from '../../components/views/MaterialOrderView';
import LocalPurchaseOrderView from '../../components/views/PurchaseOrderView/LocalPurchaseOrderView';
import CreateDirectPurchase from '../../components/views/CreateDirectPurchase';
import FurnitureStock from '../../components/views/FurnitureStock';

export default function GeneralManagerDashboard() {
  const [currentRole] = useState('CUSTODIAN');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { setPrefillData } = useSystem();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Functions to handle navigation with pre-filled data
  const handleCreatePO = (item) => {
    setPrefillData({ type: 'PO', item });
    setActiveTab('material_order');
  };

  const handleCreateRF = (item) => {
    setPrefillData({ type: 'RF', item });
    setActiveTab('requisition');
  };

  // Allowed pages for general manager (using CUSTODIAN role for full access)
  const rolePermissions = {
    CUSTODIAN: ["dashboard", "inventory", "delivery", "purchasing", "direct_purchase", "approvals", "requisition", "management", "purchase_orders", "furniture_stock"],
  };

  // Auto-block unauthorized tab access
  useEffect(() => {
    const allowed = rolePermissions[currentRole] || ["dashboard"];
    if (!allowed.includes(activeTab)) {
      setActiveTab("dashboard");
    }

    // Add event listener for logout
    const handleLogoutEvent = () => handleLogout();
    window.addEventListener('logout', handleLogoutEvent);
    
    // Cleanup
    return () => {
      window.removeEventListener('logout', handleLogoutEvent);
    };
  }, [activeTab, currentRole, handleLogout]);

  // Render active screen
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard": 
        return <DashboardStats role="CUSTODIAN" onCreatePO={handleCreatePO} onCreateRF={handleCreateRF} />;
      case "requisition": 
        return <RequisitionView />;
      case "material_order": 
        return <MaterialOrderView />;
      case "approvals": 
        return <ApprovalsView role="CUSTODIAN" />;
      case "inventory": 
        return <InventoryView />;
      case "delivery": 
        return <DeliveryView />;
      case "purchasing": 
        return <PurchasingView />;
      case "direct_purchase": 
        return <CreateDirectPurchase />;
      case "purchase_orders": 
        return <LocalPurchaseOrderView currentRole="CUSTODIAN" />;
      case "management": 
        return <ManagementView />;
      case "furniture_stock": 
        return <FurnitureStock />;
      default: 
        return <DashboardStats role="CUSTODIAN" onCreatePO={handleCreatePO} onCreateRF={handleCreateRF} />;
    }
  };

  const getPageTitle = () => {
    const titles = {
      'requisition': 'New Material Request (RF)',
      'material_order': 'New Material Order (PO)',
      'approvals': 'Pending RF Approvals',
      'inventory': 'Inventory Monitoring',
      'delivery': 'Receiving & Delivery (RM/AR)',
      'purchasing': 'Procurement & PO Creation',
      'direct_purchase': 'Direct Purchase',
      'purchase_orders': 'Purchase Orders',
      'management': 'Manage Items & Suppliers',
      'furniture_stock': 'Furniture Stock'
    };
    return titles[activeTab] || 'Dashboard';
  };

  return (
    <SystemProvider>
      <Layout
        currentRole={currentRole}
        setCurrentRole={() => {}}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      >
        <div className="bg-white shadow-sm rounded-lg p-6">
          {renderContent()}
        </div>
      </Layout>
    </SystemProvider>
  );
}
