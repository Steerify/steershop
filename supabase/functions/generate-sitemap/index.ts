import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SITE_URL = "https://steersolo.lovable.app";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    );

    // Fetch all active shops
    const { data: shops } = await supabase
      .from('shops')
      .select('shop_slug, updated_at, logo_url')
      .eq('is_active', true);

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
      '/accept-payments-online', '/small-business-tools', '/sell-online-nigeria'
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

    // Shop pages with image tags
    if (shops) {
      for (const shop of shops) {
        const lastmod = shop.updated_at ? new Date(shop.updated_at).toISOString().split('T')[0] : now;
        urls += `
  <url>
    <loc>${SITE_URL}/shop/${shop.shop_slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>${shop.logo_url ? `
    <image:image>
      <image:loc>${shop.logo_url}</image:loc>
    </image:image>` : ''}
  </url>`;
      }
    }

    // Product pages with image tags
    if (products) {
      for (const product of products) {
        const shopData = product.shops as any;
        if (!shopData?.is_active || !shopData?.shop_slug) continue;
        const lastmod = product.updated_at ? new Date(product.updated_at).toISOString().split('T')[0] : now;
        urls += `
  <url>
    <loc>${SITE_URL}/shop/${shopData.shop_slug}/product/${product.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>${product.image_url ? `
    <image:image>
      <image:loc>${product.image_url}</image:loc>
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
    <loc>https://steersolo.lovable.app/</loc>
  </url>
</urlset>`, {
      headers: { 'Content-Type': 'application/xml', ...corsHeaders },
    });
  }
});
