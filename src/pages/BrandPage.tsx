import { useState } from "react";
import { Copy, Check, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageWrapper } from "@/components/PageWrapper";
import { AdirePattern, AdireDivider, AdireAccent } from "@/components/patterns/AdirePattern";
import logoLight from "@/assets/steersolo-logo.jpg";
import logoDark from "@/assets/steersolo-logo-dark.jpg";

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="ml-2 p-1 rounded hover:bg-muted transition-colors"
      title="Copy"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-accent" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
    </button>
  );
};

const BRAND_COLORS = [
  { name: "Adire Indigo", css: "--primary", light: "215 65% 25%", hex: "#1A365D", desc: "Primary brand color. Used for headers, buttons, and key UI elements." },
  { name: "Nigerian Green", css: "--accent", light: "145 60% 38%", hex: "#2E7D32", desc: "Accent color. Used for CTAs, success states, and growth indicators." },
  { name: "Gold / Amber", css: "--gold", light: "42 90% 55%", hex: "#E5A100", desc: "Highlight color. Used for badges, premium features, and celebrations." },
  { name: "Cream / Sand", css: "--secondary", light: "40 30% 95%", hex: "#F5F0E8", desc: "Background accent. Used for cards and soft sections." },
  { name: "Deep Foreground", css: "--foreground", light: "220 45% 15%", hex: "#151D2B", desc: "Text color. Used for body copy and headings." },
];

const TYPOGRAPHY = [
  { weight: "900 (Black)", usage: "Hero headlines, storefront names", sample: "SteerSolo" },
  { weight: "800 (ExtraBold)", usage: "Section headers, brand name", sample: "Your Daily Selling System" },
  { weight: "700 (Bold)", usage: "Subheadings, card titles", sample: "Build. Share. Grow." },
  { weight: "600 (SemiBold)", usage: "Navigation, labels, emphasis", sample: "Explore Shops" },
  { weight: "400 (Regular)", usage: "Body text, descriptions", sample: "Empowering solo entrepreneurs across Africa." },
];

const TONE_RULES = [
  { do: "Hey, your store is live! Share it and start getting orders.", dont: "Your digital storefront has been successfully provisioned." },
  { do: "No wahala — we've got your back.", dont: "We apologize for the inconvenience." },
  { do: "You've made 5 sales this week. Keep the energy!", dont: "Your transaction count has increased by 5 units." },
  { do: "Ready to level up? Try the 30-Day Challenge.", dont: "Consider enrolling in our structured seller programme." },
];

const PATTERN_VARIANTS = ["dots", "circles", "lines", "geometric", "dense", "waves"] as const;

const BrandPage = () => {
  return (
    <PageWrapper patternVariant="geometric" patternOpacity={0.2}>
      <Navbar />

      {/* Hero */}
      <section className="relative pt-28 sm:pt-32 pb-16 sm:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-gold/5" />
        <AdirePattern variant="circles" className="text-primary" opacity={0.12} />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            Brand Guidelines
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black mb-4 sm:mb-6">
            The <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">SteerSolo</span> Brand
          </h1>
          <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to represent SteerSolo consistently — our story, colors, typography, tone, and patterns.
          </p>
        </div>
      </section>

      <AdireDivider />

      {/* Brand Story */}
      <section className="py-12 sm:py-20 bg-card/50">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center">Our Story</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              SteerSolo was born from watching Africa's solo entrepreneurs drown in WhatsApp chaos — answering "How much?" hundreds of times, losing orders in DMs, and hustling without structure. We built a <strong className="text-foreground">Daily Selling System</strong> that turns disorganized hustle into predictable, professional sales.
            </p>
            <p className="text-lg font-semibold text-accent text-center py-4">
              "We don't just give you a store. We give you a system."
            </p>
            <div className="grid sm:grid-cols-2 gap-4 pt-4">
              <div className="card-spotify p-5">
                <p className="font-bold text-foreground mb-1">Mission</p>
                <p className="text-sm">Replace the stress of manual selling with a calm, repeatable structure for solo entrepreneurs.</p>
              </div>
              <div className="card-spotify p-5">
                <p className="font-bold text-foreground mb-1">Vision</p>
                <p className="text-sm">Build a generation of "Structured Sellers" across Africa — organized, professional, and globally ready.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <AdireDivider />

      {/* Logo Usage */}
      <section className="py-12 sm:py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-center">Logo</h2>
          <p className="text-muted-foreground text-center mb-10 max-w-xl mx-auto">
            Two variants — light background and dark background. Always use the appropriate variant for contrast.
          </p>
          <div className="grid sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <div className="flex flex-col items-center gap-4">
              <div className="w-full aspect-video rounded-2xl bg-background border border-border flex items-center justify-center p-8">
                <img src={logoLight} alt="SteerSolo Light Logo" className="w-24 h-24 rounded-2xl object-cover shadow-lg" />
              </div>
              <p className="text-sm text-muted-foreground">Light mode</p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="w-full aspect-video rounded-2xl bg-[hsl(220,40%,8%)] flex items-center justify-center p-8">
                <img src={logoDark} alt="SteerSolo Dark Logo" className="w-24 h-24 rounded-2xl object-cover shadow-lg" />
              </div>
              <p className="text-sm text-muted-foreground">Dark mode</p>
            </div>
          </div>
          <div className="mt-8 max-w-xl mx-auto">
            <h3 className="font-semibold mb-3">Do's & Don'ts</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <p className="text-accent font-medium">✓ Do</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Use on clean backgrounds</li>
                  <li>• Maintain aspect ratio</li>
                  <li>• Use with brand gradient text</li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="text-destructive font-medium">✗ Don't</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Stretch or distort</li>
                  <li>• Place on busy backgrounds</li>
                  <li>• Change the logo colors</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <AdireDivider />

      {/* Color Palette */}
      <section className="py-12 sm:py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-center">Color Palette</h2>
          <p className="text-muted-foreground text-center mb-10 max-w-xl mx-auto">
            Inspired by Adire textiles, Nigerian heritage, and the warmth of African markets.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {BRAND_COLORS.map((color) => (
              <div key={color.name} className="card-spotify overflow-hidden">
                <div className="h-20 w-full" style={{ background: `hsl(${color.light})` }} />
                <div className="p-4">
                  <p className="font-bold text-foreground">{color.name}</p>
                  <p className="text-xs text-muted-foreground mt-1 mb-2">{color.desc}</p>
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="flex items-center">
                      {color.hex}<CopyButton text={color.hex} />
                    </span>
                    <span className="text-muted-foreground">HSL: {color.light}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 max-w-4xl mx-auto">
            <p className="text-sm text-muted-foreground text-center">
              <strong>Gradient rule:</strong> When blending Adire Indigo → Nigerian Green, use middle stop <code className="bg-muted px-1 rounded">hsl(160, 50%, 28%)</code> to avoid teal-leaning hues.
            </p>
          </div>
        </div>
      </section>

      <AdireDivider />

      {/* Typography */}
      <section className="py-12 sm:py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-center">Typography</h2>
          <p className="text-muted-foreground text-center mb-10">
            <strong>Poppins</strong> is our only typeface — uniform across the entire platform.
          </p>
          <div className="space-y-4">
            {TYPOGRAPHY.map((t) => (
              <div key={t.weight} className="card-spotify p-5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                <div className="sm:w-44 shrink-0">
                  <p className="font-semibold text-sm text-foreground">{t.weight}</p>
                  <p className="text-xs text-muted-foreground">{t.usage}</p>
                </div>
                <p className="text-lg" style={{ fontWeight: parseInt(t.weight) }}>
                  {t.sample}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <AdireDivider />

      {/* Tone of Voice */}
      <section className="py-12 sm:py-20 bg-card/50">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-center">Tone of Voice</h2>
          <p className="text-muted-foreground text-center mb-4">
            Nigerian English. Warm. Direct. No corporate jargon.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {["Friendly", "Encouraging", "Clear", "Local", "Confident", "Never patronizing"].map(tag => (
              <span key={tag} className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">{tag}</span>
            ))}
          </div>
          <div className="space-y-4">
            {TONE_RULES.map((rule, i) => (
              <div key={i} className="grid sm:grid-cols-2 gap-3">
                <div className="card-spotify p-4 border-l-4 border-accent">
                  <p className="text-xs font-semibold text-accent mb-1">✓ Say this</p>
                  <p className="text-sm">{rule.do}</p>
                </div>
                <div className="card-spotify p-4 border-l-4 border-destructive/50">
                  <p className="text-xs font-semibold text-destructive mb-1">✗ Not this</p>
                  <p className="text-sm text-muted-foreground">{rule.dont}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <AdireDivider />

      {/* Adire Patterns */}
      <section className="py-12 sm:py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-center">Adire Patterns</h2>
          <p className="text-muted-foreground text-center mb-10 max-w-xl mx-auto">
            Inspired by Yoruba Adire textile art. Used as subtle background textures across the platform.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {PATTERN_VARIANTS.map((variant) => (
              <div key={variant} className="relative h-36 rounded-2xl overflow-hidden border border-border bg-card">
                <AdirePattern variant={variant} className="text-primary" opacity={0.5} />
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-card to-transparent">
                  <p className="font-semibold text-sm capitalize">{variant}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <AdireDivider />

      {/* Brand Gradient */}
      <section className="py-12 sm:py-20 bg-card/50">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">Brand Gradients</h2>
          <div className="space-y-4">
            <div className="h-16 rounded-2xl" style={{ background: "linear-gradient(135deg, hsl(215 65% 25%), hsl(160 50% 28%), hsl(145 60% 38%))" }} />
            <p className="text-sm text-muted-foreground">Primary → Accent (with correct middle stop)</p>
            <div className="h-16 rounded-2xl" style={{ background: "linear-gradient(135deg, hsl(42 90% 55%), hsl(35 85% 50%))" }} />
            <p className="text-sm text-muted-foreground">Gold gradient</p>
            <AdireAccent className="h-2 mt-4" />
            <p className="text-sm text-muted-foreground">Adire accent bar (used in navbar & footer)</p>
          </div>
        </div>
      </section>

      <Footer />
    </PageWrapper>
  );
};

export default BrandPage;
