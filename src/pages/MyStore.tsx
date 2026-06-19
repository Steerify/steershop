import { useEffect, useState, useCallback } from "react";
import { MobileBottomNav } from "@/components/MobileBottomNav";
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
import { Badge } from "@/components/ui/badge";
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
  X,
  HelpCircle,
  ChevronDown,
  AlertTriangle,
  Clock,
  Sparkles,
} from "lucide-react";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { ImageUpload } from "@/components/ImageUpload";
import { QRCodeSVG } from "qrcode.react";
import { StoreFlyerTemplate } from "@/components/StoreFlyerTemplate";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { z } from "zod";
import { AdirePattern } from "@/components/patterns/AdirePattern";
import { PageWrapper } from "@/components/PageWrapper";
import logo from "@/assets/steersolo-logo.png";
import Joyride, { CallBackProps, STATUS } from "react-joyride";
import { useTour } from "@/hooks/useTour";
import { TourTooltip } from "@/components/tours/TourTooltip";
import { myStoreTourSteps } from "@/components/tours/tourSteps";
import { TourButton } from "@/components/tours/TourButton";
import { Shop } from "@/types/api";
import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import { ShopStatusBadge, ShopStatus, getShopStatusFromProfile } from "@/components/ShopStatusBadge";
import { StorefrontCustomizer } from "@/components/StorefrontCustomizer";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ShopAvatar } from "@/components/ShopAvatar";
import { KYCLevel2Form } from "@/components/kyc/KYCLevel2Form";
import { useFormDraft, readFormDraft } from "@/hooks/useFormDraft";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";

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
  .refine((d) => d.enable_paystack || d.enable_bank_transfer, {
    message: "Enable at least one payment method",
  })
  .refine(
    (d) =>
      !d.enable_bank_transfer ||
      (d.bank_account_name && d.bank_name && d.bank_account_number),
    { message: "Complete bank details required" }
  )
  .refine(
    (d) => !d.enable_paystack || d.paystack_public_key,
    { message: "Paystack public key required" }
  );

// Helper function to format UUID with hyphens
const formatUUIDWithHyphens = (uuid: string): string => {
  if (!uuid) return uuid;
  
  // Remove any existing hyphens
  const cleanUuid = uuid.replace(/-/g, '');
  
  // Check if it's a 32-character hex string (standard UUID without hyphens)
  if (cleanUuid.length === 32 && /^[a-f0-9]{32}$/i.test(cleanUuid)) {
    // Format with hyphens in standard UUID format: 8-4-4-4-12
    return `${cleanUuid.substring(0, 8)}-${cleanUuid.substring(8, 12)}-${cleanUuid.substring(12, 16)}-${cleanUuid.substring(16, 20)}-${cleanUuid.substring(20)}`;
  }
  
  // Return as-is if not a standard UUID format
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
  const [showPaystackGuide, setShowPaystackGuide] = useState(false);
  const [shopStatus, setShopStatus] = useState<{ status: ShopStatus; daysRemaining: number }>({ status: 'trial', daysRemaining: 15 });
  const [isPremiumPlan, setIsPremiumPlan] = useState(false);

  const [showPostCreatePrompt, setShowPostCreatePrompt] = useState(false);
  const [showInlineVerify, setShowInlineVerify] = useState(false);
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const [isGeneratingSEO, setIsGeneratingSEO] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [activeTab, setActiveTab] = useState("store-info");

  // Unsaved changes warning
  useUnsavedChanges(isDirty);

  // Draft key — only active for NEW store creation (no existing shop)
  const draftKey = user?.id && !shop ? `mystore_draft_${user.id}` : '';

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
    logo_url: "",
    banner_url: "",
    city: "",
    state: "",
  });

  // Auto-save the form to sessionStorage while creating a new store
  const { clearDraft } = useFormDraft(draftKey, formData, !!draftKey);

  // Slug availability state
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);
  const debouncedSlug = useDebounce(formData.shop_slug, 500);

  const { hasSeenTour, isRunning, startTour, endTour, resetTour } =
    useTour("my-store");

  const handleTourCallback = (data: CallBackProps) => {
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(data.status as any)) {
      endTour(data.status === STATUS.FINISHED);
    }
  };

  // Check slug availability when debounced slug changes
  useEffect(() => {
    const checkSlugAvailability = async () => {
      if (!debouncedSlug || debouncedSlug.length < 2) {
        setSlugAvailable(null);
        return;
      }

      setCheckingSlug(true);
      try {
        const { data, error } = await supabase
          .from('shops')
          .select('id')
          .eq('shop_slug', debouncedSlug.toLowerCase())
          .neq('id', shop?.id || '00000000-0000-0000-0000-000000000000')
          .maybeSingle();

        if (error) {
          console.error('Slug check error:', error);
          setSlugAvailable(null);
        } else {
          setSlugAvailable(!data); // Available if no existing shop found
        }
      } catch (error) {
        console.error('Slug check error:', error);
        setSlugAvailable(null);
      } finally {
        setCheckingSlug(false);
      }
    };

    checkSlugAvailability();
  }, [debouncedSlug, shop?.id]);

  useEffect(() => {
    if (!authLoading) {
      user ? loadShop() : navigate("/auth/login");
    }
  }, [authLoading, user]);

  // Restore draft when visiting the page for new store creation
  useEffect(() => {
    if (!user?.id || shop) return;
    const draft = readFormDraft<typeof formData>(`mystore_draft_${user.id}`);
    if (draft && draft.shop_name) {
      setFormData(f => ({ ...f, ...draft }));
      setShowDraftBanner(true);
    }
  }, [user?.id]);

  const loadShop = async () => {
    try {
      // Format the user ID to ensure it has hyphens for UUID
      const formattedUserId = formatUUIDWithHyphens(user.id);
      console.log("Formatted User ID for API call:", formattedUserId);
      
      // Fetch profile to get subscription status
      const { data: profileData } = await supabase
        .from('profiles')
        .select('is_subscribed, subscription_expires_at')
        .eq('id', user.id)
        .single();
      
      if (profileData) {
        setShopStatus(getShopStatusFromProfile(profileData));
        // Check if premium (Pro or Business or Active Trial)
        const subStatus = getShopStatusFromProfile(profileData);
        setIsPremiumPlan(subStatus.status === 'active' || subStatus.status === 'trial');
      }
      
      const res = await shopService.getShopByOwner(formattedUserId);
      const data = Array.isArray(res.data) ? res.data[0] : res.data;

      if (!data) {
        toast({
          title: "Setup Required",
          description: "Please complete your store setup in the dashboard",
        });
        navigate("/dashboard");
        return;
      }

      setShop(data);

      // If shop is inactive, show pending status
      if (!data.is_active) {
        setShopStatus({ status: 'pending', daysRemaining: 0 });
      }

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
        city: data.city || "",
        state: data.state || "",
      });

      // Also format the shop ID when fetching products
      const formattedShopId = formatUUIDWithHyphens(data.id);
      const productsRes = await productService.getProducts({
        shopId: formattedShopId,
      });
      setProducts(productsRes.data || []);
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

    const parsed = shopSchema.safeParse(formData);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      let firstErrorField: string | null = null;
      
      parsed.error.errors.forEach((e) => {
        if (e.path[0]) {
          const field = e.path[0] as string;
          errs[field] = e.message;
          if (!firstErrorField) firstErrorField = field;
        }
      });
      setErrors(errs);
      
      toast({ title: "Please fill missing fields", description: "Some required information is missing or invalid.", variant: "destructive" });

      // Determine which tab the error is in
      const paymentFields = ['bank_account_name', 'bank_name', 'bank_account_number', 'paystack_public_key', 'enable_paystack', 'enable_bank_transfer'];
      
      if (firstErrorField && paymentFields.includes(firstErrorField)) {
        setActiveTab("payment-setup");
      } else {
        setActiveTab("store-info");
      }

      // Scroll to the error element after a short delay to allow tab switch
      setTimeout(() => {
        if (firstErrorField) {
          const el = document.getElementById(firstErrorField);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.focus({ preventScroll: true });
          }
        }
      }, 150);
      
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

      const shopData: Partial<Shop> = {
        shop_name: formData.shop_name,
        shop_slug: formData.shop_slug,
        description: formData.description,
        whatsapp_number: formData.whatsapp_number,
        logo_url: formData.logo_url,
        banner_url: formData.banner_url,
        payment_method,
        bank_account_name: formData.bank_account_name,
        bank_name: formData.bank_name,
        bank_account_number: formData.bank_account_number,
        paystack_public_key: formData.paystack_public_key,
        city: formData.city,
        state: formData.state,
      };

      let currentShopId: string;

      if (shop) {
        currentShopId = formatUUIDWithHyphens(shop.id);
        await shopService.updateShop(currentShopId, shopData);
      } else {
        const createReq = {
          name: shopData.shop_name!,
          slug: shopData.shop_slug!,
          description: shopData.description || "",
          whatsapp: shopData.whatsapp_number!,
        };
        const createRes = await shopService.createShop(createReq);
        currentShopId = createRes.data.id;
        await shopService.updateShop(currentShopId, shopData);
        setShowPostCreatePrompt(true);
      }

      toast({ title: "Success", description: shop ? "Store updated" : "Store created" });
      clearDraft(); // wipe draft on successful save
      setShowDraftBanner(false);
      setIsDirty(false);
      loadShop();

      // Automatically run SEO generation in the background
      if (currentShopId) {
        supabase.functions.invoke('generate-shop-seo-dna', {
          body: { shop_id: currentShopId }
        }).catch(err => console.error("Background SEO generation failed:", err));
      }
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

  // The SEO generation now happens automatically in the background after save or via database triggers.

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <PageWrapper patternVariant="dots" patternOpacity={0.5}>
      <Dialog open={showPostCreatePrompt} onOpenChange={setShowPostCreatePrompt}>
        <DialogContent className="sm:max-w-lg">
          <div className="text-center pt-2 pb-1">
            <div className="text-5xl mb-3 animate-bounce inline-block">🎉</div>
            <DialogTitle className="text-2xl font-bold mb-1">Your Store is Live!</DialogTitle>
            <p className="text-muted-foreground text-sm mb-4">
              Congratulations! <strong>{formData.shop_name}</strong> is now on SteerSolo.
            </p>
            {/* Store URL */}
            <div className="flex items-center gap-1 bg-muted rounded-xl p-3 mb-5 text-left">
              <span className="text-xs text-muted-foreground truncate flex-1 font-mono">
                steersolo.com/shop/<strong>{formData.shop_slug}</strong>
              </span>
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 shrink-0"
                onClick={() => {
                  navigator.clipboard.writeText(`https://steersolo.com/shop/${formData.shop_slug}`);
                  setIsCopied(true);
                  setTimeout(() => setIsCopied(false), 2000);
                }}
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              </Button>
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 shrink-0"
                onClick={() => window.open(`https://steersolo.com/shop/${formData.shop_slug}`, '_blank')}
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </div>
            {/* Next steps */}
            <div className="space-y-2 text-left mb-2">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Your next steps</p>
              {[
                { emoji: "📦", label: "Add your first product", desc: "Start with 3–5 items with clear photos & prices" },
                { emoji: "💳", label: "Complete payment setup", desc: "Enable bank transfer or Paystack to get paid" },
                { emoji: "📢", label: "Share your store link", desc: "Post it on WhatsApp, Instagram & Facebook" },
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/50">
                  <span className="text-lg shrink-0">{step.emoji}</span>
                  <div>
                    <p className="text-sm font-semibold leading-tight">{step.label}</p>
                    <p className="text-xs text-muted-foreground">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter className="gap-2 flex-col sm:flex-row mt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowPostCreatePrompt(false)}>
              Explore Later
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90"
              onClick={() => { setShowPostCreatePrompt(false); navigate("/products"); }}
            >
              Add Products Now →
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-28 md:pb-10 max-w-3xl">
        <Button variant="ghost" onClick={() => navigate("/dashboard")} className="min-h-[44px] px-2 sm:px-4 mb-4">
          <ArrowLeft className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Back to Dashboard</span>
        </Button>

        {showDraftBanner && (
          <Alert className="mb-4 border-amber-500/30 bg-amber-500/5 py-2">
            <Clock className="h-4 w-4 text-amber-500" />
            <AlertTitle className="text-amber-700 dark:text-amber-400 text-sm flex items-center justify-between w-full">
              <span>Restored from your last session</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0 hover:bg-amber-500/10" 
                onClick={() => setShowDraftBanner(false)}
              >
                <X className="h-3 w-3" />
              </Button>
            </AlertTitle>
          </Alert>
        )}

        {/* Shop Status Card */}
        <ShopStatusBadge 
          status={shopStatus.status} 
          daysRemaining={shopStatus.daysRemaining} 
          showUpgradeAction={true}
          variant="card"
          className="mb-4"
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 mb-6">
            <TabsTrigger value="store-info">Store Info</TabsTrigger>
            <TabsTrigger value="payment-setup">Payment Setup</TabsTrigger>
            {shop && isPremiumPlan && (
              <TabsTrigger value="appearance" className="hidden md:block">Appearance</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="store-info">
            <Card className="bg-card/50 backdrop-blur border border-primary/10 shadow-sm rounded-2xl">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-xl sm:text-2xl">Store Information</CardTitle>
                <CardDescription className="text-sm">Manage your store details and branding</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Group 1: Basic Identity */}
                  <div className="p-5 rounded-2xl bg-card/30 border border-border/40 backdrop-blur-sm space-y-4">
                    <div className="flex items-center gap-2 border-b border-border/40 pb-2 mb-2">
                      <Store className="w-4 h-4 text-primary" />
                      <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Basic Identity</h3>
                    </div>
                    
                    {/* Store Name */}
                    <div className="space-y-2">
                      <Label htmlFor="shop_name">Store Name</Label>
                      <Input
                        id="shop_name"
                        value={formData.shop_name}
                        onChange={(e) => {
                          const name = e.target.value;
                          const autoSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                          setFormData({ ...formData, shop_name: name, shop_slug: autoSlug });
                          setSlugAvailable(null);
                          setIsDirty(true);
                        }}
                        placeholder="Enter store name"
                        className={`min-h-[44px] ${errors.shop_name ? "border-red-500" : ""}`}
                      />
                      {errors.shop_name && (
                        <p className="text-red-500 text-sm">{errors.shop_name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="shop_slug">Store Link (Auto-generated)</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-xs">This is your unique store address on SteerSolo. It is automatically created from your store name.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="relative">
                        <Input
                          id="shop_slug"
                          value={formData.shop_slug}
                          readOnly
                          className="bg-muted text-muted-foreground pr-10 min-h-[44px]"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {checkingSlug && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                          {!checkingSlug && slugAvailable === true && <Check className="w-4 h-4 text-green-500" />}
                          {!checkingSlug && slugAvailable === false && <X className="w-4 h-4 text-destructive" />}
                        </div>
                      </div>
                      {slugAvailable === false && (
                        <p className="text-destructive text-sm">This store name is already taken. Try adding a unique word.</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Your store URL: steersolo.com/shop/{formData.shop_slug || 'your-store'}
                      </p>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => {
                          setFormData({ ...formData, description: e.target.value });
                          setIsDirty(true);
                        }}
                        placeholder="Describe your store"
                        className="min-h-[100px]"
                      />
                    </div>

                    {/* AI SEO DNA Section */}
                    {shop && (
                      <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <Label className="font-bold text-primary">AI SEO DNA</Label>
                          </div>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          Our AI automatically analyzes your store info and products to create a unique "SEO DNA" that helps your store rank higher on Google. This updates automatically when you make changes.
                        </p>
                        {shop.seo_dna_updated_at && (
                          <div className="pt-2 space-y-2">
                            <div className="flex flex-wrap gap-1.5">
                              {shop.seo_keywords?.slice(0, 5).map((kw: string, i: number) => (
                                <Badge key={kw} variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-none text-[10px] py-0">
                                  {kw}
                                </Badge>
                              ))}
                              {(shop.seo_keywords?.length || 0) > 5 && (
                                <span className="text-[10px] text-muted-foreground">+{shop.seo_keywords.length - 5} more</span>
                              )}
                            </div>
                            <p className="text-[10px] text-muted-foreground italic line-clamp-2">
                              "{shop.seo_description}"
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Group 2: Location & Contact */}
                  <div className="p-5 rounded-2xl bg-card/30 border border-border/40 backdrop-blur-sm space-y-4">
                    <div className="flex items-center gap-2 border-b border-border/40 pb-2 mb-2">
                      <MessageCircle className="w-4 h-4 text-accent" />
                      <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Location & Support Contact</h3>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="whatsapp_number">WhatsApp Number</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-xs">Used for customer inquiries. Include your country code (e.g., +23480...)</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Input
                        id="whatsapp_number"
                        value={formData.whatsapp_number}
                        onChange={(e) => {
                          setFormData({ ...formData, whatsapp_number: e.target.value });
                          setIsDirty(true);
                        }}
                        placeholder="+2348012345678"
                        className={`min-h-[44px] ${errors.whatsapp_number ? "border-red-500" : ""}`}
                      />
                      {errors.whatsapp_number && (
                        <p className="text-red-500 text-sm">{errors.whatsapp_number}</p>
                      )}
                    </div>

                    {/* Location Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <select
                          id="state"
                          value={formData.state}
                          onChange={(e) => {
                            setFormData({ ...formData, state: e.target.value });
                            setIsDirty(true);
                          }}
                          className="w-full h-[44px] min-h-[44px] px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        >
                          <option value="">Select State</option>
                          {[
                            "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", 
                            "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe", 
                            "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", 
                            "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", 
                            "Taraba", "Yobe", "Zamfara"
                          ].map(state => (
                            <option key={state} value={state}>{state}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">City / Area</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => {
                            setFormData({ ...formData, city: e.target.value });
                            setIsDirty(true);
                          }}
                          placeholder="e.g. Lekki, Ikeja, etc."
                          className="min-h-[44px]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Group 3: Branding & Assets */}
                  <div className="p-5 rounded-2xl bg-card/30 border border-border/40 backdrop-blur-sm space-y-4">
                    <div className="flex items-center gap-2 border-b border-border/40 pb-2 mb-2">
                      <CreditCard className="w-4 h-4 text-primary" />
                      <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Branding & Assets</h3>
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
                      />
                      <div className="mt-2">
                        <ShopAvatar
                          name={formData.shop_name || "Your Store"}
                          logoUrl={formData.logo_url}
                          className="w-32 h-32 rounded-lg border"
                          initialsClassName="text-4xl"
                        />
                      </div>
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
                      />
                      {formData.banner_url && (
                        <div className="mt-2">
                          <img
                            src={formData.banner_url}
                            alt="Store Banner"
                            className="w-full h-48 object-cover rounded-lg border"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <Button type="submit" disabled={isSaving || slugAvailable === false} className="w-full min-h-[48px] text-base shadow-sm">
                    {isSaving ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
                    ) : (
                      "Save Store Info"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
            
            {/* Store URL Card below form */}
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
                        navigator.clipboard.writeText(`${window.location.origin}/shop/${formData.shop_slug}`);
                        setIsCopied(true);
                        setTimeout(() => setIsCopied(false), 2000);
                        toast({ title: "Copied!", description: "Store URL copied" });
                      }}
                    >
                      {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="payment-setup">
            <Card className="bg-card/50 backdrop-blur border border-primary/10 shadow-sm rounded-2xl">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-xl sm:text-2xl">Payment Setup</CardTitle>
                <CardDescription className="text-sm">Configure how you receive payments</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm sm:text-base">Payment Methods</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs text-xs">Choose how you want to receive payments. Bank Transfer is manual, Paystack is automated.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="flex items-center space-x-2 min-h-[44px]">
                      <Checkbox
                        id="enable_bank_transfer"
                        checked={formData.enable_bank_transfer}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, enable_bank_transfer: checked as boolean })
                        }
                        className="h-5 w-5"
                      />
                      <Label htmlFor="enable_bank_transfer" className="text-sm sm:text-base cursor-pointer">Enable Bank Transfer</Label>
                    </div>

                    <div className="flex items-center space-x-2 min-h-[44px]">
                      <Checkbox
                        id="enable_paystack"
                        checked={formData.enable_paystack}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, enable_paystack: checked as boolean })
                        }
                        className="h-5 w-5"
                      />
                      <Label htmlFor="enable_paystack" className="text-sm sm:text-base cursor-pointer">Enable Paystack</Label>
                    </div>

                    {errors.enable_paystack && errors.enable_bank_transfer && (
                      <p className="text-red-500 text-xs sm:text-sm">{errors.enable_paystack}</p>
                    )}
                  </div>

                  {/* Bank Transfer Details */}
                  {formData.enable_bank_transfer && (
                    <div className="space-y-4 border border-border/50 p-4 sm:p-5 rounded-xl bg-card/50 backdrop-blur">
                      <Label className="text-base sm:text-lg font-semibold text-primary">Bank Transfer Details</Label>
                      <div className="space-y-2">
                        <Label htmlFor="bank_account_name" className="text-sm">Account Name</Label>
                        <Input
                          id="bank_account_name"
                          value={formData.bank_account_name}
                          onChange={(e) =>
                            setFormData({ ...formData, bank_account_name: e.target.value })
                          }
                          placeholder="John Doe"
                          className="min-h-[44px]"
                        />
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
                        />
                      </div>
                      
                      <div className="mt-4 rounded-xl border border-primary/15 overflow-hidden">
                        <button
                          type="button"
                          className="w-full p-3 flex items-center justify-between gap-3 bg-primary/5 hover:bg-primary/10 transition-colors text-left"
                          onClick={() => setShowInlineVerify(v => !v)}
                        >
                          <div className="flex items-center gap-3">
                            <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0" />
                            <div>
                              <p className="text-sm font-semibold">Identity Verification</p>
                              <p className="text-xs text-muted-foreground">Verify your bank account to enable payouts</p>
                            </div>
                          </div>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full transition-colors ${
                            showInlineVerify ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                          }`}>
                            {showInlineVerify ? 'Close ✕' : 'Verify Now'}
                          </span>
                        </button>
                        {showInlineVerify && (
                          <div className="p-3 border-t border-primary/10 bg-background">
                            <KYCLevel2Form onSuccess={() => setShowInlineVerify(false)} />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Paystack Details */}
                  {formData.enable_paystack && (
                    <div className="space-y-4 border border-border/50 p-4 sm:p-5 rounded-xl bg-card/50 backdrop-blur">
                      <Label className="text-base sm:text-lg font-semibold text-primary">Paystack Integration</Label>
                      
                      {/* Manual Input */}
                      <div className="space-y-2">
                        <Label htmlFor="paystack_public_key" className="text-sm">Paystack Public Key</Label>
                        <Input
                          id="paystack_public_key"
                          value={formData.paystack_public_key}
                          onChange={(e) =>
                            setFormData({ ...formData, paystack_public_key: e.target.value })
                          }
                          placeholder="pk_live_xxxxxxxx or pk_test_xxxxxxxx"
                          className="min-h-[44px]"
                        />
                      </div>

                      {/* Expandable Guide */}
                      <div className="rounded-lg border border-primary/20 bg-primary/5">
                        <button
                          type="button"
                          className="w-full p-3 flex items-center justify-between text-left"
                          onClick={() => setShowPaystackGuide(!showPaystackGuide)}
                        >
                          <span className="text-sm font-medium flex items-center gap-2">
                            <HelpCircle className="w-4 h-4 text-primary" />
                            How to get your Paystack Public Key
                          </span>
                          <ChevronDown className={cn(
                            "w-4 h-4 transition-transform duration-200",
                            showPaystackGuide && "rotate-180"
                          )} />
                        </button>
                        
                        {showPaystackGuide && (
                          <div className="px-3 pb-3 space-y-3 text-sm">
                            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                              <li>Go to your <a href="https://dashboard.paystack.com/#/settings/developers" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:no-underline">Paystack Dashboard → Settings → API Keys & Webhooks</a></li>
                              <li>Under "API Keys", find your <strong>Public Key</strong> (starts with pk_live_ or pk_test_)</li>
                              <li>Click the copy icon next to it</li>
                              <li>Paste it in the field above</li>
                            </ol>
                            <div className="flex items-start gap-2 p-2 bg-amber-500/10 rounded text-amber-700 dark:text-amber-400">
                              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                              <p className="text-xs">Use your <strong>Test Key</strong> (pk_test_) for testing, and <strong>Live Key</strong> (pk_live_) when you're ready to accept real payments.</p>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => window.open('https://dashboard.paystack.com/#/settings/developers', '_blank')}
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Open Paystack Dashboard
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <Button type="submit" disabled={isSaving} className="w-full min-h-[48px] text-base">
                    {isSaving ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
                    ) : (
                      "Save Payment Settings"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {shop && isPremiumPlan && (
            <TabsContent value="appearance">
              <StorefrontCustomizer 
                shopId={shop.id}
                logoUrl={shop.logo_url}
                currentAccentColor={shop.accent_color}
                currentPrimaryColor={shop.primary_color}
                currentSecondaryColor={shop.secondary_color}
                currentFontStyle={shop.font_style}
                currentThemeMode={shop.theme_mode}
              />
            </TabsContent>
          )}
        </Tabs>
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
      <MobileBottomNav />
    </PageWrapper>
  );
};

export default MyStore;
