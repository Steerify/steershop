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
    if (data.valid_until && new Date(data.valid_until) < new Date()) return { valid: false, error: 'Coupon expired', discount: 0 };
    if (data.max_uses && data.used_count >= data.max_uses) return { valid: false, error: 'Coupon fully redeemed', discount: 0 };
    if (data.min_order_amount && orderTotal < Number(data.min_order_amount)) return { valid: false, error: `Minimum order ₦${Number(data.min_order_amount).toLocaleString()}`, discount: 0 };

    const discount = data.discount_type === 'percentage'
      ? Math.round(orderTotal * Number(data.discount_value) / 100)
      : Number(data.discount_value);

    return { valid: true, discount: Math.min(discount, orderTotal), coupon: data };
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
