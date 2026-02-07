import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { payoutService } from "@/services/payout.service";
import { format, startOfMonth, startOfDay, subDays } from "date-fns";
import { DollarSign, TrendingUp, Calendar, Percent, BarChart3, Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { useToast } from "@/hooks/use-toast";

interface PlatformEarning {
  id: string;
  transaction_id: string | null;
  shop_id: string;
  order_id: string | null;
  gross_amount: number;
  fee_percentage: number;
  fee_amount: number;
  net_to_shop: number;
  created_at: string;
  shops?: { shop_name: string };
}

interface EarningsMetrics {
  totalEarnings: number;
  thisMonthEarnings: number;
  todayEarnings: number;
  last7DaysEarnings: number;
  transactionCount: number;
  averageFeePercentage: number;
}

export default function AdminPlatformEarnings() {
  const { toast } = useToast();
  const [earnings, setEarnings] = useState<PlatformEarning[]>([]);
  const [metrics, setMetrics] = useState<EarningsMetrics>({
    totalEarnings: 0, thisMonthEarnings: 0, todayEarnings: 0,
    last7DaysEarnings: 0, transactionCount: 0, averageFeePercentage: 2.5,
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingPayouts, setPendingPayouts] = useState<any[]>([]);
  const [processingPayoutId, setProcessingPayoutId] = useState<string | null>(null);

  useEffect(() => {
    fetchEarnings();
    fetchPendingPayouts();
  }, []);

  const fetchPendingPayouts = async () => {
    try {
      const data = await payoutService.getAllPendingPayouts();
      setPendingPayouts(data);
    } catch (error) {
      console.error("Error fetching payouts:", error);
    }
  };

  const handlePayoutAction = async (payoutId: string, status: 'completed' | 'failed', notes?: string) => {
    setProcessingPayoutId(payoutId);
    try {
      await payoutService.updatePayoutStatus(payoutId, status, notes);
      toast({
        title: status === 'completed' ? "Payout Approved ✅" : "Payout Rejected",
        description: status === 'completed' ? "The payout has been marked as completed." : "The payout request was rejected.",
      });
      await fetchPendingPayouts();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setProcessingPayoutId(null);
    }
  };

  const fetchEarnings = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("platform_earnings")
        .select(`*, shops:shop_id (shop_name)`)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      const earningsData = (data || []) as unknown as PlatformEarning[];
      setEarnings(earningsData);

      const now = new Date();
      const monthStart = startOfMonth(now);
      const todayStart = startOfDay(now);
      const last7Days = subDays(now, 7);

      const totalEarnings = earningsData.reduce((sum, e) => sum + Number(e.fee_amount), 0);
      const thisMonthEarnings = earningsData.filter(e => new Date(e.created_at) >= monthStart).reduce((sum, e) => sum + Number(e.fee_amount), 0);
      const todayEarnings = earningsData.filter(e => new Date(e.created_at) >= todayStart).reduce((sum, e) => sum + Number(e.fee_amount), 0);
      const last7DaysEarnings = earningsData.filter(e => new Date(e.created_at) >= last7Days).reduce((sum, e) => sum + Number(e.fee_amount), 0);
      const avgFee = earningsData.length > 0 ? earningsData.reduce((sum, e) => sum + Number(e.fee_percentage), 0) / earningsData.length : 2.5;

      setMetrics({ totalEarnings, thisMonthEarnings, todayEarnings, last7DaysEarnings, transactionCount: earningsData.length, averageFeePercentage: avgFee });

      const chartDays: { [key: string]: number } = {};
      for (let i = 6; i >= 0; i--) {
        chartDays[format(subDays(now, i), "MMM dd")] = 0;
      }
      earningsData.filter(e => new Date(e.created_at) >= last7Days).forEach(e => {
        const date = format(new Date(e.created_at), "MMM dd");
        if (chartDays[date] !== undefined) chartDays[date] += Number(e.fee_amount);
      });
      setChartData(Object.entries(chartDays).map(([date, amount]) => ({ date, earnings: amount })));
    } catch (error) {
      console.error("Error fetching platform earnings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => `₦${amount.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Platform Earnings & Payouts</h1>
          <p className="text-muted-foreground">Track revenue from transaction fees (2.5% on Paystack payments only)</p>
        </div>

        {/* Metrics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{formatCurrency(metrics.totalEarnings)}</div>
              <p className="text-xs text-muted-foreground">All time platform revenue</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(metrics.thisMonthEarnings)}</div>
              <p className="text-xs text-muted-foreground">{format(new Date(), "MMMM yyyy")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{pendingPayouts.length}</div>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Transactions</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.transactionCount}</div>
              <p className="text-xs text-muted-foreground">Avg {metrics.averageFeePercentage.toFixed(1)}% fee</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="earnings" className="space-y-4">
          <TabsList>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            <TabsTrigger value="payouts">
              Payout Requests
              {pendingPayouts.length > 0 && (
                <Badge variant="destructive" className="ml-2 text-xs">{pendingPayouts.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="earnings" className="space-y-4">
            {/* Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" /> Last 7 Days Earnings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" tickFormatter={(v) => `₦${v.toLocaleString()}`} />
                      <Tooltip formatter={(value: number) => [formatCurrency(value), "Earnings"]} contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                      <Bar dataKey="earnings" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Transactions Table */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Platform fee breakdown per Paystack order</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                ) : earnings.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No earnings yet</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Shop</TableHead>
                        <TableHead className="text-right">Gross</TableHead>
                        <TableHead className="text-right">Fee %</TableHead>
                        <TableHead className="text-right">Platform Fee</TableHead>
                        <TableHead className="text-right">Net to Shop</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {earnings.map((e) => (
                        <TableRow key={e.id}>
                          <TableCell className="text-sm">{format(new Date(e.created_at), "MMM dd, yyyy HH:mm")}</TableCell>
                          <TableCell className="font-medium">{e.shops?.shop_name || "Unknown"}</TableCell>
                          <TableCell className="text-right">{formatCurrency(Number(e.gross_amount))}</TableCell>
                          <TableCell className="text-right"><Badge variant="secondary">{Number(e.fee_percentage).toFixed(1)}%</Badge></TableCell>
                          <TableCell className="text-right font-medium text-primary">{formatCurrency(Number(e.fee_amount))}</TableCell>
                          <TableCell className="text-right text-muted-foreground">{formatCurrency(Number(e.net_to_shop))}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payouts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payout Requests</CardTitle>
                <CardDescription>Review and process shop owner withdrawal requests (Paystack payments only)</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingPayouts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No pending payout requests</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Shop</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Bank</TableHead>
                        <TableHead>Account</TableHead>
                        <TableHead>Requested</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingPayouts.map((payout) => (
                        <TableRow key={payout.id}>
                          <TableCell className="font-medium">{(payout.shops as any)?.shop_name || "Unknown"}</TableCell>
                          <TableCell className="font-bold text-primary">{formatCurrency(Number(payout.amount))}</TableCell>
                          <TableCell>{payout.bank_name}</TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm">{payout.account_name}</p>
                              <p className="text-xs text-muted-foreground">{payout.account_number}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{format(new Date(payout.requested_at), "MMM dd, yyyy")}</TableCell>
                          <TableCell>
                            <Badge variant={payout.status === 'pending' ? 'secondary' : 'outline'}>
                              {payout.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handlePayoutAction(payout.id, 'completed')}
                                disabled={processingPayoutId === payout.id}
                              >
                                {processingPayoutId === payout.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3 mr-1" />}
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handlePayoutAction(payout.id, 'failed', 'Rejected by admin')}
                                disabled={processingPayoutId === payout.id}
                              >
                                <XCircle className="w-3 h-3 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
