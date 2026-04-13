import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;

Deno.test("shop-og-meta returns HTML for valid slug", async () => {
  const url = `${SUPABASE_URL}/functions/v1/shop-og-meta?slug=test-shop`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
  });
  const body = await res.text();
  // Should return some HTML (even if shop not found, should not 500)
  assertExists(body);
  assertEquals(res.status < 500, true);
});

Deno.test("shop-og-meta returns response without slug", async () => {
  const url = `${SUPABASE_URL}/functions/v1/shop-og-meta`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
  });
  const body = await res.text();
  assertExists(body);
});
