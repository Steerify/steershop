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
