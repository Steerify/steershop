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
import { 
  Store, Package, ShoppingCart, TrendingUp, 
  Settings, LogOut, Clock,
  CheckCircle, AlertCircle, DollarSign, CalendarCheck, Menu, X,
  Bell, Search, Sparkles, Shield, HelpCircle,
  ChevronRight, Eye, Download, Upload, Users
} from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const [pendingOrders, setPendingOrders] = useState(0);

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

      // Fetch profile from Supabase
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        setProfile({ full_name: user.email?.split('@')[0] || 'User' });
      } else {
        setProfile(profileData);
        
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

      // Fetch shop data
      const shopResponse = await shopService.getShopByOwner(user.id);
      const shops = shopResponse.data;
      const primaryShop = Array.isArray(shops) ? shops[0] : (shops as any);

      if (primaryShop) {
        setShopData({ id: primaryShop.id, name: primaryShop.shop_name || primaryShop.name });
        setShopFullData(primaryShop);
        
        const productsResponse = await productService.getProducts({ shopId: primaryShop.id });
        setProductsCount(productsResponse.data?.length || 0);
        
        const ordersResponse = await orderService.getOrders({ shopId: primaryShop.id });
        const allOrders = ordersResponse.data || [];
        
        const pending = allOrders.filter(o => (o as any).payment_status !== 'paid' && (o as any).order_status !== 'completed').length;
        setPendingOrders(pending);

        // Generate chart data
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

      // Fetch active offer
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
      const result = await subscriptionService.initializePayment('basic', 'monthly');
      
      if (result.success && result.authorization_url) {
        localStorage.setItem('paystack_reference', result.reference || '');
        
        toast({
          title: "Redirecting to Payment",
          description: "You'll be redirected to Paystack to complete your payment...",
        });
        
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

  const QuickActions = [
    { 
      icon: Store, 
      label: "My Store", 
      path: "/my-store",
      color: "bg-primary/10",
      textColor: "text-primary"
    },
    { 
      icon: Package, 
      label: "Products", 
      path: "/products",
      color: "bg-accent/10",
      textColor: "text-accent"
    },
    { 
      icon: ShoppingCart, 
      label: "Orders", 
      path: "/orders",
      color: "bg-amber-500/10",
      textColor: "text-amber-500"
    },
    { 
      icon: CalendarCheck, 
      label: "Bookings", 
      path: "/bookings",
      color: "bg-purple-500/10",
      textColor: "text-purple-500"
    },
  ];

  const SecondaryActions = [
    { 
      icon: Eye, 
      label: "View Store", 
      path: `/store/${shopData?.id}`,
      color: "bg-blue-500/10",
      textColor: "text-blue-500"
    },
    { 
      icon: Users, 
      label: "Customers", 
      path: "/customers",
      color: "bg-green-500/10",
      textColor: "text-green-500"
    },
    { 
      icon: Download, 
      label: "Export Data", 
      path: "/export",
      color: "bg-gray-500/10",
      textColor: "text-gray-500"
    },
    { 
      icon: Settings, 
      label: "Settings", 
      path: "/settings",
      color: "bg-gray-500/10",
      textColor: "text-gray-500"
    },
  ];

  return (
    <PageWrapper patternVariant="dots" patternOpacity={0.1}>
      {/* Mobile-First Navigation */}
      <nav className="bg-background/95 backdrop-blur-lg border-b sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg overflow-hidden">
                <img src={logo} alt="SteerSolo" className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="text-base font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Dashboard
                </span>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  {shopData?.name || "My Store"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Mobile: Only show AI button and menu */}
              {shopData && (
                <div className="hidden sm:block">
                  <StrokeMyShop shopId={shopData.id} shopName={shopData.name} />
                </div>
              )}
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 sm:h-10 sm:w-10"
                onClick={() => navigate('/search')}
              >
                <Search className="h-4 w-4" />
              </Button>
              
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[85vw] max-w-sm p-0">
                  <ScrollArea className="h-full">
                    <div className="p-4">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-lg overflow-hidden">
                          <img src={logo} alt="SteerSolo" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{profile?.full_name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-1 mb-6">
                        <h3 className="text-xs uppercase font-semibold text-muted-foreground mb-2">Main Menu</h3>
                        {QuickActions.concat(SecondaryActions).map((action) => (
                          <Button
                            key={action.path}
                            variant="ghost"
                            className="w-full justify-start h-11 px-3"
                            onClick={() => {
                              navigate(action.path);
                              setIsMobileMenuOpen(false);
                            }}
                          >
                            <div className={`w-8 h-8 rounded-lg ${action.color} flex items-center justify-center mr-3`}>
                              <action.icon className={`w-4 h-4 ${action.textColor}`} />
                            </div>
                            <span className="text-sm">{action.label}</span>
                          </Button>
                        ))}
                      </div>
                      
                      <div className="space-y-1 mb-6">
                        <h3 className="text-xs uppercase font-semibold text-muted-foreground mb-2">Account</h3>
                        <Button
                          variant="ghost"
                          className="w-full justify-start h-11 px-3"
                          onClick={() => {
                            navigate("/subscription");
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center mr-3">
                            <Sparkles className="w-4 h-4 text-purple-500" />
                          </div>
                          <div className="flex-1 text-left">
                            <span className="text-sm">Subscription</span>
                            <div className="text-xs text-muted-foreground">
                              {subscriptionStatus === 'trial' ? `${daysRemaining} days left` : 
                               subscriptionStatus === 'active' ? 'Active' : 'Expired'}
                            </div>
                          </div>
                        </Button>
                        
                        <TourButton 
                          onStartTour={() => {
                            startTour();
                            setIsMobileMenuOpen(false);
                          }} 
                          hasSeenTour={hasSeenTour} 
                          onResetTour={resetTour}
                          className="w-full justify-start h-11 px-3"
                        />
                        
                        <Button
                          variant="ghost"
                          className="w-full justify-start h-11 px-3"
                          onClick={() => {
                            navigate("/help");
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center mr-3">
                            <HelpCircle className="w-4 h-4 text-blue-500" />
                          </div>
                          <span className="text-sm">Help & Support</span>
                        </Button>
                      </div>
                      
                      <Separator className="my-4" />
                      
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-11 px-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          handleLogout();
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        <span className="text-sm">Logout</span>
                      </Button>
                    </div>
                  </ScrollArea>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>

      <main className="min-h-screen pb-20">
        <div className="px-4 py-4">
          {/* Welcome Section */}
          <div className="mb-6">
            <h1 className="text-xl font-bold mb-1">Hello, {profile?.full_name}! 👋</h1>
            <p className="text-sm text-muted-foreground">Here's your store overview</p>
            
            {/* Subscription Status - Mobile Optimized */}
            <div 
              className="mt-4 p-4 rounded-lg border bg-gradient-to-r from-primary/5 to-accent/5 cursor-pointer"
              onClick={() => navigate('/subscription')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {subscriptionStatus === 'trial' && <Clock className="w-4 h-4 text-amber-500" />}
                    {subscriptionStatus === 'active' && <CheckCircle className="w-4 h-4 text-green-500" />}
                    {subscriptionStatus === 'expired' && <AlertCircle className="w-4 h-4 text-destructive" />}
                    <span className="text-sm font-medium">
                      {subscriptionStatus === 'trial' ? 'Free Trial' : 
                       subscriptionStatus === 'active' ? 'Active Subscription' : 'Subscription Expired'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {subscriptionStatus === 'trial' ? `${daysRemaining} days remaining` : 
                     subscriptionStatus === 'active' ? 'You\'re all set!' : 'Renew to continue selling'}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* Stats Cards - Mobile Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Card className="col-span-1">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mr-3">
                    <DollarSign className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Revenue</p>
                    <p className="font-bold text-sm sm:text-base">₦{totalRevenue.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="col-span-1">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mr-3">
                    <ShoppingCart className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Orders</p>
                    <p className="font-bold text-sm sm:text-base">{totalSales}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="col-span-1">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center mr-3">
                    <Package className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Products</p>
                    <p className="font-bold text-sm sm:text-base">{productsCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="col-span-1">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mr-3">
                    <TrendingUp className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Pending</p>
                    <p className="font-bold text-sm sm:text-base">{pendingOrders}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions - Mobile Touch Friendly */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Quick Actions</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs h-8"
                onClick={() => navigate('/actions')}
              >
                View all
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {QuickActions.map((action) => (
                <Button
                  key={action.path}
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center justify-center gap-2"
                  onClick={() => navigate(action.path)}
                >
                  <div className={`w-12 h-12 rounded-full ${action.color} flex items-center justify-center`}>
                    <action.icon className={`w-6 h-6 ${action.textColor}`} />
                  </div>
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Revenue Chart - Mobile Optimized */}
          <Card className="mb-6">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base">Revenue Trend</CardTitle>
              <CardDescription className="text-xs">Last 7 days</CardDescription>
            </CardHeader>
            <CardContent className="p-2">
              <div className="h-[200px] sm:h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={chartData}
                    margin={{ top: 10, right: 5, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="2 2" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      tickMargin={5}
                    />
                    <YAxis 
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `₦${value > 1000 ? (value/1000).toFixed(0) + 'k' : value}`}
                      width={30}
                    />
                    <Tooltip 
                      formatter={(value) => [`₦${Number(value).toLocaleString()}`, 'Revenue']}
                      contentStyle={{
                        fontSize: '11px',
                        padding: '6px 8px',
                        borderRadius: '6px'
                      }}
                    />
                    <Bar 
                      dataKey="revenue" 
                      fill="hsl(var(--primary))" 
                      radius={[2, 2, 0, 0]}
                      maxBarSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Setup Progress */}
          <Card className="mb-6">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base">Store Setup</CardTitle>
              <CardDescription className="text-xs">Complete your store setup</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <ProfileCompletionChecklist shop={shopFullData} productsCount={productsCount} />
            </CardContent>
          </Card>

          {/* Active Offer Banner */}
          {activeOffer && (
            <Card className="mb-6 bg-gradient-to-r from-primary to-accent text-white">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm mb-1">Special Offer</h3>
                    <p className="text-xs opacity-90 mb-3 line-clamp-2">{activeOffer.description}</p>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={handleSubscribe}
                      className="bg-white text-primary hover:bg-white/90 text-xs h-8"
                    >
                      {activeOffer.button_text || "Claim Now"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Secondary Actions - Horizontal Scroll on Mobile */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">More Tools</h2>
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex gap-3 pb-2">
                {SecondaryActions.map((action) => (
                  <Button
                    key={action.path}
                    variant="outline"
                    className="h-auto py-3 px-4 flex flex-col items-center justify-center gap-2 min-w-[120px]"
                    onClick={() => navigate(action.path)}
                  >
                    <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center`}>
                      <action.icon className={`w-5 h-5 ${action.textColor}`} />
                    </div>
                    <span className="text-xs font-medium whitespace-normal text-center">{action.label}</span>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </main>

      {/* Bottom Navigation for Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t z-40">
        <div className="grid grid-cols-4 h-16">
          {QuickActions.slice(0, 4).map((action) => (
            <Button
              key={action.path}
              variant="ghost"
              className="h-full flex flex-col items-center justify-center p-0 rounded-none"
              onClick={() => navigate(action.path)}
            >
              <action.icon className={`w-5 h-5 mb-1 ${action.textColor}`} />
              <span className="text-xs">{action.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Desktop Sidebar for larger screens */}
      <div className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 border-r bg-background z-40">
        <div className="flex flex-col w-full p-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg overflow-hidden">
              <img src={logo} alt="SteerSolo" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                SteerSolo
              </span>
              <p className="text-xs text-muted-foreground">Business Dashboard</p>
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="space-y-1">
              <h3 className="text-xs uppercase font-semibold text-muted-foreground mb-2">Navigation</h3>
              {QuickActions.map((action) => (
                <Button
                  key={action.path}
                  variant="ghost"
                  className="w-full justify-start mb-1"
                  onClick={() => navigate(action.path)}
                >
                  <action.icon className={`w-4 h-4 mr-3 ${action.textColor}`} />
                  {action.label}
                </Button>
              ))}
              
              <Separator className="my-4" />
              
              <h3 className="text-xs uppercase font-semibold text-muted-foreground mb-2">Tools</h3>
              {SecondaryActions.map((action) => (
                <Button
                  key={action.path}
                  variant="ghost"
                  className="w-full justify-start mb-1"
                  onClick={() => navigate(action.path)}
                >
                  <action.icon className={`w-4 h-4 mr-3 ${action.textColor}`} />
                  {action.label}
                </Button>
              ))}
            </div>
          </ScrollArea>
          
          <div className="mt-auto pt-4 border-t">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="font-semibold">{profile?.full_name?.charAt(0) || 'U'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{profile?.full_name}</p>
                <p className="text-xs text-muted-foreground truncate">{shopData?.name || 'My Store'}</p>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full mb-2"
              onClick={() => navigate('/subscription')}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {subscriptionStatus === 'trial' ? `${daysRemaining} days left` : 'Manage Plan'}
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full text-destructive hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main content wrapper for desktop */}
      <div className="md:ml-64">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Desktop-only additional content */}
          <div className="hidden md:block">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Welcome back, {profile?.full_name}! 👋</h1>
              <p className="text-muted-foreground">Here's what's happening with your business today</p>
            </div>
            
            {/* Additional desktop stats */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="col-span-2">
                <h2 className="text-xl font-semibold mb-4">Performance Overview</h2>
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Avg. Order Value</p>
                          <p className="text-2xl font-bold">₦{totalSales > 0 ? Math.round(totalRevenue/totalSales).toLocaleString() : '0'}</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Conversion Rate</p>
                          <p className="text-2xl font-bold">{productsCount > 0 ? Math.round((totalSales/productsCount)*100) : '0'}%</p>
                        </div>
                        <Users className="w-8 h-8 text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Store Visits</p>
                          <p className="text-2xl font-bold">{Math.round(totalSales * 3.5)}</p>
                        </div>
                        <Eye className="w-8 h-8 text-purple-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold mb-4">Quick Insights</h2>
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Best Selling</p>
                        <p className="font-semibold">Product #1</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Peak Hours</p>
                        <p className="font-semibold">2PM - 5PM</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Top Location</p>
                        <p className="font-semibold">Lagos</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
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