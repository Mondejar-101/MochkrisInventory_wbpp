import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { SystemProvider } from './context/SystemContext';
import Login from './pages/Login';
import DeptHeadDashboard from './pages/depthead/Dashboard';
import GeneralManagerDashboard from './pages/gm/Dashboard';
import NotFound from './pages/NotFound';

function App() {
  const { isAuthenticated, isDeptHead, isGeneralManager, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <SystemProvider>
      <Routes>
        {/* Public routes */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? 
              (isDeptHead ? 
                <Navigate to="/depthead" replace /> : 
                <Navigate to="/gm" replace />
              ) : 
              <Login />
          } 
        />
        
        {/* Protected routes */}
        <Route 
          path="/depthead/*" 
          element={
            isAuthenticated && isDeptHead ? 
              <DeptHeadDashboard /> : 
              <Navigate to="/login" replace />
          } 
        />
        
        <Route 
          path="/gm/*" 
          element={
            isAuthenticated && isGeneralManager ? 
              <GeneralManagerDashboard /> : 
              <Navigate to="/login" replace />
          } 
        />
        
        {/* Default route */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? 
              (isDeptHead ? 
                <Navigate to="/depthead" replace /> : 
                <Navigate to="/gm" replace />
              ) : 
              <Navigate to="/login" replace />
          } 
        />
        
        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </SystemProvider>
  );
}

export default App;
