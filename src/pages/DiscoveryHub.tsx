import { useEffect, useState, useMemo } from "react";
import { FirstVisitIntro } from "@/components/FirstVisitIntro";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Store,
  MapPin,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Filter,
  ShoppingBag,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import shopService from "@/services/shop.service";
import { Shop } from "@/types/api";
import { ShopCardEnhanced } from "@/components/ShopCardEnhanced";
import { autoCategorize, getCategoryLabel } from "@/utils/autoCategorize";
import { supabase } from "@/integrations/supabase/client";

const DiscoveryHub = () => {
  const { hubSlug } = useParams();
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [shopProducts, setShopProducts] = useState<Record<string, any[]>>({});

  // Parse hubSlug: e.g., "fashion-in-lagos"
  const { categorySlug, city } = useMemo(() => {
    if (!hubSlug) return { categorySlug: "all", city: "Nigeria" };
    const parts = hubSlug.split("-in-");
    if (parts.length === 2) {
      return {
        categorySlug: parts[0],
        city: parts[1]
          .split("-")
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" "),
      };
    }
    return { categorySlug: hubSlug, city: "Nigeria" };
  }, [hubSlug]);

  const categoryLabel = getCategoryLabel(categorySlug);

  useEffect(() => {
    const fetchHubData = async () => {
      setIsLoading(true);
      try {
        // Fetch all active shops
        const response = await shopService.getShops(1, 50, {
          activeOnly: true,
        });
        if (response.success && response.data) {
          let filtered = response.data;

          // Filter by category (using autoCategorize for now, which is robust)
          if (categorySlug !== "all") {
            filtered = filtered.filter(s => {
              const cat = autoCategorize(
                s.name || s.shop_name || "",
                s.description || "",
              );
              return cat === categorySlug;
            });
          }

          // Filter by city/state
          if (city !== "Nigeria") {
            filtered = filtered.filter(
              s =>
                s.state?.toLowerCase().includes(city.toLowerCase()) ||
                s.city?.toLowerCase().includes(city.toLowerCase()),
            );
          }

          setShops(filtered);

          // Fetch product previews for these shops
          if (filtered.length > 0) {
            const shopIds = filtered.map(s => s.id);
            const { data: productData } = await supabase
              .from("products")
              .select("shop_id, image_url, name")
              .in("shop_id", shopIds)
              .eq("is_available", true)
              .is("delete_at", null)
              .not("image_url", "is", null)
              .limit(100);

            if (productData) {
              const grouped: Record<string, any[]> = {};
              productData.forEach(p => {
                if (!grouped[p.shop_id]) grouped[p.shop_id] = [];
                if (grouped[p.shop_id].length < 3) grouped[p.shop_id].push(p);
              });
              setShopProducts(grouped);
            }
          }
        }
      } catch (error) {
        console.error("Discovery Hub Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHubData();
  }, [categorySlug, city]);

  const title = `Top ${categoryLabel} Shops in ${city} | SteerSolo Discover`;
  const description = `Discover and shop from the best ${categoryLabel} businesses in ${city}. Verified local merchants with fast delivery.`;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <FirstVisitIntro
        storageKey="discovery-hub"
        title="Discovery Hub"
        description="See what's trending across Nigeria — top shops, hot products, and merchants gaining momentum right now."
        bullets={[
          "Trending shops update based on real orders and reviews",
          "Featured stores rotate so new merchants get a fair shot",
          "Filter by city to discover sellers near you",
        ]}
        ctaLabel="Explore the hub"
      />
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta
          name="keywords"
          content={`${categorySlug} ${city}, buy ${categoryLabel} ${city}, best shops ${city}, steersolo discover, ${city} marketplace`}
        />
        <link
          rel="canonical"
          href={`https://steersolo.com/discover/${hubSlug}`}
        />
      </Helmet>

      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        {/* Hub Hero */}
        <section className="mb-10">
          <div className="container mx-auto px-4">
            <div className="rounded-2xl sm:rounded-[2rem] border border-border/50 bg-card/90 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.06)] p-4 sm:p-5 lg:p-8">
              <nav className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground mb-4 overflow-x-auto whitespace-nowrap">
                <Link to="/" className="hover:text-primary transition-colors">
                  Home
                </Link>
                <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                <Link
                  to="/shops"
                  className="hover:text-primary transition-colors"
                >
                  Marketplace
                </Link>
                <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                <span className="text-foreground font-medium">
                  {categoryLabel} in {city}
                </span>
              </nav>

              <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-primary/10 text-primary rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-3">
                    <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    Curated Collection
                  </div>
                  <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold tracking-tight mb-3 sm:mb-4 leading-[1.05]">
                    Discover{" "}
                    <span className="text-primary">{categoryLabel}</span> stores
                    in <span className="text-accent">{city}</span>
                  </h1>
                  <p className="text-muted-foreground text-sm sm:text-base md:text-lg leading-relaxed">
                    A cleaner category browsing experience with trusted Nigerian
                    merchants, product previews, and a consistent mobile-first
                    layout.
                  </p>

                  <div className="mt-4 sm:mt-6 flex flex-wrap items-center gap-2.5">
                    <div className="flex items-center gap-2 rounded-xl sm:rounded-2xl border border-border/50 bg-background/70 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm">
                      <Store className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                      <span className="font-semibold">{shops.length}</span>
                      <span className="text-muted-foreground">stores</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl sm:rounded-2xl border border-border/50 bg-background/70 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm">
                      <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                      <span className="font-semibold">{city}</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl sm:rounded-2xl border border-border/50 bg-background/70 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm">
                      <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                      <span className="font-semibold">{categoryLabel}</span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-2.5 sm:gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  <div className="rounded-2xl sm:rounded-3xl border border-border/50 bg-background/75 p-4 sm:p-5">
                    <p className="text-xs sm:text-sm font-bold text-foreground">
                      Are you a merchant in {city}?
                    </p>
                    <p className="mt-1 text-[10px] sm:text-xs text-muted-foreground">
                      Join this category hub and show up with the same polished
                      storefront experience.
                    </p>
                    <Link
                      to="/auth/entrepreneur"
                      className="block mt-3 sm:mt-4"
                    >
                      <Button className="w-full rounded-xl sm:rounded-2xl bg-gradient-to-r from-primary to-accent hover:opacity-90 text-xs sm:text-sm">
                        Register Your Shop{" "}
                        <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1.5 sm:ml-2" />
                      </Button>
                    </Link>
                  </div>

                  <div className="rounded-2xl sm:rounded-3xl border border-border/50 bg-background/75 p-4 sm:p-5">
                    <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                      What to expect
                    </p>
                    <div className="mt-2.5 sm:mt-3 space-y-2.5 sm:space-y-3 text-xs sm:text-sm">
                      <div className="flex items-start gap-2">
                        <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent mt-0.5" />
                        <span>
                          Preview top shops and compare styles quickly.
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Store className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary mt-0.5" />
                        <span>
                          Consistent card layout across category and storefront
                          pages.
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 mt-0.5" />
                        <span>
                          Responsive browsing across mobile, tablet, and
                          desktop.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <Store className="w-4 h-4 text-primary" />
              </div>
              <h2 className="text-xl font-bold">Recommended Merchants</h2>
            </div>

            <div className="hidden sm:flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-muted/50 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                {city}
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-muted/50 text-xs text-muted-foreground">
                <Filter className="w-3 h-3" />
                {categoryLabel}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div
                  key={i}
                  className="bg-card border border-border/60 rounded-2xl overflow-hidden animate-pulse"
                >
                  <div className="h-32 bg-muted" />
                  <div className="p-4 pt-8">
                    <div className="h-4 w-3/4 bg-muted rounded mb-2" />
                    <div className="h-3 w-1/2 bg-muted rounded mb-4" />
                    <div className="grid grid-cols-3 gap-2">
                      <div className="aspect-square bg-muted rounded-lg" />
                      <div className="aspect-square bg-muted rounded-lg" />
                      <div className="aspect-square bg-muted rounded-lg" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : shops.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {shops.map((shop, index) => (
                <ShopCardEnhanced
                  key={shop.id}
                  shop={shop}
                  productPreviews={shopProducts[shop.id] || []}
                  productCount={shopProducts[shop.id]?.length || 0}
                  index={index}
                  displayCategory={categoryLabel}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-card border border-dashed rounded-3xl">
              <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mb-6">
                <ShoppingBag className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-2">
                No {categoryLabel} shops yet in {city}
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-8">
                We're currently expanding our network in {city}. Be the first{" "}
                {categoryLabel} merchant to join and claim this spot!
              </p>
              <Link to="/auth/entrepreneur">
                <Button size="lg" className="rounded-2xl px-8 bg-primary">
                  Start Selling in {city}
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* SEO Discovery Links */}
        <section className="container mx-auto px-4 mt-20 pt-10 border-t border-border/40">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-6">
            Other Popular Hubs
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              to="/discover/fashion-in-lagos"
              className="text-sm hover:text-primary transition-colors"
            >
              Fashion in Lagos
            </Link>
            <Link
              to="/discover/food-drinks-in-abuja"
              className="text-sm hover:text-primary transition-colors"
            >
              Food in Abuja
            </Link>
            <Link
              to="/discover/electronics-in-ph"
              className="text-sm hover:text-primary transition-colors"
            >
              Tech in Port Harcourt
            </Link>
            <Link
              to="/discover/skincare-in-lagos"
              className="text-sm hover:text-primary transition-colors"
            >
              Skincare in Lagos
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default DiscoveryHub;
