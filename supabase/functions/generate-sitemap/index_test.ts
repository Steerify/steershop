import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;

Deno.test("generate-sitemap returns valid XML", async () => {
  const url = `${SUPABASE_URL}/functions/v1/generate-sitemap`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
  });
  const body = await res.text();
  assertExists(body);
  assertEquals(body.includes("<?xml"), true);
  assertEquals(body.includes("<urlset"), true);
});
