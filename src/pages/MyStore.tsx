import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Upload, Loader2, Store, CreditCard, MessageCircle } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { z } from "zod";

const shopSchema = z.object({
  shop_name: z.string().trim().min(2, "Store name must be at least 2 characters").max(100, "Store name must be less than 100 characters"),
  shop_slug: z.string().trim().min(2, "URL slug must be at least 2 characters").max(50, "URL slug must be less than 50 characters").regex(/^[a-z0-9-]+$/, "URL slug can only contain lowercase letters, numbers, and hyphens"),
  description: z.string().trim().max(500, "Description must be less than 500 characters").optional(),
  whatsapp_number: z.string().trim().min(10, "WhatsApp number must be at least 10 digits").max(20, "WhatsApp number too long"),
  payment_method: z.enum(["bank_transfer", "paystack"]),
  bank_account_name: z.string().trim().max(100).optional(),
  bank_name: z.string().trim().max(100).optional(),
  bank_account_number: z.string().trim().max(20).optional(),
  paystack_public_key: z.string().trim().optional(),
}).refine((data) => {
  if (data.payment_method === "bank_transfer") {
    return data.bank_account_name && data.bank_name && data.bank_account_number;
  }
  if (data.payment_method === "paystack") {
    return data.paystack_public_key;
  }
  return true;
}, {
  message: "Please provide all required payment details for your selected payment method",
});

const MyStore = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [shop, setShop] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    shop_name: "",
    shop_slug: "",
    description: "",
    whatsapp_number: "",
    payment_method: "bank_transfer" as "bank_transfer" | "paystack",
    bank_account_name: "",
    bank_name: "",
    bank_account_number: "",
    paystack_public_key: "",
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadShop();
  }, []);

  const loadShop = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth/login");
        return;
      }

      const { data: shopData } = await supabase
        .from("shops")
        .select("*")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (shopData) {
        setShop(shopData);
        setFormData({
          shop_name: shopData.shop_name,
          shop_slug: shopData.shop_slug,
          description: shopData.description || "",
          whatsapp_number: shopData.whatsapp_number || "",
          payment_method: (shopData.payment_method as "bank_transfer" | "paystack") || "bank_transfer",
          bank_account_name: shopData.bank_account_name || "",
          bank_name: shopData.bank_name || "",
          bank_account_number: shopData.bank_account_number || "",
          paystack_public_key: shopData.paystack_public_key || "",
        });
      }
    } catch (error) {
      console.error("Error loading shop:", error);
      toast({
        title: "Error",
        description: "Failed to load shop data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const uploadImage = async (file: File, bucket: string, userId: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form data
    const validation = shopSchema.safeParse(formData);
    if (!validation.success) {
      const newErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          newErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(newErrors);
      return;
    }

    setIsSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let logoUrl = shop?.logo_url;
      let bannerUrl = shop?.banner_url;

      // Upload logo if selected
      if (logoFile) {
        logoUrl = await uploadImage(logoFile, 'shop-images', user.id);
      }

      // Upload banner if selected
      if (bannerFile) {
        bannerUrl = await uploadImage(bannerFile, 'shop-images', user.id);
      }

      const shopData = {
        ...formData,
        logo_url: logoUrl,
        banner_url: bannerUrl,
        owner_id: user.id,
      };

      if (shop) {
        // Update existing shop
        const { error } = await supabase
          .from("shops")
          .update(shopData)
          .eq("id", shop.id);

        if (error) throw error;
      } else {
        // Create new shop
        const { error } = await supabase
          .from("shops")
          .insert(shopData);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: shop ? "Store updated successfully" : "Store created successfully",
      });

      loadShop();
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

  const handleActivateStore = async () => {
    if (!shop) return;

    try {
      const { error } = await supabase
        .from("shops")
        .update({ is_active: !shop.is_active })
        .eq("id", shop.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: shop.is_active ? "Store deactivated" : "Store activated",
      });

      loadShop();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">My Store</h1>
            <p className="text-muted-foreground">
              {shop ? "Manage your store settings" : "Create your store to start selling"}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="w-5 h-5" />
                Store Information
              </CardTitle>
              <CardDescription>
                Set up your store details and branding
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="shop_name">Store Name *</Label>
                  <Input
                    id="shop_name"
                    value={formData.shop_name}
                    onChange={(e) => setFormData({ ...formData, shop_name: e.target.value })}
                    placeholder="My Awesome Store"
                    className={errors.shop_name ? "border-destructive" : ""}
                  />
                  {errors.shop_name && (
                    <p className="text-sm text-destructive">{errors.shop_name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shop_slug">Store URL *</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">steersolo.com/shop/</span>
                    <Input
                      id="shop_slug"
                      value={formData.shop_slug}
                      onChange={(e) => setFormData({ ...formData, shop_slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                      placeholder="my-store"
                      className={errors.shop_slug ? "border-destructive" : ""}
                    />
                  </div>
                  {errors.shop_slug && (
                    <p className="text-sm text-destructive">{errors.shop_slug}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Tell customers about your store..."
                    rows={4}
                    className={errors.description ? "border-destructive" : ""}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">{errors.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formData.description.length}/500 characters
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="logo">Store Logo</Label>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                      <input
                        id="logo"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                      <label htmlFor="logo" className="cursor-pointer">
                        {logoFile || shop?.logo_url ? (
                          <img
                            src={logoFile ? URL.createObjectURL(logoFile) : shop.logo_url}
                            alt="Logo preview"
                            className="w-32 h-32 object-cover mx-auto rounded-lg mb-2"
                          />
                        ) : (
                          <Upload className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                        )}
                        <p className="text-sm text-muted-foreground">
                          {logoFile ? logoFile.name : "Click to upload logo"}
                        </p>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="banner">Store Banner</Label>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                      <input
                        id="banner"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setBannerFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                      <label htmlFor="banner" className="cursor-pointer">
                        {bannerFile || shop?.banner_url ? (
                          <img
                            src={bannerFile ? URL.createObjectURL(bannerFile) : shop.banner_url}
                            alt="Banner preview"
                            className="w-full h-32 object-cover rounded-lg mb-2"
                          />
                        ) : (
                          <Upload className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                        )}
                        <p className="text-sm text-muted-foreground">
                          {bannerFile ? bannerFile.name : "Click to upload banner"}
                        </p>
                      </label>
                    </div>
                  </div>
                </div>

                {/* WhatsApp Contact */}
                <div className="space-y-2">
                  <Label htmlFor="whatsapp_number" className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp Number *
                  </Label>
                  <Input
                    id="whatsapp_number"
                    type="tel"
                    value={formData.whatsapp_number}
                    onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                    placeholder="+234 800 000 0000"
                    className={errors.whatsapp_number ? "border-destructive" : ""}
                  />
                  {errors.whatsapp_number && (
                    <p className="text-sm text-destructive">{errors.whatsapp_number}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Customers will use this to contact you directly
                  </p>
                </div>

                {/* Payment Settings */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    <Label>Payment Method *</Label>
                  </div>
                  
                  <RadioGroup
                    value={formData.payment_method}
                    onValueChange={(value: "bank_transfer" | "paystack") => 
                      setFormData({ ...formData, payment_method: value })
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                      <Label htmlFor="bank_transfer" className="font-normal cursor-pointer">
                        Bank Transfer (Manual)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="paystack" id="paystack" />
                      <Label htmlFor="paystack" className="font-normal cursor-pointer">
                        Paystack (Automatic)
                      </Label>
                    </div>
                  </RadioGroup>

                  {formData.payment_method === "bank_transfer" && (
                    <div className="space-y-4 p-4 bg-muted rounded-lg">
                      <div className="space-y-2">
                        <Label htmlFor="bank_account_name">Account Name *</Label>
                        <Input
                          id="bank_account_name"
                          value={formData.bank_account_name}
                          onChange={(e) => setFormData({ ...formData, bank_account_name: e.target.value })}
                          placeholder="John Doe"
                          className={errors.bank_account_name ? "border-destructive" : ""}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bank_name">Bank Name *</Label>
                        <Input
                          id="bank_name"
                          value={formData.bank_name}
                          onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                          placeholder="Access Bank"
                          className={errors.bank_name ? "border-destructive" : ""}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bank_account_number">Account Number *</Label>
                        <Input
                          id="bank_account_number"
                          value={formData.bank_account_number}
                          onChange={(e) => setFormData({ ...formData, bank_account_number: e.target.value })}
                          placeholder="0123456789"
                          className={errors.bank_account_number ? "border-destructive" : ""}
                        />
                      </div>
                    </div>
                  )}

                  {formData.payment_method === "paystack" && (
                    <div className="space-y-4 p-4 bg-muted rounded-lg">
                      <div className="space-y-2">
                        <Label htmlFor="paystack_public_key">Paystack Public Key *</Label>
                        <Input
                          id="paystack_public_key"
                          value={formData.paystack_public_key}
                          onChange={(e) => setFormData({ ...formData, paystack_public_key: e.target.value })}
                          placeholder="pk_test_..."
                          className={errors.paystack_public_key ? "border-destructive" : ""}
                        />
                        <p className="text-xs text-muted-foreground">
                          Get your public key from your Paystack dashboard
                        </p>
                      </div>
                    </div>
                  )}

                  {errors.payment_method && (
                    <p className="text-sm text-destructive">{errors.payment_method}</p>
                  )}
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={isSaving} className="flex-1">
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      shop ? "Update Store" : "Create Store"
                    )}
                  </Button>
                  {shop && (
                    <Button
                      type="button"
                      variant={shop.is_active ? "destructive" : "default"}
                      onClick={handleActivateStore}
                    >
                      {shop.is_active ? "Deactivate" : "Activate"}
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MyStore;
