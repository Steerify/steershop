import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users, Store, Package, ShoppingCart, DollarSign, Mail, Rocket, Target } from "lucide-react";
import { AdirePattern } from "@/components/patterns/AdirePattern";

const GrowthPage = () => {
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    activeShops: 0,
    totalProducts: 0,
    totalOrders: 0,
    gmv: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [usersRes, shopsRes, productsRes, ordersRes, gmvRes] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("shops_public").select("id", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id", { count: "exact", head: true }).eq("payment_status", "paid"),
        supabase.from("orders").select("total_amount").eq("payment_status", "paid"),
      ]);

      const gmv = (gmvRes.data || []).reduce((sum, o) => sum + (parseFloat(String(o.total_amount)) || 0), 0);

      setMetrics({
        totalUsers: usersRes.count || 0,
        activeShops: shopsRes.count || 0,
        totalProducts: productsRes.count || 0,
        totalOrders: ordersRes.count || 0,
        gmv,
      });
      setIsLoading(false);
    };
    load();
  }, []);

  const milestones = [
    { date: "Jan 2026", event: "Platform launched", icon: Rocket },
    { date: "Jan 2026", event: "First 100 shops onboarded", icon: Store },
    { date: "Feb 2026", event: "Payment integration live", icon: DollarSign },
    { date: "Feb 2026", event: "AI marketing tools released", icon: Target },
  ];

  const categories = [
    "Fashion & Clothing", "Food & Beverages", "Beauty & Skincare",
    "Tech & Gadgets", "Home & Living", "Arts & Crafts",
    "Health & Wellness", "Events & Services",
  ];

  const formatNumber = (n: number) => {
    if (n >= 1000000) return `₦${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `₦${(n / 1000).toFixed(0)}K`;
    return `₦${n.toLocaleString()}`;
  };

  const metricCards = [
    { label: "Registered Users", value: metrics.totalUsers, icon: Users, color: "text-blue-500" },
    { label: "Active Shops", value: metrics.activeShops, icon: Store, color: "text-green-500" },
    { label: "Products Listed", value: metrics.totalProducts, icon: Package, color: "text-purple-500" },
    { label: "Orders Processed", value: metrics.totalOrders, icon: ShoppingCart, color: "text-orange-500" },
    { label: "Gross Merchandise Value", value: formatNumber(metrics.gmv), icon: DollarSign, color: "text-primary", isString: true },
    { label: "Platform Revenue (1%)", value: formatNumber(metrics.gmv * 0.01), icon: TrendingUp, color: "text-accent", isString: true },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <AdirePattern variant="dots" className="fixed inset-0 opacity-5 pointer-events-none" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <TrendingUp className="w-4 h-4 mr-2" /> Live Data
          </div>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            Our Growth Story
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Empowering Nigerian SMEs with digital commerce tools. Here's how we're growing — live.
          </p>
        </div>
      </section>

      {/* Metrics */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-10">Live Platform Metrics</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {metricCards.map((m, i) => (
              <Card key={i} className="border-primary/10 hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <m.icon className={`w-8 h-8 mx-auto mb-3 ${m.color}`} />
                  <p className="text-3xl font-bold">
                    {isLoading ? "..." : m.isString ? m.value : (m.value as number).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">{m.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-10">Growth Timeline</h2>
          <div className="max-w-2xl mx-auto space-y-6">
            {milestones.map((m, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <m.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{m.date}</p>
                  <p className="font-semibold">{m.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-6">Categories We Serve</h2>
          <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
            {categories.map(c => (
              <span key={c} className="px-4 py-2 bg-primary/5 border border-primary/10 rounded-full text-sm font-medium">{c}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Partner With Us</h2>
          <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
            Interested in investing or partnering with SteerSolo? We're building the future of Nigerian SME commerce.
          </p>
          <a href="mailto:steerifygroup@gmail.com">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              <Mail className="w-5 h-5 mr-2" /> steerifygroup@gmail.com
            </Button>
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default GrowthPage;
