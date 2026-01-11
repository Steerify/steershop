import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Sparkles, Check, Zap, Crown, HelpCircle } from "lucide-react";
import { AdirePattern } from "@/components/patterns/AdirePattern";
import { useAuth } from "@/context/AuthContext";
import { SubscriptionCard } from "@/components/SubscriptionCard";
import subscriptionService, { SubscriptionPlan } from "@/services/subscription.service";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/steersolo-logo.jpg";

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
      // Fetch subscription plans
      const plansResult = await subscriptionService.getPlans();
      if (plansResult.success) {
        setPlans(plansResult.data);
      }

      // Fetch current user's plan if logged in
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
        {/* Hero Section */}
        <div className="text-center mb-10 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your business. Start with a 15-day free trial on any plan.
          </p>
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

        {/* Setup Service CTA */}
        <Card className="mt-12 sm:mt-16 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-primary/20">
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
              Ready to grow your business?
            </h3>
            <p className="text-muted-foreground mb-6">
              Join thousands of Nigerian entrepreneurs selling online with SteerSolo.
            </p>
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
              onClick={() => navigate('/auth/signup')}
            >
              Start Your Free Trial
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pricing;
