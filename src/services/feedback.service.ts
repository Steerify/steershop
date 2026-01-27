import { supabase } from "@/integrations/supabase/client";

export interface Feedback {
  id: string;
  user_id?: string;
  customer_name: string;
  customer_email: string;
  feedback_type: string;
  subject: string;
  message: string;
  rating?: number;
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  show_on_homepage?: boolean;
  created_at: string;
  updated_at: string;
}

const feedbackService = {
  submitFeedback: async (data: { 
    subject: string; 
    message: string;
    customer_name: string;
    customer_email: string;
    feedback_type: string;
    rating?: number;
  }) => {
    const { data: result, error } = await supabase
      .from('platform_feedback')
      .insert({
        customer_name: data.customer_name,
        customer_email: data.customer_email,
        feedback_type: data.feedback_type,
        subject: data.subject,
        message: data.message,
        rating: data.rating,
        show_on_homepage: data.rating && data.rating >= 4 ? true : false,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data: result as Feedback,
      message: 'Feedback submitted successfully'
    };
  },

  getAllFeedback: async (page = 1, limit = 10) => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('platform_feedback')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    return {
      success: true,
      data: data as Feedback[],
      meta: { 
        page, 
        limit, 
        total: count || 0, 
        totalPages: Math.ceil((count || 0) / limit) 
      }
    };
  },

  updateFeedbackStatus: async (id: string, status: Feedback['status']) => {
    const { data, error } = await supabase
      .from('platform_feedback')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return { 
      success: true, 
      data: data as Feedback,
      message: 'Status updated successfully' 
    };
  },

  toggleShowOnHomepage: async (id: string, showOnHomepage: boolean) => {
    const { data, error } = await supabase
      .from('platform_feedback')
      .update({ show_on_homepage: showOnHomepage })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return { 
      success: true, 
      data: data as Feedback,
      message: 'Homepage visibility updated' 
    };
  },

  getHomepageReviews: async (limit = 6) => {
    const { data, error } = await supabase
      .from('platform_feedback')
      .select('id, customer_name, message, rating, created_at')
      .eq('show_on_homepage', true)
      .gte('rating', 4)
      .order('rating', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return {
      success: true,
      data: data || []
    };
  },
};

export default feedbackService;
