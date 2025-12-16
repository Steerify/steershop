import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Search, Eye, MoreHorizontal, Loader2, Package, CreditCard, Clock, CheckCircle, XCircle, Truck, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AdirePattern } from "@/components/patterns/AdirePattern";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [newStatus, setNewStatus] = useState("");
  const [newPaymentStatus, setNewPaymentStatus] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*, shops(shop_name)")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error loading orders", variant: "destructive" });
      return;
    }

    setOrders(data || []);
    setIsLoading(false);
  };

  const fetchOrderItems = async (orderId: string) => {
    const { data, error } = await supabase
      .from("order_items")
      .select("*, products(name, image_url)")
      .eq("order_id", orderId);

    if (error) {
      toast({ title: "Error loading order items", variant: "destructive" });
      return;
    }

    setOrderItems(data || []);
  };

  const handleViewDetails = async (order: any) => {
    setSelectedOrder(order);
    await fetchOrderItems(order.id);
    setDetailsDialogOpen(true);
  };

  const handleUpdateStatus = (order: any) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setStatusDialogOpen(true);
  };

  const handleUpdatePayment = (order: any) => {
    setSelectedOrder(order);
    setNewPaymentStatus(order.payment_status);
    setPaymentDialogOpen(true);
  };

  const confirmStatusUpdate = async () => {
    if (!selectedOrder || !newStatus) return;

    const updateData: any = { status: newStatus };
    
    // Add timestamp based on status
    const timestampFields: Record<string, string> = {
      confirmed: 'confirmed_at',
      processing: 'processing_at',
      out_for_delivery: 'out_for_delivery_at',
      delivered: 'delivered_at',
      completed: 'completed_at',
      cancelled: 'cancelled_at'
    };

    if (timestampFields[newStatus]) {
      updateData[timestampFields[newStatus]] = new Date().toISOString();
    }

    const { error } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", selectedOrder.id);

    if (error) {
      toast({ title: "Error updating status", variant: "destructive" });
      return;
    }

    toast({ title: `Order status updated to ${newStatus}` });
    setStatusDialogOpen(false);
    fetchOrders();
  };

  const confirmPaymentUpdate = async () => {
    if (!selectedOrder || !newPaymentStatus) return;

    const updateData: any = { payment_status: newPaymentStatus };
    
    if (newPaymentStatus === "paid") {
      updateData.paid_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", selectedOrder.id);

    if (error) {
      toast({ title: "Error updating payment status", variant: "destructive" });
      return;
    }

    toast({ title: `Payment status updated to ${newPaymentStatus}` });
    setPaymentDialogOpen(false);
    fetchOrders();
  };

  const filteredOrders = orders.filter(order =>
    order.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
    order.shops?.shop_name?.toLowerCase().includes(search.toLowerCase()) ||
    order.id.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status: string): "default" | "destructive" | "outline" | "secondary" => {
    const colors: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
      pending: "secondary",
      awaiting_approval: "secondary",
      confirmed: "default",
      processing: "default",
      out_for_delivery: "default",
      delivered: "default",
      completed: "default",
      cancelled: "destructive",
    };
    return colors[status] || "secondary";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
      case 'awaiting_approval':
        return <Clock className="w-3 h-3 mr-1" />;
      case 'confirmed':
      case 'processing':
        return <Package className="w-3 h-3 mr-1" />;
      case 'out_for_delivery':
        return <Truck className="w-3 h-3 mr-1" />;
      case 'delivered':
      case 'completed':
        return <CheckCircle className="w-3 h-3 mr-1" />;
      case 'cancelled':
        return <XCircle className="w-3 h-3 mr-1" />;
      default:
        return null;
    }
  };

  const pendingCount = orders.filter(o => ['pending', 'awaiting_approval'].includes(o.status)).length;
  const completedCount = orders.filter(o => ['delivered', 'completed'].includes(o.status)).length;

  return (
    <AdminLayout>
      <div className="space-y-6 relative">
        <AdirePattern variant="dots" className="absolute inset-0 opacity-5 pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-heading font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Orders Management
              </h1>
              <p className="text-muted-foreground">View and manage all orders on the platform</p>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="px-3 py-1 bg-yellow-500/10 border-yellow-500/30 text-yellow-600">
                <Clock className="w-4 h-4 mr-1" />
                {pendingCount} Pending
              </Badge>
              <Badge variant="outline" className="px-3 py-1 bg-green-500/10 border-green-500/30 text-green-600">
                <CheckCircle className="w-4 h-4 mr-1" />
                {completedCount} Completed
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search orders, customers, or shops..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 border-primary/20"
              />
            </div>
          </div>

          <div className="border rounded-lg border-primary/10 bg-card/50 backdrop-blur overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-muted/50">
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Shop</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                        No orders found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => (
                      <TableRow key={order.id} className="hover:bg-muted/30">
                        <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}...</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{order.customer_name || "N/A"}</p>
                            <p className="text-xs text-muted-foreground">{order.customer_email || ""}</p>
                          </div>
                        </TableCell>
                        <TableCell>{order.shops?.shop_name || "N/A"}</TableCell>
                        <TableCell className="font-semibold text-primary">₦{Number(order.total_amount).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(order.status)} className="flex items-center w-fit">
                            {getStatusIcon(order.status)}
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={order.payment_status === "paid" ? "default" : "secondary"} className={order.payment_status === "paid" ? "bg-green-600" : ""}>
                            <CreditCard className="w-3 h-3 mr-1" />
                            {order.payment_status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(order.created_at), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewDetails(order)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleUpdateStatus(order)}>
                                <Package className="w-4 h-4 mr-2" />
                                Update Status
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdatePayment(order)}>
                                <DollarSign className="w-4 h-4 mr-2" />
                                Update Payment
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </div>

        {/* Order Details Dialog */}
        <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
              <DialogDescription>
                Order #{selectedOrder?.id.slice(0, 8)}
              </DialogDescription>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-6">
                {/* Customer Info */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Customer</p>
                    <p className="font-medium">{selectedOrder.customer_name}</p>
                    <p className="text-sm">{selectedOrder.customer_email}</p>
                    <p className="text-sm">{selectedOrder.customer_phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Delivery Address</p>
                    <p className="font-medium">{selectedOrder.delivery_address || "N/A"}</p>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="font-medium mb-2">Items</h4>
                  <ScrollArea className="h-48 rounded-lg border">
                    <div className="p-4 space-y-3">
                      {orderItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between gap-4 p-2 bg-muted/30 rounded">
                          <div className="flex items-center gap-3">
                            {item.products?.image_url ? (
                              <img src={item.products.image_url} alt="" className="w-10 h-10 rounded object-cover" />
                            ) : (
                              <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                                <Package className="w-5 h-5 text-muted-foreground" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium">{item.products?.name || "Unknown"}</p>
                              <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                            </div>
                          </div>
                          <p className="font-semibold">₦{Number(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {/* Summary */}
                <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg">
                  <span className="font-medium">Total Amount</span>
                  <span className="text-xl font-bold text-primary">₦{Number(selectedOrder.total_amount).toLocaleString()}</span>
                </div>

                {/* Timestamps */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Created</p>
                    <p>{format(new Date(selectedOrder.created_at), "PPpp")}</p>
                  </div>
                  {selectedOrder.paid_at && (
                    <div>
                      <p className="text-muted-foreground">Paid At</p>
                      <p>{format(new Date(selectedOrder.paid_at), "PPpp")}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Update Status Dialog */}
        <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Order Status</DialogTitle>
              <DialogDescription>
                Change the status for order #{selectedOrder?.id.slice(0, 8)}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>New Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="awaiting_approval">Awaiting Approval</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
              <Button onClick={confirmStatusUpdate}>Update Status</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Update Payment Dialog */}
        <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Payment Status</DialogTitle>
              <DialogDescription>
                Change the payment status for order #{selectedOrder?.id.slice(0, 8)}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Payment Status</Label>
                <Select value={newPaymentStatus} onValueChange={setNewPaymentStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
              <Button onClick={confirmPaymentUpdate}>Update Payment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
