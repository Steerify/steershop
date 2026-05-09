import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Store, Package, MessageCircle, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import shopService from "@/services/shop.service";
import { supabase } from "@/integrations/supabase/client";
import { AdirePattern } from "@/components/patterns/AdirePattern";

interface VendorSetupWizardProps {
  open: boolean;
  onComplete: () => void;
}

export const VendorSetupWizard = ({ open, onComplete }: VendorSetupWizardProps) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [shopName, setShopName] = useState("");
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");

  const [createdShopId, setCreatedShopId] = useState<string | null>(null);

  // Auto-generate URL slug
  const shopSlug = shopName.toLowerCase().replace(/'/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleCreateShop = async () => {
    if (!shopName.trim()) {
      toast({ title: "Shop name required", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const res = await shopService.createShop({
        name: shopName,
        slug: shopSlug,
        description: "My new SteerShop store",
        whatsapp: "",
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
      const { error } = await supabase.from('products').insert({
        shop_id: createdShopId,
        name: productName,
        description: "",
        price: priceNum,
        is_available: true,
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
      await shopService.updateShop(createdShopId, { whatsapp_number: whatsappNumber });
      
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
    <div className="fixed inset-0 z-[100] bg-background flex flex-col overflow-hidden animate-in fade-in duration-300">
      <AdirePattern variant="dots" className="absolute inset-0 opacity-5 pointer-events-none" />
      
      {/* Top Progress Bar */}
      <div className="w-full h-2 bg-muted relative z-10">
        <div 
          className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-out" 
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col lg:flex-row items-stretch max-w-6xl w-full mx-auto p-4 sm:p-8 lg:p-12 relative z-10 gap-8 lg:gap-16">
        
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
              <div className="space-y-6 relative z-10">
                <div className="space-y-3">
                  <Label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Store Name</Label>
                  <Input 
                    placeholder="e.g. Sarah's Bakery" 
                    value={shopName} 
                    onChange={e => setShopName(e.target.value)}
                    className="h-14 text-lg bg-background/50 border-primary/20 focus-visible:ring-primary/30"
                    autoFocus
                  />
                </div>

                {/* Dynamic URL Preview */}
                <div className="p-4 rounded-xl bg-muted/50 border border-muted flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground mb-0.5">Your store link will be:</p>
                    <p className="font-mono text-sm text-foreground truncate">
                      steersolo.com/shop/<span className="font-bold text-primary">{shopSlug || "your-shop"}</span>
                    </p>
                  </div>
                </div>

                <Button className="w-full h-14 text-lg font-bold shadow-lg bg-gradient-to-r from-primary to-accent" onClick={handleCreateShop} disabled={isLoading || !shopName.trim()}>
                  {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : (
                    <>Create Store <ArrowRight className="ml-2 w-5 h-5" /></>
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
              <div className="flex flex-col items-center justify-center py-8 text-center relative z-10">
                <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6 animate-bounce">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Setup Complete!</h3>
                <p className="text-muted-foreground">Preparing your dashboard...</p>
                <Loader2 className="w-6 h-6 animate-spin text-primary mt-6" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
