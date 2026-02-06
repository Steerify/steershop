import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Check, 
  X, 
  Calendar, 
  AlertCircle, 
  Store, 
  MoreHorizontal, 
  Loader2, 
  Edit, 
  User,
  RefreshCw,
  Shield,
  Trash2,
  Plus
} from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedShop, setSelectedShop] = useState<any>(null);
  const [shopToDelete, setShopToDelete] = useState<any>(null);
  const [extensionDays, setExtensionDays] = useState("30");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [usersWithoutShops, setUsersWithoutShops] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    shop_name: "",
    description: "",
    whatsapp_number: "",
  });
  const [newShopData, setNewShopData] = useState({
    owner_id: "",
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
    
    try {
      // First, let's debug what tables we have
      console.log("Fetching shops data...");
      
      // Try different query approaches
      const { data: shopsData, error: shopsError } = await supabase
        .from("shops")
        .select(`
          id,
          shop_name,
          description,
          logo_url,
          whatsapp_number,
          is_active,
          created_at,
          updated_at,
          owner_id
        `)
        .order("created_at", { ascending: false });

      if (shopsError) {
        console.error("Shops fetch error:", shopsError);
        toast({ 
          title: "Error loading shops", 
          description: shopsError.message,
          variant: "destructive" 
        });
        return;
      }

      console.log("Fetched shops:", shopsData?.length || 0);

      // Now fetch profiles separately and join them
      const ownerIds = shopsData?.map(shop => shop.owner_id).filter(id => id) || [];
      
      let profilesData: any[] = [];
      if (ownerIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select(`
            id,
            full_name,
            email,
            phone,
            is_subscribed,
            subscription_expires_at,
            created_at,
            role,
            subscription_plan_id
          `)
          .in("id", ownerIds);

        if (profilesError) {
          console.error("Profiles fetch error:", profilesError);
        } else {
          profilesData = profiles || [];
          console.log("Fetched profiles:", profilesData.length);
        }
      }

      // Combine shops with their profiles
      const combinedShops = shopsData?.map(shop => {
        const profile = profilesData.find(p => p.id === shop.owner_id);
        return {
          ...shop,
          profiles: profile || null
        };
      }) || [];

      console.log("Combined shops:", combinedShops);
      setShops(combinedShops);
      
    } catch (error: any) {
      console.error("Unexpected error:", error);
      toast({ 
        title: "Error loading data", 
        description: error.message,
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleShopStatus = async (shopId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("shops")
      .update({ is_active: !currentStatus })
      .eq("id", shopId);

    if (error) {
      toast({ 
        title: "Error updating shop", 
        description: error.message,
        variant: "destructive" 
      });
      return;
    }

    toast({ 
      title: `Shop ${!currentStatus ? 'activated' : 'deactivated'}`,
      description: `Shop has been ${!currentStatus ? 'activated' : 'deactivated'} successfully`
    });
    fetchShops();
  };

  const handleExtendTrial = (shop: any) => {
    console.log("Extending trial for shop:", shop);
    console.log("Shop profile data:", shop.profiles);
    
    if (!shop.profiles) {
      toast({
        title: "No Profile Found",
        description: "This shop doesn't have a linked profile. Please check the owner data.",
        variant: "destructive"
      });
      return;
    }
    
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
    console.log("Viewing owner for shop:", shop);
    
    if (!shop.profiles) {
      toast({
        title: "No Owner Data",
        description: "This shop doesn't have owner information.",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedShop(shop);
    setOwnerDialogOpen(true);
  };

  const confirmExtendTrial = async () => {
    console.log("Selected shop for extension:", selectedShop);
    
    if (!selectedShop?.profiles?.id) {
      toast({ 
        title: "Error", 
        description: "No profile ID found for this shop owner",
        variant: "destructive" 
      });
      return;
    }

    setIsSaving(true);
    
    try {
      const now = new Date();
      let newExpiry: Date;
      
      // Get current expiry from profile
      if (selectedShop.profiles.subscription_expires_at) {
        const currentExpiry = new Date(selectedShop.profiles.subscription_expires_at);
        console.log("Current expiry:", currentExpiry);
        
        // Use whichever is later: current date or expiry date
        const baseDate = currentExpiry > now ? currentExpiry : now;
        newExpiry = new Date(baseDate.getTime() + parseInt(extensionDays) * 24 * 60 * 60 * 1000);
      } else {
        // No existing expiry, start from now
        newExpiry = new Date(now.getTime() + parseInt(extensionDays) * 24 * 60 * 60 * 1000);
      }

      console.log("New expiry date:", newExpiry);

      // First, let's check what we're updating
      console.log("Updating profile ID:", selectedShop.profiles.id);
      console.log("Setting expiry to:", newExpiry.toISOString());

      const { data, error } = await supabase
        .from("profiles")
        .update({ 
          subscription_expires_at: newExpiry.toISOString(),
          is_subscribed: true
        })
        .eq("id", selectedShop.profiles.id)
        .select();

      if (error) {
        console.error("Update error:", error);
        toast({ 
          title: "Error extending subscription", 
          description: error.message,
          variant: "destructive" 
        });
        return;
      }

      console.log("Update successful:", data);

      toast({ 
        title: "✅ Subscription Extended", 
        description: `Added ${extensionDays} days to ${selectedShop.shop_name}'s subscription. New expiry: ${newExpiry.toLocaleDateString()}` 
      });
      
      setExtendDialogOpen(false);
      setSelectedShop(null);
      fetchShops();
      
    } catch (error: any) {
      console.error("Error:", error);
      toast({ 
        title: "Error extending subscription", 
        description: error.message,
        variant: "destructive" 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const resetTrial = async (shop: any) => {
    if (!shop?.profiles?.id) {
      toast({ 
        title: "Error", 
        description: "No profile found for this shop",
        variant: "destructive" 
      });
      return;
    }

    try {
      // Set trial to 30 days from now
      const newExpiry = new Date();
      newExpiry.setDate(newExpiry.getDate() + 30);

      const { error } = await supabase
        .from("profiles")
        .update({ 
          subscription_expires_at: newExpiry.toISOString(),
          is_subscribed: false // Mark as trial
        })
        .eq("id", shop.profiles.id);

      if (error) {
        toast({ 
          title: "Error resetting trial", 
          description: error.message,
          variant: "destructive" 
        });
        return;
      }

      toast({ 
        title: "🔄 Trial Reset", 
        description: `Reset ${shop.shop_name}'s trial to 30 days. New expiry: ${newExpiry.toLocaleDateString()}` 
      });
      fetchShops();
      
    } catch (error: any) {
      console.error("Error resetting trial:", error);
      toast({ 
        title: "Error resetting trial", 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  const handleDeleteShop = (shop: any) => {
    setShopToDelete(shop);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteShop = async () => {
    if (!shopToDelete) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('shops')
        .delete()
        .eq('id', shopToDelete.id);

      if (error) throw error;

      toast({ 
        title: "🗑️ Shop Deleted", 
        description: `${shopToDelete.shop_name} has been permanently deleted.` 
      });
      setDeleteDialogOpen(false);
      setShopToDelete(null);
      fetchShops();
    } catch (error: any) {
      toast({ 
        title: "Error deleting shop", 
        description: error.message,
        variant: "destructive" 
      });
    } finally {
      setIsDeleting(false);
    }
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
      toast({ 
        title: "Error updating shop", 
        description: error.message,
        variant: "destructive" 
      });
      setIsSaving(false);
      return;
    }

    toast({ title: "✅ Shop updated successfully" });
    setEditDialogOpen(false);
    setSelectedShop(null);
    setIsSaving(false);
    fetchShops();
  };

  const getSubscriptionBadge = (profile: any) => {
    if (!profile) {
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-300">
          <Shield className="w-3 h-3 mr-1" />
          No Profile
        </Badge>
      );
    }
    
    const status = calculateSubscriptionStatus(profile);
    
    if (status.status === 'active') {
      return (
        <Badge className="bg-green-600 hover:bg-green-700">
          <Check className="w-3 h-3 mr-1" />
          Active ({status.daysRemaining}d)
        </Badge>
      );
    } else if (status.status === 'trial') {
      return (
        <Badge className="bg-blue-600 hover:bg-blue-700">
          <Calendar className="w-3 h-3 mr-1" />
          Trial ({status.daysRemaining}d)
        </Badge>
      );
    } else {
      return (
        <Badge variant="destructive">
          <X className="w-3 h-3 mr-1" />
          Expired
        </Badge>
      );
    }
  };

  const getOwnerName = (shop: any) => {
    if (!shop.profiles) return "No Owner";
    if (shop.profiles.full_name) return shop.profiles.full_name;
    if (shop.profiles.email) return shop.profiles.email.split('@')[0];
    return "Unknown Owner";
  };

  const getOwnerEmail = (shop: any) => {
    if (!shop.profiles) return "No Email";
    return shop.profiles.email || "No Email";
  };

  const filteredShops = shops.filter(shop =>
    shop.shop_name?.toLowerCase().includes(search.toLowerCase()) ||
    getOwnerName(shop).toLowerCase().includes(search.toLowerCase()) ||
    getOwnerEmail(shop).toLowerCase().includes(search.toLowerCase()) ||
    shop.whatsapp_number?.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = shops.filter(s => s.is_active).length;
  const inactiveCount = shops.filter(s => !s.is_active).length;

  // Fetch users without shops for admin shop creation
  const fetchUsersWithoutShops = async () => {
    try {
      // Get all shop owners from profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email, role")
        .eq("role", "shop_owner");

      // Get all shop owner_ids
      const { data: existingShops } = await supabase
        .from("shops")
        .select("owner_id");

      const shopOwnerIds = new Set(existingShops?.map(s => s.owner_id) || []);
      
      // Filter users without shops
      const usersWithout = profiles?.filter(p => !shopOwnerIds.has(p.id)) || [];
      setUsersWithoutShops(usersWithout);
    } catch (error) {
      console.error("Error fetching users without shops:", error);
    }
  };

  // Generate unique slug from shop name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50) + '-' + Date.now().toString(36).slice(-4);
  };

  // Handle creating a new shop for a user
  const handleCreateShop = async () => {
    if (!newShopData.owner_id || !newShopData.shop_name) {
      toast({ title: "Please fill required fields", variant: "destructive" });
      return;
    }

    setIsCreating(true);
    try {
      const slug = generateSlug(newShopData.shop_name);
      
      const { error } = await supabase
        .from("shops")
        .insert({
          owner_id: newShopData.owner_id,
          shop_name: newShopData.shop_name,
          shop_slug: slug,
          description: newShopData.description || null,
          whatsapp_number: newShopData.whatsapp_number || null,
          is_active: true,
        });

      if (error) throw error;

      toast({ 
        title: "✅ Shop Created", 
        description: `Shop "${newShopData.shop_name}" created successfully` 
      });
      
      setCreateDialogOpen(false);
      setNewShopData({ owner_id: "", shop_name: "", description: "", whatsapp_number: "" });
      fetchShops();
      
    } catch (error: any) {
      toast({ 
        title: "Error creating shop", 
        description: error.message,
        variant: "destructive" 
      });
    } finally {
      setIsCreating(false);
    }
  };

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
              <Button 
                onClick={() => {
                  setCreateDialogOpen(true);
                  fetchUsersWithoutShops();
                }}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Shop
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchShops}
                disabled={isLoading}
                className="gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
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
                placeholder="Search shops, owners, or WhatsApp numbers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 border-primary/20"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredShops.length} of {shops.length} shops
            </div>
          </div>

          <div className="border rounded-lg border-primary/10 bg-card/50 backdrop-blur overflow-hidden">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading shops...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
              <Table className="min-w-[800px]">
                <TableHeader>
                  <TableRow className="hover:bg-muted/50 bg-muted/30">
                    <TableHead className="font-semibold">Shop Name</TableHead>
                    <TableHead className="font-semibold">Owner</TableHead>
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold">Subscription</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredShops.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                        <div className="flex flex-col items-center gap-2">
                          <Store className="w-12 h-12 opacity-20" />
                          <p>No shops found</p>
                          {search && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setSearch("")}
                            >
                              Clear search
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredShops.map((shop) => (
                      <TableRow key={shop.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {shop.logo_url ? (
                              <img 
                                src={shop.logo_url} 
                                alt={shop.shop_name} 
                                className="w-10 h-10 rounded-lg object-cover border" 
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center border">
                                <Store className="w-5 h-5 text-primary" />
                              </div>
                            )}
                            <div>
                              <span className="font-medium">{shop.shop_name}</span>
                              {shop.whatsapp_number && (
                                <p className="text-xs text-muted-foreground">{shop.whatsapp_number}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="font-medium">{getOwnerName(shop)}</div>
                            {!shop.profiles && (
                              <Badge variant="outline" className="text-xs">
                                No Profile
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {getOwnerEmail(shop)}
                        </TableCell>
                        <TableCell>
                          {getSubscriptionBadge(shop.profiles)}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={shop.is_active ? "default" : "secondary"} 
                            className={shop.is_active ? "bg-green-600 hover:bg-green-700" : ""}
                          >
                            {shop.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              {shop.profiles && (
                                <>
                                  <DropdownMenuItem onClick={() => handleViewOwner(shop)}>
                                    <User className="w-4 h-4 mr-2" />
                                    View Owner
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                </>
                              )}
                              <DropdownMenuItem onClick={() => handleEditShop(shop)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Shop
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {shop.profiles ? (
                                <>
                                  <DropdownMenuItem onClick={() => handleExtendTrial(shop)}>
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Extend Subscription
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => resetTrial(shop)}>
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Reset Trial (30 days)
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                </>
                              ) : (
                                <DropdownMenuItem disabled>
                                  <AlertCircle className="w-4 h-4 mr-2" />
                                  No Profile for Subscription
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                onClick={() => toggleShopStatus(shop.id, shop.is_active)}
                                className={shop.is_active ? "text-red-600" : "text-green-600"}
                              >
                                {shop.is_active ? (
                                  <>
                                    <X className="w-4 h-4 mr-2" /> 
                                    Deactivate Shop
                                  </>
                                ) : (
                                  <>
                                    <Check className="w-4 h-4 mr-2" /> 
                                    Activate Shop
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteShop(shop)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Shop
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              </div>
            )}
          </div>
        </div>

        {/* Extend Subscription Dialog */}
        <Dialog open={extendDialogOpen} onOpenChange={setExtendDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Extend Subscription</DialogTitle>
              <DialogDescription>
                Extend subscription for {selectedShop?.shop_name}
              </DialogDescription>
            </DialogHeader>
            
            {selectedShop?.profiles ? (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Owner Information</span>
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">{selectedShop.profiles.full_name || "No Name"}</p>
                    <p className="text-sm text-muted-foreground">{selectedShop.profiles.email}</p>
                  </div>
                  
                  <div className="flex items-center gap-3 pt-2 border-t border-border/50">
                    {getSubscriptionBadge(selectedShop.profiles)}
                    <span className="text-sm px-2 py-1 bg-muted-foreground/10 rounded">
                      {selectedShop.profiles.is_subscribed ? "Paid Subscription" : "Trial Period"}
                    </span>
                  </div>
                  
                  {selectedShop.profiles.subscription_expires_at ? (
                    <div className="space-y-1 pt-2">
                      <div className="text-sm">
                        <span className="font-medium">Current expiry:</span>{" "}
                        {new Date(selectedShop.profiles.subscription_expires_at).toLocaleDateString()}
                        {" "}
                        <span className="text-muted-foreground">
                          ({new Date(selectedShop.profiles.subscription_expires_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})})
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground pt-2">
                      No subscription expiry date set
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="extension-days">Extension Period</Label>
                    <Select value={extensionDays} onValueChange={setExtensionDays}>
                      <SelectTrigger id="extension-days">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">1 Week (7 Days)</SelectItem>
                        <SelectItem value="14">2 Weeks (14 Days)</SelectItem>
                        <SelectItem value="30">1 Month (30 Days)</SelectItem>
                        <SelectItem value="60">2 Months (60 Days)</SelectItem>
                        <SelectItem value="90">3 Months (90 Days)</SelectItem>
                        <SelectItem value="180">6 Months (180 Days)</SelectItem>
                        <SelectItem value="365">1 Year (365 Days)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    Subscription will be extended by <span className="font-semibold text-foreground">{extensionDays} days</span>
                    {selectedShop.profiles.subscription_expires_at && (
                      <div className="mt-1">
                        New expiry date:{" "}
                        <span className="font-semibold text-foreground">
                          {(() => {
                            const currentExpiry = selectedShop.profiles.subscription_expires_at 
                              ? new Date(selectedShop.profiles.subscription_expires_at)
                              : new Date();
                            const now = new Date();
                            const baseDate = currentExpiry > now ? currentExpiry : now;
                            const newExpiry = new Date(baseDate.getTime() + parseInt(extensionDays) * 24 * 60 * 60 * 1000);
                            return newExpiry.toLocaleDateString();
                          })()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-yellow-800 dark:text-yellow-300">
                      <p className="font-medium mb-1">Important Note:</p>
                      <p>Extending subscription will also mark the user as subscribed (is_subscribed = true).</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <div>
                    <p className="font-medium text-red-700 dark:text-red-300">No Profile Found</p>
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      This shop doesn't have a linked profile. Please check if the owner exists in the profiles table.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                onClick={() => setExtendDialogOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button 
                onClick={confirmExtendTrial} 
                disabled={isSaving || !selectedShop?.profiles}
                className="w-full sm:w-auto"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Extending...
                  </>
                ) : (
                  "Extend Subscription"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Shop Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Shop</DialogTitle>
              <DialogDescription>
                Update shop details for {selectedShop?.shop_name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="shop-name">Shop Name</Label>
                <Input
                  id="shop-name"
                  value={formData.shop_name}
                  onChange={(e) => setFormData({ ...formData, shop_name: e.target.value })}
                  placeholder="Enter shop name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Enter shop description"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp Number</Label>
                <Input
                  id="whatsapp"
                  value={formData.whatsapp_number}
                  onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                  placeholder="+234..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveShopChanges} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Owner Details Dialog */}
        <Dialog open={ownerDialogOpen} onOpenChange={setOwnerDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Owner Details</DialogTitle>
              <DialogDescription>
                Shop owner information for {selectedShop?.shop_name}
              </DialogDescription>
            </DialogHeader>
            {selectedShop?.profiles ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg border">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">{selectedShop.profiles.full_name || "No Name"}</h3>
                    <p className="text-muted-foreground truncate">{selectedShop.profiles.email || "No Email"}</p>
                    <div className="mt-2">
                      {getSubscriptionBadge(selectedShop.profiles)}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg border">
                    <p className="text-sm text-muted-foreground mb-1">Phone</p>
                    <p className="font-medium truncate">
                      {selectedShop.profiles.phone || "Not provided"}
                    </p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg border">
                    <p className="text-sm text-muted-foreground mb-1">Role</p>
                    <p className="font-medium capitalize">
                      {selectedShop.profiles.role || "customer"}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg border">
                    <p className="text-sm text-muted-foreground mb-1">Joined Date</p>
                    <p className="font-medium">
                      {new Date(selectedShop.profiles.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg border">
                    <p className="text-sm text-muted-foreground mb-1">Subscription Type</p>
                    <p className="font-medium">
                      {selectedShop.profiles.is_subscribed ? (
                        <span className="text-green-600">Paid Subscription</span>
                      ) : (
                        <span className="text-blue-600">Trial Period</span>
                      )}
                    </p>
                  </div>
                </div>
                
                {selectedShop.profiles.subscription_expires_at && (
                  <div className="p-4 bg-muted/50 rounded-lg border">
                    <p className="text-sm text-muted-foreground mb-1">Subscription Expires</p>
                    <div className="space-y-1">
                      <p className="font-medium">
                        {new Date(selectedShop.profiles.subscription_expires_at).toLocaleDateString()}
                        <span className="text-sm text-muted-foreground ml-2">
                          ({new Date(selectedShop.profiles.subscription_expires_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})})
                        </span>
                      </p>
                      <div className="text-sm text-muted-foreground">
                        {(() => {
                          const expiry = new Date(selectedShop.profiles.subscription_expires_at);
                          const now = new Date();
                          const diffTime = expiry.getTime() - now.getTime();
                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                          return diffDays > 0 
                            ? `${diffDays} days remaining` 
                            : "Expired";
                        })()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <div>
                    <p className="font-medium text-red-700 dark:text-red-300">No Profile Data</p>
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      This shop doesn't have owner information in the profiles table.
                    </p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setOwnerDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Shop Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-600">Delete Shop</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete <span className="font-semibold">{shopToDelete?.shop_name}</span>? 
                This action cannot be undone. All products and orders associated with this shop will also be affected.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteShop}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Shop
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Create Shop Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={(open) => {
          setCreateDialogOpen(open);
          if (open) fetchUsersWithoutShops();
        }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Shop for User</DialogTitle>
              <DialogDescription>
                Create a shop for an existing user who hasn't set one up yet
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {/* User Selection */}
              <div className="space-y-2">
                <Label>Select User *</Label>
                <Select
                  value={newShopData.owner_id}
                  onValueChange={(value) => setNewShopData(prev => ({ ...prev, owner_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a user without a shop" />
                  </SelectTrigger>
                  <SelectContent>
                    {usersWithoutShops.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground text-center">
                        All shop owners have shops
                      </div>
                    ) : (
                      usersWithoutShops.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.full_name || user.email} ({user.email})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Shop Name */}
              <div className="space-y-2">
                <Label>Shop Name *</Label>
                <Input
                  value={newShopData.shop_name}
                  onChange={(e) => setNewShopData(prev => ({ ...prev, shop_name: e.target.value }))}
                  placeholder="e.g., Adire Collections"
                />
              </div>
              
              {/* Description */}
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={newShopData.description}
                  onChange={(e) => setNewShopData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the shop"
                  rows={3}
                />
              </div>
              
              {/* WhatsApp */}
              <div className="space-y-2">
                <Label>WhatsApp Number</Label>
                <Input
                  value={newShopData.whatsapp_number}
                  onChange={(e) => setNewShopData(prev => ({ ...prev, whatsapp_number: e.target.value }))}
                  placeholder="+234 800 000 0000"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateShop} 
                disabled={isCreating || !newShopData.owner_id || !newShopData.shop_name}
              >
                {isCreating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Create Shop
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}