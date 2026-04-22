import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle2, Gift, Megaphone, Wallet } from "lucide-react";
import { generateKeywordBank } from "@/utils/seoKeywords";

const AmbassadorProgramPage = () => {
  const keywordBank = generateKeywordBank({
    coreTopics: [
      "steersolo ambassador program",
      "ambassador referral commission nigeria",
      "refer and earn ecommerce nigeria",
      "steersolo referral dashboard",
      "affiliate style referral for sellers",
    ],
    limit: 3000,
  });

  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "SteerSolo Ambassador Program",
    url: "https://steersolo.com/ambassador-program",
    description:
      "Join the SteerSolo Ambassador Program, refer sellers and shoppers, and earn commissions for successful subscriptions.",
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Who can join the SteerSolo Ambassador Program?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Anyone with a SteerSolo account can enroll, get a referral link, and start inviting new users.",
        },
      },
      {
        "@type": "Question",
        name: "How do ambassadors earn?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Ambassadors earn a commission when referred users complete qualifying subscription payments.",
        },
      },
      {
        "@type": "Question",
        name: "Where do I track my referrals and payouts?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "After joining, ambassadors can use the in-app ambassador dashboard to track referrals, statuses, and payout records.",
        },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>SteerSolo Ambassador Program | Refer and earn commissions</title>
        <meta
          name="description"
          content="Explore the SteerSolo Ambassador Program. Learn how to join, share your referral link, and earn commissions from successful referrals."
        />
        <meta name="keywords" content={keywordBank.join(", ")} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://steersolo.com/ambassador-program" />
        <meta property="og:title" content="SteerSolo Ambassador Program" />
        <meta
          property="og:description"
          content="A dedicated page for SteerSolo's ambassador program: join, refer, and earn from successful subscriptions."
        />
        <meta property="og:url" content="https://steersolo.com/ambassador-program" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(pageSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <Navbar />

      <section className="relative pt-28 pb-14 bg-gradient-to-br from-primary/10 via-background to-accent/10 border-b border-border/60 overflow-hidden">
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "radial-gradient(circle, hsl(var(--foreground) / 0.12) 1.2px, transparent 1.2px)", backgroundSize: "24px 24px" }} />
        <div className="relative container mx-auto px-4 max-w-5xl text-center">
          <Badge className="mb-4 bg-accent/10 text-accent border border-accent/25">SteerSolo Growth Program</Badge>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">SteerSolo Ambassador Program</h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-3xl mx-auto">
            A dedicated place to learn how the ambassador program works, who can join, and how you can earn by referring people to SteerSolo.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/auth/login?tab=signup">
              <Button className="rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90">
                Join the Program <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/ambassador">
              <Button variant="outline" className="rounded-xl">
                Open Ambassador Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-14">
        <div className="container mx-auto px-4 max-w-5xl grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><Gift className="w-4 h-4 text-accent" /> Join in minutes</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">Create your account, complete ambassador enrollment details, and receive your referral link.</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><Megaphone className="w-4 h-4 text-accent" /> Share your link</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">Share via WhatsApp, social channels, and direct recommendations to bring new users to SteerSolo.</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><Wallet className="w-4 h-4 text-accent" /> Earn commissions</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">Track referral performance and payouts directly from your ambassador dashboard.</CardContent>
          </Card>
        </div>
      </section>

      <section className="pb-14">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8">
            <h2 className="font-display text-2xl font-bold mb-4">How to participate</h2>
            <ul className="space-y-3 text-sm sm:text-base text-muted-foreground">
              {[
                "Create or log in to your SteerSolo account.",
                "Complete ambassador enrollment details in your dashboard.",
                "Copy your unique referral link.",
                "Invite potential sellers or buyers who need a structured online store experience.",
                "Monitor approved referrals and commission status inside your ambassador page.",
              ].map((step) => (
                <li key={step} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-accent shrink-0" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="font-semibold">Want visibility too?</p>
                <p className="text-sm text-muted-foreground">Read our insights and resources to grow your selling strategy.</p>
              </div>
              <Link to="/insights" className="sm:shrink-0">
                <Button variant="outline" className="rounded-xl">Visit SteerSolo Insights</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AmbassadorProgramPage;
