import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Palette, Type, LayoutGrid, Loader2, Sparkles, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface StorefrontCustomizerProps {
  shopId: string;
  currentAccentColor?: string | null;
  currentFontStyle?: string | null;
  currentThemeMode?: string | null;
}

const ACCENT_COLORS = [
  { name: "Emerald", value: "#059669", hsl: "160 84% 39%" },
  { name: "Blue", value: "#2563eb", hsl: "217 91% 60%" },
  { name: "Purple", value: "#7c3aed", hsl: "263 70% 50%" },
  { name: "Rose", value: "#e11d48", hsl: "347 77% 50%" },
  { name: "Orange", value: "#ea580c", hsl: "21 90% 48%" },
  { name: "Teal", value: "#0d9488", hsl: "174 72% 56%" },
  { name: "Indigo", value: "#4f46e5", hsl: "239 84% 67%" },
  { name: "Gold", value: "#ca8a04", hsl: "48 96% 53%" },
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

export const StorefrontCustomizer = ({
  shopId,
  currentAccentColor,
  currentFontStyle,
  currentThemeMode,
}: StorefrontCustomizerProps) => {
  const { toast } = useToast();
  const [accentColor, setAccentColor] = useState(currentAccentColor || "");
  const [fontStyle, setFontStyle] = useState(currentFontStyle || "default");
  const [layoutMode, setLayoutMode] = useState(currentThemeMode || "comfortable");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("shops")
        .update({
          accent_color: accentColor || null,
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

  const selectedColor = ACCENT_COLORS.find(c => c.value === accentColor);

  return (
    <Card className="card-spotify border-none mt-6 overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-primary via-accent to-gold" />
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent" />
          <CardTitle className="text-lg">Storefront Customization</CardTitle>
        </div>
        <CardDescription>
          Personalize your store's appearance — exclusive for Pro & Business plans.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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
                {accentColor === color.value && (
                  <Check className="w-4 h-4 text-white absolute inset-0 m-auto" />
                )}
              </button>
            ))}
          </div>
          {selectedColor && (
            <p className="text-xs text-muted-foreground">Selected: {selectedColor.name}</p>
          )}
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
                  layoutMode === layout.value
                    ? "border-accent bg-accent/5"
                    : "border-border hover:border-accent/40"
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
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg"
              style={{ backgroundColor: accentColor || "hsl(var(--accent))" }}
            />
            <span
              className="text-lg font-semibold"
              style={{ fontFamily: fontStyle === "default" ? "inherit" : fontStyle }}
            >
              Your Store Name
            </span>
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90"
        >
          {isSaving ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
          ) : (
            "Save Customizations"
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
