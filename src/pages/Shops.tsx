import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Search, Store, Package } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";

interface Shop {
  id: string;
  shop_name: string;
  shop_slug: string;
  description: string | null;
  logo_url: string | null;
  owner_id: string;
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

const Shops = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [productResults, setProductResults] = useState<ProductResult[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      // Get all active shops with valid subscriptions using secure public view
      // The view already filters by is_active and subscription status
      const { data, error } = await supabase
        .from("shops_public")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setShops(data || []);
    } catch (error) {
      console.error("Error fetching shops:", error);
      setShops([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery.trim()) {
      searchProducts();
    } else {
      setProductResults([]);
    }
  }, [searchQuery]);

  const searchProducts = async () => {
    try {
      // Search for products matching the query
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

      // Get shop details for these products
      const shopIds = [...new Set(productsData.map(p => p.shop_id))];
      const { data: shopsData, error: shopsError } = await supabase
        .from("shops_public")
        .select("*")
        .in("id", shopIds);

      if (shopsError) throw shopsError;

      // Map products with shop info
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4">Explore Shops</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover amazing products from talented Nigerian entrepreneurs
            </p>
          </div>

          <div className="mb-8">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search shops or products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Product Results */}
          {searchQuery && productResults.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Product Results ({productResults.length})</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {productResults.map((product) => (
                  <Link key={product.id} to={`/shop/${product.shop_slug}`}>
                    <Card className="h-full hover:shadow-lg transition-all hover:border-accent cursor-pointer group">
                      <CardHeader>
                        {product.image_url ? (
                          <div className="w-full h-48 mb-4 overflow-hidden rounded-lg">
                            <img 
                              src={product.image_url} 
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                        ) : (
                          <div className="w-full h-48 mb-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center">
                            <Package className="w-16 h-16 text-muted-foreground" />
                          </div>
                        )}
                        <CardTitle className="group-hover:text-accent transition-colors text-lg">
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
                              <Store className="w-4 h-4" />
                            )}
                            <span>{product.shop_name}</span>
                          </div>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold text-primary">₦{product.price.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {product.stock_quantity} in stock
                            </p>
                          </div>
                          <Badge variant="secondary">
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
            {searchQuery && <h2 className="text-2xl font-bold mb-6">Shops ({filteredShops.length})</h2>}
            
            {isLoading ? (
              <div className="text-center py-12">
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
                <p className="text-muted-foreground mt-4">Loading shops...</p>
              </div>
            ) : filteredShops.length === 0 ? (
              <div className="text-center py-12">
                <Store className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-xl text-muted-foreground">
                  {searchQuery ? "No shops found matching your search" : "No active shops available"}
                </p>
                {!searchQuery && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Shops appear here when their owners have active subscriptions or are in trial period
                  </p>
                )}
              </div>
            ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredShops.map((shop) => (
                <Link key={shop.id} to={`/shop/${shop.shop_slug}`}>
                  <Card className="h-full hover:shadow-lg transition-all hover:border-accent cursor-pointer group">
                    <CardHeader>
                      <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                        {shop.logo_url ? (
                          <img 
                            src={shop.logo_url} 
                            alt={shop.shop_name}
                            className="w-full h-full object-cover rounded-xl"
                          />
                        ) : (
                          <Store className="w-8 h-8 text-primary-foreground" />
                        )}
                      </div>
                      <CardTitle className="group-hover:text-accent transition-colors">
                        {shop.shop_name}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {shop.description || "Visit this shop to see their products"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-accent font-medium group-hover:translate-x-1 transition-transform">
                        Visit Store →
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            )}

            {/* Show total count when there are shops */}
            {filteredShops.length > 0 && (
              <div className="text-center mt-8">
                <p className="text-muted-foreground">
                  Showing {filteredShops.length} of {shops.length} active shops
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shops;