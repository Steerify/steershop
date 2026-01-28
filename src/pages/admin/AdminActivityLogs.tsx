import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Activity, 
  Search, 
  RefreshCw, 
  Download,
  User,
  Store,
  Package,
  ShoppingCart,
  Calendar,
  LogIn,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  Eye,
  CreditCard,
  MessageSquare,
  Filter,
} from "lucide-react";
import { format } from "date-fns";
import activityLogService, { ActivityLog } from "@/services/activity-log.service";
import { toast } from "sonner";

const ACTION_ICONS: Record<string, any> = {
  create: Plus,
  update: Pencil,
  delete: Trash2,
  login: LogIn,
  logout: LogOut,
  view: Eye,
  payment: CreditCard,
  signup: User,
  approve: Activity,
  reject: Activity,
  export: Download,
};

const ACTION_COLORS: Record<string, string> = {
  create: "bg-green-500/10 text-green-600 border-green-500/20",
  update: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  delete: "bg-red-500/10 text-red-600 border-red-500/20",
  login: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  logout: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  view: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  payment: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  signup: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
};

const RESOURCE_ICONS: Record<string, any> = {
  shop: Store,
  product: Package,
  order: ShoppingCart,
  booking: Calendar,
  user: User,
  auth: LogIn,
  subscription: CreditCard,
  payment: CreditCard,
  feedback: MessageSquare,
  review: MessageSquare,
  course: Activity,
};

const AdminActivityLogs = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [resourceFilter, setResourceFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [page, actionFilter, resourceFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await activityLogService.getActivityLogs({
        page,
        limit: 50,
        action_type: actionFilter !== "all" ? actionFilter : undefined,
        resource_type: resourceFilter !== "all" ? resourceFilter : undefined,
        search: search || undefined,
      });
      
      if (response.success) {
        setLogs(response.data);
        setTotalPages(response.meta.totalPages);
      }
    } catch (error) {
      toast.error("Failed to fetch activity logs");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    const data = await activityLogService.getActivityStats(7);
    setStats(data);
  };

  const handleSearch = () => {
    setPage(1);
    fetchLogs();
  };

  const handleExport = () => {
    const csv = [
      ['Date', 'User', 'Action', 'Resource Type', 'Resource Name', 'Details'].join(','),
      ...logs.map(log => [
        format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss'),
        log.user_email || 'Anonymous',
        log.action_type,
        log.resource_type,
        log.resource_name || '',
        JSON.stringify(log.details || {}).replace(/,/g, ';'),
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Activity logs exported");
  };

  const ActionIcon = ({ action }: { action: string }) => {
    const Icon = ACTION_ICONS[action] || Activity;
    return <Icon className="w-4 h-4" />;
  };

  const ResourceIcon = ({ resource }: { resource: string }) => {
    const Icon = RESOURCE_ICONS[resource] || Activity;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold font-heading flex items-center gap-2">
              <Activity className="w-6 h-6 text-primary" />
              Activity Logs
            </h1>
            <p className="text-muted-foreground">Track all platform activities and user actions</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { setPage(1); fetchLogs(); fetchStats(); }}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-primary">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total Activities (7 days)</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">{stats.byAction?.create || 0}</div>
                <div className="text-sm text-muted-foreground">Items Created</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">{stats.byAction?.update || 0}</div>
                <div className="text-sm text-muted-foreground">Items Updated</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-purple-600">{stats.byAction?.login || 0}</div>
                <div className="text-sm text-muted-foreground">User Logins</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by email or resource name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="create">Create</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="logout">Logout</SelectItem>
                  <SelectItem value="signup">Signup</SelectItem>
                  <SelectItem value="payment">Payment</SelectItem>
                </SelectContent>
              </Select>
              <Select value={resourceFilter} onValueChange={setResourceFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Resource" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Resources</SelectItem>
                  <SelectItem value="shop">Shops</SelectItem>
                  <SelectItem value="product">Products</SelectItem>
                  <SelectItem value="order">Orders</SelectItem>
                  <SelectItem value="booking">Bookings</SelectItem>
                  <SelectItem value="user">Users</SelectItem>
                  <SelectItem value="auth">Auth</SelectItem>
                  <SelectItem value="payment">Payments</SelectItem>
                  <SelectItem value="subscription">Subscriptions</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSearch}>
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Activity Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ) : logs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No activity logs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="whitespace-nowrap">
                          <div className="text-sm font-medium">
                            {format(new Date(log.created_at), 'MMM d, yyyy')}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(log.created_at), 'HH:mm:ss')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm truncate max-w-[150px]">
                              {log.user_email || 'Anonymous'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${ACTION_COLORS[log.action_type] || 'bg-muted'} flex items-center gap-1 w-fit`}>
                            <ActionIcon action={log.action_type} />
                            {log.action_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <ResourceIcon resource={log.resource_type} />
                            <div>
                              <div className="text-sm font-medium capitalize">{log.resource_type}</div>
                              {log.resource_name && (
                                <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                                  {log.resource_name}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {log.details && Object.keys(log.details).length > 0 ? (
                            <div className="text-xs text-muted-foreground max-w-[200px] truncate">
                              {JSON.stringify(log.details)}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="py-2 px-4 text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminActivityLogs;
