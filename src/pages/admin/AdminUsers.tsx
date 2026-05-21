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
import {
  Search, Calendar as CalendarIcon, CheckCircle, XCircle,
  Clock, Users, Store, MoreHorizontal, Shield, User,
  CreditCard, TrendingUp, AlertCircle
} from "lucide-react";
import { format, addDays } from "date-fns";
import { calculateSubscriptionStatus } from "@/utils/subscription";
import { cn } from "@/lib/utils";
import adminService from "@/services/admin.service";

type FilterType = 'all' | 'shop_owners' | 'active' | 'trial' | 'expired';

const STATUS_CONFIG = {
  active:  { label: 'Active',  icon: CheckCircle, className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  trial:   { label: 'Trial',   icon: Clock,        className: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  expired: { label: 'Expired', icon: XCircle,      className: 'bg-destructive/10 text-destructive border-destructive/20' },
  free:    { label: 'Free',    icon: AlertCircle,  className: 'bg-muted text-muted-foreground border-border' },
};

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isExtendDialogOpen, setIsExtendDialogOpen] = useState(false);
  const [isActivateDialogOpen, setIsActivateDialogOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [customDate, setCustomDate] = useState<Date | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
    fetchPlans();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    // Join subscription_plans so plan name is available directly
    const { data, error } = await supabase
      .from("profiles")
      .select("*, subscription_plans(id, name, slug)")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error loading users", variant: "destructive" });
    } else {
      setUsers(data || []);
    }
    setIsLoading(false);
  };

  const fetchPlans = async () => {
    const { data, error } = await supabase
      .from("subscription_plans")
      .select("id, name, slug")
      .eq("is_active", true)
      .order("display_order", { ascending: true });
    if (!error && data) setPlans(data);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase()) ||
      user.phone?.includes(search);
    if (!matchesSearch) return false;
    const subStatus = calculateSubscriptionStatus(user);
    switch (filter) {
      case 'shop_owners': return user.role === 'shop_owner';
      case 'active':  return subStatus.status === 'active';
      case 'trial':   return subStatus.status === 'trial';
      case 'expired': return subStatus.status === 'expired';
      default: return true;
    }
  });

  const filterCounts = {
    all:         users.length,
    shop_owners: users.filter(u => u.role === 'shop_owner').length,
    active:      users.filter(u => calculateSubscriptionStatus(u).status === 'active').length,
    trial:       users.filter(u => calculateSubscriptionStatus(u).status === 'trial').length,
    expired:     users.filter(u => calculateSubscriptionStatus(u).status === 'expired').length,
  };

  const handleExtendSubscription = async (days: number) => {
    if (!selectedUser) return;
    try {
      const currentExpiry = selectedUser.subscription_expires_at
        ? new Date(selectedUser.subscription_expires_at) : new Date();
      const newExpiry = addDays(currentExpiry > new Date() ? currentExpiry : new Date(), days);
      await adminService.extendSubscription(selectedUser.id, days);
      toast({ title: "Subscription Extended", description: `Extended by ${days} days until ${format(newExpiry, "MMM dd, yyyy")}.` });
      setIsExtendDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleExtendToCustomDate = async () => {
    if (!selectedUser || !customDate) return;
    try {
      await adminService.setSubscriptionDate(selectedUser.id, customDate);
      toast({ title: "Subscription Set", description: `Expires on ${format(customDate, "MMM dd, yyyy")}.` });
      setIsExtendDialogOpen(false);
      setSelectedUser(null);
      setCustomDate(undefined);
      fetchUsers();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleActivateSubscription = async () => {
    if (!selectedUser) return;
    try {
      const planName = plans.find(p => p.id === selectedPlanId)?.name || 'Basic';
      await adminService.activateSubscription(selectedUser.id, selectedPlanId || null, planName);
      toast({ title: "Subscription Activated", description: `${selectedUser.email} — ${planName} (30 days).` });
      setIsActivateDialogOpen(false);
      setSelectedUser(null);
      setSelectedPlanId("");
      fetchUsers();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const getPlanName = (user: any) => {
    // Use the joined data first, fall back to plans array lookup
    if (user.subscription_plans?.name) return user.subscription_plans.name;
    if (!user.subscription_plan_id) return "—";
    return plans.find(p => p.id === user.subscription_plan_id)?.name || "—";
  };

  const getStatusBadge = (profile: any) => {
    const { status } = calculateSubscriptionStatus(profile);
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.free;
    const Icon = cfg.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.className}`}>
        <Icon className="w-3 h-3" />
        {cfg.label}
      </span>
    );
  };

  const FILTER_TABS: { key: FilterType; label: string; icon: React.ElementType; color: string }[] = [
    { key: 'all',         label: 'All Users',   icon: Users,        color: 'text-foreground' },
    { key: 'shop_owners', label: 'Merchants',   icon: Store,        color: 'text-primary' },
    { key: 'active',      label: 'Active',      icon: CheckCircle,  color: 'text-emerald-600' },
    { key: 'trial',       label: 'Trial',       icon: Clock,        color: 'text-amber-600' },
    { key: 'expired',     label: 'Expired',     icon: XCircle,      color: 'text-destructive' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              User Management
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Manage accounts, subscriptions, and merchant access
            </p>
          </div>
        </div>

        {/* Stat Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {FILTER_TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = filter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={cn(
                  "relative flex flex-col items-start p-4 rounded-2xl border transition-all duration-200 text-left group",
                  isActive
                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                    : "bg-card border-border/60 hover:border-primary/30 hover:shadow-md"
                )}
              >
                <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center mb-2",
                  isActive ? "bg-white/20" : "bg-muted group-hover:bg-primary/10"
                )}>
                  <Icon className={cn("w-4 h-4", isActive ? "text-white" : tab.color)} />
                </div>
                <p className={cn("text-2xl font-extrabold leading-none mb-1", isActive ? "text-white" : "text-foreground")}>
                  {filterCounts[tab.key]}
                </p>
                <p className={cn("text-xs font-medium", isActive ? "text-white/80" : "text-muted-foreground")}>
                  {tab.label}
                </p>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email or phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-xl h-10"
          />
        </div>

        {/* Mobile Cards */}
        <div className="grid gap-3 md:hidden">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 rounded-2xl bg-muted animate-pulse" />
            ))
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-2xl bg-muted/30">
              <Users className="w-12 h-12 opacity-20 mx-auto mb-3" />
              <p className="font-medium">No users found</p>
            </div>
          ) : filteredUsers.map((user) => {
            const subStatus = calculateSubscriptionStatus(user);
            return (
              <div key={user.id} className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm hover:shadow-md transition-all">
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center border shrink-0">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-foreground truncate">{user.full_name || 'No Name'}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                    {getStatusBadge(user)}
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded-lg bg-muted border border-border/50 text-muted-foreground">
                      {user.role === 'shop_owner' ? '🏪 Merchant' : '👤 Customer'}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-muted border border-border/50 text-muted-foreground">
                      <CreditCard className="w-3 h-3 inline mr-1" />
                      {getPlanName(user)}
                    </span>
                    {user.subscription_expires_at && (
                      <span className="px-2 py-0.5 rounded-lg bg-muted border border-border/50 text-muted-foreground">
                        {subStatus.daysRemaining > 0 ? `${subStatus.daysRemaining}d left` : 'Expired'}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button size="sm" variant="outline" className="rounded-xl h-8 text-xs"
                      onClick={() => { setSelectedUser(user); setIsExtendDialogOpen(true); }}>
                      <CalendarIcon className="w-3 h-3 mr-1" /> Extend
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="outline" className="rounded-xl h-8 text-xs">
                          <MoreHorizontal className="w-3 h-3 mr-1" /> More
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-xl p-1">
                        <DropdownMenuItem onClick={() => { setSelectedUser(user); setIsExtendDialogOpen(true); }} className="rounded-lg">
                          <Clock className="w-4 h-4 mr-2" /> Extend Days
                        </DropdownMenuItem>
                        {user.role === "shop_owner" && (
                          <DropdownMenuItem onClick={() => { setSelectedUser(user); setIsActivateDialogOpen(true); }} className="rounded-lg">
                            <Shield className="w-4 h-4 mr-2" /> Change Plan
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => navigate(`/admin/shops?ownerId=${user.id}`)} className="rounded-lg">
                          <Store className="w-4 h-4 mr-2" /> View Shops
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block rounded-2xl border border-border/60 overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="font-bold text-xs uppercase tracking-wider">User</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider">Role</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider">Plan</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider">Status</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider">Expires</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider">Joined</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}><div className="h-4 bg-muted rounded animate-pulse" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    <Users className="w-10 h-10 opacity-20 mx-auto mb-2" />
                    <p>No users found</p>
                  </TableCell>
                </TableRow>
              ) : filteredUsers.map((user) => {
                const subStatus = calculateSubscriptionStatus(user);
                return (
                  <TableRow key={user.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center border shrink-0">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-foreground truncate max-w-[140px]">{user.full_name || 'No Name'}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[140px]">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'shop_owner' ? 'default' : 'secondary'} className="text-[10px] font-bold">
                        {user.role === 'shop_owner' ? '🏪 Merchant' : '👤 Customer'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">{getPlanName(user)}</span>
                    </TableCell>
                    <TableCell>{getStatusBadge(user)}</TableCell>
                    <TableCell>
                      {user.subscription_expires_at ? (
                        <div>
                          <p className="text-sm font-medium">{format(new Date(user.subscription_expires_at), "MMM dd, yyyy")}</p>
                          <p className={cn("text-xs", subStatus.daysRemaining > 0 ? "text-emerald-600" : "text-destructive")}>
                            {subStatus.daysRemaining > 0 ? `${subStatus.daysRemaining}d left` : 'Expired'}
                          </p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(user.created_at), "MMM dd, yyyy")}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Button variant="outline" size="sm" className="h-7 px-2 rounded-lg text-xs"
                          onClick={() => { setSelectedUser(user); setIsExtendDialogOpen(true); }}>
                          <CalendarIcon className="w-3 h-3 mr-1" /> Extend
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-lg">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-xl p-1">
                            {user.role === "shop_owner" && (
                              <>
                                <DropdownMenuItem onClick={() => { setSelectedUser(user); setIsActivateDialogOpen(true); }} className="rounded-lg">
                                  <Shield className="w-4 h-4 mr-2" /> Change Plan
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate(`/admin/shops?ownerId=${user.id}`)} className="rounded-lg">
                                  <Store className="w-4 h-4 mr-2" /> View Shops
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Extend Dialog */}
        <Dialog open={isExtendDialogOpen} onOpenChange={setIsExtendDialogOpen}>
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" /> Extend Subscription
              </DialogTitle>
              <DialogDescription>
                Extending for <strong>{selectedUser?.email}</strong>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <p className="text-sm text-muted-foreground font-medium">Quick extend:</p>
              <div className="grid grid-cols-2 gap-2">
                {[7, 30, 90, 365].map(days => (
                  <Button key={days} variant="outline" className="rounded-xl h-10"
                    onClick={() => handleExtendSubscription(days)}>
                    + {days === 365 ? '1 Year' : `${days} Days`}
                  </Button>
                ))}
              </div>
              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground mb-3">Or set a custom expiry date:</p>
                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("flex-1 justify-start text-left font-normal rounded-xl",
                        !customDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {customDate ? format(customDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={customDate} onSelect={setCustomDate}
                        disabled={(date) => date < new Date()} initialFocus />
                    </PopoverContent>
                  </Popover>
                  <Button onClick={handleExtendToCustomDate} disabled={!customDate} className="rounded-xl">Set</Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsExtendDialogOpen(false)}>Cancel</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Activate Dialog */}
        <Dialog open={isActivateDialogOpen} onOpenChange={setIsActivateDialogOpen}>
          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" /> Activate Subscription
              </DialogTitle>
              <DialogDescription>Activate for <strong>{selectedUser?.email}</strong></DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Select Plan</label>
                <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Choose a subscription plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>{plan.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-sm text-muted-foreground bg-muted/50 rounded-xl p-3">
                This will activate a <strong>30-day</strong> subscription starting today.
              </p>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsActivateDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleActivateSubscription} disabled={!selectedPlanId}>
                Activate Subscription
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}