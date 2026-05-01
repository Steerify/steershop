import { useEffect, useState, useCallback } from "react";
import { useTheme } from "next-themes";
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
  HelpCircle, Search, Shield, BookOpen, Banknote, Wallet, Crown, MessageCircle, Truck, BadgeCheck, Sparkles,
  BarChart2, Home, Bell, ChevronUp, ChevronDown, Zap, Star, TrendingDown, ExternalLink, Sun, Moon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, eachDayOfInterval, subMonths, differenceInDays } from "date-fns";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PayoutRequestDialog } from "@/components/PayoutRequestDialog";
import { CouponManager } from "@/components/CouponManager";
import { DoneForYouPopup } from "@/components/DoneForYouPopup";
import { NotificationBell } from "@/components/NotificationBell";
import { FeedbackPrompt } from "@/components/FeedbackPrompt";
import { SalesMilestonePopup } from "@/components/SalesMilestonePopup";
import { StructuredSellingChallenge } from "@/components/StructuredSellingChallenge";
import { SubscriptionExpiryDialog } from "@/components/SubscriptionExpiryDialog";
import { calculateSubscriptionStatus } from "@/utils/subscription";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ShopAvatar } from "@/components/ShopAvatar";
// VerificationProgressCard removed in favor of ProfileCompletionChecklist

// ─── Stat Card Component ───────────────────────────────────────────────────────
const StatCard = ({
  label, value, icon: Icon, gradient, trend, trendValue
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  gradient: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}) => (
  <Card className={`relative overflow-hidden card-spotify border-0 shadow-md ${gradient}`}>
    <CardContent className="p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-white/95 uppercase tracking-wider">{label}</p>
        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>
      <p className="text-xl sm:text-2xl font-bold text-white mb-1">{value}</p>
      {trendValue && (
        <div className="flex items-center gap-1">
          {trend === "up" ? <TrendingUp className="w-3 h-3 text-white/95" /> : trend === "down" ? <TrendingDown className="w-3 h-3 text-white/95" /> : null}
          <span className="text-xs text-white/95">{trendValue}</span>
        </div>
      )}
    </CardContent>
    <div className="absolute -bottom-3 -right-3 w-20 h-20 rounded-full bg-white/10" />
    <div className="absolute -top-3 -left-3 w-14 h-14 rounded-full bg-white/5" />
  </Card>
);

// ─── Quick Action Tile ─────────────────────────────────────────────────────────
const QuickActionTile = ({
  icon: Icon, label, description, onClick, color, textColor
}: {
  icon: React.ElementType;
  label: string;
  description: string;
  onClick: () => void;
  color: string;
  textColor: string;
}) => (
  <button
    onClick={onClick}
    className="group flex flex-col items-start p-4 bg-card card-spotify hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 text-left w-full"
  >
    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200`}>
      <Icon className={`w-5 h-5 ${textColor}`} />
    </div>
    <p className="font-semibold text-sm text-foreground leading-tight">{label}</p>
    <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{description}</p>
  </button>
);

// MobileBottomNav is now a shared component
import { MobileBottomNav } from "@/components/MobileBottomNav";

// ─── Main Dashboard Component ──────────────────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user, signOut, isLoading: isAuthLoading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState<number>(0);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'active' | 'trial' | 'expired' | 'free'>('trial');
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [chartData, setChartData] = useState<any[]>([]);
  const [activeOffer, setActiveOffer] = useState<any>(null);
  const [shopData, setShopData] = useState<{ id: string; name: string } | null>(null);
  const [shopFullData, setShopFullData] = useState<any>(null);
  const [productsCount, setProductsCount] = useState(0);
  const [hasProductWithImage, setHasProductWithImage] = useState(false);
  const [userBadges, setUserBadges] = useState<any[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [payoutBalance, setPayoutBalance] = useState({ totalRevenue: 0, totalWithdrawn: 0, totalPending: 0, availableBalance: 0 });
  const [isPayoutDialogOpen, setIsPayoutDialogOpen] = useState(false);
  const [showDfyPopup, setShowDfyPopup] = useState(false);
  const [hasNoShop, setHasNoShop] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "actions" | "wallet">("overview");
  const [isChallengeOpen, setIsChallengeOpen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(true);

  // Carousel state
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Tour state
  const { hasSeenTour, isRunning, startTour, endTour, resetTour } = useTour('dashboard');
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

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
            toast({ title: "Payment Successful! 🎉", description: "Your subscription has been activated. Welcome to SteerSolo!" });
            setSubscriptionStatus('active');
            localStorage.removeItem('paystack_reference');
            loadData();
          } else {
            toast({ title: "Payment Verification Failed", description: result.error || "Please try again or contact support.", variant: "destructive" });
          }
        } catch (error) {
          console.error('Payment verification error:', error);
        } finally {
          setIsSubscribing(false);
          navigate('/dashboard', { replace: true });
        }
      }
    };
    if (user) verifyPayment();
  }, [searchParams, user]);

  useEffect(() => {
    if (searchParams.get('dfy') === 'verify' && searchParams.get('reference')) {
      setShowDfyPopup(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isAuthLoading) {
      if (user) loadData();
      else { setIsLoading(false); navigate("/auth/login"); }
    }
  }, [user, isAuthLoading]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      if (!user) return;

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
        if (profileData.subscription_expires_at) {
          const expiresAt = new Date(profileData.subscription_expires_at);
          const now = new Date();
          const daysLeft = differenceInDays(expiresAt, now);
          setDaysRemaining(Math.max(0, daysLeft));
          if (profileData.is_subscribed && expiresAt > now) setSubscriptionStatus('active');
          else if (!profileData.is_subscribed && expiresAt > now) setSubscriptionStatus('trial');
          else {
            // Expired — check product count to determine free vs expired
            const subStatus = calculateSubscriptionStatus(profileData, productsCount);
            setSubscriptionStatus(subStatus.status === 'free' ? 'free' : 'expired');
          }
        } else {
          setSubscriptionStatus('trial');
          setDaysRemaining(15);
        }
      }

      const shopResponse = await shopService.getShopByOwner(user.id);
      const shops = shopResponse.data;
      const primaryShop = Array.isArray(shops) ? shops[0] : (shops as any);

      if (primaryShop) {
        setShopData({ id: primaryShop.id, name: primaryShop.shop_name || primaryShop.name });
        setShopFullData(primaryShop);

        // Check if shop is pending approval (inactive)
        if (!primaryShop.is_active) {
          setSubscriptionStatus('trial'); // Keep trial status but show pending banner
        }

        const productsResponse = await productService.getProducts({ shopId: primaryShop.id });
        const productsList = productsResponse.data || [];
        setProductsCount(productsList.length);
        setHasProductWithImage(productsList.some(p => !!p.image_url && p.is_available));

        const ordersResponse = await orderService.getOrders({ shopId: primaryShop.id });
        const allOrders = ordersResponse.data || [];
        const pending = allOrders.filter(o => (o as any).payment_status !== 'paid' && (o as any).order_status !== 'completed').length;
        setPendingOrders(pending);

        const last7Days = eachDayOfInterval({
          start: subMonths(new Date(), 0).setDate(new Date().getDate() - 6),
          end: new Date()
        });
        const paidOrders = allOrders.filter(o => (o as any).payment_status === 'paid');
        const dailyData = last7Days.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayPaidOrders = paidOrders.filter(o => o.created_at && format(new Date(o.created_at), 'yyyy-MM-dd') === dateStr);
          return {
            date: format(day, 'EEE'),
            revenue: dayPaidOrders.reduce((sum, o) => sum + (parseFloat(String(o.total_amount)) || 0), 0),
            sales: dayPaidOrders.length
          };
        });

        setChartData(dailyData);
        setTotalRevenue(paidOrders.reduce((sum, o) => sum + (parseFloat(String(o.total_amount)) || 0), 0));
        setTotalSales(paidOrders.length);

        try {
          const balance = await payoutService.getBalance(primaryShop.id);
          setPayoutBalance(balance);
        } catch (e) { console.error('Payout balance error:', e); }
      } else {
        // No shop — show the DFY popup only if not already open (prevents remount/data loss)
        setHasNoShop(true);
        setShowDfyPopup(prev => prev || true);
        if (searchParams.get('show_dfy') === 'true') {
          const newParams = new URLSearchParams(searchParams);
          newParams.delete('show_dfy');
          navigate({ search: newParams.toString() }, { replace: true });
        }
      }

      if (user) {
        const badgesResult = await subscriptionService.getUserBadges(user.id);
        if (badgesResult.success && badgesResult.data) {
          setUserBadges(badgesResult.data.map(ub => ub.badges).filter(Boolean));
        }
      }

      const offerResponse = await offerService.getOffers();
      if (offerResponse.success && offerResponse.data) {
        const entOffer = offerResponse.data.find(o => o.target_audience === 'entrepreneurs' && o.is_active);
        if (entOffer) setActiveOffer(entOffer);
      }

    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast({ title: "Error", description: "Failed to load dashboard data", variant: "destructive" });
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
        toast({ title: "Redirecting to Payment", description: "You'll be redirected to Paystack to complete your payment..." });
        window.location.href = result.authorization_url;
      } else {
        toast({ title: "Payment Error", description: result.error || "Failed to initialize payment.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    toast({ title: "Logged out", description: "Come back soon!" });
    navigate("/");
  };

  // ─── Single Contextual Banner (most urgent message wins) ──────────────────
  // Priority: expired → trial → no-products → first-sale → active → default
  const getContextualBanner = (): React.ReactNode => {
    // Expired subscription — most urgent
    if (subscriptionStatus === 'expired') {
      return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-destructive to-[hsl(0,70%,38%)] p-5 shadow-lg min-h-[110px] flex items-center">
          <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10" />
          <div className="relative z-10 flex items-center justify-between gap-3 w-full">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="w-4 h-4 text-white/80" />
                <span className="text-xs font-bold text-white/80 uppercase tracking-wider">Subscription Expired</span>
              </div>
              <h3 className="text-white font-extrabold text-base">Your store is hidden from customers</h3>
              <p className="text-white/90 text-xs mt-0.5">Reactivate now to start getting orders again.</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => navigate('/pricing')} className="shrink-0 bg-white text-destructive hover:bg-white/90 border-white font-bold shadow-lg">Reactivate →</Button>
          </div>
        </div>
      );
    }

    // Trial running out
    if (subscriptionStatus === 'trial') {
      return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[hsl(215,65%,18%)] via-primary to-[hsl(145,58%,30%)] p-5 shadow-lg min-h-[110px] flex items-center">
          <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10" />
          <div className="absolute -bottom-6 -left-2 w-16 h-16 rounded-full bg-white/5" />
          <div className="relative z-10 flex items-center justify-between gap-3 w-full">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-white/80" />
                <span className="text-xs font-bold text-white/80 uppercase tracking-wider">Free Trial</span>
              </div>
              <h3 className="text-white font-extrabold text-base">{daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining</h3>
              <p className="text-white/90 text-xs mt-0.5">Upgrade now to keep your store live and accept orders.</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => navigate('/pricing')} className="shrink-0 bg-white text-primary hover:bg-white/90 border-white font-bold shadow-lg">Upgrade Now</Button>
          </div>
        </div>
      );
    }

    // Has store, no products yet
    if (shopData && productsCount === 0) {
      return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-[hsl(215,65%,38%)] p-5 shadow-lg min-h-[110px] flex items-center">
          <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10" />
          <div className="relative z-10 flex items-center justify-between gap-3 w-full">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Package className="w-4 h-4 text-white/80" />
                <span className="text-xs font-bold text-white/80 uppercase tracking-wider">Next Step</span>
              </div>
              <h3 className="text-white font-extrabold text-base">Add your first product 🛍️</h3>
              <p className="text-white/90 text-xs mt-0.5">Your store is live — add products so customers can buy.</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => navigate('/products')} className="shrink-0 bg-white text-primary hover:bg-white/90 border-white font-bold shadow-lg">Add Product →</Button>
          </div>
        </div>
      );
    }

    // Has products but no sales yet
    if (shopData && totalSales === 0) {
      return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-accent p-5 shadow-lg min-h-[110px] flex items-center">
          <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10" />
          <div className="absolute -bottom-4 -left-2 w-16 h-16 rounded-full bg-white/5" />
          <div className="relative z-10 w-full">
            <div className="flex items-center gap-2 mb-1">
              <Share2 className="w-4 h-4 text-white/80" />
              <span className="text-xs font-bold text-white/80 uppercase tracking-wider">First Sale Tips</span>
            </div>
            <h3 className="text-white font-extrabold text-base mb-1">Your first sale is 48h away 🚀</h3>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="border-white/40 text-white hover:bg-white/20 gap-1.5 text-xs h-8 font-semibold" onClick={() => {
                const url = `${window.location.origin}/shop/${shopFullData?.shop_slug || shopData.id}`;
                navigator.clipboard.writeText(url);
                toast({ title: "Store link copied!" });
              }}><ExternalLink className="w-3 h-3" />Copy Link</Button>
              <Button size="sm" className="bg-white text-accent hover:bg-white/90 gap-1.5 text-xs h-8 font-semibold" onClick={() => {
                const url = `${window.location.origin}/shop/${shopFullData?.shop_slug || shopData.id}`;
                window.open(`https://wa.me/?text=${encodeURIComponent('Check out my store: ' + url)}`, '_blank');
              }}><MessageCircle className="w-3 h-3" />Share on WhatsApp</Button>
            </div>
          </div>
        </div>
      );
    }

    // Active & selling — join community banner
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#075E54] to-[hsl(145,65%,30%)] p-5 shadow-lg min-h-[110px] flex items-center">
        <div className="absolute -top-5 -right-5 w-28 h-28 rounded-full bg-white/10" />
        <div className="relative z-10 flex items-center justify-between gap-3 w-full">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MessageCircle className="w-4 h-4 text-white" />
              <span className="text-xs font-bold text-white/80 uppercase tracking-wider">Community</span>
            </div>
            <h3 className="text-white font-extrabold text-base leading-tight">Join 5,000+ vendors on WhatsApp</h3>
            <p className="text-white/90 text-xs mt-0.5">Tips, support, buyer traffic & giveaways — free!</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="shrink-0 font-bold shadow-lg gap-1.5 hover:opacity-90 bg-white text-[#075E54] border-white"
            onClick={() => window.open('https://chat.whatsapp.com/LX2AQqaSYD5FzEuCmhwWmz', '_blank')}>
            <MessageCircle className="w-3.5 h-3.5" />Join Now
          </Button>
        </div>
      </div>
    );
  };

  const getCarouselSlides = () => {
    const slides = [];

    // ── WhatsApp Community slide ──
    slides.push(
      <div key="whatsapp" className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#075E54] to-[#25D366] p-5 shadow-lg min-h-[120px] flex items-center">
        <div className="absolute -top-5 -right-5 w-28 h-28 rounded-full bg-white/10" />
        <div className="absolute -bottom-4 left-10 w-16 h-16 rounded-full bg-white/5" />
        <div className="relative z-10 flex items-center justify-between gap-3 w-full">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MessageCircle className="w-4 h-4 text-white" />
              <span className="text-xs font-bold text-white/80 uppercase tracking-wider">Community</span>
            </div>
            <h3 className="text-white font-extrabold text-base leading-tight">Join 5,000+ vendors on WhatsApp</h3>
            <p className="text-white/90 text-xs mt-0.5">Tips, support, buyer traffic &amp; giveaways — free!</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="shrink-0 font-bold shadow-lg gap-1.5 hover:opacity-90 bg-white text-[#075E54] border-white"
            onClick={() => window.open('https://chat.whatsapp.com/LX2AQqaSYD5FzEuCmhwWmz', '_blank')}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            Join Now
          </Button>
        </div>
      </div>
    );

    // ── Trial / Expired subscription ──
    if (subscriptionStatus === 'trial') {
      slides.push(
        <div key="trial" className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[hsl(215,65%,18%)] via-primary to-[hsl(145,58%,30%)] p-5 min-h-[120px] flex items-center">
          {/* decorative blobs */}
          <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10" />
          <div className="absolute -bottom-6 -left-2 w-16 h-16 rounded-full bg-white/5" />
          <div className="relative z-10 flex items-center justify-between gap-3 w-full">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-white/80" />
                <span className="text-xs font-bold text-white/80 uppercase tracking-wider">Free Trial</span>
              </div>
              <h3 className="text-white font-extrabold text-base sm:text-lg leading-tight">{daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining</h3>
              <p className="text-white/90 text-xs mt-0.5">Upgrade now to keep your store live 🚀</p>
            </div>
            <Button
              size="sm"
              onClick={() => navigate('/pricing')}
              className="shrink-0 bg-white text-primary hover:bg-white/90 font-bold shadow-lg"
            >
              Upgrade Now
            </Button>
          </div>
        </div>
      );
    } else if (subscriptionStatus === 'expired') {
      slides.push(
        <div key="expired" className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-600 to-red-700 p-5 min-h-[120px] flex items-center">
          <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10" />
          <div className="relative z-10 flex items-center justify-between gap-3 w-full">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="w-4 h-4 text-white/80" />
                <span className="text-xs font-bold text-white/80 uppercase tracking-wider">Subscription Expired</span>
              </div>
              <h3 className="text-white font-extrabold text-base">Your store is hidden</h3>
              <p className="text-white/90 text-xs mt-0.5">Customers can't see your products right now.</p>
            </div>
            <Button
              size="sm"
              onClick={() => navigate('/pricing')}
              className="shrink-0 bg-white text-red-600 hover:bg-white/90 font-bold shadow-lg"
            >
              Reactivate
            </Button>
          </div>
        </div>
      );
    } else {
      // Active — store visibility banner
      slides.push(
        <div key="visibility" className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 p-5 min-h-[120px] flex items-center">
          <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10" />
          <div className="relative z-10 flex items-center justify-between gap-3 w-full">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-white" />
                <span className="text-xs font-bold text-white/80 uppercase tracking-wider">Store Active</span>
              </div>
              <h3 className="text-white font-extrabold text-base">You're live &amp; selling! 🎉</h3>
              <p className="text-white/90 text-xs mt-0.5">Customers can find and buy from your store.</p>
            </div>
            <Badge className="shrink-0 bg-white/20 text-white border-0 font-bold">Live ✓</Badge>
          </div>
        </div>
      );
    }

    // ── Verification nudge ──
    if (shopData && profile && !profile.bank_verified && !localStorage.getItem('verification_nudge_dismissed')) {
      slides.push(
        <div key="verification" className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 p-5 min-h-[120px] flex items-center">
          <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10" />
          <div className="relative z-10 flex items-center justify-between gap-3 w-full">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4 text-white/80" />
                <span className="text-xs font-bold text-white/80 uppercase tracking-wider">Get Verified</span>
              </div>
              <h3 className="text-white font-extrabold text-base">Unlock payouts 🛡️</h3>
              <p className="text-white/90 text-xs mt-0.5">Verify your identity to withdraw your earnings.</p>
            </div>
            <div className="flex gap-1 shrink-0">
              <Button size="sm" onClick={() => navigate('/identity-verification')} className="bg-white text-amber-600 hover:bg-white/90 font-bold shadow-lg">Verify Now</Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/20" onClick={() => { localStorage.setItem('verification_nudge_dismissed', 'true'); loadData(); }}>
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      );
    }

    // ── Incomplete Setup (Approval + Payment) ──
    const accountAge = profile?.created_at ? differenceInDays(new Date(), new Date(profile.created_at)) : 0;
    
    if (shopFullData && accountAge >= 1) {
      // 1. Approval Pending
      if (!shopFullData.is_active) {
        slides.push(
          <div key="approval-pending" className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 p-5 min-h-[120px] flex items-center">
            <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10" />
            <div className="relative z-10 flex items-center justify-between gap-3 w-full">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-white/80" />
                  <span className="text-xs font-bold text-white/80 uppercase tracking-wider">Approval Required</span>
                </div>
                <h3 className="text-white font-extrabold text-base leading-tight">Your store is awaiting review</h3>
                <p className="text-white/90 text-xs mt-0.5">Admin needs to approve your store before it appears in the marketplace.</p>
              </div>
              <Button size="sm" variant="outline" className="shrink-0 border-white/40 text-white hover:bg-white/20 font-bold shadow-lg" onClick={() => window.open('https://wa.me/2348162232975', '_blank')}>Contact Admin</Button>
            </div>
          </div>
        );
      }

      // 2. Payment Setup Missing
      if (!shopFullData.payment_method) {
        slides.push(
          <div key="payment-setup" className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 p-5 min-h-[120px] flex items-center">
            <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10" />
            <div className="relative z-10 flex items-center justify-between gap-3 w-full">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4 text-white/80" />
                  <span className="text-xs font-bold text-white/80 uppercase tracking-wider">Marketplace: Hidden</span>
                </div>
                <h3 className="text-white font-extrabold text-base leading-tight">Complete your payment setup</h3>
                <p className="text-white/90 text-xs mt-0.5">Your store is hidden from the marketplace until you set up your bank details or Paystack.</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => navigate('/my-store?tab=settings')} className="shrink-0 bg-white text-rose-600 hover:bg-white/90 border-white font-bold shadow-lg">Set Up Now →</Button>
            </div>
          </div>
        );
      }
    }

    // ── Missing Product Images nudge ──
    if (shopData && productsCount > 0 && !hasProductWithImage) {
      slides.push(
        <div key="missing-images" className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 p-5 min-h-[120px] flex items-center">
          <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10" />
          <div className="relative z-10 flex items-center justify-between gap-3 w-full">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-white/80" />
                <span className="text-xs font-bold text-white/80 uppercase tracking-wider">Marketplace: Hidden</span>
              </div>
              <h3 className="text-white font-extrabold text-base leading-tight">Add product images</h3>
              <p className="text-white/90 text-xs mt-0.5">Your store is hidden from the marketplace until you add images to your products.</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => navigate('/products')} className="shrink-0 bg-white text-indigo-600 hover:bg-white/90 border-white font-bold shadow-lg">Add Images →</Button>
          </div>
        </div>
      );
    }

    // ── First sale nudge ──
    if (shopData && totalSales === 0) {
      slides.push(
        <div key="first-sale" className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 p-5 min-h-[120px] flex items-center">
          <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10" />
          <div className="absolute -bottom-4 -left-2 w-16 h-16 rounded-full bg-white/5" />
          <div className="relative z-10 w-full">
            <div className="flex items-center gap-2 mb-1">
              <Share2 className="w-4 h-4 text-white/80" />
              <span className="text-xs font-bold text-white/80 uppercase tracking-wider">First Sale Tips</span>
            </div>
            <h3 className="text-white font-extrabold text-base mb-1">Your first sale is 48h away 🚀</h3>
            <p className="text-white/90 text-xs mb-3">Share your store link on WhatsApp to get started.</p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="border-white/40 text-white hover:bg-white/20 gap-1.5 text-xs h-8 font-semibold" onClick={() => {
                const url = `${window.location.origin}/shop/${shopFullData?.shop_slug || shopData.id}`;
                navigator.clipboard.writeText(url);
                toast({ title: "Store link copied!" });
              }}><ExternalLink className="w-3 h-3" />Copy Link</Button>
              <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white gap-1.5 text-xs h-8 font-semibold" onClick={() => {
                const url = `${window.location.origin}/shop/${shopFullData?.shop_slug || shopData.id}`;
                window.open(`https://wa.me/?text=${encodeURIComponent('Check out my store: ' + url)}`, '_blank');
              }}><MessageCircle className="w-3 h-3" />Share on WhatsApp</Button>
            </div>
          </div>
        </div>
      );
    }

    // ── 30-Day Challenge CTA ──
    slides.push(
      <div key="challenge" className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-500 via-amber-500 to-orange-500 p-5 min-h-[120px] flex items-center">
        <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10" />
        <div className="absolute -bottom-4 left-8 w-16 h-16 rounded-full bg-white/5" />
        <div className="relative z-10 flex items-center justify-between gap-3 w-full">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-4 h-4 text-white" />
              <span className="text-xs font-bold text-white/80 uppercase tracking-wider">30-Day Challenge</span>
            </div>
            <h3 className="text-white font-extrabold text-base leading-tight">Become a Structured Seller 🏆</h3>
            <p className="text-white/90 text-xs mt-0.5">Daily tasks to transform your selling habits.</p>
          </div>
          <Button
            size="sm"
            className="shrink-0 bg-white text-amber-600 hover:bg-white/90 font-bold shadow-lg"
            onClick={() => setIsChallengeOpen(true)}
          >
            Start →
          </Button>
        </div>
      </div>
    );


    // ── Store Status slide ──
    if (shopData) {
      slides.push(
        <div key="store-status" className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 p-5 min-h-[120px] flex items-center">
          <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/5" />
          <div className="relative z-10 w-full">
            <div className="flex items-center gap-2 mb-3">
              <Store className="w-4 h-4 text-white/80" />
              <span className="text-xs font-bold text-white/80 uppercase tracking-wider">Store Status</span>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-xs">Visibility</span>
                <span className={`text-xs font-bold ${subscriptionStatus === 'expired' ? 'text-red-400' : 'text-green-400'}`}>
                  {subscriptionStatus === 'expired' ? 'Hidden' : 'Live'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-xs">Plan</span>
                <span className="text-xs font-bold text-white capitalize">{subscriptionStatus}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-xs">Products</span>
                <span className="text-xs font-bold text-white">{productsCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-xs">Rating</span>
                <span className="text-xs font-bold text-white">
                  {shopFullData?.average_rating ? `${shopFullData.average_rating.toFixed(1)} ⭐` : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // ── Help & Resources slide ──
    slides.push(
      <div key="help" className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 p-5 min-h-[120px] flex items-center">
        <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10" />
        <div className="relative z-10 flex items-center justify-between gap-3 w-full">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <HelpCircle className="w-4 h-4 text-white" />
              <span className="text-xs font-bold text-white/80 uppercase tracking-wider">Help & Resources</span>
            </div>
            <h3 className="text-white font-extrabold text-base leading-tight">Need help? We've got you 💡</h3>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button size="sm" variant="outline" className="border-white/30 text-white hover:bg-white/20 text-xs h-8 font-semibold" onClick={() => navigate('/faq')}>
              <HelpCircle className="w-3 h-3 mr-1" /> FAQ
            </Button>
            <Button size="sm" className="bg-white text-indigo-600 hover:bg-white/90 text-xs h-8 font-semibold" onClick={startTour}>
              <Sparkles className="w-3 h-3 mr-1" /> Tour
            </Button>
          </div>
        </div>
      </div>
    );

    return slides;
  };

  const slides = getCarouselSlides();
  const totalSlides = slides.length;
  const nextSlide = () => setCarouselIndex((prev) => (prev + 1) % totalSlides);
  const prevSlide = () => setCarouselIndex((prev) => (prev - 1 + totalSlides) % totalSlides);

  useEffect(() => {
    if (totalSlides <= 1 || isCarouselPaused) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [totalSlides, isCarouselPaused]);

  const goToSlide = (index: number) => setCarouselIndex(index);

  // ─── Primary Quick Actions (always visible) ────────────────────────────────
  const PrimaryQuickActions = [
    { icon: Store, label: "My Store", description: "Setup & customize", path: "/my-store", color: "from-primary/20 to-primary/10", textColor: "text-primary" },
    { icon: Package, label: "Products", description: "Manage catalog", path: "/products", color: "from-accent/20 to-accent/10", textColor: "text-accent" },
    { icon: ShoppingCart, label: "Orders", description: "View & manage", path: "/orders", color: "from-primary/15 to-primary/8", textColor: "text-primary" },
    { icon: Megaphone, label: "Marketing", description: "Create with AI", path: "/marketing", color: "from-accent/15 to-accent/8", textColor: "text-accent" },
    { icon: Wallet, label: "Wallet", description: "Earnings & payouts", path: "/dashboard", color: "from-[hsl(42,90%,55%)]/20 to-[hsl(42,90%,55%)]/10", textColor: "text-[hsl(42,80%,35%)]" },
  ];

  // ─── More Tools (shown in collapsible) ─────────────────────────────────────
  const QuickActions = [
    ...PrimaryQuickActions,
    { icon: Truck, label: "Delivery", description: "Shipping & logistics", path: "/orders", color: "from-primary/12 to-primary/6", textColor: "text-primary" },
    { icon: CalendarCheck, label: "Bookings", description: "Appointments", path: "/bookings", color: "from-accent/12 to-accent/6", textColor: "text-accent" },
    { icon: Sparkles, label: "Ads Assistant", description: "AI ad generator", path: "/ads-assistant", color: "from-primary/20 to-accent/10", textColor: "text-primary" },
    { icon: BookOpen, label: "Tutorials", description: "Learn & earn points", path: "/courses", color: "from-accent/15 to-accent/8", textColor: "text-accent" },
    { icon: Users, label: "Customers", description: "Customer records", path: "/customers", color: "from-primary/15 to-primary/8", textColor: "text-primary" },
    { icon: Crown, label: "Ambassador", description: "Refer & earn", path: "/ambassador", color: "from-[hsl(42,90%,55%)]/20 to-[hsl(42,90%,55%)]/10", textColor: "text-[hsl(42,80%,35%)]" },
    { icon: Share2, label: "Invite Vendors", description: "Grow community", path: "/vendor-invite", color: "from-primary/20 to-primary/10", textColor: "text-primary" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-2xl overflow-hidden">
              <img src={logo} alt="Loading" className="w-full h-full object-cover" />
            </div>
            <div className="absolute inset-0 rounded-2xl border-2 border-primary/40 animate-ping" />
          </div>
          <p className="text-muted-foreground text-sm animate-pulse">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const firstName = (profile?.full_name && profile.full_name.trim()) ? profile.full_name.trim().split(' ')[0] : (user?.email?.split('@')[0] || 'there');
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/3">
      {/* ─── Top Navigation ──────────────────────────────── */}
      <nav className="bg-card/95 backdrop-blur-xl border-b border-border/60 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl overflow-hidden ring-2 ring-primary/20 shadow-sm">
                <img src={logo} alt="SteerSolo" className="w-full h-full object-cover" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent hidden sm:block">
                SteerSolo
              </span>
            </div>

            {/* Desktop Nav Actions */}
            <div className="hidden md:flex items-center gap-1.5">
              {shopData && <StrokeMyShop shopId={shopData.id} shopName={shopData.name} />}
              <NotificationBell audience="entrepreneurs" />
              {/* Dark Mode Toggle */}
              {mounted && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? (
                    <Sun className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={handleLogout} className="hover:bg-destructive/10 hover:text-destructive gap-1.5">
                <LogOut className="h-4 w-4" />
                <span className="hidden lg:inline">Logout</span>
              </Button>
            </div>

            {/* Mobile: notifications + hamburger */}
            <div className="flex md:hidden items-center gap-1">
              <NotificationBell audience="entrepreneurs" />
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72 p-0">
                  <div className="flex flex-col h-full">
                    {/* Profile header */}
                    <div className="p-5 bg-gradient-to-br from-primary/10 to-accent/5 border-b border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {firstName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{profile?.full_name || firstName}</p>
                          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <ShopStatusBadge status={subscriptionStatus} daysRemaining={daysRemaining} />
                      </div>
                    </div>

                    {/* Menu items */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-1">
                      {/* Theme Toggle */}
                      {mounted && (
                        <button
                          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-muted transition-colors text-left"
                        >
                          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                            {theme === 'dark' ? <Sun className="w-4 h-4 text-yellow-500" /> : <Moon className="w-4 h-4 text-muted-foreground" />}
                          </div>
                          <span className="text-sm font-medium">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                        </button>
                      )}
                      <Separator className="my-1" />
                      {QuickActions.map((action) => (
                        <button
                          key={action.path + action.label}
                          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-muted transition-colors text-left"
                          onClick={() => { navigate(action.path); setIsMobileMenuOpen(false); }}
                        >
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center shrink-0`}>
                            <action.icon className={`w-4 h-4 ${action.textColor}`} />
                          </div>
                          <span className="text-sm font-medium">{action.label}</span>
                        </button>
                      ))}
                      <Separator className="my-2" />
                      <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-muted transition-colors" onClick={() => { navigate("/settings"); setIsMobileMenuOpen(false); }}>
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center"><Settings className="w-4 h-4 text-muted-foreground" /></div>
                        <span className="text-sm font-medium">Settings</span>
                      </button>
                      <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-destructive/10 transition-colors" onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}>
                        <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center"><LogOut className="w-4 h-4 text-destructive" /></div>
                        <span className="text-sm font-medium text-destructive">Logout</span>
                      </button>
                    </div>

                    {userBadges.length > 0 && (
                      <div className="p-4 border-t border-border">
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

      {/* ─── Main Content ─────────────────────────────────── */}
      <div className="container mx-auto px-4 py-3 pb-24 md:pb-8 max-w-7xl space-y-4">
        
        {/* ProductNudges moved into carousel */}

        {/* Welcome Hero */}
        <div className="relative rounded-3xl overflow-hidden mb-6 bg-gradient-to-br from-[hsl(215,65%,18%)] via-primary to-[hsl(145,58%,30%)] p-6 shadow-xl">
          {/* decorative circles */}
          <div className="absolute -top-6 -right-6 w-36 h-36 rounded-full bg-white/5" />
          <div className="absolute -bottom-8 -left-4 w-28 h-28 rounded-full bg-white/5" />
          <div className="absolute top-1/2 right-12 w-16 h-16 rounded-full bg-white/8 -translate-y-1/2" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              {shopData && (
                <ShopAvatar
                  name={shopData.name}
                  logoUrl={shopFullData?.logo_url}
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl shadow-lg ring-2 ring-white/20"
                  initialsClassName="text-xl sm:text-2xl"
                />
              )}
              <div>
                <p className="text-white/70 text-sm font-medium mb-0.5">{greeting},</p>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">{firstName}! 👋</h1>
                <p className="text-white/80 text-sm">
                  {shopData ? `Managing ${shopData.name}` : "Here's what's happening today"}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:items-end">
              <ShopStatusBadge status={subscriptionStatus} daysRemaining={daysRemaining} />
              {shopData && (
                <Button
                  size="sm"
                  onClick={() => navigate(`/shop/${shopFullData?.shop_slug || shopData.id}`)}
                  className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm"
                >
                  View My Store →
                </Button>
              )}
              {shopData && (
                <div className="hidden md:block">
                  <StrokeMyShop shopId={shopData.id} shopName={shopData.name} />
                </div>
              )}
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-card border border-border/50 h-auto p-1 grid grid-cols-3 sm:w-[400px]">
            <TabsTrigger value="overview" className="py-2.5 text-xs sm:text-sm">Overview</TabsTrigger>
            <TabsTrigger value="actions" className="py-2.5 text-xs sm:text-sm">Actions</TabsTrigger>
            <TabsTrigger value="wallet" className="py-2.5 text-xs sm:text-sm">Wallet & Offers</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 focus-visible:outline-none focus-visible:ring-0">
            {/* Contextual Banner */}
            {getContextualBanner()}

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
              <StatCard label="Total Revenue" value={`₦${totalRevenue.toLocaleString()}`} icon={DollarSign} gradient="bg-gradient-to-br from-primary to-primary/80" trend="up" trendValue="All time earnings" />
              <StatCard label="Total Sales" value={String(totalSales)} icon={TrendingUp} gradient="bg-gradient-to-br from-accent to-accent/80" trend="up" trendValue="Completed orders" />
              <StatCard label="Products" value={String(productsCount)} icon={Package} gradient="bg-gradient-to-br from-[hsl(215,65%,30%)] to-[hsl(215,65%,42%)]" trendValue="Items in catalog" />
              <StatCard label="Pending Orders" value={String(pendingOrders)} icon={ShoppingCart} gradient="bg-gradient-to-br from-[hsl(215,65%,18%)] to-primary" trendValue={pendingOrders > 0 ? "Need attention" : "All clear!"} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="overflow-hidden" data-tour="sales-analytics">
                  <div className="h-1 w-full bg-gradient-to-r from-primary via-accent to-primary" />
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-bold flex items-center gap-2">
                        <BarChart2 className="w-4 h-4 text-primary" />
                        Revenue Trend
                      </div>
                      <Badge variant="outline" className="text-xs">Last 7 days</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="h-[220px] sm:h-[240px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                          <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₦${v}`} width={55} />
                          <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} formatter={(value) => [`₦${Number(value).toLocaleString()}`, 'Revenue']} />
                          <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#revenueGrad)" dot={{ r: 3, fill: 'hsl(var(--primary))' }} activeDot={{ r: 5 }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-6">
                <ProfileCompletionChecklist shop={shopFullData} productsCount={productsCount} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="actions" className="space-y-6 focus-visible:outline-none focus-visible:ring-0">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" data-tour="quick-actions">
              {QuickActions.map((action) => (
                <QuickActionTile key={action.path + action.label} icon={action.icon} label={action.label} description={action.description} onClick={() => action.label === 'Wallet' ? setIsPayoutDialogOpen(true) : navigate(action.path)} color={action.color} textColor={action.textColor} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="wallet" className="space-y-6 focus-visible:outline-none focus-visible:ring-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {shopData && (
                <Card className="overflow-hidden">
                  <div className="h-0.5 w-full bg-gradient-to-r from-accent to-primary" />
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-sm flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-accent" />
                        Wallet Balance
                      </h3>
                    </div>
                    <div className="text-center mb-4 py-6 bg-gradient-to-br from-accent/5 to-primary/5 rounded-xl border border-border/50">
                      <p className="text-3xl sm:text-4xl font-extrabold text-primary">₦{payoutBalance.availableBalance.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground mt-1">Available for withdrawal</p>
                      {payoutBalance.totalPending > 0 && (
                        <p className="text-sm text-amber-600 mt-2 font-medium">₦{payoutBalance.totalPending.toLocaleString()} pending</p>
                      )}
                    </div>
                    <Button size="lg" className="w-full text-base font-semibold" disabled={payoutBalance.availableBalance < 5000} onClick={() => setIsPayoutDialogOpen(true)}>
                      <Banknote className="w-5 h-5 mr-2" />
                      Request Payout
                    </Button>
                    {payoutBalance.availableBalance < 5000 && (
                      <p className="text-xs text-muted-foreground text-center mt-3">Minimum withdrawal: ₦5,000</p>
                    )}
                  </CardContent>
                </Card>
              )}

              <div className="space-y-6">
                {shopData && <CouponManager shopId={shopData.id} />}
                
                {activeOffer && (
                  <Card className="overflow-hidden border-0 bg-gradient-to-br from-[hsl(215,65%,20%)] to-[hsl(145,55%,30%)] text-white shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold mb-1 text-base">Special Offer 🎁</h3>
                          <p className="text-sm opacity-90 mb-4">{activeOffer.description}</p>
                          <Button variant="secondary" onClick={handleSubscribe} className="bg-white text-primary hover:bg-white/90 font-bold w-full sm:w-auto">
                            {activeOffer.button_text || "Claim Offer"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ─── Mobile Bottom Navigation ────────────────────── */}
      <MobileBottomNav />

      {/* Joyride Tour */}
      <Joyride
        steps={dashboardTourSteps}
        run={isRunning}
        continuous
        showSkipButton
        showProgress
        callback={handleTourCallback}
        tooltipComponent={TourTooltip}
        styles={{ options: { zIndex: 10000, arrowColor: 'hsl(var(--card))' } }}
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
        onShopCreated={() => loadData()}
      />
      <FeedbackPrompt />
      <SalesMilestonePopup totalSales={totalSales} />
      <SubscriptionExpiryDialog
        subscriptionStatus={subscriptionStatus}
        productsCount={productsCount}
        shopId={shopData?.id || null}
        onProductDeleted={() => loadData()}
      />

      {/* 30-Day Structured Selling Challenge Sheet */}
      <Sheet open={isChallengeOpen} onOpenChange={setIsChallengeOpen}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-3xl p-0">
          <div className="p-4 sm:p-6">
            <StructuredSellingChallenge />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Dashboard;
