import { assertEquals, assertRejects, assertExists } from "https://deno.land/std@0.190.0/testing/asserts.ts";
import { getTransporter, normalizeRecipients } from "../_shared/smtp.ts";

Deno.test("normalizeRecipients - should format single email into array", () => {
  const result = normalizeRecipients("test@example.com");
  assertEquals(result, ["test@example.com"]);
});

Deno.test("normalizeRecipients - should filter empty strings from array", () => {
  const result = normalizeRecipients(["test@example.com", "", "  ", "valid@example.com"]);
  assertEquals(result, ["test@example.com", "valid@example.com"]);
});

Deno.test("getTransporter - should throw error if no configuration is present", async () => {
  // Save old env state
  const oldResend = Deno.env.get("RESEND_API_KEY");
  const oldHost = Deno.env.get("SMTP_HOST");
  
  // Clear env
  Deno.env.delete("RESEND_API_KEY");
  Deno.env.delete("SMTP_HOST");
  Deno.env.delete("SMTP_USER");
  Deno.env.delete("SMTP_PASS");

  await assertRejects(
    async () => {
      await getTransporter();
    },
    Error,
    "No email service configured"
  );

  // Restore env state
  if (oldResend) Deno.env.set("RESEND_API_KEY", oldResend);
  if (oldHost) Deno.env.set("SMTP_HOST", oldHost);
});

Deno.test("getTransporter - should return Resend API transport when key is set", async () => {
  const oldResend = Deno.env.get("RESEND_API_KEY");
  
  // Mock Resend Key
  Deno.env.set("RESEND_API_KEY", "re_test_123456789");

  const transporter = await getTransporter();
  
  // It should return an object that has a sendMail function
  assertExists(transporter.sendMail);
  assertEquals(typeof transporter.sendMail, "function");

  // Restore
  if (oldResend) {
    Deno.env.set("RESEND_API_KEY", oldResend);
  } else {
    Deno.env.delete("RESEND_API_KEY");
  }
});
