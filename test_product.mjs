import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = "https://hwkcqgmtinbgyjjgcgmp.supabase.co";
const supabaseKey  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3a2NxZ210aW5iZ3lqamdjZ21wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2Mzg2NDMsImV4cCI6MjA3ODIxNDY0M30.DteckGKDVYtq-fwPn24qgas0qg9CKOswAPkZuigre2U";
const supabase = createClient(supabaseUrl, supabaseKey);

// ── helpers ───────────────────────────────────────────────────────────────────
function rand() { return Date.now(); }

async function run() {
  const email    = `vendor_verify_${rand()}@steershoptest.com`;
  const password = `StrongV3nd0r!${rand()}`;

  // 1. Sign up as shop_owner
  console.log("1. Signing up vendor…");
  const { data: authData, error: signupErr } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: "Test Vendor", role: "shop_owner" } },
  });
  if (signupErr) { console.error("   ✗ Signup:", signupErr.message); return; }
  console.log("   ✓ User ID:", authData.user?.id);

  // 2. Small delay for trigger to complete
  await new Promise(r => setTimeout(r, 1500));

  // 3. Create shop
  console.log("2. Creating shop…");
  const slug = `test-shop-${rand()}`;
  const { data: shop, error: shopErr } = await supabase
    .from('shops')
    .insert({ owner_id: authData.user?.id, shop_name: 'Test Shop', shop_slug: slug, is_active: true })
    .select()
    .single();
  if (shopErr) { console.error("   ✗ Shop:", shopErr.message); return; }
  console.log("   ✓ Shop ID:", shop.id);

  // 4. Create product — this is the failing step we're fixing
  console.log("3. Creating product…");
  const { data: product, error: productErr } = await supabase
    .from('products')
    .insert({
      shop_id:        shop.id,
      name:           'Test Product',
      description:    'Test Description',
      price:          1000,
      stock_quantity: 10,
      type:           'product',
      is_available:   true,
      category:       'general',
      stock_unit:     'units',
    })
    .select()
    .single();

  if (productErr) {
    console.error("   ✗ Product INSERT failed:", productErr.message);
    console.log("\n  ⚠  Migration NOT yet applied to remote DB.");
    console.log("     Apply it via: Supabase Dashboard → SQL Editor → paste migration file.");
  } else {
    console.log("   ✓ Product ID:", product.id);
    console.log("\n  ✅ Products RLS is working correctly!");
  }
}

run();
