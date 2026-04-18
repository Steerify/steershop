import { describe, expect, it } from "vitest";
import { calculateCouponDiscount } from "../coupon.service";

describe("calculateCouponDiscount", () => {
  it("applies percentage discount and caps at order total", () => {
    const result = calculateCouponDiscount(
      { discount_type: "percentage", discount_value: 15 },
      20000
    );
    expect(result.valid).toBe(true);
    expect(result.discount).toBe(3000);
  });

  it("blocks coupon before valid_from date", () => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const result = calculateCouponDiscount(
      { discount_type: "fixed", discount_value: 500, valid_from: tomorrow },
      5000
    );
    expect(result.valid).toBe(false);
    expect(result.error).toContain("not active yet");
  });

  it("blocks coupon when max uses has been reached", () => {
    const result = calculateCouponDiscount(
      { discount_type: "fixed", discount_value: 500, max_uses: 5, used_count: 5 },
      5000
    );
    expect(result.valid).toBe(false);
    expect(result.error).toContain("fully redeemed");
  });

  it("respects minimum order amount", () => {
    const result = calculateCouponDiscount(
      { discount_type: "fixed", discount_value: 800, min_order_amount: 10000 },
      2500
    );
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Minimum order");
  });
});
