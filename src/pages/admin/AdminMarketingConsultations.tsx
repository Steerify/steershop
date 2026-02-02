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
  RefreshCw, 
  Megaphone,
  Calendar,
  Phone,
  Mail,
  Store,
  ExternalLink,
  CheckCircle,
  Clock,
  XCircle,
  PlayCircle
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

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
  shops: {
    shop_name: string;
    owner_id: string;
    whatsapp_number: string | null;
  } | null;
  owner?: {
    full_name: string | null;
    email: string;
    phone: string | null;
  } | null;
}

const SERVICE_TYPE_LABELS: Record<string, string> = {
  youtube_ads: "YouTube Ads",
  google_ads: "Google Ads",
  consultation: "General Consultation",
  seo: "SEO Optimization",
  google_my_business: "Google My Business",
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-700 border-yellow-300", icon: Clock },
  scheduled: { label: "Scheduled", color: "bg-blue-100 text-blue-700 border-blue-300", icon: Calendar },
  in_progress: { label: "In Progress", color: "bg-purple-100 text-purple-700 border-purple-300", icon: PlayCircle },
  completed: { label: "Completed", color: "bg-green-100 text-green-700 border-green-300", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700 border-red-300", icon: XCircle },
};

export default function AdminMarketingConsultations() {
  const [consultations, setConsultations] = useState<MarketingService[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedConsultation, setSelectedConsultation] = useState<MarketingService | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    status: "",
    consultation_date: "",
    consultation_notes: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    setIsLoading(true);
    try {
      // Fetch marketing services with shop info
      const { data: services, error } = await supabase
        .from("marketing_services")
        .select(`
          *,
          shops(shop_name, owner_id, whatsapp_number)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch owner profiles separately
      const ownerIds = services?.map(s => s.shops?.owner_id).filter(Boolean) || [];
      let profiles: any[] = [];
      
      if (ownerIds.length > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, full_name, email, phone")
          .in("id", ownerIds);
        profiles = profilesData || [];
      }

      // Combine data
      const combined = services?.map(service => ({
        ...service,
        owner: profiles.find(p => p.id === service.shops?.owner_id) || null,
      })) || [];

      setConsultations(combined);
    } catch (error: any) {
      console.error("Error fetching consultations:", error);
      toast({
        title: "Error loading consultations",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateClick = (consultation: MarketingService) => {
    setSelectedConsultation(consultation);
    setUpdateForm({
      status: consultation.status,
      consultation_date: consultation.consultation_date || "",
      consultation_notes: consultation.consultation_notes || "",
    });
    setIsUpdateDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedConsultation) return;
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from("marketing_services")
        .update({
          status: updateForm.status,
          consultation_date: updateForm.consultation_date || null,
          consultation_notes: updateForm.consultation_notes || null,
        })
        .eq("id", selectedConsultation.id);

      if (error) throw error;

      toast({ title: "Consultation updated successfully" });
      setIsUpdateDialogOpen(false);
      fetchConsultations();
    } catch (error: any) {
      toast({
        title: "Error updating consultation",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const filteredConsultations = consultations.filter(c =>
    c.shops?.shop_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.owner?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.owner?.email?.toLowerCase().includes(search.toLowerCase()) ||
    SERVICE_TYPE_LABELS[c.service_type]?.toLowerCase().includes(search.toLowerCase())
  );

  const pendingCount = consultations.filter(c => c.status === "pending").length;
  const scheduledCount = consultations.filter(c => c.status === "scheduled").length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Marketing Consultations
            </h1>
            <p className="text-muted-foreground">
              Manage marketing service requests from shop owners
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchConsultations}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Badge variant="outline" className="px-3 py-1 bg-yellow-500/10 border-yellow-500/30 text-yellow-600">
              <Clock className="w-4 h-4 mr-1" />
              {pendingCount} Pending
            </Badge>
            <Badge variant="outline" className="px-3 py-1 bg-blue-500/10 border-blue-500/30 text-blue-600">
              <Calendar className="w-4 h-4 mr-1" />
              {scheduledCount} Scheduled
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by shop, owner, or service type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Shop</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Service Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Scheduled Date</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : filteredConsultations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    <Megaphone className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    No marketing consultation requests found
                  </TableCell>
                </TableRow>
              ) : (
                filteredConsultations.map((consultation) => {
                  const StatusIcon = STATUS_CONFIG[consultation.status]?.icon || Clock;
                  return (
                    <TableRow key={consultation.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Store className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">
                            {consultation.shops?.shop_name || "Unknown Shop"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {consultation.owner?.full_name || "Unknown"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 text-xs">
                          {consultation.owner?.email && (
                            <a 
                              href={`mailto:${consultation.owner.email}`}
                              className="flex items-center gap-1 text-primary hover:underline"
                            >
                              <Mail className="w-3 h-3" />
                              {consultation.owner.email}
                            </a>
                          )}
                          {(consultation.shops?.whatsapp_number || consultation.owner?.phone) && (
                            <a 
                              href={`tel:${consultation.shops?.whatsapp_number || consultation.owner?.phone}`}
                              className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
                            >
                              <Phone className="w-3 h-3" />
                              {consultation.shops?.whatsapp_number || consultation.owner?.phone}
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-medium">
                          {SERVICE_TYPE_LABELS[consultation.service_type] || consultation.service_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={STATUS_CONFIG[consultation.status]?.color || ""}
                        >
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {STATUS_CONFIG[consultation.status]?.label || consultation.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {consultation.consultation_date ? (
                          <span className="text-sm">
                            {format(new Date(consultation.consultation_date), "PPp")}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">Not scheduled</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(consultation.created_at), "PP")}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateClick(consultation)}
                        >
                          Update
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Update Dialog */}
        <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Consultation</DialogTitle>
              <DialogDescription>
                Update the status and schedule for this marketing consultation request.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Service Type</Label>
                <p className="text-sm font-medium mt-1">
                  {SERVICE_TYPE_LABELS[selectedConsultation?.service_type || ""] || selectedConsultation?.service_type}
                </p>
              </div>
              <div>
                <Label>Shop</Label>
                <p className="text-sm font-medium mt-1">
                  {selectedConsultation?.shops?.shop_name}
                </p>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={updateForm.status}
                  onValueChange={(value) => setUpdateForm({ ...updateForm, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="date">Consultation Date & Time</Label>
                <Input
                  id="date"
                  type="datetime-local"
                  value={updateForm.consultation_date}
                  onChange={(e) => setUpdateForm({ ...updateForm, consultation_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={updateForm.consultation_notes}
                  onChange={(e) => setUpdateForm({ ...updateForm, consultation_notes: e.target.value })}
                  placeholder="Add any notes about this consultation..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
