import React, { createContext, useContext, useState, useEffect } from 'react';
import authService, { LoginRequest, SignupRequest } from '@/services/auth.service';
import { User, AuthData } from '@/types/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (data: LoginRequest) => Promise<AuthData | undefined>;
  signUp: (data: SignupRequest) => Promise<AuthData | undefined>;
  signOut: () => Promise<void>;
  setAuth: (data: AuthData) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user', e);
      }
    }
    setIsLoading(false);
  }, []);

  const setAuth = (data: AuthData) => {
    const { user, tokens } = data;
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  };

  const signIn = async (data: LoginRequest) => {
    setIsLoading(true);
    try {
      const response = await authService.login(data);
      if (response.success) {
        setAuth(response.data);
        return response.data;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (data: SignupRequest) => {
    setIsLoading(true);
    try {
      const response = await authService.signup(data);
      if (response.success) {
        setAuth(response.data);
        return response.data;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    authService.clearAuthData();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut, setAuth }}>
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
