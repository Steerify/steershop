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
import { Loader2, Store, Package, MessageCircle, ArrowRight, Sparkles, CheckCircle2, MapPin, ImagePlus, Upload, X } from "lucide-react";
import shopService from "@/services/shop.service";
import productService from "@/services/product.service";
import { uploadService } from "@/services/upload.service";
import { supabase } from "@/integrations/supabase/client";
import { AdirePattern } from "@/components/patterns/AdirePattern";
import { useAuth } from "@/context/AuthContext";
import { useFormDraft, readFormDraft } from "@/hooks/useFormDraft";

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River",
  "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina",
  "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau",
  "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara", "FCT Abuja"
];

const SHOP_CATEGORIES = [
  "Fashion & Apparel", "Beauty & Personal Care", "Electronics", "Home & Kitchen", "Food & Groceries",
  "Services & Consultation", "Health & Wellness", "Arts & Crafts", "Automotive", "Other"
];


const getErrorMessage = (error: unknown) => error instanceof Error ? error.message : "Please try again.";

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

export const VendorSetupWizard = ({ open, onComplete }: VendorSetupWizardProps) => {
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

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productStock, setProductStock] = useState("1");
  const [productImageFile, setProductImageFile] = useState<File | null>(null);
  const [productImagePreview, setProductImagePreview] = useState<string | null>(null);
  const [whatsappNumber, setWhatsappNumber] = useState("");

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
    whatsappNumber,
    createdShopId
  };

  const draftKey = user?.id ? `vendor_wizard_draft_${user.id}` : "";
  const { clearDraft } = useFormDraft(draftKey, wizardFormData, !!draftKey);

  // Restore draft on mount or when user becomes available
  useEffect(() => {
    if (!user?.id) return;
    const draft = readFormDraft<typeof wizardFormData>(`vendor_wizard_draft_${user.id}`);
    if (draft) {
      if (draft.step) setStep(draft.step);
      if (draft.shopName) setShopName(draft.shopName);
      if (draft.shopDescription) setShopDescription(draft.shopDescription);
      if (draft.shopState) setShopState(draft.shopState);
      if (draft.shopCity) setShopCity(draft.shopCity);
      if (draft.shopCategory) setShopCategory(draft.shopCategory);
      if (draft.shopAddress) setShopAddress(draft.shopAddress);
      if (draft.productName) setProductName(draft.productName);
      if (draft.productDescription) setProductDescription(draft.productDescription);
      if (draft.productPrice) setProductPrice(draft.productPrice);
      if (draft.productStock) setProductStock(draft.productStock);
      if (draft.whatsappNumber) setWhatsappNumber(draft.whatsappNumber);
      if (draft.createdShopId) setCreatedShopId(draft.createdShopId);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner' | 'product') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'logo') {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    } else if (type === 'banner') {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    } else if (type === 'product') {
      setProductImageFile(file);
      setProductImagePreview(URL.createObjectURL(file));
    }
  };

  // Auto-generate URL slug
  const shopSlug = shopName.toLowerCase().replace(/'/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

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
        const logoRes = await uploadService.uploadImage(logoFile, "shop-images");
        logoUrl = logoRes.url;
      }

      if (bannerFile) {
        const bannerRes = await uploadService.uploadImage(bannerFile, "shop-images");
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
      toast({ title: "Error creating shop", description: getErrorMessage(error), variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProduct = async () => {
    if (!productName.trim() || !productPrice.trim()) {
      toast({ title: "Product name and price required", variant: "destructive" });
      return;
    }

    const priceNum = Number(productPrice);
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      toast({ title: "Enter a valid price", description: "Price must be greater than zero.", variant: "destructive" });
      return;
    }

    const stockNum = Math.max(1, Number.parseInt(productStock, 10) || 1);

    if (!createdShopId) {
      toast({ title: "Store not ready", description: "Please create your store before adding a product.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      let imageUrl = "";
      if (productImageFile) {
        const uploadRes = await uploadService.uploadImage(productImageFile, "product-images");
        imageUrl = uploadRes.url;
      }

      await productService.createProduct({
        shopId: createdShopId,
        name: productName.trim(),
        slug: productName.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
        description: productDescription.trim() || productName.trim(),
        price: priceNum,
        inventory: stockNum,
        images: imageUrl ? [{ url: imageUrl, alt: productName.trim(), position: 1 }] : [],
        type: "product",
        is_available: true,
        stockUnit: "units",
        category: shopCategory || "general",
      });

      setStep(3);
    } catch (error: unknown) {
      toast({ title: "Error adding product", description: getErrorMessage(error), variant: "destructive" });
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
      await shopService.updateShop(createdShopId, {
        whatsapp_number: normalizedWhatsapp,
        is_active: true,
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
          console.warn("[VendorSetupWizard] shop_addresses upsert failed (non-critical):", addrErr);
        }
      }

      // 3. Clear the onboarding flag on the user profile
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').update({ needs_role_selection: false }).eq('id', user.id);
      }

      toast({ title: "Setup Complete!", description: "Welcome to your new dashboard." });
      setStep(4);
      setTimeout(() => {
        onComplete();
      }, 2000);

    } catch (error: unknown) {
      toast({ title: "Error saving WhatsApp", description: getErrorMessage(error), variant: "destructive" });
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
      aria-label="Vendor setup wizard"
    >
      <AdirePattern variant="dots" className="fixed inset-0 opacity-5 pointer-events-none" />

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
            {step === 1 && "Give your shop a name to claim your custom SteerSolo URL."}
            {step === 2 && "Add your first product or service so customers have something to buy."}
            {step === 3 && "We'll add a 'Chat on WhatsApp' button so you never miss a sale."}
            {step === 4 && "Your store is live. Let's head to your dashboard."}
          </p>

          {/* Stepper Indicator */}
          <div className="space-y-4">
            {[
              { num: 1, title: "Name your shop" },
              { num: 2, title: "Add a product" },
              { num: 3, title: "Connect contact info" }
            ].map((s) => (
              <div key={s.num} className={`flex items-center gap-4 transition-opacity duration-300 ${step >= s.num ? 'opacity-100' : 'opacity-40'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step > s.num ? 'bg-green-500 text-white' : step === s.num ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  {step > s.num ? <CheckCircle2 className="w-5 h-5" /> : s.num}
                </div>
                <span className={`font-medium ${step >= s.num ? 'text-foreground' : 'text-muted-foreground'}`}>{s.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Form / Inputs */}
        <div className="lg:w-1/2 flex flex-col justify-start">
          <div className="relative overflow-visible rounded-3xl border border-border/50 bg-card/90 p-5 shadow-2xl backdrop-blur-xl sm:p-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

            {step === 1 && (
              <div className="space-y-5 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Store Name</Label>
                    <Input
                      autoComplete="organization"
                      placeholder="e.g. Sarah's Bakery"
                      value={shopName}
                      onChange={e => setShopName(e.target.value)}
                      className="h-11 bg-background/50 border-primary/20 focus:border-primary/50 text-foreground transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Store Category</Label>
                    <Select value={shopCategory} onValueChange={setShopCategory}>
                      <SelectTrigger className="h-11 bg-background/50 border-primary/20">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent className="z-[1001]">
                        {SHOP_CATEGORIES.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Short Description</Label>
                  <Textarea
                    placeholder="Tell customers what you sell in one sentence..."
                    value={shopDescription}
                    onChange={e => setShopDescription(e.target.value)}
                    className="bg-background/50 border-primary/20 text-foreground min-h-[60px] resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Store Logo</Label>
                    <div className="relative group">
                      <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'logo')} className="hidden" id="logo-upload" />
                      <label htmlFor="logo-upload" className={`flex flex-col items-center justify-center w-full aspect-video rounded-xl border-2 border-dashed transition-all cursor-pointer ${logoPreview ? 'border-primary bg-primary/5' : 'border-primary/20 hover:border-primary/40'}`}>
                        {logoPreview ? (
                          <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-1" />
                        ) : (
                          <div className="text-center">
                            <Upload className="w-5 h-5 text-primary/40 mx-auto mb-1" />
                            <span className="text-[10px] font-bold text-primary/60">Logo</span>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Store Banner</Label>
                    <div className="relative group">
                      <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'banner')} className="hidden" id="banner-upload" />
                      <label htmlFor="banner-upload" className={`flex flex-col items-center justify-center w-full aspect-video rounded-xl border-2 border-dashed transition-all cursor-pointer ${bannerPreview ? 'border-primary bg-primary/5' : 'border-primary/20 hover:border-primary/40'}`}>
                        {bannerPreview ? (
                          <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <div className="text-center">
                            <Upload className="w-5 h-5 text-primary/40 mx-auto mb-1" />
                            <span className="text-[10px] font-bold text-primary/60">Banner</span>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">State</Label>
                    <Select value={shopState} onValueChange={setShopState}>
                      <SelectTrigger className="h-11 bg-background/50 border-primary/20">
                        <SelectValue placeholder="State" />
                      </SelectTrigger>
                      <SelectContent className="z-[1001] max-h-[300px]">
                        {NIGERIAN_STATES.map(state => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">City</Label>
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
                  <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Street Address (Optional)</Label>
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
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Your store link:</p>
                    <p className="font-mono text-xs text-foreground truncate">
                      steersolo.com/shop/<span className="font-bold text-primary">{shopSlug || "your-shop"}</span>
                    </p>
                  </div>
                </div>

                <Button className="w-full h-12 text-base font-bold shadow-lg bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity" onClick={handleCreateShop} disabled={isLoading || !shopName.trim() || !shopState || !shopCity || !shopCategory}>
                  {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : (
                    <>Create Store <ArrowRight className="ml-2 w-4 h-4" /></>
                  )}
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 relative z-10">
                <div className="space-y-4">
                  <div className="space-y-3">
                    <Label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Product / Service Name</Label>
                    <Input
                      placeholder="e.g. Chocolate Cake or Consultation"
                      value={productName}
                      onChange={e => setProductName(e.target.value)}
                      className="h-14 text-lg bg-background/50 border-primary/20"
                      autoFocus
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Description</Label>
                    <Textarea
                      placeholder="A short detail that helps customers decide..."
                      value={productDescription}
                      onChange={e => setProductDescription(e.target.value)}
                      className="min-h-[84px] bg-background/50 border-primary/20"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-3">
                      <Label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Price (₦)</Label>
                      <Input
                        type="number"
                        inputMode="decimal"
                        min="1"
                        placeholder="e.g. 5000"
                        value={productPrice}
                        onChange={e => setProductPrice(e.target.value)}
                        className="h-14 text-lg bg-background/50 border-primary/20"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Stock quantity</Label>
                      <Input
                        type="number"
                        inputMode="numeric"
                        min="1"
                        placeholder="e.g. 10"
                        value={productStock}
                        onChange={e => setProductStock(e.target.value)}
                        className="h-14 text-lg bg-background/50 border-primary/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Product Image</Label>
                    <div className="relative group w-full sm:w-40">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'product')}
                        className="hidden"
                        id="product-image-upload"
                      />
                      <label
                        htmlFor="product-image-upload"
                        className={`flex flex-col items-center justify-center w-full aspect-square rounded-xl border-2 border-dashed transition-all cursor-pointer ${productImagePreview ? 'border-primary' : 'border-primary/20 hover:border-primary/40'}`}
                      >
                        {productImagePreview ? (
                          <div className="relative w-full h-full p-2">
                            <img src={productImagePreview} alt="Product" className="w-full h-full object-cover rounded-lg" />
                            <button
                              onClick={(e) => { e.preventDefault(); setProductImageFile(null); setProductImagePreview(null); }}
                              className="absolute -top-1 -right-1 bg-destructive text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <ImagePlus className="w-6 h-6 text-primary/40 mb-1" />
                            <span className="text-[10px] font-bold text-primary/60">Upload</span>
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <Button className="w-full h-14 text-lg font-bold shadow-lg bg-gradient-to-r from-primary to-accent" onClick={handleCreateProduct} disabled={isLoading || !productName.trim() || !productPrice.trim()}>
                    {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : (
                      <>Add Product <ArrowRight className="ml-2 w-5 h-5" /></>
                    )}
                  </Button>
                  <Button variant="ghost" className="w-full h-12 text-muted-foreground hover:text-foreground" onClick={() => setStep(3)} disabled={isLoading}>
                    Skip for now
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 relative z-10">
                <div className="space-y-3">
                  <Label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">WhatsApp Number</Label>
                  <Input
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="e.g. 08012345678"
                    value={whatsappNumber}
                    onChange={e => setWhatsappNumber(e.target.value)}
                    className="h-14 text-lg bg-background/50 border-green-500/30 focus-visible:ring-green-500/30"
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground">Customers will be redirected here when they click "Chat to Buy".</p>
                </div>
                <div className="flex flex-col gap-3">
                  <Button className="w-full h-14 text-lg font-bold shadow-lg bg-green-600 hover:bg-green-700 text-white" onClick={handleConnectWhatsapp} disabled={isLoading || !whatsappNumber.trim()}>
                    {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Finish Setup"}
                  </Button>
                  {shopAddress.trim() && (
                    <p className="text-center text-xs text-muted-foreground">
                      If you skip WhatsApp now, your address can be added later.
                    </p>
                  )}
                  <Button variant="ghost" className="w-full h-12 text-muted-foreground hover:text-foreground" onClick={async () => {
                    setIsLoading(true);
                    try {
                      if (createdShopId) {
                        await shopService.updateShop(createdShopId, { is_active: true });
                      }
                      if (shopAddress.trim()) {
                        toast({ title: "Address can be added later", description: "Connect WhatsApp whenever you're ready to save a default pickup address." });
                      }
                      const { data: { user } } = await supabase.auth.getUser();
                      if (user) {
                        await supabase.from('profiles').update({ needs_role_selection: false }).eq('id', user.id);
                      }
                      setStep(4);
                      setTimeout(() => onComplete(), 2000);
                    } catch (error) {
                      toast({ title: "Error finishing setup", variant: "destructive" });
                    } finally {
                      setIsLoading(false);
                    }
                  }} disabled={isLoading}>
                    Skip for now
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
                  Your store is live and ready for customers. Let's head to your command center.
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
