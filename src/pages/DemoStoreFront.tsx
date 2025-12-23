// @/components/demo/DemoStorefront.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Store, 
  ShoppingCart, 
  Star, 
  Package, 
  Sparkles, 
  Eye, 
  Search, 
  X, 
  Briefcase, 
  Clock,
  Calendar,
  Users,
  MessageCircle,
  Shield,
  Zap,
  Heart
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AdirePattern } from "@/components/patterns/AdirePattern";
import { useToast } from "@/hooks/use-toast";

// Demo data
const demoShop = {
  id: "demo-shop-123",
  shop_name: "Fashion By Chioma",
  shop_slug: "fashion-by-chioma",
  description: "Premium Nigerian fashion brand specializing in custom-made Ankara and lace outfits. Handcrafted with love and attention to detail.",
  logo_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop",
  banner_url: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&h=400&fit=crop",
  average_rating: 4.8,
  total_reviews: 124,
  payment_method: "paystack",
  whatsapp_number: "+2348123456789"
};

const demoProducts = [
  {
    id: "1",
    name: "Ankara Maxi Dress",
    description: "Handmade Ankara maxi dress with modern cut. Perfect for weddings and special occasions.",
    price: 25000,
    stock_quantity: 15,
    is_available: true,
    image_url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=600&fit=crop",
    average_rating: 4.9,
    total_reviews: 47,
    type: 'product' as const,
    duration_minutes: null,
    booking_required: false
  },
  {
    id: "2",
    name: "Lace Buba and Skirt",
    description: "Elegant lace outfit with intricate detailing. Comes with matching head tie.",
    price: 45000,
    stock_quantity: 8,
    is_available: true,
    image_url: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&h=600&fit=crop",
    average_rating: 4.7,
    total_reviews: 32,
    type: 'product' as const,
    duration_minutes: null,
    booking_required: false
  },
  {
    id: "3",
    name: "Custom Dress Fitting",
    description: "Professional dress fitting and tailoring service. Bring your design ideas to life.",
    price: 15000,
    stock_quantity: 20,
    is_available: true,
    image_url: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=600&h=600&fit=crop",
    average_rating: 4.8,
    total_reviews: 28,
    type: 'service' as const,
    duration_minutes: 60,
    booking_required: true
  },
  {
    id: "4",
    name: "Head Wrapping Tutorial",
    description: "Learn professional gele tying techniques from expert stylists. Online or in-person.",
    price: 8000,
    stock_quantity: 25,
    is_available: true,
    image_url: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&h=600&fit=crop",
    average_rating: 4.6,
    total_reviews: 19,
    type: 'service' as const,
    duration_minutes: 90,
    booking_required: true
  },
  {
    id: "5",
    name: "African Print Face Mask",
    description: "Stylish Ankara face masks with filter pocket. Pack of 3 assorted designs.",
    price: 3000,
    stock_quantity: 50,
    is_available: true,
    image_url: "https://images.unsplash.com/photo-1583947581924-860bda6a26df?w=600&h=600&fit=crop",
    average_rating: 4.5,
    total_reviews: 56,
    type: 'product' as const,
    duration_minutes: null,
    booking_required: false
  },
  {
    id: "6",
    name: "Personal Styling Consultation",
    description: "One-on-one styling session to help you find your perfect African fashion style.",
    price: 12000,
    stock_quantity: 12,
    is_available: true,
    image_url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=600&fit=crop",
    average_rating: 4.9,
    total_reviews: 15,
    type: 'service' as const,
    duration_minutes: 45,
    booking_required: true
  }
];

interface CartItem {
  product: typeof demoProducts[0];
  quantity: number;
}

const DemoStorefront = () => {
  const { toast } = useToast();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<'all' | 'product' | 'service'>('all');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState(demoProducts);

  useEffect(() => {
    let filtered = demoProducts;
    
    if (typeFilter !== 'all') {
      filtered = filtered.filter(p => p.type === typeFilter);
    }
    
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.price.toString().includes(searchQuery)
      );
    }
    
    setFilteredProducts(filtered);
  }, [searchQuery, typeFilter]);

  const addToCart = (product: typeof demoProducts[0]) => {
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

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const productCount = demoProducts.filter(p => p.type === 'product').length;
  const serviceCount = demoProducts.filter(p => p.type === 'service').length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* Shop Header */}
      <div className="relative pt-20">
        {demoShop.banner_url ? (
          <div 
            className="h-48 md:h-64 bg-cover bg-center"
            style={{ backgroundImage: `url(${demoShop.banner_url})` }}
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
                  <img 
                    src={demoShop.logo_url} 
                    alt={demoShop.shop_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-2">
                    <div>
                      <Badge className="mb-2 bg-accent/20 text-accent border-accent/30">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Demo Store
                      </Badge>
                      <h1 className="font-display text-2xl md:text-3xl font-bold">{demoShop.shop_name}</h1>
                      {demoShop.description && (
                        <p className="text-muted-foreground mt-2 line-clamp-2">{demoShop.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {getTotalItems() > 0 && (
                        <Button 
                          className="bg-gradient-to-r from-accent to-primary hover:opacity-90 shadow-lg shadow-accent/25"
                          onClick={() => toast({
                            title: "Demo Feature",
                            description: "Checkout functionality available in real stores",
                          })}
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Cart ({getTotalItems()})
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 mt-4">
                    {demoShop.total_reviews > 0 && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-gold/10 rounded-full">
                        <Star className="w-4 h-4 fill-gold text-gold" />
                        <span className="font-semibold text-sm">{demoShop.average_rating.toFixed(1)}</span>
                        <span className="text-sm text-muted-foreground">
                          ({demoShop.total_reviews} reviews)
                        </span>
                      </div>
                    )}
                    {productCount > 0 && (
                      <Badge variant="outline" className="bg-accent/5 border-accent/20 text-accent">
                        <Package className="w-3 h-3 mr-1" />
                        {productCount} Products
                      </Badge>
                    )}
                    {serviceCount > 0 && (
                      <Badge variant="outline" className="bg-purple-500/10 border-purple-500/20 text-purple-600">
                        <Briefcase className="w-3 h-3 mr-1" />
                        {serviceCount} Services
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Demo Notice */}
      <div className="container mx-auto px-4 mb-8">
        <Card className="bg-gradient-to-r from-blue-500/10 to-primary/10 border-blue-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Live Demo Store</h3>
              <p className="text-sm text-muted-foreground">
                This is an interactive demo showing how your SteerSolo store would look. 
                <Link to="/auth/signup" className="text-accent hover:underline ml-1">
                  Create your own store in minutes!
                </Link>
              </p>
            </div>
            <Link to="/auth/signup">
              <Button size="sm" className="bg-gradient-to-r from-accent to-primary">
                Start Free Trial
                <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Products Section */}
      <div className="flex-1 container mx-auto px-4 pb-20">
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <Link to="/">
                <Button variant="ghost" size="sm" className="hover:bg-muted">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div className="h-6 w-px bg-border hidden sm:block" />
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" />
                <h2 className="font-display text-2xl font-bold">Browse Products & Services</h2>
              </div>
            </div>

            {/* Search Component */}
            <div className="relative">
              <form onSubmit={(e) => e.preventDefault()} className="flex items-center gap-2">
                <div className="relative flex items-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full bg-card border border-accent/20 hover:bg-accent/10 hover:border-accent/40 transition-all duration-300"
                    onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                  >
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </Button>

                  <div className={`
                    relative transition-all duration-300 ease-in-out overflow-hidden
                    ${isSearchExpanded ? 'w-48 sm:w-64 ml-2 opacity-100' : 'w-0 ml-0 opacity-0'}
                  `}>
                    <Input
                      type="text"
                      placeholder="Search demo products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-10 bg-card border-accent/20 focus:border-accent pl-3 pr-8"
                    />
                    
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={clearSearch}
                        className="absolute right-2 top-1/2 -translate-y-1/2 z-10"
                      >
                        <X className="w-4 h-4 text-muted-foreground hover:text-destructive transition-colors" />
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Filter Tabs */}
          <Tabs value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)}>
            <TabsList className="bg-card border border-primary/10">
              <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                All ({demoProducts.length})
              </TabsTrigger>
              <TabsTrigger value="product" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Package className="w-4 h-4 mr-2" />
                Products ({productCount})
              </TabsTrigger>
              <TabsTrigger value="service" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
                <Briefcase className="w-4 h-4 mr-2" />
                Services ({serviceCount})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {filteredProducts.length === 0 ? (
          <Card className="card-african">
            <CardContent className="py-16 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
                <Search className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">
                No Products Found
              </h3>
              <p className="text-muted-foreground mb-4">
                Try a different search term or category
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Search results summary */}
            {searchQuery && (
              <div className="mb-6 p-4 bg-accent/5 rounded-lg border border-accent/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-accent" />
                    <span className="text-sm text-muted-foreground">
                      Showing results for "<span className="font-semibold text-accent">{searchQuery}</span>"
                    </span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearSearch}
                    className="h-8"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Clear
                  </Button>
                </div>
              </div>
            )}

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product, index) => (
                <Card 
                  key={product.id} 
                  className="card-african overflow-hidden group hover:border-accent/50 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="aspect-square overflow-hidden bg-muted relative">
                    <img
                      src={product.image_url || ''}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    {/* Type Badge */}
                    <div className="absolute top-2 left-2">
                      <Badge 
                        variant={product.type === "service" ? "secondary" : "default"} 
                        className={product.type === "service" ? "bg-purple-500/90 text-white" : "bg-primary/90"}
                      >
                        {product.type === "service" ? (
                          <><Briefcase className="w-3 h-3 mr-1" /> Service</>
                        ) : (
                          <><Package className="w-3 h-3 mr-1" /> Product</>
                        )}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-display line-clamp-1">{product.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {product.description}
                    </CardDescription>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-gold text-gold" />
                      <span className="font-semibold text-sm">{product.average_rating.toFixed(1)}</span>
                      <span className="text-sm text-muted-foreground">({product.total_reviews})</span>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold gradient-text">₦{product.price.toLocaleString()}</span>
                      {product.type === 'service' ? (
                        product.duration_minutes && (
                          <Badge variant="outline" className="bg-purple-500/10 border-purple-500/20 text-purple-600">
                            <Clock className="w-3 h-3 mr-1" />
                            {product.duration_minutes} mins
                          </Badge>
                        )
                      ) : (
                        <Badge 
                          variant={product.stock_quantity > 0 ? "default" : "destructive"}
                          className={product.stock_quantity > 0 ? "bg-accent/10 text-accent border-accent/20" : ""}
                        >
                          {product.stock_quantity > 0 ? `${product.stock_quantity} left` : "Out of stock"}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-2 pt-0">
                    <div className="flex gap-2 w-full">
                      {product.type === 'service' && product.booking_required ? (
                        <Button
                          className="flex-1 bg-purple-600 hover:bg-purple-700 shadow-md"
                          onClick={() => toast({
                            title: "Demo Booking Feature",
                            description: "Booking functionality available in real stores",
                          })}
                          disabled={product.stock_quantity === 0}
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          Book Now
                        </Button>
                      ) : (
                        <Button
                          className="flex-1 bg-gradient-to-r from-accent to-primary hover:opacity-90 shadow-md"
                          onClick={() => addToCart(product)}
                          disabled={product.stock_quantity === 0}
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Add to Cart
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => toast({
                          title: "Product Details",
                          description: `Viewing details for ${product.name}`,
                        })}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* How It Works Section */}
        <div className="mt-16">
          <h2 className="font-display text-3xl font-bold text-center mb-12">How SteerSolo Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-accent/20 to-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Store className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-display text-xl font-bold mb-2">1. Create Your Store</h3>
                <p className="text-muted-foreground">Sign up and set up your store in under 60 seconds</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-accent/20 to-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-display text-xl font-bold mb-2">2. Share Your Link</h3>
                <p className="text-muted-foreground">Share your unique store link on WhatsApp, Instagram, etc.</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-accent/20 to-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-display text-xl font-bold mb-2">3. Start Selling</h3>
                <p className="text-muted-foreground">Receive orders and payments directly to your WhatsApp</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Final CTA */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 border-primary/20">
            <CardContent className="p-8 md:p-12">
              <h2 className="font-display text-3xl font-bold mb-4">Ready to Build Your Store?</h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Your hustle deserves a professional home. Start your 7-day free trial today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/auth/signup">
                  <Button size="lg" className="bg-gradient-to-r from-accent to-primary text-lg px-8">
                    Start Free Trial
                    <ArrowLeft className="w-5 h-5 ml-2 rotate-180" />
                  </Button>
                </Link>
                <Link to="/">
                  <Button size="lg" variant="outline">
                    Learn More
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-muted-foreground mt-4">No credit card required · Cancel anytime</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DemoStorefront;