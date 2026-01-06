import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";
import { CustomerSidebar } from "@/components/CustomerSidebar";
import orderService from "@/services/order.service";
import { rewardService } from "@/services/reward.service";
import { courseService } from "@/services/course.service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Package, Clock, CheckCircle2, Award, GraduationCap, ArrowRight, Store } from "lucide-react";
import { AdirePattern } from "@/components/patterns/AdirePattern";
import logo from "@/assets/steersolo-logo.jpg";
import Joyride, { CallBackProps, STATUS } from "react-joyride";
import { useTour } from "@/hooks/useTour";
import { TourTooltip } from "@/components/tours/TourTooltip";
import { customerDashboardTourSteps } from "@/components/tours/tourSteps";
import { TourButton } from "@/components/tours/TourButton";
import { ReferralCard } from "@/components/ReferralCard";

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    inProgressOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [coursesCompleted, setCoursesCompleted] = useState(0);

  // Tour state
  const { hasSeenTour, isRunning, startTour, endTour, resetTour } = useTour('customer-dashboard');

  const handleTourCallback = (data: CallBackProps) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      endTour(status === STATUS.FINISHED);
    }
  };

  useEffect(() => {
    if (!isAuthLoading) {
      if (user) {
        loadDashboardData();
      } else {
        navigate("/auth/login");
      }
    }
  }, [user, isAuthLoading, navigate]);

  const loadDashboardData = async () => {
    try {
      if (!user) return;

      // Get user profile for name
      setUserName(user.firstName || user.email?.split('@')[0] || "Customer");

      const allOrders = await orderService.getOrdersByCustomer(user.id);
      
      setStats({
        totalOrders: allOrders.length,
        pendingOrders: allOrders.filter(o => o.status === "pending" || o.status === "awaiting_approval").length,
        completedOrders: allOrders.filter(o => o.status === "completed" || o.status === "delivered").length,
        inProgressOrders: allOrders.filter(o => o.status === "confirmed" || o.status === "processing" || o.status === "in_progress" || o.status === "out_for_delivery").length
      });

      setRecentOrders(allOrders.slice(0, 5));

      // Load rewards points and courses
      const pointsData = await rewardService.getUserPoints();
      const enrollmentsData = await courseService.getEnrollments();

      setTotalPoints(pointsData?.data?.total_points || 0);
      setCoursesCompleted(enrollmentsData?.data?.filter(e => e.completed_at).length || 0);
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-xl overflow-hidden">
            <img src={logo} alt="Loading" className="w-full h-full object-cover" />
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-primary/5 via-background to-accent/5 relative">
        <AdirePattern variant="dots" className="fixed inset-0 opacity-5 pointer-events-none" />
        <CustomerSidebar />
        
        <div className="flex-1 relative z-10">
          <header className="h-14 sm:h-16 border-b border-border/50 bg-card/80 backdrop-blur-lg flex items-center justify-between px-4 sm:px-6">
            <div className="h-1 absolute top-0 left-0 right-0 bg-gradient-to-r from-primary via-accent to-primary" />
            <div className="flex items-center">
              <SidebarTrigger className="mr-2 sm:mr-4" />
              <h1 className="text-xl sm:text-2xl font-heading font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Dashboard
              </h1>
            </div>
            <TourButton 
              onStartTour={startTour} 
              hasSeenTour={hasSeenTour} 
              onResetTour={resetTour}
            />
          </header>

          <main className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Welcome Section */}
            <div className="mb-2">
              <h2 className="text-2xl sm:text-3xl font-heading font-bold mb-1">
                Welcome back, {userName}!
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">Here's an overview of your activity</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4" data-tour="stats-grid">
              <Card className="border-primary/10 hover:shadow-lg hover:shadow-primary/5 transition-all group">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl sm:text-3xl font-heading font-bold">{stats.totalOrders}</div>
                </CardContent>
              </Card>

              <Card className="border-primary/10 hover:shadow-lg hover:shadow-primary/5 transition-all group">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Completed</CardTitle>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl sm:text-3xl font-heading font-bold text-green-600">{stats.completedOrders}</div>
                </CardContent>
              </Card>

              <Card className="border-primary/10 hover:shadow-lg hover:shadow-primary/5 transition-all group cursor-pointer" onClick={() => navigate("/customer/rewards")} data-tour="reward-points">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Reward Points</CardTitle>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-gold/20 to-amber-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Award className="h-4 w-4 sm:h-5 sm:w-5 text-gold" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl sm:text-3xl font-heading font-bold text-gold">{totalPoints}</div>
                </CardContent>
              </Card>

              <Card className="border-primary/10 hover:shadow-lg hover:shadow-primary/5 transition-all group cursor-pointer" onClick={() => navigate("/customer/courses")} data-tour="courses-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Courses</CardTitle>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl sm:text-3xl font-heading font-bold text-purple-600">{coursesCompleted}</div>
                </CardContent>
              </Card>
            </div>

            {/* Two Column Layout: Orders + Referral */}
            <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Recent Orders - Takes 2 columns */}
              <Card className="border-primary/10 lg:col-span-2" data-tour="recent-orders">
                <CardHeader className="border-b border-border/50">
                  <CardTitle className="font-heading">Recent Orders</CardTitle>
                  <CardDescription>Your latest order activity</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  {recentOrders.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center">
                        <ShoppingBag className="w-8 h-8 text-primary" />
                      </div>
                      <p className="text-muted-foreground mb-4">No orders yet</p>
                      <Button onClick={() => navigate("/shops")} className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                        <Store className="w-4 h-4 mr-2" />
                        Start Shopping
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentOrders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
                          <div>
                            <p className="font-semibold">Order #{order.id.slice(0, 8)}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-heading font-bold text-primary">₦{parseFloat(order.total_amount).toLocaleString()}</p>
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
                      className="w-full mt-4 hover:bg-primary/10"
                      onClick={() => navigate("/customer/orders")}
                    >
                      View All Orders
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Referral Card - Takes 1 column */}
              <div className="lg:col-span-1">
                <ReferralCard />
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Guided Tour */}
      <Joyride
        steps={customerDashboardTourSteps}
        run={isRunning}
        continuous
        showSkipButton
        showProgress
        callback={handleTourCallback}
        tooltipComponent={TourTooltip}
        styles={{
          options: {
            zIndex: 10000,
            arrowColor: 'hsl(var(--card))',
          }
        }}
      />
    </SidebarProvider>
  );
};

export default CustomerDashboard;
