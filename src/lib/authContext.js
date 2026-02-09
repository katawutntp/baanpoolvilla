'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      // อ่านจาก cookie ก่อน (เร็ว)
      const profileCookie = document.cookie
        .split('; ')
        .find((row) => row.startsWith('line_profile='));
      if (profileCookie) {
        try {
          const profileData = JSON.parse(decodeURIComponent(profileCookie.split('=')[1]));
          setUser(profileData);
        } catch (e) {
          // fallback to API
        }
      }

      // ตรวจสอบจาก API (accurate)
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const loginWithLine = (redirectTo = '/') => {
    const currentPath = redirectTo || window.location.pathname;
    window.location.href = `/api/auth/line?redirect=${encodeURIComponent(currentPath)}`;
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithLine, logout, refreshUser: fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
