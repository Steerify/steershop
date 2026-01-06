import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { referralService, ReferralStats } from "@/services/referral.service";
import { 
  Copy, 
  Share2, 
  Users, 
  Gift, 
  Clock, 
  CheckCircle2,
  MessageCircle,
  Loader2,
  Sparkles
} from "lucide-react";

export const ReferralCard = () => {
  const { toast } = useToast();
  const [referralCode, setReferralCode] = useState<string>("");
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 0,
    pendingReferrals: 0,
    rewardedReferrals: 0,
    totalPointsEarned: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    try {
      const [codeResult, statsResult] = await Promise.all([
        referralService.getReferralCode(),
        referralService.getReferralStats()
      ]);

      if (codeResult.success && codeResult.data) {
        setReferralCode(codeResult.data.code);
      }

      if (statsResult.success) {
        setStats(statsResult.data);
      }
    } catch (error) {
      console.error('Error loading referral data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      toast({
        title: "Copied!",
        description: "Referral code copied to clipboard",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to copy code",
        variant: "destructive",
      });
    }
  };

  const shareViaWhatsApp = () => {
    const message = `🎁 Join me on SteerSolo and get 25 bonus points! Use my referral code: ${referralCode}\n\nSign up here: ${window.location.origin}/auth/signup?ref=${referralCode}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join SteerSolo',
          text: `Use my referral code ${referralCode} to get 25 bonus points when you sign up!`,
          url: `${window.location.origin}/auth/signup?ref=${referralCode}`
        });
      } catch (error) {
        // User cancelled or error
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
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-accent/20 to-transparent rounded-full blur-2xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-primary/20 to-transparent rounded-full blur-2xl" />
      
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-heading">Invite Friends</CardTitle>
              <CardDescription>Earn 50 points per referral</CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
            <Sparkles className="w-3 h-3 mr-1" />
            Referral Program
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 relative">
        {/* Referral Code Display */}
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-2">Your Referral Code</p>
          <div className="flex items-center justify-between gap-2">
            <code className="text-2xl font-bold font-mono tracking-wider text-primary">
              {referralCode}
            </code>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={copyToClipboard}
              className="hover:bg-primary/10"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-card border border-border rounded-lg p-3 text-center">
            <Users className="w-4 h-4 mx-auto mb-1 text-primary" />
            <p className="text-lg font-bold">{stats.totalReferrals}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-3 text-center">
            <Clock className="w-4 h-4 mx-auto mb-1 text-amber-500" />
            <p className="text-lg font-bold">{stats.pendingReferrals}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-3 text-center">
            <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-green-500" />
            <p className="text-lg font-bold">{stats.rewardedReferrals}</p>
            <p className="text-xs text-muted-foreground">Rewarded</p>
          </div>
        </div>

        {/* Points Earned */}
        {stats.totalPointsEarned > 0 && (
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-3 text-center">
            <p className="text-sm text-muted-foreground">Total Points Earned</p>
            <p className="text-2xl font-bold text-primary">{stats.totalPointsEarned}</p>
          </div>
        )}

        {/* Share Buttons */}
        <div className="flex gap-2">
          <Button 
            onClick={shareViaWhatsApp} 
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            WhatsApp
          </Button>
          <Button 
            onClick={shareNative} 
            variant="outline"
            className="flex-1"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>

        {/* How it works */}
        <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border">
          <p>You earn <strong>50 points</strong> when your friend makes their first purchase.</p>
          <p>Your friend gets <strong>25 points</strong> as a welcome bonus!</p>
        </div>
      </CardContent>
    </Card>
  );
};
