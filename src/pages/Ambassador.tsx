import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { referralService, ReferralStats } from "@/services/referral.service";
import { PageWrapper } from "@/components/PageWrapper";
import {
  Crown,
  Star,
  Trophy,
  Gift,
  Copy,
  MessageCircle,
  Share2,
  Users,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  Sparkles,
  Shield,
  Store,
} from "lucide-react";

interface AmbassadorTier {
  tier: string;
  reward_claimed: boolean;
  reached_at: string;
  claimed_at: string | null;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  count: number;
}

const TIERS = [
  {
    key: "bronze",
    label: "Bronze",
    icon: Gift,
    threshold: 10,
    reward: "Free month of SteerSolo",
    description: "Get a full month subscription free when you refer 10 friends",
    color: "from-amber-600 to-amber-800",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
  },
  {
    key: "silver",
    label: "Silver",
    icon: Star,
    threshold: 50,
    reward: "Shop featured on homepage",
    description: "Your shop gets featured on the SteerSolo homepage for 30 days",
    color: "from-slate-400 to-slate-600",
    badgeColor: "bg-slate-100 text-slate-700 border-slate-300",
  },
  {
    key: "gold",
    label: "Gold",
    icon: Crown,
    threshold: 100,
    reward: "Reseller status unlocked",
    description: "Permanent reseller badge and future wholesale access",
    color: "from-yellow-500 to-amber-600",
    badgeColor: "bg-yellow-100 text-yellow-800 border-yellow-400",
  },
];

const Ambassador = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [referralCode, setReferralCode] = useState("");
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 0,
    pendingReferrals: 0,
    rewardedReferrals: 0,
    totalPointsEarned: 0,
  });
  const [tiers, setTiers] = useState<AmbassadorTier[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [codeResult, statsResult, tiersResult, leaderboardResult] =
        await Promise.all([
          referralService.getReferralCode(),
          referralService.getReferralStats(),
          referralService.getAmbassadorTiers(),
          referralService.getLeaderboard(),
        ]);

      if (codeResult.success && codeResult.data) setReferralCode(codeResult.data.code);
      if (statsResult.success) setStats(statsResult.data);
      if (tiersResult.success) setTiers(tiersResult.data);
      if (leaderboardResult.success) setLeaderboard(leaderboardResult.data);
    } catch (error) {
      console.error("Error loading ambassador data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimReward = async () => {
    setIsClaiming(true);
    try {
      const result = await referralService.claimAmbassadorReward();
      if (result.success) {
        toast({
          title: "🎉 Rewards Checked!",
          description:
            result.rewards_granted.length > 0
              ? `Unlocked: ${result.rewards_granted.join(", ")}`
              : "No new rewards to claim yet. Keep referring!",
        });
        loadData();
      } else {
        toast({ title: "Error", description: result.message, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to check rewards", variant: "destructive" });
    } finally {
      setIsClaiming(false);
    }
  };

  const referralLink = `https://steersolo.com/auth/signup?ref=${referralCode}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      toast({ title: "Copied!", description: "Referral link copied to clipboard" });
    } catch {
      toast({ title: "Error", description: "Failed to copy", variant: "destructive" });
    }
  };

  const shareWhatsApp = () => {
    const msg = `🚀 Join me on SteerSolo and start your online business! Use my link to sign up and we both earn rewards:\n\n${referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join SteerSolo",
          text: `Use my referral link to sign up on SteerSolo!`,
          url: referralLink,
        });
      } catch {}
    } else {
      copyLink();
    }
  };

  const reachedTiers = new Set(tiers.map((t) => t.tier));

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
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
        {/* Back button */}
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>

        {/* Hero */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 rounded-full px-4 py-2">
            <Crown className="w-5 h-5 text-yellow-600" />
            <span className="font-semibold text-yellow-700">Ambassador Program</span>
          </div>
          <h1 className="text-4xl font-bold font-heading">
            Refer. Earn.{" "}
            <span className="bg-gradient-to-r from-yellow-500 to-amber-600 bg-clip-text text-transparent">
              Level Up.
            </span>
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Share SteerSolo with others and unlock real rewards — free subscriptions,
            homepage features, and exclusive reseller status.
          </p>
        </div>

        {/* Referral Link */}
        <Card className="border-primary/20">
          <CardContent className="pt-6 space-y-4">
            <p className="text-sm text-muted-foreground">Your referral link</p>
            <div className="flex items-center gap-2 bg-muted rounded-lg p-3">
              <code className="text-sm flex-1 truncate">{referralLink}</code>
              <Button size="sm" variant="outline" onClick={copyLink}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button onClick={shareWhatsApp} className="flex-1 bg-green-600 hover:bg-green-700">
                <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
              </Button>
              <Button onClick={shareNative} variant="outline" className="flex-1">
                <Share2 className="w-4 h-4 mr-2" /> Share
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Progress Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Your Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Qualified referrals</span>
              <span className="font-bold text-primary">{stats.rewardedReferrals}</span>
            </div>
            <Progress
              value={Math.min((stats.rewardedReferrals / 100) * 100, 100)}
              className="h-3"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0</span>
              <span>10</span>
              <span>50</span>
              <span>100</span>
            </div>
          </CardContent>
        </Card>

        {/* Tier Cards */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold font-heading">Milestone Rewards</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {TIERS.map((tier) => {
              const isReached = reachedTiers.has(tier.key);
              const progress = Math.min(
                (stats.rewardedReferrals / tier.threshold) * 100,
                100
              );

              return (
                <Card
                  key={tier.key}
                  className={`relative overflow-hidden transition-all ${
                    isReached ? "ring-2 ring-yellow-500/50" : ""
                  }`}
                >
                  {isReached && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    </div>
                  )}
                  <CardContent className="pt-6 space-y-4">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center`}
                    >
                      <tier.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <Badge className={tier.badgeColor}>{tier.label}</Badge>
                      <p className="text-lg font-bold mt-2">{tier.reward}</p>
                      <p className="text-sm text-muted-foreground">{tier.description}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>
                          {stats.rewardedReferrals}/{tier.threshold} referrals
                        </span>
                        <span className="font-semibold">{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Claim Button */}
        <div className="text-center">
          <Button
            size="lg"
            onClick={handleClaimReward}
            disabled={isClaiming}
            className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white gap-2"
          >
            {isClaiming ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Check & Claim Rewards
          </Button>
        </div>

        {/* Leaderboard */}
        {leaderboard.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Top Ambassadors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.rank}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                  >
                    <span className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center text-white font-bold text-sm">
                      {entry.rank}
                    </span>
                    <span className="flex-1 font-medium">{entry.name}</span>
                    <Badge variant="secondary">{entry.count} referrals</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* How it works */}
        <Card className="bg-muted/30">
          <CardContent className="pt-6">
            <h3 className="font-bold mb-4">How it works</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Share2 className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">1. Share your link</p>
                  <p className="text-xs text-muted-foreground">Send to friends via WhatsApp or social media</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">2. They sign up & buy</p>
                  <p className="text-xs text-muted-foreground">Referral counts when they make their first purchase</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Gift className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">3. Unlock rewards</p>
                  <p className="text-xs text-muted-foreground">Hit milestones and claim your rewards automatically</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
};

export default Ambassador;
