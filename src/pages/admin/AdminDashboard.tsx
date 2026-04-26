import { useEffect, useState } from "react";
import adminService from "@/services/admin.service";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Store, Package, ShoppingCart, Users, Bell, Loader2, CheckCircle,
  TrendingUp, DollarSign, Activity, Megaphone, Award, Sparkles,
  ArrowRight, Tv, GraduationCap, Gift, UserPlus, BarChart2, Globe, MousePointerClick
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from "recharts";

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
  const [stats, setStats] = useState({
    totalShops: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    visitTotals: { today: 0, days7: 0, days30: 0 },
    topVisitPages: [] as Array<{ path: string; visits: number }>,
    visitTrend: [] as Array<{ date: string; visits: number }>,
  });
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
        visitTotals: analytics.visitTotals,
        topVisitPages: analytics.topVisitPages,
        visitTrend: analytics.visitTrend,
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const getAdminHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return {};
    return {
      Authorization: `Bearer ${session.access_token}`,
    };
  };

  const handleRunEngagementReminders = async () => {
    setIsRunningReminders(true);
    setReminderResults(null);
    try {
      const headers = await getAdminHeaders();
      const { data, error } = await supabase.functions.invoke("engagement-reminders", {
        headers,
      });
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
    { title: "Total Shops", value: stats.totalShops, icon: Store, gradient: "bg-gradient-to-br from-[hsl(215,65%,25%)] to-[hsl(215,65%,35%)]", subtitle: "Active storefronts" },
    { title: "Total Products", value: stats.totalProducts, icon: Package, gradient: "bg-gradient-to-br from-[hsl(132,68%,31%)] to-[hsl(132,68%,40%)]", subtitle: "Listed items" },
    { title: "Total Orders", value: stats.totalOrders, icon: ShoppingCart, gradient: "bg-gradient-to-br from-[hsl(215,65%,25%)] to-[hsl(132,68%,31%)]", subtitle: "All time" },
    { title: "Total Users", value: stats.totalUsers, icon: Users, gradient: "bg-gradient-to-br from-[hsl(215,65%,18%)] to-[hsl(215,65%,28%)]", subtitle: "Registered accounts" },
  ];

  const visitCards = [
    { title: "Visits Today", value: stats.visitTotals.today, icon: MousePointerClick, gradient: "bg-gradient-to-br from-[hsl(215,65%,30%)] to-[hsl(215,65%,42%)]", subtitle: "Last 24h" },
    { title: "Visits (7d)", value: stats.visitTotals.days7, icon: Globe, gradient: "bg-gradient-to-br from-[hsl(132,68%,28%)] to-[hsl(132,68%,38%)]", subtitle: "Rolling week" },
    { title: "Visits (30d)", value: stats.visitTotals.days30, icon: TrendingUp, gradient: "bg-gradient-to-br from-[hsl(215,55%,22%)] to-[hsl(132,60%,30%)]", subtitle: "Rolling month" },
  ];

  const quickLinks = [
    { title: "Manage Shops", description: "View, approve & feature shops", icon: Store, path: "/admin/shops", color: "from-primary/20 to-primary/10", textColor: "text-primary" },
    { title: "Platform Orders", description: "Review all customer orders", icon: ShoppingCart, path: "/admin/orders", color: "from-primary/15 to-primary/8", textColor: "text-primary" },
    { title: "User Management", description: "Manage accounts & roles", icon: Users, path: "/admin/users", color: "from-accent/20 to-accent/10", textColor: "text-accent" },
    { title: "Ads Manager", description: "Generate AI ad copy for shops", icon: Tv, path: "/admin/ads", color: "from-primary/20 to-accent/10", textColor: "text-primary" },
    { title: "Featured Shops", description: "Spotlight top performers", icon: Sparkles, path: "/admin/featured-shops", color: "from-gold/20 to-gold/10", textColor: "text-[hsl(42,90%,40%)]" },
    { title: "Platform Earnings", description: "Revenue analytics & payouts", icon: DollarSign, path: "/admin/earnings", color: "from-accent/20 to-accent/10", textColor: "text-accent" },
    { title: "Marketing Hub", description: "Handle consultation requests", icon: Megaphone, path: "/admin/marketing", color: "from-primary/20 to-primary/10", textColor: "text-primary" },
    { title: "Courses", description: "Manage learning content", icon: GraduationCap, path: "/admin/courses", color: "from-accent/15 to-accent/8", textColor: "text-accent" },
    { title: "Rewards & Prizes", description: "Manage points & gifts", icon: Gift, path: "/admin/prizes", color: "from-gold/20 to-gold/10", textColor: "text-[hsl(42,90%,40%)]" },
    { title: "Referral Program", description: "Track ambassador referrals", icon: UserPlus, path: "/admin/referrals", color: "from-primary/15 to-accent/10", textColor: "text-primary" },
    { title: "Top Sellers", description: "Recognize your best vendors", icon: Award, path: "/admin/top-sellers", color: "from-gold/20 to-gold/10", textColor: "text-[hsl(42,90%,40%)]" },
    { title: "Activity Logs", description: "Platform-wide audit trail", icon: Activity, path: "/admin/activity-logs", color: "from-primary/10 to-primary/5", textColor: "text-primary" },
  ];

  const reminderMetrics = reminderResults ? [
    { label: "Incomplete Registration", value: reminderResults.incomplete_registration || 0, color: "bg-primary/10 text-primary border-primary/20" },
    { label: "No Shop Created", value: reminderResults.no_shop || 0, color: "bg-[hsl(42,90%,55%)]/10 text-[hsl(42,80%,35%)] border-[hsl(42,90%,55%)]/20" },
    { label: "No Products", value: reminderResults.no_products || 0, color: "bg-accent/10 text-accent border-accent/20" },
    { label: "No Sales (7d)", value: reminderResults.no_sales || 0, color: "bg-primary/15 text-primary border-primary/25" },
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

        <div>
          <h2 className="text-base font-bold mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            Website Visit Analytics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {visitCards.map((card) => (
              <AdminStatCard key={card.title} {...card} value={isLoadingStats ? "..." : card.value} />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Daily Visit Trend (30 days)</CardTitle>
                <CardDescription>Route-level page visits across the last 30 days.</CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.visitTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(value) => value.slice(5)} />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="visits" stroke="#16a34a" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top Pages (30 days)</CardTitle>
                <CardDescription>Most visited routes on the site.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {stats.topVisitPages.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No visit data yet.</p>
                ) : (
                  <>
                    <div className="h-44">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.topVisitPages.slice(0, 5)} layout="vertical" margin={{ left: 8, right: 8 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis type="category" width={120} dataKey="path" tickFormatter={(v) => v.length > 18 ? `${v.slice(0, 18)}…` : v} />
                          <Tooltip />
                          <Bar dataKey="visits" fill="#6366f1" radius={[4, 4, 4, 4]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-2">
                      {stats.topVisitPages.slice(0, 5).map((page) => (
                        <div key={page.path} className="flex items-center justify-between text-sm">
                          <span className="truncate max-w-[75%] text-muted-foreground">{page.path}</span>
                          <Badge variant="outline">{page.visits}</Badge>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
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
