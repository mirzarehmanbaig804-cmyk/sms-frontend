import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('sms_token');
    const saved = localStorage.getItem('sms_user');
    if (token && saved) {
      try { setUser(JSON.parse(saved)); } catch(e) {}
      authAPI.me()
        .then(r => {
          const u = r.data.data;
          if (!u.name) u.name = (u.first_name || '') + ' ' + (u.last_name || '');
          setUser(u);
          localStorage.setItem('sms_user', JSON.stringify(u));
        })
        .catch(() => {
          localStorage.removeItem('sms_token');
          localStorage.removeItem('sms_user');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const res = await authAPI.login({ email, password });
      const { token, user } = res.data.data;
      if (!user.name) user.name = (user.first_name || '') + ' ' + (user.last_name || '');
      localStorage.setItem('sms_token', token);
      localStorage.setItem('sms_user', JSON.stringify(user));
      setUser(user);
      toast.success(`Welcome back, ${user.name}!`);
      return user;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      return null;
    }
  };

  const logout = () => {
    localStorage.removeItem('sms_token');
    localStorage.removeItem('sms_user');
    setUser(null);
    toast.success('Logged out');
    window.location.href = '/login';
  };

  const updateUser = (newData) => {
    const updated = { ...user, ...newData };
    localStorage.setItem('sms_user', JSON.stringify(updated));
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{
      user, loading, login, logout, updateUser,
      isAdmin: user?.role === 'admin',
      isManager: user?.role === 'admin' || user?.role === 'manager',
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};  
