import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CLOUDINARY_CLOUD_NAME = "dipfltl37";
const CLOUDINARY_UPLOAD_PRESET = "Steersolo";

interface MigrationResult {
  type: "shop" | "product";
  id: string;
  field: string;
  oldUrl: string;
  newUrl: string | null;
  success: boolean;
  error?: string;
}

async function uploadToCloudinary(
  imageUrl: string,
  folder: string
): Promise<string> {
  const formData = new FormData();
  formData.append("file", imageUrl);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("folder", folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Cloudinary upload failed: ${errorText}`);
  }

  const data = await response.json();
  return data.secure_url;
}

function isSupabaseStorageUrl(url: string): boolean {
  return url.includes("supabase.co/storage");
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting image migration from Supabase to Cloudinary...");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const results: MigrationResult[] = [];

    // 1. Migrate shop images (logo_url and banner_url)
    console.log("Fetching shops with Supabase storage URLs...");
    const { data: shops, error: shopsError } = await supabase
      .from("shops")
      .select("id, logo_url, banner_url");

    if (shopsError) {
      throw new Error(`Failed to fetch shops: ${shopsError.message}`);
    }

    console.log(`Found ${shops?.length || 0} shops to check`);

    for (const shop of shops || []) {
      // Migrate logo_url
      if (shop.logo_url && isSupabaseStorageUrl(shop.logo_url)) {
        console.log(`Migrating logo for shop ${shop.id}...`);
        try {
          const newUrl = await uploadToCloudinary(shop.logo_url, "shop-images");
          
          const { error: updateError } = await supabase
            .from("shops")
            .update({ logo_url: newUrl })
            .eq("id", shop.id);

          if (updateError) {
            throw new Error(updateError.message);
          }

          results.push({
            type: "shop",
            id: shop.id,
            field: "logo_url",
            oldUrl: shop.logo_url,
            newUrl,
            success: true,
          });
          console.log(`✓ Migrated logo for shop ${shop.id}`);
        } catch (error: any) {
          results.push({
            type: "shop",
            id: shop.id,
            field: "logo_url",
            oldUrl: shop.logo_url,
            newUrl: null,
            success: false,
            error: error.message,
          });
          console.error(`✗ Failed to migrate logo for shop ${shop.id}:`, error.message);
        }
      }

      // Migrate banner_url
      if (shop.banner_url && isSupabaseStorageUrl(shop.banner_url)) {
        console.log(`Migrating banner for shop ${shop.id}...`);
        try {
          const newUrl = await uploadToCloudinary(shop.banner_url, "shop-images");
          
          const { error: updateError } = await supabase
            .from("shops")
            .update({ banner_url: newUrl })
            .eq("id", shop.id);

          if (updateError) {
            throw new Error(updateError.message);
          }

          results.push({
            type: "shop",
            id: shop.id,
            field: "banner_url",
            oldUrl: shop.banner_url,
            newUrl,
            success: true,
          });
          console.log(`✓ Migrated banner for shop ${shop.id}`);
        } catch (error: any) {
          results.push({
            type: "shop",
            id: shop.id,
            field: "banner_url",
            oldUrl: shop.banner_url,
            newUrl: null,
            success: false,
            error: error.message,
          });
          console.error(`✗ Failed to migrate banner for shop ${shop.id}:`, error.message);
        }
      }
    }

    // 2. Migrate product images (image_url)
    console.log("Fetching products with Supabase storage URLs...");
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, image_url");

    if (productsError) {
      throw new Error(`Failed to fetch products: ${productsError.message}`);
    }

    console.log(`Found ${products?.length || 0} products to check`);

    for (const product of products || []) {
      if (product.image_url && isSupabaseStorageUrl(product.image_url)) {
        console.log(`Migrating image for product ${product.id}...`);
        try {
          const newUrl = await uploadToCloudinary(product.image_url, "product-images");
          
          const { error: updateError } = await supabase
            .from("products")
            .update({ image_url: newUrl })
            .eq("id", product.id);

          if (updateError) {
            throw new Error(updateError.message);
          }

          results.push({
            type: "product",
            id: product.id,
            field: "image_url",
            oldUrl: product.image_url,
            newUrl,
            success: true,
          });
          console.log(`✓ Migrated image for product ${product.id}`);
        } catch (error: any) {
          results.push({
            type: "product",
            id: product.id,
            field: "image_url",
            oldUrl: product.image_url,
            newUrl: null,
            success: false,
            error: error.message,
          });
          console.error(`✗ Failed to migrate image for product ${product.id}:`, error.message);
        }
      }
    }

    // Generate summary
    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    const summary = {
      totalProcessed: results.length,
      successCount,
      failureCount,
      results,
    };

    console.log(`Migration complete: ${successCount} success, ${failureCount} failures`);

    return new Response(JSON.stringify(summary, null, 2), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Migration error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
