import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Upload, Loader2, Store, CreditCard, MessageCircle, Copy, Share2, Check, ExternalLink, Download, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { StoreFlyerTemplate } from "@/components/StoreFlyerTemplate";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { z } from "zod";
import { AdirePattern } from "@/components/patterns/AdirePattern";
import logo from "@/assets/steersolo-logo.jpg";
import Joyride, { CallBackProps, STATUS } from "react-joyride";
import { useTour } from "@/hooks/useTour";
import { TourTooltip } from "@/components/tours/TourTooltip";
import { myStoreTourSteps } from "@/components/tours/tourSteps";
import { TourButton } from "@/components/tours/TourButton";

const shopSchema = z.object({
  shop_name: z.string().trim().min(2, "Store name must be at least 2 characters").max(100, "Store name must be less than 100 characters"),
  shop_slug: z.string().trim().min(2, "URL slug must be at least 2 characters").max(50, "URL slug must be less than 50 characters").regex(/^[a-z0-9-]+$/, "URL slug can only contain lowercase letters, numbers, and hyphens"),
  description: z.string().trim().max(500, "Description must be less than 500 characters").optional(),
  whatsapp_number: z.string().trim().min(10, "WhatsApp number must be at least 10 digits").max(20, "WhatsApp number too long"),
  enable_paystack: z.boolean(),
  enable_bank_transfer: z.boolean(),
  bank_account_name: z.string().trim().max(100).optional(),
  bank_name: z.string().trim().max(100).optional(),
  bank_account_number: z.string().trim().max(20).optional(),
  paystack_public_key: z.string().trim().optional(),
}).refine((data) => {
  return data.enable_paystack || data.enable_bank_transfer;
}, {
  message: "Please enable at least one payment method",
}).refine((data) => {
  if (data.enable_bank_transfer) {
    return data.bank_account_name && data.bank_name && data.bank_account_number;
  }
  return true;
}, {
  message: "Please provide all bank account details",
}).refine((data) => {
  if (data.enable_paystack) {
    return data.paystack_public_key;
  }
  return true;
}, {
  message: "Please provide your Paystack public key",
});

const MyStore = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const [shop, setShop] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [formData, setFormData] = useState({
    shop_name: "",
    shop_slug: "",
    description: "",
    whatsapp_number: "",
    enable_paystack: false,
    enable_bank_transfer: true,
    bank_account_name: "",
    bank_name: "",
    bank_account_number: "",
    paystack_public_key: "",
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Tour state
  const { hasSeenTour, isRunning, startTour, endTour, resetTour } = useTour('my-store');

  const handleTourCallback = (data: CallBackProps) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      endTour(status === STATUS.FINISHED);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        loadShop();
      } else {
        navigate("/auth/login");
      }
    }
  }, [user, authLoading, navigate]);

  const loadShop = async () => {
    try {
      if (!user) return;

      const { data: shopData } = await supabase
        .from("shops")
        .select("*")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (shopData) {
        setShop(shopData);
        
        // Determine payment method flags from existing payment_method field
        const enablePaystack = shopData.payment_method === 'paystack' || shopData.payment_method === 'both';
        const enableBankTransfer = shopData.payment_method === 'bank_transfer' || shopData.payment_method === 'both' || !shopData.payment_method;
        
        setFormData({
          shop_name: shopData.shop_name,
          shop_slug: shopData.shop_slug,
          description: shopData.description || "",
          whatsapp_number: shopData.whatsapp_number || "",
          enable_paystack: enablePaystack,
          enable_bank_transfer: enableBankTransfer,
          bank_account_name: shopData.bank_account_name || "",
          bank_name: shopData.bank_name || "",
          bank_account_number: shopData.bank_account_number || "",
          paystack_public_key: shopData.paystack_public_key || "",
        });

        const { data: productsData } = await supabase
          .from("products")
          .select("*")
          .eq("shop_id", shopData.id)
          .order("created_at", { ascending: false });

        setProducts(productsData || []);
      }
    } catch (error) {
      console.error("Error loading shop:", error);
      toast({
        title: "Error",
        description: "Failed to load shop data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const uploadImage = async (file: File, bucket: string, userId: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form data
    const validation = shopSchema.safeParse(formData);
    if (!validation.success) {
      const newErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          newErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(newErrors);
      return;
    }

    setIsSaving(true);

    try {
      if (!user) throw new Error("Not authenticated");

      let logoUrl = shop?.logo_url;
      let bannerUrl = shop?.banner_url;

      if (logoFile) {
        logoUrl = await uploadImage(logoFile, 'shop-images', user.id);
      }

      if (bannerFile) {
        bannerUrl = await uploadImage(bannerFile, 'shop-images', user.id);
      }

      // Determine payment_method value based on checkboxes
      let paymentMethod = 'bank_transfer';
      if (formData.enable_paystack && formData.enable_bank_transfer) {
        paymentMethod = 'both';
      } else if (formData.enable_paystack) {
        paymentMethod = 'paystack';
      } else if (formData.enable_bank_transfer) {
        paymentMethod = 'bank_transfer';
      }

      const shopData = {
        shop_name: formData.shop_name,
        shop_slug: formData.shop_slug,
        description: formData.description,
        whatsapp_number: formData.whatsapp_number,
        payment_method: paymentMethod,
        bank_account_name: formData.enable_bank_transfer ? formData.bank_account_name : null,
        bank_name: formData.enable_bank_transfer ? formData.bank_name : null,
        bank_account_number: formData.enable_bank_transfer ? formData.bank_account_number : null,
        paystack_public_key: formData.enable_paystack ? formData.paystack_public_key : null,
        logo_url: logoUrl,
        banner_url: bannerUrl,
        owner_id: user.id,
      };

      if (shop) {
        const { error } = await supabase
          .from("shops")
          .update(shopData)
          .eq("id", shop.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("shops")
          .insert(shopData);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: shop ? "Store updated successfully" : "Store created successfully",
      });

      loadShop();
    } catch (error: any) {
      console.error("Error saving shop:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save store",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleActivateStore = async () => {
    if (!shop) return;

    try {
      const { error } = await supabase
        .from("shops")
        .update({ is_active: !shop.is_active })
        .eq("id", shop.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: shop.is_active ? "Store deactivated" : "Store activated",
      });

      loadShop();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStoreUrl = () => {
    if (!shop?.shop_slug) return "";
    return `${window.location.origin}/shop/${shop.shop_slug}`;
  };

  const handleCopyUrl = async () => {
    const url = getStoreUrl();
    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      toast({
        title: "Copied!",
        description: "Store URL copied to clipboard",
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy URL",
        variant: "destructive",
      });
    }
  };

  const handleShareToWhatsApp = () => {
    const url = getStoreUrl();
    const text = encodeURIComponent(`Check out my store: ${shop?.shop_name}! Visit: ${url}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const handleShareToTwitter = () => {
    const url = getStoreUrl();
    const text = encodeURIComponent(`Check out my store: ${shop?.shop_name}!`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`, "_blank");
  };

  const handleShareToFacebook = () => {
    const url = getStoreUrl();
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
  };

  const handleDownloadQRCode = () => {
    const svg = document.getElementById("store-qr-code");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${shop?.shop_slug || "store"}-qr-code.png`;
        link.click();
        URL.revokeObjectURL(url);

        toast({
          title: "Downloaded!",
          description: "QR code saved successfully",
        });
      });
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-xl overflow-hidden">
            <img src={logo} alt="Loading" className="w-full h-full object-cover" />
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 relative">
      <AdirePattern variant="dots" className="fixed inset-0 opacity-5 pointer-events-none" />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="hover:bg-primary/10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <TourButton 
            onStartTour={startTour} 
            hasSeenTour={hasSeenTour} 
            onResetTour={resetTour}
          />
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-heading font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              My Store
            </h1>
            <p className="text-muted-foreground">
              {shop ? "Manage your store settings" : "Create your store to start selling"}
            </p>
          </div>

          <Card className="border-primary/10 shadow-lg">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="flex items-center gap-2 font-heading">
                <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center">
                  <Store className="w-5 h-5 text-primary" />
                </div>
                Store Information
              </CardTitle>
              <CardDescription>
                Set up your store details and branding
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2" data-tour="store-name">
                  <Label htmlFor="shop_name">Store Name *</Label>
                  <Input
                    id="shop_name"
                    value={formData.shop_name}
                    onChange={(e) => setFormData({ ...formData, shop_name: e.target.value })}
                    placeholder="My Awesome Store"
                    className={`border-primary/20 focus:border-primary ${errors.shop_name ? "border-destructive" : ""}`}
                  />
                  {errors.shop_name && (
                    <p className="text-sm text-destructive">{errors.shop_name}</p>
                  )}
                </div>

                <div className="space-y-2" data-tour="store-url">
                  <Label htmlFor="shop_slug">Store URL *</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">steersolo.com/shop/</span>
                    <Input
                      id="shop_slug"
                      value={formData.shop_slug}
                      onChange={(e) => setFormData({ ...formData, shop_slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                      placeholder="my-store"
                      className={`border-primary/20 focus:border-primary ${errors.shop_slug ? "border-destructive" : ""}`}
                    />
                  </div>
                  {errors.shop_slug && (
                    <p className="text-sm text-destructive">{errors.shop_slug}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Tell customers about your store..."
                    rows={4}
                    className={`border-primary/20 focus:border-primary ${errors.description ? "border-destructive" : ""}`}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">{errors.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formData.description.length}/500 characters
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2" data-tour="store-logo">
                    <Label htmlFor="logo">Store Logo</Label>
                    <div className="border-2 border-dashed border-primary/20 rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer group">
                      <input
                        id="logo"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                      <label htmlFor="logo" className="cursor-pointer">
                        {logoFile || shop?.logo_url ? (
                          <img
                            src={logoFile ? URL.createObjectURL(logoFile) : shop.logo_url}
                            alt="Logo preview"
                            className="w-32 h-32 object-cover mx-auto rounded-lg mb-2 group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <Upload className="w-12 h-12 mx-auto mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
                        )}
                        <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                          {logoFile ? logoFile.name : "Click to upload logo"}
                        </p>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2" data-tour="store-banner">
                    <Label htmlFor="banner">Store Banner</Label>
                    <div className="border-2 border-dashed border-primary/20 rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer group">
                      <input
                        id="banner"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setBannerFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                      <label htmlFor="banner" className="cursor-pointer">
                        {bannerFile || shop?.banner_url ? (
                          <img
                            src={bannerFile ? URL.createObjectURL(bannerFile) : shop.banner_url}
                            alt="Banner preview"
                            className="w-full h-32 object-cover mx-auto rounded-lg mb-2 group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <Upload className="w-12 h-12 mx-auto mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
                        )}
                        <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                          {bannerFile ? bannerFile.name : "Click to upload banner"}
                        </p>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2" data-tour="whatsapp-number">
                  <Label htmlFor="whatsapp_number">WhatsApp Number *</Label>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-green-500" />
                    <Input
                      id="whatsapp_number"
                      value={formData.whatsapp_number}
                      onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                      placeholder="+234 xxx xxx xxxx"
                      className={`border-primary/20 focus:border-primary ${errors.whatsapp_number ? "border-destructive" : ""}`}
                    />
                  </div>
                  {errors.whatsapp_number && (
                    <p className="text-sm text-destructive">{errors.whatsapp_number}</p>
                  )}
                </div>

                {/* Payment Methods */}
                <div className="space-y-4" data-tour="payment-methods">
                  <Label className="text-lg font-heading">Payment Methods</Label>
                  
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 p-4 border border-primary/20 rounded-lg">
                      <Checkbox
                        id="enable_bank_transfer"
                        checked={formData.enable_bank_transfer}
                        onCheckedChange={(checked) => setFormData({ ...formData, enable_bank_transfer: !!checked })}
                      />
                      <div className="flex-1">
                        <Label htmlFor="enable_bank_transfer" className="font-semibold cursor-pointer">
                          Bank Transfer
                        </Label>
                        <p className="text-sm text-muted-foreground">Accept direct bank transfers</p>
                        
                        {formData.enable_bank_transfer && (
                          <div className="mt-4 space-y-3">
                            <Input
                              placeholder="Bank Name"
                              value={formData.bank_name}
                              onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                              className="border-primary/20"
                            />
                            <Input
                              placeholder="Account Name"
                              value={formData.bank_account_name}
                              onChange={(e) => setFormData({ ...formData, bank_account_name: e.target.value })}
                              className="border-primary/20"
                            />
                            <Input
                              placeholder="Account Number"
                              value={formData.bank_account_number}
                              onChange={(e) => setFormData({ ...formData, bank_account_number: e.target.value })}
                              className="border-primary/20"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-4 border border-primary/20 rounded-lg">
                      <Checkbox
                        id="enable_paystack"
                        checked={formData.enable_paystack}
                        onCheckedChange={(checked) => setFormData({ ...formData, enable_paystack: !!checked })}
                      />
                      <div className="flex-1">
                        <Label htmlFor="enable_paystack" className="font-semibold cursor-pointer">
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-blue-500" />
                            Paystack
                          </div>
                        </Label>
                        <p className="text-sm text-muted-foreground">Accept card payments via Paystack</p>
                        
                        {formData.enable_paystack && (
                          <div className="mt-4">
                            <Input
                              placeholder="Paystack Public Key (pk_live_...)"
                              value={formData.paystack_public_key}
                              onChange={(e) => setFormData({ ...formData, paystack_public_key: e.target.value })}
                              className="border-primary/20"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Get your public key from your Paystack dashboard
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      shop ? "Update Store" : "Create Store"
                    )}
                  </Button>
                  
                  {shop && (
                    <Button
                      type="button"
                      variant={shop.is_active ? "destructive" : "default"}
                      onClick={handleActivateStore}
                    >
                      {shop.is_active ? "Deactivate" : "Activate"}
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Share Store Card */}
          {shop && shop.is_active && (
            <Card className="mt-6 border-primary/10 shadow-lg" data-tour="store-sharing">
              <CardHeader className="border-b border-border/50">
                <CardTitle className="flex items-center gap-2 font-heading">
                  <div className="w-10 h-10 bg-gradient-to-br from-accent/20 to-primary/20 rounded-xl flex items-center justify-center">
                    <Share2 className="w-5 h-5 text-accent" />
                  </div>
                  Share Your Store
                </CardTitle>
                <CardDescription>
                  Get your store URL and share it with customers
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {/* Store URL */}
                <div className="flex items-center gap-2">
                  <Input
                    value={getStoreUrl()}
                    readOnly
                    className="flex-1 bg-muted border-primary/20"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyUrl}
                    className="border-primary/30 hover:bg-primary/10"
                  >
                    {isCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => window.open(getStoreUrl(), "_blank")}
                    className="border-primary/30 hover:bg-primary/10"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>

                {/* Social Share Buttons */}
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    onClick={handleShareToWhatsApp}
                    className="border-green-500/30 text-green-600 hover:bg-green-500/10"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleShareToTwitter}
                    className="border-blue-400/30 text-blue-500 hover:bg-blue-500/10"
                  >
                    Share on X
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleShareToFacebook}
                    className="border-blue-600/30 text-blue-600 hover:bg-blue-600/10"
                  >
                    Facebook
                  </Button>
                </div>

                {/* QR Code / Flyer Tabs */}
                <Tabs defaultValue="qr" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-muted">
                    <TabsTrigger value="qr">
                      <QrCode className="w-4 h-4 mr-2" />
                      QR Code
                    </TabsTrigger>
                    <TabsTrigger value="flyer">
                      <Download className="w-4 h-4 mr-2" />
                      Store Flyer
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="qr" className="mt-4">
                    <div className="flex flex-col items-center gap-4 p-6 bg-card rounded-lg border border-primary/10">
                      <QRCodeSVG
                        id="store-qr-code"
                        value={getStoreUrl()}
                        size={200}
                        level="H"
                        includeMargin
                        className="rounded-lg"
                      />
                      <Button
                        onClick={handleDownloadQRCode}
                        className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download QR Code
                      </Button>
                    </div>
                  </TabsContent>
                  <TabsContent value="flyer" className="mt-4">
                    <StoreFlyerTemplate
                      shop={shop}
                      products={products.slice(0, 4)}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Guided Tour */}
      <Joyride
        steps={myStoreTourSteps}
        run={isRunning}
        continuous
        showSkipButton
        showProgress
        callback={handleTourCallback}
        tooltipComponent={TourTooltip}
        styles={{
          options: {
            zIndex: 10000,
            arrowColor: 'hsl(var(--card))',
          }
        }}
      />
    </div>
  );
};

export default MyStore;
