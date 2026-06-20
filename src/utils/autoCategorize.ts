const KEYWORD_MAP: Record<string, string[]> = {
  // Beauty sub-niches (priority — checked first)
  skincare: ['skincare', 'skin care', 'serum', 'moisturizer', 'cleanser', 'toner', 'exfoliat', 'sunscreen', 'face mask', 'facial', 'acne', 'glow', 'brightening', 'anti-aging', 'dark spot', 'shea butter', 'body butter', 'body oil', 'lotion', 'cream', 'soap', 'black soap'],
  haircare: ['hair', 'wig', 'weave', 'braids', 'extension', 'edge control', 'growth oil', 'shampoo', 'conditioner', 'relaxer', 'natural hair', 'locs', 'crochet', 'frontal', 'closure', 'bundles', 'salon', 'barb'],
  cosmetics: ['makeup', 'cosmetic', 'foundation', 'lipstick', 'mascara', 'eyeshadow', 'concealer', 'powder', 'blush', 'primer', 'contour', 'highlighter', 'lash', 'false lash', 'brow', 'eyeliner', 'lip gloss', 'nail', 'nail polish', 'gel nail', 'press on'],
  fragrances: ['perfume', 'fragrance', 'cologne', 'body spray', 'body mist', 'oud', 'attar', 'scent', 'deodorant'],
  'natural-beauty': ['organic', 'natural beauty', 'herbal', 'handmade soap', 'shea', 'african black soap', 'moringa', 'neem', 'turmeric', 'aloe vera', 'raw honey', 'essential oil'],
  // General categories
  fashion: ['shoe', 'sneaker', 'dress', 'cloth', 'wear', 'bag', 'cap', 'fashion', 'style', 'apparel', 'fabric', 'aso', 'ankara', 'jersey', 'shirt', 'trouser', 'jean', 'skirt', 'gown', 'thrift', 'vintage', 'boutique', 'tailor', 'sew'],
  electronics: ['phone', 'laptop', 'gadget', 'tech', 'computer', 'charger', 'electronic', 'cable', 'earphone', 'speaker', 'tv', 'screen', 'battery', 'solar', 'inverter', 'camera'],
  'food-drinks': ['food', 'fish', 'cake', 'snack', 'drink', 'rice', 'chicken', 'shawarma', 'grill', 'fruit', 'juice', 'water', 'pepper', 'spice', 'pastry', 'bread', 'meat', 'suya', 'restaurant', 'kitchen', 'catering', 'cook', 'meal', 'breakfast', 'lunch', 'dinner', 'smoothie', 'wine', 'coffee', 'tea', 'bakery', 'confection', 'chin chin', 'zobo', 'kunu'],
  'home-living': ['furniture', 'decor', 'pillow', 'curtain', 'bed', 'home', 'interior', 'rug', 'towel', 'mattress', 'chair', 'table', 'shelf', 'wardrobe', 'household', 'cleaning'],
  'art-craft': ['art', 'craft', 'paint', 'drawing', 'bead', 'handmade', 'crochet', 'pottery', 'sculpture', 'design', 'canvas', 'embroidery', 'weaving', 'leather', 'woodwork'],
  services: ['service', 'consult', 'repair', 'clean', 'delivery', 'tutorial', 'training', 'compliance', 'hub', 'digital', 'agency', 'freelance', 'print', 'photography', 'photo', 'event', 'laundry', 'logistics', 'fitness', 'gym', 'tutor'],
};

const CATEGORY_LABELS: Record<string, string> = {
  skincare: 'Skincare',
  haircare: 'Haircare',
  cosmetics: 'Cosmetics',
  fragrances: 'Fragrances',
  'natural-beauty': 'Natural Beauty',
  fashion: 'Fashion',
  electronics: 'Electronics',
  'food-drinks': 'Food & Drinks',
  'beauty-health': 'Beauty & Health',
  'home-living': 'Home & Living',
  'art-craft': 'Art & Craft',
  services: 'Services',
  other: 'Other',
};

// Beauty sub-categories that roll up to "beauty" parent
const BEAUTY_SUBCATEGORIES = ['skincare', 'haircare', 'cosmetics', 'fragrances', 'natural-beauty', 'beauty-health'];

// Main category priority order
export const MAIN_CATEGORIES = [
  'fashion',
  'beauty',
  'electronics',
  'food-drinks',
  'home-living',
  'art-craft',
  'services',
  'other',
];

export interface CategorizationResult {
  category: string;
  confidence: number;
  isFallback: boolean;
}

export function autoCategorize(name: string = '', description: string = ''): string {
  const result = autoCategorizeWithConfidence(name, description);
  return result.category;
}

export function autoCategorizeWithConfidence(
  name: string = '',
  description: string = ''
): CategorizationResult {
  try {
    const text = `${name} ${description}`.toLowerCase().trim();
    
    // Handle empty inputs gracefully
    if (!text) {
      return {
        category: 'other',
        confidence: 0,
        isFallback: true,
      };
    }

    const scores = Object.entries(KEYWORD_MAP).map(([category, keywords]) => {
      const score = keywords.reduce((acc, kw) => acc + (text.includes(kw) ? 1 : 0), 0);
      return { category, score };
    });

    const bestScore = Math.max(...scores.map(s => s.score));
    
    if (bestScore <= 0) {
      return {
        category: 'other',
        confidence: 0,
        isFallback: true,
      };
    }

    const bestMatches = scores.filter(s => s.score === bestScore).map(s => s.category);
    const categoryPriority = [
      'food-drinks',
      'skincare',
      'haircare',
      'cosmetics',
      'fragrances',
      'natural-beauty',
      'fashion',
      'electronics',
      'home-living',
      'art-craft',
      'services',
    ];

    const selectedCategory = categoryPriority.find(category => bestMatches.includes(category)) || bestMatches[0] || 'other';
    
    // Calculate confidence based on score distribution
    const totalMatches = scores.reduce((sum, s) => sum + s.score, 0);
    const confidence = totalMatches > 0 ? bestScore / totalMatches : 0;

    return {
      category: selectedCategory,
      confidence,
      isFallback: false,
    };
  } catch (error) {
    console.error('Error in autoCategorize:', error);
    // Graceful fallback
    return {
      category: 'other',
      confidence: 0,
      isFallback: true,
    };
  }
}

export function normalizeAndCategorize(category: string | null | undefined, name: string = '', description: string = ''): string {
  try {
    if (!category) {
      return autoCategorize(name, description);
    }

    const normalized = normalizeCategoryValue(category);
    
    // If normalized to a valid category, use it
    if (isValidCategory(normalized)) {
      return normalized;
    }

    // Otherwise, try to auto-categorize
    return autoCategorize(name, description);
  } catch (error) {
    console.error('Error in normalizeAndCategorize:', error);
    return 'other';
  }
}

export function normalizeCategoryValue(category?: string | null): string {
  if (!category) return 'other';
  const normalized = category.trim().toLowerCase();
  if (normalized.includes('fashion')) return 'fashion';
  if (normalized.includes('beauty') || normalized.includes('health')) {
    // Check if it matches any beauty subcategory
    if (normalized.includes('skincare')) return 'skincare';
    if (normalized.includes('haircare') || normalized.includes('hair care')) return 'haircare';
    if (normalized.includes('cosmetic') || normalized.includes('makeup')) return 'cosmetics';
    if (normalized.includes('fragrance') || normalized.includes('perfume')) return 'fragrances';
    if (normalized.includes('natural') || normalized.includes('organic')) return 'natural-beauty';
    return 'beauty';
  }
  if (normalized.includes('electronic') || normalized.includes('tech')) return 'electronics';
  if (normalized.includes('food') || normalized.includes('drink')) return 'food-drinks';
  if (normalized.includes('home') || normalized.includes('living')) return 'home-living';
  if (normalized.includes('art') || normalized.includes('craft')) return 'art-craft';
  if (normalized.includes('service') || normalized.includes('consult')) return 'services';
  return normalized.replace(/&/g, '').replace(/\s+/g, '-');
}

export function isValidCategory(category: string): boolean {
  return Object.keys(CATEGORY_LABELS).includes(category) || 
         ['beauty'].includes(category) ||
         BEAUTY_SUBCATEGORIES.includes(category);
}

export function getCategoryLabel(slug: string): string {
  return CATEGORY_LABELS[slug] || 'Other';
}

export function isBeautyCategory(category: string): boolean {
  return BEAUTY_SUBCATEGORIES.includes(category);
}

export { BEAUTY_SUBCATEGORIES, CATEGORY_LABELS };
