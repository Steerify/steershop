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
  Truck,
  CreditCard,
  Users,
  TrendingUp,
  Gift,
} from "lucide-react";
import { useState, useEffect } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { Footer } from "@/components/Footer";
import { GoogleOneTap } from "@/components/auth/GoogleOneTap";
import { Helmet } from "react-helmet-async";
import { FeaturedStoresHeroCarousel } from "@/components/FeaturedStoresHeroCarousel";
import { ShopAvatars } from "@/components/ShopAvatars";
import whatsappLogo from "@/assets/social/whatsapp-logo.svg";
import instagramLogo from "@/assets/social/instagram-logo.svg";
import tiktokLogo from "@/assets/social/tiktok-logo.svg";
import heroBackground from "@/assets/hero-background.png";
import homepageFeature from "@/assets/homepage-feature.png";

// Hero images (realistic Nigerian merchant imagery)
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

// Psychological narrative data
const PLATFORMS = [
  {
    name: "WhatsApp",
    dot: "#25D366",
    dotBg: "rgba(37,211,102,0.1)",
    stat: "95%",
    statSub: "of Nigerians use it daily",
    problem:
      "You're juggling DMs, sharing bank details, and repeating product info — losing sales to chaos and trust gaps.",
    fix: "Your SteerSolo storefront gives buyers a clear catalog, visible prices, and secure checkout — with verified orders sent straight to your WhatsApp.",
    img: P.waLogo,
  },
  {
    name: "Instagram",
    dot: "#E1306C",
    dotBg: "rgba(225,48,108,0.1)",
    stat: "67%",
    statSub: "social commerce penetration",
    problem:
      'Your grid is stunning, but "DM for price" kills impulse buys and leaves customers waiting.',
    fix: "Link your SteerSolo store in bio — let buyers shop instantly with clear prices, no back-and-forth needed.",
    img: P.igLogo,
  },
  {
    name: "TikTok",
    dot: "#888",
    dotBg: "rgba(100,100,100,0.08)",
    stat: "#1",
    statSub: "beauty content platform globally",
    problem:
      "Your content goes viral, but you have nowhere to send that flood of interested buyers.",
    fix: "Turn views into sales — send viewers straight to your SteerSolo checkout link and capitalize on the momentum.",
    img: P.tiktokLogo,
  },
];

// Journey steps (clear, sequential)
const JOURNEY = [
  {
    n: "01",
    title: "Launch your store in minutes",
    body: "Create a professional, branded storefront and add your products with pricing in under 60 seconds — no coding, no stress.",
    icon: Store,
  },
  {
    n: "02",
    title: "Share one powerful link",
    body: "Drop your SteerSolo link in Instagram bio, WhatsApp status, or TikTok profile — everything your customers need in one place.",
    icon: MapPin,
  },
  {
    n: "03",
    title: "Get discovered and scale",
    body: "Reach thousands of new shoppers on the SteerSolo Marketplace and turn views into sales on autopilot.",
    icon: Zap,
  },
  {
    n: "04",
    title: "Manage orders on WhatsApp",
    body: "Every verified order lands directly in your WhatsApp — keep the conversation, lose the chaos.",
    icon: MessageCircle,
  },
];

// Trust badges (earned, not bought)
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

// Testimonials (social proof)
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

// Animated counter component
const AnimatedCounter = ({ target }: { target: number }) => {
  const [count, setCount] = useState(target > 20 ? target - 20 : 0);

  useEffect(() => {
    const start = target > 20 ? target - 20 : 0;
    if (start === target) return;

    const duration = 1000;
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

// Hero text slider (dual audience: sellers & buyers)
const HeroTextSlider = () => {
  const [index, setIndex] = useState(0);
  const phrases = [
    {
      eyebrow: "For solo sellers on WhatsApp · Instagram · TikTok",
      h1: (
        <>
          Everything you need to{" "}
          <span className="relative inline-block">
            sell better
            <span className="absolute -bottom-1 left-0 w-full h-2 bg-gradient-to-r from-primary to-accent rounded-full opacity-80"></span>
          </span>{" "}
          online
        </>
      ),
      p: "From Storefronts to Marketplace Visibility, Steersolo helps you grow with ease and confidence.",
      cta1: {
        label: "Start your free store",
        link: "/auth/signup",
        icon: ArrowRight,
      },
      cta2: { label: "See a demo store", link: "/demo" },
    },
    {
      eyebrow: "For Nigerian shoppers",
      h1: "Find trusted stores,\nSee prices upfront,\nand Buy with confidence.",
      p: "Discover verified Nigerian merchants with clear catalogs, visible prices, and a secure path to order — all in one place.",
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
    <div className="relative" style={{ isolation: "isolate" }}>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeOut {
          from { opacity: 1; transform: translateX(0); }
          to { opacity: 0; transform: translateX(-30px); }
        }
        .animate-slide-in {
          animation: slideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-fade-out {
          animation: fadeOut 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
      {phrases.map((phrase, i) => (
        <div
          key={i}
          className={`absolute inset-0 ${i === index ? "opacity-100 animate-slide-in pointer-events-auto" : "opacity-0 animate-fade-out pointer-events-none"}`}
          aria-hidden={i !== index}
        >
          {/* Aligned Escrow Pill & Eyebrow Badge Row */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 backdrop-blur-md text-primary dark:text-accent text-xs font-semibold select-none">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent"></span>
              </span>
              🔒 Mediuspay Escrow & Paystack Secured Payments
            </div>

            <span className="text-border text-xs hidden sm:inline">|</span>

            <div className="inline-flex items-center gap-1.5 py-1">
              <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
              <span className="text-[11.5px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                {phrase.eyebrow}
              </span>
            </div>
          </div>

          <h1 className="font-extrabold text-foreground leading-[1.05] mb-5 text-3xl sm:text-4xl lg:text-6xl tracking-tighter whitespace-pre-line">
            {typeof phrase.h1 === "string" ? phrase.h1 : phrase.h1}
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground font-medium max-w-2xl mx-auto mb-8 leading-relaxed">
            {phrase.p}
          </p>

          {/* CTAs with Premium Hover & Scale Effects */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Link to={phrase.cta1.link}>
              <button className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl font-bold text-base text-primary-foreground bg-gradient-to-r from-primary to-accent shadow-lg hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:scale-[0.98] transition-all duration-300">
                {phrase.cta1.label}
                {phrase.cta1.icon && <phrase.cta1.icon className="w-4 h-4" />}
              </button>
            </Link>
            <Link to={phrase.cta2.link}>
              <button className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-semibold text-sm bg-muted text-foreground border border-border hover:-translate-y-0.5 hover:bg-muted/80 active:translate-y-0 active:scale-[0.98] transition-all duration-300">
                {phrase.cta2.label}
              </button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

// Discovery Links component (SEO friendly)
const DiscoveryLinks = () => {
  const hubs = [
    {
      name: "Fashion in Lagos",
      slug: "fashion-in-lagos",
      span: "md:col-span-2 md:row-span-1",
      bg: "bg-gradient-to-br from-primary/5 to-primary/20",
      img: "🛍️",
    },
    {
      name: "Food in Abuja",
      slug: "food-drinks-in-abuja",
      span: "md:col-span-1 md:row-span-1",
      bg: "bg-gradient-to-br from-orange-500/5 to-orange-500/20",
      img: "🍲",
    },
    {
      name: "Tech in PH",
      slug: "electronics-in-port-harcourt",
      span: "md:col-span-1 md:row-span-2",
      bg: "bg-gradient-to-br from-accent/5 to-accent/20",
      img: "💻",
    },
    {
      name: "Beauty in Lagos",
      slug: "beauty-health-in-lagos",
      span: "md:col-span-1 md:row-span-1",
      bg: "bg-gradient-to-br from-pink-500/5 to-pink-500/20",
      img: "💄",
    },
    {
      name: "Skincare in Abuja",
      slug: "skincare-in-abuja",
      span: "md:col-span-2 md:row-span-1",
      bg: "bg-gradient-to-br from-blue-500/5 to-blue-500/20",
      img: "✨",
    },
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-background relative overflow-hidden">
      {/* Decorative blur elements */}
      <div className="absolute top-0 -left-1/4 w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full pointer-events-none animate-pulse-soft" />
      <div
        className="absolute bottom-0 -right-1/4 w-[50%] h-[50%] bg-accent/10 blur-[120px] rounded-full pointer-events-none animate-pulse-soft"
        style={{ animationDelay: "2s" }}
      />

      <div className="mx-auto max-w-screen-xl px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-end justify-between gap-6 md:gap-10 mb-12 md:mb-16 animate-fade-up">
          <div className="max-w-2xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-semibold mb-4 md:mb-6">
              <Sparkles className="w-4 h-4" />
              Curated Categories
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-black tracking-tight mb-4 md:mb-6 leading-tight">
              Discover the Best of{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary animate-gradient-x">
                Nigerian Commerce
              </span>
            </h2>
            <p className="text-muted-foreground text-sm md:text-lg md:text-xl leading-relaxed">
              Supporting local entrepreneurs across major cities. Find verified
              merchants near you, from Lagos to Abuja, with absolute trust.
            </p>
          </div>
          <Link
            to="/shops"
            className="inline-flex items-center gap-2 px-6 py-3 md:px-8 md:py-4 rounded-full bg-foreground text-background font-bold hover:scale-105 hover:shadow-2xl transition-all duration-300 text-sm md:text-base"
          >
            Explore Marketplace <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
          </Link>
        </div>

        {/* Mobile: Swipeable carousel */}
        <div className="md:hidden">
          <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory">
            {hubs.map((hub, i) => (
              <Link
                key={hub.slug}
                to={`/discover/${hub.slug}`}
                className="flex-shrink-0 w-[85%] snap-start group relative overflow-hidden rounded-[1.5rem] border border-white/10 p-6 flex flex-col justify-between hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 backdrop-blur-xl bg-white/50 dark:bg-black/20"
                style={{ minHeight: "200px" }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />

                <div className="flex items-start justify-between relative z-10">
                  <div className="text-3xl filter drop-shadow-md group-hover:scale-110 transition-transform duration-500">
                    {hub.img}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/50 dark:bg-black/50 flex items-center justify-center backdrop-blur-md">
                    <ArrowRight className="w-4 h-4 text-foreground" />
                  </div>
                </div>

                <div className="relative z-10 mt-8">
                  <h4 className="font-black text-xl text-foreground mb-1 leading-tight">
                    {hub.name}
                  </h4>
                  <p className="text-xs font-medium text-muted-foreground flex items-center gap-1 opacity-80">
                    <MapPin className="w-3 h-3" /> Explore Collection
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Desktop: Grid layout */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-4 sm:gap-6 h-auto md:h-[600px] auto-rows-fr">
          {hubs.map((hub, i) => (
            <Link
              key={hub.slug}
              to={`/discover/${hub.slug}`}
              className={cn(
                "group relative overflow-hidden rounded-[2rem] border border-white/10 p-8 flex flex-col justify-between hover:shadow-2xl transition-all duration-500 hover:-translate-y-1",
                hub.span,
                hub.bg,
                "backdrop-blur-xl bg-white/50 dark:bg-black/20",
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />

              <div className="flex items-start justify-between relative z-10">
                <div className="text-4xl filter drop-shadow-md group-hover:scale-110 transition-transform duration-500">
                  {hub.img}
                </div>
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
};

// Platform logo component (with fallback)
const PlatformLogo = ({ platform }: { platform: (typeof PLATFORMS)[0] }) => {
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

const Index = () => {
  const [liveVendorCount, setLiveVendorCount] = useState<number>(0);
  const [vendorCountLabel, setVendorCountLabel] =
    useState<string>("active merchants");
  const [shopAvatars, setShopAvatars] = useState<
    { id: string; shop_name: string; logo_url: string | null }[]
  >([]);

  useEffect(() => {
    let isMounted = true;
    let channel: RealtimeChannel | null = null;

    const fetchData = async () => {
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
        } else {
          // 2. Fallback: approved (live) shops
          const { count: approvedCount } = await supabase
            .from("shops")
            .select("id", { count: "exact", head: true })
            .eq("is_active", true);

          if (!isMounted) return;
          setLiveVendorCount(approvedCount ?? 0);
          setVendorCountLabel("approved shops");
        }

        // 3. Load shop avatars
        const { data: shopsData } = await supabase
          .from("shops_public")
          .select("id, shop_name, logo_url")
          .eq("is_active", true)
          .not("logo_url", "is", null)
          .order("created_at", { ascending: false })
          .limit(5);

        if (!isMounted) return;
        if (shopsData) setShopAvatars(shopsData as any);
      } catch (e) {
        console.error("Error fetching data:", e);
      }
    };
    fetchData();

    channel = supabase
      .channel("public:merchants-count-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "shops" },
        () => {
          if (isMounted) fetchData();
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          if (isMounted) fetchData();
        },
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
    { n: "Instant", t: "Launch your store in under 60 seconds", icon: Zap },
    {
      n: "Transparent",
      t: "Catalogs with visible, upfront prices",
      icon: CreditCard,
    },
    {
      n: "Seamless",
      t: "All orders flow directly into your WhatsApp",
      icon: MessageCircle,
    },
    {
      n: `${liveVendorCount.toLocaleString()}`,
      t: "Trusted merchants thriving on SteerSolo",
      icon: Users,
    },
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
        <title>SteerSolo - Professional Stores for Nigerian Solo Sellers</title>
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
        <meta
          property="og:image"
          content="https://steersolo.com/og-image.png"
        />
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
        <meta
          name="twitter:image"
          content="https://steersolo.com/og-image.png"
        />
        <meta name="twitter:site" content="@steersolo" />

        {/* AI & Search Engine Richness */}
        <script type="application/ld+json">
          {JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "SteerSolo",
              url: "https://steersolo.com",
              potentialAction: {
                "@type": "SearchAction",
                target:
                  "https://steersolo.com/shops?search={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            },
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "SteerSolo",
              url: "https://steersolo.com",
              logo: "https://steersolo.com/og-image.jpg",
              sameAs: [
                "https://twitter.com/SteerifyGroup",
                "https://instagram.com/SteerifyGroup",
              ],
            },
          ])}
        </script>
      </Helmet>
      <GoogleOneTap />
      <Navbar />

      {/* --------------------------
        §1: HERO - Attention Grabber
      --------------------------- */}
      <main id="main-content">
        <section className="bg-brand-hero relative overflow-hidden min-h-[90vh] sm:min-h-[92vh] pt-20 sm:pt-24">
          {/* Full-width background image (more prominent!) */}
          <div className="absolute inset-0 z-0">
            <img
              src={heroBackground}
              alt=""
              className="w-full h-full object-cover opacity-40"
              aria-hidden="true"
            />
            {/* Dark gradient overlay to ensure text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-brand-forest-deep/80 via-brand-forest-deep/60 to-brand-forest-deep"></div>
          </div>
          {/* subtle adire diagonal texture */}
          <div
            className="absolute inset-0 z-1"
            style={{
              pointerEvents: "none",
              opacity: 0.035,
              backgroundImage:
                "repeating-linear-gradient(-55deg,transparent,transparent 48px,rgba(255,255,255,.9) 48px,rgba(255,255,255,.9) 49px)",
            }}
          />
          {/* accent glow — bottom right */}
          <div
            className="absolute z-1"
            style={{
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
            className="absolute z-1"
            style={{
              top: "-10%",
              left: "-5%",
              width: "40%",
              height: "50%",
              pointerEvents: "none",
              background:
                "radial-gradient(ellipse at 20% 20%, hsl(var(--brand-blue-strong) / 0.35) 0%, transparent 65%)",
            }}
          />

          <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-10 pb-32 sm:pb-24">
              {/* ── TEXT (Attention & Interest) ── */}
              <div className="flex-1 max-w-2xl mx-auto text-center f1">
                <div className="min-h-[380px] sm:min-h-[420px] md:min-h-[460px] relative">
                  <HeroTextSlider />
                </div>

                {/* ── Social Proof (Desire) ── */}
                <div className="mt-12 p-5 rounded-[2rem] bg-card/40 border border-border/50 backdrop-blur-xl shadow-xl space-y-4 animate-fade-up f3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-4">
                    <div className="inline-flex items-center gap-3">
                      <div className="flex -space-x-2 shrink-0">
                        {shopAvatars.length > 0 ? (
                          // Shuffle array and take first 3
                          [...shopAvatars]
                            .sort(() => Math.random() - 0.5)
                            .slice(0, 3)
                            .map((shop, index) => (
                              <img
                                key={shop.id}
                                src={shop.logo_url || ""}
                                alt={shop.shop_name}
                                className="w-8 h-8 rounded-full border-2 border-background object-cover"
                                loading="lazy"
                                style={{ zIndex: 3 - index }}
                              />
                            ))
                        ) : (
                          <>
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
                          </>
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-foreground flex items-center gap-1.5">
                          <span className="inline-block w-2 h-2 rounded-full bg-accent animate-pulse" />
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
                    <div className="flex items-center shrink-0">
                      <span className="text-[9px] text-primary dark:text-accent font-bold uppercase tracking-widest bg-accent/10 border border-accent/20 px-2.5 py-0.5 rounded-full">
                        Live
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      {
                        I: CheckCircle,
                        t: "Verification-first",
                        d: "Strict identity checks",
                      },
                      {
                        I: Zap,
                        t: "Instant Stores",
                        d: "Set up under 60 seconds",
                      },
                      {
                        I: Shield,
                        t: "Safe Escrow",
                        d: "Paystack escrow security",
                      },
                    ].map(({ I, t, d }) => (
                      <div
                        key={t}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-background/50 hover:bg-background transition-all duration-300 border border-border/50"
                      >
                        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-primary dark:text-accent shrink-0">
                          <I className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground leading-none mb-0.5">
                            {t}
                          </p>
                          <p className="text-[9px] text-muted-foreground leading-none">
                            {d}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── STAT STRIP ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-border/30 bg-card/20 backdrop-blur-md rounded-t-[2rem]">
              {DYNAMIC_STATS.map((s, i) => (
                <div
                  key={s.t}
                  className="py-8 px-6 text-center border-b sm:border-b-0 border-border/30 last:border-0 sm:even:border-r lg:border-r lg:last:border-r-0 transition-colors duration-300 hover:bg-muted/30"
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <s.icon className="w-5 h-5 text-primary" />
                    <p className="font-black text-foreground text-2xl sm:text-3xl lg:text-4xl tracking-tight m-0">
                      {s.n}
                    </p>
                  </div>
                  <p className="text-xs font-semibold text-muted-foreground leading-relaxed uppercase tracking-wider">
                    {s.t}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --------------------------
        §2: TICKER - Social Proof
      --------------------------- */}
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
                "Professional storefronts for Nigerian solo sellers",
                "Visible prices · Secure payments · Trusted marketplace",
                "WhatsApp stays your customer relationship channel",
                "Works seamlessly on WhatsApp · Instagram · TikTok",
                "Verified merchants, confident shoppers",
                "Turn your social following into a thriving business",
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

        {/* --------------------------
        §2.5: FEATURED STORES
      --------------------------- */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-background relative overflow-hidden border-y border-border/40">
          <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-accent mb-4">
                Curated Excellence
              </p>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight text-foreground mb-5">
                Discover Trending{" "}
                <span className="text-primary">SteerSolo Stores</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Shop directly from Nigeria's top-rated social merchants.
                Verified profiles, secure payments, and instant WhatsApp
                ordering.
              </p>
            </div>
            <div className="w-full">
              <FeaturedStoresHeroCarousel />
            </div>
          </div>
        </section>

        {/* --------------------------
        §3: PAIN POINT - Problem Identification
      --------------------------- */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-secondary/30">
          <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 md:mb-16">
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-4">
                The problem we solve
              </p>
              <h2 className="text-foreground font-extrabold text-2xl md:text-4xl md:text-[56px] leading-[0.95] tracking-tight m-0">
                Tired of DM chaos and lost sales?
              </h2>
            </div>

            {/* Mobile: Swipeable carousel */}
            <div className="md:hidden">
              <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory">
                {PLATFORMS.map((platform, idx) => (
                  <div
                    key={platform.name}
                    className="flex-shrink-0 w-[90%] snap-start lift rounded-[1.5rem] bg-card border border-border/40 p-6 shadow-sm overflow-hidden"
                  >
                    <div className="mb-4 flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ background: platform.dotBg }}
                      >
                        <PlatformLogo platform={platform} />
                      </div>
                      <div>
                        <p
                          className="text-[10px] font-bold uppercase tracking-widest mb-1"
                          style={{ color: platform.dot }}
                        >
                          {platform.stat} {platform.statSub}
                        </p>
                        <h3 className="text-xl font-black tracking-tight">
                          {platform.name}
                        </h3>
                      </div>
                    </div>
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/30 rounded-lg">
                      <p className="text-xs text-red-800 dark:text-red-200 font-semibold mb-1">
                        The Problem
                      </p>
                      <p className="text-xs text-red-700/80 dark:text-red-200/80 leading-relaxed">
                        {platform.problem}
                      </p>
                    </div>
                    <div className="p-3 bg-accent/5 dark:bg-accent/10 border border-accent/20 rounded-lg">
                      <p className="text-xs text-primary dark:text-accent font-semibold mb-1">
                        The Solution
                      </p>
                      <p className="text-xs text-primary/80 dark:text-accent/80 leading-relaxed">
                        {platform.fix}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop: Grid layout */}
            <div className="hidden md:grid grid-cols-1 lg:grid-cols-3 gap-6">
              {PLATFORMS.map((platform, idx) => (
                <div
                  key={platform.name}
                  className="lift rounded-[2rem] bg-card border border-border/40 p-8 shadow-sm overflow-hidden"
                >
                  <div className="mb-6 flex items-center gap-4">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center"
                      style={{ background: platform.dotBg }}
                    >
                      <PlatformLogo platform={platform} />
                    </div>
                    <div>
                      <p
                        className="text-xs font-bold uppercase tracking-widest mb-1"
                        style={{ color: platform.dot }}
                      >
                        {platform.stat} {platform.statSub}
                      </p>
                      <h3 className="text-2xl font-black tracking-tight">
                        {platform.name}
                      </h3>
                    </div>
                  </div>
                  <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/30 rounded-xl">
                    <p className="text-sm text-red-800 dark:text-red-200 font-semibold mb-1">
                      The Problem
                    </p>
                    <p className="text-sm text-red-700/80 dark:text-red-200/80 leading-relaxed">
                      {platform.problem}
                    </p>
                  </div>
                  <div className="p-4 bg-accent/5 dark:bg-accent/10 border border-accent/20 rounded-xl">
                    <p className="text-sm text-primary dark:text-accent font-semibold mb-1">
                      The Solution
                    </p>
                    <p className="text-sm text-primary/80 dark:text-accent/80 leading-relaxed">
                      {platform.fix}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --------------------------
        §4: HOW IT WORKS - Solution Steps
      --------------------------- */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-background">
          <div className="mx-auto mt-8 sm:mt-12 max-w-6xl px-4 md:px-6">
            <div className="grid gap-8 md:gap-12 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
              <div className="max-w-xl text-center md:text-left">
                <div className="mb-4 md:mb-6 inline-flex rounded-full bg-primary/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-primary">
                  How it works
                </div>
                <h2 className="font-black leading-[0.95] tracking-tight text-foreground text-2xl md:text-4xl md:text-[56px]">
                  Simple enough to understand in seconds
                </h2>
                <p className="mt-3 md:mt-5 max-w-lg mx-auto md:mx-0 text-sm md:text-[18px] leading-6 md:leading-8 text-muted-foreground">
                  Launch your store in minutes, share your link everywhere, and
                  watch the orders roll in. We handle payments, security, and
                  order tracking — you focus on what you do best.
                </p>
              </div>

              <div className="grid gap-3 md:gap-4 md:grid-cols-2">
                {JOURNEY.map((s, i) => {
                  const isAccentBg = i === 1 || i === 3;
                  const Icon = s.icon;
                  return (
                    <div
                      key={s.n}
                      className={cn(
                        "rounded-[20px] md:rounded-[28px] p-5 md:p-6 shadow-sm border transition-all duration-300 hover:shadow-elegant hover:-translate-y-1",
                        isAccentBg
                          ? "bg-secondary/30 border-transparent dark:bg-card dark:border-border/40"
                          : "bg-card border-border/40 dark:bg-card",
                      )}
                    >
                      <div className="mb-4 md:mb-5 flex items-center justify-between">
                        <div className="flex h-10 md:h-12 w-10 md:w-12 items-center justify-center rounded-xl md:rounded-2xl bg-primary text-primary-foreground">
                          <Icon className="w-4 md:w-5 h-4 md:h-5" />
                        </div>
                        <div className="text-[10px] md:text-[12px] font-black text-muted-foreground/40 dark:text-muted-foreground/30">
                          {s.n}
                        </div>
                      </div>
                      <h3 className="text-lg md:text-[22px] font-black tracking-tight text-foreground">
                        {s.title}
                      </h3>
                      <p className="mt-2 md:mt-3 text-sm md:text-[15px] leading-6 md:leading-7 text-muted-foreground">
                        {s.body}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* --------------------------
        §5: REALITY STATS - Social Proof
      --------------------------- */}
        <section className="bg-background border-y border-border/40">
          <div className="flex flex-col lg:flex-row">
            <div className="img-zoom flex-1 overflow-hidden h-[250px] md:h-[320px] lg:h-auto bg-muted/20">
              <img
                src={homepageFeature}
                alt="SteerSolo storefront in action"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 flex flex-col justify-center p-6 md:p-10 lg:p-14 bg-secondary/30">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary mb-6 md:mb-8">
                The reality of selling online in Nigeria
              </p>
              {[
                {
                  n: "82%",
                  t: "of Nigerian e-commerce happens on mobile — that's where your customers are",
                },
                {
                  n: "67%",
                  t: "of beauty products bought online are likely counterfeit — build trust with SteerSolo Safe",
                },
                {
                  n: "10x",
                  t: "Orders sent directly to your WhatsApp convert 10x faster than back-and-forth DMs",
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 md:gap-5 mb-5 md:mb-7"
                >
                  <span className="font-black text-foreground text-3xl sm:text-4xl md:text-5xl leading-none shrink-0">
                    {stat.n}
                  </span>
                  <p className="text-xs sm:text-sm md:text-base leading-relaxed text-muted-foreground font-light mt-1">
                    {stat.t}
                  </p>
                </div>
              ))}
              <div className="mt-4 md:mt-2">
                <Link to="/auth/signup">
                  <button className="inline-flex items-center gap-2 px-6 py-3 md:px-7 md:py-3.5 rounded-xl md:rounded-2xl font-bold text-sm text-primary-foreground bg-gradient-to-r from-primary to-accent shadow-lg hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 transition-all duration-300">
                    Be the exception <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* --------------------------
        §6: TRUST BADGES - Social Proof
      --------------------------- */}
        <section className="bg-secondary/30 py-12 sm:py-16 md:py-20 lg:py-24 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.03]">
            <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[50%] bg-primary blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[60%] bg-accent blur-[120px] rounded-full" />
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-10 sm:mb-12 md:mb-16 lg:mb-20">
              <p className="text-primary font-bold text-xs uppercase tracking-[0.3em] mb-4">
                The Trust Layer
              </p>
              <h2 className="text-2xl md:text-4xl md:text-6xl font-extrabold text-foreground mb-4 md:mb-6 tracking-tight leading-tight">
                SteerSolo Safe — our Trust Layer
                <br />
                <span className="text-primary dark:text-accent">
                  for verified Nigerian merchants.
                </span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base md:text-lg leading-relaxed">
                Every badge is earned, not bought. Buyers instantly know how
                trusted your store is before they spend a kobo.
              </p>
            </div>

            {/* Mobile: Swipeable carousel */}
            <div className="md:hidden">
              <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory">
                {BADGES.map((badge, i) => (
                  <div
                    key={badge.label}
                    className={cn(
                      "flex-shrink-0 w-[85%] snap-start group relative p-6 rounded-[1.5rem] border transition-all duration-500 hover:-translate-y-1 overflow-hidden flex flex-col justify-between min-h-[220px]",
                      badge.top
                        ? "bg-gradient-to-br from-accent to-accent-muted border-accent shadow-[0_0_25px_rgba(170,240,60,0.3)] animate-pulse-soft"
                        : "bg-card border-border/40 hover:bg-card/90 hover:border-border/80 shadow-sm",
                    )}
                  >
                    <div>
                      <div
                        className={cn(
                          "text-4xl font-black mb-4 transition-colors duration-500 select-none",
                          badge.top
                            ? "text-white/20"
                            : "text-muted-foreground/10 group-hover:text-muted-foreground/20",
                        )}
                      >
                        {badge.num}
                      </div>
                      <h3
                        className={cn(
                          "text-lg font-extrabold mb-2 tracking-tight",
                          badge.top ? "text-white" : "text-foreground",
                        )}
                      >
                        {badge.label}
                      </h3>
                      <p
                        className={cn(
                          "text-xs leading-relaxed font-light",
                          badge.top ? "text-white/90" : "text-muted-foreground",
                        )}
                      >
                        {badge.desc}
                      </p>
                    </div>

                    {!badge.top ? (
                      <div className="absolute bottom-4 right-6 w-6 h-1 bg-border rounded-full group-hover:bg-primary transition-colors" />
                    ) : (
                      <div className="absolute bottom-4 right-6 w-6 h-6 rounded-full bg-white/15 flex items-center justify-center text-white select-none text-sm">
                        ✓
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop: Grid layout */}
            <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {BADGES.map((badge, i) => (
                <div
                  key={badge.label}
                  className={cn(
                    "group relative p-8 rounded-[2.5rem] border transition-all duration-500 hover:-translate-y-2 overflow-hidden flex flex-col justify-between min-h-[300px]",
                    badge.top
                      ? "bg-gradient-to-br from-accent to-accent-muted border-accent shadow-[0_0_35px_rgba(170,240,60,0.3)] animate-pulse-soft"
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

        {/* --------------------------
        §7: TESTIMONIALS - Social Proof
      --------------------------- */}
        <section className="bg-background py-12 sm:py-16 md:py-20 lg:py-24 border-y border-border/40">
          <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary mb-4">
                Merchant stories
              </p>
              <h2 className="font-extrabold text-foreground text-3xl sm:text-4xl tracking-tight m-0">
                Social sellers who made the switch.
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TESTIMONIALS.map(t => (
                <div
                  key={t.name}
                  className="lift rounded-3xl p-8 flex flex-col gap-5 bg-card border border-border/40 shadow-sm"
                >
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star
                        key={s}
                        className="w-4 h-4 fill-accent-text text-accent-text"
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
                      className="w-12 h-12 rounded-full object-cover object-top shrink-0 border border-border"
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

        {/* --------------------------
        §8: BUYER MARKETPLACE - Dual Audience
      --------------------------- */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-background relative overflow-hidden">
          <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-start gap-16">
              <div className="flex-1 min-w-[320px]">
                <p className="text-xs font-bold uppercase tracking-widest text-accent-text mb-4">
                  The SteerSolo Safe Marketplace
                </p>
                <h2 className="text-foreground font-extrabold mb-6 text-3xl sm:text-4xl lg:text-5xl leading-tight">
                  Finally, a place to shop
                  <br />
                  <span className="text-primary">
                    without the heartbeat fast.
                  </span>
                </h2>
                <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                  We've curated Nigeria's most trusted social merchants into one
                  secure marketplace. No more guessing if a merchant is real. No
                  more chasing for tracking numbers.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[
                    {
                      icon: Shield,
                      t: "100% Verified",
                      d: "Every store has a SteerSolo Safe badge earned through real identity checks.",
                    },
                    {
                      icon: MessageCircle,
                      t: "WhatsApp Power",
                      d: "Order on the web, track and chat on WhatsApp. The convenience you love.",
                    },
                    {
                      icon: Truck,
                      t: "Real-time Tracking",
                      d: "Know exactly where your beauty products are from checkout to doorstep.",
                    },
                    {
                      icon: Gift,
                      t: "Curated Excellence",
                      d: "Only the best Nigerian beauty and lifestyle merchants make the cut.",
                    },
                  ].map((f, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <f.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground mb-1">
                          {f.t}
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {f.d}
                        </p>
                      </div>
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
                <div className="absolute -top-5 -right-5 w-28 h-28 rounded-full bg-accent/20 z-0 pointer-events-none" />
              </div>
            </div>
          </div>
        </section>

        {/* --------------------------
        §9: DONE-FOR-YOU SETUP - Premium Offer
      --------------------------- */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-transparent relative overflow-hidden">
          <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#060b19] via-[#0A1128] to-[#120c24] border border-indigo-500/25 p-8 md:p-12 shadow-2xl group transition-all duration-300 hover:shadow-[0_0_50px_rgba(99,102,241,0.15)]">
              <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

              <div className="absolute inset-0 border border-transparent rounded-[2.5rem] bg-gradient-to-br from-indigo-500/20 via-transparent to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                <div className="space-y-4 max-w-3xl">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-[10px] font-black uppercase tracking-wider text-accent-bright animate-pulse-soft">
                    <Sparkles className="w-3 h-3 text-accent" />
                    Done-For-You Store Setup Service
                  </div>
                  <h2 className="text-white font-extrabold text-2xl md:text-3xl lg:text-4xl tracking-tight leading-tight">
                    Don't have time to upload?{" "}
                    <br className="hidden sm:inline" />
                    <span className="bg-gradient-to-r from-white via-neutral-100 to-accent bg-clip-text text-transparent">
                      We will set up your entire store for you!
                    </span>
                  </h2>
                  <p className="text-neutral-300 text-sm md:text-base leading-relaxed">
                    Tired of manual inventory uploading? Let our team of digital
                    e-commerce specialists import, format, and organize your
                    entire product catalog (up to 50 products) with professional
                    descriptions, optimized pricing variations, and crisp
                    high-resolution images for only{" "}
                    <strong className="text-white bg-accent/15 px-2 py-0.5 rounded border border-accent/20">
                      ₦5,000 flat
                    </strong>
                    .
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
                    <button className="w-full bg-accent hover:bg-accent/90 text-primary font-bold rounded-2xl shadow-xl shadow-accent/20 px-6 py-4 border-0 hover:scale-[1.02] active:scale-[0.98] transition-all text-center flex items-center justify-center gap-2">
                      Order Setup Service <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                  <Link to="/demo" className="w-full">
                    <button className="w-full bg-white/5 hover:bg-white/10 text-white font-semibold rounded-2xl px-6 py-4 border border-white/10 hover:scale-[1.02] active:scale-[0.98] transition-all text-center">
                      See Demo Store First
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --------------------------
        §10: DISCOVERY LINKS - SEO & Navigation
      --------------------------- */}
        <DiscoveryLinks />

        {/* --------------------------
        §11: FINAL CTA - Call to Action
      --------------------------- */}
        <section className="bg-primary relative overflow-hidden py-12 sm:py-16 md:py-20 lg:py-24 text-center border-y border-border/40">
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg,transparent,transparent 40px,rgba(0,0,0,.6) 40px,rgba(0,0,0,.6) 41px)",
            }}
          />
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
              Join verified Nigerian beauty merchants turning their social
              following into a real, trusted business.
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
              ].map((t, i) => (
                <span key={i} className="flex items-center gap-1.5">
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
