import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Store, ShoppingCart, Star, Package } from "lucide-react";
import Navbar from "@/components/Navbar";
import CheckoutDialog from "@/components/CheckoutDialog";

interface Shop {
  id: string;
  shop_name: string;
  shop_slug: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  average_rating: number;
  total_reviews: number;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock_quantity: number;
  is_available: boolean;
  image_url: string | null;
}

interface CartItem {
  product: Product;
  quantity: number;
}

const ShopStorefront = () => {
  const { slug } = useParams();
  const { toast } = useToast();
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    loadShopData();
  }, [slug]);

  const loadShopData = async () => {
    try {
      // Fetch shop by slug using secure public view
      const { data: shopData, error: shopError } = await supabase
        .from("shops_public")
        .select("*")
        .eq("shop_slug", slug)
        .single();

      if (shopError) throw shopError;
      if (!shopData) {
        toast({
          title: "Shop Not Found",
          description: "This shop doesn't exist or is not active",
          variant: "destructive",
        });
        return;
      }

      setShop(shopData);

      // Fetch products for this shop
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .eq("shop_id", shopData.id)
        .eq("is_available", true)
        .order("created_at", { ascending: false });

      if (productsError) throw productsError;
      setProducts(productsData || []);
    } catch (error: any) {
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

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.product.id === product.id);
      
      if (existingItem) {
        if (existingItem.quantity >= product.stock_quantity) {
          toast({
            title: "Maximum Stock Reached",
            description: `Only ${product.stock_quantity} units available`,
            variant: "destructive",
          });
          return prevCart;
        }
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prevCart, { product, quantity: 1 }];
    });

    toast({
      title: "Added to Cart",
      description: `${product.name} added to your cart`,
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity === 0) {
      setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-32 flex items-center justify-center">
          <p className="text-muted-foreground">Loading shop...</p>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-32 text-center">
          <Store className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Shop Not Found</h1>
          <p className="text-muted-foreground mb-6">This shop doesn't exist or is not available</p>
          <Link to="/shops">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Shops
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Shop Header */}
      <div className="relative">
        {shop.banner_url ? (
          <div 
            className="h-64 bg-cover bg-center"
            style={{ backgroundImage: `url(${shop.banner_url})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80" />
          </div>
        ) : (
          <div className="h-64 bg-gradient-to-br from-primary/20 to-accent/20" />
        )}
        
        <div className="container mx-auto px-4">
          <div className="relative -mt-16 pb-8">
            <Card className="p-6">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center flex-shrink-0">
                  {shop.logo_url ? (
                    <img 
                      src={shop.logo_url} 
                      alt={shop.shop_name}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <Store className="w-12 h-12 text-primary-foreground" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h1 className="text-3xl font-bold">{shop.shop_name}</h1>
                    {getTotalItems() > 0 && (
                      <Button onClick={() => setIsCheckoutOpen(true)}>
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Cart ({getTotalItems()})
                      </Button>
                    )}
                  </div>
                  
                  {shop.description && (
                    <p className="text-muted-foreground mb-4">{shop.description}</p>
                  )}
                  
                  <div className="flex items-center gap-4">
                    {shop.total_reviews > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{shop.average_rating.toFixed(1)}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          ({shop.total_reviews} reviews)
                        </span>
                      </div>
                    )}
                    <Badge variant="outline">{products.length} Products</Badge>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="container mx-auto px-4 pb-20">
        <div className="mb-8">
          <Link to="/shops">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to All Shops
            </Button>
          </Link>
        </div>

        <h2 className="text-2xl font-bold mb-6">Products</h2>

        {products.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Products Available</h3>
              <p className="text-muted-foreground">This shop hasn't added any products yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                {product.image_url && (
                  <div className="aspect-square overflow-hidden bg-muted">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  {product.description && (
                    <CardDescription className="line-clamp-2">
                      {product.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">₦{product.price.toLocaleString()}</span>
                      <Badge variant={product.stock_quantity > 0 ? "default" : "destructive"}>
                        {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : "Out of stock"}
                      </Badge>
                    </div>
                    
                    <Button
                      className="w-full"
                      onClick={() => addToCart(product)}
                      disabled={product.stock_quantity === 0}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Checkout Dialog */}
      {shop && (
        <CheckoutDialog
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          cart={cart}
          shop={shop}
          onUpdateQuantity={updateCartQuantity}
          totalAmount={getTotalAmount()}
        />
      )}
    </div>
  );
};

export default ShopStorefront;
