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
      // Format the user ID to ensure it has hyphens for UUID
      const formattedUserId = formatUUIDWithHyphens(user.id);
      console.log("Formatted User ID for API call:", formattedUserId);
      
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
      parsed.error.errors.forEach((e) => {
        if (e.path[0]) errs[e.path[0] as string] = e.message;
      });
      setErrors(errs);
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

      // Format shop ID for update if needed
      const formattedShopId = shop?.id ? formatUUIDWithHyphens(shop.id) : shop?.id;
      
      await shopService.updateShop(formattedShopId, {
        ...formData,
        payment_method,
      });

      toast({ title: "Success", description: "Store updated" });
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
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <PageWrapper patternVariant="dots" patternOpacity={0.5}>
      <div className="container mx-auto py-8 max-w-3xl">
        <Button variant="ghost" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Store Information</CardTitle>
            <CardDescription>Manage your store</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
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
                <Label>Payment Methods</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="enable_bank_transfer"
                    checked={formData.enable_bank_transfer}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, enable_bank_transfer: checked as boolean })
                    }
                  />
                  <Label htmlFor="enable_bank_transfer">Enable Bank Transfer</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="enable_paystack"
                    checked={formData.enable_paystack}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, enable_paystack: checked as boolean })
                    }
                  />
                  <Label htmlFor="enable_paystack">Enable Paystack</Label>
                </div>

                {errors.enable_paystack && errors.enable_bank_transfer && (
                  <p className="text-red-500 text-sm">{errors.enable_paystack}</p>
                )}
              </div>

              {/* Bank Transfer Details */}
              {formData.enable_bank_transfer && (
                <div className="space-y-4 border p-4 rounded-lg">
                  <Label className="text-lg">Bank Transfer Details</Label>
                  <div className="space-y-2">
                    <Label htmlFor="bank_account_name">Account Name</Label>
                    <Input
                      id="bank_account_name"
                      value={formData.bank_account_name}
                      onChange={(e) =>
                        setFormData({ ...formData, bank_account_name: e.target.value })
                      }
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bank_name">Bank Name</Label>
                    <Input
                      id="bank_name"
                      value={formData.bank_name}
                      onChange={(e) =>
                        setFormData({ ...formData, bank_name: e.target.value })
                      }
                      placeholder="First Bank"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bank_account_number">Account Number</Label>
                    <Input
                      id="bank_account_number"
                      value={formData.bank_account_number}
                      onChange={(e) =>
                        setFormData({ ...formData, bank_account_number: e.target.value })
                      }
                      placeholder="1234567890"
                    />
                  </div>
                  
                  <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-5 h-5 text-primary" />
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
                    >
                      Verify Now
                    </Button>
                  </div>
                </div>
              )}

              {/* Paystack Details */}
              {formData.enable_paystack && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="paystack_public_key">Paystack Public Key</Label>
                    <Input
                      id="paystack_public_key"
                      value={formData.paystack_public_key}
                      onChange={(e) =>
                        setFormData({ ...formData, paystack_public_key: e.target.value })
                      }
                      placeholder="pk_live_xxxxxxxx"
                    />
                  </div>

                </div>
              )}

              <Button type="submit" disabled={isSaving} className="w-full">
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