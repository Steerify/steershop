import { supabase } from '@/integrations/supabase/client';

export interface ActivityLogEntry {
  action_type: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'view' | 'export' | 'approve' | 'reject' | 'payment' | 'signup';
  resource_type: 'shop' | 'product' | 'order' | 'booking' | 'user' | 'review' | 'subscription' | 'payment' | 'feedback' | 'course' | 'auth';
  resource_id?: string;
  resource_name?: string;
  details?: Record<string, any>;
}

export interface ActivityLog {
  id: string;
  user_id: string | null;
  user_email: string | null;
  action_type: string;
  resource_type: string;
  resource_id: string | null;
  resource_name: string | null;
  details: Record<string, any>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  metadata: Record<string, any>;
}

const activityLogService = {
  /**
   * Log an activity to the database
   */
  log: async (entry: ActivityLogEntry): Promise<void> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from('activity_logs').insert({
        user_id: user?.id || null,
        user_email: user?.email || null,
        action_type: entry.action_type,
        resource_type: entry.resource_type,
        resource_id: entry.resource_id || null,
        resource_name: entry.resource_name || null,
        details: entry.details || {},
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      });
    } catch (error) {
      // Don't throw - logging should not break the app
      console.error('Activity log error:', error);
    }
  },

  /**
   * Get activity logs with filtering (admin only)
   */
  getActivityLogs: async (params: {
    page?: number;
    limit?: number;
    resource_type?: string;
    action_type?: string;
    user_id?: string;
    start_date?: string;
    end_date?: string;
    search?: string;
  } = {}) => {
    const page = params.page || 1;
    const limit = params.limit || 50;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('activity_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (params.resource_type) {
      query = query.eq('resource_type', params.resource_type);
    }

    if (params.action_type) {
      query = query.eq('action_type', params.action_type);
    }

    if (params.user_id) {
      query = query.eq('user_id', params.user_id);
    }

    if (params.start_date) {
      query = query.gte('created_at', params.start_date);
    }

    if (params.end_date) {
      query = query.lte('created_at', params.end_date);
    }

    if (params.search) {
      query = query.or(`user_email.ilike.%${params.search}%,resource_name.ilike.%${params.search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Get activity logs error:', error);
      throw new Error(error.message);
    }

    return {
      success: true,
      data: data as ActivityLog[],
      meta: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      }
    };
  },

  /**
   * Get activity summary stats (admin only)
   */
  getActivityStats: async (days: number = 7) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('activity_logs')
      .select('action_type, resource_type, created_at')
      .gte('created_at', startDate.toISOString());

    if (error) {
      console.error('Get activity stats error:', error);
      return null;
    }

    // Group by action type
    const actionCounts: Record<string, number> = {};
    const resourceCounts: Record<string, number> = {};

    data?.forEach(log => {
      actionCounts[log.action_type] = (actionCounts[log.action_type] || 0) + 1;
      resourceCounts[log.resource_type] = (resourceCounts[log.resource_type] || 0) + 1;
    });

    return {
      total: data?.length || 0,
      byAction: actionCounts,
      byResource: resourceCounts,
    };
  },
};

export default activityLogService;
