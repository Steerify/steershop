import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/types/api";
import { AdirePattern } from "./patterns/AdirePattern";

interface AdminLayoutProps {
  children: React.ReactNode;
}

// Simple breadcrumb from pathname
function getPageTitle(pathname: string): string {
  const map: Record<string, string> = {
    "/admin": "Dashboard",
    "/admin/shops": "Shops",
    "/admin/featured-shops": "Featured Shops",
    "/admin/products": "Products",
    "/admin/orders": "Orders",
    "/admin/users": "Users",
    "/admin/top-sellers": "Top Sellers",
    "/admin/marketing": "Marketing Requests",
    "/admin/referrals": "Referrals",
    "/admin/courses": "Courses",
    "/admin/prizes": "Rewards & Prizes",
    "/admin/offers": "Special Offers",
    "/admin/ads": "Ads Manager",
    "/admin/feedback": "Feedback",
    "/admin/earnings": "Platform Earnings",
    "/admin/updates": "Platform Updates",
    "/admin/activity-logs": "Activity Logs",
  };
  return map[pathname] || "Admin";
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, signOut, isLoading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) checkAdminAccess();
  }, [user, authLoading]);

  const checkAdminAccess = async () => {
    try {
      if (!user) {
        toast({ title: "Access Denied", description: "Please login to continue", variant: "destructive" });
        navigate("/auth/login");
        return;
      }
      if (user.role === UserRole.ADMIN) {
        setIsAdmin(true);
        setLoading(false);
        return;
      }
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();

      if (!roles) {
        toast({ title: "Access Denied", description: "You don't have admin privileges", variant: "destructive" });
        navigate("/");
        return;
      }
      setIsAdmin(true);
    } catch (error) {
      console.error("Error checking admin access:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const pageTitle = getPageTitle(location.pathname);
  const adminName = user?.email?.split("@")[0] || "Admin";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent animate-pulse mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {/* Admin Header */}
          <header className="h-14 border-b border-border/60 flex items-center justify-between px-4 sm:px-6 bg-card/95 backdrop-blur-xl sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              <div className="hidden sm:block h-4 w-px bg-border" />
              <div className="hidden sm:block">
                <p className="text-xs text-muted-foreground font-medium">Admin Panel</p>
                <h1 className="text-sm font-bold text-foreground leading-none">{pageTitle}</h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Admin badge */}
              <Badge variant="outline" className="hidden sm:flex bg-primary/10 text-primary border-primary/20 text-xs font-semibold">
                Admin
              </Badge>

              {/* Admin avatar */}
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {adminName.charAt(0).toUpperCase()}
              </div>

              <Button variant="ghost" size="sm" onClick={handleLogout} className="hover:bg-destructive/10 hover:text-destructive gap-1.5 text-xs h-8">
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-4 sm:p-6 bg-background overflow-auto relative">
            <AdirePattern variant="dots" className="text-primary" opacity={0.04} />
            {/* Background blobs */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-accent/10 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
