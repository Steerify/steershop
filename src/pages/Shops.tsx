import { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Store, Package, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AdirePattern } from "@/components/patterns/AdirePattern";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/use-debounce";
import shopService from "@/services/shop.service";
import productService from "@/services/product.service";
import { Shop, Product } from "@/types/api";
import { handleApiError } from "@/lib/api-error-handler";

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
  const [shopsPage, setShopsPage] = useState(0);
  const [productsPage, setProductsPage] = useState(0);
  const [hasMoreShops, setHasMoreShops] = useState(true);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  const [loadingMoreShops, setLoadingMoreShops] = useState(false);
  const [loadingMoreProducts, setLoadingMoreProducts] = useState(false);
  const [searchType, setSearchType] = useState<'all' | 'shops' | 'products'>('all');
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const ITEMS_PER_PAGE = 12;

  const fetchShops = useCallback(async (page: number = 1, reset: boolean = false) => {
    try {
      if (reset) {
        setIsLoading(true);
      } else {
        setLoadingMoreShops(true);
      }

      const response = await shopService.getShops(page, ITEMS_PER_PAGE);
      
      if (!response.success || response.data.length === 0) {
        setHasMoreShops(false);
        if (reset) setShops([]);
        return;
      }

      const newShops = response.data;
      setHasMoreShops(newShops.length === ITEMS_PER_PAGE);

      setShops(prev => {
        if (reset) return newShops;
        const existingIds = new Set(prev.map(s => s.id));
        return [...prev, ...newShops.filter(s => !existingIds.has(s.id))];
      });
      
      setShopsPage(page);
    } catch (error) {
      // Error already handled by handleApiError in service
      if (reset) setShops([]);
    } finally {
      setIsLoading(false);
      setLoadingMoreShops(false);
    }
  }, []);

  const searchShops = useCallback(async (page: number = 1, reset: boolean = false) => {
    // Current shopService.getShops doesn't support search query?
    // Let's assume for now we reuse same call or filter locally if needed
    // But backend should support search.
    // If not, we'll just fetch all or keep simple.
    await fetchShops(page, reset);
  }, [fetchShops]);

  const searchProducts = useCallback(async (page: number = 1, reset: boolean = false) => {
    if (!debouncedSearchQuery.trim()) {
      if (reset) setProductResults([]);
      return;
    }

    try {
      if (reset) {
        setIsLoading(true);
      } else {
        setLoadingMoreProducts(true);
      }

      const response = await productService.getProducts({ 
        page, 
        limit: ITEMS_PER_PAGE 
      });

      if (!response.success || response.data.length === 0) {
        setHasMoreProducts(false);
        if (reset) setProductResults([]);
        return;
      }

      const results = response.data;
      setHasMoreProducts(results.length === ITEMS_PER_PAGE);

      setProductResults(prev => {
        if (reset) return results;
        const existingIds = new Set(prev.map(p => p.id));
        return [...prev, ...results.filter(p => !existingIds.has(p.id))];
      });
      
      setProductsPage(page);
    } catch (error) {
      if (reset) setProductResults([]);
    } finally {
      setIsLoading(false);
      setLoadingMoreProducts(false);
    }
  }, [debouncedSearchQuery]);

  // Initial load of shops
  useEffect(() => {
    if (!debouncedSearchQuery) {
      fetchShops(1, true);
    }
  }, [debouncedSearchQuery, fetchShops]);

  // Search when query changes
  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      setSearchType('all');
      setShopsPage(1);
      setProductsPage(1);
      setHasMoreShops(true);
      setHasMoreProducts(true);
      
      Promise.all([
        searchShops(1, true),
        searchProducts(1, true)
      ]);
    } else {
      setProductResults([]);
      setSearchType('all');
      fetchShops(1, true);
    }
  }, [debouncedSearchQuery, searchShops, searchProducts, fetchShops]);

  const handleSearchTypeChange = (type: 'all' | 'shops' | 'products') => {
    setSearchType(type);
    setShopsPage(1);
    setProductsPage(1);
    setHasMoreShops(true);
    setHasMoreProducts(true);
    
    if (type === 'shops') {
      searchShops(1, true);
    } else if (type === 'products') {
      searchProducts(1, true);
    } else {
      Promise.all([
        searchShops(1, true),
        searchProducts(1, true)
      ]);
    }
  };

  const getCurrentContent = useCallback(() => {
    if (!debouncedSearchQuery.trim()) return 'shops';
    return searchType;
  }, [debouncedSearchQuery, searchType]);

  const loadMore = useCallback(() => {
    const currentContent = getCurrentContent();
    
    if (currentContent === 'shops' && hasMoreShops && !loadingMoreShops) {
      searchShops(shopsPage + 1, false);
    } else if (currentContent === 'products' && hasMoreProducts && !loadingMoreProducts) {
      searchProducts(productsPage + 1, false);
    } else if (currentContent === 'all') {
      if (hasMoreShops && !loadingMoreShops) {
        searchShops(shopsPage + 1, false);
      }
      if (hasMoreProducts && !loadingMoreProducts) {
        searchProducts(productsPage + 1, false);
      }
    }
  }, [
    getCurrentContent, hasMoreShops, hasMoreProducts, 
    loadingMoreShops, loadingMoreProducts,
    shopsPage, productsPage, searchShops, searchProducts
  ]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
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
  }, [loadMore]);

  // Render content based on search state
  const renderContent = () => {
    const currentContent = getCurrentContent();
    const showProducts = (debouncedSearchQuery && (currentContent === 'all' || currentContent === 'products'));
    const showShops = (!debouncedSearchQuery || currentContent === 'all' || currentContent === 'shops');

    return (
      <>
        {/* Search Type Tabs - Only show when searching */}
        {debouncedSearchQuery && (
          <div className="flex gap-2 mb-6 border-b pb-4">
            <button
              onClick={() => handleSearchTypeChange('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${searchType === 'all' ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/10'}`}
            >
              All Results ({shops.length + productResults.length})
            </button>
            <button
              onClick={() => handleSearchTypeChange('shops')}
              className={`px-4 py-2 rounded-lg transition-colors ${searchType === 'shops' ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/10'}`}
            >
              Shops ({shops.length})
            </button>
            <button
              onClick={() => handleSearchTypeChange('products')}
              className={`px-4 py-2 rounded-lg transition-colors ${searchType === 'products' ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/10'}`}
            >
              Products ({productResults.length})
            </button>
          </div>
        )}

        {/* Product Results */}
        {showProducts && productResults.length > 0 && (
          <div className="mb-12 animate-fade-up">
            <h2 className="font-display text-2xl font-bold mb-6">
              Product Results <span className="text-accent">({productResults.length})</span>
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {productResults.map((product, index) => (
                <Link key={`${product.id}-${index}`} to={`/shop/${product.slug}`}>
                  <Card 
                    className="h-full card-african hover:border-accent/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer group bg-card/80 backdrop-blur-sm"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <CardHeader>
                      {product.images && product.images.length > 0 ? (
                        <div className="w-full h-48 mb-4 overflow-hidden rounded-lg">
                          <img 
                            src={product.images[0].url} 
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-48 mb-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center adire-pattern">
                          <Package className="w-16 h-16 text-muted-foreground" />
                        </div>
                      )}
                      <CardTitle className="group-hover:text-accent transition-colors text-lg font-display">
                        {product.name}
                      </CardTitle>
                      <CardDescription>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                            <Store className="w-3 h-3 text-primary-foreground" />
                          </div>
                          <span>Visit Shop</span>
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold gradient-text">₦{product.price.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {product.inventory} in stock
                          </p>
                        </div>
                        <Badge className="bg-accent/10 text-accent border-accent/20 hover:bg-accent/20">
                          Available
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            
            {/* Products Loading Skeleton */}
            {loadingMoreProducts && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
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
            {(debouncedSearchQuery && searchType === 'all') && (
              <h2 className="font-display text-2xl font-bold mb-6">
                Shop Results <span className="text-accent">({shops.length})</span>
              </h2>
            )}
            
            {isLoading && !shops.length ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  {debouncedSearchQuery ? "No shops found" : "No active shops"}
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {debouncedSearchQuery 
                    ? "Try a different search term" 
                    : "Shops appear here when their owners have active subscriptions"}
                </p>
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {shops.map((shop, index) => (
                    <Link key={`${shop.id}-${index}`} to={`/shop/${shop.slug}`}>
                      <Card 
                        className="h-full card-african hover:border-accent/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer group bg-card/80 backdrop-blur-sm animate-fade-up"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <CardHeader>
                          <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-lg overflow-hidden">
                            <Store className="w-8 h-8 text-primary-foreground" />
                          </div>
                          <CardTitle className="group-hover:text-accent transition-colors font-display">
                            {shop.name}
                          </CardTitle>
                          <CardDescription className="line-clamp-2">
                            {shop.description || "Visit this shop to see their products"}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm text-accent font-medium group-hover:translate-x-1 transition-transform flex items-center gap-1">
                            Visit Store 
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>

                {/* Shops Loading Skeleton */}
                {loadingMoreShops && (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
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
      <section className="relative pt-28 pb-12 overflow-hidden">
        <AdirePattern variant="geometric" className="text-primary" opacity={0.5} />
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-accent font-semibold text-sm">Discover Nigerian Businesses</span>
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Explore <span className="gradient-text">Amazing Shops</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Discover unique products from talented Nigerian entrepreneurs
            </p>

            {/* Search */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search shops or products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-base bg-card/80 backdrop-blur-sm border-border/50 focus:border-accent shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 pb-20">
        <div className="max-w-6xl mx-auto">
          {renderContent()}

          {/* Infinite scroll sentinel */}
          {(hasMoreShops || hasMoreProducts) && (
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
          {!isLoading && shops.length === 0 && productResults.length === 0 && debouncedSearchQuery && (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
                <Search className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">
                No results found
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Try searching with different keywords or browse all shops
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

