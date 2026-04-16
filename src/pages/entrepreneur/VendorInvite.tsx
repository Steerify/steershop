import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { referralService, ReferralStats } from "@/services/referral.service";
import { PageWrapper } from "@/components/PageWrapper";
import { useShopOwnerAuth } from "@/hooks/use-shop-owner-auth";
import {
  Copy, Share2, Users, MessageCircle, Loader2,
  ArrowLeft, CheckCircle2, Sparkles, FileText
} from "lucide-react";

const INVITE_SCRIPTS = [
  {
    title: "Personal Invite",
    emoji: "💌",
    description: "For vendors you know personally",
    message: (link: string) =>
      `Hey! 👋 I've been using SteerSolo to run my online store and it's been a game-changer. No more "DM to order" stress — my customers can browse, pay, and checkout by themselves.\n\nI think it would be perfect for your business too. You can set up your store in minutes:\n\n${link}\n\nLet me know if you need help getting started! 🚀`,
  },
  {
    title: "Success Story",
    emoji: "📈",
    description: "Share how SteerSolo helped your business",
    message: (link: string) =>
      `Since I started using SteerSolo, my orders have been more organized, my customers trust me more (SafeBeauty badge!), and I spend less time replying DMs with bank details 😅\n\nIf you sell online, you should check it out — it's built specifically for Nigerian vendors like us:\n\n${link}\n\nWe both get rewards when you sign up! 🎁`,
  },
  {
    title: "Business Opportunity",
    emoji: "💰",
    description: "For business-minded vendors",
    message: (link: string) =>
      `I found a platform that's changing the game for online vendors in Nigeria. SteerSolo gives you a professional store, payment processing, delivery tracking, and a trust badge system — all from your phone.\n\nNo monthly fees to start, and your customers can actually checkout without sending you DMs.\n\nJoin here: ${link}\n\nLet's grow together! 🌱`,
  },
];

const VendorInvite = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isLoading: authLoading } = useShopOwnerAuth();
  const [referralCode, setReferralCode] = useState("");
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 0, pendingReferrals: 0, approvedReferrals: 0, paidReferrals: 0, reversedReferrals: 0, pendingCommission: 0, paidCommission: 0, totalCommission: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [codeResult, statsResult] = await Promise.all([
        referralService.getReferralCode(),
        referralService.getReferralStats(),
      ]);
      if (codeResult.success && codeResult.data) setReferralCode(codeResult.data.code);
      if (statsResult.success) setStats(statsResult.data);
    } catch (error) {
      console.error("Error loading invite data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const referralLink = `https://steersolo.com/auth/signup?ref=${referralCode}`;

  const copyScript = async (index: number) => {
    const message = INVITE_SCRIPTS[index].message(referralLink);
    try {
      await navigator.clipboard.writeText(message);
      setCopiedIndex(index);
      toast({ title: "Copied!", description: "Invite script copied to clipboard" });
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      toast({ title: "Error", description: "Failed to copy", variant: "destructive" });
    }
  };

  const shareViaWhatsApp = (index: number) => {
    const message = INVITE_SCRIPTS[index].message(referralLink);
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

  if (authLoading || isLoading) {
    return (
      <PageWrapper>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 max-w-3xl space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold font-heading text-foreground">Invite Vendors</h1>
              <p className="text-sm text-muted-foreground">Grow the community, earn rewards together</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="border-border">
              <CardContent className="p-4 text-center">
                <Users className="w-5 h-5 mx-auto mb-1 text-primary" />
                <p className="text-2xl font-bold text-foreground">{stats.totalReferrals}</p>
                <p className="text-xs text-muted-foreground">Invited</p>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-4 text-center">
                <CheckCircle2 className="w-5 h-5 mx-auto mb-1 text-accent" />
                <p className="text-2xl font-bold text-foreground">{stats.paidReferrals + stats.approvedReferrals + stats.pendingReferrals}</p>
                <p className="text-xs text-muted-foreground">Signed Up</p>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-4 text-center">
                <Sparkles className="w-5 h-5 mx-auto mb-1 text-primary" />
                <p className="text-2xl font-bold text-foreground">₦{stats.totalCommission.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Commission</p>
              </CardContent>
            </Card>
          </div>

          {/* Referral Link */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Your Invite Link</CardTitle>
              <CardDescription>Share this link — anyone who signs up gets connected to you</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 bg-card border border-border rounded-lg p-3">
                <code className="text-xs font-mono truncate flex-1 text-primary">{referralLink}</code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    await navigator.clipboard.writeText(referralLink);
                    toast({ title: "Link copied!" });
                  }}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Invite Scripts */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Ready-to-Send Invite Scripts</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Copy a script, personalise it if you like, then share via WhatsApp or anywhere else.
            </p>

            {INVITE_SCRIPTS.map((script, i) => (
              <Card key={i} className="border-border">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{script.emoji}</span>
                      <div>
                        <CardTitle className="text-sm">{script.title}</CardTitle>
                        <CardDescription className="text-xs">{script.description}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">Script {i + 1}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground whitespace-pre-line leading-relaxed max-h-40 overflow-y-auto">
                    {script.message(referralLink)}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => copyScript(i)}
                    >
                      {copiedIndex === i ? (
                        <><CheckCircle2 className="w-3.5 h-3.5 mr-1 text-accent" /> Copied!</>
                      ) : (
                        <><Copy className="w-3.5 h-3.5 mr-1" /> Copy Script</>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-[hsl(145,60%,38%)] hover:bg-[hsl(145,60%,33%)] text-white"
                      onClick={() => shareViaWhatsApp(i)}
                    >
                      <MessageCircle className="w-3.5 h-3.5 mr-1" /> Send via WhatsApp
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Ambassador CTA */}
          <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-primary/5">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">Want to earn more?</p>
                <p className="text-sm text-muted-foreground">Join the Ambassador Program for bigger rewards</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate("/ambassador")}>
                View Program
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
};

export default VendorInvite;
