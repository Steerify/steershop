import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/AdminLayout";
import { useAuth } from "@/context/AuthContext";
import { referralService, Referral } from "@/services/referral.service";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  Award,
  TrendingUp,
  Loader2,
  Gift
} from "lucide-react";
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
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    rewarded: 0,
    totalPointsAwarded: 0
  });

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
      
      if (result.success) {
        // Fetch user emails for referrals
        const referralsWithEmails = await Promise.all(
          result.data.map(async (referral) => {
            const [referrerResult, referredResult] = await Promise.all([
              supabase.from('profiles').select('email').eq('id', referral.referrer_id).single(),
              supabase.from('profiles').select('email').eq('id', referral.referred_id).single()
            ]);
            
            return {
              ...referral,
              referrer_email: referrerResult.data?.email || 'Unknown',
              referred_email: referredResult.data?.email || 'Unknown'
            };
          })
        );

        setReferrals(referralsWithEmails);
        
        // Calculate stats
        setStats({
          total: referralsWithEmails.length,
          pending: referralsWithEmails.filter(r => r.status === 'pending').length,
          rewarded: referralsWithEmails.filter(r => r.status === 'rewarded').length,
          totalPointsAwarded: referralsWithEmails.reduce((sum, r) => sum + (r.points_earned || 0), 0)
        });
      }
    } catch (error: any) {
      console.error("Error loading referrals:", error);
      toast({
        title: "Error",
        description: "Failed to load referrals data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const pendingReferrals = referrals.filter(r => r.status === 'pending');
  const rewardedReferrals = referrals.filter(r => r.status === 'rewarded');

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
            Referral Management
          </h1>
          <p className="text-muted-foreground">Monitor and manage the referral program</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-primary/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Referrals</CardTitle>
              <Users className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="border-primary/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
              <Clock className="h-5 w-5 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-500">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card className="border-primary/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Rewarded</CardTitle>
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">{stats.rewarded}</div>
            </CardContent>
          </Card>

          <Card className="border-primary/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Points Awarded</CardTitle>
              <Award className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.totalPointsAwarded}</div>
            </CardContent>
          </Card>
        </div>

        {/* Referrals List */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All ({referrals.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingReferrals.length})</TabsTrigger>
            <TabsTrigger value="rewarded">Rewarded ({rewardedReferrals.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <ReferralsList referrals={referrals} />
          </TabsContent>

          <TabsContent value="pending">
            <ReferralsList referrals={pendingReferrals} />
          </TabsContent>

          <TabsContent value="rewarded">
            <ReferralsList referrals={rewardedReferrals} />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

const ReferralsList = ({ referrals }: { referrals: ReferralWithUsers[] }) => {
  if (referrals.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Gift className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No referrals found</p>
        </CardContent>
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
                <th className="text-left p-4 font-medium">Referrer</th>
                <th className="text-left p-4 font-medium">Referred User</th>
                <th className="text-left p-4 font-medium">Code</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Points</th>
                <th className="text-left p-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {referrals.map((referral) => (
                <tr key={referral.id} className="border-t border-border hover:bg-muted/30">
                  <td className="p-4">
                    <span className="text-sm">{referral.referrer_email}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm">{referral.referred_email}</span>
                  </td>
                  <td className="p-4">
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                      {referral.referral_code}
                    </code>
                  </td>
                  <td className="p-4">
                    <Badge 
                      variant={referral.status === 'rewarded' ? 'default' : 'secondary'}
                      className={referral.status === 'rewarded' ? 'bg-green-500' : ''}
                    >
                      {referral.status === 'rewarded' ? (
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                      ) : (
                        <Clock className="w-3 h-3 mr-1" />
                      )}
                      {referral.status}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <span className="font-semibold text-primary">
                      {referral.points_earned || 0}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {new Date(referral.created_at).toLocaleDateString()}
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
