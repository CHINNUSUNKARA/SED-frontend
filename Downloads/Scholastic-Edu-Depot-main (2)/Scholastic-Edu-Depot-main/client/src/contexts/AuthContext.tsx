import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, login as loginService, register as registerService, logout as logoutService, getCurrentUser, getCsrfToken } from '../services/authService';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
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
    const initAuth = async () => {
      try {
        await getCsrfToken();
      } catch (error) {
        console.error('Failed to fetch CSRF token', error);
      }
      checkAuth();
    };
    initAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { user, token } = await loginService({ email, password });
      localStorage.setItem('token', token);
      setUser(user);
      return user; // Return user data for role-based navigation
    } catch (error) {
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string, role: 'student' | 'mentor') => {
    try {
      const { user, token } = await registerService({
        name,
        email,
        password,
        role,
        acceptTerms: true
      });
      localStorage.setItem('token', token);
      setUser(user);
      navigate('/verify-email');
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutService();
      localStorage.removeItem('token');
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
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

export const ProtectedRoute: React.FC<{ children: ReactNode, roles?: string[] }> = ({
  children,
  roles = []
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login', { state: { from: window.location.pathname } });
    } else if (!isLoading && isAuthenticated && roles.length > 0 && !roles.includes(user?.role || '')) {
      navigate('/unauthorized');
    }
  }, [isAuthenticated, isLoading, navigate, roles, user?.role]);

  if (isLoading) {
    return <div>Loading...</div>; // Or your loading component
  }

  if (!isAuthenticated || (roles.length > 0 && !roles.includes(user?.role || ''))) {
    return null;
  }

  return <>{children}</>;
};
