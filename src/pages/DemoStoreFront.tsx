import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  ChevronRight,
  Eye,
  MessageCircle,
  Package,
  Search,
  ShoppingCart,
  Sparkles,
  Star,
  Store,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const demoShop = {
  shop_name: "Fashion By Chioma",
  shop_slug: "fashion-by-chioma",
  description:
    "Premium Nigerian fashion brand specializing in custom-made Ankara and lace outfits.",
  logo_url:
    "https://images.unsplash.com/photo-1611432579699-484f7990b127?auto=format&fit=crop&w=400&q=80",
  banner_url:
    "https://images.unsplash.com/photo-1504703395950-b89145a5425b?auto=format&fit=crop&w=1200&h=400&q=80",
  average_rating: 4.8,
  total_reviews: 124,
};

const demoProducts = [
  {
    id: "1",
    name: "Ankara Maxi Dress",
    description: "Handmade Ankara maxi dress with modern cut.",
    price: 25000,
    stock_quantity: 15,
    image_url:
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=600&fit=crop&q=80",
    average_rating: 4.9,
    total_reviews: 47,
    type: "product" as const,
    booking_required: false,
  },
  {
    id: "2",
    name: "Lace Buba and Skirt",
    description: "Elegant lace outfit with matching head tie.",
    price: 45000,
    stock_quantity: 8,
    image_url:
      "https://images.unsplash.com/photo-1504703395950-b89145a5425b?w=600&h=600&fit=crop&q=80",
    average_rating: 4.7,
    total_reviews: 32,
    type: "product" as const,
    booking_required: false,
  },
  {
    id: "3",
    name: "Custom Dress Fitting",
    description: "Professional dress fitting and tailoring service.",
    price: 15000,
    stock_quantity: 20,
    image_url:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&h=600&fit=crop&q=80",
    average_rating: 4.8,
    total_reviews: 28,
    type: "service" as const,
    booking_required: true,
  },
];

interface CartItem {
  product: (typeof demoProducts)[0];
  quantity: number;
}

const DemoStoreFront = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "product" | "service">("all");
  const [cart, setCart] = useState<CartItem[]>([]);

  const filteredProducts = useMemo(() => {
    return demoProducts.filter((p) => {
      if (typeFilter !== "all" && p.type !== typeFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    });
  }, [searchQuery, typeFilter]);

  const addToCart = (product: (typeof demoProducts)[0]) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.product.id === product.id);
      if (existing) return prev.map((p) => (p.product.id === product.id ? { ...p, quantity: p.quantity + 1 } : p));
      return [...prev, { product, quantity: 1 }];
    });
    toast({ title: "Added to cart", description: `${product.name} added to demo cart` });
  };

  const cartCount = cart.reduce((n, item) => n + item.quantity, 0);
  const productCount = demoProducts.filter((p) => p.type === "product").length;
  const serviceCount = demoProducts.filter((p) => p.type === "service").length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <section className="relative pt-16">
        <div className="relative h-52 sm:h-64 md:h-80 overflow-hidden">
          <img src={demoShop.banner_url} alt="Demo banner" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/35 to-transparent" />
        </div>

        <div className="container mx-auto px-4">
          <div className="relative -mt-16 md:-mt-20 pb-8">
            <div className="bg-card/80 backdrop-blur-2xl border border-border/50 rounded-2xl md:rounded-3xl shadow-2xl p-5 md:p-8">
              <div className="flex flex-col sm:flex-row gap-5">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden ring-4 ring-background shadow-xl bg-muted">
                  <img src={demoShop.logo_url} alt={demoShop.shop_name} className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <Badge className="mb-2 bg-accent/10 text-accent border-accent/30">Demo Storefront</Badge>
                      <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">{demoShop.shop_name}</h1>
                      <p className="text-muted-foreground mt-1 text-sm md:text-base line-clamp-2 max-w-xl">{demoShop.description}</p>
                    </div>

                    <div className="w-full sm:w-auto grid grid-cols-2 sm:flex gap-2">
                      <Button
                        variant="outline"
                        className="rounded-xl h-11 sm:h-10 border-green-500/40 bg-green-500/10 text-green-700 hover:bg-green-500/15"
                        onClick={() => window.open("https://wa.me/2348123456789", "_blank")}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" /> Contact
                      </Button>
                      <Button
                        variant="outline"
                        className="rounded-xl h-11 sm:h-10"
                        onClick={() => toast({ title: "Demo", description: "Share is available on real storefronts" })}
                      >
                        <Sparkles className="w-4 h-4 mr-2" /> Share
                      </Button>
                      <Button
                        className="rounded-xl h-11 sm:h-10 text-white bg-gradient-to-r from-emerald-600 to-teal-600 border border-emerald-300/30"
                        onClick={() => toast({ title: "Demo", description: "Checkout is available on live storefronts" })}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" /> Cart
                        <span className="ml-2 bg-white/20 rounded-lg px-1.5 text-xs">{cartCount}</span>
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-4 mt-4 border-t border-border/50">
                    <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200/60 rounded-xl px-3 py-1.5">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-semibold text-amber-700">{demoShop.average_rating.toFixed(1)}</span>
                      <span className="text-xs text-muted-foreground">({demoShop.total_reviews})</span>
                    </div>
                    <Badge variant="outline" className="bg-accent/5 border-accent/20 text-accent">
                      <Package className="w-3 h-3 mr-1" /> {productCount} products
                    </Badge>
                    <Badge variant="outline" className="bg-purple-500/5 border-purple-500/20 text-purple-600">
                      <Briefcase className="w-3 h-3 mr-1" /> {serviceCount} services
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-6">
        <Card className="border border-border/60 bg-gradient-to-r from-accent/5 via-background to-primary/5">
          <CardContent className="p-4 flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-accent">Demo Experience</p>
              <p className="text-sm text-muted-foreground">This demo mirrors the real storefront layout. Create your own in minutes.</p>
            </div>
            <Link to="/vendor">
              <Button className="rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90">
                Create Your Store <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      <section className="relative flex-1 container mx-auto px-4 pb-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-3xl opacity-50 dark:opacity-20"
          style={{
            backgroundImage: "radial-gradient(circle, hsl(var(--foreground) / 0.12) 1.3px, transparent 1.3px)",
            backgroundSize: "22px 22px",
          }}
        />

        <div className="relative z-10 flex flex-col gap-4 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link to="/">
                <Button variant="ghost" size="sm" className="rounded-xl h-9 px-3 text-muted-foreground hover:text-foreground gap-1.5">
                  <ArrowLeft className="w-4 h-4" /> Home
                </Button>
              </Link>
              <div className="h-5 w-px bg-border" />
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-accent" />
                </div>
                <h2 className="font-display text-xl md:text-2xl font-bold tracking-tight">Catalog</h2>
              </div>
            </div>

            <div className="relative w-full sm:w-auto">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search demo products…"
                className="pl-9 pr-9 h-10 rounded-xl sm:w-64"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {[
              { key: "all", label: `All (${demoProducts.length})` },
              { key: "product", label: `Products (${productCount})` },
              { key: "service", label: `Services (${serviceCount})` },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setTypeFilter(item.key as any)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap border transition-all ${
                  typeFilter === item.key
                    ? "bg-foreground text-background border-foreground"
                    : "bg-card border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden border-border/60 hover:border-accent/40 transition-all">
              <div className="relative aspect-square overflow-hidden bg-muted">
                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2">
                  <Badge className={product.type === "service" ? "bg-purple-500 text-white" : "bg-foreground text-background"}>
                    {product.type === "service" ? <Briefcase className="w-3 h-3 mr-1" /> : <Package className="w-3 h-3 mr-1" />} {product.type}
                  </Badge>
                </div>
                <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                  <Eye className="w-8 h-8 text-white opacity-0 hover:opacity-100" />
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-base line-clamp-1">{product.name}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{product.description}</p>
                <div className="flex items-center gap-1 mt-2 text-xs">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {product.average_rating.toFixed(1)} ({product.total_reviews})
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-lg font-bold text-primary">₦{product.price.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground">{product.stock_quantity} left</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {product.booking_required ? (
                    <Button
                      className="col-span-2 bg-purple-600 hover:bg-purple-700"
                      onClick={() => toast({ title: "Demo", description: "Bookings work on live storefronts" })}
                    >
                      <Calendar className="w-4 h-4 mr-2" /> Book Now
                    </Button>
                  ) : (
                    <Button className="col-span-2 bg-gradient-to-r from-emerald-600 to-teal-600" onClick={() => addToCart(product)}>
                      <ShoppingCart className="w-4 h-4 mr-2" /> Add to Cart
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="relative z-10 text-center py-16">
            <Search className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-semibold mb-1">No demo products found</h3>
            <p className="text-sm text-muted-foreground">Try another search term.</p>
          </div>
        )}

        <div className="relative z-10 mt-12 text-center">
          <Link to="/vendor">
            <Button size="lg" className="bg-gradient-to-r from-primary to-accent text-base px-8">
              Launch Your Own Store <Store className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default DemoStoreFront;
