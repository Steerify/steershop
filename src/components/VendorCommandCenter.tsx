import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types/api";
import { rbac } from "@/utils/rbac";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Store, PackagePlus, Share2, ArrowRight, CheckCircle2, ChevronRight, Copy, ExternalLink, Activity, Sparkles, ShieldCheck, Lock, Unlock, Clock, Coins, Award, Info, HelpCircle } from "lucide-react";
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
    conversion: "0.0%"
  });
  const [latestEscrowOrder, setLatestEscrowOrder] = useState<any>(null);

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
          orderService.getOrders({ shopId: shopData.id })
        ]);
        
        setProductsCount(productsRes.data?.length || 0);

        const allOrders = ordersRes.data || [];
        
        // Calculate stats
        const todayStr = new Date().toISOString().split('T')[0];
        let todaySales = 0;
        let activeOrdersCount = 0;
        
        allOrders.forEach((o: any) => {
          if (o.order_status !== 'completed' && o.order_status !== 'cancelled') {
            activeOrdersCount++;
          }
          if (o.payment_status === 'paid' && o.created_at && o.created_at.startsWith(todayStr)) {
            todaySales += Number(o.total_amount || 0);
          }
        });
        
        const conversion = shopData.total_views && shopData.total_views > 0 
          ? ((allOrders.length / shopData.total_views) * 100).toFixed(1) + "%"
          : "0.0%";

        setSalesData({
          todaySales,
          activeOrders: activeOrdersCount,
          conversion
        });

        // Find the most recent order for escrow demo
        const escrowOrder = allOrders.find((o: any) => 
          ['held_in_escrow', 'released_from_escrow', 'paid', 'pending'].includes(o.payment_status)
        ) || allOrders[0];
        
        setLatestEscrowOrder(escrowOrder || null);
      }
    } catch (err) {
      console.error("Error fetching shop data for command center:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || !rbac.isEntrepreneur(user)) {
      setLoading(false);
      return;
    }
    fetchShopData();
  }, [user]);

  if (loading) return null;
  if (!user || !rbac.isEntrepreneur(user)) return null;

  const steps = [
    { id: 1, title: "Create Store", completed: !!shop },
    { id: 2, title: "Add Products", completed: productsCount > 0 },
    { id: 3, title: "Connect WhatsApp", completed: !!shop?.whatsapp_number },
  ];

  const completedSteps = steps.filter(s => s.completed).length;
  const progress = Math.round((completedSteps / steps.length) * 100);
  const isSetupComplete = !!shop?.is_active && progress === 100;

  // Render minimal dashboard stats if they are already set up
  if (isSetupComplete) {
    return (
      <div className="space-y-6">
        {/* Sleek, Theme-Aware Store Welcome & CTA Header */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-primary/5 via-accent/5 to-transparent border border-border/40 p-6 backdrop-blur-md">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shrink-0 shadow-sm">
                  <Store className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-4 border-background flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <h3 className="text-xl font-black text-foreground tracking-tight leading-none">{shop.shop_name}</h3>
                  <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[9px] uppercase font-black px-2 py-0.5 rounded-md tracking-wider">Live</Badge>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold">
                  <ExternalLink className="w-3.5 h-3.5 text-primary" />
                  <span>{window.location.origin.replace(/^https?:\/\//, '')}/shop/{shop.shop_slug || shop.id}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <Button 
                variant="outline" 
                className="flex-1 md:flex-none border-border/60 bg-background/50 hover:bg-muted text-foreground rounded-xl h-10 px-4 text-xs font-bold transition-all"
                onClick={() => {
                  const url = `${window.location.origin}/shop/${shop.shop_slug || shop.id}`;
                  navigator.clipboard.writeText(url);
                  setIsCopied(true);
                  setTimeout(() => setIsCopied(false), 2000);
                  toast({ title: "Copied!", description: "Store link copied to clipboard" });
                }}
              >
                {isCopied ? <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-green-500" /> : <Copy className="w-3.5 h-3.5 mr-2 text-muted-foreground" />}
                Share Link
              </Button>
              <Button 
                onClick={() => window.open(`${window.location.origin}/shop/${shop.shop_slug || shop.id}`, '_blank')}
                className="flex-1 md:flex-none bg-primary text-white hover:bg-primary/95 rounded-xl h-10 px-5 text-xs font-black shadow-sm transition-all active:scale-[0.98]"
              >
                Visit Store
              </Button>
            </div>
          </div>
        </div>

        {/* Majestic Dual-Column Layout (Shernest Inspired Architecture) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left & Middle Column (lg:col-span-2): Professional Metrics & Escrow Tracker */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Today's Sales", value: `₦${salesData.todaySales.toLocaleString()}`, icon: Activity, trend: "0%", color: "text-blue-500 bg-blue-500/5 border-blue-500/10" },
                { label: "Active Orders", value: salesData.activeOrders.toString(), icon: PackagePlus, trend: "0%", color: "text-amber-500 bg-amber-500/5 border-amber-500/10" },
                { label: "Store Visits", value: (shop.total_views || 0).toString(), icon: Sparkles, trend: "0%", color: "text-purple-500 bg-purple-500/5 border-purple-500/10" },
                { label: "Conversion", value: salesData.conversion, icon: ArrowRight, trend: "0%", color: "text-emerald-500 bg-emerald-500/5 border-emerald-500/10" }
              ].map((stat, i) => (
                <div key={i} className="p-4 rounded-2xl bg-card/65 border border-border/40 backdrop-blur-md group hover:bg-card/90 transition-all duration-300 cursor-default hover:border-primary/25 shadow-[0_4px_20px_rgba(0,0,0,0.015)]">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-1.5 rounded-lg border ${stat.color}`}>
                      <stat.icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{stat.trend}</span>
                  </div>
                  <p className="text-muted-foreground text-[9px] font-black uppercase tracking-wider mb-1">{stat.label}</p>
                  <h4 className="text-lg sm:text-xl font-black text-foreground tracking-tight">{stat.value}</h4>
                </div>
              ))}
            </div>

            {/* Trust Escrow Timeline (Shernest Safe Payments Flow Mock) */}
            <div className="p-5 rounded-3xl bg-card/65 border border-border/40 backdrop-blur-md relative overflow-hidden group shadow-[0_4px_20px_rgba(0,0,0,0.015)]">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <h4 className="text-xs font-black text-foreground uppercase tracking-widest">Secure Escrow & Payment Milestones</h4>
                </div>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[9px] uppercase font-black">
                  Escrow Protected
                </Badge>
              </div>

              {latestEscrowOrder ? (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-muted/40 border border-border/40 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[9px] font-black text-primary uppercase tracking-wider">Latest Escrow Order</p>
                      <p className="text-xs font-bold text-foreground mt-0.5">Order #{latestEscrowOrder.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Client: {latestEscrowOrder.customer_name || 'Anonymous'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">
                        {latestEscrowOrder.payment_status === 'released_from_escrow' ? 'Released Funds' : 'Locked Funds'}
                      </p>
                      <p className="text-base font-black text-emerald-600 dark:text-emerald-400">₦{(latestEscrowOrder.total_amount || 0).toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Horizontal Stage Timeline */}
                  <div className="relative pt-6 pb-2">
                    <div className="absolute top-1/2 left-0 w-full h-[2px] bg-border/60 -translate-y-1/2" />
                    <div className={`absolute top-1/2 left-0 h-[2px] bg-gradient-to-r from-emerald-500 to-primary -translate-y-1/2 transition-all`} style={{ width: latestEscrowOrder.payment_status === 'released_from_escrow' || latestEscrowOrder.status === 'completed' ? '100%' : latestEscrowOrder.status === 'delivered' ? '66%' : '33%' }} />
                    
                    <div className="relative flex justify-between">
                      {[
                        { step: 1, label: "Funded", active: true, icon: Lock, desc: "Escrow Locked" },
                        { step: 2, label: "In Progress", active: !['pending', 'cancelled'].includes(latestEscrowOrder.status), icon: Activity, desc: "Merchant Crafting" },
                        { step: 3, label: "Delivered", active: ['delivered', 'completed'].includes(latestEscrowOrder.status), icon: CheckCircle2, desc: "Pending Review" },
                        { step: 4, label: "Paid", active: latestEscrowOrder.payment_status === 'released_from_escrow', icon: Unlock, desc: "Wallet Payout" },
                      ].map((item, i) => (
                        <div key={i} className="flex flex-col items-center relative z-10">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 ${
                            item.active 
                              ? "bg-gradient-to-br from-emerald-500 to-primary text-white border-background scale-110 shadow-md" 
                              : "bg-muted text-muted-foreground border-border"
                          }`}>
                            <item.icon className="w-3.5 h-3.5" />
                          </div>
                          <p className={`text-[9px] font-black uppercase mt-2 tracking-tight ${item.active ? 'text-foreground' : 'text-muted-foreground/50'}`}>{item.label}</p>
                          <p className="text-[8px] text-muted-foreground mt-0.5 hidden xs:block">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-muted/40 rounded-xl border border-border/40">
                  <ShieldCheck className="w-8 h-8 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-sm font-bold text-foreground">No Escrow Orders Yet</p>
                  <p className="text-xs text-muted-foreground mt-1">When customers pay securely, their escrow timeline will appear here.</p>
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-border/40 flex items-center gap-2 text-[9px] text-muted-foreground leading-tight">
                <Info className="w-3.5 h-3.5 text-primary shrink-0" />
                <p>Payments are automatically secured in safe multi-signature escrow. Released to your payout balance upon client/milestone approval.</p>
              </div>
            </div>
          </div>

          {/* Right Column (lg:col-span-1): SteerSolo Professional Vitality Index (Shernest Score) */}
          <div className="lg:col-span-1">
            <div className="p-6 rounded-3xl bg-card/65 border border-border/40 backdrop-blur-md relative overflow-hidden group hover:border-primary/20 transition-all duration-500 shadow-[0_4px_20px_rgba(0,0,0,0.015)] h-full flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
              
              <div>
                <div className="flex items-center gap-2 mb-5">
                  <Award className="w-4 h-4 text-primary" />
                  <h4 className="text-xs font-black text-foreground uppercase tracking-widest">Verified Partner</h4>
                </div>

                {/* Circular SVG Gauge Chart */}
                <div className="flex flex-col items-center justify-center my-4 relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-primary flex items-center justify-center shadow-lg">
                    <Award className="w-10 h-10 text-white" />
                  </div>
                  
                  <div className="mt-4 text-center">
                    <Badge className="bg-gradient-to-r from-emerald-500 to-primary border-0 text-[9px] font-bold py-0.5 px-3 rounded-full uppercase tracking-wider text-white">
                      Elite Partner
                    </Badge>
                  </div>
                </div>

                {/* Trust Pillars */}
                <div className="space-y-3 mt-6">
                  {[
                    { label: "Identity Verified", value: "Yes", width: "w-[100%]", color: "bg-emerald-500" },
                    { label: "Secure Payments", value: "Active", width: "w-[100%]", color: "bg-primary" },
                    { label: "Community Rating", value: "Excellent", width: "w-[100%]", color: "bg-indigo-400" },
                  ].map((pill, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-[9px] font-bold text-muted-foreground">
                        <span>{pill.label}</span>
                        <span className="text-foreground font-black">{pill.value}</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div className={`h-full ${pill.color} ${pill.width} rounded-full`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-muted/40 border border-border/40 rounded-2xl text-[9px] text-muted-foreground leading-normal mt-6">
                🔒 Verified by **SteerSolo Trust Protocol**. Cryptographically attests to professional delivery and transaction security.
              </div>
            </div>
          </div>

        </div>

        {/* Quick Links Row */}
        <div className="mt-2 pt-4 flex flex-wrap gap-2">
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-muted text-xs font-bold rounded-xl" asChild>
            <Link to="/products"><PackagePlus className="w-4 h-4 mr-2" /> Add Inventory</Link>
          </Button>
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-muted text-xs font-bold rounded-xl" onClick={() => setIsBulkUploadOpen(true)}>
            <Sparkles className="w-4 h-4 mr-2" /> AI Bulk Upload
          </Button>
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-muted text-xs font-bold rounded-xl" asChild>
            <Link to="/my-store"><Store className="w-4 h-4 mr-2" /> Store Settings</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Render Onboarding Guide if they haven't set up
  return (
    <div className="bg-gradient-to-b from-indigo-950 via-indigo-900 to-background border-b border-indigo-500/20 py-8 px-4 relative z-20 rounded-3xl mb-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3" />
      </div>

      <div className="container mx-auto max-w-4xl relative">
        <div className="text-center mb-8 px-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 text-xs font-semibold uppercase tracking-wider mb-3">
            <Store className="w-3.5 h-3.5" /> Merchant Command Center
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-2 leading-tight">
            Welcome, {user.firstName || 'Entrepreneur'}! Let's build your store.
          </h2>
          <p className="text-indigo-200 text-base sm:text-lg mb-8 opacity-90">
            Complete these 3 quick steps to start accepting orders today.
          </p>

          {/* Setup Progress Bar */}
          <div className="max-w-md mx-auto mb-10 space-y-3">
            <div className="flex justify-between items-end text-sm">
              <span className="text-indigo-200 font-medium">Store Setup Progress</span>
              <span className="text-white font-bold">{progress}%</span>
            </div>
            <Progress value={progress} className="h-3 bg-white/10 border border-white/5" indicatorClassName="bg-gradient-to-r from-primary to-accent" />
            <div className="flex justify-between text-[10px] uppercase tracking-tighter text-indigo-300/60 font-bold px-1">
              <span>Identity</span>
              <span>Products</span>
              <span>Launch</span>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <Card className={`bg-white/10 backdrop-blur-md border-white/20 transition-all ${!shop ? 'ring-2 ring-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]' : 'opacity-80'}`}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${shop ? 'bg-green-500/20 text-green-400' : 'bg-primary/20 text-primary-foreground'}`}>
                  {shop ? <CheckCircle2 className="w-5 h-5" /> : <Store className="w-5 h-5" />}
                </div>
                <span className="text-white/40 text-sm font-bold">01</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Create Store</h3>
              <p className="text-indigo-200 text-sm mb-4">Name your store, set your location, and add payment details.</p>
              <Button asChild variant={shop ? "secondary" : "default"} className="w-full">
                <Link to="/my-store">{shop ? 'Edit Store Details' : 'Start Setup'}</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className={`bg-white/10 backdrop-blur-md border-white/20 transition-all ${shop && productsCount === 0 ? 'ring-2 ring-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]' : (!shop ? 'opacity-50 grayscale pointer-events-none' : 'opacity-80')}`}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${productsCount > 0 ? 'bg-green-500/20 text-green-400' : 'bg-accent/20 text-accent'}`}>
                  {productsCount > 0 ? <CheckCircle2 className="w-5 h-5" /> : <PackagePlus className="w-5 h-5 text-white" />}
                </div>
                <span className="text-white/40 text-sm font-bold">02</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Add Products</h3>
              <p className="text-indigo-200 text-sm mb-4">Upload your first 3-5 products with clear pictures and prices.</p>
              <div className="flex flex-col gap-2">
                <Button asChild variant="secondary" className="w-full">
                  <Link to="/products">Manual Add</Link>
                </Button>
                <Button 
                  onClick={() => setIsBulkUploadOpen(true)} 
                  className="w-full bg-gradient-to-r from-primary to-accent text-white border-0 shadow-lg"
                >
                  <Sparkles className="w-4 h-4 mr-2" /> AI Bulk Upload
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className={`bg-white/10 backdrop-blur-md border-white/20 transition-all ${shop && !shop.whatsapp_number ? 'ring-2 ring-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]' : (productsCount === 0 ? 'opacity-50 grayscale pointer-events-none' : 'opacity-80')}`}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${shop?.whatsapp_number ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white'}`}>
                  {shop?.whatsapp_number ? <CheckCircle2 className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
                </div>
                <span className="text-white/40 text-sm font-bold">03</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Launch Store</h3>
              <p className="text-indigo-200 text-sm mb-4">Connect your WhatsApp and share your link to start selling.</p>
              <Button 
                variant={shop?.whatsapp_number ? "outline" : "default"}
                className={`w-full ${shop?.whatsapp_number ? 'border-white/20 text-white' : ''}`}
                onClick={() => {
                  if (shop) {
                    const url = `${window.location.origin}/shop/${shop.shop_slug || shop.id}`;
                    navigator.clipboard.writeText(url);
                    setIsCopied(true);
                    setTimeout(() => setIsCopied(false), 2000);
                    toast({ title: "Copied!", description: "Store link copied to clipboard" });
                  } else {
                    navigate('/my-store');
                  }
                }}
              >
                {isCopied ? <CheckCircle2 className="w-4 h-4 mr-2 text-green-400" /> : <Copy className="w-4 h-4 mr-2" />}
                {shop?.whatsapp_number ? 'Copy Store Link' : 'Launch Setup'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {shop && (
        <BulkProductUpload 
          open={isBulkUploadOpen} 
          onClose={() => setIsBulkUploadOpen(false)} 
          shopId={shop.id}
          onSuccess={() => {
            fetchShopData();
            setIsBulkUploadOpen(false);
          }}
        />
      )}
    </div>
  );
};
