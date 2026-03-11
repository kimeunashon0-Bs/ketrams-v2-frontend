"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api/axios';
import Cookies from 'js-cookie';

interface User {
  id: number;
  phoneNumber: string;
  role: 'STUDENT' | 'INSTITUTION' | 'SUB_COUNTY' | 'ADMIN';
  subCounty?: string; // for SUB_COUNTY role
  fullName?: string;  // for all roles (especially institution)
  gender?: string;
  title?: string;     // Mr, Mrs, Ms
  institutionId?: number;
  institutionName?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (phoneNumber: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = Cookies.get('token');
    const storedUser = Cookies.get('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (phoneNumber: string, password: string, rememberMe = false) => {
    try {
      const response = await api.post('/auth/login', { phoneNumber, password, rememberMe });
      const { token, role, userId, subCounty, fullName, gender, title, institutionId, institutionName } = response.data.data;
      const userData: User = {
        id: userId,
        phoneNumber,
        role,
        subCounty,
        fullName,
        gender,
        title,
        institutionId,
        institutionName,
      };

      const cookieExpires = rememberMe ? 7 : 1;
      Cookies.set('token', token, { expires: cookieExpires });
      Cookies.set('user', JSON.stringify(userData), { expires: cookieExpires });

      setToken(token);
      setUser(userData);

      if (role === 'STUDENT') router.push('/student/dashboard');
      else if (role === 'INSTITUTION') router.push('/institution/dashboard');
      else if (role === 'SUB_COUNTY') router.push('/subcounty/dashboard');
      else if (role === 'ADMIN') router.push('/admin/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    Cookies.remove('token');
    Cookies.remove('user');
    setToken(null);
    setUser(null);
    router.replace('/');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};