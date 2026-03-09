import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setLastRoute, clearSessionExpired } from '@/store/slices/uiSlice';
import { resetSession } from '@/store/slices/activitySlice';
import { PageLoadingSkeleton } from '@/components/PageLoadingSkeleton';
import { UserRole } from '@/types/api';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

// Map DB role string to UserRole enum
const mapDbRole = (dbRole: string | null | undefined): UserRole | null => {
  if (!dbRole) return null;
  switch (dbRole.toLowerCase()) {
    case 'shop_owner': return UserRole.ENTREPRENEUR;
    case 'admin': return UserRole.ADMIN;
    case 'customer': return UserRole.CUSTOMER;
    default: return null;
  }
};

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const sessionExpiredAt = useAppSelector((state) => state.ui.sessionExpiredAt);
  const [dbProfile, setDbProfile] = useState<{ role: string | null; needs_role_selection: boolean; onboardingCompleted: boolean } | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Track current route for restoration after login
  useEffect(() => {
    if (user) {
      dispatch(setLastRoute(location.pathname + location.search));

      if (sessionExpiredAt) {
        dispatch(clearSessionExpired());
        dispatch(resetSession());
      }
    }
  }, [user, location, dispatch, sessionExpiredAt]);

  // Fetch role & needs_role_selection directly from DB (source of truth)
  useEffect(() => {
    if (user && !isLoading) {
      const fetchProfile = async () => {
        setProfileLoading(true);
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role, needs_role_selection')
            .eq('id', user.id)
            .single();

          // Check onboarding for entrepreneurs
          let onboardingCompleted = true;
          if (profile?.role === 'shop_owner') {
            const { data: onboardingData } = await supabase
              .from('onboarding_responses')
              .select('id')
              .eq('user_id', user.id)
              .limit(1);
            onboardingCompleted = !!(onboardingData && onboardingData.length > 0);
          }

          setDbProfile({
            role: profile?.role ?? null,
            needs_role_selection: profile?.needs_role_selection ?? false,
            onboardingCompleted,
          });
        } catch (err) {
          console.error('ProtectedRoute: Error fetching profile', err);
          setDbProfile({ role: null, needs_role_selection: false, onboardingCompleted: true });
        } finally {
          setProfileLoading(false);
        }
      };
      fetchProfile();
    } else if (!isLoading) {
      setProfileLoading(false);
    }
  }, [user, isLoading]);

  if (isLoading || (user && profileLoading)) {
    return <PageLoadingSkeleton />;
  }

  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (!dbProfile) {
    return <PageLoadingSkeleton />;
  }

  // Redirect to role selection if needed
  if (dbProfile.needs_role_selection) {
    return <Navigate to="/select-role" replace />;
  }

  const userRole = mapDbRole(dbProfile.role);

  if (!userRole) {
    return <Navigate to="/select-role" replace />;
  }

  // Redirect entrepreneurs who haven't completed onboarding
  if (userRole === UserRole.ENTREPRENEUR && !dbProfile.onboardingCompleted && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  // Check role-based access if roles are specified
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(userRole)) {
      switch (userRole) {
        case UserRole.ADMIN:
          return <Navigate to="/admin" replace />;
        case UserRole.ENTREPRENEUR:
          return <Navigate to="/dashboard" replace />;
        case UserRole.CUSTOMER:
          return <Navigate to="/customer_dashboard" replace />;
        default:
          return <Navigate to="/select-role" replace />;
      }
    }
  }

  return <>{children}</>;
};
