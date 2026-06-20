import {
  autoCategorize,
  autoCategorizeWithConfidence,
  normalizeAndCategorize,
  normalizeCategoryValue,
  isValidCategory,
  BEAUTY_SUBCATEGORIES,
} from "./autoCategorize";

describe("autoCategorize", () => {
  test("should categorize fashion stores correctly", () => {
    expect(autoCategorize("Sarah's Boutique", "Fashion clothes and shoes")).toBe("fashion");
    expect(autoCategorize("Ankara Styles", "Traditional Nigerian clothing")).toBe("fashion");
    expect(autoCategorize("Kicks Hub", "Sneakers and footwear")).toBe("fashion");
  });

  test("should categorize beauty stores correctly", () => {
    expect(autoCategorize("Glow Skincare", "Natural skincare products")).toBe("skincare");
    expect(autoCategorize("Hair Haven", "Hair extensions and wigs")).toBe("haircare");
    expect(autoCategorize("Makeup Magic", "Cosmetics and beauty products")).toBe("cosmetics");
  });

  test("should categorize food & drinks correctly", () => {
    expect(autoCategorize("Taste of Lagos", "Nigerian cuisine and dishes")).toBe("food-drinks");
    expect(autoCategorize("Fresh Juices", "Smoothies and fresh drinks")).toBe("food-drinks");
  });

  test("should fall back to 'other' for uncategorizable stores", () => {
    expect(autoCategorize("Test Store", "")).toBe("other");
    expect(autoCategorize("", "")).toBe("other");
  });

  test("should handle null/undefined inputs gracefully", () => {
    // @ts-ignore
    expect(autoCategorize(null, null)).toBe("other");
    // @ts-ignore
    expect(autoCategorize(undefined, undefined)).toBe("other");
  });
});

describe("autoCategorizeWithConfidence", () => {
  test("should return confidence score and fallback status", () => {
    const result = autoCategorizeWithConfidence("Fashion Store", "Clothing and accessories");
    expect(result.category).toBeDefined();
    expect(typeof result.confidence).toBe("number");
    expect(typeof result.isFallback).toBe("boolean");
  });

  test("should mark empty inputs as fallback", () => {
    const result = autoCategorizeWithConfidence("", "");
    expect(result.isFallback).toBe(true);
    expect(result.category).toBe("other");
  });
});

describe("normalizeAndCategorize", () => {
  test("should use provided category if valid", () => {
    expect(normalizeAndCategorize("fashion", "", "")).toBe("fashion");
    expect(normalizeAndCategorize("beauty", "", "")).toBe("beauty");
  });

  test("should fall back to auto-categorize if invalid category", () => {
    expect(normalizeAndCategorize("invalid-category", "Fashion Store", "")).toBe("fashion");
  });
});

describe("normalizeCategoryValue", () => {
  test("should normalize category names", () => {
    expect(normalizeCategoryValue("Fashion & Clothing")).toBe("fashion");
    expect(normalizeCategoryValue("food and drinks")).toBe("food-drinks");
    expect(normalizeCategoryValue("Beauty & Health")).toBe("beauty");
  });

  test("should handle null/undefined inputs", () => {
    expect(normalizeCategoryValue(null)).toBe("other");
    expect(normalizeCategoryValue(undefined)).toBe("other");
  });
});

describe("isValidCategory", () => {
  test("should validate known categories", () => {
    expect(isValidCategory("fashion")).toBe(true);
    expect(isValidCategory("beauty")).toBe(true);
    expect(isValidCategory("skincare")).toBe(true);
    expect(isValidCategory("invalid")).toBe(false);
  });

  test("should recognize beauty subcategories", () => {
    BEAUTY_SUBCATEGORIES.forEach(cat => {
      expect(isValidCategory(cat)).toBe(true);
    });
  });
});
