import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Star, Loader2, Zap, Sparkles, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price_monthly: number;
  price_yearly: number | null;
  max_products: number | null;
  features: unknown[];
  ai_features_enabled: boolean | null;
  priority_support: boolean | null;
  display_order: number | null;
  includes_business_profile: boolean | null;
  includes_google_setup: boolean | null;
  includes_seo: boolean | null;
  includes_organic_marketing: boolean | null;
}

export const DynamicPricing = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;

      const formattedPlans: Plan[] = (data || []).map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price_monthly: p.price_monthly,
        price_yearly: p.price_yearly,
        max_products: p.max_products,
        features: Array.isArray(p.features) ? p.features : [],
        ai_features_enabled: p.ai_features_enabled,
        priority_support: p.priority_support,
        display_order: p.display_order,
        includes_business_profile: p.includes_business_profile,
        includes_google_setup: p.includes_google_setup,
        includes_seo: p.includes_seo,
        includes_organic_marketing: p.includes_organic_marketing,
      }));

      setPlans(formattedPlans);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (priceInKobo: number) => {
    return (priceInKobo / 100).toLocaleString();
  };

  const getPlanMeta = (slug: string) => {
    switch (slug) {
      case 'free':
        return { badge: 'FREE FOREVER', highlight: false, icon: Zap, tagline: "Start selling — no risk, no cost" };
      case 'basic':
        return { badge: null, highlight: false, icon: Zap, tagline: "Perfect for getting started" };
      case 'pro':
        return { badge: 'Most Popular', highlight: true, icon: Sparkles, tagline: "Includes DFY Business Profile" };
      case 'business':
        return { badge: 'Best Value', highlight: false, icon: Crown, tagline: "Full Marketing Suite" };
      default:
        return { badge: null, highlight: false, icon: Zap, tagline: "" };
    }
  };

  const getAllFeatures = (plan: Plan) => {
    const features: string[] = [];

    if (plan.max_products) {
      features.push(`Up to ${plan.max_products} products`);
    } else {
      features.push('Unlimited products');
    }

    features.push('WhatsApp integration');
    features.push('Paystack payments');
    features.push('Order management');

    if (plan.includes_business_profile) features.push('DFY Business Profile setup');
    if (plan.ai_features_enabled) features.push('AI marketing tools');
    if (plan.includes_seo) features.push('SEO optimization');
    if (plan.includes_google_setup) features.push('Google My Business setup');
    if (plan.includes_organic_marketing) features.push('Organic marketing');
    if (plan.priority_support) features.push('Priority support');

    // Add custom features from DB
    plan.features.forEach(f => {
      const str = String(f);
      if (!features.includes(str)) features.push(str);
    });

    return features;
  };

  const getPrice = (plan: Plan) => {
    if (billingCycle === "yearly" && plan.price_yearly) {
      return plan.price_yearly;
    }
    return plan.price_monthly;
  };

  const getYearlySavings = (plan: Plan) => {
    if (!plan.price_yearly) return 0;
    const monthlyTotal = plan.price_monthly * 12;
    return monthlyTotal - plan.price_yearly;
  };

  if (isLoading) {
    return (
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground mt-2">Loading pricing...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Start with a 15-day free trial. No credit card required.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-3 bg-muted rounded-full p-1">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                billingCycle === "monthly"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                billingCycle === "yearly"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Yearly
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Save</Badge>
            </button>
          </div>
        </div>

        <div className={`grid gap-6 max-w-6xl mx-auto ${
          plans.length <= 2 ? 'md:grid-cols-2 max-w-3xl' :
          plans.length === 3 ? 'md:grid-cols-3 max-w-5xl' :
          'md:grid-cols-4'
        }`}>
          {plans.map((plan) => {
            const { badge, highlight, icon: PlanIcon, tagline } = getPlanMeta(plan.slug);
            const features = getAllFeatures(plan);
            const price = getPrice(plan);
            const savings = getYearlySavings(plan);
            const dailyCost = Math.round(price / 100 / (billingCycle === "yearly" ? 365 : 30));

            return (
              <Card 
                key={plan.id} 
                className={`relative ${highlight ? 'border-2 border-primary shadow-lg scale-105' : 'border'}`}
              >
                {badge && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      {badge}
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="pb-4 pt-6">
                  <div className="flex items-center gap-2 mb-1">
                    <PlanIcon className={`w-5 h-5 ${highlight ? 'text-primary' : 'text-muted-foreground'}`} />
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  </div>
                  <CardDescription>{tagline || plan.description || `Perfect for ${plan.slug} users`}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="mb-1">
                    {price === 0 ? (
                      <>
                        <span className="text-4xl font-bold text-green-600">₦0</span>
                        <span className="text-muted-foreground"> forever</span>
                      </>
                    ) : (
                      <>
                        <span className="text-4xl font-bold">₦{formatPrice(price)}</span>
                        <span className="text-muted-foreground">/{billingCycle === "yearly" ? "year" : "month"}</span>
                      </>
                    )}
                  </div>
                  
                  {billingCycle === "yearly" && savings > 0 && (
                    <p className="text-sm text-primary font-medium mb-2">
                      Save ₦{formatPrice(savings)}/year
                    </p>
                  )}
                  
                  {price > 0 && (
                    <p className="text-xs text-muted-foreground mb-6">
                      Less than ₦{dailyCost} per day
                    </p>
                  )}
                  {price === 0 && <div className="mb-6" />}
                  
                  <ul className="space-y-2.5 mb-8">
                    {features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2.5">
                        <CheckCircle className={`w-4 h-4 mt-0.5 shrink-0 ${highlight ? 'text-primary' : 'text-primary/70'}`} />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link to="/auth/signup">
                    <Button 
                      className={`w-full ${highlight ? 'bg-primary hover:bg-primary/90' : ''} ${price === 0 ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`}
                      variant={highlight || price === 0 ? 'default' : 'outline'}
                    >
                      {price === 0 ? 'Start Free Forever' : 'Start 15-Day Free Trial'}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-10 space-y-2">
          <p className="text-muted-foreground text-sm">
            All plans include: 15-day free trial • WhatsApp integration • Paystack payments • Customer management
          </p>
          <p className="text-muted-foreground text-xs">
            Prices in Nigerian Naira (₦). Cancel anytime.
          </p>
        </div>
      </div>
    </section>
  );
};
