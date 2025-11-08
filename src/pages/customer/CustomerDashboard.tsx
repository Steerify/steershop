import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { CustomerSidebar } from "@/components/CustomerSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ShoppingBag, Package, Clock, CheckCircle2, Award, GraduationCap } from "lucide-react";

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    inProgressOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [coursesCompleted, setCoursesCompleted] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        navigate("/auth/login");
        return;
      }

      const { data: orders, error } = await supabase
        .from("orders")
        .select("*")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const allOrders = orders || [];
      
      setStats({
        totalOrders: allOrders.length,
        pendingOrders: allOrders.filter(o => o.status === "pending" || o.status === "awaiting_approval").length,
        completedOrders: allOrders.filter(o => o.status === "completed" || o.status === "delivered").length,
        inProgressOrders: allOrders.filter(o => o.status === "confirmed" || o.status === "processing" || o.status === "in_progress" || o.status === "out_for_delivery").length
      });

      setRecentOrders(allOrders.slice(0, 5));

      // Load rewards points and courses
      const { data: pointsData } = await supabase
        .from("rewards_points")
        .select("total_points")
        .eq("user_id", user.id)
        .maybeSingle();

      const { data: enrollmentsData } = await supabase
        .from("course_enrollments")
        .select("completed_at")
        .eq("user_id", user.id)
        .not("completed_at", "is", null);

      setTotalPoints(pointsData?.total_points || 0);
      setCoursesCompleted(enrollmentsData?.length || 0);
    } catch (error: any) {
      console.error("Error loading dashboard:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <CustomerSidebar />
        
        <div className="flex-1">
          <header className="h-16 border-b bg-card flex items-center px-6">
            <SidebarTrigger className="mr-4" />
            <h1 className="text-2xl font-bold">Dashboard</h1>
          </header>

          <main className="p-6 space-y-6">
            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalOrders}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.completedOrders}</div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate("/customer/rewards")}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Reward Points</CardTitle>
                  <Award className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{totalPoints}</div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate("/customer/courses")}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Courses Completed</CardTitle>
                  <GraduationCap className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{coursesCompleted}</div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Your latest order activity</CardDescription>
              </CardHeader>
              <CardContent>
                {recentOrders.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No orders yet</p>
                ) : (
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                        <div>
                          <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">₦{parseFloat(order.total_amount).toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {order.status.replace(/_/g, ' ')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {recentOrders.length > 0 && (
                  <Button 
                    variant="outline" 
                    className="w-full mt-4"
                    onClick={() => navigate("/customer/orders")}
                  >
                    View All Orders
                  </Button>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default CustomerDashboard;
