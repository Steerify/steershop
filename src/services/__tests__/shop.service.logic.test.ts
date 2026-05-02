import { describe, it, expect, vi, beforeEach } from "vitest";
import shopService from "../shop.service";
import { supabase } from "@/integrations/supabase/client";

// Mock Supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(),
    auth: { getUser: vi.fn() }
  },
}));

describe("shopService Logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getShops readiness filter", () => {
    it("filters out shops without products or payment info", async () => {
      const mockShops = [
        { id: "shop-ready", shop_name: "Ready Shop", payment_method: "bank_transfer", bank_name: "X", bank_account_name: "Y", bank_account_number: "Z", is_active: true },
        { id: "shop-no-payment", shop_name: "No Payment", is_active: true },
        { id: "shop-no-products", shop_name: "No Products", payment_method: "paystack", paystack_public_key: "key", is_active: true },
      ];

      const mockProducts = [
        { shop_id: "shop-ready", image_url: "img1.jpg" },
        { shop_id: "shop-no-payment", image_url: "img2.jpg" },
      ];

      // Setup the complex query chain for getShops
      (supabase.from as any).mockImplementation((table: string) => {
        if (table === "shops") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            range: vi.fn().mockResolvedValue({ data: mockShops, error: null, count: 3 }),
          };
        }
        if (table === "products") {
          return {
            select: vi.fn().mockReturnThis(),
            in: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            not: vi.fn().mockResolvedValue({ data: mockProducts, error: null }),
          };
        }
      });

      const result = await shopService.getShops();

      expect(result.success).toBe(true);
      // Only "Ready Shop" should remain
      // shop-no-payment is filtered because hasCompletePaymentSetup fails
      // shop-no-products is filtered because it's not in the mockProducts list
      expect(result.data.length).toBe(1);
      expect(result.data[0].name).toBe("Ready Shop");
    });
  });
});
