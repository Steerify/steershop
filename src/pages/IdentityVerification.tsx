import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PageWrapper } from "@/components/PageWrapper";
import { KYCLevel1Form } from "@/components/kyc/KYCLevel1Form";
import { KYCLevel2Form } from "@/components/kyc/KYCLevel2Form";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ShieldCheck, BadgeCheck, AlertCircle, Info } from "lucide-react";
import { AdirePattern } from "@/components/patterns/AdirePattern";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

const IdentityVerification = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("level2"); // Default to Bank Account verification

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
              Complete your identity verification to unlock full store capabilities, receive payouts, and build trust with your customers.
            </p>
          </div>
          <div className="hidden lg:block">
            <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center rotate-3 border-2 border-primary/20">
              <ShieldCheck className="w-12 h-12 text-primary" />
            </div>
          </div>
        </div>

        {/* Interactive Trust Roadmap & Milestones Checklist */}
        <div className="mb-8 p-6 rounded-3xl bg-card/65 border border-border/40 backdrop-blur-md relative overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.015)]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
            <h2 className="text-xs font-black uppercase tracking-widest text-foreground">SteerSolo Trust & Verification Roadmap</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { 
                step: "1", 
                title: "Bank Account Setup", 
                desc: "Link payout details powered securely by Paystack to unlock credit settlement.", 
                status: "action_required",
                color: "border-l-accent text-accent bg-accent/5" 
              },
              { 
                step: "2", 
                title: "Earn Verified Badge", 
                desc: "Requires 10+ completed orders, active for 7+ days, and a 3.5+ rating.", 
                status: "in_progress",
                color: "border-l-primary text-primary bg-primary/5" 
              },
              { 
                step: "3", 
                title: "Elite Partner Badge", 
                desc: "Highest score on our Professional Vitality index (95+ rating).", 
                status: "soon",
                color: "border-l-muted-foreground text-muted-foreground bg-muted/40" 
              }
            ].map((item, i) => (
              <div key={i} className={`p-4 rounded-2xl border-l-4 ${item.color} flex flex-col justify-between space-y-2`}>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider opacity-60">Step {item.step}</span>
                    <Badge variant="outline" className="text-[9px] uppercase font-black tracking-wider py-0 px-2 bg-background border-current/25">
                      {item.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-tight text-foreground mt-1">{item.title}</h4>
                  <p className="text-[10px] text-muted-foreground mt-1 leading-normal">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 p-1 bg-muted/30 border border-border/40 rounded-xl backdrop-blur-sm">
                <TabsTrigger 
                  value="level1" 
                  className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm font-black text-xs relative transition-all py-2 rounded-lg"
                >
                  Level 1: BVN
                  <span className="absolute -top-2.5 -right-1 text-[8px] font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded-md">
                    Soon
                  </span>
                </TabsTrigger>
                <TabsTrigger 
                  value="level2" 
                  className="data-[state=active]:bg-background data-[state=active]:text-accent data-[state=active]:shadow-sm font-black text-xs transition-all py-2 rounded-lg"
                >
                  Level 2: Bank Settlement ✓
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
                    "Receive payments directly to your bank",
                    "Display Verified Seller badge on your shop",
                    "Build customer trust and credibility",
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
                    Identity verification is powered by Paystack. Ensure the bank account is in your name and matches your profile information.
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