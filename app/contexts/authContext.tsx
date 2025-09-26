import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { authApi } from '~/utils/api';

interface User {
  id: number;
  userName: string;
  fullName: string;
  email: string;
  phone: string;
  roleName: string;
  storeId: number;
  permissions?: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => Promise<User | null>;
  logout: () => void;
  canAccess: (path: string) => boolean;
  hasPermission: (code: string) => boolean;
  getHomePath: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const HOME_BY_ROLE: Record<string, string> = {
  SYSADMIN: '/home-sysadmin',
  MANAGER: '/home-manager',
  STAFF: '/home-staff',
};

const ACCESS_RULES: Record<string, string[]> = {
  SYSADMIN: ['*'],
  MANAGER: ['/dashboard', '/reports', '/products', '/categories', '/orders', '/customers', '/suppliers', '/stock', '/vouchers', '/home-manager'],
  STAFF: ['/products', '/categories', '/orders', '/stock', '/home-staff'],
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  const fetchMe = async (token: string) => {
    try {
      const me = await authApi.getCurrentUser();
      // The API returns the raw user object
      setUser(me as User);
      return me as User;
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      logout();
      return null;
    }
  };

  const login = async (token: string): Promise<User | null> => {
    return await fetchMe(token);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  const canAccess = (path: string) => {
    const role = user?.roleName || '';
    const rules = ACCESS_RULES[role] || [];
    if (rules.includes('*')) return true;
    // allow exact match or path startsWith rule (for nested routes)
    return rules.some((p) => path === p || path.startsWith(p + '/'));
  };

  const hasPermission = (code: string) => {
    const perms = user?.permissions || [];
    return perms.includes(code);
  };

  const getHomePath = () => {
    const role = user?.roleName || '';
    return HOME_BY_ROLE[role] || '/';
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      login(token).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    canAccess,
    hasPermission,
    getHomePath,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}