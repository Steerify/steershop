import { useEffect } from "react";
import { useBlocker } from "react-router-dom";

/**
 * Hook to warn users about unsaved changes when navigating away.
 * 
 * @param isDirty - Boolean indicating if the form has unsaved changes
 */
export function useUnsavedChanges(isDirty: boolean) {
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

  // Warn on internal React Router navigation
  useBlocker(({ nextLocation, currentLocation }) => {
    if (isDirty && nextLocation.pathname !== currentLocation.pathname) {
      return !window.confirm("You have unsaved changes. Are you sure you want to leave?");
    }
    return false;
  });
}
