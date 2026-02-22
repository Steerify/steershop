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
  MessageSquare, Facebook, Globe, Video,
} from "lucide-react";

type Platform = "google" | "facebook" | "tiktok" | "whatsapp";

const platformConfig: Record<Platform, { label: string; icon: React.ReactNode; color: string }> = {
  whatsapp: { label: "WhatsApp", icon: <MessageSquare className="w-4 h-4" />, color: "bg-green-500" },
  facebook: { label: "Facebook / Instagram", icon: <Facebook className="w-4 h-4" />, color: "bg-blue-600" },
  tiktok: { label: "TikTok", icon: <Video className="w-4 h-4" />, color: "bg-black" },
  google: { label: "Google Ads", icon: <Globe className="w-4 h-4" />, color: "bg-red-500" },
};

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

  const handleGenerate = async () => {
    if (!selectedShopData) {
      toast({ title: "Select a shop", variant: "destructive" });
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
      toast({ title: "Ad copy generated!" });
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

  const handleShare = (platform: Platform) => {
    const text = getFullAdText();
    const shopUrl = selectedShopData ? `https://steersolo.lovable.app/shop/${selectedShopData.shop_slug}` : "";

    switch (platform) {
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

  const CopyButton = ({ text, field }: { text: string; field: string }) => (
    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyToClipboard(text, field)}>
      {copiedField === field ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
    </Button>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Ads Manager</h1>
          <p className="text-muted-foreground">Generate AI-powered ad copy and publish to social media</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Campaign Setup</CardTitle>
              <CardDescription>Select a shop and platform to generate ad copy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Shop</Label>
                <Select value={selectedShop} onValueChange={setSelectedShop}>
                  <SelectTrigger><SelectValue placeholder="Select a shop" /></SelectTrigger>
                  <SelectContent>
                    {shops.map((shop) => (
                      <SelectItem key={shop.id} value={shop.id}>{shop.shop_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Platform</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(platformConfig) as [Platform, typeof platformConfig[Platform]][]).map(([key, cfg]) => (
                    <Button
                      key={key}
                      variant={selectedPlatform === key ? "default" : "outline"}
                      className="justify-start gap-2"
                      onClick={() => setSelectedPlatform(key)}
                    >
                      {cfg.icon} {cfg.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Target Audience (optional)</Label>
                <Input
                  placeholder="e.g. Nigerian women aged 25-35 who love fashion"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Budget Range (optional)</Label>
                <Input
                  placeholder="e.g. ₦2,000 - ₦5,000/day"
                  value={budgetRange}
                  onChange={(e) => setBudgetRange(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Custom Promo Text (optional)</Label>
                <Textarea
                  placeholder="Any specific promo or message you want included..."
                  value={promoText}
                  onChange={(e) => setPromoText(e.target.value)}
                  rows={3}
                />
              </div>

              <Button onClick={handleGenerate} disabled={isGenerating || !selectedShop} className="w-full">
                {isGenerating ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</>
                ) : (
                  <><Sparkles className="mr-2 h-4 w-4" />Generate Ad Copy</>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Right: Results */}
          <div className="space-y-4">
            {adResult ? (
              <>
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Generated Ad</CardTitle>
                      <Badge variant="secondary">{platformConfig[selectedPlatform].label}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="content">
                      <TabsList className="w-full">
                        <TabsTrigger value="content" className="flex-1">Content</TabsTrigger>
                        <TabsTrigger value="targeting" className="flex-1">Targeting</TabsTrigger>
                        <TabsTrigger value="tips" className="flex-1">Tips</TabsTrigger>
                      </TabsList>

                      <TabsContent value="content" className="space-y-4 mt-4">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs text-muted-foreground">Headline</Label>
                            <CopyButton text={adResult.headline} field="headline" />
                          </div>
                          <p className="font-semibold text-lg">{adResult.headline}</p>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs text-muted-foreground">Body</Label>
                            <CopyButton text={adResult.bodyText} field="body" />
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{adResult.bodyText}</p>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Call to Action</Label>
                          <Badge>{adResult.callToAction}</Badge>
                        </div>

                        {adResult.hashtags?.length > 0 && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs text-muted-foreground">Hashtags</Label>
                              <CopyButton text={adResult.hashtags.join(" ")} field="hashtags" />
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {adResult.hashtags.map((tag, i) => (
                                <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {adResult.variations && adResult.variations.length > 0 && (
                          <div className="space-y-2 border-t pt-4">
                            <Label className="text-xs text-muted-foreground">Variations</Label>
                            {adResult.variations.map((v, i) => (
                              <div key={i} className="bg-muted/50 rounded-lg p-3 space-y-1">
                                <div className="flex items-center justify-between">
                                  <p className="font-medium text-sm">Variation {i + 1}</p>
                                  <CopyButton text={`${v.headline}\n\n${v.bodyText}`} field={`var-${i}`} />
                                </div>
                                <p className="font-semibold">{v.headline}</p>
                                <p className="text-sm text-muted-foreground">{v.bodyText}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="targeting" className="space-y-4 mt-4">
                        {adResult.targetingSuggestions?.length > 0 && (
                          <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Audience Targeting</Label>
                            <ul className="space-y-1">
                              {adResult.targetingSuggestions.map((s, i) => (
                                <li key={i} className="text-sm flex items-start gap-2">
                                  <span className="text-primary mt-0.5">•</span> {s}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Budget Recommendation</Label>
                          <p className="text-sm font-medium">{adResult.budgetRecommendation}</p>
                        </div>
                        {adResult.imagePrompt && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs text-muted-foreground">Image Idea</Label>
                              <CopyButton text={adResult.imagePrompt} field="imgprompt" />
                            </div>
                            <p className="text-sm italic text-muted-foreground">{adResult.imagePrompt}</p>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="tips" className="mt-4">
                        {adResult.additionalTips?.length > 0 && (
                          <ul className="space-y-2">
                            {adResult.additionalTips.map((tip, i) => (
                              <li key={i} className="text-sm flex items-start gap-2">
                                <Sparkles className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" /> {tip}
                              </li>
                            ))}
                          </ul>
                        )}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>

                {/* Action buttons */}
                <Card>
                  <CardContent className="pt-4 space-y-3">
                    <p className="text-sm font-medium">Publish / Share</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" className="gap-2" onClick={() => handleShare("whatsapp")}>
                        <MessageSquare className="w-4 h-4 text-green-500" /> WhatsApp
                        <ExternalLink className="w-3 h-3 ml-auto" />
                      </Button>
                      <Button variant="outline" className="gap-2" onClick={() => handleShare("facebook")}>
                        <Facebook className="w-4 h-4 text-blue-600" /> Facebook
                        <ExternalLink className="w-3 h-3 ml-auto" />
                      </Button>
                      <Button variant="outline" className="gap-2" onClick={() => handleShare("tiktok")}>
                        <Video className="w-4 h-4" /> TikTok
                        <ExternalLink className="w-3 h-3 ml-auto" />
                      </Button>
                      <Button variant="outline" className="gap-2" onClick={() => handleShare("google")}>
                        <Globe className="w-4 h-4 text-red-500" /> Google Ads
                        <ExternalLink className="w-3 h-3 ml-auto" />
                      </Button>
                    </div>
                    <Button className="w-full" onClick={() => copyToClipboard(getFullAdText(), "full")}>
                      {copiedField === "full" ? <Check className="mr-2 w-4 h-4" /> : <Copy className="mr-2 w-4 h-4" />}
                      Copy Full Ad Text
                    </Button>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="flex items-center justify-center min-h-[300px]">
                <CardContent className="text-center space-y-2 py-12">
                  <Sparkles className="w-10 h-10 text-muted-foreground/40 mx-auto" />
                  <p className="text-muted-foreground">Select a shop and generate ad copy to see results here</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAds;
