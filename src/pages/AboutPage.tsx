import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { ArrowRight, Heart, Target, Users, Zap, Shield, Globe, Rocket, Award, Calendar, TrendingUp } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AdirePattern, AdireDivider } from "@/components/patterns/AdirePattern";
import { PageWrapper } from "@/components/PageWrapper";

const CORE_VALUES = [
  { icon: Zap, title: "Hustle with Structure", description: "We believe hustle is powerful — but only when paired with a system. Every feature we build brings order to the chaos." },
  { icon: Shield, title: "Trust First", description: "Every transaction, every review, every badge — built on transparency. Trust is the currency of African commerce." },
  { icon: Heart, title: "African Pride", description: "Our colors, patterns, and language celebrate African heritage. We build for African realities, not Silicon Valley fantasies." },
  { icon: Users, title: "Community Over Competition", description: "Sellers support sellers. Growth happens together. We reward collaboration, not cutthroat rivalry." },
];

const MILESTONES = [
  { year: "2024", quarter: "Q1", title: "The Idea", desc: "Born from watching sellers drown in WhatsApp chaos. The first prototype of the Daily Selling System." },
  { year: "2024", quarter: "Q2", title: "First 100 Sellers", desc: "Lagos, Abuja, Port Harcourt — entrepreneurs signed up and started sharing their store links." },
  { year: "2024", quarter: "Q3", title: "30-Day Challenge", desc: "Launched the Structured Seller Challenge. Sellers who completed it saw 3x order growth." },
  { year: "2024", quarter: "Q4", title: "Payments & Delivery", desc: "Integrated Paystack payments and logistics partners. Real money, real deliveries." },
  { year: "2025", quarter: "Q1", title: "AI Tools & Marketing", desc: "AI product descriptions, poster editor, ads assistant — helping sellers market like pros." },
  { year: "2025", quarter: "Q2", title: "Going Pan-African", desc: "Expanding beyond Nigeria. The structured selling movement goes continental." },
];

const MARKET_SNAPSHOT = [
  { value: "$8.8B", label: "Nigeria e-commerce (2024)" },
  { value: "$22.9B", label: "Projected by 2032" },
  { value: "69%", label: "Social commerce penetration" },
  { value: "82%", label: "Transactions via mobile" },
];

const TRUST_STACK = [
  {
    icon: Shield,
    title: "Vendor Verification",
    desc: "Vendors provide business identity and accountable profiles before public listing.",
  },
  {
    icon: Globe,
    title: "Store Page Presence",
    desc: "Every seller gets a structured public storefront with products, prices, and clear contact.",
  },
  {
    icon: Award,
    title: "Badge Credibility Layer",
    desc: "Badges such as verified/trusted signals reduce buyer hesitation before payment.",
  },
  {
    icon: Users,
    title: "Buyer Social Proof",
    desc: "Ratings and reviews are visible publicly to separate reliable vendors from risky ones.",
  },
  {
    icon: Target,
    title: "Dispute & Accountability",
    desc: "Transparent moderation and consequence layers protect buyers and preserve ecosystem trust.",
  },
];

const About = () => {
  return (
    <PageWrapper patternVariant="waves" patternOpacity={0.3}>
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-28 sm:pt-32 pb-16 sm:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent" />
        <AdirePattern variant="circles" className="text-primary" opacity={0.15} />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-4 sm:mb-6">
              The Daily Selling System for the
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> Solo Hustler</span>
            </h1>
            <p className="text-base sm:text-xl text-muted-foreground mb-6 sm:mb-8 px-2">
              SteerSolo turns WhatsApp chaos into a predictable, calm daily routine. 
              We're giving Africa's independent entrepreneurs the structure they need to scale.
            </p>
          </div>
        </div>
      </section>

      <AdireDivider />

      {/* Mission & Vision */}
      <section className="py-12 sm:py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-3 mb-2 sm:mb-4">
                <Target className="w-6 h-6 sm:w-8 sm:h-8 text-accent" />
                <h2 className="text-2xl sm:text-3xl font-bold">Our Mission</h2>
              </div>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                To replace the stress of manual selling with a calm, repeatable structure. We empower solo entrepreneurs in Africa with a clear Daily Selling System.
              </p>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                No more answering "How much?" 50 times a day. Just one link, a clear daily routine, and predictable growth.
              </p>
            </div>
            
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-3 mb-2 sm:mb-4">
                <Globe className="w-6 h-6 sm:w-8 sm:h-8 text-accent" />
                <h2 className="text-2xl sm:text-3xl font-bold">Our Vision</h2>
              </div>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                To build a generation of "Structured Sellers" across Africa — entrepreneurs who are organized, professional, and globally ready.
              </p>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                SteerSolo is the engine that will power Africa's digital street market, turning hustle into lasting businesses.
              </p>
            </div>
          </div>
        </div>
      </section>

      <AdireDivider />

      {/* Market Snapshot */}
      <section className="py-12 sm:py-16 bg-card/40">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-10">
            <p className="text-sm uppercase tracking-[0.16em] text-accent font-semibold mb-2">Market Timing</p>
            <h2 className="text-2xl sm:text-3xl font-bold">Why now is the perfect moment</h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              Nigeria's social commerce growth and mobile-first buying behavior make trust infrastructure the biggest leverage point.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {MARKET_SNAPSHOT.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-border/70 bg-card/80 p-4 sm:p-5 text-center">
                <p className="text-xl sm:text-3xl font-black text-primary">{stat.value}</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <AdireDivider />

      {/* Trust Architecture */}
      <section className="py-12 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-14">
            <p className="text-sm uppercase tracking-[0.16em] text-accent font-semibold mb-2">Trust Architecture</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">The 5-layer trust stack</h2>
            <p className="text-muted-foreground">
              We align SteerSolo around the trust law: trust infrastructure comes first, then conversion and retention.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
            {TRUST_STACK.map((item) => (
              <div key={item.title} className="rounded-2xl border border-border/70 bg-card/90 p-5">
                <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-3">
                  <item.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <AdireDivider />

      {/* Founder Section */}
      <section className="py-12 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground text-4xl font-black shrink-0 shadow-lg ring-4 ring-primary/20">
                S
              </div>
              <div>
                <p className="text-sm font-semibold text-accent mb-1">From the Founder</p>
                <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed italic">
                  "I watched talented sellers lose customers because they couldn't answer DMs fast enough. 
                  They didn't need another marketplace — they needed a system. That's why I built SteerSolo. 
                  One link. One routine. Real growth."
                </p>
                <p className="mt-4 font-bold text-foreground">The SteerSolo Team</p>
                <p className="text-sm text-muted-foreground">Lagos, Nigeria 🇳🇬</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <AdireDivider />

      {/* The Story */}
      <section className="py-12 sm:py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Heart className="w-10 h-10 sm:w-12 sm:h-12 text-accent mx-auto mb-4 sm:mb-6" />
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6">The Heart of SteerSolo</h2>
            <div className="space-y-4 sm:space-y-6 text-base sm:text-lg text-muted-foreground leading-relaxed">
              <p>
                SteerSolo was born from a simple observation: Africa's solo entrepreneurs are exhausted.
                The tailor running her business on WhatsApp, the shoe vendor posting daily on Instagram, 
                the skincare seller who DMs every customer manually. They are always "on," yet growth is slow.
              </p>
              <p>
                We realized they didn't just need a website; they needed a <em>system</em>. A way to structure their day 
                so they spend less time explaining prices and more time fulfilling orders. That's why we created 
                the Daily Selling System and the 30-Day Structured Seller Challenge.
              </p>
              <p className="text-lg sm:text-xl font-semibold text-accent">
                "We turn disorganized hustle into predictable, professional sales."
              </p>
            </div>
          </div>
        </div>
      </section>

      <AdireDivider />

      {/* Core Values */}
      <section className="py-12 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4">Our Core Values</h2>
            <p className="text-base sm:text-xl text-muted-foreground">
              Four principles that guide every feature, every word, every decision
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {CORE_VALUES.map((value, index) => (
              <div key={index} className="card-spotify p-6 hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center shrink-0">
                    <value.icon className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <CardTitle className="text-base mb-2">{value.title}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      {value.description}
                    </CardDescription>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <AdireDivider />

      {/* Milestone Timeline */}
      <section className="py-12 sm:py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4">Our Journey</h2>
            <p className="text-muted-foreground">From idea to movement — key milestones along the way</p>
          </div>
          <div className="max-w-2xl mx-auto relative">
            {/* Timeline line */}
            <div className="absolute left-5 sm:left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-accent to-gold" />
            <div className="space-y-8">
              {MILESTONES.map((m, i) => (
                <div key={i} className="flex gap-4 sm:gap-6 relative">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-card border-2 border-primary flex items-center justify-center shrink-0 z-10 shadow-sm">
                    <span className="text-xs font-bold text-primary">{m.quarter}</span>
                  </div>
                  <div className="card-spotify p-4 sm:p-5 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-accent">{m.year}</span>
                    </div>
                    <h3 className="font-bold text-sm sm:text-base">{m.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <AdireDivider />

      {/* How It Works */}
      <section className="py-12 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4">How SteerSolo Works</h2>
            <p className="text-base sm:text-xl text-muted-foreground">
              Simple steps to transform your hustle into a professional brand
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 max-w-5xl mx-auto">
            {[
              { step: "1", title: "Sign Up", description: "Create your account in seconds" },
              { step: "2", title: "Build Your Store", description: "Add products, set prices, upload photos" },
              { step: "3", title: "Share & Sell", description: "Share your unique store link everywhere" },
              { step: "4", title: "Grow", description: "Manage orders, get reviews, build reputation" }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <span className="text-accent-foreground font-bold text-lg sm:text-xl">{step.step}</span>
                </div>
                <h3 className="font-semibold text-sm sm:text-lg mb-1 sm:mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-xs sm:text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-20 bg-gradient-to-r from-primary to-accent">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary-foreground mb-4 sm:mb-6">
            Ready to Build Your Brand?
          </h2>
          <p className="text-base sm:text-xl text-primary-foreground/90 mb-6 sm:mb-8 max-w-2xl mx-auto">
            Join the movement of solo entrepreneurs building professional businesses across Africa
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link to="/auth/signup">
              <Button size="lg" variant="secondary" className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 min-h-[48px] w-full sm:w-auto">
                Start Your Store
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/shops">
              <Button size="lg" variant="outline" className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 border-primary-foreground text-primary-foreground min-h-[48px] w-full sm:w-auto">
                View Shops
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </PageWrapper>
  );
};

export default About;
