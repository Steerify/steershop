import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Crown, Sparkles, Package, Trash2, AlertTriangle,
  ArrowRight, CheckCircle, X, Zap, TrendingUp, Shield,
  Star, Lock
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  image_url: string | null;
  price: number;
  is_available: boolean;
}

interface SubscriptionExpiryDialogProps {
  subscriptionStatus: 'active' | 'trial' | 'expired' | 'free';
  productsCount: number;
  shopId: string | null;
  products?: Product[];
  onProductDeleted?: () => void;
}

const UPGRADE_FEATURES = [
  { icon: Package, text: "Up to 50 products (Growth) or Unlimited (Pro)" },
  { icon: Sparkles, text: "AI-powered marketing & ad copy" },
  { icon: TrendingUp, text: "Advanced analytics & insights" },
  { icon: Shield, text: "Verified business badge" },
  { icon: Star, text: "Priority support & featured listing" },
];

export const SubscriptionExpiryDialog = ({
  subscriptionStatus,
  productsCount,
  shopId,
  products: initialProducts,
  onProductDeleted,
}: SubscriptionExpiryDialogProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<'main' | 'trim-products' | 'persuade'>('main');
  const [products, setProducts] = useState<Product[]>(initialProducts || []);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [localProductCount, setLocalProductCount] = useState(productsCount);

  // Show dialog logic
  useEffect(() => {
    if (subscriptionStatus === 'expired') {
      const dismissed = sessionStorage.getItem('subscription_expiry_dismissed');
      if (!dismissed) setIsOpen(true);
    } else if (subscriptionStatus === 'free') {
      const lastShown = localStorage.getItem('free_plan_persuade_last');
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      if (!lastShown || parseInt(lastShown) < oneDayAgo) {
        setView('persuade');
        setIsOpen(true);
        localStorage.setItem('free_plan_persuade_last', String(Date.now()));
      }
    }
  }, [subscriptionStatus]);

  // Load products when switching to trim view
  const loadProducts = async () => {
    if (!shopId) return;
    const { data, error } = await supabase
      .from('products')
      .select('id, name, image_url, price, is_available')
      .eq('shop_id', shopId)
      .eq('is_available', true)
      .order('created_at', { ascending: false });
    if (!error && data) {
      setProducts(data);
      setLocalProductCount(data.length);
    }
  };

  const handleStayFree = async () => {
    if (localProductCount > 5) {
      await loadProducts();
      setView('trim-products');
    } else {
      setView('persuade');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    setIsDeleting(productId);
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_available: false })
        .eq('id', productId);
      if (error) throw error;
      setProducts(prev => prev.filter(p => p.id !== productId));
      setLocalProductCount(prev => prev - 1);
      onProductDeleted?.();
      toast({ title: "Product removed", description: "Product hidden from your store." });
    } catch {
      toast({ title: "Error", description: "Failed to remove product.", variant: "destructive" });
    } finally {
      setIsDeleting(null);
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem('subscription_expiry_dismissed', 'true');
    setIsOpen(false);
  };

  const canDismissFromTrim = localProductCount <= 5;

  if (subscriptionStatus === 'active' || subscriptionStatus === 'trial') return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open && (view === 'persuade' || canDismissFromTrim)) handleDismiss();
    }}>
      <DialogContent className="w-[95vw] sm:max-w-lg p-0 overflow-hidden border-0 shadow-2xl rounded-2xl sm:rounded-3xl max-h-[88vh] overflow-y-auto [&>button]:hidden">
        {(view === 'persuade' || canDismissFromTrim) && (
          <button
            onClick={handleDismiss}
            className="absolute right-3 top-3 z-30 h-8 w-8 rounded-full bg-black/25 text-white hover:bg-black/40 transition-colors flex items-center justify-center"
            aria-label="Close notification"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {/* Gradient header */}
        <div className="relative bg-gradient-to-br from-primary via-primary/90 to-accent px-4 sm:px-6 pt-5 sm:pt-6 pb-6 sm:pb-8">
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/5" />

          {view === 'main' && (
            <div className="relative z-10 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-extrabold text-white mb-2">Your Trial Has Expired</h2>
              <p className="text-white/80 text-sm">Choose how you'd like to continue with SteerSolo</p>
            </div>
          )}

          {view === 'trim-products' && (
            <div className="relative z-10 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-extrabold text-white mb-2">Trim to 5 Products</h2>
              <p className="text-white/80 text-sm">
                You have <span className="font-bold text-white">{localProductCount}</span> products. Remove {localProductCount - 5} to stay on the Free plan.
              </p>
            </div>
          )}

          {view === 'persuade' && (
            <div className="relative z-10 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-2">You're Missing Out!</h2>
              <p className="text-white/80 text-sm">Upgrade to unlock the full power of SteerSolo</p>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {view === 'main' && (
            <div className="space-y-4">
              {/* Upgrade option */}
              <button
                onClick={() => { handleDismiss(); navigate('/pricing'); }}
                className="w-full group p-4 rounded-2xl border-2 border-primary/20 hover:border-primary/50 bg-gradient-to-r from-primary/5 to-accent/5 hover:from-primary/10 hover:to-accent/10 transition-all duration-200 text-left"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-sm">Upgrade to a Paid Plan</h3>
                    <p className="text-xs text-muted-foreground">From ₦2,500/month — unlock everything</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {["Unlimited products", "AI tools", "Verified badge"].map(f => (
                    <Badge key={f} variant="secondary" className="text-xs font-medium bg-primary/10 text-primary border-0">
                      <CheckCircle className="w-3 h-3 mr-1" />{f}
                    </Badge>
                  ))}
                </div>
              </button>

              {/* Free plan option */}
              <button
                onClick={handleStayFree}
                className="w-full group p-4 rounded-2xl border-2 border-border hover:border-muted-foreground/30 bg-muted/30 hover:bg-muted/50 transition-all duration-200 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                    <Package className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-sm">Stay on Free Plan</h3>
                    <p className="text-xs text-muted-foreground">
                      Limited to 5 products • No AI tools • No verification
                      {localProductCount > 5 && (
                        <span className="text-destructive font-semibold"> • You need to remove {localProductCount - 5} product{localProductCount - 5 > 1 ? 's' : ''}</span>
                      )}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>
          )}

          {view === 'trim-products' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-muted-foreground">
                  {localProductCount <= 5 ? (
                    <span className="text-green-600">✅ You're within the 5-product limit!</span>
                  ) : (
                    <span>Remove <span className="text-destructive font-bold">{localProductCount - 5}</span> more</span>
                  )}
                </p>
                <Badge variant="outline" className="text-xs">{localProductCount}/5</Badge>
              </div>

              <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
                {products.map(product => (
                  <div key={product.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/50">
                    <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden shrink-0">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">₦{product.price.toLocaleString()}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8 p-0"
                      disabled={isDeleting === product.id || localProductCount <= 5}
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      {isDeleting === product.id ? (
                        <div className="w-4 h-4 border-2 border-destructive/30 border-t-destructive rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-3 border-t border-border/50">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => { handleDismiss(); navigate('/pricing'); }}
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade Instead
                </Button>
                <Button
                  className="flex-1"
                  disabled={!canDismissFromTrim}
                  onClick={handleDismiss}
                >
                  {canDismissFromTrim ? "Continue on Free" : `Remove ${localProductCount - 5} more`}
                </Button>
              </div>
            </div>
          )}

          {view === 'persuade' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Free plan users are limited. Here's what you're missing:
              </p>
              <div className="space-y-3">
                {UPGRADE_FEATURES.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <feature.icon className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-sm font-medium">{feature.text}</p>
                    <Lock className="w-3.5 h-3.5 text-muted-foreground ml-auto shrink-0" />
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-4 text-center border border-primary/10">
                <p className="text-sm font-bold text-primary mb-1">Growth Plan — ₦2,500/mo</p>
                <p className="text-xs text-muted-foreground">Most popular for growing businesses</p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={handleDismiss}>
                  Maybe Later
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-primary to-accent text-white"
                  onClick={() => { handleDismiss(); navigate('/pricing'); }}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Upgrade Now
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
