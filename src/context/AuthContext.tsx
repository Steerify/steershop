import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  refreshUser: () => Promise<void>;
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

// Helper to map DB role to UserRole enum
const mapDbRole = (dbRole: string | null | undefined): UserRole => {
  if (!dbRole) return UserRole.CUSTOMER;
  switch (dbRole.toLowerCase()) {
    case 'shop_owner': return UserRole.ENTREPRENEUR;
    case 'admin': return UserRole.ADMIN;
    case 'customer': return UserRole.CUSTOMER;
    default:
      console.warn('Unknown role in database, defaulting to CUSTOMER:', dbRole);
      return UserRole.CUSTOMER;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = useCallback(async (supabaseUser: User, retryCount = 0): Promise<AppUser | null> => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error || !profile) {
        // Retry once after 1.5s for race condition with handle_new_user trigger
        if (retryCount < 1) {
          console.log('Profile not ready, retrying in 1.5s...');
          await new Promise(resolve => setTimeout(resolve, 1500));
          return fetchUserProfile(supabaseUser, retryCount + 1);
        }
        console.error('Error fetching profile after retry:', error);
        return null;
      }

      const role = mapDbRole(profile.role);

      // Check onboarding completion for entrepreneurs
      let onboardingCompleted = false;
      if (role === UserRole.ENTREPRENEUR) {
        const { data: onboardingData } = await supabase
          .from('onboarding_responses')
          .select('id')
          .eq('user_id', supabaseUser.id)
          .limit(1);
        onboardingCompleted = !!(onboardingData && onboardingData.length > 0);
      }

      return {
        id: supabaseUser.id,
        email: profile.email || supabaseUser.email || '',
        role,
        firstName: profile.full_name?.split(' ')[0] || supabaseUser.user_metadata?.full_name?.split(' ')[0] || '',
        lastName: profile.full_name?.split(' ').slice(1).join(' ') || supabaseUser.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
        phone: profile.phone || '',
        onboardingCompleted,
      };
    } catch (err) {
      console.error('Error in fetchUserProfile:', err);
      return null;
    }
  }, []);

  // refreshUser: re-fetches the profile from DB and updates state
  const refreshUser = useCallback(async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      const appUser = await fetchUserProfile(authUser);
      if (appUser) {
        setUser(appUser);
      }
    }
  }, [fetchUserProfile]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Auth state changed:', event);
        setSession(currentSession);

        if (currentSession?.user) {
          setTimeout(() => {
            fetchUserProfile(currentSession.user).then(setUser);
          }, 0);
        } else {
          setUser(null);
        }
      }
    );

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
  }, [fetchUserProfile]);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'An error occurred during sign in' };
    }
  };

  const signUp = async (data: SignUpData) => {
    try {
      const dbRole = data.role === UserRole.ENTREPRENEUR ? 'shop_owner' : 'customer';

      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: `${data.firstName} ${data.lastName}`,
            phone: data.phone,
            role: dbRole,
          }
        }
      });

      if (error) return { error: error.message };

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
      if (error) return { error: error.message };
      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'An error occurred during Google sign in' };
    }
  };

  const signOut = async () => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) return { error: error.message };
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
      refreshUser,
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
