import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, RefreshCw, Megaphone, Calendar, Phone, Mail, Store, ExternalLink,
  CheckCircle, Clock, XCircle, PlayCircle, MapPin, Globe, Plus, Trash2, Eye
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MarketingService {
  id: string;
  shop_id: string;
  service_type: string;
  status: string;
  consultation_date: string | null;
  consultation_notes: string | null;
  amount: number | null;
  payment_status: string;
  google_profile_url: string | null;
  created_at: string;
  updated_at: string;
  shops: { shop_name: string; owner_id: string; whatsapp_number: string | null } | null;
  owner?: { full_name: string | null; email: string; phone: string | null } | null;
}

interface GBPSubmission {
  id: string;
  shop_id: string;
  user_id: string;
  business_name: string | null;
  physical_address: string | null;
  phone_number: string | null;
  primary_category: string | null;
  business_description: string | null;
  website_url: string | null;
  service_areas: string | null;
  services_list: string | null;
  attributes: string[] | null;
  logo_url: string | null;
  cover_photo_url: string | null;
  interior_photos: string[] | null;
  exterior_photos: string[] | null;
  team_photos: string[] | null;
  verification_notes: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  shops?: { shop_name: string } | null;
}

const SERVICE_TYPE_LABELS: Record<string, string> = {
  youtube_ads: "YouTube Ads", google_ads: "Google Ads", consultation: "General Consultation",
  seo: "SEO Optimization", google_my_business: "Google My Business",
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-700 border-yellow-300", icon: Clock },
  scheduled: { label: "Scheduled", color: "bg-blue-100 text-blue-700 border-blue-300", icon: Calendar },
  in_progress: { label: "In Progress", color: "bg-purple-100 text-purple-700 border-purple-300", icon: PlayCircle },
  completed: { label: "Completed", color: "bg-green-100 text-green-700 border-green-300", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700 border-red-300", icon: XCircle },
  draft: { label: "Draft", color: "bg-gray-100 text-gray-700 border-gray-300", icon: Clock },
  submitted: { label: "Submitted", color: "bg-blue-100 text-blue-700 border-blue-300", icon: CheckCircle },
};

export default function AdminMarketingConsultations() {
  const [consultations, setConsultations] = useState<MarketingService[]>([]);
  const [gbpSubmissions, setGbpSubmissions] = useState<GBPSubmission[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedConsultation, setSelectedConsultation] = useState<MarketingService | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [updateForm, setUpdateForm] = useState({ status: "", consultation_date: "", consultation_notes: "" });
  const [selectedGbp, setSelectedGbp] = useState<GBPSubmission | null>(null);
  const [isGbpDialogOpen, setIsGbpDialogOpen] = useState(false);
  const [gbpForm, setGbpForm] = useState({ status: "", admin_notes: "" });
  const [activeTab, setActiveTab] = useState("consultations");
  const [isCreateConsultationOpen, setIsCreateConsultationOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ shop_id: "", service_type: "consultation", consultation_notes: "", consultation_date: "" });
  const [deleteTarget, setDeleteTarget] = useState<{ type: "consultation" | "gbp"; id: string } | null>(null);
  const [isGbpDetailOpen, setIsGbpDetailOpen] = useState(false);
  const [detailGbp, setDetailGbp] = useState<GBPSubmission | null>(null);
  const [shops, setShops] = useState<{ id: string; shop_name: string }[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchConsultations();
    fetchGbpSubmissions();
    fetchShops();
  }, []);

  const fetchShops = async () => {
    const { data } = await supabase.from("shops").select("id, shop_name").order("shop_name");
    setShops(data || []);
  };

  const fetchConsultations = async () => {
    setIsLoading(true);
    try {
      const { data: services, error } = await supabase
        .from("marketing_services")
        .select(`*, shops(shop_name, owner_id, whatsapp_number)`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const ownerIds = services?.map(s => s.shops?.owner_id).filter(Boolean) || [];
      let profiles: any[] = [];
      if (ownerIds.length > 0) {
        const { data: profilesData } = await supabase.from("profiles").select("id, full_name, email, phone").in("id", ownerIds);
        profiles = profilesData || [];
      }
      setConsultations(services?.map(service => ({ ...service, owner: profiles.find(p => p.id === service.shops?.owner_id) || null })) || []);
    } catch (error: any) {
      toast({ title: "Error loading consultations", description: error.message, variant: "destructive" });
    } finally { setIsLoading(false); }
  };

  const fetchGbpSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from("google_business_profiles")
        .select(`*, shops:shop_id(shop_name)`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setGbpSubmissions(data || []);
    } catch (error: any) {
      toast({ title: "Error loading GBP submissions", description: error.message, variant: "destructive" });
    }
  };

  const handleUpdateClick = (consultation: MarketingService) => {
    setSelectedConsultation(consultation);
    setUpdateForm({ status: consultation.status, consultation_date: consultation.consultation_date || "", consultation_notes: consultation.consultation_notes || "" });
    setIsUpdateDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedConsultation) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.from("marketing_services").update({
        status: updateForm.status, consultation_date: updateForm.consultation_date || null, consultation_notes: updateForm.consultation_notes || null,
      }).eq("id", selectedConsultation.id);
      if (error) throw error;
      toast({ title: "Consultation updated successfully" });
      setIsUpdateDialogOpen(false);
      fetchConsultations();
    } catch (error: any) {
      toast({ title: "Error updating", description: error.message, variant: "destructive" });
    } finally { setIsSaving(false); }
  };

  const handleGbpUpdate = async () => {
    if (!selectedGbp) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.from("google_business_profiles").update({
        status: gbpForm.status, admin_notes: gbpForm.admin_notes || null,
      }).eq("id", selectedGbp.id);
      if (error) throw error;
      toast({ title: "GBP submission updated" });
      setIsGbpDialogOpen(false);
      fetchGbpSubmissions();
    } catch (error: any) {
      toast({ title: "Error updating", description: error.message, variant: "destructive" });
    } finally { setIsSaving(false); }
  };

  const handleCreateConsultation = async () => {
    if (!createForm.shop_id) { toast({ title: "Select a shop", variant: "destructive" }); return; }
    setIsSaving(true);
    try {
      const { error } = await supabase.from("marketing_services").insert({
        shop_id: createForm.shop_id,
        service_type: createForm.service_type,
        consultation_notes: createForm.consultation_notes || null,
        consultation_date: createForm.consultation_date || null,
        status: "pending",
        payment_status: "pending",
      });
      if (error) throw error;
      toast({ title: "Consultation created" });
      setIsCreateConsultationOpen(false);
      setCreateForm({ shop_id: "", service_type: "consultation", consultation_notes: "", consultation_date: "" });
      fetchConsultations();
    } catch (error: any) {
      toast({ title: "Error creating", description: error.message, variant: "destructive" });
    } finally { setIsSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsSaving(true);
    try {
      const table = deleteTarget.type === "consultation" ? "marketing_services" : "google_business_profiles";
      const { error } = await supabase.from(table).delete().eq("id", deleteTarget.id);
      if (error) throw error;
      toast({ title: `${deleteTarget.type === "consultation" ? "Consultation" : "GBP submission"} deleted` });
      setDeleteTarget(null);
      if (deleteTarget.type === "consultation") fetchConsultations(); else fetchGbpSubmissions();
    } catch (error: any) {
      toast({ title: "Error deleting", description: error.message, variant: "destructive" });
    } finally { setIsSaving(false); }
  };

  const filteredConsultations = consultations.filter(c =>
    c.shops?.shop_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.owner?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.owner?.email?.toLowerCase().includes(search.toLowerCase()) ||
    SERVICE_TYPE_LABELS[c.service_type]?.toLowerCase().includes(search.toLowerCase())
  );
  const filteredGbp = gbpSubmissions.filter(g =>
    g.business_name?.toLowerCase().includes(search.toLowerCase()) ||
    g.shops?.shop_name?.toLowerCase().includes(search.toLowerCase()) ||
    g.physical_address?.toLowerCase().includes(search.toLowerCase())
  );
  const pendingCount = consultations.filter(c => c.status === "pending").length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Marketing & GBP</h1>
            <p className="text-muted-foreground">Manage consultations and Google Business Profile submissions</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => { fetchConsultations(); fetchGbpSubmissions(); }} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />Refresh
            </Button>
            <Badge variant="outline" className="px-3 py-1 bg-yellow-500/10 border-yellow-500/30 text-yellow-600">
              <Clock className="w-4 h-4 mr-1" />{pendingCount} Pending
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="consultations"><Megaphone className="w-4 h-4 mr-2" />Consultations ({consultations.length})</TabsTrigger>
            <TabsTrigger value="gbp"><Globe className="w-4 h-4 mr-2" />Google Business Profiles ({gbpSubmissions.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="consultations">
            <div className="flex justify-end mb-3">
              <Button size="sm" onClick={() => setIsCreateConsultationOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />New Consultation
              </Button>
            </div>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Shop</TableHead><TableHead>Owner</TableHead><TableHead>Contact</TableHead>
                    <TableHead>Service Type</TableHead><TableHead>Status</TableHead><TableHead>Scheduled</TableHead>
                    <TableHead>Requested</TableHead><TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={8} className="text-center py-8"><RefreshCw className="w-6 h-6 animate-spin mx-auto text-muted-foreground" /></TableCell></TableRow>
                  ) : filteredConsultations.length === 0 ? (
                    <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No consultation requests found</TableCell></TableRow>
                  ) : filteredConsultations.map((c) => {
                    const StatusIcon = STATUS_CONFIG[c.status]?.icon || Clock;
                    return (
                      <TableRow key={c.id}>
                        <TableCell><div className="flex items-center gap-2"><Store className="w-4 h-4 text-muted-foreground" /><span className="font-medium">{c.shops?.shop_name || "Unknown"}</span></div></TableCell>
                        <TableCell className="text-sm">{c.owner?.full_name || "Unknown"}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1 text-xs">
                            {c.owner?.email && <a href={`mailto:${c.owner.email}`} className="flex items-center gap-1 text-primary hover:underline"><Mail className="w-3 h-3" />{c.owner.email}</a>}
                            {(c.shops?.whatsapp_number || c.owner?.phone) && <span className="flex items-center gap-1 text-muted-foreground"><Phone className="w-3 h-3" />{c.shops?.whatsapp_number || c.owner?.phone}</span>}
                          </div>
                        </TableCell>
                        <TableCell><Badge variant="outline">{SERVICE_TYPE_LABELS[c.service_type] || c.service_type}</Badge></TableCell>
                        <TableCell><Badge variant="outline" className={STATUS_CONFIG[c.status]?.color || ""}><StatusIcon className="w-3 h-3 mr-1" />{STATUS_CONFIG[c.status]?.label || c.status}</Badge></TableCell>
                        <TableCell className="text-sm">{c.consultation_date ? format(new Date(c.consultation_date), "PPp") : <span className="text-muted-foreground">Not scheduled</span>}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{format(new Date(c.created_at), "PP")}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm" onClick={() => handleUpdateClick(c)}>Update</Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteTarget({ type: "consultation", id: c.id })}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="gbp">
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Business Name</TableHead><TableHead>Shop</TableHead><TableHead>Address</TableHead>
                    <TableHead>Phone</TableHead><TableHead>Category</TableHead><TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead><TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGbp.length === 0 ? (
                    <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No GBP submissions found</TableCell></TableRow>
                  ) : filteredGbp.map((g) => {
                    const StatusIcon = STATUS_CONFIG[g.status]?.icon || Clock;
                    return (
                      <TableRow key={g.id}>
                        <TableCell className="font-medium">{g.business_name || "—"}</TableCell>
                        <TableCell className="text-sm">{g.shops?.shop_name || "—"}</TableCell>
                        <TableCell className="text-sm max-w-[200px] truncate">{g.physical_address || "—"}</TableCell>
                        <TableCell className="text-sm">{g.phone_number || "—"}</TableCell>
                        <TableCell><Badge variant="secondary" className="text-xs">{g.primary_category || "—"}</Badge></TableCell>
                        <TableCell><Badge variant="outline" className={STATUS_CONFIG[g.status]?.color || ""}><StatusIcon className="w-3 h-3 mr-1" />{STATUS_CONFIG[g.status]?.label || g.status}</Badge></TableCell>
                        <TableCell className="text-sm text-muted-foreground">{format(new Date(g.created_at), "PP")}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setDetailGbp(g); setIsGbpDetailOpen(true); }}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => { setSelectedGbp(g); setGbpForm({ status: g.status, admin_notes: g.admin_notes || "" }); setIsGbpDialogOpen(true); }}>
                              Update
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteTarget({ type: "gbp", id: g.id })}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>

        {/* Consultation Update Dialog */}
        <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Consultation</DialogTitle>
              <DialogDescription>Update status and schedule for this request.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div><Label>Service</Label><p className="text-sm font-medium mt-1">{SERVICE_TYPE_LABELS[selectedConsultation?.service_type || ""] || selectedConsultation?.service_type}</p></div>
              <div><Label>Shop</Label><p className="text-sm font-medium mt-1">{selectedConsultation?.shops?.shop_name}</p></div>
              <div>
                <Label>Status</Label>
                <Select value={updateForm.status} onValueChange={(v) => setUpdateForm({ ...updateForm, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["pending", "scheduled", "in_progress", "completed", "cancelled"].map(s => <SelectItem key={s} value={s}>{STATUS_CONFIG[s]?.label || s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Date & Time</Label><Input type="datetime-local" value={updateForm.consultation_date} onChange={(e) => setUpdateForm({ ...updateForm, consultation_date: e.target.value })} /></div>
              <div><Label>Notes</Label><Textarea value={updateForm.consultation_notes} onChange={(e) => setUpdateForm({ ...updateForm, consultation_notes: e.target.value })} rows={3} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleUpdate} disabled={isSaving}>{isSaving ? "Saving..." : "Save"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* GBP Update Dialog */}
        <Dialog open={isGbpDialogOpen} onOpenChange={setIsGbpDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update GBP Submission</DialogTitle>
              <DialogDescription>Update status and add admin notes for {selectedGbp?.business_name || "this submission"}.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div><Label>Business</Label><p className="text-sm font-medium mt-1">{selectedGbp?.business_name}</p></div>
              <div><Label>Address</Label><p className="text-sm mt-1 text-muted-foreground">{selectedGbp?.physical_address || "Not provided"}</p></div>
              <div>
                <Label>Status</Label>
                <Select value={gbpForm.status} onValueChange={(v) => setGbpForm({ ...gbpForm, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["draft", "submitted", "in_progress", "completed"].map(s => <SelectItem key={s} value={s}>{STATUS_CONFIG[s]?.label || s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Admin Notes</Label><Textarea value={gbpForm.admin_notes} onChange={(e) => setGbpForm({ ...gbpForm, admin_notes: e.target.value })} rows={3} placeholder="Internal notes about this GBP setup..." /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsGbpDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleGbpUpdate} disabled={isSaving}>{isSaving ? "Saving..." : "Save"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Consultation Dialog */}
        <Dialog open={isCreateConsultationOpen} onOpenChange={setIsCreateConsultationOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Consultation</DialogTitle>
              <DialogDescription>Create a new marketing consultation record.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Shop</Label>
                <Select value={createForm.shop_id} onValueChange={(v) => setCreateForm({ ...createForm, shop_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select shop..." /></SelectTrigger>
                  <SelectContent>{shops.map(s => <SelectItem key={s.id} value={s.id}>{s.shop_name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Service Type</Label>
                <Select value={createForm.service_type} onValueChange={(v) => setCreateForm({ ...createForm, service_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(SERVICE_TYPE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Schedule (optional)</Label><Input type="datetime-local" value={createForm.consultation_date} onChange={(e) => setCreateForm({ ...createForm, consultation_date: e.target.value })} /></div>
              <div><Label>Notes</Label><Textarea value={createForm.consultation_notes} onChange={(e) => setCreateForm({ ...createForm, consultation_notes: e.target.value })} rows={3} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateConsultationOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateConsultation} disabled={isSaving}>{isSaving ? "Creating..." : "Create"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* GBP Detail View Dialog */}
        <Dialog open={isGbpDetailOpen} onOpenChange={setIsGbpDetailOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>GBP Submission Details</DialogTitle>
              <DialogDescription>{detailGbp?.business_name || "Business Profile"}</DialogDescription>
            </DialogHeader>
            {detailGbp && (
              <ScrollArea className="max-h-[60vh]">
                <div className="space-y-4 py-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label className="text-xs text-muted-foreground">Business Name</Label><p className="text-sm font-medium">{detailGbp.business_name || "—"}</p></div>
                    <div><Label className="text-xs text-muted-foreground">Shop</Label><p className="text-sm font-medium">{detailGbp.shops?.shop_name || "—"}</p></div>
                    <div><Label className="text-xs text-muted-foreground">Phone</Label><p className="text-sm">{detailGbp.phone_number || "—"}</p></div>
                    <div><Label className="text-xs text-muted-foreground">Category</Label><p className="text-sm">{detailGbp.primary_category || "—"}</p></div>
                    <div className="col-span-2"><Label className="text-xs text-muted-foreground">Address</Label><p className="text-sm">{detailGbp.physical_address || "—"}</p></div>
                    <div className="col-span-2"><Label className="text-xs text-muted-foreground">Description</Label><p className="text-sm text-muted-foreground">{detailGbp.business_description || "—"}</p></div>
                    {detailGbp.website_url && <div><Label className="text-xs text-muted-foreground">Website</Label><a href={detailGbp.website_url} target="_blank" rel="noopener" className="text-sm text-primary hover:underline flex items-center gap-1"><ExternalLink className="w-3 h-3" />{detailGbp.website_url}</a></div>}
                    {detailGbp.service_areas && <div><Label className="text-xs text-muted-foreground">Service Areas</Label><p className="text-sm">{detailGbp.service_areas}</p></div>}
                    {detailGbp.services_list && <div className="col-span-2"><Label className="text-xs text-muted-foreground">Services</Label><p className="text-sm">{detailGbp.services_list}</p></div>}
                    {detailGbp.attributes && detailGbp.attributes.length > 0 && (
                      <div className="col-span-2"><Label className="text-xs text-muted-foreground">Attributes</Label><div className="flex flex-wrap gap-1 mt-1">{detailGbp.attributes.map((a, i) => <Badge key={i} variant="secondary" className="text-xs">{a}</Badge>)}</div></div>
                    )}
                  </div>
                  {/* Photos */}
                  {(detailGbp.logo_url || detailGbp.cover_photo_url) && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Brand Images</Label>
                      <div className="flex gap-3 mt-2">
                        {detailGbp.logo_url && <img src={detailGbp.logo_url} alt="Logo" className="w-16 h-16 rounded-lg object-cover border" />}
                        {detailGbp.cover_photo_url && <img src={detailGbp.cover_photo_url} alt="Cover" className="h-16 rounded-lg object-cover border" />}
                      </div>
                    </div>
                  )}
                  {detailGbp.interior_photos && detailGbp.interior_photos.length > 0 && (
                    <div><Label className="text-xs text-muted-foreground">Interior Photos</Label><div className="flex gap-2 mt-2 flex-wrap">{detailGbp.interior_photos.map((url, i) => <img key={i} src={url} alt={`Interior ${i+1}`} className="w-20 h-20 rounded-lg object-cover border" />)}</div></div>
                  )}
                  {detailGbp.exterior_photos && detailGbp.exterior_photos.length > 0 && (
                    <div><Label className="text-xs text-muted-foreground">Exterior Photos</Label><div className="flex gap-2 mt-2 flex-wrap">{detailGbp.exterior_photos.map((url, i) => <img key={i} src={url} alt={`Exterior ${i+1}`} className="w-20 h-20 rounded-lg object-cover border" />)}</div></div>
                  )}
                  {detailGbp.verification_notes && (
                    <div><Label className="text-xs text-muted-foreground">Verification Notes</Label><p className="text-sm bg-muted/50 rounded-lg p-3 mt-1">{detailGbp.verification_notes}</p></div>
                  )}
                  {detailGbp.admin_notes && (
                    <div><Label className="text-xs text-muted-foreground">Admin Notes</Label><p className="text-sm bg-primary/5 rounded-lg p-3 mt-1">{detailGbp.admin_notes}</p></div>
                  )}
                </div>
              </ScrollArea>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsGbpDetailOpen(false)}>Close</Button>
              <Button onClick={() => { setIsGbpDetailOpen(false); if (detailGbp) { setSelectedGbp(detailGbp); setGbpForm({ status: detailGbp.status, admin_notes: detailGbp.admin_notes || "" }); setIsGbpDialogOpen(true); } }}>
                Edit Status
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {deleteTarget?.type === "consultation" ? "Consultation" : "GBP Submission"}?</AlertDialogTitle>
              <AlertDialogDescription>This action cannot be undone. The record will be permanently removed.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {isSaving ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}
