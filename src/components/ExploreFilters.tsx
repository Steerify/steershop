import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { BadgeCheck, SlidersHorizontal } from "lucide-react";

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'fashion', label: 'Fashion' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'food-drinks', label: 'Food & Drinks' },
  { value: 'beauty-health', label: 'Beauty & Health' },
  { value: 'home-living', label: 'Home & Living' },
  { value: 'art-craft', label: 'Art & Craft' },
  { value: 'services', label: 'Services' },
  { value: 'other', label: 'Other' },
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
}

export const ExploreFilters = ({
  selectedCategory, onCategoryChange,
  selectedSort, onSortChange,
  selectedState, onStateChange,
  showVerifiedOnly, onVerifiedChange,
}: ExploreFiltersProps) => {
  return (
    <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-lg border-b py-3">
      <div className="container mx-auto px-4">
        {/* Category chips - horizontal scroll */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => onCategoryChange(cat.value)}
              className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80 text-muted-foreground'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Sort, Location, Verified row */}
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

          <div className="flex items-center gap-1.5 ml-auto">
            <Switch
              id="verified-explore"
              checked={showVerifiedOnly}
              onCheckedChange={onVerifiedChange}
              className="scale-90"
            />
            <Label htmlFor="verified-explore" className="flex items-center gap-1 cursor-pointer text-xs sm:text-sm">
              <BadgeCheck className="w-3.5 h-3.5 text-green-600" />
              <span className="hidden sm:inline">Verified</span>
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
};
