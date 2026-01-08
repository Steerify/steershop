import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import shopService from "@/services/shop.service";
import orderService from "@/services/order.service";
import offerService from "@/services/offer.service";
import productService from "@/services/product.service";
import subscriptionService from "@/services/subscription.service";
import { useToast } from "@/hooks/use-toast";
import { Store, Package, ShoppingCart, LogOut, Clock, CheckCircle, AlertCircle, ArrowRight, TrendingUp, DollarSign, CalendarCheck, Menu, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, eachDayOfInterval, subMonths, differenceInDays } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { AdirePattern } from "@/components/patterns/AdirePattern";
import { PageWrapper } from "@/components/PageWrapper";
import { FeatureDiscoveryPopup } from "@/components/FeatureDiscoveryPopup";
import logo from "@/assets/steersolo-logo.jpg";
import Joyride, { CallBackProps, STATUS } from "react-joyride";
import { useTour } from "@/hooks/useTour";
import { TourTooltip } from "@/components/tours/TourTooltip";
import { dashboardTourSteps } from "@/components/tours/tourSteps";
import { TourButton } from "@/components/tours/TourButton";
import { StrokeMyShop } from "@/components/ai/StrokeMyShop";
import { ProfileCompletionChecklist } from "@/components/ProfileCompletionChecklist";
import { BadgeDisplay } from "@/components/BadgeDisplay";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user, signOut, isLoading: isAuthLoading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState<number>(0);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'active' | 'trial' | 'expired'>('trial');
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [chartData, setChartData] = useState<any[]>([]);
  const [activeOffer, setActiveOffer] = useState<any>(null);
  const [subscriptionPrice, setSubscriptionPrice] = useState(1000);
  const [shopData, setShopData] = useState<{ id: string; name: string } | null>(null);
  const [shopFullData, setShopFullData] = useState<any>(null);
  const [productsCount, setProductsCount] = useState(0);
  const [userBadges, setUserBadges] = useState<any[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Tour state
  const { hasSeenTour, isRunning, startTour, endTour, resetTour } = useTour('dashboard');

  const handleTourCallback = (data: CallBackProps) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      endTour(status === STATUS.FINISHED);
    }
  };

  // Handle payment verification from Paystack redirect
  useEffect(() => {
    const verifyPayment = async () => {
      const subscriptionParam = searchParams.get('subscription');
      const reference = searchParams.get('reference') || localStorage.getItem('paystack_reference');
      
      if (subscriptionParam === 'verify' && reference) {
        setIsSubscribing(true);
        try {
          const result = await subscriptionService.verifyPayment(reference);
          
          if (result.success) {
            toast({
              title: "Payment Successful! 🎉",
              description: "Your subscription has been activated. Welcome to SteerSolo!",
            });
            setSubscriptionStatus('active');
            localStorage.removeItem('paystack_reference');
            // Reload data to reflect new subscription
            loadData();
          } else {
            toast({
              title: "Payment Verification Failed",
              description: result.error || "Please try again or contact support.",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error('Payment verification error:', error);
        } finally {
          setIsSubscribing(false);
          // Clear URL params
          navigate('/dashboard', { replace: true });
        }
      }
    };

    if (user) {
      verifyPayment();
    }
  }, [searchParams, user]);

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
      if (!user) return;

      // Fetch profile from Supabase for accurate subscription data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        setProfile({ full_name: user.email?.split('@')[0] || 'User' });
      } else {
        setProfile(profileData);
        
        // Calculate subscription status from profile
        if (profileData.subscription_expires_at) {
          const expiresAt = new Date(profileData.subscription_expires_at);
          const now = new Date();
          const daysLeft = differenceInDays(expiresAt, now);
          
          setDaysRemaining(Math.max(0, daysLeft));
          
          if (profileData.is_subscribed && expiresAt > now) {
            setSubscriptionStatus('active');
          } else if (!profileData.is_subscribed && expiresAt > now) {
            setSubscriptionStatus('trial');
          } else {
            setSubscriptionStatus('expired');
          }
        } else {
          setSubscriptionStatus('trial');
          setDaysRemaining(7);
        }
      }

      // Fetch real shop data
      const shopResponse = await shopService.getShopByOwner(user.id);
      const shops = shopResponse.data;
      const primaryShop = Array.isArray(shops) ? shops[0] : (shops as any);

      if (primaryShop) {
        setShopData({ id: primaryShop.id, name: primaryShop.shop_name || primaryShop.name });
        setShopFullData(primaryShop);
        
        // Fetch products count for checklist
        const productsResponse = await productService.getProducts({ shopId: primaryShop.id });
        setProductsCount(productsResponse.data?.length || 0);
        
        const ordersResponse = await orderService.getOrders({ shopId: primaryShop.id });
        const allOrders = ordersResponse.data || [];

        // Generate chart data from real orders
        const last7Days = eachDayOfInterval({
          start: subMonths(new Date(), 0).setDate(new Date().getDate() - 6),
          end: new Date()
        });

        const dailyData = last7Days.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayOrders = allOrders.filter(o => 
            o.created_at && format(new Date(o.created_at), 'yyyy-MM-dd') === dateStr
          );
          
          return {
            date: format(day, 'MMM dd'),
            revenue: dayOrders.reduce((sum, o) => sum + (parseFloat(String(o.total_amount)) || 0), 0),
            sales: dayOrders.length
          };
        });

        setChartData(dailyData);
        setTotalRevenue(allOrders.reduce((sum, o) => sum + (parseFloat(String(o.total_amount)) || 0), 0));
        setTotalSales(allOrders.filter(o => (o as any).payment_status === 'paid').length || allOrders.length);
      }

      // Fetch user badges
      if (user) {
        const badgesResult = await subscriptionService.getUserBadges(user.id);
        if (badgesResult.success && badgesResult.data) {
          setUserBadges(badgesResult.data.map(ub => ub.badges).filter(Boolean));
        }
      }

      // Fetch active offer for entrepreneurs
      const offerResponse = await offerService.getOffers();
      if (offerResponse.success && offerResponse.data) {
        const entOffer = offerResponse.data.find(o => o.target_audience === 'entrepreneurs' && o.is_active);
        if (entOffer) {
          setActiveOffer(entOffer);
        }
      }

    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async () => {
    setIsSubscribing(true);
    
    try {
      // Initialize payment with basic plan (default)
      const result = await subscriptionService.initializePayment('basic', 'monthly');
      
      if (result.success && result.authorization_url) {
        // Store reference for verification after redirect
        localStorage.setItem('paystack_reference', result.reference || '');
        
        toast({
          title: "Redirecting to Payment",
          description: "You'll be redirected to Paystack to complete your payment...",
        });
        
        // Redirect to Paystack
        window.location.href = result.authorization_url;
      } else {
        toast({
          title: "Payment Error",
          description: result.error || "Failed to initialize payment. Please try again.",
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
      setIsSubscribing(false);
    }
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
    <PageWrapper patternVariant="dots" patternOpacity={0.5}>
      {/* Navbar - Fixed for mobile responsiveness */}
      <nav className="bg-card/80 backdrop-blur-lg border-b border-border/50 sticky top-0 z-50">
        <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary" />
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl overflow-hidden shadow-md ring-2 ring-primary/20">
                <img src={logo} alt="SteerSolo" className="w-full h-full object-cover" />
              </div>
              <span className="text-xl font-heading font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                SteerSolo
              </span>
            </div>
            
            {/* Mobile Menu Button */}
            <div className="flex items-center gap-2 md:hidden">
              {shopData && (
                <StrokeMyShop shopId={shopData.id} shopName={shopData.name} />
              )}
              <TourButton 
                onStartTour={startTour} 
                hasSeenTour={hasSeenTour} 
                onResetTour={resetTour}
                size="sm"
              />
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[250px] sm:w-[300px]">
                  <div className="flex flex-col h-full pt-6">
                    <div className="mb-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md">
                          <img src={logo} alt="SteerSolo" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-lg font-heading font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                          Dashboard
                        </span>
                      </div>
                      <div className="space-y-1">
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start"
                          onClick={() => {
                            navigate("/my-store");
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          <Store className="mr-2 h-4 w-4" />
                          My Store
                        </Button>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start"
                          onClick={() => {
                            navigate("/products");
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          <Package className="mr-2 h-4 w-4" />
                          Products
                        </Button>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start"
                          onClick={() => {
                            navigate("/orders");
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Orders
                        </Button>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start"
                          onClick={() => {
                            navigate("/bookings");
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          <CalendarCheck className="mr-2 h-4 w-4" />
                          Bookings
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-auto space-y-3">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => {
                          navigate('/subscription');
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        Subscription
                      </Button>
                      <Button 
                        variant="destructive" 
                        className="w-full"
                        onClick={handleLogout}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-3">
              {shopData && (
                <StrokeMyShop shopId={shopData.id} shopName={shopData.name} />
              )}
              <TourButton 
                onStartTour={startTour} 
                hasSeenTour={hasSeenTour} 
                onResetTour={resetTour}
              />
              <Button 
                variant="ghost" 
                onClick={handleLogout} 
                className="hover:bg-destructive/10 hover:text-destructive h-10 px-4"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-6 sm:py-8 relative z-10">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-heading font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Dashboard
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <p className="text-sm text-muted-foreground">Welcome back, {profile?.full_name}!</p>
                {userBadges.length > 0 && (
                  <BadgeDisplay badges={userBadges} size="sm" />
                )}
              </div>
            </div>

            <div 
              data-tour="subscription-status" 
              className="cursor-pointer w-full sm:w-auto"
              onClick={() => navigate('/subscription')}
            >
              {subscriptionStatus === 'trial' && daysRemaining > 0 && (
                <Badge variant="outline" className="w-full justify-center sm:w-auto text-sm py-2 px-3 border-gold text-gold bg-gold/10 hover:bg-gold/20 transition-colors">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
                  {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} trial
                </Badge>
              )}
              {subscriptionStatus === 'active' && (
                <Badge variant="outline" className="w-full justify-center sm:w-auto text-sm py-2 px-3 border-green-500 text-green-500 bg-green-500/10 hover:bg-green-500/20 transition-colors">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
                  Active
                </Badge>
              )}
              {subscriptionStatus === 'expired' && (
                <Badge variant="outline" className="w-full justify-center sm:w-auto text-sm py-2 px-3 border-destructive text-destructive bg-destructive/10 hover:bg-destructive/20 transition-colors">
                  <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
                  Expired
                </Badge>
              )}
            </div>
          </div>

          {/* Active Offer Card */}
          {activeOffer && (
            <Card className="bg-gradient-to-r from-primary to-accent text-primary-foreground overflow-hidden relative mb-4">
              <div className="absolute inset-0 opacity-20">
                <AdirePattern variant="geometric" />
              </div>
              <CardContent className="p-4 sm:p-6 relative z-10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-heading font-bold mb-1">{activeOffer.title}</h3>
                    <p className="opacity-90 text-sm">{activeOffer.description}</p>
                  </div>
                  <Button 
                    variant="secondary" 
                    onClick={handleSubscribe}
                    disabled={isLoading}
                    className="whitespace-nowrap bg-gold text-primary hover:bg-gold/90 text-sm py-2 px-4 mt-2 sm:mt-0"
                  >
                    {isLoading ? "Processing..." : activeOffer.button_text || "Claim Offer"}
                    <ArrowRight className="ml-2 w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Profile Completion Checklist */}
        <div className="mb-6">
          <ProfileCompletionChecklist shop={shopFullData} productsCount={productsCount} />
        </div>

        {/* Subscription Banner */}
        {(subscriptionStatus === 'trial' || subscriptionStatus === 'expired') && (
          <Card className="mb-6 border-2 border-gold/30 bg-gold/5">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="font-heading text-gold text-lg sm:text-xl">
                {subscriptionStatus === 'trial' 
                  ? '🎉 Upgrade Your Store' 
                  : '⚠️ Subscription Required'}
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                {subscriptionStatus === 'trial' 
                  ? `You have ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left in your free trial. Subscribe now for only ₦${subscriptionPrice.toLocaleString()}/month to continue selling after your trial ends.`
                  : `Your trial has expired. Subscribe for ₦${subscriptionPrice.toLocaleString()}/month to reactivate your store and continue selling.`
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <Button 
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-sm sm:text-base py-3 px-6 w-full sm:w-auto"
                  onClick={handleSubscribe}
                  disabled={isSubscribing}
                >
                  {isSubscribing ? "Redirecting..." : `Subscribe - ₦${subscriptionPrice.toLocaleString()}/month`}
                </Button>
                <Button 
                  variant="outline"
                  className="text-sm w-full sm:w-auto"
                  onClick={() => navigate('/pricing')}
                >
                  View Plans
                </Button>
                {subscriptionStatus === 'trial' && (
                  <p className="text-xs text-muted-foreground text-center sm:text-left w-full sm:w-auto">
                    No payment required until day 8.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sales Analytics Section */}
        <div className="mb-6" data-tour="sales-analytics">
          <h2 className="text-xl sm:text-2xl font-heading font-bold mb-4">Sales Analytics</h2>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <Card className="group hover:shadow-lg hover:shadow-primary/10 transition-all border-primary/10">
              <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 sm:p-6">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Revenue
                </CardTitle>
                <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="text-2xl sm:text-3xl font-heading font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  ₦{totalRevenue.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  From completed orders
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg hover:shadow-accent/10 transition-all border-accent/10">
              <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 sm:p-6">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Sales
                </CardTitle>
                <div className="w-10 h-10 bg-gradient-to-br from-accent/20 to-primary/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-5 h-5 text-accent" />
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="text-2xl sm:text-3xl font-heading font-bold">{totalSales}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Orders in the last 30 days
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Chart */}
          <Card className="border-primary/10">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="font-heading text-lg">Revenue Trend (Last 7 Days)</CardTitle>
              <CardDescription className="text-sm">Daily revenue from completed orders</CardDescription>
            </CardHeader>
            <CardContent className="p-2 sm:p-4 pt-0">
              <div className="h-[250px] sm:h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={chartData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke="hsl(var(--border))"
                      vertical={false}
                    />
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                      tickMargin={10}
                      interval="preserveStartEnd"
                      minTickGap={5}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                      tickFormatter={(value) => `₦${value >= 1000 ? `${(value/1000).toFixed(0)}k` : value}`}
                      width={40}
                    />
                    <Tooltip 
                      formatter={(value) => [`₦${Number(value).toLocaleString()}`, 'Revenue']}
                      labelFormatter={(label) => `Date: ${label}`}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Bar 
                      dataKey="revenue" 
                      fill="hsl(var(--primary))" 
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4" data-tour="quick-actions">
          <Card 
            className="group hover:shadow-lg hover:shadow-primary/10 transition-all cursor-pointer border-primary/10 hover:border-primary/30"
            onClick={() => navigate("/my-store")}
            data-tour="my-store-action"
          >
            <CardHeader className="p-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Store className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="font-heading group-hover:text-primary transition-colors text-base">My Store</CardTitle>
              <CardDescription className="text-xs line-clamp-2">
                Setup and customize your storefront
              </CardDescription>
            </CardHeader>
          </Card>

          <Card 
            className="group hover:shadow-lg hover:shadow-accent/10 transition-all cursor-pointer border-accent/10 hover:border-accent/30"
            onClick={() => navigate("/products")}
            data-tour="products-action"
          >
            <CardHeader className="p-4">
              <div className="w-12 h-12 bg-gradient-to-br from-accent/20 to-primary/20 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Package className="w-6 h-6 text-accent" />
              </div>
              <CardTitle className="font-heading group-hover:text-accent transition-colors text-base">Products</CardTitle>
              <CardDescription className="text-xs line-clamp-2">
                Manage your product catalog
              </CardDescription>
            </CardHeader>
          </Card>

          <Card 
            className="group hover:shadow-lg hover:shadow-gold/10 transition-all cursor-pointer border-gold/10 hover:border-gold/30"
            onClick={() => navigate("/orders")}
            data-tour="orders-action"
          >
            <CardHeader className="p-4">
              <div className="w-12 h-12 bg-gradient-to-br from-gold/20 to-primary/20 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <ShoppingCart className="w-6 h-6 text-gold" />
              </div>
              <CardTitle className="font-heading group-hover:text-gold transition-colors text-base">Orders</CardTitle>
              <CardDescription className="text-xs line-clamp-2">
                View and manage customer orders
              </CardDescription>
            </CardHeader>
          </Card>

          <Card 
            className="group hover:shadow-lg hover:shadow-purple-500/10 transition-all cursor-pointer border-purple-500/10 hover:border-purple-500/30"
            onClick={() => navigate("/bookings")}
            data-tour="bookings-action"
          >
            <CardHeader className="p-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-accent/20 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <CalendarCheck className="w-6 h-6 text-purple-500" />
              </div>
              <CardTitle className="font-heading group-hover:text-purple-500 transition-colors text-base">Bookings</CardTitle>
              <CardDescription className="text-xs line-clamp-2">
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
      <FeatureDiscoveryPopup featureId="stroke_my_shop" />
    </PageWrapper>
  );
};

export default Dashboard;