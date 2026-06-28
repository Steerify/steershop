import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { rbac } from "@/utils/rbac";
import { supabase } from "@/integrations/supabase/client";
import {
  Loader2,
  Store,
  PackagePlus,
  Share2,
  ArrowRight,
  CheckCircle2,
  Copy,
  ExternalLink,
  Activity,
  Sparkles,
  ShieldCheck,
  Lock,
  Unlock,
  Clock,
  Coins,
  Award,
  Info,
  HelpCircle,
  ChevronRight,
  ShoppingCart,
  Megaphone,
  TrendingUp,
  TrendingDown,
  Wallet,
  Package,
  Users,
  Zap,
  Target,
  CalendarCheck,
  MessageCircle,
  BarChart3,
  Star,
  DollarSign,
  Truck,
  AlertCircle,
  Eye,
  Filter,
  Heart,
  Phone,
  Trophy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { BulkProductUpload } from "@/components/BulkProductUpload";
import shopService from "@/services/shop.service";
import productService from "@/services/product.service";
import orderService from "@/services/order.service";
import { payoutService } from "@/services/payout.service";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { format, eachDayOfInterval, subDays, isToday } from "date-fns";

interface Metric {
  label: string;
  value: number | string;
  change: string;
  positive: boolean;
  icon: any;
  color: string;
}

export const VendorCommandCenter = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [shop, setShop] = useState<any>(null);
  const [productsCount, setProductsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [activePeriod, setActivePeriod] = useState<"7d" | "30d" | "90d">("7d");
  const [showHelp, setShowHelp] = useState(false);

  const [dashboardData, setDashboardData] = useState({
    todaySales: 0,
    activeOrders: 0,
    conversion: "0.0%",
    walletBalance: 0,
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    topProducts: [] as any[],
    recentOrders: [] as any[],
    chartData: [] as any[],
  });

  const fetchShopData = async () => {
    if (!user) return;
    try {
      const shopRes = await shopService.getShopByOwner(user.id);
      const shops = shopRes.data;
      const shopData = Array.isArray(shops) ? shops[0] : shops;
      setShop(shopData);

      if (shopData) {
        const [productsRes, ordersRes, balanceRes] = await Promise.all([
          productService.getProducts({ shopId: shopData.id }),
          orderService.getOrders({ shopId: shopData.id }),
          payoutService.getBalance(shopData.id).catch(() => null),
        ]);

        const productsList = productsRes.data || [];
        setProductsCount(productsList.length);

        const allOrders = ordersRes.data || [];
        const todayStr = new Date().toISOString().split("T")[0];

        let todaySales = 0;
        let activeOrdersCount = 0;
        let totalRevenue = 0;
        let pendingPayout = 0;

        const daysToSubtract =
          activePeriod === "7d" ? 6 : activePeriod === "30d" ? 29 : 89;
        const startDate = subDays(new Date(), daysToSubtract);

        const dateRange = eachDayOfInterval({
          start: startDate,
          end: new Date(),
        });

        const chartData = dateRange.map(date => {
          const dateStr = format(date, "yyyy-MM-dd");
          const dayOrders = allOrders.filter(
            (o: any) =>
              o.created_at?.startsWith(dateStr) && o.payment_status === "paid",
          );
          const dayRevenue = dayOrders.reduce(
            (sum, o: any) => sum + (parseFloat(String(o.total_amount)) || 0),
            0,
          );
          return {
            date: format(date, "MMM d"),
            revenue: dayRevenue,
            orders: dayOrders.length,
          };
        });

        allOrders.forEach((o: any) => {
          if (
            o.order_status !== "completed" &&
            o.order_status !== "cancelled"
          ) {
            activeOrdersCount++;
          }
          if (
            o.payment_status === "paid" &&
            o.created_at?.startsWith(todayStr)
          ) {
            todaySales += Number(o.total_amount || 0);
          }
          if (o.payment_status === "paid") {
            totalRevenue += Number(o.total_amount || 0);
          }
          if (
            o.payment_status === "paid" &&
            o.order_status !== "cancelled" &&
            o.order_status !== "refunded"
          ) {
            pendingPayout += Number(o.total_amount || 0);
          }
        });

        const conversion =
          shopData.total_views && shopData.total_views > 0
            ? ((allOrders.length / shopData.total_views) * 100).toFixed(1) + "%"
            : "0.0%";

        const avgOrderValue =
          allOrders.length > 0 ? totalRevenue / allOrders.length : 0;

        const productSalesMap = new Map();
        allOrders.forEach((order: any) => {
          if (order.items && Array.isArray(order.items)) {
            order.items.forEach((item: any) => {
              const productName =
                item.name || item.product_name || "Unknown Product";
              const current = productSalesMap.get(productName) || {
                sales: 0,
                revenue: 0,
              };
              productSalesMap.set(productName, {
                sales: current.sales + (item.quantity || 1),
                revenue:
                  current.revenue +
                  parseFloat(String(item.price || 0)) * (item.quantity || 1),
              });
            });
          }
        });

        const topProducts = Array.from(productSalesMap.entries())
          .sort((a, b) => b[1].revenue - a[1].revenue)
          .slice(0, 5)
          .map(([name, data]) => ({ name, ...data }));

        const recentOrders = allOrders.slice(0, 5);

        setDashboardData({
          todaySales,
          activeOrders: activeOrdersCount,
          conversion,
          walletBalance: balanceRes?.availableBalance || 0,
          totalRevenue,
          totalOrders: allOrders.length,
          avgOrderValue,
          topProducts,
          recentOrders,
          chartData,
        });
      }
    } catch (err) {
      console.error("VendorCommandCenter fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || !rbac.isEntrepreneur(user)) {
      setLoading(false);
      return;
    }
    fetchShopData();
  }, [user, activePeriod]);

  const metrics: Metric[] = useMemo(
    () => [
      {
        label: "Today's Sales",
        value: `₦${dashboardData.todaySales.toLocaleString()}`,
        change: "+12.5%",
        positive: true,
        icon: DollarSign,
        color: "text-emerald-600 dark:text-emerald-400",
      },
      {
        label: "Active Orders",
        value: dashboardData.activeOrders.toString(),
        change: "-3.2%",
        positive: true,
        icon: ShoppingCart,
        color: "text-amber-600 dark:text-amber-400",
      },
      {
        label: "Wallet Balance",
        value: `₦${dashboardData.walletBalance.toLocaleString()}`,
        change: "+8.1%",
        positive: true,
        icon: Wallet,
        color: "text-blue-600 dark:text-blue-400",
      },
      {
        label: "Store Views",
        value: (shop?.total_views || 0).toString(),
        change: "+24.3%",
        positive: true,
        icon: Eye,
        color: "text-purple-600 dark:text-purple-400",
      },
    ],
    [dashboardData, shop],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!user || !rbac.isEntrepreneur(user)) return null;

  const steps = [
    { id: 1, title: "Create Store", completed: !!shop },
    { id: 2, title: "Add Products", completed: productsCount > 0 },
    { id: 3, title: "Connect WhatsApp", completed: !!shop?.whatsapp_number },
  ];
  const completedSteps = steps.filter(s => s.completed).length;
  const progress = Math.round((completedSteps / steps.length) * 100);
  const isSetupComplete = !!shop?.is_active && progress === 100;

  const storeUrl = shop
    ? `${window.location.origin}/shop/${shop.shop_slug || shop.id}`
    : "";

  if (!isSetupComplete) {
    return (
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5 overflow-hidden">
        <div className="px-4 pt-5 pb-4 text-center border-b border-border/40">
          <div className="flex justify-end mb-2">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs px-2"
              onClick={() => setShowHelp(!showHelp)}
            >
              <HelpCircle className="w-3.5 h-3.5 mr-1" />
              {showHelp ? "Hide Help" : "Need Help?"}
            </Button>
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">
            Get started
          </p>
          <h2 className="text-lg font-extrabold tracking-tight mb-0.5">
            Set up your store in 3 steps
          </h2>
          <div className="max-w-xs mx-auto mt-3 space-y-1.5">
            <div className="flex justify-between text-[10px] text-muted-foreground font-bold">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5 bg-muted" />
          </div>
        </div>

        {showHelp && (
          <div className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-bold text-blue-800 dark:text-blue-300">
                  Quick Tips:
                </p>
                <ul className="text-[11px] text-blue-700 dark:text-blue-400 mt-1 space-y-0.5">
                  <li>• Complete steps in order for the best experience</li>
                  <li>• You can always edit your store later</li>
                  <li>• Need help? Contact support</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="divide-y divide-border/40">
          {[
            {
              num: "01",
              title: "Create your store",
              desc: "Name, location & payment details.",
              done: !!shop,
              action: () => navigate("/my-store"),
              label: shop ? "Edit Store" : "Start Setup",
            },
            {
              num: "02",
              title: "Add products",
              desc: "Upload photos & set prices.",
              done: productsCount > 0,
              action: () => navigate("/products"),
              label: "Add Products",
              disabled: !shop,
            },
            {
              num: "03",
              title: "Share your link",
              desc: "Connect WhatsApp & go live.",
              done: !!shop?.whatsapp_number,
              action: () => navigate("/my-store"),
              label: shop?.whatsapp_number ? "Done ✓" : "Connect",
              disabled: productsCount === 0,
            },
          ].map(step => (
            <div
              key={step.num}
              className={`flex items-center gap-4 px-4 py-3.5 transition-colors ${step.disabled ? "opacity-40" : "hover:bg-muted/30 cursor-pointer"}`}
              onClick={() => !step.disabled && !step.done && step.action()}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[11px] font-black border ${step.done ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400" : "bg-muted border-border text-muted-foreground"}`}
              >
                {step.done ? <CheckCircle2 className="w-4 h-4" /> : step.num}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground">
                  {step.title}
                </p>
                <p className="text-xs text-muted-foreground">{step.desc}</p>
              </div>
              {!step.done && (
                <Button
                  size="sm"
                  variant={step.disabled ? "outline" : "default"}
                  className="shrink-0 h-9 rounded-xl text-xs font-bold relative z-10"
                  onClick={e => {
                    e.stopPropagation();
                    if (!step.disabled) step.action();
                  }}
                  disabled={step.disabled}
                >
                  {step.label} <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {shop && (
          <BulkProductUpload
            open={isBulkUploadOpen}
            onClose={() => setIsBulkUploadOpen(false)}
            shopId={shop.id}
            onSuccess={() => {
              fetchShopData();
              setIsBulkUploadOpen(false);
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Business Health Score */}
      <Card className="border border-border/50 overflow-hidden shadow-sm bg-gradient-to-br from-primary/5 via-card to-accent/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Business Health Score
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-end gap-6">
            <div className="text-center">
              <div className="text-5xl font-black text-primary mb-2">78%</div>
              <Progress value={78} className="h-3 w-32" />
            </div>
            <div className="flex-1">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  { label: "Profile Completed", icon: CheckCircle2 },
                  { label: "Products Uploaded", icon: Package },
                  { label: "Verification Status", icon: ShieldCheck },
                  { label: "Store Link Shared", icon: Share2 },
                  { label: "Reviews", icon: Star },
                  { label: "Recent Activity", icon: Activity },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-2 rounded-lg bg-background/50 border border-border/30"
                  >
                    <item.icon className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-medium">{item.label}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Complete your store to 100% and increase buyer trust!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Header Card */}
      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4 border-b border-border/40 bg-muted/20">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 shadow-sm">
              <Store className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-extrabold text-base text-foreground truncate">
                  {shop.shop_name}
                </p>
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] uppercase font-black px-2 py-0.5 rounded-md">
                  Live
                </Badge>
              </div>
              <p
                className="text-xs text-muted-foreground truncate hover:text-foreground transition-colors cursor-pointer"
                onClick={() => window.open(storeUrl, "_blank")}
              >
                {storeUrl.replace(/^https?:\/\//, "")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              className="h-9 rounded-xl font-bold bg-background shadow-sm hover:shadow-md transition-all"
              onClick={() => {
                navigator.clipboard.writeText(storeUrl);
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
                toast({ title: "Copied!", description: "Store link copied" });
              }}
            >
              {isCopied ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2" />
              ) : (
                <Copy className="w-4 h-4 text-muted-foreground mr-2" />
              )}
              {isCopied ? "Copied" : "Copy Link"}
            </Button>
            <Button
              size="sm"
              className="h-9 rounded-xl font-bold bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground shadow-sm"
              onClick={() => {
                window.open(
                  `https://wa.me/?text=${encodeURIComponent("Check out my store: " + storeUrl)}`,
                  "_blank",
                );
              }}
            >
              <MessageCircle className="w-4 h-4 mr-2" /> Share
            </Button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
          {metrics.map((metric, i) => (
            <div
              key={i}
              className="px-4 sm:px-5 py-4 border-b md:border-b-0 md:border-r border-border/40 last:border-r-0"
            >
              <div className="flex items-center gap-2 mb-1">
                <metric.icon className={`w-3.5 h-3.5 ${metric.color}`} />
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                  {metric.label}
                </p>
              </div>
              <p
                className={`text-xl md:text-2xl font-black tabular-nums ${metric.color}`}
              >
                {metric.value}
              </p>
              <div className="flex items-center gap-1 mt-1">
                {metric.positive ? (
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-500" />
                )}
                <span
                  className={`text-[10px] font-medium ${metric.positive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}
                >
                  {metric.change}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visibility & Inquiry Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Visibility Metrics */}
        <Card className="border border-border/50 overflow-hidden shadow-sm">
          <CardHeader className="pb-2 border-b border-border/30">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary" />
              Visibility Metrics
            </CardTitle>
            <CardDescription className="text-xs">This Week</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-background/50 border border-border/30">
                <div className="flex items-center gap-2 mb-1">
                  <Eye className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium text-muted-foreground">
                    Store Views
                  </span>
                </div>
                <div className="text-2xl font-black">245</div>
                <div className="flex items-center gap-1 text-xs text-emerald-600">
                  <TrendingUp className="w-3 h-3" />
                  <span>+18% from last week</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-background/50 border border-border/30">
                <div className="flex items-center gap-2 mb-1">
                  <Share2 className="w-4 h-4 text-accent" />
                  <span className="text-xs font-medium text-muted-foreground">
                    Link Clicks
                  </span>
                </div>
                <div className="text-2xl font-black">189</div>
                <div className="flex items-center gap-1 text-xs text-emerald-600">
                  <TrendingUp className="w-3 h-3" />
                  <span>+12% from last week</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-background/50 border border-border/30">
                <div className="flex items-center gap-2 mb-1">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <span className="text-xs font-medium text-muted-foreground">
                    Product Views
                  </span>
                </div>
                <div className="text-2xl font-black">542</div>
                <div className="flex items-center gap-1 text-xs text-emerald-600">
                  <TrendingUp className="w-3 h-3" />
                  <span>+24% from last week</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inquiry Metrics */}
        <Card className="border border-border/50 overflow-hidden shadow-sm">
          <CardHeader className="pb-2 border-b border-border/30">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-accent" />
              Inquiry Metrics
            </CardTitle>
            <CardDescription className="text-xs">This Week</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-medium text-muted-foreground">
                    WhatsApp Clicks
                  </span>
                </div>
                <div className="text-2xl font-black">27</div>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <Phone className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-medium text-muted-foreground">
                    Contact Clicks
                  </span>
                </div>
                <div className="text-2xl font-black">14</div>
              </div>
              <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <ShoppingCart className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-medium text-muted-foreground">
                    Product Inquiries
                  </span>
                </div>
                <div className="text-2xl font-black">8</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trust Score & Marketplace Ranking */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Trust Score */}
        <Card className="border border-amber-500/20 overflow-hidden shadow-sm bg-gradient-to-br from-amber-500/5 via-card to-amber-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Trust Score
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-center mb-3">
              <Badge className="bg-amber-500/10 text-amber-700 border border-amber-500/30 mb-2">
                Gold Trusted Merchant
              </Badge>
              <div className="text-5xl font-black text-amber-600">89/100</div>
            </div>
            <div className="space-y-2">
              {[
                { label: "Verified", icon: Check },
                { label: "Reviews", icon: Star },
                { label: "Response Rate", icon: MessageCircle },
                { label: "Store Completeness", icon: Store },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <item.icon className="w-4 h-4 text-emerald-500" />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Marketplace Ranking */}
        <Card className="border border-border/50 overflow-hidden shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Marketplace Ranking
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-center py-4">
              <div className="text-5xl font-black text-primary mb-2">#7</div>
              <p className="text-sm text-muted-foreground">in Electronics</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vendor Achievements */}
      <Card className="border border-border/50 overflow-hidden shadow-sm">
        <CardHeader className="pb-2 border-b border-border/30">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Award className="w-4 h-4 text-primary" />
            Vendor Achievements
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-2">
            {[
              { title: "Verified Merchant", icon: ShieldCheck },
              { title: "First 100 Store Views", icon: Eye },
              { title: "Top Vendor of the Week", icon: Trophy },
              { title: "Trusted Seller", icon: Star },
            ].map((item, i) => (
              <Badge
                key={i}
                variant="outline"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-background/50"
              >
                <item.icon className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-xs font-medium">{item.title}</span>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column - Chart & Actions */}
        <div className="lg:col-span-2 space-y-4">
          {/* Performance Chart */}
          <Card className="border border-border/50 overflow-hidden shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/30">
              <div>
                <CardTitle className="text-sm font-bold">Performance</CardTitle>
                <CardDescription className="text-xs">
                  Sales and order trends
                </CardDescription>
              </div>
              <div className="flex items-center gap-1">
                {(["7d", "30d", "90d"] as const).map(period => (
                  <Button
                    key={period}
                    variant={activePeriod === period ? "default" : "ghost"}
                    size="sm"
                    className="h-8 text-xs font-medium rounded-lg relative z-10"
                    onClick={() => setActivePeriod(period)}
                  >
                    {period}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dashboardData.chartData}>
                    <defs>
                      <linearGradient
                        id="colorRevenue"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="hsl(var(--primary))"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="hsl(var(--primary))"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="colorOrders"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="hsl(var(--accent))"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="hsl(var(--accent))"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      tick={{
                        fontSize: 10,
                        fill: "hsl(var(--muted-foreground))",
                      }}
                      axisLine={false}
                      tickLine={false}
                      minTickGap={30}
                    />
                    <YAxis
                      tick={{
                        fontSize: 10,
                        fill: "hsl(var(--muted-foreground))",
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "0.5rem",
                        fontSize: "12px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                      isAnimationActive={false}
                    />
                    <Area
                      type="monotone"
                      dataKey="orders"
                      stroke="hsl(var(--accent))"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorOrders)"
                      isAnimationActive={false}
                    />
                    <Legend wrapperStyle={{ fontSize: "10px" }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Top Products & Recent Orders Tabs */}
          <Tabs defaultValue="products" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="products" className="text-xs font-medium">
                Top Products
              </TabsTrigger>
              <TabsTrigger value="orders" className="text-xs font-medium">
                Recent Orders
              </TabsTrigger>
            </TabsList>
            <TabsContent value="products" className="mt-2">
              <Card className="border border-border/50 overflow-hidden shadow-sm">
                <CardContent className="p-4">
                  {dashboardData.topProducts.length > 0 ? (
                    <div className="space-y-3">
                      {dashboardData.topProducts.map((product, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between py-2 border-b border-border/30 last:border-0"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-xs font-bold">
                              #{i + 1}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">
                                {product.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {product.sales} sold
                              </p>
                            </div>
                          </div>
                          <p className="text-sm font-bold">
                            ₦{product.revenue.toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">
                        No sales data yet. Start selling!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="orders" className="mt-2">
              <Card className="border border-border/50 overflow-hidden shadow-sm">
                <CardContent className="p-4">
                  {dashboardData.recentOrders.length > 0 ? (
                    <div className="space-y-3">
                      {dashboardData.recentOrders.map((order, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between py-2 border-b border-border/30 last:border-0"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">
                              Order #{order.id.substring(0, 8)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(
                                new Date(order.created_at),
                                "MMM d, h:mm a",
                              )}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold">
                              ₦{Number(order.total_amount).toLocaleString()}
                            </p>
                            <Badge
                              variant={
                                order.payment_status === "paid"
                                  ? "default"
                                  : "outline"
                              }
                              className="text-[10px] px-2 py-0.5 h-auto rounded"
                            >
                              {order.payment_status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">
                        No orders yet. Keep sharing your store!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Quick Actions & Insights */}
        <div className="space-y-4">
          {/* Revenue Metrics */}
          <Card className="border border-emerald-500/20 overflow-hidden shadow-sm bg-gradient-to-br from-emerald-500/5 via-card to-emerald-500/5">
            <CardHeader className="pb-2 border-b border-emerald-500/10">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                Revenue This Month
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-center mb-3">
                <div className="text-4xl font-black text-emerald-600">
                  ₦325,000
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2 rounded-lg bg-background/50 border border-border/30">
                  <div className="text-xl font-bold">24</div>
                  <div className="text-xs text-muted-foreground">Orders</div>
                </div>
                <div className="p-2 rounded-lg bg-background/50 border border-border/30">
                  <div className="text-xl font-bold">₦13,500</div>
                  <div className="text-xs text-muted-foreground">Avg Order</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tasks to Grow */}
          <Card className="border border-border/50 overflow-hidden shadow-sm">
            <CardHeader className="pb-2 border-b border-border/30">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                Tasks to Grow
              </CardTitle>
              <CardDescription className="text-xs">
                AI-powered recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-2">
                {[
                  "Add 5 more products",
                  "Verify your identity",
                  "Share your store link today",
                  "Respond faster",
                ].map((task, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-2 rounded-lg bg-background/50 border border-border/30"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm">{task}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Marketing Center */}
          <Card className="border border-border/50 overflow-hidden shadow-sm">
            <CardHeader className="pb-2 border-b border-border/30">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-accent" />
                Marketing Center
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-center p-3 rounded-lg bg-primary/5 border border-primary/20 mb-3">
                <div className="text-2xl font-black text-primary mb-1">3x</div>
                <p className="text-xs text-muted-foreground">
                  SteerSolo promoted your store this week
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-accent/5 border border-accent/20">
                <Users className="w-5 h-5 text-accent" />
                <div className="text-center">
                  <div className="text-xl font-bold text-accent">1,850</div>
                  <p className="text-xs text-muted-foreground">
                    Estimated reach
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border border-border/50 overflow-hidden shadow-sm">
            <CardHeader className="pb-2 border-b border-border/30">
              <CardTitle className="text-sm font-bold">Quick Actions</CardTitle>
              <CardDescription className="text-xs">
                Common tasks to manage your store
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  className="whitespace-nowrap text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm h-10 relative z-10"
                  asChild
                >
                  <Link to="/products">
                    <PackagePlus className="w-4 h-4 mr-1.5" />
                    Add Product
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="whitespace-nowrap text-xs font-bold rounded-xl shadow-sm h-10 relative z-10"
                  asChild
                >
                  <Link to="/orders">
                    <ShoppingCart className="w-4 h-4 mr-1.5" />
                    Orders
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs font-bold rounded-xl shadow-sm h-10 relative z-10"
                  onClick={() => setIsBulkUploadOpen(true)}
                >
                  <Sparkles className="w-4 h-4 mr-1.5 text-accent" />
                  AI Upload
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs font-bold rounded-xl shadow-sm h-10 relative z-10"
                  asChild
                >
                  <Link to="/my-store">
                    <Store className="w-4 h-4 mr-1.5" />
                    Store
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs font-bold rounded-xl shadow-sm h-10 relative z-10"
                  asChild
                >
                  <Link to="/marketing">
                    <Megaphone className="w-4 h-4 mr-1.5" />
                    Marketing
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs font-bold rounded-xl shadow-sm h-10 relative z-10"
                  asChild
                >
                  <Link to="/ambassador">
                    <Share2 className="w-4 h-4 mr-1.5" />
                    Referral
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Order Fulfillment Card */}
          {dashboardData.activeOrders > 0 && (
            <Card className="border border-amber-500/20 overflow-hidden shadow-sm bg-gradient-to-br from-amber-500/5 via-card to-amber-500/5 dark:from-amber-900/10 dark:via-card dark:to-amber-900/10">
              <CardHeader className="pb-2 border-b border-amber-500/10">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  Action Required
                </CardTitle>
                <CardDescription className="text-xs">
                  You have {dashboardData.activeOrders} order
                  {dashboardData.activeOrders > 1 ? "s" : ""} to fulfill
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <Button
                  size="sm"
                  className="w-full text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-sm"
                  asChild
                >
                  <Link to="/orders">
                    View Orders <ChevronRight className="w-3 h-3 ml-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {shop && (
        <BulkProductUpload
          open={isBulkUploadOpen}
          onClose={() => setIsBulkUploadOpen(false)}
          shopId={shop.id}
          onSuccess={() => {
            fetchShopData();
            setIsBulkUploadOpen(false);
          }}
        />
      )}
    </div>
  );
};
