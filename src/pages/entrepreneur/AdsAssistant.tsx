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
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft, Copy, ExternalLink, Sparkles, Loader2, CheckCircle,
  Target, TrendingUp, DollarSign, Hash, Lightbulb, Image
} from "lucide-react";

const PLATFORMS = [
  {
    id: "google" as const,
    name: "Google Ads",
    description: "Reach people searching for your products",
    icon: "🔍",
    color: "from-blue-500/10 to-blue-600/10 border-blue-500/20",
    link: "https://ads.google.com/aw/campaigns/new",
    minBudget: "₦500/day"
  },
  {
    id: "facebook" as const,
    name: "Facebook & Instagram Ads",
    description: "Target customers on social media",
    icon: "📱",
    color: "from-indigo-500/10 to-purple-500/10 border-indigo-500/20",
    link: "https://www.facebook.com/ads/manager/creation",
    minBudget: "₦500/day"
  },
  {
    id: "tiktok" as const,
    name: "TikTok Ads",
    description: "Reach Gen-Z and young buyers",
    icon: "🎵",
    color: "from-pink-500/10 to-red-500/10 border-pink-500/20",
    link: "https://ads.tiktok.com/i18n/creation",
    minBudget: "₦1,000/day"
  },
  {
    id: "whatsapp" as const,
    name: "WhatsApp Status & Broadcast",
    description: "Free organic marketing to contacts",
    icon: "💬",
    color: "from-green-500/10 to-emerald-500/10 border-green-500/20",
    link: "",
    minBudget: "Free"
  }
];

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

  useEffect(() => {
    if (user) loadShopData();
  }, [user]);

  const loadShopData = async () => {
    if (!user) return;
    const shopRes = await shopService.getShopByOwner(user.id);
    const shops = shopRes.data;
    const shop = Array.isArray(shops) ? shops[0] : shops;
    if (shop) {
      setShopData(shop);
      const prodRes = await productService.getProducts({ shopId: shop.id });
      setProducts(prodRes.data || []);
    }
  };

  const handleGenerate = async () => {
    if (!platform || !shopData) return;

    // Check feature usage
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
    const product = products.find(p => p.id === selectedProduct);

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

  const CopyButton = ({ text, field }: { text: string; field: string }) => (
    <Button size="sm" variant="ghost" onClick={() => copyToClipboard(text, field)} className="h-7 px-2">
      {copiedField === field ? <CheckCircle className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
    </Button>
  );

  if (!shopData) {
    return (
      <PageWrapper>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Create Your Store First</h1>
          <p className="text-muted-foreground mb-6">You need a store before you can create ads.</p>
          <Button onClick={() => navigate("/onboarding")}>Create Store</Button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => step === "platform" ? navigate(-1) : setStep(step === "result" ? "details" : "platform")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" />
              Ads Assistant
            </h1>
            <p className="text-sm text-muted-foreground">AI-powered ad copy for your business</p>
          </div>
        </div>

        {/* Step 1: Platform Selection */}
        {step === "platform" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Where do you want to advertise?</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {PLATFORMS.map((p) => (
                <Card
                  key={p.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${platform?.id === p.id ? "ring-2 ring-primary" : ""} bg-gradient-to-br ${p.color}`}
                  onClick={() => setPlatform(p)}
                >
                  <CardContent className="p-5">
                    <div className="text-3xl mb-3">{p.icon}</div>
                    <h3 className="font-semibold text-foreground">{p.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{p.description}</p>
                    <Badge variant="outline" className="mt-3 text-xs">Min: {p.minBudget}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
            {platform && (
              <Button className="w-full" size="lg" onClick={() => setStep("details")}>
                Continue with {platform.name} <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
              </Button>
            )}
          </div>
        )}

        {/* Step 2: Details */}
        {step === "details" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  {platform?.icon} {platform?.name} Ad Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {products.length > 0 && (
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Select a Product (optional)</label>
                    <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a product to promote" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General store promotion</SelectItem>
                        {products.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.name} — ₦{p.price?.toLocaleString()}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium mb-1.5 block">Target Audience (optional)</label>
                  <Input
                    placeholder="e.g., Women 25-40 in Lagos who love fashion"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">Daily Budget Range (optional)</label>
                  <Input
                    placeholder="e.g., ₦2,000 - ₦5,000 per day"
                    value={budgetRange}
                    onChange={(e) => setBudgetRange(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Button className="w-full" size="lg" onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating Ad Copy...</>
              ) : (
                <><Sparkles className="w-4 h-4 mr-2" /> Generate Ad Copy</>
              )}
            </Button>
          </div>
        )}

        {/* Step 3: Results */}
        {step === "result" && result && (
          <div className="space-y-4">
            {/* Headline & Body */}
            <Card>
              <CardContent className="p-5 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Headline</label>
                    <CopyButton text={result.headline} field="headline" />
                  </div>
                  <p className="text-lg font-bold text-foreground">{result.headline}</p>
                </div>
                <Separator />
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Ad Copy</label>
                    <CopyButton text={result.bodyText} field="body" />
                  </div>
                  <p className="text-foreground whitespace-pre-wrap">{result.bodyText}</p>
                </div>
                <Separator />
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Call to Action</label>
                    <CopyButton text={result.callToAction} field="cta" />
                  </div>
                  <Badge className="text-sm">{result.callToAction}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Targeting */}
            {result.targetingSuggestions?.length > 0 && (
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-sm">Targeting Suggestions</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.targetingSuggestions.map((s, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{s}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Budget & Hashtags */}
            <div className="grid sm:grid-cols-2 gap-4">
              {result.budgetRecommendation && (
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-accent" />
                      <h3 className="font-semibold text-sm">Budget</h3>
                    </div>
                    <p className="text-sm text-foreground">{result.budgetRecommendation}</p>
                  </CardContent>
                </Card>
              )}
              {result.hashtags?.length > 0 && (
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-pink-500" />
                        <h3 className="font-semibold text-sm">Hashtags</h3>
                      </div>
                      <CopyButton text={result.hashtags.map(h => h.startsWith('#') ? h : `#${h}`).join(' ')} field="hashtags" />
                    </div>
                    <p className="text-xs text-muted-foreground">{result.hashtags.map(h => h.startsWith('#') ? h : `#${h}`).join(' ')}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Tips */}
            {result.additionalTips?.length > 0 && (
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-4 h-4 text-gold" />
                    <h3 className="font-semibold text-sm">Pro Tips</h3>
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
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Image className="w-4 h-4 text-purple-500" />
                      <h3 className="font-semibold text-sm">Image Idea</h3>
                    </div>
                    <CopyButton text={result.imagePrompt} field="image" />
                  </div>
                  <p className="text-sm text-muted-foreground">{result.imagePrompt}</p>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {platform?.link && (
                <Button className="flex-1" size="lg" onClick={() => window.open(platform.link, "_blank")}>
                  <ExternalLink className="w-4 h-4 mr-2" /> Launch on {platform.name}
                </Button>
              )}
              {platform?.id === "whatsapp" && (
                <Button className="flex-1 bg-green-600 hover:bg-green-700" size="lg" onClick={() => {
                  const text = `${result.headline}\n\n${result.bodyText}\n\n${result.callToAction}`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
                }}>
                  💬 Share on WhatsApp
                </Button>
              )}
              <Button variant="outline" className="flex-1" size="lg" onClick={() => {
                const all = `${result.headline}\n\n${result.bodyText}\n\nCTA: ${result.callToAction}${result.hashtags?.length ? `\n\n${result.hashtags.join(' ')}` : ''}`;
                copyToClipboard(all, "all");
              }}>
                <Copy className="w-4 h-4 mr-2" /> Copy All
              </Button>
            </div>

            <div className="flex gap-3">
              <Button variant="ghost" className="flex-1" onClick={() => { setResult(null); setStep("details"); }}>
                Regenerate
              </Button>
              <Button variant="ghost" className="flex-1" onClick={() => { setResult(null); setPlatform(null); setStep("platform"); }}>
                Try Another Platform
              </Button>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default AdsAssistant;
