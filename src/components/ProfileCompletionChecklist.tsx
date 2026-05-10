import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Store, Image, FileText, MessageCircle, CreditCard, Package, 
  CheckCircle, ChevronRight, Sparkles, X, ShieldCheck, Tag, MapPin, Truck
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
  category?: string | null;
  city?: string | null;
  state?: string | null;
  hasDefaultAddress?: boolean;
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
      label: "Claim your store",
      description: "Set up your online shop name",
      isComplete: !!shop,
      link: "/my-store",
      icon: <Store className="w-4 h-4" />,
    },
    {
      id: "logo",
      label: "Add your brand logo",
      description: "Help customers recognize you",
      isComplete: !!shop?.logo_url,
      link: "/my-store",
      icon: <Image className="w-4 h-4" />,
    },
    {
      id: "banner",
      label: "Decorate with a banner",
      description: "Make your shop look professional",
      isComplete: !!shop?.banner_url,
      link: "/my-store",
      icon: <Image className="w-4 h-4" />,
    },
    {
      id: "description",
      label: "Tell your story",
      description: "Explain what makes your shop special",
      isComplete: !!shop?.description && shop.description.length > 20,
      link: "/my-store",
      icon: <FileText className="w-4 h-4" />,
    },
    {
      id: "category",
      label: "Choose your category",
      description: "Help customers find the right shop",
      isComplete: !!shop?.category,
      link: "/my-store",
      icon: <Tag className="w-4 h-4" />,
    },
    {
      id: "city",
      label: "Add your city",
      description: "Show customers your service area",
      isComplete: !!shop?.city && !!shop?.state,
      link: "/my-store",
      icon: <MapPin className="w-4 h-4" />,
    },
    {
      id: "pickup-address",
      label: "Set pickup address",
      description: "Needed for delivery quotes and dispatch",
      isComplete: !!shop?.hasDefaultAddress,
      link: "/my-store",
      icon: <Truck className="w-4 h-4" />,
    },
    {
      id: "whatsapp",
      label: "Link WhatsApp",
      description: "Let customers chat to buy",
      isComplete: !!shop?.whatsapp_number,
      link: "/my-store",
      icon: <MessageCircle className="w-4 h-4" />,
    },
    {
      id: "payment",
      label: "Set up payments",
      description: "Choose how you want to get paid",
      isComplete: !!shop?.payment_method,
      link: "/my-store",
      icon: <CreditCard className="w-4 h-4" />,
    },
    {
      id: "products",
      label: "Add your first product",
      description: "Give customers something to buy",
      isComplete: productsCount >= 1,
      link: "/products",
      icon: <Package className="w-4 h-4" />,
    },
    {
      id: "kyc",
      label: "Verify your identity",
      description: "Essential for secure payouts",
      isComplete: !!shop?.paystack_subaccount_code,
      link: "/identity-verification",
      icon: <ShieldCheck className="w-4 h-4" />,
    },
  ];

  const completedCount = checklistItems.filter((item) => item.isComplete).length;
  const totalCount = checklistItems.length;
  const percentage = Math.round((completedCount / totalCount) * 100);

  const getMessage = () => {
    if (percentage === 100) return MESSAGES.complete;
    if (percentage >= 75) return MESSAGES.high;
    if (percentage >= 50) return MESSAGES.medium;
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

  if (percentage === 100 && isDismissed) return null;

  if (isDismissed) {
    return (
      <div className="mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRestore} 
          className="text-xs border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 rounded-full h-8 px-4"
        >
          <Sparkles className="w-3.5 h-3.5 mr-2" />
          Setup Checklist ({percentage}% complete)
        </Button>
      </div>
    );
  }

  return (
    <Card className={`mb-8 border-none shadow-xl overflow-hidden relative group transition-all duration-500 ${percentage === 100 ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white' : 'bg-card'}`}>
      {/* Dynamic Background Patterns */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-accent rounded-full blur-3xl" />
      </div>

      <CardHeader className="relative z-10 p-6 sm:p-8 pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.1em] ${percentage === 100 ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}`}>
              <Sparkles className="w-3 h-3" /> 
              {percentage === 100 ? 'Store Ready' : 'Setup Guide'}
            </div>
            <CardTitle className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${percentage === 100 ? 'text-white' : 'text-foreground'}`}>
              {percentage === 100 ? 'You are officially a Boss! 👑' : 'Build your store, one step at a time.'}
            </CardTitle>
            <p className={`text-base ${percentage === 100 ? 'text-white/80' : 'text-muted-foreground'}`}>
              {getMessage()}
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleDismiss} 
            className={`rounded-full h-10 w-10 transition-colors ${percentage === 100 ? 'hover:bg-white/20 text-white' : 'hover:bg-muted'}`}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="relative z-10 p-6 sm:p-8 pt-0">
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm font-bold mb-3">
            <span className={percentage === 100 ? 'text-white/90' : 'text-muted-foreground'}>Your Progress</span>
            <span className={percentage === 100 ? 'text-white' : 'text-primary'}>{completedCount}/{totalCount} Completed</span>
          </div>
          <div className={`h-3 w-full rounded-full overflow-hidden ${percentage === 100 ? 'bg-white/20' : 'bg-muted'}`}>
            <div 
              className={`h-full transition-all duration-1000 ease-out ${percentage === 100 ? 'bg-white shadow-[0_0_20px_rgba(255,255,255,0.5)]' : 'bg-gradient-to-r from-primary to-accent'}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {checklistItems.map((item, index) => (
            <button
              key={item.id}
              onClick={() => !item.isComplete && navigate(item.link)}
              disabled={item.isComplete}
              className={`flex items-center gap-4 p-4 rounded-2xl text-left transition-all duration-300 group/item ${
                item.isComplete
                  ? percentage === 100 
                    ? "bg-white/10 cursor-default opacity-80" 
                    : "bg-emerald-500/5 cursor-default"
                  : "bg-muted/50 hover:bg-card hover:shadow-lg hover:-translate-y-1 cursor-pointer border border-transparent hover:border-primary/20"
              }`}
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  item.isComplete 
                    ? percentage === 100 ? "bg-white/20 text-white" : "bg-emerald-500/20 text-emerald-600" 
                    : "bg-background shadow-inner group-hover/item:scale-110"
                }`}
              >
                {item.isComplete ? <CheckCircle className="w-6 h-6" /> : item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-bold truncate transition-colors ${
                    item.isComplete 
                      ? percentage === 100 ? "text-white/60 line-through" : "text-emerald-600 line-through" 
                      : "text-foreground"
                  }`}
                >
                  {item.label}
                </p>
                <p className={`text-xs truncate ${percentage === 100 ? 'text-white/40' : 'text-muted-foreground'}`}>
                  {item.description}
                </p>
              </div>
              {!item.isComplete && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary opacity-0 group-hover/item:opacity-100 transition-opacity">
                  <ChevronRight className="w-5 h-5" />
                </div>
              )}
            </button>
          ))}
        </div>

        {percentage >= 80 && percentage < 100 && (
          <div className="mt-8 flex items-center justify-center gap-3 py-3 px-6 rounded-2xl bg-primary/5 border border-primary/10 animate-bounce">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-sm font-bold text-primary">Almost there! Your shop is about to go live! 🚀</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
