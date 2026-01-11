import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Package, BarChart3, Crown, Zap, Star, Wand2, Calendar } from "lucide-react";

interface UpgradePromptProps {
  isOpen: boolean;
  onClose: () => void;
  feature: "ai" | "products" | "analytics" | "marketing" | "bookings";
  currentPlan?: string;
  currentCount?: number;
  maxAllowed?: number;
}

const featureConfig = {
  ai: {
    icon: Sparkles,
    title: "Unlock AI Features",
    description: "Get personalized AI insights to grow your business faster!",
    benefits: [
      "AI Shop Analysis - Get roasted and get better!",
      "Smart product recommendations",
      "Customer insights powered by AI",
      "Unlimited AI uses on Business plan",
    ],
    upgradeText: "Upgrade to Pro or Business to unlock AI features",
  },
  products: {
    icon: Package,
    title: "Add More Products",
    description: "You've reached your product limit. Upgrade to list more!",
    benefits: [
      "Basic: 20 products",
      "Pro: 100 products",
      "Business: Unlimited products",
      "Showcase your full catalog",
    ],
    upgradeText: "Upgrade your plan to add more products",
  },
  analytics: {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Get deeper insights into your business performance!",
    benefits: [
      "Detailed sales reports",
      "Customer behavior analytics",
      "Revenue trend analysis",
      "Export data for business planning",
    ],
    upgradeText: "Upgrade to Pro or Business for advanced analytics",
  },
  marketing: {
    icon: Wand2,
    title: "Unlock Marketing Tools",
    description: "Create stunning marketing materials for your business!",
    benefits: [
      "Professional poster templates",
      "AI-powered copy generation",
      "Canvas editor for customization",
      "Unlimited poster designs",
    ],
    upgradeText: "Upgrade to Business plan to access marketing tools",
  },
  bookings: {
    icon: Calendar,
    title: "Accept Bookings",
    description: "Let customers book your services online!",
    benefits: [
      "Online appointment booking",
      "Automated notifications",
      "Calendar management",
      "Customer reminders",
    ],
    upgradeText: "Upgrade to Pro or Business to accept bookings",
  },
};

export const UpgradePrompt = ({
  isOpen,
  onClose,
  feature,
  currentPlan = "basic",
  currentCount,
  maxAllowed,
}: UpgradePromptProps) => {
  const navigate = useNavigate();
  const config = featureConfig[feature];
  const FeatureIcon = config.icon;

  const handleUpgrade = () => {
    onClose();
    navigate("/pricing");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100%-2rem)] sm:max-w-md mx-auto p-4 sm:p-6">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20">
            <FeatureIcon className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-xl font-bold flex items-center justify-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            {config.title}
          </DialogTitle>
          <DialogDescription className="text-base">
            {config.description}
          </DialogDescription>
        </DialogHeader>

        {feature === "products" && currentCount !== undefined && maxAllowed !== undefined && (
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-primary">
              {currentCount}/{maxAllowed}
            </p>
            <p className="text-sm text-muted-foreground">Products used</p>
          </div>
        )}

        <div className="space-y-3 py-4">
          <p className="text-sm font-medium text-muted-foreground">
            With an upgraded plan, you get:
          </p>
          <ul className="space-y-2">
            {config.benefits.map((benefit, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <Star className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-3 text-center">
          <p className="text-sm text-muted-foreground">
            Currently on:{" "}
            <span className="font-semibold capitalize text-foreground">
              {currentPlan} Plan
            </span>
          </p>
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-col">
          <Button
            onClick={handleUpgrade}
            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
          >
            <Zap className="mr-2 h-4 w-4" />
            Upgrade Now
          </Button>
          <Button variant="ghost" onClick={onClose} className="w-full">
            Maybe Later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
