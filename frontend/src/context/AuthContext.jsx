import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('frs_user');
    return savedUser ? JSON.parse(savedUser) : {
      id: 1,
      name: "Grand Hyatt Hotel",
      email: "donor@frs.org",
      role: "donor",
      address: "Downtown Center, Block 4"
    };
  });

  const [token, setToken] = useState(() => localStorage.getItem('frs_token') || 'demo_token');

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('frs_user', JSON.stringify(userData));
    localStorage.setItem('frs_token', userToken);
  };

  const updateUser = (fields) => {
    const updatedUser = { ...user, ...fields };
    setUser(updatedUser);
    localStorage.setItem('frs_user', JSON.stringify(updatedUser));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('frs_user');
    localStorage.removeItem('frs_token');
  };

  const switchRole = (newRole) => {
    const roleNames = {
      donor: "Grand Hyatt Hotel",
      ngo: "Hope Shelter NGO",
      volunteer: "Alex Smith",
      admin: "System Administrator"
    };
    const updatedUser = {
      ...user,
      role: newRole,
      name: roleNames[newRole] || "Demo User"
    };
    setUser(updatedUser);
    localStorage.setItem('frs_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
