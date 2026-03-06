import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { EyeOff, ShoppingBag, Sparkles, BadgeCheck, Package, X, ArrowRight } from "lucide-react";

export const FreeShopRestrictionsBanner = () => {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const restrictions = [
    { icon: EyeOff, text: "Shop hidden from marketplace & public" },
    { icon: Package, text: "Limited to 5 products" },
    { icon: Sparkles, text: "No AI tools access" },
    { icon: BadgeCheck, text: "No verified seller badge" },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30 p-5">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
          <EyeOff className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h3 className="font-bold text-sm text-amber-800 dark:text-amber-300">
            Your shop is not visible to customers
          </h3>
          <p className="text-xs text-amber-700/70 dark:text-amber-400/60 mt-0.5">
            You're on the Free plan. Upgrade to get your shop seen.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
        {restrictions.map((r, i) => (
          <div key={i} className="flex items-center gap-2 text-xs text-amber-800/80 dark:text-amber-300/70">
            <r.icon className="w-3.5 h-3.5 shrink-0" />
            <span>{r.text}</span>
          </div>
        ))}
      </div>

      <Button
        size="sm"
        onClick={() => navigate("/pricing")}
        className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent hover:opacity-90 font-bold"
      >
        Upgrade Now
        <ArrowRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
};
