import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Sparkles, Store, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface FeaturedShop {
  id: string;
  shop_id: string;
  label: string;
  tagline: string | null;
  display_order: number;
  shop: {
    shop_name: string;
    shop_slug: string;
    logo_url: string | null;
    description: string | null;
    state: string | null;
    country: string | null;
  };
}

export const FeaturedShopsBanner = () => {
  const [featuredShops, setFeaturedShops] = useState<FeaturedShop[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true, 
      align: "start",
      skipSnaps: false,
      containScroll: "trimSnaps",
    },
    [
      Autoplay({ 
        delay: 4000, 
        stopOnInteraction: false,
        stopOnMouseEnter: true,
      })
    ]
  );

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    fetchFeaturedShops();
  }, []);

  const trackClick = async (featured: FeaturedShop) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const deviceType = window.innerWidth < 768 ? 'mobile' : 
                         window.innerWidth < 1024 ? 'tablet' : 'desktop';
      
      supabase.from('featured_shop_analytics').insert({
        featured_shop_id: featured.id,
        shop_id: featured.shop_id,
        user_id: user?.id || null,
        source: 'homepage',
        device_type: deviceType
      });
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  };

  const fetchFeaturedShops = async () => {
    try {
      const { data, error } = await supabase
        .from("featured_shops")
        .select(`
          id,
          shop_id,
          label,
          tagline,
          display_order,
          shops!inner (
            shop_name,
            shop_slug,
            logo_url,
            description,
            state,
            country
          )
        `)
        .eq("is_active", true)
        .or('expires_at.is.null,expires_at.gt.now()')
        .order("display_order", { ascending: true });

      if (error) throw error;

      const transformed = (data || []).map((item: any) => ({
        ...item,
        shop: item.shops
      }));

      setFeaturedShops(transformed);
    } catch (error) {
      console.error("Error fetching featured shops:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!loading && featuredShops.length === 0) return null;

  if (loading) {
    return (
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="p-2 bg-accent/10 rounded-xl">
              <Sparkles className="w-4 h-4 text-accent" />
            </div>
            <span className="text-sm font-semibold text-foreground">Featured Shops</span>
          </div>
          <div className="flex gap-5 overflow-hidden">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 w-[340px] rounded-2xl flex-shrink-0" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4 relative group">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-accent/10 rounded-xl">
              <Sparkles className="w-4 h-4 text-accent" />
            </div>
            <div>
              <span className="text-sm font-semibold text-foreground">Featured Shops</span>
              <span className="text-xs text-muted-foreground ml-2 hidden sm:inline">• Curated for you</span>
            </div>
          </div>
          
          {featuredShops.length > 2 && (
            <div className="flex items-center gap-2">
              <button
                onClick={scrollPrev}
                className="p-2 rounded-xl bg-muted/60 hover:bg-muted transition-colors"
                aria-label="Previous"
              >
                <ChevronLeft className="w-4 h-4 text-muted-foreground" />
              </button>
              <button
                onClick={scrollNext}
                className="p-2 rounded-xl bg-muted/60 hover:bg-muted transition-colors"
                aria-label="Next"
              >
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          )}
        </div>

        {/* Carousel */}
        <div className="overflow-hidden -mx-1" ref={emblaRef}>
          <div className="flex gap-5 px-1">
            {featuredShops.map((featured) => (
              <Link
                key={featured.id}
                to={`/shop/${featured.shop.shop_slug}`}
                onClick={() => trackClick(featured)}
                className="flex-shrink-0 w-[340px]"
              >
                <div className={cn(
                  "relative rounded-2xl border border-border/50 bg-card p-5 h-[160px]",
                  "transition-all duration-300 ease-out",
                  "hover:shadow-xl hover:shadow-accent/5 hover:scale-[1.02] hover:border-accent/30",
                  "cursor-pointer overflow-hidden group/card"
                )}>
                  {/* Subtle gradient on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5 opacity-0 group-hover/card:opacity-100 transition-opacity rounded-2xl" />
                  
                  {/* Badge - top right */}
                  <div className="relative flex items-center justify-end mb-4">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-accent/10 border border-accent/20 rounded-full">
                      <Sparkles className="w-3 h-3 text-accent" />
                      <span className="text-[10px] font-semibold text-accent uppercase tracking-wider">
                        {featured.label}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="relative flex items-center gap-4">
                    {/* Logo */}
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-muted flex-shrink-0 ring-1 ring-border/50">
                      {featured.shop.logo_url ? (
                        <img
                          src={featured.shop.logo_url}
                          alt={featured.shop.shop_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                          <Store className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-base truncate mb-1">
                        {featured.shop.shop_name}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-2">
                        {featured.tagline || featured.shop.description || "Discover amazing products"}
                      </p>
                      {(featured.shop.state || featured.shop.country) && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-muted-foreground/70" />
                          <span className="text-[11px] text-muted-foreground/70">
                            {[featured.shop.state, featured.shop.country].filter(Boolean).join(", ")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
