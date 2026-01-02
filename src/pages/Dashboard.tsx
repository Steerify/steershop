import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { mockApi } from "@/lib/api-mock";
import { useToast } from "@/hooks/use-toast";
import { Store, Package, ShoppingCart, LogOut, Clock, CheckCircle, AlertCircle, ArrowRight, TrendingUp, DollarSign, CalendarCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, eachDayOfInterval, subMonths } from "date-fns";
import { calculateSubscriptionStatus } from "@/utils/subscription";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AdirePattern } from "@/components/patterns/AdirePattern";
import logo from "@/assets/steersolo-logo.jpg";
import Joyride, { CallBackProps, STATUS } from "react-joyride";
import { useTour } from "@/hooks/useTour";
import { TourTooltip } from "@/components/tours/TourTooltip";
import { dashboardTourSteps } from "@/components/tours/tourSteps";
import { TourButton } from "@/components/tours/TourButton";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut, isLoading: isAuthLoading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [daysRemaining, setDaysRemaining] = useState<number>(0);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'active' | 'trial' | 'expired'>('trial');
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [chartData, setChartData] = useState<any[]>([]);
  const [activeOffer, setActiveOffer] = useState<any>(null);
  const [subscriptionPrice, setSubscriptionPrice] = useState(1000);

  // Tour state
  const { hasSeenTour, isRunning, startTour, endTour, resetTour } = useTour('dashboard');

  const handleTourCallback = (data: CallBackProps) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      endTour(status === STATUS.FINISHED);
    }
  };

  useEffect(() => {
    if (!isAuthLoading) {
      if (user) {
        loadData();
      } else {
        setIsLoading(false);
        navigate("/auth/login");
      }
    }
  }, [user, isAuthLoading]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      // Fetch mock profile
      const profileData = await mockApi.profiles.get(user!.id);
      setProfile(profileData);

      if (profileData) {
        const subscriptionInfo = calculateSubscriptionStatus(profileData);
        setDaysRemaining(subscriptionInfo.daysRemaining);
        setSubscriptionStatus(subscriptionInfo.status);
      }

      // Fetch mock analytics
      const shops = await mockApi.shops.getByOwner(user!.id);
      if (shops) {
        // Generate mock chart data since we don't have revenue transactions in mockApi yet
        const last7Days = eachDayOfInterval({
          start: subMonths(new Date(), 0).setDate(new Date().getDate() - 6),
          end: new Date()
        });

        const dailyData = last7Days.map(day => ({
          date: format(day, 'MMM dd'),
          revenue: Math.floor(Math.random() * 5000),
          sales: Math.floor(Math.random() * 5)
        }));

        setChartData(dailyData);
        setTotalRevenue(dailyData.reduce((sum, d) => sum + d.revenue, 0));
        setTotalSales(dailyData.reduce((sum, d) => sum + d.sales, 0));
      }

      // Mock offer
      setActiveOffer({
        id: "offer-1",
        title: "New Year Special",
        description: "Get 50% off your next month!",
        button_text: "Claim Now",
        subscription_price: 50000, // in kobo
      });
      setSubscriptionPrice(500);

    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async () => {
    toast({
      title: "Subscription Mock",
      description: "Redirecting to mock payment gateway...",
    });
    // Simulate payment success
    setTimeout(() => {
      toast({
        title: "Payment Successful! 🎉",
        description: "Your subscription has been activated (Mocked).",
      });
      setSubscriptionStatus('active');
    }, 2000);
  };

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Logged out",
      description: "Come back soon!",
    });
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-xl overflow-hidden">
            <img src={logo} alt="Loading" className="w-full h-full object-cover" />
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 relative">
      <AdirePattern variant="dots" className="fixed inset-0 opacity-5 pointer-events-none" />
      
      <nav className="bg-card/80 backdrop-blur-lg border-b border-border/50 sticky top-0 z-50">
        <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary" />
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md ring-2 ring-primary/20">
                <img src={logo} alt="SteerSolo" className="w-full h-full object-cover" />
              </div>
              <span className="text-2xl font-heading font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                SteerSolo
              </span>
            </div>
            <div className="flex items-center gap-3">
              <TourButton 
                onStartTour={startTour} 
                hasSeenTour={hasSeenTour} 
                onResetTour={resetTour}
              />
              <Button variant="ghost" onClick={handleLogout} className="hover:bg-destructive/10 hover:text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
            <div>
              <h1 className="text-4xl font-heading font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-muted-foreground">Welcome back, {profile?.full_name}!</p>
            </div>

            <div data-tour="subscription-status">
              {subscriptionStatus === 'trial' && daysRemaining > 0 && (
                <Badge variant="outline" className="text-lg py-2 px-4 border-gold text-gold bg-gold/10">
                  <Clock className="w-4 h-4 mr-2" />
                  {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} trial remaining
                </Badge>
              )}
              {subscriptionStatus === 'active' && (
                <Badge variant="outline" className="text-lg py-2 px-4 border-green-500 text-green-500 bg-green-500/10">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Active Subscription
                </Badge>
              )}
              {subscriptionStatus === 'expired' && (
                <Badge variant="outline" className="text-lg py-2 px-4 border-destructive text-destructive bg-destructive/10">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Subscription Expired
                </Badge>
              )}
            </div>
          </div>

          {activeOffer && (
            <Card className="bg-gradient-to-r from-primary to-accent text-primary-foreground overflow-hidden relative">
              <div className="absolute inset-0 opacity-20">
                <AdirePattern variant="geometric" />
              </div>
              <CardContent className="p-6 relative z-10">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-heading font-bold mb-2">{activeOffer.title}</h3>
                    <p className="opacity-90">{activeOffer.description}</p>
                  </div>
                  <Button 
                    variant="secondary" 
                    onClick={handleSubscribe}
                    disabled={isLoading}
                    className="whitespace-nowrap bg-gold text-primary hover:bg-gold/90"
                  >
                    {isLoading ? "Processing..." : activeOffer.button_text || "Claim Offer"}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {(subscriptionStatus === 'trial' || subscriptionStatus === 'expired') && (
          <Card className="mb-8 border-2 border-gold/30 bg-gold/5">
            <CardHeader>
              <CardTitle className="font-heading text-gold">
                {subscriptionStatus === 'trial' 
                  ? '🎉 Upgrade Your Store' 
                  : '⚠️ Subscription Required'}
              </CardTitle>
              <CardDescription>
                {subscriptionStatus === 'trial' 
                  ? `You have ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left in your free trial. Subscribe now for only ₦${subscriptionPrice.toLocaleString()}/month to continue selling after your trial ends.`
                  : `Your trial has expired. Subscribe for ₦${subscriptionPrice.toLocaleString()}/month to reactivate your store and continue selling.`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Button 
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  onClick={handleSubscribe}
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : `Subscribe Now - ₦${subscriptionPrice.toLocaleString()}/month`}
                </Button>
                {subscriptionStatus === 'trial' && (
                  <p className="text-sm text-muted-foreground">
                    Enjoy your free trial! No payment required until day 8.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mb-8" data-tour="sales-analytics">
          <h2 className="text-2xl font-heading font-bold mb-4">Sales Analytics</h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <Card className="group hover:shadow-lg hover:shadow-primary/10 transition-all border-primary/10" data-tour="revenue-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Revenue
                </CardTitle>
                <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-heading font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  ₦{totalRevenue.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  From completed orders
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg hover:shadow-accent/10 transition-all border-accent/10" data-tour="sales-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Sales
                </CardTitle>
                <div className="w-10 h-10 bg-gradient-to-br from-accent/20 to-primary/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-5 h-5 text-accent" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-heading font-bold">{totalSales}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Orders in the last 30 days
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-primary/10" data-tour="revenue-chart">
            <CardHeader>
              <CardTitle className="font-heading">Revenue Trend (Last 7 Days)</CardTitle>
              <CardDescription>Daily revenue from completed orders</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  revenue: {
                    label: "Revenue (₦)",
                    color: "hsl(var(--primary))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar 
                      dataKey="revenue" 
                      fill="hsl(var(--primary))" 
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6" data-tour="quick-actions">
          <Card 
            className="group hover:shadow-xl hover:shadow-primary/10 transition-all cursor-pointer border-primary/10 hover:border-primary/30"
            onClick={() => navigate("/my-store")}
            data-tour="my-store-action"
          >
            <CardHeader>
              <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Store className="w-7 h-7 text-primary" />
              </div>
              <CardTitle className="font-heading group-hover:text-primary transition-colors">My Store</CardTitle>
              <CardDescription>
                Setup and customize your storefront
              </CardDescription>
            </CardHeader>
          </Card>

          <Card 
            className="group hover:shadow-xl hover:shadow-accent/10 transition-all cursor-pointer border-accent/10 hover:border-accent/30"
            onClick={() => navigate("/products")}
            data-tour="products-action"
          >
            <CardHeader>
              <div className="w-14 h-14 bg-gradient-to-br from-accent/20 to-primary/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Package className="w-7 h-7 text-accent" />
              </div>
              <CardTitle className="font-heading group-hover:text-accent transition-colors">Products</CardTitle>
              <CardDescription>
                Manage your product catalog
              </CardDescription>
            </CardHeader>
          </Card>

          <Card 
            className="group hover:shadow-xl hover:shadow-gold/10 transition-all cursor-pointer border-gold/10 hover:border-gold/30"
            onClick={() => navigate("/orders")}
            data-tour="orders-action"
          >
            <CardHeader>
              <div className="w-14 h-14 bg-gradient-to-br from-gold/20 to-primary/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShoppingCart className="w-7 h-7 text-gold" />
              </div>
              <CardTitle className="font-heading group-hover:text-gold transition-colors">Orders</CardTitle>
              <CardDescription>
                View and manage customer orders
              </CardDescription>
            </CardHeader>
          </Card>

          <Card 
            className="group hover:shadow-xl hover:shadow-purple-500/10 transition-all cursor-pointer border-purple-500/10 hover:border-purple-500/30"
            onClick={() => navigate("/bookings")}
            data-tour="bookings-action"
          >
            <CardHeader>
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500/20 to-accent/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <CalendarCheck className="w-7 h-7 text-purple-500" />
              </div>
              <CardTitle className="font-heading group-hover:text-purple-500 transition-colors">Bookings</CardTitle>
              <CardDescription>
                Manage service appointments
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      <Joyride
        steps={dashboardTourSteps}
        run={isRunning}
        continuous
        showSkipButton
        showProgress
        callback={handleTourCallback}
        tooltipComponent={TourTooltip}
        styles={{
          options: {
            zIndex: 10000,
            arrowColor: 'hsl(var(--card))',
          }
        }}
      />
    </div>
  );
};

export default Dashboard;
