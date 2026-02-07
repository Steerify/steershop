import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { wishlistService } from "@/services/wishlist.service";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { CustomerSidebar } from "@/components/CustomerSidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Package, Trash2, ShoppingCart, ArrowRight, Loader2 } from "lucide-react";
import { AdirePattern } from "@/components/patterns/AdirePattern";
import logo from "@/assets/steersolo-logo.jpg";

const CustomerWishlist = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);

  useEffect(() => {
    if (!isAuthLoading) {
      if (user) {
        loadWishlist();
      } else {
        navigate("/auth/login");
      }
    }
  }, [user, isAuthLoading]);

  const loadWishlist = async () => {
    try {
      const data = await wishlistService.getWishlist();
      setWishlistItems(data);
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to load wishlist", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (productId: string) => {
    try {
      await wishlistService.toggle(productId);
      setWishlistItems(prev => prev.filter(item => item.product_id !== productId));
      toast({ title: "Removed", description: "Product removed from wishlist" });
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to remove item", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-xl overflow-hidden">
            <img src={logo} alt="Loading" className="w-full h-full object-cover" />
          </div>
          <p className="text-muted-foreground">Loading wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-primary/5 via-background to-accent/5 relative">
        <AdirePattern variant="dots" className="fixed inset-0 opacity-5 pointer-events-none" />
        <CustomerSidebar />

        <div className="flex-1 relative z-10">
          <header className="h-14 sm:h-16 border-b border-border/50 bg-card/80 backdrop-blur-lg flex items-center px-4 sm:px-6">
            <div className="h-1 absolute top-0 left-0 right-0 bg-gradient-to-r from-primary via-accent to-primary" />
            <SidebarTrigger className="mr-2 sm:mr-4" />
            <h1 className="text-xl sm:text-2xl font-heading font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              My Wishlist
            </h1>
          </header>

          <main className="p-4 sm:p-6">
            {wishlistItems.length === 0 ? (
              <Card className="border-primary/10">
                <CardContent className="py-16 text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
                    <Heart className="w-10 h-10 text-red-500" />
                  </div>
                  <h3 className="text-xl font-heading font-semibold mb-2">Your wishlist is empty</h3>
                  <p className="text-muted-foreground mb-6">Save products you love and come back to them later</p>
                  <Button onClick={() => navigate("/shops")} className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                    Browse Shops
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {wishlistItems.map((item) => {
                  const product = item.products;
                  if (!product) return null;
                  const shop = product.shops;

                  return (
                    <Card key={item.id} className="overflow-hidden group hover:shadow-lg transition-all">
                      <Link to={`/shop/${shop?.shop_slug}/product/${product.id}`}>
                        <div className="aspect-square overflow-hidden bg-muted relative">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                              <Package className="w-12 h-12 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </Link>
                      <CardContent className="p-4 space-y-3">
                        <div>
                          <h3 className="font-semibold line-clamp-1">{product.name}</h3>
                          {shop && <p className="text-xs text-muted-foreground">{shop.shop_name}</p>}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-primary">₦{Number(product.price).toLocaleString()}</span>
                          <Badge variant={product.stock_quantity > 0 ? "default" : "destructive"} className={product.stock_quantity > 0 ? "bg-accent/10 text-accent border-accent/20" : ""}>
                            {product.stock_quantity > 0 ? "In Stock" : "Out of Stock"}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-red-500 border-red-500/30 hover:bg-red-500/10"
                            onClick={() => handleRemove(product.id)}
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Remove
                          </Button>
                          <Link to={`/shop/${shop?.shop_slug}`} className="flex-1">
                            <Button size="sm" className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90">
                              <ShoppingCart className="w-3 h-3 mr-1" />
                              Shop
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default CustomerWishlist;
