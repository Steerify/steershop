import { useState, useEffect, useCallback } from "react";

interface TourState {
  hasSeenTour: boolean;
  isRunning: boolean;
  currentStep: number;
}

export const useTour = (tourKey: string) => {
  const storageKey = `tour_${tourKey}_completed`;
  
  const [state, setState] = useState<TourState>({
    hasSeenTour: true, // Default to true to prevent flash
    isRunning: false,
    currentStep: 0
  });

  useEffect(() => {
    const hasCompleted = localStorage.getItem(storageKey) === "true";
    setState(prev => ({ ...prev, hasSeenTour: hasCompleted }));
  }, [storageKey]);

  const startTour = useCallback(() => {
    setState(prev => ({ ...prev, isRunning: true, currentStep: 0 }));
  }, []);

  const endTour = useCallback((completed: boolean = true) => {
    if (completed) {
      localStorage.setItem(storageKey, "true");
    }
    setState(prev => ({ ...prev, isRunning: false, hasSeenTour: completed }));
  }, [storageKey]);

  const resetTour = useCallback(() => {
    localStorage.removeItem(storageKey);
    setState({ hasSeenTour: false, isRunning: false, currentStep: 0 });
  }, [storageKey]);

  const setCurrentStep = useCallback((step: number) => {
    setState(prev => ({ ...prev, currentStep: step }));
  }, []);

  return {
    ...state,
    startTour,
    endTour,
    resetTour,
    setCurrentStep
  };
};
