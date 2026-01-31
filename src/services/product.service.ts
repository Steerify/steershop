import { supabase } from '@/integrations/supabase/client';
import { Product, ProductImage } from '@/types/api';

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

  getProducts: async (params?: { shopId?: string; page?: number; limit?: number; includeUnavailable?: boolean }) => {
    const page = params?.page || 1;
    const limit = params?.limit || 50;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .range(from, to);

    // Only filter by is_available if not explicitly requesting all
    if (!params?.includeUnavailable) {
      query = query.eq('is_available', true);
    }

    if (params?.shopId) {
      query = query.eq('shop_id', params.shopId);
    }

    const { data: products, error, count } = await query;

    if (error) {
      console.error('Get products error:', error);
      throw new Error(error.message);
    }

    // Map database fields to API types
    const mappedProducts: Product[] = (products || []).map(p => ({
      id: p.id,
      shopId: p.shop_id,
      categoryId: '',
      name: p.name,
      slug: p.name.toLowerCase().replace(/\s+/g, '-'),
      description: p.description || '',
      price: Number(p.price),
      comparePrice: undefined,
      inventory: p.stock_quantity,
      images: p.image_url ? [{ url: p.image_url, alt: p.name, position: 0 }] : [],
      averageRating: p.average_rating ? Number(p.average_rating) : undefined,
      totalReviews: p.total_reviews || 0,
      type: p.type as 'product' | 'service' | undefined,
      is_available: p.is_available,
      duration_minutes: p.duration_minutes,
      booking_required: p.booking_required,
    }));

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
  },

  // NEW: Search products method
  searchProducts: async (params: { 
    query: string; 
    shopId?: string; 
    page?: number; 
    limit?: number; 
    includeUnavailable?: boolean 
  }) => {
    console.log('searchProducts called with params:', params);
    
    const page = params?.page || 1;
    const limit = params?.limit || 50;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .ilike('name', `%${params.query}%`)
      .range(from, to);

    if (!params?.includeUnavailable) {
      query = query.eq('is_available', true);
    }

    if (params?.shopId) {
      query = query.eq('shop_id', params.shopId);
    }

    const { data: products, error, count } = await query;

    if (error) {
      console.error('Search products error:', error);
      throw new Error(error.message);
    }

    console.log('Search products results:', products?.length, 'items found');

    // Map database fields to API types
    const mappedProducts: Product[] = (products || []).map(p => ({
      id: p.id,
      shopId: p.shop_id,
      categoryId: '',
      name: p.name,
      slug: p.name.toLowerCase().replace(/\s+/g, '-'),
      description: p.description || '',
      price: Number(p.price),
      comparePrice: undefined,
      inventory: p.stock_quantity,
      images: p.image_url ? [{ url: p.image_url, alt: p.name, position: 0 }] : [],
      averageRating: p.average_rating ? Number(p.average_rating) : undefined,
      totalReviews: p.total_reviews || 0,
      type: p.type as 'product' | 'service' | undefined,
      is_available: p.is_available,
      duration_minutes: p.duration_minutes,
      booking_required: p.booking_required,
    }));

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
  },

  getProductById: async (id: string) => {
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Get product error:', error);
      throw new Error(error.message);
    }

    const mappedProduct: Product = {
      id: product.id,
      shopId: product.shop_id,
      categoryId: '',
      name: product.name,
      slug: product.name.toLowerCase().replace(/\s+/g, '-'),
      description: product.description || '',
      price: Number(product.price),
      comparePrice: undefined,
      inventory: product.stock_quantity,
      images: product.image_url ? [{ url: product.image_url, alt: product.name, position: 0 }] : [],
      averageRating: product.average_rating ? Number(product.average_rating) : undefined,
      totalReviews: product.total_reviews || 0,
      type: product.type as 'product' | 'service' | undefined,
      is_available: product.is_available,
      duration_minutes: product.duration_minutes,
      booking_required: product.booking_required,
    };

    return {
      success: true,
      data: mappedProduct,
      message: 'Product fetched successfully'
    };
  },

  updateProduct: async (id: string, data: Partial<CreateProductRequest>) => {
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

    return {
      success: true,
      data: product as unknown as Product,
      message: 'Product updated successfully'
    };
  },

  deleteProduct: async (id: string) => {
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
  },
};

export default productService;