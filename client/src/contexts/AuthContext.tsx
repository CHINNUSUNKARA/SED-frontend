import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  login as loginService,
  register as registerService,
  logout as logoutService,
  getCurrentUser,
  googleLogin as googleLoginService,
  clearAuthStorage,
} from '../services/authService';
import { clearCache } from '../lib/api';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  loginWithGoogle: (idToken: string) => Promise<User>;
  register: (name: string, email: string, password: string, role: 'student' | 'mentor') => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    // Show cached user instantly while we verify
    const stored = localStorage.getItem('user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { localStorage.removeItem('user'); }
    }

    try {
      const freshUser = await getCurrentUser();
      localStorage.setItem('user', JSON.stringify(freshUser));
      setUser(freshUser);
    } catch {
      // 401 means token is invalid — clear everything
      clearAuthStorage();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<User> => {
    // Clear any previous user's data before storing new session
    clearAuthStorage();
    clearCache();
    setUser(null);

    const { token, user: loginUser } = await loginService({ email, password });
    localStorage.setItem('token', token);

    // Verify with /auth/me to get the canonical server-side user object
    try {
      const freshUser = await getCurrentUser();
      localStorage.setItem('user', JSON.stringify(freshUser));
      setUser(freshUser);
      return freshUser;
    } catch {
      // /me failed right after login — fall back to the login-response user
      localStorage.setItem('user', JSON.stringify(loginUser));
      setUser(loginUser);
      return loginUser;
    }
  };

  const loginWithGoogle = async (idToken: string): Promise<User> => {
    clearAuthStorage();
    clearCache();
    setUser(null);

    const { token, user: loginUser } = await googleLoginService(idToken);
    localStorage.setItem('token', token);

    try {
      const freshUser = await getCurrentUser();
      localStorage.setItem('user', JSON.stringify(freshUser));
      setUser(freshUser);
      return freshUser;
    } catch {
      localStorage.setItem('user', JSON.stringify(loginUser));
      setUser(loginUser);
      return loginUser;
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: 'student' | 'mentor'
  ) => {
    const { user: userData, token } = await registerService({
      name,
      email,
      password,
      role,
      acceptTerms: true,
    });
    localStorage.setItem('token', token);
    setUser(userData);
    navigate('/verify-email');
  };

  const logout = async () => {
    try {
      await logoutService();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuthStorage();
      clearCache();
      setUser(null);
      navigate('/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithGoogle,
        register,
        logout,
        checkAuth,
      }}
    >
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const ProtectedRoute: React.FC<{ children: ReactNode; roles?: string[] }> = ({
  children,
  roles = [],
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      navigate('/login', { state: { from: window.location.pathname } });
    } else if (roles.length > 0 && !roles.includes(user?.role || '')) {
      navigate('/unauthorized');
    }
  }, [isAuthenticated, isLoading, navigate, roles, user?.role]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>;

  if (!isAuthenticated || (roles.length > 0 && !roles.includes(user?.role || ''))) {
    return null;
  }

  return <>{children}</>;
};
