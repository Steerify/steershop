import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types/api";
import { rbac } from "@/utils/rbac";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Store, PackagePlus, Share2, ArrowRight, CheckCircle2, ChevronRight, Copy, ExternalLink, Activity, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { BulkProductUpload } from "@/components/BulkProductUpload";
import shopService from "@/services/shop.service";
import productService from "@/services/product.service";
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

  const fetchShopData = async () => {
    if (!user) return;
    try {
      const shopRes = await shopService.getShopByOwner(user.id);
      const shops = shopRes.data;
      const shopData = Array.isArray(shops) ? shops[0] : shops;
      setShop(shopData);

      if (shopData) {
        const productsRes = await productService.getProducts({ shopId: shopData.id });
        setProductsCount(productsRes.data?.length || 0);
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
      <div className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-black border-b border-white/5 py-10 px-4 relative z-20 rounded-[2.5rem] mb-10 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none" />
        <div className="container mx-auto max-w-6xl relative">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-10">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 shadow-2xl">
                  <Store className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-4 border-indigo-950 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{shop.shop_name}</h3>
                  <div className="bg-green-500/20 text-green-400 border border-green-500/30 text-[10px] uppercase font-black px-2 py-0 rounded-md">Live</div>
                </div>
                <div className="flex items-center gap-2 text-indigo-200/70 text-sm font-medium">
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{window.location.origin.replace(/^https?:\/\//, '')}/shop/{shop.shop_slug || shop.id}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <Button 
                variant="outline" 
                className="flex-1 sm:flex-none border-white/10 bg-white/5 text-white hover:bg-white/10 rounded-xl h-12 px-6 font-bold backdrop-blur-md"
                onClick={() => {
                  const url = `${window.location.origin}/shop/${shop.shop_slug || shop.id}`;
                  navigator.clipboard.writeText(url);
                  setIsCopied(true);
                  setTimeout(() => setIsCopied(false), 2000);
                  toast({ title: "Copied!", description: "Store link copied to clipboard" });
                }}
              >
                {isCopied ? <CheckCircle2 className="w-4 h-4 mr-2 text-green-400" /> : <Copy className="w-4 h-4 mr-2" />}
                Share Store
              </Button>
              <Button 
                onClick={() => window.open(`${window.location.origin}/shop/${shop.shop_slug || shop.id}`, '_blank')}
                className="flex-1 sm:flex-none bg-white text-indigo-950 hover:bg-white/90 rounded-xl h-12 px-6 font-black shadow-xl"
              >
                Visit Store
              </Button>
            </div>
          </div>

          {/* Professional Data Grid - Like Jumia/Shopify */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Today's Sales", value: "₦0.00", icon: Activity, trend: "0%", color: "text-blue-400" },
              { label: "Orders", value: "0", icon: PackagePlus, trend: "0%", color: "text-amber-400" },
              { label: "Store Visits", value: "0", icon: Sparkles, trend: "0%", color: "text-purple-400" },
              { label: "Conversion", value: "0.0%", icon: ArrowRight, trend: "0%", color: "text-green-400" }
            ].map((stat, i) => (
              <div key={i} className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm group hover:bg-white/10 transition-all cursor-default">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg bg-white/5 ${stat.color}`}>
                    <stat.icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">{stat.trend}</span>
                </div>
                <p className="text-white/50 text-[10px] font-bold uppercase tracking-wider mb-1">{stat.label}</p>
                <h4 className="text-xl sm:text-2xl font-black text-white tracking-tight">{stat.value}</h4>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="ghost" className="text-indigo-200 hover:text-white hover:bg-white/5 text-xs font-bold" asChild>
              <Link to="/products"><PackagePlus className="w-4 h-4 mr-2" /> Add Inventory</Link>
            </Button>
            <Button variant="ghost" className="text-indigo-200 hover:text-white hover:bg-white/5 text-xs font-bold" onClick={() => setIsBulkUploadOpen(true)}>
              <Sparkles className="w-4 h-4 mr-2" /> AI Bulk Upload
            </Button>
            <Button variant="ghost" className="text-indigo-200 hover:text-white hover:bg-white/5 text-xs font-bold" asChild>
              <Link to="/my-store"><Store className="w-4 h-4 mr-2" /> Store Settings</Link>
            </Button>
          </div>
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
            <Store className="w-3.5 h-3.5" /> Vendor Command Center
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
