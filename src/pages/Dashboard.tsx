import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Store, Package, ShoppingCart, LogOut, Clock, CheckCircle, AlertCircle, ArrowRight, TrendingUp, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subMonths } from "date-fns";
import { calculateSubscriptionStatus } from "@/utils/subscription";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";


const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [daysRemaining, setDaysRemaining] = useState<number>(0);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'active' | 'trial' | 'expired'>('trial');
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    checkAuth();
    verifyPaymentOnReturn();
  }, []);

  useEffect(() => {
    if (profile) {
      loadAnalytics();
    }
  }, [profile]);

  const loadAnalytics = async () => {
    try {
      // Get shop data
      const { data: shopData } = await supabase
        .from("shops")
        .select("id")
        .eq("owner_id", profile.id)
        .single();

      if (!shopData) return;

      // Get revenue transactions for the last 30 days
      const thirtyDaysAgo = subMonths(new Date(), 1);
      
      const { data: revenueData } = await supabase
        .from("revenue_transactions")
        .select("amount, created_at")
        .eq("shop_id", shopData.id)
        .gte("created_at", thirtyDaysAgo.toISOString())
        .order("created_at", { ascending: true });

      if (!revenueData) return;

      // Calculate total revenue from confirmed payments
      const revenue = revenueData.reduce((sum, transaction) => sum + Number(transaction.amount), 0);
      setTotalRevenue(revenue);
      setTotalSales(revenueData.length);

      // Prepare chart data - last 7 days
      const last7Days = eachDayOfInterval({
        start: subMonths(new Date(), 0).setDate(new Date().getDate() - 6),
        end: new Date()
      });

      const dailyData = last7Days.map(day => {
        const dayRevenue = revenueData.filter(transaction => 
          format(new Date(transaction.created_at), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
        );
        
        return {
          date: format(day, 'MMM dd'),
          revenue: dayRevenue.reduce((sum, transaction) => sum + Number(transaction.amount), 0),
          sales: dayRevenue.length
        };
      });

      setChartData(dailyData);
    } catch (error) {
      console.error("Error loading analytics:", error);
    }
  };


const verifyPaymentOnReturn = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const reference = urlParams.get('reference');
  
  if (reference) {
    try {
      const { data, error } = await supabase.functions.invoke('paystack-verify', {
        body: { reference },
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Payment Successful! 🎉",
          description: "Your subscription has been activated.",
        });
        
        // Refresh profile data
        checkAuth();
        
        // Clean URL
        window.history.replaceState({}, '', '/dashboard');
      }
    } catch (error: any) {
      console.error('Payment verification error:', error);
    }
  }
};

const checkAuth = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/auth/login");
      return;
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    // Check role from user_roles table (authoritative source)
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleData?.role !== "shop_owner") {
      navigate("/customer/dashboard");
      return;
    }

    setProfile(profileData);
    
    // Use the new utility function
    const subscriptionInfo = calculateSubscriptionStatus(profileData);
    setDaysRemaining(subscriptionInfo.daysRemaining);
    setSubscriptionStatus(subscriptionInfo.status);
    
  } catch (error) {
    console.error("Error:", error);
  } finally {
    setIsLoading(false);
  }
};

  const handleSubscribe = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('paystack-initialize', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;

      // Redirect to Paystack payment page
      window.location.href = data.authorization_url;
    } catch (error: any) {
      console.error('Error initializing payment:', error);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "Come back soon!",
    });
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Store className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold">SteerSolo</span>
            </div>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {profile?.full_name}!</p>
            </div>

            <div>
              {subscriptionStatus === 'trial' && daysRemaining > 0 && (
                <Badge variant="outline" className="text-lg py-2 px-4 border-accent text-accent">
                  <Clock className="w-4 h-4 mr-2" />
                  {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} trial remaining
                </Badge>
              )}
              {subscriptionStatus === 'active' && (
                <Badge variant="outline" className="text-lg py-2 px-4 border-green-500 text-green-500">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Active Subscription
                </Badge>
              )}
              {subscriptionStatus === 'expired' && (
                <Badge variant="outline" className="text-lg py-2 px-4 border-destructive text-destructive">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Subscription Expired
                </Badge>
              )}
            </div>
          </div>

          {/* Special Offer Card - Moved here for better layout */}
          <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">Special Shop Owner Offer! 🎁</h3>
                  <p className="opacity-90">
                    Get your first month at 50% off. Use code: <strong>FIRSTMONTH50</strong>
                  </p>
                  <p className="text-sm opacity-80 mt-1">
                    Valid until {format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), "MMM dd, yyyy")}
                  </p>
                </div>
                <Button 
                  variant="secondary" 
                  onClick={handleSubscribe}
                  disabled={isLoading}
                  className="whitespace-nowrap"
                >
                  {isLoading ? "Processing..." : "Claim Offer"}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subscription Notice */}
        {(subscriptionStatus === 'trial' || subscriptionStatus === 'expired') && (
          <Card className="mb-8 border-2 border-accent">
            <CardHeader>
              <CardTitle>
                {subscriptionStatus === 'trial' 
                  ? '🎉 Upgrade Your Store' 
                  : '⚠️ Subscription Required'}
              </CardTitle>
              <CardDescription>
                {subscriptionStatus === 'trial' 
                  ? `You have ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left in your free trial. Subscribe now for only ₦1,000/month to continue selling after your trial ends.`
                  : 'Your trial has expired. Subscribe for ₦1,000/month to reactivate your store and continue selling.'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Button 
                  className="bg-accent hover:bg-accent/90"
                  onClick={handleSubscribe}
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : "Subscribe Now - ₦1,000/month"}
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

        {/* Analytics Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Sales Analytics</h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Total Revenue Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Revenue
                </CardTitle>
                <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-accent" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">₦{totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  From completed orders
                </p>
              </CardContent>
            </Card>

            {/* Total Sales Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Sales
                </CardTitle>
                <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-accent" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalSales}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Orders in the last 30 days
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend (Last 7 Days)</CardTitle>
              <CardDescription>Daily revenue from completed orders</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  revenue: {
                    label: "Revenue (₦)",
                    color: "hsl(var(--accent))",
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
                      fill="hsl(var(--accent))" 
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card 
            className="hover:shadow-lg transition-all cursor-pointer group"
            onClick={() => navigate("/my-store")}
          >
            <CardHeader>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <Store className="w-6 h-6 text-accent" />
              </div>
              <CardTitle>My Store</CardTitle>
              <CardDescription>
                Setup and customize your storefront
              </CardDescription>
            </CardHeader>
          </Card>

          <Card 
            className="hover:shadow-lg transition-all cursor-pointer group"
            onClick={() => navigate("/products")}
          >
            <CardHeader>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <Package className="w-6 h-6 text-accent" />
              </div>
              <CardTitle>Products</CardTitle>
              <CardDescription>
                Manage your product catalog
              </CardDescription>
            </CardHeader>
          </Card>

          <Card 
            className="hover:shadow-lg transition-all cursor-pointer group"
            onClick={() => navigate("/orders")}
          >
            <CardHeader>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <ShoppingCart className="w-6 h-6 text-accent" />
              </div>
              <CardTitle>Orders</CardTitle>
              <CardDescription>
                View and manage customer orders
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;