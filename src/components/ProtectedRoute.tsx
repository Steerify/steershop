import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setLastRoute, clearSessionExpired } from '@/store/slices/uiSlice';
import { resetSession } from '@/store/slices/activitySlice';
import { PageLoadingSkeleton } from '@/components/PageLoadingSkeleton';
import { UserRole } from '@/types/api';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const sessionExpiredAt = useAppSelector((state) => state.ui.sessionExpiredAt);

  // Track current route for restoration after login
  useEffect(() => {
    if (user) {
      dispatch(setLastRoute(location.pathname + location.search));
      
      // Clear session expired flag and reset activity when user is authenticated
      if (sessionExpiredAt) {
        dispatch(clearSessionExpired());
        dispatch(resetSession());
      }
    }
  }, [user, location, dispatch, sessionExpiredAt]);

  if (isLoading) {
    return <PageLoadingSkeleton />;
  }

  if (!user) {
    // Save the attempted URL for redirecting after login
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Check role-based access if roles are specified
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user.role;
    
    // Ensure userRole is defined before checking
    if (!userRole) {
      // If user has no role, redirect to role selection
      return <Navigate to="/select-role" replace />;
    }
    
    // Check if user's role is in the allowed roles list
    if (!allowedRoles.includes(userRole)) {
      // Redirect to appropriate dashboard based on role
      switch (userRole) {
        case UserRole.ADMIN:
          return <Navigate to="/admin" replace />;
        case UserRole.ENTREPRENEUR:
          return <Navigate to="/dashboard" replace />;
        case UserRole.CUSTOMER:
          return <Navigate to="/customer_dashboard" replace />;
        default:
          // If role is unknown, redirect to role selection
          return <Navigate to="/select-role" replace />;
      }
    }
  }

  return <>{children}</>;
};