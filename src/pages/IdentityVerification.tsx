import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PageWrapper } from "@/components/PageWrapper";
import { KYCLevel1Form } from "@/components/kyc/KYCLevel1Form";
import { KYCLevel2Form } from "@/components/kyc/KYCLevel2Form";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ShieldCheck, BadgeCheck, AlertCircle } from "lucide-react";
import { AdirePattern } from "@/components/patterns/AdirePattern";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

const IdentityVerification = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("level1");

  useEffect(() => {
    if (!user) {
      navigate("/auth/login");
    }
  }, [user, navigate]);

  return (
    <PageWrapper patternVariant="dots" patternOpacity={0.4}>
      <div className="container mx-auto py-8 px-4 sm:px-6 max-w-4xl relative z-10">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)} 
              className="mb-4 hover:bg-primary/10 -ml-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <h1 className="text-3xl sm:text-4xl font-heading font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Identity Verification
            </h1>
            <p className="text-muted-foreground mt-2 max-w-xl">
              Complete your identity verification to unlock full store capabilities, higher payout limits, and build trust with your customers.
            </p>
          </div>
          <div className="hidden lg:block">
            <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center rotate-3 border-2 border-primary/20">
              <ShieldCheck className="w-12 h-12 text-primary" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 p-1 bg-muted/50 border border-border/50">
                <TabsTrigger value="level1" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium">
                  Level 1: BVN
                </TabsTrigger>
                <TabsTrigger value="level2" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground font-medium">
                  Level 2: Bank Account
                </TabsTrigger>
              </TabsList>

              <TabsContent value="level1" className="mt-0 focus-visible:outline-none">
                <KYCLevel1Form onSuccess={() => setTimeout(() => setActiveTab("level2"), 2000)} />
              </TabsContent>

              <TabsContent value="level2" className="mt-0 focus-visible:outline-none">
                <KYCLevel2Form />
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card className="border-primary/10 bg-card/50 backdrop-blur-sm shadow-sm">
              <CardContent className="pt-6">
                <h3 className="font-heading font-bold text-lg mb-4 flex items-center gap-2">
                  <BadgeCheck className="w-5 h-5 text-primary" />
                  Verification Benefits
                </h3>
                <ul className="space-y-3">
                  {[
                    "Faster payout processing",
                    "Higher transaction limits",
                    "Verified Seller badge on your shop",
                    "Priority merchant support",
                    "Access to advanced marketing tools"
                  ].map((benefit, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-gold/10 to-transparent border border-gold/20 relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-10">
                <AdirePattern variant="geometric" />
              </div>
              <div className="flex gap-3 relative z-10">
                <AlertCircle className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <h4 className="font-bold text-gold text-sm">Important Note</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Identity verification is powered by Paystack. Ensure the names provided match exactly with what is on your official identity documents.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default IdentityVerification;
