import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Package, Truck, XCircle, CreditCard, ThumbsUp } from "lucide-react";
import { format } from "date-fns";

interface OrderTimelineProps {
  order: {
    status: string;
    created_at: string;
    confirmed_at?: string | null;
    processing_at?: string | null;
    out_for_delivery_at?: string | null;
    delivered_at?: string | null;
    cancelled_at?: string | null;
    paid_at?: string | null;
  };
}

interface TimelineStep {
  status: string;
  label: string;
  icon: React.ReactNode;
  timestamp?: string | null;
  isCompleted: boolean;
  isCurrent: boolean;
}

export const OrderTimeline = ({ order }: OrderTimelineProps) => {
  const statusOrder = ['pending', 'confirmed', 'processing', 'out_for_delivery', 'delivered'];
  const currentIndex = statusOrder.indexOf(order.status);

  const steps: TimelineStep[] = [
    {
      status: 'pending',
      label: 'Order Placed',
      icon: <CreditCard className="w-4 h-4" />,
      timestamp: order.created_at,
      isCompleted: currentIndex >= 0 || order.status === 'cancelled',
      isCurrent: order.status === 'pending',
    },
    {
      status: 'confirmed',
      label: 'Confirmed',
      icon: <ThumbsUp className="w-4 h-4" />,
      timestamp: order.confirmed_at || order.paid_at,
      isCompleted: currentIndex >= 1,
      isCurrent: order.status === 'confirmed',
    },
    {
      status: 'processing',
      label: 'Processing',
      icon: <Package className="w-4 h-4" />,
      timestamp: order.processing_at,
      isCompleted: currentIndex >= 2,
      isCurrent: order.status === 'processing',
    },
    {
      status: 'out_for_delivery',
      label: 'Out for Delivery',
      icon: <Truck className="w-4 h-4" />,
      timestamp: order.out_for_delivery_at,
      isCompleted: currentIndex >= 3,
      isCurrent: order.status === 'out_for_delivery',
    },
    {
      status: 'delivered',
      label: 'Delivered',
      icon: <CheckCircle className="w-4 h-4" />,
      timestamp: order.delivered_at,
      isCompleted: currentIndex >= 4,
      isCurrent: order.status === 'delivered',
    },
  ];

  // Handle cancelled status
  if (order.status === 'cancelled') {
    return (
      <div className="flex items-center gap-3 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
        <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
          <XCircle className="w-5 h-5 text-destructive" />
        </div>
        <div>
          <p className="font-medium text-destructive">Order Cancelled</p>
          {order.cancelled_at && (
            <p className="text-sm text-muted-foreground">
              {format(new Date(order.cancelled_at), "MMM dd, yyyy 'at' h:mm a")}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-6">
        {steps.map((step, index) => (
          <div key={step.status} className="flex flex-col items-center relative z-10">
            {/* Icon Circle */}
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                step.isCompleted 
                  ? 'bg-primary text-primary-foreground' 
                  : step.isCurrent 
                  ? 'bg-primary/20 text-primary border-2 border-primary animate-pulse'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {step.isCompleted ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                step.icon
              )}
            </div>
            
            {/* Label */}
            <span className={`text-xs mt-2 text-center ${
              step.isCompleted || step.isCurrent ? 'text-primary font-medium' : 'text-muted-foreground'
            }`}>
              {step.label}
            </span>
            
            {/* Timestamp */}
            {step.timestamp && step.isCompleted && (
              <span className="text-[10px] text-muted-foreground mt-1">
                {format(new Date(step.timestamp), "MMM dd")}
              </span>
            )}
            
            {/* Connecting Line (except last) */}
            {index < steps.length - 1 && (
              <div 
                className={`absolute top-5 left-[calc(100%+8px)] w-[calc(100%-16px)] h-0.5 -translate-y-1/2 ${
                  steps[index + 1].isCompleted ? 'bg-primary' : 'bg-muted'
                }`}
                style={{ 
                  width: 'calc((100vw - 80px) / 5)',
                  maxWidth: '80px',
                  left: '50%',
                  marginLeft: '20px'
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Current Status Message */}
      <div className="text-center p-3 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground">
          {order.status === 'pending' && "Waiting for seller confirmation..."}
          {order.status === 'confirmed' && "Your order has been confirmed! Seller is preparing it."}
          {order.status === 'processing' && "Your order is being prepared for shipping."}
          {order.status === 'out_for_delivery' && "Your order is on the way! 🚚"}
          {order.status === 'delivered' && "Order delivered successfully! ✅"}
        </p>
      </div>
    </div>
  );
};
