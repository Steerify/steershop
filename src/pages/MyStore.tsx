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
  AlertCircle,
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

// DEBUG VERSION of formatUUIDWithHyphens
const formatUUIDWithHyphens = (uuid: any): string => {
  console.log('🚨 DEBUG formatUUIDWithHyphens called with:', uuid, 'type:', typeof uuid);
  
  // Handle all invalid cases
  if (uuid === undefined) {
    console.error('❌ UUID is undefined');
    throw new Error('UUID is undefined - shop data may not be loaded');
  }
  
  if (uuid === null) {
    console.error('❌ UUID is null');
    throw new Error('UUID is null');
  }
  
  if (typeof uuid !== 'string') {
    console.error('❌ UUID is not a string:', uuid, 'type:', typeof uuid);
    throw new Error(`UUID is not a string (type: ${typeof uuid})`);
  }
  
  if (uuid.trim() === '') {
    console.error('❌ UUID is empty string');
    throw new Error('UUID is empty string');
  }
  
  if (uuid === 'undefined') {
    console.error('❌ UUID is the string "undefined"');
    throw new Error('UUID is the string "undefined" - shop data may be corrupted');
  }
  
  if (uuid === 'null') {
    console.error('❌ UUID is the string "null"');
    throw new Error('UUID is the string "null"');
  }
  
  const cleanUuid = uuid.replace(/-/g, '');
  
  // Check if it's a 32-character hex string (standard UUID without hyphens)
  if (cleanUuid.length === 32 && /^[a-f0-9]{32}$/i.test(cleanUuid)) {
    const formatted = `${cleanUuid.substring(0, 8)}-${cleanUuid.substring(8, 12)}-${cleanUuid.substring(12, 16)}-${cleanUuid.substring(16, 20)}-${cleanUuid.substring(20)}`;
    console.log('✅ UUID formatted successfully:', formatted);
    return formatted;
  }
  
  // If it's already in UUID format with hyphens
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(uuid)) {
    console.log('✅ UUID already in correct format:', uuid);
    return uuid;
  }
  
  console.warn('⚠️ Non-standard UUID format detected:', uuid);
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
  const [debugInfo, setDebugInfo] = useState<string>('');

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
    console.log('🔄 MyStore useEffect - authLoading:', authLoading, 'user:', user?.id);
    if (!authLoading) {
      if (user) {
        console.log('👤 User authenticated, loading shop...');
        loadShop();
      } else {
        console.log('🔐 No user, redirecting to login');
        navigate("/auth/login");
      }
    }
  }, [authLoading, user]);

  const loadShop = async () => {
    console.log('🔍 loadShop called, user ID:', user?.id);
    
    try {
      if (!user?.id) {
        console.error('❌ No user ID available');
        toast({
          title: "Authentication Error",
          description: "Please log in again",
          variant: "destructive",
        });
        navigate("/auth/login");
        return;
      }

      console.log('📦 Raw user ID:', user.id, 'type:', typeof user.id);
      
      let formattedUserId;
      try {
        formattedUserId = formatUUIDWithHyphens(user.id);
        console.log('✅ Formatted user ID:', formattedUserId);
      } catch (error: any) {
        console.error('❌ Failed to format user ID:', error);
        setDebugInfo(`Failed to format user ID: ${error.message}. Raw ID: ${user.id}`);
        toast({
          title: "Invalid User ID",
          description: `Please contact support. Error: ${error.message}`,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      console.log('📞 Calling shopService.getShopByOwner with:', formattedUserId);
      const res = await shopService.getShopByOwner(formattedUserId);
      console.log('📊 Shop service response:', res);
      
      const data = Array.isArray(res.data) ? res.data[0] : res.data;
      console.log('🏪 Shop data received:', data);

      if (!data) {
        console.log('⚠️ No shop data returned');
        toast({
          title: "No Store Found",
          description: "You haven't created a store yet",
        });
        setIsLoading(false);
        return;
      }

      console.log('✅ Shop data loaded successfully:', {
        id: data.id,
        name: data.shop_name || data.name,
        hasId: !!data.id,
        idType: typeof data.id,
        idValue: data.id
      });

      setShop(data);
      setDebugInfo(`Shop loaded. ID: ${data.id}, Type: ${typeof data.id}`);

      setFormData({
        shop_name: data.shop_name || data.name || "",
        shop_slug: data.shop_slug || data.slug || "",
        description: data.description || "",
        whatsapp_number: data.whatsapp_number || "",
        enable_paystack: ["paystack", "both"].includes(data.payment_method || ""),
        enable_bank_transfer:
          ["bank_transfer", "both"].includes(data.payment_method || "") ||
          !data.payment_method,
        bank_account_name: data.bank_account_name || "",
        bank_name: data.bank_name || "",
        bank_account_number: data.bank_account_number || "",
        paystack_public_key: data.paystack_public_key || "",
        logo_url: data.logo_url || "",
        banner_url: data.banner_url || "",
        primary_color: data.primary_color || "#D4AF37",
        secondary_color: data.secondary_color || "#2E1A47",
        accent_color: data.accent_color || "#FF6B35",
        theme_mode: (data.theme_mode || "auto") as "light" | "dark" | "auto",
        font_style: (data.font_style || "modern") as "modern" | "classic" | "playful" | "elegant",
      });

      // Load products
      if (data.id) {
        try {
          const formattedShopId = formatUUIDWithHyphens(data.id);
          console.log('🛍️ Loading products for shop ID:', formattedShopId);
          const productsRes = await productService.getProducts({
            shopId: formattedShopId,
          });
          setProducts(productsRes.data || []);
        } catch (productError: any) {
          console.error('❌ Error loading products:', productError);
        }
      }
    } catch (error: any) {
      console.error('💥 Error loading shop:', error);
      setDebugInfo(`Error: ${error.message}. Stack: ${error.stack}`);
      toast({
        title: "Error Loading Store",
        description: error.message || "Failed to load store",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      console.log('🏁 loadShop finished');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔄 handleSubmit called');
    console.log('🏪 Current shop state:', shop);
    
    setErrors({});
    setDebugInfo('');

    // Debug shop state
    console.log('🔍 Shop debug:', {
      hasShop: !!shop,
      shopId: shop?.id,
      shopIdType: typeof shop?.id,
      shopIdValue: String(shop?.id),
      shopObject: shop
    });

    if (!shop) {
      console.error('❌ Shop object is null');
      setDebugInfo('Shop object is null');
      toast({
        title: "Shop Not Loaded",
        description: "Please wait for shop to load or refresh the page",
        variant: "destructive",
      });
      return;
    }

    if (!shop.id) {
      console.error('❌ Shop ID is falsy:', shop.id);
      setDebugInfo(`Shop ID is falsy: ${shop.id} (type: ${typeof shop.id})`);
      toast({
        title: "Shop ID Missing",
        description: "Shop ID is not available. Please refresh the page.",
        variant: "destructive",
      });
      return;
    }

    // Check for string 'undefined'
    if (String(shop.id) === 'undefined') {
      console.error('❌ Shop ID is string "undefined"');
      setDebugInfo('Shop ID is the string "undefined" - data corruption detected');
      toast({
        title: "Data Corruption",
        description: "Shop data is corrupted. Please refresh or contact support.",
        variant: "destructive",
      });
      return;
    }

    const parsed = shopSchema.safeParse(formData);
    if (!parsed.success) {
      console.error('❌ Form validation failed:', parsed.error.errors);
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
    setDebugInfo('Saving...');

    try {
      const payment_method =
        formData.enable_paystack && formData.enable_bank_transfer
          ? "both"
          : formData.enable_paystack
          ? "paystack"
          : "bank_transfer";

      console.log('🆔 Attempting to format shop ID:', shop.id);
      
      let formattedShopId;
      try {
        formattedShopId = formatUUIDWithHyphens(shop.id);
        console.log('✅ Formatted shop ID:', formattedShopId);
        setDebugInfo(`Formatted shop ID: ${formattedShopId}`);
      } catch (formatError: any) {
        console.error('❌ Failed to format shop ID:', formatError);
        setDebugInfo(`Format error: ${formatError.message}. Raw ID: ${shop.id}`);
        toast({
          title: "Invalid Shop ID",
          description: formatError.message,
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }

      // Create payload
      const payload: any = {
        shop_name: formData.shop_name,
        shop_slug: formData.shop_slug,
        description: formData.description,
        whatsapp_number: formData.whatsapp_number,
        payment_method,
        logo_url: formData.logo_url,
        banner_url: formData.banner_url,
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
        payload.bank_account_name = "";
        payload.bank_name = "";
        payload.bank_account_number = "";
      }

      // Add Paystack details only if Paystack is enabled
      if (formData.enable_paystack) {
        payload.paystack_public_key = formData.paystack_public_key;
      } else {
        payload.paystack_public_key = "";
      }

      console.log('📤 Calling shopService.updateShop with:', {
        id: formattedShopId,
        payload: payload
      });

      const result = await shopService.updateShop(formattedShopId, payload);
      console.log('✅ Update successful:', result);

      toast({ 
        title: "Success", 
        description: "Store updated successfully" 
      });
      
      // Reload shop data
      await loadShop();
      setDebugInfo('Update successful');
      
    } catch (error: any) {
      console.error('💥 Error updating shop:', error);
      setDebugInfo(`Update error: ${error.message}. Stack: ${error.stack}`);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to save store",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
      console.log('🏁 handleSubmit finished');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Loader2 className="animate-spin w-8 h-8 mb-4" />
        <span className="text-lg">Loading shop data...</span>
        <span className="text-sm text-muted-foreground mt-2">User ID: {user?.id}</span>
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
        {/* Debug Info Bar - Remove in production */}
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-700 dark:text-yellow-400">Debug Info</span>
          </div>
          <div className="text-xs font-mono text-yellow-600 dark:text-yellow-500 break-all">
            {debugInfo || 'No debug info yet'}
          </div>
          <div className="mt-2 text-xs">
            Shop ID: <span className="font-mono">{shop?.id}</span> | 
            Type: <span className="font-mono">{typeof shop?.id}</span>
          </div>
        </div>

        <Button variant="ghost" onClick={() => navigate("/dashboard")} className="min-h-[44px] px-2 sm:px-4 mb-4">
          <ArrowLeft className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Back to Dashboard</span>
        </Button>

        <Card className="border-primary/10">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl sm:text-2xl">Store Information</CardTitle>
                <CardDescription className="text-sm">Manage your store settings and payment methods</CardDescription>
              </div>
              <div className="text-xs text-muted-foreground">
                Shop ID: {shop?.id?.substring(0, 8)}...
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              {/* ... rest of your form fields remain the same ... */}
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
                />
                {errors.shop_name && (
                  <p className="text-red-500 text-sm">{errors.shop_name}</p>
                )}
              </div>

              {/* ... other form fields ... */}

              <Button 
                type="submit" 
                disabled={isSaving} 
                className="w-full min-h-[48px] text-base"
              >
                {isSaving ? (
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
          />
          <Button 
            onClick={handleSubmit} 
            disabled={isSaving} 
            className="w-full min-h-[48px] text-base mt-4"
          >
            {isSaving ? (
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