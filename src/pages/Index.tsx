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
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { Footer } from "@/components/Footer";
import { ShopperDiscovery } from "@/components/ShopperDiscovery";
import { CollectionsSection } from "@/components/CollectionsSection";
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
          Browse All Shops{" "}
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

const HeroTextSlider = ({ liveVendorCount }: { liveVendorCount: number }) => {
  const [index, setIndex] = useState(0);
  const phrases = [
    {
      eyebrow: "For WhatsApp · Instagram · TikTok merchants",
      h1: "Create your store in 60s.<br />Get buyers with<br /><em style='font-style:normal;color:hsl(var(--accent-bright))'>Steerify Ads.</em>",
      p: "The complete sales system for Nigerian social commerce. Launch a gorgeous storefront, automate checkouts, and flood your store with customers using our managed Facebook, Instagram & TikTok ads.",
      cta1: {
        label: "Claim your free store",
        link: "/auth/signup",
        icon: ArrowRight,
      },
      cta2: { label: "See a demo store", link: "/demo" },
    },
    {
      eyebrow: "For the Savvy Nigerian Shopper",
      h1: "Shop verified brands<br />with 100% confidence.<br /><em style='font-style:normal;color:hsl(var(--accent-bright))'>No more 'What I Ordered' drama.</em>",
      p: "Browse thousands of authentic products from verified Nigerian stores. Secure checkout, real reviews, and direct WhatsApp tracking for every order.",
      cta1: { label: "Explore Marketplace", link: "/shops", icon: ShoppingBag },
      cta2: { label: "Sign up for Free", link: "/shopper-signup" },
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(prev => (prev + 1) % phrases.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ position: "relative", overflow: "hidden" }}>
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
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 28,
              borderBottom: `1.5px solid rgba(255,255,255,0.3)`,
              paddingBottom: 6,
            }}
          >
            <Sparkles
              style={{ width: 14, height: 14, color: "rgba(255,255,255,0.6)" }}
            />
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.22em",
                color: "rgba(255,255,255,0.6)",
              }}
            >
              {phrase.eyebrow}
            </span>
          </div>
          <h1
            style={{
              fontWeight: 800,
              color: "#fff",
              lineHeight: 1.08,
              marginBottom: 20,
              fontSize: "clamp(2.15rem,4.25vw,3.8rem)",
            }}
            dangerouslySetInnerHTML={{ __html: phrase.h1 }}
          />
          <p
            style={{
              fontSize: "clamp(1rem,1.35vw,1.08rem)",
              lineHeight: 1.65,
              color: "rgba(255,255,255,.62)",
              fontWeight: 300,
              maxWidth: 500,
              marginBottom: 30,
            }}
          >
            {phrase.p}
          </p>

          {/* CTAs moved inside slider */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 14,
              marginBottom: 20,
            }}
          >
            <Link to={phrase.cta1.link}>
              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 26px",
                  borderRadius: 9999,
                  fontWeight: 700,
                  fontSize: "1rem",
                  color: "hsl(var(--primary))",
                  background: "#fff",
                  boxShadow: `0 8px 32px rgba(0,0,0,0.25)`,
                  border: "none",
                  cursor: "pointer",
                  transition: "all .25s ease",
                }}
                onMouseEnter={e =>
                  (e.currentTarget.style.transform = "translateY(-2px)")
                }
                onMouseLeave={e =>
                  (e.currentTarget.style.transform = "translateY(0)")
                }
              >
                {phrase.cta1.label}
                {phrase.cta1.icon && (
                  <phrase.cta1.icon style={{ width: 16, height: 16 }} />
                )}
              </button>
            </Link>
            <Link to={phrase.cta2.link}>
              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "12px 24px",
                  borderRadius: 9999,
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  background: "rgba(255,255,255,0.12)",
                  border: "1.5px solid rgba(255,255,255,0.25)",
                  color: "#fff",
                  cursor: "pointer",
                  transition: "all .25s ease",
                  backdropFilter: "blur(10px)",
                }}
                onMouseEnter={e =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.2)")
                }
                onMouseLeave={e =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.12)")
                }
              >
                {phrase.cta2.label}
              </button>
            </Link>
          </div>

          {/* Premium Social Proof: 3-Avatar Stack with Pulsing Live Dot */}
          <div className="flex flex-wrap items-center gap-3 mt-6 text-white bg-white/5 border border-white/10 backdrop-blur-md px-4 py-2.5 rounded-full w-fit animate-fade-up">
            <div className="flex -space-x-2 shrink-0">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80"
                alt="Merchant"
                className="w-8 h-8 rounded-full border-2 border-background object-cover shadow-sm"
              />
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80"
                alt="Merchant"
                className="w-8 h-8 rounded-full border-2 border-background object-cover shadow-sm"
              />
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80"
                alt="Merchant"
                className="w-8 h-8 rounded-full border-2 border-background object-cover shadow-sm"
              />
            </div>
            <div className="flex items-center gap-2.5 text-sm font-medium text-white/90">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span>
                Join <strong className="text-white font-extrabold">{liveVendorCount}+</strong> active merchants
              </span>
              <span className="hidden sm:inline-flex items-center justify-center text-[10px] text-emerald-400 font-bold uppercase tracking-widest bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">
                Live Updates
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════ PAGE ═══ */
const Index = () => {
  const [liveVendorCount, setLiveVendorCount] = useState<number>(1428);

  useEffect(() => {
    let isMounted = true;
    let channel: any = null;

    const fetchVendorCount = async () => {
      try {
        const { count, error } = await supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("role", "ENTREPRENEUR");
        
        if (isMounted && !error && count !== null) {
          setLiveVendorCount(count > 0 ? 1420 + count : 1428);
        }
      } catch (e) {
        console.error("Error fetching merchant count:", e);
      }
    };
    fetchVendorCount();

    // Subscribe to real-time inserts on profiles
    channel = supabase
      .channel('public:profiles')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'profiles', filter: "role=eq.ENTREPRENEUR" },
        (payload) => {
          if (isMounted) {
            setLiveVendorCount((prev) => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const DYNAMIC_STATS = [
    { v: "$10.17B", l: "Nigeria beauty market 2025" },
    { v: "95%", l: "Nigerians on WhatsApp" },
    { v: "67%", l: "Online beauty items likely counterfeit" },
    { v: `${liveVendorCount}+`, l: "Verified merchants live on SteerSolo" },
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
        SteerSolo - Nigeria's Verified Beauty & Social Commerce Storefronts
      </title>
      <meta
        name="description"
        content="Turn your WhatsApp, Instagram, and TikTok audience into a trusted storefront. The Daily Selling System for Nigerian social commerce merchants. Shop verified Nigerian brands with confidence."
      />
      <meta
        name="keywords"
        content="social commerce nigeria, sell on whatsapp nigeria, instagram store nigeria, verified beauty brands nigeria, steersolo, ecommerce nigeria"
      />
      <link rel="canonical" href="https://steersolo.com" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://steersolo.com" />
      <meta
        property="og:title"
        content="SteerSolo - Nigeria's Verified Beauty & Social Commerce"
      />
      <meta
        property="og:description"
        content="Turn your social audience into a trusted storefront. The standard for verified Nigerian merchants."
      />
      <meta property="og:image" content="https://steersolo.com/og-image.png" />
      <meta property="og:site_name" content="SteerSolo" />
      <meta property="og:locale" content="en_NG" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content="https://steersolo.com" />
      <meta
        name="twitter:title"
        content="SteerSolo - Nigeria's Verified Beauty & Social Commerce"
      />
      <meta
        name="twitter:description"
        content="Turn your social audience into a trusted storefront. The standard for verified Nigerian merchants."
      />
      <meta name="twitter:image" content="https://steersolo.com/og-image.png" />
      <meta name="twitter:site" content="@steersolo" />

      {/* AI & Search Engine Richness */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "SteerSolo",
          url: "https://steersolo.com",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://steersolo.com/shops?search={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        })}
      </script>
    </Helmet>
    <GoogleOneTap />
    <Navbar />

    {/* ══════════════════════════════════════════════════════
        §1  HERO — Always dark Adire Indigo
    ══════════════════════════════════════════════════════ */}
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
            <div style={{ minHeight: 380 }}>
              <HeroTextSlider liveVendorCount={liveVendorCount} />
            </div>

            {/* trust pills */}
            <div
              style={{ display: "flex", flexWrap: "wrap", gap: 10 }}
              className="f3"
            >
              {[
                { I: CheckCircle, t: "Verification-first" },
                { I: Zap, t: "Instant Stores" },
                { I: Shield, t: "SteerSolo Safe Marketplace" },
              ].map(({ I, t }) => (
                <span
                  key={t}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: "0.75rem",
                    padding: "6px 14px",
                    borderRadius: 9999,
                    fontWeight: 500,
                    background: "rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.75)",
                  }}
                >
                  <I style={{ width: 13, height: 13 }} />
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* ── FEATURED STORES CAROUSEL ── */}
          <FeaturedStoresHeroCarousel />
        </div>

        {/* ── STAT STRIP ── */}
        <div className="f4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-t border-white/10">
          {DYNAMIC_STATS.map((s, i) => (
            <div
              key={s.l}
              style={{
                padding: "28px 20px",
                textAlign: "center",
                borderRight: i < 3 ? "1px solid rgba(255,255,255,.08)" : "none",
              }}
            >
              <p
                style={{
                  fontWeight: 800,
                  color: "#fff",
                  fontSize: "clamp(1.35rem,2.2vw,2rem)",
                  marginBottom: 4,
                }}
              >
                {s.v}
              </p>
              <p
                style={{
                  fontSize: "0.72rem",
                  color: "rgba(255,255,255,.38)",
                  lineHeight: 1.4,
                }}
              >
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
    <div
      style={{
        overflow: "hidden",
        padding: "14px 0",
        background: "hsl(var(--accent))",
      }}
    >
      <div
        style={{
          animation: "tick 32s linear infinite",
          width: "max-content",
          display: "flex",
          alignItems: "center",
        }}
      >
        {Array(2)
          .fill([
            "Nigeria's Only Verified Beauty Marketplace",
            "Real Products · Real Sellers · Real Results",
            "Full Identity Verification",
            "Works on WhatsApp · Instagram · TikTok",
            "SteerSolo Safe — Your Standard for Trust",
          ])
          .flat()
          .map((t, i) => (
            <span
              key={i}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 20,
                padding: "0 28px",
                fontSize: "0.82rem",
                fontWeight: 700,
                letterSpacing: "0.04em",
                color: "#fff",
                whiteSpace: "nowrap",
              }}
            >
              <span
                style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.45rem" }}
              >
                ◆
              </span>
              {t}
            </span>
          ))}
      </div>
    </div>

    {/* ══════════════════════════════════════════════════════
        §3  PAIN MIRROR — Theme-aware background
    ══════════════════════════════════════════════════════ */}
    <section className="py-24 bg-background">
      <div className="mx-auto max-w-screen-xl px-4">
        <div className="text-center mb-16">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-4">
            Sound familiar?
          </p>
          <h2
            className="text-foreground font-extrabold"
            style={{
              lineHeight: 1.2,
              fontSize: "clamp(1.9rem,4vw,3rem)",
              margin: 0,
            }}
          >
            SteerSolo removes 3 questions
            <br />
            <span className="text-primary">
              from the minds of your customers.
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            {
              q: '"What do you sell?"',
              b: "Buyers hate guessing. SteerSolo gives you a beautiful catalog that shows exactly what you offer, instantly.",
            },
            {
              q: '"How much is it?"',
              b: "Hide-and-seek pricing kills sales. Clear prices and discounts build urgent trust and convert faster.",
            },
            {
              q: '"How do I pay?"',
              b: "No more sending account numbers manually. Secure checkout is built-in.",
            },
          ].map(p => (
            <div
              key={p.q}
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              <p
                className="text-foreground font-bold"
                style={{ fontSize: "1.25rem", margin: 0 }}
              >
                {p.q}
              </p>
              <div
                className="bg-primary"
                style={{ width: 40, height: 2, borderRadius: 9 }}
              />
              <p
                className="text-muted-foreground"
                style={{ fontSize: "0.9rem", lineHeight: 1.7, margin: 0 }}
              >
                {p.b}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-primary/5 rounded-2xl p-6 md:p-8 mt-12 border border-primary/20 text-center shadow-sm">
          <p className="text-foreground font-bold text-[1.4rem] flex items-center justify-center gap-2 m-0">
            <span className="text-[1.8rem]">💬</span> And the best part?
          </p>
          <p
            className="text-primary font-extrabold"
            style={{ fontSize: "1.7rem", margin: "12px 0 0" }}
          >
            Every order goes straight to your WhatsApp!
          </p>
        </div>
      </div>
    </section>

    {/* ══════════════════════════════════════════════════════
        §4  PLATFORM BREAKDOWN — Theme-aware secondary bg
    ══════════════════════════════════════════════════════ */}
    <section className="py-24 bg-secondary/40">
      <div className="mx-auto max-w-screen-xl px-4">
        <div className="text-center mb-16">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-4">
            The platforms you're already on
          </p>
          <h2
            className="text-foreground font-extrabold"
            style={{
              lineHeight: 1.2,
              fontSize: "clamp(1.9rem,4vw,3rem)",
              margin: 0,
            }}
          >
            Supercharge your social presence.
            <br />
            <span className="text-primary">
              Turn every view into a seamless sale for Nigerian shoppers.
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {PLATFORMS.map(pl => (
            <div
              key={pl.name}
              className="lift card-elevated"
              style={{
                borderRadius: 24,
                overflow: "hidden",
              }}
            >
              <div
                className="img-zoom"
                style={{
                  height: 200,
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(255,255,255,0.02)",
                }}
              >
                <PlatformLogo platform={pl} />
              </div>
              <div className="bg-card" style={{ padding: 28 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 6,
                  }}
                >
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: pl.dot,
                      display: "inline-block",
                    }}
                  />
                  <span className="text-foreground font-semibold">
                    {pl.name}
                  </span>
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: "0.72rem",
                      padding: "3px 12px",
                      borderRadius: 9999,
                      fontWeight: 700,
                      background: pl.dotBg,
                      color: pl.dot,
                    }}
                  >
                    {pl.stat}
                  </span>
                </div>
                <p
                  className="text-muted-foreground"
                  style={{
                    fontSize: "0.72rem",
                    marginBottom: 20,
                    marginTop: 0,
                  }}
                >
                  {pl.statSub}
                </p>
                <div
                  className="bg-destructive/5"
                  style={{ borderRadius: 12, padding: 16, marginBottom: 12 }}
                >
                  <p
                    style={{
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      color: "hsl(0,65%,45%)",
                      marginBottom: 4,
                      margin: 0,
                    }}
                  >
                    The bottleneck
                  </p>
                  <p
                    className="text-muted-foreground"
                    style={{
                      fontSize: "0.85rem",
                      lineHeight: 1.65,
                      margin: "6px 0 0",
                    }}
                  >
                    {pl.problem}
                  </p>
                </div>
                <div
                  className="bg-primary/5"
                  style={{ borderRadius: 12, padding: 16 }}
                >
                  <p
                    className="text-primary"
                    style={{
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      margin: 0,
                    }}
                  >
                    The SteerSolo Advantage
                  </p>
                  <p
                    className="text-muted-foreground"
                    style={{
                      fontSize: "0.85rem",
                      lineHeight: 1.65,
                      margin: "6px 0 0",
                    }}
                  >
                    {pl.fix}
                  </p>
                </div>
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
        §6  HOW IT WORKS — Theme-aware background
    ══════════════════════════════════════════════════════ */}
    <section className="py-24 bg-background">
      <div className="mx-auto max-w-screen-xl px-4">
        <div className="text-center mb-16">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-4">
            How it works
          </p>
          <h2
            className="text-foreground font-extrabold"
            style={{
              lineHeight: 1.2,
              fontSize: "clamp(1.9rem,4vw,3rem)",
              margin: 0,
            }}
          >
            Keep your audience.
            <br />
            <span className="text-primary">
              Add the storefront they deserve.
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14 mb-14">
          {JOURNEY.map((s, i) => (
            <div key={s.n} style={{ display: "flex", gap: 20 }}>
              <div
                className={
                  i === 0
                    ? "bg-primary text-primary-foreground"
                    : "bg-primary/10 text-primary"
                }
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                }}
              >
                {s.n}
              </div>
              <div>
                <p
                  className="text-foreground font-semibold"
                  style={{ fontSize: "0.95rem", margin: "0 0 8px" }}
                >
                  {s.title}
                </p>
                <p
                  className="text-muted-foreground"
                  style={{ fontSize: "0.875rem", lineHeight: 1.65, margin: 0 }}
                >
                  {s.body}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* flow bar — always indigo */}
        <div
          style={{
            borderRadius: 24,
            padding: "28px 32px",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 20,
            textAlign: "center",
            background: "hsl(var(--primary))",
            boxShadow: "0 16px 48px hsl(var(--primary) / 0.33)",
          }}
        >
          {[
            {
              e: "📲",
              l: "WhatsApp / IG / TikTok",
              s: "Your existing audience",
            },
            null,
            { e: "🔗", l: "Your SteerSolo link", s: "One URL in every bio" },
            null,
            {
              e: "🛍️",
              l: "Verified store page",
              s: "Catalog + SteerSolo Safe badge",
            },
            null,
            { e: "✅", l: "Real orders", s: "Tracked, confirmed, paid" },
          ].map((item, i) =>
            !item ? (
              <span
                key={i}
                style={{ color: "rgba(255,255,255,.2)", fontSize: "1.4rem" }}
              >
                →
              </span>
            ) : (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span style={{ fontSize: "1.4rem" }}>{item.e}</span>
                <p
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "#fff",
                    margin: 0,
                  }}
                >
                  {item.l}
                </p>
                <p
                  style={{
                    fontSize: "0.68rem",
                    color: "rgba(255,255,255,.38)",
                    margin: 0,
                  }}
                >
                  {item.s}
                </p>
              </div>
            ),
          )}
        </div>
      </div>
    </section>

    {/* ══════════════════════════════════════════════════════
        §7  REALITY STATS SPLIT — Always dark (ink)
    ══════════════════════════════════════════════════════ */}
    <section className="bg-ink-section">
      <div className="flex flex-col lg:flex-row min-h-[420px]">
        <div
          className="img-zoom"
          style={{ flex: 1, overflow: "hidden", minHeight: 320 }}
        >
          <img
            src={P.storefront}
            alt="Online storefront"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              minHeight: 320,
            }}
          />
        </div>
        <div className="flex-1 flex flex-col justify-center p-10 md:p-14">
          <p
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.22em",
              color: "hsl(var(--accent-bright))",
              marginBottom: 32,
            }}
          >
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
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 20,
                marginBottom: 28,
              }}
            >
              <span
                style={{
                  fontWeight: 800,
                  color: "#fff",
                  fontSize: "2.6rem",
                  lineHeight: 1,
                  flexShrink: 0,
                }}
              >
                {s.n}
              </span>
              <p
                style={{
                  fontSize: "0.95rem",
                  lineHeight: 1.65,
                  color: "rgba(255,255,255,.48)",
                  fontWeight: 300,
                  margin: "4px 0 0",
                }}
              >
                {s.t}
              </p>
            </div>
          ))}
          <div style={{ marginTop: 8 }}>
            <Link to="/auth/signup">
              <button
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "13px 26px",
                  borderRadius: 9999,
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  color: "hsl(var(--primary))",
                  background: "#fff",
                  border: "none",
                  cursor: "pointer",
                  transition: "all .25s ease",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
                }}
                onMouseEnter={e =>
                  (e.currentTarget.style.transform = "translateY(-2px)")
                }
                onMouseLeave={e =>
                  (e.currentTarget.style.transform = "translateY(0)")
                }
              >
                Be the exception{" "}
                <ArrowRight style={{ width: 15, height: 15 }} />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>

    {/* ══════════════════════════════════════════════════════
        §8  SAFEBEAUTY BADGES — Always brand indigo
    ══════════════════════════════════════════════════════ */}
    <section className="bg-[#0A1128] py-24 md:py-32 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[50%] bg-primary blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[60%] bg-accent blur-[120px] rounded-full" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 md:mb-20">
          <p className="text-[#00d97e] font-bold text-xs uppercase tracking-[0.3em] mb-4">
            The Trust Layer
          </p>
          <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight leading-tight">
            SteerSolo Safe — our Trust Layer
            <br />
            <span className="text-[#00d97e]">
              for verified Nigerian merchants.
            </span>
          </h2>
          <p className="text-white/50 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
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
                "group relative p-8 rounded-[32px] border transition-all duration-500 hover:-translate-y-2",
                badge.top
                  ? "bg-[#22c55e] border-[#22c55e] shadow-[0_20px_50px_rgba(34,197,94,0.3)]"
                  : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20",
              )}
            >
              <div
                className={cn(
                  "text-6xl font-black mb-6 transition-colors duration-500",
                  badge.top
                    ? "text-white/30"
                    : "text-white/10 group-hover:text-white/20",
                )}
              >
                {badge.num}
              </div>
              <h3
                className={cn(
                  "text-xl font-bold mb-3",
                  badge.top ? "text-white" : "text-white",
                )}
              >
                {badge.label}
              </h3>
              <p
                className={cn(
                  "text-sm leading-relaxed",
                  badge.top ? "text-white/80" : "text-white/50",
                )}
              >
                {badge.desc}
              </p>

              {/* Decorative accent for non-highlighted cards */}
              {!badge.top && (
                <div className="absolute bottom-6 right-8 w-8 h-1 bg-white/10 rounded-full group-hover:bg-primary/40 transition-colors" />
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
        §10  TESTIMONIALS — Always dark (ink)
    ══════════════════════════════════════════════════════ */}
    <section className="bg-ink-section py-24">
      <div className="mx-auto max-w-screen-xl px-4">
        <div className="text-center mb-14">
          <p
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.22em",
              color: "hsl(var(--accent-bright))",
              marginBottom: 16,
            }}
          >
            Merchant stories
          </p>
          <h2
            style={{
              fontWeight: 800,
              color: "#fff",
              fontSize: "clamp(1.9rem,4vw,2.8rem)",
              margin: 0,
            }}
          >
            Social sellers who made the switch.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map(t => (
            <div
              key={t.name}
              className="lift"
              style={{
                borderRadius: 24,
                padding: 28,
                display: "flex",
                flexDirection: "column",
                gap: 20,
                background: "rgba(255,255,255,.05)",
                border: "1px solid rgba(255,255,255,.08)",
              }}
            >
              <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                {[1, 2, 3, 4, 5].map(s => (
                  <Star
                    key={s}
                    style={{
                      width: 13,
                      height: 13,
                      fill: "hsl(var(--accent))",
                      color: "hsl(var(--accent))",
                    }}
                  />
                ))}
              </div>
              <p
                style={{
                  fontWeight: 400,
                  fontStyle: "italic",
                  color: "rgba(255,255,255,.88)",
                  lineHeight: 1.65,
                  fontSize: "1rem",
                  margin: 0,
                }}
              >
                "{t.quote}"
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginTop: "auto",
                }}
              >
                <img
                  src={t.av}
                  alt={t.name}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    objectFit: "cover",
                    objectPosition: "top",
                    flexShrink: 0,
                    border: "2px solid rgba(255,255,255,0.3)",
                  }}
                />
                <div>
                  <p
                    style={{
                      fontWeight: 600,
                      fontSize: "0.875rem",
                      color: "#fff",
                      margin: 0,
                    }}
                  >
                    {t.name}
                  </p>
                  <p
                    style={{
                      fontSize: "0.72rem",
                      color: "rgba(255,255,255,.38)",
                      margin: 0,
                    }}
                  >
                    {t.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ══ reused components (theme-aware via Tailwind) ════════════════════ */}
    <section className="py-8 md:py-10">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">
          Discover trusted sellers faster
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-5">
          Shop verified businesses with clear trust signals and a
          straightforward path to purchase.
        </p>
        <Link
          to="/shops"
          className="inline-flex px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
        >
          View verified shops
        </Link>
      </div>
    </section>
    {/* ══════════════════════════════════════════════════════
        §11  BUYER MARKETPLACE — New excitement for shoppers
    ══════════════════════════════════════════════════════ */}
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="mx-auto max-w-screen-xl px-4">
        <div className="flex flex-col lg:flex-row items-start gap-16">
          <div style={{ flex: "1 1 400px" }}>
            <p className="text-xs font-bold uppercase tracking-widest text-accent mb-4">
              The SteerSolo Safe Marketplace
            </p>
            <h2
              className="text-foreground font-extrabold mb-6"
              style={{
                lineHeight: 1.1,
                fontSize: "clamp(2.2rem,4.5vw,3.5rem)",
              }}
            >
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
                  <div style={{ fontSize: "1.5rem", marginBottom: 12 }}>
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

          <div style={{ flex: "1 1 400px", position: "relative" }}>
            <div
              style={{
                background:
                  "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--brand-blue-strong)))",
                borderRadius: 32,
                padding: 40,
                color: "#fff",
                boxShadow: "0 40px 80px rgba(0,0,0,0.15)",
                position: "relative",
                zIndex: 2,
              }}
            >
              <h3
                style={{
                  fontSize: "1.8rem",
                  fontWeight: 800,
                  marginBottom: 20,
                }}
              >
                Ready to discover?
              </h3>
              <p style={{ opacity: 0.8, marginBottom: 32, fontSize: "1.1rem" }}>
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
            <div
              style={{
                position: "absolute",
                top: -20,
                right: -20,
                width: 120,
                height: 120,
                borderRadius: "50%",
                background: "hsl(var(--accent) / 0.2)",
                zIndex: 1,
              }}
            />
          </div>
        </div>
      </div>
    </section>

    {/* ── DONE-FOR-YOU STORE SETUP PREMIUM PROMO CARD ── */}
    <section className="py-16 bg-transparent relative overflow-hidden">
      <div className="mx-auto max-w-screen-xl px-4 relative z-10">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#060b19] via-[#0A1128] to-[#120c24] border border-indigo-500/20 p-8 md:p-12 shadow-2xl group transition-all duration-300 hover:shadow-indigo-500/5">
          {/* Subtle glowing absolute circles */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-500" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-3xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-[10px] font-black uppercase tracking-wider text-accent-bright">
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
                  <CheckCircle className="w-4 h-4 text-accent" />
                  <span>Completed in 24 hours</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <CheckCircle className="w-4 h-4 text-accent" />
                  <span>Up to 50 items formatted</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <CheckCircle className="w-4 h-4 text-accent" />
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

    <CollectionsSection />
    <ShopperDiscovery />
    <DiscoveryLinks />

    {/* ══════════════════════════════════════════════════════
        §15  FINAL CTA — Always hero indigo
    ══════════════════════════════════════════════════════ */}
    <section className="bg-brand-cta relative overflow-hidden py-28 text-center">
      {/* texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-4"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg,transparent,transparent 40px,rgba(255,255,255,.6) 40px,rgba(255,255,255,.6) 41px)",
        }}
      />
      {/* accent glow */}
      <div
        className="absolute -top-1/5 -right-1/10 w-1/2 h-4/5 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse, hsl(var(--accent) / 0.15) 0%, transparent 65%)",
        }}
      />

      <div className="mx-auto max-w-3xl px-4 relative z-10">
        <ShoppingBag
          style={{
            width: 32,
            height: 32,
            margin: "0 auto 24px",
            color: "rgba(255,255,255,.35)",
          }}
        />
        <h2
          style={{
            fontWeight: 800,
            color: "#fff",
            lineHeight: 1.1,
            fontSize: "clamp(2.2rem,5vw,3.8rem)",
            marginBottom: 20,
          }}
        >
          Your audience is ready.
          <br />
          <em
            style={{ fontStyle: "normal", color: "hsl(var(--accent-bright))" }}
          >
            Is your storefront?
          </em>
        </h2>
        <p
          style={{
            fontSize: "1.05rem",
            color: "rgba(255,255,255,.58)",
            maxWidth: 460,
            margin: "0 auto 12px",
          }}
        >
          Join verified Nigerian beauty merchants turning their social following
          into a real, trusted business.
        </p>
        <p
          style={{
            fontSize: "0.85rem",
            fontStyle: "italic",
            color: "rgba(255,255,255,.28)",
            marginBottom: 40,
          }}
        >
          "SteerSolo made my business look professional from day one."
        </p>
        <div className="flex flex-wrap justify-center gap-4 mb-9">
          <Link
            to="/auth/signup"
            className="inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-semibold text-primary transition-transform duration-200 hover:-translate-y-0.5 hover:bg-slate-100"
          >
            Start Free — No Card Needed
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/demo"
            className="inline-flex w-full max-w-xs items-center justify-center rounded-full border border-white/25 bg-white/10 px-6 py-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-white/20"
          >
            View a demo store first
          </Link>
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 20,
            fontSize: "0.78rem",
            color: "rgba(255,255,255,.38)",
          }}
        >
          {[
            "Instant Setup",
            "Works on WhatsApp, IG & TikTok",
            "SteerSolo Safe badge included",
          ].map(t => (
            <span
              key={t}
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              <CheckCircle
                style={{
                  width: 13,
                  height: 13,
                  color: "rgba(255,255,255,.48)",
                }}
              />
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>

    <Footer />
  </div>
  );
};

export default Index;
