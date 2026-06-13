import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Truck, AlertTriangle, CheckCircle2, XCircle, 
  RefreshCw, ExternalLink, Package, BarChart3 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface CarrierStatus {
  carrier_code: string;
  carrier_name: string;
  is_enabled: boolean;
  config: Record<string, any>;
  updated_at: string;
}

interface PlatformSettings {
  key: string;
  value: Record<string, any>;
  description: string;
}

interface StuckShipment {
  id: string;
  order_id: string;
  shop_name: string;
  customer_name: string;
  status: string;
  created_at: string;
  tracking_code: string | null;
}

const AdminLogistics = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [carriers, setCarriers] = useState<CarrierStatus[]>([]);
  const [settings, setSettings] = useState<PlatformSettings[]>([]);
  const [stuckShipments, setStuckShipments] = useState<StuckShipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [carriersRes, settingsRes, shipmentsRes] = await Promise.all([
        supabase.from("carrier_status").select("*").order("carrier_name"),
        supabase.from("platform_settings").select("*"),
        fetchStuckShipments(),
      ]);

      if (carriersRes.data) setCarriers(carriersRes.data);
      if (settingsRes.data) setSettings(settingsRes.data);
    } catch (error) {
      console.error("Error fetching logistics data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStuckShipments = async () => {
    try {
      // Get shipments with no update in 48+ hours
      const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from("delivery_orders")
        .select(`
          id,
          order_id,
          status,
          created_at,
          provider_tracking_code,
          shops!delivery_orders_shop_id_fkey (
            shop_name
          ),
          orders!delivery_orders_order_id_fkey (
            customer_name
          )
        `)
        .in("status", ["confirmed", "picked_up", "in_transit"])
        .lt("updated_at", twoDaysAgo)
        .limit(20);

      if (error) throw error;
      setStuckShipments(data || []);
    } catch (error) {
      console.error("Error fetching stuck shipments:", error);
    }
  };

  const handleToggleCarrier = async (carrierCode: string, currentEnabled: boolean) => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("carrier_status")
        .update({ is_enabled: !currentEnabled })
        .eq("carrier_code", carrierCode);

      if (error) throw error;
      
      setCarriers(prev => 
        prev.map(c => c.carrier_code === carrierCode ? { ...c, is_enabled: !currentEnabled } : c)
      );
      
      toast({ title: "Carrier status updated" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePlatformEnabled = async (currentValue: boolean) => {
    setIsSaving(true);
    try {
      const setting = settings.find(s => s.key === "logistics_platform_enabled");
      if (!setting) throw new Error("Setting not found");

      const { error } = await supabase
        .from("platform_settings")
        .update({ value: { ...setting.value, enabled: !currentValue } })
        .eq("key", "logistics_platform_enabled");

      if (error) throw error;
      
      setSettings(prev => prev.map(s => 
        s.key === "logistics_platform_enabled" 
          ? { ...s, value: { ...s.value, enabled: !currentValue } }
          : s
      ));
      
      toast({ title: "Platform logistics toggled" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const platformEnabled = settings.find(s => s.key === "logistics_platform_enabled")?.value?.enabled ?? false;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-bold">Logistics Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage carriers, platform settings, and monitor shipments
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="carriers">Carriers</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="stuck">Stuck Shipments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Platform Status Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Platform Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {platformEnabled ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <Badge variant="default">Active</Badge>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-red-500" />
                      <Badge variant="secondary">Disabled</Badge>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Active Carriers Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Carriers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-primary" />
                  <span className="text-2xl font-bold">
                    {carriers.filter(c => c.is_enabled).length}
                  </span>
                  <span className="text-muted-foreground text-sm">/ {carriers.length}</span>
                </div>
              </CardContent>
            </Card>

            {/* Stuck Shipments Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Stuck Shipments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`w-5 h-5 ${stuckShipments.length > 0 ? "text-amber-500" : "text-green-500"}`} />
                  <span className="text-2xl font-bold">{stuckShipments.length}</span>
                  <span className="text-muted-foreground text-sm">48h+ no update</span>
                </div>
              </CardContent>
            </Card>

            {/* Primary Carrier Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Primary Provider</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <span className="font-medium">Terminal Africa</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="carriers">
          <Card>
            <CardHeader>
              <CardTitle>Carrier Management</CardTitle>
              <CardDescription>
                Enable or disable carriers. Disabled carriers won't appear in rate quotes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {carriers.map((carrier) => (
                <div 
                  key={carrier.carrier_code}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      carrier.is_enabled ? "bg-green-100" : "bg-muted"
                    }`}>
                      <Truck className={`w-5 h-5 ${
                        carrier.is_enabled ? "text-green-600" : "text-muted-foreground"
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium">{carrier.carrier_name}</p>
                      <p className="text-sm text-muted-foreground">{carrier.carrier_code}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {carrier.is_enabled ? (
                      <Badge variant="default" className="bg-green-500">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Disabled</Badge>
                    )}
                    <Switch 
                      checked={carrier.is_enabled}
                      onCheckedChange={() => handleToggleCarrier(carrier.carrier_code, carrier.is_enabled)}
                      disabled={isSaving}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Platform Settings</CardTitle>
              <CardDescription>
                Configure global logistics platform settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Platform Toggle */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label className="text-base font-medium">Enable SteerSolo Logistics</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow vendors to use the platform logistics system
                  </p>
                </div>
                <Switch 
                  checked={platformEnabled}
                  onCheckedChange={() => handleTogglePlatformEnabled(platformEnabled)}
                  disabled={isSaving}
                />
              </div>

              {/* Convenience Fee */}
              <div className="p-4 border rounded-lg">
                <Label className="text-base font-medium">Convenience Fee</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Percentage markup on delivery fees (0 = cost passthrough)
                </p>
                <div className="flex items-center gap-2">
                  <Input 
                    type="number" 
                    min="0" 
                    max="10" 
                    step="0.1"
                    className="w-24"
                    value={settings.find(s => s.key === "logistics_convenience_fee_percent")?.value?.percent ?? 0}
                    disabled
                  />
                  <span className="text-muted-foreground">%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Currently set to 0% (cost passthrough as per your configuration)
                </p>
              </div>

              {/* COD Setting */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Cash on Delivery (COD)</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow customers to pay upon delivery
                    </p>
                  </div>
                  <Switch 
                    checked={settings.find(s => s.key === "logistics_platform_enabled")?.value?.allow_cod ?? true}
                    disabled
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stuck">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Stuck Shipments</CardTitle>
                  <CardDescription>
                    Shipments with no status update in 48+ hours
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={fetchStuckShipments}>
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {stuckShipments.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="w-12 h-12 mx-auto text-green-500 mb-3" />
                  <p className="text-lg font-medium">All shipments moving!</p>
                  <p className="text-muted-foreground">No stuck shipments at the moment</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stuckShipments.map((shipment) => (
                    <div 
                      key={shipment.id}
                      className="p-4 border rounded-lg flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                          <AlertTriangle className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-medium">
                            Order #{shipment.order_id?.slice(0, 8)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {shipment.shops?.shop_name} → {shipment.orders?.customer_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Status: {shipment.status} • Created: {new Date(shipment.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {shipment.provider_tracking_code && (
                          <Badge variant="outline">{shipment.provider_tracking_code}</Badge>
                        )}
                        <Button variant="outline" size="sm">
                          <ExternalLink className="w-4 h-4 mr-1" />
                          Investigate
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminLogistics;
