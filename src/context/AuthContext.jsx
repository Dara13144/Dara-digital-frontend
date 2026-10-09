import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { endpoints } from '../services/api.js';
import { useToast } from './ToastContext.jsx';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('daramini_token'));
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const toast = useToast();

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const loadUserProfile = useCallback(async () => {
    try {
      const res = await endpoints.getProfile();
      if (res.success && res.data) {
        setUser(res.data);
        return res.data;
      }
      return null;
    } catch (err) {
      if (err.message !== 'Request aborted') {
        console.warn('Failed to load user profile:', err.message);
      }
      throw err;
    }
  }, []);

  // Listen for unauthorized events to clear user session
  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
      localStorage.removeItem('daramini_token');
    };
    window.addEventListener('daramini:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('daramini:unauthorized', handleUnauthorized);
  }, []);

  // Initialize Authentication
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      setLoading(true);
      try {
        // Check for incoming OAuth token or error in URL search params
        if (typeof window !== 'undefined') {
          const urlParams = new URLSearchParams(window.location.search);
          const incomingToken = urlParams.get('token');
          const authError = urlParams.get('auth_error');

          if (incomingToken) {
            localStorage.setItem('daramini_token', incomingToken);
            if (isMounted) setToken(incomingToken);

            urlParams.delete('token');
            urlParams.delete('auth_success');
            const newSearch = urlParams.toString();
            const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : '') + window.location.hash;
            window.history.replaceState({}, document.title, newUrl);

            try {
              const profile = await loadUserProfile();
              if (profile && isMounted) {
                toast.success(`Welcome, ${profile.first_name || 'Customer'}!`);
                return;
              }
            } catch (profileErr) {
              console.warn('OAuth profile load note:', profileErr.message);
            }
          } else if (authError) {
            urlParams.delete('auth_error');
            const newSearch = urlParams.toString();
            const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : '') + window.location.hash;
            window.history.replaceState({}, document.title, newUrl);
            toast.error(`Google Sign-In: ${authError}`);
          }
        }

        const savedToken = localStorage.getItem('daramini_token');
        if (savedToken) {
          try {
            const profile = await loadUserProfile();
            if (profile && isMounted) {
              setToken(savedToken);
              return;
            }
          } catch (err) {
            localStorage.removeItem('daramini_token');
            if (isMounted) setToken(null);
          }
        }
      } catch (err) {
        if (err.message !== 'Request aborted') {
          console.warn('Auth initialization error:', err.message);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initAuth();
    return () => {
      isMounted = false;
    };
  }, [loadUserProfile]);

  const loginWithGoogle = async (googlePayload) => {
    setLoading(true);
    try {
      const res = await endpoints.googleAuth(googlePayload);
      if (res.success && res.data) {
        localStorage.setItem('daramini_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        toast.success(`Welcome back, ${res.data.user.first_name || 'Customer'}!`);
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
        return { success: true, user: res.data.user };
      }
    } catch (err) {
      toast.error(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('daramini_token');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  };

  const ADMIN_EMAILS = [
    'bunrak778@gmail.com',
    'finozzz377@gmail.com',
    'mdara9695@gmail.com'
  ];

  const userEmail = user?.email ? user.email.toLowerCase() : '';
  const isAdmin = Boolean(
    (user?.username && user.username.toLowerCase() === 'darazzdev') ||
    (userEmail && ADMIN_EMAILS.includes(userEmail)) ||
    user?.roles?.some((r) => ['ADMIN', 'SUPER_ADMIN'].includes(r))
  );

  const redirectToGoogle = (returnTo = (typeof window !== 'undefined' ? window.location.pathname : '/'), mode = 'user') => {
    endpoints.redirectToGoogleOAuth(returnTo, mode);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAdmin,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        setUser,
        refreshProfile: loadUserProfile,
        loginWithGoogle,
        redirectToGoogle,
        loginAsMock,
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
