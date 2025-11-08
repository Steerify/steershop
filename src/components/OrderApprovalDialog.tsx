import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ThumbsUp, ThumbsDown, MessageCircle, Package, User, MapPin, Phone, Mail, Loader2, Clock, CheckCircle, XCircle, Truck } from "lucide-react";

interface OrderApprovalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onStatusUpdate: () => void;
}

const OrderApprovalDialog = ({ isOpen, onClose, order, onStatusUpdate }: OrderApprovalDialogProps) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!order) {
    return null;
  }

  const getStatusBadge = (status: string, paymentStatus: string) => {
    const baseConfig = {
      paid_awaiting_delivery: { label: "Paid - Awaiting Delivery", variant: "default" as const, className: "bg-green-500/10 text-green-500" },
      confirmed: { label: "Confirmed", variant: "default" as const, className: "bg-green-500/10 text-green-500" },
      cancelled: { label: "Cancelled", variant: "destructive" as const, className: "bg-red-500/10 text-red-500" },
      awaiting_approval: { label: "Awaiting Approval", variant: "outline" as const, className: "bg-orange-500/10 text-orange-500" },
      pending: { label: "Pending", variant: "outline" as const, className: "bg-blue-500/10 text-blue-500" },
      processing: { label: "Processing", variant: "default" as const, className: "bg-purple-500/10 text-purple-500" },
      out_for_delivery: { label: "Out for Delivery", variant: "default" as const, className: "bg-indigo-500/10 text-indigo-500" },
      delivered: { label: "Delivered", variant: "default" as const, className: "bg-green-500/10 text-green-500" },
      completed: { label: "Completed", variant: "default" as const, className: "bg-purple-500/10 text-purple-500" }
    };

    const statusConfig = baseConfig[status as keyof typeof baseConfig] || baseConfig.pending;

    return (
      <div className="flex items-center gap-2">
        <Badge variant={statusConfig.variant} className={statusConfig.className}>
          {statusConfig.label}
        </Badge>
        {paymentStatus === "paid" && (
          <Badge variant="default" className="bg-green-500/10 text-green-500">
            Paid
          </Badge>
        )}
        {paymentStatus === "on_delivery" && (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">
            Pay on Delivery
          </Badge>
        )}
        {paymentStatus === "pending" && (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">
            Payment Pending
          </Badge>
        )}
      </div>
    );
  };

  const handleStatusUpdate = async (newStatus: string, additionalUpdates: any = {}) => {
    setIsProcessing(true);
    try {
      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString(),
        ...additionalUpdates
      };

      // Set timestamps based on status changes
      const timestampMappings = {
        confirmed: ['approved_at', 'confirmed_at'],
        paid_awaiting_delivery: ['confirmed_at'],
        processing: ['processing_at'],
        out_for_delivery: ['out_for_delivery_at'],
        delivered: ['delivered_at'],
        completed: ['completed_at'],
        cancelled: ['cancelled_at']
      };

      const timestamps = timestampMappings[newStatus as keyof typeof timestampMappings];
      if (timestamps) {
        timestamps.forEach(timestamp => {
          updateData[timestamp] = new Date().toISOString();
        });
      }

      console.log('Updating order with data:', updateData);

      const { error } = await supabase
        .from("orders")
        .update(updateData)
        .eq("id", order.id);

      if (error) throw error;

      // Send notification based on status change
      await sendStatusNotification(newStatus);

      toast({
        title: getStatusMessage(newStatus).title,
        description: getStatusMessage(newStatus).description,
      });

      onStatusUpdate();
      onClose();
    } catch (error: any) {
      console.error('Error updating order:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update order status",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Update status messages
  const getStatusMessage = (status: string) => {
    const messages = {
      confirmed: {
        title: "Order Confirmed! 🎉",
        description: "The order has been confirmed and is ready for processing."
      },
      paid_awaiting_delivery: {
        title: "Payment Confirmed! 🎉",
        description: "Payment received and order is awaiting delivery processing."
      },
      processing: {
        title: "Order Processing Started",
        description: "The order is now being processed."
      },
      out_for_delivery: {
        title: "Out for Delivery! 🚚",
        description: "The order is now out for delivery."
      },
      delivered: {
        title: "Order Delivered! ✅",
        description: "The order has been marked as delivered."
      },
      completed: {
        title: "Order Completed! ✅",
        description: "The order has been marked as completed."
      },
      cancelled: {
        title: "Order Cancelled",
        description: "The order has been cancelled."
      }
    };
    return messages[status as keyof typeof messages] || messages.confirmed;
  };

  // Enhanced WhatsApp notification function
  const sendStatusNotification = async (newStatus: string) => {
    if (!order.customer_phone) return;

    try {
      const statusMessages = {
        confirmed: `✅ Your order #${order.id.slice(0, 8)} has been confirmed! We're now preparing your items for delivery.`,
        paid_awaiting_delivery: `💰 Payment confirmed! Your order #${order.id.slice(0, 8)} is now being processed for delivery.`,
        processing: `🛠️ Your order #${order.id.slice(0, 8)} is now being processed and will be ready for delivery soon.`,
        out_for_delivery: `🚚 Your order #${order.id.slice(0, 8)} is out for delivery and should arrive soon!`,
        delivered: `🎉 Your order #${order.id.slice(0, 8)} has been delivered! Thank you for your purchase.`,
        completed: `✅ Your order #${order.id.slice(0, 8)} has been completed! Thank you for shopping with us.`,
        cancelled: `❌ Your order #${order.id.slice(0, 8)} has been cancelled. Contact us if you have questions.`
      };

      const message = statusMessages[newStatus as keyof typeof statusMessages] || "Your order status has been updated.";
      
      // Clean the phone number
      const cleaned = order.customer_phone.replace(/[^\d+]/g, '');
      const phoneNumber = cleaned.startsWith('+') ? cleaned : `+${cleaned}`;

      // Create both deep link and web link
      const deepLink = `whatsapp://send?phone=${phoneNumber.replace('+', '')}&text=${encodeURIComponent(message)}`;
      const webLink = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;

      // Try to open the deep link with fallback
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
      
    } catch (error) {
      console.error('Error sending WhatsApp notification:', error);
    }
  };

  const contactCustomer = () => {
    if (!order.customer_phone) {
      toast({
        title: "No Phone Number",
        description: "Customer phone number is not available",
        variant: "destructive",
      });
      return;
    }

    try {
      const message = `Hello ${order.customer_name}, I'm contacting you about your order #${order.id.slice(0, 8)} from ${order.shop_name || 'our store'}.`;
      
      // Clean the phone number
      const cleaned = order.customer_phone.replace(/[^\d+]/g, '');
      const phoneNumber = cleaned.startsWith('+') ? cleaned : `+${cleaned}`;

      // Create both deep link and web link
      const deepLink = `whatsapp://send?phone=${phoneNumber.replace('+', '')}&text=${encodeURIComponent(message)}`;
      const webLink = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;

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
      
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
      toast({
        title: "Error",
        description: "Failed to open WhatsApp",
        variant: "destructive",
      });
    }
  };

  const canUpdateToStatus = (targetStatus: string) => {
    const allowedTransitions: Record<string, string[]> = {
      awaiting_approval: ["confirmed", "cancelled"],
      pending: ["confirmed", "cancelled"],
      confirmed: ["processing", "cancelled"],
      paid_awaiting_delivery: ["processing", "cancelled"],
      processing: ["out_for_delivery", "cancelled"],
      out_for_delivery: ["delivered", "cancelled"],
      delivered: ["completed", "cancelled"]
    };

    return allowedTransitions[order.status]?.includes(targetStatus) || false;
  };

  const getAvailableActions = () => {
    const actions = [];
    
    if (canUpdateToStatus("confirmed")) {
      actions.push(
        <Button
          key="confirm"
          onClick={() => handleStatusUpdate("confirmed")}
          disabled={isProcessing}
          className="bg-green-600 hover:bg-green-700"
        >
          {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
          Confirm Order
        </Button>
      );
    }
    
    if (canUpdateToStatus("processing")) {
      actions.push(
        <Button
          key="processing"
          onClick={() => handleStatusUpdate("processing")}
          disabled={isProcessing}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Package className="w-4 h-4 mr-2" />}
          Start Processing
        </Button>
      );
    }
    
    if (canUpdateToStatus("out_for_delivery")) {
      actions.push(
        <Button
          key="out_for_delivery"
          onClick={() => handleStatusUpdate("out_for_delivery")}
          disabled={isProcessing}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Truck className="w-4 h-4 mr-2" />}
          Out for Delivery
        </Button>
      );
    }
    
    if (canUpdateToStatus("delivered")) {
      actions.push(
        <Button
          key="delivered"
          onClick={() => handleStatusUpdate("delivered")}
          disabled={isProcessing}
          className="bg-green-600 hover:bg-green-700"
        >
          {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
          Mark as Delivered
        </Button>
      );
    }
    
    if (canUpdateToStatus("completed")) {
      actions.push(
        <Button
          key="completed"
          onClick={() => handleStatusUpdate("completed")}
          disabled={isProcessing}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
          Complete Order
        </Button>
      );
    }
    
    if (canUpdateToStatus("cancelled")) {
      actions.push(
        <Button
          key="cancelled"
          onClick={() => handleStatusUpdate("cancelled")}
          disabled={isProcessing}
          variant="destructive"
        >
          {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
          Cancel Order
        </Button>
      );
    }

    return actions;
  };

  return (
    <Dialog open={isOpen && !!order} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Order Management
          </DialogTitle>
          <DialogDescription>
            Manage order status and communicate with the customer.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold">Order #{order.id?.slice(0, 8) || 'N/A'}</h3>
                  <p className="text-sm text-muted-foreground">
                    Total: ₦{parseFloat(order.total_amount || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Created: {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                {getStatusBadge(order.status, order.payment_status)}
              </div>

              {/* Order Items */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Items:</h4>
                {order.order_items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.products?.name} x {item.quantity}</span>
                    <span>₦{(item.quantity * parseFloat(item.price || 0)).toLocaleString()}</span>
                  </div>
                ))}
                {(!order.order_items || order.order_items.length === 0) && (
                  <p className="text-sm text-muted-foreground">No items found</p>
                )}
              </div>

              {/* Payment Information */}
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-medium text-sm mb-2">Payment Information:</h4>
                <div className="text-sm space-y-1">
                  <p>Method: {order.payment_status === "paid" ? "Pre-paid" : 
                             order.payment_status === "on_delivery" ? "Pay on Delivery" : 
                             "Payment Pending"}</p>
                  {order.payment_reference && (
                    <p>Reference: {order.payment_reference}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Customer Details
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span>{order.customer_name || 'Not provided'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{order.customer_phone || 'Not provided'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{order.customer_email || 'Not provided'}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <span className="flex-1">{order.delivery_address || 'Not provided'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Management */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-3">Update Order Status</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {getAvailableActions()}
              </div>
            </CardContent>
          </Card>

          {/* Communication */}
          <div className="space-y-3">
            <Button
              variant="outline"
              onClick={contactCustomer}
              disabled={isProcessing || !order.customer_phone}
              className="w-full"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Contact Customer
            </Button>
          </div>

          {/* Status Flow Help */}
          <div className="text-sm text-muted-foreground space-y-2 p-3 bg-muted rounded-lg">
            <p className="font-medium">Order Status Flow:</p>
            <div className="flex items-center justify-between text-xs flex-wrap gap-1">
              <span>Awaiting Approval</span>
              <span>→</span>
              <span>Confirmed</span>
              <span>→</span>
              <span>Processing</span>
              <span>→</span>
              <span>Out for Delivery</span>
              <span>→</span>
              <span>Delivered</span>
              <span>→</span>
              <span>Completed</span>
            </div>
            <p className="text-xs mt-2">
              Orders can be cancelled at any stage before completion.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderApprovalDialog;