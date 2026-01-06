import { supabase } from '@/integrations/supabase/client';
import { Order, OrderItem } from '@/types/api';

export interface CreateOrderRequest {
  shopId: string;
  items: OrderItem[];
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryFee: number;
  notes?: string;
}

const orderService = {
  createOrder: async (data: CreateOrderRequest) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const totalAmount = data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) + data.deliveryFee;

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        shop_id: data.shopId,
        customer_id: user?.id || null,
        customer_name: data.customerName,
        customer_email: data.customerEmail,
        customer_phone: data.customerPhone,
        delivery_address: data.deliveryAddress,
        delivery_city: data.deliveryCity,
        delivery_state: data.deliveryState,
        delivery_fee: data.deliveryFee,
        notes: data.notes,
        total_amount: totalAmount,
        status: 'pending',
        payment_status: 'pending'
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Insert order items
    const orderItems = data.items.map(item => ({
      order_id: order.id,
      product_id: item.productId,
      quantity: item.quantity,
      price: item.price
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    return { id: order.id, status: order.status };
  },

  getOrders: async (params?: { page?: number; limit?: number; shopId?: string; status?: string }) => {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('orders')
      .select('*, order_items(*, products(*)), shops(name)', { count: 'exact' });

    if (params?.shopId) {
      query = query.eq('shop_id', params.shopId);
    }

    if (params?.status) {
      query = query.eq('status', params.status);
    }

    const { data, error, count } = await query
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      data: data || [],
      total: count || 0,
      page,
      limit
    };
  },

  getOrderById: async (id: string) => {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(*)), shops(shop_name, whatsapp_number)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  getOrdersByCustomer: async (customerId: string) => {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(*)), shops(shop_name)')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  updateOrderStatus: async (id: string, status: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  },

  getWhatsAppLink: async (id: string) => {
    const { data: order, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(name)), shops(shop_name, whatsapp_number)')
      .eq('id', id)
      .single();

    if (error) throw error;

    const shop = order.shops as { shop_name: string; whatsapp_number: string };
    const items = order.order_items as { quantity: number; price: number; products: { name: string } }[];
    
    const itemsList = items.map(item => 
      `- ${item.products.name} x${item.quantity} @ ₦${Number(item.price).toLocaleString()}`
    ).join('\n');

    const message = `Hello ${shop.shop_name}!\n\nI placed an order #${order.id.slice(0, 8)}:\n\n${itemsList}\n\nTotal: ₦${Number(order.total_amount).toLocaleString()}\n\nPlease confirm my order. Thank you!`;

    const whatsappLink = `https://wa.me/${shop.whatsapp_number?.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;

    return { whatsappLink, message };
  },
};

export default orderService;
