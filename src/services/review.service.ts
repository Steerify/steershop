import { supabase } from '@/integrations/supabase/client';

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
  customer_name?: string;
  reviewer?: {
    kyc_level: number;
  } | null;
  user?: {
    firstName: string;
    lastName: string;
  };
}

const reviewService = {
  createReview: async (data: { 
    productId: string; 
    rating: number; 
    comment: string;
    customer_name: string;
  }) => {
    const { data: { user } } = await supabase.auth.getUser();

    const { data: review, error } = await supabase
      .from('product_reviews')
      .insert({
        product_id: data.productId,
        customer_id: user?.id || null,
        rating: data.rating,
        comment: data.comment,
        customer_name: data.customer_name,
      })
      .select()
      .single();

    if (error) {
      console.error('Create review error:', error);
      throw new Error(error.message);
    }

    return {
      success: true,
      data: review as unknown as Review,
      message: 'Review submitted successfully'
    };
  },

  getProductReviews: async (productId: string, page = 1, limit = 10) => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('product_reviews')
      .select('*', { count: 'exact' })
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Get reviews error:', error);
      throw new Error(error.message);
    }

    const reviews = data || [];

    // Fetch reviewer verification status for reviews with customer_id
    const customerIds = reviews
      .map((r: any) => r.customer_id)
      .filter((id: string | null) => id != null);

    let verificationMap: Record<string, number> = {};
    if (customerIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, kyc_level')
        .in('id', customerIds);
      
      if (profiles) {
        verificationMap = Object.fromEntries(
          profiles.map((p: any) => [p.id, p.kyc_level || 0])
        );
      }
    }

    // Attach reviewer info
    const enrichedReviews = reviews.map((r: any) => ({
      ...r,
      reviewer: r.customer_id && verificationMap[r.customer_id] != null
        ? { kyc_level: verificationMap[r.customer_id] }
        : null,
    }));

    return {
      success: true,
      data: enrichedReviews as unknown as Review[],
      meta: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      }
    };
  },
};

export default reviewService;
