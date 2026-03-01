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
  const productName = escapeHtml(product.name || 'Product');
  const description = escapeHtml(product.description || `${product.name} available at ${shop.shop_name} on SteerSolo`);
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
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${productName} - ${shopName}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${imageUrl}" />
  <script type="application/ld+json">${JSON.stringify([productSchema, breadcrumbSchema])}</script>
  <meta http-equiv="refresh" content="0;url=${productUrl}">
</head>
<body>
  <nav aria-label="breadcrumb">
    <ol>
      <li><a href="${SITE_URL}">SteerSolo</a></li>
      <li><a href="${SITE_URL}/shops">Shops</a></li>
      <li><a href="${shopUrl}">${shopName}</a></li>
      <li>${productName}</li>
    </ol>
  </nav>
  <main>
    <article>
      <h1>${productName}</h1>
      ${product.image_url ? `<img src="${product.image_url}" alt="${productName}" />` : ''}
      <p>${description}</p>
      <p><strong>Price:</strong> ${formatPrice(product.price)}</p>
      <p><strong>Availability:</strong> ${product.is_available ? 'In Stock' : 'Out of Stock'}</p>
      ${product.category ? `<p><strong>Category:</strong> ${escapeHtml(product.category)}</p>` : ''}
      <p><strong>Sold by:</strong> <a href="${shopUrl}">${shopName}</a></p>
      ${product.average_rating ? `<p><strong>Rating:</strong> ${product.average_rating}/5 (${product.total_reviews} reviews)</p>` : ''}
    </article>
  </main>
  <p>Redirecting to ${productName}...</p>
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
      .select('id, shop_name, description, logo_url, banner_url, whatsapp_number, average_rating, total_reviews, state, country')
      .eq('shop_slug', slug)
      .eq('is_active', true)
      .single();
    
    if (error || !shop) {
      console.log("Shop not found for slug:", slug);
      return generateDefaultHTML();
    }

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
      // Fall through to shop page if product not found
    }

    // Fetch products for shop page
    const { data: prods } = await supabase
      .from('products')
      .select('id, name, description, price, image_url, category')
      .eq('shop_id', shop.id)
      .eq('is_available', true)
      .limit(20);
    const shopProducts = prods || [];
    
    const shopName = escapeHtml(shop.shop_name || 'Shop');
    const description = escapeHtml(shop.description || `Shop at ${shopName} on SteerSolo`);
    const imageUrl = shop.logo_url || shop.banner_url || DEFAULT_IMAGE;

    const categories = [...new Set(shopProducts.map(p => p.category).filter(Boolean))];
    const keywordsMeta = [shopName, ...(categories.length ? categories : ['online shop']), 'SteerSolo', 'Nigeria', shop.state || ''].filter(Boolean).join(', ');

    // LocalBusiness JSON-LD
    const jsonLd: any = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
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

    // Individual Product schemas
    const productSchemas = shopProducts.slice(0, 10).map(p => ({
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
    }));

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
    
    const allSchemas = [jsonLd, breadcrumbSchema, ...productSchemas];
    
    const locationText = [shop.state, shop.country].filter(Boolean).join(', ');
    
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <title>${shopName} | SteerSolo</title>
  <meta name="description" content="${description}" />
  <meta name="keywords" content="${escapeHtml(keywordsMeta)}" />
  <meta name="robots" content="index, follow" />
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
  <script type="application/ld+json">${JSON.stringify(allSchemas)}</script>
  <meta http-equiv="refresh" content="0;url=${shopUrl}">
</head>
<body>
  <nav aria-label="breadcrumb">
    <ol>
      <li><a href="${SITE_URL}">SteerSolo</a></li>
      <li><a href="${SITE_URL}/shops">Shops</a></li>
      <li>${shopName}</li>
    </ol>
  </nav>
  <main>
    <header>
      <h1>${shopName}</h1>
      <p>${description}</p>
      ${locationText ? `<p><strong>Location:</strong> ${escapeHtml(locationText)}</p>` : ''}
      ${shop.average_rating && shop.total_reviews ? `<p><strong>Rating:</strong> ${shop.average_rating}/5 (${shop.total_reviews} reviews)</p>` : ''}
      ${categories.length > 0 ? `<p><strong>Categories:</strong> ${categories.map(c => escapeHtml(c)).join(', ')}</p>` : ''}
    </header>
    <section>
      <h2>Products</h2>
      ${shopProducts.map(p => `<article>
        <h3><a href="${shopUrl}/product/${p.id}">${escapeHtml(p.name)}</a></h3>
        ${p.image_url ? `<img src="${p.image_url}" alt="${escapeHtml(p.name)}" />` : ''}
        ${p.description ? `<p>${escapeHtml(p.description)}</p>` : ''}
        <p><strong>Price:</strong> ${formatPrice(p.price)}</p>
        ${p.category ? `<p><strong>Category:</strong> ${escapeHtml(p.category)}</p>` : ''}
      </article>`).join('\n      ')}
    </section>
  </main>
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
