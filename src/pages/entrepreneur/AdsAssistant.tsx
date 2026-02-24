import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import shopService from "@/services/shop.service";
import productService from "@/services/product.service";
import { adsService, AdCopyResult } from "@/services/ads.service";
import { useFeatureUsage } from "@/hooks/useFeatureUsage";
import { useToast } from "@/hooks/use-toast";
import { PageWrapper } from "@/components/PageWrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft, Copy, ExternalLink, Sparkles, Loader2, CheckCircle,
  Target, TrendingUp, DollarSign, Hash, Lightbulb, Image,
  ChevronRight, Zap, Share2, MessageCircle
} from "lucide-react";

// ─── Platform Data ────────────────────────────────────────────────────────────
const PLATFORMS = [
  {
    id: "google" as const,
    name: "Google Ads",
    tagline: "Reach people actively searching",
    icon: "🔍",
    gradient: "from-blue-500 to-blue-600",
    softBg: "from-blue-50/80 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20",
    border: "border-blue-500/20",
    textAccent: "text-blue-600",
    link: "https://ads.google.com/aw/campaigns/new",
    minBudget: "₦500/day",
  },
  {
    id: "facebook" as const,
    name: "Facebook & Instagram",
    tagline: "Target social-savvy buyers",
    icon: "📱",
    gradient: "from-indigo-500 to-purple-600",
    softBg: "from-indigo-50/80 to-purple-100/50 dark:from-indigo-950/30 dark:to-purple-900/20",
    border: "border-indigo-500/20",
    textAccent: "text-indigo-600",
    link: "https://www.facebook.com/ads/manager/creation",
    minBudget: "₦500/day",
  },
  {
    id: "tiktok" as const,
    name: "TikTok Ads",
    tagline: "Reach Gen-Z and young buyers",
    icon: "🎵",
    gradient: "from-pink-500 to-red-500",
    softBg: "from-pink-50/80 to-red-100/50 dark:from-pink-950/30 dark:to-red-900/20",
    border: "border-pink-500/20",
    textAccent: "text-pink-600",
    link: "https://ads.tiktok.com/i18n/creation",
    minBudget: "₦1,000/day",
  },
  {
    id: "whatsapp" as const,
    name: "WhatsApp",
    tagline: "Free organic to your contacts",
    icon: "💬",
    gradient: "from-green-500 to-emerald-600",
    softBg: "from-green-50/80 to-emerald-100/50 dark:from-green-950/30 dark:to-emerald-900/20",
    border: "border-green-500/20",
    textAccent: "text-green-600",
    link: "",
    minBudget: "Free",
  },
];

// ─── Step Indicator ───────────────────────────────────────────────────────────
const StepBar = ({ current }: { current: "platform" | "details" | "result" }) => {
  const steps = [
    { key: "platform", label: "Platform" },
    { key: "details", label: "Details" },
    { key: "result", label: "Ad Copy" },
  ];
  const idx = steps.findIndex((s) => s.key === current);

  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((step, i) => {
        const done = i < idx;
        const active = i === idx;
        return (
          <div key={step.key} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  done
                    ? "bg-primary text-white shadow-md shadow-primary/30"
                    : active
                    ? "bg-primary/20 text-primary ring-2 ring-primary/40"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {done ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-[10px] font-semibold ${active ? "text-primary" : done ? "text-foreground" : "text-muted-foreground"}`}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 flex-1 mb-4 transition-all duration-300 ${done ? "bg-primary" : "bg-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

// ─── Copy Button ──────────────────────────────────────────────────────────────
const CopyBtn = ({
  text,
  field,
  copiedField,
  onCopy,
}: {
  text: string;
  field: string;
  copiedField: string | null;
  onCopy: (text: string, field: string) => void;
}) => (
  <button
    onClick={() => onCopy(text, field)}
    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all duration-150 ${
      copiedField === field
        ? "bg-green-500/10 text-green-600"
        : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
    }`}
  >
    {copiedField === field ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
    {copiedField === field ? "Copied!" : "Copy"}
  </button>
);

// ─── Ad Preview Card (result step) ───────────────────────────────────────────
const AdPreviewBlock = ({
  label,
  value,
  field,
  large,
  copiedField,
  onCopy,
}: {
  label: string;
  value: string;
  field: string;
  large?: boolean;
  copiedField: string | null;
  onCopy: (text: string, field: string) => void;
}) => (
  <div className="bg-muted/40 rounded-2xl p-4 border border-border/60">
    <div className="flex items-center justify-between mb-2">
      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
      <CopyBtn text={value} field={field} copiedField={copiedField} onCopy={onCopy} />
    </div>
    <p className={`text-foreground whitespace-pre-wrap ${large ? "text-sm leading-relaxed" : "font-bold text-base"}`}>{value}</p>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const AdsAssistant = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { checkFeatureUsage, incrementUsage } = useFeatureUsage();

  const [step, setStep] = useState<"platform" | "details" | "result">("platform");
  const [platform, setPlatform] = useState<typeof PLATFORMS[0] | null>(null);
  const [shopData, setShopData] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [targetAudience, setTargetAudience] = useState("");
  const [budgetRange, setBudgetRange] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<AdCopyResult | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) loadShopData();
  }, [user]);

  const loadShopData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const shopRes = await shopService.getShopByOwner(user.id);
      const shops = shopRes.data;
      const shop = Array.isArray(shops) ? shops[0] : shops;
      if (shop) {
        setShopData(shop);
        const prodRes = await productService.getProducts({ shopId: shop.id });
        setProducts(prodRes.data || []);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!platform || !shopData) return;

    const usage = await checkFeatureUsage("ads_assistant");
    if (usage && !usage.can_use) {
      if (usage.blocked_by_plan) {
        toast({ title: "Upgrade Required", description: "Ads Assistant is available on Pro and Business plans.", variant: "destructive" });
      } else {
        toast({ title: "Usage Limit Reached", description: `You've used ${usage.current_usage}/${usage.max_usage} generations this month.`, variant: "destructive" });
      }
      return;
    }

    setIsGenerating(true);
    const product = products.find((p) => p.id === selectedProduct);

    const res = await adsService.generateAdCopy({
      shopName: shopData.shop_name || shopData.name,
      shopDescription: shopData.description,
      productName: product?.name,
      productDescription: product?.description,
      productPrice: product?.price,
      platform: platform.id,
      targetAudience: targetAudience || undefined,
      budgetRange: budgetRange || undefined,
    });

    if (res.success && res.data) {
      setResult(res.data);
      setStep("result");
      await incrementUsage("ads_assistant");
    } else {
      toast({ title: "Generation Failed", description: res.error || "Please try again.", variant: "destructive" });
    }
    setIsGenerating(false);
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast({ title: "Copied!" });
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleBack = () => {
    if (step === "platform") navigate(-1);
    else if (step === "details") setStep("platform");
    else setStep("details");
  };

  // Loading state
  if (isLoading) {
    return (
      <PageWrapper>
        <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent animate-pulse mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Loading your store...</p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  // No shop guard
  if (!shopData) {
    return (
      <PageWrapper>
        <div className="container mx-auto px-4 py-16 max-w-md text-center">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Create Your Store First</h1>
          <p className="text-muted-foreground mb-6 text-sm">You need a store before you can create ads. It only takes 2 minutes!</p>
          <Button onClick={() => navigate("/onboarding")} size="lg" className="rounded-2xl">
            Create My Store →
          </Button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-6 max-w-2xl">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={handleBack} className="rounded-2xl h-9 w-9 shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-extrabold flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Ads Assistant
            </h1>
            <p className="text-xs text-muted-foreground">AI-powered ad copy for {shopData.shop_name || shopData.name}</p>
          </div>
        </div>

        {/* Step Bar */}
        <StepBar current={step} />

        {/* ─── STEP 1: Platform Selection ─────────────────── */}
        {step === "platform" && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center mb-6">
              <h2 className="text-lg font-bold mb-1">Where do you want to advertise?</h2>
              <p className="text-sm text-muted-foreground">Choose a platform and we'll craft the perfect copy.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PLATFORMS.map((p) => {
                const selected = platform?.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setPlatform(p)}
                    className={`relative group text-left rounded-3xl border-2 overflow-hidden transition-all duration-200 ${
                      selected
                        ? `border-primary shadow-lg shadow-primary/20 scale-[1.02]`
                        : `${p.border} hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5`
                    } bg-gradient-to-br ${p.softBg}`}
                  >
                    {selected && (
                      <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-md">
                        <CheckCircle className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${p.softBg}`} />
                    <div className="relative p-5">
                      {/* Platform icon with branded gradient circle */}
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${p.gradient} flex items-center justify-center text-2xl shadow-md mb-3`}>
                        {p.icon}
                      </div>
                      <h3 className="font-bold text-foreground text-sm mb-0.5">{p.name}</h3>
                      <p className="text-xs text-muted-foreground mb-3">{p.tagline}</p>
                      <Badge className={`bg-white/60 dark:bg-black/20 ${p.textAccent} border-0 text-xs font-semibold px-2 py-0.5`}>
                        Min: {p.minBudget}
                      </Badge>
                    </div>
                  </button>
                );
              })}
            </div>

            <Button
              className="w-full h-12 rounded-2xl text-sm font-bold mt-2"
              disabled={!platform}
              onClick={() => setStep("details")}
            >
              Continue with {platform?.name || "a platform"}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}

        {/* ─── STEP 2: Details ─────────────────────────────── */}
        {step === "details" && platform && (
          <div className="space-y-5 animate-fade-in">
            {/* Selected platform pill */}
            <div className={`flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-br ${platform.softBg} border ${platform.border}`}>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${platform.gradient} flex items-center justify-center text-xl shadow-sm`}>
                {platform.icon}
              </div>
              <div>
                <p className="font-bold text-sm">{platform.name}</p>
                <p className="text-xs text-muted-foreground">{platform.tagline}</p>
              </div>
              <button
                className="ml-auto text-xs text-muted-foreground underline underline-offset-2"
                onClick={() => setStep("platform")}
              >
                Change
              </button>
            </div>

            <Card className="rounded-3xl border-border/60 overflow-hidden">
              <div className={`h-1 bg-gradient-to-r ${platform.gradient}`} />
              <CardContent className="p-5 space-y-4">

                {products.length > 0 && (
                  <div>
                    <label className="text-xs font-bold text-foreground mb-1.5 block uppercase tracking-wider">
                      Promote a specific product? <span className="text-muted-foreground font-normal">(optional)</span>
                    </label>
                    <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="General store promotion" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">🏪 General store promotion</SelectItem>
                        {products.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            📦 {p.name} — ₦{p.price?.toLocaleString()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-foreground mb-1.5 block uppercase tracking-wider">
                    Target Audience <span className="text-muted-foreground font-normal">(optional)</span>
                  </label>
                  <Input
                    className="rounded-xl"
                    placeholder="e.g., Women 25-40 in Lagos who love fashion"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground mb-1.5 block uppercase tracking-wider">
                    Daily Budget Range <span className="text-muted-foreground font-normal">(optional)</span>
                  </label>
                  <Input
                    className="rounded-xl"
                    placeholder={`e.g., ${platform.minBudget} - ₦10,000`}
                    value={budgetRange}
                    onChange={(e) => setBudgetRange(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Button
              className="w-full h-12 rounded-2xl text-sm font-bold"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating your ad copy...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Ad Copy with AI
                </>
              )}
            </Button>
          </div>
        )}

        {/* ─── STEP 3: Results ─────────────────────────────── */}
        {step === "result" && result && platform && (
          <div className="space-y-4 animate-fade-in">
            {/* Platform badge */}
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${platform.softBg} border ${platform.border}`}>
              <span className="text-base">{platform.icon}</span>
              <span className={`text-xs font-bold ${platform.textAccent}`}>{platform.name} Ad Copy</span>
              <Badge className="bg-green-500/10 text-green-600 border-0 text-xs ml-1">Ready</Badge>
            </div>

            {/* Main ad content */}
            <Card className="rounded-3xl overflow-hidden border-border/60">
              <div className={`h-1 bg-gradient-to-r ${platform.gradient}`} />
              <CardContent className="p-5 space-y-3">
                <AdPreviewBlock label="Headline" value={result.headline} field="headline" copiedField={copiedField} onCopy={copyToClipboard} />
                <AdPreviewBlock label="Ad Copy" value={result.bodyText} field="body" large copiedField={copiedField} onCopy={copyToClipboard} />
                <div className="flex items-center justify-between bg-muted/40 rounded-2xl px-4 py-3 border border-border/60">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Call to Action</p>
                    <Badge className={`text-sm font-bold bg-gradient-to-r ${platform.gradient} text-white border-0`}>{result.callToAction}</Badge>
                  </div>
                  <CopyBtn text={result.callToAction} field="cta" copiedField={copiedField} onCopy={copyToClipboard} />
                </div>
              </CardContent>
            </Card>

            {/* Hashtags */}
            {result.hashtags?.length > 0 && (
              <Card className="rounded-3xl border-border/60">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-pink-500" />
                      <span className="text-xs font-bold uppercase tracking-wider">Hashtags</span>
                    </div>
                    <CopyBtn
                      text={result.hashtags.map((h) => (h.startsWith("#") ? h : `#${h}`)).join(" ")}
                      field="hashtags"
                      copiedField={copiedField}
                      onCopy={copyToClipboard}
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {result.hashtags.map((tag, i) => (
                      <span key={i} className="px-2.5 py-1 bg-pink-500/10 text-pink-600 rounded-full text-xs font-medium">
                        {tag.startsWith("#") ? tag : `#${tag}`}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Budget & Targeting */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {result.budgetRecommendation && (
                <Card className="rounded-3xl border-border/60">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="text-xs font-bold uppercase tracking-wider">Budget Tip</span>
                    </div>
                    <p className="text-sm text-foreground">{result.budgetRecommendation}</p>
                  </CardContent>
                </Card>
              )}
              {result.targetingSuggestions?.length > 0 && (
                <Card className="rounded-3xl border-border/60">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-primary" />
                      <span className="text-xs font-bold uppercase tracking-wider">Targeting</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {result.targetingSuggestions.slice(0, 4).map((s, i) => (
                        <span key={i} className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-[10px] font-medium">{s}</span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Pro Tips */}
            {result.additionalTips?.length > 0 && (
              <Card className="rounded-3xl border-border/60">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-4 h-4 text-yellow-500" />
                    <span className="text-xs font-bold uppercase tracking-wider">Pro Tips</span>
                  </div>
                  <ul className="space-y-2">
                    {result.additionalTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-3.5 h-3.5 text-accent mt-0.5 shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Image Prompt */}
            {result.imagePrompt && (
              <Card className="rounded-3xl border-border/60 bg-purple-500/5">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Image className="w-4 h-4 text-purple-500" />
                      <span className="text-xs font-bold uppercase tracking-wider">Image Idea</span>
                    </div>
                    <CopyBtn text={result.imagePrompt} field="image" copiedField={copiedField} onCopy={copyToClipboard} />
                  </div>
                  <p className="text-sm text-muted-foreground italic">{result.imagePrompt}</p>
                </CardContent>
              </Card>
            )}

            {/* Variations */}
            {result.variations && result.variations.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Alternate Versions</p>
                <div className="space-y-3">
                  {result.variations.map((v, i) => (
                    <Card key={i} className="rounded-2xl border-border/60">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-xs">Version {i + 1}</Badge>
                          <CopyBtn text={`${v.headline}\n\n${v.bodyText}`} field={`var-${i}`} copiedField={copiedField} onCopy={copyToClipboard} />
                        </div>
                        <p className="font-bold text-sm mb-1">{v.headline}</p>
                        <p className="text-sm text-muted-foreground">{v.bodyText}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Sticky CTA Bar */}
            <div className="sticky bottom-6 mt-6">
              <div className="bg-card/95 backdrop-blur-xl border border-border/60 rounded-3xl p-4 shadow-2xl space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  {platform.id === "whatsapp" ? (
                    <Button
                      className="rounded-2xl bg-green-600 hover:bg-green-700 text-white font-bold gap-1.5"
                      onClick={() => {
                        const text = `${result.headline}\n\n${result.bodyText}\n\n${result.callToAction}`;
                        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
                      }}
                    >
                      <MessageCircle className="w-4 h-4" />
                      Share on WhatsApp
                    </Button>
                  ) : platform.link ? (
                    <Button
                      className="rounded-2xl gap-1.5 font-bold"
                      onClick={() => window.open(platform.link, "_blank")}
                    >
                      <ExternalLink className="w-4 h-4" />
                      Launch on {platform.name.split(" ")[0]}
                    </Button>
                  ) : null}

                  <Button
                    variant="outline"
                    className="rounded-2xl gap-1.5 font-bold"
                    onClick={() => {
                      const all = `${result.headline}\n\n${result.bodyText}\n\nCTA: ${result.callToAction}${result.hashtags?.length ? `\n\n${result.hashtags.join(" ")}` : ""}`;
                      copyToClipboard(all, "all");
                    }}
                  >
                    {copiedField === "all" ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    Copy All
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-2xl text-xs"
                    onClick={() => { setResult(null); setStep("details"); }}
                  >
                    Regenerate
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-2xl text-xs"
                    onClick={() => { setResult(null); setPlatform(null); setStep("platform"); }}
                  >
                    Try Another Platform
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default AdsAssistant;
