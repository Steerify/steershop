import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle,
  Clock,
  MessageCircle,
  Sparkles,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  XCircle,
} from "lucide-react";

import Navbar from "@/components/Navbar";
import { TypewriterEffect } from "@/components/TypewriterEffect";
import { Footer } from "@/components/Footer";
import { AdirePattern } from "@/components/patterns/AdirePattern";
import { FeaturedShopsBanner } from "@/components/FeaturedShopsBanner";
import { ShopperDiscovery } from "@/components/ShopperDiscovery";
import { WhySteerSolo } from "@/components/WhySteerSolo";
import { HomepageReviews } from "@/components/HomepageReviews";
import { HowItWorks } from "@/components/HowItWorks";
import { DynamicPricing } from "@/components/DynamicPricing";
import { SocialProofStats } from "@/components/SocialProofStats";
import { Card, CardContent } from "@/components/ui/card";
import { Globe, Shield, Zap, Globe2, DollarSign } from "lucide-react";
import { GoogleOneTap } from "@/components/auth/GoogleOneTap";
import { NigeriaDotMap } from "@/components/NigeriaDotMap";

const painPoints = [
  {
    icon: XCircle,
    pain: '"Send your account details"',
    description: "Repeating payment info in every single DM. Customers drop off.",
  },
  {
    icon: AlertTriangle,
    pain: '"Is this still available?"',
    description: "No catalog. No prices. Customers can't browse — they just leave.",
  },
  {
    icon: XCircle,
    pain: '"I sent the money yesterday"',
    description: "No order tracking. You can't tell who paid and who didn't.",
  },
];

const safeBeautyBadges = [
  { title: "SafeBeauty Listed", detail: "Entry-level verified beauty vendor profile." },
  { title: "SafeBeauty Checked", detail: "At least one product batch checked in our process." },
  { title: "SafeBeauty Trusted", detail: "30+ days active, reviews, and complaint-safe history." },
  { title: "SafeBeauty Verified", detail: "Full verification + stronger trust signal for buyers." },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <GoogleOneTap />
      <Navbar />

      {/* SECTION 1: HERO — Outcome-first with Nigeria Map */}
      <section className="relative pt-28 md:pt-32 pb-12 overflow-hidden bg-mesh">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/8 via-transparent to-transparent pointer-events-none" />
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-primary/20 to-accent/5 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-96 h-96 rounded-full bg-gradient-to-tl from-accent/15 to-transparent blur-[80px] pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            {/* Left: Text Content */}
            <div className="flex-1 text-center lg:text-left space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 text-primary text-sm font-semibold border border-primary/15 shadow-sm animate-fade-up">
                <Sparkles className="w-4 h-4" />
                <span>Built for Nigeria's social-commerce sellers</span>
                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse ml-1" />
              </div>

              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight animate-fade-up text-balance leading-[1.1]" style={{ animationDelay: '80ms' }}>
                Turn your WhatsApp & Instagram audience into a
                <span className="text-accent underline decoration-gold/30"> trusted storefront</span>.
              </h1>

              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mt-4 animate-fade-up" style={{ animationDelay: '120ms' }}>
                Give buyers proof, prices and confidence —
                {" "}
                <TypewriterEffect
                  texts={["before they DM", "", "before they pay", "before they leave"]}
                  className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-gold"
                />
              </h2>

              <p className="text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 animate-fade-up text-balance" style={{ animationDelay: '160ms' }}>
                Most Nigerian online sales start on social apps but fail at trust. SteerSolo gives you a verified store page, structured product catalog, reviews, and payment-ready checkout in minutes.
              </p>

              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 pt-2 animate-fade-up" style={{ animationDelay: '240ms' }}>
                <Link to="/auth/signup">
                  <Button size="lg" className="group bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white text-base px-8 py-6 shadow-xl shadow-primary/25 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-0.5 w-full sm:w-auto font-bold rounded-2xl">
                    Start Free Forever
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </Link>
                <Link to="/demo">
                  <Button size="lg" variant="outline" className="text-base px-8 py-6 w-full sm:w-auto rounded-2xl border-primary/25 hover:bg-primary/5 hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-300 font-semibold">
                    See a Demo Store
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-5 text-sm text-muted-foreground animate-fade-up" style={{ animationDelay: '320ms' }}>
                <div className="flex items-center gap-1.5 bg-card border border-border/60 rounded-full px-4 py-2 shadow-sm hover:border-accent/40 transition-colors">
                  <CheckCircle className="w-4 h-4 text-accent" />
                  Verification-first trust signals
                </div>
                <div className="flex items-center gap-1.5 bg-card border border-border/60 rounded-full px-4 py-2 shadow-sm hover:border-primary/40 transition-colors">
                  <Zap className="w-4 h-4 text-primary" />
                  Free plan to start
                </div>
                <div className="flex items-center gap-1.5 bg-card border border-border/60 rounded-full px-4 py-2 shadow-sm hover:border-gold/40 transition-colors">
                  <Shield className="w-4 h-4 text-gold" />
                  Built for mobile buyers
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-up" style={{ animationDelay: '360ms' }}>
                {[
                  { value: "$8.8B", label: "Nigeria e-commerce (2024)" },
                  { value: "69%", label: "Social commerce penetration" },
                  { value: "95%", label: "Nigerians on WhatsApp" },
                  { value: "82%", label: "Transactions on mobile" },
                ].map((stat) => (
                  <Card key={stat.label} className="p-3 text-center border-border/60">
                    <CardContent className="p-0">
                      <p className="text-lg sm:text-xl font-extrabold text-primary">{stat.value}</p>
                      <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">{stat.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Right: Nigeria Dot Map (Paystack-style) */}
            <div className="hidden lg:block w-[400px] h-[400px] xl:w-[460px] xl:h-[460px] flex-shrink-0 animate-fade-up" style={{ animationDelay: '400ms' }}>
              <NigeriaDotMap />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: PAIN MIRROR */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-destructive mb-3 tracking-widest uppercase">Sound familiar?</p>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold mb-4">
              The everyday selling chaos
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
              You're not losing sales because demand is low — you're losing them because your order process is messy.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {painPoints.map((point) => (
              <div key={point.pain} className="card-spotify p-6 bg-destructive/5 hover:bg-destructive/8">
                <div className="w-12 h-12 bg-destructive/10 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                  <point.icon className="w-6 h-6 text-destructive" />
                </div>
                <h3 className="text-base font-bold mb-2 text-foreground">{point.pain}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{point.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <p className="text-lg font-bold">
              SteerSolo fixes all of this.{" "}
              <span className="text-gradient">In one link.</span>
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 3: WHAT IS STEERSOLO + WHY — Show the solution */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-xs font-bold text-primary tracking-widest uppercase mb-3">Beauty Market Focus</p>
              <h2 className="font-display text-3xl md:text-4xl font-extrabold mb-3">SafeBeauty: our trust layer for beauty sellers</h2>
              <p className="text-muted-foreground max-w-3xl mx-auto">
                We are renovating SteerSolo around beauty-commerce trust: verified sellers, transparent badges, and safer buyer discovery.
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              {safeBeautyBadges.map((badge) => (
                <Card key={badge.title} className="border-primary/15">
                  <CardContent className="p-5">
                    <p className="font-bold text-primary mb-1">{badge.title}</p>
                    <p className="text-sm text-muted-foreground">{badge.detail}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3B: WHAT IS STEERSOLO + WHY — Show the solution */}
      <WhySteerSolo />

      {/* SECTION 4: HOW IT WORKS — Make it feel easy */}
      <HowItWorks />

      {/* SECTION 5: SOCIAL PROOF STATS — Back it up with numbers */}
      <SocialProofStats />

      {/* SECTION 6: REVIEWS — Real people, real trust */}
      <HomepageReviews />

      {/* SECTION 7: FEATURED SHOPS — Show live proof */}
      <FeaturedShopsBanner />

      {/* SECTION 8: PRICING — Now they're ready to buy */}
      <DynamicPricing />

      {/* SECTION 9: SHOPPER DISCOVERY — Secondary value prop */}
      <ShopperDiscovery />

      {/* SECTION 10: FINAL CTA — Close with guarantee */}
      <section className="relative py-24 overflow-hidden">
        {/* Rich gradient BG */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-[hsl(160,50%,28%)] to-accent" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-white/5 blur-3xl" />
        <AdirePattern variant="circles" className="absolute inset-0 text-white" opacity={0.07} />

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/15 backdrop-blur-md text-white text-sm font-semibold mb-8 border border-white/20">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Your first order is closer than you think
            </div>

            <h2 className="font-display text-4xl md:text-5xl font-extrabold text-white mb-6 text-balance leading-tight">
              Your first order could come within 14 days
            </h2>
            <p className="text-xl text-white/75 mb-3 max-w-xl mx-auto">
              Complete your setup milestones and watch your WhatsApp traffic become real orders.
            </p>
            <p className="text-sm text-white/50 mb-10 italic">
              "SteerSolo made my business look professional from day one."
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-10">
              <Link to="/auth/signup">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-bold text-base px-10 py-6 shadow-2xl hover:shadow-white/20 hover:-translate-y-0.5 transition-all duration-300 w-full sm:w-auto rounded-2xl">
                  Start Your Free Store
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/demo">
                <Button size="lg" variant="outline" className="border-2 border-white/30 text-white hover:bg-white/10 font-semibold text-base px-10 py-6 w-full sm:w-auto rounded-2xl transition-all duration-300 hover:-translate-y-0.5">
                  View Demo Store
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap justify-center gap-5 text-sm text-white/65">
              {["Free forever plan", "No credit card required", "Cancel anytime"].map(t => (
                <div key={t} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-white/80" />{t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;


=======
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, Shield, Zap, Sparkles, ShoppingBag, Star, Instagram, MessageCircle, Music2 } from "lucide-react";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FeaturedShopsBanner } from "@/components/FeaturedShopsBanner";
import { ShopperDiscovery } from "@/components/ShopperDiscovery";
import { HomepageReviews } from "@/components/HomepageReviews";
import { SocialProofStats } from "@/components/SocialProofStats";
import { DynamicPricing } from "@/components/DynamicPricing";
import { GoogleOneTap } from "@/components/auth/GoogleOneTap";
import whatsappLogo from "@/assets/social/whatsapp-logo.svg";
import instagramLogo from "@/assets/social/instagram-logo.svg";
import tiktokLogo from "@/assets/social/tiktok-logo.svg";
>>>>>>> 0fd43cc3e1737ce5a28eaa2782251964c93a542f

<<<<<<< HEAD
// import { Link } from "react-router-dom";
// import { ArrowRight, CheckCircle, Shield, Zap, Sparkles, ShoppingBag } from "lucide-react";
// import Navbar from "@/components/Navbar";
// import { Footer } from "@/components/Footer";
// import { FeaturedShopsBanner } from "@/components/FeaturedShopsBanner";
// import { ShopperDiscovery } from "@/components/ShopperDiscovery";
// import { HomepageReviews } from "@/components/HomepageReviews";
// import { DynamicPricing } from "@/components/DynamicPricing";
// import { GoogleOneTap } from "@/components/auth/GoogleOneTap";
=======
/* ─── Photos (real Nigerian vendor imagery) ─── */
const P = {
  heroVendor:   "https://images.unsplash.com/photo-1611432579699-484f7990b127?auto=format&fit=crop&w=800&q=80",
  heroProducts: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80",
  whatsapp:     "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80",
  instagram:    "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=800&q=80",
  tiktok:       "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&w=800&q=80",
  igLogo:       instagramLogo,
  tiktokLogo:   tiktokLogo,
  waLogo:       whatsappLogo,
  trustFace:    "https://images.unsplash.com/photo-1531123414780-f74242c2b052?auto=format&fit=crop&w=800&q=80",
  organic:      "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=800&q=80",
  orders:       "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80",
  storefront:   "https://images.unsplash.com/photo-1604881991720-f91add269bed?auto=format&fit=crop&w=800&q=80",
  av1: "https://images.unsplash.com/photo-1531123414780-f74242c2b052?auto=format&fit=crop&w=200&q=80",
  av2: "https://images.unsplash.com/photo-1611432579699-484f7990b127?auto=format&fit=crop&w=200&q=80",
  av3: "https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&w=200&q=80",
};
>>>>>>> 0fd43cc3e1737ce5a28eaa2782251964c93a542f

<<<<<<< HEAD
// /* ─────────────────────────────────────────────────────
//    PHOTOS — free-to-embed Unsplash
// ───────────────────────────────────────────────────── */
// const P = {
//   heroVendor:  "https://images.unsplash.com/photo-1614257135031-5f1e96ed1b45?auto=format&fit=crop&w=900&q=80",
//   heroProducts:"https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80",
//   whatsapp:    "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=700&q=80",
//   instagram:   "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=700&q=80",
//   tiktok:      "https://images.unsplash.com/photo-1611162616305-c69b3396e46a?auto=format&fit=crop&w=700&q=80",
//   trustFace:   "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=1400&q=80",
//   organic:     "https://images.unsplash.com/photo-1607006344380-b6775a0824a7?auto=format&fit=crop&w=800&q=80",
//   orders:      "https://images.unsplash.com/photo-1586880244406-556ebe35f282?auto=format&fit=crop&w=700&q=80",
//   storefront:  "https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=800&q=80",
//   av1: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=100&q=80",
//   av2: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=100&q=80",
//   av3: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=100&q=80",
// };
=======
/* ─── Data ─── */
const PLATFORMS = [
  {
    name: "WhatsApp",
    dot: "#25D366", dotBg: "rgba(37,211,102,0.1)",
    stat: "95%", statSub: "of Nigerians use it daily",
    problem: "You have a loyal audience, but replying to every message with bank details and catalogs gets exhausting.",
    fix: "Connect your SteerSolo link. Buyers browse your full catalog and checkout instantly, while the verified order drops directly into your WhatsApp.",
    img: P.waLogo,
  },
  {
    name: "Instagram",
    dot: "#E1306C", dotBg: "rgba(225,48,108,0.1)",
    stat: "69%", statSub: "social commerce penetration in Nigeria",
    problem: "Your grid looks stunning and draws people in, but 'DM to order' creates friction that loses impulse buyers.",
    fix: "Put your SteerSolo store link in your bio. Capitalize on your aesthetic by letting buyers purchase immediately without waiting for a DM reply.",
    img: P.igLogo,
  },
  {
    name: "TikTok",
    dot: "#888", dotBg: "rgba(100,100,100,0.08)",
    stat: "#1", statSub: "beauty content platform globally",
    problem: "You post amazing content that goes viral, but you can't easily capture the massive traffic it generates.",
    fix: "Convert virality into revenue. Funnel your viewers straight to your SteerSolo checkout link and maximize your earning potential.",
    img: P.tiktokLogo,
  },
];
>>>>>>> 0fd43cc3e1737ce5a28eaa2782251964c93a542f

<<<<<<< HEAD
// /* ─────────────────────────────────────────────────────
//    DATA
// ───────────────────────────────────────────────────── */
// const PLATFORMS = [
//   {
//     name: "WhatsApp",
//     dot: "#25D366", dotBg: "rgba(37,211,102,0.1)",
//     stat: "95%", statSub: "of Nigerians use it daily",
//     problem: "You repeat account details in every DM. Buyers lose patience and drop off before paying.",
//     fix: "One SteerSolo link holds your catalog, prices, reviews, and checkout. Paste it once, forever.",
//     img: P.whatsapp,
//   },
//   {
//     name: "Instagram",
//     dot: "#E1306C", dotBg: "rgba(225,48,108,0.1)",
//     stat: "69%", statSub: "social commerce penetration in Nigeria",
//     problem: "Your grid looks stunning but there's nowhere to buy. Buyers DM, you respond late, the sale dies.",
//     fix: "A verified SteerSolo store page in your bio turns every post into a trust signal with a buy button.",
//     img: P.instagram,
//   },
//   {
//     name: "TikTok",
//     dot: "#555", dotBg: "rgba(0,0,0,0.06)",
//     stat: "#1", statSub: "beauty content platform globally",
//     problem: "You go viral, get 50K views, and make five sales. No storefront to capture the traffic you earned.",
//     fix: "Viral TikTok → bio link → SteerSolo store. Every view finally lands somewhere that can convert.",
//     img: P.tiktok,
//   },
// ];
=======
type Platform = (typeof PLATFORMS)[number];

const PlatformLogo = ({ platform }: { platform: Platform }) => {
  const [hasImageError, setHasImageError] = useState(false);

  const iconMap = {
    WhatsApp: MessageCircle,
    Instagram,
    TikTok: Music2,
  } as const;

  const Icon = iconMap[platform.name as keyof typeof iconMap];

  if (!hasImageError) {
    return (
      <img
        src={platform.img}
        alt={`${platform.name} logo`}
        style={{ width: "40%", height: "auto", objectFit: "contain" }}
        onError={() => setHasImageError(true)}
      />
    );
  }

  return (
    <div
      style={{
        width: 92,
        height: 92,
        borderRadius: 9999,
        background: platform.dotBg,
        border: `2px solid ${platform.dot}40`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      aria-label={`${platform.name} icon`}
    >
      <Icon style={{ width: 42, height: 42, color: platform.dot }} />
    </div>
  );
};

const JOURNEY = [
  { n:"01", title:"Keep your existing audience",      body:"Don't leave WhatsApp or Instagram. SteerSolo lives behind your social presence as your store." },
  { n:"02", title:"Paste your SteerSolo link once",   body:"IG bio, WhatsApp status, TikTok profile. One link — catalog, prices, reviews, checkout included." },
  { n:"03", title:"Buyers see proof before they pay", body:"Your SafeBeauty badge, product photos, and real reviews load instantly. No DM required." },
  { n:"04", title:"Orders arrive structured",          body:"No more 'I sent it yesterday'. Every order tracked, every payment confirmed, every buyer recorded." },
];
>>>>>>> 0fd43cc3e1737ce5a28eaa2782251964c93a542f

<<<<<<< HEAD
// const JOURNEY = [
//   { n:"01", title:"Keep your existing audience",     body:"Don't leave WhatsApp or Instagram. SteerSolo lives behind your social presence as your store." },
//   { n:"02", title:"Paste your SteerSolo link once",  body:"IG bio, WhatsApp status, TikTok profile. One link — catalog, prices, reviews, checkout included." },
//   { n:"03", title:"Buyers see proof before they pay",body:"Your SafeBeauty badge, product photos, and real reviews load instantly. No DM required." },
//   { n:"04", title:"Orders arrive structured",         body:"No more 'I sent it yesterday'. Every order tracked, every payment confirmed, every buyer recorded." },
// ];
=======
const BADGES = [
  { num:"01", label:"SafeBeauty Listed",   desc:"Vendor verified, store live. Entry-level trust signal for new buyers.",                      top:false },
  { num:"02", label:"SafeBeauty Checked",  desc:"At least one product batch confirmed genuine through our process.",                           top:false },
  { num:"03", label:"SafeBeauty Trusted",  desc:"30+ days active, real buyer reviews, zero unresolved complaints.",                            top:false },
  { num:"04", label:"SafeBeauty Verified", desc:"Full NAFDAC-aligned identity check — the highest trust signal on the platform.",               top:true  },
];
>>>>>>> 0fd43cc3e1737ce5a28eaa2782251964c93a542f

// const BADGES = [
//   { num:"01", label:"SafeBeauty Listed",   desc:"Vendor verified, store live. Entry-level trust signal for new buyers.", gold:false },
//   { num:"02", label:"SafeBeauty Checked",  desc:"At least one product batch confirmed genuine through our process.", gold:false },
//   { num:"03", label:"SafeBeauty Trusted",  desc:"30+ days active, real buyer reviews, zero unresolved complaints.", gold:false },
//   { num:"04", label:"SafeBeauty Verified", desc:"Full NAFDAC-aligned identity check — the highest trust signal on the platform.", gold:true },
// ];

<<<<<<< HEAD
// const TESTIMONIALS = [
//   { quote:"I used to spend 3 hours a day answering the same DMs. Now I paste my link and the store does the talking.", name:"Chidera O.", role:"Skincare vendor · Lagos", av:P.av1 },
//   { quote:"My TikTok blew up and I had nowhere to send people. SteerSolo fixed that overnight.",                       name:"Amara S.",  role:"Makeup artist · Abuja",      av:P.av2 },
//   { quote:"The SafeBeauty badge made buyers stop questioning if my products are real. Sales doubled in 6 weeks.",      name:"Fatima B.", role:"Natural beauty vendor · Kano", av:P.av3 },
// ];
=======
const STATS = [
  { v:"$10.17B", l:"Nigeria beauty market 2025" },
  { v:"95%",     l:"Nigerians on WhatsApp" },
  { v:"67%",     l:"Online beauty items likely counterfeit" },
  { v:"500K+",   l:"Beauty micro-vendors on social" },
];
>>>>>>> 0fd43cc3e1737ce5a28eaa2782251964c93a542f

<<<<<<< HEAD
// /* ─────────────────────────────────────────────────────
//    GLOBAL STYLES
// ───────────────────────────────────────────────────── */
// const GS = () => (
//   <style>{`
//     @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
//     :root{--cream:#FDF6EE;--terra:#C4622D;--forest:#1B4332;--gold:#C9963E;--ink:#1A1208;--muted:#7A6652;--blush:#F5E6DA;}
//     .ss-d{font-family:'Cormorant Garamond',Georgia,serif;}
//     .ss-s{font-family:'DM Sans',sans-serif;}
//     @keyframes tick{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
//     .ticker{animation:tick 32s linear infinite;width:max-content;}
//     .zoom img{transition:transform .7s ease;}
//     .zoom:hover img{transform:scale(1.05);}
//     .lift{transition:transform .28s ease,box-shadow .28s ease;}
//     .lift:hover{transform:translateY(-5px);box-shadow:0 20px 50px rgba(196,98,45,.14);}
//     @keyframes fu{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
//     .f1{animation:fu .7s ease both;}
//     .f2{animation:fu .7s .13s ease both;}
//     .f3{animation:fu .7s .26s ease both;}
//     .f4{animation:fu .7s .39s ease both;}
//   `}</style>
// );
=======
/* ═══════════════════════════════════════════════════════ PAGE ═══ */
const Index = () => (
  <div className="font-sans overflow-x-hidden bg-background text-foreground">

    {/* Shared micro-animation CSS */}
    <style>{`
      @keyframes tick{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
      .img-zoom img,.img-zoom{transition:transform .7s ease;}
      .img-zoom:hover img,.img-zoom:hover{transform:scale(1.04);}
      .lift{transition:transform .28s ease,box-shadow .28s ease;}
      .lift:hover{transform:translateY(-5px);box-shadow:0 20px 50px rgba(33,54,102,.14);}
      @keyframes fu{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
      .f1{animation:fu .65s ease both;}
      .f2{animation:fu .65s .12s ease both;}
      .f3{animation:fu .65s .24s ease both;}
      .f4{animation:fu .65s .36s ease both;}
    `}</style>

    <GoogleOneTap />
    <Navbar />
>>>>>>> 0fd43cc3e1737ce5a28eaa2782251964c93a542f

<<<<<<< HEAD
// /* ─────────────────────────────────────────────────────
//    PAGE
// ───────────────────────────────────────────────────── */
// const Index = () => (
//   <div className="ss-s" style={{background:"var(--cream)",color:"var(--ink)"}}>
//     <GS />
//     <GoogleOneTap />
//     <Navbar />
=======
    {/* ══════════════════════════════════════════════════════
        §1  HERO — Always dark Adire Indigo
    ══════════════════════════════════════════════════════ */}
    <section
      className="bg-brand-hero"
      style={{
        minHeight: "92vh",
        position: "relative",
        overflow: "hidden",
        paddingTop: 84,
      }}>
>>>>>>> 0fd43cc3e1737ce5a28eaa2782251964c93a542f

<<<<<<< HEAD
//     {/* ══ §1  HERO ══════════════════════════════════════ */}
//     <section className="relative overflow-hidden pt-24" style={{background:"var(--forest)",minHeight:"90vh"}}>
//       {/* diagonal texture */}
//       <div className="absolute inset-0 pointer-events-none opacity-[0.05]" style={{backgroundImage:"repeating-linear-gradient(-55deg,transparent,transparent 48px,rgba(255,255,255,.7) 48px,rgba(255,255,255,.7) 49px)"}}/>
//       {/* warm glow */}
//       <div className="absolute top-0 right-0 w-3/5 h-full pointer-events-none" style={{background:"radial-gradient(ellipse at 85% 30%,rgba(196,98,45,.22) 0%,transparent 65%)"}}/>
=======
      {/* subtle adire diagonal texture */}
      <div style={{
        position:"absolute",inset:0,pointerEvents:"none",opacity:0.035,
        backgroundImage:"repeating-linear-gradient(-55deg,transparent,transparent 48px,rgba(255,255,255,.9) 48px,rgba(255,255,255,.9) 49px)",
      }}/>
      {/* accent glow — bottom right */}
      <div style={{
        position:"absolute",bottom:"-10%",right:"-5%",width:"55%",height:"70%",
        pointerEvents:"none",
        background:"radial-gradient(ellipse at 80% 80%, hsl(var(--accent) / 0.15) 0%, transparent 65%)",
      }}/>
      {/* soft indigo glow — top left */}
      <div style={{
        position:"absolute",top:"-10%",left:"-5%",width:"40%",height:"50%",
        pointerEvents:"none",
        background:"radial-gradient(ellipse at 20% 20%, hsl(var(--brand-blue-strong) / 0.35) 0%, transparent 65%)",
      }}/>
>>>>>>> 0fd43cc3e1737ce5a28eaa2782251964c93a542f

<<<<<<< HEAD
//       <div className="container mx-auto px-6 lg:px-14 relative z-10">
//         <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16 py-16 lg:py-24">
=======
      <div style={{ maxWidth:1200,margin:"0 auto",padding:"0 1.25rem",position:"relative",zIndex:10 }}>
        <div style={{ display:"flex",flexWrap:"wrap",alignItems:"center",gap:"2rem",paddingBottom:"2.5rem" }}>

          {/* ── TEXT ── */}
          <div style={{ flex:"1 1 420px",maxWidth:560 }} className="f1">

            {/* eyebrow */}
            <div style={{
              display:"inline-flex",alignItems:"center",gap:8,marginBottom:28,
              borderBottom:`1.5px solid rgba(255,255,255,0.3)`,paddingBottom:6,
            }}>
              <Sparkles style={{ width:14,height:14,color:"rgba(255,255,255,0.6)" }} />
              <span style={{ fontSize:"0.72rem",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.22em",color:"rgba(255,255,255,0.6)" }}>
                For WhatsApp · Instagram · TikTok vendors
              </span>
            </div>
>>>>>>> 0fd43cc3e1737ce5a28eaa2782251964c93a542f

<<<<<<< HEAD
//           {/* text */}
//           <div className="flex-1 max-w-2xl f1">
//             <div className="inline-flex items-center gap-2 mb-7" style={{borderBottom:"1.5px solid var(--gold)",paddingBottom:6}}>
//               <Sparkles className="w-3.5 h-3.5" style={{color:"var(--gold)"}}/>
//               <span className="text-xs font-semibold uppercase tracking-[0.2em]" style={{color:"var(--gold)"}}>
//                 For WhatsApp · Instagram · TikTok vendors
//               </span>
//             </div>
=======
            <h1 style={{ fontWeight:800,color:"#fff",lineHeight:1.08,marginBottom:20,fontSize:"clamp(2.15rem,4.25vw,3.8rem)" }}>
              You already have<br />
              the audience.<br />
              <em style={{ fontStyle:"normal",color:"hsl(var(--accent-bright))" }}>Give them somewhere to buy.</em>
            </h1>
>>>>>>> 0fd43cc3e1737ce5a28eaa2782251964c93a542f

<<<<<<< HEAD
//             <h1 className="ss-d font-bold text-white leading-[1.04] mb-6" style={{fontSize:"clamp(2.8rem,5.5vw,4.8rem)"}}>
//               You already have<br/>
//               the audience.<br/>
//               <em style={{color:"var(--gold)"}}>Give them somewhere to buy.</em>
//             </h1>
=======
            <p style={{ fontSize:"clamp(1rem,1.35vw,1.08rem)",lineHeight:1.65,color:"rgba(255,255,255,.62)",fontWeight:300,maxWidth:500,marginBottom:30 }}>
              500,000+ Nigerian beauty vendors sell on social media every day — and lose buyers
              because there's nowhere to send them after the DM. SteerSolo is that place.
            </p>
>>>>>>> 0fd43cc3e1737ce5a28eaa2782251964c93a542f

<<<<<<< HEAD
//             <p className="text-lg leading-relaxed mb-10" style={{color:"rgba(255,255,255,.6)",fontWeight:300,maxWidth:520}}>
//               500,000+ Nigerian beauty vendors sell on social media every day — and lose buyers
//               because there's nowhere to send them after the DM. SteerSolo is that place.
//             </p>
=======
            {/* CTAs */}
            <div style={{ display:"flex",flexWrap:"wrap",gap:14,marginBottom:28 }} className="f2">
              <Link to="/auth/signup">
                <button style={{
                  display:"flex",alignItems:"center",gap:10,padding:"12px 26px",
                  borderRadius:9999,fontWeight:700,fontSize:"1rem",color:"hsl(var(--primary))",
                  background:"#fff",
                  boxShadow:`0 8px 32px rgba(0,0,0,0.25)`,
                  border:"none",cursor:"pointer",
                  transition:"all .25s ease",
                }}
                  onMouseEnter={e=>(e.currentTarget.style.transform="translateY(-2px)")}
                  onMouseLeave={e=>(e.currentTarget.style.transform="translateY(0)")}>
                  Claim your free store
                  <ArrowRight style={{ width:16,height:16 }} />
                </button>
              </Link>
              <Link to="/demo">
                <button style={{
                  display:"flex",alignItems:"center",gap:8,padding:"12px 24px",
                  borderRadius:9999,fontWeight:600,fontSize:"0.9rem",
                  background:"rgba(255,255,255,0.12)",border:"1.5px solid rgba(255,255,255,0.25)",
                  color:"#fff",cursor:"pointer",transition:"all .25s ease",
                  backdropFilter:"blur(10px)",
                }}
                  onMouseEnter={e=>(e.currentTarget.style.background="rgba(255,255,255,0.2)")}
                  onMouseLeave={e=>(e.currentTarget.style.background="rgba(255,255,255,0.12)")}>
                  See a demo store
                </button>
              </Link>
            </div>
>>>>>>> 0fd43cc3e1737ce5a28eaa2782251964c93a542f

<<<<<<< HEAD
//             <div className="flex flex-col sm:flex-row gap-4 f2">
//               <Link to="/auth/signup">
//                 <button className="group flex items-center gap-3 px-8 py-4 rounded-full font-semibold text-white text-base transition-all hover:-translate-y-0.5"
//                   style={{background:"var(--terra)",boxShadow:"0 8px 30px rgba(196,98,45,.45)"}}>
//                   Claim your free store
//                   <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform"/>
//                 </button>
//               </Link>
//               <Link to="/demo">
//                 <button className="flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-sm transition-all hover:bg-white/10"
//                   style={{border:"1.5px solid rgba(255,255,255,.25)",color:"rgba(255,255,255,.8)"}}>
//                   See a demo store
//                 </button>
//               </Link>
//             </div>
=======
            {/* trust pills */}
            <div style={{ display:"flex",flexWrap:"wrap",gap:10 }} className="f3">
              {[{I:CheckCircle,t:"Verification-first"},{I:Zap,t:"Free plan to start"},{I:Shield,t:"SafeBeauty certified"}]
                .map(({I,t})=>(
                  <span key={t} style={{
                    display:"inline-flex",alignItems:"center",gap:6,fontSize:"0.75rem",
                    padding:"6px 14px",borderRadius:9999,fontWeight:500,
                    background:"rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.75)",
                  }}>
                    <I style={{ width:13,height:13 }}/>{t}
                  </span>
                ))}
            </div>
          </div>
>>>>>>> 0fd43cc3e1737ce5a28eaa2782251964c93a542f

<<<<<<< HEAD
//             <div className="flex flex-wrap gap-3 mt-8 f3">
//               {[{I:CheckCircle,t:"Verification-first"},{I:Zap,t:"Free plan to start"},{I:Shield,t:"SafeBeauty certified"}]
//                 .map(({I,t})=>(
//                 <span key={t} className="inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-full font-medium"
//                   style={{background:"rgba(201,150,62,.15)",color:"var(--gold)"}}>
//                   <I className="w-3.5 h-3.5"/>{t}
//                 </span>
//               ))}
//             </div>
//           </div>
=======
          {/* ── PHOTO MOSAIC ── */}
          <div style={{ display:"flex",flexDirection:"column",gap:12,width:"clamp(280px,30vw,400px)",flexShrink:0 }} className="f2 hidden lg:flex">
            <div className="img-zoom" style={{ overflow:"hidden",borderRadius:24,height:280,boxShadow:"0 24px 48px rgba(0,0,0,0.35)" }}>
              <img src={P.heroVendor} alt="Nigerian beauty vendor" style={{ width:"100%",height:"100%",objectFit:"cover" }}/>
            </div>
            <div style={{ display:"flex",gap:12 }}>
              <div className="img-zoom" style={{ overflow:"hidden",borderRadius:18,flex:1,height:160,boxShadow:"0 12px 32px rgba(0,0,0,0.28)" }}>
                <img src={P.heroProducts} alt="Beauty products" style={{ width:"100%",height:"100%",objectFit:"cover" }}/>
              </div>
              <div className="img-zoom" style={{ overflow:"hidden",borderRadius:18,flex:1,height:160,boxShadow:"0 12px 32px rgba(0,0,0,0.28)" }}>
                <img src={P.organic} alt="Natural beauty" style={{ width:"100%",height:"100%",objectFit:"cover" }}/>
              </div>
            </div>
          </div>
        </div>
>>>>>>> 0fd43cc3e1737ce5a28eaa2782251964c93a542f

<<<<<<< HEAD
//           {/* photo mosaic */}
//           <div className="hidden lg:flex flex-col gap-3 w-[370px] xl:w-[420px] flex-shrink-0 f2">
//             <div className="zoom overflow-hidden rounded-3xl" style={{height:290}}>
//               <img src={P.heroVendor} alt="Nigerian beauty vendor" className="w-full h-full object-cover"/>
//             </div>
//             <div className="flex gap-3">
//               <div className="zoom overflow-hidden rounded-2xl flex-1" style={{height:175}}>
//                 <img src={P.heroProducts} alt="Beauty products" className="w-full h-full object-cover"/>
//               </div>
//               <div className="zoom overflow-hidden rounded-2xl flex-1" style={{height:175}}>
//                 <img src={P.organic} alt="Natural beauty" className="w-full h-full object-cover"/>
//               </div>
//             </div>
//           </div>
//         </div>
=======
        {/* ── STAT STRIP ── */}
        <div className="f4 stat-grid" style={{ display:"grid",gridTemplateColumns:"repeat(2,1fr)",borderTop:"1px solid rgba(255,255,255,.1)" }}>
          <style>{`@media(min-width:768px){.stat-grid{grid-template-columns:repeat(4,1fr)!important;}}`}</style>
          {STATS.map((s,i)=>(
            <div key={s.l} style={{
              padding:"28px 20px",textAlign:"center",
              borderRight: i < 3 ? "1px solid rgba(255,255,255,.08)" : "none",
            }}>
              <p style={{ fontWeight:800,color:"#fff",fontSize:"clamp(1.35rem,2.2vw,2rem)",marginBottom:4 }}>{s.v}</p>
              <p style={{ fontSize:"0.72rem",color:"rgba(255,255,255,.38)",lineHeight:1.4 }}>{s.l}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="bg-background py-10 md:py-14 border-b border-border/50">
      <div className="max-w-6xl mx-auto px-5">
        <div className="text-center max-w-3xl mx-auto mb-8">
          <p className="text-xs uppercase tracking-wider font-semibold text-primary mb-2">How SteerSolo works</p>
          <h2 className="text-2xl md:text-4xl font-extrabold mb-3">Everything you need to sell from social media — explained simply</h2>
          <p className="text-muted-foreground text-sm md:text-base">
            Keep posting on WhatsApp, Instagram, and TikTok. SteerSolo handles your storefront, trust, and checkout in one link.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {[
            { title: "1) Set up your store", desc: "Add products, pricing, delivery info, and payment details in minutes.", icon: ShoppingBag },
            { title: "2) Share one link", desc: "Put your SteerSolo link in your bio, status, and captions so buyers can order instantly.", icon: ArrowRight },
            { title: "3) Track and grow", desc: "Manage orders, build trust with verification badges, and scale with marketing tools.", icon: Star },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-border/60 bg-card p-5 text-left">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                <item.icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold mb-1">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/auth/signup" className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-semibold hover:opacity-90">
            Start free
          </Link>
          <Link to="/demo" className="inline-flex items-center justify-center rounded-full border border-border px-6 py-3 text-sm font-semibold hover:bg-muted">
            See demo store
          </Link>
        </div>
      </div>
    </section>
>>>>>>> 0fd43cc3e1737ce5a28eaa2782251964c93a542f

<<<<<<< HEAD
//         {/* stat strip */}
//         <div className="grid grid-cols-2 lg:grid-cols-4 gap-px f4"
//           style={{borderTop:"1px solid rgba(255,255,255,.1)"}}>
//           {[
//             {v:"$10.17B",l:"Nigeria beauty market 2025"},
//             {v:"95%",    l:"Nigerians on WhatsApp"},
//             {v:"67%",    l:"Online beauty items likely counterfeit"},
//             {v:"500K+",  l:"Beauty micro-vendors on social"},
//           ].map(s=>(
//             <div key={s.l} className="py-7 px-5 text-center" style={{borderRight:"1px solid rgba(255,255,255,.07)"}}>
//               <p className="ss-d font-bold text-white" style={{fontSize:"clamp(1.7rem,3vw,2.4rem)"}}>{s.v}</p>
//               <p className="text-xs mt-1" style={{color:"rgba(255,255,255,.38)"}}>{s.l}</p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
=======
    {/* ══ social proof modules (moved above deep-dive sections) ════════════ */}
    <section className="bg-background pt-8 md:pt-12">
      <FeaturedShopsBanner />
    </section>
    <section className="bg-background mt-4 md:mt-6">
      <HomepageReviews />
    </section>

    {/* ══════════════════════════════════════════════════════
        §2  TICKER — Accent green strip
    ══════════════════════════════════════════════════════ */}
    <div style={{ overflow:"hidden",padding:"14px 0",background:"hsl(var(--accent))" }}>
      <div style={{ animation:"tick 32s linear infinite",width:"max-content",display:"flex",alignItems:"center" }}>
        {Array(2).fill([
          "Nigeria's Only Verified Beauty Marketplace",
          "Real Products · Real Sellers · Real Results",
          "NAFDAC-Aligned Verification",
          "Works on WhatsApp · Instagram · TikTok",
          "Free to Start · Paid When You Grow",
          "SafeBeauty — Your Michelin Star for Trust",
        ]).flat().map((t,i)=>(
          <span key={i} style={{
            display:"inline-flex",alignItems:"center",gap:20,padding:"0 28px",
            fontSize:"0.82rem",fontWeight:700,letterSpacing:"0.04em",
            color:"#fff",whiteSpace:"nowrap",
          }}>
            <span style={{ color:"rgba(255,255,255,0.4)",fontSize:"0.45rem" }}>◆</span>{t}
          </span>
        ))}
      </div>
    </div>
>>>>>>> 0fd43cc3e1737ce5a28eaa2782251964c93a542f

<<<<<<< HEAD
//     {/* ══ §2  TICKER ════════════════════════════════════ */}
//     <div className="overflow-hidden py-4" style={{background:"var(--terra)"}}>
//       <div className="ticker flex items-center gap-0 whitespace-nowrap">
//         {Array(2).fill([
//           "Nigeria's Only Verified Beauty Marketplace",
//           "Real Products · Real Sellers · Real Results",
//           "NAFDAC-Aligned Verification",
//           "Works on WhatsApp · Instagram · TikTok",
//           "Free to Start · Paid When You Grow",
//           "SafeBeauty — Your Michelin Star for Trust",
//         ]).flat().map((t,i)=>(
//           <span key={i} className="inline-flex items-center gap-5 px-7 text-sm font-medium tracking-wide" style={{color:"rgba(255,255,255,.9)"}}>
//             <span style={{color:"rgba(255,255,255,.35)",fontSize:"0.48rem"}}>◆</span>{t}
//           </span>
//         ))}
//       </div>
//     </div>
=======
    {/* ══════════════════════════════════════════════════════
        §3  PAIN MIRROR — Theme-aware background
    ══════════════════════════════════════════════════════ */}
    <section className="py-24 bg-background">
      <div style={{ maxWidth:1000,margin:"0 auto",padding:"0 1.5rem" }}>
        <div style={{ textAlign:"center",marginBottom:64 }}>
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-4">
            Sound familiar?
          </p>
          <h2 className="text-foreground font-extrabold" style={{ lineHeight:1.2,fontSize:"clamp(1.9rem,4vw,3rem)",margin:0 }}>
            SteerSolo removes 3 questions<br />
            <span className="text-primary">from the minds of your customers.</span>
          </h2>
        </div>
>>>>>>> 0fd43cc3e1737ce5a28eaa2782251964c93a542f

<<<<<<< HEAD
//     {/* ══ §3  PAIN MIRROR ═══════════════════════════════ */}
//     <section className="py-24" style={{background:"var(--cream)"}}>
//       <div className="container mx-auto px-6 lg:px-14 max-w-5xl">
//         <div className="text-center mb-16">
//           <p className="text-xs font-semibold uppercase tracking-[0.22em] mb-4" style={{color:"var(--terra)"}}>
//             Sound familiar?
//           </p>
//           <h2 className="ss-d font-bold leading-tight" style={{fontSize:"clamp(2rem,4vw,3.2rem)",color:"var(--ink)"}}>
//             The selling chaos that kills<br/>
//             <em style={{color:"var(--terra)"}}>legitimate businesses every day.</em>
//           </h2>
//         </div>
=======
        <style>{`@media(min-width:768px){.pain-grid{grid-template-columns:repeat(3,1fr)!important;}}`}</style>
        <div className="pain-grid" style={{ display:"grid",gap:48 }}>
          {[
            { q:'"What do you sell?"',     b:"Buyers hate guessing. SteerSolo gives you a beautiful catalog that shows exactly what you offer, instantly." },
            { q:'"How much is it?"',       b:"Hide-and-seek pricing kills sales. Clear prices and discounts build urgent trust and convert faster." },
            { q:'"How do I pay?"',         b:"No more sending account numbers manually. Secure checkout is built-in." },
          ].map(p=>(
            <div key={p.q} style={{ display:"flex",flexDirection:"column",gap:16 }}>
              <p className="text-foreground font-bold" style={{ fontSize:"1.25rem",margin:0 }}>{p.q}</p>
              <div className="bg-primary" style={{ width:40,height:2,borderRadius:9 }}/>
              <p className="text-muted-foreground" style={{ fontSize:"0.9rem",lineHeight:1.7,margin:0 }}>{p.b}</p>
            </div>
          ))}
        </div>
>>>>>>> 0fd43cc3e1737ce5a28eaa2782251964c93a542f

<<<<<<< HEAD
//         <div className="grid md:grid-cols-3 gap-12">
//           {[
//             {q:'"Send your account details"',     b:"Repeated in every DM, every sale. Buyers lose patience and leave before they ever pay."},
//             {q:'"Is this still available?"',       b:"No catalog, no prices. Buyers can't browse so they bounce to the next page instead."},
//             {q:'"I sent the money yesterday"',     b:"No order tracking. You can't tell who paid, who's pending, or who has gone quiet."},
//           ].map(p=>(
//             <div key={p.q} className="flex flex-col gap-4">
//               <p className="ss-d italic font-semibold" style={{fontSize:"1.4rem",color:"var(--ink)"}}>{p.q}</p>
//               <div className="w-10 h-[1.5px]" style={{background:"var(--terra)"}}/>
//               <p className="text-sm leading-relaxed" style={{color:"var(--muted)"}}>{p.b}</p>
//             </div>
//           ))}
//         </div>
=======
        <div className="bg-primary/5 rounded-2xl p-6 md:p-8 mt-12 border border-primary/20 text-center shadow-sm">
          <p className="text-foreground font-bold" style={{ fontSize:"1.4rem", margin:0, display:"flex", alignItems:"center", justifyContent:"center", gap:"10px" }}>
            <span style={{ fontSize:"1.8rem" }}>💬</span> And the best part?
          </p>
          <p className="text-primary font-extrabold" style={{ fontSize:"1.7rem", margin:"12px 0 0" }}>
            Every order goes straight to your WhatsApp!
          </p>
        </div>
      </div>
    </section>
>>>>>>> 0fd43cc3e1737ce5a28eaa2782251964c93a542f

<<<<<<< HEAD
//         <p className="ss-d text-center mt-16 font-semibold italic" style={{fontSize:"1.5rem",color:"var(--forest)"}}>
//           SteerSolo fixes all of this — in one link.
//         </p>
//       </div>
//     </section>
=======
    {/* ══════════════════════════════════════════════════════
        §4  PLATFORM BREAKDOWN — Theme-aware secondary bg
    ══════════════════════════════════════════════════════ */}
    <section className="py-24 bg-secondary/40">
      <div style={{ maxWidth:1200,margin:"0 auto",padding:"0 1.5rem" }}>
        <div style={{ textAlign:"center",marginBottom:64 }}>
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-4">
            The platforms you're already on
          </p>
          <h2 className="text-foreground font-extrabold" style={{ lineHeight:1.2,fontSize:"clamp(1.9rem,4vw,3rem)",margin:0 }}>
            Supercharge your social presence.<br />
            <span className="text-primary">Turn every view into a seamless sale for Nigerian shoppers.</span>
          </h2>
        </div>
>>>>>>> 0fd43cc3e1737ce5a28eaa2782251964c93a542f

<<<<<<< HEAD
//     {/* ══ §4  PLATFORM BREAKDOWN ════════════════════════ */}
//     <section className="py-24" style={{background:"var(--blush)"}}>
//       <div className="container mx-auto px-6 lg:px-14 max-w-6xl">
//         <div className="text-center mb-16">
//           <p className="text-xs font-semibold uppercase tracking-[0.22em] mb-4" style={{color:"var(--terra)"}}>
//             The platforms you're already on
//           </p>
//           <h2 className="ss-d font-bold leading-tight" style={{fontSize:"clamp(2rem,4vw,3rem)",color:"var(--ink)"}}>
//             Same problem. Every app.<br/>
//             <em style={{color:"var(--terra)"}}>SteerSolo solves it once.</em>
//           </h2>
//         </div>
=======
        <style>{`@media(min-width:1024px){.platform-grid{grid-template-columns:repeat(3,1fr)!important;}}`}</style>
        <div className="platform-grid" style={{ display:"grid",gap:24 }}>
          {PLATFORMS.map(pl=>(
            <div key={pl.name} className="lift card-elevated" style={{
              borderRadius:24,overflow:"hidden",
            }}>
              <div className="img-zoom" style={{ height:200,overflow:"hidden", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.02)" }}>
                <PlatformLogo platform={pl} />
              </div>
              <div className="bg-card" style={{ padding:28 }}>
                <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:6 }}>
                  <span style={{ width:10,height:10,borderRadius:"50%",background:pl.dot,display:"inline-block" }}/>
                  <span className="text-foreground font-semibold">{pl.name}</span>
                  <span style={{ marginLeft:"auto",fontSize:"0.72rem",padding:"3px 12px",borderRadius:9999,fontWeight:700,background:pl.dotBg,color:pl.dot }}>
                    {pl.stat}
                  </span>
                </div>
                <p className="text-muted-foreground" style={{ fontSize:"0.72rem",marginBottom:20,marginTop:0 }}>{pl.statSub}</p>
                <div className="bg-destructive/5" style={{ borderRadius:12,padding:16,marginBottom:12 }}>
                  <p style={{ fontSize:"0.65rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em",color:"hsl(0,65%,45%)",marginBottom:4,margin:0 }}>The bottleneck</p>
                  <p className="text-muted-foreground" style={{ fontSize:"0.85rem",lineHeight:1.65,margin:"6px 0 0" }}>{pl.problem}</p>
                </div>
                <div className="bg-primary/5" style={{ borderRadius:12,padding:16 }}>
                  <p className="text-primary" style={{ fontSize:"0.65rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em",margin:0 }}>The SteerSolo Advantage</p>
                  <p className="text-muted-foreground" style={{ fontSize:"0.85rem",lineHeight:1.65,margin:"6px 0 0" }}>{pl.fix}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
>>>>>>> 0fd43cc3e1737ce5a28eaa2782251964c93a542f

<<<<<<< HEAD
//         <div className="grid lg:grid-cols-3 gap-6">
//           {PLATFORMS.map(pl=>(
//             <div key={pl.name} className="lift rounded-3xl overflow-hidden bg-white" style={{border:"1px solid rgba(0,0,0,.07)"}}>
//               <div className="zoom overflow-hidden" style={{height:200}}>
//                 <img src={pl.img} alt={pl.name} className="w-full h-full object-cover"/>
//               </div>
//               <div className="p-7">
//                 <div className="flex items-center gap-3 mb-2">
//                   <span className="w-3 h-3 rounded-full" style={{background:pl.dot}}/>
//                   <span className="font-semibold" style={{color:"var(--ink)"}}>{pl.name}</span>
//                   <span className="ml-auto text-xs px-3 py-1 rounded-full font-bold" style={{background:pl.dotBg,color:pl.dot}}>
//                     {pl.stat}
//                   </span>
//                 </div>
//                 <p className="text-xs mb-5" style={{color:"var(--muted)"}}>{pl.statSub}</p>
//                 <div className="rounded-xl p-4 mb-3" style={{background:"rgba(196,98,45,.06)"}}>
//                   <p className="text-[11px] font-semibold uppercase tracking-wide mb-1" style={{color:"var(--terra)"}}>The problem</p>
//                   <p className="text-sm leading-relaxed" style={{color:"var(--muted)"}}>{pl.problem}</p>
//                 </div>
//                 <div className="rounded-xl p-4" style={{background:"rgba(27,67,50,.06)"}}>
//                   <p className="text-[11px] font-semibold uppercase tracking-wide mb-1" style={{color:"var(--forest)"}}>SteerSolo fix</p>
//                   <p className="text-sm leading-relaxed" style={{color:"var(--muted)"}}>{pl.fix}</p>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
=======
    {/* ══════════════════════════════════════════════════════
        §5  FULL-BLEED QUOTE — Always dark overlay
    ══════════════════════════════════════════════════════ */}
    <div style={{ position:"relative",height:"50vh",minHeight:280,overflow:"hidden" }}>
      <img src={P.trustFace} alt="Trust" style={{ position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",objectPosition:"top" }}/>
      <div style={{
        position:"absolute",inset:0,display:"flex",flexDirection:"column",
        alignItems:"center",justifyContent:"center",textAlign:"center",padding:"0 1.5rem",
        background:"hsl(var(--brand-blue-deep) / 0.82)",
      }}>
        <p style={{
          fontWeight:700,color:"#fff",fontSize:"clamp(1.5rem,3.8vw,3.2rem)",
          textShadow:"0 2px 20px rgba(0,0,0,.35)",maxWidth:850,lineHeight:1.3,margin:0,
        }}>
          "Your content wins their attention.<br />SteerSolo wins the sale."
        </p>
        <p style={{ color:"rgba(255,255,255,.45)",fontSize:"0.68rem",letterSpacing:"0.22em",textTransform:"uppercase",marginTop:16 }}>
          SteerSolo · SafeBeauty Standard · Nigeria
        </p>
      </div>
    </div>
>>>>>>> 0fd43cc3e1737ce5a28eaa2782251964c93a542f

<<<<<<< HEAD
//     {/* ══ §5  FULL-BLEED QUOTE ══════════════════════════ */}
//     <div className="relative overflow-hidden" style={{height:"50vh",minHeight:300}}>
//       <img src={P.trustFace} alt="Trust" className="absolute inset-0 w-full h-full object-cover object-top"/>
//       <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
//         style={{background:"rgba(27,67,50,.72)"}}>
//         <p className="ss-d italic font-semibold text-white mb-3"
//           style={{fontSize:"clamp(1.6rem,4vw,3rem)",textShadow:"0 2px 24px rgba(0,0,0,.4)",maxWidth:740}}>
//           "Your skin deserves real products.<br/>Your business deserves real trust."
//         </p>
//         <p className="text-white/50 text-xs tracking-[0.2em] uppercase mt-2">
//           SteerSolo · SafeBeauty Standard · Nigeria
//         </p>
//       </div>
//     </div>
=======
    {/* ══════════════════════════════════════════════════════
        §6  HOW IT WORKS — Theme-aware background
    ══════════════════════════════════════════════════════ */}
    <section className="py-24 bg-background">
      <div style={{ maxWidth:1000,margin:"0 auto",padding:"0 1.5rem" }}>
        <div style={{ textAlign:"center",marginBottom:64 }}>
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-4">
            How it works
          </p>
          <h2 className="text-foreground font-extrabold" style={{ lineHeight:1.2,fontSize:"clamp(1.9rem,4vw,3rem)",margin:0 }}>
            Keep your audience.<br />
            <span className="text-primary">Add the storefront they deserve.</span>
          </h2>
        </div>
>>>>>>> 0fd43cc3e1737ce5a28eaa2782251964c93a542f

<<<<<<< HEAD
//     {/* ══ §6  HOW IT WORKS ══════════════════════════════ */}
//     <section className="py-24" style={{background:"var(--cream)"}}>
//       <div className="container mx-auto px-6 lg:px-14 max-w-5xl">
//         <div className="text-center mb-16">
//           <p className="text-xs font-semibold uppercase tracking-[0.22em] mb-4" style={{color:"var(--terra)"}}>
//             How it works
//           </p>
//           <h2 className="ss-d font-bold leading-tight" style={{fontSize:"clamp(2rem,4vw,3rem)",color:"var(--ink)"}}>
//             Keep your audience.<br/>
//             <em style={{color:"var(--terra)"}}>Add the storefront they deserve.</em>
//           </h2>
//         </div>
=======
        <style>{`@media(min-width:768px){.journey-grid{grid-template-columns:repeat(2,1fr)!important;}}`}</style>
        <div className="journey-grid" style={{ display:"grid",gap:"40px 64px",marginBottom:56 }}>
          {JOURNEY.map((s,i)=>(
            <div key={s.n} style={{ display:"flex",gap:20 }}>
              <div className={i===0 ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"} style={{
                width:44,height:44,borderRadius:"50%",flexShrink:0,
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:"0.8rem",fontWeight:700,
              }}>{s.n}</div>
              <div>
                <p className="text-foreground font-semibold" style={{ fontSize:"0.95rem",margin:"0 0 8px" }}>{s.title}</p>
                <p className="text-muted-foreground" style={{ fontSize:"0.875rem",lineHeight:1.65,margin:0 }}>{s.body}</p>
              </div>
            </div>
          ))}
        </div>
>>>>>>> 0fd43cc3e1737ce5a28eaa2782251964c93a542f

<<<<<<< HEAD
//         <div className="grid md:grid-cols-2 gap-x-16 gap-y-10 mb-14">
//           {JOURNEY.map((s,i)=>(
//             <div key={s.n} className="flex gap-5">
//               <div className="w-11 h-11 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold"
//                 style={{background:i===0?"var(--terra)":"rgba(196,98,45,.1)",color:i===0?"white":"var(--terra)"}}>
//                 {s.n}
//               </div>
//               <div>
//                 <p className="font-semibold text-base mb-2" style={{color:"var(--ink)"}}>{s.title}</p>
//                 <p className="text-sm leading-relaxed" style={{color:"var(--muted)"}}>{s.body}</p>
//               </div>
//             </div>
//           ))}
//         </div>
=======
        {/* flow bar — always indigo */}
        <div style={{
          borderRadius:24,padding:"28px 32px",
          display:"flex",flexWrap:"wrap",alignItems:"center",justifyContent:"space-between",
          gap:20,textAlign:"center",
          background:"hsl(var(--primary))",
          boxShadow:"0 16px 48px hsl(var(--primary) / 0.33)",
        }}>
          {[
            { e:"📲",l:"WhatsApp / IG / TikTok",  s:"Your existing audience" },
            null,
            { e:"🔗",l:"Your SteerSolo link",     s:"One URL in every bio" },
            null,
            { e:"🛍️",l:"Verified store page",     s:"Catalog + SafeBeauty badge" },
            null,
            { e:"✅",l:"Real orders",              s:"Tracked, confirmed, paid" },
          ].map((item,i)=> !item
            ? <span key={i} style={{ color:"rgba(255,255,255,.2)",fontSize:"1.4rem" }}>→</span>
            : (
              <div key={i} style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:4 }}>
                <span style={{ fontSize:"1.4rem" }}>{item.e}</span>
                <p style={{ fontSize:"0.75rem",fontWeight:600,color:"#fff",margin:0 }}>{item.l}</p>
                <p style={{ fontSize:"0.68rem",color:"rgba(255,255,255,.38)",margin:0 }}>{item.s}</p>
              </div>
            )
          )}
        </div>
      </div>
    </section>
>>>>>>> 0fd43cc3e1737ce5a28eaa2782251964c93a542f

<<<<<<< HEAD
//         {/* flow bar */}
//         <div className="rounded-3xl px-8 py-7 flex flex-col md:flex-row items-center justify-between gap-5 text-center"
//           style={{background:"var(--forest)"}}>
//           {[
//             {e:"📲",l:"WhatsApp / IG / TikTok",  s:"Your existing audience"},
//             null,
//             {e:"🔗",l:"Your SteerSolo link",      s:"One URL in every bio"},
//             null,
//             {e:"🛍️",l:"Verified store page",      s:"Catalog + SafeBeauty badge"},
//             null,
//             {e:"✅",l:"Real orders",               s:"Tracked, confirmed, paid"},
//           ].map((item,i)=>
//             !item
//               ? <span key={i} className="text-white/25 text-2xl hidden md:block">→</span>
//               : (
//                 <div key={i} className="flex flex-col items-center gap-1">
//                   <span style={{fontSize:"1.5rem"}}>{item.e}</span>
//                   <p className="text-xs font-semibold text-white">{item.l}</p>
//                   <p className="text-[11px]" style={{color:"rgba(255,255,255,.38)"}}>{item.s}</p>
//                 </div>
//               )
//           )}
//         </div>
//       </div>
//     </section>
=======
    {/* ══════════════════════════════════════════════════════
        §7  REALITY STATS SPLIT — Always dark (ink)
    ══════════════════════════════════════════════════════ */}
    <section className="bg-ink-section">
      <style>{`@media(min-width:1024px){.split-grid{flex-direction:row!important;}}`}</style>
      <div className="split-grid" style={{ display:"flex",flexDirection:"column",minHeight:420 }}>
        <div className="img-zoom" style={{ flex:1,overflow:"hidden",minHeight:320 }}>
          <img src={P.storefront} alt="Online storefront" style={{ width:"100%",height:"100%",objectFit:"cover",minHeight:320 }}/>
        </div>
        <div style={{ flex:1,display:"flex",flexDirection:"column",justifyContent:"center",padding:"60px 56px" }}>
          <p style={{ fontSize:"0.72rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.22em",color:"hsl(var(--accent-bright))",marginBottom:32 }}>
            The reality of selling online in Nigeria
          </p>
          {[
            { n:"82%", t:"of Nigerian e-commerce happens on mobile" },
            { n:"67%", t:"of beauty products bought online are likely counterfeit" },
            { n:"10x", t:"Orders are sent directly to your WhatsApp, converting 10x faster." },
          ].map(s=>(
            <div key={s.n} style={{ display:"flex",alignItems:"flex-start",gap:20,marginBottom:28 }}>
              <span style={{ fontWeight:800,color:"#fff",fontSize:"2.6rem",lineHeight:1,flexShrink:0 }}>{s.n}</span>
              <p style={{ fontSize:"0.95rem",lineHeight:1.65,color:"rgba(255,255,255,.48)",fontWeight:300,margin:"4px 0 0" }}>{s.t}</p>
            </div>
          ))}
          <div style={{ marginTop:8 }}>
            <Link to="/auth/signup">
              <button style={{
                display:"inline-flex",alignItems:"center",gap:8,padding:"13px 26px",
                borderRadius:9999,fontWeight:700,fontSize:"0.875rem",color:"hsl(var(--primary))",
                background:"#fff",border:"none",cursor:"pointer",transition:"all .25s ease",
                boxShadow:"0 6px 20px rgba(0,0,0,0.25)",
              }}
                onMouseEnter={e=>(e.currentTarget.style.transform="translateY(-2px)")}
                onMouseLeave={e=>(e.currentTarget.style.transform="translateY(0)")}>
                Be the exception <ArrowRight style={{ width:15,height:15 }}/>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
>>>>>>> 0fd43cc3e1737ce5a28eaa2782251964c93a542f

<<<<<<< HEAD
//     {/* ══ §7  REALITY STATS SPLIT ═══════════════════════ */}
//     <section style={{background:"var(--ink)"}}>
//       <div className="flex flex-col lg:flex-row min-h-[420px]">
//         <div className="zoom overflow-hidden lg:w-1/2" style={{minHeight:340}}>
//           <img src={P.storefront} alt="Online storefront" className="w-full h-full object-cover" style={{minHeight:340}}/>
//         </div>
//         <div className="lg:w-1/2 flex flex-col justify-center px-10 lg:px-16 py-16">
//           <p className="text-xs font-semibold uppercase tracking-[0.22em] mb-8" style={{color:"var(--gold)"}}>
//             The reality of selling online in Nigeria
//           </p>
//           {[
//             {n:"82%",t:"of Nigerian e-commerce happens on mobile"},
//             {n:"67%",t:"of beauty products bought online are likely counterfeit"},
//             {n:"0",  t:"platforms verified social-media beauty vendors — before SteerSolo"},
//           ].map(s=>(
//             <div key={s.n} className="flex items-start gap-5 mb-8 last:mb-0">
//               <span className="ss-d font-bold flex-shrink-0" style={{fontSize:"2.8rem",color:"var(--terra)",lineHeight:1}}>{s.n}</span>
//               <p className="text-base leading-relaxed mt-1" style={{color:"rgba(255,255,255,.52)",fontWeight:300}}>{s.t}</p>
//             </div>
//           ))}
//           <Link to="/auth/signup" className="mt-4 self-start">
//             <button className="group flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-sm text-white transition-all hover:-translate-y-0.5"
//               style={{background:"var(--terra)"}}>
//               Be the exception <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform"/>
//             </button>
//           </Link>
//         </div>
//       </div>
//     </section>
=======
    {/* ══════════════════════════════════════════════════════
        §8  SAFEBEAUTY BADGES — Always brand indigo
    ══════════════════════════════════════════════════════ */}
    <section className="bg-brand-section" style={{ padding:"96px 0" }}>
      <div style={{ maxWidth:1000,margin:"0 auto",padding:"0 1.5rem" }}>
        <div style={{ textAlign:"center",marginBottom:56 }}>
          <p style={{ fontSize:"0.72rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.22em",color:"hsl(var(--accent-bright))",marginBottom:16 }}>The trust layer</p>
          <h2 style={{ fontWeight:800,color:"#fff",lineHeight:1.2,fontSize:"clamp(1.9rem,4vw,3rem)",margin:0 }}>
            SafeBeauty — our Michelin Star<br />
            <span style={{ color:"hsl(var(--accent-bright))" }}>for verified beauty vendors.</span>
          </h2>
          <p style={{ marginTop:16,maxWidth:520,marginLeft:"auto",marginRight:"auto",color:"rgba(255,255,255,.45)",fontSize:"0.9rem" }}>
            Every badge is earned, not bought. Buyers instantly know how trusted your store is before they spend a kobo.
          </p>
        </div>
>>>>>>> 0fd43cc3e1737ce5a28eaa2782251964c93a542f

<<<<<<< HEAD
//     {/* ══ §8  SAFEBEAUTY BADGES ═════════════════════════ */}
//     <section className="py-24" style={{background:"var(--forest)"}}>
//       <div className="container mx-auto px-6 lg:px-14 max-w-5xl">
//         <div className="text-center mb-14">
//           <p className="text-xs font-semibold uppercase tracking-[0.22em] mb-4" style={{color:"var(--gold)"}}>The trust layer</p>
//           <h2 className="ss-d font-bold text-white leading-tight" style={{fontSize:"clamp(2rem,4vw,3rem)"}}>
//             SafeBeauty — our Michelin Star<br/>
//             <em style={{color:"var(--gold)"}}>for verified beauty vendors.</em>
//           </h2>
//           <p className="mt-4 max-w-xl mx-auto text-base" style={{color:"rgba(255,255,255,.48)"}}>
//             Every badge is earned, not bought. Buyers instantly know how trusted your store is before they spend a kobo.
//           </p>
//         </div>
=======
        <style>{`@media(min-width:640px){.badge-grid{grid-template-columns:repeat(2,1fr)!important;}}@media(min-width:1024px){.badge-grid{grid-template-columns:repeat(4,1fr)!important;}}`}</style>
        <div className="badge-grid" style={{ display:"grid",gap:16 }}>
          {BADGES.map(b=>(
            <div key={b.label} className="lift" style={{
              borderRadius:20,padding:24,display:"flex",flexDirection:"column",gap:12,
              background: b.top
                ? "linear-gradient(135deg, hsl(var(--accent)), hsl(var(--accent-deep)))"
                : "rgba(255,255,255,.07)",
              border: b.top ? "none" : "1px solid rgba(255,255,255,.1)",
              boxShadow: b.top ? "0 8px 32px hsl(var(--accent) / 0.4)" : "none",
            }}>
              <span style={{ fontWeight:800,fontSize:"2rem",opacity:.18,lineHeight:1,color:"#fff" }}>{b.num}</span>
              <p style={{ fontWeight:600,fontSize:"0.875rem",color:"#fff",margin:0 }}>{b.label}</p>
              <p style={{ fontSize:"0.8rem",lineHeight:1.6,color: b.top ? "rgba(255,255,255,.7)" : "rgba(255,255,255,.45)",margin:0 }}>{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
>>>>>>> 0fd43cc3e1737ce5a28eaa2782251964c93a542f

<<<<<<< HEAD
//         <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
//           {BADGES.map(b=>(
//             <div key={b.label} className="lift rounded-2xl p-6 flex flex-col gap-3"
//               style={{
//                 background:b.gold?"linear-gradient(135deg,var(--gold),#E8B84B)":"rgba(255,255,255,.07)",
//                 border:b.gold?"none":"1px solid rgba(255,255,255,.1)",
//               }}>
//               <span className="ss-d font-bold" style={{fontSize:"2.2rem",opacity:.2,lineHeight:1,color:b.gold?"var(--ink)":"white"}}>{b.num}</span>
//               <p className="font-semibold text-sm" style={{color:b.gold?"var(--ink)":"var(--gold)"}}>{b.label}</p>
//               <p className="text-xs leading-relaxed" style={{color:b.gold?"rgba(26,18,8,.62)":"rgba(255,255,255,.48)"}}>{b.desc}</p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
=======
    {/* ══════════════════════════════════════════════════════
        §9  CONTENT STRATEGY — Theme-aware secondary bg
    ══════════════════════════════════════════════════════ */}
    <section className="py-24 bg-secondary/40">
      <div style={{ maxWidth:1000,margin:"0 auto",padding:"0 1.5rem" }}>
        <style>{`@media(min-width:1024px){.content-flex{flex-direction:row!important;}}`}</style>
        <div className="content-flex" style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:64 }}>
>>>>>>> 0fd43cc3e1737ce5a28eaa2782251964c93a542f

<<<<<<< HEAD
//     {/* ══ §9  CONTENT STRATEGY ══════════════════════════ */}
//     <section className="py-24" style={{background:"var(--blush)"}}>
//       <div className="container mx-auto px-6 lg:px-14 max-w-5xl">
//         <div className="flex flex-col lg:flex-row items-center gap-14 lg:gap-20">
=======
          {/* photo grid */}
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,width:340,flexShrink:0 }}>
            {[P.orders,P.tiktok,P.instagram,P.heroVendor].map((src,i)=>(
              <div key={i} className="img-zoom" style={{
                height:160,overflow:"hidden",
                borderTopLeftRadius:    i===0?18:0,
                borderTopRightRadius:   i===1?18:0,
                borderBottomLeftRadius: i===2?18:0,
                borderBottomRightRadius:i===3?18:0,
              }}>
                <img src={src} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }}/>
              </div>
            ))}
          </div>
>>>>>>> 0fd43cc3e1737ce5a28eaa2782251964c93a542f

<<<<<<< HEAD
//           {/* photo grid */}
//           <div className="hidden lg:grid grid-cols-2 gap-3 w-[360px] flex-shrink-0">
//             {[P.orders,P.tiktok,P.instagram,P.heroVendor].map((src,i)=>(
//               <div key={i} className="zoom overflow-hidden" style={{
//                 height:165,
//                 borderTopLeftRadius:  i===0?20:0,
//                 borderTopRightRadius: i===1?20:0,
//                 borderBottomLeftRadius:  i===2?20:0,
//                 borderBottomRightRadius: i===3?20:0,
//               }}>
//                 <img src={src} alt="" className="w-full h-full object-cover"/>
//               </div>
//             ))}
//           </div>
=======
          <div style={{ flex:1 }}>
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-4">
              Content that converts
            </p>
            <h2 className="text-foreground font-extrabold" style={{ lineHeight:1.2,fontSize:"clamp(1.9rem,3.5vw,2.8rem)",margin:"0 0 20px" }}>
              Post the content.<br />
              <span className="text-primary">Let your store close the sale.</span>
            </h2>
            <p className="text-muted-foreground" style={{ fontSize:"0.95rem",lineHeight:1.7,marginBottom:28 }}>
              TikTok tutorials, Instagram reels, WhatsApp status — your content brings the audience.
              Your SteerSolo link converts them. No DM chaos. No lost sales.
            </p>
            <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
              {[
                "Fake beauty awareness — the content that goes viral and positions you as safe",
                "Vendor spotlights — your SafeBeauty badge story, shared by real buyers",
                "Restock alerts — WhatsApp broadcasts to your verified buyer list",
                "'Pack my orders' content — TikTok's most trusted beauty vendor format",
              ].map(t=>(
                <div key={t} style={{ display:"flex",alignItems:"flex-start",gap:12 }}>
                  <CheckCircle className="text-accent" style={{ width:16,height:16,flexShrink:0,marginTop:2 }}/>
                  <p className="text-muted-foreground" style={{ fontSize:"0.875rem",lineHeight:1.65,margin:0 }}>{t}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
>>>>>>> 0fd43cc3e1737ce5a28eaa2782251964c93a542f

<<<<<<< HEAD
//           <div className="flex-1">
//             <p className="text-xs font-semibold uppercase tracking-[0.22em] mb-4" style={{color:"var(--terra)"}}>
//               Content that converts
//             </p>
//             <h2 className="ss-d font-bold leading-tight mb-5" style={{fontSize:"clamp(2rem,3.5vw,2.8rem)",color:"var(--ink)"}}>
//               Post the content.<br/>
//               <em style={{color:"var(--terra)"}}>Let your store close the sale.</em>
//             </h2>
//             <p className="text-base leading-relaxed mb-8" style={{color:"var(--muted)"}}>
//               TikTok tutorials, Instagram reels, WhatsApp status — your content brings the audience.
//               Your SteerSolo link converts them. No DM chaos. No lost sales.
//             </p>
//             <div className="space-y-3">
//               {[
//                 "Fake beauty awareness — the content that goes viral and positions you as safe",
//                 "Vendor spotlights — your SafeBeauty badge story, shared by real buyers",
//                 "Restock alerts — WhatsApp broadcasts to your verified buyer list",
//                 "'Pack my orders' content — TikTok's most trusted beauty vendor format",
//               ].map(t=>(
//                 <div key={t} className="flex items-start gap-3">
//                   <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{color:"var(--terra)"}}/>
//                   <p className="text-sm leading-relaxed" style={{color:"var(--muted)"}}>{t}</p>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
=======
    {/* ══════════════════════════════════════════════════════
        §10  TESTIMONIALS — Always dark (ink)
    ══════════════════════════════════════════════════════ */}
    <section className="bg-ink-section" style={{ padding:"96px 0" }}>
      <div style={{ maxWidth:1000,margin:"0 auto",padding:"0 1.5rem" }}>
        <div style={{ textAlign:"center",marginBottom:56 }}>
          <p style={{ fontSize:"0.72rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.22em",color:"hsl(var(--accent-bright))",marginBottom:16 }}>Vendor stories</p>
          <h2 style={{ fontWeight:800,color:"#fff",fontSize:"clamp(1.9rem,4vw,2.8rem)",margin:0 }}>
            Social sellers who made the switch.
          </h2>
        </div>
        <style>{`@media(min-width:768px){.testi-grid{grid-template-columns:repeat(3,1fr)!important;}}`}</style>
        <div className="testi-grid" style={{ display:"grid",gap:20 }}>
          {TESTIMONIALS.map(t=>(
            <div key={t.name} className="lift" style={{
              borderRadius:24,padding:28,display:"flex",flexDirection:"column",gap:20,
              background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.08)",
            }}>
              <div style={{ display:"flex",gap:4,marginBottom:4 }}>
                {[1,2,3,4,5].map(s=><Star key={s} style={{ width:13,height:13,fill:"hsl(var(--accent))",color:"hsl(var(--accent))" }}/>)}
              </div>
              <p style={{ fontWeight:400,fontStyle:"italic",color:"rgba(255,255,255,.88)",lineHeight:1.65,fontSize:"1rem",margin:0 }}>
                "{t.quote}"
              </p>
              <div style={{ display:"flex",alignItems:"center",gap:12,marginTop:"auto" }}>
                <img src={t.av} alt={t.name} style={{ width:40,height:40,borderRadius:"50%",objectFit:"cover",objectPosition:"top",flexShrink:0,border:"2px solid rgba(255,255,255,0.3)" }}/>
                <div>
                  <p style={{ fontWeight:600,fontSize:"0.875rem",color:"#fff",margin:0 }}>{t.name}</p>
                  <p style={{ fontSize:"0.72rem",color:"rgba(255,255,255,.38)",margin:0 }}>{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
>>>>>>> 0fd43cc3e1737ce5a28eaa2782251964c93a542f

<<<<<<< HEAD
//     {/* ══ §10  TESTIMONIALS ═════════════════════════════ */}
//     <section className="py-24" style={{background:"var(--ink)"}}>
//       <div className="container mx-auto px-6 lg:px-14 max-w-5xl">
//         <div className="text-center mb-14">
//           <p className="text-xs font-semibold uppercase tracking-[0.22em] mb-4" style={{color:"var(--gold)"}}>Vendor stories</p>
//           <h2 className="ss-d font-bold text-white" style={{fontSize:"clamp(2rem,4vw,2.8rem)"}}>
//             Social sellers who made the switch.
//           </h2>
//         </div>
//         <div className="grid md:grid-cols-3 gap-6">
//           {TESTIMONIALS.map(t=>(
//             <div key={t.name} className="lift rounded-3xl p-7 flex flex-col gap-5"
//               style={{background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.09)"}}>
//               <p className="ss-d italic text-white/90 leading-relaxed" style={{fontSize:"1.1rem"}}>
//                 "{t.quote}"
//               </p>
//               <div className="flex items-center gap-3 mt-auto">
//                 <img src={t.av} alt={t.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0"/>
//                 <div>
//                   <p className="font-semibold text-sm text-white">{t.name}</p>
//                   <p className="text-xs" style={{color:"rgba(255,255,255,.38)"}}>{t.role}</p>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
=======
    {/* ══ reused components (theme-aware via Tailwind) ════════════════════ */}
    <DynamicPricing />
    <section className="py-8 md:py-10">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">Discover trusted sellers faster</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-5">
          Shop verified businesses with clear trust signals and a straightforward path to purchase.
        </p>
        <Link to="/shops" className="inline-flex">
          <button className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
            Explore verified shops
          </button>
        </Link>
      </div>
    </section>
    <ShopperDiscovery />
>>>>>>> 0fd43cc3e1737ce5a28eaa2782251964c93a542f

<<<<<<< HEAD
//     {/* ══ existing components ═══════════════════════════ */}
//     <FeaturedShopsBanner />
//     <HomepageReviews />
//     <DynamicPricing />
//     <ShopperDiscovery />
=======
    {/* ══════════════════════════════════════════════════════
        §15  FINAL CTA — Always hero indigo
    ══════════════════════════════════════════════════════ */}
    <section className="bg-brand-cta" style={{
      position:"relative",padding:"112px 0",textAlign:"center",overflow:"hidden",
    }}>
      {/* texture */}
      <div style={{
        position:"absolute",inset:0,pointerEvents:"none",opacity:.04,
        backgroundImage:"repeating-linear-gradient(45deg,transparent,transparent 40px,rgba(255,255,255,.6) 40px,rgba(255,255,255,.6) 41px)",
      }}/>
      {/* accent glow */}
      <div style={{
        position:"absolute",top:"-20%",right:"-10%",width:"50%",height:"80%",pointerEvents:"none",
        background:"radial-gradient(ellipse, hsl(var(--accent) / 0.15) 0%, transparent 65%)",
      }}/>

      <div style={{ maxWidth:680,margin:"0 auto",padding:"0 1.5rem",position:"relative",zIndex:10 }}>
        <ShoppingBag style={{ width:32,height:32,margin:"0 auto 24px",color:"rgba(255,255,255,.35)" }}/>
        <h2 style={{ fontWeight:800,color:"#fff",lineHeight:1.1,fontSize:"clamp(2.2rem,5vw,3.8rem)",marginBottom:20 }}>
          Your audience is ready.<br /><em style={{ fontStyle:"normal",color:"hsl(var(--accent-bright))" }}>Is your storefront?</em>
        </h2>
        <p style={{ fontSize:"1.05rem",color:"rgba(255,255,255,.58)",maxWidth:460,margin:"0 auto 12px" }}>
          Join verified Nigerian beauty vendors turning their social following into a real, trusted business.
        </p>
        <p style={{ fontSize:"0.85rem",fontStyle:"italic",color:"rgba(255,255,255,.28)",marginBottom:40 }}>
          "SteerSolo made my business look professional from day one."
        </p>
        <div style={{ display:"flex",flexWrap:"wrap",justifyContent:"center",gap:14,marginBottom:36 }}>
          <Link to="/auth/signup">
            <button style={{
              display:"inline-flex",alignItems:"center",gap:10,padding:"15px 36px",
              borderRadius:9999,fontWeight:700,fontSize:"1rem",
              background:"#fff",color:"hsl(var(--primary))",border:"none",cursor:"pointer",transition:"all .25s ease",
              boxShadow:"0 10px 32px rgba(0,0,0,.22)",
            }}
              onMouseEnter={e=>(e.currentTarget.style.transform="translateY(-2px)")}
              onMouseLeave={e=>(e.currentTarget.style.transform="translateY(0)")}>
              Start Free — No Card Needed
              <ArrowRight style={{ width:16,height:16 }}/>
            </button>
          </Link>
          <Link to="/demo">
            <button style={{
              display:"inline-flex",alignItems:"center",gap:8,padding:"15px 30px",
              borderRadius:9999,fontWeight:600,fontSize:"0.9rem",
              background:"rgba(255,255,255,0.12)",border:"1.5px solid rgba(255,255,255,0.25)",
              color:"#fff",cursor:"pointer",transition:"all .25s ease",
              backdropFilter:"blur(10px)",
            }}
              onMouseEnter={e=>(e.currentTarget.style.background="rgba(255,255,255,0.2)")}
              onMouseLeave={e=>(e.currentTarget.style.background="rgba(255,255,255,0.12)")}>
              View a demo store first
            </button>
          </Link>
        </div>
        <div style={{ display:"flex",flexWrap:"wrap",justifyContent:"center",gap:20,fontSize:"0.78rem",color:"rgba(255,255,255,.38)" }}>
          {["Free forever plan","Works on WhatsApp, IG & TikTok","SafeBeauty badge included"].map(t=>(
            <span key={t} style={{ display:"flex",alignItems:"center",gap:6 }}>
              <CheckCircle style={{ width:13,height:13,color:"rgba(255,255,255,.48)" }}/>{t}
            </span>
          ))}
        </div>
      </div>
    </section>
>>>>>>> 0fd43cc3e1737ce5a28eaa2782251964c93a542f

//     {/* ══ §15  FINAL CTA ════════════════════════════════ */}
//     <section className="relative py-28 text-center overflow-hidden"
//       style={{background:"linear-gradient(135deg,var(--terra) 0%,#9B3E18 55%,var(--forest) 100%)"}}>
//       <div className="absolute inset-0 pointer-events-none opacity-[0.07]"
//         style={{backgroundImage:"repeating-linear-gradient(45deg,transparent,transparent 40px,rgba(255,255,255,.5) 40px,rgba(255,255,255,.5) 41px)"}}/>
//       <div className="container mx-auto px-6 max-w-2xl relative z-10">
//         <ShoppingBag className="w-8 h-8 mx-auto mb-6" style={{color:"rgba(255,255,255,.38)"}}/>
//         <h2 className="ss-d font-bold text-white leading-tight mb-5" style={{fontSize:"clamp(2.4rem,5vw,4rem)"}}>
//           Your audience is ready.<br/><em>Is your storefront?</em>
//         </h2>
//         <p className="text-lg mb-3 max-w-md mx-auto" style={{color:"rgba(255,255,255,.62)"}}>
//           Join verified Nigerian beauty vendors turning their social following into a real, trusted business.
//         </p>
//         <p className="text-sm italic mb-10" style={{color:"rgba(255,255,255,.32)"}}>
//           "SteerSolo made my business look professional from day one."
//         </p>
//         <div className="flex flex-col sm:flex-row justify-center gap-4 mb-9">
//           <Link to="/auth/signup">
//             <button className="group flex items-center gap-2 px-9 py-4 rounded-full font-bold text-base transition-all hover:-translate-y-0.5"
//               style={{background:"white",color:"var(--terra)",boxShadow:"0 10px 32px rgba(0,0,0,.22)"}}>
//               Start Free — No Card Needed
//               <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform"/>
//             </button>
//           </Link>
//           <Link to="/demo">
//             <button className="flex items-center gap-2 px-9 py-4 rounded-full text-sm font-semibold transition-all hover:bg-white/10"
//               style={{border:"1.5px solid rgba(255,255,255,.3)",color:"rgba(255,255,255,.8)"}}>
//               View a demo store first
//             </button>
//           </Link>
//         </div>
//         <div className="flex flex-wrap justify-center gap-5 text-xs" style={{color:"rgba(255,255,255,.42)"}}>
//           {["Free forever plan","Works on WhatsApp, IG & TikTok","SafeBeauty badge included"].map(t=>(
//             <span key={t} className="flex items-center gap-1.5">
//               <CheckCircle className="w-3.5 h-3.5" style={{color:"rgba(255,255,255,.52)"}}/>
//               {t}
//             </span>
//           ))}
//         </div>
//       </div>
//     </section>

//     <Footer />
//   </div>
// );

<<<<<<< HEAD
// export default Index;


=======
>>>>>>> 0fd43cc3e1737ce5a28eaa2782251964c93a542f