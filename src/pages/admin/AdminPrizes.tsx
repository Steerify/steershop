import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Check, X, Gift, Clock } from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";

export default function AdminPrizes() {
  const [prizes, setPrizes] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPrize, setEditingPrize] = useState<any>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    points_required: "",
    stock_quantity: "",
    is_active: true,
  });

  useEffect(() => {
    fetchPrizes();
    fetchClaims();
  }, []);

  const fetchPrizes = async () => {
    const { data, error } = await supabase
      .from("rewards_prizes")
      .select("*")
      .order("points_required", { ascending: true });

    if (error) {
      toast({ title: "Error loading prizes", variant: "destructive" });
      return;
    }

    setPrizes(data || []);
  };

  const fetchClaims = async () => {
    const { data, error } = await supabase
      .from("prize_claims")
      .select("*, prizes:rewards_prizes(*), profiles(full_name, email)")
      .order("claimed_at", { ascending: false });

    if (error) {
      toast({ title: "Error loading claims", variant: "destructive" });
      return;
    }

    setClaims(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const prizeData = {
      ...formData,
      points_required: parseInt(formData.points_required) || 0,
      stock_quantity: parseInt(formData.stock_quantity) || 0,
    };

    if (editingPrize) {
      const { error } = await supabase
        .from("rewards_prizes")
        .update(prizeData)
        .eq("id", editingPrize.id);

      if (error) {
        toast({ title: "Error updating prize", variant: "destructive" });
        return;
      }

      toast({ title: "Prize updated successfully" });
    } else {
      const { error } = await supabase
        .from("rewards_prizes")
        .insert([prizeData]);

      if (error) {
        toast({ title: "Error creating prize", variant: "destructive" });
        return;
      }

      toast({ title: "Prize created successfully" });
    }

    resetForm();
    fetchPrizes();
  };

  const handleEdit = (prize: any) => {
    setEditingPrize(prize);
    setFormData({
      title: prize.title,
      description: prize.description,
      image_url: prize.image_url || "",
      points_required: prize.points_required?.toString() || "0",
      stock_quantity: prize.stock_quantity?.toString() || "0",
      is_active: prize.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this prize?")) return;

    const { error } = await supabase
      .from("rewards_prizes")
      .delete()
      .eq("id", id);

    if (error) {
      toast({ title: "Error deleting prize", variant: "destructive" });
      return;
    }

    toast({ title: "Prize deleted successfully" });
    fetchPrizes();
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("rewards_prizes")
      .update({ is_active: !currentStatus })
      .eq("id", id);

    if (error) {
      toast({ title: "Error updating status", variant: "destructive" });
      return;
    }

    toast({ title: "Status updated successfully" });
    fetchPrizes();
  };

  const fulfillClaim = async (claimId: string) => {
    const { error } = await supabase
      .from("prize_claims")
      .update({ status: "fulfilled", fulfilled_at: new Date().toISOString() })
      .eq("id", claimId);

    if (error) {
      toast({ title: "Error fulfilling claim", variant: "destructive" });
      return;
    }

    toast({ title: "Claim marked as fulfilled" });
    fetchClaims();
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      image_url: "",
      points_required: "",
      stock_quantity: "",
      is_active: true,
    });
    setEditingPrize(null);
    setIsDialogOpen(false);
  };

  const pendingClaims = claims.filter(c => c.status === "pending");
  const fulfilledClaims = claims.filter(c => c.status === "fulfilled");

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Rewards Management</h1>
            <p className="text-muted-foreground">Manage prizes and fulfill customer claims</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Prize
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingPrize ? "Edit Prize" : "Create New Prize"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Prize Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <ImageUpload
                    label="Prize Image"
                    value={formData.image_url}
                    onChange={(url) => setFormData({ ...formData, image_url: url })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="points_required">Points Required</Label>
                    <Input
                      id="points_required"
                      type="number"
                      value={formData.points_required}
                      onChange={(e) => setFormData({ ...formData, points_required: e.target.value })}
                      required
                      min="0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="stock_quantity">Stock Quantity</Label>
                    <Input
                      id="stock_quantity"
                      type="number"
                      value={formData.stock_quantity}
                      onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                      required
                      min="0"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingPrize ? "Update Prize" : "Create Prize"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="prizes">
          <TabsList>
            <TabsTrigger value="prizes">Prizes ({prizes.length})</TabsTrigger>
            <TabsTrigger value="claims">
              Claims ({claims.length})
              {pendingClaims.length > 0 && (
                <Badge variant="destructive" className="ml-2">{pendingClaims.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="prizes" className="space-y-4">
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Points Required</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prizes.map((prize) => (
                    <TableRow key={prize.id}>
                      <TableCell className="font-medium">{prize.title}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{prize.points_required} pts</Badge>
                      </TableCell>
                      <TableCell>{prize.stock_quantity}</TableCell>
                      <TableCell>
                        <Badge variant={prize.is_active ? "default" : "secondary"}>
                          {prize.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost" onClick={() => handleEdit(prize)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleStatus(prize.id, prize.is_active)}
                          >
                            {prize.is_active ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(prize.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="claims" className="space-y-4">
            {pendingClaims.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Pending Claims ({pendingClaims.length})
                </h3>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Prize</TableHead>
                        <TableHead>Points Spent</TableHead>
                        <TableHead>Claimed At</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingClaims.map((claim) => (
                        <TableRow key={claim.id}>
                          <TableCell>{claim.profiles?.full_name || claim.profiles?.email}</TableCell>
                          <TableCell className="font-medium">{claim.prizes.title}</TableCell>
                          <TableCell>{claim.points_spent} pts</TableCell>
                          <TableCell>{new Date(claim.claimed_at).toLocaleString()}</TableCell>
                          <TableCell>
                            <Button size="sm" onClick={() => fulfillClaim(claim.id)}>
                              <Gift className="w-4 h-4 mr-1" />
                              Fulfill
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {fulfilledClaims.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Check className="w-5 h-5" />
                  Fulfilled Claims ({fulfilledClaims.length})
                </h3>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Prize</TableHead>
                        <TableHead>Points Spent</TableHead>
                        <TableHead>Fulfilled At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fulfilledClaims.map((claim) => (
                        <TableRow key={claim.id}>
                          <TableCell>{claim.profiles?.full_name || claim.profiles?.email}</TableCell>
                          <TableCell className="font-medium">{claim.prizes.title}</TableCell>
                          <TableCell>{claim.points_spent} pts</TableCell>
                          <TableCell>{new Date(claim.fulfilled_at).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {claims.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No prize claims yet
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
