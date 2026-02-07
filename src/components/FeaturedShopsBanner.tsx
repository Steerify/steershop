import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Sparkles, Store, ChevronLeft, ChevronRight } from "lucide-react";
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
      dragFree: true,
    },
    [
      Autoplay({ 
        delay: 3000, 
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

  // Track click analytics (fire and forget)
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
            description
          )
        `)
        .eq("is_active", true)
        .or('expires_at.is.null,expires_at.gt.now()')
        .order("display_order", { ascending: true });

      if (error) throw error;

      // Transform the data to match our interface
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

  // Don't render anything if no featured shops
  if (!loading && featuredShops.length === 0) {
    return null;
  }

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium text-muted-foreground">Featured Shops</span>
        </div>
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-64 rounded-xl flex-shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full relative group container mx-auto px-4">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-accent/10 rounded-lg">
            <Sparkles className="w-4 h-4 text-accent" />
          </div>
          <span className="text-sm font-semibold text-foreground">Featured Shops</span>
          <span className="text-xs text-muted-foreground hidden sm:inline">• Curated for you</span>
        </div>
        
        {/* Navigation Arrows */}
        {featuredShops.length > 2 && (
          <div className="flex items-center gap-1">
            <button
              onClick={scrollPrev}
              className="p-1.5 rounded-full bg-muted hover:bg-muted/80 transition-colors opacity-0 group-hover:opacity-100"
              aria-label="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={scrollNext}
              className="p-1.5 rounded-full bg-muted hover:bg-muted/80 transition-colors opacity-0 group-hover:opacity-100"
              aria-label="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Carousel */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4">
          {featuredShops.map((featured) => (
            <Link
              key={featured.id}
              to={`/shop/${featured.shop.shop_slug}`}
              onClick={() => trackClick(featured)}
              className="flex-shrink-0 w-[280px] sm:w-[320px]"
            >
              <div className={cn(
                "relative h-[88px] rounded-xl border bg-card p-4",
                "transition-all duration-300 ease-out",
                "hover:shadow-lg hover:scale-[1.02] hover:border-accent/40",
                "cursor-pointer overflow-hidden group/card"
              )}>
                {/* Subtle gradient background */}
                <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-primary/5 opacity-0 group-hover/card:opacity-100 transition-opacity" />
                
                {/* Content */}
                <div className="relative flex items-center gap-4 h-full">
                  {/* Logo */}
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted flex-shrink-0 shadow-sm">
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

                  {/* Text Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-semibold text-foreground truncate">
                        {featured.shop.shop_name}
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {featured.tagline || featured.shop.description || "Discover amazing products"}
                    </p>
                  </div>

                  {/* Featured Badge */}
                  <div className="absolute top-2 right-2">
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-accent/10 border border-accent/20 rounded-full">
                      <Sparkles className="w-3 h-3 text-accent" />
                      <span className="text-[10px] font-medium text-accent uppercase tracking-wide">
                        {featured.label}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
