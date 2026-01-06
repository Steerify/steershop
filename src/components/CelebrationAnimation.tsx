import { useState, useEffect } from "react";
import Confetti from "react-dom-confetti";

interface CelebrationAnimationProps {
  trigger: boolean;
  type?: "order" | "first-sale" | "milestone";
}

const confettiConfig = {
  angle: 90,
  spread: 360,
  startVelocity: 40,
  elementCount: 70,
  dragFriction: 0.12,
  duration: 3000,
  stagger: 3,
  width: "10px",
  height: "10px",
  colors: ["#0D5C63", "#F5A623", "#22c55e", "#8b5cf6", "#ec4899"],
};

export const CelebrationAnimation = ({ trigger, type = "order" }: CelebrationAnimationProps) => {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (trigger) {
      setActive(true);
      // Reset after animation
      const timer = setTimeout(() => setActive(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  return (
    <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
      <Confetti active={active} config={confettiConfig} />
      
      {active && (
        <div className="animate-bounce text-center pointer-events-none">
          <div className="text-6xl mb-2">
            {type === "first-sale" ? "🎊" : type === "milestone" ? "🏆" : "🎉"}
          </div>
          <p className="text-xl font-bold text-primary animate-pulse">
            {type === "first-sale" 
              ? "Your First Sale!" 
              : type === "milestone" 
              ? "Milestone Reached!" 
              : "Order Confirmed!"}
          </p>
        </div>
      )}
    </div>
  );
};

// Simple animated checkmark for success states
export const SuccessCheckmark = ({ show }: { show: boolean }) => {
  if (!show) return null;
  
  return (
    <div className="flex items-center justify-center">
      <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center animate-scale-in">
        <svg 
          className="w-8 h-8 text-white animate-draw-check" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 6L9 17L4 12" />
        </svg>
      </div>
    </div>
  );
};
