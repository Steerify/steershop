import { supabase } from '@/integrations/supabase/client';

export const storeFollowService = {
  toggle: async (shopId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Login required');

    const { data: existing } = await supabase
      .from('store_follows')
      .select('id')
      .eq('user_id', user.id)
      .eq('shop_id', shopId)
      .maybeSingle();

    if (existing) {
      await supabase.from('store_follows').delete().eq('id', existing.id);
      return false;
    } else {
      await supabase.from('store_follows').insert({ user_id: user.id, shop_id: shopId });
      return true;
    }
  },

  isFollowing: async (shopId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data } = await supabase
      .from('store_follows')
      .select('id')
      .eq('user_id', user.id)
      .eq('shop_id', shopId)
      .maybeSingle();

    return !!data;
  },
};
