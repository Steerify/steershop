import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopSellerBannerProps {
  className?: string;
}

interface TopSeller {
  id: string;
  shop_id: string;
  month_year: string;
  total_sales: number;
  shop?: {
    shop_name: string;
    shop_slug: string;
    logo_url?: string;
  };
}

export const TopSellerBanner = ({ className }: TopSellerBannerProps) => {
  const [topSeller, setTopSeller] = useState<TopSeller | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTopSeller();
  }, []);

  const fetchTopSeller = async () => {
    try {
      const currentMonth = new Date().toISOString().substring(0, 7);
      
      const { data, error } = await supabase
        .from("top_seller_banners")
        .select(`
          *,
          shop:shops(shop_name, shop_slug, logo_url)
        `)
        .eq("is_active", true)
        .eq("month_year", currentMonth)
        .maybeSingle();

      if (error) {
        console.error("Error fetching top seller:", error);
        return;
      }

      setTopSeller(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !topSeller) return null;

  return (
    <Card className={cn(
      "overflow-hidden border-2 border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-yellow-500/10",
      className
    )}>
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-1 min-w-[200px]">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-lg">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                  TOP SELLER OF THE MONTH
                </span>
                <Sparkles className="w-4 h-4 text-yellow-500" />
              </div>
              <p className="text-lg font-bold text-foreground">
                🏆 {topSeller.shop?.shop_name} achieved {topSeller.total_sales}+ sales!
              </p>
            </div>
          </div>
          
          <Link to={`/shop/${topSeller.shop?.shop_slug}`}>
            <Button 
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg"
            >
              Visit Store
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
