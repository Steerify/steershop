/**
 * Advertising Service
 * Provides utilities for calculating advertising package prices.
 * The business requires a 30% profit margin over the base cost.
 */
export interface AdvertisingPackage {
  /** Base cost provided by the vendor (e.g., ad spend, design fee) */
  baseCost: number;
  /** Optional description of the package */
  description?: string;
}

/**
 * Calculate the final price for a given advertising package.
 * Applies a 30% profit margin to the base cost.
 * Returns a value rounded to two decimal places.
 */
export function calculatePrice(pkg: AdvertisingPackage): number {
  const margin = 0.30; // 30% profit margin
  const final = pkg.baseCost * (1 + margin);
  // Round to 2 decimal places (cents)
  return Math.round(final * 100) / 100;
}

/**
 * Example helper to format the price as a currency string.
 */
export function formatPrice(pkg: AdvertisingPackage, locale: string = 'en-GB', currency: string = 'GBP'): string {
  const price = calculatePrice(pkg);
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(price);
}
