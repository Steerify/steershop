import { describe, it, expect, vi, beforeEach } from "vitest";
import orderService from "../order.service";
import { supabase } from "@/integrations/supabase/client";

// Mock Supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn(),
    },
  },
}));

describe("orderService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createOrder", () => {
    it("calculates total amount correctly and inserts order", async () => {
      const mockUser = { id: "user-123" };
      const mockOrder = { id: "order-123", status: "pending" };

      (supabase.auth.getUser as any).mockResolvedValue({ data: { user: mockUser } });

      const fromMock = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockOrder, error: null }),
          }),
        }),
      });

      (supabase.from as any).mockImplementation((table: string) => {
        if (table === "orders") {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: mockOrder, error: null }),
              }),
            }),
          };
        }
        if (table === "order_items") {
          return {
            insert: vi.fn().mockResolvedValue({ error: null }),
          };
        }
      });

      const request = {
        shopId: "shop-123",
        items: [
          { productId: "prod-1", quantity: 2, price: 1000, name: "Item 1" },
          { productId: "prod-2", quantity: 1, price: 500, name: "Item 2" },
        ],
        customerName: "Test Customer",
        customerEmail: "test@example.com",
        customerPhone: "08012345678",
        deliveryAddress: "123 Street",
        deliveryCity: "Lagos",
        deliveryState: "Lagos",
        deliveryFee: 200,
      };

      const result = await orderService.createOrder(request);

      expect(result).toEqual({ id: "order-123", status: "pending" });
      
      // Verify total amount calculation (2*1000 + 1*500 + 200 = 2700)
      const ordersInsertCall = (supabase.from as any).mock.results[0].value.insert.mock.calls[0][0];
      expect(ordersInsertCall.total_amount).toBe(2700);
    });

    it("throws error if order insertion fails", async () => {
      (supabase.auth.getUser as any).mockResolvedValue({ data: { user: null } });
      
      (supabase.from as any).mockImplementation(() => ({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: { message: "DB Error" } }),
          }),
        }),
      }));

      await expect(orderService.createOrder({
        shopId: "shop-123",
        items: [],
        customerName: "Name",
        customerEmail: "email@test.com",
        customerPhone: "phone",
        deliveryAddress: "address",
        deliveryCity: "city",
        deliveryState: "state",
        deliveryFee: 0
      })).rejects.toThrow();
    });
  });
});
