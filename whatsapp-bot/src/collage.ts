import sharp from 'sharp';
import { downloadImage } from './images.js';
import type { Product, Store } from './scout.js';

// ─── Constants ────────────────────────────────────────────────────────────────

const TILE_W = 380;
const TILE_H = 380;
const GAP = 6;
const BG = { r: 15, g: 15, b: 26, alpha: 1 };

// ─── Shared helpers ────────────────────────────────────────────────────────────

type SharpComposite = Parameters<ReturnType<typeof sharp>['composite']>[0][number];

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

async function makePlaceholderTile(label: string, w: number, h: number): Promise<Buffer> {
  const svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${w}" height="${h}" fill="#1a1a2e"/>
    <rect x="4" y="4" width="${w - 8}" height="${h - 8}" fill="none" stroke="#6c63ff" stroke-width="2" rx="10"/>
    <text x="50%" y="50%" font-family="sans-serif" font-size="17" font-weight="bold"
      fill="#ccc" text-anchor="middle" dominant-baseline="middle">${esc(label.slice(0, 36))}</text>
  </svg>`;
  return sharp(Buffer.from(svg)).resize(w, h).jpeg({ quality: 85 }).toBuffer();
}

async function makeTile(
  imageUrl: string | null | undefined,
  label: string,
  w: number,
  h: number,
): Promise<Buffer> {
  const raw = await downloadImage(imageUrl);
  if (raw) {
    try {
      return await sharp(raw).resize(w, h, { fit: 'cover', position: 'centre' }).jpeg({ quality: 85 }).toBuffer();
    } catch { /* fall through */ }
  }
  return makePlaceholderTile(label, w, h);
}

/** Stitch tiles into a uniform grid (left-aligned). */
async function stitchGrid(
  tiles: Buffer[],
  cols: number,
  tileW: number,
  tileH: number,
  canvasW: number,
): Promise<Buffer> {
  const rows = Math.ceil(tiles.length / cols);
  const canvasH = rows * tileH + (rows - 1) * GAP;
  const composites: SharpComposite[] = tiles.map((buf, i) => ({
    input: buf,
    left: (i % cols) * (tileW + GAP),
    top: Math.floor(i / cols) * (tileH + GAP),
  }));
  return sharp({ create: { width: canvasW, height: canvasH, channels: 3, background: BG } })
    .composite(composites)
    .jpeg({ quality: 88 })
    .toBuffer();
}

// ─── 1. Generic Product Collage ───────────────────────────────────────────────

/**
 * Generates a product image collage for 1–6 items.
 *
 * Layout adapts automatically:
 *  1 item  → full single tile
 *  2 items → 2-wide strip
 *  3 items → 3-wide strip
 *  4 items → 2×2 grid
 *  5 items → 2 top + 3 bottom (centred)
 *  6 items → 3×2 grid
 */
export async function generateProductCollage(
  items: { name: string; image_url: string | null; image_urls: string[] | null }[],
): Promise<Buffer | null> {
  const entries = items.slice(0, 6);
  if (!entries.length) return null;

  const count = entries.length;
  console.log(`[collage] Building product collage for ${count} item(s)…`);

  // Determine layout
  const cols = count === 1 ? 1 : count <= 3 ? count : count === 4 ? 2 : 3;
  const tileSize = count <= 2 ? TILE_W : count === 3 ? 340 : count === 4 ? 360 : 300;
  const canvasW = cols * tileSize + (cols - 1) * GAP;

  const tiles = await Promise.all(
    entries.map((item) => {
      const url = item.image_urls?.[0] ?? item.image_url ?? null;
      return makeTile(url, item.name, tileSize, tileSize);
    }),
  );

  // Special 5-item asymmetric layout: 2 on top centred, 3 on bottom
  if (count === 5) {
    const row1 = tiles.slice(0, 2);
    const row2 = tiles.slice(2);
    const fullW = 3 * tileSize + 2 * GAP;
    const row1W = 2 * tileSize + GAP;
    const xOff = Math.floor((fullW - row1W) / 2);
    const composites: SharpComposite[] = [
      ...row1.map((buf, i) => ({ input: buf, left: xOff + i * (tileSize + GAP), top: 0 })),
      ...row2.map((buf, i) => ({ input: buf, left: i * (tileSize + GAP), top: tileSize + GAP })),
    ];
    const h = 2 * tileSize + GAP;
    try {
      const result = await sharp({ create: { width: fullW, height: h, channels: 3, background: BG } })
        .composite(composites)
        .jpeg({ quality: 88 })
        .toBuffer();
      console.log(`[collage] Done — ${fullW}×${h}px, ${Math.round(result.byteLength / 1024)}KB`);
      return result;
    } catch (err: any) {
      console.error('[collage] Failed:', err?.message);
      return null;
    }
  }

  try {
    const result = await stitchGrid(tiles, cols, tileSize, tileSize, canvasW);
    console.log(`[collage] Done — ${Math.round(result.byteLength / 1024)}KB`);
    return result;
  } catch (err: any) {
    console.error('[collage] Failed:', err?.message);
    return null;
  }
}

// ─── 2. Store Snapshot ────────────────────────────────────────────────────────

/**
 * Generates a branded store snapshot card:
 *  - Gradient header banner with store name, tagline, and logo (if available)
 *  - Strip of up to 3 product images below the banner
 */
export async function generateStoreSnapshot(
  store: Store,
  products: Product[],
): Promise<Buffer | null> {
  console.log(`[collage] Building store snapshot for "${store.shop_name}"…`);

  const CANVAS_W = 960;
  const HEADER_H = 190;
  const PROD_H = 310;
  const CANVAS_H = HEADER_H + GAP + PROD_H;
  const PROD_COUNT = Math.min(products.length, 3);
  const PROD_W = PROD_COUNT > 0 ? Math.floor((CANVAS_W - (PROD_COUNT - 1) * GAP) / PROD_COUNT) : CANVAS_W;

  // ── Branded header SVG ──
  const storeName = esc(store.shop_name ?? 'Store');
  const tagline = esc((store.description ?? 'Shop on SteerSolo').slice(0, 72));

  const headerSvg = `<svg width="${CANVAS_W}" height="${HEADER_H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="hg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#6c63ff"/>
        <stop offset="100%" style="stop-color:#2d0b8f"/>
      </linearGradient>
    </defs>
    <rect width="${CANVAS_W}" height="${HEADER_H}" fill="url(#hg)"/>
    <!-- subtle pattern dots -->
    <circle cx="880" cy="30" r="60" fill="rgba(255,255,255,0.04)"/>
    <circle cx="920" cy="160" r="40" fill="rgba(255,255,255,0.04)"/>
    <!-- store icon ring (replaced by logo if available) -->
    <circle cx="88" cy="${HEADER_H / 2}" r="54" fill="rgba(255,255,255,0.15)"/>
    <text x="88" y="${HEADER_H / 2 + 2}" font-family="sans-serif" font-size="40"
      text-anchor="middle" dominant-baseline="middle">🏪</text>
    <!-- store name -->
    <text x="162" y="${HEADER_H / 2 - 16}" font-family="sans-serif" font-size="30"
      font-weight="bold" fill="#ffffff">${storeName}</text>
    <!-- tagline -->
    <text x="162" y="${HEADER_H / 2 + 20}" font-family="sans-serif" font-size="15"
      fill="rgba(255,255,255,0.75)">${tagline}</text>
    <!-- badge -->
    <rect x="${CANVAS_W - 140}" y="${HEADER_H - 36}" width="128" height="24" rx="12"
      fill="rgba(255,255,255,0.12)"/>
    <text x="${CANVAS_W - 76}" y="${HEADER_H - 21}" font-family="sans-serif" font-size="12"
      fill="rgba(255,255,255,0.85)" text-anchor="middle">⚡ steersolo.com</text>
  </svg>`;

  const headerBuf = await sharp(Buffer.from(headerSvg))
    .resize(CANVAS_W, HEADER_H)
    .jpeg({ quality: 92 })
    .toBuffer();

  // ── Logo overlay (replaces the icon) ──
  let logoComposite: SharpComposite | undefined;
  if (store.logo_url) {
    const logoBuf = await downloadImage(store.logo_url);
    if (logoBuf) {
      try {
        const resized = await sharp(logoBuf).resize(90, 90, { fit: 'cover' }).jpeg({ quality: 88 }).toBuffer();
        logoComposite = { input: resized, left: 43, top: Math.floor((HEADER_H - 90) / 2) };
      } catch { /* ignore */ }
    }
  }

  // ── Product tiles ──
  const prodTiles = await Promise.all(
    products.slice(0, 3).map((p) => {
      const url = p.image_urls?.[0] ?? p.image_url ?? null;
      return makeTile(url, p.name, PROD_W, PROD_H);
    }),
  );

  // ── Compose final canvas ──
  const composites: SharpComposite[] = [
    { input: headerBuf, left: 0, top: 0 },
    ...(logoComposite ? [logoComposite] : []),
    ...prodTiles.map((buf, i) => ({
      input: buf,
      left: i * (PROD_W + GAP),
      top: HEADER_H + GAP,
    })),
  ];

  try {
    const result = await sharp({
      create: { width: CANVAS_W, height: CANVAS_H, channels: 3, background: BG },
    })
      .composite(composites)
      .jpeg({ quality: 88 })
      .toBuffer();

    console.log(`[collage] Store snapshot done — ${CANVAS_W}×${CANVAS_H}px, ${Math.round(result.byteLength / 1024)}KB`);
    return result;
  } catch (err: any) {
    console.error('[collage] Store snapshot failed:', err?.message);
    return null;
  }
}

// ─── 3. Conversation Starter Image ────────────────────────────────────────────

/**
 * Rotating theme table — one per scheduled time slot.
 * Each theme has a distinct colour accent, central emoji, and an engaging question.
 */
const CONVO_THEMES = [
  { emoji: '🤔', accent: '#ff6b6b', q1: 'What would you buy', q2: 'with ₦10,000 today?' },
  { emoji: '🛍️', accent: '#6c63ff', q1: "What's on your", q2: 'shopping list this week?' },
  { emoji: '💡', accent: '#ffd166', q1: 'Name one thing', q2: "you've been looking to buy." },
  { emoji: '🔥', accent: '#ff9f43', q1: "What's your next", q2: 'big purchase?' },
  { emoji: '🎯', accent: '#26de81', q1: 'Looking for something specific?', q2: 'Drop it below!' },
  { emoji: '💬', accent: '#45aaf2', q1: 'Ask the concierge —', q2: 'any product, any price range.' },
] as const;

/**
 * Generates a vibrant conversation-starter image.
 * Pure SVG → JPEG via sharp, so no external images are needed.
 * Rotates through 6 themed designs based on the current hour.
 */
export async function generateConversationStarterImage(): Promise<Buffer | null> {
  const theme = CONVO_THEMES[new Date().getHours() % CONVO_THEMES.length];
  const W = 720;
  const H = 720;
  const CX = W / 2;

  const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="bg" cx="50%" cy="50%" r="70%">
        <stop offset="0%" style="stop-color:#1e1b4b"/>
        <stop offset="100%" style="stop-color:#0f0f1a"/>
      </radialGradient>
      <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="10" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>

    <!-- Background -->
    <rect width="${W}" height="${H}" fill="url(#bg)"/>

    <!-- Decorative rings -->
    <circle cx="${CX}" cy="${H / 2}" r="300" fill="none" stroke="${theme.accent}"
      stroke-width="1.5" opacity="0.12"/>
    <circle cx="${CX}" cy="${H / 2}" r="230" fill="none" stroke="${theme.accent}"
      stroke-width="1" opacity="0.08"/>

    <!-- Corner accents -->
    <circle cx="0" cy="0" r="80" fill="${theme.accent}" opacity="0.08"/>
    <circle cx="${W}" cy="${H}" r="100" fill="${theme.accent}" opacity="0.08"/>

    <!-- Glowing emoji bubble -->
    <circle cx="${CX}" cy="248" r="118" fill="${theme.accent}" opacity="0.14" filter="url(#glow)"/>
    <circle cx="${CX}" cy="248" r="96" fill="${theme.accent}" opacity="0.22"/>
    <text x="${CX}" y="248" font-size="72" text-anchor="middle"
      dominant-baseline="middle">${theme.emoji}</text>

    <!-- Question line 1 -->
    <text x="${CX}" y="408" font-family="sans-serif" font-size="28" font-weight="bold"
      fill="#ffffff" text-anchor="middle">${esc(theme.q1)}</text>
    <!-- Question line 2 -->
    <text x="${CX}" y="447" font-family="sans-serif" font-size="28" font-weight="bold"
      fill="#ffffff" text-anchor="middle">${esc(theme.q2)}</text>

    <!-- Accent divider -->
    <line x1="${CX - 70}" y1="487" x2="${CX + 70}" y2="487"
      stroke="${theme.accent}" stroke-width="2.5" stroke-linecap="round" opacity="0.7"/>

    <!-- CTA pill -->
    <rect x="${CX - 110}" y="502" width="220" height="38" rx="19"
      fill="${theme.accent}" opacity="0.18"/>
    <text x="${CX}" y="525" font-family="sans-serif" font-size="17"
      fill="${theme.accent}" text-anchor="middle" font-weight="bold">Reply below 👇</text>

    <!-- Branding strip -->
    <rect x="0" y="${H - 80}" width="${W}" height="80" fill="rgba(0,0,0,0.35)"/>
    <text x="${CX}" y="${H - 46}" font-family="sans-serif" font-size="18"
      font-weight="bold" fill="rgba(255,255,255,0.6)" text-anchor="middle">
      ⚡ SteerSolo Marketplace
    </text>
    <text x="${CX}" y="${H - 18}" font-family="sans-serif" font-size="13"
      fill="rgba(255,255,255,0.3)" text-anchor="middle">steersolo.com</text>
  </svg>`;

  try {
    const result = await sharp(Buffer.from(svg)).jpeg({ quality: 92 }).toBuffer();
    console.log(`[collage] Conversation starter image — ${Math.round(result.byteLength / 1024)}KB`);
    return result;
  } catch (err: any) {
    console.error('[collage] Conversation starter image failed:', err?.message);
    return null;
  }
}

// ─── Legacy alias ─────────────────────────────────────────────────────────────

/** @deprecated Use generateProductCollage instead */
export const generateTop5Collage = generateProductCollage;
