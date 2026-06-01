import type { Product, Store } from './scout.js';

const BASE_URL = process.env.STEERSOLO_BASE_URL ?? 'https://steersolo.com';

export type HookType =
  | 'featured_store'
  | 'top_products'
  | 'new_arrival'
  | 'hidden_gem'
  | 'flash_deal'
  | 'conversation_starter';

/**
 * Rotates across all 6 hook types in 2-hour windows.
 * With 12 windows per day each type fires twice, keeping content fresh.
 */
export function selectHookType(): HookType {
  const hour = new Date().getHours();
  const bucket = Math.floor(hour / 2) % 6;
  const types: HookType[] = [
    'featured_store',
    'top_products',
    'new_arrival',
    'conversation_starter',
    'hidden_gem',
    'flash_deal',
  ];
  return types[bucket];
}

// ─── Single-store hooks ───────────────────────────────────────────────────────

export function buildFeaturedStoreCaption(store: Store, product: Product): string {
  const productUrl = `${BASE_URL}/shop/${store.shop_slug}/product/${product.id}`;
  const price = `₦${Number(product.price).toLocaleString('en-NG')}`;
  return [
    `🔥 *FEATURED STORE OF THE DAY* 🔥`,
    ``,
    `Say hello to *${store.shop_name}* — one of SteerSolo's hottest stores right now!`,
    ``,
    `🛍️ *${product.name}*`,
    `💰 *${price}*`,
    product.description ? `📝 ${product.description.slice(0, 120)}...` : '',
    ``,
    `👇 Get it here:`,
    `${productUrl}`,
    ``,
    `⚡ Powered by *SteerSolo Marketplace*`,
    `🌐 steersolo.com`,
  ]
    .filter(Boolean)
    .join('\n');
}

export function buildNewArrivalCaption(store: Store, product: Product): string {
  const productUrl = `${BASE_URL}/shop/${store.shop_slug}/product/${product.id}`;
  const price = `₦${Number(product.price).toLocaleString('en-NG')}`;
  return [
    `✨ *NEW ARRIVAL ALERT!* ✨`,
    ``,
    `*${store.shop_name}* just dropped something fresh 👀`,
    ``,
    `🆕 *${product.name}*`,
    `💰 *${price}*`,
    product.category ? `📦 Category: ${product.category}` : '',
    ``,
    `Be the first to grab it 👇`,
    productUrl,
    ``,
    `⚡ Powered by *SteerSolo Marketplace*`,
  ]
    .filter(Boolean)
    .join('\n');
}

export function buildHiddenGemCaption(store: Store, product: Product): string {
  const productUrl = `${BASE_URL}/shop/${store.shop_slug}/product/${product.id}`;
  const price = `₦${Number(product.price).toLocaleString('en-NG')}`;
  return [
    `💎 *HIDDEN GEM ALERT* 💎`,
    ``,
    `Not many people know about *${store.shop_name}* yet — but we do 😉`,
    ``,
    `🔍 *${product.name}*`,
    `💰 *${price}*`,
    product.description ? `"${product.description.slice(0, 100)}..."` : '',
    ``,
    `Support a local business today 🇳🇬`,
    productUrl,
    ``,
    `⚡ Powered by *SteerSolo Marketplace*`,
  ]
    .filter(Boolean)
    .join('\n');
}

export function buildFlashDealCaption(store: Store, product: Product): string {
  const productUrl = `${BASE_URL}/shop/${store.shop_slug}/product/${product.id}`;
  const price = `₦${Number(product.price).toLocaleString('en-NG')}`;
  return [
    `⚡ *FLASH DEAL — LIMITED TIME!* ⚡`,
    ``,
    `Don't sleep on this from *${store.shop_name}*!`,
    ``,
    `🔥 *${product.name}*`,
    `💸 *${price}*`,
    ``,
    `⏰ Get it before it's gone!`,
    productUrl,
    ``,
    `⚡ Powered by *SteerSolo Marketplace* | steersolo.com`,
  ]
    .filter(Boolean)
    .join('\n');
}

// ─── Multi-product top-5 hook ─────────────────────────────────────────────────

export function buildTop5Caption(items: (Product & { store: Store })[]): string {
  // Use global BASE_URL constant defined at top of file
  const lines = [
    `🛍️ *TOP 5 PRODUCTS ON STEERSOLO RIGHT NOW* 🛍️`,
    ``,
    `Here's what's hot in the marketplace today 🔥`,
    ``,
  ];

  const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
  items.slice(0, 5).forEach((item, i) => {
    const price = `₦${Number(item.price).toLocaleString('en-NG')}`;
    const productUrl = `${BASE_URL}/shop/${item.store.shop_slug}/product/${item.id}`;
    lines.push(`${medals[i]} *${item.name}*`);
    lines.push(`   💰 ${price} | 🏪 ${item.store.shop_name}`);
    lines.push(`   👉 ${productUrl}`);
    lines.push('');
  });

  lines.push(`⚡ Powered by *SteerSolo Marketplace*`);
  lines.push(`🌐 steersolo.com | Shop local. Shop smart.`);

  return lines.join('\n');
}

// ─── Conversation starter hook ────────────────────────────────────────────────

const CONVO_PROMPTS = [
  `What would you buy with ₦10,000 today? 👀`,
  `What's on your shopping list this week? 🛒`,
  `Name one thing you've been looking to buy. 💭`,
  `What's your next big purchase? 💰`,
  `Looking for something specific? Drop it below! 🎯`,
  `Ask the concierge — any product, any price range. ⚡`,
];

export function buildConversationStarterCaption(): string {
  const prompt = CONVO_PROMPTS[new Date().getHours() % CONVO_PROMPTS.length];
  return [
    `💬 *COMMUNITY QUESTION* 💬`,
    ``,
    prompt,
    ``,
    `Drop your answer in the chat — our SteerSolo concierge will help you find it! 🤖`,
    ``,
    `🌐 steersolo.com | Shop local. Shop smart.`,
  ].join('\n');
}

// ─── Caption router ───────────────────────────────────────────────────────────

export function buildCaption(
  hookType: Exclude<HookType, 'top_products' | 'conversation_starter'>,
  store: Store,
  product: Product,
): string {
  switch (hookType) {
    case 'featured_store':
      return buildFeaturedStoreCaption(store, product);
    case 'new_arrival':
      return buildNewArrivalCaption(store, product);
    case 'hidden_gem':
      return buildHiddenGemCaption(store, product);
    case 'flash_deal':
      return buildFlashDealCaption(store, product);
    default:
      return buildFeaturedStoreCaption(store, product);
  }
}
