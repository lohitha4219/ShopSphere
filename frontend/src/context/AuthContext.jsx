import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth.service';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('shopsphere_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('shopsphere_access_token');
      if (token) {
        try {
          const profile = await authService.getProfile();
          setUser(profile);
          localStorage.setItem('shopsphere_user', JSON.stringify(profile));
        } catch {
          // Token expired or invalid
          setUser(null);
          localStorage.removeItem('shopsphere_access_token');
          localStorage.removeItem('shopsphere_refresh_token');
          localStorage.removeItem('shopsphere_user');
          if (api?.defaults?.headers?.common) {
            delete api.defaults.headers.common.Authorization;
          }
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const data = await authService.login({ email, password });
    localStorage.setItem('shopsphere_access_token', data.tokens.access);
    localStorage.setItem('shopsphere_refresh_token', data.tokens.refresh);
    localStorage.setItem('shopsphere_user', JSON.stringify(data.user));
    if (api?.defaults?.headers?.common) {
      api.defaults.headers.common.Authorization = `Bearer ${data.tokens.access}`;
    }
    setUser(data.user);
    return data.user;
  };

  const googleLogin = async (credential) => {
    const data = await authService.googleLogin(credential);
    localStorage.setItem('shopsphere_access_token', data.tokens.access);
    localStorage.setItem('shopsphere_refresh_token', data.tokens.refresh);
    localStorage.setItem('shopsphere_user', JSON.stringify(data.user));
    if (api?.defaults?.headers?.common) {
      api.defaults.headers.common.Authorization = `Bearer ${data.tokens.access}`;
    }
    setUser(data.user);
    return data.user;
  };

  const register = async (userData) => {
    // Register without automatically logging in - user must log in after registration
    const data = await authService.register(userData);
    return data;
  };

  const logout = async () => {
    try {
      const refreshTokenVal = localStorage.getItem('shopsphere_refresh_token');
      if (refreshTokenVal) {
        await authService.logout(refreshTokenVal);
      }
    } catch {
      // Continue client cleanup even if backend call fails
    } finally {
      localStorage.removeItem('shopsphere_access_token');
      localStorage.removeItem('shopsphere_refresh_token');
      localStorage.removeItem('shopsphere_user');
      sessionStorage.clear();
      if (api?.defaults?.headers?.common) {
        delete api.defaults.headers.common.Authorization;
      }
      setUser(null);
    }
  };

  const refreshToken = async () => {
    const rf = localStorage.getItem('shopsphere_refresh_token');
    if (!rf) return null;
    try {
      const API_BASE = (import.meta.env.VITE_API_URL || 'http://shopsphere-56zo.onrender.com/api').replace(/\/+$/, '');
      const response = await fetch(`${API_BASE}/auth/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: rf }),
      });
      if (!response.ok) throw new Error('Token refresh failed');
      const data = await response.json();
      localStorage.setItem('shopsphere_access_token', data.access);
      if (data.refresh) {
        localStorage.setItem('shopsphere_refresh_token', data.refresh);
      }
      return data.access;
    } catch {
      await logout();
      return null;
    }
  };

  const updateUser = (updated) => {
    const merged = { ...user, ...updated };
    setUser(merged);
    localStorage.setItem('shopsphere_user', JSON.stringify(merged));
  };

  const refreshProfile = async () => {
    try {
      const profile = await authService.getProfile();
      setUser(profile);
      localStorage.setItem('shopsphere_user', JSON.stringify(profile));
      return profile;
    } catch {
      return user;
    }
  };

  const value = {
    user,
    loading,
    isLoading: loading,
    isAuthenticated: Boolean(user),
    isAdmin: Boolean(user && (user.role === 'ADMIN' || user.is_staff)),
    isSeller: Boolean(user && user.role === 'SELLER'),
    isCustomer: Boolean(user && user.role === 'CUSTOMER'),
    login,
    googleLogin,
    register,
    logout,
    refreshToken,
    updateUser,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
