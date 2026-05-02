import { describe, it, expect, vi, beforeEach } from "vitest";
import productService from "../product.service";
import { supabase } from "@/integrations/supabase/client";

// Mock Supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe("productService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getProductById", () => {
    it("fetches and maps a product correctly", async () => {
      const mockProduct = {
        id: "prod-123",
        shop_id: "shop-123",
        name: "Test Product",
        description: "Test Desc",
        price: 1500,
        stock_quantity: 50,
        image_url: "http://example.com/img.jpg",
        is_available: true,
      };

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockProduct, error: null }),
          }),
        }),
      });

      const result = await productService.getProductById("prod-123");

      expect(result.success).toBe(true);
      expect(result.data.id).toBe("prod-123");
      expect(result.data.price).toBe(1500);
      expect(result.data.images[0].url).toBe("http://example.com/img.jpg");
    });

    it("throws error if product is not found", async () => {
      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: { message: "JSON object requested, multiple (or no) rows returned" } }),
          }),
        }),
      });

      await expect(productService.getProductById("invalid-id")).rejects.toThrow();
    });
  });

  describe("getProducts", () => {
    it("applies is_available filter by default", async () => {
      const mockProducts = [{ id: "p1", name: "P1", price: 10, stock_quantity: 5 }];

      const chain = {
        eq: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        then: vi.fn().mockImplementation((callback) => {
          return Promise.resolve({ data: mockProducts, error: null, count: 1 }).then(callback);
        }),
      };

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue(chain),
      });

      await productService.getProducts({ shopId: "shop-1" });

      // Should have been called with is_available = true
      expect(chain.eq).toHaveBeenCalledWith("is_available", true);
      expect(chain.eq).toHaveBeenCalledWith("shop_id", "shop-1");
    });
  });
});
