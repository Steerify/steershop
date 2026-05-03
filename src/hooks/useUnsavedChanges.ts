import { useEffect, useRef } from "react";
import { useBlocker } from "react-router-dom";

/**
 * Hook to warn users about unsaved changes when navigating away.
 *
 * @param isDirty - Boolean indicating if the form has unsaved changes
 */
export function useUnsavedChanges(isDirty: boolean) {
  // Track whether the component has fully mounted.
  // We must NOT block the navigation that brought us TO this page.
  const mountedRef = useRef(false);
  useEffect(() => {
    // Mark as mounted after the first render cycle completes.
    const id = setTimeout(() => { mountedRef.current = true; }, 0);
    return () => {
      clearTimeout(id);
      mountedRef.current = false;
    };
  }, []);

  // Warn on page refresh/close (standard browser prompt)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Warn on internal React Router navigation.
  // Guard: only block if the component is fully mounted AND the form is dirty.
  // This prevents useBlocker from blocking the initial navigation TO this page.
  useBlocker(({ nextLocation, currentLocation }) => {
    if (!mountedRef.current) return false;
    if (!isDirty) return false;
    if (nextLocation.pathname === currentLocation.pathname) return false;
    return !window.confirm("You have unsaved changes. Are you sure you want to leave?");
  });
}
