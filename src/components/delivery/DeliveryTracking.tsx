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
  Building2,
  Map,
  DollarSign,
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
      <Card className="shadow-md border-border/50">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-3">
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
            <p className="text-sm text-muted-foreground">Loading delivery details...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!delivery) {
    return null;
  }

  const statusConfig = STATUS_CONFIG[delivery.status] || STATUS_CONFIG.pending;

  return (
    <Card className="shadow-md border-border/50">
      <CardHeader className="pb-3 border-b border-border/30 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Truck className="w-6 h-6 text-primary" />
            Delivery Tracking
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadDelivery}
            className="h-9 w-9 p-0 hover:bg-primary/10"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-6">
        {/* Current Status */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-gradient-to-r from-muted/50 to-background rounded-xl border border-border/30">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl ${statusConfig.color} flex items-center justify-center text-white shadow-md`}>
              {statusConfig.icon}
            </div>
            <div>
              <p className="font-semibold text-lg">{statusConfig.label}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <Building2 className="w-3.5 h-3.5" />
                via {delivery.provider === 'manual' ? 'Manual Booking' : delivery.provider}
              </p>
            </div>
          </div>
          
          {delivery.provider_tracking_code && (
            <Badge variant="outline" className="font-mono text-sm px-3 py-1.5 bg-primary/5 border-primary/30">
              {delivery.provider_tracking_code}
            </Badge>
          )}
        </div>

        {/* Delivery Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5" />
              Delivery Fee
            </p>
            <p className="font-semibold text-lg">₦{delivery.delivery_fee?.toLocaleString()}</p>
          </div>
          {delivery.estimated_delivery_date && (
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Est. Delivery
              </p>
              <p className="font-semibold text-lg">
                {format(new Date(delivery.estimated_delivery_date), 'MMM dd, yyyy')}
              </p>
            </div>
          )}
          {delivery.carrier_name && (
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5" />
                Carrier
              </p>
              <p className="font-semibold text-lg">{delivery.carrier_name}</p>
            </div>
          )}
        </div>

        {/* Update Status (Shop Owner Only) */}
        {isShopOwner && delivery.provider === 'manual' && delivery.status !== 'delivered' && delivery.status !== 'cancelled' && (
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border/30">
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
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white"
            >
              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
              {isUpdating ? "Updating..." : "Update Status"}
            </Button>
          </div>
        )}

        {/* Timeline */}
        {events.length > 0 && (
          <div className="pt-4 border-t border-border/30">
            <div className="flex items-center gap-2 mb-4">
              <Map className="w-4.5 h-4.5 text-primary" />
              <p className="text-sm font-semibold">Tracking History</p>
            </div>
            <div className="space-y-4">
              {events.map((event, index) => (
                <div key={event.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-3.5 h-3.5 rounded-full ${index === 0 ? 'bg-primary shadow-md shadow-primary/20' : 'bg-muted-foreground/30'}`} />
                    {index < events.length - 1 && (
                      <div className="w-0.5 h-full bg-muted-foreground/20 my-2" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                      <p className="text-sm font-semibold">
                        {STATUS_CONFIG[event.status]?.label || event.status}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(event.created_at), 'MMM dd, h:mm a')}
                      </span>
                    </div>
                    {event.description && (
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                        {event.description}
                      </p>
                    )}
                    {event.location && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                        <MapPin className="w-3.5 h-3.5" />
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
