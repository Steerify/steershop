import type { Product, Store } from './scout.js';

const BASE_URL = process.env.STEERSOLO_BASE_URL ?? 'https://steersolo.com';

export type HookType =
  | 'featured_store'
  | 'top_products'
  | 'new_arrival'
  | 'hidden_gem'
  | 'flash_deal'
  | 'conversation_starter'
  | 'shopping_tip'
  | 'group_invite';

/**
 * Rotates across hook types in 2-hour windows using a 15-bucket cycle.
 * This perfectly implements the 40-40-20 content delivery principle:
 * - 40% Promotional (6/15 slots)
 * - 40% Engaging (6/15 slots)
 * - 20% Sharing/Community (3/15 slots)
 * A 15-bucket cycle (30 hours) ensures post times shift naturally each day.
 */
export function selectHookType(): HookType {
  const hour = new Date().getHours();
  // Using epoch hours so the bucket advances continuously across days
  const epochHours = Math.floor(Date.now() / (1000 * 60 * 60));
  const bucket = Math.floor(epochHours / 2) % 15;
  
  const types: HookType[] = [
    'featured_store',       // Promo 1
    'conversation_starter', // Engage 1
    'group_invite',         // Share 1
    'top_products',         // Promo 2
    'shopping_tip',         // Engage 2
    'new_arrival',          // Promo 3
    'conversation_starter', // Engage 3
    'group_invite',         // Share 2
    'hidden_gem',           // Promo 4
    'shopping_tip',         // Engage 4
    'flash_deal',           // Promo 5
    'conversation_starter', // Engage 5
    'group_invite',         // Share 3
    'top_products',         // Promo 6
    'shopping_tip',         // Engage 6
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

// ─── Shopping tip hook ────────────────────────────────────────────────────────

const SHOPPING_TIPS = [
  { title: "Check Vendor Ratings", text: "Always look for the trust badge and recent reviews before making a big purchase." },
  { title: "Use Escrow", text: "For expensive items, SteerSolo's escrow service ensures you only release payment when you're satisfied." },
  { title: "Flash Deals", text: "Check the platform every morning! Vendors often drop their biggest discounts before noon." },
  { title: "Support Local", text: "Buying from vendors in your city? You can often arrange same-day delivery!" },
  { title: "Bundle Up", text: "If you're buying multiple items from one store, message the vendor directly—they might give you a discount!" },
];

export function buildShoppingTipCaption(): string {
  const tip = SHOPPING_TIPS[new Date().getHours() % SHOPPING_TIPS.length];
  return [
    `💡 *STEERSOLO SHOPPING TIP* 💡`,
    ``,
    `*${tip.title}*`,
    tip.text,
    ``,
    `Shop safely and smartly with us today.`,
    ``,
    `🌐 steersolo.com`,
  ].join('\n');
}

// ─── Group invite hook ───────────────────────────────────────────────────

export function buildGroupInviteCaption(groupLink: string): string {
  return [
    `👥 *GROW THE COMMUNITY* 👥`,
    ``,
    `Know someone who loves great deals and supporting local businesses?`,
    ``,
    `Invite them to the *SteerSolo Marketplace Group* — where we share:`,
    `• Daily product drops 🔥`,
    `• Flash deals you won’t find elsewhere ⚡`,
    `• Hidden gem stores 💎`,
    `• Community shopping tips 💡`,
    ``,
    `👇 *Share this link:*`,
    `${groupLink}`,
    ``,
    `The more, the merrier 🎉 Help us build Nigeria’s biggest marketplace community!`,
    ``,
    `⚡ Powered by *SteerSolo Marketplace* | steersolo.com`,
  ].join('\n');
}

// ─── Caption router ───────────────────────────────────────────────────────────

export function buildCaption(
  hookType: Exclude<HookType, 'top_products' | 'conversation_starter' | 'shopping_tip' | 'group_invite'>,
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
