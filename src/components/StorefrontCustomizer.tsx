import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Palette, Type, LayoutGrid, Loader2, Sparkles, Check, Wand2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface StorefrontCustomizerProps {
  shopId: string;
  logoUrl?: string | null;
  currentAccentColor?: string | null;
  currentPrimaryColor?: string | null;
  currentSecondaryColor?: string | null;
  currentFontStyle?: string | null;
  currentThemeMode?: string | null;
}

const ACCENT_COLORS = [
  { name: "Emerald", value: "#059669" },
  { name: "Blue", value: "#2563eb" },
  { name: "Purple", value: "#7c3aed" },
  { name: "Rose", value: "#e11d48" },
  { name: "Orange", value: "#ea580c" },
  { name: "Teal", value: "#0d9488" },
  { name: "Indigo", value: "#4f46e5" },
  { name: "Gold", value: "#ca8a04" },
];

const FONT_OPTIONS = [
  { name: "Default (Poppins)", value: "default" },
  { name: "Playfair Display", value: "Playfair Display" },
  { name: "Space Grotesk", value: "Space Grotesk" },
  { name: "DM Sans", value: "DM Sans" },
  { name: "Inter", value: "Inter" },
];

const LAYOUT_OPTIONS = [
  { name: "Comfortable (3 columns)", value: "comfortable", icon: "◻◻◻" },
  { name: "Compact (4 columns)", value: "compact", icon: "▪▪▪▪" },
];

const clampChannel = (value: number) => Math.max(0, Math.min(255, Math.round(value)));

const rgbToHex = (r: number, g: number, b: number) =>
  `#${clampChannel(r).toString(16).padStart(2, "0")}${clampChannel(g)
    .toString(16)
    .padStart(2, "0")}${clampChannel(b).toString(16).padStart(2, "0")}`;

const darkenHex = (hex: string, factor = 0.7) => {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return hex;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return rgbToHex(r * factor, g * factor, b * factor);
};

const hexToHslTriplet = (hex: string): string => {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return "160 84% 39%";

  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
  }

  h = Math.round(h * 60);
  if (h < 0) h += 360;

  const l = (max + min) / 2;
  const sat = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  return `${h} ${Math.round(sat * 100)}% ${Math.round(l * 100)}%`;
};

const hslTripletToHex = (triplet?: string | null): string | null => {
  if (!triplet) return null;
  if (triplet.startsWith("#")) return triplet;

  const match = triplet.trim().match(/^(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%$/);
  if (!match) return null;

  const h = Number(match[1]);
  const s = Number(match[2]) / 100;
  const l = Number(match[3]) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let rPrime = 0;
  let gPrime = 0;
  let bPrime = 0;

  if (h < 60) [rPrime, gPrime, bPrime] = [c, x, 0];
  else if (h < 120) [rPrime, gPrime, bPrime] = [x, c, 0];
  else if (h < 180) [rPrime, gPrime, bPrime] = [0, c, x];
  else if (h < 240) [rPrime, gPrime, bPrime] = [0, x, c];
  else if (h < 300) [rPrime, gPrime, bPrime] = [x, 0, c];
  else [rPrime, gPrime, bPrime] = [c, 0, x];

  return rgbToHex((rPrime + m) * 255, (gPrime + m) * 255, (bPrime + m) * 255);
};

const normalizeColor = (value: string | null | undefined, fallback: string) => hslTripletToHex(value) || fallback;

export const StorefrontCustomizer = ({
  shopId,
  logoUrl,
  currentAccentColor,
  currentPrimaryColor,
  currentSecondaryColor,
  currentFontStyle,
  currentThemeMode,
}: StorefrontCustomizerProps) => {
  const { toast } = useToast();
  const [accentColor, setAccentColor] = useState(normalizeColor(currentAccentColor, "#059669"));
  const [primaryColor, setPrimaryColor] = useState(normalizeColor(currentPrimaryColor, "#123c72"));
  const [secondaryColor, setSecondaryColor] = useState(normalizeColor(currentSecondaryColor, "#16a34a"));
  const [fontStyle, setFontStyle] = useState(currentFontStyle || "default");
  const [layoutMode, setLayoutMode] = useState(currentThemeMode || "comfortable");
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const selectedColor = useMemo(
    () => ACCENT_COLORS.find((c) => c.value === accentColor),
    [accentColor]
  );

  const handleAutoFromLogo = async () => {
    if (!logoUrl) {
      toast({ title: "Add logo first", description: "Upload a logo so we can generate colors.", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = logoUrl;
      });

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Unable to process logo colors");

      canvas.width = 80;
      canvas.height = 80;
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const { data } = context.getImageData(0, 0, canvas.width, canvas.height);

      let r = 0;
      let g = 0;
      let b = 0;
      let pixels = 0;

      for (let i = 0; i < data.length; i += 4) {
        const alpha = data[i + 3];
        if (alpha < 40) continue;
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        pixels += 1;
      }

      if (!pixels) throw new Error("Logo colors not detected");

      const dominant = rgbToHex(r / pixels, g / pixels, b / pixels);
      const dark = darkenHex(dominant, 0.62);
      const light = darkenHex(dominant, 0.85);

      setAccentColor(dominant);
      setPrimaryColor(dark);
      setSecondaryColor(light);

      toast({ title: "Design generated", description: "Store colors were generated from your logo." });
    } catch (error: any) {
      toast({ title: "Auto design failed", description: error.message || "Try choosing colors manually.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("shops")
        .update({
          accent_color: accentColor ? hexToHslTriplet(accentColor) : null,
          primary_color: primaryColor || null,
          secondary_color: secondaryColor || null,
          font_style: fontStyle === "default" ? null : fontStyle,
          theme_mode: layoutMode,
        })
        .eq("id", shopId);

      if (error) throw error;
      toast({ title: "Customizations saved!", description: "Your storefront has been updated." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to save", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="card-spotify border-none mt-6 overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-primary via-accent to-gold" />
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent" />
          <CardTitle className="text-lg">Autodesign by SteerSolo</CardTitle>
        </div>
        <CardDescription>
          Personalize each store independently — accents, text style, and smart branding with Autodesign by SteerSolo.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Button
          type="button"
          variant="outline"
          onClick={handleAutoFromLogo}
          disabled={isGenerating}
          className="w-full rounded-xl"
        >
          {isGenerating ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating from logo...</>
          ) : (
            <><Wand2 className="w-4 h-4 mr-2" /> Run Autodesign</>
          )}
        </Button>

        {/* Accent Color */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-primary" />
            Accent Color
          </Label>
          <div className="flex flex-wrap gap-3">
            {ACCENT_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => setAccentColor(color.value)}
                className={cn(
                  "w-10 h-10 rounded-full transition-all duration-200 hover:scale-110 relative",
                  accentColor === color.value && "ring-2 ring-offset-2 ring-offset-card ring-foreground/50 scale-110"
                )}
                style={{ backgroundColor: color.value }}
                title={color.name}
              >
                {accentColor === color.value && <Check className="w-4 h-4 text-white absolute inset-0 m-auto" />}
              </button>
            ))}
          </div>
          {selectedColor && <p className="text-xs text-muted-foreground">Selected: {selectedColor.name}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="primaryColor">Text / Primary Color</Label>
            <input id="primaryColor" type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-full h-11 rounded-lg border border-border bg-card p-1" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="secondaryColor">Secondary / Design Color</Label>
            <input id="secondaryColor" type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="w-full h-11 rounded-lg border border-border bg-card p-1" />
          </div>
        </div>

        {/* Font Style */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Type className="w-4 h-4 text-primary" />
            Font Style
          </Label>
          <Select value={fontStyle} onValueChange={setFontStyle}>
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="Choose a font" />
            </SelectTrigger>
            <SelectContent>
              {FONT_OPTIONS.map((font) => (
                <SelectItem key={font.value} value={font.value}>
                  <span style={{ fontFamily: font.value === "default" ? "inherit" : font.value }}>
                    {font.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Layout Density */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-primary" />
            Layout Density
          </Label>
          <div className="grid grid-cols-2 gap-3">
            {LAYOUT_OPTIONS.map((layout) => (
              <button
                key={layout.value}
                onClick={() => setLayoutMode(layout.value)}
                className={cn(
                  "p-4 rounded-xl border-2 text-center transition-all duration-200",
                  layoutMode === layout.value ? "border-accent bg-accent/5" : "border-border hover:border-accent/40"
                )}
              >
                <span className="text-xl tracking-widest block mb-1">{layout.icon}</span>
                <span className="text-sm font-medium">{layout.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
          <p className="text-xs text-muted-foreground mb-2">Live Preview</p>
          <div className="space-y-2">
            <div className="h-2 rounded-full" style={{ background: `linear-gradient(90deg, ${secondaryColor}, ${accentColor})` }} />
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: accentColor }} />
              <span className="text-lg font-semibold" style={{ color: primaryColor, fontFamily: fontStyle === "default" ? "inherit" : fontStyle }}>
                Your Store Name
              </span>
            </div>
          </div>
        </div>

        <Button onClick={handleSave} disabled={isSaving} className="w-full rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90">
          {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : "Save Customizations"}
        </Button>
      </CardContent>
    </Card>
  );
};
