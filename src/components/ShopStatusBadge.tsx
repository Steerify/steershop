import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, AlertTriangle, Sparkles, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export type ShopStatus = 'active' | 'trial' | 'expired' | 'free' | 'pending';

interface ShopStatusBadgeProps {
  status: ShopStatus;
  daysRemaining: number;
  showUpgradeAction?: boolean;
  variant?: 'badge' | 'card';
  className?: string;
}

export const ShopStatusBadge = ({ 
  status, 
  daysRemaining, 
  showUpgradeAction = true,
  variant = 'badge',
  className 
}: ShopStatusBadgeProps) => {
  const isVisible = status === 'active' || status === 'trial' || status === 'free';

  if (variant === 'card') {
    return (
      <div className={cn(
        "rounded-lg border p-3 sm:p-4",
        status === 'active' && "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900",
        status === 'trial' && "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900",
        status === 'expired' && "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900",
        status === 'pending' && "bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-900",
        className
      )}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2">
            {status === 'active' && (
              <>
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
                <div>
                  <p className="font-medium text-green-800 dark:text-green-300 text-sm sm:text-base">
                    Active Subscription
                  </p>
                  <p className="text-xs sm:text-sm text-green-600 dark:text-green-400">
                    {daysRemaining} days remaining
                  </p>
                </div>
              </>
            )}
            {status === 'trial' && (
              <>
                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-300 text-sm sm:text-base">
                    Free Trial
                  </p>
                  <p className="text-xs sm:text-sm text-amber-600 dark:text-amber-400">
                    {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left
                  </p>
                </div>
              </>
            )}
            {status === 'expired' && (
              <>
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
                <div>
                  <p className="font-medium text-red-800 dark:text-red-300 text-sm sm:text-base">
                    Subscription Expired
                  </p>
                  <p className="text-xs sm:text-sm text-red-600 dark:text-red-400">
                    Your store is hidden from customers
                  </p>
                </div>
              </>
            )}
            {status === 'pending' && (
              <>
                <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400 shrink-0" />
                <div>
                  <p className="font-medium text-orange-800 dark:text-orange-300 text-sm sm:text-base">
                    Pending Approval
                  </p>
                  <p className="text-xs sm:text-sm text-orange-600 dark:text-orange-400">
                    Our team is reviewing your store. You'll be notified once approved.
                  </p>
                </div>
              </>
            )}
          </div>
          
          {showUpgradeAction && (status === 'trial' || status === 'expired') && status !== 'pending' && (
            <Link to="/subscription" className="shrink-0">
              <Button 
                size="sm" 
                className={cn(
                  "w-full sm:w-auto",
                  status === 'expired' && "bg-red-600 hover:bg-red-700"
                )}
              >
                <Sparkles className="w-3 h-3 mr-1" />
                {status === 'expired' ? 'Reactivate' : 'Upgrade Now'}
              </Button>
            </Link>
          )}
        </div>
        
        {/* Store visibility indicator */}
        <div className={cn(
          "flex items-center gap-1.5 mt-2 pt-2 border-t text-xs sm:text-sm",
          status === 'active' && "border-green-200 dark:border-green-800",
          status === 'trial' && "border-amber-200 dark:border-amber-800",
          status === 'expired' && "border-red-200 dark:border-red-800",
          status === 'pending' && "border-orange-200 dark:border-orange-800"
        )}>
          {status === 'pending' ? (
            <>
              <Clock className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
              <span className="text-orange-700 dark:text-orange-300">
                Your store is under review
              </span>
            </>
          ) : isVisible ? (
            <>
              <Eye className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
              <span className="text-green-700 dark:text-green-300">
                Your store is visible to customers
              </span>
            </>
          ) : (
            <>
              <EyeOff className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
              <span className="text-red-700 dark:text-red-300">
                Your store is hidden - subscribe to go live
              </span>
            </>
          )}
        </div>
      </div>
    );
  }

  // Default badge variant
  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      {status === 'active' && (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/50 dark:text-green-300 dark:border-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Active • {daysRemaining}d left
        </Badge>
      )}
      {status === 'trial' && (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800">
          <Clock className="w-3 h-3 mr-1" />
          Trial • {daysRemaining}d left
        </Badge>
      )}
      {(status === 'expired' || status === 'free') && (
        <>
          <Badge variant="outline" className={cn(
            status === 'expired' 
              ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800"
              : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800"
          )}>
            {status === 'expired' ? <AlertTriangle className="w-3 h-3 mr-1" /> : <CheckCircle className="w-3 h-3 mr-1" />}
            {status === 'expired' ? 'Expired' : 'Free Plan'}
          </Badge>
          {showUpgradeAction && (
            <Link to="/subscription">
              <Button size="sm" variant={status === 'expired' ? 'destructive' : 'default'} className="h-6 px-2 text-xs">
                <Sparkles className="w-3 h-3 mr-1" />
                Upgrade
              </Button>
            </Link>
          )}
        </>
      )}
    </div>
  );
};

// Helper function to calculate status from profile data
export const getShopStatusFromProfile = (profile: {
  is_subscribed?: boolean;
  subscription_expires_at?: string | null;
}): { status: ShopStatus; daysRemaining: number } => {
  if (!profile.subscription_expires_at) {
    return { status: 'trial', daysRemaining: 15 };
  }

  const expiresAt = new Date(profile.subscription_expires_at);
  const now = new Date();
  const daysRemaining = Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  if (expiresAt <= now) {
    return { status: 'expired', daysRemaining: 0 };
  }

  if (profile.is_subscribed) {
    return { status: 'active', daysRemaining };
  }

  return { status: 'trial', daysRemaining };
};
