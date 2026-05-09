import { useState, useEffect } from "react";
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
import { uploadService } from "@/services/upload.service";
import { supabase } from "@/integrations/supabase/client";
import { AdirePattern } from "@/components/patterns/AdirePattern";

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

interface VendorSetupWizardProps {
  open: boolean;
  onComplete: () => void;
}

export const VendorSetupWizard = ({ open, onComplete }: VendorSetupWizardProps) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
  const [productPrice, setProductPrice] = useState("");
  const [productImageFile, setProductImageFile] = useState<File | null>(null);
  const [productImagePreview, setProductImagePreview] = useState<string | null>(null);
  const [whatsappNumber, setWhatsappNumber] = useState("");

  const [createdShopId, setCreatedShopId] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner') => {
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
        const logoRes = await uploadService.uploadImage(logoFile, "shop-logos");
        logoUrl = logoRes.url;
      }

      if (bannerFile) {
        const bannerRes = await uploadService.uploadImage(bannerFile, "shop-banners");
        bannerUrl = bannerRes.url;
      }

      const res = await shopService.createShop({
        name: shopName,
        slug: shopSlug,
        description: shopDescription || `Welcome to ${shopName}`,
        whatsapp: "", // Will be updated in Step 3
        state: shopState,
        city: shopCity,
        address: shopAddress,
        category: shopCategory,
        logo_url: logoUrl,
        banner_url: bannerUrl,
      });
      setCreatedShopId(res.data.id);
      setStep(2);
    } catch (error: any) {
      toast({ title: "Error creating shop", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProduct = async () => {
    if (!productName.trim() || !productPrice.trim()) {
      toast({ title: "Product name and price required", variant: "destructive" });
      return;
    }
    if (!createdShopId) return;

    setIsLoading(true);
    try {
      const priceNum = parseFloat(productPrice);
      
      let imageUrl = "";
      if (productImageFile) {
        const uploadRes = await uploadService.uploadImage(productImageFile, "product-images");
        imageUrl = uploadRes.url;
      }

      const { error } = await supabase.from('products').insert({
        shop_id: createdShopId,
        name: productName,
        description: "",
        price: priceNum,
        is_available: true,
        images: imageUrl ? [{ url: imageUrl, alt: productName, position: 1 }] : [],
      });

      if (error) throw error;
      setStep(3);
    } catch (error: any) {
      toast({ title: "Error adding product", description: error.message, variant: "destructive" });
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
      await shopService.updateShop(createdShopId, { 
        whatsapp_number: whatsappNumber,
        is_active: true 
      });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').update({ needs_role_selection: false }).eq('id', user.id);
      }
      
      toast({ title: "Setup Complete!", description: "Welcome to your new dashboard." });
      setStep(4);
      setTimeout(() => {
        onComplete();
      }, 2000);


    } catch (error: any) {
      toast({ title: "Error saving WhatsApp", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[40] bg-background flex flex-col min-h-screen overflow-y-auto overflow-x-hidden animate-in fade-in duration-300">
      <AdirePattern variant="dots" className="absolute inset-0 opacity-5 pointer-events-none" />
      
      {/* Top Progress Bar */}
      <div className="w-full h-2 bg-muted sticky top-0 z-20">
        <div 
          className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-out" 
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col lg:flex-row items-stretch max-w-6xl w-full mx-auto p-4 sm:p-8 lg:p-12 pb-24 relative z-10 gap-8 lg:gap-16">
        
        {/* Left Side: Context & Visuals */}
        <div className="lg:w-1/2 flex flex-col justify-center animate-in slide-in-from-left-8 duration-500">
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
        <div className="lg:w-1/2 flex flex-col justify-center animate-in slide-in-from-right-8 duration-700">
          <div className="bg-card/80 backdrop-blur-xl border border-border/50 shadow-2xl rounded-3xl p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            
            {step === 1 && (
              <div className="space-y-5 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Store Name</Label>
                    <Input 
                      placeholder="e.g. Sarah's Bakery" 
                      value={shopName} 
                      onChange={e => setShopName(e.target.value)}
                      className="h-11 bg-background/50 border-primary/20 focus:border-primary/50 transition-colors"
                      autoFocus
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
                    className="bg-background/50 border-primary/20 min-h-[60px] resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
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

                <div className="grid grid-cols-2 gap-4">
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
                      placeholder="e.g. Ikeja" 
                      value={shopCity} 
                      onChange={e => setShopCity(e.target.value)}
                      className="h-11 bg-background/50 border-primary/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Street Address (Optional)</Label>
                  <Input 
                    placeholder="e.g. 123 Herbert Macaulay Way" 
                    value={shopAddress} 
                    onChange={e => setShopAddress(e.target.value)}
                    className="h-11 bg-background/50 border-primary/20"
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
                    <Label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Price (₦)</Label>
                    <Input 
                      type="number"
                      placeholder="e.g. 5000" 
                      value={productPrice} 
                      onChange={e => setProductPrice(e.target.value)}
                      className="h-14 text-lg bg-background/50 border-primary/20"
                    />
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
                  <Button variant="ghost" className="w-full h-12 text-muted-foreground hover:text-foreground" onClick={async () => {
                    setIsLoading(true);
                    try {
                      if (createdShopId) {
                        await shopService.updateShop(createdShopId, { is_active: true });
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
