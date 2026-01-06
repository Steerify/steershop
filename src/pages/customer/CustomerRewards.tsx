import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { rewardService } from "@/services/reward.service";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { CustomerSidebar } from "@/components/CustomerSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Award, Gift, Clock, CheckCircle2, Sparkles, BookOpen, Star } from "lucide-react";
import { AdirePattern } from "@/components/patterns/AdirePattern";

interface Prize {
  id: string;
  title: string;
  description: string;
  points_required: number;
  image_url: string;
  stock_quantity: number;
  is_active: boolean;
}

interface PrizeClaim {
  id: string;
  prize_id: string;
  points_spent: number;
  status: string;
  claimed_at: string;
  fulfilled_at: string | null;
  prizes: Prize;
}

const CustomerRewards = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoading: isAuthLoading } = useAuth(); // Use useAuth to get user and auth loading state
  const [isLoading, setIsLoading] = useState(true); // This isLoading is for the component's data loading
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [claims, setClaims] = useState<PrizeClaim[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    if (!isAuthLoading) { // Wait for authentication state to be resolved
      if (user) {
        loadData();
      } else {
        navigate("/auth/login");
      }
    }
  }, [user, isAuthLoading, navigate]); // Added user, isAuthLoading, and navigate to dependencies

  const loadData = async () => {
    try {
      if (!user) return; // Use the user from useAuth context

      setUserId(user.id);

      // Load prizes
      const prizesData = await rewardService.getPrizes();

      // Load prize claims
      const claimsData = await rewardService.getClaims();

      // Load points
      const pointsData = await rewardService.getUserPoints();

      setPrizes(prizesData?.data || []);
      setClaims(claimsData?.data || []);
      setTotalPoints(pointsData?.data?.total_points || 0);
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load rewards",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimPrize = async (prizeId: string, pointsRequired: number) => {
    if (totalPoints < pointsRequired) {
      toast({
        title: "Insufficient Points",
        description: `You need ${pointsRequired - totalPoints} more points to claim this prize.`,
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await rewardService.claimPrize(prizeId);
      
      if (result.success) {
        toast({
          title: "Prize Claimed!",
          description: `You've spent ${result.data.points_spent} points. Remaining: ${result.data.remaining_points}`,
        });
        loadData();
      } else {
        toast({
          title: "Claim Failed",
          description: result.message || "Could not claim prize",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const pendingClaims = claims.filter(c => c.status === "pending");
  const fulfilledClaims = claims.filter(c => c.status === "fulfilled");

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-primary/5 via-background to-accent/5 relative">
        <AdirePattern variant="dots" className="fixed inset-0 opacity-5 pointer-events-none" />
        <CustomerSidebar />
        
        <div className="flex-1 relative z-10">
          <header className="h-16 border-b border-border/50 bg-card/80 backdrop-blur-lg flex items-center px-6 justify-between">
            <div className="h-1 absolute top-0 left-0 right-0 bg-gradient-to-r from-primary via-accent to-primary" />
            <div className="flex items-center">
              <SidebarTrigger className="mr-4" />
              <h1 className="text-2xl font-heading font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Rewards Store
              </h1>
            </div>
            <div className="flex items-center gap-2 bg-gradient-to-r from-primary/10 to-accent/10 px-4 py-2 rounded-xl border border-primary/20">
              <Award className="w-5 h-5 text-primary" />
              <span className="font-bold text-primary">{totalPoints}</span>
              <span className="text-muted-foreground text-sm">Points</span>
            </div>
          </header>

          <main className="p-6 space-y-6">
            {/* Points Hero */}
            <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-accent/20 to-transparent rounded-full blur-3xl" />
              <CardContent className="p-6 relative">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg">
                      <Star className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Your Balance</p>
                      <p className="text-4xl font-bold font-heading text-primary">{totalPoints} Points</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => navigate("/customer/courses")}>
                      <BookOpen className="w-4 h-4 mr-2" />
                      Earn More Points
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="prizes" className="space-y-6">
              <TabsList className="bg-card border">
                <TabsTrigger value="prizes" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Gift className="w-4 h-4 mr-2" />
                  Available Prizes ({prizes.length})
                </TabsTrigger>
                <TabsTrigger value="claimed" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  My Claims ({claims.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="prizes" className="space-y-4">
                {prizes.length === 0 ? (
                  <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
                    <CardContent className="py-16 text-center">
                      <div className="relative inline-block mb-4">
                        <Badge className="absolute -top-2 -right-2 bg-accent text-accent-foreground">
                          Coming Soon
                        </Badge>
                        <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center">
                          <Gift className="w-10 h-10 text-primary" />
                        </div>
                      </div>
                      <h3 className="text-xl font-heading font-semibold mb-2">Exciting Prizes Coming Soon!</h3>
                      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        We're preparing amazing rewards for our loyal customers.
                        Complete courses and earn points to redeem prizes!
                      </p>
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-6">
                        <Sparkles className="w-4 h-4 text-accent" />
                        <span>Earn points by completing courses and making referrals</span>
                      </div>
                      <Button onClick={() => navigate("/customer/courses")} className="bg-gradient-to-r from-primary to-accent">
                        <BookOpen className="w-4 h-4 mr-2" />
                        Start Earning Points
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {prizes.map((prize) => {
                      const canClaim = totalPoints >= prize.points_required && prize.stock_quantity > 0;
                      return (
                        <Card key={prize.id} className={canClaim ? "border-primary/50" : ""}>
                          {prize.image_url && (
                            <img
                              src={prize.image_url}
                              alt={prize.title}
                              className="w-full h-48 object-cover rounded-t-lg"
                            />
                          )}
                          <CardHeader>
                            <div className="flex items-start justify-between gap-2">
                              <CardTitle className="line-clamp-2">{prize.title}</CardTitle>
                              <Badge variant={canClaim ? "default" : "secondary"} className="shrink-0">
                                <Award className="w-3 h-3 mr-1" />
                                {prize.points_required}
                              </Badge>
                            </div>
                            <CardDescription className="line-clamp-2">
                              {prize.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div className="text-sm text-muted-foreground">
                              Stock: {prize.stock_quantity} available
                            </div>
                            <Button
                              onClick={() => handleClaimPrize(prize.id, prize.points_required)}
                              disabled={!canClaim}
                              className="w-full"
                            >
                              {!canClaim && totalPoints < prize.points_required ? (
                                <>Need {prize.points_required - totalPoints} more points</>
                              ) : !canClaim && prize.stock_quantity === 0 ? (
                                "Out of Stock"
                              ) : (
                                <>
                                  <Gift className="w-4 h-4 mr-2" />
                                  Claim Prize
                                </>
                              )}
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="claimed" className="space-y-4">
                {claims.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Gift className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">You haven't claimed any prizes yet</p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => navigate("/customer/courses")}
                      >
                        Complete Courses to Earn Points
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {pendingClaims.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <Clock className="w-5 h-5" />
                          Pending Claims ({pendingClaims.length})
                        </h3>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                          {pendingClaims.map((claim) => (
                            <Card key={claim.id}>
                              <CardHeader>
                                <CardTitle className="line-clamp-1">{claim.prizes.title}</CardTitle>
                                <CardDescription>
                                  Claimed on {new Date(claim.claimed_at).toLocaleDateString()}
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="space-y-2">
                                <Badge variant="outline" className="w-full justify-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Pending Fulfillment
                                </Badge>
                                <div className="text-sm text-muted-foreground text-center">
                                  {claim.points_spent} points spent
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {fulfilledClaims.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5" />
                          Fulfilled Claims ({fulfilledClaims.length})
                        </h3>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                          {fulfilledClaims.map((claim) => (
                            <Card key={claim.id} className="border-primary/50">
                              <CardHeader>
                                <CardTitle className="line-clamp-1">{claim.prizes.title}</CardTitle>
                                <CardDescription>
                                  Fulfilled on {new Date(claim.fulfilled_at!).toLocaleDateString()}
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="space-y-2">
                                <Badge variant="secondary" className="w-full justify-center">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Fulfilled
                                </Badge>
                                <div className="text-sm text-muted-foreground text-center">
                                  {claim.points_spent} points spent
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default CustomerRewards;
