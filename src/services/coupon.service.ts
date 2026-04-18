import { supabase } from '@/integrations/supabase/client';

export interface CouponData {
  shop_id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount?: number;
  max_uses?: number;
  valid_from?: string;
  valid_until?: string;
}

type CouponValidationInput = {
  discount_type: 'percentage' | 'fixed';
  discount_value: number | string;
  min_order_amount?: number | string | null;
  max_uses?: number | null;
  used_count?: number | null;
  valid_from?: string | null;
  valid_until?: string | null;
};

export const calculateCouponDiscount = (coupon: CouponValidationInput, orderTotal: number) => {
  const now = new Date();
  if (coupon.valid_from && new Date(coupon.valid_from) > now) {
    return { valid: false, error: 'Coupon is not active yet', discount: 0 };
  }
  if (coupon.valid_until && new Date(coupon.valid_until) < now) {
    return { valid: false, error: 'Coupon expired', discount: 0 };
  }
  if (coupon.max_uses && (coupon.used_count || 0) >= coupon.max_uses) {
    return { valid: false, error: 'Coupon fully redeemed', discount: 0 };
  }
  if (coupon.min_order_amount && orderTotal < Number(coupon.min_order_amount)) {
    return { valid: false, error: `Minimum order ₦${Number(coupon.min_order_amount).toLocaleString()}`, discount: 0 };
  }

  const rawDiscount = coupon.discount_type === 'percentage'
    ? Math.round(orderTotal * Math.min(100, Math.max(0, Number(coupon.discount_value))) / 100)
    : Math.max(0, Number(coupon.discount_value));

  return { valid: true, discount: Math.min(rawDiscount, orderTotal) };
};

export const couponService = {
  createCoupon: async (data: CouponData) => {
    const { data: coupon, error } = await supabase
      .from('shop_coupons')
      .insert({
        ...data,
        code: data.code.toUpperCase().trim(),
        is_active: true,
        used_count: 0,
      })
      .select()
      .single();

    if (error) throw error;
    return coupon;
  },

  getCoupons: async (shopId: string) => {
    const { data, error } = await supabase
      .from('shop_coupons')
      .select('*')
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  toggleCoupon: async (couponId: string, isActive: boolean) => {
    const { error } = await supabase
      .from('shop_coupons')
      .update({ is_active: isActive })
      .eq('id', couponId);

    if (error) throw error;
  },

  deleteCoupon: async (couponId: string) => {
    const { error } = await supabase
      .from('shop_coupons')
      .delete()
      .eq('id', couponId);

    if (error) throw error;
  },

  validateCoupon: async (code: string, shopId: string, orderTotal: number) => {
    const { data, error } = await supabase
      .from('shop_coupons')
      .select('*')
      .eq('shop_id', shopId)
      .eq('code', code.toUpperCase().trim())
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw error;
    if (!data) return { valid: false, error: 'Invalid coupon code', discount: 0 };
    const result = calculateCouponDiscount(data, orderTotal);
    return { ...result, coupon: result.valid ? data : undefined };
  },

  incrementUsage: async (couponId: string) => {
    const { data: coupon } = await supabase
      .from('shop_coupons')
      .select('used_count')
      .eq('id', couponId)
      .single();

    if (coupon) {
      await supabase
        .from('shop_coupons')
        .update({ used_count: (coupon.used_count || 0) + 1 })
        .eq('id', couponId);
    }
  },
};
