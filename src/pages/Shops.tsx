import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { FirstVisitIntro } from "@/components/FirstVisitIntro";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Input } from "@/components/ui/input";
import {
  Search,
  Store,
  Package,
  Sparkles,
  BadgeCheck,
  ShieldCheck,
  X,
  TrendingUp,
  Grid3X3,
  MapPin,
  SlidersHorizontal,
  ChevronRight,
  Star,
  ShoppingBag,
  Flame,
  ArrowRight,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { TopSellerBanner } from "@/components/TopSellerBanner";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/use-debounce";
import shopService from "@/services/shop.service";
import productService from "@/services/product.service";
import { Shop, Product } from "@/types/api";
import {
  MarketplaceFilters,
  CATEGORIES,
} from "@/components/MarketplaceFilters";
import { ShopCardEnhanced } from "@/components/ShopCardEnhanced";
import { EmptyStateBlog } from "@/components/EmptyStateBlog";
import { supabase } from "@/integrations/supabase/client";
import {
  autoCategorize,
  getCategoryLabel,
  BEAUTY_SUBCATEGORIES,
  normalizeAndCategorize,
  normalizeCategoryValue,
} from "@/utils/autoCategorize";
import { Button } from "@/components/ui/button";
import { PageThemeShell } from "@/components/PageThemeShell";
import { ProductMediaCard } from "@/components/ProductMediaCard";
import heroBackground from "@/assets/hero-background.png";

const VERIFIED_NOTICE_KEY = "steersolo_verified_notice_dismissed";

const normalizeCategoryValue = (category?: string | null) => {
  if (!category) return "";
  const normalized = category.trim().toLowerCase();
  if (normalized.includes("fashion")) return "fashion";
  if (normalized.includes("beauty") || normalized.includes("health"))
    return "beauty-health";
  if (normalized.includes("electronic")) return "electronics";
  if (normalized.includes("food")) return "food-drinks";
  if (normalized.includes("home")) return "home-living";
  if (normalized.includes("art") || normalized.includes("craft"))
    return "art-craft";
  if (normalized.includes("service") || normalized.includes("consult"))
    return "services";
  return normalized.replace(/&/g, "").replace(/\s+/g, "-");
};
const StatChip = ({
  icon: Icon,
  value,
  label,
  color,
  size = "default",
}: {
  icon: React.ElementType;
  value: string | number;
  label: string;
  color: string;
  size?: "default" | "small";
}) => (
  <div
    className={`flex items-center gap-2 rounded-xl border ${
      size === "small" ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm"
    } ${color}`}
  >
    <Icon
      className={`flex-shrink-0 ${size === "small" ? "w-4 h-4" : "w-5 h-5"}`}
    />
    <span className="font-bold tabular-nums">{value}</span>
    <span className="opacity-60 text-xs sm:text-sm hidden sm:inline">
      {label}
    </span>
  </div>
);
/* ─── Verified Seller Notice ─── */
const VerifiedSellerNotice = () => {
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(VERIFIED_NOTICE_KEY) === "true",
  );
  if (dismissed) return null;
  return (
    <div className="bg-emerald-500/5 border-b border-emerald-500/10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-sm">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-foreground/80 text-sm">
            For your safety, look for the <strong>SteerSolo Safe</strong> badge
            when choosing a seller.
          </span>
        </div>
        <button
          onClick={() => {
            setDismissed(true);
            localStorage.setItem(VERIFIED_NOTICE_KEY, "true");
          }}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
};

/* ─── Skeleton Cards ─── */
const ShopCardSkeleton = () => (
  <div className="bg-card border border-border/40 rounded-2xl overflow-hidden">
    <Skeleton className="w-full h-36" />
    <div className="p-5">
      <div className="flex items-start gap-3 -mt-10 mb-4">
        <Skeleton className="w-16 h-16 rounded-2xl ring-4 ring-card flex-shrink-0" />
        <div className="flex-1 pt-8">
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-3 w-full" />
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <Skeleton className="flex-1 h-24 rounded-xl" />
        <Skeleton className="flex-1 h-24 rounded-xl" />
        <Skeleton className="flex-1 h-24 rounded-xl" />
      </div>
    </div>
  </div>
);

const ProductCardSkeleton = () => (
  <div className="bg-card border border-border/40 rounded-2xl overflow-hidden">
    <Skeleton className="w-full aspect-square" />
    <div className="p-4">
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-5 w-1/2" />
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════
   MAIN SHOPS PAGE
═══════════════════════════════════════════════════════════ */
const Shops = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [trendingShops, setTrendingShops] = useState<Shop[]>([]);
  const [businessPlanShopIds, setBusinessPlanShopIds] = useState<Set<string>>(
    new Set(),
  );
  const [productResults, setProductResults] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [shopsPage, setShopsPage] = useState(1);
  const [productsPage, setProductsPage] = useState(1);
  const [hasMoreShops, setHasMoreShops] = useState(true);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  const [loadingMoreShops, setLoadingMoreShops] = useState(false);
  const [loadingMoreProducts, setLoadingMoreProducts] = useState(false);
  const [searchType, setSearchType] = useState<"all" | "shops" | "products">(
    "all",
  );
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSort, setSelectedSort] = useState("newest");
  const [selectedState, setSelectedState] = useState("All Locations");
  const [selectedCity, setSelectedCity] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [shopProducts, setShopProducts] = useState<
    Record<string, { image_url: string; name: string }[]>
  >({});
  const [shopProductCounts, setShopProductCounts] = useState<
    Record<string, number>
  >({});
  const [stats, setStats] = useState({ shops: 0, products: 0 });
  const [searchFocused, setSearchFocused] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const ITEMS_PER_PAGE = 12;

  /* ─── Stats + Business Plans ─── */
  useEffect(() => {
    const fetchStats = async () => {
      const [shopsRes, productsRes] = await Promise.all([
        supabase
          .from("shops")
          .select("id", { count: "exact", head: true })
          .eq("is_active", true),
        supabase
          .from("products")
          .select("id", { count: "exact", head: true })
          .eq("is_available", true)
          .is("delete_at", null),
      ]);
      setStats({
        shops: shopsRes.count || 0,
        products: productsRes.count || 0,
      });
    };

    const fetchBusinessPlanShops = async () => {
      const { data: businessProfiles } = await supabase
        .from("profiles")
        .select("id, subscription_plan_id")
        .not("subscription_plan_id", "is", null)
        .limit(1000);
      if (businessProfiles?.length) {
        const planIds = [
          ...new Set(
            businessProfiles.map(p => p.subscription_plan_id).filter(Boolean),
          ),
        ];
        const { data: plans } = await supabase
          .from("subscription_plans")
          .select("id, slug")
          .in("id", planIds as string[])
          .eq("slug", "business");
        if (plans?.length) {
          const businessPlanIds = new Set(plans.map(p => p.id));
          const ownerIds = businessProfiles
            .filter(
              p =>
                p.subscription_plan_id &&
                businessPlanIds.has(p.subscription_plan_id),
            )
            .map(p => p.id);
          if (ownerIds.length) {
            const { data: bizShops } = await supabase
              .from("shops")
              .select("id")
              .in("owner_id", ownerIds);
            if (bizShops)
              setBusinessPlanShopIds(new Set(bizShops.map(s => s.id)));
          }
        }
      }
    };

    fetchStats();
    fetchBusinessPlanShops();

    // Fetch trending shops (top 5 by orders in the last 30 days, with fallback)
    const fetchTrending = async () => {
      const since = new Date(
        Date.now() - 30 * 24 * 60 * 60 * 1000,
      ).toISOString();
      const { data } = await supabase
        .from("orders")
        .select("shop_id, created_at")
        .not("shop_id", "is", null)
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(600);

      const counts: Record<string, number> = {};
      data?.forEach((order: { shop_id: string | null }) => {
        if (!order.shop_id) return;
        counts[order.shop_id] = (counts[order.shop_id] || 0) + 1;
      });
      const rankedIds = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .map(([id]) => id);

      if (rankedIds.length > 0) {
        const topIds = rankedIds.slice(0, 5);
        const { data: tShops } = await supabase
          .from("shops")
          .select("*")
          .in("id", topIds)
          .eq("is_active", true);

        const ordered = ((tShops || []) as Shop[])
          .sort((a, b) => topIds.indexOf(a.id) - topIds.indexOf(b.id))
          .slice(0, 5);

        if (ordered.length > 0) {
          setTrendingShops(ordered);
          return;
        }
      }

      // Fallback: show first 5 active shops by recency so section is never empty.
      const { data: fallback } = await supabase
        .from("shops")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(5);
      setTrendingShops((fallback || []) as Shop[]);
    };
    fetchTrending();
  }, []);

  const fetchedShopIdsRef = useRef<Set<string>>(new Set());

  /* ─── Shop Product Previews ─── */
  const fetchShopPreviews = useCallback(async (shopIds: string[]) => {
    if (!shopIds.length) return;
    const newIds = shopIds.filter(id => !fetchedShopIdsRef.current.has(id));
    if (!newIds.length) return;
    newIds.forEach(id => fetchedShopIdsRef.current.add(id));

    // Fetch ALL available products/services (including those without images) for accurate counts
    const { data } = await supabase
      .from("products")
      .select("shop_id, image_url, name, type")
      .in("shop_id", newIds)
      .eq("is_available", true)
      .is("delete_at", null)
      .limit(200);

    if (data) {
      const grouped: Record<string, { image_url: string; name: string }[]> = {};
      const counts: Record<string, number> = {};
      data.forEach(p => {
        if (!counts[p.shop_id]) counts[p.shop_id] = 0;
        counts[p.shop_id]++;
        // Only add to image previews if the product has an image
        if (p.image_url) {
          if (!grouped[p.shop_id]) grouped[p.shop_id] = [];
          if (grouped[p.shop_id].length < 3)
            grouped[p.shop_id].push({ image_url: p.image_url, name: p.name });
        }
      });
      setShopProducts(prev => ({ ...prev, ...grouped }));
      setShopProductCounts(prev => ({ ...prev, ...counts }));
    }
  }, []);

  /* ─── Fetch Shops ─── */
  const fetchShops = useCallback(
    async (page = 1, reset = false, searchTerm = "") => {
      try {
        if (reset) {
          setIsLoading(true);
          setHasMoreShops(true);
        } else setLoadingMoreShops(true);
        const response = await shopService.getShops(page, ITEMS_PER_PAGE, {
          verified: showVerifiedOnly || undefined,
          activeOnly: true,
          searchTerm: searchTerm.trim() || undefined,
          category:
            selectedCategory !== "all" && selectedCategory !== "beauty"
              ? selectedCategory
              : undefined,
          city: selectedCity.trim() || undefined,
          state: selectedState !== "All Locations" ? selectedState : undefined,
        });

        if (!response.success) {
          setHasMoreShops(false);
          if (reset) setShops([]);
          return;
        }

        const filtered = response.data || [];

        const totalPages = response.meta?.totalPages || 1;
        const hasMore = page < totalPages;
        setHasMoreShops(hasMore);
        setShops(prev => {
          if (reset) return filtered;
          const ids = new Set(prev.map(s => s.id));
          return [...prev, ...filtered.filter(s => !ids.has(s.id))];
        });
        fetchShopPreviews(filtered.map(s => s.id));
        setShopsPage(page);

        // Auto-fetch if we aggressively filtered out shops and didn't fill the page
        if (filtered.length < 4 && hasMore) {
          setTimeout(() => {
            const sentinel = document.getElementById("shops-sentinel");
            if (
              sentinel &&
              sentinel.getBoundingClientRect().top < window.innerHeight + 500
            ) {
              // Sentinel is visible, fetch next page
              fetchShops(page + 1, false, searchTerm);
            }
          }, 500);
        }
      } catch (e) {
        console.error(e);
        setHasMoreShops(false);
        if (reset) setShops([]);
      } finally {
        setIsLoading(false);
        setLoadingMoreShops(false);
      }
    },
    [
      showVerifiedOnly,
      selectedCategory,
      selectedCity,
      selectedState,
      fetchShopPreviews,
    ],
  );

  /* ─── Category + Sort ─── */
  const shopCategories = useMemo(() => {
    const cats: Record<string, string> = {};
    shops.forEach(shop => {
      cats[shop.id] = normalizeAndCategorize(
        shop.category,
        shop.name || shop.shop_name || "",
        shop.description || "",
      );
    });
    return cats;
  }, [shops]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.values(shopCategories).forEach(cat => {
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [shopCategories]);

  const sortedShops = useMemo(() => {
    let filtered = [...shops];
    if (selectedCategory !== "all") {
      if (selectedCategory === "beauty") {
        filtered = filtered.filter(s =>
          BEAUTY_SUBCATEGORIES.includes(shopCategories[s.id]),
        );
      } else {
        filtered = filtered.filter(
          s => shopCategories[s.id] === selectedCategory,
        );
      }
    }
    switch (selectedSort) {
      case "rating":
        filtered.sort(
          (a, b) => (b.average_rating || 0) - (a.average_rating || 0),
        );
        break;
      case "name":
        filtered.sort((a, b) =>
          (a.name || a.shop_name || "").localeCompare(
            b.name || b.shop_name || "",
          ),
        );
        break;
    }
    filtered.sort(
      (a, b) =>
        (businessPlanShopIds.has(b.id) ? 1 : 0) -
        (businessPlanShopIds.has(a.id) ? 1 : 0),
    );
    return filtered;
  }, [
    shops,
    selectedSort,
    businessPlanShopIds,
    selectedCategory,
    shopCategories,
  ]);

  // Scroll to top of results whenever a filter changes
  useEffect(() => {
    if (!isLoading) {
      const el = document.getElementById("marketplace-results");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [
    selectedCategory,
    selectedSort,
    selectedState,
    selectedCity,
    showVerifiedOnly,
    minPrice,
    maxPrice,
  ]);

  // Filter product results by price range when set
  const priceFilteredProducts = useMemo(() => {
    if (!minPrice && !maxPrice) return productResults;
    const min = minPrice ? parseFloat(minPrice) : 0;
    const max = maxPrice ? parseFloat(maxPrice) : Infinity;
    return productResults.filter(p => {
      const price = p.price || 0;
      return price >= min && price <= max;
    });
  }, [productResults, minPrice, maxPrice]);

  /* ─── Search Products ─── */
  const searchProducts = useCallback(
    async (page = 1, reset = false) => {
      if (!debouncedSearchQuery.trim()) {
        if (reset) setProductResults([]);
        return;
      }
      try {
        if (reset) {
          setIsSearching(true);
          setHasMoreProducts(true);
        } else setLoadingMoreProducts(true);
        const response = await productService.searchProducts({
          query: debouncedSearchQuery,
          page,
          limit: ITEMS_PER_PAGE,
        });
        if (!response.success || !response.data) {
          setHasMoreProducts(false);
          if (reset) setProductResults([]);
          return;
        }
        const results = response.data;
        const totalPages = response.meta?.totalPages || 1;
        setHasMoreProducts(page < totalPages && results.length > 0);
        setProductResults(prev => {
          if (reset) return results;
          const ids = new Set(prev.map(p => p.id));
          return [...prev, ...results.filter(p => !ids.has(p.id))];
        });
        setProductsPage(page);
      } catch (e) {
        console.error(e);
        setHasMoreProducts(false);
        if (reset) setProductResults([]);
      } finally {
        setIsSearching(false);
        setLoadingMoreProducts(false);
      }
    },
    [debouncedSearchQuery],
  );

  /* ─── Main Effect ─── */
  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      setIsSearching(true);
      setSearchType("all");
      setShopsPage(1);
      setProductsPage(1);
      setHasMoreShops(true);
      setHasMoreProducts(true);
      Promise.all([
        fetchShops(1, true, debouncedSearchQuery),
        searchProducts(1, true),
      ]).finally(() => setIsSearching(false));
    } else {
      setProductResults([]);
      setSearchType("all");
      setShopsPage(1);
      setProductsPage(1);
      fetchShops(1, true, "");
    }
  }, [
    debouncedSearchQuery,
    fetchShops,
    searchProducts,
    showVerifiedOnly,
    selectedCategory,
    selectedCity,
    selectedState,
  ]);

  const handleSearchTypeChange = (type: "all" | "shops" | "products") => {
    setSearchType(type);
    setShopsPage(1);
    setProductsPage(1);
    setHasMoreShops(true);
    setHasMoreProducts(true);
    if (!debouncedSearchQuery.trim()) {
      if (type === "shops" || type === "all") fetchShops(1, true);
      if (type === "products") setProductResults([]);
      return;
    }
    if (type === "shops") {
      setProductResults([]);
      fetchShops(1, true, debouncedSearchQuery);
    } else if (type === "products") {
      setShops([]);
      searchProducts(1, true);
    } else {
      setShops([]);
      setProductResults([]);
      Promise.all([
        fetchShops(1, true, debouncedSearchQuery),
        searchProducts(1, true),
      ]);
    }
  };

  const loadMore = useCallback(() => {
    if (searchType === "shops" && hasMoreShops && !loadingMoreShops)
      fetchShops(shopsPage + 1, false, debouncedSearchQuery);
    else if (
      searchType === "products" &&
      hasMoreProducts &&
      !loadingMoreProducts
    )
      searchProducts(productsPage + 1, false);
    else if (searchType === "all") {
      if (hasMoreShops && !loadingMoreShops)
        fetchShops(shopsPage + 1, false, debouncedSearchQuery);
      if (hasMoreProducts && !loadingMoreProducts)
        searchProducts(productsPage + 1, false);
    }
  }, [
    searchType,
    hasMoreShops,
    hasMoreProducts,
    loadingMoreShops,
    loadingMoreProducts,
    shopsPage,
    productsPage,
    fetchShops,
    searchProducts,
    debouncedSearchQuery,
  ]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !isSearching && !isLoading) loadMore();
      },
      { threshold: 0.1, rootMargin: "100px" },
    );
    observerRef.current = observer;
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => {
      observerRef.current?.disconnect();
    };
  }, [loadMore, isSearching, isLoading]);

  const hasSearchQuery = debouncedSearchQuery.trim();
  const showProducts =
    hasSearchQuery && (searchType === "all" || searchType === "products");
  const showShops =
    !hasSearchQuery || searchType === "all" || searchType === "shops";
  const displayedProducts = priceFilteredProducts ?? productResults;

  return (
    <PageThemeShell
      header={<Navbar />}
      footer={<Footer />}
      className="bg-background"
    >
      <FirstVisitIntro
        storageKey="shops"
        title="Welcome to the SteerSolo Marketplace"
        description="A curated directory of verified Nigerian merchants — beauty, fashion, food, gadgets and more — all in one place."
        bullets={[
          "Filter by category, city, and SafeBeauty tier",
          "Beauty shops show NAFDAC verification status",
          "Every order is escrow-protected until you confirm delivery",
        ]}
        ctaLabel="Start browsing"
      />
      <Helmet>
        <title>
          SteerSolo Marketplace Nigeria | Discover Trusted Online Stores
        </title>
        <meta
          name="description"
          content="Browse SteerSolo Marketplace Nigeria to discover trusted online stores for fashion, beauty, food, gadgets, and services."
        />
        <meta
          name="keywords"
          content="marketplace in nigeria, nigeria marketplace, steersolo marketplace, online marketplace nigeria, trusted stores nigeria"
        />
        <link rel="canonical" href="https://steersolo.com/shops" />

        {/* Open Graph Tags */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="SteerSolo" />
        <meta property="og:title" content="SteerSolo Marketplace Nigeria" />
        <meta
          property="og:description"
          content="Discover trusted Nigerian stores on SteerSolo Marketplace."
        />
        <meta property="og:url" content="https://steersolo.com/shops" />
        <meta
          property="og:image"
          content="https://steersolo.com/steersolo-logo.png"
        />
        <meta
          property="og:image:secure_url"
          content="https://steersolo.com/steersolo-logo.png"
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:alt" content="SteerSolo Official Logo" />

        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@SteerifyGroup" />
        <meta name="twitter:creator" content="@SteerifyGroup" />
        <meta name="twitter:title" content="SteerSolo Marketplace Nigeria" />
        <meta
          name="twitter:description"
          content="Discover trusted Nigerian stores on SteerSolo Marketplace."
        />
        <meta
          name="twitter:image"
          content="https://steersolo.com/steersolo-logo.png"
        />
        <meta name="twitter:image:alt" content="SteerSolo Official Logo" />
      </Helmet>
      <VerifiedSellerNotice />

      {/* ══════════ HERO ══════════ */}
      <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBackground})` }}
        />
        <div className="absolute inset-0 bg-background/80" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 border border-primary/10 rounded-full text-xs font-bold uppercase tracking-wider text-primary mb-6">
              <Sparkles className="w-4 h-4" />
              Nigeria's Online Shopping Mall
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-primary mb-4 leading-tight">
              Shop trusted stores with a
              <span className="block text-primary mt-1">
                mobile-first marketplace
              </span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto font-medium">
              Browse verified Nigerian businesses, compare products quickly, and
              move from discovery to checkout without the clutter.
            </p>
          </div>

          <div className="max-w-2xl mx-auto mb-12">
            <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap mb-8">
              <StatChip
                icon={Store}
                value={stats.shops.toLocaleString()}
                label="Shops"
                color="text-foreground border-border/40 bg-card"
                size="small"
              />
              <StatChip
                icon={Package}
                value={stats.products.toLocaleString()}
                label="Products"
                color="text-foreground border-border/40 bg-card"
                size="small"
              />
              <StatChip
                icon={BadgeCheck}
                value="Verified"
                label="Sellers"
                color="text-emerald-700 dark:text-emerald-300 border-emerald-500/15 bg-emerald-500/5"
                size="small"
              />
            </div>

            <div className="relative group">
              <div
                className={`
                  relative flex items-center bg-card border rounded-2xl shadow-md transition-all duration-300
                  ${searchFocused ? "border-accent/30 shadow-accent/10 shadow-lg ring-4 ring-accent/5 scale-[1.01]" : "border-border/50 hover:border-border/70"}
                `}
              >
                <Search
                  className={`absolute left-5 w-5 h-5 transition-colors ${searchFocused ? "text-accent" : "text-muted-foreground"}`}
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search shops, products, services…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className="w-full bg-transparent pl-14 pr-14 h-14 sm:h-16 text-sm sm:text-base focus:outline-none placeholder:text-muted-foreground/50 font-medium rounded-2xl"
                />
                {isSearching || isLoading ? (
                  <div className="absolute right-5">
                    <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : searchQuery ? (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 w-9 h-9 flex items-center justify-center rounded-full bg-muted hover:bg-muted-foreground/10 transition-colors"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ FILTERS ══════════ */}
      <div className="container mx-auto px-4 mb-8">
        <MarketplaceFilters
          selectedCategory={selectedCategory}
          onCategoryChange={c => {
            setSelectedCategory(c);
            setShopsPage(1);
          }}
          selectedSort={selectedSort}
          onSortChange={setSelectedSort}
          selectedState={selectedState}
          onStateChange={s => {
            setSelectedState(s);
            setShopsPage(1);
          }}
          selectedCity={selectedCity}
          onCityChange={city => {
            setSelectedCity(city);
            setShopsPage(1);
          }}
          showVerifiedOnly={showVerifiedOnly}
          onVerifiedChange={v => {
            setShowVerifiedOnly(v);
            setShopsPage(1);
          }}
          categoryCounts={categoryCounts}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onMinPriceChange={setMinPrice}
          onMaxPriceChange={setMaxPrice}
        />
      </div>

      {/* ══════════ TOP SELLER BANNER ══════════ */}
      <div className="container mx-auto px-4 mb-8">
        <TopSellerBanner />
      </div>

      {/* ══════════ TRENDING STORES ══════════ */}
      {trendingShops.length > 0 && !debouncedSearchQuery.trim() && (
        <div className="container mx-auto px-4 mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center">
              <Flame className="w-4 h-4 text-accent" />
            </div>
            <h2 className="font-display text-lg sm:text-xl font-bold">
              Trending Stores
            </h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
            {trendingShops.slice(0, 5).map(shop => (
              <Link
                key={shop.id}
                to={`/shop/${shop.shop_slug || shop.id}`}
                className="flex-shrink-0 w-36 sm:w-48 bg-card border border-border/50 rounded-2xl p-3 hover:border-accent/30 hover:shadow-lg transition-all group"
              >
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-muted mb-2">
                  {shop.logo_url ? (
                    <img
                      src={shop.logo_url}
                      alt={shop.shop_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10">
                      <Store className="w-5 h-5 text-primary" />
                    </div>
                  )}
                </div>
                <p className="text-sm font-semibold truncate group-hover:text-accent transition-colors mb-0.5">
                  {shop.shop_name || shop.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {[shop.city, shop.state, shop.country]
                    .filter(Boolean)
                    .join(", ") || "Nigeria"}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ══════════ MAIN CONTENT ══════════ */}
      <main
        id="marketplace-results"
        className="flex-1 container mx-auto px-4 pb-24"
      >
        <div className="max-w-7xl mx-auto">
          {/* ── Search Type Tabs ── */}
          {hasSearchQuery && (
            <div className="flex gap-2 mb-8 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
              {(["all", "shops", "products"] as const).map(type => (
                <button
                  key={type}
                  onClick={() => handleSearchTypeChange(type)}
                  className={`
                    px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0
                    ${
                      searchType === type
                        ? "bg-accent text-white shadow-md"
                        : "bg-white/90 dark:bg-gray-900/90 border border-border/50 text-primary hover:border-accent/30 hover:text-accent"
                    }
                  `}
                >
                  {type === "all"
                    ? `All (${shops.length + displayedProducts.length})`
                    : type === "shops"
                      ? `Shops (${shops.length})`
                      : `Products (${displayedProducts.length})`}
                </button>
              ))}
            </div>
          )}

          {/* ── Product Results ── */}
          {showProducts && displayedProducts.length > 0 && (
            <div className="mb-12 animate-fade-up">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Package className="w-4 h-4 text-accent" />
                  </div>
                  <h2 className="font-display text-lg sm:text-xl font-bold">
                    Products
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      ({productResults.length} results)
                    </span>
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                {displayedProducts.map((product, index) => {
                  if (!product.shop_slug) {
                    console.warn(
                      "Product search result is missing shop_slug",
                      product.id,
                    );
                    return null;
                  }

                  return (
                    <Link
                      key={`${product.id}-${index}`}
                      to={`/shop/${product.shop_slug}/product/${product.id}`}
                    >
                      <div className="group bg-card border border-border/40 hover:border-border/70 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex flex-col">
                        {/* Image */}
                        <ProductMediaCard
                          imageUrl={
                            product.image_url || product.images?.[0]?.url
                          }
                          videoUrl={product.video_url}
                          alt={product.name}
                          className="aspect-square min-h-[150px] bg-muted sm:min-h-0"
                        >
                          <div className="absolute top-3 right-3">
                            <div
                              className={`
                              rounded-lg px-3 py-1 text-xs font-semibold shadow-sm ring-1 ring-white/30 backdrop-blur-sm
                              ${product.is_available ? "bg-emerald-500/95 text-white" : "bg-red-500/95 text-white"}
                            `}
                            >
                              {product.is_available ? "In Stock" : "Out"}
                            </div>
                          </div>
                        </ProductMediaCard>
                        {/* Info */}
                        <div className="p-4 flex flex-col flex-1">
                          <h3 className="text-sm font-semibold line-clamp-2 group-hover:text-accent transition-colors mb-2 leading-snug">
                            {product.name}
                          </h3>
                          <div className="mt-auto flex items-center justify-between">
                            <span className="text-base font-bold text-accent-forest tabular-nums">
                              ₦{product.price?.toLocaleString() || "0"}
                            </span>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Store className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">View</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {loadingMoreProducts && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Shops Section ── */}
          {showShops &&
            !(
              hasSearchQuery &&
              searchType === "all" &&
              sortedShops.length === 0 &&
              productResults.length > 0
            ) && (
              <div>
                {/* Section Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Store className="w-4 h-4 text-primary" />
                    </div>
                    <h2 className="font-display text-lg sm:text-xl font-bold">
                      {hasSearchQuery ? "Shop Results" : "All Shops"}
                      <span className="ml-2 text-sm font-normal text-muted-foreground">
                        {hasSearchQuery
                          ? `(${shops.length} found)`
                          : `(${stats.shops} total)`}
                      </span>
                    </h2>
                  </div>
                  {selectedState !== "All Locations" && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted rounded-xl px-3 py-2">
                      <MapPin className="w-4 h-4" />
                      {selectedState}
                      <button
                        onClick={() => setSelectedState("All Locations")}
                        className="ml-1 hover:text-destructive transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Grid */}
                {(isLoading || isSearching) && !shops.length ? (
                  <div className="grid grid-cols-1 min-[380px]:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <ShopCardSkeleton key={i} />
                    ))}
                  </div>
                ) : sortedShops.length === 0 ? (
                  // Show category-specific blog post when viewing a category with no shops
                  selectedCategory !== "all" ? (
                    <EmptyStateBlog category={selectedCategory} />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                      <div className="w-24 h-24 rounded-3xl bg-muted flex items-center justify-center mb-6 shadow-inner">
                        <Store className="w-10 h-10 text-muted-foreground" />
                      </div>
                      <h3 className="font-display text-xl font-semibold mb-2">
                        {hasSearchQuery
                          ? "No shops found"
                          : selectedState !== "All Locations"
                            ? `No shops in ${selectedState}`
                            : "No active shops"}
                      </h3>
                      <p className="text-muted-foreground text-sm max-w-xs mb-6">
                        {hasSearchQuery
                          ? `No shops found for "${debouncedSearchQuery}". Try different keywords.`
                          : "Try adjusting your filters or check back later."}
                      </p>
                      {(hasSearchQuery ||
                        selectedState !== "All Locations") && (
                        <Button
                          variant="outline"
                          className="rounded-xl"
                          onClick={() => {
                            setSearchQuery("");
                            setSelectedState("All Locations");
                          }}
                        >
                          Clear Filters
                        </Button>
                      )}
                    </div>
                  )
                ) : (
                  <>
                    <div className="grid grid-cols-1 min-[380px]:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                      {sortedShops.map((shop, index) => (
                        <ShopCardEnhanced
                          key={`${shop.id}-${index}`}
                          shop={shop}
                          productPreviews={shopProducts[shop.id] || []}
                          productCount={shopProductCounts[shop.id] || 0}
                          index={index}
                          isBusinessPlan={businessPlanShopIds.has(shop.id)}
                          displayCategory={getCategoryLabel(
                            shopCategories[shop.id] || "other",
                          )}
                        />
                      ))}
                    </div>

                    {loadingMoreShops && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <ShopCardSkeleton key={i} />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

          {/* ── Searching Indicator ── */}
          {isSearching && !isLoading && (
            <div className="flex justify-center py-12">
              <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-card border border-border/50">
                <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-muted-foreground">
                  Searching for <strong>"{debouncedSearchQuery}"</strong>…
                </span>
              </div>
            </div>
          )}

          {/* ── Infinite Scroll Sentinel ── */}
          {(hasMoreShops || hasMoreProducts) && !isSearching && (
            <div
              id="shops-sentinel"
              ref={sentinelRef}
              className="h-12 mt-10 flex items-center justify-center"
            >
              {(loadingMoreShops || loadingMoreProducts) && (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                  Loading more…
                </div>
              )}
            </div>
          )}

          {/* ── End of Results ── */}
          {!hasMoreShops &&
            !hasMoreProducts &&
            (shops.length > 0 || productResults.length > 0) && (
              <div className="text-center py-16 mt-8 border-t border-border/40">
                <p className="text-muted-foreground text-sm">
                  You've seen all {debouncedSearchQuery ? "results" : "shops"} —
                  that's everything! 🎉
                </p>
              </div>
            )}

          {/* ── No Results ── */}
          {!isLoading &&
            !isSearching &&
            shops.length === 0 &&
            productResults.length === 0 &&
            hasSearchQuery && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-24 h-24 rounded-3xl bg-muted flex items-center justify-center mb-6 shadow-inner">
                  <Search className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">
                  No results found
                </h3>
                <p className="text-muted-foreground text-sm max-w-xs mb-6">
                  Nothing matched "<strong>{debouncedSearchQuery}</strong>". Try
                  different keywords.
                </p>
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => setSearchQuery("")}
                >
                  Clear Search
                </Button>
              </div>
            )}
        </div>
      </main>
    </PageThemeShell>
  );
};

export default Shops;
