import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, Check, X, Calendar, AlertCircle, Store, Eye, MoreHorizontal, Loader2, Edit, User } from "lucide-react";
import { calculateSubscriptionStatus } from "@/utils/subscription";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AdirePattern } from "@/components/patterns/AdirePattern";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AdminShops() {
  const [shops, setShops] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [extendDialogOpen, setExtendDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [ownerDialogOpen, setOwnerDialogOpen] = useState(false);
  const [selectedShop, setSelectedShop] = useState<any>(null);
  const [extensionDays, setExtensionDays] = useState("7");
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    shop_name: "",
    description: "",
    whatsapp_number: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("shops")
      .select("*, profiles(id, full_name, email, phone, is_subscribed, subscription_expires_at, created_at)")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error loading shops", variant: "destructive" });
      return;
    }

    setShops(data || []);
    setIsLoading(false);
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

    toast({ title: `Shop ${!currentStatus ? 'activated' : 'deactivated'}` });
    fetchShops();
  };

  const handleExtendTrial = (shop: any) => {
    setSelectedShop(shop);
    setExtendDialogOpen(true);
  };

  const handleEditShop = (shop: any) => {
    setSelectedShop(shop);
    setFormData({
      shop_name: shop.shop_name,
      description: shop.description || "",
      whatsapp_number: shop.whatsapp_number || "",
    });
    setEditDialogOpen(true);
  };

  const handleViewOwner = (shop: any) => {
    setSelectedShop(shop);
    setOwnerDialogOpen(true);
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

  const saveShopChanges = async () => {
    if (!selectedShop) return;
    setIsSaving(true);

    const { error } = await supabase
      .from("shops")
      .update({
        shop_name: formData.shop_name,
        description: formData.description,
        whatsapp_number: formData.whatsapp_number,
      })
      .eq("id", selectedShop.id);

    if (error) {
      toast({ title: "Error updating shop", variant: "destructive" });
      setIsSaving(false);
      return;
    }

    toast({ title: "Shop updated successfully" });
    setEditDialogOpen(false);
    setSelectedShop(null);
    setIsSaving(false);
    fetchShops();
  };

  const getSubscriptionBadge = (profile: any) => {
    if (!profile) return <Badge variant="secondary">No Profile</Badge>;
    
    const status = calculateSubscriptionStatus(profile);
    
    if (status.status === 'active') {
      return <Badge className="bg-green-600">Active ({status.daysRemaining}d)</Badge>;
    } else if (status.status === 'trial') {
      return <Badge className="bg-blue-600">Trial ({status.daysRemaining}d)</Badge>;
    } else {
      return <Badge variant="destructive">Expired</Badge>;
    }
  };

  const filteredShops = shops.filter(shop =>
    shop.shop_name.toLowerCase().includes(search.toLowerCase()) ||
    shop.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    shop.profiles?.email?.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = shops.filter(s => s.is_active).length;
  const inactiveCount = shops.filter(s => !s.is_active).length;

  return (
    <AdminLayout>
      <div className="space-y-6 relative">
        <AdirePattern variant="dots" className="absolute inset-0 opacity-5 pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-heading font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Shops Management
              </h1>
              <p className="text-muted-foreground">Manage all shops on the platform</p>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="px-3 py-1 bg-green-500/10 border-green-500/30 text-green-600">
                <Store className="w-4 h-4 mr-1" />
                {activeCount} Active
              </Badge>
              <Badge variant="outline" className="px-3 py-1 bg-red-500/10 border-red-500/30 text-red-600">
                <Store className="w-4 h-4 mr-1" />
                {inactiveCount} Inactive
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search shops or owners..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 border-primary/20"
              />
            </div>
          </div>

          <div className="border rounded-lg border-primary/10 bg-card/50 backdrop-blur overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-muted/50">
                    <TableHead>Shop Name</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Subscription</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredShops.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                        No shops found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredShops.map((shop) => (
                      <TableRow key={shop.id} className="hover:bg-muted/30">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {shop.logo_url ? (
                              <img src={shop.logo_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                            ) : (
                              <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
                                <Store className="w-5 h-5 text-primary" />
                              </div>
                            )}
                            <span className="font-medium">{shop.shop_name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{shop.profiles?.full_name || "N/A"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{shop.profiles?.email || "N/A"}</TableCell>
                        <TableCell>{getSubscriptionBadge(shop.profiles)}</TableCell>
                        <TableCell>
                          <Badge variant={shop.is_active ? "default" : "secondary"} className={shop.is_active ? "bg-green-600" : ""}>
                            {shop.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewOwner(shop)}>
                                <User className="w-4 h-4 mr-2" />
                                View Owner
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditShop(shop)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Shop
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleExtendTrial(shop)} disabled={!shop.profiles}>
                                <Calendar className="w-4 h-4 mr-2" />
                                Extend Subscription
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toggleShopStatus(shop.id, shop.is_active)}>
                                {shop.is_active ? (
                                  <><X className="w-4 h-4 mr-2" /> Deactivate</>
                                ) : (
                                  <><Check className="w-4 h-4 mr-2" /> Activate</>
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </div>

        {/* Extend Subscription Dialog */}
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
                  <Label>Extension Period</Label>
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

        {/* Edit Shop Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Shop</DialogTitle>
              <DialogDescription>Update shop details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Shop Name</Label>
                <Input
                  value={formData.shop_name}
                  onChange={(e) => setFormData({ ...formData, shop_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>WhatsApp Number</Label>
                <Input
                  value={formData.whatsapp_number}
                  onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                  placeholder="+234..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
              <Button onClick={saveShopChanges} disabled={isSaving}>
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Owner Details Dialog */}
        <Dialog open={ownerDialogOpen} onOpenChange={setOwnerDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Owner Details</DialogTitle>
              <DialogDescription>Shop owner information</DialogDescription>
            </DialogHeader>
            {selectedShop?.profiles && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{selectedShop.profiles.full_name}</h3>
                    <p className="text-muted-foreground">{selectedShop.profiles.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{selectedShop.profiles.phone || "Not provided"}</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Joined</p>
                    <p className="font-medium">{new Date(selectedShop.profiles.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Subscription Status</p>
                  {getSubscriptionBadge(selectedShop.profiles)}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setOwnerDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
