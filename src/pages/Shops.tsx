import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Input } from "@/components/ui/input";
import {
  Search, Store, Package, Sparkles, BadgeCheck, ShieldCheck,
  X, TrendingUp, Grid3X3, MapPin, SlidersHorizontal, ChevronRight,
  Star, ShoppingBag, Flame, ArrowRight
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
import { ExploreFilters } from "@/components/ExploreFilters";
import { ShopCardEnhanced } from "@/components/ShopCardEnhanced";
import { supabase } from "@/integrations/supabase/client";
import { autoCategorize, getCategoryLabel, BEAUTY_SUBCATEGORIES } from "@/utils/autoCategorize";
import { Button } from "@/components/ui/button";
import { useFeaturePhases } from "@/hooks/useFeaturePhases";
import { PageThemeShell } from "@/components/PageThemeShell";

const VERIFIED_NOTICE_KEY = "steersolo_verified_notice_dismissed";
const StatChip = ({
  icon: Icon,
  value,
  label,
  color,
}: {
  icon: React.ElementType;
  value: string | number;
  label: string;
  color: string;
}) => (
  <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm ${color}`}>
    <Icon className="w-3.5 h-3.5 flex-shrink-0" />
    <span className="font-bold tabular-nums">{value}</span>
    <span className="opacity-70 text-xs hidden sm:inline">{label}</span>
  </div>
);
/* ─── Verified Seller Notice ─── */
const VerifiedSellerNotice = () => {
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(VERIFIED_NOTICE_KEY) === "true"
  );
  if (dismissed) return null;
  return (
    <div className="bg-emerald-500/8 border-b border-emerald-500/15">
      <div className="container mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span className="text-foreground/80 text-xs sm:text-sm">
            For your safety, look for the{" "}
            <BadgeCheck className="w-3.5 h-3.5 inline text-emerald-500" />{" "}
            <strong>Verified</strong> badge when choosing a seller.
          </span>
        </div>
        <button
          onClick={() => {
            setDismissed(true);
            localStorage.setItem(VERIFIED_NOTICE_KEY, "true");
          }}
          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-muted transition-colors flex-shrink-0"
        >
          <X className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
};

/* ─── Skeleton Cards ─── */
const ShopCardSkeleton = () => (
  <div className="bg-card border border-border/60 rounded-2xl overflow-hidden">
    <Skeleton className="w-full h-32" />
    <div className="p-4">
      <div className="flex items-start gap-3 -mt-8 mb-3">
        <Skeleton className="w-14 h-14 rounded-xl ring-4 ring-card flex-shrink-0" />
        <div className="flex-1 pt-6">
          <Skeleton className="h-4 w-3/4 mb-1.5" />
          <Skeleton className="h-3 w-full" />
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <Skeleton className="flex-1 h-20 rounded-xl" />
        <Skeleton className="flex-1 h-20 rounded-xl" />
        <Skeleton className="flex-1 h-20 rounded-xl" />
      </div>
    </div>
  </div>
);

const ProductCardSkeleton = () => (
  <div className="bg-card border border-border/60 rounded-2xl overflow-hidden">
    <Skeleton className="w-full aspect-square" />
    <div className="p-3">
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-5 w-1/2" />
    </div>
  </div>
);


/* ══════════════════════════════════════════════════════
   MAIN SHOPS PAGE
══════════════════════════════════════════════════════ */
const Shops = () => {
  const { isPhaseEnabled } = useFeaturePhases();
  const [shops, setShops] = useState<Shop[]>([]);
  const [trendingShops, setTrendingShops] = useState<Shop[]>([]);
  const [businessPlanShopIds, setBusinessPlanShopIds] = useState<Set<string>>(new Set());
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
  const [searchType, setSearchType] = useState<'all' | 'shops' | 'products'>('all');
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSort, setSelectedSort] = useState('newest');
  const [selectedState, setSelectedState] = useState('All Locations');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [shopProducts, setShopProducts] = useState<Record<string, { image_url: string; name: string }[]>>({});
  const [shopProductCounts, setShopProductCounts] = useState<Record<string, number>>({});
  const [stats, setStats] = useState({ shops: 0, products: 0 });
  const [searchFocused, setSearchFocused] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const ITEMS_PER_PAGE = 12;

  /* ─── Stats + Business Plans ─── */
  useEffect(() => {
    const fetchStats = async () => {
      const [shopsRes, productsRes] = await Promise.all([
        supabase.from("shops").select("id", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("products").select("id", { count: "exact", head: true }).eq("is_available", true),
      ]);
      setStats({ shops: shopsRes.count || 0, products: productsRes.count || 0 });
    };

    const fetchBusinessPlanShops = async () => {
      const { data: businessProfiles } = await supabase
        .from('profiles').select('id, subscription_plan_id').not('subscription_plan_id', 'is', null);
      if (businessProfiles?.length) {
        const planIds = [...new Set(businessProfiles.map(p => p.subscription_plan_id).filter(Boolean))];
        const { data: plans } = await supabase
          .from('subscription_plans').select('id, slug').in('id', planIds as string[]).eq('slug', 'business');
        if (plans?.length) {
          const businessPlanIds = new Set(plans.map(p => p.id));
          const ownerIds = businessProfiles.filter(p => p.subscription_plan_id && businessPlanIds.has(p.subscription_plan_id)).map(p => p.id);
          if (ownerIds.length) {
            const { data: bizShops } = await supabase.from('shops').select('id').in('owner_id', ownerIds);
            if (bizShops) setBusinessPlanShopIds(new Set(bizShops.map(s => s.id)));
          }
        }
      }
    };

    fetchStats();
    fetchBusinessPlanShops();

    // Fetch trending shops (most recent orders)
    const fetchTrending = async () => {
      const { data } = await supabase
        .from('orders')
        .select('shop_id')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .limit(200);
      if (data?.length) {
        const counts: Record<string, number> = {};
        data.forEach((o) => { counts[o.shop_id] = (counts[o.shop_id] || 0) + 1; });
        const topIds = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id]) => id);
        if (topIds.length) {
          const { data: tShops } = await supabase.from('shops').select('*').in('id', topIds).eq('is_active', true);
          if (tShops) setTrendingShops(tShops as any);
        }
      }
    };
    fetchTrending();
  }, []);

  /* ─── Shop Product Previews ─── */
  const fetchShopPreviews = useCallback(async (shopIds: string[]) => {
    if (!shopIds.length) return;
    const newIds = shopIds.filter(id => !shopProducts[id]);
    if (!newIds.length) return;
    const { data } = await supabase
      .from('products').select('shop_id, image_url, name')
      .in('shop_id', newIds).eq('is_available', true).not('image_url', 'is', null).limit(100);
    if (data) {
      const grouped: Record<string, { image_url: string; name: string }[]> = {};
      const counts: Record<string, number> = {};
      data.forEach(p => {
        if (!grouped[p.shop_id]) grouped[p.shop_id] = [];
        if (!counts[p.shop_id]) counts[p.shop_id] = 0;
        counts[p.shop_id]++;
        if (grouped[p.shop_id].length < 3 && p.image_url) grouped[p.shop_id].push({ image_url: p.image_url, name: p.name });
      });
      setShopProducts(prev => ({ ...prev, ...grouped }));
      setShopProductCounts(prev => ({ ...prev, ...counts }));
    }
  }, [shopProducts]);

  /* ─── Fetch Shops ─── */
  const fetchShops = useCallback(async (page = 1, reset = false, searchTerm = '') => {
    try {
      if (reset) { setIsLoading(true); setHasMoreShops(true); } else setLoadingMoreShops(true);
      const response = await shopService.getShops(page, ITEMS_PER_PAGE, { verified: showVerifiedOnly || undefined, activeOnly: true });
      if (!response.success) { setHasMoreShops(false); if (reset) setShops([]); return; }
      let filtered = response.data || [];
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        filtered = filtered.filter(s => {
          const inferredCategory = getCategoryLabel(autoCategorize(s.name || s.shop_name || '', s.description || '')).toLowerCase();
          return (
            s.name?.toLowerCase().includes(q) ||
            s.shop_name?.toLowerCase().includes(q) ||
            s.description?.toLowerCase().includes(q) ||
            s.shop_slug?.toLowerCase().includes(q) ||
            s.state?.toLowerCase().includes(q) ||
            s.country?.toLowerCase().includes(q) ||
            inferredCategory.includes(q)
          );
        });
      }
      if (selectedState !== 'All Locations') filtered = filtered.filter(s => s.state === selectedState);
      const total = response.meta?.total || 0;
      setHasMoreShops(filtered.length === ITEMS_PER_PAGE && page < Math.ceil(total / ITEMS_PER_PAGE));
      setShops(prev => {
        if (reset) return filtered;
        const ids = new Set(prev.map(s => s.id));
        return [...prev, ...filtered.filter(s => !ids.has(s.id))];
      });
      fetchShopPreviews(filtered.map(s => s.id));
      setShopsPage(page);
    } catch (e) {
      console.error(e); setHasMoreShops(false); if (reset) setShops([]);
    } finally { setIsLoading(false); setLoadingMoreShops(false); }
  }, [showVerifiedOnly, selectedState, fetchShopPreviews]);

  /* ─── Category + Sort ─── */
  const shopCategories = useMemo(() => {
    const cats: Record<string, string> = {};
    shops.forEach(shop => { cats[shop.id] = autoCategorize(shop.name || shop.shop_name || '', shop.description || ''); });
    return cats;
  }, [shops]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.values(shopCategories).forEach(cat => { counts[cat] = (counts[cat] || 0) + 1; });
    return counts;
  }, [shopCategories]);

  const sortedShops = useMemo(() => {
    let filtered = [...shops];
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'beauty') {
        filtered = filtered.filter(s => BEAUTY_SUBCATEGORIES.includes(shopCategories[s.id]));
      } else {
        filtered = filtered.filter(s => shopCategories[s.id] === selectedCategory);
      }
    }
    switch (selectedSort) {
      case 'rating': filtered.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0)); break;
      case 'name': filtered.sort((a, b) => (a.name || a.shop_name || '').localeCompare(b.name || b.shop_name || '')); break;
    }
    filtered.sort((a, b) => (businessPlanShopIds.has(b.id) ? 1 : 0) - (businessPlanShopIds.has(a.id) ? 1 : 0));
    return filtered;
  }, [shops, selectedSort, businessPlanShopIds, selectedCategory, shopCategories]);

  /* ─── Search Products ─── */
  const searchProducts = useCallback(async (page = 1, reset = false) => {
    if (!debouncedSearchQuery.trim()) { if (reset) setProductResults([]); return; }
    try {
      if (reset) { setIsSearching(true); setHasMoreProducts(true); } else setLoadingMoreProducts(true);
      const response = await productService.searchProducts({ query: debouncedSearchQuery, page, limit: ITEMS_PER_PAGE });
      if (!response.success || !response.data) { setHasMoreProducts(false); if (reset) setProductResults([]); return; }
      const results = response.data;
      setHasMoreProducts(results.length === ITEMS_PER_PAGE && page < (response.meta?.totalPages || 1));
      setProductResults(prev => {
        if (reset) return results;
        const ids = new Set(prev.map(p => p.id));
        return [...prev, ...results.filter(p => !ids.has(p.id))];
      });
      setProductsPage(page);
    } catch (e) { console.error(e); setHasMoreProducts(false); if (reset) setProductResults([]); }
    finally { setIsSearching(false); setLoadingMoreProducts(false); }
  }, [debouncedSearchQuery]);

  /* ─── Main Effect ─── */
  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      setIsSearching(true); setSearchType('all');
      setShopsPage(1); setProductsPage(1); setHasMoreShops(true); setHasMoreProducts(true);
      Promise.all([fetchShops(1, true, debouncedSearchQuery), searchProducts(1, true)]).finally(() => setIsSearching(false));
    } else {
      setProductResults([]); setSearchType('all'); setShopsPage(1); setProductsPage(1);
      fetchShops(1, true, '');
    }
  }, [debouncedSearchQuery, fetchShops, searchProducts, showVerifiedOnly, selectedState]);

  const handleSearchTypeChange = (type: 'all' | 'shops' | 'products') => {
    setSearchType(type);
    setShopsPage(1); setProductsPage(1); setHasMoreShops(true); setHasMoreProducts(true);
    if (!debouncedSearchQuery.trim()) { if (type === 'shops' || type === 'all') fetchShops(1, true); if (type === 'products') setProductResults([]); return; }
    if (type === 'shops') { setProductResults([]); fetchShops(1, true, debouncedSearchQuery); }
    else if (type === 'products') { setShops([]); searchProducts(1, true); }
    else { setShops([]); setProductResults([]); Promise.all([fetchShops(1, true, debouncedSearchQuery), searchProducts(1, true)]); }
  };

  const loadMore = useCallback(() => {
    if (searchType === 'shops' && hasMoreShops && !loadingMoreShops) fetchShops(shopsPage + 1, false, debouncedSearchQuery);
    else if (searchType === 'products' && hasMoreProducts && !loadingMoreProducts) searchProducts(productsPage + 1, false);
    else if (searchType === 'all') {
      if (hasMoreShops && !loadingMoreShops) fetchShops(shopsPage + 1, false, debouncedSearchQuery);
      if (hasMoreProducts && !loadingMoreProducts) searchProducts(productsPage + 1, false);
    }
  }, [searchType, hasMoreShops, hasMoreProducts, loadingMoreShops, loadingMoreProducts, shopsPage, productsPage, fetchShops, searchProducts, debouncedSearchQuery]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting && !isSearching && !isLoading) loadMore(); },
      { threshold: 0.1, rootMargin: "100px" }
    );
    observerRef.current = observer;
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => { observerRef.current?.disconnect(); };
  }, [loadMore, isSearching, isLoading]);

  const hasSearchQuery = debouncedSearchQuery.trim();
  const showProducts = hasSearchQuery && (searchType === 'all' || searchType === 'products');
  const showShops = !hasSearchQuery || searchType === 'all' || searchType === 'shops';

  return (
    <PageThemeShell header={<Navbar />} footer={<Footer />} className="bg-background">
      <Helmet>
        <title>SteerSolo Marketplace Nigeria | Discover Trusted Online Stores</title>
        <meta
          name="description"
          content="Browse SteerSolo Marketplace Nigeria to discover trusted online stores for fashion, beauty, food, gadgets, and services."
        />
        <meta
          name="keywords"
          content="marketplace in nigeria, nigeria marketplace, steersolo marketplace, online marketplace nigeria, trusted stores nigeria"
        />
        <link rel="canonical" href="https://steersolo.com/shops" />
        <meta property="og:title" content="SteerSolo Marketplace Nigeria" />
        <meta
          property="og:description"
          content="Discover trusted Nigerian stores on SteerSolo Marketplace."
        />
        <meta property="og:url" content="https://steersolo.com/shops" />
      </Helmet>
      <VerifiedSellerNotice />

      {/* ══════════ HERO ══════════ */}
      <section className="relative pt-20 overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(215,65%,16%)] via-[hsl(220,56%,12%)] to-[hsl(215,58%,10%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--accent)/0.16),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(var(--primary)/0.22),transparent_62%)]" />

        <div className="relative z-10 container mx-auto px-4 pt-10 pb-12 sm:pt-14 sm:pb-16">
          
          {/* Eyebrow */}
          <div className="flex justify-center mb-5">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full">
              <Flame className="w-3.5 h-3.5 text-accent" />
              <span className="text-accent font-semibold text-xs sm:text-sm tracking-wide">Nigeria's Online Shopping Mall</span>
            </div>
          </div>

          {/* Headline */}
          <div className="text-center max-w-2xl mx-auto mb-4">
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-3 text-white">
              One Mall,{" "}
              <span className="gradient-text">Endless Shops</span>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-lg mx-auto">
              Browse hundreds of verified Nigerian businesses — fashion, food, electronics, services and more.
            </p>
          </div>

          {/* Stats Row */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap mb-7">
            <StatChip icon={Store} value={stats.shops.toLocaleString()} label="Shops" color="bg-primary/8 border-primary/20 text-primary" />
            <StatChip icon={Package} value={stats.products.toLocaleString()} label="Products" color="bg-accent/8 border-accent/20 text-accent" />
            <StatChip icon={BadgeCheck} value="Verified" label="Sellers" color="bg-emerald-500/8 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" />
          </div>

          {/* ── Search Bar ── */}
          <div className="relative max-w-xl mx-auto">
            <div className={`
              relative flex items-center bg-card border rounded-2xl shadow-xl shadow-black/5 transition-all duration-200
              ${searchFocused ? 'border-accent/60 shadow-accent/10 shadow-xl ring-4 ring-accent/10' : 'border-border/60'}
            `}>
              <Search className={`absolute left-4 w-4 h-4 transition-colors ${searchFocused ? 'text-accent' : 'text-muted-foreground'}`} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search shops, products, services…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="w-full bg-transparent pl-10 pr-12 h-14 text-sm sm:text-base focus:outline-none placeholder:text-muted-foreground/60"
              />
              {(isSearching || isLoading) ? (
                <div className="absolute right-4">
                  <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                </div>
              ) : searchQuery ? (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 w-6 h-6 flex items-center justify-center rounded-full bg-muted hover:bg-muted-foreground/20 transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              ) : null}
            </div>

            {/* Quick suggestions — visible when empty */}
            {!searchQuery && (
              <div className="flex items-center gap-2 mt-3 flex-wrap justify-center">
                <span className="text-xs text-muted-foreground">Popular:</span>
                {["Fashion", "Food", "Electronics", "Beauty", "Services"].map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSearchQuery(tag)}
                    className="text-xs px-3 py-1.5 rounded-full bg-card border border-border/60 text-muted-foreground hover:border-accent/40 hover:text-accent hover:bg-accent/5 transition-all"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ══════════ FILTERS ══════════ */}
      <div className="sticky top-[57px] z-30 bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-sm">
        <ExploreFilters
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedSort={selectedSort}
          onSortChange={setSelectedSort}
          selectedState={selectedState}
          onStateChange={(s) => { setSelectedState(s); setShopsPage(1); }}
          showVerifiedOnly={showVerifiedOnly}
          onVerifiedChange={(v) => { setShowVerifiedOnly(v); setShopsPage(1); }}
          categoryCounts={categoryCounts}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onMinPriceChange={setMinPrice}
          onMaxPriceChange={setMaxPrice}
        />
      </div>

      {/* ══════════ TOP SELLER BANNER ══════════ */}
      <div className="container mx-auto px-4 mt-5 mb-2">
        <TopSellerBanner />
      </div>

      {/* ══════════ TRENDING STORES ══════════ */}
      {isPhaseEnabled(2) && trendingShops.length > 0 && !debouncedSearchQuery.trim() && (
        <div className="container mx-auto px-4 mt-4 mb-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-accent/10 flex items-center justify-center">
              <Flame className="w-3.5 h-3.5 text-accent" />
            </div>
            <h2 className="font-display text-base sm:text-lg font-bold">Trending Stores</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {trendingShops.map((shop: any) => (
              <Link
                key={shop.id}
                to={`/shop/${shop.shop_slug || shop.id}`}
                className="flex-shrink-0 w-40 sm:w-48 bg-card border border-border/60 rounded-xl p-3 hover:border-accent/40 hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted mb-2">
                  {shop.logo_url ? (
                    <img src={shop.logo_url} alt={shop.shop_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10">
                      <Store className="w-5 h-5 text-primary" />
                    </div>
                  )}
                </div>
                <p className="text-sm font-semibold truncate group-hover:text-accent transition-colors">
                  {shop.shop_name || shop.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">{shop.state || 'Nigeria'}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ══════════ MAIN CONTENT ══════════ */}
      <main className="flex-1 container mx-auto px-4 pb-20 mt-4">
        <div className="max-w-7xl mx-auto">

          {/* ── Search Type Tabs ── */}
          {hasSearchQuery && (
            <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none">
              {(['all', 'shops', 'products'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => handleSearchTypeChange(type)}
                  className={`
                    px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0
                    ${searchType === type
                      ? 'bg-foreground text-background shadow-sm'
                      : 'bg-card border border-border/60 text-muted-foreground hover:border-accent/40 hover:text-foreground'
                    }
                  `}
                >
                  {type === 'all' ? `All (${shops.length + productResults.length})` : type === 'shops' ? `Shops (${shops.length})` : `Products (${productResults.length})`}
                </button>
              ))}
            </div>
          )}

          {/* ── Product Results ── */}
          {showProducts && productResults.length > 0 && (
            <div className="mb-10 animate-fade-up">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Package className="w-4 h-4 text-accent" />
                  </div>
                  <h2 className="font-display text-lg sm:text-xl font-bold">
                    Products
                    <span className="ml-2 text-sm font-normal text-muted-foreground">({productResults.length} results)</span>
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {productResults.map((product, index) => (
                  <Link key={`${product.id}-${index}`} to={`/shop/${product.shop_slug || 'shop'}`}>
                    <div className="group bg-card border border-border/60 rounded-2xl overflow-hidden hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 flex flex-col">
                      {/* Image */}
                      <div className="relative aspect-square overflow-hidden bg-muted">
                        {product.image_url || product.images?.[0]?.url ? (
                          <img
                            src={product.image_url || product.images?.[0]?.url}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                            <Package className="w-10 h-10 text-muted-foreground/50" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2">
                          <div className={`
                            text-xs font-semibold px-2 py-0.5 rounded-lg
                            ${product.is_available ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'}
                          `}>
                            {product.is_available ? 'In Stock' : 'Out'}
                          </div>
                        </div>
                      </div>
                      {/* Info */}
                      <div className="p-3 flex flex-col flex-1">
                        <h3 className="text-sm font-semibold line-clamp-2 group-hover:text-accent transition-colors mb-2 leading-snug">
                          {product.name}
                        </h3>
                        <div className="mt-auto flex items-center justify-between">
                          <span className="text-base font-bold gradient-text tabular-nums">
                            ₦{product.price?.toLocaleString() || '0'}
                          </span>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Store className="w-3 h-3" />
                            <span className="hidden sm:inline">View</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {loadingMoreProducts && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
                  {Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
                </div>
              )}
            </div>
          )}

          {/* ── Shops Section ── */}
          {showShops && (
            <div>
              {/* Section Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Store className="w-4 h-4 text-primary" />
                  </div>
                  <h2 className="font-display text-lg sm:text-xl font-bold">
                    {hasSearchQuery ? 'Shop Results' : 'All Shops'}
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      {hasSearchQuery ? `(${shops.length} found)` : `(${stats.shops} total)`}
                    </span>
                  </h2>
                </div>
                {selectedState !== 'All Locations' && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted rounded-xl px-3 py-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {selectedState}
                    <button onClick={() => setSelectedState('All Locations')} className="ml-1 hover:text-destructive transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Grid */}
              {(isLoading || isSearching) && !shops.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {Array.from({ length: 6 }).map((_, i) => <ShopCardSkeleton key={i} />)}
                </div>
              ) : sortedShops.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mb-5 shadow-inner">
                    <Store className="w-9 h-9 text-muted-foreground" />
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-2">
                    {hasSearchQuery ? "No shops found" : selectedState !== 'All Locations' ? `No shops in ${selectedState}` : "No active shops"}
                  </h3>
                  <p className="text-muted-foreground text-sm max-w-xs">
                    {hasSearchQuery ? `No shops found for "${debouncedSearchQuery}". Try different keywords.` : "Try adjusting your filters or check back later."}
                  </p>
                  {(hasSearchQuery || selectedState !== 'All Locations') && (
                    <Button
                      variant="outline"
                      className="mt-5 rounded-xl"
                      onClick={() => { setSearchQuery(""); setSelectedState("All Locations"); }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                    {sortedShops.map((shop, index) => (
                      <ShopCardEnhanced
                        key={`${shop.id}-${index}`}
                        shop={shop}
                        productPreviews={shopProducts[shop.id] || []}
                        productCount={shopProductCounts[shop.id] || 0}
                        index={index}
                        isBusinessPlan={businessPlanShopIds.has(shop.id)}
                        displayCategory={getCategoryLabel(shopCategories[shop.id] || 'other')}
                      />
                    ))}
                  </div>

                  {loadingMoreShops && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                      {Array.from({ length: 3 }).map((_, i) => <ShopCardSkeleton key={i} />)}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── Searching Indicator ── */}
          {isSearching && !isLoading && (
            <div className="flex justify-center py-10">
              <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-card border border-border/60">
                <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-muted-foreground">Searching for <strong>"{debouncedSearchQuery}"</strong>…</span>
              </div>
            </div>
          )}

          {/* ── Infinite Scroll Sentinel ── */}
          {(hasMoreShops || hasMoreProducts) && !isSearching && (
            <div ref={sentinelRef} className="h-16 flex items-center justify-center mt-4">
              {(loadingMoreShops || loadingMoreProducts) && (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                  Loading more…
                </div>
              )}
            </div>
          )}

          {/* ── End of Results ── */}
          {!hasMoreShops && !hasMoreProducts && (shops.length > 0 || productResults.length > 0) && (
            <div className="text-center py-12 mt-4 border-t border-border/50">
              <p className="text-muted-foreground text-sm">
                You've explored all {debouncedSearchQuery ? 'results' : 'shops'} — that's everything! 🎉
              </p>
            </div>
          )}

          {/* ── No Results ── */}
          {!isLoading && !isSearching && shops.length === 0 && productResults.length === 0 && hasSearchQuery && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mb-5 shadow-inner">
                <Search className="w-9 h-9 text-muted-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">No results found</h3>
              <p className="text-muted-foreground text-sm max-w-xs mb-5">
                Nothing matched "<strong>{debouncedSearchQuery}</strong>". Try different keywords.
              </p>
              <Button variant="outline" className="rounded-xl" onClick={() => setSearchQuery("")}>
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
