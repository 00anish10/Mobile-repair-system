import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import {
  ApiError,
  apiLogin,
  apiMe,
  apiRegister,
  apiUpdateProfile,
  getToken,
  isNetworkError,
  setToken,
  type ApiUser,
} from '../lib/api';

export type UserRole = 'customer' | 'admin' | null;

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin';
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  userRole: UserRole;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => void;
  register: (userData: Omit<User, 'id'> & { password: string }) => Promise<boolean>;
  updateProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface DemoUser extends User {
  password: string;
}

const DEMO_USERS: DemoUser[] = [
  {
    id: 'user-1',
    name: 'Anish Shrestha',
    email: 'anishshrestha2007@gmail.com',
    phone: '+61 412 345 678',
    role: 'customer',
    password: 'demo123',
  },
  {
    id: 'user-2',
    name: 'Pooja Karki',
    email: 'pooja.karki@gmail.com',
    phone: '+61 423 456 789',
    role: 'customer',
    password: 'demo123',
  },
  {
    id: 'admin-1',
    name: 'Admin User',
    email: 'admin@moonmobilerepair.com',
    phone: '+61 400 123 456',
    role: 'admin',
    password: 'admin123',
  },
];

function mapApiUser(apiUser: ApiUser): User {
  return {
    id: apiUser.id,
    name: apiUser.name,
    email: apiUser.email,
    phone: apiUser.phone,
    role: apiUser.role === 'admin' ? 'admin' : 'customer',
    avatar: apiUser.avatar,
  };
}

function demoLogin(email: string, password: string): User | null {
  const foundUser = DEMO_USERS.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  if (!foundUser) return null;
  const { password: _pwd, ...userWithoutPassword } = foundUser;
  void _pwd;
  return userWithoutPassword;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('moon_mobile_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const isAuthenticated = !!user;
  const userRole = user?.role || null;

  useEffect(() => {
    if (user) {
      localStorage.setItem('moon_mobile_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('moon_mobile_user');
    }
  }, [user]);

  useEffect(() => {
    const handleExpired = () => setUser(null);
    window.addEventListener('moon-auth-expired', handleExpired);
    return () => window.removeEventListener('moon-auth-expired', handleExpired);
  }, []);

  useEffect(() => {
    if (!getToken()) {
      if (!import.meta.env.DEV) setUser(null);
      return;
    }
    let cancelled = false;
    apiMe()
      .then((response) => {
        if (!cancelled) setUser(mapApiUser(response.user));
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        if (error instanceof ApiError && error.status === 401) {
          setToken(null);
          setUser(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (email: string, password: string): Promise<User | null> => {
    try {
      const response = await apiLogin(email, password);
      const mapped = mapApiUser(response.user);
      setToken(response.token);
      setUser(mapped);
      return mapped;
    } catch (error) {
      // Allow the offline demo experience in development only.
      const apiUnavailable =
        isNetworkError(error) || (error instanceof ApiError && error.status >= 500);
      if (import.meta.env.DEV && apiUnavailable) {
        await new Promise((resolve) => setTimeout(resolve, 400));
        const demoUser = demoLogin(email, password);
        if (demoUser) {
          setToken(null);
          setUser(demoUser);
          return demoUser;
        }
      }
      return null;
    }
  };

  const register = async (userData: Omit<User, 'id'> & { password: string }): Promise<boolean> => {
    try {
      const response = await apiRegister({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        phone: userData.phone,
      });
      setToken(response.token);
      setUser(mapApiUser(response.user));
      return true;
    } catch (error) {
      if (error instanceof ApiError && error.status !== 0 && error.status < 500) {
        return false;
      }
      if (!import.meta.env.DEV) return false;
      // Offline fallback keeps the demo usable without the backend running.
      await new Promise((resolve) => setTimeout(resolve, 400));
      const exists = DEMO_USERS.some(
        (u) => u.email.toLowerCase() === userData.email.toLowerCase()
      );
      if (exists) return false;

      const newUser: DemoUser = {
        ...userData,
        id: `user-${Date.now()}`,
      };
      DEMO_USERS.push(newUser);
      const { password: _pwd, ...userWithoutPassword } = newUser;
      void _pwd;
      setToken(null);
      setUser(userWithoutPassword);
      return true;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const updateProfile = (data: Partial<User>) => {
    if (!user) return;
    setUser((prev: User | null) => (prev ? { ...prev, ...data } : null));
    if (data.name || data.phone) {
      void apiUpdateProfile({ name: data.name, phone: data.phone }).catch(() => undefined);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, userRole, login, logout, register, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
