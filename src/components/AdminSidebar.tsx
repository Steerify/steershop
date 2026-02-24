import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard, Store, Package, ShoppingCart, Users,
  Gift, GraduationCap, Award, MessageSquare, UserPlus,
  Crown, Sparkles, Megaphone, DollarSign, Tv, Activity, Bell
} from "lucide-react";
import logo from "@/assets/steersolo-logo.jpg";

// Grouped menu structure
const menuGroups = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
      { title: "Platform Updates", url: "/admin/updates", icon: Bell },
      { title: "Activity Logs", url: "/admin/activity-logs", icon: Activity },
      { title: "Platform Earnings", url: "/admin/earnings", icon: DollarSign },
    ],
  },
  {
    label: "Marketplace",
    items: [
      { title: "Shops", url: "/admin/shops", icon: Store },
      { title: "Featured Shops", url: "/admin/featured-shops", icon: Sparkles },
      { title: "Products", url: "/admin/products", icon: Package },
      { title: "Orders", url: "/admin/orders", icon: ShoppingCart },
    ],
  },
  {
    label: "Community",
    items: [
      { title: "Users", url: "/admin/users", icon: Users },
      { title: "Top Sellers", url: "/admin/top-sellers", icon: Crown },
      { title: "Referrals", url: "/admin/referrals", icon: UserPlus },
    ],
  },
  {
    label: "Tools",
    items: [
      { title: "Ads Manager", url: "/admin/ads", icon: Tv },
      { title: "Marketing Requests", url: "/admin/marketing", icon: Megaphone },
      { title: "Courses", url: "/admin/courses", icon: GraduationCap },
      { title: "Rewards", url: "/admin/prizes", icon: Award },
      { title: "Special Offers", url: "/admin/offers", icon: Gift },
      { title: "Feedback", url: "/admin/feedback", icon: MessageSquare },
    ],
  },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;

  return (
    <Sidebar className={collapsed ? "w-14" : "w-56"}>
      <SidebarContent className="bg-card border-r border-border/60">
        {/* Logo Header */}
        <div className={`border-b border-border/60 ${collapsed ? "p-2" : "p-4"}`}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl overflow-hidden shadow-md ring-2 ring-primary/20 shrink-0">
              <img src={logo} alt="SteerSolo" className="w-full h-full object-cover" />
            </div>
            {!collapsed && (
              <div>
                <span className="font-bold text-sm bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent block leading-tight">
                  SteerSolo
                </span>
                <span className="text-xs text-muted-foreground font-medium">Admin Panel</span>
              </div>
            )}
          </div>
        </div>

        {/* Menu Groups */}
        <div className="flex-1 overflow-y-auto py-2">
          {menuGroups.map((group) => (
            <SidebarGroup key={group.label} className="py-1">
              {!collapsed && (
                <SidebarGroupLabel className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest px-3 mb-1">
                  {group.label}
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    const active = isActive(item.url);
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={active}
                          className={`relative transition-all duration-150 rounded-xl mx-1 ${
                            active
                              ? "bg-primary/10 text-primary font-semibold"
                              : "hover:bg-muted text-muted-foreground hover:text-foreground"
                          }`}
                          title={collapsed ? item.title : undefined}
                        >
                          <Link to={item.url} className="flex items-center gap-2.5 px-2.5 py-2">
                            {/* Active indicator */}
                            {active && (
                              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full" />
                            )}
                            <item.icon className={`w-4 h-4 shrink-0 ${active ? "text-primary" : ""}`} />
                            {!collapsed && (
                              <span className="text-sm truncate">{item.title}</span>
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
