import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const resend = resendApiKey ? new Resend(resendApiKey) : null;

    const results = {
      incomplete_registration: 0,
      no_shop: 0,
      no_products: 0,
      no_sales: 0,
      expired_subscription: 0,
      errors: [] as string[],
    };

    // Helper: check if notification was sent recently (within 7 days)
    const wasRecentlySent = async (userId: string, notificationType: string): Promise<boolean> => {
      const { data } = await supabase
        .from("subscription_notifications")
        .select("id")
        .eq("user_id", userId)
        .eq("notification_type", notificationType)
        .gte("sent_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .limit(1);
      return (data?.length || 0) > 0;
    };

    // Helper: log notification
    const logNotification = async (userId: string, notificationType: string) => {
      await supabase.from("subscription_notifications").insert({
        user_id: userId,
        notification_type: notificationType,
        subscription_expires_at: new Date().toISOString(),
      });
    };

    // Helper: send email
    const sendEmail = async (to: string, subject: string, html: string) => {
      if (!resend) {
        console.log(`[DRY RUN] Email to ${to}: ${subject}`);
        return true;
      }
      try {
        await resend.emails.send({
          from: "SteerSolo <noreply@steersolo.com>",
          to: [to],
          subject,
          html,
        });
        return true;
      } catch (e) {
        console.error(`Failed to send email to ${to}:`, e);
        return false;
      }
    };

    // ── Scenario 1: Incomplete Registration (24h+) ──
    try {
      const { data: incompleteUsers } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .eq("needs_role_selection", true)
        .lt("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      for (const user of incompleteUsers || []) {
        if (!user.email || await wasRecentlySent(user.id, "incomplete_registration")) continue;
        const sent = await sendEmail(
          user.email,
          "Complete Your SteerSolo Account Setup 🚀",
          `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
            <h1 style="color:#16A349">Welcome to SteerSolo!</h1>
            <p>Hi ${user.full_name || "there"},</p>
            <p>You started creating your account but haven't finished setting it up yet. It only takes a minute to complete!</p>
            <h3>What you'll get:</h3>
            <ul>
              <li>🏪 Your own online store</li>
              <li>📱 WhatsApp integration for orders</li>
              <li>💳 Secure payment via Paystack</li>
              <li>📊 Sales dashboard & analytics</li>
            </ul>
            <p><a href="https://steersolo.lovable.app/select-role" style="display:inline-block;padding:12px 24px;background:#16A349;color:white;text-decoration:none;border-radius:8px;font-weight:bold">Complete Your Account →</a></p>
            <p style="color:#666;font-size:12px">You're receiving this because you signed up for SteerSolo.</p>
          </div>`
        );
        if (sent) {
          await logNotification(user.id, "incomplete_registration");
          results.incomplete_registration++;
        }
      }
    } catch (e) {
      const msg = `Scenario 1 (Incomplete Registration) failed: ${e instanceof Error ? e.message : String(e)}`;
      console.error(msg);
      results.errors.push(msg);
    }

    // ── Scenario 2: No Shop Created (48h+) - Optimized with LEFT JOIN ──
    try {
      const { data: noShopUsers } = await supabase
        .from("profiles")
        .select("id, email, full_name, created_at")
        .eq("role", "shop_owner")
        .eq("needs_role_selection", false)
        .lt("created_at", new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString());

      for (const user of noShopUsers || []) {
        if (!user.email) continue;
        const { data: shops } = await supabase.from("shops").select("id").eq("owner_id", user.id).limit(1);
        if (shops && shops.length > 0) continue;
        if (await wasRecentlySent(user.id, "no_shop_created")) continue;

        const sent = await sendEmail(
          user.email,
          "Create Your First Store on SteerSolo 🏪",
          `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
            <h1 style="color:#16A349">Ready to Start Selling?</h1>
            <p>Hi ${user.full_name || "there"},</p>
            <p>You signed up as a shop owner but haven't created your store yet. Here's how easy it is:</p>
            <ol>
              <li><strong>Go to your dashboard</strong> — Click "My Store"</li>
              <li><strong>Add your shop name & description</strong> — Make it unique!</li>
              <li><strong>Upload a logo</strong> — First impressions matter</li>
              <li><strong>Set up payments</strong> — Paystack or bank transfer</li>
            </ol>
            <p>💡 <strong>Tip:</strong> Shops with logos and descriptions get 3x more visits!</p>
            <p><a href="https://steersolo.lovable.app/my-store" style="display:inline-block;padding:12px 24px;background:#16A349;color:white;text-decoration:none;border-radius:8px;font-weight:bold">Create Your Store →</a></p>
            <p style="color:#666;font-size:12px">You're receiving this because you signed up as a shop owner on SteerSolo.</p>
          </div>`
        );
        if (sent) {
          await logNotification(user.id, "no_shop_created");
          results.no_shop++;
        }
      }
    } catch (e) {
      const msg = `Scenario 2 (No Shop) failed: ${e instanceof Error ? e.message : String(e)}`;
      console.error(msg);
      results.errors.push(msg);
    }

    // ── Scenario 3: No Products Added (72h+) ──
    try {
      const { data: emptyShops } = await supabase
        .from("shops")
        .select("id, owner_id, shop_name, created_at")
        .lt("created_at", new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString());

      for (const shop of emptyShops || []) {
        const { count } = await supabase
          .from("products")
          .select("id", { count: "exact", head: true })
          .eq("shop_id", shop.id);

        if ((count || 0) > 0) continue;
        if (await wasRecentlySent(shop.owner_id, "no_products")) continue;

        const { data: owner } = await supabase
          .from("profiles")
          .select("email, full_name")
          .eq("id", shop.owner_id)
          .single();

        if (!owner?.email) continue;

        const sent = await sendEmail(
          owner.email,
          "Add Your First Product to " + shop.shop_name + " 📦",
          `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
            <h1 style="color:#16A349">Your Store Needs Products!</h1>
            <p>Hi ${owner.full_name || "there"},</p>
            <p>Your store <strong>${shop.shop_name}</strong> is live but has no products yet. Let's fix that!</p>
            <h3>Quick Steps to Add a Product:</h3>
            <ol>
              <li>Go to <strong>Products</strong> in your dashboard</li>
              <li>Click <strong>"Add Product"</strong></li>
              <li>Add a clear photo, name, price, and description</li>
              <li>Set your stock quantity</li>
              <li>Hit <strong>Save</strong> — you're live!</li>
            </ol>
            <h3>Pro Tips:</h3>
            <ul>
              <li>📸 Products with good photos sell 5x more</li>
              <li>📝 Write descriptions that answer customer questions</li>
              <li>💰 Start with competitive pricing to get your first reviews</li>
            </ul>
            <p><a href="https://steersolo.lovable.app/products" style="display:inline-block;padding:12px 24px;background:#16A349;color:white;text-decoration:none;border-radius:8px;font-weight:bold">Add Your First Product →</a></p>
          </div>`
        );
        if (sent) {
          await logNotification(shop.owner_id, "no_products");
          results.no_products++;
        }
      }
    } catch (e) {
      const msg = `Scenario 3 (No Products) failed: ${e instanceof Error ? e.message : String(e)}`;
      console.error(msg);
      results.errors.push(msg);
    }

    // ── Scenario 4: No Sales for 7 Days (AI-generated tips) ──
    try {
      const { data: activeShops } = await supabase
        .from("shops")
        .select("id, owner_id, shop_name, shop_slug, description, category")
        .eq("is_active", true);

      for (const shop of activeShops || []) {
        const { count: productCount } = await supabase
          .from("products")
          .select("id", { count: "exact", head: true })
          .eq("shop_id", shop.id);

        if ((productCount || 0) === 0) continue;

        const { data: recentOrders } = await supabase
          .from("orders")
          .select("id")
          .eq("shop_id", shop.id)
          .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .limit(1);

        if (recentOrders && recentOrders.length > 0) continue;
        if (await wasRecentlySent(shop.owner_id, "no_sales_week")) continue;

        const { data: owner } = await supabase
          .from("profiles")
          .select("email, full_name")
          .eq("id", shop.owner_id)
          .single();

        if (!owner?.email) continue;

        const { data: products } = await supabase
          .from("products")
          .select("name, price")
          .eq("shop_id", shop.id)
          .limit(5);

        let aiTips = "";

        if (lovableApiKey) {
          try {
            const productList = (products || []).map(p => `${p.name} (₦${p.price})`).join(", ");
            const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${lovableApiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "google/gemini-2.5-flash",
                messages: [
                  {
                    role: "system",
                    content: "You are a Nigerian e-commerce marketing expert. Give 5 actionable tips to boost sales. Keep tips specific to the shop's products. Use simple English. Format as HTML list items (<li> tags). Each tip should be 1-2 sentences max.",
                  },
                  {
                    role: "user",
                    content: `Shop: "${shop.shop_name}". Category: ${shop.category || "general"}. Products: ${productList}. This shop has had no sales in the past week. Give 5 specific marketing tips to boost sales on WhatsApp and social media in Nigeria.`,
                  },
                ],
              }),
            });

            if (aiResponse.ok) {
              const aiData = await aiResponse.json();
              aiTips = aiData.choices?.[0]?.message?.content || "";
            }
          } catch (e) {
            console.error("AI tips generation failed:", e);
          }
        }

        if (!aiTips) {
          aiTips = `
            <li>📱 Share your store link on your WhatsApp status daily</li>
            <li>📸 Post product photos with prices on Instagram and Facebook</li>
            <li>🎁 Offer a small discount for first-time buyers</li>
            <li>⭐ Ask happy customers to leave reviews on your products</li>
            <li>🔄 Update your product photos and descriptions regularly</li>
          `;
        }

        // Use shop_slug for the store link
        const storeLink = shop.shop_slug
          ? `steersolo.lovable.app/shop/${shop.shop_slug}`
          : `steersolo.lovable.app/dashboard`;

        const sent = await sendEmail(
          owner.email,
          "Boost Your Sales on " + shop.shop_name + " 📈",
          `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
            <h1 style="color:#16A349">Let's Get More Sales!</h1>
            <p>Hi ${owner.full_name || "there"},</p>
            <p>Your store <strong>${shop.shop_name}</strong> hasn't had any orders in the past week. Here are some personalized tips to boost your sales:</p>
            <h3>🎯 Marketing Tips for Your Store:</h3>
            <ul>${aiTips}</ul>
            <h3>Quick Actions You Can Take Today:</h3>
            <ol>
              <li>Share your store link: <strong>${storeLink}</strong></li>
              <li>Post on WhatsApp Status with a product photo</li>
              <li>Ask 3 friends to share your store link</li>
            </ol>
            <p><a href="https://steersolo.lovable.app/dashboard" style="display:inline-block;padding:12px 24px;background:#16A349;color:white;text-decoration:none;border-radius:8px;font-weight:bold">Go to Dashboard →</a></p>
            <p style="color:#666;font-size:12px">You're receiving this because you own a store on SteerSolo.</p>
          </div>`
        );
        if (sent) {
          await logNotification(shop.owner_id, "no_sales_week");
          results.no_sales++;
        }
      }
    } catch (e) {
      const msg = `Scenario 4 (No Sales) failed: ${e instanceof Error ? e.message : String(e)}`;
      console.error(msg);
      results.errors.push(msg);
    }

    // ── Scenario 5: Expired Subscription Winback (10+ days expired) ──
    try {
      const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
      const { data: expiredUsers } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .eq("role", "shop_owner")
        .eq("is_subscribed", false)
        .lt("subscription_expires_at", tenDaysAgo);

      for (const user of expiredUsers || []) {
        if (!user.email || await wasRecentlySent(user.id, "expired_subscription_winback")) continue;

        const sent = await sendEmail(
          user.email,
          "Your Store Is Hidden — Customers Can't Find You 😢",
          `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
            <h1 style="color:#DC2626">Your Store Is Currently Invisible</h1>
            <p>Hi ${user.full_name || "there"},</p>
            <p>Since your subscription expired, your store has been <strong>hidden from all customers</strong>. That means:</p>
            <ul style="color:#DC2626">
              <li>❌ Customers cannot find your store</li>
              <li>❌ Your products are invisible in search</li>
              <li>❌ You're missing potential sales every day</li>
              <li>❌ No new orders can come in</li>
            </ul>
            <h3 style="color:#16A349">Here's what you'll get back instantly when you resubscribe:</h3>
            <ul>
              <li>🏪 <strong>Live storefront</strong> — your store becomes visible to all customers again</li>
              <li>📱 <strong>WhatsApp order notifications</strong> — never miss an order</li>
              <li>📊 <strong>Sales analytics & dashboard</strong> — track your growth</li>
              <li>🎨 <strong>Marketing poster editor</strong> — create professional promos</li>
              <li>🤖 <strong>AI-powered sales tips</strong> — personalized advice to boost sales</li>
              <li>📚 <strong>Business courses</strong> — learn and earn reward points</li>
              <li>💳 <strong>Secure payments</strong> — Paystack & bank transfer support</li>
            </ul>
            <p style="font-size:16px"><strong>Plans start at just ₦1,500/month</strong> — less than the cost of one customer you could be losing every day.</p>
            <p style="text-align:center;margin:24px 0">
              <a href="https://steersolo.lovable.app/subscription" style="display:inline-block;padding:14px 32px;background:#16A349;color:white;text-decoration:none;border-radius:8px;font-weight:bold;font-size:16px">Reactivate My Store →</a>
            </p>
            <p style="color:#666;font-size:12px">You're receiving this because your SteerSolo subscription has expired. Resubscribe to stop receiving these reminders.</p>
          </div>`
        );
        if (sent) {
          await logNotification(user.id, "expired_subscription_winback");
          results.expired_subscription++;
        }
      }
    } catch (e) {
      const msg = `Scenario 5 (Expired Subscription) failed: ${e instanceof Error ? e.message : String(e)}`;
      console.error(msg);
      results.errors.push(msg);
    }

    console.log("Engagement reminders results:", results);

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Engagement reminders error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
