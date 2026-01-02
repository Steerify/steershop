import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import orderService from "@/services/order.service";
import shopService from "@/services/shop.service";
import { revenueService } from "@/services/revenue.service";
import { ArrowLeft, Loader2, ShoppingCart, Package, Clock, CheckCircle, XCircle, MessageCircle, ThumbsUp, Truck, Banknote, CalendarCheck } from "lucide-react";
import { format } from "date-fns";
import OrderApprovalDialog from "@/components/OrderApprovalDialog";
import { AdirePattern } from "@/components/patterns/AdirePattern";
import logo from "@/assets/steersolo-logo.jpg";
import Joyride, { CallBackProps, STATUS } from "react-joyride";
import { useTour } from "@/hooks/useTour";
import { TourTooltip } from "@/components/tours/TourTooltip";
import { ordersTourSteps } from "@/components/tours/tourSteps";
import { TourButton } from "@/components/tours/TourButton";

const Orders = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const [shop, setShop] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Tour state
  const { hasSeenTour, isRunning, startTour, endTour, resetTour } = useTour('orders');

  const handleTourCallback = (data: CallBackProps) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      endTour(status === STATUS.FINISHED);
    }
  };

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
    if (!authLoading) {
      if (user) {
        loadUserAndOrders();
      } else {
        navigate("/auth/login");
      }
    }
  }, [user, authLoading, navigate]);

  const loadUserAndOrders = async () => {
    try {
      if (!user) return; // Ensure user is available from context



      // Use shopService to fetch shop
      let shopData = null;
      try {
        const response = await shopService.getShopByOwner(user.id);
        // Handle potential array or single object response flexibly
        shopData = Array.isArray(response.data) ? response.data[0] : response.data;
      } catch (err) {
        // If shop not found or error
        console.error("Shop fetch error", err);
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
      const response: any = await orderService.getOrders(shopId);
      // Assuming response.data is the array of orders
      setOrders(response.data || []);
    } catch (error: any) {
      console.error('Error in loadOrders:', error);
      toast({
        title: "Failed to load orders",
        description: error.message || "Please check your network connection",
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
        if (user) {
          // You might need a profile service here or assume user context has name
          // For now, let's use a placeholder or partial update
           updateData.cancelled_by = user.email || "Shop Owner"; // Fallback to email as name might not be in user object
           updateData.cancelled_at = new Date().toISOString();
        }
      }

      if (status === "delivered") {
        updateData.delivered_at = new Date().toISOString();
      }

      await orderService.updateOrderStatus(orderId, status, updateData);

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
      await orderService.updateOrderStatus(order.id, "confirmed", { // Use confirmed or another status to reflect partial update if needed, but here we just update payment
          payment_status: "paid",
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
      });


      await revenueService.createTransaction({
          shop_id: shop.id,
          order_id: order.id,
          amount: parseFloat(order.total_amount),
          currency: 'NGN',
          payment_reference: `MANUAL_${order.id}_${Date.now()}`,
          payment_method: 'manual',
          transaction_type: 'order_payment',
        });

      // Error handling is now in catch block

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
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="hover:bg-primary/10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate("/bookings")} className="border-purple-500/30 text-purple-600 hover:bg-purple-500/10">
              <CalendarCheck className="w-4 h-4 mr-2" />
              View Bookings
            </Button>
            <TourButton
              onStartTour={startTour}
              hasSeenTour={hasSeenTour}
              onResetTour={resetTour}
            />
          </div>
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
            {orders.map((order, index) => (
              <Card key={order.id} className="border-primary/10 hover:shadow-lg hover:shadow-primary/5 transition-all group" data-tour={index === 0 ? "order-card" : undefined}>
                <CardHeader className="border-b border-border/50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2 mb-2 font-heading">
                        Order #{order.id?.slice(0, 8) || 'N/A'}
                        <Badge variant="outline" className={getStatusColor(order.status)} data-tour={index === 0 ? "order-status" : undefined}>
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
                              Qty: {item.quantity} × ₦{parseFloat(item.price || 0).toLocaleString()}
                            </p>
                          </div>
                          <p className="font-semibold text-primary">
                            ₦{(item.quantity * parseFloat(item.price || 0)).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Order Actions */}
                    <div className="flex flex-wrap gap-2" data-tour={index === 0 ? "order-actions" : undefined}>
                      {order.status === "awaiting_approval" && (
                        <Button
                          size="sm"
                          onClick={() => handleReviewOrder(order)}
                          className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
                        >
                          <ThumbsUp className="w-4 h-4 mr-2" />
                          Review Order
                        </Button>
                      )}

                      {order.status === "confirmed" && (
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, "processing")}
                          disabled={updatingOrderId === order.id}
                        >
                          {updatingOrderId === order.id ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : (
                            <Package className="w-4 h-4 mr-2" />
                          )}
                          Start Processing
                        </Button>
                      )}

                      {order.status === "processing" && (
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, "out_for_delivery")}
                          disabled={updatingOrderId === order.id}
                        >
                          <Truck className="w-4 h-4 mr-2" />
                          Out for Delivery
                        </Button>
                      )}

                      {order.status === "out_for_delivery" && (
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, "delivered")}
                          disabled={updatingOrderId === order.id}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Mark Delivered
                        </Button>
                      )}

                      {order.payment_status !== "paid" && order.status !== "cancelled" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markAsPaid(order)}
                          disabled={updatingOrderId === order.id}
                          className="border-green-500/30 text-green-600 hover:bg-green-500/10"
                          data-tour={index === 0 ? "mark-paid" : undefined}
                        >
                          <Banknote className="w-4 h-4 mr-2" />
                          Mark as Paid
                        </Button>
                      )}

                      {order.status !== "cancelled" && order.status !== "delivered" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateOrderStatus(order.id, "cancelled")}
                          disabled={updatingOrderId === order.id}
                          className="border-destructive/30 text-destructive hover:bg-destructive/10"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      )}

                      {order.customer_phone && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openWhatsAppWithOrder(order)}
                          className="border-green-500/30 text-green-600 hover:bg-green-500/10"
                          data-tour={index === 0 ? "whatsapp-btn" : undefined}
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          WhatsApp
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Order Approval Dialog */}
      {selectedOrder && (
        <OrderApprovalDialog
          order={selectedOrder}
          isOpen={isApprovalDialogOpen}
          onClose={handleCloseApprovalDialog}
          onStatusUpdate={() => loadOrders(shop.id)}
        />
      )}

      {/* Guided Tour */}
      <Joyride
        steps={ordersTourSteps}
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
    </div>
  );
};

export default Orders;
