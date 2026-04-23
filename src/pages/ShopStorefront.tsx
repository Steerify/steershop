import { useEffect, useState, useRef, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, Store, ShoppingCart, Star, Package, Sparkles,
  Eye, Search, X, Briefcase, Clock, Calendar, BadgeCheck,
  MessageCircle, MapPin, ChevronRight, ShoppingBag, Heart
} from "lucide-react";
import { WishlistButton } from "@/components/WishlistButton";
import { openWhatsAppContact } from "@/utils/whatsapp";
import { ProductMediaCard } from "@/components/ProductMediaCard";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AdirePattern, AdireAccent } from "@/components/patterns/AdirePattern";
import CheckoutDialog from "@/components/CheckoutDialog";
import { BookingDialog } from "@/components/BookingDialog";
import { ProductRating } from "@/components/ProductRating";
import Joyride, { CallBackProps, STATUS } from "react-joyride";
import { useTour } from "@/hooks/useTour";
import { TourTooltip } from "@/components/tours/TourTooltip";
import { storefrontTourSteps } from "@/components/tours/tourSteps";
import { TourButton } from "@/components/tours/TourButton";
import { KnowThisShop } from "@/components/ai/KnowThisShop";
import { TrustBadges } from "@/components/TrustBadges";
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
  primary_color?: string | null;
  secondary_color?: string | null;
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
  stock_unit?: string | null;
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
  const [ownerIsInTrial, setOwnerIsInTrial] = useState(false);
  const [completedOrders, setCompletedOrders] = useState(0);
  const isPremiumPlan = ownerPlan.slug === 'pro' || ownerPlan.slug === 'business' || ownerIsInTrial;
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const headerCartRef = useRef<HTMLDivElement>(null);
  const [showFloatingBar, setShowFloatingBar] = useState(false);
  const [cartGlow, setCartGlow] = useState(false);
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

  const schemaData = useMemo(() => {
    if (!shop) return null;
    const shopUrl = `https://steersolo.com/shop/${shop.shop_slug}`;
    const imageUrl = shop.logo_url || shop.banner_url || '';
    const data: any = {
      "@context": "https://schema.org",
      "@type": isPremiumPlan ? "Store" : "LocalBusiness",
      "name": shop.shop_name,
      "description": shop.description || `Shop at ${shop.shop_name}${isPremiumPlan ? '' : ' on SteerSolo'}`,
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
    if (isPremiumPlan) {
      data["@id"] = shopUrl;
      data.brand = { "@type": "Brand", "name": shop.shop_name };
      data.isPartOf = { "@type": "WebSite", "name": "SteerSolo", "url": "https://steersolo.com" };
      if (shop.whatsapp_number) {
        let phone = shop.whatsapp_number.replace(/[^\d+]/g, '');
        if (!phone.startsWith('+')) {
          phone = phone.startsWith('234') ? `+${phone}` : `+234${phone.replace(/^0+/, '')}`;
        }
        data.contactPoint = { "@type": "ContactPoint", "telephone": phone, "contactType": "customer service", "availableLanguage": ["English"] };
        data.sameAs = [`https://wa.me/${phone.replace('+', '')}`];
      }
      data.potentialAction = {
        "@type": "SearchAction",
        "target": `${shopUrl}?search={search_term}`,
        "query-input": "required name=search_term"
      };
    }
    if (products.length > 0) {
      data.hasOfferCatalog = {
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
    return data;
  }, [shop, products, isPremiumPlan]);

  useEffect(() => {
    let filtered = products;
    if (typeFilter !== 'all') filtered = filtered.filter(p => p.type === typeFilter);
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
        if (searchQuery === "" && isSearchExpanded) setIsSearchExpanded(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchQuery, isSearchExpanded]);

  useEffect(() => {
    if (isSearchExpanded && inputRef.current) {
      setTimeout(() => { inputRef.current?.focus(); }, 100);
    }
  }, [isSearchExpanded]);

  const loadShopData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: shopData, error: shopError } = await supabase
        .from("shops").select("*").eq("shop_slug", slug).single();
      if (shopError) throw shopError;
      if (!shopData) {
        toast({ title: "Shop Not Found", description: "This shop doesn't exist or is not active", variant: "destructive" });
        return;
      }
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
              .from('subscription_plans').select('slug, name').eq('id', profileData.subscription_plan_id).single();
            if (planData) setOwnerPlan({ slug: planData.slug, name: planData.name });
          }
        }
      }
      let productsQuery = supabase.from("products").select("*").eq("shop_id", shopData.id).order("created_at", { ascending: false });
      if (!user || user.id !== shopData.owner_id) productsQuery = productsQuery.eq("is_available", true);
      const { data: productsData, error: productsError } = await productsQuery;
      if (productsError) throw productsError;
      const productsList = (productsData || []).map(p => ({
        ...p,
        type: (p.type || 'product') as 'product' | 'service',
        booking_required: p.booking_required ?? false
      }));

      const hasCompletePaymentSetup = (() => {
        const method = shopData.payment_method;
        if (!method) return false;
        const hasBank = !!(shopData.bank_name && shopData.bank_account_name && shopData.bank_account_number);
        const hasPaystack = !!shopData.paystack_public_key;
        if (method === 'bank_transfer') return hasBank;
        if (method === 'paystack') return hasPaystack;
        if (method === 'both') return hasBank && hasPaystack;
        return false;
      })();

      const hasProductWithImage = productsList.some(
        (p) => p.type === 'product' && p.is_available && !!p.image_url
      );

      // Public visitors should only see storefronts that are complete for buying.
      if ((!user || user.id !== shopData.owner_id) && (!hasCompletePaymentSetup || !hasProductWithImage)) {
        toast({ title: "Shop Not Ready Yet", description: "This storefront is still completing setup. Please check back soon." });
        setShop(null);
        return;
      }

      setProducts(productsList);
      setFilteredProducts(productsList);
      const { count: ordersCount } = await supabase
        .from('orders').select('*', { count: 'exact', head: true })
        .eq('shop_id', shopData.id).eq('status', 'completed');
      setCompletedOrders(ordersCount || 0);
    } catch (error: any) {
      console.error("Error loading shop:", error);
      toast({ title: "Error", description: "Failed to load shop data", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    setCartGlow(true);
    window.setTimeout(() => setCartGlow(false), 900);

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.product.id === product.id);
      if (existingItem) {
        if (existingItem.quantity >= product.stock_quantity) {
          toast({
            title: "Maximum Stock Reached",
            description: `Only ${product.stock_quantity} ${product.stock_unit || "units"} available`,
            variant: "destructive"
          });
          return prevCart;
        }
        return prevCart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
    toast({ title: "Added to Cart", description: `${product.name} added to your cart` });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity === 0) {
      setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => item.product.id === productId ? { ...item, quantity } : item)
    );
  };

  const getTotalAmount = () => cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  const getTotalItems = () => cart.reduce((total, item) => total + item.quantity, 0);

  const clearSearch = () => {
    setSearchQuery("");
    if (!isSearchExpanded) {
      setIsSearchExpanded(true);
      setTimeout(() => { inputRef.current?.focus(); }, 100);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) setIsSearchExpanded(true);
  };

  const toggleSearch = () => {
    setIsSearchExpanded(!isSearchExpanded);
    if (!isSearchExpanded) setTimeout(() => { inputRef.current?.focus(); }, 100);
  };

  /* ─── Loading State ─── */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-accent/20" />
            <div className="absolute inset-0 rounded-full border-2 border-t-accent animate-spin" />
          </div>
          <p className="text-sm text-muted-foreground font-medium tracking-wide">Loading store…</p>
        </div>
      </div>
    );
  }

  /* ─── 404 State ─── */
  if (!shop) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
          <div className="w-24 h-24 mb-8 rounded-3xl bg-muted flex items-center justify-center shadow-inner">
            <Store className="w-11 h-11 text-muted-foreground" />
          </div>
          <h1 className="font-display text-4xl font-bold mb-3 tracking-tight">Shop Unavailable</h1>
          <p className="text-muted-foreground mb-8 max-w-sm leading-relaxed">
            This store may be temporarily closed, still setting up, or the link might be incorrect.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/shops">
              <Button size="lg" className="rounded-xl px-8 bg-gradient-to-r from-accent to-primary font-semibold shadow-lg shadow-accent/25">
                <Store className="w-4 h-4 mr-2" /> Browse All Shops
              </Button>
            </Link>
            <Link to="/">
              <Button size="lg" variant="outline" className="rounded-xl px-8">
                <ArrowLeft className="w-4 h-4 mr-2" /> Go Home
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  /* ─── Main Storefront ─── */
  const shopUrl = shop ? `https://steersolo.com/shop/${shop.shop_slug}` : '';
  const metaDescription = shop?.description || (shop ? `Shop at ${shop.shop_name} on SteerSolo` : '');

  return (
    <div
      className="min-h-screen bg-background flex flex-col"
      style={{
        ...(shop?.accent_color ? { '--accent': shop.accent_color } as any : {}),
        ...(shop?.font_style ? { fontFamily: shop.font_style } : {}),
      }}
    >
      {shop && (
        <Helmet>
          <title>{isPremiumPlan ? `${shop.shop_name} — Shop Online` : `${shop.shop_name} | SteerSolo`}</title>
          <meta name="description" content={metaDescription} />
          <meta property="og:title" content={shop.shop_name} />
          <meta property="og:description" content={metaDescription} />
          <meta property="og:url" content={shopUrl} />
          <meta property="og:type" content="website" />
          <meta property="og:site_name" content="SteerSolo" />
          {shop.logo_url || shop.banner_url ? <meta property="og:image" content={shop.logo_url || shop.banner_url || ''} /> : null}
          {shop.logo_url || shop.banner_url ? <meta name="twitter:image" content={shop.logo_url || shop.banner_url || ''} /> : null}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={shop.shop_name} />
          <meta name="twitter:description" content={metaDescription} />
          <link rel="canonical" href={shopUrl} />
          {schemaData && (
            <script type="application/ld+json">
              {JSON.stringify(schemaData)}
            </script>
          )}
        </Helmet>
      )}
      <Navbar shopBranding={isPremiumPlan ? { name: shop.shop_name, logoUrl: shop.logo_url } : null} />

      {/* ══════════════════ HERO SECTION ══════════════════ */}
      <section className="relative pt-16" data-tour="shop-header">

        {/* Full-bleed Banner */}
        <div className="relative h-52 sm:h-64 md:h-80 overflow-hidden">
          {(shop.logo_url || shop.banner_url) && (
            <div className="absolute inset-0">
              <img
                src={shop.logo_url || shop.banner_url || ""}
                alt=""
                aria-hidden="true"
                className="w-full h-full object-cover scale-125 blur-2xl opacity-75"
              />
              <div className="absolute inset-0 bg-black/55" />
            </div>
          )}
          {shop.banner_url ? (
            <img
              src={shop.banner_url}
              alt={`${shop.shop_name} banner`}
              className="relative z-[1] w-full h-full object-cover scale-105 transition-transform duration-700 opacity-80"
            />
          ) : (
            <div className="relative z-[1] w-full h-full gradient-hero-spotify" />
          )}
          {/* Multi-layer overlay for depth */}
          <div className="absolute inset-0 z-[2] bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute inset-0 z-[2] bg-gradient-to-r from-background/30 to-transparent" />
        </div>

        {/* Shop Identity Card */}
        <div className="container mx-auto px-4">
          <div className="relative -mt-14 sm:-mt-16 md:-mt-24 pb-8">
            <div className="relative -mt-4 pb-6 z-10">
              <div className="bg-card/80 backdrop-blur-2xl border border-border/50 rounded-2xl md:rounded-3xl shadow-2xl shadow-black/10 p-5 md:p-8">

                {/* Top row: Logo + Actions */}
                <div className="flex flex-col sm:flex-row sm:items-start gap-5 mb-5">

                  {/* Logo */}
                  <div className="flex-shrink-0">
                    <div className="relative w-20 h-20 md:w-24 md:h-24">
                      <div className="w-full h-full rounded-2xl md:rounded-3xl overflow-hidden ring-4 ring-background shadow-xl bg-muted flex items-center justify-center">
                        {shop.logo_url ? (
                          <img
                            src={shop.logo_url}
                            alt={shop.shop_name}
                            className="w-full h-full object-cover select-none"
                            draggable={false}
                            onContextMenu={(e) => e.preventDefault()}
                          />
                        ) : (
                          <Store className="w-10 h-10 text-muted-foreground" />
                        )}
                      </div>
                      {shop.is_verified && (
                        <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-green-500 border-2 border-background flex items-center justify-center shadow-md">
                          <BadgeCheck className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Shop Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight truncate" style={{ color: shop.primary_color || undefined }}>{shop.shop_name}</h1>
                        {shop.description && (
                          <p className="text-muted-foreground mt-1 text-sm md:text-base line-clamp-2 leading-relaxed max-w-lg">{shop.description}</p>
                        )}
                        {(shop.state || shop.country) && (
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <MapPin className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm text-muted-foreground">{[shop.state, shop.country].filter(Boolean).join(", ")}</span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div
                        ref={headerCartRef}
                        className="w-full sm:w-auto grid grid-cols-2 sm:flex sm:flex-wrap items-stretch sm:items-center gap-2 mt-2 sm:mt-0"
                      >
                        {shop.whatsapp_number && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openWhatsAppContact(shop.whatsapp_number!, shop.shop_name)}
                            className="w-full rounded-xl h-11 sm:h-10 px-3 sm:px-4 border-green-500/45 bg-green-500/10 text-green-700 dark:text-green-300 hover:bg-green-500/15 hover:border-green-500 transition-all font-semibold gap-2 shadow-sm hover:shadow-md"
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span>Contact</span>
                          </Button>
                        )}
                        <TourButton
                          onStartTour={startTour}
                          hasSeenTour={hasSeenTour}
                          onResetTour={resetTour}
                          className="w-full"
                        />
                        <ShareStorefront
                          shopName={shop.shop_name}
                          shopSlug={shop.shop_slug}
                          shopDescription={shop.description}
                          logoUrl={shop.logo_url}
                          rating={shop.average_rating}
                          totalReviews={shop.total_reviews}
                          productCount={productCount}
                        />
                        <Button
                          size="sm"
                          onClick={() => setIsCheckoutOpen(true)}
                          className={`w-full rounded-xl h-11 sm:h-10 px-3 sm:px-4 text-white shadow-lg shadow-accent/30 font-semibold transition-all gap-2 hover:brightness-110 border border-white/15 ${
                            cartGlow ? "bg-gradient-to-r from-lime-300 via-lime-400 to-green-400 text-zinc-950 shadow-[0_0_24px_rgba(132,204,22,0.65)] border-lime-200 animate-pulse" : ""
                          }`}
                          style={cartGlow ? undefined : { background: `linear-gradient(90deg, ${shop.secondary_color || "hsl(var(--accent))"}, ${shop.primary_color || "hsl(var(--primary))"})` }}
                          data-tour="cart-button"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          <span>Cart</span>
                          <span className="bg-white/25 rounded-lg px-1.5 py-0.5 text-xs font-bold tabular-nums">{getTotalItems()}</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-border/50">
                  {shop.total_reviews > 0 && (
                    <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 rounded-xl px-3 py-1.5">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">{shop.average_rating.toFixed(1)}</span>
                      <span className="text-xs text-muted-foreground">({shop.total_reviews})</span>
                    </div>
                  )}
                  {completedOrders > 0 && (
                    <div className="flex items-center gap-1.5 bg-primary/5 border border-primary/20 rounded-xl px-3 py-1.5">
                      <ShoppingBag className="w-3.5 h-3.5 text-primary" />
                      <span className="text-xs font-medium text-primary">{completedOrders} successful trades</span>
                    </div>
                  )}
                  {productCount > 0 && (
                    <div className="flex items-center gap-1.5 bg-accent/5 border border-accent/20 rounded-xl px-3 py-1.5">
                      <Package className="w-3.5 h-3.5 text-accent" />
                      <span className="text-xs font-medium text-accent">{productCount} products</span>
                    </div>
                  )}
                  {serviceCount > 0 && (
                    <div className="flex items-center gap-1.5 bg-purple-500/5 border border-purple-500/20 rounded-xl px-3 py-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-purple-500" />
                      <span className="text-xs font-medium text-purple-500">{serviceCount} services</span>
                    </div>
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
          </div>
        </div>
      </section>

      {/* ══════════════════ MARKETPLACE EXPLAINER ══════════════════ */}
      <section className="container mx-auto px-4 pt-2 md:pt-0 pb-8">
        <div className="rounded-2xl border border-border/60 bg-gradient-to-r from-accent/5 via-background to-primary/5 p-5 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5">
            <p className="text-xs uppercase tracking-wider font-semibold text-accent">SteerSolo Marketplace</p>
            <h3 className="font-display text-lg md:text-xl font-bold">Discover more verified Nigerian stores in one place</h3>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Beyond this storefront, SteerSolo connects buyers to trusted sellers across beauty, fashion, food, gadgets, and services.
              Explore the marketplace to compare stores, find new vendors, and shop faster with confidence.
            </p>
          </div>
          <Link to="/shops" className="md:shrink-0">
            <Button className="rounded-xl gap-2 text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 border border-emerald-300/30 shadow-md shadow-emerald-900/20">
              Visit Marketplace
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ══════════════════ CATALOG SECTION ══════════════════ */}
      <section className="relative flex-1 container mx-auto px-4 pb-32 md:pb-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-3xl opacity-50 dark:opacity-20"
          style={{
            backgroundImage: "radial-gradient(circle, hsl(var(--foreground) / 0.12) 1.3px, transparent 1.3px)",
            backgroundSize: "22px 22px",
          }}
        />

        {/* Toolbar */}
        <div className="relative z-10 flex flex-col gap-4 mb-8">

          {/* Top Row: Back + Title + Search */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link to="/shops">
                <Button variant="ghost" size="sm" className="rounded-xl h-9 px-3 text-muted-foreground hover:text-foreground gap-1.5">
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm">Shops</span>
                </Button>
              </Link>
              <div className="h-5 w-px bg-border" />
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-accent" />
                </div>
                <h2 className="font-display text-xl md:text-2xl font-bold tracking-tight" style={{ color: shop.primary_color || undefined }}>Catalog</h2>
              </div>
            </div>

            {/* Animated Search */}
            <div ref={searchRef} className="relative" data-tour="search-products">
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                <div className="relative flex items-center">
                  <button
                    type="button"
                    onClick={toggleSearch}
                    className="flex items-center justify-center w-10 h-10 rounded-xl bg-card border border-border hover:border-accent/50 hover:bg-accent/5 transition-all duration-200"
                  >
                    <Search className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <div className={`
                    relative overflow-hidden transition-all duration-300 ease-in-out
                    ${isSearchExpanded ? 'w-44 sm:w-60 ml-2 opacity-100' : 'w-0 ml-0 opacity-0'}
                  `}>
                    <Input
                      ref={inputRef}
                      type="text"
                      placeholder="Search products…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-10 rounded-xl bg-card border-border focus:border-accent pr-8 pl-3 text-sm"
                      onBlur={() => {
                        if (searchQuery === "" && isSearchExpanded)
                          setTimeout(() => setIsSearchExpanded(false), 150);
                      }}
                    />
                    {searchQuery && (
                      <button type="button" onClick={clearSearch}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-md flex items-center justify-center hover:bg-muted transition-colors">
                        <X className="w-3 h-3 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Filter Tabs */}
          {(productCount > 0 || serviceCount > 0) && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none" data-tour="product-filters">
              {[
                { key: 'all', label: `All (${products.length})`, icon: null },
                ...(productCount > 0 ? [{ key: 'product', label: `Products (${productCount})`, icon: <Package className="w-3.5 h-3.5" /> }] : []),
                ...(serviceCount > 0 ? [{ key: 'service', label: `Services (${serviceCount})`, icon: <Briefcase className="w-3.5 h-3.5" /> }] : []),
              ].map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => setTypeFilter(key as any)}
                  className={`
                    flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0
                    ${typeFilter === key
                      ? 'bg-foreground text-background shadow-sm'
                      : 'bg-card border border-border text-muted-foreground hover:border-accent/40 hover:text-foreground hover:bg-accent/5'
                    }
                  `}
                >
                  {icon}
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Search Results Banner */}
          {searchQuery && (
            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-accent/5 border border-accent/20">
              <div className="flex items-center gap-2 text-sm">
                <Search className="w-4 h-4 text-accent flex-shrink-0" />
                <span className="text-muted-foreground">Results for</span>
                <span className="font-semibold text-accent">"{searchQuery}"</span>
              </div>
              <button
                onClick={clearSearch}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="w-3 h-3" /> Clear
              </button>
            </div>
          )}
        </div>

        <div className="mx-auto w-full max-w-[26rem] sm:max-w-none">
          {/* ── Empty State ── */}
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mb-6 shadow-inner">
                {searchQuery ? <Search className="w-9 h-9 text-muted-foreground" /> : <Package className="w-9 h-9 text-muted-foreground" />}
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">
                {searchQuery ? "No Results Found" : "No Products Yet"}
              </h3>
              <p className="text-muted-foreground text-sm max-w-xs mb-6">
                {searchQuery ? `We couldn't find anything matching "${searchQuery}"` : "This shop hasn't added any products yet."}
              </p>
              {searchQuery && (
                <Button variant="outline" onClick={clearSearch} className="rounded-xl gap-2">
                  <X className="w-4 h-4" /> Clear Search
                </Button>
              )}
            </div>
          ) : (
            /* ── Product Grid ── */
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 md:gap-6">
              {filteredProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="group min-h-0 bg-card border border-border/60 rounded-2xl overflow-hidden hover:border-accent/40 hover:shadow-xl hover:shadow-accent/5 transition-all duration-300 flex flex-col animate-fade-up"
                  style={{ animationDelay: `${index * 0.04}s` }}
                  data-tour={index === 0 ? "product-card" : undefined}
                >
                  {/* Product Image */}
                  <Link
                    to={`/shop/${slug}/product/${product.id}`}
                    className="relative block overflow-hidden bg-muted aspect-square"
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  >
                    <ProductMediaCard
                      imageUrl={product.image_url}
                      videoUrl={product.video_url}
                      alt={product.name}
                      className="w-full h-full"
                    >
                      {!product.image_url && !product.video_url && (
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                          {product.type === 'service'
                            ? <Briefcase className="w-12 h-12 text-accent/50" />
                            : <Package className="w-12 h-12 text-muted-foreground/50" />
                          }
                        </div>
                      )}
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                          <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center gap-1.5 shadow-lg">
                            <Eye className="w-3.5 h-3.5" />
                            <span className="text-xs font-semibold">View Details</span>
                          </div>
                        </div>
                      </div>
                    </ProductMediaCard>

                    {/* Type Badge — top left */}
                    <div className="absolute top-2.5 left-2.5">
                      <div className={`
                        flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold backdrop-blur-sm
                        ${product.type === 'service'
                          ? 'bg-purple-500/85 text-white'
                          : 'bg-foreground/80 text-background'
                        }
                      `}>
                        {product.type === 'service'
                          ? <><Briefcase className="w-3 h-3" /> Service</>
                          : <><Package className="w-3 h-3" /> Product</>
                        }
                      </div>
                    </div>

                    {/* Discount Badge — top right */}
                    {product.compare_price && Number(product.compare_price) > product.price && (
                      <div className="absolute top-2.5 right-2.5">
                        <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-sm">
                          -{Math.round(((Number(product.compare_price) - product.price) / Number(product.compare_price)) * 100)}%
                        </div>
                      </div>
                    )}

                    {/* Owner-only: Unavailable badge */}
                    {isOwner && !product.is_available && (
                      <div className="absolute bottom-2.5 left-2.5">
                        <div className="bg-destructive/90 text-destructive-foreground text-xs font-medium px-2 py-1 rounded-lg">
                          Unavailable
                        </div>
                      </div>
                    )}
                  </Link>

                  {/* Product Info */}
                  <div className="flex min-h-0 flex-col flex-1 p-3 sm:p-4">
                    <Link to={`/shop/${slug}/product/${product.id}`} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                      <h3 className="min-h-0 font-semibold text-sm sm:text-base leading-snug line-clamp-2 hover:text-accent transition-colors mb-1">
                        {product.name}
                      </h3>
                    </Link>

                    {product.description && (
                      <p className="min-h-0 text-xs text-muted-foreground line-clamp-2 mb-2 hidden sm:block leading-relaxed">
                        {product.description}
                      </p>
                    )}

                    <ProductRating rating={product.average_rating || 0} totalReviews={product.total_reviews || 0} />

                    {/* Price Row */}
                    <div className="flex items-center justify-between mt-2 mb-3">
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        <span className="text-base sm:text-lg font-bold text-primary dark:text-accent tabular-nums tracking-tight">
                          ₦{product.price.toLocaleString()}
                        </span>
                        {product.compare_price && Number(product.compare_price) > product.price && (
                          <span className="text-xs text-muted-foreground line-through tabular-nums">
                            ₦{Number(product.compare_price).toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Stock / Duration */}
                      {product.type === 'service' && product.duration_minutes ? (
                        <div className="flex items-center gap-1 text-xs text-purple-500 bg-purple-500/10 rounded-lg px-2 py-1">
                          <Clock className="w-3 h-3" />
                          <span>{product.duration_minutes}m</span>
                        </div>
                      ) : product.type === 'product' && (
                        <div className={`
                          flex items-center gap-1 text-xs rounded-lg px-2 py-1
                          ${product.stock_quantity > 0
                            ? 'text-emerald-600 bg-emerald-500/10'
                            : 'text-red-500 bg-red-500/10'
                          }
                        `}>
                          <div className={`w-1.5 h-1.5 rounded-full ${product.stock_quantity > 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />
                          <span>{product.stock_quantity > 0 ? `${product.stock_quantity} ${product.stock_unit || "units"} left` : 'Out of stock'}</span>
                        </div>
                      )}
                    </div>

                    {/* CTA Buttons */}
                    <div className="mt-auto space-y-2">
                      {product.type === 'service' && product.booking_required ? (
                        <Button
                          className="w-full h-9 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm shadow-sm shadow-purple-500/20 gap-1.5 transition-all"
                          onClick={(e) => { e.preventDefault(); handleBookService(product); }}
                          disabled={product.stock_quantity === 0 || (!product.is_available && !isOwner)}
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          Book Now
                        </Button>
                      ) : (
                        <Button
                          className="w-full h-9 rounded-xl text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 font-semibold text-sm shadow-sm shadow-emerald-900/20 gap-1.5 transition-all border border-emerald-300/30"
                          onClick={(e) => { e.preventDefault(); addToCart(product); }}
                          disabled={product.stock_quantity === 0 || (!product.is_available && !isOwner)}
                        >
                          <ShoppingCart className="w-3 h-3" />
                          Add to Cart
                        </Button>
                      )}
                      <div className="grid grid-cols-2 gap-1.5">
                        <Link to={`/shop/${slug}/product/${product.id}`} className="w-full">
                          <Button
                            variant="outline"
                            className="w-full h-9 rounded-xl border-border hover:border-accent/50 hover:bg-accent/5 transition-all"
                          >
                            View
                            <ChevronRight className="w-3.5 h-3.5 ml-1" />
                          </Button>
                        </Link>
                        <WishlistButton productId={product.id} size="sm" showLabel className="h-9 w-full rounded-xl" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════ FLOATING CART BAR ══════════════════ */}
      {showFloatingBar && (getTotalItems() > 0 || shop.whatsapp_number) && (
        <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
          {/* Subtle gradient fade above bar */}
          <div className="h-12 bg-gradient-to-t from-background/80 to-transparent" />
          <div className="bg-card/95 backdrop-blur-2xl border-t border-border/50 px-4 py-3 safe-area-pb pointer-events-auto shadow-2xl">
            <div className="container mx-auto flex items-center justify-center gap-3 max-w-md">
              {shop.whatsapp_number && (
                <Button
                  variant="outline"
                  onClick={() => openWhatsAppContact(shop.whatsapp_number!, shop.shop_name)}
                  className="flex-1 h-12 rounded-2xl border-green-400/40 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30 font-semibold gap-2 transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  Contact
                </Button>
              )}
              {getTotalItems() > 0 && (
                <Button
                  onClick={() => setIsCheckoutOpen(true)}
                  className="flex-1 h-12 rounded-2xl text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 font-bold shadow-xl shadow-emerald-900/25 gap-2 transition-all border border-emerald-300/30"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>View Cart</span>
                  <span className="bg-white/20 rounded-xl px-2 py-0.5 text-xs font-bold tabular-nums">
                    {getTotalItems()} · ₦{getTotalAmount().toLocaleString()}
                  </span>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

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
          onClose={() => { setIsBookingOpen(false); setSelectedService(null); }}
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
        styles={{ options: { zIndex: 10000, arrowColor: 'hsl(var(--card))' } }}
      />
    </div>
  );
};

export default ShopStorefront;
