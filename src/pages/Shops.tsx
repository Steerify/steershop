import { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Search, Store, Package, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AdirePattern } from "@/components/patterns/AdirePattern";
import { calculateSubscriptionStatus } from "@/utils/subscription";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

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
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const fetchShops = useCallback(async (currentPage: number = 0, reset: boolean = false) => {
    try {
      if (reset) {
        setIsLoading(true);
      } else {
        setLoadingMore(true);
      }

      const ITEMS_PER_PAGE = 12;
      const from = currentPage * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data: shopsData, error: shopsError } = await supabase
        .from("shops_public")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, to);

      if (shopsError) throw shopsError;

      if (!shopsData || shopsData.length === 0) {
        setHasMore(false);
        if (reset) {
          setShops([]);
        }
        return;
      }

      setHasMore(shopsData.length === ITEMS_PER_PAGE);

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
        
        // Prevent duplicates
        const existingIds = new Set(prev.map(shop => shop.id));
        const newShops = activeShops.filter(shop => !existingIds.has(shop.id));
        return [...prev, ...newShops];
      });
      
      if (!reset) {
        setPage(prevPage => prevPage + 1);
      } else {
        setPage(0);
      }
    } catch (error) {
      console.error("Error fetching shops:", error);
      if (reset) {
        setShops([]);
      }
    } finally {
      setIsLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchShops(0, true);
  }, [fetchShops]);

  useEffect(() => {
    if (searchQuery.trim()) {
      searchProducts();
    } else {
      setProductResults([]);
    }
  }, [searchQuery]);

  const searchProducts = async () => {
    try {
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
        .ilike('name', `%${searchQuery}%`)
        .eq('is_available', true)
        .gt('stock_quantity', 0);

      if (productsError) throw productsError;

      if (!productsData || productsData.length === 0) {
        setProductResults([]);
        return;
      }

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

      setProductResults(results);
    } catch (error) {
      console.error("Error searching products:", error);
      setProductResults([]);
    }
  };

  const filteredShops = shops.filter((shop) =>
    shop.shop_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    // Disable infinite scroll when searching
    if (searchQuery) {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          fetchShops(page + 1, false);
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
  }, [hasMore, loadingMore, searchQuery, page, fetchShops]);

  // Reset infinite scroll when search is cleared
  useEffect(() => {
    if (!searchQuery && shops.length === 0 && !isLoading) {
      fetchShops(0, true);
    }
  }, [searchQuery, shops.length, isLoading, fetchShops]);

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
          {/* Product Results */}
          {searchQuery && productResults.length > 0 && (
            <div className="mb-12 animate-fade-up">
              <h2 className="font-display text-2xl font-bold mb-6">
                Product Results <span className="text-accent">({productResults.length})</span>
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {productResults.map((product, index) => (
                  <Link key={product.id} to={`/shop/${product.shop_slug}`}>
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
            </div>
          )}

          {/* Shops Section */}
          <div>
            {searchQuery && <h2 className="font-display text-2xl font-bold mb-6">Shops <span className="text-accent">({filteredShops.length})</span></h2>}
            
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <ShopCardSkeleton key={index} />
                ))}
              </div>
            ) : filteredShops.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
                  <Store className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">
                  {searchQuery ? "No shops found" : "No active shops"}
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {searchQuery 
                    ? "Try a different search term" 
                    : "Shops appear here when their owners have active subscriptions"}
                </p>
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredShops.map((shop, index) => (
                    <Link key={shop.id} to={`/shop/${shop.shop_slug}`}>
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

                {/* Infinite scroll sentinel - Only show when not searching */}
                {!searchQuery && hasMore && (
                  <div 
                    ref={sentinelRef} 
                    className="h-20 flex items-center justify-center"
                  >
                    {loadingMore && (
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                        <span>Loading more shops...</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Show "No more shops" message when there are no more to load */}
                {!searchQuery && !hasMore && shops.length > 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      You've seen all shops for now! Check back later for new additions.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Shops;