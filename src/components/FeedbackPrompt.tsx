import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { X, MessageCircle } from "lucide-react";

const STORAGE_KEY = "steersolo_feedback_prompted";

export const FeedbackPrompt = () => {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;
    const timer = setTimeout(() => setShow(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setShow(false);
    localStorage.setItem(STORAGE_KEY, "true");
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-20 right-4 z-50 max-w-xs animate-fade-up">
      <div className="bg-card border border-border rounded-xl shadow-xl p-4">
        <button onClick={dismiss} className="absolute top-2 right-2 text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <MessageCircle className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-sm">Enjoying SteerSolo? 🎉</p>
            <p className="text-xs text-muted-foreground mt-1">We'd love to hear your feedback!</p>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <Button size="sm" variant="ghost" onClick={dismiss} className="text-xs flex-1">
            Later
          </Button>
          <Button
            size="sm"
            onClick={() => {
              dismiss();
              navigate("/feedback");
            }}
            className="text-xs flex-1"
          >
            Give Feedback
          </Button>
        </div>
      </div>
    </div>
  );
};
