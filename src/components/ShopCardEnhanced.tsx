import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Store, BadgeCheck, MapPin, Star, Package } from "lucide-react";
import { Shop } from "@/types/api";

interface ShopCardEnhancedProps {
  shop: Shop;
  productPreviews?: { image_url: string; name: string }[];
  productCount?: number;
  index?: number;
  isBusinessPlan?: boolean;
}

export const ShopCardEnhanced = ({ shop, productPreviews = [], productCount = 0, index = 0, isBusinessPlan = false }: ShopCardEnhancedProps) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${i < Math.round(rating) ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground/30'}`}
      />
    ));
  };

  return (
    <Link to={`/shop/${shop.slug || shop.shop_slug}`}>
      <Card
        className="h-full hover:border-accent/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer group bg-card/80 backdrop-blur-sm animate-fade-up overflow-hidden"
        style={{ animationDelay: `${index * 0.05}s` }}
      >
        {/* Banner / Logo area */}
        <CardHeader className="p-4 sm:p-5 pb-3">
          <div className="flex items-start gap-3">
            <div className="relative shrink-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg overflow-hidden">
                {shop.logo_url ? (
                  <img src={shop.logo_url} alt={shop.name || shop.shop_name} className="w-full h-full object-cover" />
                ) : (
                  <Store className="w-7 h-7 text-primary-foreground" />
                )}
              </div>
              {shop.is_verified && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-sm border-2 border-card">
                  <BadgeCheck className="w-3 h-3 text-white" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <CardTitle className="group-hover:text-accent transition-colors font-display text-sm sm:text-base line-clamp-1">
                  {shop.name || shop.shop_name}
                </CardTitle>
                {isBusinessPlan && (
                  <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 text-[10px] px-1.5 py-0">
                    <Star className="w-2.5 h-2.5 mr-0.5 fill-current" />
                    Premium
                  </Badge>
                )}
                {shop.is_verified && (
                  <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 text-[10px] px-1.5 py-0">
                    Verified
                  </Badge>
                )}
              </div>
              <CardDescription className="line-clamp-2 text-xs mt-0.5">
                {shop.description || "Visit this shop to see their products"}
              </CardDescription>

              {/* Location */}
              {(shop.state || shop.country) && (
                <div className="flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                  <span className="text-[11px] text-muted-foreground truncate">
                    {[shop.state, shop.country].filter(Boolean).join(", ")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        {/* Product previews */}
        {productPreviews.length > 0 && (
          <div className="px-4 sm:px-5 pb-2">
            <div className="flex gap-1.5">
              {productPreviews.slice(0, 3).map((p, i) => (
                <div key={i} className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                </div>
              ))}
              {productCount > 3 && (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-muted/60 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs text-muted-foreground font-medium">+{productCount - 3}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <CardContent className="p-4 sm:p-5 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Rating stars */}
              {(shop.total_reviews ?? 0) > 0 ? (
                <div className="flex items-center gap-1">
                  <div className="flex">{renderStars(shop.average_rating || 0)}</div>
                  <span className="text-xs text-muted-foreground">({shop.total_reviews})</span>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">New shop</span>
              )}
            </div>
            
            <div className="flex items-center gap-1.5">
              {productCount > 0 && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  <Package className="w-2.5 h-2.5 mr-0.5" />
                  {productCount}
                </Badge>
              )}
              <span className="text-xs font-medium text-accent group-hover:translate-x-0.5 transition-transform">
                Visit →
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
