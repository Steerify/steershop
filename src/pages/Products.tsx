import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Edit, Trash2, Loader2, Package, Clock, Briefcase, CalendarCheck, AlertCircle } from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";
import { VideoUpload } from "@/components/VideoUpload";
import { z } from "zod";
import { PageWrapper } from "@/components/PageWrapper";
import { Switch } from "@/components/ui/switch";
import { AdirePattern } from "@/components/patterns/AdirePattern";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Joyride, { CallBackProps, STATUS } from "react-joyride";
import { useTour } from "@/hooks/useTour";
import { TourTooltip } from "@/components/tours/TourTooltip";
import { productsTourSteps } from "@/components/tours/tourSteps";
import { TourButton } from "@/components/tours/TourButton";
import shopService from "@/services/shop.service";
import productService from "@/services/product.service";
import { Shop, Product } from "@/types/api";
import { handleApiError } from "@/lib/api-error-handler";
import { useAuth } from "@/context/AuthContext";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { UpgradePrompt } from "@/components/UpgradePrompt";

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

const productSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(200, "Name must be less than 200 characters"),
  description: z.string().trim().max(1000, "Description must be less than 1000 characters").optional(),
  price: z.number().min(0.01, "Price must be greater than 0").max(10000000, "Price is too high"),
  inventory: z.number().int().min(0, "Stock/slots cannot be negative"),
  type: z.enum(["product", "service"]),
  duration_minutes: z.number().int().min(0).optional(),
  booking_required: z.boolean().optional(),
  is_available: z.boolean(),
});

const Products = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { checkProductLimit } = useSubscriptionLimits();
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"all" | "products" | "services">("all");
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [productLimitInfo, setProductLimitInfo] = useState<{
    current_count: number;
    max_allowed: number;
    plan_slug: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    inventory: "",
    is_available: true,
    type: "product" as "product" | "service",
    duration_minutes: "",
    booking_required: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Tour state
  const { hasSeenTour, isRunning, startTour, endTour, resetTour } = useTour('products');

  const handleTourCallback = (data: CallBackProps) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      endTour(status === STATUS.FINISHED);
    }
  };

  useEffect(() => {
    loadShopAndProducts();
  }, []);

  const loadShopAndProducts = async () => {
    try {
      if (!user) {
        navigate("/auth/login");
        return;
      }

      const formattedUserId = formatUUIDWithHyphens(user.id);
      const shopsResponse = await shopService.getShopByOwner(formattedUserId);
      
      const userShop = shopsResponse.data[0];

      if (!userShop) {
        toast({
          title: "No Store Found",
          description: "Please create your store first",
        });
        navigate("/my-store");
        return;
      }

      setShop(userShop);

      const formattedShopId = formatUUIDWithHyphens(userShop.id);
      const productsResponse = await productService.getProducts({ 
        shopId: formattedShopId,
        limit: 100 
      });

      setProducts(productsResponse.data || []);
    } catch (error) {
      // Error already handled
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      inventory: "",
      is_available: true,
      type: "product",
      duration_minutes: "",
      booking_required: false,
    });
    setImageUrl("");
    setVideoUrl("");
    setEditingProduct(null);
    setErrors({});
  };

  const handleOpenDialog = async (product?: Product) => {
    if (product) {
      // Editing existing product - no limit check needed
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || "",
        price: product.price.toString(),
        inventory: product.inventory.toString(),
        is_available: product.is_available ?? true,
        type: product.type || "product",
        duration_minutes: product.duration_minutes?.toString() || "",
        booking_required: product.booking_required ?? false,
      });
      setImageUrl(product.images?.[0]?.url || "");
      setVideoUrl(product.video_url || "");
      setIsDialogOpen(true);
    } else {
      // Creating new product - check limits first
      const limitCheck = await checkProductLimit();
      if (limitCheck) {
        setProductLimitInfo({
          current_count: limitCheck.current_count,
          max_allowed: limitCheck.max_allowed,
          plan_slug: limitCheck.plan_slug,
        });
        
        if (!limitCheck.can_create) {
          // Show upgrade prompt instead of opening dialog
          setShowUpgradePrompt(true);
          return;
        }
      }
      resetForm();
      setIsDialogOpen(true);
    }
  };

  // Image upload logic will be moved to a real API endpoint later
  // For now we use the mock image logic in handleSubmit

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = productSchema.safeParse({
      ...formData,
      price: parseFloat(formData.price),
      inventory: parseInt(formData.inventory),
      duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : undefined,
    });

    if (!validation.success) {
      // Local validation still useful for immediate feedback
      const newErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          newErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(newErrors);
      return;
    }

    if (!shop) return;

    setIsSaving(true);

    try {
      const images = imageUrl ? [{ url: imageUrl, alt: formData.name, position: 1 }] : [];

      const productData = {
        shopId: shop.id,
        categoryId: "default-category", // Placeholder
        name: formData.name,
        slug: formData.name.toLowerCase().replace(/ /g, '-'),
        description: formData.description,
        price: parseFloat(formData.price),
        inventory: parseInt(formData.inventory),
        images: images,
        type: formData.type,
        duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : undefined,
        booking_required: formData.booking_required,
        is_available: formData.is_available,
        video_url: videoUrl || undefined,
      };

      let response;
      if (editingProduct) {
        const formattedProductId = formatUUIDWithHyphens(editingProduct.id);
        response = await productService.updateProduct(formattedProductId, productData);
      } else {
        response = await productService.createProduct(productData);
      }

      toast({
        title: "Success",
        description: editingProduct ? `${formData.type.charAt(0).toUpperCase() + formData.type.slice(1)} updated` : `${formData.type.charAt(0).toUpperCase() + formData.type.slice(1)} created`,
      });

      setIsDialogOpen(false);
      resetForm();
      loadShopAndProducts();
    } catch (error: any) {
      // Error handled by handleApiError
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (productId: string, type: string) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;

    try {
      const formattedProductId = formatUUIDWithHyphens(productId);
      await productService.deleteProduct(formattedProductId);
      
      toast({
        title: "Success",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} deleted`,
      });

      loadShopAndProducts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to delete ${type}`,
        variant: "destructive",
      });
    }
  };

  const filteredProducts = products.filter(product => {
    if (activeTab === "all") return true;
    if (activeTab === "products") return product.type !== "service";
    if (activeTab === "services") return product.type === "service";
    return true;
  });

  const productsCount = products.filter(p => p.type !== "service").length;
  const servicesCount = products.filter(p => p.type === "service").length;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      {/* Upgrade Prompt for Product Limit */}
      <UpgradePrompt
        isOpen={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
        feature="products"
        currentPlan={productLimitInfo?.plan_slug || "basic"}
        currentCount={productLimitInfo?.current_count}
        maxAllowed={productLimitInfo?.max_allowed}
      />

      <PageWrapper patternVariant="dots" patternOpacity={0.5}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="mb-4 sm:mb-6 flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate("/dashboard")} className="hover:bg-primary/10 min-h-[44px] px-2 sm:px-4">
              <ArrowLeft className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Back to Dashboard</span>
            </Button>
            <TourButton 
              onStartTour={startTour} 
              hasSeenTour={hasSeenTour} 
              onResetTour={resetTour}
            />
          </div>

        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold mb-1 sm:mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Products & Services
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">Manage your catalog - sell products or offer services</p>
          </div>
          <Button onClick={() => handleOpenDialog()} className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent hover:opacity-90 min-h-[44px]" data-tour="add-item-btn">
            <Plus className="w-4 h-4 mr-2" />
            Add New
          </Button>
        </div>

        {/* Tabs for filtering */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mb-4 sm:mb-6" data-tour="type-filter">
          <TabsList className="bg-card border border-primary/10 w-full sm:w-auto flex overflow-x-auto">
            <TabsTrigger value="all" className="flex-1 sm:flex-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground min-h-[40px] text-xs sm:text-sm">
              All ({products.length})
            </TabsTrigger>
            <TabsTrigger value="products" className="flex-1 sm:flex-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground min-h-[40px] text-xs sm:text-sm">
              <Package className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Products</span> ({productsCount})
            </TabsTrigger>
            <TabsTrigger value="services" className="flex-1 sm:flex-none data-[state=active]:bg-accent data-[state=active]:text-accent-foreground min-h-[40px] text-xs sm:text-sm">
              <Briefcase className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Services</span> ({servicesCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {filteredProducts.length === 0 ? (
          <Card className="border-primary/10">
            <CardContent className="py-16 text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center">
                {activeTab === "services" ? (
                  <Briefcase className="w-10 h-10 text-accent" />
                ) : (
                  <Package className="w-10 h-10 text-primary" />
                )}
              </div>
              <h3 className="text-xl font-heading font-semibold mb-2">
                {activeTab === "services" ? "No services yet" : activeTab === "products" ? "No products yet" : "No items yet"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {activeTab === "services" 
                  ? "Start by adding your first service" 
                  : activeTab === "products" 
                  ? "Start by adding your first product"
                  : "Start by adding your first product or service"
                }
              </p>
              <Button onClick={() => handleOpenDialog()} className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" />
                Add {activeTab === "services" ? "Service" : activeTab === "products" ? "Product" : "Item"}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredProducts.map((product, index) => (
              <Card key={product.id} className="overflow-hidden group hover:shadow-xl hover:shadow-primary/10 transition-all border-primary/10 hover:border-primary/30" data-tour={index === 0 ? "product-card" : undefined}>
                {product.images && product.images.length > 0 ? (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={product.images[0].url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className={`h-48 bg-gradient-to-br ${product.type === 'service' ? 'from-accent/10 to-primary/10' : 'from-primary/10 to-accent/10'} flex items-center justify-center relative`}>
                    {product.type === 'service' ? (
                      <Briefcase className="w-12 h-12 text-muted-foreground" />
                    ) : (
                      <Package className="w-12 h-12 text-muted-foreground" />
                    )}
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="flex items-start justify-between gap-2 font-heading">
                    <span className="line-clamp-1">{product.name}</span>
                    <Badge variant={product.type === 'service' ? 'secondary' : 'default'}>
                      {product.type.charAt(0).toUpperCase() + product.type.slice(1)}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {product.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Price:</span>
                      <span className="font-semibold text-primary">₦{product.price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{product.type === 'service' ? 'Available Slots:' : 'Stock:'}</span>
                      <span className={product.inventory === 0 ? "text-destructive font-semibold" : "text-foreground"}>
                        {product.inventory} {product.type === 'service' ? 'slots' : 'units'}
                      </span>
                    </div>
                    {product.type === 'service' && product.duration_minutes && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration:</span>
                        <span>{product.duration_minutes} minutes</span>
                      </div>
                    )}
                    {product.type === 'service' && product.booking_required && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Booking:</span>
                        <span className="text-accent font-semibold">Required</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 border-primary/30 hover:bg-primary/10 hover:text-primary"
                      onClick={() => handleOpenDialog(product)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      className="border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => handleDelete(product.id, product.type || 'item')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">
              {editingProduct ? `Edit ${formData.type === 'service' ? 'Service' : 'Product'}` : "Add New Item"}
            </DialogTitle>
            <DialogDescription>
              {editingProduct ? "Update the details below" : "Fill in the details to add a new product or service"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type Toggle */}
            <div className="flex items-center justify-center gap-4 p-4 bg-muted/50 rounded-lg" data-tour="item-type-toggle">
              <Label className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg transition-all ${formData.type === 'product' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>
                <input 
                  type="radio" 
                  name="type" 
                  value="product" 
                  checked={formData.type === 'product'}
                  onChange={() => setFormData({ ...formData, type: 'product', booking_required: false })}
                  className="sr-only"
                />
                <Package className="w-4 h-4" />
                Product
              </Label>
              <Label className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg transition-all ${formData.type === 'service' ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'}`}>
                <input 
                  type="radio" 
                  name="type" 
                  value="service" 
                  checked={formData.type === 'service'}
                  onChange={() => setFormData({ ...formData, type: 'service' })}
                  className="sr-only"
                />
                <Briefcase className="w-4 h-4" />
                Service
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">{formData.type === 'service' ? 'Service' : 'Product'} Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={formData.type === 'service' ? "e.g., Hair Braiding" : "e.g., Handmade Bag"}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your item..."
                rows={3}
              />
            </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₦) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                    className={errors.price ? "border-destructive" : ""}
                  />
                  {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inventory">
                    {formData.type === 'service' ? 'Available Slots' : 'Stock Quantity'} *
                  </Label>
                  <Input
                    id="inventory"
                    type="number"
                    value={formData.inventory}
                    onChange={(e) => setFormData({ ...formData, inventory: e.target.value })}
                    placeholder="0"
                    className={errors.inventory ? "border-destructive" : ""}
                  />
                  {errors.inventory && <p className="text-sm text-destructive">{errors.inventory}</p>}
                </div>
              </div>

            {/* Service-specific fields */}
            {formData.type === 'service' && (
              <div className="space-y-4 p-4 bg-accent/5 rounded-lg border border-accent/20">
                <div className="space-y-2">
                  <Label htmlFor="duration_minutes">Duration (minutes)</Label>
                  <Input
                    id="duration_minutes"
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                    placeholder="e.g., 60"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="booking_required">Requires Booking</Label>
                    <p className="text-sm text-muted-foreground">Customers must book an appointment</p>
                  </div>
                  <Switch
                    id="booking_required"
                    checked={formData.booking_required}
                    onCheckedChange={(checked) => setFormData({ ...formData, booking_required: checked })}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <ImageUpload
                label={formData.type === 'service' ? 'Service Image' : 'Product Image'}
                value={imageUrl}
                onChange={(url) => setImageUrl(url)}
                folder="product-images"
              />
            </div>

            <div className="space-y-2">
              <VideoUpload
                label="Short Video (max 10 seconds)"
                value={videoUrl}
                onChange={(url) => setVideoUrl(url)}
                maxDurationSeconds={10}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="is_available">Available for purchase</Label>
              <Switch
                id="is_available"
                checked={formData.is_available}
                onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  editingProduct ? "Update" : "Create"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Guided Tour */}
      <Joyride
        steps={productsTourSteps}
        run={isRunning}
        continuous
        showSkipButton
        showProgress
        callback={handleTourCallback}
        tooltipComponent={TourTooltip}
        styles={{
          options: {
            zIndex: 10000,
            arrowColor: 'hsl(var(--card))',
          }
        }}
      />
      </PageWrapper>
    </>
  );
};

export default Products;