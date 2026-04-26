import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Search, Edit, Trash2, Eye, EyeOff, Package, Briefcase, MoreHorizontal, Loader2, Wand2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AdirePattern } from "@/components/patterns/AdirePattern";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { autoCategorize, getCategoryLabel } from "@/utils/autoCategorize";

import adminService from "@/services/admin.service";

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock_quantity: "",
    is_available: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*, shops(shop_name)")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error loading products", variant: "destructive" });
      return;
    }

    setProducts(data || []);
    setIsLoading(false);
  };

  const handleEdit = (product: any) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      stock_quantity: product.stock_quantity.toString(),
      is_available: product.is_available,
    });
    setEditDialogOpen(true);
  };

  const handleDelete = (product: any) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedProduct) return;
    
    try {
      await adminService.deleteProduct(selectedProduct.id);
    } catch (error: any) {
      toast({ title: "Error deleting product", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Product deleted successfully" });
    setDeleteDialogOpen(false);
    setSelectedProduct(null);
    fetchProducts();
  };

  const handleSave = async () => {
    if (!selectedProduct) return;
    setIsSaving(true);
    const parsedPrice = Number(formData.price);
    const parsedStock = Number(formData.stock_quantity);

    if (!Number.isFinite(parsedPrice) || !Number.isInteger(parsedPrice) || parsedPrice <= 0) {
      toast({
        title: "Invalid price",
        description: "Price must be a whole number greater than 0.",
        variant: "destructive",
      });
      setIsSaving(false);
      return;
    }

    if (!Number.isFinite(parsedStock) || !Number.isInteger(parsedStock) || parsedStock < 0) {
      toast({
        title: "Invalid stock",
        description: "Stock quantity must be a whole number of 0 or more.",
        variant: "destructive",
      });
      setIsSaving(false);
      return;
    }

    try {
      await adminService.updateProduct(selectedProduct.id, {
        name: formData.name,
        description: formData.description,
        price: parsedPrice,
        stock_quantity: parsedStock,
        is_available: formData.is_available,
      });
    } catch (error: any) {
      toast({ title: "Error updating product", description: error.message, variant: "destructive" });
      setIsSaving(false);
      return;
    }

    toast({ title: "Product updated successfully" });
    setEditDialogOpen(false);
    setSelectedProduct(null);
    setIsSaving(false);
    fetchProducts();
  };

  const handleAutoCategorize = async () => {
    setIsCategorizing(true);
    try {
      const uncategorized = products.filter(p => !p.category || p.category === 'general');
      if (uncategorized.length === 0) {
        toast({ title: "All products are already categorized" });
        setIsCategorizing(false);
        return;
      }

      let updated = 0;
      for (const product of uncategorized) {
        const category = autoCategorize(product.name, product.description || '');
        if (category !== 'other' && category !== product.category) {
          const { error } = await supabase
            .from("products")
            .update({ category })
            .eq("id", product.id);
          if (!error) updated++;
        }
      }

      toast({ title: `Auto-categorized ${updated} product${updated !== 1 ? 's' : ''}` });
      fetchProducts();
    } catch {
      toast({ title: "Error during categorization", variant: "destructive" });
    }
    setIsCategorizing(false);
  };

  const toggleAvailability = async (product: any) => {
    try {
      await adminService.updateProduct(product.id, { is_available: !product.is_available });
    } catch (error: any) {
      toast({ title: "Error updating availability", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: `Product ${!product.is_available ? 'enabled' : 'disabled'}` });
    fetchProducts();
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(search.toLowerCase()) ||
    product.shops?.shop_name?.toLowerCase().includes(search.toLowerCase())
  );

  const productsCount = products.filter(p => p.type !== "service").length;
  const servicesCount = products.filter(p => p.type === "service").length;

  return (
    <AdminLayout>
      <div className="space-y-6 relative">
        <AdirePattern variant="dots" className="absolute inset-0 opacity-5 pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-heading font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Products & Services Management
              </h1>
              <p className="text-muted-foreground">View and manage all items on the platform</p>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="px-3 py-1">
                <Package className="w-4 h-4 mr-1" />
                {productsCount} Products
              </Badge>
              <Badge variant="outline" className="px-3 py-1 bg-accent/10 border-accent/30">
                <Briefcase className="w-4 h-4 mr-1" />
                {servicesCount} Services
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search products or shops..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 border-primary/20"
              />
            </div>
            <Button onClick={handleAutoCategorize} disabled={isCategorizing} variant="outline">
              {isCategorizing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Wand2 className="w-4 h-4 mr-2" />}
              Auto-Categorize
            </Button>
          </div>

          <div className="border rounded-lg border-primary/10 bg-card/50 backdrop-blur overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              {/* Mobile View: Cards */}
              <div className="grid gap-4 p-4 md:hidden">
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-2xl bg-muted/30">
                    <Package className="w-12 h-12 opacity-20 mx-auto mb-3" />
                    <p className="font-medium">No products found</p>
                  </div>
                ) : (
                  filteredProducts.map((product) => (
                    <div key={product.id} className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm hover:shadow-md transition-all">
                      <div className="p-4 space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center border shadow-sm shrink-0">
                              {product.type === "service" ? <Briefcase className="w-6 h-6 text-accent" /> : <Package className="w-6 h-6 text-primary" />}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-foreground truncate">{product.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{product.shops?.shop_name || "N/A"}</p>
                            </div>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="font-bold text-primary">₦{Number(product.price).toLocaleString()}</p>
                            <p className="text-[10px] text-muted-foreground">{product.stock_quantity} in stock</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="text-[10px] font-medium bg-muted/50 border-border/50">
                            {getCategoryLabel(product.category || 'other')}
                          </Badge>
                          <Badge variant={product.is_available ? "default" : "secondary"} className={product.is_available ? "bg-green-600 text-[10px] uppercase tracking-wider font-bold" : "text-[10px] uppercase tracking-wider font-bold"}>
                            {product.is_available ? "Available" : "Unavailable"}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="w-full rounded-xl font-semibold h-9 gap-1.5"
                            onClick={() => handleEdit(product)}
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="outline" className="w-full rounded-xl font-semibold h-9 gap-1.5">
                                <MoreHorizontal className="w-4 h-4" />
                                Actions
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 rounded-xl p-1 shadow-xl border-primary/10">
                              <DropdownMenuItem onClick={() => toggleAvailability(product)} className="rounded-lg py-2.5">
                                {product.is_available ? (
                                  <><EyeOff className="w-4 h-4 mr-2" /> Disable</>
                                ) : (
                                  <><Eye className="w-4 h-4 mr-2" /> Enable</>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(product)} className="text-red-600 focus:text-red-600 rounded-lg py-2.5">
                                <Trash2 className="w-4 h-4 mr-2" /> Delete Product
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Desktop View: Table */}
              <div className="hidden md:block overflow-x-auto">
                <Table className="min-w-[800px]">
                <TableHeader>
                  <TableRow className="hover:bg-muted/50">
                    <TableHead>Name</TableHead>
                     <TableHead>Category</TableHead>
                     <TableHead>Type</TableHead>
                     <TableHead>Shop</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                        No products found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((product) => (
                      <TableRow key={product.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium">{product.name}</TableCell>
                         <TableCell>
                           <Badge variant="outline" className="text-xs">
                             {getCategoryLabel(product.category || 'other')}
                           </Badge>
                         </TableCell>
                         <TableCell>
                          <Badge variant={product.type === "service" ? "secondary" : "default"} className={product.type === "service" ? "bg-accent/20 text-accent" : ""}>
                            {product.type === "service" ? (
                              <><Briefcase className="w-3 h-3 mr-1" /> Service</>
                            ) : (
                              <><Package className="w-3 h-3 mr-1" /> Product</>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>{product.shops?.shop_name || "N/A"}</TableCell>
                        <TableCell className="font-semibold text-primary">₦{Number(product.price).toLocaleString()}</TableCell>
                        <TableCell>{product.stock_quantity}</TableCell>
                        <TableCell>
                          <Badge variant={product.is_available ? "default" : "secondary"} className={product.is_available ? "bg-green-600" : ""}>
                            {product.is_available ? "Available" : "Unavailable"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(product)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toggleAvailability(product)}>
                                {product.is_available ? (
                                  <><EyeOff className="w-4 h-4 mr-2" /> Disable</>
                                ) : (
                                  <><Eye className="w-4 h-4 mr-2" /> Enable</>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(product)} className="text-destructive">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              </div>
            )}
          </div>
        </div>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
              <DialogDescription>Update product details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price (₦)</Label>
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Stock</Label>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <Label>Available for Sale</Label>
                <Switch
                  checked={formData.is_available}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Product</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{selectedProduct?.name}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
