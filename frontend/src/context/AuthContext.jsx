import React, { createContext, useContext, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(false);

  const setAuthSession = (access_token, role, user_id, user_name, email) => {
    const userData = { id: user_id, full_name: user_name, email, role };
    localStorage.setItem('token', access_token);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token, role, user_id, user_name, email: userEmail } = response.data;
      const userData = setAuthSession(access_token, role, user_id, user_name, userEmail);
      return { success: true, user: userData };
    } catch (err) {
      const msg = err.response?.data?.detail || 'Authentication failed';
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (signupData) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/signup', signupData);
      const { access_token, role, user_id, user_name, email: userEmail } = response.data;
      const userData = setAuthSession(access_token, role, user_id, user_name, userEmail);
      return { success: true, user: userData };
    } catch (err) {
      const msg = err.response?.data?.detail || 'Registration failed';
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const requestOTP = async (identifier) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/request-otp', { identifier });
      return { success: true, data: response.data };
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to send OTP';
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (identifier, otp_code) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/verify-otp', { identifier, otp_code });
      const { access_token, role, user_id, user_name, email: userEmail } = response.data;
      const userData = setAuthSession(access_token, role, user_id, user_name, userEmail);
      return { success: true, user: userData };
    } catch (err) {
      const msg = err.response?.data?.detail || 'OTP verification failed';
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const hasRole = (allowedRoles) => {
    if (!user) return false;
    if (user.role === 'Admin') return true;
    return allowedRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      signup,
      requestOTP,
      verifyOTP,
      logout,
      hasRole,
      isAdmin: user?.role === 'Admin',
      isOfficer: user?.role === 'Disaster Management Officer',
      isRescueLeader: user?.role === 'Rescue Team Leader',
      isMedicalRep: user?.role === 'Medical Team Representative',
      isViewer: user?.role === 'Viewer'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
