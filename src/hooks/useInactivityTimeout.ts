import { useEffect, useCallback, useRef, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateActivity, showWarning, hideWarning } from '@/store/slices/activitySlice';
import { setReturnUrl, setSessionExpired } from '@/store/slices/uiSlice';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from 'react-router-dom';

const STANDARD_TIMEOUT = 15 * 60 * 1000; // 15 minutes
const EXTENDED_TIMEOUT = 30 * 24 * 60 * 60 * 1000; // 30 days
const WARNING_BEFORE_TIMEOUT = 1 * 60 * 1000; // Show warning 1 minute before timeout
const CHECK_INTERVAL = 10 * 1000; // Check every 10 seconds

export const useInactivityTimeout = () => {
  const dispatch = useAppDispatch();
  const { user, signOut } = useAuth();
  const location = useLocation();
  const lastActivity = useAppSelector((state) => state.activity.lastActivity);
  const isWarningShown = useAppSelector((state) => state.activity.isWarningShown);
  const rememberMe = useAppSelector((state) => state.activity.rememberMe);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const INACTIVITY_TIMEOUT = useMemo(() => 
    rememberMe ? EXTENDED_TIMEOUT : STANDARD_TIMEOUT
  , [rememberMe]);

  const resetTimer = useCallback(() => {
    dispatch(updateActivity());
  }, [dispatch]);

  const handleUserActivity = useCallback(() => {
    if (!isWarningShown) {
      resetTimer();
    }
  }, [resetTimer, isWarningShown]);

  const handleSessionExpiry = useCallback(async () => {
    // Save current route before logging out
    dispatch(setReturnUrl(location.pathname + location.search));
    dispatch(setSessionExpired());
    dispatch(hideWarning());
    await signOut();
  }, [dispatch, location, signOut]);

  const extendSession = useCallback(() => {
    dispatch(hideWarning());
    resetTimer();
  }, [dispatch, resetTimer]);

  // Set up activity listeners
  useEffect(() => {
    if (!user) return;

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    
    // Throttle activity updates to prevent excessive dispatches
    let throttleTimeout: NodeJS.Timeout | null = null;
    const throttledHandler = () => {
      if (!throttleTimeout) {
        handleUserActivity();
        throttleTimeout = setTimeout(() => {
          throttleTimeout = null;
        }, 1000); // Throttle to once per second
      }
    };

    events.forEach((event) => {
      window.addEventListener(event, throttledHandler, { passive: true });
    });

    // Also reset on window focus
    const handleFocus = () => handleUserActivity();
    window.addEventListener('focus', handleFocus);

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, throttledHandler);
      });
      window.removeEventListener('focus', handleFocus);
      if (throttleTimeout) clearTimeout(throttleTimeout);
    };
  }, [user, handleUserActivity]);

  // Check for inactivity
  useEffect(() => {
    if (!user) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const timeSinceActivity = now - lastActivity;

      if (timeSinceActivity >= INACTIVITY_TIMEOUT) {
        // Time's up - log out
        handleSessionExpiry();
      } else if (timeSinceActivity >= INACTIVITY_TIMEOUT - WARNING_BEFORE_TIMEOUT && !isWarningShown) {
        // Show warning
        dispatch(showWarning());
      }
    }, CHECK_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [user, lastActivity, isWarningShown, dispatch, handleSessionExpiry]);

  return {
    isWarningShown,
    extendSession,
    timeRemaining: Math.max(0, INACTIVITY_TIMEOUT - (Date.now() - lastActivity)),
  };
};
