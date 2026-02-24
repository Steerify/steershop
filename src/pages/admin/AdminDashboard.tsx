import { useEffect, useState } from "react";
import adminService from "@/services/admin.service";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Store, Package, ShoppingCart, Users, Bell, Loader2, CheckCircle,
  TrendingUp, DollarSign, Activity, Megaphone, Award, Sparkles,
  ArrowRight, Tv, GraduationCap, Gift, UserPlus, BarChart2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

// ─── Admin Stat Card ──────────────────────────────────────────────────────────
const AdminStatCard = ({
  title, value, icon: Icon, gradient, trend, subtitle
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  gradient: string;
  trend?: string;
  subtitle?: string;
}) => (
  <Card className={`relative overflow-hidden border-0 shadow-lg ${gradient}`}>
    <CardContent className="p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shadow-inner">
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <Badge className="bg-white/20 text-white border-0 text-xs font-medium">
            <TrendingUp className="w-3 h-3 mr-1" />
            {trend}
          </Badge>
        )}
      </div>
      <p className="text-4xl font-extrabold text-white mb-1">{value}</p>
      <p className="text-white/80 text-xs font-semibold uppercase tracking-wider">{title}</p>
      {subtitle && <p className="text-white/60 text-xs mt-0.5">{subtitle}</p>}
    </CardContent>
    {/* decorative blobs */}
    <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-white/10" />
    <div className="absolute top-0 -left-4 w-16 h-16 rounded-full bg-white/5" />
  </Card>
);

// ─── Admin Quick Link Card ────────────────────────────────────────────────────
const AdminQuickLink = ({
  title, description, icon: Icon, path, color, textColor
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  path: string;
  color: string;
  textColor: string;
}) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(path)}
      className="group flex items-center gap-4 p-4 bg-card rounded-2xl border border-border hover:border-primary/30 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 text-left w-full"
    >
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200`}>
        <Icon className={`w-5 h-5 ${textColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground truncate">{description}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200 shrink-0" />
    </button>
  );
};

// ─── Main Admin Dashboard ─────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { toast } = useToast();
  const [stats, setStats] = useState({ totalShops: 0, totalProducts: 0, totalOrders: 0, totalUsers: 0 });
  const [isRunningReminders, setIsRunningReminders] = useState(false);
  const [reminderResults, setReminderResults] = useState<any>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    setIsLoadingStats(true);
    try {
      const analytics = await adminService.getAnalytics();
      setStats({
        totalShops: analytics.totalShops || 0,
        totalProducts: analytics.totalProducts || 0,
        totalOrders: analytics.totalOrders || 0,
        totalUsers: analytics.totalUsers || 0,
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleRunEngagementReminders = async () => {
    setIsRunningReminders(true);
    setReminderResults(null);
    try {
      const { data, error } = await supabase.functions.invoke("engagement-reminders");
      if (error) throw error;
      const results = data?.results || data;
      setReminderResults(results);
      toast({
        title: "Engagement Reminders Complete ✅",
        description: `Incomplete reg: ${results?.incomplete_registration || 0}, No shop: ${results?.no_shop || 0}, No products: ${results?.no_products || 0}, No sales: ${results?.no_sales || 0}`,
      });
    } catch (error: any) {
      toast({ title: "Failed to run reminders", description: error.message || "Something went wrong", variant: "destructive" });
    } finally {
      setIsRunningReminders(false);
    }
  };

  const statCards = [
    { title: "Total Shops", value: stats.totalShops, icon: Store, gradient: "bg-gradient-to-br from-blue-600 to-blue-700", subtitle: "Active storefronts" },
    { title: "Total Products", value: stats.totalProducts, icon: Package, gradient: "bg-gradient-to-br from-emerald-500 to-emerald-700", subtitle: "Listed items" },
    { title: "Total Orders", value: stats.totalOrders, icon: ShoppingCart, gradient: "bg-gradient-to-br from-purple-600 to-purple-700", subtitle: "All time" },
    { title: "Total Users", value: stats.totalUsers, icon: Users, gradient: "bg-gradient-to-br from-orange-500 to-orange-600", subtitle: "Registered accounts" },
  ];

  const quickLinks = [
    { title: "Manage Shops", description: "View, approve & feature shops", icon: Store, path: "/admin/shops", color: "from-blue-500/20 to-blue-500/10", textColor: "text-blue-600" },
    { title: "Platform Orders", description: "Review all customer orders", icon: ShoppingCart, path: "/admin/orders", color: "from-purple-500/20 to-purple-500/10", textColor: "text-purple-600" },
    { title: "User Management", description: "Manage accounts & roles", icon: Users, path: "/admin/users", color: "from-orange-500/20 to-orange-500/10", textColor: "text-orange-500" },
    { title: "Ads Manager", description: "Generate AI ad copy for shops", icon: Tv, path: "/admin/ads", color: "from-pink-500/20 to-pink-500/10", textColor: "text-pink-600" },
    { title: "Featured Shops", description: "Spotlight top performers", icon: Sparkles, path: "/admin/featured-shops", color: "from-yellow-500/20 to-yellow-500/10", textColor: "text-yellow-600" },
    { title: "Platform Earnings", description: "Revenue analytics & payouts", icon: DollarSign, path: "/admin/earnings", color: "from-green-500/20 to-green-500/10", textColor: "text-green-600" },
    { title: "Marketing Hub", description: "Handle consultation requests", icon: Megaphone, path: "/admin/marketing", color: "from-red-500/20 to-red-500/10", textColor: "text-red-500" },
    { title: "Courses", description: "Manage learning content", icon: GraduationCap, path: "/admin/courses", color: "from-indigo-500/20 to-indigo-500/10", textColor: "text-indigo-600" },
    { title: "Rewards & Prizes", description: "Manage points & gifts", icon: Gift, path: "/admin/prizes", color: "from-teal-500/20 to-teal-500/10", textColor: "text-teal-600" },
    { title: "Referral Program", description: "Track ambassador referrals", icon: UserPlus, path: "/admin/referrals", color: "from-cyan-500/20 to-cyan-500/10", textColor: "text-cyan-600" },
    { title: "Top Sellers", description: "Recognize your best vendors", icon: Award, path: "/admin/top-sellers", color: "from-amber-500/20 to-amber-500/10", textColor: "text-amber-600" },
    { title: "Activity Logs", description: "Platform-wide audit trail", icon: Activity, path: "/admin/activity-logs", color: "from-slate-500/20 to-slate-500/10", textColor: "text-slate-600" },
  ];

  const reminderMetrics = reminderResults ? [
    { label: "Incomplete Registration", value: reminderResults.incomplete_registration || 0, color: "bg-blue-500/10 text-blue-700 border-blue-500/20" },
    { label: "No Shop Created", value: reminderResults.no_shop || 0, color: "bg-amber-500/10 text-amber-700 border-amber-500/20" },
    { label: "No Products", value: reminderResults.no_products || 0, color: "bg-orange-500/10 text-orange-700 border-orange-500/20" },
    { label: "No Sales (7d)", value: reminderResults.no_sales || 0, color: "bg-purple-500/10 text-purple-700 border-purple-500/20" },
  ] : [];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">Platform overview & management tools</p>
          </div>
          <Button size="sm" variant="outline" onClick={fetchStats} className="gap-1.5">
            <BarChart2 className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <AdminStatCard key={card.title} {...card} value={isLoadingStats ? "..." : card.value} />
          ))}
        </div>

        {/* Quick Links Grid */}
        <div>
          <h2 className="text-base font-bold mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Management Tools
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {quickLinks.map((link) => (
              <AdminQuickLink key={link.path} {...link} />
            ))}
          </div>
        </div>

        {/* Engagement Reminders Card */}
        <Card className="overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary" />
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Bell className="h-4 w-4 text-primary" />
                  Engagement Reminders
                </CardTitle>
                <CardDescription className="mt-1 max-w-xl">
                  Scan all users and send reminder emails for incomplete registrations, missing shops, empty stores, and inactive sellers.
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs shrink-0">Manual Trigger</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <Button
              onClick={handleRunEngagementReminders}
              disabled={isRunningReminders}
              className="w-full sm:w-auto"
            >
              {isRunningReminders ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Scanning users & sending emails...
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4 mr-2" />
                  Run Engagement Reminders Now
                </>
              )}
            </Button>

            {reminderResults && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Results</p>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {reminderMetrics.map((m) => (
                    <div key={m.label} className={`rounded-2xl border p-4 ${m.color}`}>
                      <p className="text-2xl font-extrabold mb-0.5">{m.value}</p>
                      <p className="text-xs font-medium opacity-80">{m.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {reminderResults?.errors?.length > 0 && (
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                <p className="text-sm font-semibold text-destructive mb-2">Errors ({reminderResults.errors.length})</p>
                <ul className="text-xs text-destructive/80 space-y-1">
                  {reminderResults.errors.slice(0, 5).map((err: string, i: number) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="mt-0.5 shrink-0">•</span> {err}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
