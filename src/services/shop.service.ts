import { supabase } from '@/integrations/supabase/client';
import { Shop } from '@/types/api';

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

    return { 
      success: true, 
      data: { id: shop.id, slug: shop.shop_slug },
      message: 'Shop created successfully'
    };
  },

  getShops: async (page = 1, limit = 10, filters?: { verified?: boolean }) => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('shops')
      .select(`
        *,
        owner:profiles(subscription_plan_id)
      `, { count: 'exact' })
      .eq('is_active', true);

    if (filters?.verified !== undefined) {
      query = query.eq('is_verified', filters.verified);
    }

    const { data: shops, error, count } = await query.range(from, to);

    if (error) {
      console.error('Get shops error:', error);
      throw new Error(error.message);
    }

    const { data: plans } = await supabase
      .from('subscription_plans')
      .select('id, slug, display_order');

    const planMap = new Map(plans?.map(p => [p.id, p]) || []);

    const sortedShops = [...(shops || [])].sort((a, b) => {
      const planA = planMap.get((a as any).owner?.subscription_plan_id);
      const planB = planMap.get((b as any).owner?.subscription_plan_id);
      const orderA = planA?.display_order || 0;
      const orderB = planB?.display_order || 0;
      return orderB - orderA;
    });

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
  },

  getShopByOwner: async (ownerId: string) => {
    console.log('🛠️ shopService.getShopByOwner called with ownerId:', ownerId, 'type:', typeof ownerId);
    
    if (!ownerId) {
      console.error('❌ Owner ID is falsy:', ownerId);
      throw new Error('Owner ID is required');
    }
    
    if (typeof ownerId !== 'string') {
      console.error('❌ Owner ID is not a string:', ownerId, 'type:', typeof ownerId);
      throw new Error(`Owner ID must be a string, got ${typeof ownerId}`);
    }
    
    if (ownerId.trim() === '') {
      console.error('❌ Owner ID is empty string');
      throw new Error('Owner ID is empty');
    }
    
    if (ownerId === 'undefined') {
      console.error('❌ Owner ID is the string "undefined"');
      throw new Error('Owner ID is "undefined" - check calling code');
    }
    
    if (ownerId === 'null') {
      console.error('❌ Owner ID is the string "null"');
      throw new Error('Owner ID is "null" - check calling code');
    }

    console.log('📞 Supabase query for owner_id:', ownerId);
    const { data: shops, error } = await supabase
      .from('shops')
      .select('*')
      .eq('owner_id', ownerId);

    if (error) {
      console.error('❌ Get shop by owner error:', error);
      throw new Error(error.message);
    }

    console.log('✅ Found shops:', shops?.length || 0);
    
    const mappedShops: Shop[] = (shops || []).map(s => {
      console.log('🏪 Shop data:', { id: s.id, name: s.shop_name });
      return {
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
      };
    });

    return {
      success: true,
      data: mappedShops,
      message: 'Shops fetched successfully'
    };
  },

  getShopBySlug: async (slug: string) => {
    const { data: shop, error } = await supabase
      .from('shops')
      .select('*')
      .eq('shop_slug', slug)
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
    };

    return {
      success: true,
      data: mappedShop,
      message: 'Shop fetched successfully'
    };
  },

  updateShop: async (id: string, data: Partial<Shop>) => {
    console.log('🛠️ shopService.updateShop called with:');
    console.log('🆔 ID:', id, 'type:', typeof id);
    console.log('📝 Data:', data);
    
    // Comprehensive validation
    if (!id) {
      console.error('❌ ID is falsy:', id);
      throw new Error('Shop ID is required for update');
    }

    if (typeof id !== 'string') {
      console.error('❌ ID is not a string:', id, 'type:', typeof id);
      throw new Error(`Shop ID must be a string, got ${typeof id}`);
    }

    if (id.trim() === '') {
      console.error('❌ ID is empty string');
      throw new Error('Shop ID is empty');
    }

    if (id === 'undefined') {
      console.error('❌ ID is the string "undefined"');
      throw new Error('Shop ID is "undefined" - check calling code');
    }

    if (id === 'null') {
      console.error('❌ ID is the string "null"');
      throw new Error('Shop ID is "null" - check calling code');
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const cleanId = id.replace(/-/g, '');
    const isHexUUID = /^[a-f0-9]{32}$/i.test(cleanId);
    
    if (!uuidRegex.test(id) && !isHexUUID) {
      console.error('❌ Invalid UUID format:', id);
      console.log('🔍 Clean ID:', cleanId, 'Length:', cleanId.length, 'Is hex:', isHexUUID);
      throw new Error(`Invalid UUID format: ${id}`);
    }

    // Map data
    const updateData: any = {};
    
    if (data.name !== undefined || data.shop_name !== undefined) {
      updateData.shop_name = data.name || data.shop_name;
    }
    if (data.slug !== undefined || data.shop_slug !== undefined) {
      updateData.shop_slug = data.slug || data.shop_slug;
    }
    if (data.description !== undefined) updateData.description = data.description;
    if (data.whatsapp !== undefined || data.whatsapp_number !== undefined) {
      updateData.whatsapp_number = data.whatsapp || data.whatsapp_number;
    }
    if (data.logo_url !== undefined) updateData.logo_url = data.logo_url;
    if (data.banner_url !== undefined) updateData.banner_url = data.banner_url;
    if (data.payment_method !== undefined) updateData.payment_method = data.payment_method;
    if (data.bank_name !== undefined) updateData.bank_name = data.bank_name;
    if (data.bank_account_name !== undefined) updateData.bank_account_name = data.bank_account_name;
    if (data.bank_account_number !== undefined) updateData.bank_account_number = data.bank_account_number;
    if (data.paystack_public_key !== undefined) updateData.paystack_public_key = data.paystack_public_key;
    if (data.is_active !== undefined) updateData.is_active = data.is_active;
    if (data.primary_color !== undefined) updateData.primary_color = data.primary_color;
    if (data.secondary_color !== undefined) updateData.secondary_color = data.secondary_color;
    if (data.accent_color !== undefined) updateData.accent_color = data.accent_color;
    if (data.theme_mode !== undefined) updateData.theme_mode = data.theme_mode;
    if (data.font_style !== undefined) updateData.font_style = data.font_style;

    console.log('📤 Supabase update with:', {
      id: id,
      updateData: updateData,
      table: 'shops'
    });

    const { data: shop, error } = await supabase
      .from('shops')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Update shop error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw new Error(`Database error: ${error.message}`);
    }

    console.log('✅ Update successful, returned shop:', shop);

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
      primary_color: shop.primary_color,
      secondary_color: shop.secondary_color,
      accent_color: shop.accent_color,
      theme_mode: shop.theme_mode as 'light' | 'dark' | 'auto' | undefined,
      font_style: shop.font_style as 'modern' | 'classic' | 'playful' | 'elegant' | undefined,
    };

    return {
      success: true,
      data: mappedShop,
      message: 'Shop updated successfully'
    };
  },
};

export default shopService;