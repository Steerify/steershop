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
  LayoutDashboard, 
  Store, 
  Package, 
  ShoppingCart, 
  Users, 
  Gift,
  GraduationCap,
  Award,
  MessageSquare
} from "lucide-react";
import logo from "@/assets/steersolo-logo.jpg";

const menuItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Shops", url: "/admin/shops", icon: Store },
  { title: "Products", url: "/admin/products", icon: Package },
  { title: "Orders", url: "/admin/orders", icon: ShoppingCart },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Courses", url: "/admin/courses", icon: GraduationCap },
  { title: "Rewards", url: "/admin/prizes", icon: Award },
  { title: "Special Offers", url: "/admin/offers", icon: Gift },
  { title: "Feedback", url: "/admin/feedback", icon: MessageSquare },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;

  return (
    <Sidebar className={collapsed ? "w-14" : "w-60"}>
      <SidebarContent className="bg-card border-r border-border">
        {/* Header with Logo */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md ring-2 ring-primary/20">
              <img src={logo} alt="SteerSolo" className="w-full h-full object-cover" />
            </div>
            {!collapsed && (
              <span className="font-heading font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Admin Panel
              </span>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground font-medium">
            {!collapsed && "Management"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive(item.url)}
                    className={isActive(item.url) ? "bg-primary/10 text-primary border-l-2 border-primary" : "hover:bg-muted"}
                  >
                    <Link to={item.url}>
                      <item.icon className={`w-4 h-4 ${isActive(item.url) ? "text-primary" : ""}`} />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
