import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Store, ShieldCheck, Package, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const ShopperDiscovery = () => {
  const [shopCount, setShopCount] = useState<number | null>(null);
  const [productCount, setProductCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const [shopsRes, productsRes] = await Promise.all([
        supabase.from("shops").select("id", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("products").select("id", { count: "exact", head: true }).eq("is_available", true),
      ]);
      setShopCount(shopsRes.count ?? 0);
      setProductCount(productsRes.count ?? 0);
    };
    fetchStats();
  }, []);

  const cards = [
    {
      icon: Store,
      title: "Browse Shops",
      description: shopCount !== null ? `${shopCount}+ active stores` : "Discover sellers",
      href: "/shops",
    },
    {
      icon: ShieldCheck,
      title: "Secure Checkout",
      description: "Safe payments guaranteed",
      href: "/shops",
    },
    {
      icon: Package,
      title: "Track Orders",
      description: productCount !== null ? `${productCount}+ products` : "Real-time updates",
      href: "/shops",
    },
  ];

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
            Shop from Trusted Businesses
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Discover verified sellers, browse products, and buy with confidence
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
          {cards.map((card) => (
            <Link key={card.title} to={card.href}>
              <div className="group relative rounded-xl border bg-card p-5 text-center transition-all duration-300 hover:shadow-lg hover:border-accent/40 hover:-translate-y-1 cursor-pointer">
                <div className="mx-auto mb-3 w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <card.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{card.title}</h3>
                <p className="text-xs text-muted-foreground">{card.description}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link to="/shops">
            <Button size="lg" variant="outline" className="group">
              Explore Shops
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
