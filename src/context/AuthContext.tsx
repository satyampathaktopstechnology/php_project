import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (name: string, email: string, password: string, phone?: string, role?: UserRole) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  switchDemoRole: (role: UserRole) => Promise<{ success: boolean; message: string }>;
  hasRole: (allowedRoles: UserRole[]) => boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'register';
  setAuthModalMode: (mode: 'login' | 'register') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('essence_session_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // Verify status on initial load
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const storedToken = localStorage.getItem('essence_session_token');
        if (!storedToken) {
          setIsLoading(false);
          return;
        }

        const res = await fetch('/api/auth/status', {
          headers: {
            'Authorization': `Bearer ${storedToken}`
          }
        });
        const data = await res.json();
        if (data.loggedIn && data.user) {
          setUser(data.user);
          setToken(storedToken);
        } else {
          localStorage.removeItem('essence_session_token');
          setUser(null);
          setToken(null);
        }
      } catch (err) {
        console.error('Session verification error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkStatus();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (data.success && data.token) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('essence_session_token', data.token);
        setIsAuthModalOpen(false);
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Login failed.' };
    } catch (err) {
      return { success: false, message: 'Server communication error.' };
    }
  };

  const register = async (name: string, email: string, password: string, phone?: string, role?: UserRole) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone, role })
      });
      const data = await res.json();

      if (data.success && data.token) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('essence_session_token', data.token);
        setIsAuthModalOpen(false);
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Registration failed.' };
    } catch (err) {
      return { success: false, message: 'Server communication error.' };
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('essence_session_token');
    }
  };

  const switchDemoRole = async (role: UserRole) => {
    try {
      const res = await fetch('/api/auth/switch-demo-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
      const data = await res.json();

      if (data.success && data.token) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('essence_session_token', data.token);
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Role switch failed.' };
    } catch (err) {
      return { success: false, message: 'Server error during role switch.' };
    }
  };

  const hasRole = (allowedRoles: UserRole[]) => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        switchDemoRole,
        hasRole,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
