import { supabase } from '@/integrations/supabase/client';

export interface VisitTotals {
  today: number;
  days7: number;
  days30: number;
}

export interface VisitTrendPoint {
  date: string;
  visits: number;
}

export interface TopVisitPage {
  path: string;
  visits: number;
}

export interface AdminAnalytics {
  totalUsers: number;
  totalShops: number;
  activeShops: number;
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  recentOrders: any[];
  visitTotals: VisitTotals;
  topVisitPages: TopVisitPage[];
  visitTrend: VisitTrendPoint[];
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
      { data: recentOrders },
      visitAnalyticsResponse
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('shops').select('*', { count: 'exact', head: true }),
      supabase.from('shops').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('orders').select('total_amount').eq('payment_status', 'paid'),
      supabase.from('orders').select('*, order_items(*, products(*))').order('created_at', { ascending: false }).limit(10),
      supabase.rpc('get_website_visit_analytics')
    ]);

    const totalRevenue = revenueData?.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0) || 0;

    if (visitAnalyticsResponse.error) {
      throw visitAnalyticsResponse.error;
    }

    const visitAnalytics = visitAnalyticsResponse.data as {
      totals?: VisitTotals;
      top_pages?: TopVisitPage[];
      daily?: VisitTrendPoint[];
    } | null;

    return {
      totalUsers: totalUsers || 0,
      totalShops: totalShops || 0,
      activeShops: activeShops || 0,
      totalProducts: totalProducts || 0,
      totalOrders: totalOrders || 0,
      pendingOrders: pendingOrders || 0,
      totalRevenue,
      recentOrders: recentOrders || [],
      visitTotals: {
        today: visitAnalytics?.totals?.today || 0,
        days7: visitAnalytics?.totals?.days7 || 0,
        days30: visitAnalytics?.totals?.days30 || 0,
      },
      topVisitPages: visitAnalytics?.top_pages || [],
      visitTrend: visitAnalytics?.daily || []
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
    const response = await invokeAdminMutation<{ data: any }>('admin-update-shop', {
      shop_id: shopId,
      updates,
    });

    return response.data;
  },

  // Delete a shop
  deleteShop: async (shopId: string) => {
    await invokeAdminMutation<{ success: boolean }>('admin-delete-shop', { shop_id: shopId });
    return { success: true };
  },

  // Extend user subscription
  extendSubscription: async (userId: string, days: number, _adminId: string) => {
    const response = await invokeAdminMutation<{ success: boolean; new_expiry_at: string }>('admin-set-subscription', {
      user_id: userId,
      action: 'extend_days',
      days,
    });

    return { success: response.success, newExpiry: new Date(response.new_expiry_at) };
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
    const response = await invokeAdminMutation<{ data: any }>('admin-update-product', {
      product_id: productId,
      updates,
    });

    return response.data;
  },

  // Delete any product
  deleteProduct: async (productId: string) => {
    await invokeAdminMutation<{ success: boolean }>('admin-delete-product', { product_id: productId });
    return { success: true };
  },

  updateUserRole: async (id: string, role: 'customer' | 'shop_owner' | 'admin') => {
    const response = await invokeAdminMutation<{ data: any }>('admin-update-user-role', {
      user_id: id,
      role,
    });

    return response.data;
  },
};

export default adminService;
