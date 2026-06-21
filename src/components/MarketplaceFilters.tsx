import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  BadgeCheck,
  MapPin,
  SlidersHorizontal,
  ChevronDown,
  ArrowUpDown,
  X,
  Filter,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export const CATEGORIES = [
  { value: "all", label: "All", emoji: "🛍️", group: "main" },
  { value: "fashion", label: "Fashion", emoji: "👗", group: "main" },
  { value: "beauty", label: "Beauty", emoji: "✨", group: "main" },
  { value: "skincare", label: "Skincare", emoji: "🧴", group: "beauty" },
  { value: "haircare", label: "Haircare", emoji: "💇", group: "beauty" },
  { value: "cosmetics", label: "Cosmetics", emoji: "💄", group: "beauty" },
  { value: "fragrances", label: "Fragrances", emoji: "🌸", group: "beauty" },
  {
    value: "natural-beauty",
    label: "Natural Beauty",
    emoji: "🌿",
    group: "beauty",
  },
  { value: "electronics", label: "Electronics", emoji: "📱", group: "main" },
  { value: "food-drinks", label: "Food & Drinks", emoji: "🍔", group: "main" },
  { value: "home-living", label: "Home & Living", emoji: "🏠", group: "main" },
  { value: "art-craft", label: "Art & Craft", emoji: "🎨", group: "main" },
  { value: "services", label: "Services", emoji: "🛠️", group: "main" },
  { value: "other", label: "Other", emoji: "📦", group: "main" },
];

const NIGERIAN_STATES = [
  "All Locations",
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "rating", label: "Highest Rated" },
  { value: "name", label: "A–Z" },
];

interface MarketplaceFiltersProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedSort: string;
  onSortChange: (sort: string) => void;
  selectedState: string;
  onStateChange: (state: string) => void;
  selectedCity: string;
  onCityChange: (city: string) => void;
  showVerifiedOnly: boolean;
  onVerifiedChange: (verified: boolean) => void;
  categoryCounts?: Record<string, number>;
  minPrice?: string;
  maxPrice?: string;
  onMinPriceChange?: (val: string) => void;
  onMaxPriceChange?: (val: string) => void;
}

export const MarketplaceFilters = ({
  selectedCategory,
  onCategoryChange,
  selectedSort,
  onSortChange,
  selectedState,
  onStateChange,
  selectedCity,
  onCityChange,
  showVerifiedOnly,
  onVerifiedChange,
  categoryCounts,
  minPrice = "",
  maxPrice = "",
  onMinPriceChange,
  onMaxPriceChange,
}: MarketplaceFiltersProps) => {
  const isMobile = useIsMobile();
  const [showPriceFilter, setShowPriceFilter] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sortSheetOpen, setSortSheetOpen] = useState(false);
  const [stateSheetOpen, setStateSheetOpen] = useState(false);

  const isBeautyExpanded =
    selectedCategory === "beauty" ||
    [
      "skincare",
      "haircare",
      "cosmetics",
      "fragrances",
      "natural-beauty",
    ].includes(selectedCategory);

  const mainCategories = CATEGORIES.filter(c => c.group === "main");
  const beautySubcats = CATEGORIES.filter(c => c.group === "beauty");
  const visibleSubcats = isBeautyExpanded ? beautySubcats : [];

  const selectedSortLabel =
    SORT_OPTIONS.find(o => o.value === selectedSort)?.label || "Sort";
  const selectedStateLabel =
    selectedState === "All Locations" ? "Location" : selectedState;

  const hasActiveFilters =
    selectedCategory !== "all" ||
    selectedState !== "All Locations" ||
    selectedCity.trim() !== "" ||
    showVerifiedOnly ||
    minPrice !== "" ||
    maxPrice !== "";

  const clearAll = () => {
    onCategoryChange("all");
    onStateChange("All Locations");
    onCityChange("");
    onVerifiedChange(false);
    onMinPriceChange?.("");
    onMaxPriceChange?.("");
  };

  return (
    <>
      <div className="sticky top-16 z-40 bg-background/98 backdrop-blur-xl border-b border-border/50 shadow-sm">
        <div className="container mx-auto px-4 py-3 space-y-3">
          {/* ── Section 1: Category Filters ── */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {mainCategories.map(cat => {
                const isActive =
                  selectedCategory === cat.value ||
                  (cat.value === "beauty" && isBeautyExpanded);
                const count = categoryCounts?.[cat.value];
                return (
                  <button
                    key={cat.value}
                    onClick={() => onCategoryChange(cat.value)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 shrink-0 border",
                      isActive
                        ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20"
                        : "bg-card text-muted-foreground border-border/60 hover:border-primary/40 hover:text-foreground hover:bg-muted/60",
                    )}
                  >
                    <span>{cat.emoji}</span>
                    <span>{cat.label}</span>
                    {count !== undefined && cat.value !== "all" && (
                      <span
                        className={cn(
                          "text-[10px] tabular-nums font-bold ml-0.5",
                          isActive ? "opacity-80" : "opacity-50",
                        )}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {isBeautyExpanded && (
              <div className="flex items-center gap-2 overflow-x-auto pb-0.5 [&::-webkit-scrollbar]:hidden pl-1">
                <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider shrink-0">
                  Sub:
                </span>
                {visibleSubcats.map(cat => {
                  const isActive = selectedCategory === cat.value;
                  return (
                    <button
                      key={cat.value}
                      onClick={() => onCategoryChange(cat.value)}
                      className={cn(
                        "flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-all shrink-0 border",
                        isActive
                          ? "bg-accent text-accent-foreground border-accent"
                          : "bg-muted border-border/40 text-muted-foreground hover:border-accent/40 hover:text-foreground",
                      )}
                    >
                      {cat.emoji} {cat.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Section 2: Advanced Filters ── */}
          {/* Desktop Version */}
          <div className="hidden sm:flex border-t border-border/40 pt-3">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Sort dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-xl gap-1.5 text-xs font-medium border-border/60"
                  >
                    <ArrowUpDown className="w-3 h-3" />
                    {selectedSortLabel}
                    <ChevronDown className="w-3 h-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  side="bottom"
                  sideOffset={6}
                  collisionPadding={16}
                  className="rounded-xl w-44 p-1"
                >
                  {SORT_OPTIONS.map(opt => (
                    <DropdownMenuItem
                      key={opt.value}
                      onClick={() => onSortChange(opt.value)}
                      className={cn(
                        "rounded-lg text-sm",
                        selectedSort === opt.value &&
                          "font-semibold text-primary",
                      )}
                    >
                      {opt.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* State dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-8 rounded-xl gap-1.5 text-xs font-medium",
                      selectedState !== "All Locations"
                        ? "border-primary/50 text-primary bg-primary/5"
                        : "border-border/60",
                    )}
                  >
                    <MapPin className="w-3 h-3" />
                    {selectedStateLabel}
                    <ChevronDown className="w-3 h-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  side="bottom"
                  sideOffset={6}
                  collisionPadding={16}
                  className="rounded-xl w-44 p-1 max-h-[50vh] overflow-y-auto"
                >
                  {NIGERIAN_STATES.map(state => (
                    <DropdownMenuItem
                      key={state}
                      onClick={() => onStateChange(state)}
                      className={cn(
                        "rounded-lg text-sm",
                        selectedState === state && "font-semibold text-primary",
                      )}
                    >
                      {state}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* City input */}
              <div className="relative">
                <MapPin className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="City…"
                  value={selectedCity}
                  onChange={e => onCityChange(e.target.value)}
                  className="w-28 h-8 pl-5 text-xs rounded-xl bg-muted border-0 focus-visible:ring-1 focus-visible:ring-primary"
                />
              </div>

              {/* Price range toggle */}
              {onMinPriceChange && onMaxPriceChange && (
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-8 rounded-xl text-xs font-medium gap-1.5",
                    showPriceFilter
                      ? "border-primary/50 text-primary bg-primary/5"
                      : "border-border/60",
                  )}
                  onClick={() => setShowPriceFilter(v => !v)}
                >
                  <SlidersHorizontal className="w-3 h-3" />
                  Price
                </Button>
              )}

              {/* Price inputs (visible when toggled) */}
              {showPriceFilter && onMinPriceChange && onMaxPriceChange && (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">₦</span>
                  <Input
                    type="number"
                    min="0"
                    placeholder="Min"
                    value={minPrice}
                    onChange={e => onMinPriceChange(e.target.value)}
                    className="w-20 h-8 text-xs rounded-xl bg-muted border-0 focus-visible:ring-1 focus-visible:ring-primary"
                  />
                  <span className="text-xs text-muted-foreground">–</span>
                  <Input
                    type="number"
                    min="0"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={e => onMaxPriceChange(e.target.value)}
                    className="w-20 h-8 text-xs rounded-xl bg-muted border-0 focus-visible:ring-1 focus-visible:ring-primary"
                  />
                </div>
              )}

              {/* Verified toggle */}
              <div className="flex items-center gap-1.5 ml-auto">
                <Switch
                  id="verified-marketplace"
                  checked={showVerifiedOnly}
                  onCheckedChange={onVerifiedChange}
                  className="scale-90"
                />
                <Label
                  htmlFor="verified-marketplace"
                  className="flex items-center gap-1 cursor-pointer text-xs font-medium"
                >
                  <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified</span>
                </Label>
              </div>

              {/* Clear all */}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  className="h-8 rounded-xl text-xs text-muted-foreground hover:text-destructive gap-1"
                >
                  <X className="w-3 h-3" /> Clear
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Version - Filter Button */}
          <div className="sm:hidden border-t border-border/40 pt-3">
            <div className="flex items-center gap-2">
              {/* Sort sheet */}
              <Sheet open={sortSheetOpen} onOpenChange={setSortSheetOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-xl gap-1.5 text-xs font-medium border-border/60"
                  >
                    <ArrowUpDown className="w-3 h-3" />
                    {selectedSortLabel}
                    <ChevronDown className="w-3 h-3 opacity-50" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom">
                  <SheetHeader>
                    <SheetTitle>Sort</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4 space-y-1">
                    {SORT_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          onSortChange(opt.value);
                          setSortSheetOpen(false);
                        }}
                        className={cn(
                          "w-full text-left px-4 py-3 rounded-xl transition-colors",
                          selectedSort === opt.value
                            ? "bg-primary/10 text-primary font-semibold"
                            : "hover:bg-muted",
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>

              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-8 rounded-xl gap-1.5 text-xs font-medium ml-auto",
                  hasActiveFilters
                    ? "border-primary/50 text-primary bg-primary/5"
                    : "border-border/60",
                )}
                onClick={() => setMobileFiltersOpen(true)}
              >
                <Filter className="w-3 h-3" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-1 flex h-3 w-3 items-center justify-center rounded-full bg-primary text-[8px] font-semibold text-primary-foreground">
                    •
                  </span>
                )}
              </Button>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  className="h-8 rounded-xl text-xs text-muted-foreground hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filters Sheet */}
      <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 py-2">
            {/* State Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">State</Label>
              <Sheet open={stateSheetOpen} onOpenChange={setStateSheetOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-between"
                  >
                    {selectedStateLabel}
                    <ChevronDown className="w-4 h-4 opacity-50" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom">
                  <SheetHeader>
                    <SheetTitle>Select State</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4 space-y-1 max-h-[50vh] overflow-y-auto">
                    {NIGERIAN_STATES.map(state => (
                      <button
                        key={state}
                        onClick={() => {
                          onStateChange(state);
                          setStateSheetOpen(false);
                        }}
                        className={cn(
                          "w-full text-left px-4 py-3 rounded-xl transition-colors",
                          selectedState === state
                            ? "bg-primary/10 text-primary font-semibold"
                            : "hover:bg-muted",
                        )}
                      >
                        {state}
                      </button>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* City Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">City</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="City…"
                  value={selectedCity}
                  onChange={e => onCityChange(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Price Filter */}
            {onMinPriceChange && onMaxPriceChange && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Price Range</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm">₦</span>
                  <Input
                    type="number"
                    min="0"
                    placeholder="Min"
                    value={minPrice}
                    onChange={e => onMinPriceChange(e.target.value)}
                  />
                  <span className="text-sm text-muted-foreground">–</span>
                  <Input
                    type="number"
                    min="0"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={e => onMaxPriceChange(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Verified Toggle */}
            <div className="flex items-center justify-between">
              <Label
                htmlFor="verified-marketplace-mobile"
                className="text-sm font-medium"
              >
                Verified Shops Only
              </Label>
              <Switch
                id="verified-marketplace-mobile"
                checked={showVerifiedOnly}
                onCheckedChange={onVerifiedChange}
              />
            </div>
          </div>
          <div className="mt-6 flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="mr-auto text-destructive"
              >
                Clear All
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => setMobileFiltersOpen(false)}
              className="ml-auto"
            >
              Done
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
