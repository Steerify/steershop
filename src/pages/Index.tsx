// import { Link } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import {
//   ArrowRight,
//   CheckCircle,
//   Clock,
//   MessageCircle,
//   Sparkles,
//   ShoppingBag,
//   TrendingUp,
//   AlertTriangle,
//   XCircle,
// } from "lucide-react";
// import Navbar from "@/components/Navbar";
// import { TypewriterEffect } from "@/components/TypewriterEffect";
// import { Footer } from "@/components/Footer";
// import { AdirePattern } from "@/components/patterns/AdirePattern";
// import { FeaturedShopsBanner } from "@/components/FeaturedShopsBanner";
// import { ShopperDiscovery } from "@/components/ShopperDiscovery";
// import { WhySteerSolo } from "@/components/WhySteerSolo";
// import { HomepageReviews } from "@/components/HomepageReviews";
// import { HowItWorks } from "@/components/HowItWorks";
// import { DynamicPricing } from "@/components/DynamicPricing";
// import { SocialProofStats } from "@/components/SocialProofStats";
// import { Card, CardContent } from "@/components/ui/card";
// import { Globe, Shield, Zap, Globe2, DollarSign } from "lucide-react";
// import { GoogleOneTap } from "@/components/auth/GoogleOneTap";
// import { NigeriaDotMap } from "@/components/NigeriaDotMap";

// const painPoints = [
//   {
//     icon: XCircle,
//     pain: '"Send your account details"',
//     description: "Repeating payment info in every single DM. Customers drop off.",
//   },
//   {
//     icon: AlertTriangle,
//     pain: '"Is this still available?"',
//     description: "No catalog. No prices. Customers can't browse — they just leave.",
//   },
//   {
//     icon: XCircle,
//     pain: '"I sent the money yesterday"',
//     description: "No order tracking. You can't tell who paid and who didn't.",
//   },
// ];

// const safeBeautyBadges = [
//   { title: "SafeBeauty Listed", detail: "Entry-level verified beauty vendor profile." },
//   { title: "SafeBeauty Checked", detail: "At least one product batch checked in our process." },
//   { title: "SafeBeauty Trusted", detail: "30+ days active, reviews, and complaint-safe history." },
//   { title: "SafeBeauty Verified", detail: "Full verification + stronger trust signal for buyers." },
// ];

// const Index = () => {
//   return (
//     <div className="min-h-screen bg-background">
//       <GoogleOneTap />
//       <Navbar />

//       {/* SECTION 1: HERO — Outcome-first with Nigeria Map */}
//       <section className="relative pt-28 md:pt-32 pb-12 overflow-hidden bg-mesh">
//         <div className="absolute inset-0 bg-gradient-to-b from-primary/8 via-transparent to-transparent pointer-events-none" />
//         <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-primary/20 to-accent/5 blur-[120px] pointer-events-none" />
//         <div className="absolute -bottom-16 -right-16 w-96 h-96 rounded-full bg-gradient-to-tl from-accent/15 to-transparent blur-[80px] pointer-events-none" />

//         <div className="container mx-auto px-4 relative z-10">
//           <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
//             {/* Left: Text Content */}
//             <div className="flex-1 text-center lg:text-left space-y-8">
//               <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 text-primary text-sm font-semibold border border-primary/15 shadow-sm animate-fade-up">
//                 <Sparkles className="w-4 h-4" />
//                 <span>Built for Nigeria's social-commerce sellers</span>
//                 <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse ml-1" />
//               </div>

//               <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight animate-fade-up text-balance leading-[1.1]" style={{ animationDelay: '80ms' }}>
//                 Turn your WhatsApp & Instagram audience into a
//                 <span className="text-accent underline decoration-gold/30"> trusted storefront</span>.
//               </h1>

//               <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mt-4 animate-fade-up" style={{ animationDelay: '120ms' }}>
//                 Give buyers proof, prices and confidence —
//                 {" "}
//                 <TypewriterEffect
//                   texts={["before they DM", "", "before they pay", "before they leave"]}
//                   className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-gold"
//                 />
//               </h2>

//               <p className="text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 animate-fade-up text-balance" style={{ animationDelay: '160ms' }}>
//                 Most Nigerian online sales start on social apps but fail at trust. SteerSolo gives you a verified store page, structured product catalog, reviews, and payment-ready checkout in minutes.
//               </p>

//               <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 pt-2 animate-fade-up" style={{ animationDelay: '240ms' }}>
//                 <Link to="/auth/signup">
//                   <Button size="lg" className="group bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white text-base px-8 py-6 shadow-xl shadow-primary/25 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-0.5 w-full sm:w-auto font-bold rounded-2xl">
//                     Start Free Forever
//                     <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
//                   </Button>
//                 </Link>
//                 <Link to="/demo">
//                   <Button size="lg" variant="outline" className="text-base px-8 py-6 w-full sm:w-auto rounded-2xl border-primary/25 hover:bg-primary/5 hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-300 font-semibold">
//                     See a Demo Store
//                   </Button>
//                 </Link>
//               </div>

//               <div className="flex flex-wrap items-center justify-center lg:justify-start gap-5 text-sm text-muted-foreground animate-fade-up" style={{ animationDelay: '320ms' }}>
//                 <div className="flex items-center gap-1.5 bg-card border border-border/60 rounded-full px-4 py-2 shadow-sm hover:border-accent/40 transition-colors">
//                   <CheckCircle className="w-4 h-4 text-accent" />
//                   Verification-first trust signals
//                 </div>
//                 <div className="flex items-center gap-1.5 bg-card border border-border/60 rounded-full px-4 py-2 shadow-sm hover:border-primary/40 transition-colors">
//                   <Zap className="w-4 h-4 text-primary" />
//                   Free plan to start
//                 </div>
//                 <div className="flex items-center gap-1.5 bg-card border border-border/60 rounded-full px-4 py-2 shadow-sm hover:border-gold/40 transition-colors">
//                   <Shield className="w-4 h-4 text-gold" />
//                   Built for mobile buyers
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-up" style={{ animationDelay: '360ms' }}>
//                 {[
//                   { value: "$8.8B", label: "Nigeria e-commerce (2024)" },
//                   { value: "69%", label: "Social commerce penetration" },
//                   { value: "95%", label: "Nigerians on WhatsApp" },
//                   { value: "82%", label: "Transactions on mobile" },
//                 ].map((stat) => (
//                   <Card key={stat.label} className="p-3 text-center border-border/60">
//                     <CardContent className="p-0">
//                       <p className="text-lg sm:text-xl font-extrabold text-primary">{stat.value}</p>
//                       <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">{stat.label}</p>
//                     </CardContent>
//                   </Card>
//                 ))}
//               </div>
//             </div>

//             {/* Right: Nigeria Dot Map (Paystack-style) */}
//             <div className="hidden lg:block w-[400px] h-[400px] xl:w-[460px] xl:h-[460px] flex-shrink-0 animate-fade-up" style={{ animationDelay: '400ms' }}>
//               <NigeriaDotMap />
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* SECTION 2: PAIN MIRROR */}
//       <section className="py-20 bg-muted/30">
//         <div className="container mx-auto px-4">
//           <div className="text-center mb-12">
//             <p className="text-xs font-bold text-destructive mb-3 tracking-widest uppercase">Sound familiar?</p>
//             <h2 className="font-display text-3xl md:text-4xl font-extrabold mb-4">
//               The everyday selling chaos
//             </h2>
//             <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
//               You're not losing sales because demand is low — you're losing them because your order process is messy.
//             </p>
//           </div>

//           <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
//             {painPoints.map((point) => (
//               <div key={point.pain} className="card-spotify p-6 bg-destructive/5 hover:bg-destructive/8">
//                 <div className="w-12 h-12 bg-destructive/10 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
//                   <point.icon className="w-6 h-6 text-destructive" />
//                 </div>
//                 <h3 className="text-base font-bold mb-2 text-foreground">{point.pain}</h3>
//                 <p className="text-muted-foreground text-sm leading-relaxed">{point.description}</p>
//               </div>
//             ))}
//           </div>

//           <div className="text-center mt-10">
//             <p className="text-lg font-bold">
//               SteerSolo fixes all of this.{" "}
//               <span className="text-gradient">In one link.</span>
//             </p>
//           </div>
//         </div>
//       </section>

//       {/* SECTION 3: WHAT IS STEERSOLO + WHY — Show the solution */}
//       <section className="py-16 bg-background">
//         <div className="container mx-auto px-4">
//           <div className="max-w-5xl mx-auto">
//             <div className="text-center mb-10">
//               <p className="text-xs font-bold text-primary tracking-widest uppercase mb-3">Beauty Market Focus</p>
//               <h2 className="font-display text-3xl md:text-4xl font-extrabold mb-3">SafeBeauty: our trust layer for beauty sellers</h2>
//               <p className="text-muted-foreground max-w-3xl mx-auto">
//                 We are renovating SteerSolo around beauty-commerce trust: verified sellers, transparent badges, and safer buyer discovery.
//               </p>
//             </div>

//             <div className="grid md:grid-cols-4 gap-4">
//               {safeBeautyBadges.map((badge) => (
//                 <Card key={badge.title} className="border-primary/15">
//                   <CardContent className="p-5">
//                     <p className="font-bold text-primary mb-1">{badge.title}</p>
//                     <p className="text-sm text-muted-foreground">{badge.detail}</p>
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* SECTION 3B: WHAT IS STEERSOLO + WHY — Show the solution */}
//       <WhySteerSolo />

//       {/* SECTION 4: HOW IT WORKS — Make it feel easy */}
//       <HowItWorks />

//       {/* SECTION 5: SOCIAL PROOF STATS — Back it up with numbers */}
//       <SocialProofStats />

//       {/* SECTION 6: REVIEWS — Real people, real trust */}
//       <HomepageReviews />

//       {/* SECTION 7: FEATURED SHOPS — Show live proof */}
//       <FeaturedShopsBanner />

//       {/* SECTION 8: PRICING — Now they're ready to buy */}
//       <DynamicPricing />

//       {/* SECTION 9: SHOPPER DISCOVERY — Secondary value prop */}
//       <ShopperDiscovery />

//       {/* SECTION 10: FINAL CTA — Close with guarantee */}
//       <section className="relative py-24 overflow-hidden">
//         {/* Rich gradient BG */}
//         <div className="absolute inset-0 bg-gradient-to-br from-primary via-[hsl(160,50%,28%)] to-accent" />
//         <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl" />
//         <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-white/5 blur-3xl" />
//         <AdirePattern variant="circles" className="absolute inset-0 text-white" opacity={0.07} />

//         <div className="container mx-auto px-4 text-center relative z-10">
//           <div className="max-w-3xl mx-auto">
//             <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/15 backdrop-blur-md text-white text-sm font-semibold mb-8 border border-white/20">
//               <ShoppingBag className="w-4 h-4 mr-2" />
//               Your first order is closer than you think
//             </div>

//             <h2 className="font-display text-4xl md:text-5xl font-extrabold text-white mb-6 text-balance leading-tight">
//               Your first order could come within 14 days
//             </h2>
//             <p className="text-xl text-white/75 mb-3 max-w-xl mx-auto">
//               Complete your setup milestones and watch your WhatsApp traffic become real orders.
//             </p>
//             <p className="text-sm text-white/50 mb-10 italic">
//               "SteerSolo made my business look professional from day one."
//             </p>

//             <div className="flex flex-col sm:flex-row justify-center gap-4 mb-10">
//               <Link to="/auth/signup">
//                 <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-bold text-base px-10 py-6 shadow-2xl hover:shadow-white/20 hover:-translate-y-0.5 transition-all duration-300 w-full sm:w-auto rounded-2xl">
//                   Start Your Free Store
//                   <ArrowRight className="ml-2 w-5 h-5" />
//                 </Button>
//               </Link>
//               <Link to="/demo">
//                 <Button size="lg" variant="outline" className="border-2 border-white/30 text-white hover:bg-white/10 font-semibold text-base px-10 py-6 w-full sm:w-auto rounded-2xl transition-all duration-300 hover:-translate-y-0.5">
//                   View Demo Store
//                 </Button>
//               </Link>
//             </div>

//             <div className="flex flex-wrap justify-center gap-5 text-sm text-white/65">
//               {["Free forever plan", "No credit card required", "Cancel anytime"].map(t => (
//                 <div key={t} className="flex items-center gap-2">
//                   <CheckCircle className="w-4 h-4 text-white/80" />{t}
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </section>

//       <Footer />
//     </div>
//   );
// };

// export default Index;
// import { Link } from "react-router-dom";
// import { ArrowRight, CheckCircle, Shield, Zap, Sparkles, ShoppingBag } from "lucide-react";
// import Navbar from "@/components/Navbar";
// import { Footer } from "@/components/Footer";
// import { FeaturedShopsBanner } from "@/components/FeaturedShopsBanner";
// import { ShopperDiscovery } from "@/components/ShopperDiscovery";
// import { HomepageReviews } from "@/components/HomepageReviews";
// import { DynamicPricing } from "@/components/DynamicPricing";
// import { GoogleOneTap } from "@/components/auth/GoogleOneTap";

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

// const JOURNEY = [
//   { n:"01", title:"Keep your existing audience",     body:"Don't leave WhatsApp or Instagram. SteerSolo lives behind your social presence as your store." },
//   { n:"02", title:"Paste your SteerSolo link once",  body:"IG bio, WhatsApp status, TikTok profile. One link — catalog, prices, reviews, checkout included." },
//   { n:"03", title:"Buyers see proof before they pay",body:"Your SafeBeauty badge, product photos, and real reviews load instantly. No DM required." },
//   { n:"04", title:"Orders arrive structured",         body:"No more 'I sent it yesterday'. Every order tracked, every payment confirmed, every buyer recorded." },
// ];

// const BADGES = [
//   { num:"01", label:"SafeBeauty Listed",   desc:"Vendor verified, store live. Entry-level trust signal for new buyers.", gold:false },
//   { num:"02", label:"SafeBeauty Checked",  desc:"At least one product batch confirmed genuine through our process.", gold:false },
//   { num:"03", label:"SafeBeauty Trusted",  desc:"30+ days active, real buyer reviews, zero unresolved complaints.", gold:false },
//   { num:"04", label:"SafeBeauty Verified", desc:"Full NAFDAC-aligned identity check — the highest trust signal on the platform.", gold:true },
// ];

// const TESTIMONIALS = [
//   { quote:"I used to spend 3 hours a day answering the same DMs. Now I paste my link and the store does the talking.", name:"Chidera O.", role:"Skincare vendor · Lagos", av:P.av1 },
//   { quote:"My TikTok blew up and I had nowhere to send people. SteerSolo fixed that overnight.",                       name:"Amara S.",  role:"Makeup artist · Abuja",      av:P.av2 },
//   { quote:"The SafeBeauty badge made buyers stop questioning if my products are real. Sales doubled in 6 weeks.",      name:"Fatima B.", role:"Natural beauty vendor · Kano", av:P.av3 },
// ];

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

// /* ─────────────────────────────────────────────────────
//    PAGE
// ───────────────────────────────────────────────────── */
// const Index = () => (
//   <div className="ss-s" style={{background:"var(--cream)",color:"var(--ink)"}}>
//     <GS />
//     <GoogleOneTap />
//     <Navbar />

//     {/* ══ §1  HERO ══════════════════════════════════════ */}
//     <section className="relative overflow-hidden pt-24" style={{background:"var(--forest)",minHeight:"90vh"}}>
//       {/* diagonal texture */}
//       <div className="absolute inset-0 pointer-events-none opacity-[0.05]" style={{backgroundImage:"repeating-linear-gradient(-55deg,transparent,transparent 48px,rgba(255,255,255,.7) 48px,rgba(255,255,255,.7) 49px)"}}/>
//       {/* warm glow */}
//       <div className="absolute top-0 right-0 w-3/5 h-full pointer-events-none" style={{background:"radial-gradient(ellipse at 85% 30%,rgba(196,98,45,.22) 0%,transparent 65%)"}}/>

//       <div className="container mx-auto px-6 lg:px-14 relative z-10">
//         <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16 py-16 lg:py-24">

//           {/* text */}
//           <div className="flex-1 max-w-2xl f1">
//             <div className="inline-flex items-center gap-2 mb-7" style={{borderBottom:"1.5px solid var(--gold)",paddingBottom:6}}>
//               <Sparkles className="w-3.5 h-3.5" style={{color:"var(--gold)"}}/>
//               <span className="text-xs font-semibold uppercase tracking-[0.2em]" style={{color:"var(--gold)"}}>
//                 For WhatsApp · Instagram · TikTok vendors
//               </span>
//             </div>

//             <h1 className="ss-d font-bold text-white leading-[1.04] mb-6" style={{fontSize:"clamp(2.8rem,5.5vw,4.8rem)"}}>
//               You already have<br/>
//               the audience.<br/>
//               <em style={{color:"var(--gold)"}}>Give them somewhere to buy.</em>
//             </h1>

//             <p className="text-lg leading-relaxed mb-10" style={{color:"rgba(255,255,255,.6)",fontWeight:300,maxWidth:520}}>
//               500,000+ Nigerian beauty vendors sell on social media every day — and lose buyers
//               because there's nowhere to send them after the DM. SteerSolo is that place.
//             </p>

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

//         <p className="ss-d text-center mt-16 font-semibold italic" style={{fontSize:"1.5rem",color:"var(--forest)"}}>
//           SteerSolo fixes all of this — in one link.
//         </p>
//       </div>
//     </section>

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

//     {/* ══ §9  CONTENT STRATEGY ══════════════════════════ */}
//     <section className="py-24" style={{background:"var(--blush)"}}>
//       <div className="container mx-auto px-6 lg:px-14 max-w-5xl">
//         <div className="flex flex-col lg:flex-row items-center gap-14 lg:gap-20">

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

//     {/* ══ existing components ═══════════════════════════ */}
//     <FeaturedShopsBanner />
//     <HomepageReviews />
//     <DynamicPricing />
//     <ShopperDiscovery />

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

// export default Index;




import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, Shield, Zap, Sparkles, ShoppingBag } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FeaturedShopsBanner } from "@/components/FeaturedShopsBanner";
import { ShopperDiscovery } from "@/components/ShopperDiscovery";
import { HomepageReviews } from "@/components/HomepageReviews";
import { DynamicPricing } from "@/components/DynamicPricing";
import { GoogleOneTap } from "@/components/auth/GoogleOneTap";

/* ─────────────────────────────────────────────────────
   PHOTOS — HIGH-QUALITY, RELIABLE UNSPLASH IMAGES
   All images are curated to be relevant and consistently loading
───────────────────────────────────────────────────── */
const P = {
  // Hero section
  heroVendor:   "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a0b2?auto=format&fit=crop&w=1200&q=80", // Nigerian beauty vendor with products
  heroProducts: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1200&q=80", // Beauty products display
  
  // Platform illustrations (more reliable, correctly themed)
  whatsapp:     "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?auto=format&fit=crop&w=800&q=80", // WhatsApp interface concept
  instagram:    "https://images.unsplash.com/photo-1611162616475-46b635cb6868?auto=format&fit=crop&w=800&q=80", // Instagram shop concept
  tiktok:       "https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?auto=format&fit=crop&w=800&q=80", // TikTok content creation
  
  // Additional content images
  trustFace:    "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=1400&q=80", // Trust/beauty portrait
  organic:      "https://images.unsplash.com/photo-1601042879364-f3947d3f9c16?auto=format&fit=crop&w=800&q=80", // Natural organic products
  orders:       "https://images.unsplash.com/photo-1586880244406-556ebe35f282?auto=format&fit=crop&w=800&q=80", // Order packaging
  storefront:   "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80", // Modern storefront
  
  // Avatar images (reliable)
  av1: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=100&q=80",
  av2: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=100&q=80",
  av3: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=100&q=80",
};

/* ─────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────── */
const PLATFORMS = [
  {
    name: "WhatsApp",
    dot: "#25D366", dotBg: "rgba(37,211,102,0.1)",
    stat: "95%", statSub: "of Nigerians use it daily",
    problem: "You repeat account details in every DM. Buyers lose patience and drop off before paying.",
    fix: "One SteerSolo link holds your catalog, prices, reviews, and checkout. Paste it once, forever.",
    img: P.whatsapp,
  },
  {
    name: "Instagram",
    dot: "#E1306C", dotBg: "rgba(225,48,108,0.1)",
    stat: "69%", statSub: "social commerce penetration in Nigeria",
    problem: "Your grid looks stunning but there's nowhere to buy. Buyers DM, you respond late, the sale dies.",
    fix: "A verified SteerSolo store page in your bio turns every post into a trust signal with a buy button.",
    img: P.instagram,
  },
  {
    name: "TikTok",
    dot: "#000000", dotBg: "rgba(0,0,0,0.06)",
    stat: "#1", statSub: "beauty content platform globally",
    problem: "You go viral, get 50K views, and make five sales. No storefront to capture the traffic you earned.",
    fix: "Viral TikTok → bio link → SteerSolo store. Every view finally lands somewhere that can convert.",
    img: P.tiktok,
  },
];

const JOURNEY = [
  { n:"01", title:"Keep your existing audience",     body:"Don't leave WhatsApp or Instagram. SteerSolo lives behind your social presence as your store." },
  { n:"02", title:"Paste your SteerSolo link once",  body:"IG bio, WhatsApp status, TikTok profile. One link — catalog, prices, reviews, checkout included." },
  { n:"03", title:"Buyers see proof before they pay",body:"Your SafeBeauty badge, product photos, and real reviews load instantly. No DM required." },
  { n:"04", title:"Orders arrive structured",         body:"No more 'I sent it yesterday'. Every order tracked, every payment confirmed, every buyer recorded." },
];

const BADGES = [
  { num:"01", label:"SafeBeauty Listed",   desc:"Vendor verified, store live. Entry-level trust signal for new buyers.", gold:false },
  { num:"02", label:"SafeBeauty Checked",  desc:"At least one product batch confirmed genuine through our process.", gold:false },
  { num:"03", label:"SafeBeauty Trusted",  desc:"30+ days active, real buyer reviews, zero unresolved complaints.", gold:false },
  { num:"04", label:"SafeBeauty Verified", desc:"Full NAFDAC-aligned identity check — the highest trust signal on the platform.", gold:true },
];

const TESTIMONIALS = [
  { quote:"I used to spend 3 hours a day answering the same DMs. Now I paste my link and the store does the talking.", name:"Chidera O.", role:"Skincare vendor · Lagos", av:P.av1 },
  { quote:"My TikTok blew up and I had nowhere to send people. SteerSolo fixed that overnight.",                       name:"Amara S.",  role:"Makeup artist · Abuja",      av:P.av2 },
  { quote:"The SafeBeauty badge made buyers stop questioning if my products are real. Sales doubled in 6 weeks.",      name:"Fatima B.", role:"Natural beauty vendor · Kano", av:P.av3 },
];

/* ─────────────────────────────────────────────────────
   GLOBAL STYLES
───────────────────────────────────────────────────── */
const GS = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
    :root{--cream:#FDF6EE;--terra:#C4622D;--forest:#1B4332;--gold:#C9963E;--ink:#1A1208;--muted:#7A6652;--blush:#F5E6DA;}
    .ss-d{font-family:'Cormorant Garamond',Georgia,serif;}
    .ss-s{font-family:'DM Sans',sans-serif;}
    @keyframes tick{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
    .ticker{animation:tick 32s linear infinite;width:max-content;}
    .zoom{overflow:hidden;}
    .zoom img{transition:transform .7s ease;width:100%;height:100%;object-fit:cover;}
    .zoom:hover img{transform:scale(1.05);}
    .lift{transition:transform .28s ease,box-shadow .28s ease;}
    .lift:hover{transform:translateY(-5px);box-shadow:0 20px 50px rgba(196,98,45,.14);}
    @keyframes fu{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
    .f1{animation:fu .7s ease both;}
    .f2{animation:fu .7s .13s ease both;}
    .f3{animation:fu .7s .26s ease both;}
    .f4{animation:fu .7s .39s ease both;}
    img { display: block; }
  `}</style>
);

/* ─────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────── */
const Index = () => (
  <div className="ss-s" style={{background:"var(--cream)",color:"var(--ink)"}}>
    <GS />
    <GoogleOneTap />
    <Navbar />

    {/* ══ §1  HERO ══════════════════════════════════════ */}
    <section className="relative overflow-hidden pt-24" style={{background:"var(--forest)",minHeight:"90vh"}}>
      {/* diagonal texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05]" style={{backgroundImage:"repeating-linear-gradient(-55deg,transparent,transparent 48px,rgba(255,255,255,.7) 48px,rgba(255,255,255,.7) 49px)"}}/>
      {/* warm glow */}
      <div className="absolute top-0 right-0 w-3/5 h-full pointer-events-none" style={{background:"radial-gradient(ellipse at 85% 30%,rgba(196,98,45,.22) 0%,transparent 65%)"}}/>

      <div className="container mx-auto px-6 lg:px-14 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16 py-16 lg:py-24">

          {/* text */}
          <div className="flex-1 max-w-2xl f1">
            <div className="inline-flex items-center gap-2 mb-7" style={{borderBottom:"1.5px solid var(--gold)",paddingBottom:6}}>
              <Sparkles className="w-3.5 h-3.5" style={{color:"var(--gold)"}}/>
              <span className="text-xs font-semibold uppercase tracking-[0.2em]" style={{color:"var(--gold)"}}>
                For WhatsApp · Instagram · TikTok vendors
              </span>
            </div>

            <h1 className="ss-d font-bold text-white leading-[1.04] mb-6" style={{fontSize:"clamp(2.8rem,5.5vw,4.8rem)"}}>
              You already have<br/>
              the audience.<br/>
              <em style={{color:"var(--gold)"}}>Give them somewhere to buy.</em>
            </h1>

            <p className="text-lg leading-relaxed mb-10" style={{color:"rgba(255,255,255,.6)",fontWeight:300,maxWidth:520}}>
              500,000+ Nigerian beauty vendors sell on social media every day — and lose buyers
              because there's nowhere to send them after the DM. SteerSolo is that place.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 f2">
              <Link to="/auth/signup">
                <button className="group flex items-center gap-3 px-8 py-4 rounded-full font-semibold text-white text-base transition-all hover:-translate-y-0.5"
                  style={{background:"var(--terra)",boxShadow:"0 8px 30px rgba(196,98,45,.45)"}}>
                  Claim your free store
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform"/>
                </button>
              </Link>
              <Link to="/demo">
                <button className="flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-sm transition-all hover:bg-white/10"
                  style={{border:"1.5px solid rgba(255,255,255,.25)",color:"rgba(255,255,255,.8)"}}>
                  See a demo store
                </button>
              </Link>
            </div>

            <div className="flex flex-wrap gap-3 mt-8 f3">
              {[{I:CheckCircle,t:"Verification-first"},{I:Zap,t:"Free plan to start"},{I:Shield,t:"SafeBeauty certified"}]
                .map(({I,t})=>(
                <span key={t} className="inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-full font-medium"
                  style={{background:"rgba(201,150,62,.15)",color:"var(--gold)"}}>
                  <I className="w-3.5 h-3.5"/>{t}
                </span>
              ))}
            </div>
          </div>

          {/* photo mosaic */}
          <div className="hidden lg:flex flex-col gap-3 w-[370px] xl:w-[420px] flex-shrink-0 f2">
            <div className="zoom rounded-3xl" style={{height:290}}>
              <img src={P.heroVendor} alt="Nigerian beauty vendor" />
            </div>
            <div className="flex gap-3">
              <div className="zoom rounded-2xl flex-1" style={{height:175}}>
                <img src={P.heroProducts} alt="Beauty products" />
              </div>
              <div className="zoom rounded-2xl flex-1" style={{height:175}}>
                <img src={P.organic} alt="Natural beauty" />
              </div>
            </div>
          </div>
        </div>

        {/* stat strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px f4"
          style={{borderTop:"1px solid rgba(255,255,255,.1)"}}>
          {[
            {v:"$10.17B",l:"Nigeria beauty market 2025"},
            {v:"95%",    l:"Nigerians on WhatsApp"},
            {v:"67%",    l:"Online beauty items likely counterfeit"},
            {v:"500K+",  l:"Beauty micro-vendors on social"},
          ].map(s=>(
            <div key={s.l} className="py-7 px-5 text-center" style={{borderRight:"1px solid rgba(255,255,255,.07)"}}>
              <p className="ss-d font-bold text-white" style={{fontSize:"clamp(1.7rem,3vw,2.4rem)"}}>{s.v}</p>
              <p className="text-xs mt-1" style={{color:"rgba(255,255,255,.38)"}}>{s.l}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ══ §2  TICKER ════════════════════════════════════ */}
    <div className="overflow-hidden py-4" style={{background:"var(--terra)"}}>
      <div className="ticker flex items-center gap-0 whitespace-nowrap">
        {Array(2).fill([
          "Nigeria's Only Verified Beauty Marketplace",
          "Real Products · Real Sellers · Real Results",
          "NAFDAC-Aligned Verification",
          "Works on WhatsApp · Instagram · TikTok",
          "Free to Start · Paid When You Grow",
          "SafeBeauty — Your Michelin Star for Trust",
        ]).flat().map((t,i)=>(
          <span key={i} className="inline-flex items-center gap-5 px-7 text-sm font-medium tracking-wide" style={{color:"rgba(255,255,255,.9)"}}>
            <span style={{color:"rgba(255,255,255,.35)",fontSize:"0.48rem"}}>◆</span>{t}
          </span>
        ))}
      </div>
    </div>

    {/* ══ §3  PAIN MIRROR ═══════════════════════════════ */}
    <section className="py-24" style={{background:"var(--cream)"}}>
      <div className="container mx-auto px-6 lg:px-14 max-w-5xl">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] mb-4" style={{color:"var(--terra)"}}>
            Sound familiar?
          </p>
          <h2 className="ss-d font-bold leading-tight" style={{fontSize:"clamp(2rem,4vw,3.2rem)",color:"var(--ink)"}}>
            The selling chaos that kills<br/>
            <em style={{color:"var(--terra)"}}>legitimate businesses every day.</em>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {[
            {q:'"Send your account details"',     b:"Repeated in every DM, every sale. Buyers lose patience and leave before they ever pay."},
            {q:'"Is this still available?"',       b:"No catalog, no prices. Buyers can't browse so they bounce to the next page instead."},
            {q:'"I sent the money yesterday"',     b:"No order tracking. You can't tell who paid, who's pending, or who has gone quiet."},
          ].map(p=>(
            <div key={p.q} className="flex flex-col gap-4">
              <p className="ss-d italic font-semibold" style={{fontSize:"1.4rem",color:"var(--ink)"}}>{p.q}</p>
              <div className="w-10 h-[1.5px]" style={{background:"var(--terra)"}}/>
              <p className="text-sm leading-relaxed" style={{color:"var(--muted)"}}>{p.b}</p>
            </div>
          ))}
        </div>

        <p className="ss-d text-center mt-16 font-semibold italic" style={{fontSize:"1.5rem",color:"var(--forest)"}}>
          SteerSolo fixes all of this — in one link.
        </p>
      </div>
    </section>

    {/* ══ §4  PLATFORM BREAKDOWN ════════════════════════ */}
    <section className="py-24" style={{background:"var(--blush)"}}>
      <div className="container mx-auto px-6 lg:px-14 max-w-6xl">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] mb-4" style={{color:"var(--terra)"}}>
            The platforms you're already on
          </p>
          <h2 className="ss-d font-bold leading-tight" style={{fontSize:"clamp(2rem,4vw,3rem)",color:"var(--ink)"}}>
            Same problem. Every app.<br/>
            <em style={{color:"var(--terra)"}}>SteerSolo solves it once.</em>
          </h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {PLATFORMS.map(pl=>(
            <div key={pl.name} className="lift rounded-3xl overflow-hidden bg-white" style={{border:"1px solid rgba(0,0,0,.07)"}}>
              <div className="zoom" style={{height:200}}>
                <img src={pl.img} alt={pl.name} />
              </div>
              <div className="p-7">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-3 h-3 rounded-full" style={{background:pl.dot}}/>
                  <span className="font-semibold" style={{color:"var(--ink)"}}>{pl.name}</span>
                  <span className="ml-auto text-xs px-3 py-1 rounded-full font-bold" style={{background:pl.dotBg,color:pl.dot}}>
                    {pl.stat}
                  </span>
                </div>
                <p className="text-xs mb-5" style={{color:"var(--muted)"}}>{pl.statSub}</p>
                <div className="rounded-xl p-4 mb-3" style={{background:"rgba(196,98,45,.06)"}}>
                  <p className="text-[11px] font-semibold uppercase tracking-wide mb-1" style={{color:"var(--terra)"}}>The problem</p>
                  <p className="text-sm leading-relaxed" style={{color:"var(--muted)"}}>{pl.problem}</p>
                </div>
                <div className="rounded-xl p-4" style={{background:"rgba(27,67,50,.06)"}}>
                  <p className="text-[11px] font-semibold uppercase tracking-wide mb-1" style={{color:"var(--forest)"}}>SteerSolo fix</p>
                  <p className="text-sm leading-relaxed" style={{color:"var(--muted)"}}>{pl.fix}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ══ §5  FULL-BLEED QUOTE ══════════════════════════ */}
    <div className="relative overflow-hidden" style={{height:"50vh",minHeight:300}}>
      <img src={P.trustFace} alt="Trust" className="absolute inset-0 w-full h-full object-cover object-top"/>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
        style={{background:"rgba(27,67,50,.72)"}}>
        <p className="ss-d italic font-semibold text-white mb-3"
          style={{fontSize:"clamp(1.6rem,4vw,3rem)",textShadow:"0 2px 24px rgba(0,0,0,.4)",maxWidth:740}}>
          "Your skin deserves real products.<br/>Your business deserves real trust."
        </p>
        <p className="text-white/50 text-xs tracking-[0.2em] uppercase mt-2">
          SteerSolo · SafeBeauty Standard · Nigeria
        </p>
      </div>
    </div>

    {/* ══ §6  HOW IT WORKS ══════════════════════════════ */}
    <section className="py-24" style={{background:"var(--cream)"}}>
      <div className="container mx-auto px-6 lg:px-14 max-w-5xl">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] mb-4" style={{color:"var(--terra)"}}>
            How it works
          </p>
          <h2 className="ss-d font-bold leading-tight" style={{fontSize:"clamp(2rem,4vw,3rem)",color:"var(--ink)"}}>
            Keep your audience.<br/>
            <em style={{color:"var(--terra)"}}>Add the storefront they deserve.</em>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-x-16 gap-y-10 mb-14">
          {JOURNEY.map((s,i)=>(
            <div key={s.n} className="flex gap-5">
              <div className="w-11 h-11 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold"
                style={{background:i===0?"var(--terra)":"rgba(196,98,45,.1)",color:i===0?"white":"var(--terra)"}}>
                {s.n}
              </div>
              <div>
                <p className="font-semibold text-base mb-2" style={{color:"var(--ink)"}}>{s.title}</p>
                <p className="text-sm leading-relaxed" style={{color:"var(--muted)"}}>{s.body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* flow bar */}
        <div className="rounded-3xl px-8 py-7 flex flex-col md:flex-row items-center justify-between gap-5 text-center"
          style={{background:"var(--forest)"}}>
          {[
            {e:"📲",l:"WhatsApp / IG / TikTok",  s:"Your existing audience"},
            null,
            {e:"🔗",l:"Your SteerSolo link",      s:"One URL in every bio"},
            null,
            {e:"🛍️",l:"Verified store page",      s:"Catalog + SafeBeauty badge"},
            null,
            {e:"✅",l:"Real orders",               s:"Tracked, confirmed, paid"},
          ].map((item,i)=>
            !item
              ? <span key={i} className="text-white/25 text-2xl hidden md:block">→</span>
              : (
                <div key={i} className="flex flex-col items-center gap-1">
                  <span style={{fontSize:"1.5rem"}}>{item.e}</span>
                  <p className="text-xs font-semibold text-white">{item.l}</p>
                  <p className="text-[11px]" style={{color:"rgba(255,255,255,.38)"}}>{item.s}</p>
                </div>
              )
          )}
        </div>
      </div>
    </section>

    {/* ══ §7  REALITY STATS SPLIT ═══════════════════════ */}
    <section style={{background:"var(--ink)"}}>
      <div className="flex flex-col lg:flex-row min-h-[420px]">
        <div className="zoom lg:w-1/2" style={{minHeight:340}}>
          <img src={P.storefront} alt="Online storefront" style={{minHeight:340}}/>
        </div>
        <div className="lg:w-1/2 flex flex-col justify-center px-10 lg:px-16 py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] mb-8" style={{color:"var(--gold)"}}>
            The reality of selling online in Nigeria
          </p>
          {[
            {n:"82%",t:"of Nigerian e-commerce happens on mobile"},
            {n:"67%",t:"of beauty products bought online are likely counterfeit"},
            {n:"0",  t:"platforms verified social-media beauty vendors — before SteerSolo"},
          ].map(s=>(
            <div key={s.n} className="flex items-start gap-5 mb-8 last:mb-0">
              <span className="ss-d font-bold flex-shrink-0" style={{fontSize:"2.8rem",color:"var(--terra)",lineHeight:1}}>{s.n}</span>
              <p className="text-base leading-relaxed mt-1" style={{color:"rgba(255,255,255,.52)",fontWeight:300}}>{s.t}</p>
            </div>
          ))}
          <Link to="/auth/signup" className="mt-4 self-start">
            <button className="group flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-sm text-white transition-all hover:-translate-y-0.5"
              style={{background:"var(--terra)"}}>
              Be the exception <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform"/>
            </button>
          </Link>
        </div>
      </div>
    </section>

    {/* ══ §8  SAFEBEAUTY BADGES ═════════════════════════ */}
    <section className="py-24" style={{background:"var(--forest)"}}>
      <div className="container mx-auto px-6 lg:px-14 max-w-5xl">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] mb-4" style={{color:"var(--gold)"}}>The trust layer</p>
          <h2 className="ss-d font-bold text-white leading-tight" style={{fontSize:"clamp(2rem,4vw,3rem)"}}>
            SafeBeauty — our Michelin Star<br/>
            <em style={{color:"var(--gold)"}}>for verified beauty vendors.</em>
          </h2>
          <p className="mt-4 max-w-xl mx-auto text-base" style={{color:"rgba(255,255,255,.48)"}}>
            Every badge is earned, not bought. Buyers instantly know how trusted your store is before they spend a kobo.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {BADGES.map(b=>(
            <div key={b.label} className="lift rounded-2xl p-6 flex flex-col gap-3"
              style={{
                background:b.gold?"linear-gradient(135deg,var(--gold),#E8B84B)":"rgba(255,255,255,.07)",
                border:b.gold?"none":"1px solid rgba(255,255,255,.1)",
              }}>
              <span className="ss-d font-bold" style={{fontSize:"2.2rem",opacity:.2,lineHeight:1,color:b.gold?"var(--ink)":"white"}}>{b.num}</span>
              <p className="font-semibold text-sm" style={{color:b.gold?"var(--ink)":"var(--gold)"}}>{b.label}</p>
              <p className="text-xs leading-relaxed" style={{color:b.gold?"rgba(26,18,8,.62)":"rgba(255,255,255,.48)"}}>{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ══ §9  CONTENT STRATEGY ══════════════════════════ */}
    <section className="py-24" style={{background:"var(--blush)"}}>
      <div className="container mx-auto px-6 lg:px-14 max-w-5xl">
        <div className="flex flex-col lg:flex-row items-center gap-14 lg:gap-20">

          {/* photo grid */}
          <div className="hidden lg:grid grid-cols-2 gap-3 w-[360px] flex-shrink-0">
            {[P.orders, P.tiktok, P.instagram, P.heroVendor].map((src,i)=>(
              <div key={i} className="zoom" style={{
                height:165,
                borderTopLeftRadius:  i===0?20:0,
                borderTopRightRadius: i===1?20:0,
                borderBottomLeftRadius:  i===2?20:0,
                borderBottomRightRadius: i===3?20:0,
              }}>
                <img src={src} alt="" />
              </div>
            ))}
          </div>

          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] mb-4" style={{color:"var(--terra)"}}>
              Content that converts
            </p>
            <h2 className="ss-d font-bold leading-tight mb-5" style={{fontSize:"clamp(2rem,3.5vw,2.8rem)",color:"var(--ink)"}}>
              Post the content.<br/>
              <em style={{color:"var(--terra)"}}>Let your store close the sale.</em>
            </h2>
            <p className="text-base leading-relaxed mb-8" style={{color:"var(--muted)"}}>
              TikTok tutorials, Instagram reels, WhatsApp status — your content brings the audience.
              Your SteerSolo link converts them. No DM chaos. No lost sales.
            </p>
            <div className="space-y-3">
              {[
                "Fake beauty awareness — the content that goes viral and positions you as safe",
                "Vendor spotlights — your SafeBeauty badge story, shared by real buyers",
                "Restock alerts — WhatsApp broadcasts to your verified buyer list",
                "'Pack my orders' content — TikTok's most trusted beauty vendor format",
              ].map(t=>(
                <div key={t} className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{color:"var(--terra)"}}/>
                  <p className="text-sm leading-relaxed" style={{color:"var(--muted)"}}>{t}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* ══ §10  TESTIMONIALS ═════════════════════════════ */}
    <section className="py-24" style={{background:"var(--ink)"}}>
      <div className="container mx-auto px-6 lg:px-14 max-w-5xl">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] mb-4" style={{color:"var(--gold)"}}>Vendor stories</p>
          <h2 className="ss-d font-bold text-white" style={{fontSize:"clamp(2rem,4vw,2.8rem)"}}>
            Social sellers who made the switch.
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(t=>(
            <div key={t.name} className="lift rounded-3xl p-7 flex flex-col gap-5"
              style={{background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.09)"}}>
              <p className="ss-d italic text-white/90 leading-relaxed" style={{fontSize:"1.1rem"}}>
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3 mt-auto">
                <img src={t.av} alt={t.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0"/>
                <div>
                  <p className="font-semibold text-sm text-white">{t.name}</p>
                  <p className="text-xs" style={{color:"rgba(255,255,255,.38)"}}>{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ══ existing components ═══════════════════════════ */}
    <FeaturedShopsBanner />
    <HomepageReviews />
    <DynamicPricing />
    <ShopperDiscovery />

    {/* ══ §15  FINAL CTA ════════════════════════════════ */}
    <section className="relative py-28 text-center overflow-hidden"
      style={{background:"linear-gradient(135deg,var(--terra) 0%,#9B3E18 55%,var(--forest) 100%)"}}>
      <div className="absolute inset-0 pointer-events-none opacity-[0.07]"
        style={{backgroundImage:"repeating-linear-gradient(45deg,transparent,transparent 40px,rgba(255,255,255,.5) 40px,rgba(255,255,255,.5) 41px)"}}/>
      <div className="container mx-auto px-6 max-w-2xl relative z-10">
        <ShoppingBag className="w-8 h-8 mx-auto mb-6" style={{color:"rgba(255,255,255,.38)"}}/>
        <h2 className="ss-d font-bold text-white leading-tight mb-5" style={{fontSize:"clamp(2.4rem,5vw,4rem)"}}>
          Your audience is ready.<br/><em>Is your storefront?</em>
        </h2>
        <p className="text-lg mb-3 max-w-md mx-auto" style={{color:"rgba(255,255,255,.62)"}}>
          Join verified Nigerian beauty vendors turning their social following into a real, trusted business.
        </p>
        <p className="text-sm italic mb-10" style={{color:"rgba(255,255,255,.32)"}}>
          "SteerSolo made my business look professional from day one."
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-9">
          <Link to="/auth/signup">
            <button className="group flex items-center gap-2 px-9 py-4 rounded-full font-bold text-base transition-all hover:-translate-y-0.5"
              style={{background:"white",color:"var(--terra)",boxShadow:"0 10px 32px rgba(0,0,0,.22)"}}>
              Start Free — No Card Needed
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform"/>
            </button>
          </Link>
          <Link to="/demo">
            <button className="flex items-center gap-2 px-9 py-4 rounded-full text-sm font-semibold transition-all hover:bg-white/10"
              style={{border:"1.5px solid rgba(255,255,255,.3)",color:"rgba(255,255,255,.8)"}}>
              View a demo store first
            </button>
          </Link>
        </div>
        <div className="flex flex-wrap justify-center gap-5 text-xs" style={{color:"rgba(255,255,255,.42)"}}>
          {["Free forever plan","Works on WhatsApp, IG & TikTok","SafeBeauty badge included"].map(t=>(
            <span key={t} className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" style={{color:"rgba(255,255,255,.52)"}}/>
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>

    <Footer />
  </div>
);

export default Index;