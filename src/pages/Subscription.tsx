import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Clock, CheckCircle, AlertCircle, Calendar, Crown, Zap, ArrowRight, Loader2, CreditCard, Gift, History } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { calculateSubscriptionStatus } from "@/utils/subscription";
import { format, differenceInDays } from "date-fns";
import { PageWrapper } from "@/components/PageWrapper";
import logo from "@/assets/steersolo-logo.jpg";

interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
}

interface SubscriptionHistoryEvent {
  id: string;
  event_type: string;
  plan_name: string | null;
  amount: number | null;
  new_expiry_at: string | null;
  notes: string | null;
  created_at: string;
}

const Subscription = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan | null>(null);
  const [allPlans, setAllPlans] = useState<SubscriptionPlan[]>([]);
  const [history, setHistory] = useState<SubscriptionHistoryEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        loadSubscriptionData();
      } else {
        navigate("/auth/login");
      }
    }
  }, [user, authLoading]);

  const loadSubscriptionData = async () => {
    try {
      // Fetch profile with subscription details
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*, subscription_plan_id")
        .eq("id", user!.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch all subscription plans
      const { data: plansData, error: plansError } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (plansError) throw plansError;
      
      const parsedPlans = plansData?.map(plan => ({
        ...plan,
        features: typeof plan.features === 'string' ? JSON.parse(plan.features) : plan.features || []
      })) || [];
      
      setAllPlans(parsedPlans);

      // Find current plan
      if (profileData?.subscription_plan_id) {
        const plan = parsedPlans.find(p => p.id === profileData.subscription_plan_id);
        setCurrentPlan(plan || null);
      }

      // Fetch subscription history
      const { data: historyData } = await supabase
        .from("subscription_history")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(10);

      setHistory(historyData || []);
    } catch (error) {
      console.error("Error loading subscription data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'payment':
        return <CreditCard className="w-4 h-4 text-green-600" />;
      case 'extension':
        return <Gift className="w-4 h-4 text-blue-600" />;
      case 'activation':
        return <CheckCircle className="w-4 h-4 text-primary" />;
      case 'plan_change':
        return <ArrowRight className="w-4 h-4 text-purple-600" />;
      default:
        return <History className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getEventTitle = (event: SubscriptionHistoryEvent) => {
    switch (event.event_type) {
      case 'payment':
        return `Payment - ${event.plan_name || 'Subscription'}`;
      case 'extension':
        return 'Subscription Extended';
      case 'activation':
        return `${event.plan_name || 'Subscription'} Activated`;
      case 'plan_change':
        return `Changed to ${event.plan_name}`;
      default:
        return 'Subscription Update';
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const subStatus = profile ? calculateSubscriptionStatus(profile) : { status: 'expired', daysRemaining: 0 };
  const expiryDate = profile?.subscription_expires_at ? new Date(profile.subscription_expires_at) : null;
  const progressPercentage = subStatus.daysRemaining > 0 ? Math.min((subStatus.daysRemaining / 30) * 100, 100) : 0;

  return (
    <PageWrapper patternVariant="dots" patternOpacity={0.5}>
      {/* Header */}
      <nav className="bg-card/80 backdrop-blur-lg border-b border-border/50 sticky top-0 z-50">
        <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary" />
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} className="mr-2">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-md ring-2 ring-primary/20">
                <img src={logo} alt="SteerSolo" className="w-full h-full object-cover" />
              </div>
              <span className="text-xl sm:text-2xl font-heading font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Subscription
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-4xl">
        {/* Current Status Card */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-heading">Your Subscription</CardTitle>
                <CardDescription>Manage your SteerSolo subscription</CardDescription>
              </div>
              <Badge
                variant="outline"
                className={`text-lg py-2 px-4 ${
                  subStatus.status === 'active'
                    ? 'border-green-500 text-green-500 bg-green-500/10'
                    : subStatus.status === 'trial'
                    ? 'border-gold text-gold bg-gold/10'
                    : 'border-destructive text-destructive bg-destructive/10'
                }`}
              >
                {subStatus.status === 'active' && <CheckCircle className="w-4 h-4 mr-2" />}
                {subStatus.status === 'trial' && <Clock className="w-4 h-4 mr-2" />}
                {subStatus.status === 'expired' && <AlertCircle className="w-4 h-4 mr-2" />}
                {subStatus.status === 'active' ? 'Active' : subStatus.status === 'trial' ? 'Trial' : 'Expired'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Plan */}
            <div className="p-4 rounded-lg bg-muted/50 border">
              <div className="flex items-center gap-3 mb-2">
                <Crown className="w-5 h-5 text-primary" />
                <span className="font-semibold text-lg">
                  {currentPlan?.name || (subStatus.status === 'trial' ? 'Free Trial' : 'No Active Plan')}
                </span>
              </div>
              {currentPlan && (
                <p className="text-muted-foreground">
                  ₦{currentPlan.price_monthly.toLocaleString()}/month
                </p>
              )}
            </div>

            {/* Expiry Date & Progress */}
            {expiryDate && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {subStatus.status === 'expired' ? 'Expired on' : 'Expires on'}
                    </span>
                  </div>
                  <span className="font-medium">{format(expiryDate, "MMMM dd, yyyy")}</span>
                </div>
                
                {subStatus.daysRemaining > 0 && (
                  <>
                    <Progress value={progressPercentage} className="h-2" />
                    <p className="text-sm text-center text-muted-foreground">
                      {subStatus.daysRemaining} day{subStatus.daysRemaining !== 1 ? 's' : ''} remaining
                    </p>
                  </>
                )}
              </div>
            )}

            {/* Current Plan Features */}
            {currentPlan?.features && currentPlan.features.length > 0 && (
              <div className="space-y-2">
                <p className="font-medium text-sm text-muted-foreground">Your plan includes:</p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {currentPlan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              {subStatus.status === 'expired' ? (
                <Button 
                  className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  onClick={() => navigate('/pricing')}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Reactivate Subscription
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => navigate('/pricing')}
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  {currentPlan ? 'Change Plan' : 'View Plans'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Subscription History */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl font-heading flex items-center gap-2">
              <History className="w-5 h-5" />
              Subscription History
            </CardTitle>
            <CardDescription>Your payment and plan change history</CardDescription>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <p className="text-muted-foreground text-center py-6">No subscription history yet</p>
            ) : (
              <div className="space-y-4">
                {history.map((event) => (
                  <div key={event.id} className="flex gap-4 p-4 rounded-lg border bg-muted/30">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      event.event_type === 'payment' ? 'bg-green-100' :
                      event.event_type === 'extension' ? 'bg-blue-100' :
                      event.event_type === 'activation' ? 'bg-primary/10' : 'bg-muted'
                    }`}>
                      {getEventIcon(event.event_type)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{getEventTitle(event)}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(event.created_at), "MMM dd, yyyy 'at' h:mm a")}
                      </p>
                      {event.amount && (
                        <p className="text-sm text-green-600 font-medium mt-1">
                          ₦{(event.amount / 100).toLocaleString()}
                        </p>
                      )}
                      {event.new_expiry_at && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Valid until {format(new Date(event.new_expiry_at), "MMM dd, yyyy")}
                        </p>
                      )}
                      {event.notes && (
                        <p className="text-xs text-muted-foreground mt-1 italic">{event.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Plans Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-heading">Available Plans</CardTitle>
            <CardDescription>Compare plans and upgrade anytime</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {allPlans.map((plan) => (
                <div 
                  key={plan.id} 
                  className={`p-4 rounded-lg border-2 transition-all ${
                    currentPlan?.id === plan.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{plan.name}</h3>
                    {currentPlan?.id === plan.id && (
                      <Badge variant="secondary" className="text-xs">Current</Badge>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-primary mb-1">
                    ₦{plan.price_monthly.toLocaleString()}
                    <span className="text-sm font-normal text-muted-foreground">/mo</span>
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    or ₦{plan.price_yearly.toLocaleString()}/year (save 2 months)
                  </p>
                  <ul className="space-y-1">
                    {plan.features.slice(0, 3).map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-1 text-xs text-muted-foreground">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        {feature}
                      </li>
                    ))}
                    {plan.features.length > 3 && (
                      <li className="text-xs text-muted-foreground">
                        +{plan.features.length - 3} more features
                      </li>
                    )}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Button onClick={() => navigate('/pricing')}>
                View Full Plan Details
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
};

export default Subscription;
