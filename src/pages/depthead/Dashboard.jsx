import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { SystemProvider, useSystem } from '../../context/SystemContext';
import Layout from '../../components/layout/Layout';

// Views
import DashboardStats from '../../components/views/DashboardStats';
import MaterialOrderView from '../../components/views/MaterialOrderView';
import ApprovalsView from '../../components/PendingApprovals';
import ManagementView from '../../components/views/ManagementView';

export default function DeptHeadDashboard() {
  const [currentRole] = useState('DEPARTMENT');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { setPrefillData } = useSystem();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Function to handle navigation with pre-filled data for PO
  const handleCreatePO = (item) => {
    setPrefillData({ type: 'PO', item });
    setActiveTab('material_order');
  };

  // Allowed pages for department head
  const rolePermissions = {
    DEPARTMENT: ["dashboard", "material_order", "management", "approvals"],
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
        return <DashboardStats role="DEPARTMENT" onCreatePO={handleCreatePO} />;
      case "material_order": 
        return <MaterialOrderView />;
      case "approvals": 
        return <ApprovalsView role="DEPARTMENT" />;
      case "management": 
        return <ManagementView />;
      default: 
        return <DashboardStats role="DEPARTMENT" onCreatePO={handleCreatePO} />;
    }
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
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {activeTab === 'dashboard' && 'Dashboard Overview'}
              {activeTab === 'material_order' && 'New Material Order (PO)'}
              {activeTab === 'approvals' && 'Pending RF Approvals'}
              {activeTab === 'management' && 'Manage Items & Suppliers'}
            </h1>
          </div>
          {renderContent()}
        </div>
      </Layout>
    </SystemProvider>
  );
}
