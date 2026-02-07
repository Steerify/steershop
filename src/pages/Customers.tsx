import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import shopService from "@/services/shop.service";
import { ArrowLeft, Loader2, Users, Search, MessageCircle, Mail, Phone, ShoppingCart, TrendingUp } from "lucide-react";
import { PageWrapper } from "@/components/PageWrapper";
import { format } from "date-fns";

interface CustomerRecord {
  name: string;
  email: string | null;
  phone: string | null;
  total_orders: number;
  total_spent: number;
  last_order_date: string;
}

const Customers = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<CustomerRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!authLoading) {
      if (user) loadCustomers();
      else navigate("/auth/login");
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCustomers(customers);
    } else {
      const q = searchQuery.toLowerCase();
      setFilteredCustomers(customers.filter(c =>
        c.name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.includes(q)
      ));
    }
  }, [searchQuery, customers]);

  const loadCustomers = async () => {
    try {
      if (!user) return;
      const shopResponse = await shopService.getShopByOwner(user.id);
      const shop = Array.isArray(shopResponse.data) ? shopResponse.data[0] : shopResponse.data;
      if (!shop) {
        navigate("/my-store");
        return;
      }

      // Aggregate customer data from orders
      const { data: orders, error } = await supabase
        .from("orders")
        .select("customer_name, customer_email, customer_phone, total_amount, created_at")
        .eq("shop_id", shop.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const customerMap = new Map<string, CustomerRecord>();

      (orders || []).forEach((order) => {
        const key = order.customer_email || order.customer_phone || order.customer_name || "unknown";
        const existing = customerMap.get(key);
        if (existing) {
          existing.total_orders += 1;
          existing.total_spent += parseFloat(String(order.total_amount || 0));
          // Keep latest name/contact info
          if (order.customer_name) existing.name = order.customer_name;
          if (order.customer_email) existing.email = order.customer_email;
          if (order.customer_phone) existing.phone = order.customer_phone;
        } else {
          customerMap.set(key, {
            name: order.customer_name || "Unknown",
            email: order.customer_email,
            phone: order.customer_phone,
            total_orders: 1,
            total_spent: parseFloat(String(order.total_amount || 0)),
            last_order_date: order.created_at,
          });
        }
      });

      // Sort by total spent descending
      const sorted = Array.from(customerMap.values()).sort((a, b) => b.total_spent - a.total_spent);
      setCustomers(sorted);
      setFilteredCustomers(sorted);
    } catch (error: any) {
      console.error("Error loading customers:", error);
      toast({ title: "Error", description: "Failed to load customers", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const openWhatsApp = (phone: string, name: string) => {
    const cleaned = phone.replace(/[^\\d+]/g, "");
    const formatted = cleaned.startsWith("+") ? cleaned : `+${cleaned}`;
    const message = encodeURIComponent(`Hi ${name}, this is from our store. How can we help you today?`);
    window.open(`https://api.whatsapp.com/send?phone=${formatted}&text=${message}`, "_blank");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalCustomers = customers.length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.total_spent, 0);
  const repeatCustomers = customers.filter(c => c.total_orders > 1).length;

  return (
    <PageWrapper patternVariant="dots" patternOpacity={0.5}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="hover:bg-primary/10 min-h-[44px]">
            <ArrowLeft className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Back to Dashboard</span>
          </Button>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold mb-1 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Customers
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">Your customer relationships at a glance</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
          <Card className="border-primary/10">
            <CardContent className="p-4 text-center">
              <Users className="w-6 h-6 text-primary mx-auto mb-1" />
              <p className="text-2xl font-bold">{totalCustomers}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card className="border-primary/10">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-6 h-6 text-accent mx-auto mb-1" />
              <p className="text-2xl font-bold">{repeatCustomers}</p>
              <p className="text-xs text-muted-foreground">Repeat</p>
            </CardContent>
          </Card>
          <Card className="border-primary/10">
            <CardContent className="p-4 text-center">
              <ShoppingCart className="w-6 h-6 text-primary mx-auto mb-1" />
              <p className="text-2xl font-bold">₦{totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total Revenue</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Customer List */}
        {filteredCustomers.length === 0 ? (
          <Card className="border-primary/10">
            <CardContent className="py-16 text-center">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-heading font-semibold mb-2">
                {customers.length === 0 ? "No customers yet" : "No results found"}
              </h3>
              <p className="text-muted-foreground">
                {customers.length === 0
                  ? "Customers will appear here when they place orders"
                  : "Try a different search term"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredCustomers.map((customer, idx) => (
              <Card key={idx} className="border-primary/10 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{customer.name}</h3>
                        {customer.total_orders > 2 && (
                          <Badge variant="secondary" className="text-xs shrink-0">VIP</Badge>
                        )}
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        {customer.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            <span className="truncate">{customer.email}</span>
                          </div>
                        )}
                        {customer.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            <span>{customer.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-primary">₦{customer.total_spent.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{customer.total_orders} order{customer.total_orders > 1 ? "s" : ""}</p>
                      <p className="text-xs text-muted-foreground">
                        Last: {format(new Date(customer.last_order_date), "MMM dd")}
                      </p>
                    </div>
                  </div>
                  {customer.phone && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 w-full border-green-500/30 text-green-600 hover:bg-green-500/10"
                      onClick={() => openWhatsApp(customer.phone!, customer.name)}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message on WhatsApp
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default Customers;
