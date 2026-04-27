import { supabase } from '@/integrations/supabase/client';

// ─── Admin Mutation Helper ────────────────────────────────────────────────────
// All admin write operations MUST go through this helper so that:
//  1. The `x-admin-intent: dashboard-mutation` header is sent (required by edge functions)
//  2. The user's JWT is forwarded so verifyAdminRequest() can authenticate the caller
//  3. Edge-function errors are surfaced clearly instead of silently failing
async function invokeAdminMutation<T>(
  functionName: string,
  payload: Record<string, unknown>,
): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('Not authenticated — cannot perform admin mutation');
  }

  const { data, error } = await supabase.functions.invoke(functionName, {
    body: payload,
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'x-admin-intent': 'dashboard-mutation',
    },
  });

  if (error) {
    console.error(`[Admin] ${functionName} error:`, error);
    throw new Error(error.message || `Admin operation failed: ${functionName}`);
  }

  return data as T;
}


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
      { data: statsData, error: statsError },
      { data: recentOrders },
      visitAnalyticsResponse
    ] = await Promise.all([
      supabase.rpc('get_admin_stats'),
      supabase.from('orders').select('*, order_items(*, products(*))').order('created_at', { ascending: false }).limit(10),
      supabase.rpc('get_website_visit_analytics')
    ]);

    if (statsError) {
      console.error('Error fetching admin stats:', statsError);
    }

    if (visitAnalyticsResponse.error) {
      console.error('Error fetching visit analytics:', visitAnalyticsResponse.error);
    }

    const stats = statsData || {
      total_users: 0,
      total_shops: 0,
      active_shops: 0,
      total_products: 0,
      total_orders: 0,
      pending_orders: 0,
      total_revenue: 0
    };

    const visitAnalytics = visitAnalyticsResponse.data as {
      totals?: VisitTotals;
      top_pages?: TopVisitPage[];
      daily?: VisitTrendPoint[];
    } | null;

    return {
      totalUsers: stats.total_users || 0,
      totalShops: stats.total_shops || 0,
      activeShops: stats.active_shops || 0,
      totalProducts: stats.total_products || 0,
      totalOrders: stats.total_orders || 0,
      pendingOrders: stats.pending_orders || 0,
      totalRevenue: stats.total_revenue || 0,
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

  extendSubscription: async (userId: string, days: number) => {
    const response = await invokeAdminMutation<{ success: boolean; new_expiry_at: string }>('admin-set-subscription', {
      user_id: userId,
      action: 'extend_days',
      days,
    });

    return { success: response.success, newExpiry: new Date(response.new_expiry_at) };
  },

  setSubscriptionDate: async (userId: string, date: Date) => {
    const response = await invokeAdminMutation<{ success: boolean; new_expiry_at: string }>('admin-set-subscription', {
      user_id: userId,
      action: 'set_date',
      custom_date: date.toISOString(),
    });

    return { success: response.success, newExpiry: new Date(response.new_expiry_at) };
  },

  activateSubscription: async (userId: string, planId: string | null, planName: string) => {
    const response = await invokeAdminMutation<{ success: boolean; new_expiry_at: string }>('admin-set-subscription', {
      user_id: userId,
      action: 'activate',
      plan_id: planId,
      plan_name: planName,
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
