import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Sparkles, Check, Zap, Crown, HelpCircle, Clock, Users, TrendingUp, ShieldCheck } from "lucide-react";
import { AdirePattern } from "@/components/patterns/AdirePattern";
import { useAuth } from "@/context/AuthContext";
import { SubscriptionCard } from "@/components/SubscriptionCard";
import subscriptionService, { SubscriptionPlan } from "@/services/subscription.service";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/steersolo-logo.jpg";

const planProfiles: Record<string, { bestFor: string; outcome: string; timeSaved: string }> = {
  free: {
    bestFor: "Testing the waters — zero risk",
    outcome: "Launch your first store in 10 minutes",
    timeSaved: "Start selling immediately, no commitment",
  },
  basic: {
    bestFor: "New sellers just starting out on WhatsApp",
    outcome: "Get your first 5 orders in 14 days",
    timeSaved: "Save ~3 hours/week on order management",
  },
  pro: {
    bestFor: "Growing sellers with 10+ orders/month",
    outcome: "Double your conversion rate in 30 days",
    timeSaved: "Save ~8 hours/week with AI tools & automation",
  },
  business: {
    bestFor: "Established sellers scaling to ₦500K+/month",
    outcome: "Full marketing suite to 3x your revenue",
    timeSaved: "Save ~15 hours/week with done-for-you services",
  },
};

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentPlanId, setCurrentPlanId] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const plansResult = await subscriptionService.getPlans();
      if (plansResult.success) {
        setPlans(plansResult.data);
      }

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_plan_id')
          .eq('id', user.id)
          .single();
        
        if (profile?.subscription_plan_id) {
          setCurrentPlanId(profile.subscription_plan_id);
        }
      }
    } catch (error) {
      console.error('Error loading pricing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const faqs = [
    {
      q: "What happens after my free trial?",
      a: "You'll need to subscribe to continue using SteerSolo. Your store remains active but hidden until you subscribe."
    },
    {
      q: "Can I change plans later?",
      a: "Yes! You can upgrade or downgrade at any time. The difference will be prorated."
    },
    {
      q: "Is there a setup fee?",
      a: "No setup fees! However, we offer a premium 'Done-For-You' store setup service if you need help getting started."
    },
    {
      q: "How do payments work?",
      a: "We use Paystack for secure payments. You can pay with cards, bank transfer, or USSD."
    },
    {
      q: "What if I don't get results?",
      a: "Complete your setup milestones within 14 days. If you don't see measurable improvement, your next month is free."
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 relative">
      <AdirePattern variant="dots" className="fixed inset-0 opacity-5 pointer-events-none" />
      
      {/* Header */}
      <nav className="bg-card/80 backdrop-blur-lg border-b border-border/50 sticky top-0 z-50">
        <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary" />
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate(-1)}
                className="mr-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-md ring-2 ring-primary/20">
                <img src={logo} alt="SteerSolo" className="w-full h-full object-cover" />
              </div>
              <span className="text-xl sm:text-2xl font-heading font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                SteerSolo
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
        {/* Hero Section — ROI-first */}
        <div className="text-center mb-10 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Start Free. Upgrade When You Grow.
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
            Your free store is forever. Paid plans pay for themselves — choose the one that matches your stage.
          </p>

          {/* ROI highlights */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Free forever plan
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              Cancel anytime
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              No hidden fees
            </div>
          </div>
        </div>

        {/* Plan Profiles — Best-fit cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto mb-10">
          {Object.entries(planProfiles).map(([slug, profile]) => (
            <Card key={slug} className="border-border/50 bg-card/50">
              <CardContent className="p-5 text-center">
                <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">
                  {slug} plan
                </p>
                <p className="text-sm font-medium mb-2">{profile.bestFor}</p>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p className="flex items-center gap-1.5 justify-center">
                    <TrendingUp className="w-3 h-3 text-green-500" />
                    {profile.outcome}
                  </p>
                  <p className="flex items-center gap-1.5 justify-center">
                    <Clock className="w-3 h-3 text-blue-500" />
                    {profile.timeSaved}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Subscription Cards */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-pulse text-muted-foreground">Loading plans...</div>
          </div>
        ) : (
          <SubscriptionCard 
            plans={plans} 
            currentPlanId={currentPlanId}
          />
        )}

        {/* Guarantee Banner */}
        <div className="max-w-3xl mx-auto mt-10">
          <Card className="bg-gradient-to-r from-green-500/10 via-emerald-500/5 to-green-500/10 border-green-500/20">
            <CardContent className="p-6 text-center">
              <ShieldCheck className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <h3 className="text-lg font-heading font-bold mb-2">
                Results Guarantee
              </h3>
              <p className="text-sm text-muted-foreground max-w-xl mx-auto">
                Complete your setup milestones within 14 days. If you don't see measurable order improvement, your next month is on us. No questions asked.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Setup Service CTA */}
        <Card className="mt-10 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-primary/20">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium text-primary uppercase tracking-wide">Premium Service</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-heading font-bold mb-2">
                  Done-For-You Store Setup
                </h3>
                <p className="text-muted-foreground">
                  Too busy to set up your store? Let our experts create a professional storefront for you. 
                  Starting at just ₦5,000.
                </p>
              </div>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90 whitespace-nowrap"
                onClick={() => navigate('/setup-service')}
              >
                Learn More
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* FAQs */}
        <div className="mt-12 sm:mt-16">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {faqs.map((faq, idx) => (
              <Card key={idx} className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base sm:text-lg flex items-start gap-2">
                    <HelpCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    {faq.q}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        {!user && (
          <div className="text-center mt-12 sm:mt-16 py-8 sm:py-12 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl">
            <h3 className="text-xl sm:text-2xl font-heading font-bold mb-4">
              Ready to stop losing sales?
            </h3>
            <p className="text-muted-foreground mb-6">
              Join thousands of Nigerian entrepreneurs converting WhatsApp traffic into orders.
            </p>
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
              onClick={() => navigate('/auth/signup')}
            >
              Start Free Forever
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pricing;
