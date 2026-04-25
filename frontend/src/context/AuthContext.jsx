import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const rawRole = decoded.role || (decoded.roles && decoded.roles[0]) || 'ROLE_USER';
        
        setUser({
          email: decoded.sub || decoded.email,
          role: rawRole.replace('ROLE_', ''),
          token: token,
        });
      } catch (error) {
        console.error("Invalid token", error);
        localStorage.removeItem('jwtToken');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (token) => {
    localStorage.setItem('jwtToken', token);
    const decoded = jwtDecode(token);
    const rawRole = decoded.role || (decoded.roles && decoded.roles[0]) || 'ROLE_USER';
    
    setUser({
      email: decoded.sub || decoded.email,
      role: rawRole.replace('ROLE_', ''),
      token: token,
    });
  };

  const logout = () => {
    localStorage.removeItem('jwtToken');
    setUser(null);
    window.location.href = '/login';
  };

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center bg-transparent text-gray-800">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};
