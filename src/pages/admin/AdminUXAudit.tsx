import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2, AlertTriangle, CheckCircle, Info, Brain, RefreshCw,
  Users, ThumbsUp, ThumbsDown, Star, Lightbulb, MessageSquareQuote,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

// ─── Shared route/feature data ───
const PLATFORM_ROUTES = [
  { path: "/", name: "Homepage", public: true },
  { path: "/auth/:type", name: "Auth (Login/Signup)", public: true },
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

// ─── UX Audit types ───
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

// ─── AI User Test types ───
interface JourneyStep {
  step_name: string;
  description: string;
  friction_score: number;
  quote: string;
  status: "smooth" | "minor_issue" | "major_issue" | "blocker";
}
interface FeatureRequest {
  feature: string;
  reason: string;
  priority: "must_have" | "nice_to_have" | "dream";
}
interface PersonaResult {
  persona_name: string;
  persona_role: string;
  overall_score: number;
  would_recommend: boolean;
  recommendation_quote: string;
  journey_steps: JourneyStep[];
  top_frustrations: string[];
  top_delights: string[];
  feature_requests: FeatureRequest[];
  verdict: string;
}
interface UserTestResult {
  personas: PersonaResult[];
  aggregate: {
    average_score: number;
    total_issues: number;
    total_blockers: number;
    common_frustrations: string[];
    priority_requests: FeatureRequest[];
  };
}

// ─── Helpers ───
const severityConfig = {
  critical: { color: "destructive" as const, icon: AlertTriangle, label: "Critical" },
  major: { color: "default" as const, icon: Info, label: "Major" },
  minor: { color: "secondary" as const, icon: CheckCircle, label: "Minor" },
};

const statusColors: Record<string, string> = {
  smooth: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  minor_issue: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  major_issue: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  blocker: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const frictionColor = (score: number) =>
  score <= 1 ? "text-green-600" : score <= 2 ? "text-yellow-600" : score <= 3 ? "text-orange-500" : "text-destructive";

const priorityVariant = (p: string) =>
  p === "must_have" ? "destructive" as const : p === "nice_to_have" ? "default" as const : "secondary" as const;

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────
const AdminUXAudit = () => {
  const { toast } = useToast();

  // UX Audit state
  const [auditRunning, setAuditRunning] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [filterSeverity, setFilterSeverity] = useState("all");

  // AI User Test state
  const [testRunning, setTestRunning] = useState(false);
  const [testResult, setTestResult] = useState<UserTestResult | null>(null);

  // ─── UX Audit ───
  const runAudit = async () => {
    setAuditRunning(true);
    setAuditResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("ai-ux-audit", {
        body: { routes: PLATFORM_ROUTES, features: PLATFORM_FEATURES },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setAuditResult(data);
      toast({ title: "Audit complete", description: `Found ${data.findings?.length || 0} issues` });
    } catch (err: any) {
      toast({ title: "Audit failed", description: err.message, variant: "destructive" });
    } finally {
      setAuditRunning(false);
    }
  };

  // ─── AI User Test ───
  const runUserTest = async () => {
    setTestRunning(true);
    setTestResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("ai-user-test", {
        body: { routes: PLATFORM_ROUTES, features: PLATFORM_FEATURES },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setTestResult(data);
      toast({ title: "User test complete", description: `${data.personas?.length || 0} personas tested` });
    } catch (err: any) {
      toast({ title: "User test failed", description: err.message, variant: "destructive" });
    } finally {
      setTestRunning(false);
    }
  };

  const filteredFindings = auditResult?.findings?.filter(
    (f) => filterSeverity === "all" || f.severity === filterSeverity
  ) || [];

  const criticalCount = auditResult?.findings?.filter((f) => f.severity === "critical").length || 0;
  const majorCount = auditResult?.findings?.filter((f) => f.severity === "major").length || 0;
  const minorCount = auditResult?.findings?.filter((f) => f.severity === "minor").length || 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" /> AI UX Audit & User Testing
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            AI-powered analysis of platform UX and simulated user testing
          </p>
        </div>

        <Tabs defaultValue="audit" className="space-y-6">
          <TabsList>
            <TabsTrigger value="audit" className="gap-1.5"><Brain className="w-4 h-4" /> UX Audit</TabsTrigger>
            <TabsTrigger value="user-test" className="gap-1.5"><Users className="w-4 h-4" /> AI User Test</TabsTrigger>
          </TabsList>

          {/* ═══════════ UX AUDIT TAB ═══════════ */}
          <TabsContent value="audit" className="space-y-6">
            <div className="flex justify-end">
              <Button onClick={runAudit} disabled={auditRunning} size="lg">
                {auditRunning ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</> : <><RefreshCw className="mr-2 h-4 w-4" /> Run Audit</>}
              </Button>
            </div>

            {auditRunning && (
              <Card><CardContent className="py-12 text-center space-y-4">
                <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin" />
                <p className="text-muted-foreground">AI is analyzing {PLATFORM_ROUTES.length} routes and {PLATFORM_FEATURES.length} features...</p>
              </CardContent></Card>
            )}

            {auditResult && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="md:col-span-2">
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">UX Score</CardTitle></CardHeader>
                    <CardContent>
                      <div className="flex items-end gap-2 mb-2">
                        <span className={`text-4xl font-bold ${auditResult.score >= 80 ? "text-green-500" : auditResult.score >= 60 ? "text-yellow-500" : "text-destructive"}`}>{auditResult.score}</span>
                        <span className="text-muted-foreground text-sm mb-1">/100</span>
                      </div>
                      <Progress value={auditResult.score} className="h-2" />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Issues Found</CardTitle></CardHeader>
                    <CardContent>
                      <span className="text-3xl font-bold">{auditResult.findings.length}</span>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="destructive">{criticalCount} critical</Badge>
                        <Badge>{majorCount} major</Badge>
                        <Badge variant="secondary">{minorCount} minor</Badge>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Coverage</CardTitle></CardHeader>
                    <CardContent>
                      <p className="text-sm"><span className="font-semibold">{PLATFORM_ROUTES.length}</span> routes</p>
                      <p className="text-sm"><span className="font-semibold">{PLATFORM_FEATURES.length}</span> features</p>
                    </CardContent>
                  </Card>
                </div>

                <Card><CardHeader><CardTitle>Executive Summary</CardTitle></CardHeader>
                  <CardContent><p className="text-muted-foreground whitespace-pre-wrap">{auditResult.summary}</p></CardContent>
                </Card>

                <div className="flex gap-2 flex-wrap">
                  {["all", "critical", "major", "minor"].map((s) => (
                    <Button key={s} size="sm" variant={filterSeverity === s ? "default" : "outline"} onClick={() => setFilterSeverity(s)}>
                      {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                      {s !== "all" && ` (${auditResult.findings.filter((f) => f.severity === s).length})`}
                    </Button>
                  ))}
                </div>

                <div className="space-y-3">
                  {filteredFindings.map((finding, i) => {
                    const config = severityConfig[finding.severity];
                    const Icon = config.icon;
                    return (
                      <Card key={i} className="border-l-4" style={{
                        borderLeftColor: finding.severity === "critical" ? "hsl(var(--destructive))" : finding.severity === "major" ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"
                      }}>
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2"><Icon className="w-4 h-4 shrink-0" /><CardTitle className="text-sm">{finding.title}</CardTitle></div>
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

            {!auditRunning && !auditResult && (
              <Card><CardContent className="py-16 text-center space-y-4">
                <Brain className="w-16 h-16 mx-auto text-muted-foreground/30" />
                <div>
                  <h3 className="text-lg font-semibold">Run Your First UX Audit</h3>
                  <p className="text-muted-foreground text-sm max-w-md mx-auto mt-1">
                    AI will analyze all {PLATFORM_ROUTES.length} routes and {PLATFORM_FEATURES.length} features.
                  </p>
                </div>
                <Button onClick={runAudit} size="lg"><Brain className="mr-2 h-4 w-4" /> Start AI Audit</Button>
              </CardContent></Card>
            )}
          </TabsContent>

          {/* ═══════════ AI USER TEST TAB ═══════════ */}
          <TabsContent value="user-test" className="space-y-6">
            <div className="flex justify-end">
              <Button onClick={runUserTest} disabled={testRunning} size="lg">
                {testRunning ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Testing...</> : <><Users className="mr-2 h-4 w-4" /> Run User Test</>}
              </Button>
            </div>

            {testRunning && (
              <Card><CardContent className="py-12 text-center space-y-4">
                <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin" />
                <p className="text-muted-foreground">Adaeze & Tunde are testing the platform...</p>
                <p className="text-xs text-muted-foreground">This may take 30-60 seconds</p>
              </CardContent></Card>
            )}

            {testResult && (
              <>
                {/* Aggregate overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="md:col-span-2">
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Average Score</CardTitle></CardHeader>
                    <CardContent>
                      <div className="flex items-end gap-2 mb-2">
                        <span className={`text-4xl font-bold ${testResult.aggregate.average_score >= 7 ? "text-green-500" : testResult.aggregate.average_score >= 5 ? "text-yellow-500" : "text-destructive"}`}>
                          {testResult.aggregate.average_score}
                        </span>
                        <span className="text-muted-foreground text-sm mb-1">/10</span>
                      </div>
                      <Progress value={testResult.aggregate.average_score * 10} className="h-2" />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Issues</CardTitle></CardHeader>
                    <CardContent>
                      <span className="text-3xl font-bold">{testResult.aggregate.total_issues}</span>
                      <p className="text-xs text-muted-foreground mt-1">{testResult.aggregate.total_blockers} blockers</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Must-Have Requests</CardTitle></CardHeader>
                    <CardContent>
                      <span className="text-3xl font-bold">{testResult.aggregate.priority_requests.length}</span>
                    </CardContent>
                  </Card>
                </div>

                {/* Persona cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {testResult.personas.map((persona) => (
                    <PersonaCard key={persona.persona_name} persona={persona} />
                  ))}
                </div>

                {/* Aggregate insights */}
                {testResult.aggregate.priority_requests.length > 0 && (
                  <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Lightbulb className="w-5 h-5 text-yellow-500" /> Priority Feature Requests (Must Have)</CardTitle></CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {testResult.aggregate.priority_requests.map((r, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                            <Badge variant="destructive" className="shrink-0 mt-0.5">Must Have</Badge>
                            <div>
                              <p className="text-sm font-medium">{r.feature}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{r.reason}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {!testRunning && !testResult && (
              <Card><CardContent className="py-16 text-center space-y-4">
                <Users className="w-16 h-16 mx-auto text-muted-foreground/30" />
                <div>
                  <h3 className="text-lg font-semibold">Run AI User Test</h3>
                  <p className="text-muted-foreground text-sm max-w-md mx-auto mt-1">
                    Two AI personas — Adaeze (shop owner) & Tunde (customer) — will walk through every feature and give honest, Nigerian-voice feedback.
                  </p>
                </div>
                <Button onClick={runUserTest} size="lg"><Users className="mr-2 h-4 w-4" /> Start User Test</Button>
              </CardContent></Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

// ─── Persona Card ───
const PersonaCard = ({ persona }: { persona: PersonaResult }) => {
  const [expanded, setExpanded] = useState(false);
  const visibleSteps = expanded ? persona.journey_steps : persona.journey_steps.slice(0, 5);

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{persona.persona_name}</CardTitle>
            <p className="text-xs text-muted-foreground capitalize mt-0.5">{persona.persona_role.replace("_", " ")}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold ${persona.overall_score >= 7 ? "text-green-500" : persona.overall_score >= 5 ? "text-yellow-500" : "text-destructive"}`}>
              {persona.overall_score}/10
            </span>
            <Badge variant={persona.would_recommend ? "default" : "destructive"}>
              {persona.would_recommend ? "Would Recommend" : "Would Not Recommend"}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Verdict */}
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <MessageSquareQuote className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-sm italic text-muted-foreground">{persona.verdict}</p>
          </div>
        </div>

        {/* Journey steps */}
        <div>
          <h4 className="text-sm font-semibold mb-2">Journey ({persona.journey_steps.length} steps)</h4>
          <div className="space-y-2">
            {visibleSteps.map((step, i) => (
              <div key={i} className="border rounded-lg p-3 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{step.step_name}</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-bold ${frictionColor(step.friction_score)}`}>
                      {step.friction_score}/5
                    </span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${statusColors[step.status] || ""}`}>
                      {step.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{step.description}</p>
                <p className="text-xs italic text-muted-foreground">"{step.quote}"</p>
              </div>
            ))}
          </div>
          {persona.journey_steps.length > 5 && (
            <Button variant="ghost" size="sm" className="mt-2 w-full" onClick={() => setExpanded(!expanded)}>
              {expanded ? "Show less" : `Show all ${persona.journey_steps.length} steps`}
            </Button>
          )}
        </div>

        {/* Frustrations & Delights */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <h4 className="text-sm font-semibold flex items-center gap-1 mb-1.5">
              <ThumbsDown className="w-3.5 h-3.5 text-destructive" /> Frustrations
            </h4>
            <ul className="space-y-1">
              {persona.top_frustrations.map((f, i) => (
                <li key={i} className="text-xs text-muted-foreground flex gap-1.5">
                  <span className="text-destructive shrink-0">•</span> {f}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold flex items-center gap-1 mb-1.5">
              <ThumbsUp className="w-3.5 h-3.5 text-green-500" /> Delights
            </h4>
            <ul className="space-y-1">
              {persona.top_delights.map((d, i) => (
                <li key={i} className="text-xs text-muted-foreground flex gap-1.5">
                  <span className="text-green-500 shrink-0">•</span> {d}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Feature requests */}
        <div>
          <h4 className="text-sm font-semibold flex items-center gap-1 mb-1.5">
            <Star className="w-3.5 h-3.5 text-yellow-500" /> Feature Requests
          </h4>
          <div className="space-y-1.5">
            {persona.feature_requests.map((r, i) => (
              <div key={i} className="flex items-start gap-2">
                <Badge variant={priorityVariant(r.priority)} className="text-[10px] shrink-0 mt-0.5">
                  {r.priority.replace("_", " ")}
                </Badge>
                <div>
                  <p className="text-xs font-medium">{r.feature}</p>
                  <p className="text-xs text-muted-foreground">{r.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminUXAudit;
