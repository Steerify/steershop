import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, startOfDay, subDays } from "date-fns";
import { DollarSign, TrendingUp, Calendar, Percent, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";

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
  shops?: {
    shop_name: string;
  };
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
  const [earnings, setEarnings] = useState<PlatformEarning[]>([]);
  const [metrics, setMetrics] = useState<EarningsMetrics>({
    totalEarnings: 0,
    thisMonthEarnings: 0,
    todayEarnings: 0,
    last7DaysEarnings: 0,
    transactionCount: 0,
    averageFeePercentage: 2.5,
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      setIsLoading(true);

      // Fetch platform earnings with shop data
      const { data, error } = await supabase
        .from("platform_earnings")
        .select(`
          *,
          shops:shop_id (shop_name)
        `)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      const earningsData = (data || []) as unknown as PlatformEarning[];
      setEarnings(earningsData);

      // Calculate metrics
      const now = new Date();
      const monthStart = startOfMonth(now);
      const todayStart = startOfDay(now);
      const last7Days = subDays(now, 7);

      const totalEarnings = earningsData.reduce((sum, e) => sum + Number(e.fee_amount), 0);
      const thisMonthEarnings = earningsData
        .filter(e => new Date(e.created_at) >= monthStart)
        .reduce((sum, e) => sum + Number(e.fee_amount), 0);
      const todayEarnings = earningsData
        .filter(e => new Date(e.created_at) >= todayStart)
        .reduce((sum, e) => sum + Number(e.fee_amount), 0);
      const last7DaysEarnings = earningsData
        .filter(e => new Date(e.created_at) >= last7Days)
        .reduce((sum, e) => sum + Number(e.fee_amount), 0);

      const avgFee = earningsData.length > 0
        ? earningsData.reduce((sum, e) => sum + Number(e.fee_percentage), 0) / earningsData.length
        : 2.5;

      setMetrics({
        totalEarnings,
        thisMonthEarnings,
        todayEarnings,
        last7DaysEarnings,
        transactionCount: earningsData.length,
        averageFeePercentage: avgFee,
      });

      // Generate chart data for last 7 days
      const chartDays: { [key: string]: number } = {};
      for (let i = 6; i >= 0; i--) {
        const date = format(subDays(now, i), "MMM dd");
        chartDays[date] = 0;
      }

      earningsData
        .filter(e => new Date(e.created_at) >= last7Days)
        .forEach(e => {
          const date = format(new Date(e.created_at), "MMM dd");
          if (chartDays[date] !== undefined) {
            chartDays[date] += Number(e.fee_amount);
          }
        });

      setChartData(
        Object.entries(chartDays).map(([date, amount]) => ({ date, earnings: amount }))
      );
    } catch (error) {
      console.error("Error fetching platform earnings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Platform Earnings</h1>
          <p className="text-muted-foreground">Track revenue from transaction fees (2.5%)</p>
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
              <CardTitle className="text-sm font-medium">Today</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(metrics.todayEarnings)}</div>
              <p className="text-xs text-muted-foreground">{format(new Date(), "MMM dd, yyyy")}</p>
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

        {/* Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Last 7 Days Earnings
            </CardTitle>
            <CardDescription>Daily platform fee revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={(v) => `₦${v.toLocaleString()}`} />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), "Earnings"]}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="earnings" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Platform fee breakdown per order</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : earnings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No earnings yet</p>
                <p className="text-sm">Platform fees will appear here when orders are paid</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Shop</TableHead>
                    <TableHead className="text-right">Gross Amount</TableHead>
                    <TableHead className="text-right">Fee %</TableHead>
                    <TableHead className="text-right">Platform Fee</TableHead>
                    <TableHead className="text-right">Net to Shop</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {earnings.map((earning) => (
                    <TableRow key={earning.id}>
                      <TableCell className="text-sm">
                        {format(new Date(earning.created_at), "MMM dd, yyyy HH:mm")}
                      </TableCell>
                      <TableCell className="font-medium">
                        {earning.shops?.shop_name || "Unknown Shop"}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(Number(earning.gross_amount))}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">{Number(earning.fee_percentage).toFixed(1)}%</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium text-primary">
                        {formatCurrency(Number(earning.fee_amount))}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatCurrency(Number(earning.net_to_shop))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
