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

    try {
      // Step 1: Get profiles with valid subscriptions
      const now = new Date().toISOString();
      const { data: activeProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, subscription_status, subscription_expires_at')
        .or('subscription_status.eq.active,subscription_status.eq.trial')
        .gt('subscription_expires_at', now); // Check if subscription hasn't expired

      if (profilesError) {
        console.error('Error fetching active profiles:', profilesError);
        throw new Error(profilesError.message);
      }

      // If no active profiles, return empty
      if (!activeProfiles || activeProfiles.length === 0) {
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

      // Extract user IDs with active subscriptions
      const activeUserIds = activeProfiles.map(p => p.id);

      // Step 2: Get shops owned by these users
      let shopsQuery = supabase
        .from('shops')
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .in('owner_id', activeUserIds);

      // Apply verified filter if specified
      if (filters?.verified !== undefined) {
        shopsQuery = shopsQuery.eq('is_verified', filters.verified);
      }

      const { data: shops, error: shopsError, count } = await shopsQuery
        .range(from, to);

      if (shopsError) {
        console.error('Error fetching shops:', shopsError);
        throw new Error(shopsError.message);
      }

      // If no shops, return empty
      if (!shops || shops.length === 0) {
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

      // Step 3: Get shop IDs
      const shopIds = shops.map(s => s.id);

      // Step 4: Check which shops have products (use a different approach)
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('shop_id')
        .in('shop_id', shopIds)
        .eq('is_available', true);

      if (productsError) {
        console.error('Error checking products:', productsError);
        throw new Error(productsError.message);
      }

      // Get unique shop IDs that have products
      const shopIdsWithProducts = [...new Set((productsData || []).map(p => p.shop_id))];

      // Step 5: Filter shops to only include those with products
      const shopsWithProducts = shops.filter(shop => 
        shopIdsWithProducts.includes(shop.id)
      );

      // Step 6: If no shops with products after filtering, return empty
      if (shopsWithProducts.length === 0) {
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

      // Step 7: Get subscription plans for sorting
      const { data: plans, error: plansError } = await supabase
        .from('subscription_plans')
        .select('id, slug, display_order');

      if (plansError) {
        console.error('Error fetching subscription plans:', plansError);
        // Continue without sorting if plans fail
      }

      // Step 8: Enrich shops with profile and subscription info
      const enrichedShops = await Promise.all(
        shopsWithProducts.map(async (shop) => {
          // Get owner profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('subscription_plan_id, subscription_status, subscription_expires_at')
            .eq('id', shop.owner_id)
            .single();

          return {
            ...shop,
            owner: profile,
            subscription_status: profile?.subscription_status || 'unknown',
          };
        })
      );

      // Step 9: Sort shops if we have plans
      let sortedShops = enrichedShops;
      if (plans && plans.length > 0) {
        const planMap = new Map(plans.map(p => [p.id, p]));
        sortedShops = [...enrichedShops].sort((a, b) => {
          const planA = planMap.get(a.owner?.subscription_plan_id);
          const planB = planMap.get(b.owner?.subscription_plan_id);
          const orderA = planA?.display_order || 0;
          const orderB = planB?.display_order || 0;
          return orderB - orderA; // Higher display_order first (business)
        });
      }

      // Step 10: Map to API format
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
        // Add subscription info for display
        has_active_subscription: true,
        subscription_status: s.subscription_status,
      }));

      // Get total count for pagination
      const totalCount = shopIdsWithProducts.length;

      return {
        success: true,
        data: mappedShops,
        meta: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
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
        .select('*')
        .eq('owner_id', ownerId);

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
      }));

      return {
        success: true,
        data: mappedShops,
        message: 'Shops fetched successfully'
      };
    } catch (error: any) {
      console.error('Error in getShopByOwner:', error);
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
        .select('*')
        .eq('shop_slug', slug)
        .single();

      if (error) {
        console.error('Get shop by slug error:', error);
        throw new Error(error.message);
      }

      // Check if shop owner has active subscription
      const now = new Date().toISOString();
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_status, subscription_expires_at')
        .eq('id', shop.owner_id)
        .single();

      // Check subscription validity
      const expiresAt = profile?.subscription_expires_at;
      const isSubscriptionValid = profile && 
        (profile.subscription_status === 'active' || profile.subscription_status === 'trial') &&
        expiresAt && new Date(expiresAt) > new Date(now);

      // Check if shop has products
      const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('shop_id', shop.id)
        .eq('is_available', true);

      const hasProducts = (productCount || 0) > 0;

      // Shop is only valid if both conditions are met
      if (!isSubscriptionValid || !hasProducts) {
        throw new Error('Shop is not currently available');
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
      };

      return {
        success: true,
        data: mappedShop,
        message: 'Shop fetched successfully'
      };
    } catch (error: any) {
      console.error('Error in getShopBySlug:', error);
      return {
        success: false,
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
      console.error('Error in updateShop:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to update shop'
      };
    }
  },
};

export default shopService;