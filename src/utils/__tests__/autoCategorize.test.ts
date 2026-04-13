import { describe, it, expect } from "vitest";
import { autoCategorize, getCategoryLabel, isBeautyCategory } from "../autoCategorize";

describe("autoCategorize", () => {
  it("categorizes skincare products", () => {
    expect(autoCategorize("Glow Serum", "brightening face serum")).toBe("skincare");
  });

  it("categorizes haircare products", () => {
    expect(autoCategorize("Brazilian Wig", "human hair wig")).toBe("haircare");
  });

  it("categorizes fashion products", () => {
    expect(autoCategorize("Ankara Dress", "beautiful ankara fabric dress")).toBe("fashion");
  });

  it("categorizes electronics", () => {
    expect(autoCategorize("iPhone Charger", "fast charging cable for phone")).toBe("electronics");
  });

  it("categorizes food & drinks", () => {
    expect(autoCategorize("Shawarma Special", "chicken shawarma with extra sauce")).toBe("food-drinks");
  });

  it("returns other for unknown products", () => {
    expect(autoCategorize("Random Thing", "no keywords here xyz")).toBe("other");
  });

  it("handles empty inputs", () => {
    expect(autoCategorize("", "")).toBe("other");
    expect(autoCategorize()).toBe("other");
  });
});

describe("getCategoryLabel", () => {
  it("returns correct label for known categories", () => {
    expect(getCategoryLabel("skincare")).toBe("Skincare");
    expect(getCategoryLabel("fashion")).toBe("Fashion");
    expect(getCategoryLabel("food-drinks")).toBe("Food & Drinks");
  });

  it("returns Other for unknown categories", () => {
    expect(getCategoryLabel("nonexistent")).toBe("Other");
  });
});

describe("isBeautyCategory", () => {
  it("identifies beauty subcategories", () => {
    expect(isBeautyCategory("skincare")).toBe(true);
    expect(isBeautyCategory("haircare")).toBe(true);
    expect(isBeautyCategory("cosmetics")).toBe(true);
  });

  it("rejects non-beauty categories", () => {
    expect(isBeautyCategory("fashion")).toBe(false);
    expect(isBeautyCategory("electronics")).toBe(false);
  });
});
