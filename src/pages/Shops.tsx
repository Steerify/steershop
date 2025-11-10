import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Search, Store } from "lucide-react";
import Navbar from "@/components/Navbar";
import { calculateSubscriptionStatus } from "@/utils/subscription";

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

const Shops = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      // Get all active shops using secure public view
      const { data: shopsData, error: shopsError } = await supabase
        .from("shops_public")
        .select("*")
        .order("created_at", { ascending: false });

      if (shopsError) throw shopsError;

      if (!shopsData || shopsData.length === 0) {
        setShops([]);
        setIsLoading(false);
        return;
      }

      // Get the owner IDs from the shops
      const ownerIds = shopsData.map(shop => shop.owner_id);

      // Fetch profiles with subscription status
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, is_subscribed, subscription_expires_at, created_at")
        .in("id", ownerIds);

      if (profilesError) throw profilesError;

      // Filter shops to only include those with active subscriptions or valid trials
      const activeShops = shopsData.filter(shop => {
        const ownerProfile = profilesData?.find(profile => profile.id === shop.owner_id);
        
        if (!ownerProfile) {
          console.log('❌ No profile found for shop:', shop.shop_name, 'Owner ID:', shop.owner_id);
          return false;
        }

        const subscriptionInfo = calculateSubscriptionStatus(ownerProfile);
        const isActive = subscriptionInfo.status === 'active' || subscriptionInfo.status === 'trial';
        console.log('🏪 Shop:', shop.shop_name, '| Status:', subscriptionInfo.status, '| Days:', subscriptionInfo.daysRemaining, '| Visible:', isActive, '| Subscribed:', ownerProfile.is_subscribed, '| Expires:', ownerProfile.subscription_expires_at);
        return isActive;
      });

      setShops(activeShops);
    } catch (error) {
      console.error("Error fetching shops:", error);
      setShops([]);
    } finally {
      setIsLoading(false);
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
                placeholder="Search shops..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

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
  );
};

export default Shops;