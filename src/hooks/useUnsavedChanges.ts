import { useEffect } from "react";

/**
 * Hook to warn users about unsaved changes when navigating away.
 *
 * @param isDirty - Boolean indicating if the form has unsaved changes
 */
export function useUnsavedChanges(isDirty: boolean) {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = ""; // Standard way to trigger browser's "Leave site?" prompt
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);
}
