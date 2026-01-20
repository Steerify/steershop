import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { UserRole } from '@/types/api';

export interface AppUser {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  phone?: string;
  onboardingCompleted?: boolean;
}

interface AuthContextType {
  user: AppUser | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (data: SignUpData) => Promise<{ error: string | null; user?: AppUser }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
}

export interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: UserRole;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Convert Supabase user to AppUser by fetching profile
  // In your AuthContext.tsx - update the fetchUserProfile function:
const fetchUserProfile = async (supabaseUser: User): Promise<AppUser | null> => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', supabaseUser.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      // Return null if profile doesn't exist
      return null;
    }

    // Map database role string to UserRole enum
    let role: UserRole;
    switch (profile?.role) {
      case 'shop_owner':
        role = UserRole.ENTREPRENEUR;
        break;
      case 'admin':
        role = UserRole.ADMIN;
        break;
      case 'customer':
        role = UserRole.CUSTOMER;
        break;
      default:
        // If role is null or undefined, set to CUSTOMER as default
        role = UserRole.CUSTOMER;
    }

    // Check if entrepreneur has completed onboarding by checking if they have a shop
    let onboardingCompleted = false;
    if (role === UserRole.ENTREPRENEUR) {
      const { data: shops } = await supabase
        .from('shops')
        .select('id')
        .eq('owner_id', supabaseUser.id)
        .limit(1);
      onboardingCompleted = (shops && shops.length > 0) || false;
    }

    return {
      id: supabaseUser.id,
      email: profile?.email || supabaseUser.email || '',
      role,
      firstName: profile?.full_name?.split(' ')[0] || supabaseUser.user_metadata?.full_name?.split(' ')[0] || '',
      lastName: profile?.full_name?.split(' ').slice(1).join(' ') || supabaseUser.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
      phone: profile?.phone || '',
      onboardingCompleted,
    };
  } catch (err) {
    console.error('Error in fetchUserProfile:', err);
    return null;
  }
};

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Auth state changed:', event);
        setSession(currentSession);
        
        if (currentSession?.user) {
          // Defer profile fetch with setTimeout to avoid deadlock
          setTimeout(() => {
            fetchUserProfile(currentSession.user).then(setUser);
          }, 0);
        } else {
          setUser(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      if (existingSession?.user) {
        fetchUserProfile(existingSession.user).then((appUser) => {
          setUser(appUser);
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        return { error: error.message };
      }
      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'An error occurred during sign in' };
    }
  };

  const signUp = async (data: SignUpData) => {
    try {
      // Map frontend role to database role
      const dbRole = data.role === UserRole.ENTREPRENEUR ? 'shop_owner' : 'customer';
      
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: `${data.firstName} ${data.lastName}`,
            phone: data.phone,
            role: dbRole,
          }
        }
      });

      if (error) {
        return { error: error.message };
      }

      if (authData.user) {
        const appUser = await fetchUserProfile(authData.user);
        return { error: null, user: appUser || undefined };
      }

      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'An error occurred during sign up' };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        }
      });
      if (error) {
        return { error: error.message };
      }
      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'An error occurred during Google sign in' };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        return { error: error.message };
      }
      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'An error occurred' };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session,
      isLoading, 
      signIn, 
      signUp, 
      signInWithGoogle,
      signOut,
      resetPassword,
    }}>
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
