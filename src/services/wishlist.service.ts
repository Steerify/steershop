import { supabase } from '@/integrations/supabase/client';

export const wishlistService = {
  toggle: async (productId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Login required');

    const { data: existing } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .maybeSingle();

    if (existing) {
      await supabase.from('wishlists').delete().eq('id', existing.id);
      return false;
    } else {
      await supabase.from('wishlists').insert({ user_id: user.id, product_id: productId });
      return true;
    }
  },

  isInWishlist: async (productId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .maybeSingle();

    return !!data;
  },

  getWishlist: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Login required');

    const { data, error } = await supabase
      .from('wishlists')
      .select('id, product_id, created_at, products:product_id(id, name, price, image_url, stock_quantity, is_available, shops:shop_id(shop_name, shop_slug))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },
};
