import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Truck, Loader2 } from "lucide-react";
import deliveryService, { DeliveryAddress } from "@/services/delivery.service";
import { useToast } from "@/hooks/use-toast";

interface ManualDeliveryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  shopId: string;
  customerAddress: DeliveryAddress;
  onSuccess: () => void;
}

export const ManualDeliveryForm = ({
  open,
  onOpenChange,
  orderId,
  shopId,
  customerAddress,
  onSuccess,
}: ManualDeliveryFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    carrier_name: "",
    tracking_code: "",
    delivery_fee: "",
    estimated_days: "",
    pickup_address: "",
    pickup_city: "",
    pickup_state: "",
    pickup_phone: "",
    pickup_name: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.carrier_name || !formData.delivery_fee) {
      toast({
        title: "Missing Information",
        description: "Please enter carrier name and delivery fee",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const estimatedDate = formData.estimated_days 
        ? new Date(Date.now() + parseInt(formData.estimated_days) * 24 * 60 * 60 * 1000).toISOString()
        : undefined;

      await deliveryService.bookDelivery({
        order_id: orderId,
        shop_id: shopId,
        provider: 'manual',
        pickup_address: {
          name: formData.pickup_name || 'Shop Pickup',
          phone: formData.pickup_phone || '',
          address: formData.pickup_address || '',
          city: formData.pickup_city || '',
          state: formData.pickup_state || '',
        },
        delivery_address: customerAddress,
        delivery_fee: parseFloat(formData.delivery_fee),
        tracking_code: formData.tracking_code || undefined,
        estimated_delivery_date: estimatedDate,
      });

      toast({
        title: "Delivery Booked",
        description: "Manual delivery has been recorded",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error booking manual delivery:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to book delivery",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Book Manual Delivery
          </DialogTitle>
          <DialogDescription>
            Enter delivery details for this order. You can update the status later.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Carrier Info */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Carrier Information</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="carrier_name" className="text-xs">Carrier Name *</Label>
                <Input
                  id="carrier_name"
                  value={formData.carrier_name}
                  onChange={(e) => setFormData({ ...formData, carrier_name: e.target.value })}
                  placeholder="e.g. GIG Logistics"
                  className="h-9"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="tracking_code" className="text-xs">Tracking Code</Label>
                <Input
                  id="tracking_code"
                  value={formData.tracking_code}
                  onChange={(e) => setFormData({ ...formData, tracking_code: e.target.value })}
                  placeholder="Optional"
                  className="h-9"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="delivery_fee" className="text-xs">Delivery Fee (₦) *</Label>
                <Input
                  id="delivery_fee"
                  type="number"
                  value={formData.delivery_fee}
                  onChange={(e) => setFormData({ ...formData, delivery_fee: e.target.value })}
                  placeholder="0"
                  className="h-9"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="estimated_days" className="text-xs">Est. Delivery (days)</Label>
                <Input
                  id="estimated_days"
                  type="number"
                  value={formData.estimated_days}
                  onChange={(e) => setFormData({ ...formData, estimated_days: e.target.value })}
                  placeholder="e.g. 3"
                  className="h-9"
                />
              </div>
            </div>
          </div>

          {/* Pickup Address */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Pickup Address</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="pickup_name" className="text-xs">Contact Name</Label>
                <Input
                  id="pickup_name"
                  value={formData.pickup_name}
                  onChange={(e) => setFormData({ ...formData, pickup_name: e.target.value })}
                  placeholder="Your name"
                  className="h-9"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="pickup_phone" className="text-xs">Phone</Label>
                <Input
                  id="pickup_phone"
                  value={formData.pickup_phone}
                  onChange={(e) => setFormData({ ...formData, pickup_phone: e.target.value })}
                  placeholder="+234..."
                  className="h-9"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pickup_address" className="text-xs">Address</Label>
              <Textarea
                id="pickup_address"
                value={formData.pickup_address}
                onChange={(e) => setFormData({ ...formData, pickup_address: e.target.value })}
                placeholder="Street address"
                className="min-h-[60px] resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="pickup_city" className="text-xs">City</Label>
                <Input
                  id="pickup_city"
                  value={formData.pickup_city}
                  onChange={(e) => setFormData({ ...formData, pickup_city: e.target.value })}
                  placeholder="City"
                  className="h-9"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="pickup_state" className="text-xs">State</Label>
                <Input
                  id="pickup_state"
                  value={formData.pickup_state}
                  onChange={(e) => setFormData({ ...formData, pickup_state: e.target.value })}
                  placeholder="State"
                  className="h-9"
                />
              </div>
            </div>
          </div>

          {/* Delivery Address Display */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Delivery To</h4>
            <div className="bg-muted/50 p-3 rounded-lg text-sm">
              <p className="font-medium">{customerAddress.name}</p>
              <p className="text-muted-foreground">{customerAddress.address}</p>
              <p className="text-muted-foreground">{customerAddress.city}, {customerAddress.state}</p>
              <p className="text-muted-foreground">{customerAddress.phone}</p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Booking...
                </>
              ) : (
                "Book Delivery"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
