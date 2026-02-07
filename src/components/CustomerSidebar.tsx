import { Home, ShoppingBag, Sparkles, GraduationCap, LogOut, Users, Settings, Heart } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/steersolo-logo.jpg";

const items = [
  { title: "Dashboard", url: "/customer_dashboard", icon: Home },
  { title: "My Orders", url: "/customer/orders", icon: ShoppingBag },
  { title: "Wishlist", url: "/customer/wishlist", icon: Heart },
  { title: "Courses", url: "/customer/courses", icon: GraduationCap },
  { title: "Rewards", url: "/customer/rewards", icon: Sparkles },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function CustomerSidebar() {
  const { state } = useSidebar();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signOut } = useAuth();
  const collapsed = state === "collapsed";

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged out",
        description: "See you next time!",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary/10 text-primary font-medium border-l-2 border-primary" : "hover:bg-muted/50";

  return (
    <Sidebar className={collapsed ? "w-14" : "w-60"} collapsible="icon">
      <SidebarContent className="bg-card border-r border-border flex flex-col h-full">
        {/* Header with Logo */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md ring-2 ring-primary/20">
              <img src={logo} alt="SteerSolo" className="w-full h-full object-cover" />
            </div>
            {!collapsed && (
              <span className="font-heading font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                SteerSolo
              </span>
            )}
          </div>
        </div>

        <SidebarTrigger className="m-2 self-end" />

        <SidebarGroup className="flex-1">
          <SidebarGroupLabel className="text-muted-foreground font-medium">
            {!collapsed && "Customer Portal"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} className="hover:bg-destructive/10 hover:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  {!collapsed && <span>Logout</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
