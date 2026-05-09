import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Store, Package, MessageCircle, CheckCircle2 } from "lucide-react";
import shopService from "@/services/shop.service";
import { supabase } from "@/integrations/supabase/client";

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

  // Use a blocking dialog (prevent close on outside click or escape)
  const handleOpenChange = (newOpen: boolean) => {
    // Only allow closing if we explicitly call onComplete
    if (!newOpen && step > 3) {
      onComplete();
    }
  };

  const handleCreateShop = async () => {
    if (!shopName.trim()) {
      toast({ title: "Shop name required", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const slug = shopName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const res = await shopService.createShop({
        name: shopName,
        slug: slug,
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
      onComplete();
    } catch (error: any) {
      toast({ title: "Error saving WhatsApp", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md [&>button]:hidden pointer-events-auto" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader className="text-center pb-4 border-b">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {step === 1 && "Let's name your shop"}
            {step === 2 && "Add your first item"}
            {step === 3 && "Connect your WhatsApp"}
          </DialogTitle>
          <DialogDescription className="text-base mt-2">
            {step === 1 && "This is what customers will see."}
            {step === 2 && "You can add more details later."}
            {step === 3 && "Where should customers message you?"}
          </DialogDescription>
          
          <div className="flex justify-center items-center gap-2 mt-6">
            <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`h-1 w-8 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`h-1 w-8 rounded-full ${step >= 3 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`w-3 h-3 rounded-full ${step >= 3 ? 'bg-primary' : 'bg-muted'}`} />
          </div>
        </DialogHeader>

        <div className="py-6 space-y-6">
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Store className="w-8 h-8 text-primary" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Shop Name</Label>
                <Input 
                  placeholder="e.g. Sarah's Bakery" 
                  value={shopName} 
                  onChange={e => setShopName(e.target.value)}
                  className="h-12 text-lg"
                  autoFocus
                />
              </div>
              <Button className="w-full h-12 text-lg font-bold" onClick={handleCreateShop} disabled={isLoading || !shopName.trim()}>
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Continue"}
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
                  <Package className="w-8 h-8 text-accent" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Item Name</Label>
                  <Input 
                    placeholder="e.g. Chocolate Cake" 
                    value={productName} 
                    onChange={e => setProductName(e.target.value)}
                    className="h-12"
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label>Price (₦)</Label>
                  <Input 
                    type="number"
                    placeholder="e.g. 5000" 
                    value={productPrice} 
                    onChange={e => setProductPrice(e.target.value)}
                    className="h-12"
                  />
                </div>
              </div>
              <Button className="w-full h-12 text-lg font-bold" onClick={handleCreateProduct} disabled={isLoading || !productName.trim() || !productPrice.trim()}>
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Add Item"}
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => setStep(3)} disabled={isLoading}>
                Skip for now
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center">
                  <MessageCircle className="w-8 h-8 text-green-500" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>WhatsApp Number</Label>
                <Input 
                  placeholder="e.g. 08012345678" 
                  value={whatsappNumber} 
                  onChange={e => setWhatsappNumber(e.target.value)}
                  className="h-12 text-lg"
                  autoFocus
                />
              </div>
              <Button className="w-full h-12 text-lg font-bold bg-green-600 hover:bg-green-700" onClick={handleConnectWhatsapp} disabled={isLoading || !whatsappNumber.trim()}>
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Finish Setup"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
