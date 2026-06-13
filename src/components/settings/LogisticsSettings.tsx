import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Truck, MapPin, Package, AlertCircle, CheckCircle2, 
  Plus, Trash2, Edit2, Save, X 
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
  const [defaultDims, setDefaultDims] = useState({ length: 20, width: 15, height: 10 });
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
        .select("delivery_mode, default_package_weight_kg, default_package_dims")
        .eq("id", shopId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
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
      toast({ title: "Settings saved", description: "Delivery preferences updated successfully." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
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
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleAddAddress = async () => {
    if (!newAddress.contact_name || !newAddress.contact_phone || !newAddress.address || !newAddress.city || !newAddress.state) {
      toast({ title: "Missing fields", description: "Please fill in all required fields.", variant: "destructive" });
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
      
      setNewAddress({ label: "", contact_name: "", contact_phone: "", address: "", city: "", state: "" });
      setIsAddingAddress(false);
      fetchAddresses();
      toast({ title: "Address added successfully" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      const { error } = await supabase.from("shop_addresses").delete().eq("id", addressId);
      if (error) throw error;
      fetchAddresses();
      toast({ title: "Address deleted" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Delivery Mode Card */}
      <Card className="card-spotify shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Delivery Mode</CardTitle>
          </div>
          <CardDescription>
            Choose how you want SteerSolo to handle deliveries for your orders
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div 
              className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                deliveryMode === "self" ? "border-primary bg-primary/5" : "border-muted"
              }`}
              onClick={() => setDeliveryMode("self")}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  <Label className="font-semibold cursor-pointer">I deliver myself</Label>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  You handle delivery using your own riders or logistics partners. 
                  Customers pay a flat delivery fee you set per product.
                </p>
              </div>
              <Switch checked={deliveryMode === "self"} onCheckedChange={() => setDeliveryMode("self")} />
            </div>

            <div 
              className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                deliveryMode === "platform" ? "border-primary bg-primary/5" : "border-muted"
              }`}
              onClick={() => setDeliveryMode("platform")}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  <Label className="font-semibold cursor-pointer">Use SteerSolo Logistics</Label>
                  <Badge variant="secondary" className="text-xs">Recommended</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  We aggregate 20+ Nigerian carriers (GIG, DHL, Kwik, etc.) and find you the best rate. 
                  Auto-book, track, and manage all deliveries in one place.
                </p>
              </div>
              <Switch checked={deliveryMode === "platform"} onCheckedChange={() => setDeliveryMode("platform")} />
            </div>
          </div>

          {deliveryMode === "platform" && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-primary mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">With SteerSolo Logistics:</p>
                  <ul className="list-disc list-inside mt-1 text-muted-foreground space-y-0.5">
                    <li>Live rates from multiple carriers at checkout</li>
                    <li>Auto-booking after payment confirmation</li>
                    <li>Real-time tracking updates via WhatsApp & email</li>
                    <li>Delivery fee passed at cost (no markup)</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          <Separator />

          <div className="space-y-3">
            <Label>Default Package Profile</Label>
            <p className="text-xs text-muted-foreground">
              Used for delivery quotes when product weight/dimensions aren't specified
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Weight (kg)</Label>
                <Input 
                  type="number" 
                  step="0.1"
                  min="0.1"
                  value={defaultWeight}
                  onChange={(e) => setDefaultWeight(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Length (cm)</Label>
                <Input 
                  type="number" 
                  min="1"
                  value={defaultDims.length}
                  onChange={(e) => setDefaultDims({...defaultDims, length: Number(e.target.value)})}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Width (cm)</Label>
                <Input 
                  type="number" 
                  min="1"
                  value={defaultDims.width}
                  onChange={(e) => setDefaultDims({...defaultDims, width: Number(e.target.value)})}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Height (cm)</Label>
                <Input 
                  type="number" 
                  min="1"
                  value={defaultDims.height}
                  onChange={(e) => setDefaultDims({...defaultDims, height: Number(e.target.value)})}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <Button onClick={handleSaveDeliveryMode} disabled={isSaving} className="mt-2">
            {isSaving ? "Saving..." : "Save Delivery Settings"}
          </Button>
        </CardContent>
      </Card>

      {/* Pickup Addresses Card */}
      <Card className="card-spotify shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Pickup Addresses</CardTitle>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsAddingAddress(!isAddingAddress)}
            >
              {isAddingAddress ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span className="ml-1">{isAddingAddress ? "Cancel" : "Add"}</span>
            </Button>
          </div>
          <CardDescription>
            Where our logistics partners will pick up your packages
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isAddingAddress && (
            <div className="mb-4 p-4 border rounded-lg bg-muted/30 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Label (optional)</Label>
                  <Input 
                    placeholder="e.g., Main Warehouse"
                    value={newAddress.label}
                    onChange={(e) => setNewAddress({...newAddress, label: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Contact Name *</Label>
                  <Input 
                    placeholder="Contact person"
                    value={newAddress.contact_name}
                    onChange={(e) => setNewAddress({...newAddress, contact_name: e.target.value})}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Phone Number *</Label>
                  <Input 
                    placeholder="080XXXXXXXX"
                    value={newAddress.contact_phone}
                    onChange={(e) => setNewAddress({...newAddress, contact_phone: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">City *</Label>
                  <Input 
                    placeholder="Lagos"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs">State *</Label>
                <Input 
                  placeholder="Lagos"
                  value={newAddress.state}
                  onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Full Address *</Label>
                <Textarea 
                  placeholder="Street address, building number, landmark..."
                  value={newAddress.address}
                  onChange={(e) => setNewAddress({...newAddress, address: e.target.value})}
                  className="mt-1"
                  rows={2}
                />
              </div>
              <Button onClick={handleAddAddress} disabled={isSaving} size="sm">
                <Save className="w-4 h-4 mr-1" />
                {isSaving ? "Saving..." : "Save Address"}
              </Button>
            </div>
          )}

          {addresses.length === 0 && !isAddingAddress ? (
            <div className="text-center py-8 text-muted-foreground">
              <MapPin className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No pickup addresses configured</p>
              <p className="text-sm">Add an address so we know where to pick up your packages</p>
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr) => (
                <div 
                  key={addr.id}
                  className={`p-4 border rounded-lg ${addr.is_default ? "border-primary bg-primary/5" : ""}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {addr.label && <Badge variant="outline">{addr.label}</Badge>}
                        {addr.is_default && (
                          <Badge variant="default" className="text-xs">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Default
                          </Badge>
                        )}
                      </div>
                      <p className="font-medium mt-1">{addr.contact_name}</p>
                      <p className="text-sm text-muted-foreground">{addr.contact_phone}</p>
                      <p className="text-sm mt-1">
                        {addr.address}, {addr.city}, {addr.state}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {!addr.is_default && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleSetDefaultAddress(addr.id)}
                        >
                          Set Default
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="text-destructive hover:text-destructive"
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
