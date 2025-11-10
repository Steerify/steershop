import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, Check, X, Calendar, AlertCircle } from "lucide-react";
import { calculateSubscriptionStatus } from "@/utils/subscription";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminShops() {
  const [shops, setShops] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [extendDialogOpen, setExtendDialogOpen] = useState(false);
  const [selectedShop, setSelectedShop] = useState<any>(null);
  const [extensionDays, setExtensionDays] = useState("7");
  const { toast } = useToast();

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    const { data, error } = await supabase
      .from("shops")
      .select("*, profiles(id, full_name, email, is_subscribed, subscription_expires_at, created_at)")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error loading shops", variant: "destructive" });
      return;
    }

    setShops(data || []);
  };

  const toggleShopStatus = async (shopId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("shops")
      .update({ is_active: !currentStatus })
      .eq("id", shopId);

    if (error) {
      toast({ title: "Error updating shop", variant: "destructive" });
      return;
    }

    toast({ title: "Shop status updated" });
    fetchShops();
  };

  const handleExtendTrial = (shop: any) => {
    setSelectedShop(shop);
    setExtendDialogOpen(true);
  };

  const confirmExtendTrial = async () => {
    if (!selectedShop?.profiles?.id) return;

    const currentExpiry = selectedShop.profiles.subscription_expires_at 
      ? new Date(selectedShop.profiles.subscription_expires_at)
      : new Date();
    
    const now = new Date();
    const baseDate = currentExpiry > now ? currentExpiry : now;
    const newExpiry = new Date(baseDate.getTime() + parseInt(extensionDays) * 24 * 60 * 60 * 1000);

    const { error } = await supabase
      .from("profiles")
      .update({ subscription_expires_at: newExpiry.toISOString() })
      .eq("id", selectedShop.profiles.id);

    if (error) {
      toast({ title: "Error extending subscription", variant: "destructive" });
      return;
    }

    toast({ 
      title: "Subscription extended", 
      description: `Added ${extensionDays} days to ${selectedShop.shop_name}'s subscription` 
    });
    setExtendDialogOpen(false);
    setSelectedShop(null);
    fetchShops();
  };

  const getSubscriptionBadge = (profile: any) => {
    if (!profile) return <Badge variant="secondary">No Profile</Badge>;
    
    const status = calculateSubscriptionStatus(profile);
    
    if (status.status === 'active') {
      return <Badge variant="default" className="bg-green-600">Active ({status.daysRemaining}d)</Badge>;
    } else if (status.status === 'trial') {
      return <Badge variant="secondary" className="bg-blue-600">Trial ({status.daysRemaining}d)</Badge>;
    } else {
      return <Badge variant="destructive">Expired</Badge>;
    }
  };

  const filteredShops = shops.filter(shop =>
    shop.shop_name.toLowerCase().includes(search.toLowerCase()) ||
    shop.profiles?.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Shops Management</h1>
            <p className="text-muted-foreground">Manage all shops on the platform</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search shops..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Shop Name</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Shop Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredShops.map((shop) => (
                <TableRow key={shop.id}>
                  <TableCell className="font-medium">{shop.shop_name}</TableCell>
                  <TableCell>{shop.profiles?.full_name || "N/A"}</TableCell>
                  <TableCell>{shop.profiles?.email || "N/A"}</TableCell>
                  <TableCell>{getSubscriptionBadge(shop.profiles)}</TableCell>
                  <TableCell>
                    <Badge variant={shop.is_active ? "default" : "secondary"}>
                      {shop.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleExtendTrial(shop)}
                        disabled={!shop.profiles}
                      >
                        <Calendar className="w-4 h-4 mr-1" />
                        Extend
                      </Button>
                      <Button
                        size="sm"
                        variant={shop.is_active ? "destructive" : "default"}
                        onClick={() => toggleShopStatus(shop.id, shop.is_active)}
                      >
                        {shop.is_active ? <X className="w-4 h-4 mr-1" /> : <Check className="w-4 h-4 mr-1" />}
                        {shop.is_active ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Dialog open={extendDialogOpen} onOpenChange={setExtendDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Extend Subscription</DialogTitle>
              <DialogDescription>
                Extend the subscription period for {selectedShop?.shop_name}
              </DialogDescription>
            </DialogHeader>
            
            {selectedShop?.profiles && (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Current Status</span>
                  </div>
                  <div className="text-sm">
                    {getSubscriptionBadge(selectedShop.profiles)}
                  </div>
                  {selectedShop.profiles.subscription_expires_at && (
                    <div className="text-sm text-muted-foreground">
                      Expires: {new Date(selectedShop.profiles.subscription_expires_at).toLocaleDateString()}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Extension Period</label>
                  <Select value={extensionDays} onValueChange={setExtensionDays}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 Days</SelectItem>
                      <SelectItem value="14">14 Days</SelectItem>
                      <SelectItem value="30">30 Days</SelectItem>
                      <SelectItem value="60">60 Days</SelectItem>
                      <SelectItem value="90">90 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setExtendDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={confirmExtendTrial}>
                Confirm Extension
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
