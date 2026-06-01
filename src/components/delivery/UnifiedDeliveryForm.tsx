import { useState, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Truck, Loader2, MapPin, Plus, Check, Star, AlertCircle } from "lucide-react";
import deliveryService, { DeliveryAddress, DeliveryRate as CourierRate } from "@/services/delivery.service";
import { useToast } from "@/hooks/use-toast";

interface UnifiedDeliveryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  shopId: string;
  customerAddress: DeliveryAddress;
  onSuccess: () => void;
}

export const UnifiedDeliveryForm = ({
  open,
  onOpenChange,
  orderId,
  shopId,
  customerAddress,
  onSuccess,
}: UnifiedDeliveryFormProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"live" | "manual">("live");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingRates, setIsFetchingRates] = useState(false);
  
  // Addresses state
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  
  // New address state
  const [newAddress, setNewAddress] = useState({
    name: "Shop Warehouse",
    phone: "",
    address: "",
    city: "",
    state: "",
  });

  // Rates state
  const [packageWeight, setPackageWeight] = useState("1");
  const [rates, setRates] = useState<CourierRate[]>([]);
  const [selectedRate, setSelectedRate] = useState<CourierRate | null>(null);

  // Manual delivery state
  const [manualData, setManualData] = useState({
    carrier_name: "",
    tracking_code: "",
    delivery_fee: "",
    estimated_days: "",
  });

  // Load saved addresses
  const loadAddresses = async () => {
    try {
      const addrList = await deliveryService.getShopAddresses(shopId);
      setSavedAddresses(addrList || []);
      if (addrList && addrList.length > 0) {
        setSelectedAddressId(addrList[0].id);
      } else {
        setShowAddAddressForm(true);
      }
    } catch (err) {
      console.error("Failed to load shop addresses:", err);
    }
  };

  useEffect(() => {
    if (open) {
      loadAddresses();
      // Reset states
      setRates([]);
      setSelectedRate(null);
    }
  }, [open, shopId]);

  const handleAddNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.address || !newAddress.city || !newAddress.state || !newAddress.phone) {
      toast({
        title: "Validation Error",
        description: "Please fill out all address fields.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const added = await deliveryService.saveShopAddress({
        shop_id: shopId,
        label: newAddress.name || "Warehouse",
        contact_name: newAddress.name,
        contact_phone: newAddress.phone,
        address_line_1: newAddress.address,
        city: newAddress.city,
        state: newAddress.state,
      } as any);
      toast({
        title: "Address Saved! 📍",
        description: "Pickup location added successfully.",
      });
      await loadAddresses();
      setSelectedAddressId((added as any).id);
      setShowAddAddressForm(false);
    } catch (error: any) {
      toast({
        title: "Failed to save address",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetRates = async () => {
    const activePickup = savedAddresses.find(a => a.id === selectedAddressId);
    if (!activePickup) {
      toast({
        title: "Address Needed",
        description: "Please select or add a pickup address first.",
        variant: "destructive",
      });
      return;
    }

    setIsFetchingRates(true);
    setRates([]);
    setSelectedRate(null);

    try {
      const response = await deliveryService.getRates({
        order_id: orderId,
        pickup_address: {
          name: activePickup.name,
          phone: activePickup.phone,
          address: activePickup.address,
          city: activePickup.city,
          state: activePickup.state,
        },
        delivery_address: customerAddress,
        weight_kg: Number(packageWeight) || 1,
      });

      if (response && response.length > 0) {
        setRates(response);
        setSelectedRate(response[0]); // default select first rate
        toast({
          title: "Rates Fetched ⚡",
          description: `Found ${response.length} delivery quotes.`,
        });
      } else {
        toast({
          title: "No courier rates found",
          description: "Please double check addresses or use manual delivery.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error("Error fetching rates:", err);
      toast({
        title: "Rates Lookup Failed",
        description: err.message || "Failed to fetch live courier rates.",
        variant: "destructive",
      });
    } finally {
      setIsFetchingRates(false);
    }
  };

  const handleBookLiveDelivery = async () => {
    if (!selectedRate) {
      toast({
        title: "Select Courier",
        description: "Please select a courier quote to book.",
        variant: "destructive",
      });
      return;
    }

    const activePickup = savedAddresses.find(a => a.id === selectedAddressId);
    if (!activePickup) return;

    setIsLoading(true);
    try {
      const bookRes = await deliveryService.bookDelivery({
        order_id: orderId,
        shop_id: shopId,
        provider: "sendbox", // Sendbox handles the logistics integrations
        rate_id: selectedRate.rate_id,
        pickup_address: {
          name: activePickup.name,
          phone: activePickup.phone,
          address: activePickup.address,
          city: activePickup.city,
          state: activePickup.state,
        },
        delivery_address: customerAddress,
        delivery_fee: selectedRate.price,
        weight_kg: Number(packageWeight) || 1,
      });

      toast({
        title: "Fulfillment Successful! 🚀",
        description: `Shipment booked with ${selectedRate.carrier}. Tracking Code: ${bookRes.tracking_code || 'Awaiting'}`,
      });

      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      console.error("Booking error:", err);
      toast({
        title: "Booking Failed",
        description: err.message || "Failed to dispatch package to carrier.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookManualDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualData.carrier_name || !manualData.delivery_fee) {
      toast({
        title: "Missing Information",
        description: "Please enter a carrier name and delivery fee.",
        variant: "destructive",
      });
      return;
    }

    const fee = Number(manualData.delivery_fee);
    if (!Number.isFinite(fee) || fee <= 0) {
      toast({
        title: "Invalid Fee",
        description: "Delivery fee must be a number greater than 0.",
        variant: "destructive",
      });
      return;
    }

    const activePickup = savedAddresses.find(a => a.id === selectedAddressId) || newAddress;

    setIsLoading(true);
    try {
      const estDays = Number(manualData.estimated_days) || 3;
      const estimatedDate = new Date(Date.now() + estDays * 24 * 60 * 60 * 1000).toISOString();

      await deliveryService.bookDelivery({
        order_id: orderId,
        shop_id: shopId,
        provider: "manual",
        pickup_address: {
          name: activePickup.name || "Store",
          phone: activePickup.phone || "",
          address: activePickup.address || "",
          city: activePickup.city || "",
          state: activePickup.state || "",
        },
        delivery_address: customerAddress,
        delivery_fee: fee,
        tracking_code: manualData.tracking_code || undefined,
        estimated_delivery_date: estimatedDate,
      });

      toast({
        title: "Manual Delivery Logged",
        description: "The order is now processing and delivery is recorded.",
      });

      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      toast({
        title: "Logging Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl border border-border/50 shadow-2xl backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Truck className="w-5.5 h-5.5 text-primary animate-bounce" />
            Book Shipment Fulfillment
          </DialogTitle>
          <DialogDescription>
            Arrange and book shipment options directly with carriers or log manual deliveries.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="space-y-4">
          <TabsList className="grid grid-cols-2 p-1 bg-muted/40 rounded-xl border border-border/40">
            <TabsTrigger value="live" className="font-bold py-2.5 rounded-lg transition-all">
              ⚡ Automated Courier
            </TabsTrigger>
            <TabsTrigger value="manual" className="font-bold py-2.5 rounded-lg transition-all">
              📦 Manual Log
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: AUTOMATED LIVE CARRIER RATES */}
          <TabsContent value="live" className="space-y-4 animate-fade-in outline-none">
            {/* Step A: Pickup Address Selection */}
            <div className="space-y-3 p-4 bg-muted/30 border border-border/40 rounded-2xl">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-black uppercase text-muted-foreground tracking-wider flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-primary" /> 1. Select Shop Pickup Address
                </Label>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowAddAddressForm(!showAddAddressForm)}
                  className="h-7 text-xs font-bold text-primary hover:bg-primary/10 rounded-md"
                >
                  {showAddAddressForm ? "Select Address" : <><Plus className="w-3.5 h-3.5 mr-1" /> Add New</>}
                </Button>
              </div>

              {showAddAddressForm ? (
                <form onSubmit={handleAddNewAddress} className="space-y-3 pt-2 border-t border-border/40">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-[10px] font-bold text-muted-foreground uppercase">Phone</Label>
                      <Input
                        placeholder="e.g. 08012345678"
                        value={newAddress.phone}
                        onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })}
                        className="h-9 rounded-lg"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] font-bold text-muted-foreground uppercase">Label/Name</Label>
                      <Input
                        placeholder="e.g. Shop Warehouse"
                        value={newAddress.name}
                        onChange={e => setNewAddress({ ...newAddress, name: e.target.value })}
                        className="h-9 rounded-lg"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-[10px] font-bold text-muted-foreground uppercase">Street Address</Label>
                    <Input
                      placeholder="123 Broad Street"
                      value={newAddress.address}
                      onChange={e => setNewAddress({ ...newAddress, address: e.target.value })}
                      className="h-9 rounded-lg"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-[10px] font-bold text-muted-foreground uppercase">City</Label>
                      <Input
                        placeholder="Ikeja"
                        value={newAddress.city}
                        onChange={e => setNewAddress({ ...newAddress, city: e.target.value })}
                        className="h-9 rounded-lg"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] font-bold text-muted-foreground uppercase">State</Label>
                      <Input
                        placeholder="Lagos"
                        value={newAddress.state}
                        onChange={e => setNewAddress({ ...newAddress, state: e.target.value })}
                        className="h-9 rounded-lg"
                      />
                    </div>
                  </div>
                  <Button type="submit" size="sm" className="w-full rounded-xl" disabled={isLoading}>
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Location 📍"}
                  </Button>
                </form>
              ) : (
                <div className="space-y-2">
                  {savedAddresses.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">No addresses saved. Click Add New to configure.</p>
                  ) : (
                    <div className="flex flex-col gap-2 max-h-[120px] overflow-y-auto pr-1">
                      {savedAddresses.map((addr) => (
                        <div
                          key={addr.id}
                          onClick={() => setSelectedAddressId(addr.id)}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-2.5 ${
                            selectedAddressId === addr.id
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-border/60 hover:bg-background"
                          }`}
                        >
                          <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            selectedAddressId === addr.id ? "border-primary bg-primary text-white" : "border-muted-foreground/30"
                          }`}>
                            {selectedAddressId === addr.id && <Check className="w-2.5 h-2.5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-foreground flex items-center gap-1">{addr.name} <span className="text-[10px] font-normal text-muted-foreground">({addr.phone})</span></p>
                            <p className="text-muted-foreground truncate">{addr.address}, {addr.city}, {addr.state}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Step B: Weight & Rates Request */}
            <div className="grid grid-cols-3 gap-3 items-end">
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="pkg_weight" className="text-xs font-bold text-muted-foreground">Estimated Weight (KG)</Label>
                <Input
                  id="pkg_weight"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={packageWeight}
                  onChange={e => setPackageWeight(e.target.value)}
                  className="h-10 rounded-xl bg-background"
                />
              </div>
              <Button
                onClick={handleGetRates}
                disabled={isFetchingRates || savedAddresses.length === 0}
                className="h-10 rounded-xl bg-primary text-white hover:bg-primary/95 font-bold"
              >
                {isFetchingRates ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Calculate Rates 💸"
                )}
              </Button>
            </div>

            {/* Step C: Rates Quotes Display */}
            {rates.length > 0 && (
              <div className="space-y-2.5">
                <Label className="text-xs font-black uppercase text-muted-foreground tracking-wider">
                  2. Select Preferred Courier Rate
                </Label>
                <div className="grid gap-2 max-h-[160px] overflow-y-auto pr-1">
                  {rates.map((rate) => (
                    <div
                      key={rate.rate_id}
                      onClick={() => setSelectedRate(rate)}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                        selectedRate?.rate_id === rate.rate_id
                          ? "border-primary bg-primary/5 shadow-md shadow-primary/5 scale-[1.01]"
                          : "border-border hover:bg-muted/30"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-muted/40 flex items-center justify-center p-1.5 shrink-0 border">
                          <img
                            src={rate.carrier_logo || "https://sendbox.co/logo.png"}
                            alt={rate.carrier}
                            className="max-h-full max-w-full object-contain rounded-md"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://cdn-icons-png.flaticon.com/512/3063/3063822.png";
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-foreground truncate">{rate.carrier}</p>
                          <p className="text-xs text-muted-foreground">Est. Deliver: <span className="font-bold text-foreground">{rate.estimated_days} days</span></p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-black text-primary">₦{Number(rate.price).toLocaleString()}</p>
                        <span className="text-[10px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded-md">
                          SELECT
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-border/50">
                  <Button
                    onClick={handleBookLiveDelivery}
                    className="w-full h-11 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/15 transition-all duration-300"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Dispatching Order...</span>
                    ) : (
                      `Confirm & Book Dispatch (₦${selectedRate?.price.toLocaleString()})`
                    )}
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* TAB 2: MANUAL LOGGING */}
          <TabsContent value="manual" className="space-y-4 animate-fade-in outline-none">
            <form onSubmit={handleBookManualDelivery} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="man_carrier" className="text-xs">Carrier Name *</Label>
                  <Input
                    id="man_carrier"
                    value={manualData.carrier_name}
                    onChange={e => setManualData({ ...manualData, carrier_name: e.target.value })}
                    placeholder="e.g. GIG Logistics, DHL"
                    className="h-10 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="man_tracking" className="text-xs">Tracking / Waybill Code</Label>
                  <Input
                    id="man_tracking"
                    value={manualData.tracking_code}
                    onChange={e => setManualData({ ...manualData, tracking_code: e.target.value })}
                    placeholder="Optional"
                    className="h-10 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="man_fee" className="text-xs">Delivery Fee (₦) *</Label>
                  <Input
                    id="man_fee"
                    type="number"
                    min="1"
                    step="1"
                    value={manualData.delivery_fee}
                    onChange={e => setManualData({ ...manualData, delivery_fee: e.target.value })}
                    placeholder="0"
                    className="h-10 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="man_est" className="text-xs">Estimated Days</Label>
                  <Input
                    id="man_est"
                    type="number"
                    min="1"
                    step="1"
                    value={manualData.estimated_days}
                    onChange={e => setManualData({ ...manualData, estimated_days: e.target.value })}
                    placeholder="3"
                    className="h-10 rounded-xl"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-11 font-bold rounded-2xl shadow-lg transition-all duration-300" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Logging...</span>
                ) : (
                  "Confirm Manual Tracking"
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        {/* Customer Destination Card */}
        <div className="mt-2 pt-3 border-t border-border/50">
          <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Delivery Destination</Label>
          <div className="bg-muted/40 p-3 rounded-2xl border border-border/40 text-xs flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-foreground">{customerAddress.name} <span className="font-normal text-muted-foreground">({customerAddress.phone})</span></p>
              <p className="text-muted-foreground mt-0.5 truncate">{customerAddress.address}, {customerAddress.city}, {customerAddress.state}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
