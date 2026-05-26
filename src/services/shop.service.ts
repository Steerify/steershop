import { supabase } from '@/integrations/supabase/client';
import { Shop } from '@/types/api';
import activityLogService from './activity-log.service';


export interface CreateDefaultShopAddressRequest {
  label?: string;
  contactName: string;
  contactPhone: string;
  addressLine1: string;
  city: string;
  state: string;
}

export interface CreateShopRequest {
  name: string;
  slug: string;
  description: string;
  phone?: string;
  whatsapp: string;
  address?: string;
  city?: string;
  state?: string;
  category?: string;
  logo_url?: string;
  banner_url?: string;
}

const isMissingColumnError = (error: { message?: string; code?: string } | null | undefined) => {
  const message = error?.message?.toLowerCase() || '';
  // PGRST204: Column not found in schema cache.
  // We check for several columns that might be missing in older DB snapshots.
  return error?.code === 'PGRST204' && (
    message.includes("'address'") || 
    message.includes("'category'") || 
    message.includes("'city'") || 
    message.includes("'state'") || 
    message.includes('address column') || 
    message.includes('show_public_address')
  );
};

const shopService = {

  createDefaultShopAddress: async (shopId: string, data: CreateDefaultShopAddressRequest) => {
    // Use upsert to gracefully handle re-runs (UNIQUE constraint on shop_id + label).
    const { data: address, error } = await supabase
      .from('shop_addresses')
      .upsert(
        {
          shop_id: shopId,
          label: data.label || 'Main location',
          contact_name: data.contactName,
          contact_phone: data.contactPhone,
          address_line_1: data.addressLine1,
          city: data.city,
          state: data.state,
          country: 'NG',
          is_default: true,
        },
        { onConflict: 'shop_id,label', ignoreDuplicates: false }
      )
      .select()
      .single();

    if (error) {
      console.error('Upsert shop address error:', error);
      throw new Error(error.message);
    }

    return {
      success: true,
      data: address,
      message: 'Shop address saved successfully'
    };
  },

  createShop: async (data: CreateShopRequest) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const shopPayload: any = {
      owner_id: user.id,
      shop_name: data.name,
      shop_slug: data.slug,
      description: data.description,
      whatsapp_number: data.whatsapp,
      logo_url: data.logo_url || null,
      banner_url: data.banner_url || null,
      country: "Nigeria",
      is_active: false,
    };

    // Only add these if they are provided to avoid "column not found" errors
    // if the schema hasn't been updated yet.
    if (data.category) shopPayload.category = data.category;
    if (data.city) shopPayload.city = data.city;
    if (data.state) shopPayload.state = data.state;
    if (data.address) shopPayload.address = data.address.trim();

    let { data: shop, error } = await supabase
      .from('shops')
      .insert(shopPayload)
      .select()
      .single();

    // Older deployments may not have refreshed the optional public-address columns yet.
    // Retry without those columns so store creation is never blocked.
    // Older deployments may not have refreshed the optional marketplace columns yet.
    // Retry without those columns so store creation is never blocked.
    if (isMissingColumnError(error)) {
      const { address, category, city, state, show_public_address, ...safePayload } = shopPayload;
      ({ data: shop, error } = await supabase
        .from('shops')
        .insert(safePayload)
        .select()
        .single());
    }

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

  getShops: async (page = 1, limit = 10, filters?: { verified?: boolean; includeAll?: boolean; activeOnly?: boolean; searchTerm?: string; category?: string; city?: string; state?: string }) => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('shops')
      .select('*, safebeauty_tiers(tier)', { count: 'exact' });

    // Only show active shops unless explicitly told otherwise
    if (filters?.activeOnly !== false) {
      query = query.eq('is_active', true);
    }

    // Apply verified filter if specified
    if (filters?.verified !== undefined) {
      query = query.eq('is_verified', filters.verified);
    }

    if (filters?.searchTerm) {
      const q = `%${filters.searchTerm}%`;
      query = query.or(`shop_name.ilike.${q},description.ilike.${q},shop_slug.ilike.${q},category.ilike.${q},state.ilike.${q},city.ilike.${q}`);
    }

    const { data: shops, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Get shops error:', error);
      throw new Error(error.message);
    }

    // Fetch product counts/images for these shops to verify readiness
    const shopIds = (shops || []).map((s: any) => s.id);
    let completeShops = shops || [];

    if (shopIds.length > 0) {
      const { data: productsData } = await supabase
        .from('products')
        .select('shop_id, image_url')
        .in('shop_id', shopIds)
        .eq('is_available', true)
        .not('image_url', 'is', null);

      const shopsWithImages = new Set(productsData?.map((p: any) => p.shop_id) || []);

      const hasCompletePaymentSetup = (s: any) => {
        const method = s.payment_method;
        if (!method) return false;
        const hasBank = !!(s.bank_name && s.bank_account_name && s.bank_account_number);
        const hasPaystack = !!s.paystack_public_key;
        if (method === 'bank_transfer') return hasBank;
        if (method === 'paystack') return hasPaystack;
        if (method === 'both') return hasBank && hasPaystack;
        return true; // Fallback to true if we don't recognize the method but one is set
      };

      // Filter shops that have both complete payment setup and at least one product with an image
      completeShops = completeShops.filter((s: any) => {
        const hasPayment = hasCompletePaymentSetup(s);
        const hasProduct = shopsWithImages.has(s.id);
        return hasPayment && hasProduct;
      });
    }

    // Map database fields to API types
    const mappedShops: Shop[] = completeShops.map((s: any) => ({
      id: s.id,
      name: s.shop_name,
      slug: s.shop_slug,
      shop_name: s.shop_name,
      shop_slug: s.shop_slug,
      description: s.description,
      whatsapp_number: s.whatsapp_number,
      payment_method: s.payment_method,
      logo_url: s.logo_url,
      banner_url: s.banner_url,
      is_active: s.is_active,
      average_rating: s.average_rating,
      total_reviews: s.total_reviews,
      owner_id: s.owner_id,
      is_verified: s.is_verified,
      category: s.category,
      state: s.state,
      city: s.city,
      address: s.address,
      show_public_address: s.show_public_address,
      country: s.country,
      seo_keywords: s.seo_keywords,
      seo_description: s.seo_description,
      seo_metadata: s.seo_metadata,
      seo_dna_updated_at: s.seo_dna_updated_at,
      created_at: s.created_at,
      tier: (s.safebeauty_tiers as any)?.[0]?.tier || (s.safebeauty_tiers as any)?.tier || 'listed',
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
      .select('*, safebeauty_tiers(tier)')
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
      category: s.category,
      state: s.state,
      city: s.city,
      address: s.address,
      show_public_address: s.show_public_address,
      country: s.country,
      seo_keywords: s.seo_keywords,
      seo_description: s.seo_description,
      seo_metadata: s.seo_metadata,
      seo_dna_updated_at: s.seo_dna_updated_at,
      created_at: s.created_at,
      tier: (s.safebeauty_tiers as any)?.[0]?.tier || (s.safebeauty_tiers as any)?.tier || 'listed',
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
      .select('*, safebeauty_tiers(tier)')
      .eq('shop_slug', slug)
      .single();

    if (error) {
      console.error('Get shop by slug error:', error);
      throw new Error(error.message);
    }

    // Public query - exclude sensitive bank details
    const mappedShop: Shop = {
      id: shop.id,
      name: shop.shop_name,
      slug: shop.shop_slug,
      shop_name: shop.shop_name,
      shop_slug: shop.shop_slug,
      description: shop.description,
      whatsapp_number: shop.whatsapp_number,
      payment_method: shop.payment_method,
      logo_url: shop.logo_url,
      banner_url: shop.banner_url,
      is_active: shop.is_active,
      average_rating: shop.average_rating,
      total_reviews: shop.total_reviews,
      owner_id: shop.owner_id,
      is_verified: shop.is_verified,
      category: shop.category,
      state: shop.state,
      city: shop.city,
      address: shop.address,
      show_public_address: shop.show_public_address,
      country: shop.country,
      seo_keywords: shop.seo_keywords,
      seo_description: shop.seo_description,
      seo_metadata: shop.seo_metadata,
      seo_dna_updated_at: shop.seo_dna_updated_at,
      created_at: shop.created_at,
      tier: (shop.safebeauty_tiers as any)?.[0]?.tier || (shop.safebeauty_tiers as any)?.tier || 'listed',
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
    if (data.category !== undefined) updateData.category = data.category;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.state !== undefined) updateData.state = data.state;
    if (data.country !== undefined) updateData.country = data.country;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.show_public_address !== undefined) updateData.show_public_address = data.show_public_address;
    if (data.seo_keywords !== undefined) updateData.seo_keywords = data.seo_keywords;
    if (data.seo_description !== undefined) updateData.seo_description = data.seo_description;
    if (data.seo_metadata !== undefined) updateData.seo_metadata = data.seo_metadata;
    if (data.seo_dna_updated_at !== undefined) updateData.seo_dna_updated_at = data.seo_dna_updated_at;

    let { data: shop, error } = await supabase
      .from('shops')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (isMissingColumnError(error)) {
      const { address, category, city, state, show_public_address, ...safeUpdateData } = updateData;
      ({ data: shop, error } = await supabase
        .from('shops')
        .update(safeUpdateData)
        .eq('id', id)
        .select()
        .single());
    }

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

    // Proactively push to Search Engines (IndexNow API for Bing/Yandex)
    if (updateData.is_active || updateData.shop_slug || updateData.description) {
      try {
        const slugToUse = updateData.shop_slug || shop.shop_slug;
        if (slugToUse) {
          const urls = [`https://steersolo.com/shop/${slugToUse}`];
          // Fire and forget
          supabase.functions.invoke('index-now', { body: { urls } }).catch(console.error);
        }
      } catch (e) {
        console.error('Failed to trigger indexing:', e);
      }
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
      state: shop.state,
      country: shop.country,
      created_at: shop.created_at,
    };

    return {
      success: true,
      data: mappedShop,
      message: 'Shop updated successfully'
    };
  },
};

export default shopService;
