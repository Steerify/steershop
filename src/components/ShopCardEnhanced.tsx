import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Store, BadgeCheck, MapPin, Star, Package, MessageCircle, ShoppingCart, Share2, Play, Heart, Shield, Zap } from "lucide-react";
import { Shop } from "@/types/api";
import { SafeBeautyBadge } from "./SafeBeautyBadge";

interface ShopCardEnhancedProps {
  shop: Shop;
  productPreviews?: { image_url: string; name: string }[];
  productCount?: number;
  index?: number;
  isBusinessPlan?: boolean;
  displayCategory?: string;
}

export const ShopCardEnhanced = ({
  shop,
  productPreviews = [],
  productCount = 0,
  index = 0,
  isBusinessPlan = false,
  displayCategory,
}: ShopCardEnhancedProps) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${i < Math.round(rating) ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30"}`}
      />
    ));
  };

  // Action buttons configuration
  const actionButtons = [
    { icon: MessageCircle, label: "Chat on WhatsApp", href: "#", color: "text-green-600 dark:text-green-400" },
    { icon: ShoppingCart, label: "View Cart", href: "#", color: "text-blue-600 dark:text-blue-400" },
    { icon: Share2, label: "Share", href: "#", color: "text-purple-600 dark:text-purple-400" },
    { icon: Play, label: "Take Tour", href: "#", color: "text-red-600 dark:text-red-400" },
  ];

  return (
    <Link to={`/shop/${shop.slug || shop.shop_slug}`}>
      <div
        className="group relative flex flex-col h-full bg-card hover:bg-card/80 border border-border/40 hover:border-border/80 rounded-3xl overflow-hidden hover:shadow-xl hover:shadow-accent/5 transition-all duration-300 animate-fade-up"
        style={{ animationDelay: `${index * 0.05}s` }}
      >
        {/* Header with Shop Info and Action Buttons */}
        <div className="p-5 pb-3">
          <div className="flex items-start gap-4">
            {/* Logo */}
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center group-hover:ring-2 group-hover:ring-accent/40 transition-all overflow-hidden shadow-sm">
                {shop.logo_url ? (
                  <img
                    src={shop.logo_url}
                    alt={shop.name || shop.shop_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Store className="w-7 h-7 text-muted-foreground" />
                )}
              </div>
              {shop.is_verified && (
                <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-sm border-2 border-card">
                  <BadgeCheck className="w-3 h-3 text-white" />
                </div>
              )}
            </div>

            {/* Shop Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-semibold text-foreground group-hover:text-accent-text transition-colors text-sm sm:text-base line-clamp-1 tracking-tight">
                  {shop.name || shop.shop_name}
                </h3>
                {isBusinessPlan && (
                  <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 text-[10px] px-1.5 py-0">
                    <Star className="w-2.5 h-2.5 mr-0.5 fill-current" />
                    Premium
                  </Badge>
                )}
                {shop.tier && (
                  <SafeBeautyBadge
                    tier={shop.tier}
                    showTooltip={false}
                    size="sm"
                  />
                )}
                {!shop.tier && shop.is_verified && (
                  <Badge className="bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 dark:text-accent dark:border-accent/30 text-[10px] px-1.5 py-0">
                    Verified
                  </Badge>
                )}
              </div>

              {/* Description with proper truncation */}
              <p className="text-muted-foreground line-clamp-2 text-xs mt-1 leading-relaxed">
                {shop.description || "Visit this shop to see their products"}
              </p>

              {/* Badges Row - SteerSolo Safe Listed and Quick Response */}
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {displayCategory && displayCategory !== "other" && (
                  <Badge className="bg-muted text-muted-foreground border-border text-[10px] px-1.5 py-0 font-normal">
                    {displayCategory}
                  </Badge>
                )}
                
                {/* SteerSolo Safe Listed Badge */}
                <Badge className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 text-[10px] px-1.5 py-0 flex items-center gap-1">
                  <Shield className="w-2.5 h-2.5" />
                  SteerSolo Safe Listed
                </Badge>

                {/* Quick Response Badge */}
                <Badge className="bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800 text-[10px] px-1.5 py-0 flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5" />
                  Quick Response
                </Badge>
              </div>

              {/* Location */}
              {(shop.state || shop.country || shop.city) && (
                <div className="flex items-center gap-1 mt-1.5">
                  <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                  <span className="text-[11px] text-muted-foreground truncate">
                    {[shop.city, shop.state, shop.country]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons Row - Integrated with Follow Store */}
          <div className="flex items-center justify-end gap-1.5 mt-3 pt-3 border-t border-border/40">
            <span className="text-[10px] text-muted-foreground font-medium mr-auto">
              Quick Actions
            </span>
            {actionButtons.map((btn, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.preventDefault();
                  // Handle button clicks
                  console.log(`${btn.label} clicked`);
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-muted/50 hover:bg-muted border border-border/30 transition-all duration-200 group/btn"
              >
                <btn.icon className={`w-3.5 h-3.5 ${btn.color}`} />
                <span className="text-[10px] font-medium text-foreground/70 group-hover/btn:text-foreground whitespace-nowrap">
                  {btn.label}
                </span>
              </button>
            ))}
            {/* Follow Store button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                console.log("Follow store clicked");
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 shadow-sm"
            >
              <Heart className="w-3.5 h-3.5" />
              <span className="text-[10px] font-semibold whitespace-nowrap">Follow Store</span>
            </button>
          </div>
        </div>

        {/* Product previews */}
        {productPreviews.length > 0 ? (
          <div className="px-5 pb-3">
            <div className="flex gap-2">
              {productPreviews.slice(0, 3).map((p, i) => (
                <div
                  key={i}
                  className="w-[72px] h-[72px] rounded-xl overflow-hidden bg-muted flex-shrink-0"
                >
                  <img
                    src={p.image_url}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              {productCount > 3 && (
                <div className="w-[72px] h-[72px] rounded-xl bg-muted/60 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs text-muted-foreground font-medium">
                    +{productCount - 3}
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : productCount > 0 ? (
          <div className="px-5 pb-3">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/40 border border-border/40">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                <Package className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">
                  {productCount}{" "}
                  {productCount === 1 ? "service" : "services/items"} available
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Visit shop to explore the full catalogue
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {/* Footer with rating and items count */}
        <div className="px-5 pb-5 pt-1 mt-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {(shop.total_reviews ?? 0) > 0 ? (
                <div className="flex items-center gap-1">
                  <div className="flex">
                    {renderStars(shop.average_rating || 0)}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    ({shop.total_reviews})
                  </span>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">New shop</span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {productCount > 0 && (
                <span className="text-[11px] text-muted-foreground flex items-center gap-0.5 font-medium">
                  <Package className="w-3.5 h-3.5 text-accent/70" />
                  {productCount} items
                </span>
              )}
              <span className="inline-flex items-center justify-center rounded-full bg-foreground text-background px-3 py-1 text-xs font-semibold sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shadow-sm">
                Visit →
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};