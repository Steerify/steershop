import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { referralService, ReferralStats } from "@/services/referral.service";
import { Copy, Share2, MessageCircle, Loader2, ArrowRight, Wallet, Clock, CheckCircle2 } from "lucide-react";

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

export const ReferralCard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [referralCode, setReferralCode] = useState("");
  const [stats, setStats] = useState<ReferralStats>(EMPTY_STATS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { loadReferralData(); }, []);

  const loadReferralData = async () => {
    try {
      const [codeResult, statsResult] = await Promise.all([
        referralService.getReferralCode(),
        referralService.getReferralStats(),
      ]);
      if (codeResult.success && codeResult.data) setReferralCode(codeResult.data.code);
      if (statsResult.success) setStats(statsResult.data);
    } catch (error) {
      console.error("Error loading referral data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const referralLink = `https://steersolo.com/auth/signup?ref=${referralCode}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      toast({ title: "Copied!", description: "Referral link copied" });
    } catch {
      toast({ title: "Error", description: "Failed to copy", variant: "destructive" });
    }
  };

  const shareViaWhatsApp = () => {
    const message = `Join me on SteerSolo. Ambassadors earn 10% commission when referrals subscribe:\n\n${referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Join SteerSolo", text: "Use my link to sign up!", url: referralLink });
      } catch {
        // ignore cancel
      }
    } else {
      copyToClipboard();
    }
  };

  if (isLoading) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5 overflow-hidden relative">
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-heading">Ambassador Program</CardTitle>
            <CardDescription>Open enrollment + 10% subscription commission</CardDescription>
          </div>
          <Badge variant="secondary">₦{stats.pendingCommission.toLocaleString()} pending</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 relative">
        <div className="bg-card border border-border rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Your Referral Link</p>
          <div className="flex items-center gap-2">
            <code className="text-xs font-mono truncate flex-1 text-primary">{referralLink}</code>
            <Button variant="outline" size="sm" onClick={copyToClipboard}><Copy className="w-3 h-3" /></Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="bg-card border border-border rounded-lg p-2 text-center">
            <Wallet className="w-3 h-3 mx-auto mb-0.5 text-primary" />
            <p className="text-sm font-bold">₦{stats.pendingCommission.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">Pending</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-2 text-center">
            <CheckCircle2 className="w-3 h-3 mx-auto mb-0.5 text-green-500" />
            <p className="text-sm font-bold">₦{stats.paidCommission.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">Paid</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-2 text-center">
            <Clock className="w-3 h-3 mx-auto mb-0.5 text-amber-500" />
            <p className="text-sm font-bold">{stats.totalReferrals}</p>
            <p className="text-[10px] text-muted-foreground">Referrals</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={shareViaWhatsApp} className="flex-1 bg-green-600 hover:bg-green-700" size="sm">
            <MessageCircle className="w-4 h-4 mr-1" /> WhatsApp
          </Button>
          <Button onClick={shareNative} variant="outline" className="flex-1" size="sm">
            <Share2 className="w-4 h-4 mr-1" /> Share
          </Button>
        </div>

        <Button variant="ghost" className="w-full text-sm" onClick={() => navigate('/ambassador')}>
          View Ambassador Program <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
};
