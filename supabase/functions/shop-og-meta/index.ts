import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DEFAULT_IMAGE = "https://steersolo.com/favicon.ico";
const SITE_URL = "https://steersolo.com";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
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

function formatPrice(price: number): string {
  return `₦${price.toLocaleString()}`;
}

function generateProductPageHTML(shop: any, product: any, shopUrl: string): Response {
  const shopName = escapeHtml(shop.shop_name || 'Shop');
  const baseProductName = product.name || 'Product';
  const productName = escapeHtml(product.price ? `${baseProductName} - ${formatPrice(product.price)}` : baseProductName);
  const description = escapeHtml(product.description || `${baseProductName} available at ${shop.shop_name} on SteerSolo`);
  const imageUrl = product.image_url || shop.logo_url || DEFAULT_IMAGE;
  const productUrl = `${shopUrl}/product/${product.id}`;

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description || `${product.name} available at ${shop.shop_name}`,
    "image": imageUrl,
    "url": productUrl,
    "brand": { "@type": "Brand", "name": shop.shop_name },
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": "NGN",
      "availability": product.is_available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": { "@type": "Organization", "name": shop.shop_name, "url": shopUrl }
    },
    ...(product.average_rating && product.total_reviews && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": product.average_rating,
        "reviewCount": product.total_reviews
      }
    })
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "SteerSolo", "item": SITE_URL },
      { "@type": "ListItem", "position": 2, "name": "Shops", "item": `${SITE_URL}/shops` },
      { "@type": "ListItem", "position": 3, "name": shop.shop_name, "item": shopUrl },
      { "@type": "ListItem", "position": 4, "name": product.name, "item": productUrl }
    ]
  };

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <title>${productName} | ${shopName} | SteerSolo</title>
  <meta name="description" content="${description}" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="${productUrl}" />
  <meta property="og:title" content="${productName} - ${shopName}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:url" content="${productUrl}" />
  <meta property="og:type" content="product" />
  <meta property="og:site_name" content="SteerSolo" />
  <meta property="product:price:amount" content="${product.price}" />
  <meta property="product:price:currency" content="NGN" />
  <meta property="product:availability" content="${product.is_available ? 'instock' : 'outofstock'}" />
  <meta property="product:brand" content="${shopName}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${productName} - ${shopName}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${imageUrl}" />
  <script type="application/ld+json">${JSON.stringify([productSchema, breadcrumbSchema])}</script>
  <meta http-equiv="refresh" content="0;url=${productUrl}">
  <style>
    :root {
      --bg: #09090b;
      --card: #18181b;
      --border: rgba(255,255,255,0.08);
      --primary: #a1a1aa;
      --foreground: #f4f4f5;
      --accent: #10b981;
    }
    body {
      background-color: var(--bg);
      color: var(--foreground);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 2rem 1rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      box-sizing: border-box;
    }
    .card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 24px;
      padding: 2rem;
      max-width: 500px;
      width: 100%;
      box-shadow: 0 20px 40px rgba(0,0,0,0.3);
      text-align: center;
    }
    .product-img {
      width: 100%;
      height: 240px;
      object-fit: cover;
      border-radius: 16px;
      margin-bottom: 1.5rem;
      border: 1px solid var(--border);
    }
    h1 {
      font-size: 1.75rem;
      font-weight: 800;
      margin: 0 0 0.5rem 0;
      letter-spacing: -0.025em;
    }
    p {
      color: var(--primary);
      font-size: 0.95rem;
      line-height: 1.5;
      margin: 0 0 1.5rem 0;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      background: rgba(16, 185, 129, 0.1);
      color: var(--accent);
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      font-size: 0.8rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
      border: 1px solid rgba(16, 185, 129, 0.2);
    }
    .price-tag {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--foreground);
      margin-bottom: 1.5rem;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: var(--foreground);
      color: var(--bg);
      font-weight: 600;
      text-decoration: none;
      padding: 0.75rem 1.5rem;
      border-radius: 14px;
      width: 100%;
      box-sizing: border-box;
    }
    .redirect-msg {
      margin-top: 1.5rem;
      font-size: 0.85rem;
      color: var(--primary);
    }
  </style>
</head>
<body>
  <div class="card">
    ${product.image_url ? `<img src="${product.image_url}" alt="${productName}" class="product-img" />` : ''}
    <div>
      <span class="badge">Product Listing</span>
    </div>
    <h1>${productName}</h1>
    <p>${description}</p>
    <div class="price-tag">${formatPrice(product.price)}</div>
    <a href="${productUrl}" class="btn">View on Storefront</a>
    <div class="redirect-msg">Redirecting to ${shopName} in seconds...</div>
  </div>
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
    const productId = url.searchParams.get('product');
    
    if (!slug) {
      return generateDefaultHTML();
    }
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    );
    
    const { data: shop, error } = await supabase
      .from('shops')
      .select('id, shop_name, description, logo_url, banner_url, whatsapp_number, average_rating, total_reviews, state, country, owner_id')
      .eq('shop_slug', slug)
      .eq('is_active', true)
      .single();
    
    if (error || !shop) {
      console.log("Shop not found for slug:", slug);
      return generateDefaultHTML();
    }

    // Check owner's subscription plan for SEO gating
    let planSlug = 'free';
    let isSubscribed = false;
    if (shop.owner_id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_subscribed, subscription_plan_id')
        .eq('id', shop.owner_id)
        .single();
      isSubscribed = profile?.is_subscribed === true;
      
      if (profile?.subscription_plan_id) {
        const { data: plan } = await supabase
          .from('subscription_plans')
          .select('slug')
          .eq('id', profile.subscription_plan_id)
          .single();
        planSlug = plan?.slug || 'free';
      }
    }

    const isPremium = planSlug === 'pro' || planSlug === 'business';
    const shopUrl = `${SITE_URL}/shop/${slug}`;

    // If product ID is provided, serve a product-specific page
    if (productId) {
      const { data: product } = await supabase
        .from('products')
        .select('id, name, description, price, image_url, category, is_available, average_rating, total_reviews')
        .eq('id', productId)
        .eq('shop_id', shop.id)
        .single();

      if (product) {
        return generateProductPageHTML(shop, product, shopUrl);
      }
    }

    // Fetch products for shop page
    const { data: prods } = await supabase
      .from('products')
      .select('id, name, description, price, image_url, category, average_rating, total_reviews')
      .eq('shop_id', shop.id)
      .eq('is_available', true)
      .limit(isPremium ? 50 : 20);
    const shopProducts = prods || [];
    
    const shopName = escapeHtml(shop.shop_name || 'Shop');
    const description = escapeHtml(shop.description || `Shop at ${shopName} on SteerSolo`);
    const imageUrl = shop.logo_url || shop.banner_url || DEFAULT_IMAGE;

    const categories = [...new Set(shopProducts.map(p => p.category).filter(Boolean))];
    const keywordsMeta = [shopName, ...(categories.length ? categories : ['online shop']), 'SteerSolo', 'Nigeria', shop.state || ''].filter(Boolean).join(', ');

    // LocalBusiness JSON-LD — unlocked for all shops
    const jsonLd: any = {
      "@context": "https://schema.org",
      "@type": "Store",
      "@id": shopUrl,
      "name": shop.shop_name || 'Shop',
      "description": shop.description || `Shop at ${shop.shop_name} on SteerSolo`,
      "url": shopUrl,
      "image": imageUrl,
    };

    if (shop.state || shop.country) {
      jsonLd.address = {
        "@type": "PostalAddress",
        ...(shop.state && { "addressRegion": shop.state }),
        "addressCountry": shop.country || "NG",
      };
    }

    if (shop.whatsapp_number) {
      let phone = shop.whatsapp_number.replace(/[^\d+]/g, '');
      if (!phone.startsWith('+')) {
        phone = phone.startsWith('234') ? `+${phone}` : `+234${phone.replace(/^0+/, '')}`;
      }
      jsonLd.telephone = phone;
      jsonLd.sameAs = [`https://wa.me/${phone.replace('+', '')}`];
    }

    // Add brand, isPartOf, potentialAction
    jsonLd.brand = { "@type": "Brand", "name": shop.shop_name };
    jsonLd.isPartOf = { "@type": "WebSite", "name": "SteerSolo", "url": SITE_URL };
    jsonLd.potentialAction = {
      "@type": "SearchAction",
      "target": `${shopUrl}?search={search_term}`,
      "query-input": "required name=search_term"
    };
    if (shop.whatsapp_number) {
      jsonLd.contactPoint = {
        "@type": "ContactPoint",
        "telephone": jsonLd.telephone,
        "contactType": "customer service",
        "availableLanguage": ["English"]
      };
    }

    // Price range
    if (shopProducts.length > 0) {
      const prices = shopProducts.map(p => p.price).filter(Boolean);
      if (prices.length > 0) {
        const minP = Math.min(...prices);
        const maxP = Math.max(...prices);
        jsonLd.priceRange = `₦${minP.toLocaleString()} - ₦${maxP.toLocaleString()}`;
      }
    }

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

    // Individual Product schemas — more for premium shops
    const productLimit = isPremium ? 20 : 10;
    const productSchemas = shopProducts.slice(0, productLimit).map(p => {
      const schema: any = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": p.name,
        "description": p.description || `${p.name} available at ${shop.shop_name}`,
        "image": p.image_url || DEFAULT_IMAGE,
        "url": `${shopUrl}/product/${p.id}`,
        "brand": { "@type": "Brand", "name": shop.shop_name },
        "offers": {
          "@type": "Offer",
          "price": p.price,
          "priceCurrency": "NGN",
          "availability": "https://schema.org/InStock",
          "seller": { "@type": "Organization", "name": shop.shop_name, "url": shopUrl }
        }
      };
      // Add aggregate rating per product
      if (p.average_rating && p.total_reviews) {
        schema.aggregateRating = {
          "@type": "AggregateRating",
          "ratingValue": p.average_rating,
          "reviewCount": p.total_reviews
        };
      }
      return schema;
    });

    // WebPage schema
    const webPageSchema = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": shop.shop_name,
      "url": shopUrl,
      "isPartOf": { "@type": "WebSite", "name": "SteerSolo", "url": SITE_URL },
      "about": { "@type": "Store", "@id": shopUrl }
    };

    // Breadcrumb schema
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "SteerSolo", "item": SITE_URL },
        { "@type": "ListItem", "position": 2, "name": "Shops", "item": `${SITE_URL}/shops` },
        { "@type": "ListItem", "position": 3, "name": shop.shop_name, "item": shopUrl }
      ]
    };
    
    const allSchemas = [jsonLd, breadcrumbSchema, ...productSchemas, webPageSchema];
    
    const locationText = [shop.state, shop.country].filter(Boolean).join(', ');
    
    const titleTag = `${shopName} — Shop Online | SteerSolo`;
    
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <title>${titleTag}</title>
  <meta name="description" content="${description}" />
  <meta name="keywords" content="${escapeHtml(keywordsMeta)}" />
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
  <link rel="canonical" href="${shopUrl}" />
  <meta property="og:title" content="${shopName}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:url" content="${shopUrl}" />
  <meta property="og:type" content="business.business" />
  <meta property="og:site_name" content="SteerSolo" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${shopName}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${imageUrl}" />
  <script type="application/ld+json">${JSON.stringify(allSchemas)}</script>
  <meta http-equiv="refresh" content="0;url=${shopUrl}">
  <style>
    :root {
      --bg: #09090b;
      --card: #18181b;
      --border: rgba(255,255,255,0.08);
      --primary: #a1a1aa;
      --foreground: #f4f4f5;
      --accent: #10b981;
    }
    body {
      background-color: var(--bg);
      color: var(--foreground);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 2rem 1rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      box-sizing: border-box;
    }
    .card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 24px;
      padding: 2.5rem 2rem;
      max-width: 500px;
      width: 100%;
      box-shadow: 0 20px 40px rgba(0,0,0,0.3);
      text-align: center;
    }
    .logo {
      width: 90px;
      height: 90px;
      border-radius: 24px;
      object-fit: cover;
      margin: 0 auto 1.5rem auto;
      border: 2px solid var(--border);
      display: block;
    }
    h1 {
      font-size: 1.75rem;
      font-weight: 800;
      margin: 0 0 0.5rem 0;
      letter-spacing: -0.025em;
    }
    p {
      color: var(--primary);
      font-size: 0.95rem;
      line-height: 1.5;
      margin: 0 0 1.5rem 0;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      background: rgba(16, 185, 129, 0.1);
      color: var(--accent);
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      font-size: 0.8rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
      border: 1px solid rgba(16, 185, 129, 0.2);
    }
    .stats-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
      padding: 0.75rem 0;
      font-size: 0.85rem;
      color: var(--primary);
    }
    .stats-item strong {
      color: var(--foreground);
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: var(--foreground);
      color: var(--bg);
      font-weight: 600;
      text-decoration: none;
      padding: 0.75rem 1.5rem;
      border-radius: 14px;
      width: 100%;
      box-sizing: border-box;
    }
    .redirect-msg {
      margin-top: 1.5rem;
      font-size: 0.85rem;
      color: var(--primary);
    }
    .products-preview {
      margin-top: 2rem;
      text-align: left;
      border-top: 1px solid var(--border);
      padding-top: 1.5rem;
    }
    .products-preview h2 {
      font-size: 1rem;
      margin: 0 0 1rem 0;
      font-weight: 700;
      color: var(--foreground);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .prod-item {
      display: flex;
      align-items: center;
      justify-content: justify;
      gap: 1rem;
      margin-bottom: 1rem;
      font-size: 0.9rem;
    }
    .prod-item img {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      object-fit: cover;
      border: 1px solid var(--border);
    }
    .prod-info {
      flex: 1;
    }
    .prod-name {
      font-weight: 600;
      color: var(--foreground);
      margin-bottom: 0.15rem;
    }
    .prod-price {
      color: var(--accent);
      font-weight: 700;
    }
  </style>
</head>
<body>
  <div class="card">
    <img src="${imageUrl}" alt="${shopName}" class="logo" />
    <div>
      <span class="badge">${isPremium ? 'Premium Store' : 'Verified Store'}</span>
    </div>
    <h1>${shopName}</h1>
    <p>${description}</p>
    <div class="stats-row">
      ${locationText ? `<div class="stats-item">📍 ${escapeHtml(locationText)}</div>` : ''}
      ${shop.average_rating ? `<div class="stats-item">⭐ <strong>${shop.average_rating.toFixed(1)}</strong> (${shop.total_reviews})</div>` : ''}
    </div>
    <a href="${shopUrl}" class="btn">Visit Storefront</a>
    
    ${shopProducts.length > 0 ? `
    <div class="products-preview">
      <h2>Catalog Highlights</h2>
      ${shopProducts.slice(0, 3).map(p => `
      <div class="prod-item">
        ${p.image_url ? `<img src="${p.image_url}" alt="${escapeHtml(p.name)}" />` : ''}
        <div class="prod-info">
          <div class="prod-name">${escapeHtml(p.name)}</div>
          <div class="prod-price">${formatPrice(p.price)}</div>
        </div>
      </div>
      `).join('')}
    </div>
    ` : ''}
    
    <div class="redirect-msg">Redirecting to ${shopName} in seconds...</div>
  </div>
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
