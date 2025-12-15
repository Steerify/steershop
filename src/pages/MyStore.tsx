import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Upload, Loader2, Store, CreditCard, MessageCircle, Copy, Share2, Check, ExternalLink, Download, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { StoreFlyerTemplate } from "@/components/StoreFlyerTemplate";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { z } from "zod";
import { AdirePattern } from "@/components/patterns/AdirePattern";
import logo from "@/assets/steersolo-logo.jpg";

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

  useEffect(() => {
    loadShop();
  }, []);

  const loadShop = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate("/auth/login");
        return;
      }

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
      const { data: { user } } = await supabase.auth.getUser();
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
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="hover:bg-primary/10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
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
                <div className="space-y-2">
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

                <div className="space-y-2">
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
                  <div className="space-y-2">
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

                  <div className="space-y-2">
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
                            className="w-full h-32 object-cover rounded-lg mb-2 group-hover:scale-105 transition-transform"
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

                {/* WhatsApp Contact */}
                <div className="space-y-2">
                  <Label htmlFor="whatsapp_number" className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-green-500" />
                    WhatsApp Number *
                  </Label>
                  <Input
                    id="whatsapp_number"
                    type="tel"
                    value={formData.whatsapp_number}
                    onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                    placeholder="+234 800 000 0000"
                    className={`border-primary/20 focus:border-primary ${errors.whatsapp_number ? "border-destructive" : ""}`}
                  />
                  {errors.whatsapp_number && (
                    <p className="text-sm text-destructive">{errors.whatsapp_number}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Customers will use this to contact you directly
                  </p>
                </div>

                {/* Payment Settings - Updated with Checkboxes */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-accent/20 to-primary/20 rounded-xl flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <Label className="text-base font-semibold">Payment Methods *</Label>
                      <p className="text-xs text-muted-foreground">Enable the payment methods you want to offer</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Bank Transfer Option */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 rounded-lg border border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-colors">
                        <Checkbox
                          id="enable_bank_transfer"
                          checked={formData.enable_bank_transfer}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, enable_bank_transfer: checked as boolean })
                          }
                        />
                        <Label htmlFor="enable_bank_transfer" className="font-normal cursor-pointer flex-1">
                          <span className="font-medium">Bank Transfer (Manual)</span>
                          <p className="text-xs text-muted-foreground">Customers pay via bank transfer, you verify manually</p>
                        </Label>
                      </div>

                      {formData.enable_bank_transfer && (
                        <div className="space-y-4 p-4 bg-muted/50 rounded-lg border border-border/50 ml-6">
                          <div className="space-y-2">
                            <Label htmlFor="bank_account_name">Account Name *</Label>
                            <Input
                              id="bank_account_name"
                              value={formData.bank_account_name}
                              onChange={(e) => setFormData({ ...formData, bank_account_name: e.target.value })}
                              placeholder="John Doe"
                              className={errors.bank_account_name ? "border-destructive" : ""}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="bank_name">Bank Name *</Label>
                            <Input
                              id="bank_name"
                              value={formData.bank_name}
                              onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                              placeholder="Access Bank"
                              className={errors.bank_name ? "border-destructive" : ""}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="bank_account_number">Account Number *</Label>
                            <Input
                              id="bank_account_number"
                              value={formData.bank_account_number}
                              onChange={(e) => setFormData({ ...formData, bank_account_number: e.target.value })}
                              placeholder="0123456789"
                              className={errors.bank_account_number ? "border-destructive" : ""}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Paystack Option */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 rounded-lg border border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-colors">
                        <Checkbox
                          id="enable_paystack"
                          checked={formData.enable_paystack}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, enable_paystack: checked as boolean })
                          }
                        />
                        <Label htmlFor="enable_paystack" className="font-normal cursor-pointer flex-1">
                          <span className="font-medium">Paystack (Automatic)</span>
                          <p className="text-xs text-muted-foreground">Accept card payments automatically via Paystack</p>
                        </Label>
                      </div>

                      {formData.enable_paystack && (
                        <div className="space-y-4 p-4 bg-muted/50 rounded-lg border border-border/50 ml-6">
                          <div className="space-y-2">
                            <Label htmlFor="paystack_public_key">Paystack Public Key *</Label>
                            <Input
                              id="paystack_public_key"
                              value={formData.paystack_public_key}
                              onChange={(e) => setFormData({ ...formData, paystack_public_key: e.target.value })}
                              placeholder="pk_test_..."
                              className={errors.paystack_public_key ? "border-destructive" : ""}
                            />
                            <p className="text-xs text-muted-foreground">
                              Get your public key from your Paystack dashboard
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {(!formData.enable_paystack && !formData.enable_bank_transfer) && (
                    <p className="text-sm text-destructive">Please enable at least one payment method</p>
                  )}
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={isSaving} className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90">
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

          {/* Store URL Sharing Card - Only show when shop exists and is active */}
          {shop && shop.is_active && (
            <Card className="mt-6 border-primary/10 shadow-lg">
              <CardHeader className="border-b border-border/50">
                <CardTitle className="flex items-center gap-2 font-heading">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center">
                    <Share2 className="w-5 h-5 text-primary" />
                  </div>
                  Share Your Store
                </CardTitle>
                <CardDescription>
                  Preview and share your store link with customers
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {/* Store URL */}
                <div className="space-y-2">
                  <Label>Store URL</Label>
                  <div className="flex gap-2">
                    <Input
                      value={getStoreUrl()}
                      readOnly
                      className="font-mono text-sm bg-muted/50"
                    />
                    <Button variant="outline" onClick={handleCopyUrl} className="hover:bg-primary/10">
                      {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                    <Button variant="outline" onClick={() => window.open(getStoreUrl(), "_blank")} className="hover:bg-primary/10">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Social Share Buttons */}
                <div className="space-y-2">
                  <Label>Share on Social Media</Label>
                  <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" onClick={handleShareToWhatsApp} className="gap-2 hover:bg-green-500/10 hover:text-green-500 hover:border-green-500/50">
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp
                    </Button>
                    <Button variant="outline" onClick={handleShareToTwitter} className="gap-2 hover:bg-blue-500/10 hover:text-blue-500 hover:border-blue-500/50">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                      X (Twitter)
                    </Button>
                    <Button variant="outline" onClick={handleShareToFacebook} className="gap-2 hover:bg-blue-600/10 hover:text-blue-600 hover:border-blue-600/50">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                      Facebook
                    </Button>
                  </div>
                </div>

                {/* QR Code Section */}
                <div className="space-y-4">
                  <Label>QR Code</Label>
                  <Tabs defaultValue="qr" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                      <TabsTrigger value="qr">QR Code</TabsTrigger>
                      <TabsTrigger value="flyer">Printable Flyer</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="qr" className="mt-4">
                      <div className="flex flex-col items-center gap-4">
                        <div className="p-4 bg-white rounded-lg shadow-md">
                          <QRCodeSVG
                            id="store-qr-code"
                            value={getStoreUrl()}
                            size={200}
                            level="H"
                            includeMargin
                          />
                        </div>
                        <Button onClick={handleDownloadQRCode} variant="outline" className="gap-2 hover:bg-primary/10">
                          <Download className="w-4 h-4" />
                          Download QR Code
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="flyer" className="mt-4">
                      <StoreFlyerTemplate
                        shop={{
                          shop_name: shop?.shop_name || "",
                          shop_slug: shop?.shop_slug || "",
                          description: shop?.description,
                          logo_url: shop?.logo_url,
                          whatsapp_number: shop?.whatsapp_number || "",
                        }}
                        products={products}
                      />
                    </TabsContent>
                  </Tabs>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyStore;
