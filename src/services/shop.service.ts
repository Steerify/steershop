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

  getShops: async (page = 1, limit = 10) => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: shops, error, count } = await supabase
      .from('shops')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .range(from, to);

    if (error) {
      console.error('Get shops error:', error);
      throw new Error(error.message);
    }

    // Map database fields to include both naming conventions
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
    }));

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
    };

    return {
      success: true,
      data: mappedShop,
      message: 'Shop fetched successfully'
    };
  },

  updateShop: async (id: string, data: Partial<Shop>) => {
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
    };

    return {
      success: true,
      data: mappedShop,
      message: 'Shop updated successfully'
    };
  },
};

export default shopService;
