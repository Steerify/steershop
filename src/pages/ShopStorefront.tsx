import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Store, ShoppingCart, Star, Package, Sparkles, Eye } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AdirePattern, AdireAccent } from "@/components/patterns/AdirePattern";
import CheckoutDialog from "@/components/CheckoutDialog";
import { ProductRating } from "@/components/ProductRating";
import { ProductReviewForm } from "@/components/ProductReviewForm";

interface Shop {
  id: string;
  shop_name: string;
  shop_slug: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  average_rating: number;
  total_reviews: number;
  payment_method?: string;
  paystack_public_key?: string;
  whatsapp_number?: string;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock_quantity: number;
  is_available: boolean;
  image_url: string | null;
  average_rating: number;
  total_reviews: number;
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
        <div className="container mx-auto px-4 pt-32 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-muted-foreground">Loading shop...</p>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 container mx-auto px-4 pt-32 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
            <Store className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="font-display text-2xl font-bold mb-2">Shop Not Found</h1>
          <p className="text-muted-foreground mb-6">This shop doesn't exist or is not available</p>
          <Link to="/shops">
            <Button className="bg-gradient-to-r from-accent to-primary">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Shops
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* Shop Header */}
      <div className="relative pt-20">
        {shop.banner_url ? (
          <div 
            className="h-48 md:h-64 bg-cover bg-center"
            style={{ backgroundImage: `url(${shop.banner_url})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
          </div>
        ) : (
          <div className="h-48 md:h-64 bg-gradient-to-br from-primary/20 via-accent/10 to-background relative overflow-hidden">
            <AdirePattern variant="geometric" className="text-primary" opacity={0.3} />
          </div>
        )}
        
        <div className="container mx-auto px-4">
          <div className="relative -mt-16 md:-mt-20 pb-8">
            <Card className="card-african p-4 md:p-6 shadow-xl bg-card/95 backdrop-blur-sm">
              <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg overflow-hidden">
                  {shop.logo_url ? (
                    <img 
                      src={shop.logo_url} 
                      alt={shop.shop_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Store className="w-10 h-10 md:w-12 md:h-12 text-primary-foreground" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-2">
                    <div>
                      <h1 className="font-display text-2xl md:text-3xl font-bold">{shop.shop_name}</h1>
                      {shop.description && (
                        <p className="text-muted-foreground mt-2 line-clamp-2">{shop.description}</p>
                      )}
                    </div>
                    {getTotalItems() > 0 && (
                      <Button 
                        onClick={() => setIsCheckoutOpen(true)}
                        className="bg-gradient-to-r from-accent to-primary hover:opacity-90 shadow-lg shadow-accent/25 w-full md:w-auto"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Cart ({getTotalItems()})
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 mt-4">
                    {shop.total_reviews > 0 && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-gold/10 rounded-full">
                        <Star className="w-4 h-4 fill-gold text-gold" />
                        <span className="font-semibold text-sm">{shop.average_rating.toFixed(1)}</span>
                        <span className="text-sm text-muted-foreground">
                          ({shop.total_reviews} reviews)
                        </span>
                      </div>
                    )}
                    <Badge variant="outline" className="bg-accent/5 border-accent/20 text-accent">
                      {products.length} Products
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="flex-1 container mx-auto px-4 pb-20">
        <div className="mb-6">
          <Link to="/shops">
            <Button variant="ghost" size="sm" className="hover:bg-muted">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to All Shops
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <Sparkles className="w-5 h-5 text-accent" />
          <h2 className="font-display text-2xl font-bold">Products</h2>
        </div>

        {products.length === 0 ? (
          <Card className="card-african">
            <CardContent className="py-16 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
                <Package className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">No Products Available</h3>
              <p className="text-muted-foreground">This shop hasn't added any products yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <Card 
                key={product.id} 
                className="card-african overflow-hidden group hover:border-accent/50 transition-all duration-300 hover:-translate-y-1 animate-fade-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <Link to={`/shop/${slug}/product/${product.id}`}>
                  {product.image_url ? (
                    <div className="aspect-square overflow-hidden bg-muted relative">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-square bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center adire-pattern">
                      <Package className="w-16 h-16 text-muted-foreground" />
                    </div>
                  )}
                </Link>
                <CardHeader className="pb-3">
                  <Link to={`/shop/${slug}/product/${product.id}`}>
                    <CardTitle className="text-lg font-display line-clamp-1 hover:text-accent transition-colors">{product.name}</CardTitle>
                  </Link>
                  <CardDescription className="line-clamp-2">
                    {product.description}
                  </CardDescription>
                  <ProductRating 
                    rating={product.average_rating || 0} 
                    totalReviews={product.total_reviews || 0}
                  />
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold gradient-text">₦{product.price.toLocaleString()}</span>
                    <Badge 
                      variant={product.stock_quantity > 0 ? "default" : "destructive"}
                      className={product.stock_quantity > 0 ? "bg-accent/10 text-accent border-accent/20" : ""}
                    >
                      {product.stock_quantity > 0 ? `${product.stock_quantity} left` : "Out of stock"}
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2 pt-0">
                  <div className="flex gap-2 w-full">
                    <Button
                      className="flex-1 bg-gradient-to-r from-accent to-primary hover:opacity-90 shadow-md"
                      onClick={(e) => {
                        e.preventDefault();
                        addToCart(product);
                      }}
                      disabled={product.stock_quantity === 0}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                    <Link to={`/shop/${slug}/product/${product.id}`}>
                      <Button variant="outline" size="icon">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                  <ProductReviewForm 
                    productId={product.id}
                    productName={product.name}
                    onReviewSubmitted={loadShopData}
                  />
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Footer />

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