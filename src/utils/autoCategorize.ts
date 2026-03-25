const KEYWORD_MAP: Record<string, string[]> = {
  fashion: ['shoe', 'sneaker', 'dress', 'cloth', 'wear', 'bag', 'cap', 'fashion', 'style', 'apparel', 'fabric', 'aso', 'ankara', 'jersey', 'shirt', 'trouser', 'jean', 'skirt', 'gown', 'thrift', 'vintage', 'boutique', 'tailor', 'sew'],
  electronics: ['phone', 'laptop', 'gadget', 'tech', 'computer', 'charger', 'electronic', 'cable', 'earphone', 'speaker', 'tv', 'screen', 'battery', 'solar', 'inverter', 'camera'],
  'food-drinks': ['food', 'fish', 'cake', 'snack', 'drink', 'rice', 'chicken', 'shawarma', 'grill', 'fruit', 'juice', 'water', 'pepper', 'spice', 'pastry', 'bread', 'meat', 'suya', 'restaurant', 'kitchen', 'catering', 'cook', 'meal', 'breakfast', 'lunch', 'dinner', 'smoothie', 'wine', 'coffee', 'tea', 'bakery', 'confection', 'chin chin', 'zobo', 'kunu'],
  'beauty-health': ['beauty', 'skin', 'hair', 'cream', 'makeup', 'cosmetic', 'perfume', 'spa', 'health', 'soap', 'lotion', 'wig', 'lash', 'nail', 'glow', 'skincare', 'beard', 'barb', 'salon', 'braids', 'extension', 'fragrance', 'body butter', 'shea'],
  'home-living': ['furniture', 'decor', 'pillow', 'curtain', 'bed', 'home', 'interior', 'rug', 'towel', 'mattress', 'chair', 'table', 'shelf', 'wardrobe', 'household', 'cleaning'],
  'art-craft': ['art', 'craft', 'paint', 'drawing', 'bead', 'handmade', 'crochet', 'pottery', 'sculpture', 'design', 'canvas', 'embroidery', 'weaving', 'leather', 'woodwork'],
  services: ['service', 'consult', 'repair', 'clean', 'delivery', 'tutorial', 'training', 'compliance', 'hub', 'digital', 'agency', 'freelance', 'print', 'photography', 'photo', 'event', 'laundry', 'logistics', 'fitness', 'gym', 'tutor'],
};

const CATEGORY_LABELS: Record<string, string> = {
  fashion: 'Fashion',
  electronics: 'Electronics',
  'food-drinks': 'Food & Drinks',
  'beauty-health': 'Beauty & Health',
  'home-living': 'Home & Living',
  'art-craft': 'Art & Craft',
  services: 'Services',
  other: 'Other',
};

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
