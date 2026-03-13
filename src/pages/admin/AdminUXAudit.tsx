import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertTriangle, CheckCircle, Info, Brain, RefreshCw } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Finding {
  severity: "critical" | "major" | "minor";
  category: string;
  route: string;
  title: string;
  description: string;
  recommendation: string;
}

interface AuditResult {
  summary: string;
  score: number;
  findings: Finding[];
}

// Complete route and feature map for the platform
const PLATFORM_ROUTES = [
  { path: "/", name: "Homepage", public: true },
  { path: "/auth/:type", name: "Auth (Login/Signup)", public: true },
  { path: "/auth (no param)", name: "Auth fallback", public: true },
  { path: "/shops", name: "Browse Shops", public: true },
  { path: "/shop/:slug", name: "Shop Storefront", public: true },
  { path: "/shop/:slug/product/:id", name: "Product Details", public: true },
  { path: "/pricing", name: "Pricing Page", public: true },
  { path: "/demo", name: "Demo Storefront", public: true },
  { path: "/select-role", name: "Role Selection (post-signup)", public: true },
  { path: "/onboarding", name: "Entrepreneur Onboarding", role: "shop_owner" },
  { path: "/dashboard", name: "Seller Dashboard", role: "shop_owner" },
  { path: "/my-store", name: "My Store Settings", role: "shop_owner" },
  { path: "/products", name: "Product Management", role: "shop_owner" },
  { path: "/orders", name: "Order Management", role: "shop_owner" },
  { path: "/bookings", name: "Bookings", role: "shop_owner" },
  { path: "/customers", name: "Customer List", role: "shop_owner" },
  { path: "/marketing", name: "Marketing Tools", role: "shop_owner" },
  { path: "/marketing/editor/:id?", name: "Poster Editor", role: "shop_owner" },
  { path: "/marketing-services", name: "Marketing Services", role: "shop_owner" },
  { path: "/ads-assistant", name: "AI Ads Assistant", role: "shop_owner" },
  { path: "/courses", name: "Seller Courses", role: "shop_owner" },
  { path: "/subscription", name: "Subscription Management", role: "shop_owner" },
  { path: "/identity-verification", name: "KYC Verification", role: "shop_owner" },
  { path: "/settings", name: "Account Settings", role: "shop_owner,customer" },
  { path: "/customer_dashboard", name: "Customer Dashboard", role: "customer" },
  { path: "/customer/orders", name: "Customer Orders", role: "customer" },
  { path: "/customer/courses", name: "Customer Courses", role: "customer" },
  { path: "/customer/rewards", name: "Customer Rewards", role: "customer" },
  { path: "/customer/wishlist", name: "Customer Wishlist", role: "customer" },
  { path: "/ambassador", name: "Ambassador Program", role: "shop_owner,customer" },
  { path: "/admin", name: "Admin Dashboard", role: "admin" },
];

const PLATFORM_FEATURES = [
  "Email/password signup with email verification",
  "Google OAuth sign-in with role selection for new users",
  "Entrepreneur onboarding questionnaire (7 steps)",
  "Shop creation during onboarding",
  "Product CRUD with image/video upload",
  "Bulk product upload via AI",
  "AI product description generation",
  "Order management with status timeline",
  "Paystack payment integration (NGN only)",
  "Delivery booking via Terminal Africa",
  "Manual delivery tracking",
  "WhatsApp order sharing",
  "Coupon/discount management",
  "Dynamic pricing",
  "Customer wishlist",
  "Product reviews and ratings",
  "Subscription plans (Free/Starter/Growth/Pro)",
  "Marketing poster editor",
  "AI ad copy generation",
  "Google Business Profile setup assistance",
  "Referral program with points",
  "Ambassador tier system",
  "Badge/achievement system",
  "Seller courses and tutorials",
  "Customer rewards/points system",
  "Profile completion checklist",
  "Structured 30-day selling challenge",
  "Daily seller routine prompts",
  "Session expiry handling",
  "Inactivity timeout",
  "Platform review popup",
  "Feature discovery popups",
  "Done-for-you shop setup service",
  "SEO landing pages (6 pages)",
  "Store flyer template generation",
  "Storefront customization (colors, banners)",
  "Shop reactions (like/love)",
  "Featured shops system",
  "Top seller rankings",
  "Platform feedback collection",
  "Admin: user/shop/order management",
  "Admin: course/prize management",
  "Admin: platform earnings tracking",
  "Admin: activity logs",
];

const severityConfig = {
  critical: { color: "destructive" as const, icon: AlertTriangle, label: "Critical" },
  major: { color: "default" as const, icon: Info, label: "Major" },
  minor: { color: "secondary" as const, icon: CheckCircle, label: "Minor" },
};

const AdminUXAudit = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const { toast } = useToast();

  const runAudit = async () => {
    setIsRunning(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("ai-ux-audit", {
        body: { routes: PLATFORM_ROUTES, features: PLATFORM_FEATURES },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setResult(data);
      toast({ title: "Audit complete", description: `Found ${data.findings?.length || 0} issues` });
    } catch (err: any) {
      toast({
        title: "Audit failed",
        description: err.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const filtered = result?.findings?.filter(
    (f) => filterSeverity === "all" || f.severity === filterSeverity
  ) || [];

  const criticalCount = result?.findings?.filter((f) => f.severity === "critical").length || 0;
  const majorCount = result?.findings?.filter((f) => f.severity === "major").length || 0;
  const minorCount = result?.findings?.filter((f) => f.severity === "minor").length || 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Brain className="w-6 h-6 text-primary" />
              AI UX Audit
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              AI-powered analysis of all routes and features for UX issues
            </p>
          </div>
          <Button onClick={runAudit} disabled={isRunning} size="lg">
            {isRunning ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
            ) : (
              <><RefreshCw className="mr-2 h-4 w-4" /> Run Audit</>
            )}
          </Button>
        </div>

        {isRunning && (
          <Card>
            <CardContent className="py-12 text-center space-y-4">
              <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin" />
              <p className="text-muted-foreground">AI is analyzing {PLATFORM_ROUTES.length} routes and {PLATFORM_FEATURES.length} features...</p>
              <p className="text-xs text-muted-foreground">This may take 15-30 seconds</p>
            </CardContent>
          </Card>
        )}

        {result && (
          <>
            {/* Score Card */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">UX Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-2 mb-2">
                    <span className={`text-4xl font-bold ${
                      result.score >= 80 ? "text-green-500" : result.score >= 60 ? "text-yellow-500" : "text-destructive"
                    }`}>{result.score}</span>
                    <span className="text-muted-foreground text-sm mb-1">/100</span>
                  </div>
                  <Progress value={result.score} className="h-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Issues Found</CardTitle>
                </CardHeader>
                <CardContent>
                  <span className="text-3xl font-bold">{result.findings.length}</span>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="destructive">{criticalCount} critical</Badge>
                    <Badge>{majorCount} major</Badge>
                    <Badge variant="secondary">{minorCount} minor</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Coverage</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm"><span className="font-semibold">{PLATFORM_ROUTES.length}</span> routes</p>
                  <p className="text-sm"><span className="font-semibold">{PLATFORM_FEATURES.length}</span> features</p>
                </CardContent>
              </Card>
            </div>

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Executive Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{result.summary}</p>
              </CardContent>
            </Card>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
              {["all", "critical", "major", "minor"].map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={filterSeverity === s ? "default" : "outline"}
                  onClick={() => setFilterSeverity(s)}
                >
                  {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                  {s !== "all" && ` (${result.findings.filter((f) => f.severity === s).length})`}
                </Button>
              ))}
            </div>

            {/* Findings */}
            <div className="space-y-3">
              {filtered.map((finding, i) => {
                const config = severityConfig[finding.severity];
                const Icon = config.icon;
                return (
                  <Card key={i} className="border-l-4" style={{
                    borderLeftColor: finding.severity === "critical" ? "hsl(var(--destructive))" :
                      finding.severity === "major" ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"
                  }}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 shrink-0" />
                          <CardTitle className="text-sm">{finding.title}</CardTitle>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <Badge variant={config.color}>{config.label}</Badge>
                          <Badge variant="outline">{finding.category}</Badge>
                          <Badge variant="outline" className="font-mono text-xs">{finding.route}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm text-muted-foreground">{finding.description}</p>
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-sm font-medium">💡 Recommendation</p>
                        <p className="text-sm text-muted-foreground">{finding.recommendation}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}

        {!isRunning && !result && (
          <Card>
            <CardContent className="py-16 text-center space-y-4">
              <Brain className="w-16 h-16 mx-auto text-muted-foreground/30" />
              <div>
                <h3 className="text-lg font-semibold">Run Your First UX Audit</h3>
                <p className="text-muted-foreground text-sm max-w-md mx-auto mt-1">
                  AI will analyze all {PLATFORM_ROUTES.length} routes and {PLATFORM_FEATURES.length} features, 
                  checking for usability issues, broken flows, and adoption blockers.
                </p>
              </div>
              <Button onClick={runAudit} size="lg">
                <Brain className="mr-2 h-4 w-4" /> Start AI Audit
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUXAudit;
