import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Truck,
  MapPin,
  Package,
  AlertCircle,
  CheckCircle2,
  Plus,
  Trash2,
  Save,
  X,
  Zap,
  ShieldCheck,
  DollarSign,
  Globe,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface ShopAddress {
  id: string;
  shop_id: string;
  label: string | null;
  contact_name: string;
  contact_phone: string;
  address: string;
  city: string;
  state: string;
  country: string | null;
  is_default: boolean;
}

interface LogisticsSettingsProps {
  shopId: string;
}

export function LogisticsSettings({ shopId }: LogisticsSettingsProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [deliveryMode, setDeliveryMode] = useState<"self" | "platform">("self");
  const [defaultWeight, setDefaultWeight] = useState<number>(0.5);
  const [defaultDims, setDefaultDims] = useState({
    length: 20,
    width: 15,
    height: 10,
  });
  const [addresses, setAddresses] = useState<ShopAddress[]>([]);
  const [isEditingAddress, setIsEditingAddress] = useState<string | null>(null);
  const [newAddress, setNewAddress] = useState({
    label: "",
    contact_name: "",
    contact_phone: "",
    address: "",
    city: "",
    state: "",
  });
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (shopId) {
      fetchShopData();
      fetchAddresses();
    }
  }, [shopId]);

  const fetchShopData = async () => {
    try {
      const { data, error } = await supabase
        .from("shops")
        .select(
          "delivery_mode, default_package_weight_kg, default_package_dims",
        )
        .eq("id", shopId)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setDeliveryMode(data.delivery_mode || "self");
        setDefaultWeight(Number(data.default_package_weight_kg) || 0.5);
        if (data.default_package_dims) {
          setDefaultDims(data.default_package_dims);
        }
      }
    } catch (error) {
      console.error("Error fetching shop data:", error);
    }
  };

  const fetchAddresses = async () => {
    try {
      const { data, error } = await supabase
        .from("shop_addresses")
        .select("*")
        .eq("shop_id", shopId)
        .order("is_default", { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  };

  const handleSaveDeliveryMode = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("shops")
        .update({
          delivery_mode: deliveryMode,
          default_package_weight_kg: defaultWeight,
          default_package_dims: defaultDims,
        })
        .eq("id", shopId);

      if (error) throw error;
      toast({
        title: "Settings saved",
        description: "Delivery preferences updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    try {
      const { error } = await supabase
        .from("shop_addresses")
        .update({ is_default: true })
        .eq("id", addressId);

      if (error) throw error;

      // Clear other defaults
      await supabase
        .from("shop_addresses")
        .update({ is_default: false })
        .eq("shop_id", shopId)
        .neq("id", addressId);

      fetchAddresses();
      toast({ title: "Default address updated" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAddAddress = async () => {
    if (
      !newAddress.contact_name ||
      !newAddress.contact_phone ||
      !newAddress.address ||
      !newAddress.city ||
      !newAddress.state
    ) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.from("shop_addresses").insert({
        shop_id: shopId,
        label: newAddress.label || null,
        contact_name: newAddress.contact_name,
        contact_phone: newAddress.contact_phone,
        address: newAddress.address,
        city: newAddress.city,
        state: newAddress.state,
        country: "NG",
        is_default: addresses.length === 0, // First address is default
      });

      if (error) throw error;

      setNewAddress({
        label: "",
        contact_name: "",
        contact_phone: "",
        address: "",
        city: "",
        state: "",
      });
      setIsAddingAddress(false);
      fetchAddresses();
      toast({ title: "Address added successfully" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      const { error } = await supabase
        .from("shop_addresses")
        .delete()
        .eq("id", addressId);
      if (error) throw error;
      fetchAddresses();
      toast({ title: "Address deleted" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Delivery Mode Card */}
      <Card className="shadow-md border-border/50">
        <CardHeader className="pb-3 border-b border-border/30 bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Truck className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold">
                Delivery Settings
              </CardTitle>
              <CardDescription className="mt-1">
                Choose how you want SteerSolo to handle deliveries for your
                orders
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Delivery Mode Options */}
          <div className="grid gap-4 md:grid-cols-2">
            <div
              className={`flex flex-col p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                deliveryMode === "self"
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border hover:border-primary/50 hover:bg-muted/30"
              }`}
              onClick={() => setDeliveryMode("self")}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-muted-foreground" />
                  <span className="font-semibold">Self Delivery</span>
                </div>
                <Switch
                  checked={deliveryMode === "self"}
                  onCheckedChange={() => setDeliveryMode("self")}
                />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You handle delivery using your own riders or logistics partners.
                Customers pay a flat delivery fee you set per product.
              </p>
            </div>

            <div
              className={`flex flex-col p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                deliveryMode === "platform"
                  ? "border-primary bg-gradient-to-br from-primary/10 to-accent/5 shadow-md"
                  : "border-border hover:border-primary/50 hover:bg-muted/30"
              }`}
              onClick={() => setDeliveryMode("platform")}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-primary" />
                  <span className="font-semibold">SteerSolo Logistics</span>
                  <Badge className="ml-2 bg-gradient-to-r from-primary to-accent text-white">
                    Recommended
                  </Badge>
                </div>
                <Switch
                  checked={deliveryMode === "platform"}
                  onCheckedChange={() => setDeliveryMode("platform")}
                />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We aggregate 20+ Nigerian carriers (GIG, DHL, Kwik, Fez, Red
                Star, etc.) and find you the best rate. Auto-book, track, and
                manage all deliveries in one place.
              </p>
            </div>
          </div>

          {deliveryMode === "platform" && (
            <div className="mt-6 p-5 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl border border-primary/10">
              <div className="flex items-start gap-3 mb-3">
                <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-2">
                    What you get with SteerSolo Logistics:
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      { icon: Zap, text: "Live rates from multiple carriers" },
                      {
                        icon: CheckCircle2,
                        text: "Auto-book after payment confirmation",
                      },
                      { icon: Globe, text: "Real-time tracking updates" },
                      { icon: DollarSign, text: "Delivery fee passed at cost" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <item.icon className="w-4 h-4 text-primary" />
                        <span className="text-sm text-muted-foreground">
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <Separator className="my-6" />

          {/* Default Package Profile */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">
                Default Package Profile
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Used for delivery quotes when product weight/dimensions aren't
                specified
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Weight (kg)
                </Label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={defaultWeight}
                    onChange={e => setDefaultWeight(Number(e.target.value))}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Length (cm)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    L
                  </span>
                  <Input
                    type="number"
                    min="1"
                    value={defaultDims.length}
                    onChange={e =>
                      setDefaultDims({
                        ...defaultDims,
                        length: Number(e.target.value),
                      })
                    }
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Width (cm)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    W
                  </span>
                  <Input
                    type="number"
                    min="1"
                    value={defaultDims.width}
                    onChange={e =>
                      setDefaultDims({
                        ...defaultDims,
                        width: Number(e.target.value),
                      })
                    }
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Height (cm)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    H
                  </span>
                  <Input
                    type="number"
                    min="1"
                    value={defaultDims.height}
                    onChange={e =>
                      setDefaultDims({
                        ...defaultDims,
                        height: Number(e.target.value),
                      })
                    }
                    className="pl-8"
                  />
                </div>
              </div>
            </div>
          </div>

          <Button
            onClick={handleSaveDeliveryMode}
            disabled={isSaving}
            className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white"
          >
            {isSaving ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Delivery Settings
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Pickup Addresses Card */}
      <Card className="shadow-md border-border/50">
        <CardHeader className="pb-3 border-b border-border/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <MapPin className="w-6 h-6 text-accent" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">
                  Pickup Addresses
                </CardTitle>
                <CardDescription className="mt-1">
                  Where our logistics partners will pick up your packages
                </CardDescription>
              </div>
            </div>
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsAddingAddress(!isAddingAddress)}
              className={
                isAddingAddress
                  ? "bg-muted hover:bg-muted/80"
                  : "bg-primary hover:bg-primary/90"
              }
            >
              {isAddingAddress ? (
                <>
                  <X className="w-4 h-4 mr-1" /> Cancel
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-1" /> Add Address
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {isAddingAddress && (
            <div className="mb-6 p-5 border rounded-xl bg-gradient-to-br from-muted/50 to-background space-y-4">
              <h4 className="font-semibold text-foreground">
                New Pickup Address
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs">Label (optional)</Label>
                  <Input
                    placeholder="e.g., Main Warehouse"
                    value={newAddress.label}
                    onChange={e =>
                      setNewAddress({ ...newAddress, label: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Contact Name *</Label>
                  <Input
                    placeholder="Contact person"
                    value={newAddress.contact_name}
                    onChange={e =>
                      setNewAddress({
                        ...newAddress,
                        contact_name: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs">Phone Number *</Label>
                  <Input
                    placeholder="080XXXXXXXX"
                    value={newAddress.contact_phone}
                    onChange={e =>
                      setNewAddress({
                        ...newAddress,
                        contact_phone: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">City *</Label>
                  <Input
                    placeholder="Lagos"
                    value={newAddress.city}
                    onChange={e =>
                      setNewAddress({ ...newAddress, city: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">State *</Label>
                <Input
                  placeholder="Lagos"
                  value={newAddress.state}
                  onChange={e =>
                    setNewAddress({ ...newAddress, state: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Full Address *</Label>
                <Textarea
                  placeholder="Street address, building number, landmark..."
                  value={newAddress.address}
                  onChange={e =>
                    setNewAddress({ ...newAddress, address: e.target.value })
                  }
                  rows={2}
                />
              </div>
              <Button
                onClick={handleAddAddress}
                disabled={isSaving}
                size="sm"
                className="bg-primary hover:bg-primary/90"
              >
                <Save className="w-4 h-4 mr-1" />
                {isSaving ? "Saving..." : "Save Address"}
              </Button>
            </div>
          )}

          {addresses.length === 0 && !isAddingAddress ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-10 h-10 opacity-50" />
              </div>
              <p className="text-lg font-medium mb-1">
                No pickup addresses configured
              </p>
              <p className="text-sm max-w-sm mx-auto">
                Add an address so we know where to pick up your packages from
                your customers
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {addresses.map(addr => (
                <div
                  key={addr.id}
                  className={`p-5 border rounded-xl transition-all ${
                    addr.is_default
                      ? "border-primary bg-gradient-to-r from-primary/5 to-accent/5 shadow-sm"
                      : "border-border hover:border-primary/30 hover:bg-muted/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {addr.label && (
                          <Badge variant="outline" className="font-medium">
                            {addr.label}
                          </Badge>
                        )}
                        {addr.is_default && (
                          <Badge className="bg-primary text-primary-foreground text-xs">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Default
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="font-semibold text-foreground">
                          {addr.contact_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {addr.contact_phone}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          <MapPin className="w-3 h-3 inline mr-1" />
                          {addr.address}, {addr.city}, {addr.state}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!addr.is_default && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSetDefaultAddress(addr.id)}
                          className="text-primary hover:text-primary hover:bg-primary/10"
                        >
                          Set Default
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default LogisticsSettings;
