import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, ShoppingCart, Package, Clock, CheckCircle, XCircle, MessageCircle, ThumbsUp, Truck, Banknote } from "lucide-react";
import { format } from "date-fns";
import OrderApprovalDialog from "@/components/OrderApprovalDialog";
import { AdirePattern } from "@/components/patterns/AdirePattern";
import logo from "@/assets/steersolo-logo.jpg";

const Orders = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [shop, setShop] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const openWhatsAppWithOrder = (order: any) => {
    if (!order.customer_phone) {
      toast({
        title: "No Phone Number",
        description: "Customer phone number is not available",
        variant: "destructive",
      });
      return false;
    }

    try {
      const cleaned = order.customer_phone.replace(/[^\d+]/g, '');
      const phoneNumber = cleaned.startsWith('+') ? cleaned : `+${cleaned}`;

      const orderSummary = order.order_items?.map((item: any) => 
        `• ${item.products?.name || 'Unknown Product'} x ${item.quantity} - ₦${(item.quantity * parseFloat(item.price || 0)).toLocaleString()}`
      ).join('%0A') || 'No items';

      const message = `🛒 *ORDER UPDATE* 🛒%0A%0AHello ${order.customer_name || 'Valued Customer'},%0A%0AThis is an update regarding your order from ${shop?.shop_name || 'our store'}.%0A%0A` +
        `*📦 ORDER DETAILS:*%0A` +
        `${orderSummary}%0A%0A` +
        `*💰 TOTAL AMOUNT:*%0A₦${parseFloat(order.total_amount || 0).toLocaleString()}%0A%0A` +
        `*📋 CURRENT STATUS:*%0A${order.status?.replace(/_/g, ' ') || 'Processing'}%0A%0A` +
        `Order ID: ${order.id?.slice(0, 8) || 'N/A'}%0A%0A` +
        `Please let me know if you have any questions about your order!`;

      const deepLink = `whatsapp://send?phone=${phoneNumber.replace('+', '')}&text=${message}`;
      const webLink = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${message}`;

      const fallbackTimer = setTimeout(() => {
        window.open(webLink, '_blank', 'noopener,noreferrer');
      }, 1000);

      const link = document.createElement('a');
      link.href = deepLink;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      
      link.addEventListener('click', () => {
        clearTimeout(fallbackTimer);
      });
      
      window.addEventListener('blur', function onBlur() {
        clearTimeout(fallbackTimer);
        window.removeEventListener('blur', onBlur);
      });
      
      link.click();
      
      setTimeout(() => {
        clearTimeout(fallbackTimer);
      }, 2000);
      
      return true;
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
      toast({
        title: "Error",
        description: "Failed to open WhatsApp",
        variant: "destructive",
      });
      return false;
    }
  };

  const openSimpleWhatsApp = (phoneNumber: string, message: string) => {
    try {
      const cleaned = phoneNumber.replace(/[^\d+]/g, '');
      const formattedNumber = cleaned.startsWith('+') ? cleaned : `+${cleaned}`;

      const encodedMessage = encodeURIComponent(message);
      const deepLink = `whatsapp://send?phone=${formattedNumber.replace('+', '')}&text=${encodedMessage}`;
      const webLink = `https://api.whatsapp.com/send?phone=${formattedNumber}&text=${encodedMessage}`;

      const fallbackTimer = setTimeout(() => {
        window.open(webLink, '_blank', 'noopener,noreferrer');
      }, 1000);

      const link = document.createElement('a');
      link.href = deepLink;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      
      link.addEventListener('click', () => {
        clearTimeout(fallbackTimer);
      });
      
      window.addEventListener('blur', function onBlur() {
        clearTimeout(fallbackTimer);
        window.removeEventListener('blur', onBlur);
      });
      
      link.click();
      
      setTimeout(() => {
        clearTimeout(fallbackTimer);
      }, 2000);
      
      return true;
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
      return false;
    }
  };

  useEffect(() => {
    loadUserAndOrders();
  }, []);

  const loadUserAndOrders = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Auth error:', userError);
        toast({
          title: "Authentication Error",
          description: "Please login again",
          variant: "destructive",
        });
        navigate("/auth/login");
        return;
      }
      
      if (!user) {
        navigate("/auth/login");
        return;
      }

      const { data: shopData, error: shopError } = await supabase
        .from("shops")
        .select("*")
        .eq("owner_id", user.id)
        .single();

      if (shopError) {
        console.error('Shop fetch error:', shopError);
        toast({
          title: "No Store Found",
          description: "Please create your store first",
          variant: "destructive",
        });
        navigate("/my-store");
        return;
      }

      if (!shopData) {
        toast({
          title: "No Store Found",
          description: "Please create your store first",
        });
        navigate("/my-store");
        return;
      }

      setShop(shopData);
      await loadOrders(shopData.id);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error loading orders",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadOrders = async (shopId: string) => {
    try {
      const { data: ordersData, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            *,
            product_id,
            products (
              name,
              image_url
            )
          ),
          profiles (
            full_name,
            email
          )
        `)
        .eq("shop_id", shopId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error('Error loading orders:', error);
        throw error;
      }

      setOrders(ordersData || []);
    } catch (error: any) {
      console.error('Error in loadOrders:', error);
      toast({
        title: "Failed to load orders",
        description: error.message || "Please check your RLS policies",
        variant: "destructive",
      });
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    setUpdatingOrderId(orderId);
    
    try {
      const updateData: any = { 
        status,
        updated_at: new Date().toISOString()
      };

      if (status === "cancelled") {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", user.id)
            .single();

          updateData.cancelled_by = profile?.full_name || "Shop Owner";
          updateData.cancelled_at = new Date().toISOString();
        }
      }

      if (status === "delivered") {
        updateData.delivered_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("orders")
        .update(updateData)
        .eq("id", orderId);

      if (error) throw error;

      toast({
        title: "Success!",
        description: `Order status updated to ${status.replace(/_/g, ' ')}`,
      });

      await loadOrders(shop.id);
      
    } catch (error: any) {
      console.error('Update order error:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update order status",
        variant: "destructive",
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const markAsPaid = async (order: any) => {
    setUpdatingOrderId(order.id);
    
    try {
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq("id", order.id);

      if (updateError) throw updateError;

      const { error: revenueError } = await supabase
        .from("revenue_transactions")
        .insert({
          shop_id: shop.id,
          order_id: order.id,
          amount: parseFloat(order.total_amount),
          currency: 'NGN',
          payment_reference: `MANUAL_${order.id}_${Date.now()}`,
          payment_method: 'manual',
          transaction_type: 'order_payment',
        });

      if (revenueError) {
        console.error('Revenue recording error:', revenueError);
      }

      toast({
        title: "Payment Recorded! 💰",
        description: "Order marked as paid and revenue recorded.",
      });

      await loadOrders(shop.id);
    } catch (error: any) {
      console.error('Mark as paid error:', error);
      toast({
        title: "Failed",
        description: error.message || "Could not mark order as paid",
        variant: "destructive",
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleReviewOrder = (order: any) => {
    if (!order || !order.id) {
      toast({
        title: "Invalid order",
        description: "Cannot review this order",
        variant: "destructive",
      });
      return;
    }
    setSelectedOrder(order);
    setIsApprovalDialogOpen(true);
  };

  const handleCloseApprovalDialog = () => {
    setIsApprovalDialogOpen(false);
    setTimeout(() => setSelectedOrder(null), 300);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20";
      case "awaiting_approval":
        return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20";
      case "confirmed":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "paid_awaiting_delivery":
        return "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20";
      case "processing":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
      case "out_for_delivery":
        return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20";
      case "delivered":
        return "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20";
      case "cancelled":
        return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "awaiting_approval":
        return <ThumbsUp className="w-4 h-4" />;
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />;
      case "paid_awaiting_delivery":
        return <CheckCircle className="w-4 h-4" />;
      case "processing":
        return <Package className="w-4 h-4" />;
      case "out_for_delivery":
        return <Truck className="w-4 h-4" />;
      case "delivered":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 relative">
      <AdirePattern variant="dots" className="fixed inset-0 opacity-5 pointer-events-none" />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="hover:bg-primary/10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Orders
          </h1>
          <p className="text-muted-foreground">Track and manage customer orders</p>
        </div>

        {orders.length === 0 ? (
          <Card className="border-primary/10">
            <CardContent className="py-16 text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-heading font-semibold mb-2">No orders yet</h3>
              <p className="text-muted-foreground">Orders will appear here when customers make purchases</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="border-primary/10 hover:shadow-lg hover:shadow-primary/5 transition-all group">
                <CardHeader className="border-b border-border/50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2 mb-2 font-heading">
                        Order #{order.id?.slice(0, 8) || 'N/A'}
                        <Badge variant="outline" className={getStatusColor(order.status)}>
                          {getStatusIcon(order.status)}
                          <span className="ml-2 capitalize">{order.status?.replace(/_/g, ' ') || 'unknown'}</span>
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        {order.profiles?.full_name || order.customer_name || 'Unknown Customer'} • {order.profiles?.email || order.customer_email || 'No email'}
                      </CardDescription>
                      {order.payment_status === "on_delivery" && (
                        <Badge variant="secondary" className="mt-1 bg-gold/10 text-gold border-gold/20">
                          Pay on Delivery
                        </Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-heading font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        ₦{parseFloat(order.total_amount || 0).toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.created_at ? format(new Date(order.created_at), "MMM dd, yyyy • h:mm a") : 'Date unavailable'}
                      </p>
                      {order.paid_at && (
                        <p className="text-xs text-green-600 dark:text-green-400">
                          Paid: {format(new Date(order.paid_at), "MMM dd • h:mm a")}
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
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
                            <p className="font-semibold">{item.products?.name || 'Unknown Product'}</p>
                            <p className="text-sm text-muted-foreground">
                              Quantity: {item.quantity} × ₦{parseFloat(item.price || 0).toLocaleString()}
                            </p>
                          </div>
                          <p className="font-semibold text-primary">
                            ₦{(item.quantity * parseFloat(item.price || 0)).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      {order.status === "awaiting_approval" && (
                        <>
                          <Button
                            onClick={() => handleReviewOrder(order)}
                            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:opacity-90"
                          >
                            <ThumbsUp className="w-4 h-4 mr-2" />
                            Review Order
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => openWhatsAppWithOrder(order)}
                            disabled={!order.customer_phone}
                            className="hover:bg-green-500/10 hover:text-green-500 hover:border-green-500/50"
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Contact Customer
                          </Button>
                          {order.payment_status !== "paid" && (
                            <Button
                              onClick={() => markAsPaid(order)}
                              disabled={updatingOrderId === order.id}
                              variant="outline"
                              className="border-green-500/50 text-green-600 hover:bg-green-500/10"
                            >
                              {updatingOrderId === order.id ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <Banknote className="w-4 h-4 mr-2" />
                              )}
                              Mark as Paid
                            </Button>
                          )}
                        </>
                      )}
                      {(order.status === "confirmed" || order.status === "paid_awaiting_delivery") && (
                        <>
                          <Button
                            onClick={() => updateOrderStatus(order.id, "processing")}
                            disabled={updatingOrderId === order.id}
                            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:opacity-90"
                          >
                            {updatingOrderId === order.id ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Package className="w-4 h-4 mr-2" />
                            )}
                            Start Processing
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => openSimpleWhatsApp(
                              order.customer_phone,
                              `Hello ${order.customer_name}, your order #${order.id?.slice(0, 8)} has been confirmed and we're preparing it for delivery!`
                            )}
                            disabled={!order.customer_phone}
                            className="hover:bg-green-500/10 hover:text-green-500 hover:border-green-500/50"
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Send Update
                          </Button>
                        </>
                      )}
                      {order.status === "processing" && (
                        <>
                          <Button
                            onClick={() => updateOrderStatus(order.id, "out_for_delivery")}
                            disabled={updatingOrderId === order.id}
                            className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:opacity-90"
                          >
                            {updatingOrderId === order.id ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Truck className="w-4 h-4 mr-2" />
                            )}
                            Out for Delivery
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => openSimpleWhatsApp(
                              order.customer_phone,
                              `Hello ${order.customer_name}, your order #${order.id?.slice(0, 8)} is being processed and will be ready for delivery soon!`
                            )}
                            disabled={!order.customer_phone}
                            className="hover:bg-green-500/10 hover:text-green-500 hover:border-green-500/50"
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Processing Update
                          </Button>
                        </>
                      )}
                      
                      {order.status === "out_for_delivery" && (
                        <>
                          <Button
                            onClick={() => updateOrderStatus(order.id, "delivered")}
                            disabled={updatingOrderId === order.id}
                            className="bg-gradient-to-r from-green-500 to-green-600 hover:opacity-90"
                          >
                            {updatingOrderId === order.id ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4 mr-2" />
                            )}
                            Mark as Delivered
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => openSimpleWhatsApp(
                              order.customer_phone,
                              `Hello ${order.customer_name}, your order #${order.id?.slice(0, 8)} is out for delivery and should arrive soon!`
                            )}
                            disabled={!order.customer_phone}
                            className="hover:bg-green-500/10 hover:text-green-500 hover:border-green-500/50"
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Delivery Update
                          </Button>
                        </>
                      )}

                      {order.status === "delivered" && (
                        <Button
                          onClick={() => updateOrderStatus(order.id, "completed")}
                          disabled={updatingOrderId === order.id}
                          className="bg-gradient-to-r from-purple-500 to-purple-600 hover:opacity-90"
                        >
                          {updatingOrderId === order.id ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4 mr-2" />
                          )}
                          Complete Order
                        </Button>
                      )}
                      
                      {(order.status === "awaiting_approval" || order.status === "confirmed" || order.status === "paid_awaiting_delivery" || order.status === "processing" || order.status === "out_for_delivery") && (
                        <Button
                          variant="destructive"
                          onClick={() => updateOrderStatus(order.id, "cancelled")}
                          disabled={updatingOrderId === order.id}
                        >
                          {updatingOrderId === order.id ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <XCircle className="w-4 h-4 mr-2" />
                          )}
                          Cancel Order
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <OrderApprovalDialog
          isOpen={isApprovalDialogOpen}
          onClose={handleCloseApprovalDialog}
          order={selectedOrder}
          onStatusUpdate={() => loadOrders(shop.id)}
        />
      </div>
    </div>
  );
};

export default Orders;
