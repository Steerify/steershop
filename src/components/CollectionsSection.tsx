import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, ShoppingBag, Zap, Heart, Shirt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { autoCategorize } from "@/utils/autoCategorize";

const BASE_COLLECTIONS = [
  {
    id: "fashion",
    title: "Top Fashion Hubs",
    location: "Lagos",
    description: "The trendiest Adire, Aso-oke, streetwear, and modern Nigerian fashion.",
    image: "https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&q=80&w=800",
    color: "from-indigo-600 to-purple-600",
    icon: Shirt,
    link: "/shops?category=fashion",
    categoryKey: "fashion",
  },
  {
    id: "electronics",
    title: "Verified Tech Shops",
    location: "Online",
    description: "Quality smartphones, laptops, accessories and gadgets from trusted merchants.",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800",
    color: "from-emerald-600 to-teal-600",
    icon: Zap,
    link: "/shops?category=electronics",
    categoryKey: "electronics",
  },
  {
    id: "beauty-health",
    title: "Beauty & Wellness",
    location: "Nationwide",
    description: "Skincare, haircare, cosmetics, and wellness products for the authentic Nigerian glow.",
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800",
    color: "from-pink-600 to-rose-600",
    icon: Heart,
    link: "/shops?category=beauty",
    categoryKey: "beauty-health",
  },
  {
    id: "food-drinks",
    title: "Food & Drinks",
    location: "Abuja",
    description: "Artisan food, local delicacies, drinks, and FMCG products delivered to your door.",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800",
    color: "from-orange-600 to-amber-600",
    icon: ShoppingBag,
    link: "/shops?category=food-drinks",
    categoryKey: "food-drinks",
  },
];

export const CollectionsSection = () => {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        // Fetch all active shops with name, description, category for autoCategorize
        const { data: shops } = await supabase
          .from("shops")
          .select("id, shop_name, description, category")
          .eq("is_active", true);

        if (!shops) return;

        const counted: Record<string, number> = {};
        shops.forEach(shop => {
          // Use explicit category first, fall back to autoCategorize
          let cat = shop.category?.trim().toLowerCase() || "";
          if (!cat) {
            cat = autoCategorize(shop.shop_name || "", shop.description || "");
          }
          // Normalize to our collection keys
          if (cat.includes("fashion") || cat.includes("cloth") || cat.includes("wear")) cat = "fashion";
          else if (cat.includes("electronic") || cat.includes("tech") || cat.includes("gadget")) cat = "electronics";
          else if (cat.includes("beauty") || cat.includes("health") || cat.includes("skin") || cat.includes("hair")) cat = "beauty-health";
          else if (cat.includes("food") || cat.includes("drink") || cat.includes("restaurant")) cat = "food-drinks";

          counted[cat] = (counted[cat] || 0) + 1;
        });

        setCounts(counted);
      } catch (err) {
        console.error("CollectionsSection count error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCounts();
  }, []);

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles className="w-3 h-3" />
              <span>Curated Collections</span>
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Shop Smarter with{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Curated Hubs
              </span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              We've grouped the best stores by industry to help you find exactly what you need — fast.
            </p>
          </div>
          <Link to="/shops">
            <Button variant="outline" className="rounded-xl group h-12 px-6">
              View All Shops
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {BASE_COLLECTIONS.map((collection) => {
            const count = counts[collection.categoryKey];
            return (
              <Link
                key={collection.id}
                to={collection.link}
                className="group relative h-[400px] rounded-3xl overflow-hidden shadow-xl shadow-black/10 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 hover:-translate-y-2"
              >
                {/* Background */}
                <div className="absolute inset-0">
                  <img
                    src={collection.image}
                    alt={collection.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                </div>

                {/* Content */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  {/* Icon badge */}
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${collection.color} flex items-center justify-center mb-3 shadow-lg`}>
                    <collection.icon className="w-5 h-5 text-white" />
                  </div>

                  <h3 className="text-xl font-bold text-white mb-1.5 group-hover:text-primary transition-colors">
                    {collection.title}
                  </h3>
                  <p className="text-white/70 text-sm mb-4 line-clamp-2">{collection.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="px-3 py-1 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold">
                      {isLoading ? (
                        <span className="inline-block w-8 h-3 bg-white/30 rounded animate-pulse" />
                      ) : (
                        `${count ?? 0}+ Shops`
                      )}
                    </div>
                    <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-black opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 shadow-xl">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};
