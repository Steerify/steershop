import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Bell, Send } from "lucide-react";
import { format } from "date-fns";

interface PlatformUpdate {
  id: string;
  title: string;
  description: string | null;
  type: string;
  target_audience: string;
  is_active: boolean;
  created_at: string;
}

const AdminPlatformUpdates = () => {
  const { toast } = useToast();
  const [updates, setUpdates] = useState<PlatformUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState<PlatformUpdate | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "announcement",
    target_audience: "all",
    is_active: true,
  });

  useEffect(() => {
    loadUpdates();
  }, []);

  const loadUpdates = async () => {
    const { data, error } = await supabase
      .from("platform_updates")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setUpdates(data as PlatformUpdate[]);
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (editingUpdate) {
      const { error } = await supabase
        .from("platform_updates")
        .update({ ...form })
        .eq("id", editingUpdate.id);
      if (error) {
        toast({ title: "Error updating", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "Update saved" });
    } else {
      const { error } = await supabase
        .from("platform_updates")
        .insert({ ...form, created_by: user?.id });
      if (error) {
        toast({ title: "Error creating", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "Update created" });
    }

    setIsDialogOpen(false);
    setEditingUpdate(null);
    setForm({ title: "", description: "", type: "announcement", target_audience: "all", is_active: true });
    loadUpdates();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("platform_updates").delete().eq("id", id);
    if (!error) {
      toast({ title: "Update deleted" });
      loadUpdates();
    }
  };

  const openEdit = (update: PlatformUpdate) => {
    setEditingUpdate(update);
    setForm({
      title: update.title,
      description: update.description || "",
      type: update.type,
      target_audience: update.target_audience,
      is_active: update.is_active,
    });
    setIsDialogOpen(true);
  };

  const openCreate = () => {
    setEditingUpdate(null);
    setForm({ title: "", description: "", type: "announcement", target_audience: "all", is_active: true });
    setIsDialogOpen(true);
  };

  const sendToWhatsApp = (update: PlatformUpdate) => {
    const message = encodeURIComponent(`📢 *${update.title}*\n\n${update.description || ""}\n\n— SteerSolo Team`);
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  const typeBadgeColor = (type: string) => {
    switch (type) {
      case "feature": return "bg-blue-500/10 text-blue-600";
      case "improvement": return "bg-green-500/10 text-green-600";
      case "maintenance": return "bg-orange-500/10 text-orange-600";
      default: return "bg-primary/10 text-primary";
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
              <Bell className="w-6 h-6 text-primary" />
              Platform Updates
            </h1>
            <p className="text-muted-foreground">Create announcements visible in user dashboards</p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" /> New Update
          </Button>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingUpdate ? "Edit Update" : "New Platform Update"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. New: AI Product Descriptions" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Brief description..." rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="feature">Feature</SelectItem>
                      <SelectItem value="improvement">Improvement</SelectItem>
                      <SelectItem value="announcement">Announcement</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Audience</Label>
                  <Select value={form.target_audience} onValueChange={v => setForm({ ...form, target_audience: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Everyone</SelectItem>
                      <SelectItem value="entrepreneurs">Entrepreneurs</SelectItem>
                      <SelectItem value="customers">Customers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_active} onCheckedChange={v => setForm({ ...form, is_active: v })} />
                <Label>Active</Label>
              </div>
              <Button onClick={handleSave} className="w-full">{editingUpdate ? "Save Changes" : "Create Update"}</Button>
            </div>
          </DialogContent>
        </Dialog>

        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : updates.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">No updates yet. Create your first one!</CardContent></Card>
        ) : (
          <div className="space-y-3">
            {updates.map(update => (
              <Card key={update.id} className={!update.is_active ? "opacity-50" : ""}>
                <CardContent className="p-4 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold">{update.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${typeBadgeColor(update.type)}`}>{update.type}</span>
                      <span className="text-xs text-muted-foreground">{update.target_audience}</span>
                      {!update.is_active && <Badge variant="outline">Inactive</Badge>}
                    </div>
                    {update.description && <p className="text-sm text-muted-foreground">{update.description}</p>}
                    <p className="text-xs text-muted-foreground mt-1">{format(new Date(update.created_at), "MMM d, yyyy")}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => sendToWhatsApp(update)} title="Share to WhatsApp">
                      <Send className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(update)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(update.id)} className="text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminPlatformUpdates;
