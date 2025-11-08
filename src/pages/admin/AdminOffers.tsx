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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Check, X } from "lucide-react";
import { format } from "date-fns";

export default function AdminOffers() {
  const [offers, setOffers] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<any>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    code: "",
    discount_percentage: "",
    valid_until: "",
    target_audience: "customers",
    button_text: "Claim Offer",
    button_link: "/shops",
    is_active: true,
  });

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    const { data, error } = await supabase
      .from("special_offers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error loading offers", variant: "destructive" });
      return;
    }

    setOffers(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const offerData = {
      ...formData,
      discount_percentage: formData.discount_percentage ? parseInt(formData.discount_percentage) : null,
      valid_until: formData.valid_until || null,
    };

    if (editingOffer) {
      const { error } = await supabase
        .from("special_offers")
        .update(offerData)
        .eq("id", editingOffer.id);

      if (error) {
        toast({ title: "Error updating offer", variant: "destructive" });
        return;
      }

      toast({ title: "Offer updated successfully" });
    } else {
      const { error } = await supabase
        .from("special_offers")
        .insert([offerData]);

      if (error) {
        toast({ title: "Error creating offer", variant: "destructive" });
        return;
      }

      toast({ title: "Offer created successfully" });
    }

    resetForm();
    fetchOffers();
  };

  const handleEdit = (offer: any) => {
    setEditingOffer(offer);
    setFormData({
      title: offer.title,
      description: offer.description,
      code: offer.code || "",
      discount_percentage: offer.discount_percentage?.toString() || "",
      valid_until: offer.valid_until ? format(new Date(offer.valid_until), "yyyy-MM-dd") : "",
      target_audience: offer.target_audience,
      button_text: offer.button_text,
      button_link: offer.button_link,
      is_active: offer.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this offer?")) return;

    const { error } = await supabase
      .from("special_offers")
      .delete()
      .eq("id", id);

    if (error) {
      toast({ title: "Error deleting offer", variant: "destructive" });
      return;
    }

    toast({ title: "Offer deleted successfully" });
    fetchOffers();
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("special_offers")
      .update({ is_active: !currentStatus })
      .eq("id", id);

    if (error) {
      toast({ title: "Error updating status", variant: "destructive" });
      return;
    }

    toast({ title: "Status updated successfully" });
    fetchOffers();
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      code: "",
      discount_percentage: "",
      valid_until: "",
      target_audience: "customers",
      button_text: "Claim Offer",
      button_link: "/shops",
      is_active: true,
    });
    setEditingOffer(null);
    setIsDialogOpen(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Special Offers Management</h1>
            <p className="text-muted-foreground">Manage promotional offers for customers and entrepreneurs</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Offer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingOffer ? "Edit Offer" : "Create New Offer"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="code">Promo Code (Optional)</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="discount">Discount % (Optional)</Label>
                    <Input
                      id="discount"
                      type="number"
                      value={formData.discount_percentage}
                      onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="valid_until">Valid Until (Optional)</Label>
                  <Input
                    id="valid_until"
                    type="date"
                    value={formData.valid_until}
                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="audience">Target Audience</Label>
                  <Select
                    value={formData.target_audience}
                    onValueChange={(value) => setFormData({ ...formData, target_audience: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customers">Customers</SelectItem>
                      <SelectItem value="entrepreneurs">Entrepreneurs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="button_text">Button Text</Label>
                    <Input
                      id="button_text"
                      value={formData.button_text}
                      onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="button_link">Button Link</Label>
                    <Input
                      id="button_link"
                      value={formData.button_link}
                      onChange={(e) => setFormData({ ...formData, button_link: e.target.value })}
                      required
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
                    {editingOffer ? "Update Offer" : "Create Offer"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Audience</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {offers.map((offer) => (
                <TableRow key={offer.id}>
                  <TableCell className="font-medium">{offer.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{offer.target_audience}</Badge>
                  </TableCell>
                  <TableCell>{offer.code || "N/A"}</TableCell>
                  <TableCell>{offer.discount_percentage ? `${offer.discount_percentage}%` : "N/A"}</TableCell>
                  <TableCell>
                    {offer.valid_until ? format(new Date(offer.valid_until), "MMM dd, yyyy") : "No expiry"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={offer.is_active ? "default" : "secondary"}>
                      {offer.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(offer)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleStatus(offer.id, offer.is_active)}
                      >
                        {offer.is_active ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(offer.id)}
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
      </div>
    </AdminLayout>
  );
}
