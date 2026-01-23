import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette, Type, Sun, Moon, Monitor } from "lucide-react";

interface AppearanceSettings {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  theme_mode: 'light' | 'dark' | 'auto';
  font_style: 'modern' | 'classic' | 'playful' | 'elegant';
}

interface ShopAppearanceSettingsProps {
  settings: AppearanceSettings;
  onChange: (settings: Partial<AppearanceSettings>) => void;
}

const FONT_STYLES = [
  { value: 'modern', label: 'Modern', description: 'Clean and contemporary' },
  { value: 'classic', label: 'Classic', description: 'Traditional and timeless' },
  { value: 'playful', label: 'Playful', description: 'Fun and casual' },
  { value: 'elegant', label: 'Elegant', description: 'Sophisticated and refined' },
];

const THEME_MODES = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'auto', label: 'Auto', icon: Monitor },
];

export const ShopAppearanceSettings = ({ settings, onChange }: ShopAppearanceSettingsProps) => {
  return (
    <Card className="border-primary/10">
      <CardHeader className="p-4 sm:p-6">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg sm:text-xl">Shop Appearance</CardTitle>
        </div>
        <CardDescription className="text-sm">
          Customize your storefront colors and style
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 pt-0 space-y-6">
        {/* Color Settings */}
        <div className="space-y-4">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Brand Colors
          </Label>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primary_color" className="text-xs text-muted-foreground">
                Primary Color
              </Label>
              <div className="flex items-center gap-2">
                <div 
                  className="w-10 h-10 rounded-lg border border-border shadow-sm cursor-pointer"
                  style={{ backgroundColor: settings.primary_color }}
                >
                  <Input
                    type="color"
                    id="primary_color"
                    value={settings.primary_color}
                    onChange={(e) => onChange({ primary_color: e.target.value })}
                    className="w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                <Input
                  type="text"
                  value={settings.primary_color}
                  onChange={(e) => onChange({ primary_color: e.target.value })}
                  className="flex-1 font-mono text-xs"
                  placeholder="#D4AF37"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondary_color" className="text-xs text-muted-foreground">
                Secondary Color
              </Label>
              <div className="flex items-center gap-2">
                <div 
                  className="w-10 h-10 rounded-lg border border-border shadow-sm cursor-pointer"
                  style={{ backgroundColor: settings.secondary_color }}
                >
                  <Input
                    type="color"
                    id="secondary_color"
                    value={settings.secondary_color}
                    onChange={(e) => onChange({ secondary_color: e.target.value })}
                    className="w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                <Input
                  type="text"
                  value={settings.secondary_color}
                  onChange={(e) => onChange({ secondary_color: e.target.value })}
                  className="flex-1 font-mono text-xs"
                  placeholder="#2E1A47"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accent_color" className="text-xs text-muted-foreground">
                Accent Color
              </Label>
              <div className="flex items-center gap-2">
                <div 
                  className="w-10 h-10 rounded-lg border border-border shadow-sm cursor-pointer"
                  style={{ backgroundColor: settings.accent_color }}
                >
                  <Input
                    type="color"
                    id="accent_color"
                    value={settings.accent_color}
                    onChange={(e) => onChange({ accent_color: e.target.value })}
                    className="w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                <Input
                  type="text"
                  value={settings.accent_color}
                  onChange={(e) => onChange({ accent_color: e.target.value })}
                  className="flex-1 font-mono text-xs"
                  placeholder="#FF6B35"
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="mt-4 p-4 rounded-lg border border-border bg-muted/30">
            <p className="text-xs text-muted-foreground mb-2">Preview</p>
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: settings.primary_color }}
              >
                P
              </div>
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: settings.secondary_color }}
              >
                S
              </div>
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: settings.accent_color }}
              >
                A
              </div>
              <div className="flex-1 h-12 rounded-lg overflow-hidden flex">
                <div className="flex-1" style={{ backgroundColor: settings.primary_color }} />
                <div className="flex-1" style={{ backgroundColor: settings.secondary_color }} />
                <div className="flex-1" style={{ backgroundColor: settings.accent_color }} />
              </div>
            </div>
          </div>
        </div>

        {/* Theme Mode */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Theme Mode</Label>
          <div className="grid grid-cols-3 gap-2">
            {THEME_MODES.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => onChange({ theme_mode: value as AppearanceSettings['theme_mode'] })}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all ${
                  settings.theme_mode === value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Font Style */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Type className="w-4 h-4" />
            Font Style
          </Label>
          <Select
            value={settings.font_style}
            onValueChange={(value) => onChange({ font_style: value as AppearanceSettings['font_style'] })}
          >
            <SelectTrigger className="min-h-[44px]">
              <SelectValue placeholder="Select font style" />
            </SelectTrigger>
            <SelectContent>
              {FONT_STYLES.map(({ value, label, description }) => (
                <SelectItem key={value} value={value}>
                  <div className="flex flex-col">
                    <span className="font-medium">{label}</span>
                    <span className="text-xs text-muted-foreground">{description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};
