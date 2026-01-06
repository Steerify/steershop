import { useState, useEffect } from "react";
import { X, Sparkles, Flame, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FeaturePopupConfig {
  id: string;
  title: string;
  description: string;
  actionText: string;
  icon: React.ReactNode;
  gradient: string;
}

const FEATURE_POPUPS: Record<string, FeaturePopupConfig> = {
  stroke_my_shop: {
    id: "stroke_my_shop",
    title: "🔥 Get Your Shop Roasted!",
    description: "Our AI will analyze your shop and give you honest, actionable feedback in Pidgin English!",
    actionText: "Try Stroke My Shop",
    icon: <Flame className="w-5 h-5" />,
    gradient: "from-orange-500 to-red-500",
  },
  ai_features: {
    id: "ai_features",
    title: "✨ Unlock AI Features",
    description: "Upgrade to Pro or Business to access AI-powered tools that help grow your business!",
    actionText: "View Plans",
    icon: <Sparkles className="w-5 h-5" />,
    gradient: "from-purple-500 to-pink-500",
  },
  business_perks: {
    id: "business_perks",
    title: "⚡ Become a Top Seller",
    description: "Business users get priority listing and a chance to be featured as Top Seller of the Month!",
    actionText: "Upgrade Now",
    icon: <Zap className="w-5 h-5" />,
    gradient: "from-yellow-500 to-orange-500",
  },
};

interface FeatureDiscoveryPopupProps {
  featureId: keyof typeof FEATURE_POPUPS;
  onAction?: () => void;
  className?: string;
}

export const FeatureDiscoveryPopup = ({
  featureId,
  onAction,
  className,
}: FeatureDiscoveryPopupProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const feature = FEATURE_POPUPS[featureId];

  useEffect(() => {
    const dismissedPopups = JSON.parse(
      localStorage.getItem("dismissed_feature_popups") || "[]"
    );

    if (dismissedPopups.includes(featureId)) {
      setIsDismissed(true);
      return;
    }

    // Show popup after a short delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [featureId]);

  const handleDismiss = (permanent: boolean = false) => {
    setIsVisible(false);
    
    if (permanent) {
      const dismissedPopups = JSON.parse(
        localStorage.getItem("dismissed_feature_popups") || "[]"
      );
      localStorage.setItem(
        "dismissed_feature_popups",
        JSON.stringify([...dismissedPopups, featureId])
      );
      setIsDismissed(true);
    }
  };

  const handleAction = () => {
    handleDismiss(false);
    onAction?.();
  };

  if (isDismissed || !isVisible || !feature) return null;

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 w-80 animate-slide-in-right",
        className
      )}
    >
      <div className="bg-card border shadow-2xl rounded-xl overflow-hidden">
        {/* Header with gradient */}
        <div className={cn("p-4 bg-gradient-to-r text-white", feature.gradient)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {feature.icon}
              <span className="font-semibold">{feature.title}</span>
            </div>
            <button
              onClick={() => handleDismiss(false)}
              className="hover:bg-white/20 rounded p-1 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <p className="text-sm text-muted-foreground">{feature.description}</p>
          
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDismiss(true)}
              className="text-muted-foreground text-xs"
            >
              Don't show again
            </Button>
            <Button
              size="sm"
              onClick={handleAction}
              className={cn("bg-gradient-to-r text-white", feature.gradient)}
            >
              {feature.actionText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
