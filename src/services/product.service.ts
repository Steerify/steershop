import { supabase } from '@/integrations/supabase/client';
import { Product, ProductImage } from '@/types/api';

export interface GetProductsParams {
  shopId?: string;
  page?: number;
  limit?: number;
  includeUnavailable?: boolean;
  search?: string;
  categoryId?: string;
}

export interface CreateProductRequest {
  shopId: string;
  categoryId?: string;
  name: string;
  slug?: string;
  description: string;
  price: number;
  comparePrice?: number;
  inventory: number;
  images: ProductImage[];
  type?: 'product' | 'service';
  duration_minutes?: number;
  booking_required?: boolean;
  is_available?: boolean;
}

const productService = {
  createProduct: async (data: CreateProductRequest) => {
    // Generate slug if not provided
    const slug = data.slug || data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    // Get the primary image URL
    const primaryImage = data.images?.[0]?.url || null;
    
    const { data: product, error } = await supabase
      .from('products')
      .insert({
        shop_id: data.shopId,
        name: data.name,
        description: data.description,
        price: data.price,
        stock_quantity: data.inventory,
        image_url: primaryImage,
        type: data.type || 'product',
        is_available: data.is_available !== undefined ? data.is_available : true,
        duration_minutes: data.duration_minutes || null,
        booking_required: data.booking_required || false,
      })
      .select()
      .single();

    if (error) {
      console.error('Create product error:', error);
      throw new Error(error.message);
    }

    return {
      success: true,
      data: { id: product.id },
      message: 'Product created successfully'
    };
  },

  getProducts: async (params: GetProductsParams = {}) => {
    try {
      const { 
        shopId, 
        page = 1, 
        limit = 12, 
        includeUnavailable, 
        search,
        categoryId 
      } = params;
      
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      console.log('🛍️ Fetching products with params:', params);

      // First get active shops with valid subscriptions/trials
      const now = new Date().toISOString();
      
      let activeShopQuery = supabase
        .from('shops')
        .select('id, shop_slug, shop_name, logo_url, is_verified')
        .eq('is_active', true);

      if (shopId) {
        activeShopQuery = activeShopQuery.eq('id', shopId);
      }

      const { data: activeShops, error: shopsError } = await activeShopQuery
        .or(`owner.profiles.subscription_expires_at.gt.${now},owner.profiles.trial_ends_at.gt.${now}`);

      if (shopsError) {
        console.error('Error fetching active shops:', shopsError);
        throw new Error(shopsError.message);
      }

      console.log('Active shops found:', activeShops?.length);

      if (!activeShops || activeShops.length === 0) {
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

      const activeShopIds = activeShops.map(shop => shop.id);
      const shopSlugMap = new Map(activeShops.map(shop => [shop.id, shop.shop_slug]));
      const shopNameMap = new Map(activeShops.map(shop => [shop.id, shop.shop_name]));
      const shopLogoMap = new Map(activeShops.map(shop => [shop.id, shop.logo_url]));
      const shopVerifiedMap = new Map(activeShops.map(shop => [shop.id, shop.is_verified]));

      // Now get products from active shops
      let productQuery = supabase
        .from('products')
        .select(`
          *,
          shop:shops!inner(
            shop_name,
            owner:profiles!inner(
              subscription_expires_at,
              trial_ends_at,
              is_on_trial
            )
          )
        `, { count: 'exact' })
        .eq('is_active', true)
        .in('shop_id', activeShopIds);

      // Only filter by is_available if not explicitly requesting all
      if (!includeUnavailable) {
        productQuery = productQuery.eq('is_available', true);
      }

      if (shopId) {
        productQuery = productQuery.eq('shop_id', shopId);
      }

      if (categoryId) {
        productQuery = productQuery.eq('category_id', categoryId);
      }

      if (search) {
        productQuery = productQuery.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
      }

      const { data: products, error, count } = await productQuery
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('Get products error:', error);
        throw new Error(error.message);
      }

      console.log('Products found:', products?.length);

      // Map the data to match your Product type
      const mappedProducts: Product[] = (products || []).map(p => {
        const shopSlug = shopSlugMap.get(p.shop_id) || 'shop';
        const shopName = shopNameMap.get(p.shop_id) || 'Shop';
        const shopLogo = shopLogoMap.get(p.shop_id);
        const isVerified = shopVerifiedMap.get(p.shop_id) || false;
        
        return {
          id: p.id,
          name: p.name,
          description: p.description || '',
          price: Number(p.price),
          inventory: p.stock_quantity || 0,
          stock_quantity: p.stock_quantity,
          is_available: p.is_available,
          image_url: p.image_url,
          images: p.image_url ? [{ url: p.image_url, alt: p.name }] : [],
          average_rating: p.average_rating,
          total_reviews: p.total_reviews || 0,
          slug: p.slug || p.name.toLowerCase().replace(/\s+/g, '-'),
          shop_slug: shopSlug,
          shop_id: p.shop_id,
          type: p.type || 'product',
          duration_minutes: p.duration_minutes,
          booking_required: p.booking_required || false,
          category_id: p.category_id,
          is_active: p.is_active,
          created_at: p.created_at,
          updated_at: p.updated_at,
          shop: {
            shop_name: shopName,
            shop_slug: shopSlug,
            logo_url: shopLogo,
            is_verified: isVerified
          }
        };
      });

      return {
        success: true,
        data: mappedProducts,
        meta: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        }
      };
    } catch (error: any) {
      console.error('❌ Get products error:', error);
      return {
        success: false,
        data: [],
        error: error.message,
        meta: { page: 1, limit: 12, total: 0, totalPages: 0 }
      };
    }
  },

  // Search products method (uses getProducts internally)
  searchProducts: async (params: { query: string; page?: number; limit?: number }) => {
    const { query, page = 1, limit = 12 } = params;
    
    console.log('🔍 Searching products for:', query);
    
    // Use getProducts with search parameter
    return productService.getProducts({
      search: query,
      page,
      limit
    });
  },

  getProductById: async (id: string) => {
    try {
      const { data: product, error } = await supabase
        .from('products')
        .select(`
          *,
          shop:shops(
            id,
            shop_name,
            shop_slug,
            logo_url,
            banner_url,
            whatsapp_number,
            is_verified,
            owner:profiles(
              subscription_expires_at,
              trial_ends_at,
              is_on_trial
            )
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Get product by ID error:', error);
        throw new Error(error.message);
      }

      if (!product) {
        throw new Error('Product not found');
      }

      // Check if shop has valid subscription/trial
      const now = new Date().toISOString();
      const owner = product.shop?.owner;
      const hasValidSubscription = owner?.subscription_expires_at && owner.subscription_expires_at > now;
      const hasValidTrial = owner?.is_on_trial && owner.trial_ends_at && owner.trial_ends_at > now;
      
      if (!hasValidSubscription && !hasValidTrial) {
        throw new Error('Product shop is not active');
      }

      const mappedProduct: Product = {
        id: product.id,
        name: product.name,
        description: product.description || '',
        price: Number(product.price),
        inventory: product.stock_quantity || 0,
        stock_quantity: product.stock_quantity,
        is_available: product.is_available,
        image_url: product.image_url,
        images: product.image_url ? [{ url: product.image_url, alt: product.name }] : [],
        average_rating: product.average_rating,
        total_reviews: product.total_reviews || 0,
        slug: product.slug || product.name.toLowerCase().replace(/\s+/g, '-'),
        shop_slug: product.shop?.shop_slug,
        shop_id: product.shop_id,
        type: product.type || 'product',
        duration_minutes: product.duration_minutes,
        booking_required: product.booking_required || false,
        category_id: product.category_id,
        is_active: product.is_active,
        created_at: product.created_at,
        updated_at: product.updated_at,
        shop: product.shop ? {
          id: product.shop.id,
          shop_name: product.shop.shop_name,
          shop_slug: product.shop.shop_slug,
          logo_url: product.shop.logo_url,
          banner_url: product.shop.banner_url,
          whatsapp_number: product.shop.whatsapp_number,
          is_verified: product.shop.is_verified
        } : undefined
      };

      return {
        success: true,
        data: mappedProduct,
        message: 'Product fetched successfully'
      };
    } catch (error: any) {
      console.error('❌ Get product by ID error:', error);
      return {
        success: false,
        data: null,
        error: error.message,
        message: 'Failed to fetch product'
      };
    }
  },

  updateProduct: async (id: string, data: Partial<CreateProductRequest>) => {
    try {
      const updateData: any = {};
      
      if (data.name) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.price !== undefined) updateData.price = data.price;
      if (data.inventory !== undefined) updateData.stock_quantity = data.inventory;
      if (data.images && data.images.length > 0) updateData.image_url = data.images[0].url;
      if (data.type) updateData.type = data.type;
      if (data.duration_minutes !== undefined) updateData.duration_minutes = data.duration_minutes;
      if (data.booking_required !== undefined) updateData.booking_required = data.booking_required;
      if (data.is_available !== undefined) updateData.is_available = data.is_available;

      const { data: product, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Update product error:', error);
        throw new Error(error.message);
      }

      const mappedProduct: Product = {
        id: product.id,
        name: product.name,
        description: product.description || '',
        price: Number(product.price),
        inventory: product.stock_quantity || 0,
        stock_quantity: product.stock_quantity,
        is_available: product.is_available,
        image_url: product.image_url,
        images: product.image_url ? [{ url: product.image_url, alt: product.name }] : [],
        average_rating: product.average_rating,
        total_reviews: product.total_reviews || 0,
        slug: product.slug || product.name.toLowerCase().replace(/\s+/g, '-'),
        shop_slug: '', // Will be filled if needed
        shop_id: product.shop_id,
        type: product.type || 'product',
        duration_minutes: product.duration_minutes,
        booking_required: product.booking_required || false,
        category_id: product.category_id,
        is_active: product.is_active,
        created_at: product.created_at,
        updated_at: product.updated_at
      };

      return {
        success: true,
        data: mappedProduct,
        message: 'Product updated successfully'
      };
    } catch (error: any) {
      console.error('❌ Update product error:', error);
      return {
        success: false,
        data: null,
        error: error.message,
        message: 'Failed to update product'
      };
    }
  },

  deleteProduct: async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_available: false })
        .eq('id', id);

      if (error) {
        console.error('Delete product error:', error);
        throw new Error(error.message);
      }

      return {
        success: true,
        data: null,
        message: 'Product deleted successfully'
      };
    } catch (error: any) {
      console.error('❌ Delete product error:', error);
      return {
        success: false,
        data: null,
        error: error.message,
        message: 'Failed to delete product'
      };
    }
  },

  // Get products by shop ID (simplified version)
  getProductsByShop: async (shopId: string, includeUnavailable: boolean = false) => {
    return productService.getProducts({
      shopId,
      includeUnavailable,
      page: 1,
      limit: 100 // High limit to get all products
    });
  },

  // Get featured products
  getFeaturedProducts: async (limit: number = 8) => {
    return productService.getProducts({
      page: 1,
      limit,
      includeUnavailable: false
    });
  },

  // Get products by category
  getProductsByCategory: async (categoryId: string, page: number = 1, limit: number = 12) => {
    return productService.getProducts({
      categoryId,
      page,
      limit,
      includeUnavailable: false
    });
  }
};

export default productService;