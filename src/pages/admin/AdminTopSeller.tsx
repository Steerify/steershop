import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Crown, Trophy, Store, TrendingUp, Calendar, Star } from "lucide-react";
import { format } from "date-fns";

interface EligibleShop {
  id: string;
  shop_name: string;
  owner_email: string;
  total_sales: number;
  plan_slug: string;
  created_at: string;
}

interface TopSellerBanner {
  id: string;
  shop_id: string;
  month_year: string;
  total_sales: number;
  is_active: boolean;
  created_at: string;
  shop?: {
    shop_name: string;
    shop_slug: string;
  };
}

const AdminTopSeller = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [eligibleShops, setEligibleShops] = useState<EligibleShop[]>([]);
  const [topSellerBanners, setTopSellerBanners] = useState<TopSellerBanner[]>([]);
  const [promotingShopId, setPromotingShopId] = useState<string | null>(null);

  const currentMonthYear = format(new Date(), "yyyy-MM");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Get business tier shops with 100+ completed sales
      const { data: shopsData, error: shopsError } = await supabase
        .from("shops")
        .select(`
          id,
          shop_name,
          created_at,
          owner_id,
          profiles!shops_owner_id_fkey (
            email,
            subscription_plan_id,
            subscription_plans (
              slug
            )
          )
        `)
        .eq("is_active", true);

      if (shopsError) throw shopsError;

      // Get order counts for each shop
      const eligibleShopsWithSales: EligibleShop[] = [];

      for (const shop of shopsData || []) {
        const { count, error: countError } = await supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .eq("shop_id", shop.id)
          .eq("status", "delivered");

        if (countError) continue;

        const profile = shop.profiles as any;
        const planSlug = profile?.subscription_plans?.slug || "free";

        // Only include business tier shops with 100+ sales
        if (planSlug === "business" && (count || 0) >= 100) {
          eligibleShopsWithSales.push({
            id: shop.id,
            shop_name: shop.shop_name,
            owner_email: profile?.email || "Unknown",
            total_sales: count || 0,
            plan_slug: planSlug,
            created_at: shop.created_at,
          });
        }
      }

      // Sort by total sales descending
      eligibleShopsWithSales.sort((a, b) => b.total_sales - a.total_sales);
      setEligibleShops(eligibleShopsWithSales);

      // Get existing top seller banners
      const { data: bannersData, error: bannersError } = await supabase
        .from("top_seller_banners")
        .select(`
          *,
          shops (
            shop_name,
            shop_slug
          )
        `)
        .order("created_at", { ascending: false })
        .limit(12);

      if (bannersError) throw bannersError;

      setTopSellerBanners((bannersData || []).map(b => ({
        ...b,
        shop: b.shops as any
      })));

    } catch (error: any) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromoteShop = async (shop: EligibleShop) => {
    setPromotingShopId(shop.id);

    try {
      // Deactivate any existing banner for this month
      await supabase
        .from("top_seller_banners")
        .update({ is_active: false })
        .eq("month_year", currentMonthYear);

      // Create new top seller banner
      const { error } = await supabase
        .from("top_seller_banners")
        .insert({
          shop_id: shop.id,
          month_year: currentMonthYear,
          total_sales: shop.total_sales,
          is_active: true,
        });

      if (error) throw error;

      toast({
        title: "Top Seller Promoted! 🏆",
        description: `${shop.shop_name} is now the Top Seller of the Month`,
      });

      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to promote shop",
        variant: "destructive",
      });
    } finally {
      setPromotingShopId(null);
    }
  };

  const handleToggleBanner = async (banner: TopSellerBanner) => {
    try {
      const { error } = await supabase
        .from("top_seller_banners")
        .update({ is_active: !banner.is_active })
        .eq("id", banner.id);

      if (error) throw error;

      toast({
        title: banner.is_active ? "Banner Deactivated" : "Banner Activated",
        description: `Banner for ${banner.shop?.shop_name} has been ${banner.is_active ? "deactivated" : "activated"}`,
      });

      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const currentTopSeller = topSellerBanners.find(
    (b) => b.month_year === currentMonthYear && b.is_active
  );

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-heading font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Top Seller of the Month
          </h1>
          <p className="text-muted-foreground">
            Promote business-tier shops with outstanding sales performance
          </p>
        </div>

        {/* Current Top Seller */}
        <Card className="border-2 border-gold/30 bg-gradient-to-r from-gold/5 to-primary/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Crown className="w-6 h-6 text-gold" />
              <CardTitle>Current Top Seller - {format(new Date(), "MMMM yyyy")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {currentTopSeller ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-gold to-primary rounded-xl flex items-center justify-center">
                    <Trophy className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{currentTopSeller.shop?.shop_name}</h3>
                    <p className="text-muted-foreground">
                      {currentTopSeller.total_sales.toLocaleString()} completed sales
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => handleToggleBanner(currentTopSeller)}
                >
                  Deactivate Banner
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No top seller promoted for this month yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Select a shop from the eligible list below
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Eligible Shops */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <CardTitle>Eligible Shops</CardTitle>
            </div>
            <CardDescription>
              Business-tier shops with 100+ completed sales
            </CardDescription>
          </CardHeader>
          <CardContent>
            {eligibleShops.length === 0 ? (
              <div className="text-center py-12">
                <Store className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No eligible shops found</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Shops need to be on the Business plan with 100+ completed sales
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Shop Name</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Total Sales</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {eligibleShops.map((shop, index) => (
                    <TableRow key={shop.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {index === 0 && <Star className="w-4 h-4 text-gold fill-gold" />}
                          #{index + 1}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{shop.shop_name}</TableCell>
                      <TableCell className="text-muted-foreground">{shop.owner_email}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                          {shop.total_sales.toLocaleString()} sales
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20">
                          {shop.plan_slug}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() => handlePromoteShop(shop)}
                          disabled={promotingShopId === shop.id}
                          className="bg-gradient-to-r from-gold to-primary"
                        >
                          {promotingShopId === shop.id ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : (
                            <Crown className="w-4 h-4 mr-2" />
                          )}
                          Promote
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Past Top Sellers */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <CardTitle>Past Top Sellers</CardTitle>
            </div>
            <CardDescription>
              History of promoted shops
            </CardDescription>
          </CardHeader>
          <CardContent>
            {topSellerBanners.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No top seller history yet</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>Shop</TableHead>
                    <TableHead>Sales</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topSellerBanners.map((banner) => (
                    <TableRow key={banner.id}>
                      <TableCell className="font-medium">
                        {format(new Date(banner.month_year + "-01"), "MMMM yyyy")}
                      </TableCell>
                      <TableCell>{banner.shop?.shop_name || "Unknown"}</TableCell>
                      <TableCell>{banner.total_sales.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={banner.is_active ? "default" : "secondary"}>
                          {banner.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleBanner(banner)}
                        >
                          {banner.is_active ? "Deactivate" : "Activate"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminTopSeller;
