import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SITE_URL = "https://steersolo.com";

function escapeXml(unsafe: string) {
  if (!unsafe) return '';
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    );

    // Fetch all active shops with owner subscription info and featured flag
    const { data: shops } = await supabase
      .from('shops')
      .select('id, shop_slug, updated_at, logo_url, owner_id, is_featured, payment_method, bank_name, bank_account_name, bank_account_number, paystack_public_key')
      .eq('is_active', true);

    const hasCompletePaymentSetup = (shop: any) => {
      const method = shop.payment_method;
      if (!method) return false;
      const hasBank = !!(shop.bank_name && shop.bank_account_name && shop.bank_account_number);
      const hasPaystack = !!shop.paystack_public_key;
      if (method === 'bank_transfer') return hasBank;
      if (method === 'paystack') return hasPaystack;
      if (method === 'both') return hasBank && hasPaystack;
      return false;
    };

    const { data: productShopRows } = await supabase
      .from('products')
      .select('shop_id')
      .eq('is_available', true)
      .not('image_url', 'is', null);

    const shopsWithProductImages = new Set((productShopRows || []).map((p: any) => p.shop_id));
    const eligibleShops = (shops || []).filter((shop: any) => hasCompletePaymentSetup(shop) && shopsWithProductImages.has(shop.id));

    // Fetch owner plan info for premium gating
    const ownerPlanMap: Record<string, string> = {};
    if (eligibleShops && eligibleShops.length > 0) {
      const ownerIds = [...new Set(eligibleShops.map(s => s.owner_id).filter(Boolean))];
      if (ownerIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, subscription_plan_id')
          .in('id', ownerIds);
        
        if (profiles) {
          const planIds = [...new Set(profiles.map(p => p.subscription_plan_id).filter(Boolean))];
          if (planIds.length > 0) {
            const { data: plans } = await supabase
              .from('subscription_plans')
              .select('id, slug')
              .in('id', planIds);
            
            const planSlugMap: Record<string, string> = {};
            if (plans) {
              for (const plan of plans) {
                planSlugMap[plan.id] = plan.slug;
              }
            }
            for (const profile of profiles) {
              if (profile.subscription_plan_id) {
                ownerPlanMap[profile.id] = planSlugMap[profile.subscription_plan_id] || 'free';
              }
            }
          }
        }
      }
    }

    // Fetch all available products with their shop slugs
    const { data: products } = await supabase
      .from('products')
      .select('id, updated_at, image_url, shops!inner(shop_slug, is_active)')
      .eq('is_available', true);

    const now = new Date().toISOString().split('T')[0];

    let urls = `
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/shops</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;

    // Static pages
    const staticPages = [
      '/about', '/pricing', '/faq', '/how-it-works',
      '/features/growth', '/features/payments', '/features/trust', '/features/whatsapp',
      '/sell-on-whatsapp', '/sell-on-instagram', '/online-store-nigeria',
      '/accept-payments-online', '/small-business-tools', '/sell-online-nigeria',
      '/whatsapp-store-builder-nigeria', '/instagram-seller-tools-nigeria',
      '/online-marketplace-nigeria', '/accept-payments-on-whatsapp-nigeria',
      '/ambassador-program', '/insights',
      '/insights/whatsapp-selling-nigeria',
      '/insights/marketplace-growth-playbook',
      '/insights/trusted-storefront-nigeria'
    ];
    for (const page of staticPages) {
      urls += `
  <url>
    <loc>${SITE_URL}${page}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    }

    // Shop pages with priority based on featured flag and subscription plan
    if (eligibleShops) {
      for (const shop of eligibleShops) {
        const isFeatured = shop.is_featured === true;
        const lastmod = shop.updated_at ? new Date(shop.updated_at).toISOString().split('T')[0] : now;
        // Featured shops (manually boosted) → 1.0; all other active shops → 0.9
        const priority = isFeatured ? '1.0' : '0.9';
        const changefreq = 'daily';
        
        urls += `
  <url>
    <loc>${SITE_URL}/shop/${escapeXml(shop.shop_slug)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>${shop.logo_url ? `
    <image:image>
      <image:loc>${escapeXml(shop.logo_url)}</image:loc>
    </image:image>` : ''}
  </url>`;
      }
    }

    // Product pages — all products get priority 0.8 and daily frequency
    // Build a map of shop_slug → owner_id for product priority lookup
    const shopSlugOwnerMap: Record<string, string> = {};
    for (const s of eligibleShops) {
      if (s.shop_slug && s.owner_id) shopSlugOwnerMap[s.shop_slug] = s.owner_id;
    }
    if (products) {
      for (const product of products) {
        const shopData = product.shops as any;
        if (!shopData?.is_active || !shopData?.shop_slug) continue;
        const lastmod = product.updated_at ? new Date(product.updated_at).toISOString().split('T')[0] : now;
        const ownerId = shopSlugOwnerMap[shopData.shop_slug];
        const productPriority = '0.8';
        urls += `
  <url>
    <loc>${SITE_URL}/shop/${escapeXml(shopData.shop_slug)}/product/${product.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${productPriority}</priority>${product.image_url ? `
    <image:image>
      <image:loc>${escapeXml(product.image_url)}</image:loc>
    </image:image>` : ''}
  </url>`;
      }
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>`;

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600',
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://steersolo.com/</loc>
  </url>
</urlset>`, {
      headers: { 'Content-Type': 'application/xml', ...corsHeaders },
    });
  }
});
