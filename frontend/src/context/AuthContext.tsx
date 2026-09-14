import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { authApi, LoginPayload, RegisterPayload } from '../api/authApi';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isContentCreator: boolean;
  login: (credentials: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const cached = localStorage.getItem('vbs_user');
    return cached ? JSON.parse(cached) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('vbs_token'));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token && !user) {
      authApi.getCurrentUser()
        .then((userData) => {
          setUser(userData);
          localStorage.setItem('vbs_user', JSON.stringify(userData));
        })
        .catch(() => {
          logout();
        });
    }
  }, [token]);

  const login = async (credentials: LoginPayload) => {
    setLoading(true);
    try {
      const data = await authApi.login(credentials);
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('vbs_token', data.token);
      localStorage.setItem('vbs_user', JSON.stringify(data.user));
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload: RegisterPayload) => {
    setLoading(true);
    try {
      const data = await authApi.register(payload);
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('vbs_token', data.token);
      localStorage.setItem('vbs_user', JSON.stringify(data.user));
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('vbs_token');
    localStorage.removeItem('vbs_user');
  };

  const isContentCreator = user?.role === 'ROLE_CONTENT_CREATOR';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isContentCreator,
        login,
        register,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
