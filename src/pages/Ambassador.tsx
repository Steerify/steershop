import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { AmbassadorProfile, Referral, referralService, ReferralStats } from "@/services/referral.service";
import { PageWrapper } from "@/components/PageWrapper";
import { ArrowLeft, Copy, Loader2, MessageCircle, Share2, Users, Wallet } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  name: string;
  count: number;
  commission: number;
}

const EMPTY_STATS: ReferralStats = {
  totalReferrals: 0,
  pendingReferrals: 0,
  approvedReferrals: 0,
  paidReferrals: 0,
  reversedReferrals: 0,
  pendingCommission: 0,
  paidCommission: 0,
  totalCommission: 0,
};

const Ambassador = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [referralCode, setReferralCode] = useState("");
  const [stats, setStats] = useState<ReferralStats>(EMPTY_STATS);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [profile, setProfile] = useState<AmbassadorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    legal_name: "",
    phone: "",
    payout_bank_name: "",
    payout_bank_code: "",
    payout_account_number: "",
    payout_account_name: "",
    tax_id: "",
    compliance_notes: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [codeResult, statsResult, referralsResult, leaderboardResult, profileResult] = await Promise.all([
        referralService.getReferralCode(),
        referralService.getReferralStats(),
        referralService.getReferrals(),
        referralService.getLeaderboard(),
        referralService.getAmbassadorProfile(),
      ]);

      if (codeResult.success && codeResult.data) setReferralCode(codeResult.data.code);
      if (statsResult.success) setStats(statsResult.data);
      if (referralsResult.success) setReferrals(referralsResult.data);
      if (leaderboardResult.success) setLeaderboard(leaderboardResult.data);

      if (profileResult.success) {
        setProfile(profileResult.data);
        if (profileResult.data) {
          setForm({
            legal_name: profileResult.data.legal_name || "",
            phone: profileResult.data.phone || "",
            payout_bank_name: profileResult.data.payout_bank_name || "",
            payout_bank_code: profileResult.data.payout_bank_code || "",
            payout_account_number: profileResult.data.payout_account_number || "",
            payout_account_name: profileResult.data.payout_account_name || "",
            tax_id: profileResult.data.tax_id || "",
            compliance_notes: profileResult.data.compliance_notes || "",
          });
        }
      }
    } catch (error) {
      console.error("Error loading ambassador data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const referralLink = useMemo(() => `https://steersolo.com/auth/signup?ref=${referralCode}`, [referralCode]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      toast({ title: "Copied!", description: "Referral link copied to clipboard" });
    } catch {
      toast({ title: "Error", description: "Failed to copy", variant: "destructive" });
    }
  };

  const shareWhatsApp = () => {
    const msg = `Join SteerSolo with my link. Ambassadors earn 10% commission when referrals subscribe:\n\n${referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join SteerSolo",
          text: "Use my referral link to sign up on SteerSolo!",
          url: referralLink,
        });
      } catch {
        // no-op
      }
    } else {
      copyLink();
    }
  };

  const saveEnrollment = async (e: FormEvent) => {
    e.preventDefault();

    if (!form.legal_name.trim()) {
      toast({ title: "Legal name required", description: "Please enter your legal name.", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      const result = await referralService.upsertAmbassadorProfile(form);
      if (!result.success) {
        toast({ title: "Error", description: result.message, variant: "destructive" });
        return;
      }

      toast({
        title: profile ? "Enrollment details updated" : "Enrollment complete",
        description: "Your payout profile has been saved.",
      });

      const refreshed = await referralService.getAmbassadorProfile();
      if (refreshed.success) setProfile(refreshed.data);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper patternVariant="dots" patternOpacity={0.3}>
      <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>

        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold font-heading">Ambassador Program</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Open enrollment for everyone. Share your code and earn <span className="font-semibold text-foreground">10% commission</span> when a referred user successfully pays for subscription.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Open enrollment form</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-3 md:grid-cols-2" onSubmit={saveEnrollment}>
              <Input placeholder="Legal name" value={form.legal_name} onChange={(e) => setForm((p) => ({ ...p, legal_name: e.target.value }))} />
              <Input placeholder="Phone number" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
              <Input placeholder="Payout bank name" value={form.payout_bank_name} onChange={(e) => setForm((p) => ({ ...p, payout_bank_name: e.target.value }))} />
              <Input placeholder="Payout bank code" value={form.payout_bank_code} onChange={(e) => setForm((p) => ({ ...p, payout_bank_code: e.target.value }))} />
              <Input placeholder="Account number" value={form.payout_account_number} onChange={(e) => setForm((p) => ({ ...p, payout_account_number: e.target.value }))} />
              <Input placeholder="Account name" value={form.payout_account_name} onChange={(e) => setForm((p) => ({ ...p, payout_account_name: e.target.value }))} />
              <Input placeholder="Tax ID / Compliance ID" value={form.tax_id} onChange={(e) => setForm((p) => ({ ...p, tax_id: e.target.value }))} />
              <Textarea className="md:col-span-2" placeholder="Compliance notes (optional)" value={form.compliance_notes} onChange={(e) => setForm((p) => ({ ...p, compliance_notes: e.target.value }))} />
              <div className="md:col-span-2 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{profile ? `Enrolled on ${new Date(profile.enrolled_at).toLocaleDateString()}` : "Anyone can register. Fill this once to get paid."}</p>
                <Button type="submit" disabled={isSaving}>{isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save enrollment"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardContent className="pt-6 space-y-4">
            <p className="text-sm text-muted-foreground">Your referral link</p>
            <div className="flex items-center gap-2 bg-muted rounded-lg p-3">
              <code className="text-sm flex-1 truncate">{referralLink}</code>
              <Button size="sm" variant="outline" onClick={copyLink}><Copy className="w-4 h-4" /></Button>
            </div>
            <div className="flex gap-2">
              <Button onClick={shareWhatsApp} className="flex-1 bg-green-600 hover:bg-green-700"><MessageCircle className="w-4 h-4 mr-2" /> WhatsApp</Button>
              <Button onClick={shareNative} variant="outline" className="flex-1"><Share2 className="w-4 h-4 mr-2" /> Share</Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Wallet className="w-4 h-4" /> Pending commission</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold">₦{stats.pendingCommission.toLocaleString()}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Paid commission</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold text-green-600">₦{stats.paidCommission.toLocaleString()}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Users className="w-4 h-4" />Referral performance</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold">{stats.totalReferrals}</p></CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Referral performance list</CardTitle></CardHeader>
          <CardContent className="p-0">
            {referrals.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">No referral records yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4">Referred User</th>
                      <th className="text-left p-4">Status</th>
                      <th className="text-left p-4">Commission</th>
                      <th className="text-left p-4">Payment Reference</th>
                      <th className="text-left p-4">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {referrals.map((referral) => (
                      <tr key={referral.id} className="border-t border-border hover:bg-muted/30">
                        <td className="p-4 text-sm font-mono">{referral.referred_id.slice(0, 8)}…</td>
                        <td className="p-4">
                          <Badge variant={referral.commission_status === "paid" ? "default" : "secondary"} className="capitalize">{referral.commission_status}</Badge>
                        </td>
                        <td className="p-4 font-semibold">{referral.commission_amount ? `₦${referral.commission_amount.toLocaleString()}` : "—"}</td>
                        <td className="p-4 text-sm text-muted-foreground">{referral.source_payment_reference || "—"}</td>
                        <td className="p-4 text-sm text-muted-foreground">{new Date(referral.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {leaderboard.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Top ambassadors</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {leaderboard.map((entry) => (
                <div key={entry.rank} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                  <span>{entry.rank}. {entry.name}</span>
                  <span className="text-sm text-muted-foreground">{entry.count} subs • ₦{entry.commission.toLocaleString()}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </PageWrapper>
  );
};

export default Ambassador;
