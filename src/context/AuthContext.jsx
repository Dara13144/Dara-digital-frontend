import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { endpoints } from '../services/api.js';
import { useTelegram } from '../hooks/useTelegram.js';
import { useToast } from './ToastContext.jsx';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('daramini_token'));
  const [loading, setLoading] = useState(true);
  const { initData, user: tgUser } = useTelegram();
  const toast = useToast();

  const loadUserProfile = useCallback(async () => {
    try {
      const res = await endpoints.getProfile();
      if (res.success && res.data) {
        setUser(res.data);
      }
    } catch (err) {
      console.warn('Failed to load user profile:', err.message);
    }
  }, []);

  // Initialize Authentication
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      setLoading(true);
      try {
        // If running inside Telegram with valid initData
        if (initData) {
          const res = await endpoints.telegramAuth(initData);
          if (res.success && isMounted) {
            localStorage.setItem('daramini_token', res.data.token);
            setToken(res.data.token);
            setUser(res.data.user);
          }
        } else if (token) {
          // If token already saved in local storage, fetch profile
          await loadUserProfile();
        } else {
          // Fallback: auto-login with dev guest if in browser dev mode
          const res = await endpoints.mockLogin({
            telegramId: 123456789,
            username: 'demo_user',
            firstName: 'Demo Customer'
          });
          if (res.success && isMounted) {
            localStorage.setItem('daramini_token', res.data.token);
            setToken(res.data.token);
            setUser(res.data.user);
          }
        }
      } catch (err) {
        console.warn('Auth initialization error:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initAuth();
    return () => {
      isMounted = false;
    };
  }, [initData]);

  const loginAsMock = async (role = 'USER') => {
    setLoading(true);
    try {
      const isSuper = role === 'ADMIN';
      const res = await endpoints.mockLogin({
        telegramId: isSuper ? 8361673413 : 123456789,
        username: isSuper ? 'darazzdev' : 'customer_demo',
        firstName: isSuper ? 'Dara Admin' : 'Customer',
        roles: isSuper ? ['SUPER_ADMIN', 'ADMIN', 'USER'] : ['USER']
      });

      if (res.success) {
        localStorage.setItem('daramini_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        toast.success(`Logged in as ${isSuper ? '@darazzdev (Admin)' : 'Customer'}`);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (googlePayload) => {
    setLoading(true);
    try {
      const res = await endpoints.googleAuth(googlePayload);
      if (res.success && res.data) {
        localStorage.setItem('daramini_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        toast.success(`Google Admin Login: Welcome ${res.data.user.first_name || 'Admin'}!`);
        return { success: true, user: res.data.user };
      }
      throw new Error(res.message || 'Google Login failed');
    } catch (err) {
      toast.error(err.message || 'Google authentication failed');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('daramini_token');
    setToken(null);
    setUser(null);
  };

  const isAdmin = Boolean(
    (user?.username && user.username.toLowerCase() === 'darazzdev') ||
    String(user?.telegram_id) === '8361673413' ||
    user?.roles?.some((r) => ['ADMIN', 'SUPER_ADMIN'].includes(r))
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAdmin,
        setUser,
        refreshProfile: loadUserProfile,
        loginAsMock,
        loginWithGoogle,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
