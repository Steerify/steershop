import { useEffect, useState } from "react";
import { Store, Package, TrendingUp, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface StatItemProps {
  icon: React.ReactNode;
  value: string;
  label: string;
}

const StatItem = ({ icon, value, label }: StatItemProps) => (
  <div className="text-center group">
    <div className="inline-flex items-center justify-center w-12 h-12 mb-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
      {icon}
    </div>
    <div className="text-3xl md:text-4xl font-bold text-primary mb-1">{value}</div>
    <div className="text-sm text-muted-foreground">{label}</div>
  </div>
);

export const SocialProofStats = () => {
  const [stats, setStats] = useState({
    activeStores: "500+",
    productsListed: "10,000+",
    salesProcessed: "₦5M+",
    avgRating: "4.8★",
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [shopsResult, productsResult, salesResult, ratingsResult] = await Promise.all([
          supabase.from("shops").select("id", { count: "exact" }).eq("is_active", true),
          supabase.from("products").select("id", { count: "exact" }).eq("is_available", true),
          supabase.from("orders").select("total_amount").eq("payment_status", "paid"),
          supabase.from("reviews").select("rating"),
        ]);

        const shopCount = shopsResult.count || 0;
        const productCount = productsResult.count || 0;
        const totalSales = (salesResult.data || []).reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
        const ratings = ratingsResult.data || [];
        const avgRating = ratings.length > 0
          ? (ratings.reduce((sum, r) => sum + Number(r.rating), 0) / ratings.length).toFixed(1)
          : "4.8";

        const formatNumber = (num: number): string => {
          if (num >= 1_000_000_000) return `₦${(num / 1_000_000_000).toFixed(1)}B+`;
          if (num >= 1_000_000) return `₦${(num / 1_000_000).toFixed(1)}M+`;
          if (num >= 1_000) return `₦${(num / 1_000).toFixed(1)}K+`;
          if (num > 0) return `₦${num.toLocaleString()}+`;
          return "Growing";
        };

        const formatCount = (num: number): string => {
          if (num >= 10000) return `${Math.floor(num / 1000)}K+`;
          if (num >= 1000) return `${(num / 1000).toFixed(1)}K+`;
          if (num > 0) return `${num}+`;
          return "Growing";
        };

        setStats({
          activeStores: shopCount > 0 ? formatCount(shopCount) : "Growing",
          productsListed: productCount > 0 ? formatCount(productCount) : "Growing",
          salesProcessed: totalSales > 0 ? formatNumber(totalSales) : "Growing",
          avgRating: `${avgRating}★`,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <section className="py-12 md:py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Trust Badge */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-4">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Trusted by Nigerian Entrepreneurs</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          <StatItem
            icon={<Store className="w-6 h-6 text-primary" />}
            value={stats.activeStores}
            label="Active Stores"
          />
          <StatItem
            icon={<Package className="w-6 h-6 text-primary" />}
            value={stats.productsListed}
            label="Products Listed"
          />
          <StatItem
            icon={<TrendingUp className="w-6 h-6 text-primary" />}
            value={stats.salesProcessed}
            label="Sales Processed"
          />
          <StatItem
            icon={<Star className="w-6 h-6 text-primary" />}
            value={stats.avgRating}
            label="Customer Rating"
          />
        </div>

        {/* Additional Trust Signals */}
        <div className="mt-10 flex flex-wrap justify-center items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
              <span className="text-xs">✓</span>
            </div>
            <span>Powered by Paystack</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
              <span className="text-xs">✓</span>
            </div>
            <span>WhatsApp Integrated</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
              <span className="text-xs">✓</span>
            </div>
            <span>Nigerian-Owned Platform</span>
          </div>
        </div>
      </div>
    </section>
  );
};
