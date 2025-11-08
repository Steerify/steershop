import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { CustomerSidebar } from "@/components/CustomerSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Award, Gift, Clock, CheckCircle2 } from "lucide-react";

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
  const [isLoading, setIsLoading] = useState(true);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [claims, setClaims] = useState<PrizeClaim[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        navigate("/auth/login");
        return;
      }

      setUserId(user.id);

      // Load prizes
      const { data: prizesData, error: prizesError } = await supabase
        .from("rewards_prizes")
        .select("*")
        .eq("is_active", true)
        .order("points_required", { ascending: true });

      if (prizesError) throw prizesError;

      // Load prize claims
      const { data: claimsData, error: claimsError } = await supabase
        .from("prize_claims")
        .select("*, prizes:rewards_prizes(*)")
        .eq("user_id", user.id)
        .order("claimed_at", { ascending: false });

      if (claimsError) throw claimsError;

      // Load points
      const { data: pointsData } = await supabase
        .from("rewards_points")
        .select("total_points")
        .eq("user_id", user.id)
        .maybeSingle();

      setPrizes(prizesData || []);
      setClaims(claimsData || []);
      setTotalPoints(pointsData?.total_points || 0);
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
      const { data, error } = await supabase.rpc("claim_prize", {
        p_prize_id: prizeId,
        p_user_id: userId,
      });

      if (error) throw error;

      const result = data as any;
      
      if (result.success) {
        toast({
          title: "Prize Claimed!",
          description: `You've spent ${result.points_spent} points. Remaining: ${result.remaining_points}`,
        });
        loadData();
      } else {
        toast({
          title: "Claim Failed",
          description: result.error,
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <CustomerSidebar />
        
        <div className="flex-1">
          <header className="h-16 border-b bg-card flex items-center px-6 justify-between">
            <div className="flex items-center">
              <SidebarTrigger className="mr-4" />
              <h1 className="text-2xl font-bold">Rewards Store</h1>
            </div>
            <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-lg">
              <Award className="w-5 h-5 text-primary" />
              <span className="font-semibold">{totalPoints} Points</span>
            </div>
          </header>

          <main className="p-6">
            <Tabs defaultValue="prizes" className="space-y-6">
              <TabsList>
                <TabsTrigger value="prizes">
                  Available Prizes ({prizes.length})
                </TabsTrigger>
                <TabsTrigger value="claimed">
                  My Claims ({claims.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="prizes" className="space-y-4">
                {prizes.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Gift className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">No prizes available at the moment</p>
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
