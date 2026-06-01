import type { WASocket } from '@whiskeysockets/baileys';
import { downloadImage, pickProductImage } from './images.js';
import {
  generateProductCollage,
  generateStoreSnapshot,
  generateConversationStarterImage,
  generateShoppingTipImage,
  generateGroupInviteImage,
} from './collage.js';
import {
  buildCaption,
  buildTop5Caption,
  buildConversationStarterCaption,
  buildShoppingTipCaption,
  buildGroupInviteCaption,
  selectHookType,
  type HookType,
} from './hooks.js';
import {
  scoutRandomStore,
  scoutTopProducts,
  wasRecentlyPosted,
  logPost,
} from './scout.js';

const GROUP_JID = process.env.WHATSAPP_GROUP_JID!;

if (!GROUP_JID) {
  throw new Error('WHATSAPP_GROUP_JID is not set in .env');
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function sendImageWithCaption(
  sock: WASocket,
  imageBuffer: Buffer,
  caption: string,
): Promise<void> {
  await sock.sendMessage(GROUP_JID, {
    image: imageBuffer,
    caption,
    jpegThumbnail: undefined,
  });
}

async function sendTextOnly(sock: WASocket, caption: string): Promise<void> {
  await sock.sendMessage(GROUP_JID, { text: caption });
}

async function sendWithFallback(
  sock: WASocket,
  imageBuffer: Buffer | null,
  caption: string,
): Promise<void> {
  if (imageBuffer) {
    await sendImageWithCaption(sock, imageBuffer, caption);
  } else {
    await sendTextOnly(sock, caption);
  }
}

// ─── 1. Top-5 multi-product collage post ──────────────────────────────────────

async function postTop5(sock: WASocket): Promise<void> {
  console.log('[poster] Running TOP_5 hook…');
  const items = await scoutTopProducts();
  if (!items?.length) {
    console.warn('[poster] No products found for Top 5');
    return;
  }

  const caption = buildTop5Caption(items);
  // generateProductCollage accepts any array of {name, image_url, image_urls}
  const collage = await generateProductCollage(items);

  await sendWithFallback(sock, collage, caption);

  for (const item of items) {
    await logPost(item.id, 'top_products');
  }

  console.log('[poster] Top 5 post complete.');
}

// ─── 2. Single-store post with store snapshot ─────────────────────────────────

/**
 * For store-focused hooks (featured_store, new_arrival, hidden_gem, flash_deal):
 *  - Caption highlights one fresh product with its direct product link
 *  - Visual is a store snapshot: branded header banner + grid of the store's products
 *    (showing context even if the caption only features one item)
 */
async function postSingleStore(
  sock: WASocket,
  hookType: Exclude<HookType, 'top_products' | 'conversation_starter' | 'shopping_tip' | 'group_invite'>,
): Promise<void> {
  console.log(`[poster] Running ${hookType.toUpperCase()} hook…`);

  // Try up to 3 different random stores to find one with a non-recently-posted product
  for (let attempt = 0; attempt < 3; attempt++) {
    const scouted = await scoutRandomStore();
    if (!scouted) continue;

    const { store, products } = scouted;

    // Find the first product that hasn't been posted recently
    const freshProduct = (
      await Promise.all(
        products.map(async (p) => ({
          product: p,
          recent: await wasRecentlyPosted(p.id),
        })),
      )
    ).find((x) => !x.recent)?.product;

    if (!freshProduct) {
      console.log(`[poster] All products from "${store.shop_name}" recently posted. Retrying…`);
      continue;
    }

    const caption = buildCaption(hookType, store, freshProduct);

    // ── Visual: store snapshot (banner + product grid) ──
    // Shows the whole store context — multiple products — even if the caption
    // only highlights one. Falls back to the single product image if snapshot fails.
    let visual: Buffer | null = await generateStoreSnapshot(store, products);

    if (!visual) {
      // Secondary fallback: single product image
      const imgUrl = pickProductImage(freshProduct);
      visual = await downloadImage(imgUrl);
    }

    await sendWithFallback(sock, visual, caption);

    await logPost(freshProduct.id, hookType);
    console.log(
      `[poster] Posted "${freshProduct.name}" from "${store.shop_name}" (${hookType})`,
    );
    return;
  }

  console.warn('[poster] Could not find a fresh store to post. Skipping this cycle.');
}

// ─── 3. Conversation starter post ──────────────────────────────────────────────────

async function postConversationStarter(sock: WASocket): Promise<void> {
  console.log('[poster] Running CONVERSATION_STARTER hook…');
  const caption = buildConversationStarterCaption();
  const image = await generateConversationStarterImage();
  await sendWithFallback(sock, image, caption);
  console.log('[poster] Conversation starter post complete.');
}

// ─── 4. Shopping tip post ────────────────────────────────────────────────────────

async function postShoppingTip(sock: WASocket): Promise<void> {
  console.log('[poster] Running SHOPPING_TIP hook…');
  const caption = buildShoppingTipCaption();
  const image = await generateShoppingTipImage();
  await sendWithFallback(sock, image, caption);
  console.log('[poster] Shopping tip post complete.');
}

// ─── 5. Group invite post ──────────────────────────────────────────────────────

/**
 * Posts a "share the group link" call-to-action.
 * Reads the invite link from WHATSAPP_GROUP_INVITE_LINK env var.
 * If the env var is not set the post is skipped with a warning.
 */
async function postGroupInvite(sock: WASocket): Promise<void> {
  console.log('[poster] Running GROUP_INVITE hook…');

  const groupLink = process.env.WHATSAPP_GROUP_INVITE_LINK;
  if (!groupLink) {
    console.warn(
      '[poster] WHATSAPP_GROUP_INVITE_LINK is not set. Skipping group invite post.',
    );
    return;
  }

  const caption = buildGroupInviteCaption(groupLink);
  const image = await generateGroupInviteImage(groupLink);

  await sendWithFallback(sock, image, caption);
  console.log('[poster] Group invite post complete.');
}

// ─── Main poster entry point ─────────────────────────────────────────────────────

export async function runPostCycle(sock: WASocket): Promise<void> {
  const hookType = selectHookType();
  console.log(`[poster] === Starting post cycle | Hook: ${hookType} ===`);

  try {
    switch (hookType) {
      case 'top_products':
        await postTop5(sock);
        break;
      case 'conversation_starter':
        await postConversationStarter(sock);
        break;
      case 'shopping_tip':
        await postShoppingTip(sock);
        break;
      case 'group_invite':
        await postGroupInvite(sock);
        break;
      default:
        await postSingleStore(
          sock,
          hookType as Exclude<HookType, 'top_products' | 'conversation_starter' | 'shopping_tip' | 'group_invite'>,
        );
    }
  } catch (err: any) {
    console.error('[poster] Error during post cycle:', err?.message ?? err);
  }
}
