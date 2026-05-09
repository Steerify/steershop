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
        className="flex-shrink-0 w-full"
        style={{ scrollSnapAlign: "start" }}
        aria-hidden
      >
        <div className="h-full animate-pulse" style={{ borderRadius: 24, background: "rgba(255,255,255,0.07)", minHeight: 380 }} />
      </div>
    ))}
  </>
);

/* ──────────────────────────────────────────────────────────────────────────── */
export const FeaturedStoresHeroCarousel = () => {
  const [slides, setSlides] = useState<FeaturedShopCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);
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
          .not("image_url", "is", null)
          .order("created_at", { ascending: false });

        if (prodErr) console.warn("batch products fetch error:", prodErr.message);

        const prodsByShop = (allProds || []).reduce((acc: any, p) => {
          if (!acc[p.shop_id]) acc[p.shop_id] = [];
          if (acc[p.shop_id].length < 2) acc[p.shop_id].push(p);
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
      style={{
        position: "relative",
        width: "100%",
        flexShrink: 0,
        maxWidth: 520,
        margin: "0 auto",
      }}
      className="group"
    >
      {/* header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Sparkles style={{ width: 14, height: 14, color: "rgba(255,255,255,0.55)" }} />
          <span
            style={{
              fontSize: "0.68rem",
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.45)",
            }}
          >
            Featured Stores
          </span>
        </div>
        {slides.length > 1 && (
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={prev}
              aria-label="Previous store"
              style={{
                width: 28, height: 28, borderRadius: "50%",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", transition: "background .2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.2)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
            >
              <ChevronLeft style={{ width: 14, height: 14, color: "#fff" }} />
            </button>
            <button
              onClick={next}
              aria-label="Next store"
              style={{
                width: 28, height: 28, borderRadius: "50%",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", transition: "background .2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.2)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
            >
              <ChevronRight style={{ width: 14, height: 14, color: "#fff" }} />
            </button>
          </div>
        )}
      </div>

      {/* embla viewport */}
      <div
        ref={emblaRef}
        style={{
          overflow: "hidden",
          borderRadius: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {loading ? (
            <SlideSkeletons />
          ) : (
            slides.map((shop, idx) => {
              const logoUrl = resolveUrl(shop.logo_url);
              const hasLogo = !!logoUrl && !brokenLogos.current.has(shop.id);

              return (
                <div
                  key={shop.id}
                  style={{
                    flex: "0 0 100%",
                    minWidth: 0,
                    transition: "opacity .4s ease",
                    opacity: idx === activeIdx ? 1 : 0.25,
                    padding: "4px", // slight padding to avoid clipping shadows
                  }}
                >
                <Link
                  to={`/shop/${shop.shop_slug}`}
                  style={{ textDecoration: "none", display: "block" }}
                >
                  <div
                    style={{
                      borderRadius: 20,
                      overflow: "hidden",
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      backdropFilter: "blur(10px)",
                      boxShadow: "0 24px 48px rgba(0,0,0,0.35)",
                      transition: "transform .3s ease, box-shadow .3s ease",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow = "0 32px 60px rgba(0,0,0,0.45)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 24px 48px rgba(0,0,0,0.35)";
                    }}
                  >
                    {/* Badge moved to top */}
                    <div style={{ padding: isMobile ? "12px 14px 0" : "16px 18px 0", display: "flex", justifyContent: "flex-end" }}>
                      <div style={{ flexShrink: 0 }}>
                        <SafeBeautyBadge tier={shop.products.length === 1 ? 'listed' : shop.tier} showTooltip={false} />
                        {shop.products.length === 1 && (
                          <div style={{ 
                            marginTop: 4, 
                            fontSize: '0.55rem', 
                            fontWeight: 800, 
                            color: '#a855f7', 
                            textAlign: 'right',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Single Product
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Store header */}
                    <div style={{ padding: isMobile ? "8px 14px 10px" : "10px 18px 12px", display: "flex", alignItems: "flex-start", gap: isMobile ? 10 : 12 }}>
                      {/* Logo */}
                      <div
                        style={{
                          width: isMobile ? 44 : 56, height: isMobile ? 44 : 56, borderRadius: isMobile ? 12 : 16, overflow: "hidden",
                          background: "rgba(255,255,255,0.1)", flexShrink: 0,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          border: "1px solid rgba(255,255,255,0.15)",
                        }}
                      >
                        {hasLogo ? (
                          <img
                            src={logoUrl!}
                            alt={shop.shop_name}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            loading="lazy"
                            onError={() => { brokenLogos.current.add(shop.id); }}
                          />
                        ) : (
                          <Store style={{ width: 22, height: 22, color: "rgba(255,255,255,0.5)" }} />
                        )}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                          <h3
                            style={{
                              fontWeight: 800, fontSize: isMobile ? "0.95rem" : "1.1rem", color: "#fff",
                              margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                            }}
                          >
                            {shop.shop_name}
                          </h3>
                        </div>
                        <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.5)", margin: 0, lineHeight: 1.4 }}>
                          {shop.tagline || shop.description?.slice(0, 60) || "Verified SteerSolo store"}
                        </p>
                      </div>
                    </div>

                    {/* Products */}
                    {shop.products.length > 0 && (
                      <div style={{ 
                        padding: "0 14px 14px", 
                        display: "flex", 
                        gap: 10,
                        justifyContent: shop.products.length === 1 ? "center" : "flex-start" 
                      }}>
                        {shop.products.map((p) => {
                          const imgUrl = resolveUrl(p.image_url);
                          const hasImg = !!imgUrl && !brokenProductImgs.current.has(p.id);
                          return (
                            <div
                              key={p.id}
                              style={{
                                flex: shop.products.length === 1 ? "0 1 280px" : 1, 
                                borderRadius: 14, 
                                overflow: "hidden",
                                background: "rgba(0,0,0,0.25)",
                                border: "1px solid rgba(255,255,255,0.08)",
                                display: "flex", flexDirection: "column",
                                minWidth: 0,
                              }}
                            >
                              {/* Product image */}
                              <div style={{ height: isMobile ? 130 : 180, overflow: "hidden", flexShrink: 0 }}>
                                {hasImg ? (
                                  <img
                                    src={imgUrl!}
                                    alt={p.name}
                                    style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .5s ease" }}
                                    loading="lazy"
                                    onError={() => { brokenProductImgs.current.add(p.id); }}
                                    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
                                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                                  />
                                ) : (
                                  <div
                                    style={{
                                      width: "100%", height: "100%",
                                      display: "flex", alignItems: "center", justifyContent: "center",
                                      background: "rgba(255,255,255,0.04)",
                                    }}
                                  >
                                    <ShoppingBag style={{ width: 28, height: 28, color: "rgba(255,255,255,0.2)" }} />
                                  </div>
                                )}
                              </div>

                              {/* Product info */}
                              <div style={{ padding: "8px 10px 10px" }}>
                                <p
                                  style={{
                                    fontSize: "0.72rem", fontWeight: 600, color: "rgba(255,255,255,0.9)",
                                    margin: "0 0 3px", overflow: "hidden", textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {p.name}
                                </p>
                                <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "#00d97e", margin: 0 }}>
                                  {fmt(p.price)}
                                </p>
                              </div>
                            </div>
                          );
                        })}

                      </div>
                    )}

                    {/* Footer CTA */}
                    <div
                      style={{
                        padding: "10px 18px 14px",
                        borderTop: "1px solid rgba(255,255,255,0.06)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.35)" }}>
                        {shop.state ? `📍 ${shop.state}` : "Nigeria"}
                      </span>
                      <div
                        style={{
                          display: "flex", alignItems: "center", gap: 5,
                          fontSize: "0.72rem", fontWeight: 700, color: "rgba(255,255,255,0.65)",
                        }}
                      >
                        Visit Store
                        <ArrowRight style={{ width: 12, height: 12 }} />
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
        <div style={{ display: "flex", justifyContent: "center", gap: 5, marginTop: 14 }}>
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              aria-label={`Go to store ${i + 1}`}
              style={{
                width: i === activeIdx ? (isMobile ? 14 : 20) : (isMobile ? 5 : 6),
                height: isMobile ? 3 : 5,
                borderRadius: 9999,
                background: i === activeIdx ? "#00d97e" : "rgba(255,255,255,0.2)",
                border: "none",
                cursor: "pointer",
                transition: "all .3s ease",
                padding: 0,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
