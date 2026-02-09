import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { referralService, ReferralStats } from "@/services/referral.service";
import { 
  Copy, Share2, Users, Gift, Clock, CheckCircle2,
  MessageCircle, Loader2, Crown, Star, ArrowRight, Sparkles
} from "lucide-react";

interface AmbassadorTier {
  tier: string;
  reward_claimed: boolean;
}

const TIERS = [
  { key: "bronze", label: "Bronze", threshold: 10, reward: "Free month", icon: Gift, color: "text-amber-600" },
  { key: "silver", label: "Silver", threshold: 50, reward: "Featured shop", icon: Star, color: "text-slate-500" },
  { key: "gold", label: "Gold", threshold: 100, reward: "Reseller status", icon: Crown, color: "text-yellow-500" },
];

export const ReferralCard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [referralCode, setReferralCode] = useState("");
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 0, pendingReferrals: 0, rewardedReferrals: 0, totalPointsEarned: 0
  });
  const [tiers, setTiers] = useState<AmbassadorTier[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { loadReferralData(); }, []);

  const loadReferralData = async () => {
    try {
      const [codeResult, statsResult, tiersResult] = await Promise.all([
        referralService.getReferralCode(),
        referralService.getReferralStats(),
        referralService.getAmbassadorTiers()
      ]);
      if (codeResult.success && codeResult.data) setReferralCode(codeResult.data.code);
      if (statsResult.success) setStats(statsResult.data);
      if (tiersResult.success) setTiers(tiersResult.data);
    } catch (error) {
      console.error('Error loading referral data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const referralLink = `https://steersolo.lovable.app/auth/signup?ref=${referralCode}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      toast({ title: "Copied!", description: "Referral link copied" });
    } catch {
      toast({ title: "Error", description: "Failed to copy", variant: "destructive" });
    }
  };

  const shareViaWhatsApp = () => {
    const message = `🚀 Join me on SteerSolo! Sign up here and we both earn rewards:\n\n${referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Join SteerSolo', text: `Use my link to sign up!`, url: referralLink });
      } catch {}
    } else { copyToClipboard(); }
  };

  const reachedTiers = new Set(tiers.map(t => t.tier));

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
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-500/10 to-transparent rounded-full blur-2xl" />
      
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl flex items-center justify-center">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-heading">Ambassador Program</CardTitle>
              <CardDescription>Refer friends, unlock rewards</CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">
            <Sparkles className="w-3 h-3 mr-1" />
            {stats.rewardedReferrals} qualified
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 relative">
        {/* Referral Link */}
        <div className="bg-card border border-border rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Your Referral Link</p>
          <div className="flex items-center gap-2">
            <code className="text-xs font-mono truncate flex-1 text-primary">{referralLink}</code>
            <Button variant="outline" size="sm" onClick={copyToClipboard}>
              <Copy className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Milestone Progress */}
        <div className="space-y-2">
          <p className="text-sm font-semibold">Milestones</p>
          {TIERS.map((tier) => {
            const isReached = reachedTiers.has(tier.key);
            const progress = Math.min((stats.rewardedReferrals / tier.threshold) * 100, 100);
            return (
              <div key={tier.key} className={`flex items-center gap-3 p-2 rounded-lg ${isReached ? 'bg-green-500/10' : 'bg-muted/50'}`}>
                {isReached ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                ) : (
                  <tier.icon className={`w-4 h-4 ${tier.color} shrink-0`} />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">{tier.reward}</span>
                    <span className="text-muted-foreground">{Math.min(stats.rewardedReferrals, tier.threshold)}/{tier.threshold}</span>
                  </div>
                  <Progress value={progress} className="h-1.5 mt-1" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-card border border-border rounded-lg p-2 text-center">
            <Users className="w-3 h-3 mx-auto mb-0.5 text-primary" />
            <p className="text-sm font-bold">{stats.totalReferrals}</p>
            <p className="text-[10px] text-muted-foreground">Total</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-2 text-center">
            <Clock className="w-3 h-3 mx-auto mb-0.5 text-amber-500" />
            <p className="text-sm font-bold">{stats.pendingReferrals}</p>
            <p className="text-[10px] text-muted-foreground">Pending</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-2 text-center">
            <CheckCircle2 className="w-3 h-3 mx-auto mb-0.5 text-green-500" />
            <p className="text-sm font-bold">{stats.rewardedReferrals}</p>
            <p className="text-[10px] text-muted-foreground">Qualified</p>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="flex gap-2">
          <Button onClick={shareViaWhatsApp} className="flex-1 bg-green-600 hover:bg-green-700" size="sm">
            <MessageCircle className="w-4 h-4 mr-1" /> WhatsApp
          </Button>
          <Button onClick={shareNative} variant="outline" className="flex-1" size="sm">
            <Share2 className="w-4 h-4 mr-1" /> Share
          </Button>
        </div>

        {/* View full page */}
        <Button variant="ghost" className="w-full text-sm" onClick={() => navigate('/ambassador')}>
          View Ambassador Program <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
};
