import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { rbac } from "@/utils/rbac";
import { supabase } from "@/integrations/supabase/client";
import {
  Loader2, Store, PackagePlus, Share2, ArrowRight, CheckCircle2,
  Copy, ExternalLink, Activity, Sparkles, ShieldCheck, Lock, Unlock,
  Clock, Coins, Award, Info, HelpCircle, ChevronRight, ShoppingCart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { BulkProductUpload } from "@/components/BulkProductUpload";
import shopService from "@/services/shop.service";
import productService from "@/services/product.service";
import orderService from "@/services/order.service";
import { payoutService } from "@/services/payout.service";
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
    walletBalance: 0,
  });

  const fetchShopData = async () => {
    if (!user) return;
    try {
      const shopRes = await shopService.getShopByOwner(user.id);
      const shops = shopRes.data;
      const shopData = Array.isArray(shops) ? shops[0] : shops;
      setShop(shopData);

      if (shopData) {
        const [productsRes, ordersRes, balanceRes] = await Promise.all([
          productService.getProducts({ shopId: shopData.id }),
          orderService.getOrders({ shopId: shopData.id }),
          payoutService.getBalance(shopData.id).catch(() => null)
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

        setSalesData({ 
          todaySales, 
          activeOrders: activeOrdersCount, 
          conversion,
          walletBalance: balanceRes?.availableBalance || 0 
        });
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
        <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm">
          {/* Top row: name + live badge + CTAs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4 border-b border-border/40 bg-muted/20">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-sm">
                <Store className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-extrabold text-base text-foreground truncate">{shop.shop_name}</p>
                  <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] uppercase font-black px-2 py-0.5 rounded-md">Live</Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate hover:text-foreground transition-colors cursor-pointer" onClick={() => window.open(storeUrl, "_blank")}>
                  {storeUrl.replace(/^https?:\/\//, '')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-xl font-bold bg-background shadow-sm hover:shadow-md transition-all"
                onClick={() => {
                  navigator.clipboard.writeText(storeUrl);
                  setIsCopied(true);
                  setTimeout(() => setIsCopied(false), 2000);
                  toast({ title: "Copied!", description: "Store link copied" });
                }}
              >
                {isCopied ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2" /> : <Copy className="w-4 h-4 text-muted-foreground mr-2" />}
                {isCopied ? "Copied" : "Copy Link"}
              </Button>
            </div>
          </div>

          {/* Metrics strip - 2x2 grid on mobile, 1x4 on desktop */}
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border/40">
            {[
              { label: "Today's Sales", value: `₦${salesData.todaySales.toLocaleString()}`, color: "text-foreground" },
              { label: "Active Orders", value: salesData.activeOrders.toString(), color: "text-amber-600 dark:text-amber-400" },
              { label: "Wallet Balance", value: `₦${(salesData as any).walletBalance?.toLocaleString() || '0'}`, color: "text-emerald-600 dark:text-emerald-400" },
              { label: "Store Views", value: (shop.total_views || 0).toString(), color: "text-primary" },
            ].map((m, i) => (
              <div key={i} className={`px-5 py-4 ${i % 2 !== 0 ? 'border-l border-border/40 md:border-l-0' : ''}`}>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">{m.label}</p>
                <p className={`text-xl md:text-2xl font-black tabular-nums ${m.color}`}>{m.value}</p>
              </div>
            ))}
          </div>

          {/* Primary Action Bar */}
           <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 px-4 py-3 bg-muted/10 border-t border-border/40">
             <Button size="sm" className="w-full sm:w-auto text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm h-9" asChild>
               <Link to="/products"><PackagePlus className="w-3.5 h-3.5 mr-1.5" />Add Product</Link>
             </Button>
             <Button size="sm" variant="outline" className="w-full sm:w-auto text-xs font-bold rounded-xl shadow-sm h-9" asChild>
               <Link to="/orders"><ShoppingCart className="w-3.5 h-3.5 mr-1.5" />Orders</Link>
             </Button>
             <Button size="sm" variant="outline" className="w-full sm:w-auto text-xs font-bold rounded-xl shadow-sm h-9" onClick={() => setIsBulkUploadOpen(true)}>
               <Sparkles className="w-3.5 h-3.5 mr-1.5 text-accent" />AI Upload
             </Button>
             <Button size="sm" variant="outline" className="w-full sm:w-auto text-xs font-bold rounded-xl shadow-sm h-9" asChild>
               <Link to="/my-store"><Store className="w-3.5 h-3.5 mr-1.5" />Settings</Link>
             </Button>
             <Button size="sm" variant="outline" className="w-full sm:w-auto text-xs font-bold rounded-xl shadow-sm h-9" asChild>
               <Link to="/marketing"><Megaphone className="w-3.5 h-3.5 mr-1.5" />Marketing</Link>
             </Button>
             <Button size="sm" variant="outline" className="w-full sm:w-auto text-xs font-bold rounded-xl shadow-sm h-9" asChild>
               <Link to="/referral"><Share2 className="w-3.5 h-3.5 mr-1.5" />Referral</Link>
             </Button>
           </div>
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
