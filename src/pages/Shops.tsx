import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Store, Package, Sparkles, BadgeCheck, MapPin, ShieldCheck, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { TopSellerBanner } from "@/components/TopSellerBanner";
import { AdirePattern } from "@/components/patterns/AdirePattern";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/use-debounce";
import shopService from "@/services/shop.service";
import productService from "@/services/product.service";
import { Shop, Product } from "@/types/api";
import { ExploreFilters } from "@/components/ExploreFilters";
import { ShopCardEnhanced } from "@/components/ShopCardEnhanced";
import { supabase } from "@/integrations/supabase/client";
import { useState as useReactState } from "react";
import { Button } from "@/components/ui/button";

const VERIFIED_NOTICE_KEY = "steersolo_verified_notice_dismissed";

const VerifiedSellerNotice = () => {
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(VERIFIED_NOTICE_KEY) === "true");
  if (dismissed) return null;
  return (
    <div className="bg-accent/10 border-b border-accent/20">
      <div className="container mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm">
          <ShieldCheck className="w-4 h-4 text-accent shrink-0" />
          <span className="text-foreground">
            For your safety, look for the <BadgeCheck className="w-3.5 h-3.5 inline text-green-500" /> <strong>Verified</strong> badge when choosing a seller.
          </span>
        </div>
        <button
          onClick={() => { setDismissed(true); localStorage.setItem(VERIFIED_NOTICE_KEY, "true"); }}
          className="text-muted-foreground hover:text-foreground shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const ShopCardSkeleton = () => (
  <Card className="h-full">
    <CardHeader>
      <div className="flex items-start gap-3">
        <Skeleton className="w-14 h-14 rounded-xl" />
        <div className="flex-1">
          <Skeleton className="h-5 w-3/4 mb-2" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3 mt-1" />
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="flex gap-1.5">
        <Skeleton className="w-16 h-16 rounded-lg" />
        <Skeleton className="w-16 h-16 rounded-lg" />
        <Skeleton className="w-16 h-16 rounded-lg" />
      </div>
    </CardContent>
  </Card>
);

const ProductCardSkeleton = () => (
  <Card className="h-full">
    <CardHeader>
      <Skeleton className="w-full h-48 rounded-lg mb-4" />
      <Skeleton className="h-5 w-3/4 mb-2" />
      <div className="flex items-center gap-2 mt-2">
        <Skeleton className="w-6 h-6 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </CardContent>
  </Card>
);

const Shops = () => {
  const [shops, setShops] = useState<Shop[]>([]);
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
  const [shopProducts, setShopProducts] = useState<Record<string, { image_url: string; name: string }[]>>({});
  const [shopProductCounts, setShopProductCounts] = useState<Record<string, number>>({});
  const [stats, setStats] = useState({ shops: 0, products: 0 });
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const ITEMS_PER_PAGE = 12;

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      const [shopsRes, productsRes] = await Promise.all([
        supabase.from("shops").select("id", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("products").select("id", { count: "exact", head: true }).eq("is_available", true),
      ]);
      setStats({ shops: shopsRes.count || 0, products: productsRes.count || 0 });
    };

    const fetchBusinessPlanShops = async () => {
      // Find all shop owners on business plan
      const { data: businessProfiles } = await supabase
        .from('profiles')
        .select('id, subscription_plan_id')
        .not('subscription_plan_id', 'is', null);
      
      if (businessProfiles && businessProfiles.length > 0) {
        const planIds = [...new Set(businessProfiles.map(p => p.subscription_plan_id).filter(Boolean))];
        const { data: plans } = await supabase
          .from('subscription_plans')
          .select('id, slug')
          .in('id', planIds as string[])
          .eq('slug', 'business');
        
        if (plans && plans.length > 0) {
          const businessPlanIds = new Set(plans.map(p => p.id));
          const businessOwnerIds = businessProfiles
            .filter(p => p.subscription_plan_id && businessPlanIds.has(p.subscription_plan_id))
            .map(p => p.id);
          
          if (businessOwnerIds.length > 0) {
            const { data: businessShops } = await supabase
              .from('shops')
              .select('id')
              .in('owner_id', businessOwnerIds);
            
            if (businessShops) {
              setBusinessPlanShopIds(new Set(businessShops.map(s => s.id)));
            }
          }
        }
      }
    };

    fetchStats();
    fetchBusinessPlanShops();
  }, []);

  // Fetch product previews for shops
  const fetchShopPreviews = useCallback(async (shopIds: string[]) => {
    if (shopIds.length === 0) return;
    const newIds = shopIds.filter(id => !shopProducts[id]);
    if (newIds.length === 0) return;

    const { data } = await supabase
      .from('products')
      .select('shop_id, image_url, name')
      .in('shop_id', newIds)
      .eq('is_available', true)
      .not('image_url', 'is', null)
      .limit(100);

    if (data) {
      const grouped: Record<string, { image_url: string; name: string }[]> = {};
      const counts: Record<string, number> = {};
      data.forEach(p => {
        if (!grouped[p.shop_id]) grouped[p.shop_id] = [];
        if (!counts[p.shop_id]) counts[p.shop_id] = 0;
        counts[p.shop_id]++;
        if (grouped[p.shop_id].length < 3 && p.image_url) {
          grouped[p.shop_id].push({ image_url: p.image_url, name: p.name });
        }
      });
      setShopProducts(prev => ({ ...prev, ...grouped }));
      setShopProductCounts(prev => ({ ...prev, ...counts }));
    }
  }, [shopProducts]);

  const fetchShops = useCallback(async (page: number = 1, reset: boolean = false, searchTerm: string = '') => {
    try {
      if (reset) {
        setIsLoading(true);
        setHasMoreShops(true);
      } else {
        setLoadingMoreShops(true);
      }

      const response = await shopService.getShops(page, ITEMS_PER_PAGE, { 
        verified: showVerifiedOnly || undefined,
        activeOnly: true
      });
      
      if (!response.success) {
        setHasMoreShops(false);
        if (reset) setShops([]);
        return;
      }

      let filteredShops = response.data || [];
      
      // Local search filter
      if (searchTerm.trim()) {
        filteredShops = filteredShops.filter(shop => 
          shop.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          shop.shop_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          shop.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          shop.shop_slug?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // State filter
      if (selectedState !== 'All Locations') {
        filteredShops = filteredShops.filter(shop => shop.state === selectedState);
      }

      const totalShops = response.meta?.total || 0;
      const hasMore = filteredShops.length === ITEMS_PER_PAGE && 
                     page < Math.ceil(totalShops / ITEMS_PER_PAGE);
      
      setHasMoreShops(hasMore);

      setShops(prev => {
        if (reset) return filteredShops;
        const existingIds = new Set(prev.map(s => s.id));
        return [...prev, ...filteredShops.filter(s => !existingIds.has(s.id))];
      });
      
      // Fetch product previews for these shops
      fetchShopPreviews(filteredShops.map(s => s.id));
      
      setShopsPage(page);
    } catch (error) {
      console.error('Error fetching shops:', error);
      setHasMoreShops(false);
      if (reset) setShops([]);
    } finally {
      setIsLoading(false);
      setLoadingMoreShops(false);
    }
  }, [showVerifiedOnly, selectedState, fetchShopPreviews]);

  // Sort shops - Business plan shops always appear first
  const sortedShops = useMemo(() => {
    const sorted = [...shops];
    switch (selectedSort) {
      case 'rating':
        sorted.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
        break;
      case 'name':
        sorted.sort((a, b) => (a.name || a.shop_name || '').localeCompare(b.name || b.shop_name || ''));
        break;
      case 'newest':
      default:
        // Already sorted by created_at desc from API
        break;
    }
    // Always prioritize business plan shops to the top
    sorted.sort((a, b) => {
      const aIsBusiness = businessPlanShopIds.has(a.id) ? 1 : 0;
      const bIsBusiness = businessPlanShopIds.has(b.id) ? 1 : 0;
      return bIsBusiness - aIsBusiness;
    });
    return sorted;
  }, [shops, selectedSort, businessPlanShopIds]);

  // Search products
  const searchProducts = useCallback(async (page: number = 1, reset: boolean = false) => {
    if (!debouncedSearchQuery.trim()) {
      if (reset) setProductResults([]);
      return;
    }

    try {
      if (reset) {
        setIsSearching(true);
        setHasMoreProducts(true);
      } else {
        setLoadingMoreProducts(true);
      }

      const response = await productService.searchProducts({
        query: debouncedSearchQuery,
        page,
        limit: ITEMS_PER_PAGE
      });

      if (!response.success || !response.data) {
        setHasMoreProducts(false);
        if (reset) setProductResults([]);
        return;
      }

      const results = response.data;
      const hasMore = results.length === ITEMS_PER_PAGE && 
                     page < (response.meta?.totalPages || 1);
      
      setHasMoreProducts(hasMore);

      setProductResults(prev => {
        if (reset) return results;
        const existingIds = new Set(prev.map(p => p.id));
        return [...prev, ...results.filter(p => !existingIds.has(p.id))];
      });
      
      setProductsPage(page);
    } catch (error) {
      console.error('Error searching products:', error);
      setHasMoreProducts(false);
      if (reset) setProductResults([]);
    } finally {
      setIsSearching(false);
      setLoadingMoreProducts(false);
    }
  }, [debouncedSearchQuery]);

  // Main search/load effect
  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      setIsSearching(true);
      setSearchType('all');
      setShopsPage(1);
      setProductsPage(1);
      setHasMoreShops(true);
      setHasMoreProducts(true);
      
      Promise.all([
        fetchShops(1, true, debouncedSearchQuery),
        searchProducts(1, true)
      ]).finally(() => setIsSearching(false));
    } else {
      setProductResults([]);
      setSearchType('all');
      setShopsPage(1);
      setProductsPage(1);
      fetchShops(1, true, '');
    }
  }, [debouncedSearchQuery, fetchShops, searchProducts, showVerifiedOnly, selectedState]);

  const handleSearchTypeChange = (type: 'all' | 'shops' | 'products') => {
    setSearchType(type);
    setShopsPage(1);
    setProductsPage(1);
    setHasMoreShops(true);
    setHasMoreProducts(true);
    
    if (!debouncedSearchQuery.trim()) {
      if (type === 'shops' || type === 'all') fetchShops(1, true);
      if (type === 'products') setProductResults([]);
      return;
    }
    
    if (type === 'shops') {
      setProductResults([]);
      fetchShops(1, true, debouncedSearchQuery);
    } else if (type === 'products') {
      setShops([]);
      searchProducts(1, true);
    } else {
      setShops([]);
      setProductResults([]);
      Promise.all([
        fetchShops(1, true, debouncedSearchQuery),
        searchProducts(1, true)
      ]);
    }
  };

  const loadMore = useCallback(() => {
    if (searchType === 'shops' && hasMoreShops && !loadingMoreShops) {
      fetchShops(shopsPage + 1, false, debouncedSearchQuery);
    } else if (searchType === 'products' && hasMoreProducts && !loadingMoreProducts) {
      searchProducts(productsPage + 1, false);
    } else if (searchType === 'all') {
      if (hasMoreShops && !loadingMoreShops) fetchShops(shopsPage + 1, false, debouncedSearchQuery);
      if (hasMoreProducts && !loadingMoreProducts) searchProducts(productsPage + 1, false);
    }
  }, [searchType, hasMoreShops, hasMoreProducts, loadingMoreShops, loadingMoreProducts, shopsPage, productsPage, fetchShops, searchProducts, debouncedSearchQuery]);

  // Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isSearching && !isLoading) loadMore();
      },
      { threshold: 0.1, rootMargin: "100px" }
    );
    observerRef.current = observer;
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => { if (observerRef.current) observerRef.current.disconnect(); };
  }, [loadMore, isSearching, isLoading]);

  const renderContent = () => {
    const hasSearchQuery = debouncedSearchQuery.trim();
    const showProducts = hasSearchQuery && (searchType === 'all' || searchType === 'products');
    const showShops = !hasSearchQuery || searchType === 'all' || searchType === 'shops';

    return (
      <>
        {/* Search Type Tabs */}
        {hasSearchQuery && (
          <div className="flex gap-1 sm:gap-2 mb-4 sm:mb-6 border-b pb-3 sm:pb-4 overflow-x-auto">
            {(['all', 'shops', 'products'] as const).map(type => (
              <button
                key={type}
                onClick={() => handleSearchTypeChange(type)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors text-xs sm:text-sm whitespace-nowrap min-h-[40px] ${searchType === type ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/10'}`}
              >
                {type === 'all' ? `All (${shops.length + productResults.length})` : type === 'shops' ? `Shops (${shops.length})` : `Products (${productResults.length})`}
              </button>
            ))}
          </div>
        )}

        {/* Product Results */}
        {showProducts && productResults.length > 0 && (
          <div className="mb-8 sm:mb-12 animate-fade-up">
            <h2 className="font-display text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
              Product Results <span className="text-accent">({productResults.length})</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {productResults.map((product, index) => (
                <Link key={`${product.id}-${index}`} to={`/shop/${product.shop_slug || 'shop'}`}>
                  <Card 
                    className="h-full hover:border-accent/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer group bg-card/80 backdrop-blur-sm"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <CardHeader className="p-2 sm:p-4">
                      {product.image_url || (product.images && product.images.length > 0) ? (
                        <div className="w-full h-32 sm:h-48 mb-2 sm:mb-4 overflow-hidden rounded-lg">
                          <img 
                            src={product.image_url || product.images?.[0]?.url} 
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-32 sm:h-48 mb-2 sm:mb-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center">
                          <Package className="w-10 h-10 sm:w-16 sm:h-16 text-muted-foreground" />
                        </div>
                      )}
                      <CardTitle className="group-hover:text-accent transition-colors text-sm sm:text-lg font-display line-clamp-2">
                        {product.name}
                      </CardTitle>
                      <CardDescription className="hidden sm:block">
                        <div className="flex items-center gap-2 mt-2">
                          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                            <Store className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary-foreground" />
                          </div>
                          <span className="text-xs sm:text-sm">Visit Shop</span>
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-2 sm:p-4 pt-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-lg sm:text-2xl font-bold gradient-text">₦{product.price?.toLocaleString() || '0'}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 hidden sm:block">
                            {product.inventory || product.stock_quantity || 0} in stock
                          </p>
                        </div>
                        <Badge className={`${product.is_available ? 'bg-accent/10 text-accent border-accent/20' : 'bg-destructive/10 text-destructive border-destructive/20'} text-xs`}>
                          {product.is_available ? 'Available' : 'Unavailable'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            
            {loadingMoreProducts && (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mt-4 sm:mt-6">
                {Array.from({ length: 3 }).map((_, index) => (
                  <ProductCardSkeleton key={`product-skeleton-${index}`} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Shops Section */}
        {showShops && (
          <div>
            {(hasSearchQuery && searchType === 'all') && (
              <h2 className="font-display text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
                Shop Results <span className="text-accent">({shops.length})</span>
              </h2>
            )}
            
            {(isLoading || isSearching) && !shops.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <ShopCardSkeleton key={index} />
                ))}
              </div>
            ) : sortedShops.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
                  <Store className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">
                  {hasSearchQuery ? "No shops found" : selectedState !== 'All Locations' ? `No shops in ${selectedState}` : "No active shops"}
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {hasSearchQuery 
                    ? `No shops found for "${debouncedSearchQuery}"`
                    : "Try adjusting your filters or check back later."}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {sortedShops.map((shop, index) => (
                    <ShopCardEnhanced
                      key={`${shop.id}-${index}`}
                      shop={shop}
                      productPreviews={shopProducts[shop.id] || []}
                      productCount={shopProductCounts[shop.id] || 0}
                      index={index}
                      isBusinessPlan={businessPlanShopIds.has(shop.id)}
                    />
                  ))}
                </div>

                {loadingMoreShops && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-4 sm:mt-6">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <ShopCardSkeleton key={`shop-skeleton-${index}`} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* Verified Seller Safety Notice */}
      <VerifiedSellerNotice />
      
      <section className="relative pt-24 sm:pt-28 pb-6 sm:pb-8 overflow-hidden">
        <AdirePattern variant="geometric" className="text-primary" opacity={0.5} />
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-accent/10 border border-accent/20 rounded-full mb-4 sm:mb-6">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-accent" />
              <span className="text-accent font-semibold text-xs sm:text-sm">Discover Nigerian Businesses</span>
            </div>
            
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-3">
              Explore <span className="gradient-text">Amazing Shops</span>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto mb-4 sm:mb-6 px-2">
              {stats.shops} shops · {stats.products} products from talented Nigerian entrepreneurs
            </p>

            {/* Search */}
            <div className="relative max-w-lg mx-auto px-2">
              <Search className="absolute left-6 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
              <Input
                placeholder="Search shops, products, or services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 sm:pl-12 h-12 sm:h-14 text-sm sm:text-base bg-card/80 backdrop-blur-sm border-border/50 focus:border-accent shadow-lg rounded-xl"
              />
              {(isSearching || isLoading) && (
                <div className="absolute right-6 sm:right-4 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <ExploreFilters
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedSort={selectedSort}
        onSortChange={setSelectedSort}
        selectedState={selectedState}
        onStateChange={(s) => { setSelectedState(s); setShopsPage(1); }}
        showVerifiedOnly={showVerifiedOnly}
        onVerifiedChange={(v) => { setShowVerifiedOnly(v); setShopsPage(1); }}
      />

      {/* Top Seller Banner */}
      <div className="container mx-auto px-4 mt-6 mb-4">
        <TopSellerBanner />
      </div>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 pb-16 sm:pb-20">
        <div className="max-w-6xl mx-auto">
          {renderContent()}

          {isSearching && !isLoading && (
            <div className="text-center py-8">
              <div className="inline-flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                <span className="text-muted-foreground">Searching for "{debouncedSearchQuery}"...</span>
              </div>
            </div>
          )}

          {(hasMoreShops || hasMoreProducts) && !isSearching && (
            <div ref={sentinelRef} className="h-20 flex items-center justify-center">
              {(loadingMoreShops || loadingMoreProducts) && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                  <span>Loading more...</span>
                </div>
              )}
            </div>
          )}

          {!hasMoreShops && !hasMoreProducts && (shops.length > 0 || productResults.length > 0) && (
            <div className="text-center py-12 border-t">
              <p className="text-muted-foreground">
                You've seen all {debouncedSearchQuery ? 'results' : 'shops'} for now!
              </p>
            </div>
          )}

          {!isLoading && !isSearching && shops.length === 0 && productResults.length === 0 && debouncedSearchQuery.trim() && (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
                <Search className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">No results found</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                No shops or products found for "{debouncedSearchQuery}". Try different keywords.
              </p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Shops;
