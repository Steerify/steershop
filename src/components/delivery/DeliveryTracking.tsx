import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Truck, 
  Package, 
  CheckCircle, 
  Clock, 
  MapPin,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import deliveryService, { DeliveryOrder, TrackingEvent } from "@/services/delivery.service";
import { useToast } from "@/hooks/use-toast";

interface DeliveryTrackingProps {
  orderId: string;
  isShopOwner?: boolean;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', color: 'bg-yellow-500', icon: <Clock className="w-4 h-4" /> },
  confirmed: { label: 'Confirmed', color: 'bg-blue-500', icon: <Package className="w-4 h-4" /> },
  picked_up: { label: 'Picked Up', color: 'bg-indigo-500', icon: <Truck className="w-4 h-4" /> },
  in_transit: { label: 'In Transit', color: 'bg-purple-500', icon: <Truck className="w-4 h-4" /> },
  out_for_delivery: { label: 'Out for Delivery', color: 'bg-orange-500', icon: <MapPin className="w-4 h-4" /> },
  delivered: { label: 'Delivered', color: 'bg-green-500', icon: <CheckCircle className="w-4 h-4" /> },
  cancelled: { label: 'Cancelled', color: 'bg-red-500', icon: <Clock className="w-4 h-4" /> },
  failed: { label: 'Failed', color: 'bg-red-500', icon: <Clock className="w-4 h-4" /> },
};

const UPDATABLE_STATUSES = [
  { value: 'picked_up', label: 'Picked Up' },
  { value: 'in_transit', label: 'In Transit' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
];

export const DeliveryTracking = ({ orderId, isShopOwner = false }: DeliveryTrackingProps) => {
  const { toast } = useToast();
  const [delivery, setDelivery] = useState<DeliveryOrder | null>(null);
  const [events, setEvents] = useState<TrackingEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  const loadDelivery = async () => {
    setIsLoading(true);
    try {
      const deliveryOrder = await deliveryService.getDeliveryByOrderId(orderId);
      setDelivery(deliveryOrder);
      
      if (deliveryOrder) {
        const trackingEvents = await deliveryService.getTrackingEvents(deliveryOrder.id);
        setEvents(trackingEvents);
      }
    } catch (error) {
      console.error('Error loading delivery:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDelivery();
  }, [orderId]);

  const handleUpdateStatus = async () => {
    if (!delivery || !selectedStatus) return;

    setIsUpdating(true);
    try {
      const success = await deliveryService.updateDeliveryStatus(
        delivery.id,
        selectedStatus
      );

      if (success) {
        toast({
          title: "Status Updated",
          description: `Delivery status updated to ${STATUS_CONFIG[selectedStatus]?.label}`,
        });
        await loadDelivery();
        setSelectedStatus("");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!delivery) {
    return null;
  }

  const statusConfig = STATUS_CONFIG[delivery.status] || STATUS_CONFIG.pending;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Delivery Tracking
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadDelivery}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${statusConfig.color} flex items-center justify-center text-white`}>
              {statusConfig.icon}
            </div>
            <div>
              <p className="font-medium">{statusConfig.label}</p>
              <p className="text-xs text-muted-foreground">
                via {delivery.provider === 'manual' ? 'Manual Booking' : delivery.provider}
              </p>
            </div>
          </div>
          
          {delivery.provider_tracking_code && (
            <Badge variant="outline" className="font-mono">
              {delivery.provider_tracking_code}
            </Badge>
          )}
        </div>

        {/* Delivery Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Delivery Fee</p>
            <p className="font-medium">₦{delivery.delivery_fee?.toLocaleString()}</p>
          </div>
          {delivery.estimated_delivery_date && (
            <div>
              <p className="text-muted-foreground">Est. Delivery</p>
              <p className="font-medium">
                {format(new Date(delivery.estimated_delivery_date), 'MMM dd, yyyy')}
              </p>
            </div>
          )}
        </div>

        {/* Update Status (Shop Owner Only) */}
        {isShopOwner && delivery.provider === 'manual' && delivery.status !== 'delivered' && delivery.status !== 'cancelled' && (
          <div className="flex gap-2 pt-2 border-t">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Update status..." />
              </SelectTrigger>
              <SelectContent>
                {UPDATABLE_STATUSES
                  .filter(s => {
                    const statusOrder = ['pending', 'confirmed', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered'];
                    return statusOrder.indexOf(s.value) > statusOrder.indexOf(delivery.status);
                  })
                  .map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
            <Button 
              onClick={handleUpdateStatus} 
              disabled={!selectedStatus || isUpdating}
              size="sm"
            >
              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update"}
            </Button>
          </div>
        )}

        {/* Timeline */}
        {events.length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-sm font-medium mb-3">Tracking History</p>
            <div className="space-y-3">
              {events.map((event, index) => (
                <div key={event.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                    {index < events.length - 1 && (
                      <div className="w-0.5 h-full bg-muted-foreground/20 my-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">
                        {STATUS_CONFIG[event.status]?.label || event.status}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(event.created_at), 'MMM dd, h:mm a')}
                      </span>
                    </div>
                    {event.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {event.description}
                      </p>
                    )}
                    {event.location && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {event.location}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
