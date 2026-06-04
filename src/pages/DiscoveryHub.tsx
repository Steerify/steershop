import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Store, MapPin, Sparkles, ArrowRight, ChevronRight, Filter, ShoppingBag } from "lucide-react";
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
    if (!hubSlug) return { categorySlug: 'all', city: 'Nigeria' };
    const parts = hubSlug.split('-in-');
    if (parts.length === 2) {
      return { 
        categorySlug: parts[0], 
        city: parts[1].split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') 
      };
    }
    return { categorySlug: hubSlug, city: 'Nigeria' };
  }, [hubSlug]);

  const categoryLabel = getCategoryLabel(categorySlug);

  useEffect(() => {
    const fetchHubData = async () => {
      setIsLoading(true);
      try {
        // Fetch all active shops
        const response = await shopService.getShops(1, 50, { activeOnly: true });
        if (response.success && response.data) {
          let filtered = response.data;

          // Filter by category (using autoCategorize for now, which is robust)
          if (categorySlug !== 'all') {
            filtered = filtered.filter(s => {
              const cat = autoCategorize(s.name || s.shop_name || '', s.description || '');
              return cat === categorySlug;
            });
          }

          // Filter by city/state
          if (city !== 'Nigeria') {
            filtered = filtered.filter(s => 
              s.state?.toLowerCase().includes(city.toLowerCase()) || 
              s.city?.toLowerCase().includes(city.toLowerCase())
            );
          }

          setShops(filtered);

          // Fetch product previews for these shops
          if (filtered.length > 0) {
            const shopIds = filtered.map(s => s.id);
            const { data: productData } = await supabase
              .from('products')
              .select('shop_id, image_url, name')
              .in('shop_id', shopIds)
              .eq('is_available', true)
              .is('delete_at', null)
              .not('image_url', 'is', null)
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
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={`${categorySlug} ${city}, buy ${categoryLabel} ${city}, best shops ${city}, steersolo discover, ${city} marketplace`} />
        <link rel="canonical" href={`https://steersolo.com/discover/${hubSlug}`} />
      </Helmet>

      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        {/* Hub Hero */}
        <section className="bg-card border-b border-border/40 py-12 mb-10">
          <div className="container mx-auto px-4">
            <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-6 overflow-x-auto whitespace-nowrap">
              <Link to="/" className="hover:text-primary transition-colors">Home</Link>
              <ChevronRight className="w-3 h-3" />
              <Link to="/shops" className="hover:text-primary transition-colors">Marketplace</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-foreground font-medium">{categoryLabel} in {city}</span>
            </nav>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                  <Sparkles className="w-3 h-3" />
                  Curated Collection
                </div>
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
                  The Best <span className="text-primary">{categoryLabel}</span> Stores in <span className="text-accent">{city}</span>
                </h1>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Supporting {shops.length} verified local entrepreneurs providing high-quality products and services across {city}.
                </p>
              </div>

              <div className="flex flex-col items-center gap-3 p-6 bg-background border border-primary/20 rounded-2xl shadow-xl shadow-primary/5">
                <div className="text-center">
                  <p className="text-sm font-bold text-foreground">Are you a merchant in {city}?</p>
                  <p className="text-xs text-muted-foreground mb-3">Join our community and reach more customers.</p>
                </div>
                <Link to="/auth/entrepreneur" className="w-full">
                  <Button className="w-full rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90">
                    Register Your Shop <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
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
                <div key={i} className="bg-card border border-border/60 rounded-2xl overflow-hidden animate-pulse">
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
              <h3 className="text-2xl font-bold mb-2">No {categoryLabel} shops yet in {city}</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-8">
                We're currently expanding our network in {city}. Be the first {categoryLabel} merchant to join and claim this spot!
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
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-6">Other Popular Hubs</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/discover/fashion-in-lagos" className="text-sm hover:text-primary transition-colors">Fashion in Lagos</Link>
            <Link to="/discover/food-drinks-in-abuja" className="text-sm hover:text-primary transition-colors">Food in Abuja</Link>
            <Link to="/discover/electronics-in-ph" className="text-sm hover:text-primary transition-colors">Tech in Port Harcourt</Link>
            <Link to="/discover/skincare-in-lagos" className="text-sm hover:text-primary transition-colors">Skincare in Lagos</Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default DiscoveryHub;
