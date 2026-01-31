import { supabase } from '@/integrations/supabase/client';
import { Shop } from '@/types/api';
import activityLogService from './activity-log.service';

export interface CreateShopRequest {
  name: string;
  slug: string;
  description: string;
  phone?: string;
  whatsapp: string;
  address?: string;
  city?: string;
  state?: string;
}

const shopService = {
  createShop: async (data: CreateShopRequest) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data: shop, error } = await supabase
      .from('shops')
      .insert({
        owner_id: user.id,
        shop_name: data.name,
        shop_slug: data.slug,
        description: data.description,
        whatsapp_number: data.whatsapp,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Create shop error:', error);
      throw new Error(error.message);
    }

    // Log activity
    activityLogService.log({
      action_type: 'create',
      resource_type: 'shop',
      resource_id: shop.id,
      resource_name: shop.shop_name,
      details: { slug: shop.shop_slug }
    });

    return { 
      success: true, 
      data: { id: shop.id, slug: shop.shop_slug },
      message: 'Shop created successfully'
    };
  },

  getShops: async (page = 1, limit = 10, filters?: { verified?: boolean }) => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const now = new Date().toISOString();

    console.log('Fetching shops, page:', page, 'limit:', limit, 'filters:', filters);

    // Build the base query with all necessary fields
    let query = supabase
      .from('shops')
      .select(`
        *,
        owner:profiles!inner(
          id,
          subscription_plan_id,
          subscription_expires_at,
          trial_ends_at,
          is_on_trial,
          subscription_type
        )
      `, { count: 'exact' })
      .eq('is_active', true)
      .eq('shops.is_active', true);

    // Apply verified filter if specified
    if (filters?.verified !== undefined) {
      query = query.eq('is_verified', filters.verified);
    }

    try {
      // Get shops with owners who have valid subscriptions or trials
      const { data: shops, error, count } = await query
        .or(`owner.subscription_expires_at.gt.${now},owner.trial_ends_at.gt.${now}`)
        .range(from, to);

      console.log('Raw shops fetched:', shops?.length, 'error:', error);

      if (error) {
        console.error('Get shops error:', error);
        throw new Error(error.message);
      }

      if (!shops || shops.length === 0) {
        console.log('No shops found with active subscriptions/trials');
        return {
          success: true,
          data: [],
          meta: {
            page,
            limit,
            total: 0,
            totalPages: 0,
          }
        };
      }

      console.log('First shop sample:', shops[0]);

      // Check which shops have products
      const shopIds = shops.map((s: any) => s.id);
      let shopsWithProducts: string[] = [];
      
      if (shopIds.length > 0) {
        const { data: productCounts, error: productError } = await supabase
          .from('products')
          .select('shop_id')
          .in('shop_id', shopIds)
          .eq('is_available', true)
          .eq('is_active', true);
        
        if (productError) {
          console.error('Error fetching products:', productError);
        } else {
          shopsWithProducts = [...new Set((productCounts || []).map((p: any) => p.shop_id))];
          console.log('Shops with products:', shopsWithProducts.length);
        }
      }

      // Filter shops that have products
      const shopsWithProductsData = shops.filter((shop: any) => 
        shopsWithProducts.includes(shop.id)
      );

      console.log('Shops after product filter:', shopsWithProductsData.length);

      // Fetch subscription plans for sorting
      const { data: plans } = await supabase
        .from('subscription_plans')
        .select('id, slug, display_order')
        .order('display_order', { ascending: false });

      const planMap = new Map(plans?.map(p => [p.id, p]) || []);

      // Sort shops: higher display_order first (Business > Pro > Basic)
      const sortedShops = [...shopsWithProductsData].sort((a, b) => {
        const planA = planMap.get(a.owner?.subscription_plan_id);
        const planB = planMap.get(b.owner?.subscription_plan_id);
        const orderA = planA?.display_order || 0;
        const orderB = planB?.display_order || 0;
        return orderB - orderA; // Higher display_order first
      });

      // Map database fields to include both naming conventions
      const mappedShops: Shop[] = sortedShops.map(s => ({
        id: s.id,
        name: s.shop_name,
        slug: s.shop_slug,
        shop_name: s.shop_name,
        shop_slug: s.shop_slug,
        description: s.description,
        whatsapp_number: s.whatsapp_number,
        payment_method: s.payment_method,
        bank_name: s.bank_name,
        bank_account_name: s.bank_account_name,
        bank_account_number: s.bank_account_number,
        paystack_public_key: s.paystack_public_key,
        logo_url: s.logo_url,
        banner_url: s.banner_url,
        is_active: s.is_active,
        average_rating: s.average_rating,
        total_reviews: s.total_reviews,
        owner_id: s.owner_id,
        is_verified: s.is_verified,
        owner: s.owner ? {
          id: s.owner.id,
          subscription_plan_id: s.owner.subscription_plan_id,
          subscription_expires_at: s.owner.subscription_expires_at,
          trial_ends_at: s.owner.trial_ends_at,
          is_on_trial: s.owner.is_on_trial,
          subscription_type: s.owner.subscription_type
        } : undefined
      }));

      return {
        success: true,
        data: mappedShops,
        meta: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        }
      };
    } catch (error: any) {
      console.error('Error in getShops:', error);
      return {
        success: false,
        data: [],
        error: error.message,
        meta: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        }
      };
    }
  },

  getShopByOwner: async (ownerId: string) => {
    try {
      const { data: shops, error } = await supabase
        .from('shops')
        .select(`
          *,
          owner:profiles!inner(
            id,
            subscription_plan_id,
            subscription_expires_at,
            trial_ends_at,
            is_on_trial,
            subscription_type
          )
        `)
        .eq('owner_id', ownerId)
        .eq('is_active', true);

      if (error) {
        console.error('Get shop by owner error:', error);
        throw new Error(error.message);
      }

      // Map database fields
      const mappedShops: Shop[] = (shops || []).map(s => ({
        id: s.id,
        name: s.shop_name,
        slug: s.shop_slug,
        shop_name: s.shop_name,
        shop_slug: s.shop_slug,
        description: s.description,
        whatsapp_number: s.whatsapp_number,
        payment_method: s.payment_method,
        bank_name: s.bank_name,
        bank_account_name: s.bank_account_name,
        bank_account_number: s.bank_account_number,
        paystack_public_key: s.paystack_public_key,
        logo_url: s.logo_url,
        banner_url: s.banner_url,
        is_active: s.is_active,
        average_rating: s.average_rating,
        total_reviews: s.total_reviews,
        owner_id: s.owner_id,
        is_verified: s.is_verified,
        owner: s.owner ? {
          id: s.owner.id,
          subscription_plan_id: s.owner.subscription_plan_id,
          subscription_expires_at: s.owner.subscription_expires_at,
          trial_ends_at: s.owner.trial_ends_at,
          is_on_trial: s.owner.is_on_trial,
          subscription_type: s.owner.subscription_type
        } : undefined
      }));

      return {
        success: true,
        data: mappedShops,
        message: 'Shops fetched successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: error.message,
        message: 'Failed to fetch shops'
      };
    }
  },

  getShopBySlug: async (slug: string) => {
    try {
      const { data: shop, error } = await supabase
        .from('shops')
        .select(`
          *,
          owner:profiles!inner(
            id,
            subscription_plan_id,
            subscription_expires_at,
            trial_ends_at,
            is_on_trial,
            subscription_type
          )
        `)
        .eq('shop_slug', slug)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Get shop by slug error:', error);
        throw new Error(error.message);
      }

      const mappedShop: Shop = {
        id: shop.id,
        name: shop.shop_name,
        slug: shop.shop_slug,
        shop_name: shop.shop_name,
        shop_slug: shop.shop_slug,
        description: shop.description,
        whatsapp_number: shop.whatsapp_number,
        payment_method: shop.payment_method,
        bank_name: shop.bank_name,
        bank_account_name: shop.bank_account_name,
        bank_account_number: shop.bank_account_number,
        paystack_public_key: shop.paystack_public_key,
        logo_url: shop.logo_url,
        banner_url: shop.banner_url,
        is_active: shop.is_active,
        average_rating: shop.average_rating,
        total_reviews: shop.total_reviews,
        owner_id: shop.owner_id,
        is_verified: shop.is_verified,
        owner: shop.owner ? {
          id: shop.owner.id,
          subscription_plan_id: shop.owner.subscription_plan_id,
          subscription_expires_at: shop.owner.subscription_expires_at,
          trial_ends_at: shop.owner.trial_ends_at,
          is_on_trial: shop.owner.is_on_trial,
          subscription_type: shop.owner.subscription_type
        } : undefined
      };

      return {
        success: true,
        data: mappedShop,
        message: 'Shop fetched successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        error: error.message,
        message: 'Failed to fetch shop'
      };
    }
  },

  updateShop: async (id: string, data: Partial<Shop>) => {
    try {
      // Map from API types to database column names
      const updateData: any = {};
      
      if (data.name || data.shop_name) updateData.shop_name = data.name || data.shop_name;
      if (data.slug || data.shop_slug) updateData.shop_slug = data.slug || data.shop_slug;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.whatsapp || data.whatsapp_number) updateData.whatsapp_number = data.whatsapp || data.whatsapp_number;
      if (data.logo_url) updateData.logo_url = data.logo_url;
      if (data.banner_url) updateData.banner_url = data.banner_url;
      if (data.payment_method) updateData.payment_method = data.payment_method;
      if (data.bank_name) updateData.bank_name = data.bank_name;
      if (data.bank_account_name) updateData.bank_account_name = data.bank_account_name;
      if (data.bank_account_number) updateData.bank_account_number = data.bank_account_number;
      if (data.paystack_public_key) updateData.paystack_public_key = data.paystack_public_key;
      if (data.is_active !== undefined) updateData.is_active = data.is_active;
      if (data.is_verified !== undefined) updateData.is_verified = data.is_verified;

      const { data: shop, error } = await supabase
        .from('shops')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Update shop error:', error);
        throw new Error(error.message);
      }

      // Log activity
      activityLogService.log({
        action_type: 'update',
        resource_type: 'shop',
        resource_id: shop.id,
        resource_name: shop.shop_name,
        details: { updated_fields: Object.keys(updateData) }
      });

      const mappedShop: Shop = {
        id: shop.id,
        name: shop.shop_name,
        slug: shop.shop_slug,
        shop_name: shop.shop_name,
        shop_slug: shop.shop_slug,
        description: shop.description,
        whatsapp_number: shop.whatsapp_number,
        payment_method: shop.payment_method,
        bank_name: shop.bank_name,
        bank_account_name: shop.bank_account_name,
        bank_account_number: shop.bank_account_number,
        paystack_public_key: shop.paystack_public_key,
        logo_url: shop.logo_url,
        banner_url: shop.banner_url,
        is_active: shop.is_active,
        average_rating: shop.average_rating,
        total_reviews: shop.total_reviews,
        owner_id: shop.owner_id,
        is_verified: shop.is_verified,
      };

      return {
        success: true,
        data: mappedShop,
        message: 'Shop updated successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        error: error.message,
        message: 'Failed to update shop'
      };
    }
  },

  // Helper method to check subscription/trial status
  checkSubscriptionStatus: async (ownerId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('subscription_expires_at, trial_ends_at, is_on_trial')
        .eq('id', ownerId)
        .single();

      if (error) {
        console.error('Check subscription status error:', error);
        return { 
          success: false,
          hasValidSubscription: false, 
          hasValidTrial: false 
        };
      }

      const now = new Date();
      const expiresAt = profile.subscription_expires_at ? new Date(profile.subscription_expires_at) : null;
      const trialEndsAt = profile.trial_ends_at ? new Date(profile.trial_ends_at) : null;

      const hasValidSubscription = expiresAt && expiresAt > now;
      const hasValidTrial = profile.is_on_trial && trialEndsAt && trialEndsAt > now;

      return {
        success: true,
        hasValidSubscription,
        hasValidTrial,
        subscriptionExpiresAt: expiresAt,
        trialEndsAt: trialEndsAt
      };
    } catch (error: any) {
      return {
        success: false,
        hasValidSubscription: false,
        hasValidTrial: false,
        error: error.message
      };
    }
  }
};

export default shopService;