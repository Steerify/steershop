import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { PageWrapper } from "@/components/PageWrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteAccountDialog } from "@/components/auth/DeleteAccountDialog";
import { ShopStatusBadge, getShopStatusFromProfile } from "@/components/ShopStatusBadge";
import { ArrowLeft, User, Shield, Bell, Key, Store, ExternalLink, ShieldCheck, CreditCard, Sparkles } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { UserRole } from "@/types/api";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ShopData {
  id: string;
  shop_name: string;
  shop_slug: string;
}

interface ProfileSubscription {
  is_subscribed: boolean;
  subscription_expires_at: string | null;
}

const Settings = () => {
  const navigate = useNavigate();
  const { user, resetPassword } = useAuth();
  const { toast } = useToast();
  const [shop, setShop] = useState<ShopData | null>(null);
  const [subscription, setSubscription] = useState<ProfileSubscription | null>(null);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const isEntrepreneur = user?.role === UserRole.ENTREPRENEUR;

  useEffect(() => {
    if (!user || !isEntrepreneur) return;

    const fetchShopData = async () => {
      const [shopRes, profileRes] = await Promise.all([
        supabase
          .from("shops")
          .select("id, shop_name, shop_slug")
          .eq("owner_id", user.id)
          .maybeSingle(),
        supabase
          .from("profiles")
          .select("is_subscribed, subscription_expires_at")
          .eq("id", user.id)
          .single(),
      ]);

      if (shopRes.data) setShop(shopRes.data);
      if (profileRes.data) setSubscription(profileRes.data);
    };

    fetchShopData();
  }, [user, isEntrepreneur]);

  const handleResetPassword = async () => {
    if (!user?.email) return;
    setIsResettingPassword(true);
    const { error } = await resetPassword(user.email);
    setIsResettingPassword(false);
    if (error) {
      toast({ title: "Error", description: error, variant: "destructive" });
    } else {
      toast({ title: "Password reset email sent", description: "Check your inbox for the reset link." });
    }
  };

  if (!user) return null;

  const shopStatus = subscription ? getShopStatusFromProfile(subscription) : null;

  return (
    <PageWrapper patternVariant="dots" patternOpacity={0.4}>
      <div className="container mx-auto py-8 px-4 sm:px-6 max-w-2xl relative z-10">
        <div className="mb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)} 
              className="mb-4 hover:bg-primary/10 -ml-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <h1 className="text-3xl font-heading font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Settings
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your account and preferences
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          {/* Profile Section */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Account Profile</CardTitle>
              </div>
              <CardDescription>Your basic information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold">Name</p>
                  <p className="font-medium">{user.firstName} {user.lastName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">Account Type</p>
                <p className="font-medium capitalize">{user.role}</p>
              </div>
            </CardContent>
          </Card>

          {/* Shop Settings - Entrepreneurs only */}
          {isEntrepreneur && (
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Store className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">Shop Settings</CardTitle>
                </div>
                <CardDescription>Manage your store and identity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/my-store" className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Manage Store</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </Link>
                <Link to="/identity-verification" className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Identity Verification</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </Link>
                {shop && (
                  <a
                    href={`/shop/${shop.shop_slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">View Public Store</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </a>
                )}
              </CardContent>
            </Card>
          )}

          {/* Subscription Status - Entrepreneurs only */}
          {isEntrepreneur && shopStatus && (
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">Subscription</CardTitle>
                </div>
                <CardDescription>Your current plan status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ShopStatusBadge
                  status={shopStatus.status}
                  daysRemaining={shopStatus.daysRemaining}
                  variant="card"
                  showUpgradeAction={true}
                />
                <Link to="/subscription">
                  <Button variant="outline" size="sm" className="mt-2">
                    <Sparkles className="w-3 h-3 mr-1.5" />
                    Manage Subscription
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Security & Privacy */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Security</CardTitle>
              </div>
              <CardDescription>Manage password and authentication</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Reset Password</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetPassword}
                  disabled={isResettingPassword}
                >
                  {isResettingPassword ? "Sending..." : "Send Reset Email"}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Notifications</span>
                </div>
                <Button variant="ghost" size="sm" disabled className="opacity-50">Manage</Button>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive/20 bg-destructive/5 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Permanent actions affecting your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold">Delete Account</p>
                  <p className="text-xs text-muted-foreground">
                    Permanently delete your account and all associated data.
                    {isEntrepreneur && (
                      <span className="block mt-1 text-destructive font-medium">
                        This will also delete your store, products, orders, and customer data.
                      </span>
                    )}
                  </p>
                </div>
                <DeleteAccountDialog isShopOwner={isEntrepreneur} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Settings;
