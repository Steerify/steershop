import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Store, ShoppingCart, Star, Package, Sparkles, Search, X, Briefcase, Clock, Calendar, ArrowRight, MessageCircle
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";

const demoShop = {
  id: "demo-shop-123",
  shop_name: "Fashion By Chioma",
  shop_slug: "fashion-by-chioma",
  description: "Premium Nigerian fashion brand specializing in custom-made Ankara and lace outfits.",
  logo_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&q=80",
  banner_url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=400&fit=crop&q=80",
  average_rating: 4.8,
  total_reviews: 124,
  whatsapp_number: "+2348123456789"
};

const demoProducts = [
  { id: "1", name: "Ankara Maxi Dress", description: "Handmade Ankara maxi dress with modern cut.", price: 25000, stock_quantity: 15, is_available: true, image_url: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=750&fit=crop&q=80", average_rating: 4.9, total_reviews: 47, type: 'product' as const, duration_minutes: null, booking_required: false },
  { id: "2", name: "Lace Buba and Skirt", description: "Elegant lace outfit with intricate detailing.", price: 45000, stock_quantity: 8, is_available: true, image_url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&h=750&fit=crop&q=80", average_rating: 4.7, total_reviews: 32, type: 'product' as const, duration_minutes: null, booking_required: false },
  { id: "3", name: "Custom Dress Fitting", description: "Professional dress fitting and tailoring service.", price: 15000, stock_quantity: 20, is_available: true, image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=750&fit=crop&q=80", average_rating: 4.8, total_reviews: 28, type: 'service' as const, duration_minutes: 60, booking_required: true },
  { id: "4", name: "Head Wrapping Tutorial", description: "Learn professional gele tying techniques.", price: 8000, stock_quantity: 25, is_available: true, image_url: "https://images.unsplash.com/photo-1523359346063-d879354c0ea5?w=600&h=750&fit=crop&q=80", average_rating: 4.6, total_reviews: 19, type: 'service' as const, duration_minutes: 90, booking_required: true },
  { id: "5", name: "African Print Accessories", description: "Stylish Ankara accessories including bags and clutches.", price: 3000, stock_quantity: 50, is_available: true, image_url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=750&fit=crop&q=80", average_rating: 4.5, total_reviews: 56, type: 'product' as const, duration_minutes: null, booking_required: false },
  { id: "6", name: "Personal Styling", description: "One-on-one styling session for your perfect look.", price: 12000, stock_quantity: 12, is_available: true, image_url: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&h=750&fit=crop&q=80", average_rating: 4.9, total_reviews: 15, type: 'service' as const, duration_minutes: 45, booking_required: true }
];

interface CartItem { product: typeof demoProducts[0]; quantity: number; }

const DemoStorefront = () => {
  const { toast } = useToast();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<'all' | 'product' | 'service'>('all');
  const [filteredProducts, setFilteredProducts] = useState(demoProducts);

  useEffect(() => {
    let filtered = demoProducts;
    if (typeFilter !== 'all') filtered = filtered.filter(p => p.type === typeFilter);
    if (searchQuery.trim()) {
      filtered = filtered.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description?.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    setFilteredProducts(filtered);
  }, [searchQuery, typeFilter]);

  const addToCart = (product: typeof demoProducts[0]) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock_quantity) { toast({ title: "Maximum Stock", variant: "destructive" }); return prev; }
        return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { product, quantity: 1 }];
    });
    toast({ title: "Added to Cart", description: `${product.name} added` });
  };

  const getTotalItems = () => cart.reduce((t, i) => t + i.quantity, 0);
  const productCount = demoProducts.filter(p => p.type === 'product').length;
  const serviceCount = demoProducts.filter(p => p.type === 'service').length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* Hero Banner */}
      <div className="shopify-hero" style={{ minHeight: '45vh' }}>
        <img src={demoShop.banner_url} alt={demoShop.shop_name} className="absolute inset-0 w-full h-full object-cover" />
        <div className="shopify-hero-overlay">
          <div className="flex flex-col items-center gap-3">
            <Badge className="bg-background/20 text-background border-background/30 backdrop-blur-sm">
              <Sparkles className="w-3 h-3 mr-1" /> Demo Store
            </Badge>
            <div className="w-16 h-16 rounded-full overflow-hidden bg-background/90 shadow-lg ring-2 ring-background/50">
              <img src={demoShop.logo_url} alt={demoShop.shop_name} className="w-full h-full object-cover" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">{demoShop.shop_name}</h1>
            <p className="text-white/80 text-sm md:text-base max-w-md text-center">{demoShop.description}</p>
            <span className="flex items-center gap-1 text-white/70 text-sm">
              <Star className="w-3.5 h-3.5 fill-current" /> {demoShop.average_rating} ({demoShop.total_reviews} reviews)
            </span>
          </div>
        </div>
      </div>

      {/* Demo notice */}
      <div className="bg-accent/5 border-b border-accent/10">
        <div className="container mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">This is an interactive demo.</span>{" "}
            <Link to="/auth/signup" className="text-accent hover:underline">Create your own store →</Link>
          </p>
          <Link to="/auth/signup">
            <Button size="sm" className="rounded-full h-8 bg-foreground text-background hover:bg-foreground/90 text-xs">
              Start Free <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter bar */}
      <div className="sticky top-[calc(2rem+64px+1px)] z-30 bg-background border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setTypeFilter('all')} className={`text-sm font-medium pb-0.5 border-b-2 transition-colors ${typeFilter === 'all' ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground'}`}>
                All ({demoProducts.length})
              </button>
              <button onClick={() => setTypeFilter('product')} className={`text-sm font-medium pb-0.5 border-b-2 transition-colors ${typeFilter === 'product' ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground'}`}>
                Products ({productCount})
              </button>
              <button onClick={() => setTypeFilter('service')} className={`text-sm font-medium pb-0.5 border-b-2 transition-colors ${typeFilter === 'service' ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground'}`}>
                Services ({serviceCount})
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 h-9 w-40 sm:w-56 rounded-full border-border text-sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Product grid */}
      <div className="flex-1 container mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="text-lg font-semibold mb-1">No results</h3>
            <p className="text-sm text-muted-foreground">Try a different search term</p>
          </div>
        ) : (
          <div className="shopify-grid">
            {filteredProducts.map((product) => (
              <div key={product.id} className="shopify-card group">
                <div className="shopify-product-image relative">
                  <img src={product.image_url || ''} alt={product.name} className="w-full h-full object-cover" />
                  <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    {product.type === 'service' && product.booking_required ? (
                      <Button size="sm" className="w-full rounded-full bg-background text-foreground hover:bg-background/90 shadow-lg text-xs h-9"
                        onClick={() => toast({ title: "Demo Feature", description: "Booking available in real stores" })}>
                        <Calendar className="w-3.5 h-3.5 mr-1.5" /> Book Now
                      </Button>
                    ) : (
                      <Button size="sm" className="w-full rounded-full bg-background text-foreground hover:bg-background/90 shadow-lg text-xs h-9"
                        onClick={() => addToCart(product)}>
                        <ShoppingCart className="w-3.5 h-3.5 mr-1.5" /> Add to Cart
                      </Button>
                    )}
                  </div>
                  {product.type === 'service' && (
                    <Badge className="absolute top-2.5 left-2.5 bg-background/90 text-foreground text-[10px] backdrop-blur-sm border-none">
                      <Briefcase className="w-2.5 h-2.5 mr-1" /> Service
                    </Badge>
                  )}
                </div>
                <div className="pt-3 pb-1 space-y-1">
                  <h3 className="text-sm font-medium text-foreground line-clamp-1">{product.name}</h3>
                  <span className="text-sm font-semibold text-foreground">₦{product.price.toLocaleString()}</span>
                  {product.total_reviews > 0 && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="w-3 h-3 fill-current text-foreground" />
                      {product.average_rating.toFixed(1)} ({product.total_reviews})
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-20 text-center py-16 border-t border-border">
          <h2 className="shopify-heading">Ready to Build Your Store?</h2>
          <p className="shopify-subheading">Your hustle deserves a professional home. Start free — no credit card required.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/auth/signup">
              <Button size="lg" className="rounded-full bg-foreground text-background hover:bg-foreground/90 h-12 px-8 text-sm">
                Start Free Forever <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/">
              <Button size="lg" variant="outline" className="rounded-full h-12 px-8 text-sm">Learn More</Button>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DemoStorefront;
