import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/AdminLayout";
import { useAuth } from "@/context/AuthContext";
import { referralService, Referral } from "@/services/referral.service";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Clock, Loader2, RotateCcw, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ReferralWithUsers extends Referral {
  referrer_email?: string;
  referred_email?: string;
}

const AdminReferrals = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [referrals, setReferrals] = useState<ReferralWithUsers[]>([]);

  useEffect(() => {
    if (!authLoading) {
      if (user && user.role === "ADMIN") {
        loadData();
      } else if (user) {
        navigate("/dashboard");
      } else {
        navigate("/auth/login");
      }
    }
  }, [user, authLoading, navigate]);

  const loadData = async () => {
    try {
      const result = await referralService.getAllReferrals();
      if (!result.success) {
        toast({ title: "Error", description: result.message, variant: "destructive" });
        return;
      }

      const referralsWithEmails = await Promise.all(
        result.data.map(async (referral) => {
          const [referrerResult, referredResult] = await Promise.all([
            supabase.from("profiles").select("email").eq("id", referral.referrer_id).single(),
            supabase.from("profiles").select("email").eq("id", referral.referred_id).single(),
          ]);

          return {
            ...referral,
            referrer_email: referrerResult.data?.email || "Unknown",
            referred_email: referredResult.data?.email || "Unknown",
          };
        })
      );

      setReferrals(referralsWithEmails);
    } catch (error) {
      console.error("Error loading referrals:", error);
      toast({ title: "Error", description: "Failed to load referrals data", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const stats = useMemo(() => {
    const pending = referrals.filter((r) => r.commission_status === "pending" || r.commission_status === "approved");
    const paid = referrals.filter((r) => r.commission_status === "paid");
    const reversed = referrals.filter((r) => r.commission_status === "reversed");

    return {
      total: referrals.length,
      pendingCount: pending.length,
      paidCount: paid.length,
      reversedCount: reversed.length,
      pendingAmount: pending.reduce((sum, r) => sum + (r.commission_amount || 0), 0),
      paidAmount: paid.reduce((sum, r) => sum + (r.commission_amount || 0), 0),
    };
  }, [referrals]);

  const pendingReferrals = referrals.filter((r) => r.commission_status === "pending" || r.commission_status === "approved");
  const paidReferrals = referrals.filter((r) => r.commission_status === "paid");
  const reversedReferrals = referrals.filter((r) => r.commission_status === "reversed");

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-heading bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Referral Commission Ledger
          </h1>
          <p className="text-muted-foreground">Track commission accrual, payout status, and payment-source references.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-primary/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Referrals</CardTitle>
              <Wallet className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent><div className="text-3xl font-bold">{stats.total}</div></CardContent>
          </Card>
          <Card className="border-primary/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending/Approved</CardTitle>
              <Clock className="h-5 w-5 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-500">{stats.pendingCount}</div>
              <p className="text-xs text-muted-foreground">₦{stats.pendingAmount.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="border-primary/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Paid</CardTitle>
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">{stats.paidCount}</div>
              <p className="text-xs text-muted-foreground">₦{stats.paidAmount.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="border-primary/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Reversed</CardTitle>
              <RotateCcw className="h-5 w-5 text-red-500" />
            </CardHeader>
            <CardContent><div className="text-3xl font-bold text-red-500">{stats.reversedCount}</div></CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">Ledger ({referrals.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingReferrals.length})</TabsTrigger>
            <TabsTrigger value="paid">Paid ({paidReferrals.length})</TabsTrigger>
            <TabsTrigger value="reversed">Reversed ({reversedReferrals.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all"><LedgerTable referrals={referrals} /></TabsContent>
          <TabsContent value="pending"><LedgerTable referrals={pendingReferrals} /></TabsContent>
          <TabsContent value="paid"><LedgerTable referrals={paidReferrals} /></TabsContent>
          <TabsContent value="reversed"><LedgerTable referrals={reversedReferrals} /></TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

const LedgerTable = ({ referrals }: { referrals: ReferralWithUsers[] }) => {
  if (referrals.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">No commission entries found.</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 font-medium">Ambassador</th>
                <th className="text-left p-4 font-medium">Subscriber</th>
                <th className="text-left p-4 font-medium">Commission</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Payment Ref</th>
                <th className="text-left p-4 font-medium">Subscription ID</th>
                <th className="text-left p-4 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {referrals.map((referral) => (
                <tr key={referral.id} className="border-t border-border hover:bg-muted/30">
                  <td className="p-4 text-sm">{referral.referrer_email}</td>
                  <td className="p-4 text-sm">{referral.referred_email}</td>
                  <td className="p-4 font-semibold">{referral.commission_amount ? `₦${referral.commission_amount.toLocaleString()}` : "—"}</td>
                  <td className="p-4">
                    <Badge variant={referral.commission_status === "paid" ? "default" : "secondary"} className="capitalize">
                      {referral.commission_status}
                    </Badge>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">{referral.source_payment_reference || "—"}</td>
                  <td className="p-4 text-sm text-muted-foreground">{referral.source_subscription_id || "—"}</td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {new Date(referral.commission_created_at || referral.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminReferrals;
