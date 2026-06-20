import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Store,
  Package,
  Briefcase,
  Clock,
  Calendar,
  MessageCircle,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  MapPin,
  ImagePlus,
  Upload,
  X,
  Info,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import shopService from "@/services/shop.service";
import productService from "@/services/product.service";
import { uploadService } from "@/services/upload.service";
import { DigitalFileUpload } from "@/components/DigitalFileUpload";
import { supabase } from "@/integrations/supabase/client";
import { AdirePattern } from "@/components/patterns/AdirePattern";
import { useAuth } from "@/context/AuthContext";
import { useFormDraft, readFormDraft } from "@/hooks/useFormDraft";

const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
  "FCT Abuja",
];

const SHOP_CATEGORIES = [
  "Fashion & Apparel",
  "Beauty & Personal Care",
  "Electronics",
  "Home & Kitchen",
  "Food & Groceries",
  "Services & Consultation",
  "Health & Wellness",
  "Arts & Crafts",
  "Automotive",
  "Other",
];

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Please try again.";

const normalizeWhatsappNumber = (value: string) => {
  const cleaned = value.trim().replace(/[^\d+]/g, "");

  if (cleaned.startsWith("+")) return cleaned;
  if (cleaned.startsWith("0")) return `+234${cleaned.slice(1)}`;
  if (cleaned.startsWith("234")) return `+${cleaned}`;

  return cleaned;
};

interface VendorSetupWizardProps {
  open: boolean;
  onComplete: () => void;
}

export const VendorSetupWizard = ({
  open,
  onComplete,
}: VendorSetupWizardProps) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const wizardRef = useRef<HTMLDivElement>(null);

  const [shopName, setShopName] = useState("");
  const [shopDescription, setShopDescription] = useState("");
  const [shopState, setShopState] = useState("");
  const [shopCity, setShopCity] = useState("");
  const [shopCategory, setShopCategory] = useState("");
  const [shopAddress, setShopAddress] = useState("");
  const handleBack = () => {
    if (step > 1) setStep(prev => prev - 1);
  };

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productStock, setProductStock] = useState("1");
  const [productImageFile, setProductImageFile] = useState<File | null>(null);
  const [productImagePreview, setProductImagePreview] = useState<string | null>(
    null,
  );
  const [productType, setProductType] = useState<"product" | "service">(
    "product",
  );
  const [durationMinutes, setDurationMinutes] = useState("");
  const [bookingRequired, setBookingRequired] = useState(false);
  const [scheduleDeletion, setScheduleDeletion] = useState(false);
  const [deleteAt, setDeleteAt] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");

  const [isDigital, setIsDigital] = useState(false);
  const [digitalFileUrl, setDigitalFileUrl] = useState("");
  const [digitalDeliveryText, setDigitalDeliveryText] = useState("");

  const [createdShopId, setCreatedShopId] = useState<string | null>(null);
  const { user } = useAuth();

  // Collect all serializable state for persistence
  const wizardFormData = {
    step,
    shopName,
    shopDescription,
    shopState,
    shopCity,
    shopCategory,
    shopAddress,
    productName,
    productDescription,
    productPrice,
    productStock,
    productType,
    durationMinutes,
    bookingRequired,
    scheduleDeletion,
    deleteAt,
    whatsappNumber,
    createdShopId,
    isDigital,
    digitalFileUrl,
    digitalDeliveryText,
  };

  const draftKey = user?.id ? `vendor_wizard_draft_${user.id}` : "";
  const { clearDraft } = useFormDraft(draftKey, wizardFormData, !!draftKey);

  // Restore draft on mount or when user becomes available
  useEffect(() => {
    if (!user?.id) return;
    const draft = readFormDraft<typeof wizardFormData>(
      `vendor_wizard_draft_${user.id}`,
    );
    if (draft) {
      if (draft.step) setStep(draft.step);
      if (draft.shopName) setShopName(draft.shopName);
      if (draft.shopDescription) setShopDescription(draft.shopDescription);
      if (draft.shopState) setShopState(draft.shopState);
      if (draft.shopCity) setShopCity(draft.shopCity);
      if (draft.shopCategory) setShopCategory(draft.shopCategory);
      if (draft.shopAddress) setShopAddress(draft.shopAddress);
      if (draft.productName) setProductName(draft.productName);
      if (draft.productDescription)
        setProductDescription(draft.productDescription);
      if (draft.productPrice) setProductPrice(draft.productPrice);
      if (draft.productStock) setProductStock(draft.productStock);
      if (draft.productType) setProductType(draft.productType);
      if (draft.durationMinutes) setDurationMinutes(draft.durationMinutes);
      if (draft.bookingRequired !== undefined)
        setBookingRequired(draft.bookingRequired);
      if (draft.scheduleDeletion !== undefined)
        setScheduleDeletion(draft.scheduleDeletion);
      if (draft.deleteAt) setDeleteAt(draft.deleteAt);
      if (draft.whatsappNumber) setWhatsappNumber(draft.whatsappNumber);
      if (draft.createdShopId) setCreatedShopId(draft.createdShopId);
      if (draft.isDigital !== undefined) setIsDigital(draft.isDigital);
      if (draft.digitalFileUrl) setDigitalFileUrl(draft.digitalFileUrl);
      if (draft.digitalDeliveryText)
        setDigitalDeliveryText(draft.digitalDeliveryText);
    }
  }, [user?.id]);

  // Lock body scroll and scroll wizard to top when it opens
  useEffect(() => {
    if (!open) return;
    document.body.classList.add("vendor-wizard-open");
    wizardRef.current?.scrollTo({ top: 0, behavior: "instant" });
    return () => {
      document.body.classList.remove("vendor-wizard-open");
    };
  }, [open]);

  // Always scroll to top of wizard when step changes
  useEffect(() => {
    wizardRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "logo" | "banner" | "product",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === "logo") {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    } else if (type === "banner") {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    } else if (type === "product") {
      setProductImageFile(file);
      setProductImagePreview(URL.createObjectURL(file));
    }
  };

  // Auto-generate URL slug
  const shopSlug = shopName
    .toLowerCase()
    .replace(/'/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const handleCreateShop = async () => {
    if (!shopName.trim()) {
      toast({ title: "Shop name required", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      let logoUrl = "";
      let bannerUrl = "";

      if (logoFile) {
        const logoRes = await uploadService.uploadImage(
          logoFile,
          "shop-images",
        );
        logoUrl = logoRes.url;
      }

      if (bannerFile) {
        const bannerRes = await uploadService.uploadImage(
          bannerFile,
          "shop-images",
        );
        bannerUrl = bannerRes.url;
      }

      // 1. Create shop with core fields first — this matches the Dashboard (MyStore.tsx) pattern
      const res = await shopService.createShop({
        name: shopName.trim(),
        slug: shopSlug || shopName.trim().toLowerCase().replace(/\s+/g, "-"),
        description: shopDescription.trim() || `Welcome to ${shopName.trim()}`,
        whatsapp: "", // updated in Step 3
      });

      const newShopId = res.data.id;
      setCreatedShopId(newShopId);

      // 2. Immediately update with the remaining info (category, location, images)
      // This is safer because updateShop handles missing columns gracefully.
      await shopService.updateShop(newShopId, {
        category: shopCategory,
        state: shopState,
        city: shopCity,
        address: shopAddress.trim() || undefined,
        logo_url: logoUrl || undefined,
        banner_url: bannerUrl || undefined,
      });

      setStep(2);
    } catch (error: any) {
      toast({
        title: "Error creating shop",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProduct = async () => {
    if (!productName.trim() || !productPrice.trim()) {
      toast({ title: "Name and price required", variant: "destructive" });
      return;
    }

    const priceNum = Number(productPrice);
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      toast({
        title: "Enter a valid price",
        description: "Price must be greater than zero.",
        variant: "destructive",
      });
      return;
    }

    const stockNum =
      productType === "service"
        ? 9999
        : Math.max(1, Number.parseInt(productStock, 10) || 1);

    if (productType === "service" && durationMinutes) {
      const durationNum = Number(durationMinutes);
      if (!Number.isFinite(durationNum) || durationNum <= 0) {
        toast({
          title: "Enter a valid duration",
          description: "Duration must be greater than zero.",
          variant: "destructive",
        });
        return;
      }
    }

    if (scheduleDeletion && !deleteAt) {
      toast({
        title: "Deletion date required",
        description: "Please select a date and time for automatic deletion.",
        variant: "destructive",
      });
      return;
    }

    if (
      productType === "product" &&
      isDigital &&
      !digitalFileUrl.trim() &&
      !digitalDeliveryText.trim()
    ) {
      toast({
        title: "Digital deliverable required",
        description:
          "Please upload a deliverable file or write access instructions.",
        variant: "destructive",
      });
      return;
    }

    if (!createdShopId) {
      toast({
        title: "Store not ready",
        description: "Please create your store before adding an item.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      let imageUrl = "";
      if (productImageFile) {
        const uploadRes = await uploadService.uploadImage(
          productImageFile,
          "product-images",
        );
        imageUrl = uploadRes.url;
      }

      // Create product/service using the professional productService
      const productRes = await productService.createProduct({
        shopId: createdShopId,
        name: productName.trim(),
        slug: productName
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, ""),
        description: productDescription.trim() || productName.trim(),
        price: priceNum,
        inventory: isDigital ? 9999 : stockNum,
        images: imageUrl
          ? [{ url: imageUrl, alt: productName.trim(), position: 1 }]
          : [],
        type: productType,
        is_available: true,
        duration_minutes:
          productType === "service" && durationMinutes
            ? Number(durationMinutes)
            : undefined,
        booking_required:
          productType === "service" ? bookingRequired : undefined,
        stockUnit: productType === "service" ? "slots" : "units",
        category: shopCategory || "general",
        deleteAt:
          scheduleDeletion && deleteAt
            ? new Date(deleteAt).toISOString()
            : undefined,
        is_digital: productType === "product" ? isDigital : undefined,
        digital_file_url:
          productType === "product" && isDigital ? digitalFileUrl : undefined,
        digital_delivery_text:
          productType === "product" && isDigital
            ? digitalDeliveryText
            : undefined,
      });

      if (!productRes.success) throw new Error("Failed to create item");

      setStep(3);
    } catch (error: unknown) {
      toast({
        title: "Error adding item",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectWhatsapp = async () => {
    if (!whatsappNumber.trim()) {
      toast({ title: "WhatsApp number required", variant: "destructive" });
      return;
    }
    if (!createdShopId) return;

    setIsLoading(true);
    try {
      const normalizedWhatsapp = normalizeWhatsappNumber(whatsappNumber);

      // 1. Save WhatsApp + activate shop — this is the critical step
      // Update shop using the professional shopService.updateShop
      // This ensures we follow the same pattern as MyStore.tsx and get the RLS bypass for admins
      await shopService.updateShop(createdShopId, {
        whatsapp_number: normalizedWhatsapp,
        is_active: true,
        category: shopCategory,
        city: shopCity,
        state: shopState,
        address: shopAddress.trim(),
      });

      // 2. Save street address to shop_addresses if collected — non-critical
      //    Wrapped in its own try/catch so an address DB error never breaks setup.
      if (shopAddress.trim() && shopCity && shopState) {
        try {
          await shopService.createDefaultShopAddress(createdShopId, {
            label: "Main location",
            contactName: shopName.trim(),
            contactPhone: normalizedWhatsapp,
            addressLine1: shopAddress.trim(),
            city: shopCity,
            state: shopState,
          });
        } catch (addrErr: unknown) {
          // Address save failure is non-critical — the street address is already
          // stored on the shops.address column from Step 1.
          console.warn(
            "[VendorSetupWizard] shop_addresses upsert failed (non-critical):",
            addrErr,
          );
        }
      }

      // 3. Clear the onboarding flag on the user profile
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("profiles")
          .update({ needs_role_selection: false })
          .eq("id", user.id);
      }

      toast({
        title: "Setup Complete!",
        description: "Welcome to your new dashboard.",
      });

      // Wipe the wizard draft now that setup is successfully finished
      clearDraft();

      setStep(4);
      setTimeout(() => {
        onComplete();
      }, 2000);
    } catch (error: unknown) {
      toast({
        title: "Error saving WhatsApp",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      ref={wizardRef}
      className="vendor-wizard-page bg-gradient-to-br from-background via-background to-primary/5"
      role="dialog"
      aria-modal="true"
      aria-label="Merchant setup wizard"
    >
      <AdirePattern
        variant="dots"
        className="fixed inset-0 opacity-5 pointer-events-none"
      />

      {/* Sticky Progress Bar */}
      <div className="w-full h-2 bg-muted sticky top-0 z-20">
        <div
          className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-out"
          style={{ width: `${(Math.min(step, 3) / 3) * 100}%` }}
        />
      </div>

      <div className="flex w-full max-w-6xl flex-col gap-6 overflow-visible p-4 pb-20 sm:p-8 sm:pb-16 lg:mx-auto lg:flex-row lg:gap-16 lg:p-12 lg:pb-12">
        {/* Left Side: Context & Visuals */}
        <div className="lg:w-1/2 flex flex-col justify-start pt-4 lg:sticky lg:top-10 lg:h-fit lg:pt-12">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-8 shadow-lg">
            <Store className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-4xl lg:text-5xl font-extrabold text-foreground mb-4 leading-tight">
            {step === 1 && "Let's build your store."}
            {step === 2 && "What are you selling?"}
            {step === 3 && "How will they reach you?"}
            {step === 4 && "You're all set! 🎉"}
          </h1>

          <p className="text-lg text-muted-foreground mb-8">
            {step === 1 &&
              "Give your shop a name to claim your custom SteerSolo URL."}
            {step === 2 &&
              "Add your first product or service so customers have something to buy."}
            {step === 3 &&
              "We'll add a 'Chat on WhatsApp' button so you never miss a sale."}
            {step === 4 && "Your store is live. Let's head to your dashboard."}
          </p>

          {/* Stepper Indicator - Professional Sidebar */}
          <div className="space-y-6 mt-12 hidden lg:block">
            {[
              {
                num: 1,
                title: "Store Identity",
                desc: "Name, category, and branding",
              },
              { num: 2, title: "Inventory", desc: "Add your first product" },
              {
                num: 3,
                title: "Connectivity",
                desc: "WhatsApp & location info",
              },
            ].map(s => (
              <div key={s.num} className="relative">
                {s.num < 3 && (
                  <div
                    className={`absolute left-4 top-10 w-0.5 h-10 transition-colors duration-500 ${step > s.num ? "bg-green-500" : "bg-border/30"}`}
                  />
                )}
                <div
                  className={`flex items-start gap-5 transition-all duration-500 ${step >= s.num ? "opacity-100 scale-100" : "opacity-30 scale-95"}`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shadow-lg transition-all duration-500 ${step > s.num ? "bg-green-500 text-white rotate-[360deg]" : step === s.num ? "bg-primary text-primary-foreground ring-4 ring-primary/20 scale-110" : "bg-muted text-muted-foreground"}`}
                  >
                    {step > s.num ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      s.num
                    )}
                  </div>
                  <div>
                    <h3
                      className={`font-black text-sm uppercase tracking-wider ${step >= s.num ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {s.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {s.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Form / Inputs - Glassmorphism Card */}
        <div className="lg:w-1/2 flex flex-col justify-start">
          <div className="relative overflow-visible rounded-[2.5rem] border border-white/20 bg-white/70 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] backdrop-blur-2xl p-6 sm:p-10 dark:bg-black/40">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-accent/10 rounded-full blur-[100px] pointer-events-none" />

            {step === 1 && (
              <div className="space-y-5 relative z-10">
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 mb-4">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-primary">
                        Step 1 of 3: Store Identity
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        This helps customers find and recognize your store. You
                        can always edit these later!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                        Store Name
                      </Label>
                      {shopName && (
                        <span className="text-[10px] text-green-600 font-medium">
                          ✓ Good
                        </span>
                      )}
                    </div>
                    <Input
                      autoComplete="organization"
                      placeholder="e.g. Sarah's Bakery"
                      value={shopName}
                      onChange={e => setShopName(e.target.value)}
                      className="h-11 bg-background/50 border-primary/20 focus:border-primary/50 text-foreground transition-colors"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Choose a clear, memorable name for your business
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                        Store Category
                      </Label>
                      {shopCategory && (
                        <span className="text-[10px] text-green-600 font-medium">
                          ✓ Selected
                        </span>
                      )}
                    </div>
                    <Select
                      value={shopCategory}
                      onValueChange={setShopCategory}
                    >
                      <SelectTrigger className="h-11 bg-background/50 border-primary/20">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent className="z-[1001]">
                        {SHOP_CATEGORIES.map(cat => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-[10px] text-muted-foreground">
                      Helps customers find your store in searches
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    Short Description
                  </Label>
                  <Textarea
                    placeholder="Tell customers what you sell in one sentence..."
                    value={shopDescription}
                    onChange={e => setShopDescription(e.target.value)}
                    className="bg-background/50 border-primary/20 text-foreground min-h-[60px] resize-none"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Keep it concise - 1-2 sentences maximum
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      Store Logo{" "}
                      <span className="text-muted-foreground font-normal">
                        (Optional)
                      </span>
                    </Label>
                    <div className="relative group">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => handleFileChange(e, "logo")}
                        className="hidden"
                        id="logo-upload"
                      />
                      <label
                        htmlFor="logo-upload"
                        className={`flex flex-col items-center justify-center w-full aspect-video rounded-xl border-2 border-dashed transition-all cursor-pointer ${logoPreview ? "border-primary bg-primary/5" : "border-primary/20 hover:border-primary/40"}`}
                      >
                        {logoPreview ? (
                          <img
                            src={logoPreview}
                            alt="Logo"
                            className="w-full h-full object-contain p-1"
                          />
                        ) : (
                          <div className="text-center">
                            <Upload className="w-5 h-5 text-primary/40 mx-auto mb-1" />
                            <span className="text-[10px] font-bold text-primary/60">
                              Click to upload logo
                            </span>
                          </div>
                        )}
                      </label>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Square image recommended (e.g., 500x500px)
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      Store Banner{" "}
                      <span className="text-muted-foreground font-normal">
                        (Optional)
                      </span>
                    </Label>
                    <div className="relative group">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => handleFileChange(e, "banner")}
                        className="hidden"
                        id="banner-upload"
                      />
                      <label
                        htmlFor="banner-upload"
                        className={`flex flex-col items-center justify-center w-full aspect-video rounded-xl border-2 border-dashed transition-all cursor-pointer ${bannerPreview ? "border-primary bg-primary/5" : "border-primary/20 hover:border-primary/40"}`}
                      >
                        {bannerPreview ? (
                          <img
                            src={bannerPreview}
                            alt="Banner"
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="text-center">
                            <Upload className="w-5 h-5 text-primary/40 mx-auto mb-1" />
                            <span className="text-[10px] font-bold text-primary/60">
                              Click to upload banner
                            </span>
                          </div>
                        )}
                      </label>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Wide image recommended (e.g., 1200x400px)
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      State
                    </Label>
                    <Select value={shopState} onValueChange={setShopState}>
                      <SelectTrigger className="h-11 bg-background/50 border-primary/20">
                        <SelectValue placeholder="State" />
                      </SelectTrigger>
                      <SelectContent className="z-[1001] max-h-[300px]">
                        {NIGERIAN_STATES.map(state => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      City
                    </Label>
                    <Input
                      autoComplete="address-level2"
                      placeholder="e.g. Ikeja"
                      value={shopCity}
                      onChange={e => setShopCity(e.target.value)}
                      className="h-11 bg-background/50 border-primary/20 text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    Street Address (Optional)
                  </Label>
                  <Input
                    autoComplete="street-address"
                    placeholder="e.g. 123 Herbert Macaulay Way"
                    value={shopAddress}
                    onChange={e => setShopAddress(e.target.value)}
                    className="h-11 bg-background/50 border-primary/20 text-foreground"
                  />
                </div>

                {/* Dynamic URL Preview */}
                <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">
                      Your store link:
                    </p>
                    <p className="font-mono text-xs text-foreground truncate">
                      steersolo.com/shop/
                      <span className="font-bold text-primary">
                        {shopSlug || "your-shop"}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    className="flex-1 h-12 text-base font-bold shadow-xl bg-primary hover:bg-primary/90 text-white rounded-2xl transition-all active:scale-[0.98] relative z-10"
                    onClick={handleCreateShop}
                    disabled={
                      isLoading ||
                      !shopName.trim() ||
                      !shopState ||
                      !shopCity ||
                      !shopCategory
                    }
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        Continue Setup <ArrowRight className="ml-2 w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 relative z-10 animate-fade-in">
                {/* Product/Service Type Toggle Segmented Control */}
                <div className="space-y-3">
                  <Label className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                    Listing Type
                  </Label>
                  <div className="grid grid-cols-2 gap-1 p-1 bg-muted/40 backdrop-blur-md rounded-2xl border border-border/50">
                    <button
                      type="button"
                      onClick={() => setProductType("product")}
                      className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                        productType === "product"
                          ? "bg-primary text-white shadow-md scale-[1.02]"
                          : "text-muted-foreground hover:bg-muted/30"
                      }`}
                    >
                      <Package className="w-4 h-4" />
                      Physical Product
                    </button>
                    <button
                      type="button"
                      onClick={() => setProductType("service")}
                      className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                        productType === "service"
                          ? "bg-accent text-accent-foreground shadow-md scale-[1.02]"
                          : "text-muted-foreground hover:bg-muted/30"
                      }`}
                    >
                      <Briefcase className="w-4 h-4" />
                      Digital Service
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                      {productType === "service"
                        ? "Service Name *"
                        : "Product Name *"}
                    </Label>
                    <Input
                      placeholder={
                        productType === "service"
                          ? "e.g. Hair Styling, Consultation"
                          : "e.g. Leather Bag, Chocolate Cake"
                      }
                      value={productName}
                      onChange={e => setProductName(e.target.value)}
                      className="h-12 bg-background/50 border-primary/20 focus:border-primary/50 text-foreground transition-all duration-200"
                      autoFocus
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                      Description
                    </Label>
                    <Textarea
                      placeholder={
                        productType === "service"
                          ? "Describe the service, what is included, etc..."
                          : "Describe size, materials, or features that make this special..."
                      }
                      value={productDescription}
                      onChange={e => setProductDescription(e.target.value)}
                      className="min-h-[80px] bg-background/50 border-primary/20 text-foreground transition-all duration-200"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                        {productType === "service"
                          ? "Session Fee (₦) *"
                          : "Price (₦) *"}
                      </Label>
                      <Input
                        type="number"
                        inputMode="decimal"
                        min="1"
                        placeholder="e.g. 5000"
                        value={productPrice}
                        onChange={e => setProductPrice(e.target.value)}
                        className="h-12 bg-background/50 border-primary/20 focus:border-primary/50 text-foreground transition-all duration-200"
                      />
                    </div>

                    {productType === "product" ? (
                      <div className="space-y-2">
                        <Label className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                          Stock Quantity
                        </Label>
                        <Input
                          type="number"
                          inputMode="numeric"
                          min="1"
                          placeholder="e.g. 10"
                          value={productStock}
                          onChange={e => setProductStock(e.target.value)}
                          className="h-12 bg-background/50 border-primary/20 focus:border-primary/50 text-foreground transition-all duration-200"
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                          Duration (Minutes)
                        </Label>
                        <Input
                          type="number"
                          inputMode="numeric"
                          min="1"
                          placeholder="e.g. 60 (Optional)"
                          value={durationMinutes}
                          onChange={e => setDurationMinutes(e.target.value)}
                          className="h-12 bg-background/50 border-primary/20 focus:border-primary/50 text-foreground transition-all duration-200"
                        />
                      </div>
                    )}
                  </div>

                  {/* Digital Product Settings */}
                  {productType === "product" && (
                    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-4 transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-xs font-bold text-foreground">
                            Digital Deliverable
                          </Label>
                          <p className="text-[11px] text-muted-foreground leading-tight font-normal">
                            eBook, PDF guide, software file, or template
                          </p>
                        </div>
                        <Switch
                          checked={isDigital}
                          onCheckedChange={checked => {
                            setIsDigital(checked);
                            if (checked) {
                              setProductStock("9999");
                            }
                          }}
                        />
                      </div>

                      {isDigital && (
                        <div className="space-y-4 pt-3 border-t border-primary/10 animate-fade-in">
                          <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-muted-foreground">
                              Deliverable File (PDF, ZIP, DOC, EPUB)
                            </Label>
                            <DigitalFileUpload
                              value={digitalFileUrl}
                              onChange={setDigitalFileUrl}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-muted-foreground">
                              Access Instructions / Custom Text *
                            </Label>
                            <Textarea
                              placeholder="e.g. Thank you for your purchase! Access your eBook here: ..."
                              value={digitalDeliveryText}
                              onChange={e =>
                                setDigitalDeliveryText(e.target.value)
                              }
                              className="min-h-[60px] bg-background/50 border-primary/20 text-foreground transition-all duration-200"
                              rows={2}
                            />
                            <p className="text-[10px] text-muted-foreground leading-tight">
                              This message is instantly displayed and delivered
                              to paid customers.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Service Specific: Booking Toggle */}
                  {productType === "service" && (
                    <div className="p-4 rounded-2xl bg-accent/5 border border-accent/20 flex items-center justify-between transition-all duration-300">
                      <div className="space-y-0.5">
                        <Label className="text-xs font-bold text-foreground">
                          Requires Booking
                        </Label>
                        <p className="text-[11px] text-muted-foreground leading-tight">
                          Customers must schedule a calendar slot
                        </p>
                      </div>
                      <Switch
                        checked={bookingRequired}
                        onCheckedChange={setBookingRequired}
                        className="data-[state=checked]:bg-accent"
                      />
                    </div>
                  )}

                  {/* Scheduled Self-Deletion Panel */}
                  <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-3 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-xs font-bold text-foreground">
                          Automatic Scheduled Deletion
                        </Label>
                        <p className="text-[11px] text-muted-foreground leading-tight">
                          Delete item automatically at a chosen date/time
                        </p>
                      </div>
                      <Switch
                        checked={scheduleDeletion}
                        onCheckedChange={setScheduleDeletion}
                      />
                    </div>

                    {scheduleDeletion && (
                      <div className="space-y-2 animate-slide-down">
                        <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                          Deletion Date & Time *
                        </Label>
                        <div className="relative">
                          <Input
                            type="datetime-local"
                            value={deleteAt}
                            onChange={e => setDeleteAt(e.target.value)}
                            min={new Date().toISOString().slice(0, 16)}
                            className="h-12 bg-background border-primary/20 focus:border-primary/50 text-foreground pl-10"
                          />
                          <Calendar className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground pointer-events-none" />
                        </div>
                        <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-700 dark:text-amber-500 font-semibold flex items-center gap-2">
                          ⚠️ This item will be permanently removed at the chosen
                          date/time. Order histories will be preserved.
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Image Upload */}
                  <div className="space-y-2">
                    <Label className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                      {productType === "service"
                        ? "Service Banner Image"
                        : "Product Image"}
                    </Label>
                    <div className="relative group w-full sm:w-40">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => handleFileChange(e, "product")}
                        className="hidden"
                        id="product-image-upload"
                      />
                      <label
                        htmlFor="product-image-upload"
                        className={`flex flex-col items-center justify-center w-full aspect-square rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
                          productImagePreview
                            ? "border-primary bg-primary/5"
                            : "border-primary/20 hover:border-primary/40 bg-background/30 hover:bg-background/60"
                        }`}
                      >
                        {productImagePreview ? (
                          <div className="relative w-full h-full p-2">
                            <img
                              src={productImagePreview}
                              alt="Product"
                              className="w-full h-full object-cover rounded-xl"
                            />
                            <button
                              onClick={e => {
                                e.preventDefault();
                                setProductImageFile(null);
                                setProductImagePreview(null);
                              }}
                              className="absolute -top-1.5 -right-1.5 bg-destructive text-white p-1 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <ImagePlus className="w-6 h-6 text-primary/40 mb-1" />
                            <span className="text-[10px] font-bold text-primary/60">
                              Upload Image
                            </span>
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 h-12 border-border/50 rounded-2xl font-bold hover:bg-muted/50 transition-all active:scale-[0.98] relative z-10"
                    onClick={handleBack}
                    disabled={isLoading}
                  >
                    Back
                  </Button>
                  <Button
                    className="flex-[2] h-12 text-base font-bold shadow-xl bg-primary hover:bg-primary/90 text-white rounded-2xl transition-all active:scale-[0.98] relative z-10"
                    onClick={handleCreateProduct}
                    disabled={isLoading || !productName.trim() || !productPrice}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        {productType === "service"
                          ? "Create Service"
                          : "Add Product"}
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 relative z-10 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-primary uppercase tracking-widest">
                      Final Step
                    </p>
                    <p className="text-sm text-muted-foreground leading-tight">
                      Link your WhatsApp to receive orders instantly from
                      customers.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-3">
                    <Label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                      WhatsApp Phone Number
                    </Label>
                    <div className="relative group">
                      <Input
                        placeholder="e.g. 08012345678"
                        value={whatsappNumber}
                        onChange={e => setWhatsappNumber(e.target.value)}
                        className="h-14 pl-12 text-lg bg-background/50 border-primary/20 focus:border-primary/50 transition-all rounded-2xl"
                        autoFocus
                      />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold border-r pr-2 border-border/50">
                        🇳🇬
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground font-medium px-1">
                      We'll use this to create your "Order on WhatsApp" buttons.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-6">
                  <Button
                    variant="outline"
                    className="flex-1 h-12 border-border/50 rounded-2xl font-bold hover:bg-muted/50 relative z-10"
                    onClick={handleBack}
                    disabled={isLoading}
                  >
                    Back
                  </Button>
                  <Button
                    className="flex-[2] h-12 text-base font-bold shadow-xl bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white rounded-2xl transition-all active:scale-[0.98] relative z-10"
                    onClick={handleConnectWhatsapp}
                    disabled={isLoading || !whatsappNumber.trim()}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        Launch My Store <Sparkles className="ml-2 w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="flex flex-col items-center justify-center py-12 text-center relative z-10">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mb-8 shadow-xl shadow-green-500/20 animate-in zoom-in duration-500">
                  <CheckCircle2 className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-3xl font-extrabold mb-3 bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
                  You're all set! 🚀
                </h3>
                <p className="text-muted-foreground text-lg mb-8 max-w-[280px] mx-auto">
                  Your store is live and ready for customers. Let's head to your
                  command center.
                </p>
                <div className="flex items-center gap-2 text-primary font-bold">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Loading Dashboard...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
