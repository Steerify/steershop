import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  CheckCircle,
  Shield,
  Zap,
  Sparkles,
  ShoppingBag,
  Star,
  Instagram,
  MessageCircle,
  Music2,
  MapPin,
  Store,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { Footer } from "@/components/Footer";
// Removed unused ShopperDiscovery + CollectionsSection imports after homepage declutter.
import { GoogleOneTap } from "@/components/auth/GoogleOneTap";
import { Helmet } from "react-helmet-async";
import { FeaturedStoresHeroCarousel } from "@/components/FeaturedStoresHeroCarousel";
import whatsappLogo from "@/assets/social/whatsapp-logo.svg";
import instagramLogo from "@/assets/social/instagram-logo.svg";
import tiktokLogo from "@/assets/social/tiktok-logo.svg";

/* ─── Photos (real Nigerian merchant imagery) ─── */
const P = {
  heroVendor:
    "https://images.unsplash.com/photo-1611432579699-484f7990b127?auto=format&fit=crop&w=800&q=80",
  heroProducts:
    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80",
  whatsapp:
    "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80",
  instagram:
    "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=800&q=80",
  tiktok:
    "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&w=800&q=80",
  igLogo: instagramLogo,
  tiktokLogo: tiktokLogo,
  waLogo: whatsappLogo,
  trustFace:
    "https://images.unsplash.com/photo-1531123414780-f74242c2b052?auto=format&fit=crop&w=800&q=80",
  organic:
    "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=800&q=80",
  orders:
    "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80",
  storefront:
    "https://images.unsplash.com/photo-1604881991720-f91add269bed?auto=format&fit=crop&w=800&q=80",
  av1: "https://images.unsplash.com/photo-1531123414780-f74242c2b052?auto=format&fit=crop&w=200&q=80",
  av2: "https://images.unsplash.com/photo-1611432579699-484f7990b127?auto=format&fit=crop&w=200&q=80",
  av3: "https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&w=200&q=80",
};

/* ─── Data ─── */
const PLATFORMS = [
  {
    name: "WhatsApp",
    dot: "#25D366",
    dotBg: "rgba(37,211,102,0.1)",
    stat: "95%",
    statSub: "of Nigerians use it daily",
    problem:
      "You have a loyal audience, but replying to every message with bank details and catalogs gets exhausting.",
    fix: "Connect your SteerSolo link. Buyers browse your full catalog and checkout instantly, while the verified order drops directly into your WhatsApp.",
    img: P.waLogo,
  },
  {
    name: "Instagram",
    dot: "#E1306C",
    dotBg: "rgba(225,48,108,0.1)",
    stat: "69%",
    statSub: "social commerce penetration in Nigeria",
    problem:
      "Your grid looks stunning and draws people in, but 'DM to order' creates friction that loses impulse buyers.",
    fix: "Put your SteerSolo store link in your bio. Capitalize on your aesthetic by letting buyers purchase immediately without waiting for a DM reply.",
    img: P.igLogo,
  },
  {
    name: "TikTok",
    dot: "#888",
    dotBg: "rgba(100,100,100,0.08)",
    stat: "#1",
    statSub: "beauty content platform globally",
    problem:
      "You post amazing content that goes viral, but you can't easily capture the massive traffic it generates.",
    fix: "Convert virality into revenue. Funnel your viewers straight to your SteerSolo checkout link and maximize your earning potential.",
    img: P.tiktokLogo,
  },
];

const DiscoveryLinks = () => (
  <section className="py-24 bg-background relative overflow-hidden">
    {/* Decorative blur elements for spectacular effect */}
    <div className="absolute top-0 -left-1/4 w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full pointer-events-none animate-pulse-soft" />
    <div className="absolute bottom-0 -right-1/4 w-[50%] h-[50%] bg-accent/10 blur-[120px] rounded-full pointer-events-none animate-pulse-soft" style={{ animationDelay: '2s' }} />

    <div className="mx-auto max-w-screen-xl px-4 relative z-10">
      <div className="flex flex-col md:flex-row items-end justify-between gap-10 mb-16 animate-fade-up">
        <div className="max-w-2xl text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-semibold mb-6">
            <Sparkles className="w-4 h-4" />
            Curated Categories
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6 leading-tight">
            Discover the Best of{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary animate-gradient-x">Nigerian Commerce</span>
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
            Supporting local entrepreneurs across major cities. Find verified
            merchants near you, from Lagos to Abuja, with absolute trust.
          </p>
        </div>
        <Link
          to="/shops"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-foreground text-background font-bold hover:scale-105 hover:shadow-2xl transition-all duration-300 group"
        >
          Explore Marketplace{" "}
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-4 sm:gap-6 h-auto md:h-[600px] auto-rows-fr">
        {[
          { name: "Fashion in Lagos", slug: "fashion-in-lagos", span: "md:col-span-2 md:row-span-1", bg: "bg-gradient-to-br from-primary/5 to-primary/20", img: "🛍️" },
          { name: "Food in Abuja", slug: "food-drinks-in-abuja", span: "md:col-span-1 md:row-span-1", bg: "bg-gradient-to-br from-orange-500/5 to-orange-500/20", img: "🍲" },
          { name: "Tech in PH", slug: "electronics-in-port-harcourt", span: "md:col-span-1 md:row-span-2", bg: "bg-gradient-to-br from-accent/5 to-accent/20", img: "💻" },
          { name: "Beauty in Lagos", slug: "beauty-health-in-lagos", span: "md:col-span-1 md:row-span-1", bg: "bg-gradient-to-br from-pink-500/5 to-pink-500/20", img: "💄" },
          { name: "Skincare in Abuja", slug: "skincare-in-abuja", span: "md:col-span-2 md:row-span-1", bg: "bg-gradient-to-br from-blue-500/5 to-blue-500/20", img: "✨" },
        ].map((hub, i) => (
          <Link
            key={hub.slug}
            to={`/discover/${hub.slug}`}
            className={cn(
              "group relative overflow-hidden rounded-[2rem] border border-white/10 p-8 flex flex-col justify-between hover:shadow-2xl transition-all duration-500 hover:-translate-y-1",
              hub.span, hub.bg,
              "backdrop-blur-xl bg-white/50 dark:bg-black/20"
            )}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
            
            <div className="flex items-start justify-between relative z-10">
              <div className="text-4xl filter drop-shadow-md group-hover:scale-110 transition-transform duration-500">{hub.img}</div>
              <div className="w-10 h-10 rounded-full bg-white/50 dark:bg-black/50 flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                <ArrowRight className="w-5 h-5 text-foreground" />
              </div>
            </div>

            <div className="relative z-10 mt-12">
              <h4 className="font-black text-2xl text-foreground mb-2 leading-tight">
                {hub.name}
              </h4>
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                <MapPin className="w-4 h-4" /> Explore Collection
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

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
        style={{
          width: "55%",
          height: "auto",
          objectFit: "contain",
          filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.1))",
        }}
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
  {
    n: "01",
    title: "Create your store in 60s",
    body: "Build a stunning, custom-styled storefront instantly. Add products or services with pricing in under a minute.",
  },
  {
    n: "02",
    title: "Share your bio link",
    body: "Paste your link once in your Instagram bio, WhatsApp status, or TikTok profile to direct all visitors to your storefront.",
  },
  {
    n: "03",
    title: "Get customers with Steerify Ads",
    body: "Launch conversion-focused ads on Meta & TikTok in 1 click. We optimize target testing so buyers flood your link with traffic.",
  },
  {
    n: "04",
    title: "Orders arrive in WhatsApp",
    body: "No more DM chaos or sending manual account details. Customers checkout and verified orders land straight in WhatsApp.",
  },
];

const BADGES = [
  {
    num: "01",
    label: "SteerSolo Safe Listed",
    desc: "Merchant verified, store live. Entry-level trust signal for new buyers.",
    top: false,
  },
  {
    num: "02",
    label: "SteerSolo Safe Checked",
    desc: "At least one product batch confirmed genuine through our process.",
    top: false,
  },
  {
    num: "03",
    label: "SteerSolo Safe Trusted",
    desc: "30+ days active, real buyer reviews, zero unresolved complaints.",
    top: false,
  },
  {
    num: "04",
    label: "SteerSolo Safe Verified",
    desc: "Full identity check — the highest trust signal on the platform.",
    top: true,
  },
];

const TESTIMONIALS = [
  {
    quote:
      "I used to spend 3 hours a day answering the same DMs. Now I paste my link and the store does the talking.",
    name: "Chidera O.",
    role: "Skincare merchant · Lagos",
    av: P.av1,
  },
  {
    quote:
      "My TikTok blew up and I had nowhere to send people. SteerSolo fixed that overnight.",
    name: "Amara S.",
    role: "Makeup artist · Abuja",
    av: P.av2,
  },
  {
    quote:
      "The SteerSolo Safe badge made buyers stop questioning if my products are real. Sales doubled in 6 weeks.",
    name: "Fatima B.",
    role: "Natural beauty merchant · Kano",
    av: P.av3,
  },
];

const STATS = [
  { v: "$10.17B", l: "Nigeria beauty market 2025" },
  { v: "95%", l: "Nigerians on WhatsApp" },
  { v: "67%", l: "Online beauty items likely counterfeit" },
  { v: "500K+", l: "Beauty micro-merchants on social" },
];

const AnimatedCounter = ({ target }: { target: number }) => {
  const [count, setCount] = useState(target > 20 ? target - 20 : 0);

  useEffect(() => {
    const start = target > 20 ? target - 20 : 0;
    if (start === target) return;
    
    // Animate up to the target
    const duration = 1000; // 1 second animation duration
    const steps = 20;
    const stepTime = Math.max(duration / steps, 20);
    const increment = Math.ceil((target - start) / steps) || 1;

    let current = start;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [target]);

  return <>{count}</>;
};

const HeroTextSlider = () => {
  const [index, setIndex] = useState(0);
  const phrases = [
    {
      eyebrow: "For solo sellers on WhatsApp · Instagram · TikTok",
      h1: "Launch a professional store.<br />Show prices clearly.<br /><em style='font-style:normal;color:hsl(var(--accent-bright))'>Keep customers on WhatsApp.</em>",
      p: "SteerSolo gives you a storefront, product catalog, orders, and Paystack-ready payments while WhatsApp stays your customer relationship channel.",
      cta1: {
        label: "Claim your free store",
        link: "/auth/signup",
        icon: ArrowRight,
      },
      cta2: { label: "See a demo store", link: "/demo" },
    },
    {
      eyebrow: "For Nigerian shoppers",
      h1: "Find trusted stores.<br />See prices upfront.<br /><em style='font-style:normal;color:hsl(var(--primary))'>Buy without guesswork.</em>",
      p: "Discover Nigerian stores with visible prices, clear catalogs, and direct paths to order or pay.",
      cta1: { label: "Explore Marketplace", link: "/shops", icon: ShoppingBag },
      cta2: { label: "Sign up for free", link: "/shopper-signup" },
    },
  ];
  const phraseCount = phrases.length;

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(prev => (prev + 1) % phraseCount);
    }, 6000);
    return () => clearInterval(timer);
  }, [phraseCount]);

  return (
    <div className="relative overflow-hidden">
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
      {phrases.map((phrase, i) => (
        <div
          key={i}
          className={cn(
            "transition-all duration-700",
            i === index ? "block animate-slide-in" : "hidden",
          )}
        >
          {/* Aligned Escrow Pill & Eyebrow Badge Row */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md text-emerald-600 dark:text-emerald-400 text-xs font-semibold select-none">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 dark:bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-600 dark:bg-emerald-500"></span>
              </span>
              🔒 Paystack Secured Escrow Enabled
            </div>

            <span className="text-border text-xs hidden sm:inline">|</span>

            <div className="inline-flex items-center gap-1.5 py-1">
              <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
              <span className="text-[11.5px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                {phrase.eyebrow}
              </span>
            </div>
          </div>

          <h1
            className="font-extrabold text-foreground leading-[1.05] mb-5 text-4xl sm:text-5xl lg:text-7xl tracking-tighter"
            dangerouslySetInnerHTML={{ __html: phrase.h1 }}
          />

          <p className="text-base sm:text-lg text-muted-foreground font-medium max-w-lg mb-8 leading-relaxed">
            {phrase.p}
          </p>

          {/* CTAs with Premium Hover & Scale Effects */}
          <div className="flex flex-wrap gap-4 mb-2">
            <Link to={phrase.cta1.link}>
              <button className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl font-bold text-base text-primary-foreground bg-primary shadow-lg hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:scale-95 transition-all duration-300 transform">
                {phrase.cta1.label}
                {phrase.cta1.icon && (
                  <phrase.cta1.icon className="w-4 h-4" />
                )}
              </button>
            </Link>
            <Link to={phrase.cta2.link}>
              <button className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-semibold text-sm bg-muted text-foreground border border-border hover:-translate-y-0.5 hover:bg-muted/80 active:translate-y-0 active:scale-95 transition-all duration-300 transform">
                {phrase.cta2.label}
              </button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════ PAGE ═══ */
const Index = () => {
  const [liveVendorCount, setLiveVendorCount] = useState<number>(0);
  const [vendorCountLabel, setVendorCountLabel] = useState<string>("active merchants");

  useEffect(() => {
    let isMounted = true;
    let channel: RealtimeChannel | null = null;

    const fetchVendorCount = async () => {
      try {
        // 1. Active merchants = distinct shop_id appearing in orders (real, transacting shops)
        const { data: activeRows, error: activeErr } = await supabase
          .from("orders")
          .select("shop_id")
          .not("shop_id", "is", null);

        let activeCount = 0;
        if (!activeErr && activeRows) {
          activeCount = new Set(activeRows.map(r => r.shop_id)).size;
        }

        if (activeCount > 0) {
          if (!isMounted) return;
          setLiveVendorCount(activeCount);
          setVendorCountLabel("active merchants");
          return;
        }

        // 2. Fallback: approved (live) shops
        const { count: approvedCount } = await supabase
          .from("shops")
          .select("id", { count: "exact", head: true })
          .eq("is_active", true);

        if (!isMounted) return;
        setLiveVendorCount(approvedCount ?? 0);
        setVendorCountLabel("approved shops");
      } catch (e) {
        console.error("Error fetching merchant count:", e);
      }
    };
    fetchVendorCount();

    channel = supabase
      .channel('public:merchants-count-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shops' }, () => { if (isMounted) fetchVendorCount(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => { if (isMounted) fetchVendorCount(); })
      .subscribe();

    return () => {
      isMounted = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const DYNAMIC_STATS = [
    { v: "Fast", l: "Professional storefront launch" },
    { v: "Clear", l: "Catalogs with visible prices" },
    { v: "Direct", l: "Orders flow into WhatsApp" },
    { v: `${liveVendorCount.toLocaleString()}`, l: "Verified merchants live on SteerSolo" },
  ];

  return (
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

    <Helmet>
      <title>
        SteerSolo - Professional Stores for Nigerian Solo Sellers
      </title>
      <meta
        name="description"
        content="Launch a professional SteerSolo storefront with visible prices, WhatsApp order flow, Paystack payment support, and marketplace discovery for trusted Nigerian stores."
      />
      <meta
        name="keywords"
        content="social commerce nigeria, sell on whatsapp nigeria, instagram store nigeria, online storefront nigeria, paystack store, steersolo, ecommerce nigeria"
      />
      <link rel="canonical" href="https://steersolo.com" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://steersolo.com" />
      <meta
        property="og:title"
        content="SteerSolo - Professional Stores for Nigerian Solo Sellers"
      />
      <meta
        property="og:description"
        content="Create a professional storefront with clear prices, WhatsApp ordering, Paystack payment support, and discovery for trusted Nigerian stores."
      />
      <meta property="og:image" content="https://steersolo.com/og-image.png" />
      <meta property="og:site_name" content="SteerSolo" />
      <meta property="og:locale" content="en_NG" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content="https://steersolo.com" />
      <meta
        name="twitter:title"
        content="SteerSolo - Professional Stores for Nigerian Solo Sellers"
      />
      <meta
        name="twitter:description"
        content="Create a professional storefront with clear prices, WhatsApp ordering, Paystack payment support, and discovery for trusted Nigerian stores."
      />
      <meta name="twitter:image" content="https://steersolo.com/og-image.png" />
      <meta name="twitter:site" content="@steersolo" />

      {/* AI & Search Engine Richness */}
      <script type="application/ld+json">
        {JSON.stringify([
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "SteerSolo",
            "url": "https://steersolo.com",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://steersolo.com/shops?search={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          },
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "SteerSolo",
            "url": "https://steersolo.com",
            "logo": "https://steersolo.com/og-image.jpg",
            "sameAs": [
              "https://twitter.com/SteerifyGroup",
              "https://instagram.com/SteerifyGroup"
            ]
          }
        ])}
      </script>
    </Helmet>
    <GoogleOneTap />
    <Navbar />

    {/* ══════════════════════════════════════════════════════
        §1  HERO — Always dark Adire Indigo
    ══════════════════════════════════════════════════════ */}
    <main id="main-content">
    <section className="bg-brand-hero relative overflow-hidden min-h-[92vh] pt-24">
      {/* subtle adire diagonal texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: 0.035,
          backgroundImage:
            "repeating-linear-gradient(-55deg,transparent,transparent 48px,rgba(255,255,255,.9) 48px,rgba(255,255,255,.9) 49px)",
        }}
      />
      {/* accent glow — bottom right */}
      <div
        style={{
          position: "absolute",
          bottom: "-10%",
          right: "-5%",
          width: "55%",
          height: "70%",
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse at 80% 80%, hsl(var(--accent) / 0.15) 0%, transparent 65%)",
        }}
      />
      {/* soft indigo glow — top left */}
      <div
        style={{
          position: "absolute",
          top: "-10%",
          left: "-5%",
          width: "40%",
          height: "50%",
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse at 20% 20%, hsl(var(--brand-blue-strong) / 0.35) 0%, transparent 65%)",
        }}
      />

      <div className="mx-auto max-w-screen-xl px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-10 pb-24">
          {/* ── TEXT ── */}
          <div style={{ flex: "1 1 420px", maxWidth: 560 }} className="f1">
            <div style={{ minHeight: 280 }}>
              <HeroTextSlider />
            </div>

            {/* Consolidated Premium Social Proof & Trust Section */}
            <div className="mt-8 p-5 rounded-[2rem] bg-card/40 border border-border/50 backdrop-blur-xl shadow-xl space-y-4 animate-fade-up f3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-4">
                {/* Active Merchant Count with avatars */}
                <div className="inline-flex items-center gap-3">
                  <div className="flex -space-x-2 shrink-0">
                    <img
                      src={P.av1}
                      alt="Merchant 1"
                      className="w-8 h-8 rounded-full border-2 border-background object-cover"
                    />
                    <img
                      src={P.av2}
                      alt="Merchant 2"
                      className="w-8 h-8 rounded-full border-2 border-background object-cover"
                    />
                    <img
                      src={P.av3}
                      alt="Merchant 3"
                      className="w-8 h-8 rounded-full border-2 border-background object-cover"
                    />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground flex items-center gap-1.5">
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-foreground font-extrabold">
                        <AnimatedCounter target={liveVendorCount} />+
                      </span>{" "}
                      {vendorCountLabel}
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Live storefronts in Lagos, Abuja & across Nigeria
                    </p>
                  </div>
                </div>
                {/* Live Status indicator */}
                <div className="flex items-center shrink-0">
                  <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                    Live
                  </span>
                </div>
              </div>

              {/* Trust badges row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { I: CheckCircle, t: "Verification-first", d: "Strict identity checks" },
                  { I: Zap, t: "Instant Stores", d: "Set up under 60 seconds" },
                  { I: Shield, t: "Safe Escrow", d: "Paystack escrow security" },
                ].map(({ I, t, d }) => (
                  <div
                    key={t}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-background/50 hover:bg-background transition-all duration-300 border border-border/50"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                      <I className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground leading-none mb-0.5">{t}</p>
                      <p className="text-[9px] text-muted-foreground leading-none">{d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── FEATURED STORES CAROUSEL ── */}
          <FeaturedStoresHeroCarousel />
        </div>

        {/* ── STAT STRIP ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-border/30 bg-card/20 backdrop-blur-md rounded-t-[2rem]">
          {DYNAMIC_STATS.map((s, i) => (
            <div
              key={s.l}
              className="py-8 px-6 text-center border-b sm:border-b-0 border-border/30 last:border-0 sm:even:border-r lg:border-r lg:last:border-r-0 transition-colors duration-300 hover:bg-muted/30"
            >
              <p className="font-black text-foreground text-2xl sm:text-3xl lg:text-4xl mb-2 tracking-tight">
                {s.v}
              </p>
              <p className="text-xs font-semibold text-muted-foreground leading-relaxed uppercase tracking-wider">
                {s.l}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ══════════════════════════════════════════════════════
        §2  TICKER — Accent green strip
    ══════════════════════════════════════════════════════ */}
    <div className="w-full overflow-hidden py-3.5 bg-accent">
      <div
        className="flex items-center"
        style={{
          animation: "tick 32s linear infinite",
          width: "max-content",
        }}
      >
        {Array(2)
          .fill([
            "Professional Storefronts for Nigerian Solo Sellers",
            "Visible Prices · Direct Orders · Real Stores",
            "WhatsApp Stays Your Customer Channel",
            "Works on WhatsApp · Instagram · TikTok",
            "Trusted Discovery for Nigerian Shoppers",
          ])
          .flat()
          .map((t, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-5 px-7 text-xs sm:text-sm font-bold tracking-wider text-white uppercase select-none"
            >
              <span className="text-white/70 text-[6px]">◆</span>
              {t}
            </span>
          ))}
      </div>
    </div>

    {/* ══════════════════════════════════════════════════════
        §3  CLEAR VALUE BLOCKS — Concise SteerSolo promise
    ══════════════════════════════════════════════════════ */}
    <section className="py-24 bg-secondary/30">
      <div className="mx-auto max-w-screen-xl px-4">
        <div className="text-center mb-16">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-4">
            Built for clearer commerce
          </p>
          <h2 className="text-foreground font-black text-4xl md:text-[56px] leading-[0.95] tracking-tight m-0">
            SteerSolo helps sellers look ready<br />
            <span className="text-primary">and helps buyers decide faster.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {[
            {
              label: "What SteerSolo stands for",
              accent: "text-primary",
              items: [
                "Trust between real Nigerian stores and shoppers",
                "Clarity through visible products, prices, and buying steps",
                "Speed from storefront visit to order confirmation",
                "Independence for solo sellers building on their own terms",
              ],
            },
            {
              label: "What you get",
              accent: "text-accent",
              items: [
                "A shareable storefront link for every bio and status",
                "A product catalog with clear prices and availability",
                "WhatsApp order flow that keeps conversations familiar",
                "Paystack/payment support plus marketplace discovery",
              ],
            },
            {
              label: "Why it converts",
              accent: "text-primary",
              items: [
                "Fewer repetitive DMs asking what is available",
                "Fewer pricing questions before buyers commit",
                "More confidence because the buying path is obvious",
                "More serious orders from shoppers who already understand the offer",
              ],
            },
          ].map((block, idx) => (
            <div
              key={block.label}
              className="lift rounded-[2rem] bg-card border border-border/40 p-8 shadow-sm"
            >
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary font-black">
                {idx + 1}
              </div>
              <h3 className={cn("text-2xl font-black tracking-tight mb-5", block.accent)}>
                {block.label}
              </h3>
              <div className="space-y-4">
                {block.items.map(item => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    <p className="m-0 text-sm leading-6 text-muted-foreground">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ══════════════════════════════════════════════════════
        §5  FULL-BLEED QUOTE — Always dark overlay
    ══════════════════════════════════════════════════════ */}
    <div
      style={{
        position: "relative",
        height: "50vh",
        minHeight: 280,
        overflow: "hidden",
      }}
    >
      <img
        src={P.trustFace}
        alt="Trust"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "top",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "0 1.5rem",
          background: "hsl(var(--brand-blue-deep) / 0.82)",
        }}
      >
        <p
          style={{
            fontWeight: 700,
            color: "#fff",
            fontSize: "clamp(1.5rem,3.8vw,3.2rem)",
            textShadow: "0 2px 20px rgba(0,0,0,.35)",
            maxWidth: 850,
            lineHeight: 1.3,
            margin: 0,
          }}
        >
          "Your content wins their attention.
          <br />
          SteerSolo wins the sale."
        </p>
        <p
          style={{
            color: "rgba(255,255,255,.45)",
            fontSize: "0.68rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            marginTop: 16,
          }}
        >
          SteerSolo · SteerSolo Safe Standard · Nigeria
        </p>
      </div>
    </div>

    {/* ══════════════════════════════════════════════════════
        §6  HOW IT WORKS — Clean Grid
    ══════════════════════════════════════════════════════ */}
    <section className="py-24 bg-background">
      <div className="mx-auto mt-12 sm:mt-24 max-w-6xl px-6">
        <div className="grid gap-12 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
          <div className="max-w-xl text-left">
            <div className="mb-6 inline-flex rounded-full bg-primary/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-primary">
              How it works
            </div>
            <h2 className="font-black leading-[0.95] tracking-tight text-foreground text-4xl md:text-[56px]">
              Simple enough to understand in seconds
            </h2>
            <p className="mt-5 max-w-md text-[18px] leading-8 text-muted-foreground">
              Create your store, paste the link in your bio, and let customers check out instantly. We handle the rest.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {JOURNEY.map((s, i) => {
              // Alternate background colors slightly for visual interest, similar to Edgloe
              const isAccentBg = i === 1 || i === 3;
              
              return (
                <div 
                  key={s.n} 
                  className={cn(
                    "rounded-[28px] p-6 shadow-sm border transition-all duration-300 hover:shadow-elegant hover:-translate-y-1",
                    isAccentBg 
                      ? "bg-secondary/30 border-transparent dark:bg-card dark:border-border/40" 
                      : "bg-card border-border/40 dark:bg-card"
                  )}
                >
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                      {i === 0 && <Store className="w-5 h-5" />}
                      {i === 1 && <MapPin className="w-5 h-5" />}
                      {i === 2 && <Zap className="w-5 h-5" />}
                      {i === 3 && <MessageCircle className="w-5 h-5" />}
                    </div>
                    <div className="text-[12px] font-black text-muted-foreground/40 dark:text-muted-foreground/30">
                      {s.n}
                    </div>
                  </div>
                  <h3 className="text-[22px] font-black tracking-tight text-foreground">
                    {s.title}
                  </h3>
                  <p className="mt-3 text-[15px] leading-7 text-muted-foreground">
                    {s.body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>

    {/* ══════════════════════════════════════════════════════
        §5  REALITY STATS SPLIT — Clean Style
    ══════════════════════════════════════════════════════ */}
    <section className="bg-background border-y border-border/40">
      <div className="flex flex-col lg:flex-row min-h-[420px]">
        <div className="img-zoom flex-1 overflow-hidden min-h-[320px] bg-muted/20">
          <img
            src={P.storefront}
            alt="Online storefront"
            className="w-full h-full object-cover min-h-[320px]"
          />
        </div>
        <div className="flex-1 flex flex-col justify-center p-10 md:p-14 bg-secondary/20">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary mb-8">
            The reality of selling online in Nigeria
          </p>
          {[
            { n: "82%", t: "of Nigerian e-commerce happens on mobile" },
            {
              n: "67%",
              t: "of beauty products bought online are likely counterfeit",
            },
            {
              n: "10x",
              t: "Orders are sent directly to your WhatsApp, converting 10x faster.",
            },
          ].map(s => (
            <div
              key={s.n}
              className="flex items-start gap-5 mb-7"
            >
              <span className="font-black text-foreground text-4xl sm:text-5xl leading-none shrink-0">
                {s.n}
              </span>
              <p className="text-sm sm:text-base leading-relaxed text-muted-foreground font-light mt-1">
                {s.t}
              </p>
            </div>
          ))}
          <div className="mt-2">
            <Link to="/auth/signup">
              <button className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl font-bold text-sm text-primary-foreground bg-primary shadow-lg hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 transition-all duration-300">
                Be the exception{" "}
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>

    {/* ══════════════════════════════════════════════════════
        §8  SAFEBEAUTY BADGES — Clean Style
    ══════════════════════════════════════════════════════ */}
    <section className="bg-secondary/30 py-24 md:py-32 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.03]">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[50%] bg-primary blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[60%] bg-emerald-500 blur-[120px] rounded-full" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 md:mb-20">
          <p className="text-primary font-bold text-xs uppercase tracking-[0.3em] mb-4">
            The Trust Layer
          </p>
          <h2 className="text-4xl md:text-6xl font-extrabold text-foreground mb-6 tracking-tight leading-tight">
            SteerSolo Safe — our Trust Layer
            <br />
            <span className="text-emerald-600 dark:text-emerald-400">
              for verified Nigerian merchants.
            </span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
            Every badge is earned, not bought. Buyers instantly know how trusted
            <br className="hidden md:block" /> your store is before they spend a
            kobo.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {BADGES.map((badge, i) => (
            <div
              key={badge.label}
              className={cn(
                "group relative p-8 rounded-[2.5rem] border transition-all duration-500 hover:-translate-y-2 overflow-hidden flex flex-col justify-between min-h-[300px]",
                badge.top
                  ? "bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.3)] animate-pulse-soft"
                  : "bg-card border-border/40 hover:bg-card/90 hover:border-border/80 shadow-sm",
              )}
            >
              <div>
                <div
                  className={cn(
                    "text-6xl font-black mb-6 transition-colors duration-500 select-none",
                    badge.top
                      ? "text-white/20"
                      : "text-muted-foreground/10 group-hover:text-muted-foreground/20",
                  )}
                >
                  {badge.num}
                </div>
                <h3
                  className={cn(
                    "text-xl font-extrabold mb-3 tracking-tight",
                    badge.top ? "text-white" : "text-foreground",
                  )}
                >
                  {badge.label}
                </h3>
                <p
                  className={cn(
                    "text-sm leading-relaxed font-light",
                    badge.top ? "text-white/90" : "text-muted-foreground",
                  )}
                >
                  {badge.desc}
                </p>
              </div>

              {/* Decorative accent for non-highlighted cards */}
              {!badge.top ? (
                <div className="absolute bottom-6 right-8 w-8 h-1 bg-border rounded-full group-hover:bg-primary transition-colors" />
              ) : (
                <div className="absolute bottom-6 right-8 w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-white select-none">
                  ✓
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ══════════════════════════════════════════════════════
        §9  CONTENT STRATEGY — Theme-aware secondary bg
    ══════════════════════════════════════════════════════ */}
    <section className="py-24 bg-secondary/40">
      <div className="mx-auto max-w-screen-xl px-4">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* photo grid */}
          <div className="grid grid-cols-2 gap-2 w-full max-w-[340px] flex-shrink-0">
            {[P.orders, P.tiktok, P.instagram, P.heroVendor].map((src, i) => (
              <div
                key={i}
                className="img-zoom"
                style={{
                  height: 160,
                  overflow: "hidden",
                  borderTopLeftRadius: i === 0 ? 18 : 0,
                  borderTopRightRadius: i === 1 ? 18 : 0,
                  borderBottomLeftRadius: i === 2 ? 18 : 0,
                  borderBottomRightRadius: i === 3 ? 18 : 0,
                }}
              >
                <img
                  src={src}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            ))}
          </div>

          <div style={{ flex: 1 }}>
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-4">
              Content that converts
            </p>
            <h2
              className="text-foreground font-extrabold"
              style={{
                lineHeight: 1.2,
                fontSize: "clamp(1.9rem,3.5vw,2.8rem)",
                margin: "0 0 20px",
              }}
            >
              Post the content.
              <br />
              <span className="text-primary">
                Let your store close the sale.
              </span>
            </h2>
            <p
              className="text-muted-foreground"
              style={{ fontSize: "0.95rem", lineHeight: 1.7, marginBottom: 28 }}
            >
              TikTok tutorials, Instagram reels, WhatsApp status — your content
              brings the audience. Your SteerSolo link converts them. No DM
              chaos. No lost sales.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                "Verified authenticity — the content that goes viral and positions you as safe",
                "Merchant spotlights — your SteerSolo Safe story, shared by real buyers",
                "Restock alerts — WhatsApp broadcasts to your verified buyer list",
                "'Pack my orders' content — TikTok's most trusted merchant format",
              ].map(t => (
                <div
                  key={t}
                  style={{ display: "flex", alignItems: "flex-start", gap: 12 }}
                >
                  <CheckCircle
                    className="text-accent"
                    style={{
                      width: 16,
                      height: 16,
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  />
                  <p
                    className="text-muted-foreground"
                    style={{
                      fontSize: "0.875rem",
                      lineHeight: 1.65,
                      margin: 0,
                    }}
                  >
                    {t}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* ══════════════════════════════════════════════════════
        §10  TESTIMONIALS — Clean Style
    ══════════════════════════════════════════════════════ */}
    <section className="bg-background py-24 border-y border-border/40">
      <div className="mx-auto max-w-screen-xl px-4">
        <div className="text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary mb-4">
            Merchant stories
          </p>
          <h2 className="font-extrabold text-foreground text-3xl sm:text-4xl tracking-tight m-0">
            Social sellers who made the switch.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map(t => (
            <div
              key={t.name}
              className="lift rounded-3xl p-7 flex flex-col gap-5 bg-card border border-border/40 shadow-sm"
            >
              <div className="flex gap-1 mb-1">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star
                    key={s}
                    className="w-3.5 h-3.5 fill-accent text-accent"
                  />
                ))}
              </div>
              <p className="font-light italic text-muted-foreground leading-relaxed text-base m-0">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3 mt-auto">
                <img
                  src={t.av}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover object-top shrink-0 border border-border"
                />
                <div>
                  <p className="font-semibold text-sm text-foreground m-0">
                    {t.name}
                  </p>
                  <p className="text-xs text-muted-foreground m-0">
                    {t.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Removed redundant mid-page "Discover trusted sellers" CTA — §11 below covers this. */}

    {/* ══════════════════════════════════════════════════════
        §11  BUYER MARKETPLACE — New excitement for shoppers
    ══════════════════════════════════════════════════════ */}
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="mx-auto max-w-screen-xl px-4">
        <div className="flex flex-col lg:flex-row items-start gap-16">
          <div className="flex-1 min-w-[320px]">
            <p className="text-xs font-bold uppercase tracking-widest text-accent mb-4">
              The SteerSolo Safe Marketplace
            </p>
            <h2 className="text-foreground font-extrabold mb-6 text-3xl sm:text-4xl lg:text-5xl leading-tight">
              Finally, a place to shop
              <br />
              <span className="text-primary">without the heartbeat fast.</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              We've curated Nigeria's most trusted social merchants into one
              secure marketplace. No more guessing if a merchant is real. No more
              chasing for tracking numbers.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                {
                  i: "🛡️",
                  t: "100% Verified",
                  d: "Every store has a SteerSolo Safe badge earned through real identity checks.",
                },
                {
                  i: "💬",
                  t: "WhatsApp Power",
                  d: "Order on the web, track and chat on WhatsApp. The convenience you love.",
                },
                {
                  i: "📦",
                  t: "Real-time Tracking",
                  d: "Know exactly where your beauty products are from checkout to doorstep.",
                },
                {
                  i: "✨",
                  t: "Curated Excellence",
                  d: "Only the best Nigerian beauty and lifestyle brands make the cut.",
                },
              ].map((f, idx) => (
                <div key={idx}>
                  <div className="text-2xl mb-3">
                    {f.i}
                  </div>
                  <h4 className="font-bold text-foreground mb-2">{f.t}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {f.d}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 min-w-[320px] relative">
            <div className="bg-gradient-to-br from-primary to-[#0A1128] rounded-[32px] p-10 text-white shadow-xl shadow-black/10 relative z-10">
              <h3 className="text-2xl font-extrabold mb-5">
                Ready to discover?
              </h3>
              <p className="opacity-80 mb-8 text-base">
                Thousands of authentic products are waiting for you in the
                marketplace.
              </p>
              <Link
                to="/shops"
                className="inline-flex w-full items-center justify-center rounded-2xl bg-white px-6 py-4 text-center font-semibold text-primary transition-transform duration-200 hover:-translate-y-0.5 hover:bg-slate-100"
              >
                Explore the Marketplace
              </Link>
            </div>
            {/* decorative circle */}
            <div className="absolute -top-5 -right-5 w-28 h-28 rounded-full bg-accent/20 z-0 pointer-events-none" />
          </div>
        </div>
      </div>
    </section>

    {/* ── DONE-FOR-YOU STORE SETUP PREMIUM PROMO CARD ── */}
    <section className="py-16 bg-transparent relative overflow-hidden">
      <div className="mx-auto max-w-screen-xl px-4 relative z-10">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#060b19] via-[#0A1128] to-[#120c24] border border-indigo-500/25 p-8 md:p-12 shadow-2xl group transition-all duration-300 hover:shadow-[0_0_50px_rgba(99,102,241,0.15)]">
          {/* Subtle glowing absolute circles */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-500" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
          
          {/* Beautiful glowing accent border overlay */}
          <div className="absolute inset-0 border border-transparent rounded-[2.5rem] bg-gradient-to-br from-indigo-500/20 via-transparent to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-3xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-[10px] font-black uppercase tracking-wider text-accent-bright animate-pulse-soft">
                <Sparkles className="w-3 h-3 text-accent" />
                Done-For-You Store Setup Service
              </div>
              <h2 className="text-white font-extrabold text-2xl md:text-3xl lg:text-4xl tracking-tight leading-tight">
                Don't have time to upload? <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-white via-neutral-100 to-accent bg-clip-text text-transparent">We will set up your entire store for you!</span>
              </h2>
              <p className="text-neutral-300 text-sm md:text-base leading-relaxed">
                Tired of manual inventory uploading? Let our team of digital e-commerce specialists import, format, and organize your entire product catalog (up to 50 products) with professional descriptions, optimized pricing variations, and crisp high-resolution images for only <strong className="text-white bg-accent/15 px-2 py-0.5 rounded border border-accent/20">₦5,000 flat</strong>.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-2">
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <CheckCircle className="w-4 h-4 text-accent-bright" />
                  <span>Completed in 24 hours</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <CheckCircle className="w-4 h-4 text-accent-bright" />
                  <span>Up to 50 items formatted</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <CheckCircle className="w-4 h-4 text-accent-bright" />
                  <span>Professional copywriting included</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row lg:flex-col items-stretch gap-4 shrink-0 w-full sm:w-auto min-w-[240px]">
              <Link to="/setup-service" className="w-full">
                <button
                  className="w-full bg-accent hover:bg-accent/90 text-primary font-bold rounded-2xl shadow-xl shadow-accent/20 px-6 py-4 border-0 hover:scale-[1.02] active:scale-[0.98] transition-all text-center flex items-center justify-center gap-2"
                >
                  Order Setup Service <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link to="/demo" className="w-full">
                <button
                  className="w-full bg-white/5 hover:bg-white/10 text-white font-semibold rounded-2xl px-6 py-4 border border-white/10 hover:scale-[1.02] active:scale-[0.98] transition-all text-center"
                >
                  See Demo Store First
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Removed CollectionsSection + ShopperDiscovery — duplicated §11 buyer marketplace content.
        Kept DiscoveryLinks for SEO/city-category indexing. */}
    <DiscoveryLinks />


    {/* ══════════════════════════════════════════════════════
        §15  FINAL CTA — Clean Style
    ══════════════════════════════════════════════════════ */}
    <section className="bg-primary relative overflow-hidden py-28 text-center border-y border-border/40">
      {/* texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg,transparent,transparent 40px,rgba(0,0,0,.6) 40px,rgba(0,0,0,.6) 41px)",
        }}
      />
      {/* accent glow */}
      <div
        className="absolute -top-1/5 -right-1/10 w-1/2 h-4/5 pointer-events-none opacity-50"
        style={{
          background:
            "radial-gradient(ellipse, hsl(var(--accent) / 0.3) 0%, transparent 65%)",
        }}
      />

      <div className="mx-auto max-w-3xl px-4 relative z-10">
        <ShoppingBag className="w-8 h-8 mx-auto mb-6 text-primary-foreground/70" />
        <h2 className="font-extrabold text-primary-foreground leading-tight text-3xl sm:text-4xl lg:text-5xl mb-5">
          Your audience is ready.
          <br />
          <em className="not-italic text-accent-foreground/90 bg-accent/20 px-2 rounded-lg inline-block mt-2">
            Is your storefront?
          </em>
        </h2>
        <p className="text-base sm:text-lg text-primary-foreground/80 max-w-lg mx-auto mb-3">
          Join verified Nigerian beauty merchants turning their social following
          into a real, trusted business.
        </p>
        <p className="text-xs sm:text-sm italic text-primary-foreground/60 mb-10">
          "SteerSolo made my business look professional from day one."
        </p>
        <div className="flex flex-wrap justify-center gap-4 mb-9">
          <Link
            to="/auth/signup"
            className="inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-2xl bg-background px-6 py-4 text-sm font-bold text-foreground transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          >
            Start Free — No Card Needed
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/demo"
            className="inline-flex w-full max-w-xs items-center justify-center rounded-2xl border border-primary-foreground/20 bg-primary-foreground/10 px-6 py-4 text-sm font-semibold text-primary-foreground transition-colors duration-200 hover:bg-primary-foreground/20"
          >
            View a demo store first
          </Link>
        </div>
        <div className="flex flex-wrap justify-center gap-5 text-xs text-primary-foreground/80">
          {[
            "Instant Setup",
            "Works on WhatsApp, IG & TikTok",
            "SteerSolo Safe badge included",
          ].map(t => (
            <span
              key={t}
              className="flex items-center gap-1.5"
            >
              <CheckCircle className="w-3.5 h-3.5 text-primary-foreground/80" />
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
    </main>

    <Footer />
  </div>
  );
};

export default Index;
