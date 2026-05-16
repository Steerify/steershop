import { useEffect, useState, useCallback } from "react";
import { useTheme } from "next-themes";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { rbac } from "@/utils/rbac";
import shopService from "@/services/shop.service";
import orderService from "@/services/order.service";
import offerService from "@/services/offer.service";
import productService from "@/services/product.service";
import subscriptionService from "@/services/subscription.service";
import { payoutService } from "@/services/payout.service";
import { useToast } from "@/hooks/use-toast";
import {
  Store, Package, ShoppingCart, TrendingUp, Users,
  Settings, LogOut, Share2, MapPin,
  Megaphone, Target, ArrowRight, Clock,
  CheckCircle, AlertCircle, DollarSign, CalendarCheck, Menu, X,
  HelpCircle, Search, Shield, BookOpen, Banknote, Wallet, Crown, MessageCircle, Truck, BadgeCheck, Sparkles,
  BarChart2, Home, Bell, ChevronUp, ChevronDown, ChevronRight, Zap, Star, TrendingDown, ExternalLink, Sun, Moon, type LucideIcon
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
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PayoutRequestDialog } from "@/components/PayoutRequestDialog";
import { CouponManager } from "@/components/CouponManager";
import { NotificationBell } from "@/components/NotificationBell";
import { FeedbackPrompt } from "@/components/FeedbackPrompt";
import { SalesMilestonePopup } from "@/components/SalesMilestonePopup";
import { StructuredSellingChallenge } from "@/components/StructuredSellingChallenge";
import { SubscriptionExpiryDialog } from "@/components/SubscriptionExpiryDialog";
import { calculateSubscriptionStatus } from "@/utils/subscription";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ShopAvatar } from "@/components/ShopAvatar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { VendorSetupWizard } from "@/components/VendorSetupWizard";
import { BulkProductUpload } from "@/components/BulkProductUpload";

// ─── Stat Card Component (Minimalist) ──────────────────────────────────────────

type DashboardProfile = {
  full_name?: string | null;
  is_subscribed?: boolean | null;
  subscription_expires_at?: string | null;
};

type DashboardShop = {
  id: string;
  name?: string;
  shop_name?: string;
  shop_slug?: string | null;
  logo_url?: string | null;
  category?: string | null;
  city?: string | null;
  state?: string | null;
  hasDefaultAddress?: boolean;
  is_active?: boolean | null;
  total_views?: number | null;
  total_shares?: number | null;
  bank_name?: string | null;
  bank_account_number?: string | null;
  bank_account_name?: string | null;
};

type DashboardOffer = { description: string };
type DashboardBadge = Record<string, unknown>;
type DashboardChartPoint = { date: string; revenue: number };
type DashboardOrderSummary = {
  payment_status?: string | null;
  order_status?: string | null;
  created_at?: string | null;
  total_amount?: number | string | null;
};

type UrgentTask = { id: string; label: string; icon: LucideIcon; color: string; action: () => void };

const StatCard = ({
  label, value, icon: Icon, trend, trendValue
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}) => (
  <Card className="border border-border/50 shadow-sm bg-card overflow-hidden transition-all hover:shadow-md">
    <CardContent className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        {trendValue && (
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${trend === "up" ? "bg-green-500/10 text-green-600" : trend === "down" ? "bg-red-500/10 text-red-600" : "bg-muted text-muted-foreground"}`}>
            {trend === "up" ? <TrendingUp className="w-2.5 h-2.5" /> : trend === "down" ? <TrendingDown className="w-2.5 h-2.5" /> : null}
            {trendValue}
          </div>
        )}
      </div>
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
        <p className="text-2xl font-black tracking-tight">{value}</p>
      </div>
    </CardContent>
  </Card>
);

// ─── Quick Action Item (App-like) ─────────────────────────────────────────────
const QuickActionButton = ({
  icon: Icon, label, onClick, color, textColor
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  color: string;
  textColor: string;
}) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center gap-2 group transition-all"
  >
    <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:-translate-y-1 transition-all`}>
      <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${textColor}`} />
    </div>
    <span className="text-[11px] sm:text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors uppercase tracking-tight text-center leading-tight px-1">
      {label}
    </span>
  </button>
);


// ─── Urgent Tasks Component ──────────────────────────────────────────────────
const UrgentTasks = ({ tasks, onAction }: { 
  tasks: UrgentTask[];
  onAction: () => void;
}) => {
  if (tasks.length === 0) return null;

  return (
    <div className="mb-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-5 h-5 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertCircle className="w-3 h-3 text-destructive" />
        </div>
        <h3 className="text-sm font-bold text-foreground">Urgent Tasks</h3>
        <Badge variant="destructive" className="h-5 px-1.5 text-[10px] font-bold">
          {tasks.length}
        </Badge>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {tasks.map((task) => (
          <button
            key={task.id}
            onClick={task.action}
            className="flex items-center gap-3 p-3 bg-card border border-destructive/20 rounded-2xl hover:border-destructive/40 hover:shadow-md transition-all text-left group"
          >
            <div className={`w-10 h-10 rounded-xl ${task.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
              <task.icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground truncate">{task.label}</p>
              <p className="text-xs text-muted-foreground">Action required</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 group-hover:translate-x-1 transition-transform" />
          </button>
        ))}
      </div>
    </div>
  );
};

// ─── Main Dashboard Component ──────────────────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user, signOut, isLoading: isAuthLoading } = useAuth();
  const [profile, setProfile] = useState<DashboardProfile | null>(null);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [shopFullData, setShopFullData] = useState<any>(null);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [setupProgress, setSetupProgress] = useState(0);
  const [setupSteps, setSetupSteps] = useState<any[]>([]);
  const [daysRemaining, setDaysRemaining] = useState<number>(0);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'active' | 'trial' | 'expired' | 'free'>('trial');
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [chartData, setChartData] = useState<DashboardChartPoint[]>([]);
  const [activeOffer, setActiveOffer] = useState<DashboardOffer | null>(null);
  const [shopData, setShopData] = useState<{ id: string; name: string } | null>(null);
  const [shopFullData, setShopFullData] = useState<DashboardShop | null>(null);
  const [productsCount, setProductsCount] = useState(0);
  const [hasProductWithImage, setHasProductWithImage] = useState(false);
  const [userBadges, setUserBadges] = useState<DashboardBadge[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [payoutBalance, setPayoutBalance] = useState({ totalRevenue: 0, totalWithdrawn: 0, totalPending: 0, availableBalance: 0 });
  const [isPayoutDialogOpen, setIsPayoutDialogOpen] = useState(false);
  const [hasNoShop, setHasNoShop] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "actions" | "wallet">("overview");
  const [isChallengeOpen, setIsChallengeOpen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(true);
  const [urgentTasks, setUrgentTasks] = useState<UrgentTask[]>([]);

  // Tour state
  const { hasSeenTour, isRunning, startTour, endTour, resetTour } = useTour('dashboard');
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleTourCallback = (data: CallBackProps) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].some((completeStatus) => completeStatus === status)) {
      endTour(status === STATUS.FINISHED);
    }
  };

  // Handle payment verification from Paystack redirect — with polling fallback
  // so race-conditions between redirect and webhook never leave a paid user
  // stuck on "trial".
  useEffect(() => {
    const verifyPayment = async () => {
      const subscriptionParam = searchParams.get('subscription');
      const reference = searchParams.get('reference') || localStorage.getItem('paystack_reference');

      if (subscriptionParam !== 'verify' || !reference || !user) return;

      setIsSubscribing(true);
      try {
        // Step 1: try direct verify (fast path)
        const result = await subscriptionService.verifyPayment(reference);
        if (result.success) {
          toast({ title: "Payment Successful! 🎉", description: "Your subscription has been activated. Welcome to SteerSolo!" });
          setSubscriptionStatus('active');
          localStorage.removeItem('paystack_reference');
          loadData();
          return;
        }

        // Step 2: fall back to polling the profile for up to 20s
        // (Paystack webhook may still be in flight)
        for (let i = 0; i < 10; i++) {
          await new Promise(r => setTimeout(r, 2000));
          const { data: prof } = await supabase
            .from('profiles')
            .select('is_subscribed, subscription_expires_at')
            .eq('id', user.id)
            .single();
          if (prof?.is_subscribed) {
            toast({ title: "Payment Confirmed! 🎉", description: "Your subscription is now active." });
            setSubscriptionStatus('active');
            localStorage.removeItem('paystack_reference');
            loadData();
            return;
          }
        }

        toast({
          title: "Still confirming your payment",
          description: "Your payment is being processed. Refresh in a moment — if the issue persists, contact support with reference " + reference,
          variant: "destructive",
        });
      } catch (error) {
        console.error('Payment verification error:', error);
      } finally {
        setIsSubscribing(false);
        navigate('/dashboard', { replace: true });
      }
    };
    verifyPayment();
  }, [searchParams, user]);


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

      // CORE FETCH: Run profile and shop check in parallel for speed
      const [profileRes, shopRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        shopService.getShopByOwner(user.id)
      ]);

      // 1. Process Profile
      if (profileRes.error) {
        console.error('Error fetching profile:', profileRes.error);
        setProfile({ full_name: user.email?.split('@')[0] || 'User' });
      } else {
        const p = profileRes.data;
        setProfile(p);
        if (p.subscription_expires_at) {
          const expiresAt = new Date(p.subscription_expires_at);
          const now = new Date();
          const daysLeft = differenceInDays(expiresAt, now);
          setDaysRemaining(Math.max(0, daysLeft));
          if (p.is_subscribed && expiresAt > now) setSubscriptionStatus('active');
          else if (!p.is_subscribed && expiresAt > now) setSubscriptionStatus('trial');
        } else {
          setSubscriptionStatus('trial');
          setDaysRemaining(15);
        }
      }

      // 2. Check for Shop - EARLY EXIT if no shop found
      const shops = shopRes.data;
      const primaryShop = (Array.isArray(shops) ? shops[0] : shops) as DashboardShop | null;

      if (!primaryShop) {
        setHasNoShop(true);
        setShopData(null);
        // Instant exit for new users to trigger Setup Wizard
        setIsLoading(false);
        return; 
      }

      const { data: defaultAddress } = await supabase
        .from('shop_addresses')
        .select('id')
        .eq('shop_id', primaryShop.id)
        .eq('is_default', true)
        .maybeSingle();

      const shopWithCompletion = {
        ...primaryShop,
        hasDefaultAddress: !!defaultAddress,
      };

      // 3. Populate Dashboard Data (only if shop exists)
      setShopData({ id: primaryShop.id, name: primaryShop.shop_name || primaryShop.name });
      setShopFullData(shopWithCompletion);

      if (!primaryShop.is_active) {
        setSubscriptionStatus('trial');
      }

      // Parallel fetch for dashboard secondary data
      const [productsRes, ordersRes, badgesRes, offersRes, balance] = await Promise.all([
        productService.getProducts({ shopId: primaryShop.id }),
        orderService.getOrders({ shopId: primaryShop.id }),
        subscriptionService.getUserBadges(user.id),
        offerService.getOffers(),
        payoutService.getBalance(primaryShop.id).catch(() => null)
      ]);

      // Calculate setup progress
      const steps = [
        { id: 1, title: "Create Store", completed: !!primaryShop },
        { id: 2, title: "Add Products", completed: (productsRes.data?.length || 0) > 0 },
        { id: 3, title: "Connect WhatsApp", completed: !!primaryShop.whatsapp_number },
      ];
      setSetupSteps(steps);
      const completedCount = steps.filter(s => s.completed).length;
      setSetupProgress(Math.round((completedCount / steps.length) * 100));

      // 4. Process Secondary Data
      const productsList = productsRes.data || [];
      setProductsCount(productsList.length);
      setHasProductWithImage(productsList.some(p => !!p.image_url && p.is_available));

      const allOrders = ordersRes.data || [];
      const pending = (allOrders as DashboardOrderSummary[]).filter(o => o.payment_status !== 'paid' && o.order_status !== 'completed').length;
      setPendingOrders(pending);

      // Process Chart Data
      const last7Days = eachDayOfInterval({
        start: subMonths(new Date(), 0).setDate(new Date().getDate() - 6),
        end: new Date()
      });
      const paidOrders = (allOrders as DashboardOrderSummary[]).filter(o => o.payment_status === 'paid');
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
      if (balance) setPayoutBalance(balance);

      if (badgesRes.success && badgesRes.data) {
        setUserBadges(badgesRes.data.map(ub => ub.badges).filter(Boolean));
      }

      if (offersRes.success && offersRes.data) {
        const entOffer = offersRes.data.find(o => o.target_audience === 'entrepreneurs' && o.is_active);
        if (entOffer) setActiveOffer(entOffer);
      }

      // ─── Determine Urgent Tasks ───
      const tasks = [];
      if (pending > 0) {
        tasks.push({
          id: 'orders',
          label: `${pending} Pending Order${pending !== 1 ? 's' : ''}`,
          icon: ShoppingCart,
          color: 'bg-amber-500/10 text-amber-600',
          action: () => navigate('/orders')
        });
      }
      if (subscriptionStatus === 'expired') {
        tasks.push({
          id: 'subscription',
          label: 'Subscription Expired',
          icon: Shield,
          color: 'bg-destructive/10 text-destructive',
          action: () => navigate('/pricing')
        });
      } else if (daysRemaining < 3 && subscriptionStatus !== 'free') {
        tasks.push({
          id: 'subscription-near',
          label: `Subscription expires in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`,
          icon: Clock,
          color: 'bg-orange-500/10 text-orange-600',
          action: () => navigate('/pricing')
        });
      }
      if (productsList.length === 0) {
        tasks.push({
          id: 'products',
          label: 'Add your first product',
          icon: Package,
          color: 'bg-primary/10 text-primary',
          action: () => navigate('/products')
        });
      }
      if (primaryShop && !primaryShop.is_active) {
        tasks.push({
          id: 'approval',
          label: 'Awaiting Shop Approval',
          icon: Store,
          color: 'bg-blue-500/10 text-blue-600',
          action: () => navigate('/my-store')
        });
      }
      setUrgentTasks(tasks);

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
      const result = await subscriptionService.initializePayment('growth', 'monthly');
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
            onClick={() => window.open('https://chat.whatsapp.com/J5oedmlZGdfANA2ZnbaE76', '_blank')}>
            <MessageCircle className="w-3.5 h-3.5" />Join Now
          </Button>
        </div>
      </div>
    );
  };



  // ─── Primary Quick Actions (always visible) ────────────────────────────────
  const PrimaryQuickActions = [
    shopData 
      ? { icon: Store, label: "My Store", description: "Setup & customize", path: "/my-store", color: "from-primary/20 to-primary/10", textColor: "text-primary" }
      : { icon: Store, label: "Create Online Shop", description: "Launch your store", path: "/dashboard", color: "from-green-500/20 to-green-500/10", textColor: "text-green-600" },
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
  const isWizardOpen = !isLoading && !shopData && rbac.isEntrepreneur(user);

  if (isWizardOpen) {
    return (
      <VendorSetupWizard 
        open={true} 
        onComplete={() => loadData()} 
      />
    );
  }

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
      <div className="container mx-auto px-4 py-3 pb-24 md:pb-8 max-w-7xl space-y-6">
        
        {/* Consolidated Vendor Command Center Section */}
        {rbac.isEntrepreneur(user) && (
          <>
            {setupProgress < 100 || !shopFullData?.is_active ? (
              /* Onboarding Guide for Incomplete Setup */
              <div className="bg-gradient-to-b from-indigo-950 via-indigo-900 to-background border border-indigo-500/20 py-8 px-6 relative z-10 rounded-[2rem] overflow-hidden shadow-2xl">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3" />
                </div>

                <div className="relative text-center mb-8">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 text-[10px] font-black uppercase tracking-widest mb-4">
                    <Activity className="w-3.5 h-3.5" /> Setup Progress
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 leading-tight">
                    Let's launch your store, {firstName}!
                  </h2>
                  <p className="text-indigo-200/70 text-sm max-w-md mx-auto mb-8">
                    Complete these quick steps to start accepting orders and growing your brand.
                  </p>

                  <div className="max-w-xs mx-auto space-y-2">
                    <div className="flex justify-between items-end text-xs">
                      <span className="text-indigo-200/60 font-bold uppercase tracking-tighter">Completion</span>
                      <span className="text-white font-black">{setupProgress}%</span>
                    </div>
                    <Progress value={setupProgress} className="h-2 bg-white/10" indicatorClassName="bg-gradient-to-r from-primary to-accent" />
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  {setupSteps.map((step) => (
                    <Card key={step.id} className={`bg-white/5 backdrop-blur-md border-white/10 transition-all ${!step.completed ? 'ring-1 ring-primary/50' : 'opacity-60'}`}>
                      <CardContent className="p-5">
                        <div className="flex justify-between items-start mb-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${step.completed ? 'bg-green-500/20 text-green-400' : 'bg-primary/20 text-primary'}`}>
                            {step.completed ? <CheckCircle2 className="w-5 h-5" /> : <step.id === 1 ? <Store className="w-5 h-5" /> : step.id === 2 ? <PackagePlus className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
                          </div>
                          <span className="text-white/20 text-[10px] font-black tracking-widest">0{step.id}</span>
                        </div>
                        <h3 className="text-sm font-bold text-white mb-1">{step.title}</h3>
                        <Button asChild variant="ghost" size="sm" className="w-full justify-between px-0 hover:bg-transparent text-indigo-300 hover:text-white group">
                          <Link to={step.id === 1 ? "/my-store" : step.id === 2 ? "/products" : "/my-store"}>
                            {step.completed ? 'Update Details' : 'Complete Step'}
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              /* Premium Command Header for Active Shops */
              <div className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-black border border-white/10 p-6 sm:p-8 relative z-10 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none" />
                <div className="relative">
                  <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto">
                      <div className="relative">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 shadow-2xl">
                          <Store className="w-8 h-8 text-white" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-4 border-indigo-950 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        </div>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight truncate">{shopFullData.shop_name}</h3>
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[8px] font-black uppercase h-4 px-1.5">Live</Badge>
                        </div>
                        <div className="flex items-center gap-1.5 text-indigo-200/50 text-xs font-bold overflow-hidden">
                          <ExternalLink className="w-3 h-3 shrink-0" />
                          <span className="truncate">{window.location.origin.replace(/^https?:\/\//, '')}/shop/{shopFullData.shop_slug || shopFullData.id}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Button 
                        variant="outline" 
                        className="flex-1 sm:flex-none border-white/10 bg-white/5 text-white hover:bg-white/10 rounded-xl h-11 px-4 font-bold text-xs"
                        onClick={() => {
                          const url = `${window.location.origin}/shop/${shopFullData.shop_slug || shopFullData.id}`;
                          navigator.clipboard.writeText(url);
                          setIsCopied(true);
                          setTimeout(() => setIsCopied(false), 2000);
                          toast({ title: "Copied!", description: "Store link copied" });
                        }}
                      >
                        {isCopied ? <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-green-400" /> : <Copy className="w-3.5 h-3.5 mr-2" />}
                        Copy Link
                      </Button>
                      <Button 
                        onClick={() => window.open(`${window.location.origin}/shop/${shopFullData.shop_slug || shopFullData.id}`, '_blank')}
                        className="flex-1 sm:flex-none bg-white text-indigo-950 hover:bg-white/90 rounded-xl h-11 px-6 font-black shadow-xl"
                      >
                        Visit Store
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                    {[
                      { label: "Revenue", value: `₦${totalRevenue.toLocaleString()}`, icon: Activity, color: "text-blue-400" },
                      { label: "Orders", value: totalSales, icon: PackagePlus, color: "text-amber-400" },
                      { label: "Traffic", value: shopFullData.view_count || "0", icon: Sparkles, color: "text-purple-400" },
                      { label: "Contacts", value: shopFullData.contact_count || "0", icon: MessageCircle, color: "text-green-400" }
                    ].map((stat, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm group hover:bg-white/10 transition-all cursor-default">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`p-1.5 rounded-lg bg-white/5 ${stat.color}`}>
                            <stat.icon className="w-3.5 h-3.5" />
                          </div>
                          <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
                        </div>
                        <h4 className="text-xl font-black text-white tracking-tight">{stat.value}</h4>
                      </div>
                    ))}
                  </div>

                  {/* SteerAds Growth Engine Inline Widget */}
                  <div className="mt-6 p-5 rounded-3xl bg-gradient-to-r from-accent/10 to-primary/10 border border-white/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                      <Zap className="w-20 h-20 text-accent" />
                    </div>
                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Sparkles className="w-3.5 h-3.5 text-accent" />
                          <span className="text-[10px] font-black text-accent uppercase tracking-widest leading-none">Growth Engine</span>
                        </div>
                        <h3 className="text-lg font-black text-white leading-tight">Get more sales with SteerAds</h3>
                        <p className="text-indigo-200/50 text-xs mt-1">Daily automated promotion to reach thousands of buyers.</p>
                      </div>
                      <Button 
                        size="sm"
                        onClick={() => navigate('/steerads')}
                        className="bg-accent hover:bg-accent/90 text-white rounded-xl font-black px-6"
                      >
                        Boost Now
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Action Grid & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
          <div className="space-y-6">
            {/* Main KPI Chart Card */}
            <Card className="border-border/50 shadow-sm overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 bg-muted/20 px-6 py-4">
                <div>
                  <CardTitle className="text-base font-black">Sales Performance</CardTitle>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Last 7 Days</p>
                </div>
                <Badge variant="outline" className="font-bold text-xs bg-card">₦{totalRevenue.toLocaleString()}</Badge>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-[240px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground))" strokeOpacity={0.1} />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} dy={10} />
                      <YAxis hide />
                      <Tooltip 
                        contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)', fontWeight: 700}}
                        itemStyle={{color: 'hsl(var(--primary))'}}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Quick Tools Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Inventory", icon: Package, color: "from-blue-500/10 to-blue-500/20", text: "text-blue-600", path: "/products" },
                { label: "Orders", icon: ShoppingCart, color: "from-amber-500/10 to-amber-500/20", text: "text-amber-600", path: "/orders" },
                { label: "Wallet", icon: Wallet, color: "from-green-500/10 to-green-500/20", text: "text-green-600", onClick: () => setIsPayoutDialogOpen(true) },
                { label: "Ads", icon: Zap, color: "from-purple-500/10 to-purple-500/20", text: "text-purple-600", path: "/steerads" }
              ].map((tool, i) => (
                <button 
                  key={i}
                  onClick={() => tool.path ? navigate(tool.path) : tool.onClick?.()}
                  className="group flex flex-col items-center p-5 rounded-3xl bg-card border border-border/50 hover:border-primary/30 transition-all hover:shadow-lg"
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <tool.icon className={`w-6 h-6 ${tool.text}`} />
                  </div>
                  <span className="text-xs font-black text-muted-foreground uppercase tracking-tight group-hover:text-foreground">{tool.label}</span>
                </button>
              ))}
            </div>
          </div>

          <aside className="space-y-6">
            {/* Urgent Notification Card */}
            {urgentTasks.length > 0 && (
              <Card className="border-destructive/30 bg-destructive/5 overflow-hidden">
                <CardHeader className="p-4 border-b border-destructive/10">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-destructive" />
                    <span className="text-[10px] font-black text-destructive uppercase tracking-widest">Attention Required</span>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  {urgentTasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between gap-3">
                      <p className="text-sm font-bold truncate">{task.label}</p>
                      <Button size="sm" variant="destructive" className="h-8 rounded-lg px-4 font-bold text-[10px] uppercase tracking-wide" onClick={task.action}>Solve</Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* AI Sales Coach / Community Widget */}
            <Card className="bg-gradient-to-br from-indigo-950 to-indigo-900 border-none shadow-xl overflow-hidden text-white">
              <CardContent className="p-6 relative">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <MessageCircle className="w-16 h-16" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-lg font-black leading-tight mb-2">Join the Vendor Community</h3>
                  <p className="text-indigo-200/70 text-xs leading-relaxed mb-6">
                    Connect with 5,000+ top vendors in Nigeria. Share tips, get daily support, and grow together.
                  </p>
                  <Button 
                    className="w-full bg-white text-indigo-950 hover:bg-indigo-50 font-black rounded-xl"
                    onClick={() => window.open('https://chat.whatsapp.com/J5oedmlZGdfANA2ZnbaE76', '_blank')}
                  >
                    Join WhatsApp
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Bulk Upload Helper */}
            <Card className="border-dashed border-2 border-border/60 hover:border-primary/40 transition-colors cursor-pointer group" onClick={() => setIsBulkUploadOpen(true)}>
              <CardContent className="p-6 text-center">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <h4 className="text-sm font-bold mb-1">AI Bulk Upload</h4>
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Fast Inventory Setup</p>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>

      {/* Bulk Upload Modal */}
      {shopData && (
        <BulkProductUpload 
          open={isBulkUploadOpen} 
          onClose={() => setIsBulkUploadOpen(false)} 
          shopId={shopData.id}
          onSuccess={() => {
            loadData();
            setIsBulkUploadOpen(false);
          }}
        />
      )}
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

      <VendorSetupWizard 
        open={false} 
        onComplete={() => loadData()} 
      />
    </div>
  );
};

export default Dashboard;
