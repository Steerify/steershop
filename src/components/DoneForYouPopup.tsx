import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ImageUpload } from "@/components/ImageUpload";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Sparkles,
  Store,
  CheckCircle,
  Loader2,
  Plus,
  Trash2,
  Rocket,
  Wand2,
  ShieldCheck,
  ArrowRight,
  Package,
} from "lucide-react";

type Step = "intro" | "products" | "creating" | "complete";

interface DraftProduct {
  name: string;
  price: number;
  type: "product" | "service";
  imageUrl: string;
}

interface DoneForYouPopupProps {
  open: boolean;
  onClose: () => void;
  onShopCreated: (shopId: string) => void;
  prefillCategory?: string;
}

export const DoneForYouPopup: React.FC<DoneForYouPopupProps> = ({
  open,
  onClose,
  onShopCreated,
  prefillCategory,
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [step, setStep] = useState<Step>("intro");

  // Intro form
  const [businessName, setBusinessName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [businessCategory, setBusinessCategory] = useState(prefillCategory || "");

  // Products step (before payment)
  const [draftProducts, setDraftProducts] = useState<DraftProduct[]>([]);
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productType, setProductType] = useState<"product" | "service">("product");
  const [productImage, setProductImage] = useState("");

  // Payment / creating
  const [isPayingLoading, setIsPayingLoading] = useState(false);
  const [creatingStatus, setCreatingStatus] = useState("");
  const [shopId, setShopId] = useState("");

  // Load prefill from onboarding
  useEffect(() => {
    if (open && user && !businessCategory) {
      supabase
        .from("onboarding_responses")
        .select("business_type")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()
        .then(({ data }) => {
          if (data?.business_type) setBusinessCategory(data.business_type);
        });
    }
  }, [open, user]);

  // Check for DFY verify callback
  useEffect(() => {
    if (!open) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("dfy") === "verify") {
      const reference = params.get("reference");
      if (reference) {
        handleVerifyPayment(reference);
        window.history.replaceState({}, "", "/dashboard");
      }
    }
  }, [open]);

  const handleGoToProducts = () => {
    if (!businessName.trim() || !whatsappNumber.trim()) {
      toast({
        title: "Missing info",
        description: "Please enter your business name and WhatsApp number.",
        variant: "destructive",
      });
      return;
    }
    setStep("products");
  };

  const handleAddDraftProduct = () => {
    if (!productName.trim() || !productPrice.trim()) {
      toast({ title: "Missing info", description: "Enter product name and price.", variant: "destructive" });
      return;
    }
    setDraftProducts(prev => [
      ...prev,
      { name: productName, price: parseInt(productPrice), type: productType, imageUrl: productImage }
    ]);
    setProductName("");
    setProductPrice("");
    setProductImage("");
    setProductType("product");
  };

  const handleRemoveDraftProduct = (index: number) => {
    setDraftProducts(prev => prev.filter((_, i) => i !== index));
  };

  const handleFreeCreate = async () => {
    if (draftProducts.length === 0) {
      toast({ title: "Add products", description: "Please add at least 1 product before proceeding.", variant: "destructive" });
      return;
    }

    setIsPayingLoading(true);
    setStep("creating");
    setCreatingStatus("AI is crafting your store & products...");

    try {
      const { data, error } = await supabase.functions.invoke("done-for-you-setup", {
        body: {
          reference: "free_setup",
          business_name: businessName,
          whatsapp_number: whatsappNumber,
          business_category: businessCategory,
          products: draftProducts,
          free_setup: true,
        },
      });

      if (error || !data?.success) {
        throw new Error(data?.error || error?.message || "Setup failed");
      }

      setShopId(data.shop_id);
      setBusinessName(data.shop_name);
      onShopCreated(data.shop_id);
      toast({ title: "Store Created! 🎉", description: `"${data.shop_name}" is now live with ${data.products_created || 0} products!` });
      setStep("complete");
    } catch (error) {
      console.error("Free DFY setup error:", error);
      toast({ title: "Setup Error", description: error instanceof Error ? error.message : "Failed to create store", variant: "destructive" });
      setStep("intro");
    } finally {
      setIsPayingLoading(false);
    }
  };

  const handlePayAndCreate = async () => {
    if (draftProducts.length === 0) {
      toast({ title: "Add products", description: "Please add at least 1 product before proceeding.", variant: "destructive" });
      return;
    }

    setIsPayingLoading(true);

    // Store form data + products in localStorage before redirect
    localStorage.setItem("dfy_business_name", businessName);
    localStorage.setItem("dfy_whatsapp", whatsappNumber);
    localStorage.setItem("dfy_category", businessCategory);
    localStorage.setItem("dfy_products", JSON.stringify(draftProducts));

    try {
      const { data, error } = await supabase.functions.invoke("done-for-you-initialize", {
        body: {
          callback_url: `${window.location.origin}/dashboard?dfy=verify`,
        },
      });

      if (error || !data?.authorization_url) {
        throw new Error(data?.error || error?.message || "Failed to initialize payment");
      }

      localStorage.setItem("paystack_dfy_reference", data.reference);
      window.location.href = data.authorization_url;
    } catch (error) {
      console.error("Payment error:", error);
      toast({ title: "Payment Error", description: "Could not start payment. Please try again.", variant: "destructive" });
      setIsPayingLoading(false);
    }
  };

  const handleVerifyPayment = async (reference: string) => {
    setStep("creating");
    setCreatingStatus("Verifying payment...");

    const name = localStorage.getItem("dfy_business_name") || "My Business";
    const whatsapp = localStorage.getItem("dfy_whatsapp") || "";
    const category = localStorage.getItem("dfy_category") || "";
    const productsJson = localStorage.getItem("dfy_products");
    let products: DraftProduct[] = [];
    try { products = productsJson ? JSON.parse(productsJson) : []; } catch { /* ignore */ }

    try {
      setCreatingStatus("AI is crafting your store & products...");

      const { data, error } = await supabase.functions.invoke("done-for-you-setup", {
        body: {
          reference,
          business_name: name,
          whatsapp_number: whatsapp,
          business_category: category,
          products,
        },
      });

      if (error || !data?.success) {
        throw new Error(data?.error || error?.message || "Setup failed");
      }

      // Clean up localStorage
      localStorage.removeItem("dfy_business_name");
      localStorage.removeItem("dfy_whatsapp");
      localStorage.removeItem("dfy_category");
      localStorage.removeItem("dfy_products");
      localStorage.removeItem("paystack_dfy_reference");

      setShopId(data.shop_id);
      setBusinessName(data.shop_name);
      onShopCreated(data.shop_id);

      toast({ title: "Store Created! 🎉", description: `"${data.shop_name}" is now live with ${data.products_created || 0} products!` });
      setStep("complete");
    } catch (error) {
      console.error("DFY setup error:", error);
      toast({ title: "Setup Error", description: error instanceof Error ? error.message : "Failed to create store", variant: "destructive" });
      setStep("intro");
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("dfy_popup_dismissed", "true");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && step !== "creating" && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        {/* STEP: INTRO */}
        {step === "intro" && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Rocket className="w-5 h-5 text-white" />
                </div>
                <DialogTitle className="text-xl">
                  Let us build your store in 60 seconds
                </DialogTitle>
              </div>
              <DialogDescription>
                Just tell us the basics — AI handles the rest.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-2">
            <div className="bg-accent/10 rounded-lg p-4 space-y-2">
                <p className="font-medium text-sm">What you get:</p>
                <ul className="space-y-1.5">
                  {[
                    "Professional store with your business name",
                    "AI-crafted description that builds trust",
                    "Custom store link ready to share",
                    "WhatsApp ordering set up instantly",
                    "All your products listed with AI descriptions",
                    "Free for 5 products or less • ₦5,000 for bulk AI setup (6+)",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="dfy-name">Business Name *</Label>
                  <Input id="dfy-name" placeholder="e.g. Ada's Kitchen, FreshFit Smoothies" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="dfy-whatsapp">WhatsApp Number *</Label>
                  <Input id="dfy-whatsapp" placeholder="e.g. 08012345678" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="dfy-category">Business Category</Label>
                  <Input id="dfy-category" placeholder="e.g. Fashion, Food, Beauty" value={businessCategory} onChange={(e) => setBusinessCategory(e.target.value)} />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button onClick={handleGoToProducts} className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90" size="lg">
                  <Package className="w-4 h-4 mr-2" />
                  Next: Add Your Products
                </Button>
                <Button variant="ghost" onClick={handleDismiss} className="text-muted-foreground">
                  I'll set it up myself
                </Button>
              </div>
            </div>
          </>
        )}

        {/* STEP: PRODUCTS (before payment) */}
        {step === "products" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Add your products
              </DialogTitle>
              <DialogDescription>
                Add the products you sell — AI will write descriptions for each.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-2">
              {/* Added products list */}
              {draftProducts.length > 0 && (
                <div className="space-y-2">
                  {draftProducts.map((p, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-accent/10 border">
                      {p.imageUrl && <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded-md object-cover" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{p.name}</p>
                        <p className="text-xs text-muted-foreground">₦{p.price.toLocaleString()} • {p.type}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveDraftProduct(i)} className="h-8 w-8 shrink-0">
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add product form - no limit */}
              {true && (
                <div className="space-y-3 border rounded-lg p-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Name *</Label>
                      <Input placeholder="e.g. Ankara Dress" value={productName} onChange={(e) => setProductName(e.target.value)} />
                    </div>
                    <div>
                      <Label>Price (₦) *</Label>
                      <Input type="number" placeholder="e.g. 15000" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Label className="text-sm">Type:</Label>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs ${productType === "product" ? "font-semibold" : "text-muted-foreground"}`}>Product</span>
                      <Switch checked={productType === "service"} onCheckedChange={(c) => setProductType(c ? "service" : "product")} />
                      <span className={`text-xs ${productType === "service" ? "font-semibold" : "text-muted-foreground"}`}>Service</span>
                    </div>
                  </div>

                  <ImageUpload value={productImage} onChange={setProductImage} folder="product-images" />

                  <Button size="sm" onClick={handleAddDraftProduct} disabled={!productName.trim() || !productPrice.trim()} className="w-full">
                    <Plus className="w-3 h-3 mr-1" /> Add Product ({draftProducts.length})
                  </Button>
                </div>
              )}

              {/* Trust + fee info */}
              <div className="space-y-2">
                {draftProducts.length > 5 && (
                  <>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Powered by Paystack — your payment is 100% secure</span>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      AI bulk setup: ₦5,000 + ₦175 processing fee = <span className="font-semibold">₦5,175 total</span>
                    </p>
                  </>
                )}
                {draftProducts.length <= 5 && draftProducts.length > 0 && (
                  <p className="text-xs text-center text-green-600 font-medium">
                    ✨ Free setup for {draftProducts.length} product{draftProducts.length > 1 ? 's' : ''}!
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <Button
                  onClick={draftProducts.length > 5 ? handlePayAndCreate : handleFreeCreate}
                  disabled={isPayingLoading || draftProducts.length === 0}
                  className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  size="lg"
                >
                  {isPayingLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  {draftProducts.length > 5 ? 'Pay ₦5,175 & Create My Store' : 'Create My Store — Free!'}
                </Button>
                <Button variant="ghost" onClick={() => setStep("intro")} className="text-muted-foreground">
                  ← Back
                </Button>
              </div>
            </div>
          </>
        )}

        {/* STEP: CREATING */}
        {step === "creating" && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 animate-pulse">
              <Wand2 className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Creating your store & products...</h3>
            <p className="text-sm text-muted-foreground">{creatingStatus}</p>
            <Loader2 className="w-6 h-6 text-primary animate-spin mt-4" />
          </div>
        )}

        {/* STEP: COMPLETE */}
        {step === "complete" && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Your store is live! 🎉</h3>
            <p className="text-sm text-muted-foreground mb-6">
              {businessName} is ready with all your products.
            </p>

            <div className="flex flex-col gap-2 w-full max-w-xs">
              <Button onClick={() => { onClose(); navigate("/my-store"); }}>
                <Store className="w-4 h-4 mr-2" /> View My Store
              </Button>
              <Button variant="outline" onClick={() => { onClose(); navigate("/subscription"); }}>
                <ArrowRight className="w-4 h-4 mr-2" /> Choose a Plan
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
