import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Search, Calendar } from "lucide-react";
import { format, addDays } from "date-fns";
import { calculateSubscriptionStatus } from "@/utils/subscription";

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isExtendDialogOpen, setIsExtendDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error loading users", variant: "destructive" });
      return;
    }

    setUsers(data || []);
  };

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    user.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleExtendSubscription = async (days: number) => {
    if (!selectedUser) return;

    try {
      const currentExpiry = selectedUser.subscription_expires_at 
        ? new Date(selectedUser.subscription_expires_at)
        : new Date();
      
      const newExpiry = addDays(currentExpiry > new Date() ? currentExpiry : new Date(), days);

      const { error } = await supabase
        .from('profiles')
        .update({
          is_subscribed: true,
          subscription_expires_at: newExpiry.toISOString(),
        })
        .eq('id', selectedUser.id);

      if (error) throw error;

      toast({
        title: "Subscription Extended",
        description: `${selectedUser.email}'s subscription extended by ${days} days.`,
      });

      setIsExtendDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Users Management</h1>
          <p className="text-muted-foreground">View all registered users</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
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
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Subscription Status</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => {
                const subStatus = calculateSubscriptionStatus(user);
                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name || "N/A"}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === "shop_owner" ? "default" : "secondary"}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          subStatus.status === 'active' ? 'default' : 
                          subStatus.status === 'trial' ? 'outline' : 
                          'destructive'
                        }
                      >
                        {subStatus.status === 'active' ? 'Active' : 
                         subStatus.status === 'trial' ? 'Trial' : 
                         'Expired'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.subscription_expires_at ? (
                        <div className="text-sm">
                          {format(new Date(user.subscription_expires_at), "MMM dd, yyyy")}
                          <div className="text-xs text-muted-foreground">
                            {subStatus.daysRemaining > 0 
                              ? `${subStatus.daysRemaining} days left`
                              : 'Expired'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>{format(new Date(user.created_at), "MMM dd, yyyy")}</TableCell>
                    <TableCell>
                      {user.role === "shop_owner" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsExtendDialogOpen(true);
                          }}
                        >
                          <Calendar className="w-3 h-3 mr-1" />
                          Extend
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <Dialog open={isExtendDialogOpen} onOpenChange={setIsExtendDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Extend Subscription</DialogTitle>
              <DialogDescription>
                Extend subscription for {selectedUser?.email}
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <Button variant="outline" onClick={() => handleExtendSubscription(7)}>
                + 7 Days
              </Button>
              <Button variant="outline" onClick={() => handleExtendSubscription(30)}>
                + 30 Days
              </Button>
              <Button variant="outline" onClick={() => handleExtendSubscription(90)}>
                + 90 Days
              </Button>
              <Button variant="outline" onClick={() => handleExtendSubscription(365)}>
                + 1 Year
              </Button>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsExtendDialogOpen(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
