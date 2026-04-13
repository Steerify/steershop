import { describe, it, expect } from "vitest";
import { calculateSubscriptionStatus, canAccessShopFeatures } from "../subscription";

describe("calculateSubscriptionStatus", () => {
  it("returns expired for null profile", () => {
    const result = calculateSubscriptionStatus(null);
    expect(result).toEqual({ status: "expired", daysRemaining: 0 });
  });

  it("returns active for subscribed user with future expiry", () => {
    const future = new Date();
    future.setDate(future.getDate() + 10);
    const result = calculateSubscriptionStatus({
      is_subscribed: true,
      subscription_expires_at: future.toISOString(),
    });
    expect(result.status).toBe("active");
    expect(result.daysRemaining).toBe(10);
  });

  it("returns trial for non-subscribed user with future expiry", () => {
    const future = new Date();
    future.setDate(future.getDate() + 5);
    const result = calculateSubscriptionStatus({
      is_subscribed: false,
      subscription_expires_at: future.toISOString(),
    });
    expect(result.status).toBe("trial");
    expect(result.daysRemaining).toBe(5);
  });

  it("returns free for expired user with ≤5 products", () => {
    const past = new Date();
    past.setDate(past.getDate() - 5);
    const result = calculateSubscriptionStatus(
      { is_subscribed: false, subscription_expires_at: past.toISOString() },
      3
    );
    expect(result.status).toBe("free");
  });

  it("returns expired for expired user with >5 products", () => {
    const past = new Date();
    past.setDate(past.getDate() - 5);
    const result = calculateSubscriptionStatus(
      { is_subscribed: false, subscription_expires_at: past.toISOString() },
      10
    );
    expect(result.status).toBe("expired");
  });
});

describe("canAccessShopFeatures", () => {
  it("allows active subscribers", () => {
    const future = new Date();
    future.setDate(future.getDate() + 10);
    expect(
      canAccessShopFeatures({ is_subscribed: true, subscription_expires_at: future.toISOString() })
    ).toBe(true);
  });

  it("allows trial users", () => {
    const future = new Date();
    future.setDate(future.getDate() + 5);
    expect(
      canAccessShopFeatures({ is_subscribed: false, subscription_expires_at: future.toISOString() })
    ).toBe(true);
  });

  it("blocks expired users with many products", () => {
    const past = new Date();
    past.setDate(past.getDate() - 5);
    expect(
      canAccessShopFeatures({ is_subscribed: false, subscription_expires_at: past.toISOString() }, 10)
    ).toBe(false);
  });
});
