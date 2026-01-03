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
} from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";
import { QRCodeSVG } from "qrcode.react";
import { StoreFlyerTemplate } from "@/components/StoreFlyerTemplate";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { z } from "zod";
import { AdirePattern } from "@/components/patterns/AdirePattern";
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
      const res = await shopService.getShopByOwner(user.id);
      const data = Array.isArray(res.data) ? res.data[0] : res.data;

      if (!data) return;

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

      const productsRes = await productService.getProducts({
        shopId: data.id,
      });
      setProducts(productsRes.data || []);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load store",
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

      await shopService.updateShop(shop.id, {
        ...formData,
        payment_method,
      });

      toast({ title: "Success", description: "Store updated" });
      loadShop();
    } catch {
      toast({
        title: "Error",
        description: "Failed to save store",
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
    <div className="min-h-screen relative">
      <AdirePattern variant="dots" className="fixed inset-0 opacity-5" />

      <div className="container mx-auto py-8 relative z-10 max-w-3xl">
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
              <Input
                value={formData.shop_name}
                onChange={(e) =>
                  setFormData({ ...formData, shop_name: e.target.value })
                }
                placeholder="Store name"
              />

              <Input
                value={formData.shop_slug}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    shop_slug: e.target.value.toLowerCase(),
                  })
                }
                placeholder="store-slug"
              />

              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />

              {/* LOGO */}
              <div className="space-y-2">
                {formData.logo_url && (
                  <img
                    src={formData.logo_url}
                    className="w-full h-40 object-cover rounded-lg border"
                  />
                )}
                <ImageUpload
                  label="Store Logo"
                  value={formData.logo_url}
                  onChange={(url) =>
                    setFormData({ ...formData, logo_url: url })
                  }
                />

                {formData.logo_url && (
                  <img
                    src={formData.logo_url}
                    className="w-full h-40 object-cover rounded-lg border"
                  />
                )}
              </div>

              {/* BANNER */}
              <div className="space-y-2">
                {formData.banner_url && (
                  <img
                    src={formData.banner_url}
                    className="w-full h-40 object-cover rounded-lg border"
                  />
                )}
                <ImageUpload
                  label="Store Banner"
                  value={formData.banner_url}
                  onChange={(url) =>
                    setFormData({ ...formData, banner_url: url })
                  }
                />

                {formData.banner_url && (
                  <img
                    src={formData.banner_url}
                    className="w-full h-40 object-cover rounded-lg border"
                  />
                )}
              </div>

              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </form>
          </CardContent>
        </Card>
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
    </div>
  );
};

export default MyStore;
