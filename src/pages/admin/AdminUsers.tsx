import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Search, Calendar as CalendarIcon, Filter, CheckCircle, XCircle, Clock, Users, Phone, Store, MoreHorizontal, Shield, User } from "lucide-react";
import { format, addDays } from "date-fns";
import { calculateSubscriptionStatus } from "@/utils/subscription";
import { cn } from "@/lib/utils";

interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
}

type FilterType = 'all' | 'shop_owners' | 'active' | 'trial' | 'expired';

import adminService from "@/services/admin.service";

export default function AdminUsers() {
  const navigate = useNavigate();
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
      
      const previousExpiry = selectedUser.subscription_expires_at;
      const newExpiry = addDays(currentExpiry > new Date() ? currentExpiry : new Date(), days);

      await adminService.extendSubscription(selectedUser.id, days);

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
      await adminService.setSubscriptionDate(selectedUser.id, customDate);

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
      const newExpiry = addDays(new Date(), 30);
      const planName = plans.find(p => p.id === selectedPlanId)?.name || 'Basic';

      await adminService.activateSubscription(selectedUser.id, selectedPlanId || null, planName);

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

  const getSubscriptionBadge = (profile: any) => {
    const status = calculateSubscriptionStatus(profile);
    
    switch (status.status) {
      case 'active':
        return <Badge className="bg-green-600 text-[10px] uppercase tracking-wider font-bold">Active</Badge>;
      case 'trial':
        return <Badge className="bg-[hsl(42,90%,55%)] text-white text-[10px] uppercase tracking-wider font-bold">Trial</Badge>;
      case 'expired':
        return <Badge variant="destructive" className="text-[10px] uppercase tracking-wider font-bold">Expired</Badge>;
      default:
        return <Badge variant="secondary" className="text-[10px] uppercase tracking-wider font-bold">None</Badge>;
    }
  };

  const handleViewShops = (userId: string) => {
    navigate(`/admin/shops?ownerId=${userId}`);
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
              className={filter === 'active' ? '' : 'text-accent border-accent/30 hover:bg-accent/10'}
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              Active ({filterCounts.active})
            </Button>
            <Button
              variant={filter === 'trial' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('trial')}
              className={filter === 'trial' ? '' : 'text-[hsl(42,70%,35%)] border-[hsl(42,90%,55%)]/30 hover:bg-[hsl(42,90%,55%)]/10'}
            >
              <Clock className="w-3 h-3 mr-1" />
              Trial ({filterCounts.trial})
            </Button>
            <Button
              variant={filter === 'expired' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('expired')}
              className={filter === 'expired' ? '' : 'text-destructive border-destructive/30 hover:bg-destructive/10'}
            >
              <XCircle className="w-3 h-3 mr-1" />
              Expired ({filterCounts.expired})
            </Button>
          </div>
        </div>

        {/* Mobile View: Cards */}
        <div className="grid gap-4 md:hidden">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-2xl bg-muted/30">
              <Users className="w-12 h-12 opacity-20 mx-auto mb-3" />
              <p className="font-medium">No users found</p>
            </div>
          ) : (
            filteredUsers.map((user) => {
              const subStatus = calculateSubscriptionStatus(user);
              return (
                <div key={user.id} className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm hover:shadow-md transition-all">
                  <div className="p-4 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center border shadow-sm shrink-0">
                          <User className="w-6 h-6 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-foreground truncate">{user.full_name || 'No Name'}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                      <div className="shrink-0">
                        {getSubscriptionBadge(user)}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-[10px] font-medium bg-muted/50 border-border/50 gap-1.5">
                        <CalendarIcon className="w-3 h-3" />
                        Joined {format(new Date(user.created_at), "MMM dd, yyyy")}
                      </Badge>
                      {user.phone && (
                        <Badge variant="outline" className="text-[10px] font-medium bg-muted/50 border-border/50 gap-1.5">
                          <Phone className="w-3 h-3" />
                          {user.phone}
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full rounded-xl font-semibold h-9 gap-1.5"
                        onClick={() => {
                          setSelectedUser(user);
                          setIsExtendDialogOpen(true);
                        }}
                      >
                        <CalendarIcon className="w-4 h-4" />
                        Extend
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="outline" className="w-full rounded-xl font-semibold h-9 gap-1.5">
                            <MoreHorizontal className="w-4 h-4" />
                            Manage
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 rounded-xl p-1 shadow-xl border-primary/10">
                          <DropdownMenuItem onClick={() => {
                            setSelectedUser(user);
                            setIsExtendDialogOpen(true);
                          }} className="rounded-lg py-2.5">
                            <Clock className="w-4 h-4 mr-2" /> Extend Days
                          </DropdownMenuItem>
                          {user.role === "shop_owner" && (
                            <DropdownMenuItem onClick={() => {
                              setSelectedUser(user);
                              setIsActivateDialogOpen(true);
                            }} className="rounded-lg py-2.5">
                              <Shield className="w-4 h-4 mr-2" /> Change Plan
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block border rounded-lg overflow-hidden">
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