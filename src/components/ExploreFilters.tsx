import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { BadgeCheck, SlidersHorizontal } from "lucide-react";

const CATEGORIES = [
  { value: 'all', label: 'All', group: 'main' },
  { value: 'beauty', label: '✨ Beauty', group: 'main' },
  { value: 'skincare', label: 'Skincare', group: 'beauty' },
  { value: 'haircare', label: 'Haircare', group: 'beauty' },
  { value: 'cosmetics', label: 'Cosmetics', group: 'beauty' },
  { value: 'fragrances', label: 'Fragrances', group: 'beauty' },
  { value: 'natural-beauty', label: 'Natural Beauty', group: 'beauty' },
  { value: 'fashion', label: 'Fashion', group: 'main' },
  { value: 'electronics', label: 'Electronics', group: 'main' },
  { value: 'food-drinks', label: 'Food & Drinks', group: 'main' },
  { value: 'home-living', label: 'Home & Living', group: 'main' },
  { value: 'art-craft', label: 'Art & Craft', group: 'main' },
  { value: 'services', label: 'Services', group: 'main' },
  { value: 'other', label: 'Other', group: 'main' },
];

const NIGERIAN_STATES = [
  'All Locations', 'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
  'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu',
  'FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi',
  'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun',
  'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'name', label: 'A-Z' },
];

interface ExploreFiltersProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedSort: string;
  onSortChange: (sort: string) => void;
  selectedState: string;
  onStateChange: (state: string) => void;
  showVerifiedOnly: boolean;
  onVerifiedChange: (verified: boolean) => void;
  categoryCounts?: Record<string, number>;
  minPrice?: string;
  maxPrice?: string;
  onMinPriceChange?: (val: string) => void;
  onMaxPriceChange?: (val: string) => void;
}

export const ExploreFilters = ({
  selectedCategory, onCategoryChange,
  selectedSort, onSortChange,
  selectedState, onStateChange,
  showVerifiedOnly, onVerifiedChange,
  categoryCounts,
  minPrice = '', maxPrice = '',
  onMinPriceChange, onMaxPriceChange,
}: ExploreFiltersProps) => {
  const isBeautyExpanded = selectedCategory === 'beauty' || 
    ['skincare', 'haircare', 'cosmetics', 'fragrances', 'natural-beauty'].includes(selectedCategory);

  const visibleCategories = CATEGORIES.filter(cat => {
    if (cat.group === 'main') return true;
    if (cat.group === 'beauty') return isBeautyExpanded;
    return false;
  });

  return (
    <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-lg border-b py-3">
      <div className="container mx-auto px-4">
        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-3">
          {visibleCategories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => onCategoryChange(cat.value)}
              className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.value
                  ? 'bg-primary text-primary-foreground'
                  : cat.group === 'beauty'
                  ? 'bg-accent/10 hover:bg-accent/20 text-accent-foreground border border-accent/20'
                  : 'bg-muted hover:bg-muted/80 text-muted-foreground'
              }`}
            >
              {cat.label}
              {categoryCounts && cat.value !== 'all' && cat.value !== 'beauty' && categoryCounts[cat.value] !== undefined && (
                <span className="ml-1 opacity-60">({categoryCounts[cat.value]})</span>
              )}
            </button>
          ))}
        </div>

        {/* Sort, Location, Price, Verified row */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
            <select
              value={selectedSort}
              onChange={(e) => onSortChange(e.target.value)}
              className="text-xs sm:text-sm bg-muted border-0 rounded-md px-2 py-1.5 focus:ring-1 focus:ring-primary"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <select
            value={selectedState}
            onChange={(e) => onStateChange(e.target.value)}
            className="text-xs sm:text-sm bg-muted border-0 rounded-md px-2 py-1.5 focus:ring-1 focus:ring-primary"
          >
            {NIGERIAN_STATES.map((state) => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>

          {/* Price Range */}
          {onMinPriceChange && onMaxPriceChange && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">₦</span>
              <Input
                type="number"
                min="1"
                step="1"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => onMinPriceChange(e.target.value)}
                className="w-16 sm:w-20 h-7 text-xs px-1.5 bg-muted border-0"
              />
              <span className="text-xs text-muted-foreground">–</span>
              <Input
                type="number"
                min="1"
                step="1"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => onMaxPriceChange(e.target.value)}
                className="w-16 sm:w-20 h-7 text-xs px-1.5 bg-muted border-0"
              />
            </div>
          )}

          <div className="flex items-center gap-1.5 ml-auto">
            <Switch
              id="verified-explore"
              checked={showVerifiedOnly}
              onCheckedChange={onVerifiedChange}
              className="scale-90"
            />
            <Label htmlFor="verified-explore" className="flex items-center gap-1 cursor-pointer text-xs sm:text-sm">
              <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Verified</span>
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
};
