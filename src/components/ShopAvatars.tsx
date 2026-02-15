import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Store } from "lucide-react";

interface ShopInfo {
  id: string;
  shop_name: string;
  logo_url: string | null;
}

export const ShopAvatars = () => {
  const [shops, setShops] = useState<ShopInfo[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("shops_public")
        .select("id, shop_name, logo_url")
        .eq("is_active", true)
        .not("logo_url", "is", null)
        .order("created_at", { ascending: true })
        .limit(5);
      if (data) setShops(data as ShopInfo[]);
    };
    load();
  }, []);

  if (shops.length === 0) return null;

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-6 flex-wrap">
          {shops.map((shop) => (
            <div key={shop.id} className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/30 shadow-sm bg-muted">
                {shop.logo_url ? (
                  <img src={shop.logo_url} alt={shop.shop_name} loading="lazy" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Store className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
              </div>
              <span className="text-xs text-muted-foreground font-medium max-w-[80px] truncate">{shop.shop_name}</span>
            </div>
          ))}
          <p className="text-sm text-muted-foreground ml-2">...and hundreds more</p>
        </div>
      </div>
    </section>
  );
};
