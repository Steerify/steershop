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

const BADGES = [
  { num:"01", label:"SafeBeauty Listed",   desc:"Vendor verified, store live. Entry-level trust signal for new buyers.",                      top:false },
  { num:"02", label:"SafeBeauty Checked",  desc:"At least one product batch confirmed genuine through our process.",                           top:false },
  { num:"03", label:"SafeBeauty Trusted",  desc:"30+ days active, real buyer reviews, zero unresolved complaints.",                            top:false },
  { num:"04", label:"SafeBeauty Verified", desc:"Full NAFDAC-aligned identity check — the highest trust signal on the platform.",               top:true  },
];

const TESTIMONIALS = [
  { quote:"I used to spend 3 hours a day answering the same DMs. Now I paste my link and the store does the talking.", name:"Chidera O.", role:"Skincare vendor · Lagos", av:P.av1 },
  { quote:"My TikTok blew up and I had nowhere to send people. SteerSolo fixed that overnight.",                       name:"Amara S.",  role:"Makeup artist · Abuja",      av:P.av2 },
  { quote:"The SafeBeauty badge made buyers stop questioning if my products are real. Sales doubled in 6 weeks.",      name:"Fatima B.", role:"Natural beauty vendor · Kano", av:P.av3 },
];

const STATS = [
  { v:"$10.17B", l:"Nigeria beauty market 2025" },
  { v:"95%",     l:"Nigerians on WhatsApp" },
  { v:"67%",     l:"Online beauty items likely counterfeit" },
  { v:"500K+",   l:"Beauty micro-vendors on social" },
];

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

            <h1 style={{ fontWeight:800,color:"#fff",lineHeight:1.08,marginBottom:20,fontSize:"clamp(2.15rem,4.25vw,3.8rem)" }}>
              You already have<br />
              the audience.<br />
              <em style={{ fontStyle:"normal",color:"hsl(var(--accent-bright))" }}>Give them somewhere to buy.</em>
            </h1>

            <p style={{ fontSize:"clamp(1rem,1.35vw,1.08rem)",lineHeight:1.65,color:"rgba(255,255,255,.62)",fontWeight:300,maxWidth:500,marginBottom:30 }}>
              500,000+ Nigerian beauty vendors sell on social media every day — and lose buyers
              because there's nowhere to send them after the DM. SteerSolo is that place.
            </p>

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

    {/* ══════════════════════════════════════════════════════
        §9  CONTENT STRATEGY — Theme-aware secondary bg
    ══════════════════════════════════════════════════════ */}
    <section className="py-24 bg-secondary/40">
      <div style={{ maxWidth:1000,margin:"0 auto",padding:"0 1.5rem" }}>
        <style>{`@media(min-width:1024px){.content-flex{flex-direction:row!important;}}`}</style>
        <div className="content-flex" style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:64 }}>

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

    <Footer />
  </div>
);

export default Index;
