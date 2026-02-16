import { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Store, Package, Sparkles, BadgeCheck, MapPin } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { TopSellerBanner } from "@/components/TopSellerBanner";
import { AdirePattern } from "@/components/patterns/AdirePattern";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useDebounce } from "@/hooks/use-debounce";
import shopService from "@/services/shop.service";
import productService from "@/services/product.service";
import { Shop, Product } from "@/types/api";

// Types updated from @/types/api

const ShopCardSkeleton = () => (
  <Card className="h-full">
    <CardHeader>
      <Skeleton className="w-16 h-16 rounded-xl mb-4" />
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-4 w-24" />
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
        <div className="flex-1">
          <Skeleton className="h-8 w-32 mb-1" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </CardContent>
  </Card>
);

const Shops = () => {
  const [shops, setShops] = useState<Shop[]>([]);
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
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const ITEMS_PER_PAGE = 12;

  const fetchShops = useCallback(async (page: number = 1, reset: boolean = false, searchTerm: string = '') => {
    try {
      if (reset) {
        setIsLoading(true);
        setHasMoreShops(true);
      } else {
        setLoadingMoreShops(true);
      }

      console.log('Fetching shops with search term:', searchTerm);

      const response = await shopService.getShops(page, ITEMS_PER_PAGE, { 
        verified: showVerifiedOnly || undefined,
        activeOnly: true
      });
      
      console.log('Shops fetched:', response.data?.length, 'page:', page);
      
      if (!response.success) {
        setHasMoreShops(false);
        if (reset) setShops([]);
        return;
      }

      let filteredShops = response.data || [];
      
      // If there's a search term, filter locally for additional search criteria
      if (searchTerm.trim()) {
        filteredShops = filteredShops.filter(shop => 
          shop.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          shop.shop_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          shop.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          shop.shop_slug?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Check if we have more pages
      const totalShops = response.meta?.total || 0;
      const hasMore = filteredShops.length === ITEMS_PER_PAGE && 
                     page < Math.ceil(totalShops / ITEMS_PER_PAGE);
      
      setHasMoreShops(hasMore);

      setShops(prev => {
        if (reset) return filteredShops;
        const existingIds = new Set(prev.map(s => s.id));
        return [...prev, ...filteredShops.filter(s => !existingIds.has(s.id))];
      });
      
      setShopsPage(page);
    } catch (error) {
      console.error('Error fetching shops:', error);
      setHasMoreShops(false);
      if (reset) setShops([]);
    } finally {
      setIsLoading(false);
      setLoadingMoreShops(false);
    }
  }, [showVerifiedOnly]);

  // Search when query changes
  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      console.log('Search triggered:', debouncedSearchQuery);
      setIsSearching(true);
      setSearchType('all');
      setShopsPage(1);
      setProductsPage(1);
      setHasMoreShops(true);
      setHasMoreProducts(true);
      
      // Search for both shops and products
      Promise.all([
        fetchShops(1, true, debouncedSearchQuery),
        searchProducts(1, true)
      ]).finally(() => {
        setIsSearching(false);
        console.log('Search complete');
      });
    } else {
      // Clear product results when search is empty
      console.log('Clearing search');
      setProductResults([]);
      setSearchType('all');
      setShopsPage(1);
      setProductsPage(1);
      // Fetch regular shops without including all
      fetchShops(1, true, '');
    }
  }, [debouncedSearchQuery, fetchShops]);

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

      console.log('Searching products for:', debouncedSearchQuery, 'page:', page);
      
      const response = await productService.searchProducts({
        query: debouncedSearchQuery,
        page,
        limit: ITEMS_PER_PAGE
      });

      console.log('Product search response:', response.data?.length, 'success:', response.success);

      if (!response.success || !response.data) {
        setHasMoreProducts(false);
        if (reset) setProductResults([]);
        return;
      }

      const results = response.data;
      
      // Check if we have more pages
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

  // Initial load of shops
  useEffect(() => {
    if (!debouncedSearchQuery.trim()) {
      console.log('Initial load of shops');
      fetchShops(1, true);
    }
  }, [debouncedSearchQuery, fetchShops, showVerifiedOnly]);

  // Search when query changes
  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      console.log('Search triggered:', debouncedSearchQuery);
      setIsSearching(true);
      setSearchType('all');
      setShopsPage(1);
      setProductsPage(1);
      setHasMoreShops(true);
      setHasMoreProducts(true);
      
      // Search for both shops and products
      Promise.all([
        fetchShops(1, true, debouncedSearchQuery),
        searchProducts(1, true)
      ]).finally(() => {
        setIsSearching(false);
        console.log('Search complete');
      });
    } else {
      // Clear product results when search is empty
      console.log('Clearing search');
      setProductResults([]);
      setSearchType('all');
      setShopsPage(1);
      setProductsPage(1);
      fetchShops(1, true);
    }
  }, [debouncedSearchQuery, fetchShops, searchProducts]);

  const handleSearchTypeChange = (type: 'all' | 'shops' | 'products') => {
    setSearchType(type);
    setShopsPage(1);
    setProductsPage(1);
    setHasMoreShops(true);
    setHasMoreProducts(true);
    
    if (!debouncedSearchQuery.trim()) {
      // If no search query, just fetch regular shops
      if (type === 'shops' || type === 'all') {
        fetchShops(1, true);
      }
      if (type === 'products') {
        setProductResults([]);
      }
      return;
    }
    
    if (type === 'shops') {
      setProductResults([]);
      fetchShops(1, true, debouncedSearchQuery);
    } else if (type === 'products') {
      setShops([]);
      searchProducts(1, true);
    } else {
      // Reset both arrays for 'all' search
      setShops([]);
      setProductResults([]);
      Promise.all([
        fetchShops(1, true, debouncedSearchQuery),
        searchProducts(1, true)
      ]);
    }
  };

  const loadMore = useCallback(() => {
    console.log('Load more called, searchType:', searchType);
    
    if (searchType === 'shops' && hasMoreShops && !loadingMoreShops) {
      console.log('Loading more shops, page:', shopsPage + 1);
      fetchShops(shopsPage + 1, false, debouncedSearchQuery);
    } else if (searchType === 'products' && hasMoreProducts && !loadingMoreProducts) {
      console.log('Loading more products, page:', productsPage + 1);
      searchProducts(productsPage + 1, false);
    } else if (searchType === 'all') {
      if (hasMoreShops && !loadingMoreShops) {
        console.log('Loading more shops for "all", page:', shopsPage + 1);
        fetchShops(shopsPage + 1, false, debouncedSearchQuery);
      }
      if (hasMoreProducts && !loadingMoreProducts) {
        console.log('Loading more products for "all", page:', productsPage + 1);
        searchProducts(productsPage + 1, false);
      }
    }
  }, [
    searchType, hasMoreShops, hasMoreProducts, 
    loadingMoreShops, loadingMoreProducts,
    shopsPage, productsPage, fetchShops, searchProducts, debouncedSearchQuery
  ]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isSearching && !isLoading) {
          console.log('Sentinel visible, loading more');
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    observerRef.current = observer;

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMore, isSearching, isLoading]);

  // Render content based on search state
  const renderContent = () => {
    const hasSearchQuery = debouncedSearchQuery.trim();
    const showProducts = hasSearchQuery && (searchType === 'all' || searchType === 'products');
    const showShops = !hasSearchQuery || searchType === 'all' || searchType === 'shops';

    return (
      <>
        {/* Search Type Tabs - Only show when searching */}
        {hasSearchQuery && (
          <div className="flex gap-1 sm:gap-2 mb-4 sm:mb-6 border-b pb-3 sm:pb-4 overflow-x-auto">
            <button
              onClick={() => handleSearchTypeChange('all')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors text-xs sm:text-sm whitespace-nowrap min-h-[40px] ${searchType === 'all' ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/10'}`}
            >
              All ({shops.length + productResults.length})
            </button>
            <button
              onClick={() => handleSearchTypeChange('shops')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors text-xs sm:text-sm whitespace-nowrap min-h-[40px] ${searchType === 'shops' ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/10'}`}
            >
              Shops ({shops.length})
            </button>
            <button
              onClick={() => handleSearchTypeChange('products')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors text-xs sm:text-sm whitespace-nowrap min-h-[40px] ${searchType === 'products' ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/10'}`}
            >
              Products ({productResults.length})
            </button>
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
                    className="h-full card-african hover:border-accent/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer group bg-card/80 backdrop-blur-sm"
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
                        <div className="w-full h-32 sm:h-48 mb-2 sm:mb-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center adire-pattern">
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
            
            {/* Products Loading Skeleton */}
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
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <ShopCardSkeleton key={index} />
                ))}
              </div>
            ) : shops.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
                  <Store className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">
                  {hasSearchQuery ? "No shops found" : "No active shops"}
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {hasSearchQuery 
                    ? `No shops found for "${debouncedSearchQuery}"`
                    : "No active shops found"}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                  {shops.map((shop, index) => (
                    <Link key={`${shop.id}-${index}`} to={`/shop/${shop.slug || shop.shop_slug}`}>
                      <Card 
                        className="h-full card-african hover:border-accent/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer group bg-card/80 backdrop-blur-sm animate-fade-up"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <CardHeader className="p-3 sm:p-6">
                          <div className="relative">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-105 transition-transform shadow-lg overflow-hidden">
                              {shop.logo_url ? (
                                <img 
                                  src={shop.logo_url} 
                                  alt={shop.name || shop.shop_name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Store className="w-6 h-6 sm:w-8 sm:h-8 text-primary-foreground" />
                              )}
                            </div>
                            {shop.is_verified && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-sm">
                                <BadgeCheck className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <CardTitle className="group-hover:text-accent transition-colors font-display text-base sm:text-lg line-clamp-1">
                              {shop.name || shop.shop_name}
                            </CardTitle>
                            {shop.is_verified && (
                              <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 text-xs">
                                <BadgeCheck className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <CardDescription className="line-clamp-2 text-xs sm:text-sm">
                            {shop.description || "Visit this shop to see their products"}
                          </CardDescription>
                          {((shop as any).state || (shop as any).country) && (
                            <div className="flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                              <span className="text-xs text-muted-foreground truncate">
                                {[(shop as any).state, (shop as any).country].filter(Boolean).join(", ")}
                              </span>
                            </div>
                          )}
                        </CardHeader>
                        <CardContent className="p-3 sm:p-6 pt-0">
                          <div className="flex items-center justify-between">
                            <div className="text-xs sm:text-sm text-accent font-medium group-hover:translate-x-1 transition-transform flex items-center gap-1">
                              Visit Store 
                              <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </div>
                            {shop.total_reviews > 0 && (
                              <div className="flex items-center gap-1">
                                <BadgeCheck className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                <span className="text-xs">{shop.average_rating?.toFixed(1) || '0.0'}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>

                {/* Shops Loading Skeleton */}
                {loadingMoreShops && (
                  <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mt-4 sm:mt-6">
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
      
      {/* Hero Section */}
      <section className="relative pt-24 sm:pt-28 pb-8 sm:pb-12 overflow-hidden">
        <AdirePattern variant="geometric" className="text-primary" opacity={0.5} />
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-accent/10 border border-accent/20 rounded-full mb-4 sm:mb-6">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-accent" />
              <span className="text-accent font-semibold text-xs sm:text-sm">Discover Nigerian Businesses</span>
            </div>
            
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
              Explore <span className="gradient-text">Amazing Shops</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-8 px-2">
              Discover unique products from talented Nigerian entrepreneurs
            </p>

            {/* Search */}
            <div className="relative max-w-md mx-auto px-2">
              <Search className="absolute left-6 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
              <Input
                placeholder="Search shops or products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 sm:pl-12 h-11 sm:h-12 text-sm sm:text-base bg-card/80 backdrop-blur-sm border-border/50 focus:border-accent shadow-lg"
              />
              {(isSearching || isLoading) && (
                <div className="absolute right-6 sm:right-4 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Verified Filter */}
            <div className="mt-4 inline-flex items-center gap-2 bg-green-50 dark:bg-green-950/20 px-3 py-2 rounded-lg border border-green-200 dark:border-green-900/30">
              <Switch 
                id="verified-filter"
                checked={showVerifiedOnly} 
                onCheckedChange={setShowVerifiedOnly}
              />
              <Label htmlFor="verified-filter" className="flex items-center gap-1.5 cursor-pointer">
                <BadgeCheck className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700 dark:text-green-400">Verified Only</span>
              </Label>
            </div>
          </div>
        </div>
      </section>

      {/* Top Seller Banner */}
      <div className="container mx-auto px-4 mb-6 sm:mb-8">
        <TopSellerBanner />
      </div>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 pb-16 sm:pb-20">
        <div className="max-w-6xl mx-auto">
          {renderContent()}

          {/* Search status */}
          {isSearching && !isLoading && (
            <div className="text-center py-8">
              <div className="inline-flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                <span className="text-muted-foreground">Searching for "{debouncedSearchQuery}"...</span>
              </div>
            </div>
          )}

          {/* Infinite scroll sentinel */}
          {(hasMoreShops || hasMoreProducts) && !isSearching && (
            <div 
              ref={sentinelRef} 
              className="h-20 flex items-center justify-center"
            >
              {(loadingMoreShops || loadingMoreProducts) && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                  <span>Loading more...</span>
                </div>
              )}
            </div>
          )}

          {/* Show "No more results" message */}
          {!hasMoreShops && !hasMoreProducts && (shops.length > 0 || productResults.length > 0) && (
            <div className="text-center py-12 border-t">
              <p className="text-muted-foreground">
                You've seen all {debouncedSearchQuery ? 'results' : 'shops'} for now!
              </p>
            </div>
          )}

          {/* Show empty state when no results at all */}
          {!isLoading && !isSearching && shops.length === 0 && productResults.length === 0 && debouncedSearchQuery.trim() && (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
                <Search className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">
                No results found
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                No shops or products found for "{debouncedSearchQuery}". Try searching with different keywords.
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