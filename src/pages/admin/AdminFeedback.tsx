import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Star, Eye, EyeOff } from "lucide-react";

interface Feedback {
  id: string;
  customer_name: string;
  customer_email: string;
  feedback_type: string;
  subject: string;
  message: string;
  status: string;
  rating?: number;
  show_on_homepage?: boolean;
  created_at: string;
}

const AdminFeedback = () => {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [filteredFeedback, setFilteredFeedback] = useState<Feedback[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchFeedback();
  }, []);

  useEffect(() => {
    filterFeedback();
  }, [feedback, searchQuery, statusFilter, typeFilter]);

  const fetchFeedback = async () => {
    try {
      const { data, error } = await supabase
        .from("platform_feedback")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFeedback(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading feedback",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filterFeedback = () => {
    let filtered = [...feedback];

    if (searchQuery) {
      filtered = filtered.filter(
        (f) =>
          f.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.customer_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.subject.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((f) => f.status === statusFilter);
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((f) => f.feedback_type === typeFilter);
    }

    setFilteredFeedback(filtered);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("platform_feedback")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Status updated",
        description: "Feedback status has been updated successfully",
      });

      fetchFeedback();
    } catch (error: any) {
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleShowOnHomepage = async (id: string, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from("platform_feedback")
        .update({ show_on_homepage: !currentValue })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: currentValue ? "Removed from homepage" : "Added to homepage",
        description: currentValue 
          ? "This review will no longer appear on the homepage" 
          : "This review will now appear on the homepage",
      });

      fetchFeedback();
    } catch (error: any) {
      toast({
        title: "Error updating visibility",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "default",
      in_progress: "secondary",
      resolved: "outline",
      closed: "outline",
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {status.replace("_", " ")}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      complaint: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      upgrade_request: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      suggestion: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      other: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
    };

    return (
      <Badge className={colors[type] || colors.other}>
        {type.replace("_", " ")}
      </Badge>
    );
  };

  const renderStars = (rating?: number) => {
    if (!rating) return <span className="text-muted-foreground text-sm">No rating</span>;
    
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Platform Feedback</h1>
        <p className="text-muted-foreground">Manage customer complaints, suggestions, and upgrade requests</p>
      </div>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search by name, email, or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="complaint">Complaint</SelectItem>
              <SelectItem value="upgrade_request">Upgrade Request</SelectItem>
              <SelectItem value="suggestion">Suggestion</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead className="max-w-[200px]">Message</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Homepage</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFeedback.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground">
                    No feedback found
                  </TableCell>
                </TableRow>
              ) : (
                filteredFeedback.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-sm whitespace-nowrap">
                      {format(new Date(item.created_at), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{item.customer_name}</div>
                        <div className="text-muted-foreground text-xs">{item.customer_email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(item.feedback_type)}</TableCell>
                    <TableCell>{renderStars(item.rating)}</TableCell>
                    <TableCell className="font-medium max-w-[150px] truncate">{item.subject}</TableCell>
                    <TableCell className="max-w-[200px] truncate" title={item.message}>
                      {item.message}
                    </TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell>
                      {item.rating && item.rating >= 4 ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleShowOnHomepage(item.id, item.show_on_homepage || false)}
                          className={item.show_on_homepage ? "text-green-600" : "text-muted-foreground"}
                        >
                          {item.show_on_homepage ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={item.status}
                        onValueChange={(value) => updateStatus(item.id, value)}
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminFeedback;
