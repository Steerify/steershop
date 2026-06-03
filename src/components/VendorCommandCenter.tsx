import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { rbac } from "@/utils/rbac";
import { supabase } from "@/integrations/supabase/client";
import {
  Loader2, Store, PackagePlus, Share2, ArrowRight, CheckCircle2,
  Copy, ExternalLink, Activity, Sparkles, ShieldCheck, Lock, Unlock,
  Clock, Coins, Award, Info, HelpCircle, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { BulkProductUpload } from "@/components/BulkProductUpload";
import shopService from "@/services/shop.service";
import productService from "@/services/product.service";
import orderService from "@/services/order.service";
import { Badge } from "@/components/ui/badge";

export const VendorCommandCenter = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [shop, setShop] = useState<any>(null);
  const [productsCount, setProductsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);

  const [salesData, setSalesData] = useState({
    todaySales: 0,
    activeOrders: 0,
    conversion: "0.0%",
  });

  const fetchShopData = async () => {
    if (!user) return;
    try {
      const shopRes = await shopService.getShopByOwner(user.id);
      const shops = shopRes.data;
      const shopData = Array.isArray(shops) ? shops[0] : shops;
      setShop(shopData);

      if (shopData) {
        const [productsRes, ordersRes] = await Promise.all([
          productService.getProducts({ shopId: shopData.id }),
          orderService.getOrders({ shopId: shopData.id }),
        ]);

        setProductsCount(productsRes.data?.length || 0);

        const allOrders = ordersRes.data || [];
        const todayStr = new Date().toISOString().split("T")[0];
        let todaySales = 0;
        let activeOrdersCount = 0;

        allOrders.forEach((o: any) => {
          if (o.order_status !== "completed" && o.order_status !== "cancelled") {
            activeOrdersCount++;
          }
          if (o.payment_status === "paid" && o.created_at?.startsWith(todayStr)) {
            todaySales += Number(o.total_amount || 0);
          }
        });

        const conversion =
          shopData.total_views && shopData.total_views > 0
            ? ((allOrders.length / shopData.total_views) * 100).toFixed(1) + "%"
            : "0.0%";

        setSalesData({ todaySales, activeOrders: activeOrdersCount, conversion });
      }
    } catch (err) {
      console.error("VendorCommandCenter fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || !rbac.isEntrepreneur(user)) { setLoading(false); return; }
    fetchShopData();
  }, [user]);

  if (loading) return null;
  if (!user || !rbac.isEntrepreneur(user)) return null;

  const steps = [
    { id: 1, title: "Create Store", completed: !!shop },
    { id: 2, title: "Add Products", completed: productsCount > 0 },
    { id: 3, title: "Connect WhatsApp", completed: !!shop?.whatsapp_number },
  ];
  const completedSteps = steps.filter((s) => s.completed).length;
  const progress = Math.round((completedSteps / steps.length) * 100);
  const isSetupComplete = !!shop?.is_active && progress === 100;

  /* ── Completed state: minimal header card ── */
  if (isSetupComplete) {
    const storeUrl = `${window.location.origin}/shop/${shop.shop_slug || shop.id}`;

    return (
      <>
        {/* Store identity + key numbers — single card */}
        <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
          {/* Top row: name + live badge + CTAs */}
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border/40">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
                <Store className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-sm text-foreground truncate">{shop.shop_name}</p>
                  <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[9px] uppercase font-black px-1.5 py-0 rounded-md">Live</Badge>
                </div>
                <p className="text-[10px] text-muted-foreground truncate">/shop/{shop.shop_slug || shop.id}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-xl hover:bg-muted"
                onClick={() => {
                  navigator.clipboard.writeText(storeUrl);
                  setIsCopied(true);
                  setTimeout(() => setIsCopied(false), 2000);
                  toast({ title: "Copied!", description: "Store link copied" });
                }}
              >
                {isCopied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
              </Button>
              <Button
                size="sm"
                className="h-8 rounded-xl text-xs font-bold px-3"
                onClick={() => window.open(storeUrl, "_blank")}
              >
                Visit <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </div>

          {/* Metrics strip */}
          <div className="grid grid-cols-3 divide-x divide-border/40">
            {[
              { label: "Today's Sales", value: `₦${salesData.todaySales.toLocaleString()}` },
              { label: "Active Orders", value: salesData.activeOrders.toString() },
              { label: "Store Views", value: (shop.total_views || 0).toString() },
            ].map((m, i) => (
              <div key={i} className="px-4 py-3 text-center">
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">{m.label}</p>
                <p className="text-lg font-black text-foreground tabular-nums">{m.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick-link pill row */}
        <div className="flex flex-wrap gap-2 pt-1">
          <Button variant="ghost" size="sm" className="text-xs font-bold rounded-xl text-muted-foreground hover:text-foreground" asChild>
            <Link to="/products"><PackagePlus className="w-3.5 h-3.5 mr-1.5" />Add Products</Link>
          </Button>
          <Button variant="ghost" size="sm" className="text-xs font-bold rounded-xl text-muted-foreground hover:text-foreground" onClick={() => setIsBulkUploadOpen(true)}>
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />AI Upload
          </Button>
          <Button variant="ghost" size="sm" className="text-xs font-bold rounded-xl text-muted-foreground hover:text-foreground" asChild>
            <Link to="/my-store"><Store className="w-3.5 h-3.5 mr-1.5" />Store Settings</Link>
          </Button>
        </div>

        {shop && (
          <BulkProductUpload
            open={isBulkUploadOpen}
            onClose={() => setIsBulkUploadOpen(false)}
            shopId={shop.id}
            onSuccess={() => { fetchShopData(); setIsBulkUploadOpen(false); }}
          />
        )}
      </>
    );
  }

  /* ── Onboarding state: 3-step guide ── */
  return (
    <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5 overflow-hidden">
      <div className="px-4 pt-5 pb-4 text-center border-b border-border/40">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Get started</p>
        <h2 className="text-lg font-extrabold tracking-tight mb-0.5">Set up your store in 3 steps</h2>
        <div className="max-w-xs mx-auto mt-3 space-y-1.5">
          <div className="flex justify-between text-[10px] text-muted-foreground font-bold">
            <span>Progress</span><span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5 bg-muted" />
        </div>
      </div>

      <div className="divide-y divide-border/40">
        {[
          {
            num: "01", title: "Create your store", desc: "Name, location & payment details.",
            done: !!shop, action: () => navigate("/my-store"), label: shop ? "Edit Store" : "Start Setup",
          },
          {
            num: "02", title: "Add products", desc: "Upload photos & set prices.",
            done: productsCount > 0, action: () => navigate("/products"), label: "Add Products",
            disabled: !shop,
          },
          {
            num: "03", title: "Share your link", desc: "Connect WhatsApp & go live.",
            done: !!shop?.whatsapp_number, action: () => navigate("/my-store"), label: shop?.whatsapp_number ? "Done ✓" : "Connect",
            disabled: productsCount === 0,
          },
        ].map((step) => (
          <div
            key={step.num}
            className={`flex items-center gap-4 px-4 py-3.5 transition-colors ${step.disabled ? "opacity-40 pointer-events-none" : "hover:bg-muted/30"}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[11px] font-black border ${step.done ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400" : "bg-muted border-border text-muted-foreground"}`}>
              {step.done ? <CheckCircle2 className="w-4 h-4" /> : step.num}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground">{step.title}</p>
              <p className="text-xs text-muted-foreground">{step.desc}</p>
            </div>
            {!step.done && (
              <Button size="sm" variant="outline" className="shrink-0 h-8 rounded-xl text-xs font-bold" onClick={step.action}>
                {step.label} <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {shop && (
        <BulkProductUpload
          open={isBulkUploadOpen}
          onClose={() => setIsBulkUploadOpen(false)}
          shopId={shop.id}
          onSuccess={() => { fetchShopData(); setIsBulkUploadOpen(false); }}
        />
      )}
    </div>
  );
};
