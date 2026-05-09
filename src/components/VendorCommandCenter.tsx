import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types/api";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Store, PackagePlus, Share2, ArrowRight, CheckCircle2, ChevronRight, Copy, ExternalLink, Activity, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { BulkProductUpload } from "@/components/BulkProductUpload";

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
      const { data: shopData, error: shopError } = await supabase
        .from("shops")
        .select("*")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (shopError && shopError.code !== 'PGRST116') throw shopError;
      setShop(shopData);

      if (shopData) {
        const { count, error: countError } = await supabase
          .from("products")
          .select("*", { count: 'exact', head: true })
          .eq("shop_id", shopData.id);
        
        if (!countError) setProductsCount(count || 0);
      }
    } catch (err) {
      console.error("Error fetching shop data for command center:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'ENTREPRENEUR') {
      setLoading(false);
      return;
    }
    fetchShopData();
  }, [user]);

  if (loading) return null;
  if (!user || user.role !== 'ENTREPRENEUR') return null;

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
      <div className="bg-gradient-to-b from-indigo-950 to-background border-b border-white/5 py-8 px-4 relative z-20 rounded-3xl mb-8">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
            <div className="flex items-center gap-4 text-white">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 shadow-inner">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{shop.shop_name}</h3>
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <span className="inline-flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-green-400" /> Active
                  </span>
                  <span>•</span>
                  <span>steersolo.com/shop/{shop.shop_slug}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
              <Button 
                variant="outline" 
                className="flex-1 sm:flex-none border-white/20 text-white hover:bg-white/10"
                onClick={() => {
                  navigator.clipboard.writeText(`https://steersolo.com/shop/${shop.shop_slug}`);
                  setIsCopied(true);
                  setTimeout(() => setIsCopied(false), 2000);
                  toast({ title: "Copied!", description: "Store link copied to clipboard" });
                }}
              >
                {isCopied ? <CheckCircle2 className="w-4 h-4 mr-2 text-green-400" /> : <Copy className="w-4 h-4 mr-2" />}
                Copy Link
              </Button>
              <Link to="/dashboard" className="flex-1 sm:flex-none">
                <Button className="w-full bg-white text-indigo-950 hover:bg-white/90">
                  Go to Dashboard <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
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
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 text-xs font-semibold uppercase tracking-wider mb-3">
            <Store className="w-3.5 h-3.5" /> Vendor Command Center
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
            Welcome, {user.firstName || 'Entrepreneur'}! Let's build your store.
          </h2>
          <p className="text-indigo-200 text-lg mb-8">
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
                    navigator.clipboard.writeText(`https://steersolo.com/shop/${shop.shop_slug}`);
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
