import { supabase } from '@/integrations/supabase/client';

export interface AdminAnalytics {
  totalUsers: number;
  totalShops: number;
  activeShops: number;
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  recentOrders: any[];
}

const adminService = {
  getAnalytics: async (): Promise<AdminAnalytics> => {
    const [
      { count: totalUsers },
      { count: totalShops },
      { count: activeShops },
      { count: totalProducts },
      { count: totalOrders },
      { count: pendingOrders },
      { data: revenueData },
      { data: recentOrders }
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('shops').select('*', { count: 'exact', head: true }),
      supabase.from('shops').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('orders').select('total_amount').eq('payment_status', 'paid'),
      supabase.from('orders').select('*, order_items(*, products(*))').order('created_at', { ascending: false }).limit(10)
    ]);

    const totalRevenue = revenueData?.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0) || 0;

    return {
      totalUsers: totalUsers || 0,
      totalShops: totalShops || 0,
      activeShops: activeShops || 0,
      totalProducts: totalProducts || 0,
      totalOrders: totalOrders || 0,
      pendingOrders: pendingOrders || 0,
      totalRevenue,
      recentOrders: recentOrders || []
    };
  },

  getUsers: async (page = 1, limit = 10) => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      data: data || [],
      total: count || 0,
      page,
      limit
    };
  },

  getShops: async (page = 1, limit = 10) => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('shops')
      .select('*, profiles(full_name, email)', { count: 'exact' })
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      data: data || [],
      total: count || 0,
      page,
      limit
    };
  },

  // Get all shops with full profile data for admin management
  getAllShopsWithProfiles: async () => {
    const { data, error } = await supabase
      .from('shops')
      .select(`
        *,
        profiles:owner_id(
          id, full_name, email, phone, is_subscribed,
          subscription_expires_at, subscription_plan_id, role, created_at
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Update any shop
  updateShop: async (shopId: string, updates: Record<string, any>) => {
    const { data, error } = await supabase
      .from('shops')
      .update(updates)
      .eq('id', shopId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a shop
  deleteShop: async (shopId: string) => {
    const { error } = await supabase
      .from('shops')
      .delete()
      .eq('id', shopId);

    if (error) throw error;
    return { success: true };
  },

  // Extend user subscription
  extendSubscription: async (userId: string, days: number, adminId: string) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_expires_at')
      .eq('id', userId)
      .single();

    const now = new Date();
    let newExpiry: Date;

    if (profile?.subscription_expires_at) {
      const current = new Date(profile.subscription_expires_at);
      const base = current > now ? current : now;
      newExpiry = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
    } else {
      newExpiry = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    }

    const { error } = await supabase
      .from('profiles')
      .update({ 
        subscription_expires_at: newExpiry.toISOString(),
        is_subscribed: true 
      })
      .eq('id', userId);

    if (error) throw error;

    // Log the extension
    await supabase.from('subscription_history').insert({
      user_id: userId,
      event_type: 'admin_extension',
      new_expiry_at: newExpiry.toISOString(),
      notes: `Extended by ${days} days`,
      created_by: adminId
    });

    return { success: true, newExpiry };
  },

  getOrders: async (page = 1, limit = 10) => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('orders')
      .select('*, order_items(*, products(*)), shops(shop_name)', { count: 'exact' })
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      data: data || [],
      total: count || 0,
      page,
      limit
    };
  },

  getProducts: async (page = 1, limit = 10) => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('products')
      .select('*, shops(shop_name)', { count: 'exact' })
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      data: data || [],
      total: count || 0,
      page,
      limit
    };
  },

  // Get all products with shop info for admin management
  getAllProducts: async () => {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        shops(shop_name, shop_slug)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Update any product
  updateProduct: async (productId: string, updates: Record<string, any>) => {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', productId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete any product
  deleteProduct: async (productId: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) throw error;
    return { success: true };
  },

  updateUserRole: async (id: string, role: 'customer' | 'shop_owner' | 'admin') => {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

export default adminService;
