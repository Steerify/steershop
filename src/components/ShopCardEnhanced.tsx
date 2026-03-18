import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Store, BadgeCheck, Star } from "lucide-react";
import { Shop } from "@/types/api";

interface ShopCardEnhancedProps {
  shop: Shop;
  productPreviews?: { image_url: string; name: string }[];
  productCount?: number;
  index?: number;
  isBusinessPlan?: boolean;
  displayCategory?: string;
}

export const ShopCardEnhanced = ({ shop, productPreviews = [], productCount = 0, index = 0, isBusinessPlan = false, displayCategory }: ShopCardEnhancedProps) => {
  const heroImage = productPreviews[0]?.image_url || shop.logo_url;

  return (
    <Link to={`/shop/${shop.slug || shop.shop_slug}`}>
      <div
        className="shopify-card group animate-fade-up cursor-pointer"
        style={{ animationDelay: `${index * 0.05}s` }}
      >
        {/* Image — large, dominant */}
        <div className="shopify-product-image relative">
          {heroImage ? (
            <img src={heroImage} alt={shop.name || shop.shop_name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <Store className="w-12 h-12 text-muted-foreground/40" />
            </div>
          )}
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors" />
          {/* Badges overlaid */}
          <div className="absolute top-3 left-3 flex gap-1.5">
            {shop.is_verified && (
              <div className="w-6 h-6 bg-background/90 backdrop-blur-sm rounded-full flex items-center justify-center">
                <BadgeCheck className="w-3.5 h-3.5 text-accent" />
              </div>
            )}
            {isBusinessPlan && (
              <div className="px-2 py-0.5 bg-background/90 backdrop-blur-sm rounded-full text-[10px] font-semibold text-foreground flex items-center gap-1">
                <Star className="w-2.5 h-2.5 fill-current text-gold" />
                Premium
              </div>
            )}
          </div>
        </div>

        {/* Text — clean, minimal */}
        <div className="pt-3 pb-2">
          <h3 className="font-medium text-sm text-foreground group-hover:text-accent transition-colors line-clamp-1">
            {shop.name || shop.shop_name}
          </h3>
          {displayCategory && displayCategory !== 'other' && (
            <p className="text-xs text-muted-foreground mt-0.5">{displayCategory}</p>
          )}
          <div className="flex items-center gap-2 mt-1">
            {(shop.total_reviews ?? 0) > 0 ? (
              <span className="text-xs text-muted-foreground">
                ★ {shop.average_rating?.toFixed(1)} ({shop.total_reviews})
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">New</span>
            )}
            {productCount > 0 && (
              <span className="text-xs text-muted-foreground">
                · {productCount} items
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};
