import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem('inventoryUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse user data', error);
        localStorage.removeItem('inventoryUser');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback((email, password) => {
    // Mock authentication - in a real app, this would be an API call
    const users = [
      {
        id: 1,
        email: 'depthead@mochkris.com',
        password: 'depthead123',
        name: 'Department Head',
        role: 'depthead',
        department: 'Operations'
      },
      {
        id: 2,
        email: 'genmanager@mochkris.com',
        password: 'genmanager123',
        name: 'General Manager',
        role: 'generalmanager',
        department: 'Management'
      },
      {
        id: 3,
        email: 'manager@mochkris.com',
        password: 'manager123',
        name: 'Manager User',
        role: 'manager'
      },
      {
        id: 4,
        email: 'owner@mochkris.com',
        password: 'owner123',
        name: 'Owner User',
        role: 'owner'
      }
    ];

    const foundUser = users.find(
      u => u.email === email && u.password === password
    );

    if (foundUser) {
      const { password, ...userWithoutPassword } = foundUser;
      localStorage.setItem('inventoryUser', JSON.stringify(userWithoutPassword));
      setUser(userWithoutPassword);
      return { success: true, user: userWithoutPassword };
    }
    return { success: false, error: 'Invalid email or password' };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('inventoryUser');
    setUser(null);
    return { success: true };
  }, []);

  // This will be the value we expose to consumers
  const contextValue = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    isDeptHead: user?.role === 'depthead',
    isGeneralManager: user?.role === 'generalmanager',
    userRole: user?.role,
    userDepartment: user?.department
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};