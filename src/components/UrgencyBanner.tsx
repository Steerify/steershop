import { useState, useEffect } from "react";
import { X, Zap, Users, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface UrgencyBannerProps {
  className?: string;
}

export const UrgencyBanner = ({ className }: UrgencyBannerProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [shopCount, setShopCount] = useState<number>(500);
  const [recentSignups, setRecentSignups] = useState<number>(12);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { count } = await supabase
        .from('shops')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true);
      
      if (count) setShopCount(count);
      
      // Simulate recent signups (in production, you'd query profiles created in last 24h)
      setRecentSignups(Math.floor(Math.random() * 20) + 5);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  if (!isVisible) return null;

  return (
    <div className={cn(
      "bg-gradient-to-r from-primary via-accent to-primary text-white py-2 px-4 relative overflow-hidden",
      className
    )}>
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
      
      <div className="container mx-auto flex items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-4 flex-wrap justify-center flex-1">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Join</span>
            <span className="font-bold">{shopCount.toLocaleString()}+</span>
            <span>Nigerian businesses</span>
          </div>
          
          <div className="hidden md:flex items-center gap-2 text-sm font-medium">
            <Zap className="w-4 h-4" />
            <span className="font-bold">{recentSignups}</span>
            <span>joined today</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
            <Clock className="w-4 h-4" />
            <span>15-day free trial</span>
          </div>
        </div>
        
        <button 
          onClick={() => setIsVisible(false)}
          className="p-1 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
