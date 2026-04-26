import { supabase } from '@/integrations/supabase/client';

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
    // Phase 1: Core stats — try secure RPC first, fall back to direct queries
    let totalUsers = 0, totalShops = 0, activeShops = 0;
    let totalProducts = 0, totalOrders = 0, pendingOrders = 0, totalRevenue = 0;

    const rpcResult = await supabase.rpc('get_admin_stats');
    if (!rpcResult.error && rpcResult.data) {
      const s = rpcResult.data;
      totalUsers    = Number(s.total_users    ?? 0);
      totalShops    = Number(s.total_shops    ?? 0);
      activeShops   = Number(s.active_shops   ?? 0);
      totalProducts = Number(s.total_products ?? 0);
      totalOrders   = Number(s.total_orders   ?? 0);
      pendingOrders = Number(s.pending_orders ?? 0);
      totalRevenue  = Number(s.total_revenue  ?? 0);
    } else {
      // RPC not yet deployed — fall back to individual queries
      if (rpcResult.error) console.warn('[AdminService] get_admin_stats RPC unavailable:', rpcResult.error.message);
      const safeCount = async (q: any): Promise<number> => {
        try { const { count, error } = await q; if (error) console.warn('[AdminService]', error.message); return count || 0; }
        catch (e) { return 0; }
      };
      [totalUsers, totalShops, activeShops, totalProducts, totalOrders, pendingOrders] = await Promise.all([
        safeCount(supabase.from('profiles').select('*', { count: 'exact', head: true })),
        safeCount(supabase.from('shops').select('*', { count: 'exact', head: true })),
        safeCount(supabase.from('shops').select('*', { count: 'exact', head: true }).eq('is_active', true)),
        safeCount(supabase.from('products').select('*', { count: 'exact', head: true })),
        safeCount(supabase.from('orders').select('*', { count: 'exact', head: true })),
        safeCount(supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending')),
      ]);
      try {
        const { data: rd } = await supabase.from('orders').select('total_amount').eq('payment_status', 'paid');
        totalRevenue = rd?.reduce((s, o) => s + (Number(o.total_amount) || 0), 0) || 0;
      } catch (_) {}
    }

    // Phase 2: Recent orders (optional)
    let recentOrders: any[] = [];
    try {
      const { data } = await supabase.from('orders').select('*, order_items(*, products(*))').order('created_at', { ascending: false }).limit(10);
      recentOrders = data || [];
    } catch (_) {}

    // Phase 3: Visit analytics (fully optional — never crashes anything)
    let visitTotals: VisitTotals = { today: 0, days7: 0, days30: 0 };
    let topVisitPages: TopVisitPage[] = [];
    let visitTrend: VisitTrendPoint[] = [];
    try {
      const { data: va, error: vaErr } = await supabase.rpc('get_website_visit_analytics');
      if (!vaErr && va) {
        visitTotals = { today: va.totals?.today || 0, days7: va.totals?.days7 || 0, days30: va.totals?.days30 || 0 };
        topVisitPages = va.top_pages || [];
        visitTrend = va.daily || [];
      }
    } catch (_) {}

    return { totalUsers, totalShops, activeShops, totalProducts, totalOrders, pendingOrders, totalRevenue, recentOrders, visitTotals, topVisitPages, visitTrend };
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
