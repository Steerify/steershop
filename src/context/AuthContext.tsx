import React, { createContext, useContext, useState, useEffect } from 'react';
import authService, { LoginRequest, SignupRequest } from '@/services/auth.service';
import { User, AuthData, UserRole } from '@/types/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (data: LoginRequest) => Promise<AuthData | undefined>;
  signUp: (data: SignupRequest) => Promise<AuthData | undefined>;
  googleLogin: (credential: string) => Promise<AuthData | undefined>;
  googleSignup: (credential: string, role: UserRole) => Promise<AuthData | undefined>;
  setGoogleCallback: (callback: (response: any) => void) => void;
  signOut: () => Promise<void>;
  setAuth: (data: AuthData) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Track if Google is initialized to prevent multiple initializations
let isGoogleInitialized = false;
// Global ref to the current handleGoogleResponse to allow context-based routing/toasts
let globalGoogleCallback: ((response: any) => void) | null = null;

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

  // Initialize Google SDK only once
  useEffect(() => {
    // Only run if not already initialized
    if (isGoogleInitialized) return;

    const initializeGoogle = () => {
      if (!window.google || isGoogleInitialized) return;

      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: (response: any) => {
          if (globalGoogleCallback) {
            globalGoogleCallback(response);
          }
        },
        ux_mode: "popup",
        auto_select: false,
      });
      
      isGoogleInitialized = true;
    };

    if (window.google) {
      initializeGoogle();
    } else {
      const script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (script) {
        script.addEventListener('load', initializeGoogle);
        return () => script.removeEventListener('load', initializeGoogle);
      }
    }
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

  const googleLogin = async (credential: string) => {
    setIsLoading(true);
    try {
      const response = await authService.googleLogin(credential);
      if (response.success) {
        setAuth(response.data);
        return response.data;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const googleSignup = async (credential: string, role: UserRole) => {
    setIsLoading(true);
    try {
      const response = await authService.googleSignup(credential, role);
      if (response.success) {
        setAuth(response.data);
        return response.data;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const setGoogleCallback = (callback: (response: any) => void) => {
    globalGoogleCallback = callback;
  };

  const signOut = async () => {
    authService.clearAuthData();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, googleLogin, googleSignup, setGoogleCallback, signOut, setAuth }}>
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
