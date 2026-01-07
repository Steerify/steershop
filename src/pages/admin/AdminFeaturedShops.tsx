import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, GripVertical, Store, Sparkles, Edit, ArrowUp, ArrowDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FeaturedShop {
  id: string;
  shop_id: string;
  label: string;
  tagline: string | null;
  display_order: number;
  is_active: boolean;
  expires_at: string | null;
  shop: {
    shop_name: string;
    shop_slug: string;
    logo_url: string | null;
  };
}

interface Shop {
  id: string;
  shop_name: string;
  shop_slug: string;
  logo_url: string | null;
}

const AdminFeaturedShops = () => {
  const [featuredShops, setFeaturedShops] = useState<FeaturedShop[]>([]);
  const [availableShops, setAvailableShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedShop, setSelectedShop] = useState<FeaturedShop | null>(null);
  
  // Form states
  const [newShopId, setNewShopId] = useState("");
  const [newLabel, setNewLabel] = useState("Featured");
  const [newTagline, setNewTagline] = useState("");
  const [editLabel, setEditLabel] = useState("");
  const [editTagline, setEditTagline] = useState("");

  useEffect(() => {
    fetchFeaturedShops();
    fetchAvailableShops();
  }, []);

  const fetchFeaturedShops = async () => {
    try {
      const { data, error } = await supabase
        .from("featured_shops")
        .select(`
          id,
          shop_id,
          label,
          tagline,
          display_order,
          is_active,
          expires_at,
          shops!inner (
            shop_name,
            shop_slug,
            logo_url
          )
        `)
        .order("display_order", { ascending: true });

      if (error) throw error;

      const transformed = (data || []).map((item: any) => ({
        ...item,
        shop: item.shops
      }));

      setFeaturedShops(transformed);
    } catch (error) {
      console.error("Error fetching featured shops:", error);
      toast.error("Failed to load featured shops");
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableShops = async () => {
    try {
      const { data, error } = await supabase
        .from("shops")
        .select("id, shop_name, shop_slug, logo_url")
        .eq("is_active", true)
        .order("shop_name");

      if (error) throw error;
      setAvailableShops(data || []);
    } catch (error) {
      console.error("Error fetching shops:", error);
    }
  };

  const handleAddFeaturedShop = async () => {
    if (!newShopId) {
      toast.error("Please select a shop");
      return;
    }

    try {
      const maxOrder = featuredShops.length > 0 
        ? Math.max(...featuredShops.map(s => s.display_order)) + 1 
        : 0;

      const { error } = await supabase
        .from("featured_shops")
        .insert({
          shop_id: newShopId,
          label: newLabel || "Featured",
          tagline: newTagline || null,
          display_order: maxOrder,
          is_active: true,
        });

      if (error) {
        if (error.code === "23505") {
          toast.error("This shop is already featured");
          return;
        }
        throw error;
      }

      toast.success("Shop added to featured list");
      setAddDialogOpen(false);
      setNewShopId("");
      setNewLabel("Featured");
      setNewTagline("");
      fetchFeaturedShops();
    } catch (error) {
      console.error("Error adding featured shop:", error);
      toast.error("Failed to add featured shop");
    }
  };

  const handleRemoveFeaturedShop = async (id: string) => {
    try {
      const { error } = await supabase
        .from("featured_shops")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Shop removed from featured list");
      fetchFeaturedShops();
    } catch (error) {
      console.error("Error removing featured shop:", error);
      toast.error("Failed to remove featured shop");
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      const { error } = await supabase
        .from("featured_shops")
        .update({ is_active: !currentActive })
        .eq("id", id);

      if (error) throw error;

      toast.success(currentActive ? "Shop hidden from banner" : "Shop visible in banner");
      fetchFeaturedShops();
    } catch (error) {
      console.error("Error toggling status:", error);
      toast.error("Failed to update status");
    }
  };

  const handleMoveOrder = async (id: string, direction: "up" | "down") => {
    const currentIndex = featuredShops.findIndex(s => s.id === id);
    if (
      (direction === "up" && currentIndex === 0) ||
      (direction === "down" && currentIndex === featuredShops.length - 1)
    ) {
      return;
    }

    const swapIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const currentShop = featuredShops[currentIndex];
    const swapShop = featuredShops[swapIndex];

    try {
      await Promise.all([
        supabase
          .from("featured_shops")
          .update({ display_order: swapShop.display_order })
          .eq("id", currentShop.id),
        supabase
          .from("featured_shops")
          .update({ display_order: currentShop.display_order })
          .eq("id", swapShop.id),
      ]);

      fetchFeaturedShops();
    } catch (error) {
      console.error("Error reordering:", error);
      toast.error("Failed to reorder");
    }
  };

  const handleEditShop = (shop: FeaturedShop) => {
    setSelectedShop(shop);
    setEditLabel(shop.label);
    setEditTagline(shop.tagline || "");
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedShop) return;

    try {
      const { error } = await supabase
        .from("featured_shops")
        .update({
          label: editLabel,
          tagline: editTagline || null,
        })
        .eq("id", selectedShop.id);

      if (error) throw error;

      toast.success("Featured shop updated");
      setEditDialogOpen(false);
      setSelectedShop(null);
      fetchFeaturedShops();
    } catch (error) {
      console.error("Error updating featured shop:", error);
      toast.error("Failed to update");
    }
  };

  // Filter out already featured shops from available shops
  const unfeaturedShops = availableShops.filter(
    shop => !featuredShops.some(fs => fs.shop_id === shop.id)
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold">Featured Shops</h1>
          <p className="text-muted-foreground">Manage the promotional banner on the homepage</p>
        </div>
        {/* Stats Card */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{featuredShops.length}</div>
              <p className="text-xs text-muted-foreground">Total Featured</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {featuredShops.filter(s => s.is_active).length}
              </div>
              <p className="text-xs text-muted-foreground">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-muted-foreground">
                {featuredShops.filter(s => !s.is_active).length}
              </div>
              <p className="text-xs text-muted-foreground">Hidden</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{availableShops.length}</div>
              <p className="text-xs text-muted-foreground">Total Shops</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" />
                Featured Shops Banner
              </CardTitle>
              <CardDescription>
                These shops appear in the promotional carousel on the homepage
              </CardDescription>
            </div>
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add Shop</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add Featured Shop</DialogTitle>
                  <DialogDescription>
                    Select a shop to feature on the homepage banner
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Select Shop</Label>
                    <Select value={newShopId} onValueChange={setNewShopId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a shop..." />
                      </SelectTrigger>
                      <SelectContent>
                        {unfeaturedShops.length === 0 ? (
                          <div className="p-4 text-center text-muted-foreground text-sm">
                            All shops are already featured
                          </div>
                        ) : (
                          unfeaturedShops.map((shop) => (
                            <SelectItem key={shop.id} value={shop.id}>
                              <div className="flex items-center gap-2">
                                <Store className="w-4 h-4" />
                                {shop.shop_name}
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Badge Label</Label>
                    <Input
                      placeholder="Featured"
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      E.g., "Featured", "Staff Pick", "New", "Trending"
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Custom Tagline (Optional)</Label>
                    <Input
                      placeholder="Discover amazing products..."
                      value={newTagline}
                      onChange={(e) => setNewTagline(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Leave empty to use the shop's description
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddFeaturedShop} disabled={!newShopId}>
                    Add to Featured
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : featuredShops.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No featured shops yet</p>
                <p className="text-sm">Add shops to display them in the homepage banner</p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Order</TableHead>
                        <TableHead>Shop</TableHead>
                        <TableHead className="hidden sm:table-cell">Label</TableHead>
                        <TableHead className="hidden md:table-cell">Tagline</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {featuredShops.map((featured, index) => (
                        <TableRow key={featured.id}>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <GripVertical className="w-4 h-4 text-muted-foreground" />
                              <div className="flex flex-col">
                                <button
                                  onClick={() => handleMoveOrder(featured.id, "up")}
                                  disabled={index === 0}
                                  className="p-0.5 hover:bg-muted rounded disabled:opacity-30"
                                >
                                  <ArrowUp className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleMoveOrder(featured.id, "down")}
                                  disabled={index === featuredShops.length - 1}
                                  className="p-0.5 hover:bg-muted rounded disabled:opacity-30"
                                >
                                  <ArrowDown className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                {featured.shop.logo_url ? (
                                  <img
                                    src={featured.shop.logo_url}
                                    alt={featured.shop.shop_name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Store className="w-5 h-5 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="font-medium">{featured.shop.shop_name}</div>
                                <div className="text-xs text-muted-foreground sm:hidden">
                                  {featured.label}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge variant="secondary" className="gap-1">
                              <Sparkles className="w-3 h-3" />
                              {featured.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell max-w-[200px] truncate">
                            {featured.tagline || "-"}
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={featured.is_active}
                              onCheckedChange={() => handleToggleActive(featured.id, featured.is_active)}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditShop(featured)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveFeaturedShop(featured.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Featured Shop</DialogTitle>
              <DialogDescription>
                Update the label and tagline for {selectedShop?.shop.shop_name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Badge Label</Label>
                <Input
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Custom Tagline (Optional)</Label>
                <Input
                  placeholder="Leave empty to use shop's description"
                  value={editTagline}
                  onChange={(e) => setEditTagline(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminFeaturedShops;
