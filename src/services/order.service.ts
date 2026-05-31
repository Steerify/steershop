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

    // Fire email/SMS notification asynchronously
    supabase.from('shops')
      .select('shop_name, owner_id, whatsapp_number')
      .eq('id', data.shopId)
      .single()
      .then(async ({ data: shopInfo }) => {
        if (!shopInfo) return;
        const { data: profileInfo } = await supabase
          .from('profiles')
          .select('email, full_name')
          .eq('id', shopInfo.owner_id)
          .single();

        // Prepare items with names (since we only have productIds in `data.items`, we just map the raw data if names are missing. But data.items has names? OrderItem type usually has name)
        // OrderItem actually has `name`? Let's check: The edge function expects `items: [{ name, quantity, price }]`
        const emailItems = data.items.map(i => ({
          name: (i as any).name || (i as any).productName || 'Product',
          quantity: i.quantity,
          price: i.price
        }));

        supabase.functions.invoke('order-notifications', {
          body: {
            orderId: order.id,
            eventType: 'order_placed',
            shopName: shopInfo.shop_name,
            customerEmail: data.customerEmail,
            customerName: data.customerName,
            totalAmount: totalAmount,
            items: emailItems,
            shopOwnerEmail: profileInfo?.email,
            shopOwnerPhone: shopInfo.whatsapp_number,
          }
        }).catch(err => console.error('Failed to invoke order-notifications:', err));
      });

    return { id: order.id, status: order.status };
  },

  getOrders: async (params?: { page?: number; limit?: number; shopId?: string; status?: string }) => {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('orders')
      .select('*, order_items(*, products(*)), shops(shop_name)', { count: 'exact' });

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

  updateOrderStatus: async (id: string, status: string, extraFields?: Record<string, any>) => {
    const updateData: Record<string, any> = { 
      status,
      updated_at: new Date().toISOString(),
    };

    // Add timestamp for specific status transitions
    if (status === 'confirmed') updateData.confirmed_at = new Date().toISOString();
    if (status === 'processing') updateData.processing_at = new Date().toISOString();
    if (status === 'out_for_delivery') updateData.out_for_delivery_at = new Date().toISOString();
    if (status === 'delivered') updateData.delivered_at = new Date().toISOString();
    if (status === 'completed') updateData.completed_at = new Date().toISOString();
    if (status === 'cancelled') updateData.cancelled_at = new Date().toISOString();

    // Merge any extra fields (cancelled_by, payment_status, etc.)
    if (extraFields) {
      Object.assign(updateData, extraFields);
    }

    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;

    // Fire email/SMS notification asynchronously
    supabase.from('orders')
      .select('*, order_items(*, products(name)), shops(shop_name)')
      .eq('id', id)
      .single()
      .then(({ data: orderFull }) => {
        if (!orderFull) return;
        
        const itemsList = (orderFull.order_items || []).map((i: any) => ({
          name: i.products?.name || 'Item',
          quantity: i.quantity,
          price: i.price
        }));

        supabase.functions.invoke('order-notifications', {
          body: {
            orderId: id,
            eventType: 'status_update',
            statusUpdate: status,
            shopName: orderFull.shops?.shop_name || 'SteerSolo Shop',
            customerEmail: orderFull.customer_email,
            customerName: orderFull.customer_name,
            totalAmount: orderFull.total_amount,
            items: itemsList,
          }
        }).catch(err => console.error('Failed to invoke order-notifications on update:', err));
      });

    return { success: true };
  },

  // Buyer (or admin) confirms delivery and releases the escrowed funds to the vendor.
  releaseEscrow: async (orderId: string) => {
    const { data, error } = await supabase.functions.invoke('release-escrow', {
      body: { orderId },
    });

    if (error) {
      // Surface the edge function's JSON error message when available
      const ctx = (error as any)?.context;
      let message = error.message;
      try {
        if (ctx && typeof ctx.json === 'function') {
          const body = await ctx.json();
          if (body?.error) message = body.error;
        }
      } catch {
        // ignore parse errors, fall back to error.message
      }
      throw new Error(message || 'Failed to release escrow');
    }

    if (data?.error) throw new Error(data.error);
    return data as { success: boolean; message: string; vendorAmount?: number; platformFee?: number };
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
