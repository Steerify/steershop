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

export function autoCategorize(name: string = '', description: string = ''): string {
  const text = `${name} ${description}`.toLowerCase();

  for (const [category, keywords] of Object.entries(KEYWORD_MAP)) {
    if (keywords.some(kw => text.includes(kw))) {
      return category;
    }
  }
  return 'other';
}

export function getCategoryLabel(slug: string): string {
  return CATEGORY_LABELS[slug] || 'Other';
}

export function isBeautyCategory(category: string): boolean {
  return BEAUTY_SUBCATEGORIES.includes(category);
}

export { BEAUTY_SUBCATEGORIES, CATEGORY_LABELS };
