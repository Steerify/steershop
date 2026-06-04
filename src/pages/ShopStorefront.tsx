import { useEffect, useState, useRef, useMemo } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
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
  MessageCircle, MapPin, ChevronRight, ShoppingBag, Heart, Tag
} from "lucide-react";
import { WishlistButton } from "@/components/WishlistButton";
import { openWhatsAppContact } from "@/utils/whatsapp";
import { ProductMediaCard } from "@/components/ProductMediaCard";
import { getCategoryLabel } from "@/utils/autoCategorize";
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
import { ShopAvatar } from "@/components/ShopAvatar";

interface Shop {
  id: string;
  shop_name: string;
  shop_slug: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  average_rating: number;
  total_reviews: number;
  is_active?: boolean;
  payment_method?: string;
  paystack_public_key?: string;
  whatsapp_number?: string;
  bank_account_name?: string;
  bank_name?: string;
  bank_account_number?: string;
  is_verified?: boolean;
  owner_id?: string;
  state?: string | null;
  city?: string | null;
  country?: string | null;
  address?: string | null;
  category?: string | null;
  show_public_address?: boolean | null;
  accent_color?: string | null;
  font_style?: string | null;
  theme_mode?: string | null;
  primary_color?: string | null;
  secondary_color?: string | null;
  seo_description?: string | null;
  seo_keywords?: string[] | null;
  tier?: string;
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
  const location = useLocation();
  const navigate = useNavigate();
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
  const [isCartHydrated, setIsCartHydrated] = useState(false);
  const cartOpenHandledRef = useRef(false);
  const { hasSeenTour, isRunning, startTour, endTour, resetTour } = useTour('storefront');

  const handleTourCallback = (data: CallBackProps) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      endTour(status === STATUS.FINISHED);
    }
  };

  useEffect(() => { loadShopData(); }, [slug]);

  useEffect(() => {
    setIsCartHydrated(false);
    cartOpenHandledRef.current = false;

    if (!shop?.id) {
      setCart([]);
      return;
    }

    try {
      const savedCart = JSON.parse(localStorage.getItem(`cart_${shop.id}`) || "[]");
      setCart(Array.isArray(savedCart) ? savedCart : []);
    } catch (error) {
      console.error("Failed to hydrate cart:", error);
      setCart([]);
    } finally {
      setIsCartHydrated(true);
    }
  }, [shop?.id]);

  useEffect(() => {
    if (!shop?.id || !isCartHydrated) return;
    localStorage.setItem(`cart_${shop.id}`, JSON.stringify(cart));
  }, [cart, isCartHydrated, shop?.id]);

  useEffect(() => {
    if (!isCartHydrated || cartOpenHandledRef.current) return;

    const searchParams = new URLSearchParams(location.search);
    const hasCartOpenIntent = searchParams.get("cart") === "open" || location.hash === "#cart";
    if (!hasCartOpenIntent || cart.length === 0) return;

    setIsCheckoutOpen(true);
    cartOpenHandledRef.current = true;

    searchParams.delete("cart");
    navigate(
      {
        pathname: location.pathname,
        search: searchParams.toString() ? `?${searchParams.toString()}` : "",
        hash: location.hash === "#cart" ? "" : location.hash,
      },
      { replace: true }
    );
  }, [cart.length, isCartHydrated, location.hash, location.pathname, location.search, navigate]);

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

  const publicLocationParts = useMemo(() => [shop?.city, shop?.state, shop?.country].filter(Boolean).join(", "), [shop]);
  const fullPublicAddress = shop?.show_public_address ? [shop.address, shop.city, shop.state, shop.country].filter(Boolean).join(", ") : "";
  const shopCategoryLabel = shop?.category ? (getCategoryLabel(shop.category) === 'Other' && shop.category !== 'other' ? shop.category : getCategoryLabel(shop.category)) : "";

  const schemaData = useMemo(() => {
    if (!shop) return null;
    const shopUrl = `https://steersolo.com/shop/${shop.shop_slug}`;
    const imageUrl = shop.logo_url || shop.banner_url || '';
    const data: any = {
      "@context": "https://schema.org",
      "@type": "Store",
      "name": shop.shop_name,
      "description": shop.description || `Shop ${shop.category ? `${getCategoryLabel(shop.category)} ` : ''}at ${shop.shop_name}${shop.city ? ` in ${shop.city}` : ''} on SteerSolo`,
      "url": shopUrl,
      "image": imageUrl || undefined,
      "category": shopCategoryLabel || undefined,
      "numberOfEmployees": "1-10",
      "address": {
        "@type": "PostalAddress",
        ...(shop.show_public_address && shop.address && { "streetAddress": shop.address }),
        ...(shop.city && { "addressLocality": shop.city }),
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
      "@id": shopUrl,
      "brand": { "@type": "Brand", "name": shop.shop_name },
      "isPartOf": { "@type": "WebSite", "name": "SteerSolo", "url": "https://steersolo.com" },
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${shopUrl}?search={search_term}`,
        "query-input": "required name=search_term"
      }
    };
    
    if (shop.whatsapp_number) {
      let phone = shop.whatsapp_number.replace(/[^\d+]/g, '');
      if (!phone.startsWith('+')) {
        phone = phone.startsWith('234') ? `+${phone}` : `+234${phone.replace(/^0+/, '')}`;
      }
      data.contactPoint = { "@type": "ContactPoint", "telephone": phone, "contactType": "customer service", "availableLanguage": ["English"] };
      data.sameAs = [`https://wa.me/${phone.replace('+', '')}`];
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

    const breadcrumbs = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Marketplace", "item": "https://steersolo.com/shops" },
        { "@type": "ListItem", "position": 2, "name": shop.shop_name, "item": shopUrl }
      ]
    };

    return [data, breadcrumbs];
  }, [shop, products, shopCategoryLabel]);

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
        .from("shops")
        .select("*, safebeauty_tiers(tier)")
        .eq("shop_slug", slug)
        .single();
      if (shopError) throw shopError;
      
      const transformedShop = {
        ...shopData,
        tier: (shopData.safebeauty_tiers as any)?.[0]?.tier || (shopData.safebeauty_tiers as any)?.tier || 'listed'
      };

      setShop(transformedShop);
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
      const isOwnerView = !!user && user.id === shopData.owner_id;
      // For public storefront, never expose digital_file_url or other internal fields.
      const PUBLIC_PRODUCT_COLS =
        "id, shop_id, name, description, price, compare_price, image_url, video_url, " +
        "stock_quantity, stock_unit, is_available, type, category, duration_minutes, " +
        "booking_required, is_digital, digital_delivery_text, average_rating, total_reviews, " +
        "created_at, updated_at, delete_at, nafdac_number";
      let productsQuery = supabase
        .from("products")
        .select(isOwnerView ? "*" : PUBLIC_PRODUCT_COLS)
        .eq("shop_id", shopData.id)
        .is("delete_at", null)
        .order("created_at", { ascending: false });
      if (!isOwnerView) productsQuery = productsQuery.eq("is_available", true);
      const { data: productsData, error: productsError } = await productsQuery;
      if (productsError) throw productsError;
      const productsList = ((productsData || []) as any[]).map((p: any) => ({
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

      // Owners always see their shop; public visitors need at least one payment method set up.
      // We no longer block the storefront silently — incomplete shops are visible but show a setup banner.

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
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-3 tracking-tight">Shop Not Found</h1>
          <p className="text-muted-foreground mb-8 max-w-sm leading-relaxed text-sm sm:text-base">
            This store doesn't exist or the link may be incorrect.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs sm:max-w-none">
            <Link to="/shops">
              <Button size="lg" className="w-full rounded-xl px-8 bg-gradient-to-r from-accent to-primary font-semibold shadow-lg shadow-accent/25">
                <Store className="w-4 h-4 mr-2" /> Browse All Shops
              </Button>
            </Link>
            <Link to="/">
              <Button size="lg" variant="outline" className="w-full rounded-xl px-8">
                <ArrowLeft className="w-4 h-4 mr-2" /> Go Home
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const isSetupIncomplete = !shop.payment_method || (shop.payment_method === 'bank_transfer' && !shop.bank_account_number) || (shop.payment_method === 'paystack' && !shop.paystack_public_key) || (shop.payment_method === 'both' && (!shop.bank_account_number || !shop.paystack_public_key)) || products.every(p => !p.image_url);

  /* ─── Main Storefront ─── */
  const shopUrl = shop ? `https://steersolo.com/shop/${shop.shop_slug}` : '';
  const metaDescription = shop?.seo_description || shop?.description || (shop ? `Shop ${shopCategoryLabel ? `${shopCategoryLabel} ` : ''}at ${shop.shop_name}${shop.city ? ` in ${shop.city}` : ''}${shop.state ? `, ${shop.state}` : ''} on SteerSolo` : '');

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
          <title>{`${shop.shop_name} | SteerSolo Store`}</title>
          <meta name="description" content={metaDescription} />
          <meta name="keywords" content={shop.seo_keywords?.length ? shop.seo_keywords.join(', ') : `${shop.shop_name}, ${shopCategoryLabel || 'shop'}, ${shop.city || ''}, ${shop.state || 'Nigeria'}, buy ${shop.shop_name} products, social commerce, steersolo`} />
          
          <meta property="og:title" content={shop.shop_name} />
          <meta property="og:description" content={metaDescription} />
          <meta property="og:url" content={shopUrl} />
          <meta property="og:type" content="business.business" />
          <meta property="og:site_name" content="SteerSolo" />
          <meta property="og:locale" content="en_NG" />
          
          {shop.logo_url || shop.banner_url ? <meta property="og:image" content={shop.logo_url || shop.banner_url || ''} /> : null}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={shop.shop_name} />
          <meta name="twitter:description" content={metaDescription} />
          <meta name="twitter:site" content="@steersolo" />
          <link rel="canonical" href={shopUrl} />
          {schemaData && (
            <script type="application/ld+json">
              {JSON.stringify(schemaData)}
            </script>
          )}

        </Helmet>
      )}
      <Navbar shopBranding={isPremiumPlan ? { name: shop.shop_name, logoUrl: shop.logo_url } : null} />
      
      <main id="main-content" className="flex-1 flex flex-col">
      {isOwner && isSetupIncomplete && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 py-3 mt-16 sm:mt-14">
          <div className="container mx-auto px-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              <span>Your shop is live, but setup is incomplete. Complete your payment details to enable checkout.</span>
            </div>
            <Link to="/dashboard">
              <Button size="sm" variant="outline" className="h-8 rounded-lg border-amber-500/50 text-amber-800 dark:text-amber-400 hover:bg-amber-500/10 transition-colors">
                Complete Setup
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* ══════════════════ HERO SECTION ══════════════════ */}
      <section className="relative pt-24 sm:pt-28" data-tour="shop-header">

        {/* Banner — edge-to-edge on mobile per design system, contained on desktop */}
        <div className="relative h-36 sm:h-52 md:h-64 overflow-hidden sm:container sm:mx-auto sm:px-4 sm:mt-2">
          <div className="absolute inset-0 sm:rounded-[2rem] overflow-hidden bg-muted shadow-sm">
            {shop.banner_url ? (
              <img
                src={shop.banner_url}
                alt={`${shop.shop_name} banner`}
                className="w-full h-full object-cover opacity-90"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-primary/10 to-accent/10" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          </div>
        </div>

        {/* Shop Identity Card */}
        <div className="container mx-auto px-3 sm:px-4">
          <div className="relative -mt-12 sm:-mt-16 md:-mt-24 pb-6 sm:pb-8">
            <div className="relative z-10">
              <div className="bg-card/95 backdrop-blur-md rounded-2xl md:rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-4 sm:p-6 md:p-8">
                <div className="flex flex-col sm:flex-row sm:items-start gap-5 md:gap-8 mb-6">

                  {/* Logo */}
                  <div className="flex-shrink-0">
                    <div className="relative w-24 h-24 md:w-32 md:h-32">
                      <div className="w-full h-full ring-[6px] ring-background shadow-xl rounded-2xl md:rounded-[2rem] overflow-hidden">
                        <ShopAvatar 
                          name={shop.shop_name} 
                          logoUrl={shop.logo_url} 
                          className="w-full h-full rounded-none"
                          initialsClassName="text-3xl md:text-4xl"
                        />
                      </div>
                      {shop.is_verified && (
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 border-[3px] border-background flex items-center justify-center shadow-md">
                          <BadgeCheck className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Shop Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center pt-2 sm:pt-4">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                      <div className="min-w-0 max-w-2xl">
                        <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight truncate mb-2" style={{ color: shop.primary_color || undefined }}>{shop.shop_name}</h1>
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          {shopCategoryLabel && (
                            <Badge variant="secondary" className="rounded-full text-xs font-semibold">
                              <Tag className="w-3 h-3 mr-1" />
                              {shopCategoryLabel}
                            </Badge>
                          )}
                          {(publicLocationParts || fullPublicAddress) && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                              <span className="text-sm font-medium text-muted-foreground">
                                {fullPublicAddress || publicLocationParts}
                              </span>
                            </div>
                          )}
                        </div>
                        {shop.description && (
                          <p className="text-muted-foreground text-sm md:text-base line-clamp-3 leading-relaxed">{shop.description}</p>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div
                        ref={headerCartRef}
                        className="w-full lg:w-auto flex flex-row items-center gap-3 shrink-0"
                      >
                          {shop.whatsapp_number && (
                            <Button
                              variant="outline"
                              onClick={() => openWhatsAppContact(shop.whatsapp_number!, shop.shop_name)}
                              className="flex-1 lg:flex-none rounded-xl h-12 px-6 border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/5 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100/50 hover:border-emerald-500/30 transition-all font-semibold gap-2"
                            >
                              <MessageCircle className="w-5 h-5" />
                              <span>Contact</span>
                            </Button>
                          )}
                          <Button
                            onClick={() => setIsCheckoutOpen(true)}
                            className={`flex-1 lg:flex-none rounded-xl h-12 px-6 font-semibold transition-all gap-2 hover:opacity-90 ${
                              cartGlow
                                ? "bg-emerald-400 text-zinc-950 shadow-[0_0_24px_rgba(52,211,153,0.5)] animate-pulse"
                                : "bg-foreground text-background shadow-lg"
                            }`}
                            data-tour="cart-button"
                          >
                            <ShoppingCart className="w-5 h-5" />
                            <span>Cart</span>
                            {getTotalItems() > 0 && (
                              <span className="bg-background/20 rounded-full px-2 py-0.5 text-xs font-bold tabular-nums ml-1">{getTotalItems()}</span>
                            )}
                          </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Refined Stats & Trust Row */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-6 border-t border-border/40">
                  {shop.total_reviews > 0 && (
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-foreground">{shop.average_rating.toFixed(1)}</span>
                      <span className="text-sm text-muted-foreground">({shop.total_reviews} reviews)</span>
                    </div>
                  )}
                  {completedOrders > 0 && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <ShoppingBag className="w-4 h-4" />
                      <span className="text-sm"><span className="font-semibold text-foreground">{completedOrders}</span> sales</span>
                    </div>
                  )}
                  {(productCount > 0 || serviceCount > 0) && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Package className="w-4 h-4" />
                      <span className="text-sm"><span className="font-semibold text-foreground">{productCount + serviceCount}</span> items</span>
                    </div>
                  )}
                  
                  {/* Divider on desktop */}
                  <div className="hidden md:block w-px h-6 bg-border" />
                  
                  <div className="flex items-center gap-3 ml-auto w-full md:w-auto">
                    <TrustBadges
                        isVerified={shop.is_verified}
                        hasWhatsApp={!!shop.whatsapp_number}
                        totalReviews={shop.total_reviews}
                        averageRating={shop.average_rating}
                        completedOrders={completedOrders}
                        tier={shop.tier}
                    />
                    <div className="flex items-center gap-1">
                        <ShareStorefront
                            shopName={shop.shop_name}
                            shopSlug={shop.shop_slug}
                            shopDescription={shop.description}
                            logoUrl={shop.logo_url}
                            rating={shop.average_rating}
                            totalReviews={shop.total_reviews}
                            productCount={productCount}
                        />
                        <TourButton
                            onStartTour={startTour}
                            hasSeenTour={hasSeenTour}
                            onResetTour={resetTour}
                        />
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
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
                <h2 className="hidden sm:block font-display text-xl md:text-2xl font-bold tracking-tight" style={{ color: shop.primary_color || undefined }}>Catalog</h2>
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

        <div className="mx-auto w-full">
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
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
              {filteredProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="group min-h-0 flex flex-col animate-fade-up"
                  style={{ animationDelay: `${index * 0.04}s`, contentVisibility: 'auto' }}
                  data-tour={index === 0 ? "product-card" : undefined}
                >
                  {/* Product Image */}
                  <Link
                    to={`/shop/${slug}/product/${product.id}`}
                    className="relative block overflow-hidden bg-muted/50 rounded-2xl md:rounded-3xl aspect-[4/5] sm:aspect-square mb-4 group-hover:shadow-lg transition-shadow duration-300"
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  >
                    <ProductMediaCard
                      imageUrl={product.image_url}
                      videoUrl={product.video_url}
                      alt={product.name}
                      className="w-full h-full"
                    >
                      {!product.image_url && !product.video_url && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          {product.type === 'service'
                            ? <Briefcase className="w-8 h-8 text-muted-foreground/30" />
                            : <Package className="w-8 h-8 text-muted-foreground/30" />
                          }
                        </div>
                      )}
                    </ProductMediaCard>

                    {/* Wishlist Button - Top Right Hover (or permanent on mobile) */}
                    <div className="absolute top-3 right-3 z-20">
                      <WishlistButton
                        productId={product.id}
                        size="sm"
                        showLabel={false}
                        className="h-9 w-9 rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md shadow-sm border border-black/5 dark:border-white/5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-foreground hover:scale-110"
                      />
                    </div>

                    {/* Discount Badge */}
                    {product.compare_price && Number(product.compare_price) > product.price && (
                      <div className="absolute top-3 left-3 z-10">
                        <div className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                          -{Math.round(((Number(product.compare_price) - product.price) / Number(product.compare_price)) * 100)}%
                        </div>
                      </div>
                    )}

                    {/* Quick Add Overlay */}
                    <div className="absolute inset-x-3 bottom-3 z-20 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 translate-y-1 sm:group-hover:translate-y-0">
                      {product.type === 'service' && product.booking_required ? (
                        <Button
                          className="w-full rounded-xl bg-foreground text-background hover:bg-foreground/90 font-semibold shadow-xl"
                          onClick={(e) => { e.preventDefault(); handleBookService(product); }}
                          disabled={product.stock_quantity === 0 || (!product.is_available && !isOwner)}
                        >
                          Book Now
                        </Button>
                      ) : (
                        <Button
                          className="w-full rounded-xl bg-foreground text-background hover:bg-foreground/90 font-semibold shadow-xl"
                          onClick={(e) => { e.preventDefault(); addToCart(product); }}
                          disabled={product.stock_quantity === 0 || (!product.is_available && !isOwner)}
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Add to Cart
                        </Button>
                      )}
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="flex flex-col flex-1 px-1">
                    <Link to={`/shop/${slug}/product/${product.id}`} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                      <h3 className="font-medium text-sm sm:text-base leading-tight hover:underline underline-offset-4 decoration-muted-foreground/30 transition-all mb-1">
                        {product.name}
                      </h3>
                    </Link>

                    <div className="mt-1 mb-2">
                        <ProductRating rating={product.average_rating || 0} totalReviews={product.total_reviews || 0} />
                    </div>

                    {/* Price Row */}
                    <div className="flex items-baseline gap-2 mt-auto">
                        <span className="text-base sm:text-lg font-bold tabular-nums">
                          ₦{product.price.toLocaleString()}
                        </span>
                        {product.compare_price && Number(product.compare_price) > product.price && (
                          <span className="text-xs text-muted-foreground line-through tabular-nums">
                            ₦{Number(product.compare_price).toLocaleString()}
                          </span>
                        )}
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
          <div className="bg-card/95 backdrop-blur-2xl border-t border-border/50 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pointer-events-auto shadow-2xl">
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

      {/* ══════════════════ MARKETPLACE EXPLAINER (Moved to Bottom) ══════════════════ */}
      <section className="container mx-auto px-4 pb-12">
        <div className="rounded-3xl border border-border bg-card p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent pointer-events-none" />
          <div className="space-y-2 min-w-0 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" /> SteerSolo Marketplace
            </div>
            <h3 className="font-display text-xl sm:text-2xl font-bold">Discover more verified stores</h3>
            <p className="text-sm text-muted-foreground max-w-xl">
              Connect with trusted Nigerian sellers across beauty, fashion, gadgets, and more. Compare stores and shop safely.
            </p>
          </div>
          <Link to="/shops" className="md:shrink-0 relative z-10">
            <Button className="w-full md:w-auto rounded-xl gap-2 font-semibold bg-foreground text-background shadow-lg">
              Visit Marketplace
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      </main>
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
