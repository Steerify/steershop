import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, Check, X } from "lucide-react";

export default function AdminShops() {
  const [shops, setShops] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    const { data, error } = await supabase
      .from("shops")
      .select("*, profiles(full_name, email)")
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
                <TableHead>Status</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredShops.map((shop) => (
                <TableRow key={shop.id}>
                  <TableCell className="font-medium">{shop.shop_name}</TableCell>
                  <TableCell>{shop.profiles?.full_name || "N/A"}</TableCell>
                  <TableCell>{shop.profiles?.email || "N/A"}</TableCell>
                  <TableCell>
                    <Badge variant={shop.is_active ? "default" : "secondary"}>
                      {shop.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>{shop.total_reviews || 0}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant={shop.is_active ? "destructive" : "default"}
                      onClick={() => toggleShopStatus(shop.id, shop.is_active)}
                    >
                      {shop.is_active ? <X className="w-4 h-4 mr-1" /> : <Check className="w-4 h-4 mr-1" />}
                      {shop.is_active ? "Deactivate" : "Activate"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}
