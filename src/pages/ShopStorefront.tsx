import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Store, ShoppingCart, Star, Package, Search, X, Briefcase, Clock, Calendar, BadgeCheck, MessageCircle, MapPin, ChevronRight } from "lucide-react";
import { WishlistButton } from "@/components/WishlistButton";
import { openWhatsAppContact } from "@/utils/whatsapp";
import { ProductMediaCard } from "@/components/ProductMediaCard";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import CheckoutDialog from "@/components/CheckoutDialog";
import { BookingDialog } from "@/components/BookingDialog";
import { ProductRating } from "@/components/ProductRating";
import Joyride, { CallBackProps, STATUS } from "react-joyride";
import { useTour } from "@/hooks/useTour";
import { TourTooltip } from "@/components/tours/TourTooltip";
import { storefrontTourSteps } from "@/components/tours/tourSteps";
import { TourButton } from "@/components/tours/TourButton";
import { KnowThisShop } from "@/components/ai/KnowThisShop";
import { ShareStorefront } from "@/components/ShareStorefront";

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
  accent_color?: string | null;
  font_style?: string | null;
  theme_mode?: string | null;
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
  compare_price: number | null;
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
  const [typeFilter, setTypeFilter] = useState<'all' | 'product' | 'service'>('all');
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Product | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [ownerPlan, setOwnerPlan] = useState<OwnerPlan>({ slug: null, name: null });
  const [ownerIsInTrial, setOwnerIsInTrial] = useState(false);
  const isPremiumPlan = ownerPlan.slug === 'pro' || ownerPlan.slug === 'business' || ownerIsInTrial;
  const headerCartRef = useRef<HTMLDivElement>(null);
  const [showFloatingBar, setShowFloatingBar] = useState(false);

  const { hasSeenTour, isRunning, startTour, endTour, resetTour } = useTour('storefront');
  const handleTourCallback = (data: CallBackProps) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      endTour(status === STATUS.FINISHED);
    }
  };

  useEffect(() => { loadShopData(); }, [slug]);

  useEffect(() => {
    const target = headerCartRef.current;
    if (!target) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowFloatingBar(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [shop]);

  // SEO meta tags
  useEffect(() => {
    if (!shop) return;
    const shopUrl = `https://steersolo.com/shop/${shop.shop_slug}`;
    const imageUrl = shop.logo_url || shop.banner_url || '';
    document.title = isPremiumPlan ? `${shop.shop_name} — Shop Online` : `${shop.shop_name} | SteerSolo`;

    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement;
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };
    setMeta('name', 'description', shop.description || `Shop at ${shop.shop_name} on SteerSolo`);
    setMeta('property', 'og:title', shop.shop_name);
    setMeta('property', 'og:description', shop.description || `Shop at ${shop.shop_name}`);
    setMeta('property', 'og:url', shopUrl);
    setMeta('property', 'og:type', 'website');
    if (imageUrl) setMeta('property', 'og:image', imageUrl);

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = shopUrl;

    const schemaData: any = {
      "@context": "https://schema.org",
      "@type": isPremiumPlan ? "Store" : "LocalBusiness",
      "name": shop.shop_name,
      "url": shopUrl,
      "image": imageUrl || undefined,
      ...(shop.total_reviews > 0 && {
        "aggregateRating": { "@type": "AggregateRating", "ratingValue": shop.average_rating, "reviewCount": shop.total_reviews }
      }),
    };
    if (products.length > 0) {
      schemaData.hasOfferCatalog = {
        "@type": "OfferCatalog",
        "name": `${shop.shop_name} Products`,
        "itemListElement": products.slice(0, 20).map((p, i) => ({
          "@type": "ListItem", "position": i + 1,
          "item": {
            "@type": p.type === 'service' ? "Service" : "Product",
            "name": p.name, "image": p.image_url || undefined,
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
    return () => { const el = document.getElementById("shop-jsonld"); if (el) el.remove(); };
  }, [shop, products]);

  useEffect(() => {
    let filtered = products;
    if (typeFilter !== 'all') filtered = filtered.filter(p => p.type === typeFilter);
    if (searchQuery.trim()) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
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

  const loadShopData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: shopData, error: shopError } = await supabase
        .from("shops").select("*").eq("shop_slug", slug).single();
      if (shopError) throw shopError;
      if (!shopData) { toast({ title: "Shop Not Found", variant: "destructive" }); return; }
      setShop(shopData);
      setIsOwner(user?.id === shopData.owner_id);

      if (shopData.owner_id) {
        const { data: profileData } = await supabase
          .from('profiles').select('subscription_plan_id, is_subscribed, subscription_expires_at')
          .eq('id', shopData.owner_id).single();
        if (profileData) {
          if (!profileData.is_subscribed && profileData.subscription_expires_at) {
            const expiresAt = new Date(profileData.subscription_expires_at);
            if (expiresAt > new Date()) setOwnerIsInTrial(true);
          }
          if (profileData.subscription_plan_id) {
            const { data: planData } = await supabase
              .from('subscription_plans').select('slug, name')
              .eq('id', profileData.subscription_plan_id).single();
            if (planData) setOwnerPlan({ slug: planData.slug, name: planData.name });
          }
        }
      }

      let productsQuery = supabase
        .from("products").select("*").eq("shop_id", shopData.id)
        .order("created_at", { ascending: false });
      if (!user || user.id !== shopData.owner_id) productsQuery = productsQuery.eq("is_available", true);
      const { data: productsData } = await productsQuery;
      const productsList = (productsData || []).map(p => ({
        ...p, type: (p.type || 'product') as 'product' | 'service',
        booking_required: p.booking_required ?? false
      }));
      setProducts(productsList);
      setFilteredProducts(productsList);
    } catch (error: any) {
      console.error("Error loading shop:", error);
      toast({ title: "Error", description: "Failed to load shop data", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock_quantity) {
          toast({ title: "Maximum Stock Reached", variant: "destructive" });
          return prevCart;
        }
        return prevCart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
    toast({ title: "Added to Cart", description: `${product.name} added` });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity === 0) { setCart(prev => prev.filter(i => i.product.id !== productId)); return; }
    setCart(prev => prev.map(i => i.product.id === productId ? { ...i, quantity } : i));
  };

  const getTotalAmount = () => cart.reduce((t, i) => t + i.product.price * i.quantity, 0);
  const getTotalItems = () => cart.reduce((t, i) => t + i.quantity, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center pt-40">
          <div className="w-8 h-8 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md px-4">
            <Store className="w-16 h-16 mx-auto mb-4 text-muted-foreground/40" />
            <h1 className="text-2xl font-bold mb-2">Shop Unavailable</h1>
            <p className="text-muted-foreground mb-6">This shop may be temporarily closed or the link might be incorrect.</p>
            <Link to="/shops"><Button>Browse All Shops</Button></Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col" style={{ ...(shop?.accent_color ? { '--accent': shop.accent_color } as any : {}) }}>
      <Navbar shopBranding={isPremiumPlan ? { name: shop.shop_name, logoUrl: shop.logo_url } : null} />

      {/* Shopify-style Hero Banner */}
      <div className="shopify-hero" data-tour="shop-header" style={{ minHeight: '45vh' }}>
        {shop.banner_url ? (
          <img src={shop.banner_url} alt={shop.shop_name} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/50" />
        )}
        <div className="shopify-hero-overlay">
          <div className="flex flex-col items-center gap-4">
            {shop.logo_url && (
              <div className="w-20 h-20 rounded-full overflow-hidden bg-background/90 shadow-lg ring-2 ring-background/50">
                <img src={shop.logo_url} alt={shop.shop_name} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex items-center gap-2">
              <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">{shop.shop_name}</h1>
              {shop.is_verified && <BadgeCheck className="w-6 h-6 text-white/90" />}
            </div>
            {shop.description && (
              <p className="text-white/80 text-base md:text-lg max-w-xl text-center">{shop.description}</p>
            )}
            <div className="flex items-center gap-4 text-white/70 text-sm mt-1">
              {shop.total_reviews > 0 && (
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  {shop.average_rating.toFixed(1)} ({shop.total_reviews})
                </span>
              )}
              {(shop.state || shop.country) && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {[shop.state, shop.country].filter(Boolean).join(", ")}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky actions bar */}
      <div className="sticky top-[calc(2rem+64px+1px)] z-30 bg-background border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-4" ref={headerCartRef}>
            <div className="flex items-center gap-3 overflow-x-auto">
              <button
                onClick={() => setTypeFilter('all')}
                className={`whitespace-nowrap text-sm font-medium pb-0.5 border-b-2 transition-colors ${typeFilter === 'all' ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
              >
                All ({products.length})
              </button>
              {productCount > 0 && (
                <button
                  onClick={() => setTypeFilter('product')}
                  className={`whitespace-nowrap text-sm font-medium pb-0.5 border-b-2 transition-colors ${typeFilter === 'product' ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                >
                  Products ({productCount})
                </button>
              )}
              {serviceCount > 0 && (
                <button
                  onClick={() => setTypeFilter('service')}
                  className={`whitespace-nowrap text-sm font-medium pb-0.5 border-b-2 transition-colors ${typeFilter === 'service' ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                >
                  Services ({serviceCount})
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 w-40 sm:w-56 rounded-full border-border text-sm"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                )}
              </div>
              {shop.whatsapp_number && (
                <Button variant="outline" size="sm" className="rounded-full h-9" onClick={() => openWhatsAppContact(shop.whatsapp_number!, shop.shop_name)}>
                  <MessageCircle className="w-4 h-4" />
                </Button>
              )}
              <ShareStorefront shopName={shop.shop_name} shopSlug={shop.shop_slug} shopDescription={shop.description} logoUrl={shop.logo_url} rating={shop.average_rating} totalReviews={shop.total_reviews} productCount={productCount} />
              <KnowThisShop shopId={shop.id} />
              <TourButton onStartTour={startTour} hasSeenTour={hasSeenTour} onResetTour={resetTour} />
              {getTotalItems() > 0 && (
                <Button size="sm" className="rounded-full h-9 bg-foreground text-background hover:bg-foreground/90" onClick={() => setIsCheckoutOpen(true)} data-tour="cart-button">
                  <ShoppingCart className="w-4 h-4 mr-1" />
                  {getTotalItems()}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid — Shopify style */}
      <div className="flex-1 container mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="text-lg font-semibold mb-1">
              {searchQuery ? "No results found" : "No products yet"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery ? `Nothing matched "${searchQuery}"` : "This shop hasn't added products yet"}
            </p>
          </div>
        ) : (
          <div className="shopify-grid" data-tour="product-card">
            {filteredProducts.map((product) => (
              <div key={product.id} className="shopify-card group">
                <Link to={`/shop/${slug}/product/${product.id}`}>
                  <div className="shopify-product-image relative">
                    <ProductMediaCard
                      imageUrl={product.image_url}
                      videoUrl={product.video_url}
                      alt={product.name}
                      className="w-full h-full"
                    >
                      {!product.image_url && !product.video_url && (
                        <div className="absolute inset-0 bg-muted flex items-center justify-center">
                          {product.type === 'service' ? <Briefcase className="w-12 h-12 text-muted-foreground/30" /> : <Package className="w-12 h-12 text-muted-foreground/30" />}
                        </div>
                      )}
                    </ProductMediaCard>
                    {/* Quick add on hover */}
                    <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {product.type === 'service' && product.booking_required ? (
                        <Button size="sm" className="w-full rounded-full bg-background text-foreground hover:bg-background/90 shadow-lg text-xs h-9"
                          onClick={(e) => { e.preventDefault(); handleBookService(product); }}
                          disabled={product.stock_quantity === 0}>
                          <Calendar className="w-3.5 h-3.5 mr-1.5" /> Book Now
                        </Button>
                      ) : (
                        <Button size="sm" className="w-full rounded-full bg-background text-foreground hover:bg-background/90 shadow-lg text-xs h-9"
                          onClick={(e) => { e.preventDefault(); addToCart(product); }}
                          disabled={product.stock_quantity === 0 || (!product.is_available && !isOwner)}>
                          <ShoppingCart className="w-3.5 h-3.5 mr-1.5" /> Add to Cart
                        </Button>
                      )}
                    </div>
                    {/* Type badge */}
                    {product.type === 'service' && (
                      <Badge className="absolute top-2.5 left-2.5 bg-background/90 text-foreground text-[10px] backdrop-blur-sm border-none">
                        <Briefcase className="w-2.5 h-2.5 mr-1" /> Service
                      </Badge>
                    )}
                    {isOwner && !product.is_available && (
                      <Badge variant="destructive" className="absolute top-2.5 right-2.5 text-[10px]">Unavailable</Badge>
                    )}
                  </div>
                </Link>
                {/* Product info */}
                <div className="pt-3 pb-1 space-y-1">
                  <Link to={`/shop/${slug}/product/${product.id}`}>
                    <h3 className="text-sm font-medium text-foreground line-clamp-1 hover:underline">{product.name}</h3>
                  </Link>
                  <div className="flex items-center gap-2">
                    {product.compare_price && Number(product.compare_price) > product.price && (
                      <span className="text-xs text-muted-foreground line-through">₦{Number(product.compare_price).toLocaleString()}</span>
                    )}
                    <span className="text-sm font-semibold text-foreground">₦{product.price.toLocaleString()}</span>
                    {product.compare_price && Number(product.compare_price) > product.price && (
                      <span className="text-[10px] font-medium text-destructive">
                        -{Math.round(((Number(product.compare_price) - product.price) / Number(product.compare_price)) * 100)}%
                      </span>
                    )}
                  </div>
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
      </div>

      {/* Floating Cart */}
      {showFloatingBar && (getTotalItems() > 0 || shop.whatsapp_number) && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-t border-border p-3 animate-fade-up safe-area-pb">
          <div className="container mx-auto flex items-center justify-center gap-3 max-w-lg">
            {shop.whatsapp_number && (
              <Button variant="outline" size="sm" onClick={() => openWhatsAppContact(shop.whatsapp_number!, shop.shop_name)} className="flex-1 min-h-[44px] rounded-full">
                <MessageCircle className="w-4 h-4 mr-2" /> Contact
              </Button>
            )}
            {getTotalItems() > 0 && (
              <Button size="sm" onClick={() => setIsCheckoutOpen(true)} className="flex-1 rounded-full bg-foreground text-background hover:bg-foreground/90 min-h-[44px]">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Cart ({getTotalItems()}) · ₦{getTotalAmount().toLocaleString()}
              </Button>
            )}
          </div>
        </div>
      )}

      <Footer />

      {shop && (
        <CheckoutDialog isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} cart={cart} shop={shop} onUpdateQuantity={updateCartQuantity} totalAmount={getTotalAmount()} />
      )}
      {selectedService && shop && (
        <BookingDialog isOpen={isBookingOpen} onClose={() => { setIsBookingOpen(false); setSelectedService(null); }} service={selectedService} shopId={shop.id} shopName={shop.shop_name} whatsappNumber={shop.whatsapp_number} />
      )}
      <Joyride steps={storefrontTourSteps} run={isRunning} continuous showSkipButton showProgress callback={handleTourCallback} tooltipComponent={TourTooltip} styles={{ options: { zIndex: 10000, arrowColor: 'hsl(var(--card))' } }} />
    </div>
  );
};

export default ShopStorefront;
