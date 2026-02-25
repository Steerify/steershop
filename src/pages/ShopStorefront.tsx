import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Store, ShoppingCart, Star, Package, Sparkles, Eye, Search, X, Briefcase, Clock, Calendar, BadgeCheck, MessageCircle, MapPin } from "lucide-react";
import { WishlistButton } from "@/components/WishlistButton";
import { openWhatsAppContact } from "@/utils/whatsapp";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AdirePattern, AdireAccent } from "@/components/patterns/AdirePattern";
import CheckoutDialog from "@/components/CheckoutDialog";
import { BookingDialog } from "@/components/BookingDialog";
import { ProductRating } from "@/components/ProductRating";
import { ProductReviewForm } from "@/components/ProductReviewForm";
import Joyride, { CallBackProps, STATUS } from "react-joyride";
import { useTour } from "@/hooks/useTour";
import { TourTooltip } from "@/components/tours/TourTooltip";
import { storefrontTourSteps } from "@/components/tours/tourSteps";
import { TourButton } from "@/components/tours/TourButton";
import { KnowThisShop } from "@/components/ai/KnowThisShop";
import { TrustBadges } from "@/components/TrustBadges";
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
  bank_account_name?: string;
  bank_name?: string;
  bank_account_number?: string;
  is_verified?: boolean;
  owner_id?: string;
  state?: string | null;
  country?: string | null;
}
interface OwnerPlan {
  slug: string | null;
  name: string | null;
}
interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock_quantity: number;
  is_available: boolean;
  image_url: string | null;
  video_url: string | null;
  average_rating: number;
  total_reviews: number;
  type: 'product' | 'service';
  duration_minutes: number | null;
  booking_required: boolean;
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
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [typeFilter, setTypeFilter] = useState<'all' | 'product' | 'service'>('all');
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Product | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [ownerPlan, setOwnerPlan] = useState<OwnerPlan>({ slug: null, name: null });
  const isBusinessPlan = ownerPlan.slug === 'business';
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Tour state
  const { hasSeenTour, isRunning, startTour, endTour, resetTour } = useTour('storefront');
  const handleTourCallback = (data: CallBackProps) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      endTour(status === STATUS.FINISHED);
    }
  };
  useEffect(() => {
    loadShopData();
  }, [slug]);

  // Inject meta tags and JSON-LD structured data for SEO/AEO
  useEffect(() => {
    if (!shop) return;
    const shopUrl = `https://steersolo.lovable.app/shop/${shop.shop_slug}`;
    const imageUrl = shop.logo_url || shop.banner_url || '';

    // Page title - Business plan shows shop name alone
    document.title = isBusinessPlan ? shop.shop_name : `${shop.shop_name} | SteerSolo`;

    // Helper to set/create meta tags
    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement;
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };

    setMeta('name', 'description', shop.description || `Shop at ${shop.shop_name} on SteerSolo`);
    setMeta('name', 'robots', 'index, follow');
    setMeta('property', 'og:title', shop.shop_name);
    setMeta('property', 'og:description', shop.description || `Shop at ${shop.shop_name} on SteerSolo`);
    setMeta('property', 'og:url', shopUrl);
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:site_name', 'SteerSolo');
    if (imageUrl) { setMeta('property', 'og:image', imageUrl); setMeta('name', 'twitter:image', imageUrl); }
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', shop.shop_name);
    setMeta('name', 'twitter:description', shop.description || `Shop at ${shop.shop_name} on SteerSolo`);

    // Canonical link
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = shopUrl;

    // JSON-LD - Enhanced for Business plan
    const schemaData: any = {
      "@context": "https://schema.org",
      "@type": isBusinessPlan ? "Store" : "LocalBusiness",
      "name": shop.shop_name,
      "description": shop.description || `Shop at ${shop.shop_name}${isBusinessPlan ? '' : ' on SteerSolo'}`,
      "url": shopUrl,
      "image": imageUrl || undefined,
      "numberOfEmployees": "1-10",
      "address": {
        "@type": "PostalAddress",
        ...(shop.state && { "addressRegion": shop.state }),
        "addressCountry": shop.country || "NG",
      },
      ...(shop.total_reviews > 0 && {
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": shop.average_rating,
          "reviewCount": shop.total_reviews
        }
      }),
    };

    // Business plan: richer schema
    if (isBusinessPlan) {
      schemaData["@id"] = shopUrl;
      schemaData.brand = { "@type": "Brand", "name": shop.shop_name };
      if (shop.whatsapp_number) {
        schemaData.contactPoint = { "@type": "ContactPoint", "telephone": shop.whatsapp_number, "contactType": "customer service" };
      }
    }

    // Add product catalog as ItemList for rich snippets
    if (products.length > 0) {
      schemaData.hasOfferCatalog = {
        "@type": "OfferCatalog",
        "name": `${shop.shop_name} Products`,
        "itemListElement": products.slice(0, 20).map((p, i) => ({
          "@type": "ListItem",
          "position": i + 1,
          "item": {
            "@type": p.type === 'service' ? "Service" : "Product",
            "name": p.name,
            "description": p.description || undefined,
            "image": p.image_url || undefined,
            "url": `${shopUrl}/product/${p.id}`,
            "offers": { "@type": "Offer", "price": p.price, "priceCurrency": "NGN", "availability": p.is_available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock" }
          }
        }))
      };
    }

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(schemaData);
    script.id = "shop-jsonld";
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById("shop-jsonld");
      if (el) el.remove();
    };
  }, [shop, products]);
  useEffect(() => {
    let filtered = products;
   
    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(p => p.type === typeFilter);
    }
   
    // Filter by search
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.price.toString().includes(searchQuery)
      );
    }
   
    setFilteredProducts(filtered);
  }, [searchQuery, products, typeFilter]);
  const handleBookService = (service: Product) => {
    setSelectedService(service);
    setIsBookingOpen(true);
  };
  const productCount = products.filter(p => p.type === 'product').length;
  const serviceCount = products.filter(p => p.type === 'service').length;
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        if (searchQuery === "" && isSearchExpanded) {
          setIsSearchExpanded(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchQuery, isSearchExpanded]);
  useEffect(() => {
    if (isSearchExpanded && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isSearchExpanded]);
  const loadShopData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: shopData, error: shopError } = await supabase
        .from("shops")
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
      setIsOwner(user?.id === shopData.owner_id);

      // Fetch owner's subscription plan for branding
      if (shopData.owner_id) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('subscription_plan_id')
          .eq('id', shopData.owner_id)
          .single();
        
        if (profileData?.subscription_plan_id) {
          const { data: planData } = await supabase
            .from('subscription_plans')
            .select('slug, name')
            .eq('id', profileData.subscription_plan_id)
            .single();
          
          if (planData) {
            setOwnerPlan({ slug: planData.slug, name: planData.name });
          }
        }
      }
      let productsQuery = supabase
        .from("products")
        .select("*")
        .eq("shop_id", shopData.id)
        .order("created_at", { ascending: false });
      if (!user || user.id !== shopData.owner_id) {
        productsQuery = productsQuery.eq("is_available", true);
      }
      const { data: productsData, error: productsError } = await productsQuery;
      if (productsError) throw productsError;
      const productsList = (productsData || []).map(p => ({
        ...p,
        type: (p.type || 'product') as 'product' | 'service',
        booking_required: p.booking_required ?? false
      }));
      setProducts(productsList);
      setFilteredProducts(productsList);
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
  const clearSearch = () => {
    setSearchQuery("");
    if (!isSearchExpanded) {
      setIsSearchExpanded(true);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchExpanded(true);
    }
  };
  const toggleSearch = () => {
    setIsSearchExpanded(!isSearchExpanded);
    if (!isSearchExpanded) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
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
        <div className="flex-1 container mx-auto px-4 pt-32">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
              <Store className="w-12 h-12 text-muted-foreground" />
            </div>
            <h1 className="font-display text-3xl font-bold mb-3">Shop Unavailable</h1>
            <p className="text-muted-foreground mb-8 text-lg">
              This shop may be temporarily closed, still setting up, or the link might be incorrect.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/shops">
                <Button size="lg" className="bg-gradient-to-r from-accent to-primary">
                  <Store className="w-4 h-4 mr-2" />
                  Browse All Shops
                </Button>
              </Link>
              <Link to="/">
                <Button size="lg" variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </Link>
            </div>

            {/* Helpful suggestions */}
            <div className="bg-muted/50 rounded-xl p-6 text-left">
              <h3 className="font-semibold mb-3">Looking for something specific?</h3>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li>• Check if the shop URL is correct</li>
                <li>• The shop owner may be updating their store</li>
                <li>• Browse our <Link to="/shops" className="text-primary hover:underline">active shops</Link> to find great products</li>
              </ul>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar shopBranding={isBusinessPlan ? { name: shop.shop_name, logoUrl: shop.logo_url } : null} />
      {/* Shop Header */}
      <div className="relative pt-20" data-tour="shop-header">
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
                      <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="font-display text-2xl md:text-3xl font-bold">{shop.shop_name}</h1>
                        {shop.is_verified && (
                          <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
                            <BadgeCheck className="w-3.5 h-3.5 mr-1" />
                            Verified Business
                          </Badge>
                        )}
                      </div>
                      {shop.description && (
                        <p className="text-muted-foreground mt-2 line-clamp-2">{shop.description}</p>
                      )}
                      {(shop.state || shop.country) && (
                        <div className="flex items-center gap-1 mt-1.5">
                          <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {[shop.state, shop.country].filter(Boolean).join(", ")}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {shop.whatsapp_number && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openWhatsAppContact(shop.whatsapp_number!, shop.shop_name)}
                          className="border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950 min-h-[44px]"
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Contact Us
                        </Button>
                      )}
                      <TourButton
                        onStartTour={startTour}
                        hasSeenTour={hasSeenTour}
                        onResetTour={resetTour}
                      />
                      {getTotalItems() > 0 && (
                        <Button
                          size="sm"
                          onClick={() => setIsCheckoutOpen(true)}
                          className="bg-gradient-to-r from-accent to-primary hover:opacity-90 shadow-lg shadow-accent/25 min-h-[44px]"
                          data-tour="cart-button"
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Cart ({getTotalItems()})
                        </Button>
                      )}
                    </div>
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
                    <KnowThisShop shopId={shop.id} />
                  </div>
                  {/* Trust Badges */}
                  <div className="mt-3">
                    <TrustBadges
                      isVerified={shop.is_verified}
                      hasWhatsApp={!!shop.whatsapp_number}
                      totalReviews={shop.total_reviews}
                      averageRating={shop.average_rating}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
      {/* Products Section */}
      <div className="flex-1 container mx-auto px-4 pb-20">
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <Link to="/shops">
                <Button variant="ghost" size="sm" className="hover:bg-muted">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to All Shops
                </Button>
              </Link>
              <div className="h-6 w-px bg-border hidden sm:block" />
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" />
                <h2 className="font-display text-2xl font-bold">Catalog</h2>
              </div>
            </div>
            {/* Search Component */}
            <div ref={searchRef} className="relative" data-tour="search-products">
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                <div className="relative flex items-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full bg-card border border-accent/20 hover:bg-accent/10 hover:border-accent/40 transition-all duration-300"
                    onClick={toggleSearch}
                    onMouseEnter={() => !isSearchExpanded && setIsSearchExpanded(true)}
                  >
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <div className={`
                    relative transition-all duration-300 ease-in-out overflow-hidden
                    ${isSearchExpanded ? 'w-48 sm:w-64 ml-2 opacity-100' : 'w-0 ml-0 opacity-0'}
                  `}>
                    <Input
                      ref={inputRef}
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-10 bg-card border-accent/20 focus:border-accent pl-3 pr-8"
                      onBlur={() => {
                        if (searchQuery === "" && isSearchExpanded) {
                          setTimeout(() => setIsSearchExpanded(false), 200);
                        }
                      }}
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
          {(productCount > 0 || serviceCount > 0) && (
            <Tabs value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)} data-tour="product-filters">
              <TabsList className="bg-card border border-primary/10">
                <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  All ({products.length})
                </TabsTrigger>
                {productCount > 0 && (
                  <TabsTrigger value="product" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <Package className="w-4 h-4 mr-2" />
                    Products ({productCount})
                  </TabsTrigger>
                )}
                {serviceCount > 0 && (
                  <TabsTrigger value="service" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
                    <Briefcase className="w-4 h-4 mr-2" />
                    Services ({serviceCount})
                  </TabsTrigger>
                )}
              </TabsList>
            </Tabs>
          )}
        </div>
        {filteredProducts.length === 0 ? (
          <Card className="card-african">
            <CardContent className="py-16 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
                {searchQuery ? (
                  <Search className="w-10 h-10 text-muted-foreground" />
                ) : (
                  <Package className="w-10 h-10 text-muted-foreground" />
                )}
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">
                {searchQuery ? "No Products Found" : "No Products Available"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? `No products found for "${searchQuery}"`
                  : "This shop hasn't added any products yet"
                }
              </p>
              {searchQuery && (
                <Button
                  variant="outline"
                  onClick={clearSearch}
                  className="mt-2"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear Search
                </Button>
              )}
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
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product, index) => (
                <Card
                  key={product.id}
                  className="card-african overflow-hidden group hover:border-accent/50 transition-all duration-300 hover:-translate-y-1 animate-fade-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                  data-tour={index === 0 ? "product-card" : undefined}
                >
                  <Link to={`/shop/${slug}/product/${product.id}`}>
                    <div className="aspect-square overflow-hidden bg-muted relative">
                      {product.video_url ? (
                        <video
                          src={product.video_url}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          autoPlay
                          muted
                          loop
                          playsInline
                        />
                      ) : product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                          {product.type === 'service' ? (
                            <Briefcase className="w-16 h-16 text-accent" />
                          ) : (
                            <Package className="w-16 h-16 text-muted-foreground" />
                          )}
                        </div>
                      )}
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
                      {/* Availability Badge for Owner */}
                      {isOwner && !product.is_available && (
                        <div className="absolute top-2 right-2">
                          <Badge variant="destructive">
                            Unavailable
                          </Badge>
                        </div>
                      )}
                    </div>
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
                          onClick={(e) => {
                            e.preventDefault();
                            handleBookService(product);
                          }}
                          disabled={product.stock_quantity === 0 || (!product.is_available && !isOwner)}
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          Book Now
                        </Button>
                      ) : (
                        <Button
                          className="flex-1 bg-gradient-to-r from-accent to-primary hover:opacity-90 shadow-md"
                          onClick={(e) => {
                            e.preventDefault();
                            addToCart(product);
                          }}
                          disabled={product.stock_quantity === 0 || (!product.is_available && !isOwner)}
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Add to Cart
                        </Button>
                      )}
                      <Link to={`/shop/${slug}/product/${product.id}`}>
                        <Button variant="outline" size="icon">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <WishlistButton productId={product.id} />
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
          </>
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
      {/* Booking Dialog */}
      {selectedService && shop && (
        <BookingDialog
          isOpen={isBookingOpen}
          onClose={() => {
            setIsBookingOpen(false);
            setSelectedService(null);
          }}
          service={selectedService}
          shopId={shop.id}
          shopName={shop.shop_name}
          whatsappNumber={shop.whatsapp_number}
        />
      )}
      {/* Guided Tour */}
      <Joyride
        steps={storefrontTourSteps}
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
    </div>
  );
};
export default ShopStorefront;