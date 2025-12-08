import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Edit, Trash2, Loader2, Package, Upload } from "lucide-react";
import { z } from "zod";
import { Switch } from "@/components/ui/switch";
import { AdirePattern } from "@/components/patterns/AdirePattern";

const productSchema = z.object({
  name: z.string().trim().min(2, "Product name must be at least 2 characters").max(200, "Product name must be less than 200 characters"),
  description: z.string().trim().max(1000, "Description must be less than 1000 characters").optional(),
  price: z.number().min(0.01, "Price must be greater than 0").max(10000000, "Price is too high"),
  stock_quantity: z.number().int().min(0, "Stock cannot be negative"),
});

const Products = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [shop, setShop] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock_quantity: "",
    is_available: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadShopAndProducts();
  }, []);

  const loadShopAndProducts = async () => {
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
        .single();

      if (!shopData) {
        toast({
          title: "No Store Found",
          description: "Please create your store first",
        });
        navigate("/my-store");
        return;
      }

      setShop(shopData);

      const { data: productsData } = await supabase
        .from("products")
        .select("*")
        .eq("shop_id", shopData.id)
        .order("created_at", { ascending: false });

      setProducts(productsData || []);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      stock_quantity: "",
      is_available: true,
    });
    setImageFile(null);
    setEditingProduct(null);
    setErrors({});
  };

  const handleOpenDialog = (product?: any) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || "",
        price: product.price.toString(),
        stock_quantity: product.stock_quantity.toString(),
        is_available: product.is_available,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const uploadProductImage = async (file: File, shopId: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${shopId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = productSchema.safeParse({
      ...formData,
      price: parseFloat(formData.price),
      stock_quantity: parseInt(formData.stock_quantity),
    });

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
      let imageUrl = editingProduct?.image_url;

      if (imageFile) {
        imageUrl = await uploadProductImage(imageFile, shop.id);
      }

      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity),
        is_available: formData.is_available,
        image_url: imageUrl,
        shop_id: shop.id,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", editingProduct.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("products")
          .insert(productData);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: editingProduct ? "Product updated" : "Product created",
      });

      setIsDialogOpen(false);
      resetForm();
      loadShopAndProducts();
    } catch (error: any) {
      console.error("Error saving product:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product deleted",
      });

      loadShopAndProducts();
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 relative">
      <AdirePattern variant="dots" className="fixed inset-0 opacity-5 pointer-events-none" />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="hover:bg-primary/10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-heading font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Products
            </h1>
            <p className="text-muted-foreground">Manage your product catalog</p>
          </div>
          <Button onClick={() => handleOpenDialog()} className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>

        {products.length === 0 ? (
          <Card className="border-primary/10">
            <CardContent className="py-16 text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center">
                <Package className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-heading font-semibold mb-2">No products yet</h3>
              <p className="text-muted-foreground mb-6">Start by adding your first product</p>
              <Button onClick={() => handleOpenDialog()} className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden group hover:shadow-xl hover:shadow-primary/10 transition-all border-primary/10 hover:border-primary/30">
                {product.image_url ? (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {!product.is_available && (
                      <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                        <span className="text-destructive font-semibold">Unavailable</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                    <Package className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="flex items-start justify-between gap-2 font-heading">
                    <span className="line-clamp-1">{product.name}</span>
                    {!product.is_available && (
                      <span className="text-xs bg-destructive text-destructive-foreground px-2 py-1 rounded shrink-0">
                        Unavailable
                      </span>
                    )}
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
                      <span className="text-muted-foreground">Stock:</span>
                      <span className={product.stock_quantity === 0 ? "text-destructive font-semibold" : "text-foreground"}>
                        {product.stock_quantity} units
                      </span>
                    </div>
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
                      variant="destructive"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-primary/20">
            <DialogHeader>
              <DialogTitle className="font-heading">
                {editingProduct ? "Edit Product" : "Add Product"}
              </DialogTitle>
              <DialogDescription>
                {editingProduct ? "Update product details" : "Create a new product"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Amazing Product"
                  className={`border-primary/20 focus:border-primary ${errors.name ? "border-destructive" : ""}`}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your product..."
                  rows={4}
                  className={`border-primary/20 focus:border-primary ${errors.description ? "border-destructive" : ""}`}
                />
                {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₦) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="1000"
                    className={`border-primary/20 focus:border-primary ${errors.price ? "border-destructive" : ""}`}
                  />
                  {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock">Stock Quantity *</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                    placeholder="100"
                    className={`border-primary/20 focus:border-primary ${errors.stock_quantity ? "border-destructive" : ""}`}
                  />
                  {errors.stock_quantity && <p className="text-sm text-destructive">{errors.stock_quantity}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Product Image</Label>
                <div className="border-2 border-dashed border-primary/20 rounded-lg p-6 text-center hover:border-primary/40 transition-colors cursor-pointer">
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <label htmlFor="image" className="cursor-pointer">
                    {imageFile || editingProduct?.image_url ? (
                      <img
                        src={imageFile ? URL.createObjectURL(imageFile) : editingProduct.image_url}
                        alt="Preview"
                        className="w-full max-h-64 object-contain rounded-lg mb-2"
                      />
                    ) : (
                      <div className="py-8">
                        <Upload className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {imageFile ? imageFile.name : "Click to upload image"}
                    </p>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-primary/10">
                <Label htmlFor="available" className="cursor-pointer">
                  Product Available for Sale
                </Label>
                <Switch
                  id="available"
                  checked={formData.is_available}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={isSaving} className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90">
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    editingProduct ? "Update Product" : "Create Product"
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="border-primary/30">
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Products;
