'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { api } from '@/lib/api';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  // Para el callback de OAuth: guarda tokens ya emitidos por el API
  loginWithTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  register: (data: { email: string; password: string; name: string }) => Promise<void>;
  logout: () => void;
  // Re-lee el perfil del API (tras editar perfil / subir avatar)
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  // admin o editor: puede entrar al panel
  isStaff: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    isLoading: true,
  });

  const loadUser = useCallback(async (token: string) => {
    try {
      const user = await api.getProfile(token) as User;
      setState({ user, accessToken: token, isLoading: false });
    } catch {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setState({ user: null, accessToken: null, isLoading: false });
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      loadUser(token);
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [loadUser]);

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    localStorage.setItem('accessToken', res.accessToken);
    localStorage.setItem('refreshToken', res.refreshToken);
    await loadUser(res.accessToken);
  };

  const loginWithTokens = async (accessToken: string, refreshToken: string) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    await loadUser(accessToken);
  };

  const register = async (data: { email: string; password: string; name: string }) => {
    await api.register(data);
  };

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (token) await loadUser(token);
  }, [loadUser]);

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setState({ user: null, accessToken: null, isLoading: false });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        loginWithTokens,
        register,
        logout,
        refreshUser,
        isAuthenticated: !!state.user,
        isAdmin: state.user?.role === 'admin',
        isStaff: state.user?.role === 'admin' || state.user?.role === 'editor',
      }}
    >
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
