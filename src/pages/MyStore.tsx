import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import shopService from "@/services/shop.service";
import productService from "@/services/product.service";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Loader2,
  Store,
  CreditCard,
  MessageCircle,
  Copy,
  Share2,
  Check,
  ExternalLink,
  Download,
  QrCode,
  ShieldCheck,
} from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";
import { QRCodeSVG } from "qrcode.react";
import { StoreFlyerTemplate } from "@/components/StoreFlyerTemplate";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { z } from "zod";
import { AdirePattern } from "@/components/patterns/AdirePattern";
import { PageWrapper } from "@/components/PageWrapper";
import logo from "@/assets/steersolo-logo.jpg";
import Joyride, { CallBackProps, STATUS } from "react-joyride";
import { useTour } from "@/hooks/useTour";
import { TourTooltip } from "@/components/tours/TourTooltip";
import { myStoreTourSteps } from "@/components/tours/tourSteps";
import { TourButton } from "@/components/tours/TourButton";
import { ShopAppearanceSettings } from "@/components/ShopAppearanceSettings";

const shopSchema = z
  .object({
    shop_name: z
      .string()
      .trim()
      .min(2, "Store name must be at least 2 characters")
      .max(100),
    shop_slug: z
      .string()
      .trim()
      .min(2)
      .max(50)
      .regex(/^[a-z0-9-]+$/, "Invalid slug"),
    description: z.string().trim().max(500).optional(),
    whatsapp_number: z.string().trim().min(10).max(20),
    enable_paystack: z.boolean(),
    enable_bank_transfer: z.boolean(),
    bank_account_name: z.string().optional(),
    bank_name: z.string().optional(),
    bank_account_number: z.string().optional(),
    paystack_public_key: z.string().optional(),
  })
  .refine((data) => data.enable_paystack || data.enable_bank_transfer, {
    message: "Enable at least one payment method",
    path: ["enable_bank_transfer"],
  })
  .refine(
    (data) => {
      if (data.enable_bank_transfer) {
        return (
          data.bank_account_name &&
          data.bank_name &&
          data.bank_account_number
        );
      }
      return true;
    },
    {
      message: "Complete bank details required",
      path: ["bank_account_name"],
    }
  )
  .refine(
    (data) => {
      if (data.enable_paystack) {
        return data.paystack_public_key;
      }
      return true;
    },
    {
      message: "Paystack public key required",
      path: ["paystack_public_key"],
    }
  );

// Helper function to format UUID with hyphens - FIXED VERSION
const formatUUIDWithHyphens = (uuid: string): string => {
  // Enhanced validation
  if (!uuid || uuid.trim() === '') {
    throw new Error('UUID is required for formatting');
  }
  
  // Check specifically for 'undefined' or 'null' strings
  if (uuid === 'undefined' || uuid === 'null') {
    throw new Error(`Invalid UUID value: ${uuid}`);
  }
  
  // Remove any existing hyphens
  const cleanUuid = uuid.replace(/-/g, '');
  
  // Check if it's a 32-character hex string (standard UUID without hyphens)
  if (cleanUuid.length === 32 && /^[a-f0-9]{32}$/i.test(cleanUuid)) {
    // Format with hyphens in standard UUID format: 8-4-4-4-12
    return `${cleanUuid.substring(0, 8)}-${cleanUuid.substring(8, 12)}-${cleanUuid.substring(12, 16)}-${cleanUuid.substring(16, 20)}-${cleanUuid.substring(20)}`;
  }
  
  // If it's already in UUID format with hyphens, validate and return as-is
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(uuid)) {
    return uuid;
  }
  
  // If not a standard UUID format but not empty, log warning and return as-is
  console.warn('Non-standard UUID format detected:', uuid);
  return uuid;
};

const MyStore = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();

  const [shop, setShop] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<{
    shop_name: string;
    shop_slug: string;
    description: string;
    whatsapp_number: string;
    enable_paystack: boolean;
    enable_bank_transfer: boolean;
    bank_account_name: string;
    bank_name: string;
    bank_account_number: string;
    paystack_public_key: string;
    logo_url: string;
    banner_url: string;
    primary_color: string;
    secondary_color: string;
    accent_color: string;
    theme_mode: 'light' | 'dark' | 'auto';
    font_style: 'modern' | 'classic' | 'playful' | 'elegant';
  }>({
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
    logo_url: "",
    banner_url: "",
    primary_color: "#D4AF37",
    secondary_color: "#2E1A47",
    accent_color: "#FF6B35",
    theme_mode: "auto",
    font_style: "modern",
  });

  const { hasSeenTour, isRunning, startTour, endTour, resetTour } =
    useTour("my-store");

  const handleTourCallback = (data: CallBackProps) => {
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(data.status as any)) {
      endTour(data.status === STATUS.FINISHED);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      user ? loadShop() : navigate("/auth/login");
    }
  }, [authLoading, user]);

  const loadShop = async () => {
    try {
      // Validate user ID before proceeding
      if (!user?.id) {
        toast({
          title: "User not found",
          description: "Please log in again",
          variant: "destructive",
        });
        navigate("/auth/login");
        return;
      }

      // Check for invalid ID values
      if (user.id === 'undefined' || user.id === 'null') {
        toast({
          title: "Invalid user session",
          description: "Please log out and log in again",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      let formattedUserId;
      try {
        formattedUserId = formatUUIDWithHyphens(user.id);
        console.log("Formatted User ID for API call:", formattedUserId);
      } catch (error: any) {
        toast({
          title: "Invalid user ID",
          description: error.message,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      const res = await shopService.getShopByOwner(formattedUserId);
      const data = Array.isArray(res.data) ? res.data[0] : res.data;

      if (!data) {
        toast({
          title: "No Store Found",
          description: "You haven't created a store yet",
        });
        setIsLoading(false);
        return;
      }

      setShop(data);

      setFormData({
        shop_name: data.shop_name || data.name,
        shop_slug: data.shop_slug || data.slug,
        description: data.description || "",
        whatsapp_number: data.whatsapp_number || "",
        enable_paystack: ["paystack", "both"].includes(data.payment_method),
        enable_bank_transfer:
          ["bank_transfer", "both"].includes(data.payment_method) ||
          !data.payment_method,
        bank_account_name: data.bank_account_name || "",
        bank_name: data.bank_name || "",
        bank_account_number: data.bank_account_number || "",
        paystack_public_key: data.paystack_public_key || "",
        logo_url: data.logo_url || "",
        banner_url: data.banner_url || "",
        // Appearance settings
        primary_color: data.primary_color || "#D4AF37",
        secondary_color: data.secondary_color || "#2E1A47",
        accent_color: data.accent_color || "#FF6B35",
        theme_mode: (data.theme_mode || "auto") as "light" | "dark" | "auto",
        font_style: (data.font_style || "modern") as "modern" | "classic" | "playful" | "elegant",
      });

      // Also format the shop ID when fetching products
      try {
        const formattedShopId = formatUUIDWithHyphens(data.id);
        const productsRes = await productService.getProducts({
          shopId: formattedShopId,
        });
        setProducts(productsRes.data || []);
      } catch (productError: any) {
        console.error("Error loading products:", productError);
        // Don't show toast for product loading errors as they're not critical
      }
    } catch (error: any) {
      console.error("Error loading shop:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load store",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Enhanced shop ID validation
    if (!shop?.id) {
      toast({
        title: "Error",
        description: "Shop data not loaded. Please refresh the page and try again.",
        variant: "destructive",
      });
      console.error('Shop ID is undefined:', shop);
      return;
    }

    // Validate that shop.id is not the string 'undefined'
    if (shop.id === 'undefined' || shop.id === 'null') {
      toast({
        title: "Invalid Shop ID",
        description: "Shop data is corrupted. Please refresh the page.",
        variant: "destructive",
      });
      console.error('Invalid shop ID value:', shop.id);
      return;
    }

    const parsed = shopSchema.safeParse(formData);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.errors.forEach((e) => {
        if (e.path[0]) errs[e.path[0] as string] = e.message;
      });
      setErrors(errs);
      
      if (errs.enable_bank_transfer) {
        toast({
          title: "Payment Method Required",
          description: "Please enable at least one payment method",
          variant: "destructive",
        });
      }
      return;
    }

    setIsSaving(true);

    try {
      const payment_method =
        formData.enable_paystack && formData.enable_bank_transfer
          ? "both"
          : formData.enable_paystack
          ? "paystack"
          : "bank_transfer";

      // Fix: Add validation before formatting - THIS WAS THE MAIN ISSUE
      let formattedShopId;
      try {
        formattedShopId = formatUUIDWithHyphens(shop.id);
        console.log('Formatted shop ID:', formattedShopId);
      } catch (formatError: any) {
        toast({
          title: "Invalid Shop ID",
          description: formatError.message || "Failed to process shop ID",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }

      // Create payload only with necessary fields
      const payload: any = {
        shop_name: formData.shop_name,
        shop_slug: formData.shop_slug,
        description: formData.description,
        whatsapp_number: formData.whatsapp_number,
        payment_method,
        logo_url: formData.logo_url,
        banner_url: formData.banner_url,
        // Appearance settings
        primary_color: formData.primary_color,
        secondary_color: formData.secondary_color,
        accent_color: formData.accent_color,
        theme_mode: formData.theme_mode,
        font_style: formData.font_style,
      };

      // Add bank details only if bank transfer is enabled
      if (formData.enable_bank_transfer) {
        payload.bank_account_name = formData.bank_account_name;
        payload.bank_name = formData.bank_name;
        payload.bank_account_number = formData.bank_account_number;
      } else {
        // Clear bank details if disabled
        payload.bank_account_name = "";
        payload.bank_name = "";
        payload.bank_account_number = "";
      }

      // Add Paystack details only if Paystack is enabled
      if (formData.enable_paystack) {
        payload.paystack_public_key = formData.paystack_public_key;
      } else {
        // Clear Paystack key if disabled
        payload.paystack_public_key = "";
      }

      // Log for debugging
      console.log('Updating shop with ID:', formattedShopId);
      console.log('Payload:', payload);

      await shopService.updateShop(formattedShopId, payload);

      toast({ 
        title: "Success", 
        description: "Store updated successfully" 
      });
      loadShop();
    } catch (error: any) {
      console.error("Error updating shop:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save store",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8" />
        <span className="ml-3">Loading shop data...</span>
      </div>
    );
  }

  if (!shop && !isLoading) {
    return (
      <PageWrapper patternVariant="dots" patternOpacity={0.5}>
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
            <Store className="w-16 h-16 mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">No shop found</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              You haven't created a shop yet. Create one to start selling your products or services.
            </p>
            <Button onClick={() => navigate('/create-shop')} size="lg">
              Create Your First Shop
            </Button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper patternVariant="dots" patternOpacity={0.5}>
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-3xl">
        <Button variant="ghost" onClick={() => navigate("/dashboard")} className="min-h-[44px] px-2 sm:px-4 mb-4">
          <ArrowLeft className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Back to Dashboard</span>
        </Button>

        <Card className="border-primary/10">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-xl sm:text-2xl">Store Information</CardTitle>
            <CardDescription className="text-sm">Manage your store settings and payment methods</CardDescription>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              <div className="space-y-2">
                <Label htmlFor="shop_name">Store Name</Label>
                <Input
                  id="shop_name"
                  value={formData.shop_name}
                  onChange={(e) =>
                    setFormData({ ...formData, shop_name: e.target.value })
                  }
                  placeholder="Enter store name"
                  className={errors.shop_name ? "border-red-500" : ""}
                  disabled={!shop?.id}
                />
                {errors.shop_name && (
                  <p className="text-red-500 text-sm">{errors.shop_name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="shop_slug">Store Slug</Label>
                <Input
                  id="shop_slug"
                  value={formData.shop_slug}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      shop_slug: e.target.value.toLowerCase(),
                    })
                  }
                  placeholder="store-slug"
                  className={errors.shop_slug ? "border-red-500" : ""}
                  disabled={!shop?.id}
                />
                {errors.shop_slug && (
                  <p className="text-red-500 text-sm">{errors.shop_slug}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe your store"
                  className="min-h-[100px]"
                  disabled={!shop?.id}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp_number">WhatsApp Number</Label>
                <Input
                  id="whatsapp_number"
                  value={formData.whatsapp_number}
                  onChange={(e) =>
                    setFormData({ ...formData, whatsapp_number: e.target.value })
                  }
                  placeholder="+2348012345678"
                  className={errors.whatsapp_number ? "border-red-500" : ""}
                  disabled={!shop?.id}
                />
                {errors.whatsapp_number && (
                  <p className="text-red-500 text-sm">{errors.whatsapp_number}</p>
                )}
              </div>

              {/* LOGO */}
              <div className="space-y-2">
                <Label>Store Logo</Label>
                <ImageUpload
                  label="Upload Logo"
                  value={formData.logo_url}
                  onChange={(url) =>
                    setFormData({ ...formData, logo_url: url })
                  }
                  folder="shop-images"
                  disabled={!shop?.id}
                />
                {formData.logo_url && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 mb-2">Current Logo:</p>
                    <img
                      src={formData.logo_url}
                      alt="Store Logo"
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>

              {/* BANNER */}
              <div className="space-y-2">
                <Label>Store Banner</Label>
                <ImageUpload
                  label="Upload Banner"
                  value={formData.banner_url}
                  onChange={(url) =>
                    setFormData({ ...formData, banner_url: url })
                  }
                  folder="shop-images"
                  disabled={!shop?.id}
                />
                {formData.banner_url && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 mb-2">Current Banner:</p>
                    <img
                      src={formData.banner_url}
                      alt="Store Banner"
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>

              {/* Payment Methods */}
              <div className="space-y-4">
                <Label className="text-sm sm:text-base">Payment Methods</Label>
                <div className="flex items-center space-x-2 min-h-[44px]">
                  <Checkbox
                    id="enable_bank_transfer"
                    checked={formData.enable_bank_transfer}
                    onCheckedChange={(checked) => {
                      setFormData({ 
                        ...formData, 
                        enable_bank_transfer: checked as boolean 
                      });
                      if (errors.enable_bank_transfer) {
                        setErrors({ ...errors, enable_bank_transfer: "" });
                      }
                    }}
                    className="h-5 w-5"
                    disabled={!shop?.id}
                  />
                  <Label htmlFor="enable_bank_transfer" className="text-sm sm:text-base cursor-pointer">Enable Bank Transfer</Label>
                </div>

                <div className="flex items-center space-x-2 min-h-[44px]">
                  <Checkbox
                    id="enable_paystack"
                    checked={formData.enable_paystack}
                    onCheckedChange={(checked) => {
                      setFormData({ 
                        ...formData, 
                        enable_paystack: checked as boolean 
                      });
                      if (errors.paystack_public_key) {
                        setErrors({ ...errors, paystack_public_key: "" });
                      }
                    }}
                    className="h-5 w-5"
                    disabled={!shop?.id}
                  />
                  <Label htmlFor="enable_paystack" className="text-sm sm:text-base cursor-pointer">Enable Paystack</Label>
                </div>

                {errors.enable_bank_transfer && (
                  <p className="text-red-500 text-xs sm:text-sm">{errors.enable_bank_transfer}</p>
                )}
              </div>

              {/* Bank Transfer Details */}
              {formData.enable_bank_transfer && (
                <div className="space-y-4 border border-border/50 p-3 sm:p-4 rounded-lg bg-muted/30">
                  <Label className="text-base sm:text-lg font-semibold">Bank Transfer Details</Label>
                  <div className="space-y-2">
                    <Label htmlFor="bank_account_name" className="text-sm">Account Name</Label>
                    <Input
                      id="bank_account_name"
                      value={formData.bank_account_name}
                      onChange={(e) =>
                        setFormData({ ...formData, bank_account_name: e.target.value })
                      }
                      placeholder="John Doe"
                      className={`min-h-[44px] ${errors.bank_account_name ? "border-red-500" : ""}`}
                      disabled={!shop?.id}
                    />
                    {errors.bank_account_name && (
                      <p className="text-red-500 text-sm">{errors.bank_account_name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bank_name" className="text-sm">Bank Name</Label>
                    <Input
                      id="bank_name"
                      value={formData.bank_name}
                      onChange={(e) =>
                        setFormData({ ...formData, bank_name: e.target.value })
                      }
                      placeholder="First Bank"
                      className="min-h-[44px]"
                      disabled={!shop?.id}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bank_account_number" className="text-sm">Account Number</Label>
                    <Input
                      id="bank_account_number"
                      value={formData.bank_account_number}
                      onChange={(e) =>
                        setFormData({ ...formData, bank_account_number: e.target.value })
                      }
                      placeholder="1234567890"
                      className="min-h-[44px]"
                      disabled={!shop?.id}
                    />
                  </div>
                  
                  <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Identity Verification</p>
                        <p className="text-xs text-muted-foreground">Verify your bank account to enable payouts</p>
                      </div>
                    </div>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate('/identity-verification')}
                      className="w-full sm:w-auto min-h-[40px]"
                      disabled={!shop?.id}
                    >
                      Verify Now
                    </Button>
                  </div>
                </div>
              )}

              {/* Paystack Details */}
              {formData.enable_paystack && (
                <div className="space-y-4 border border-border/50 p-3 sm:p-4 rounded-lg bg-muted/30">
                  <Label className="text-base sm:text-lg font-semibold">Paystack Details</Label>
                  <div className="space-y-2">
                    <Label htmlFor="paystack_public_key">Paystack Public Key</Label>
                    <Input
                      id="paystack_public_key"
                      value={formData.paystack_public_key}
                      onChange={(e) =>
                        setFormData({ ...formData, paystack_public_key: e.target.value })
                      }
                      placeholder="pk_live_xxxxxxxx"
                      className={`min-h-[44px] ${errors.paystack_public_key ? "border-red-500" : ""}`}
                      disabled={!shop?.id}
                    />
                    {errors.paystack_public_key && (
                      <p className="text-red-500 text-sm">{errors.paystack_public_key}</p>
                    )}
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                disabled={isSaving || !shop?.id} 
                className="w-full min-h-[48px] text-base"
              >
                {!shop?.id ? "Loading shop data..." : isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <div className="mt-6">
          <ShopAppearanceSettings
            settings={{
              primary_color: formData.primary_color,
              secondary_color: formData.secondary_color,
              accent_color: formData.accent_color,
              theme_mode: formData.theme_mode,
              font_style: formData.font_style,
            }}
            onChange={(newSettings) => setFormData({ ...formData, ...newSettings })}
            disabled={!shop?.id}
          />
          <Button 
            onClick={handleSubmit} 
            disabled={isSaving || !shop?.id} 
            className="w-full min-h-[48px] text-base mt-4"
          >
            {!shop?.id ? "Loading shop data..." : isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Appearance"
            )}
          </Button>
        </div>

        {shop && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Your Store URL</CardTitle>
              <CardDescription>
                Share this link with your customers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Input
                  value={`${window.location.origin}/shop/${formData.shop_slug}`}
                  readOnly
                  className="font-mono"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/shop/${formData.shop_slug}`
                    );
                    setIsCopied(true);
                    setTimeout(() => setIsCopied(false), 2000);
                    toast({
                      title: "Copied!",
                      description: "Store URL copied to clipboard",
                    });
                  }}
                >
                  {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Joyride
        steps={myStoreTourSteps}
        run={isRunning}
        callback={handleTourCallback}
        tooltipComponent={TourTooltip}
        continuous
        showSkipButton
        showProgress
      />
    </PageWrapper>
  );
};

export default MyStore;