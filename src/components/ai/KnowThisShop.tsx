import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Info, Star, Package, ShoppingCart, Calendar, MessageSquare, Shield, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface ShopIntelligence {
  shop_name: string;
  description: string | null;
  created_at: string;
  months_active: number;
  total_products: number;
  completed_orders: number;
  average_rating: number;
  total_reviews: number;
  has_logo: boolean;
  has_banner: boolean;
  has_whatsapp: boolean;
  accepts_paystack: boolean;
  recent_reviews: Array<{
    rating: number;
    comment: string | null;
    customer_name: string | null;
    created_at: string;
  }>;
  ai_summary: string | null;
}

interface KnowThisShopProps {
  shopId: string;
}

export const KnowThisShop = ({ shopId }: KnowThisShopProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<ShopIntelligence | null>(null);

  const loadShopIntelligence = async () => {
    setIsLoading(true);
    
    try {
      const { data: response, error } = await supabase.functions.invoke('know-this-shop', {
        body: { shop_id: shopId },
      });

      if (error) throw error;

      if (response?.success) {
        setData(response.data);
      } else {
        throw new Error(response?.error || 'Failed to load shop info');
      }
    } catch (error: any) {
      console.error('Know This Shop error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load shop information.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !data) {
      loadShopIntelligence();
    }
  }, [isOpen]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${i < rating ? "fill-gold text-gold" : "text-muted-foreground"}`}
      />
    ));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="text-muted-foreground hover:text-primary"
        >
          <Info className="w-4 h-4 mr-1" />
          Know This Shop
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Shop Intelligence
          </DialogTitle>
          <DialogDescription>
            Get to know this shop before you buy
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-20 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
            <Skeleton className="h-24 w-full" />
          </div>
        ) : data ? (
          <div className="space-y-4 py-2">
            {/* AI Summary */}
            {data.ai_summary && (
              <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg p-4 border border-primary/10">
                <p className="text-sm leading-relaxed">{data.ai_summary}</p>
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Calendar className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">On SteerSolo</p>
                  <p className="font-medium text-sm">
                    {data.months_active < 1 ? 'New shop' : `${data.months_active} months`}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Package className="w-5 h-5 text-accent" />
                <div>
                  <p className="text-xs text-muted-foreground">Products</p>
                  <p className="font-medium text-sm">{data.total_products} available</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <ShoppingCart className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Orders Delivered</p>
                  <p className="font-medium text-sm">{data.completed_orders}+</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Star className="w-5 h-5 text-gold" />
                <div>
                  <p className="text-xs text-muted-foreground">Rating</p>
                  <p className="font-medium text-sm">
                    {data.average_rating > 0 ? `${data.average_rating.toFixed(1)}/5` : 'No ratings'} 
                    {data.total_reviews > 0 && ` (${data.total_reviews})`}
                  </p>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-2">
              {data.has_whatsapp && (
                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                  WhatsApp Support
                </Badge>
              )}
              {data.accepts_paystack && (
                <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                  Secure Payments
                </Badge>
              )}
              {data.has_logo && data.has_banner && (
                <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/20">
                  Verified Branding
                </Badge>
              )}
              {data.completed_orders >= 10 && (
                <Badge variant="outline" className="bg-gold/10 text-gold border-gold/20">
                  Established Seller
                </Badge>
              )}
            </div>

            {/* Recent Reviews */}
            {data.recent_reviews.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Recent Reviews
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {data.recent_reviews.slice(0, 3).map((review, i) => (
                    <div key={i} className="p-2 rounded bg-muted/30 text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex">{renderStars(review.rating)}</div>
                        <span className="text-xs text-muted-foreground">
                          {review.customer_name || 'Customer'}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-muted-foreground text-xs line-clamp-2">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs text-center text-muted-foreground pt-2">
              Shop joined {format(new Date(data.created_at), "MMMM yyyy")}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
            <p className="text-muted-foreground text-sm">Loading shop info...</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
