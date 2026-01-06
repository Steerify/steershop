import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { Search, Calendar as CalendarIcon, Filter, CheckCircle, XCircle, Clock, Users } from "lucide-react";
import { format, addDays } from "date-fns";
import { calculateSubscriptionStatus } from "@/utils/subscription";
import { cn } from "@/lib/utils";

interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
}

type FilterType = 'all' | 'shop_owners' | 'active' | 'trial' | 'expired';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isExtendDialogOpen, setIsExtendDialogOpen] = useState(false);
  const [isActivateDialogOpen, setIsActivateDialogOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [customDate, setCustomDate] = useState<Date | undefined>(undefined);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
    fetchPlans();
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

  const fetchPlans = async () => {
    const { data, error } = await supabase
      .from("subscription_plans")
      .select("id, name, slug")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (!error && data) {
      setPlans(data);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase());
    
    if (!matchesSearch) return false;

    const subStatus = calculateSubscriptionStatus(user);
    
    switch (filter) {
      case 'shop_owners':
        return user.role === 'shop_owner';
      case 'active':
        return subStatus.status === 'active';
      case 'trial':
        return subStatus.status === 'trial';
      case 'expired':
        return subStatus.status === 'expired';
      default:
        return true;
    }
  });

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
        description: `${selectedUser.email}'s subscription extended by ${days} days until ${format(newExpiry, "MMM dd, yyyy")}.`,
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

  const handleExtendToCustomDate = async () => {
    if (!selectedUser || !customDate) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_subscribed: true,
          subscription_expires_at: customDate.toISOString(),
        })
        .eq('id', selectedUser.id);

      if (error) throw error;

      toast({
        title: "Subscription Extended",
        description: `${selectedUser.email}'s subscription set to expire on ${format(customDate, "MMM dd, yyyy")}.`,
      });

      setIsExtendDialogOpen(false);
      setSelectedUser(null);
      setCustomDate(undefined);
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleActivateSubscription = async () => {
    if (!selectedUser) return;

    try {
      const updateData: any = {
        is_subscribed: true,
        subscription_expires_at: addDays(new Date(), 30).toISOString(),
      };

      if (selectedPlanId) {
        updateData.subscription_plan_id = selectedPlanId;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', selectedUser.id);

      if (error) throw error;

      const planName = plans.find(p => p.id === selectedPlanId)?.name || 'Basic';
      toast({
        title: "Subscription Activated",
        description: `${selectedUser.email} now has an active ${planName} subscription for 30 days.`,
      });

      setIsActivateDialogOpen(false);
      setSelectedUser(null);
      setSelectedPlanId("");
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getPlanName = (planId: string | null) => {
    if (!planId) return "—";
    const plan = plans.find(p => p.id === planId);
    return plan?.name || "Unknown";
  };

  const filterCounts = {
    all: users.length,
    shop_owners: users.filter(u => u.role === 'shop_owner').length,
    active: users.filter(u => calculateSubscriptionStatus(u).status === 'active').length,
    trial: users.filter(u => calculateSubscriptionStatus(u).status === 'trial').length,
    expired: users.filter(u => calculateSubscriptionStatus(u).status === 'expired').length,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Users Management</h1>
          <p className="text-muted-foreground">View and manage user subscriptions</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              <Users className="w-3 h-3 mr-1" />
              All ({filterCounts.all})
            </Button>
            <Button
              variant={filter === 'shop_owners' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('shop_owners')}
            >
              <Filter className="w-3 h-3 mr-1" />
              Shop Owners ({filterCounts.shop_owners})
            </Button>
            <Button
              variant={filter === 'active' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('active')}
              className={filter === 'active' ? '' : 'text-green-600 border-green-200 hover:bg-green-50'}
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              Active ({filterCounts.active})
            </Button>
            <Button
              variant={filter === 'trial' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('trial')}
              className={filter === 'trial' ? '' : 'text-amber-600 border-amber-200 hover:bg-amber-50'}
            >
              <Clock className="w-3 h-3 mr-1" />
              Trial ({filterCounts.trial})
            </Button>
            <Button
              variant={filter === 'expired' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('expired')}
              className={filter === 'expired' ? '' : 'text-red-600 border-red-200 hover:bg-red-50'}
            >
              <XCircle className="w-3 h-3 mr-1" />
              Expired ({filterCounts.expired})
            </Button>
          </div>
        </div>

        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
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
                      <span className="text-sm">{getPlanName(user.subscription_plan_id)}</span>
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
                      <div className="flex items-center gap-2">
                        {user.role === "shop_owner" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setIsExtendDialogOpen(true);
                              }}
                            >
                              <CalendarIcon className="w-3 h-3 mr-1" />
                              Extend
                            </Button>
                            {subStatus.status === 'expired' && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setIsActivateDialogOpen(true);
                                }}
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Activate
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Extend Subscription Dialog */}
        <Dialog open={isExtendDialogOpen} onOpenChange={setIsExtendDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Extend Subscription</DialogTitle>
              <DialogDescription>
                Extend subscription for {selectedUser?.email}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">Quick extend options:</p>
              <div className="grid grid-cols-2 gap-3">
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
              
              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground mb-3">Or set a custom expiry date:</p>
                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !customDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {customDate ? format(customDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={customDate}
                        onSelect={setCustomDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Button 
                    onClick={handleExtendToCustomDate} 
                    disabled={!customDate}
                  >
                    Set
                  </Button>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsExtendDialogOpen(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Activate Subscription Dialog */}
        <Dialog open={isActivateDialogOpen} onOpenChange={setIsActivateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Activate Subscription</DialogTitle>
              <DialogDescription>
                Activate subscription for {selectedUser?.email}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Plan</label>
                <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a subscription plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <p className="text-sm text-muted-foreground">
                This will activate a 30-day subscription starting today.
              </p>
            </div>
            
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsActivateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleActivateSubscription}>
                Activate Subscription
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}