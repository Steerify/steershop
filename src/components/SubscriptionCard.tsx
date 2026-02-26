import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Check, Sparkles, Crown, Zap, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import subscriptionService, { SubscriptionPlan } from "@/services/subscription.service";
import { useToast } from "@/hooks/use-toast";

interface SubscriptionCardProps {
  plans: SubscriptionPlan[];
  currentPlanId?: string;
  onSubscriptionSuccess?: () => void;
}

const planIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  basic: Zap,
  pro: Sparkles,
  business: Crown,
};

export const SubscriptionCard = ({ plans, currentPlanId, onSubscriptionSuccess }: SubscriptionCardProps) => {
  const [isYearly, setIsYearly] = useState(false);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    // Free plan — redirect to signup instead of Paystack
    if (plan.price_monthly === 0) {
      window.location.href = '/auth/signup';
      return;
    }

    setIsLoading(plan.slug);
    
    try {
      const result = await subscriptionService.initializePayment(
        plan.slug,
        isYearly ? 'yearly' : 'monthly'
      );

      if (result.success && result.authorization_url) {
        // Store reference for verification after redirect
        localStorage.setItem('paystack_reference', result.reference || '');
        
        // Redirect to Paystack
        window.location.href = result.authorization_url;
      } else {
        toast({
          title: "Payment Error",
          description: result.error || "Failed to initialize payment",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  const formatPrice = (kobo: number) => {
    return (kobo / 100).toLocaleString();
  };

  const calculateSavings = (monthly: number, yearly: number | null) => {
    if (!yearly) return 0;
    const yearlyFromMonthly = monthly * 12;
    return yearlyFromMonthly - yearly;
  };

  return (
    <div className="space-y-6">
      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-4 p-4 bg-muted/50 rounded-xl">
        <Label 
          htmlFor="billing-toggle" 
          className={cn("text-sm font-medium", !isYearly && "text-primary")}
        >
          Monthly
        </Label>
        <Switch
          id="billing-toggle"
          checked={isYearly}
          onCheckedChange={setIsYearly}
        />
        <Label 
          htmlFor="billing-toggle" 
          className={cn("text-sm font-medium", isYearly && "text-primary")}
        >
          Yearly
        </Label>
        {isYearly && (
          <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100">
            Save up to 17%!
          </Badge>
        )}
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        {plans.map((plan) => {
          const Icon = planIcons[plan.slug] || Zap;
          const price = isYearly && plan.price_yearly ? plan.price_yearly : plan.price_monthly;
          const savings = calculateSavings(plan.price_monthly, plan.price_yearly);
          const isCurrentPlan = currentPlanId === plan.id;
          const isPopular = plan.slug === 'pro';

          return (
            <Card 
              key={plan.id}
              className={cn(
                "relative overflow-hidden transition-all hover:shadow-lg",
                isPopular && "border-primary shadow-lg ring-2 ring-primary/20",
                isCurrentPlan && "border-green-500 bg-green-50/50 dark:bg-green-950/20"
              )}
            >
              {isPopular && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold rounded-bl-lg">
                  POPULAR
                </div>
              )}
              
              {isCurrentPlan && (
                <div className="absolute top-0 left-0 bg-green-500 text-white px-3 py-1 text-xs font-semibold rounded-br-lg">
                  CURRENT PLAN
                </div>
              )}

              <CardHeader className="pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    plan.slug === 'basic' && "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300",
                    plan.slug === 'pro' && "bg-primary/10 text-primary",
                    plan.slug === 'business' && "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300"
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <CardTitle className="font-heading">{plan.name}</CardTitle>
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-heading font-bold">₦{formatPrice(price)}</span>
                    <span className="text-muted-foreground">/{isYearly ? 'year' : 'month'}</span>
                  </div>
                  {isYearly && savings > 0 && (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                      Save ₦{formatPrice(savings)}/year
                    </p>
                  )}
                </div>

                <ul className="space-y-2">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className={cn(
                    "w-full",
                    isPopular && "bg-gradient-to-r from-primary to-accent hover:opacity-90",
                    isCurrentPlan && "bg-green-500 hover:bg-green-600"
                  )}
                  onClick={() => handleSubscribe(plan)}
                  disabled={isLoading !== null || isCurrentPlan}
                >
                  {isLoading === plan.slug ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : isCurrentPlan ? (
                    "Current Plan"
                  ) : plan.price_monthly === 0 ? (
                    "Get Started Free"
                  ) : (
                    `Subscribe to ${plan.name}`
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
