import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Search, TrendingUp, TrendingDown, RefreshCcw, BarChart3, Filter, X } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface SearchRecord {
  query: string;
  timestamp: string;
  searchType: string;
}

export default function AdminSearchAnalytics() {
  const [searchData, setSearchData] = useState<SearchRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch search analytics from localStorage
  const fetchSearchAnalytics = () => {
    setIsLoading(true);
    try {
      const savedSearches = JSON.parse(localStorage.getItem("steersolo_search_analytics") || "[]");
      setSearchData(savedSearches);
    } catch (error) {
      console.error("Error loading search analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSearchAnalytics();
  }, []);

  // Calculate search stats
  const calculateStats = () => {
    const totalSearches = searchData.length;
    const today = new Date().toISOString().split("T")[0];
    const todaySearches = searchData.filter(s => 
      s.timestamp.startsWith(today)).length;
    const last7Days = searchData.filter(s => {
      const date = new Date(s.timestamp);
      const now = new Date();
      const diffTime = now.getTime() - date.getTime();
      return diffTime < 7 * 24 * 60 * 60 * 1000;
    }).length;

    // Count most searched queries
    const queryCounts = searchData.reduce((acc, curr) => {
      acc[curr.query] = (acc[curr.query] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topQueries = Object.entries(queryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([query, count]) => ({ query, count }));

    // Daily search volume for chart
    const dailyCounts = searchData.reduce((acc, curr) => {
      const date = curr.timestamp.split("T")[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const chartData = Object.entries(dailyCounts)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => ({ date, searches: count }))
      .slice(-14);

    return {
      totalSearches,
      todaySearches,
      last7Days,
      topQueries,
      chartData
    };
  };

  const stats = calculateStats();

  const clearAnalytics = () => {
    if (confirm("Are you sure you want to clear all search analytics?")) {
      localStorage.removeItem("steersolo_search_analytics");
      fetchSearchAnalytics();
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Search Analytics
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Track what users are searching for on SteerSolo
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={fetchSearchAnalytics} className="gap-1.5">
              <RefreshCcw className="w-4 h-4" />
              Refresh
            </Button>
            <Button size="sm" variant="destructive" onClick={clearAnalytics} className="gap-1.5">
              <X className="w-4 h-4" />
              Clear Data
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Search className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-extrabold">{stats.totalSearches}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">Total Searches</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-accent" />
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-extrabold">{stats.todaySearches}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">Today&apos;s Searches</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-extrabold">{stats.last7Days}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">Searches (Last 7 Days)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Search Volume Trend</CardTitle>
              <CardDescription>Daily searches over last 14 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "0.5rem"
                      }}
                    />
                    <Bar dataKey="searches" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Top Search Queries</CardTitle>
              <CardDescription>Most popular searches</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.topQueries.length > 0 ? (
                <div className="space-y-3">
                  {stats.topQueries.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{item.query}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.count} search{/* */}
                          </p>
                        </div>
                      </div>
                      <Badge className="text-xs font-semibold">{item.count}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No search data yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

// Let's import Badge for the top queries
import { Badge } from "@/components/ui/badge";
