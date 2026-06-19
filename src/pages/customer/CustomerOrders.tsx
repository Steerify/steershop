import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";
import orderService from "@/services/order.service";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { CustomerSidebar } from "@/components/CustomerSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShoppingCart, ArrowRight, ShieldCheck, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { OrderReviewPrompt } from "@/components/OrderReviewPrompt";
import { AdirePattern } from "@/components/patterns/AdirePattern";
import { OrderTimeline } from "@/components/OrderTimeline";
import logo from "@/assets/steersolo-logo.png";

const CustomerOrders = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [releasingOrderId, setReleasingOrderId] = useState<string | null>(null);

  const handleReleaseEscrow = async (orderId: string) => {
    if (
      !confirm(
        "Confirm you have received this order? This releases your payment from escrow to the seller and cannot be undone.",
      )
    ) {
      return;
    }
    setReleasingOrderId(orderId);
    try {
      const result = await orderService.releaseEscrow(orderId);
      toast({
        title: "Payment released 🎉",
        description: result?.message || "Thanks for confirming delivery. The seller has been paid.",
      });
      await loadOrders();
    } catch (error: any) {
      toast({
        title: "Couldn't release payment",
        description: error?.message || "Please try again shortly. Your funds remain safely held.",
        variant: "destructive",
      });
    } finally {
      setReleasingOrderId(null);
    }
  };

  useEffect(() => {
    if (!isAuthLoading) {
      if (user) {
        loadOrders();
      } else {
        navigate("/auth/login");
      }
    }
  }, [user, isAuthLoading, navigate]);

  const loadOrders = async () => {
    try {
      if (!user) return;

      const orders = await orderService.getOrdersByCustomer(user.id, user.email ?? undefined);
      setOrders(orders || []);
    } catch (error: any) {
      console.error("Error loading orders:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load orders",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "border-yellow-500/20 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
      case "awaiting_approval":
        return "border-orange-500/20 bg-orange-500/10 text-orange-600 dark:text-orange-400";
      case "confirmed":
        return "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400";
      case "processing":
        return "border-purple-500/20 bg-purple-500/10 text-purple-600 dark:text-purple-400";
      case "out_for_delivery":
        return "border-indigo-500/20 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400";
      case "delivered":
        return "border-green-500/20 bg-green-500/10 text-green-600 dark:text-green-400";
      case "completed":
        return "border-green-500/20 bg-green-500/10 text-green-600 dark:text-green-400";
      case "cancelled":
        return "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400";
      default:
        return "border-border bg-muted/50 text-muted-foreground";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-xl overflow-hidden">
            <img src={logo} alt="Loading" className="w-full h-full object-cover" />
          </div>
          <p className="text-muted-foreground">Loading orders...</p>
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
          <header className="h-14 sm:h-16 border-b border-border/50 bg-card/80 backdrop-blur-lg flex items-center px-4 sm:px-6">
            <div className="h-1 absolute top-0 left-0 right-0 bg-gradient-to-r from-primary via-accent to-primary" />
            <SidebarTrigger className="mr-2 sm:mr-4" />
            <h1 className="text-xl sm:text-2xl font-heading font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              My Orders
            </h1>
          </header>

          <main className="p-4 sm:p-6">
            {orders.length === 0 ? (
              <Card className="border-primary/10">
                <CardContent className="py-16 text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center">
                    <ShoppingCart className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-heading font-semibold mb-2">No orders yet</h3>
                  <p className="text-muted-foreground mb-6">Start shopping to see your orders here</p>
                  <Button onClick={() => navigate("/shops")} className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                    Browse Shops
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id}>
                    {/* Review Prompt for delivered/completed orders */}
                    {(order.status === "delivered" || order.status === "completed") && order.order_items && (
                      <OrderReviewPrompt
                        orderId={order.id}
                        orderItems={order.order_items}
                        onReviewsSubmitted={loadOrders}
                      />
                    )}
                    
                    <Card className="border-primary/10 hover:shadow-lg hover:shadow-primary/5 transition-all">
                      <CardHeader className="border-b border-border/50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="flex items-center gap-2 mb-2 font-heading">
                              Order #{order.id.slice(0, 8)}
                              <Badge variant="outline" className={getStatusColor(order.status)}>
                                {order.status.replace(/_/g, ' ')}
                              </Badge>
                            </CardTitle>
                            <CardDescription>
                              Placed on {format(new Date(order.created_at), "MMM dd, yyyy")}
                              {order.paid_at && (
                                <span className="block text-green-600 dark:text-green-400 mt-1">
                                  Paid on {format(new Date(order.paid_at), "MMM dd, yyyy 'at' h:mm a")}
                                </span>
                              )}
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-heading font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                              ₦{parseFloat(order.total_amount).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4 space-y-4">
                        {/* Order Timeline */}
                        <OrderTimeline order={order} />

                        {/* Escrow: buyer confirms delivery to release funds */}
                        {order.payment_status === "held_in_escrow" && (
                          <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-xl space-y-3">
                            <div className="flex items-start gap-2.5">
                              <span className="p-1.5 rounded-lg bg-primary/15 text-primary shrink-0">
                                <ShieldCheck className="w-4 h-4" />
                              </span>
                              <div>
                                <p className="font-heading font-semibold text-sm text-foreground">
                                  Your payment is protected in escrow
                                </p>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  We're holding ₦{parseFloat(order.total_amount).toLocaleString()} securely.
                                  Once your order arrives, confirm delivery to release the funds to the seller.
                                </p>
                              </div>
                            </div>
                            <Button
                              onClick={() => handleReleaseEscrow(order.id)}
                              disabled={releasingOrderId === order.id}
                              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
                            >
                              {releasingOrderId === order.id ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Releasing payment...
                                </>
                              ) : (
                                <>
                                  <PackageCheck className="w-4 h-4 mr-2" />
                                  Confirm Delivery &amp; Release Payment
                                </>
                              )}
                            </Button>
                          </div>
                        )}

                        {order.payment_status === "released_from_escrow" && (
                          <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-sm text-green-700 dark:text-green-400">
                            <ShieldCheck className="w-4 h-4 shrink-0" />
                            <span className="font-medium">Delivery confirmed — payment released to the seller.</span>
                          </div>
                        )}

                        {order.order_items?.some((item: any) => item.products?.is_digital) && (order.paid_at || ["confirmed", "processing", "delivered", "completed"].includes(order.status)) && (
                          <div className="p-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-xl space-y-3">
                            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-heading font-semibold text-sm">
                              <span className="p-1.5 rounded-lg bg-emerald-500/20">📥</span>
                              Instant Digital Delivery
                            </div>
                            <div className="space-y-2">
                              {order.order_items.filter((item: any) => item.products?.is_digital).map((item: any) => (
                                <div key={item.id} className="text-xs p-3 bg-card border border-border/60 rounded-lg flex flex-col gap-2 shadow-sm">
                                  <div className="flex items-center justify-between font-bold text-foreground">
                                    <span>{item.products?.name}</span>
                                    {item.products?.digital_file_url && (
                                      <a
                                        href={item.products.digital_file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-md hover:shadow-md transition-all flex items-center gap-1.5 text-[11px]"
                                      >
                                        Download File 📥
                                      </a>
                                    )}
                                  </div>
                                  {item.products?.digital_delivery_text && (
                                    <div className="p-2.5 bg-muted rounded-md text-muted-foreground whitespace-pre-wrap font-mono text-[11px] leading-relaxed border border-border/40">
                                      {item.products.digital_delivery_text}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="border border-border/50 rounded-lg divide-y divide-border/50">
                          {order.order_items?.map((item: any) => (
                            <div key={item.id} className="p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors">
                              {item.products?.image_url && (
                                <img
                                  src={item.products.image_url}
                                  alt={item.products.name}
                                  className="w-16 h-16 object-cover rounded-lg shadow-sm"
                                />
                              )}
                              <div className="flex-1">
                                <p className="font-semibold">{item.products?.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {item.products?.shops?.shop_name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Quantity: {item.quantity} × ₦{parseFloat(item.price).toLocaleString()}
                                </p>
                              </div>
                              <p className="font-semibold text-primary">
                                ₦{(item.quantity * parseFloat(item.price)).toLocaleString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default CustomerOrders;
