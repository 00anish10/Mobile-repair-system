import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

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
  login: (email: string, password: string, role: 'customer' | 'admin') => Promise<boolean>;
  logout: () => void;
  register: (userData: Omit<User, 'id'> & { password: string }) => Promise<boolean>;
  updateProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo credentials
interface DemoUser extends User {
  password: string;
}

const DEMO_USERS: DemoUser[] = [
  {
    id: 'user-1',
    name: 'Anish Shrestha',
    email: 'anishshrestha2007@gmail.com',
    phone: '+977 9841556677',
    role: 'customer',
    password: 'demo123',
  },
  {
    id: 'user-2',
    name: 'Pooja Karki',
    email: 'pooja.karki@gmail.com',
    phone: '+977 9801443322',
    role: 'customer',
    password: 'demo123',
  },
  {
    id: 'admin-1',
    name: 'Admin User',
    email: 'admin@moonmobilerepair.com',
    phone: '+977 9801234567',
    role: 'admin',
    password: 'admin123',
  },
];

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

  const login = async (email: string, password: string, role: 'customer' | 'admin'): Promise<boolean> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const foundUser = DEMO_USERS.find(
      u => u.email.toLowerCase() === email.toLowerCase() && 
           u.password === password && 
           u.role === role
    );
    
    if (foundUser) {
      const { password: _pwd, ...userWithoutPassword } = foundUser;
      void _pwd;
      setUser(userWithoutPassword);
      return true;
    }
    return false;
  };

  const register = async (userData: Omit<User, 'id'> & { password: string }): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const exists = DEMO_USERS.some(u => u.email.toLowerCase() === userData.email.toLowerCase());
    if (exists) return false;
    
    const newUser: DemoUser = {
      ...userData,
      id: `user-${Date.now()}`,
    };
    
    DEMO_USERS.push(newUser);
    const { password: _pwd, ...userWithoutPassword } = newUser;
    void _pwd;
    setUser(userWithoutPassword);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = (data: Partial<User>) => {
    if (user) {
      setUser((prev: User | null) => prev ? { ...prev, ...data } : null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, userRole, login, logout, register, updateProfile }}>
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