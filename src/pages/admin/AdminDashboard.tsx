import { useEffect, useState } from "react";
import adminService from "@/services/admin.service";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Store, Package, ShoppingCart, Users, Bell, Loader2, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalShops: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
  });
  const [isRunningReminders, setIsRunningReminders] = useState(false);
  const [reminderResults, setReminderResults] = useState<any>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const analytics = await adminService.getAnalytics();
      setStats({
        totalShops: analytics.totalShops || 0,
        totalProducts: analytics.totalProducts || 0,
        totalOrders: analytics.totalOrders || 0,
        totalUsers: analytics.totalUsers || 0,
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
    }
  };

  const handleRunEngagementReminders = async () => {
    setIsRunningReminders(true);
    setReminderResults(null);
    try {
      const { data, error } = await supabase.functions.invoke("engagement-reminders");
      if (error) throw error;
      setReminderResults(data);
      toast({
        title: "Engagement Reminders Complete ✅",
        description: `Incomplete reg: ${data?.incomplete_registration || 0}, No shop: ${data?.no_shop || 0}, No products: ${data?.no_products || 0}, No sales: ${data?.no_sales || 0}`,
      });
    } catch (error: any) {
      console.error("Error running reminders:", error);
      toast({
        title: "Failed to run reminders",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsRunningReminders(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Overview of your platform</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Shops</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalShops}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
        </div>

        {/* Engagement Reminders Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Engagement Reminders
            </CardTitle>
            <CardDescription>
              Scan all users and send reminder emails for incomplete registrations, missing shops, empty stores, and inactive sellers.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleRunEngagementReminders}
              disabled={isRunningReminders}
              className="w-full sm:w-auto"
            >
              {isRunningReminders ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Scanning users & sending emails...
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4 mr-2" />
                  Run Engagement Reminders Now
                </>
              )}
            </Button>

            {reminderResults && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Incomplete Registration</p>
                    <p className="text-lg font-semibold">{reminderResults.incomplete_registration || 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">No Shop Created</p>
                    <p className="text-lg font-semibold">{reminderResults.no_shop || 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">No Products</p>
                    <p className="text-lg font-semibold">{reminderResults.no_products || 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">No Sales (7d)</p>
                    <p className="text-lg font-semibold">{reminderResults.no_sales || 0}</p>
                  </div>
                </div>
              </div>
            )}

            {reminderResults?.errors?.length > 0 && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm font-medium text-destructive mb-1">Errors ({reminderResults.errors.length})</p>
                <ul className="text-xs text-destructive/80 space-y-1">
                  {reminderResults.errors.slice(0, 5).map((err: string, i: number) => (
                    <li key={i}>• {err}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
