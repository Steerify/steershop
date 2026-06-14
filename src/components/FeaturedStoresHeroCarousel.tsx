import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Store, ChevronLeft, ChevronRight, ShoppingBag, Star, ArrowRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { SafeBeautyBadge } from "./SafeBeautyBadge";
import { cn } from "@/lib/utils";

/* ─── Types ─── */
interface ProductPreview {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
}

interface FeaturedShopCard {
  id: string;
  shop_id: string;
  label: string;
  tagline: string | null;
  shop_name: string;
  shop_slug: string;
  logo_url: string | null;
  description: string | null;
  state: string | null;
  products: ProductPreview[];
  tier: string;
}

/* ─── Helpers ─── */
const resolveUrl = (url: string | null): string | null => {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url.replace(/^http:\/\//i, "https://");
  const { data } = supabase.storage.from("shop-images").getPublicUrl(url.replace(/^\/+/, ""));
  return data.publicUrl;
};

const fmt = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

/* ─── Skeleton ─── */
const SlideSkeletons = () => (
  <>
    {[1, 2].map((i) => (
      <div
        key={i}
        className="flex-shrink-0 w-full snap-start"
        aria-hidden
      >
        <div className="h-full animate-pulse bg-muted rounded-2xl min-h-[380px]" />
      </div>
    ))}
  </>
);

/* ──────────────────────────────────────────────────────────────────────────── */
export const FeaturedStoresHeroCarousel = () => {
  const [slides, setSlides] = useState<FeaturedShopCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);
  const [productIdxByShop, setProductIdxByShop] = useState<Record<string, number>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasScrolledIntoViewRef = useRef(false);
  const [isMobile, setIsMobile] = useState(false);
  const brokenLogos = useRef<Set<string>>(new Set());
  const brokenProductImgs = useRef<Set<string>>(new Set());

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true, 
      duration: 30,
      skipSnaps: false,
    },
    [
      Autoplay({ 
        delay: 5000, 
        stopOnInteraction: false,
        stopOnMouseEnter: true,
      })
    ]
  );

  // Sync embla state with our dots
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setActiveIdx(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    const handler = (e: MediaQueryListEvent | MediaQueryList) => setIsMobile(e.matches);
    handler(mql);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  // Rotate product photo within each slide every 3.5s when shop has 2+ products
  useEffect(() => {
    if (slides.length === 0) return;
    const rotatable = slides.filter(s => s.products.length >= 2);
    if (rotatable.length === 0) return;
    const interval = setInterval(() => {
      setProductIdxByShop(prev => {
        const next = { ...prev };
        for (const s of rotatable) {
          const cur = prev[s.id] ?? 0;
          next[s.id] = (cur + 1) % s.products.length;
        }
        return next;
      });
    }, 3500);
    return () => clearInterval(interval);
  }, [slides]);

  /* ── fetch ── */
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        
        // 1. Fetch manually featured shops
        const { data: featuredRaw, error: featErr } = await supabase
          .from("featured_shops")
          .select(`
            id, shop_id, label, tagline,
            shops!inner(
              id, shop_name, shop_slug, logo_url, description, state, created_at, is_active, 
              payment_method, bank_name, bank_account_name, bank_account_number, paystack_public_key,
              safebeauty_tiers(tier)
            )
          `)
          .eq("is_active", true)
          .or("expires_at.is.null,expires_at.gt.now()")
          .order("display_order", { ascending: true });

        if (featErr) console.warn("featured shops fetch error:", featErr.message);

        // 2. Fetch new shops (last 30 days) to "Auto-Feature"
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { data: newShopsRaw, error: newErr } = await supabase
          .from("shops")
          .select(`
            id, shop_name, shop_slug, logo_url, description, state, created_at, is_active, 
            payment_method, bank_name, bank_account_name, bank_account_number, paystack_public_key,
            safebeauty_tiers(tier)
          `)
          .eq("is_active", true)
          .gt("created_at", thirtyDaysAgo.toISOString())
          .order("created_at", { ascending: false })
          .limit(20);

        if (newErr) console.warn("new shops fetch error:", newErr.message);

        // Helper to check payment readiness (matches public.is_shop_ready logic)
        const hasPayment = (s: any) => {
          if (!s.payment_method) return false;
          const hasBank = !!(s.bank_name && s.bank_account_number);
          const hasPaystack = !!s.paystack_public_key;
          
          if (s.payment_method === 'bank_transfer') return hasBank;
          if (s.payment_method === 'paystack') return hasPaystack;
          if (s.payment_method === 'both') return hasBank && hasPaystack;
          return false;
        };

        // Process Manual slides
        const manualSlides = (featuredRaw || []).map(f => ({
          ...f,
          shop: f.shops as any,
          isManual: true
        }));

        // Process Auto slides (New Shops)
        const autoSlides = (newShopsRaw || [])
          .filter(s => hasPayment(s))
          .map(s => ({
            id: `auto-${s.id}`,
            shop_id: s.id,
            label: "NEW STORE",
            tagline: "Just joined SteerSolo",
            shop: s,
            shops: s as any,
            isManual: false
          }));

        // Combine and deduplicate by shop_id (manual takes precedence)
        const combined = [...manualSlides];
        const seenIds = new Set(combined.map(s => s.shop_id));
        
        for (const s of autoSlides) {
          if (!seenIds.has(s.shop_id)) {
            combined.push(s);
            seenIds.add(s.shop_id);
          }
        }

        // Limit to 15 total candidates to avoid heavy batching
        const pool = combined.slice(0, 15);
        const shopIds = pool.map(f => f.shop_id);

        // 3. Batch fetch products for all candidate shops
        const { data: allProds, error: prodErr } = await supabase
          .from("products")
          .select("id, name, price, image_url, shop_id")
          .in("shop_id", shopIds)
          .eq("is_available", true)
          .is("delete_at", null)
          .not("image_url", "is", null)
          .order("created_at", { ascending: false });

        if (prodErr) console.warn("batch products fetch error:", prodErr.message);

        const prodsByShop = (allProds || []).reduce((acc: any, p) => {
          if (!acc[p.shop_id]) acc[p.shop_id] = [];
          if (acc[p.shop_id].length < 6) acc[p.shop_id].push(p);
          return acc;
        }, {});

        const cards: FeaturedShopCard[] = pool
          .map((f) => {
            const shop = f.shop;
            const prods = prodsByShop[f.shop_id] || [];
            const tierData = shop.safebeauty_tiers as any;
            const tier = Array.isArray(tierData) ? tierData[0]?.tier : tierData?.tier || 'listed';

            return {
              id: f.id,
              shop_id: f.shop_id,
              label: f.label,
              tagline: f.tagline,
              shop_name: shop.shop_name,
              shop_slug: shop.shop_slug,
              logo_url: shop.logo_url,
              description: shop.description,
              state: shop.state,
              products: prods,
              tier: tier,
            };
          })
          .filter(c => c.products.length > 0); // Must have at least one product with image

        setSlides(cards);
      } catch (err) {
        console.error("FeaturedStoresHeroCarousel fetch error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const prev = () => emblaApi?.scrollPrev();
  const next = () => emblaApi?.scrollNext();
  const scrollTo = (idx: number) => emblaApi?.scrollTo(idx);

  /* ── empty / loading ── */
  if (!loading && slides.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="relative w-full flex-shrink-0 mx-auto group"
    >
      <style>{`@keyframes fsh-fade-in{from{opacity:0;transform:scale(1.03)}to{opacity:1;transform:scale(1)}}`}</style>
      
      {/* header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-[0.68rem] font-bold tracking-[0.22em] uppercase text-muted-foreground">
            Featured Stores
          </span>
        </div>
        {slides.length > 1 && (
          <div className="flex gap-1.5">
            <button
              onClick={prev}
              aria-label="Previous store"
              className="w-7 h-7 rounded-full bg-background/10 border border-border/50 flex items-center justify-center cursor-pointer transition-colors hover:bg-background/20"
            >
              <ChevronLeft className="w-3.5 h-3.5 text-foreground" />
            </button>
            <button
              onClick={next}
              aria-label="Next store"
              className="w-7 h-7 rounded-full bg-background/10 border border-border/50 flex items-center justify-center cursor-pointer transition-colors hover:bg-background/20"
            >
              <ChevronRight className="w-3.5 h-3.5 text-foreground" />
            </button>
          </div>
        )}
      </div>

      {/* embla viewport */}
      <div ref={emblaRef} className="overflow-hidden rounded-xl">
        <div className="flex touch-pan-y">
          {loading ? (
            <SlideSkeletons />
          ) : (
            slides.map((shop, idx) => {
              const logoUrl = resolveUrl(shop.logo_url);
              const hasLogo = !!logoUrl && !brokenLogos.current.has(shop.id);

              return (
                <div
                  key={shop.id}
                  className={cn(
                    "min-w-0 transition-opacity duration-300 p-1",
                    isMobile ? "flex-[0_0_100%]" : "flex-[0_0_min(100%,360px)]"
                  )}
                >
                  <Link to={`/shop/${shop.shop_slug}`} className="block no-underline">
                    <div className="rounded-xl overflow-hidden bg-card border border-border/50 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer">
                      {/* Store header */}
                      <div className={cn("flex items-center gap-3", isMobile ? "p-3 pb-2.5" : "p-3.5 pb-3")}>
                        {/* Logo */}
                        <div className={cn("flex-shrink-0 overflow-hidden bg-muted/50 border border-border/50 flex items-center justify-center", isMobile ? "w-11 h-11 rounded-xl" : "w-14 h-14 rounded-xl")}>
                          {hasLogo ? (
                            <img
                              src={logoUrl!}
                              alt={shop.shop_name}
                              className="w-full h-full object-cover"
                              loading={idx === 0 ? "eager" : "lazy"}
                              onError={() => { brokenLogos.current.add(shop.id); }}
                            />
                          ) : (
                            <Store className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <h3 className="font-extrabold text-card-foreground truncate text-sm sm:text-base">
                              {shop.shop_name}
                            </h3>
                          </div>
                          <p className="text-[0.72rem] text-muted-foreground m-0 leading-tight">
                            {shop.tagline || shop.description?.slice(0, 60) || "Verified SteerSolo store"}
                          </p>
                        </div>
                      </div>

                      {/* Single rotating product photo */}
                      {shop.products.length > 0 && (() => {
                        const pIdx = (productIdxByShop[shop.id] ?? 0) % shop.products.length;
                        const p = shop.products[pIdx];
                        const imgUrl = resolveUrl(p.image_url);
                        const hasImg = !!imgUrl && !brokenProductImgs.current.has(p.id);
                        const showDots = shop.products.length >= 2;
                        return (
                          <div className="px-3.5 pb-3.5">
                            <div className="rounded-lg overflow-hidden bg-black/25 border border-border/30 flex flex-col relative">
                              <div className={cn("overflow-hidden relative", isMobile ? "h-[220px]" : "h-[300px]")}>
                                {hasImg ? (
                                  <img
                                    key={p.id}
                                    src={imgUrl!}
                                    alt={p.name}
                                    className="w-full h-full object-cover animate-[fsh-fade-in_0.5s_ease]"
                                    loading={idx === 0 ? "eager" : "lazy"}
                                    onError={() => { brokenProductImgs.current.add(p.id); }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-muted/30">
                                    <ShoppingBag className="w-9 h-9 text-muted-foreground/30" />
                                  </div>
                                )}

                                {/* Badge overlay — bottom-left corner of image */}
                                <div className="absolute bottom-2 left-2.5 z-[2]">
                                  <SafeBeautyBadge tier={shop.products.length === 1 ? 'listed' : shop.tier} showTooltip={false} />
                                </div>

                                {showDots && (
                                  <div className="absolute bottom-2.5 left-0 right-0 flex justify-center gap-1">
                                    {shop.products.map((_, i) => (
                                      <span
                                        key={i}
                                        className={cn(
                                          "h-1 rounded-full transition-all duration-300",
                                          i === pIdx 
                                            ? "w-3.5 bg-[#00d97e]" 
                                            : "w-1.5 bg-foreground/45"
                                        )}
                                      />
                                    ))}
                                  </div>
                                )}
                              </div>

                              <div className="p-3 pb-2.5">
                                <p className="text-[0.82rem] font-bold text-card-foreground m-0 mb-1 truncate">
                                  {p.name}
                                </p>
                                {/* Updated price color - darker on light mode, bright on dark mode */}
                                <p className="text-[0.78rem] font-extrabold text-emerald-600 dark:text-emerald-400 m-0">
                                  {fmt(p.price)}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Footer CTA */}
                      <div className="px-4 py-2.5 border-t border-border/30 flex items-center justify-between">
                        <span className="text-[0.72rem] text-muted-foreground">
                          {shop.state ? `📍 ${shop.state}` : "Nigeria"}
                        </span>
                        <div className="flex items-center gap-1 text-[0.72rem] font-bold text-muted-foreground/80">
                          Visit Store
                          <ArrowRight className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Dot indicators */}
      {slides.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              aria-label={`Go to store ${i + 1}`}
              className={cn(
                "rounded-full border-none cursor-pointer transition-all duration-300 p-0",
                i === activeIdx 
                  ? cn("bg-[#00d97e]", isMobile ? "w-3.5 h-[3px]" : "w-5 h-[5px]")
                  : cn("bg-muted-foreground/20", isMobile ? "w-1.5 h-[3px]" : "w-1.5 h-[5px]")
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
};