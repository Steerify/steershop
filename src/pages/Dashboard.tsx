import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import shopService from "@/services/shop.service";
import orderService from "@/services/order.service";
import offerService from "@/services/offer.service";
import productService from "@/services/product.service";
import subscriptionService from "@/services/subscription.service";
import { payoutService } from "@/services/payout.service";
import { useToast } from "@/hooks/use-toast";
import {
  Store, Package, ShoppingCart, TrendingUp, Users,
  Settings, LogOut, Share2,
  Megaphone, Target, ArrowRight, Clock,
  CheckCircle, AlertCircle, DollarSign, CalendarCheck, Menu, X,
  HelpCircle, Search, Shield, BookOpen, Banknote, Wallet, Crown, MessageCircle, Truck, BadgeCheck, Sparkles
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, eachDayOfInterval, subMonths, differenceInDays } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
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
import { ShopStatusBadge } from "@/components/ShopStatusBadge";
import { BadgeDisplay } from "@/components/BadgeDisplay";
import { WhatsAppCommunityBanner } from "@/components/WhatsAppCommunityBanner";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { PayoutRequestDialog } from "@/components/PayoutRequestDialog";
import { CouponManager } from "@/components/CouponManager";
import { DoneForYouPopup } from "@/components/DoneForYouPopup";
import { NotificationBell } from "@/components/NotificationBell";

// Helper component for verification progress (unchanged)
const VerificationProgressCard = ({ profile, shopFullData, totalSales }: { profile: any; shopFullData: any; totalSales: number }) => {
  const navigate = useNavigate();
  const bankVerified = profile?.bank_verified === true;
  const completedOrders = totalSales;
  const avgRating = shopFullData?.average_rating || 0;
  const shopAge = shopFullData?.created_at ? differenceInDays(new Date(), new Date(shopFullData.created_at)) : 0;
  const isVerified = shopFullData?.is_verified === true;

  const criteria = [
    { label: "Bank account verified", met: bankVerified, detail: bankVerified ? "Verified" : "Not verified", link: "/identity-verification" },
    { label: "10+ completed orders", met: completedOrders >= 10, detail: `${completedOrders}/10 orders` },
    { label: "3.5+ average rating", met: avgRating >= 3.5 || avgRating === 0, detail: avgRating > 0 ? `${avgRating.toFixed(1)} rating` : "No reviews yet" },
    { label: "Shop active 7+ days", met: shopAge >= 7, detail: `${shopAge} days active` },
  ];
  const metCount = criteria.filter(c => c.met).length;

  if (isVerified) {
    return (
      <Card className="mb-6 border-green-500/20 bg-gradient-to-r from-green-500/5 to-emerald-500/5">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
            <BadgeCheck className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-green-700 dark:text-green-400">Verified Business ✓</h3>
            <p className="text-xs text-muted-foreground">Your shop is verified and trusted by customers.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6 border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            Verification Progress
          </h3>
          <Badge variant="outline" className="text-xs">{metCount}/4</Badge>
        </div>
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden mb-3">
          <div className="h-full bg-primary transition-all" style={{ width: `${(metCount / 4) * 100}%` }} />
        </div>
        <div className="space-y-2">
          {criteria.map((c, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {c.met ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-muted-foreground" />
                )}
                <span className={c.met ? "text-foreground" : "text-muted-foreground"}>{c.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{c.detail}</span>
                {c.link && !c.met && (
                  <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => navigate(c.link!)}>
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

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
  const [shopData, setShopData] = useState<{ id: string; name: string } | null>(null);
  const [shopFullData, setShopFullData] = useState<any>(null);
  const [productsCount, setProductsCount] = useState(0);
  const [userBadges, setUserBadges] = useState<any[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [payoutBalance, setPayoutBalance] = useState({ totalRevenue: 0, totalWithdrawn: 0, totalPending: 0, availableBalance: 0 });
  const [isPayoutDialogOpen, setIsPayoutDialogOpen] = useState(false);
  const [showDfyPopup, setShowDfyPopup] = useState(false);

  // Carousel state
  const [carouselIndex, setCarouselIndex] = useState(0);

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

  // Handle DFY verify callback - show popup when returning from Paystack
  useEffect(() => {
    if (searchParams.get('dfy') === 'verify' && searchParams.get('reference')) {
      setShowDfyPopup(true);
    }
  }, [searchParams]);

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
          setDaysRemaining(15);
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
        
        // Calculate pending orders
        const pending = allOrders.filter(o => (o as any).payment_status !== 'paid' && (o as any).order_status !== 'completed').length;
        setPendingOrders(pending);

        // Generate chart data from real orders
        const last7Days = eachDayOfInterval({
          start: subMonths(new Date(), 0).setDate(new Date().getDate() - 6),
          end: new Date()
        });

        // Only count paid orders for revenue accuracy
        const paidOrders = allOrders.filter(o => (o as any).payment_status === 'paid');

        const dailyData = last7Days.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayPaidOrders = paidOrders.filter(o => 
            o.created_at && format(new Date(o.created_at), 'yyyy-MM-dd') === dateStr
          );
          
          return {
            date: format(day, 'MMM dd'),
            revenue: dayPaidOrders.reduce((sum, o) => sum + (parseFloat(String(o.total_amount)) || 0), 0),
            sales: dayPaidOrders.length
          };
        });

        setChartData(dailyData);
        setTotalRevenue(paidOrders.reduce((sum, o) => sum + (parseFloat(String(o.total_amount)) || 0), 0));
        setTotalSales(paidOrders.length);

        // Fetch payout balance
        try {
          const balance = await payoutService.getBalance(primaryShop.id);
          setPayoutBalance(balance);
        } catch (e) {
          console.error('Payout balance error:', e);
        }
      } else {
        // No shop — only show DFY popup if redirected from onboarding with show_dfy param
        if (searchParams.get('show_dfy') === 'true') {
          setShowDfyPopup(true);
          // Clean the param from URL
          const newParams = new URLSearchParams(searchParams);
          newParams.delete('show_dfy');
          navigate({ search: newParams.toString() }, { replace: true });
        }
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

  // Build carousel slides dynamically based on current data
  const getCarouselSlides = () => {
    const slides = [];

    // 1. WhatsApp Community Banner
    slides.push(
      <Card key="whatsapp" className="border-primary/20">
        <CardContent className="p-4">
          <WhatsAppCommunityBanner />
        </CardContent>
      </Card>
    );

    // 2. Trial / Subscription Status
    if (subscriptionStatus === 'trial') {
      slides.push(
        <Card key="trial" className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Clock className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Free Trial · {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} left</h3>
                <p className="text-xs text-muted-foreground">Upgrade to keep your store live.</p>
              </div>
            </div>
            <Button size="sm" onClick={handleSubscribe} disabled={isSubscribing}>
              Upgrade Now
            </Button>
          </CardContent>
        </Card>
      );
    } else if (subscriptionStatus === 'expired') {
      slides.push(
        <Card key="expired" className="bg-red-500/5 border-red-500/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-red-600">Subscription Expired</h3>
                <p className="text-xs text-muted-foreground">Your store is hidden. Reactivate now.</p>
              </div>
            </div>
            <Button size="sm" onClick={handleSubscribe} disabled={isSubscribing}>
              Reactivate
            </Button>
          </CardContent>
        </Card>
      );
    }

    // 3. Store visibility
    slides.push(
      <Card key="visibility" className="border-green-500/20">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium">Your store is visible to customers</p>
              <p className="text-xs text-muted-foreground">Keep up the great work!</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
            Live
          </Badge>
        </CardContent>
      </Card>
    );

    // 4. Verification nudge (if needed)
    if (shopData && profile && !profile.bank_verified && !localStorage.getItem('verification_nudge_dismissed')) {
      slides.push(
        <Card key="verification" className="border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-yellow-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Get Verified</h3>
                  <p className="text-xs text-muted-foreground">Verify identity to receive payouts.</p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button size="sm" onClick={() => navigate('/identity-verification')}>
                  Verify Now
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { localStorage.setItem('verification_nudge_dismissed', 'true'); loadData(); }}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    // 5. First‑sale momentum (if no sales)
    if (shopData && totalSales === 0) {
      slides.push(
        <Card key="first-sale" className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Share2 className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm mb-1">First sale is closer than you think! 🚀</h3>
                <p className="text-xs text-muted-foreground truncate">
                  Share your store link to get your first sale within 48h.
                </p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="flex-1 sm:flex-none text-xs h-8 px-2"
                  onClick={() => {
                    const url = `${window.location.origin}/shop/${shopFullData?.shop_slug || shopData.id}`;
                    navigator.clipboard.writeText(url);
                    toast({ title: "Link copied!" });
                  }}
                >
                  Copy Link
                </Button>
                <Button 
                  size="sm" 
                  className="flex-1 sm:flex-none text-xs h-8 px-2 bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    const url = `${window.location.origin}/shop/${shopFullData?.shop_slug || shopData.id}`;
                    window.open(`https://wa.me/?text=${encodeURIComponent('Check out my store: ' + url)}`, '_blank');
                  }}
                >
                  <MessageCircle className="w-3 h-3 mr-1" />
                  WhatsApp
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return slides;
  };

  const slides = getCarouselSlides();
  const totalSlides = slides.length;

  const nextSlide = () => setCarouselIndex((prev) => (prev + 1) % totalSlides);
  const prevSlide = () => setCarouselIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  const goToSlide = (index: number) => setCarouselIndex(index);

  // Quick Actions
  const QuickActions = [
    { 
      icon: Store, 
      label: "My Store", 
      description: "Setup and customize",
      path: "/my-store",
      color: "from-primary/20 to-primary/10",
      textColor: "text-primary"
    },
    { 
      icon: Package, 
      label: "Products", 
      description: "Manage your catalog",
      path: "/products",
      color: "from-accent/20 to-accent/10",
      textColor: "text-accent"
    },
    { 
      icon: ShoppingCart, 
      label: "Orders", 
      description: "View & manage orders",
      path: "/orders",
      color: "from-gold/20 to-gold/10",
      textColor: "text-gold"
    },
    { 
      icon: Truck, 
      label: "Delivery", 
      description: "Shipping & logistics",
      path: "/orders",
      color: "from-emerald-500/20 to-emerald-500/10",
      textColor: "text-emerald-500"
    },
    { 
      icon: CalendarCheck, 
      label: "Bookings", 
      description: "Manage appointments",
      path: "/bookings",
      color: "from-purple-500/20 to-purple-500/10",
      textColor: "text-purple-500"
    },
    { 
      icon: Megaphone, 
      label: "Marketing", 
      description: "Create posters with AI",
      path: "/marketing",
      color: "from-pink-500/20 to-pink-500/10",
      textColor: "text-pink-500"
    },
    { 
      icon: Sparkles, 
      label: "Ads Assistant", 
      description: "AI ad copy generator",
      path: "/ads-assistant",
      color: "from-orange-500/20 to-red-500/10",
      textColor: "text-orange-500"
    },
    { 
      icon: Target, 
      label: "Services", 
      description: "Google & Ad consultations",
      path: "/marketing-services",
      color: "from-cyan-500/20 to-cyan-500/10",
      textColor: "text-cyan-500"
    },
    { 
      icon: BookOpen, 
      label: "Tutorials", 
      description: "Learn & earn points",
      path: "/courses",
      color: "from-blue-500/20 to-blue-500/10",
      textColor: "text-blue-500"
    },
    { 
      icon: Users, 
      label: "Customers", 
      description: "View customer records",
      path: "/customers",
      color: "from-emerald-500/20 to-emerald-500/10",
      textColor: "text-emerald-500"
    },
    { 
      icon: Crown, 
      label: "Ambassador", 
      description: "Refer & earn rewards",
      path: "/ambassador",
      color: "from-yellow-500/20 to-yellow-500/10",
      textColor: "text-yellow-600"
    },
  ];

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
    <PageWrapper patternVariant="dots" patternOpacity={0.3}>
      {/* Top Navigation */}
      <nav className="bg-background/95 backdrop-blur-lg border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg overflow-hidden">
                <img src={logo} alt="SteerSolo" className="w-full h-full object-cover" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                SteerSolo
              </span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              {shopData && (
                <StrokeMyShop shopId={shopData.id} shopName={shopData.name} />
              )}
              
              <Button variant="ghost" size="icon">
                <Search className="h-4 w-4" />
              </Button>
              
              <NotificationBell audience="entrepreneurs" />
              
              <TourButton 
                onStartTour={startTour} 
                hasSeenTour={hasSeenTour} 
                onResetTour={resetTour}
              />
              
              <Button variant="ghost" onClick={handleLogout} className="hover:bg-destructive/10">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>

            {/* Mobile Menu */}
            <div className="flex md:hidden items-center gap-2">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <div className="flex flex-col h-full py-6">
                    <div className="mb-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg overflow-hidden">
                          <img src={logo} alt="SteerSolo" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-semibold">{profile?.full_name}</p>
                          <p className="text-sm text-muted-foreground">{user?.email}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <TourButton 
                          onStartTour={() => {
                            startTour();
                            setIsMobileMenuOpen(false);
                          }} 
                          hasSeenTour={hasSeenTour} 
                          onResetTour={resetTour}
                          className="w-full justify-start"
                        />
                        
                        {QuickActions.map((action) => (
                          <Button
                            key={action.path}
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => {
                              navigate(action.path);
                              setIsMobileMenuOpen(false);
                            }}
                          >
                            <action.icon className="w-4 h-4 mr-2" />
                            {action.label}
                          </Button>
                        ))}
                        
                        <Separator className="my-2" />
                        
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => {
                            navigate("/settings");
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Settings
                        </Button>
                        
                        <Button
                          variant="ghost"
                          className="w-full justify-start hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => {
                            handleLogout();
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Logout
                        </Button>
                      </div>
                    </div>
                    
                    {userBadges.length > 0 && (
                      <div className="mt-auto">
                        <BadgeDisplay badges={userBadges} size="sm" />
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-6">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-1">
                Welcome back, {(profile?.full_name && profile.full_name.trim()) ? profile.full_name.trim() : (user?.email?.split('@')[0] || 'there')}!
              </h1>
              <p className="text-muted-foreground">Here's what's happening with your store today.</p>
            </div>
            <div className="flex items-center gap-3">
              <BadgeDisplay badges={userBadges} size="sm" />
              <ShopStatusBadge status={subscriptionStatus} daysRemaining={daysRemaining} />
            </div>
          </div>

          {/* ===== CAROUSEL ===== */}
          {slides.length > 0 && (
            <div className="relative w-full overflow-hidden mb-6 rounded-lg">
              <div
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${carouselIndex * 100}%)` }}
              >
                {slides.map((slide, idx) => (
                  <div key={idx} className="w-full flex-shrink-0">
                    {slide}
                  </div>
                ))}
              </div>
              {/* Navigation Arrows */}
              <button
                onClick={prevSlide}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm rounded-full p-1 shadow-md hover:bg-background"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm rounded-full p-1 shadow-md hover:bg-background"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
              {/* Dots */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => goToSlide(idx)}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      idx === carouselIndex ? 'bg-primary' : 'bg-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold">₦{totalRevenue.toLocaleString()}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Sales</p>
                    <p className="text-2xl font-bold">{totalSales}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Products</p>
                    <p className="text-2xl font-bold">{productsCount}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                    <Package className="w-5 h-5 text-gold" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Orders</p>
                    <p className="text-2xl font-bold">{pendingOrders}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Verification Progress Card */}
          {shopData && shopFullData && (
            <VerificationProgressCard 
              profile={profile}
              shopFullData={shopFullData}
              totalSales={totalSales}
            />
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Quick Actions & Chart */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions - now at the top */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {QuickActions.map((action) => (
                  <Card
                    key={action.path}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate(action.path)}
                  >
                    <CardContent className="p-4">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center mb-3`}>
                        <action.icon className={`w-6 h-6 ${action.textColor}`} />
                      </div>
                      <h3 className="font-medium text-sm mb-1">{action.label}</h3>
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Revenue Chart */}
            <Card data-tour="sales-analytics">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Revenue Trend</span>
                  <span className="text-sm font-normal text-muted-foreground">Last 7 days</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" />
                      <YAxis tickFormatter={(value) => `₦${value}`} />
                      <Tooltip formatter={(value) => [`₦${Number(value).toLocaleString()}`, 'Revenue']} />
                      <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Profile & Tools */}
          <div className="space-y-6">
            {/* Profile Completion */}
            <ProfileCompletionChecklist shop={shopFullData} productsCount={productsCount} />

            {/* Payout Balance Card */}
            {shopData && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Wallet className="w-4 h-4" />
                      Paystack Earnings
                    </h3>
                  </div>
                  <p className="text-2xl font-bold text-primary mb-1">₦{payoutBalance.availableBalance.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mb-4">Available for withdrawal</p>
                  <Button
                    size="sm"
                    className="w-full"
                    disabled={payoutBalance.availableBalance < 5000}
                    onClick={() => setIsPayoutDialogOpen(true)}
                  >
                    <Banknote className="w-4 h-4 mr-2" />
                    Request Payout
                  </Button>
                  {payoutBalance.totalPending > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">₦{payoutBalance.totalPending.toLocaleString()} pending</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Coupons Manager */}
            {shopData && <CouponManager shopId={shopData.id} />}

            {/* Active Offers */}
            {activeOffer && (
              <Card className="bg-gradient-to-br from-primary to-accent text-white">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 mt-0.5" />
                    <div>
                      <h3 className="font-semibold mb-1">Special Offer</h3>
                      <p className="text-sm opacity-90 mb-3">{activeOffer.description}</p>
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={handleSubscribe}
                        className="bg-white text-primary hover:bg-white/90"
                      >
                        {activeOffer.button_text || "Claim Offer"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Store Status */}
            <Card>
              <CardHeader>
                <CardTitle>Store Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Store Visibility</span>
                  <Badge variant="outline" className={
                    subscriptionStatus === 'expired'
                      ? "bg-red-500/10 text-red-500 border-red-500/20"
                      : "bg-green-500/10 text-green-500 border-green-500/20"
                  }>
                    {subscriptionStatus === 'expired' ? 'Hidden' : 'Live'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Subscription</span>
                  <span className="text-sm font-medium capitalize">{subscriptionStatus}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Products Listed</span>
                  <span className="text-sm font-medium">{productsCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Store Rating</span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium">
                      {shopFullData?.average_rating?.toFixed(1) || 'N/A'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({shopFullData?.total_reviews || 0} reviews)
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Help & Resources */}
            <Card>
              <CardHeader>
                <CardTitle>Help & Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="ghost" className="w-full justify-start">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Get Help
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Shield className="w-4 h-4 mr-2" />
                  Security Tips
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={startTour}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Take a Tour
                </Button>
              </CardContent>
            </Card>
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
      {shopData && (
        <PayoutRequestDialog
          isOpen={isPayoutDialogOpen}
          onClose={() => setIsPayoutDialogOpen(false)}
          shopId={shopData.id}
          availableBalance={payoutBalance.availableBalance}
          bankName={shopFullData?.bank_name}
          accountNumber={shopFullData?.bank_account_number}
          accountName={shopFullData?.bank_account_name}
          onSuccess={() => loadData()}
        />
      )}
      <DoneForYouPopup
        open={showDfyPopup}
        onClose={() => setShowDfyPopup(false)}
        onShopCreated={(newShopId) => {
          loadData();
        }}
      />
    </PageWrapper>
  );
};

export default Dashboard;