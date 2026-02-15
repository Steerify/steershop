import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DEFAULT_IMAGE = "https://steersolo.lovable.app/favicon.ico";
const SITE_URL = "https://steersolo.lovable.app";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeJsonLd(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
}

function generateDefaultHTML(): Response {
  const html = `<!DOCTYPE html>
<html>
<head>
  <title>SteerSolo - Launch Your Online Store</title>
  <meta property="og:title" content="SteerSolo" />
  <meta property="og:description" content="Launch your online store in minutes. Create, sell, and grow your business with SteerSolo." />
  <meta property="og:image" content="${DEFAULT_IMAGE}" />
  <meta property="og:url" content="${SITE_URL}" />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="SteerSolo" />
  <meta name="twitter:description" content="Launch your online store in minutes." />
  <meta name="twitter:image" content="${DEFAULT_IMAGE}" />
  <meta http-equiv="refresh" content="0;url=${SITE_URL}">
</head>
<body>
  <p>Redirecting to SteerSolo...</p>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html', ...corsHeaders }
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get('slug');
    
    if (!slug) {
      return generateDefaultHTML();
    }
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    );
    
    const { data: shop, error } = await supabase
      .from('shops')
      .select('shop_name, description, logo_url, banner_url, whatsapp_number, average_rating, total_reviews')
      .eq('shop_slug', slug)
      .eq('is_active', true)
      .single();
    
    if (error || !shop) {
      console.log("Shop not found for slug:", slug);
      return generateDefaultHTML();
    }

    // Fetch products for JSON-LD
    const { data: products } = await supabase
      .from('products')
      .select('id, name, description, price, image_url')
      .eq('shop_id', slug)
      .eq('is_available', true)
      .limit(20);

    // We need the shop ID to query products properly
    const { data: shopWithId } = await supabase
      .from('shops')
      .select('id')
      .eq('shop_slug', slug)
      .single();

    let shopProducts: any[] = [];
    if (shopWithId) {
      const { data: prods } = await supabase
        .from('products')
        .select('id, name, description, price, image_url')
        .eq('shop_id', shopWithId.id)
        .eq('is_available', true)
        .limit(20);
      shopProducts = prods || [];
    }
    
    const shopName = escapeHtml(shop.shop_name || 'Shop');
    const description = escapeHtml(shop.description || `Shop at ${shopName} on SteerSolo`);
    const imageUrl = shop.logo_url || shop.banner_url || DEFAULT_IMAGE;
    const shopUrl = `${SITE_URL}/shop/${slug}`;

    // Build JSON-LD
    const jsonLd: any = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": shop.shop_name || 'Shop',
      "description": shop.description || `Shop at ${shop.shop_name} on SteerSolo`,
      "url": shopUrl,
      "image": imageUrl,
    };

    if (shop.average_rating && shop.total_reviews) {
      jsonLd.aggregateRating = {
        "@type": "AggregateRating",
        "ratingValue": shop.average_rating,
        "reviewCount": shop.total_reviews,
      };
    }

    if (shopProducts.length > 0) {
      jsonLd.makesOffer = shopProducts.map(p => ({
        "@type": "Offer",
        "itemOffered": {
          "@type": "Product",
          "name": p.name,
          "description": p.description || '',
          "image": p.image_url || DEFAULT_IMAGE,
          "url": `${shopUrl}/product/${p.id}`,
          "offers": {
            "@type": "Offer",
            "price": p.price,
            "priceCurrency": "NGN",
            "availability": "https://schema.org/InStock",
          }
        }
      }));
    }
    
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <title>${shopName} | SteerSolo</title>
  <meta name="description" content="${description}" />
  <link rel="canonical" href="${shopUrl}" />
  <meta property="og:title" content="${shopName}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:url" content="${shopUrl}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="SteerSolo" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${shopName}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${imageUrl}" />
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  <meta http-equiv="refresh" content="0;url=${shopUrl}">
</head>
<body>
  <h1>${shopName}</h1>
  <p>${description}</p>
  ${shopProducts.map(p => `<div><h2>${escapeHtml(p.name)}</h2><p>₦${p.price}</p></div>`).join('\n  ')}
  <p>Redirecting to ${shopName}...</p>
</body>
</html>`;

    return new Response(html, {
      headers: { 'Content-Type': 'text/html', ...corsHeaders }
    });
    
  } catch (error) {
    console.error("Error in shop-og-meta:", error);
    return generateDefaultHTML();
  }
});
