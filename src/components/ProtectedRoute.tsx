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

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const sessionExpiredAt = useAppSelector((state) => state.ui.sessionExpiredAt);
  const [needsRoleSelection, setNeedsRoleSelection] = useState<boolean | null>(null);

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

  // Check if user needs role selection
  useEffect(() => {
    if (user && !isLoading) {
      supabase
        .from('profiles')
        .select('needs_role_selection')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          setNeedsRoleSelection(data?.needs_role_selection ?? false);
        });
    }
  }, [user, isLoading]);

  if (isLoading || (user && needsRoleSelection === null)) {
    return <PageLoadingSkeleton />;
  }

  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Redirect to role selection if needed
  if (needsRoleSelection) {
    return <Navigate to="/select-role" replace />;
  }

  // Redirect entrepreneurs who haven't completed onboarding
  if (user.role === UserRole.ENTREPRENEUR && user.onboardingCompleted === false && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  // Check role-based access if roles are specified
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user.role;
    
    if (!userRole) {
      return <Navigate to="/select-role" replace />;
    }
    
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