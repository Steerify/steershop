import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Store, Image, FileText, MessageCircle, CreditCard, Package, 
  CheckCircle, Circle, ChevronRight, Sparkles, X
} from "lucide-react";
import { useState, useEffect } from "react";

interface ShopData {
  id: string;
  logo_url?: string | null;
  banner_url?: string | null;
  description?: string | null;
  whatsapp_number?: string | null;
  payment_method?: string | null;
  paystack_subaccount_code?: string | null;
}

interface ProfileCompletionChecklistProps {
  shop: ShopData | null;
  productsCount: number;
}

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  isComplete: boolean;
  link: string;
  icon: React.ReactNode;
}

const MESSAGES = {
  low: "Let's get started! Your shop needs some love 💪",
  medium: "Nice progress! You're building something great 🔥",
  high: "Almost there! Just a few more steps 🚀",
  almostDone: "So close! Complete these final steps 🎯",
  complete: "Omo! Your shop is fully set up! Na boss you be! 🎉",
};

export const ProfileCompletionChecklist = ({ shop, productsCount }: ProfileCompletionChecklistProps) => {
  const navigate = useNavigate();
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("profile-checklist-dismissed");
    if (dismissed === "true") {
      setIsDismissed(true);
    }
  }, []);

  const checklistItems: ChecklistItem[] = [
    {
      id: "shop",
      label: "Create Shop",
      description: "Set up your online store",
      isComplete: !!shop,
      link: "/my-store",
      icon: <Store className="w-4 h-4" />,
    },
    {
      id: "logo",
      label: "Upload Logo",
      description: "Add a logo to your shop",
      isComplete: !!shop?.logo_url,
      link: "/my-store",
      icon: <Image className="w-4 h-4" />,
    },
    {
      id: "banner",
      label: "Upload Banner",
      description: "Add a banner image",
      isComplete: !!shop?.banner_url,
      link: "/my-store",
      icon: <Image className="w-4 h-4" />,
    },
    {
      id: "description",
      label: "Add Description",
      description: "Tell customers about your shop",
      isComplete: !!shop?.description && shop.description.length > 20,
      link: "/my-store",
      icon: <FileText className="w-4 h-4" />,
    },
    {
      id: "whatsapp",
      label: "Set WhatsApp",
      description: "Enable customer contact",
      isComplete: !!shop?.whatsapp_number,
      link: "/my-store",
      icon: <MessageCircle className="w-4 h-4" />,
    },
    {
      id: "payment",
      label: "Enable Payments",
      description: "Accept customer payments",
      isComplete: !!shop?.payment_method,
      link: "/my-store",
      icon: <CreditCard className="w-4 h-4" />,
    },
    {
      id: "products",
      label: "Add Products",
      description: "List at least one product",
      isComplete: productsCount >= 1,
      link: "/products",
      icon: <Package className="w-4 h-4" />,
    },
    {
      id: "direct-payments",
      label: "Direct Payments",
      description: "Connect bank for instant payouts",
      isComplete: !!shop?.paystack_subaccount_code,
      link: "/my-store",
      icon: <CreditCard className="w-4 h-4" />,
    },
  ];

  const completedCount = checklistItems.filter((item) => item.isComplete).length;
  const totalCount = checklistItems.length;
  const percentage = Math.round((completedCount / totalCount) * 100);

  const getMessage = () => {
    if (percentage === 100) return MESSAGES.complete;
    if (percentage >= 75) return MESSAGES.almostDone;
    if (percentage >= 50) return MESSAGES.high;
    if (percentage >= 25) return MESSAGES.medium;
    return MESSAGES.low;
  };

  const handleDismiss = () => {
    localStorage.setItem("profile-checklist-dismissed", "true");
    setIsDismissed(true);
  };

  const handleRestore = () => {
    localStorage.removeItem("profile-checklist-dismissed");
    setIsDismissed(false);
  };

  // If 100% complete, show celebration card
  if (percentage === 100) {
    if (isDismissed) return null;
    
    return (
      <Card className="mb-6 sm:mb-8 border-2 border-green-500/30 bg-green-500/5 relative overflow-hidden">
        <div className="absolute top-2 right-2">
          <Button variant="ghost" size="icon" onClick={handleDismiss} className="h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </div>
        <CardContent className="p-4 sm:p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-green-600">{getMessage()}</h3>
            <p className="text-sm text-muted-foreground">Your shop is ready to receive customers</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show dismissed state as small restore button
  if (isDismissed) {
    return (
      <div className="mb-4">
        <Button variant="ghost" size="sm" onClick={handleRestore} className="text-xs text-muted-foreground">
          Show setup checklist ({percentage}% complete)
        </Button>
      </div>
    );
  }

  return (
    <Card className="mb-6 sm:mb-8 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="font-heading text-lg sm:text-xl flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Complete Your Shop Setup
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={handleDismiss} className="h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-1">{getMessage()}</p>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-2 sm:pt-3">
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold">{completedCount}/{totalCount} ({percentage}%)</span>
          </div>
          <Progress value={percentage} className="h-2" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {checklistItems.map((item) => (
            <button
              key={item.id}
              onClick={() => !item.isComplete && navigate(item.link)}
              disabled={item.isComplete}
              className={`flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                item.isComplete
                  ? "bg-green-500/10 cursor-default"
                  : "bg-muted/50 hover:bg-muted cursor-pointer hover:shadow-sm"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  item.isComplete ? "bg-green-500/20 text-green-600" : "bg-muted text-muted-foreground"
                }`}
              >
                {item.isComplete ? <CheckCircle className="w-4 h-4" /> : item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium truncate ${
                    item.isComplete ? "text-green-600 line-through" : "text-foreground"
                  }`}
                >
                  {item.label}
                </p>
                <p className="text-xs text-muted-foreground truncate">{item.description}</p>
              </div>
              {!item.isComplete && <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
            </button>
          ))}
        </div>

        {percentage >= 75 && percentage < 100 && (
          <p className="text-sm text-primary mt-4 animate-pulse text-center">
            Almost there! Just {totalCount - completedCount} more step{totalCount - completedCount !== 1 ? 's' : ''} to go! 🔥
          </p>
        )}
      </CardContent>
    </Card>
  );
};
