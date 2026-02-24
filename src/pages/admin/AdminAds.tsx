import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { adsService, AdCopyResult } from "@/services/ads.service";
import {
  Loader2, Sparkles, Copy, ExternalLink, Check,
  MessageSquare, Facebook, Globe, Video, Zap, Target,
  DollarSign, Hash, Lightbulb, Image, CheckCircle, ChevronRight,
} from "lucide-react";

// ─── Platform Config ──────────────────────────────────────────────────────────
type Platform = "google" | "facebook" | "tiktok" | "whatsapp";

const platformConfig: Record<Platform, {
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
  emoji: string;
  gradient: string;
  softBg: string;
  border: string;
  textColor: string;
}> = {
  whatsapp: {
    label: "WhatsApp",
    shortLabel: "WhatsApp",
    emoji: "💬",
    icon: <MessageSquare className="w-4 h-4" />,
    gradient: "from-green-500 to-emerald-600",
    softBg: "from-green-500/10 to-emerald-500/5",
    border: "border-green-500/30",
    textColor: "text-green-600",
  },
  facebook: {
    label: "Facebook / Instagram",
    shortLabel: "Facebook",
    emoji: "📱",
    icon: <Facebook className="w-4 h-4" />,
    gradient: "from-indigo-500 to-purple-600",
    softBg: "from-indigo-500/10 to-purple-500/5",
    border: "border-indigo-500/30",
    textColor: "text-indigo-600",
  },
  tiktok: {
    label: "TikTok",
    shortLabel: "TikTok",
    emoji: "🎵",
    icon: <Video className="w-4 h-4" />,
    gradient: "from-pink-500 to-red-500",
    softBg: "from-pink-500/10 to-red-500/5",
    border: "border-pink-500/30",
    textColor: "text-pink-600",
  },
  google: {
    label: "Google Ads",
    shortLabel: "Google",
    emoji: "🔍",
    icon: <Globe className="w-4 h-4" />,
    gradient: "from-blue-500 to-blue-600",
    softBg: "from-blue-500/10 to-blue-600/5",
    border: "border-blue-500/30",
    textColor: "text-blue-600",
  },
};

// ─── Copy Button ──────────────────────────────────────────────────────────────
const CopyButton = ({
  text,
  field,
  copiedField,
  onCopy,
  label = "Copy",
}: {
  text: string;
  field: string;
  copiedField: string | null;
  onCopy: (text: string, field: string) => void;
  label?: string;
}) => (
  <button
    onClick={() => onCopy(text, field)}
    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-150 ${
      copiedField === field
        ? "bg-green-500/10 text-green-600"
        : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
    }`}
  >
    {copiedField === field ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
    {copiedField === field ? "Copied!" : label}
  </button>
);

// ─── Ad Block ─────────────────────────────────────────────────────────────────
const AdBlock = ({
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
      <CopyButton text={value} field={field} copiedField={copiedField} onCopy={onCopy} />
    </div>
    <p className={`text-foreground whitespace-pre-wrap ${large ? "text-sm leading-relaxed" : "font-bold text-base"}`}>{value}</p>
  </div>
);

// ─── Main AdminAds Component ──────────────────────────────────────────────────
const AdminAds = () => {
  const { toast } = useToast();
  const [selectedShop, setSelectedShop] = useState<string>("");
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>("whatsapp");
  const [targetAudience, setTargetAudience] = useState("");
  const [budgetRange, setBudgetRange] = useState("");
  const [promoText, setPromoText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [adResult, setAdResult] = useState<AdCopyResult | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const { data: shops = [] } = useQuery({
    queryKey: ["admin-shops-for-ads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shops")
        .select("id, shop_name, description, shop_slug")
        .eq("is_active", true)
        .order("shop_name");
      if (error) throw error;
      return data;
    },
  });

  const selectedShopData = shops.find((s) => s.id === selectedShop);
  const platform = platformConfig[selectedPlatform];

  const handleGenerate = async () => {
    if (!selectedShopData) {
      toast({ title: "Select a shop first", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    setAdResult(null);

    const result = await adsService.generateAdCopy({
      shopName: selectedShopData.shop_name,
      shopDescription: selectedShopData.description || undefined,
      platform: selectedPlatform,
      targetAudience: targetAudience || undefined,
      budgetRange: budgetRange || undefined,
    });

    if (result.success && result.data) {
      setAdResult(result.data);
      toast({ title: "Ad copy generated! 🎉" });
    } else {
      toast({ title: "Generation failed", description: result.error, variant: "destructive" });
    }
    setIsGenerating(false);
  };

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast({ title: "Copied!" });
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getFullAdText = () => {
    if (!adResult) return "";
    return `${adResult.headline}\n\n${adResult.bodyText}\n\n${adResult.callToAction}\n\n${adResult.hashtags?.join(" ") || ""}`;
  };

  const handleShare = (p: Platform) => {
    const text = getFullAdText();
    const shopUrl = selectedShopData ? `https://steersolo.com/shop/${selectedShopData.shop_slug}` : "";
    switch (p) {
      case "whatsapp":
        window.open(`https://wa.me/?text=${encodeURIComponent(text + "\n\n" + shopUrl)}`, "_blank");
        break;
      case "facebook":
        copyToClipboard(text + "\n\n" + shopUrl, "share");
        window.open("https://business.facebook.com/latest/posts/create", "_blank");
        break;
      case "tiktok":
        copyToClipboard(text, "share");
        window.open("https://ads.tiktok.com/", "_blank");
        break;
      case "google":
        copyToClipboard(text, "share");
        window.open("https://ads.google.com/", "_blank");
        break;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-6xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Ads Manager
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Generate AI-powered ad copy for any shop and publish across platforms
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* ── Left Panel: Config ──────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="rounded-3xl overflow-hidden border-border/60">
              <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary" />
              <CardHeader className="pb-2 pt-5">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  Campaign Setup
                </CardTitle>
                <CardDescription className="text-xs">Select a shop and platform, then generate</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 pb-5">

                {/* Shop Select */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider">Shop</Label>
                  <Select value={selectedShop} onValueChange={setSelectedShop}>
                    <SelectTrigger className="rounded-xl h-10">
                      <SelectValue placeholder="Select a shop…" />
                    </SelectTrigger>
                    <SelectContent>
                      {shops.map((shop) => (
                        <SelectItem key={shop.id} value={shop.id}>
                          🏪 {shop.shop_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedShopData?.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {selectedShopData.description}
                    </p>
                  )}
                </div>

                {/* Platform Selector */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider">Ad Platform</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.entries(platformConfig) as [Platform, typeof platformConfig[Platform]][]).map(([key, cfg]) => (
                      <button
                        key={key}
                        onClick={() => setSelectedPlatform(key)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 transition-all duration-150 text-left ${
                          selectedPlatform === key
                            ? `border-primary bg-primary/8 ${cfg.textColor} shadow-sm`
                            : "border-border hover:border-primary/30 text-muted-foreground"
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${cfg.gradient} flex items-center justify-center text-sm shadow-sm shrink-0`}>
                          {cfg.emoji}
                        </div>
                        <span className="text-xs font-semibold truncate">{cfg.shortLabel}</span>
                        {selectedPlatform === key && <Check className="w-3 h-3 ml-auto shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Target Audience */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider">
                    Target Audience <span className="text-muted-foreground font-normal">(optional)</span>
                  </Label>
                  <Input
                    className="rounded-xl h-10"
                    placeholder="e.g. Nigerian women aged 25–35 who love fashion"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                  />
                </div>

                {/* Budget */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider">
                    Budget Range <span className="text-muted-foreground font-normal">(optional)</span>
                  </Label>
                  <Input
                    className="rounded-xl h-10"
                    placeholder="e.g. ₦2,000 – ₦5,000/day"
                    value={budgetRange}
                    onChange={(e) => setBudgetRange(e.target.value)}
                  />
                </div>

                {/* Promo Text */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider">
                    Custom Promo Note <span className="text-muted-foreground font-normal">(optional)</span>
                  </Label>
                  <Textarea
                    className="rounded-xl resize-none"
                    placeholder="Any specific offer or message you want included…"
                    value={promoText}
                    onChange={(e) => setPromoText(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !selectedShop}
                  className="w-full h-11 rounded-2xl font-bold"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating…
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Ad Copy
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* ── Right Panel: Results ─────────────────────────── */}
          <div className="lg:col-span-3">
            {adResult ? (
              <div className="space-y-4">
                {/* Platform badge */}
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${platform.softBg} border ${platform.border}`}>
                  <span className="text-base">{platform.emoji}</span>
                  <span className={`text-xs font-bold ${platform.textColor}`}>{platform.label} Ad Copy</span>
                  <Badge className="bg-green-500/10 text-green-600 border-0 text-xs ml-1">Ready</Badge>
                </div>

                {/* Main Ad Content */}
                <Card className="rounded-3xl overflow-hidden border-border/60">
                  <div className={`h-1 bg-gradient-to-r ${platform.gradient}`} />
                  <CardContent className="p-0">
                    <Tabs defaultValue="content">
                      <div className="px-5 pt-4">
                        <TabsList className="w-full rounded-xl">
                          <TabsTrigger value="content" className="flex-1 rounded-lg text-xs">Ad Content</TabsTrigger>
                          <TabsTrigger value="targeting" className="flex-1 rounded-lg text-xs">Targeting</TabsTrigger>
                          <TabsTrigger value="tips" className="flex-1 rounded-lg text-xs">Tips</TabsTrigger>
                        </TabsList>
                      </div>

                      <TabsContent value="content" className="p-5 space-y-3 mt-0">
                        <AdBlock label="Headline" value={adResult.headline} field="headline" copiedField={copiedField} onCopy={copyToClipboard} />
                        <AdBlock label="Ad Copy (Body)" value={adResult.bodyText} field="body" large copiedField={copiedField} onCopy={copyToClipboard} />
                        <div className="flex items-center justify-between bg-muted/40 rounded-2xl px-4 py-3 border border-border/60">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Call to Action</p>
                            <Badge className={`text-sm font-bold bg-gradient-to-r ${platform.gradient} text-white border-0`}>
                              {adResult.callToAction}
                            </Badge>
                          </div>
                          <CopyButton text={adResult.callToAction} field="cta" copiedField={copiedField} onCopy={copyToClipboard} />
                        </div>

                        {adResult.hashtags?.length > 0 && (
                          <div className="bg-muted/40 rounded-2xl p-4 border border-border/60">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-1.5">
                                <Hash className="w-3.5 h-3.5 text-pink-500" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Hashtags</span>
                              </div>
                              <CopyButton text={adResult.hashtags.join(" ")} field="hashtags" copiedField={copiedField} onCopy={copyToClipboard} />
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {adResult.hashtags.map((tag, i) => (
                                <span key={i} className="px-2.5 py-0.5 bg-pink-500/10 text-pink-600 rounded-full text-xs font-medium">{tag}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {adResult.variations && adResult.variations.length > 0 && (
                          <div className="space-y-2 pt-1">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Alternate Versions</p>
                            {adResult.variations.map((v, i) => (
                              <div key={i} className="bg-muted/30 rounded-2xl p-4 border border-border/50">
                                <div className="flex items-center justify-between mb-2">
                                  <Badge variant="outline" className="text-xs">Version {i + 1}</Badge>
                                  <CopyButton text={`${v.headline}\n\n${v.bodyText}`} field={`var-${i}`} copiedField={copiedField} onCopy={copyToClipboard} />
                                </div>
                                <p className="font-semibold text-sm mb-1">{v.headline}</p>
                                <p className="text-xs text-muted-foreground">{v.bodyText}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="targeting" className="p-5 space-y-4 mt-0">
                        {adResult.targetingSuggestions?.length > 0 && (
                          <div>
                            <div className="flex items-center gap-1.5 mb-2">
                              <Target className="w-4 h-4 text-primary" />
                              <span className="text-xs font-bold uppercase tracking-wider">Audience Targeting</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {adResult.targetingSuggestions.map((s, i) => (
                                <span key={i} className="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">{s}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {adResult.budgetRecommendation && (
                          <div className="bg-green-500/5 rounded-2xl p-4 border border-green-500/20">
                            <div className="flex items-center gap-1.5 mb-1">
                              <DollarSign className="w-4 h-4 text-green-600" />
                              <span className="text-xs font-bold uppercase tracking-wider text-green-700">Budget Recommendation</span>
                            </div>
                            <p className="text-sm font-semibold text-foreground">{adResult.budgetRecommendation}</p>
                          </div>
                        )}
                        {adResult.imagePrompt && (
                          <div className="bg-purple-500/5 rounded-2xl p-4 border border-purple-500/20">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-1.5">
                                <Image className="w-4 h-4 text-purple-500" />
                                <span className="text-xs font-bold uppercase tracking-wider text-purple-700">Image Idea</span>
                              </div>
                              <CopyButton text={adResult.imagePrompt} field="imgprompt" copiedField={copiedField} onCopy={copyToClipboard} />
                            </div>
                            <p className="text-sm text-muted-foreground italic">{adResult.imagePrompt}</p>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="tips" className="p-5 mt-0">
                        {adResult.additionalTips?.length > 0 && (
                          <div>
                            <div className="flex items-center gap-1.5 mb-3">
                              <Lightbulb className="w-4 h-4 text-yellow-500" />
                              <span className="text-xs font-bold uppercase tracking-wider">Pro Tips</span>
                            </div>
                            <ul className="space-y-3">
                              {adResult.additionalTips.map((tip, i) => (
                                <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                                  <CheckCircle className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>

                {/* Publish / Share Card */}
                <Card className="rounded-3xl overflow-hidden border-border/60">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                      <ExternalLink className="w-4 h-4 text-primary" />
                      <p className="text-xs font-bold uppercase tracking-wider">Publish / Share</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {(Object.entries(platformConfig) as [Platform, typeof platformConfig[Platform]][]).map(([key, cfg]) => (
                        <button
                          key={key}
                          onClick={() => handleShare(key)}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all duration-150 hover:shadow-sm bg-gradient-to-r ${cfg.softBg} ${cfg.border} hover:scale-[1.02]`}
                        >
                          <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${cfg.gradient} flex items-center justify-center text-sm shadow-sm shrink-0`}>
                            {cfg.emoji}
                          </div>
                          <span className={`text-xs font-bold ${cfg.textColor} truncate`}>{cfg.shortLabel}</span>
                          <ExternalLink className="w-3 h-3 ml-auto text-muted-foreground shrink-0" />
                        </button>
                      ))}
                    </div>

                    <Button
                      className="w-full h-11 rounded-2xl font-bold"
                      onClick={() => copyToClipboard(getFullAdText(), "full")}
                    >
                      {copiedField === "full" ? (
                        <><Check className="mr-2 w-4 h-4" />Copied Full Ad!</>
                      ) : (
                        <><Copy className="mr-2 w-4 h-4" />Copy Full Ad Text</>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ) : (
              /* Empty State */
              <div className="h-full min-h-[480px] flex items-center justify-center">
                <div className="text-center max-w-xs">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mx-auto mb-5 shadow-inner">
                    <Sparkles className="w-9 h-9 text-primary/50" />
                  </div>
                  <h3 className="font-bold text-base mb-1">Ready to create ads</h3>
                  <p className="text-sm text-muted-foreground mb-5">
                    Select a shop and platform on the left, then click Generate to create AI-powered ad copy.
                  </p>
                  <div className="flex flex-col gap-2 text-left">
                    {["Choose a shop from your platform", "Pick the ad platform", "Hit Generate → copy & share"].map((step, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-xs text-muted-foreground">
                        <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">
                          {i + 1}
                        </div>
                        {step}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAds;
