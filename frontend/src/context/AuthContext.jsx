import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Restore user and token from sessionStorage (clears automatically when tab/browser closes)
  const [user, setUser] = useState(() => {
    try {
      // Clean up any legacy persistent localStorage session
      localStorage.removeItem('frs_user');
      localStorage.removeItem('frs_token');
      localStorage.removeItem('frs_activeTab');

      const savedUser = sessionStorage.getItem('frs_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (_) {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    try {
      return sessionStorage.getItem('frs_token') || null;
    } catch (_) {
      return null;
    }
  });

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    try {
      sessionStorage.setItem('frs_user', JSON.stringify(userData));
      if (userToken) sessionStorage.setItem('frs_token', userToken);
    } catch (_) {}
  };

  const updateUser = (fields) => {
    const updatedUser = { ...user, ...fields };
    setUser(updatedUser);
    try {
      sessionStorage.setItem('frs_user', JSON.stringify(updatedUser));
    } catch (_) {}
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    try {
      sessionStorage.removeItem('frs_user');
      sessionStorage.removeItem('frs_token');
      localStorage.removeItem('frs_user');
      localStorage.removeItem('frs_token');
      localStorage.removeItem('frs_activeTab');
    } catch (_) {}
  };

  const switchRole = (newRole) => {
    const roleProfiles = {
      donor: { id: 1, name: "Grand Hyatt Hotel", email: "donor@frs.org", role: "donor", phone: "+91 9876543210", address: "Downtown Center, Block 4", organization_type: "Hotel" },
      ngo: { id: 2, name: "Hope Shelter NGO", email: "ngo@frs.org", role: "ngo", phone: "+91 9876543211", address: "Westside Care Center", organization_type: "NGO" },
      volunteer: { id: 3, name: "Alex Smith", email: "volunteer@frs.org", role: "volunteer", phone: "+91 9876543212", address: "City Center", organization_type: "Individual" },
      admin: { id: 4, name: "System Administrator", email: "admin@frs.org", role: "admin", phone: "+91 9876543213", address: "Central Command HQ", organization_type: "Admin" }
    };
    const updatedUser = roleProfiles[newRole] || {
      ...user,
      role: newRole,
      name: "Demo User"
    };
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
