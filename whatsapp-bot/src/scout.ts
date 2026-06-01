import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image_url: string | null;
  image_urls: string[] | null;
  category: string | null;
  shop_id: string;
  is_digital: boolean;
}

export interface Store {
  id: string;
  shop_name: string;
  shop_slug: string;
  description: string | null;
  logo_url: string | null;
  owner_id: string;
}

export interface ScoutedStore {
  store: Store;
  products: Product[];
}

/** Fetches one random store + up to 5 of its active products. */
export async function scoutRandomStore(): Promise<ScoutedStore | null> {
  // Fetch all active shops with at least one product
  const { data: shops, error: shopErr } = await supabase
    .from('shops')
    .select('id, shop_name, shop_slug, description, logo_url, owner_id')
    .eq('is_active', true)
    .limit(50);

  if (shopErr || !shops?.length) {
    console.error('[scout] Failed to fetch shops:', shopErr?.message);
    return null;
  }

  // Pick a random shop
  const store = shops[Math.floor(Math.random() * shops.length)] as Store;

  // Fetch its products
  const { data: products, error: prodErr } = await supabase
    .from('products')
    .select('id, name, price, description, image_url, image_urls, category, shop_id, is_digital')
    .eq('shop_id', store.id)
    .eq('is_active', true)
    .limit(5);

  if (prodErr || !products?.length) {
    console.error('[scout] No products for shop:', store.shop_name);
    return null;
  }

  return { store, products: products as Product[] };
}

/** Fetches top 5 products across ALL stores (by recency or order count). */
export async function scoutTopProducts(): Promise<(Product & { store: Store })[] | null> {
  const { data: products, error } = await supabase
    .from('products')
    .select(`
      id, name, price, description, image_url, image_urls, category, shop_id, is_digital,
      shops!inner(id, shop_name, shop_slug, description, logo_url, owner_id)
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(5);

  if (error || !products?.length) {
    console.error('[scout] Failed to fetch top products:', error?.message);
    return null;
  }

  return products.map((p: any) => ({
    ...p,
    store: p.shops,
  })) as (Product & { store: Store })[];
}

/** Checks if a specific product was already posted within the last 24 hours. */
export async function wasRecentlyPosted(productId: string): Promise<boolean> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data } = await supabase
    .from('whatsapp_post_log')
    .select('id')
    .eq('product_id', productId)
    .gte('posted_at', since)
    .maybeSingle();
  return !!data;
}

/** Logs a successful post to prevent re-posting within 24 hours. */
export async function logPost(productId: string, hookType: string): Promise<void> {
  await supabase.from('whatsapp_post_log').insert({
    product_id: productId,
    hook_type: hookType,
    posted_at: new Date().toISOString(),
  });
}
