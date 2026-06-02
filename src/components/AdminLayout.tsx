import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, Clock } from "lucide-react";
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
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

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

      const isPrimaryAdminEmail = user.email?.toLowerCase().trim() === "steerifygroup@gmail.com";

      // Primary admin email — always grant access immediately.
      // AuthContext already forces 'ADMIN' for this email, so this is secure.
      if (isPrimaryAdminEmail) {
        setIsAdmin(true);
        return;
      }

      // For other potential admins: check user_roles table
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();

      // SECURITY: require explicit user_roles entry. Do NOT trust profiles.role alone.

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
          <header className="h-14 border-b border-border/60 flex items-center justify-between px-3 sm:px-6 bg-card/98 backdrop-blur-sm sticky top-0 z-30 shadow-sm">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors" />
              <div className="h-4 w-px bg-border/60" />
              {/* Mobile: just page title */}
              <p className="text-xs font-bold text-foreground sm:hidden truncate max-w-[130px]">{pageTitle}</p>
              {/* Desktop: breadcrumb */}
              <div className="hidden sm:flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground font-medium">Admin</span>
                <span className="text-muted-foreground/40 text-xs">/</span>
                <h1 className="text-xs font-bold text-foreground">{pageTitle}</h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Live clock — desktop only */}
              <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 rounded-lg px-2.5 py-1 border border-border/40">
                <Clock className="w-3 h-3" />
                <span className="tabular-nums font-medium">
                  {currentTime.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', hour12: true })}
                </span>
              </div>

              {/* Admin role badge */}
              <Badge className="hidden sm:flex bg-gradient-to-r from-primary to-accent text-white border-0 text-[10px] font-bold px-2 shadow-sm">
                ADMIN
              </Badge>

              {/* Avatar with gradient ring */}
              <div className="relative">
                <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-br from-primary to-accent opacity-60 blur-[1px]" />
                <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-extrabold shadow-sm">
                  {adminName.charAt(0).toUpperCase()}
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="hover:bg-destructive/10 hover:text-destructive gap-1.5 text-xs h-8 px-2 sm:px-3 rounded-lg transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-4 sm:p-6 bg-background overflow-auto relative">
            <AdirePattern variant="dots" className="text-primary" opacity={0.04} />
            <div className="relative z-10">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
