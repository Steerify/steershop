import { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Search, Store, Package, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AdirePattern } from "@/components/patterns/AdirePattern";
import { calculateSubscriptionStatus } from "@/utils/subscription";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/use-debounce";

interface Shop {
  id: string;
  shop_name: string;
  shop_slug: string;
  description: string | null;
  logo_url: string | null;
  owner_id: string;
}

interface Profile {
  id: string;
  is_subscribed: boolean;
  subscription_expires_at: string | null;
  created_at: string;
}

interface ProductResult {
  id: string;
  name: string;
  price: number;
  stock_quantity: number;
  image_url: string | null;
  shop_id: string;
  shop_name: string;
  shop_slug: string;
  shop_logo: string | null;
}

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
  const [productResults, setProductResults] = useState<ProductResult[]>([]);
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

  const fetchShops = useCallback(async (page: number = 0, reset: boolean = false) => {
    try {
      if (reset) {
        setIsLoading(true);
      } else {
        setLoadingMoreShops(true);
      }

      const from = page * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from("shops_public")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, to);

      const { data: shopsData, error: shopsError } = await query;

      if (shopsError) throw shopsError;

      if (!shopsData || shopsData.length === 0) {
        setHasMoreShops(false);
        if (reset) {
          setShops([]);
        }
        return;
      }

      setHasMoreShops(shopsData.length === ITEMS_PER_PAGE);

      const ownerIds = shopsData.map(shop => shop.owner_id);

      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, is_subscribed, subscription_expires_at, created_at")
        .in("id", ownerIds);

      if (profilesError) throw profilesError;

      const activeShops = shopsData.filter(shop => {
        const ownerProfile = profilesData?.find(profile => profile.id === shop.owner_id);
        
        if (!ownerProfile) {
          return false;
        }

        const subscriptionInfo = calculateSubscriptionStatus(ownerProfile);
        return subscriptionInfo.status === 'active' || subscriptionInfo.status === 'trial';
      });

      setShops(prev => {
        if (reset) return activeShops;
        
        const existingIds = new Set(prev.map(shop => shop.id));
        const newShops = activeShops.filter(shop => !existingIds.has(shop.id));
        return [...prev, ...newShops];
      });
      
      if (!reset) {
        setShopsPage(prev => prev + 1);
      } else {
        setShopsPage(0);
      }
    } catch (error) {
      console.error("Error fetching shops:", error);
      if (reset) {
        setShops([]);
      }
    } finally {
      setIsLoading(false);
      setLoadingMoreShops(false);
    }
  }, []);

  const searchShops = useCallback(async (page: number = 0, reset: boolean = false) => {
    try {
      if (reset) {
        setIsLoading(true);
      } else {
        setLoadingMoreShops(true);
      }

      const from = page * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from("shops_public")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, to);

      if (debouncedSearchQuery.trim()) {
        query = query.ilike('shop_name', `%${debouncedSearchQuery}%`);
      }

      const { data: shopsData, error: shopsError } = await query;

      if (shopsError) throw shopsError;

      if (!shopsData || shopsData.length === 0) {
        setHasMoreShops(false);
        if (reset) {
          setShops([]);
        }
        return;
      }

      setHasMoreShops(shopsData.length === ITEMS_PER_PAGE);

      const ownerIds = shopsData.map(shop => shop.owner_id);

      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, is_subscribed, subscription_expires_at, created_at")
        .in("id", ownerIds);

      if (profilesError) throw profilesError;

      const activeShops = shopsData.filter(shop => {
        const ownerProfile = profilesData?.find(profile => profile.id === shop.owner_id);
        
        if (!ownerProfile) {
          return false;
        }

        const subscriptionInfo = calculateSubscriptionStatus(ownerProfile);
        return subscriptionInfo.status === 'active' || subscriptionInfo.status === 'trial';
      });

      setShops(prev => {
        if (reset) return activeShops;
        
        const existingIds = new Set(prev.map(shop => shop.id));
        const newShops = activeShops.filter(shop => !existingIds.has(shop.id));
        return [...prev, ...newShops];
      });
      
      if (!reset) {
        setShopsPage(prev => prev + 1);
      } else {
        setShopsPage(0);
      }
    } catch (error) {
      console.error("Error searching shops:", error);
      if (reset) {
        setShops([]);
      }
    } finally {
      setIsLoading(false);
      setLoadingMoreShops(false);
    }
  }, [debouncedSearchQuery]);

  const searchProducts = useCallback(async (page: number = 0, reset: boolean = false) => {
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

      const from = page * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select(`
          id,
          name,
          price,
          stock_quantity,
          image_url,
          shop_id,
          is_available
        `)
        .ilike('name', `%${debouncedSearchQuery}%`)
        .eq('is_available', true)
        .gt('stock_quantity', 0)
        .range(from, to)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;

      if (!productsData || productsData.length === 0) {
        setHasMoreProducts(false);
        if (reset) {
          setProductResults([]);
        }
        return;
      }

      setHasMoreProducts(productsData.length === ITEMS_PER_PAGE);

      const shopIds = [...new Set(productsData.map(p => p.shop_id))];
      const { data: shopsData, error: shopsError } = await supabase
        .from("shops_public")
        .select("*")
        .in("id", shopIds);

      if (shopsError) throw shopsError;

      const results: ProductResult[] = productsData.map(product => {
        const shop = shopsData?.find(s => s.id === product.shop_id);
        return {
          id: product.id,
          name: product.name,
          price: product.price,
          stock_quantity: product.stock_quantity,
          image_url: product.image_url,
          shop_id: product.shop_id,
          shop_name: shop?.shop_name || 'Unknown Shop',
          shop_slug: shop?.shop_slug || '',
          shop_logo: shop?.logo_url || null,
        };
      });

      setProductResults(prev => {
        if (reset) return results;
        
        const existingIds = new Set(prev.map(product => product.id));
        const newProducts = results.filter(product => !existingIds.has(product.id));
        return [...prev, ...newProducts];
      });
      
      if (!reset) {
        setProductsPage(prev => prev + 1);
      } else {
        setProductsPage(0);
      }
    } catch (error) {
      console.error("Error searching products:", error);
      if (reset) {
        setProductResults([]);
      }
    } finally {
      setIsLoading(false);
      setLoadingMoreProducts(false);
    }
  }, [debouncedSearchQuery]);

  // Initial load of shops
  useEffect(() => {
    if (!debouncedSearchQuery) {
      fetchShops(0, true);
    }
  }, [debouncedSearchQuery, fetchShops]);

  // Search when query changes
  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      // Reset both results when search starts
      setSearchType('all');
      setShopsPage(0);
      setProductsPage(0);
      setHasMoreShops(true);
      setHasMoreProducts(true);
      
      // Fetch both shops and products
      Promise.all([
        searchShops(0, true),
        searchProducts(0, true)
      ]);
    } else {
      // Clear results when search is empty
      setProductResults([]);
      setSearchType('all');
      fetchShops(0, true);
    }
  }, [debouncedSearchQuery, searchShops, searchProducts, fetchShops]);

  const handleSearchTypeChange = (type: 'all' | 'shops' | 'products') => {
    setSearchType(type);
    // Reset scroll when changing search type
    setShopsPage(0);
    setProductsPage(0);
    setHasMoreShops(true);
    setHasMoreProducts(true);
    
    if (type === 'shops') {
      searchShops(0, true);
    } else if (type === 'products') {
      searchProducts(0, true);
    } else {
      // For 'all', we need to load both
      Promise.all([
        searchShops(0, true),
        searchProducts(0, true)
      ]);
    }
  };

  // Determine which content is currently being displayed and needs infinite scroll
  const getCurrentContent = () => {
    if (!debouncedSearchQuery) return 'shops';
    if (searchType === 'products') return 'products';
    if (searchType === 'shops') return 'shops';
    return 'all'; // When searchType is 'all', we need to handle both
  };

  const loadMore = useCallback(() => {
    const currentContent = getCurrentContent();
    
    if (currentContent === 'shops' && hasMoreShops && !loadingMoreShops) {
      if (debouncedSearchQuery) {
        searchShops(shopsPage + 1, false);
      } else {
        fetchShops(shopsPage + 1, false);
      }
    } else if (currentContent === 'products' && hasMoreProducts && !loadingMoreProducts) {
      searchProducts(productsPage + 1, false);
    } else if (currentContent === 'all') {
      // Load both shops and products when viewing all results
      if (hasMoreShops && !loadingMoreShops) {
        searchShops(shopsPage + 1, false);
      }
      if (hasMoreProducts && !loadingMoreProducts) {
        searchProducts(productsPage + 1, false);
      }
    }
  }, [
    getCurrentContent, hasMoreShops, hasMoreProducts, 
    loadingMoreShops, loadingMoreProducts, debouncedSearchQuery,
    shopsPage, productsPage, searchShops, searchProducts, fetchShops
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
                <Link key={`${product.id}-${index}`} to={`/shop/${product.shop_slug}`}>
                  <Card 
                    className="h-full card-african hover:border-accent/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer group bg-card/80 backdrop-blur-sm"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <CardHeader>
                      {product.image_url ? (
                        <div className="w-full h-48 mb-4 overflow-hidden rounded-lg">
                          <img 
                            src={product.image_url} 
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
                          {product.shop_logo ? (
                            <img 
                              src={product.shop_logo} 
                              alt={product.shop_name}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                              <Store className="w-3 h-3 text-primary-foreground" />
                            </div>
                          )}
                          <span>{product.shop_name}</span>
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold gradient-text">₦{product.price.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {product.stock_quantity} in stock
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
                    <Link key={`${shop.id}-${index}`} to={`/shop/${shop.shop_slug}`}>
                      <Card 
                        className="h-full card-african hover:border-accent/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer group bg-card/80 backdrop-blur-sm animate-fade-up"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <CardHeader>
                          <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-lg overflow-hidden">
                            {shop.logo_url ? (
                              <img 
                                src={shop.logo_url} 
                                alt={shop.shop_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Store className="w-8 h-8 text-primary-foreground" />
                            )}
                          </div>
                          <CardTitle className="group-hover:text-accent transition-colors font-display">
                            {shop.shop_name}
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

