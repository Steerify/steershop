import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Store, ChevronLeft, ChevronRight, ShoppingBag, Star, ArrowRight } from "lucide-react";
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
        <div className="h-full animate-pulse" style={{ borderRadius: 24, background: "rgba(255,255,255,0.07)", minHeight: 480 }} />
      </div>
    ))}
  </>
);

/* ──────────────────────────────────────────────────────────────────────────── */
export const FeaturedStoresHeroCarousel = () => {
  const [slides, setSlides] = useState<FeaturedShopCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const brokenLogos = useRef<Set<string>>(new Set());
  const brokenProductImgs = useRef<Set<string>>(new Set());

  /* ── fetch ── */
  useEffect(() => {
    (async () => {
      try {
        const { data: featured, error } = await supabase
          .from("featured_shops")
          .select(`
            id, shop_id, label, tagline,
            shops!inner(shop_name, shop_slug, logo_url, description, state)
          `)
          .eq("is_active", true)
          .or("expires_at.is.null,expires_at.gt.now()")
          .order("display_order", { ascending: true })
          .limit(8);

        if (error || !featured?.length) { setLoading(false); return; }

        /* fetch products for each shop (up to 2) */
        const cards: FeaturedShopCard[] = await Promise.all(
          (featured as any[]).map(async (f) => {
            const shop = f.shops;
            const { data: prods, error: prodErr } = await supabase
              .from("products")
              .select("id, name, price, image_url")
              .eq("shop_id", f.shop_id)
              .eq("is_available", true)
              .order("created_at", { ascending: false })
              .limit(2);

            if (prodErr) console.warn("product fetch error for shop", f.shop_id, prodErr.message);

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
              products: (prods ?? []) as ProductPreview[],
            };
          })
        );

        setSlides(cards);
      } catch (err) {
        console.error("FeaturedStoresHeroCarousel fetch error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ── autoplay (runs ONCE through all slides on initial load, then stops
        so the carousel doesn't keep stealing attention while users browse) ── */
  const hasAutoPlayedRef = useRef(false);
  const startAuto = useCallback(() => {
    if (autoRef.current) clearInterval(autoRef.current);
    if (hasAutoPlayedRef.current || slides.length <= 1) return;
    autoRef.current = setInterval(() => {
      setActiveIdx((i) => {
        const next = i + 1;
        if (next >= slides.length) {
          if (autoRef.current) clearInterval(autoRef.current);
          hasAutoPlayedRef.current = true;
          return slides.length - 1;
        }
        return next;
      });
    }, 5000);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length > 1 && !hasAutoPlayedRef.current) startAuto();
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [slides.length, startAuto]);

  /* ── scroll sync ── */
  useEffect(() => {
    const track = trackRef.current;
    if (!track || slides.length === 0) return;
    const slide = track.children[activeIdx] as HTMLElement | undefined;
    if (slide) {
      slide.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
    }
  }, [activeIdx, slides.length]);

  const prev = () => {
    setActiveIdx((i) => (i - 1 + slides.length) % slides.length);
    startAuto();
  };
  const next = () => {
    setActiveIdx((i) => (i + 1) % slides.length);
    startAuto();
  };

  /* ── empty / loading ── */
  if (!loading && slides.length === 0) return null;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        flexShrink: 0,
        maxWidth: 520,
        margin: "0 auto",
      }}
      className="block"
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

      {/* slides track */}
      <div
        ref={trackRef}
        style={{
          display: "flex",
          gap: 0,
          overflowX: "hidden",
          scrollSnapType: "x mandatory",
          borderRadius: 20,
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
                  flexShrink: 0,
                  width: "100%",
                  scrollSnapAlign: "start",
                  transition: "opacity .4s ease",
                  opacity: idx === activeIdx ? 1 : 0.25,
                  pointerEvents: idx === activeIdx ? "auto" : "none",
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
                    {/* Store header */}
                    <div style={{ padding: "16px 18px 12px", display: "flex", alignItems: "center", gap: 12 }}>
                      {/* Logo */}
                      <div
                        style={{
                          width: 56, height: 56, borderRadius: 16, overflow: "hidden",
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
                              fontWeight: 800, fontSize: "1.1rem", color: "#fff",
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

                      {/* Badge */}
                      <div
                        style={{
                          padding: "3px 10px",
                          borderRadius: 9999,
                          background: "hsl(152 100% 26% / 0.25)",
                          border: "1px solid hsl(152 100% 26% / 0.4)",
                          flexShrink: 0,
                        }}
                      >
                        <span style={{ fontSize: "0.6rem", fontWeight: 700, color: "#00d97e", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                          {shop.label}
                        </span>
                      </div>
                    </div>

                    {/* Products */}
                    {shop.products.length > 0 && (
                      <div style={{ padding: "0 14px 14px", display: "flex", gap: 10 }}>
                        {shop.products.map((p) => {
                          const imgUrl = resolveUrl(p.image_url);
                          const hasImg = !!imgUrl && !brokenProductImgs.current.has(p.id);
                          return (
                            <div
                              key={p.id}
                              style={{
                                flex: 1, borderRadius: 14, overflow: "hidden",
                                background: "rgba(0,0,0,0.25)",
                                border: "1px solid rgba(255,255,255,0.08)",
                                display: "flex", flexDirection: "column",
                                minWidth: 0,
                              }}
                            >
                              {/* Product image */}
                              <div style={{ height: 180, overflow: "hidden", flexShrink: 0 }}>
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

                        {/* Placeholder if only 1 product */}
                        {shop.products.length === 1 && (
                          <div
                            style={{
                              flex: 1, borderRadius: 14,
                              background: "rgba(255,255,255,0.03)",
                              border: "1px dashed rgba(255,255,255,0.08)",
                              display: "flex", flexDirection: "column",
                              alignItems: "center", justifyContent: "center",
                              gap: 6, minHeight: 220,
                            }}
                          >
                            <ShoppingBag style={{ width: 22, height: 22, color: "rgba(255,255,255,0.2)" }} />
                            <p style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.25)", margin: 0, textAlign: "center", padding: "0 8px" }}>
                              More products in store
                            </p>
                          </div>
                        )}
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

      {/* Dot indicators */}
      {slides.length > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 12 }}>
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => { setActiveIdx(i); startAuto(); }}
              aria-label={`Go to store ${i + 1}`}
              style={{
                width: i === activeIdx ? 20 : 6,
                height: 6,
                borderRadius: 9999,
                background: i === activeIdx ? "#00d97e" : "rgba(255,255,255,0.25)",
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
