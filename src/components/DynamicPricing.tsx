import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Star, Loader2 } from "lucide-react";
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
}

export const DynamicPricing = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .gt('price_monthly', 0) // Exclude free/starter plans
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
        display_order: p.display_order
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

  const getPlanHighlight = (slug: string) => {
    switch (slug) {
      case 'basic':
        return { badge: null, highlight: false };
      case 'pro':
        return { badge: 'Most Popular', highlight: true };
      case 'business':
        return { badge: 'Best Value', highlight: false };
      default:
        return { badge: null, highlight: false };
    }
  };

  const getDefaultFeatures = (slug: string, plan: Plan) => {
    const baseFeatures = plan.features.length > 0 ? plan.features : [];
    
    const additionalFeatures: string[] = [];
    if (plan.max_products) {
      additionalFeatures.push(`Up to ${plan.max_products} products`);
    } else {
      additionalFeatures.push('Unlimited products');
    }
    if (plan.ai_features_enabled) {
      additionalFeatures.push('AI marketing tools');
    }
    if (plan.priority_support) {
      additionalFeatures.push('Priority support');
    }

    return [...additionalFeatures, ...baseFeatures.map(f => String(f))];
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
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start with a 15-day free trial. No credit card required.
          </p>
        </div>

        <div className={`grid gap-6 max-w-5xl mx-auto ${
          plans.length === 1 ? 'md:grid-cols-1 max-w-md' :
          plans.length === 2 ? 'md:grid-cols-2 max-w-3xl' :
          'md:grid-cols-3'
        }`}>
          {plans.map((plan) => {
            const { badge, highlight } = getPlanHighlight(plan.slug);
            const features = getDefaultFeatures(plan.slug, plan);

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
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description || `Perfect for ${plan.slug} users`}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">₦{formatPrice(plan.price_monthly)}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    {features.slice(0, 6).map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className={`w-5 h-5 mt-0.5 shrink-0 ${highlight ? 'text-primary' : 'text-green-500'}`} />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link to="/auth/signup">
                    <Button 
                      className={`w-full ${highlight ? 'bg-primary hover:bg-primary/90' : ''}`}
                      variant={highlight ? 'default' : 'outline'}
                    >
                      Start 15-Day Free Trial
                    </Button>
                  </Link>
                  
                  <p className="text-xs text-center text-muted-foreground mt-3">
                    Less than ₦{Math.round(plan.price_monthly / 100 / 30)} per day
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <p className="text-center text-muted-foreground mt-8">
          All plans include WhatsApp integration, secure payments, and customer management.
        </p>
      </div>
    </section>
  );
};
