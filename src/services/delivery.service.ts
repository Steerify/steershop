import { supabase } from '@/integrations/supabase/client';

export interface DeliveryAddress {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country?: string;
  postal_code?: string;
}

export interface DeliveryRate {
  carrier: string;
  carrier_logo?: string;
  price: number;
  currency: string;
  estimated_days: number;
  rate_id: string;
}

export interface CreateDeliveryRequest {
  order_id: string;
  shop_id: string;
  provider: 'terminal' | 'sendbox' | 'manual';
  pickup_address: DeliveryAddress;
  delivery_address: DeliveryAddress;
  delivery_fee: number;
  weight_kg?: number;
  dimensions?: { length: number; width: number; height: number };
  provider_tracking_code?: string;
  estimated_delivery_date?: string;
}

export interface DeliveryOrder {
  id: string;
  order_id: string;
  shop_id: string;
  provider: string;
  provider_shipment_id: string | null;
  provider_tracking_code: string | null;
  pickup_address: DeliveryAddress;
  delivery_address: DeliveryAddress;
  weight_kg: number | null;
  dimensions: { length: number; width: number; height: number } | null;
  delivery_fee: number;
  currency: string;
  status: string;
  estimated_delivery_date: string | null;
  picked_up_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TrackingEvent {
  id: string;
  delivery_order_id: string;
  status: string;
  description: string | null;
  location: string | null;
  provider_event_id: string | null;
  created_at: string;
}

const deliveryService = {
  // Get delivery rates from logistics providers
  getRates: async (data: {
    order_id: string;
    pickup_address: DeliveryAddress;
    delivery_address: DeliveryAddress;
    weight_kg?: number;
  }): Promise<DeliveryRate[]> => {
    try {
      const response = await supabase.functions.invoke('logistics-get-rates', {
        body: data,
      });

      if (response.error) throw response.error;
      return response.data?.rates || [];
    } catch (error) {
      console.error('Error getting delivery rates:', error);
      // Return empty array - UI will offer manual booking fallback
      return [];
    }
  },

  // Book delivery with a logistics provider
  bookDelivery: async (data: {
    order_id: string;
    shop_id: string;
    rate_id?: string;
    provider: 'terminal' | 'sendbox' | 'manual';
    pickup_address: DeliveryAddress;
    delivery_address: DeliveryAddress;
    delivery_fee: number;
    weight_kg?: number;
    dimensions?: { length: number; width: number; height: number };
    tracking_code?: string;
    estimated_delivery_date?: string;
  }): Promise<{ delivery_order_id: string; tracking_code?: string }> => {
    if (data.provider === 'manual') {
      // For manual bookings, directly insert into database
      const insertData = {
        order_id: data.order_id,
        shop_id: data.shop_id,
        provider: 'manual' as const,
        provider_tracking_code: data.tracking_code || null,
        pickup_address: data.pickup_address as unknown as Record<string, unknown>,
        delivery_address: data.delivery_address as unknown as Record<string, unknown>,
        delivery_fee: data.delivery_fee,
        weight_kg: data.weight_kg || null,
        dimensions: data.dimensions as unknown as Record<string, unknown> | null,
        status: 'confirmed' as const,
        estimated_delivery_date: data.estimated_delivery_date || null,
      };

      const { data: deliveryOrder, error } = await supabase
        .from('delivery_orders')
        .insert([insertData] as any)
        .select()
        .single();

      if (error) throw error;

      // Add initial tracking event
      await supabase.from('delivery_tracking_events').insert({
        delivery_order_id: deliveryOrder.id,
        status: 'confirmed',
        description: 'Delivery booked manually',
      });

      return {
        delivery_order_id: deliveryOrder.id,
        tracking_code: data.tracking_code,
      };
    }

    // For API-based providers, call the edge function
    const response = await supabase.functions.invoke('logistics-book-delivery', {
      body: data,
    });

    if (response.error) throw response.error;
    return response.data;
  },

  // Get delivery order by ID
  getDeliveryOrder: async (deliveryOrderId: string): Promise<DeliveryOrder | null> => {
    const { data, error } = await supabase
      .from('delivery_orders')
      .select('*')
      .eq('id', deliveryOrderId)
      .single();

    if (error) {
      console.error('Error fetching delivery order:', error);
      return null;
    }

    return data as unknown as DeliveryOrder;
  },

  // Get delivery order by order ID
  getDeliveryByOrderId: async (orderId: string): Promise<DeliveryOrder | null> => {
    const { data, error } = await supabase
      .from('delivery_orders')
      .select('*')
      .eq('order_id', orderId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching delivery order:', error);
      return null;
    }

    return data as unknown as DeliveryOrder | null;
  },

  // Get tracking events for a delivery
  getTrackingEvents: async (deliveryOrderId: string): Promise<TrackingEvent[]> => {
    const { data, error } = await supabase
      .from('delivery_tracking_events')
      .select('*')
      .eq('delivery_order_id', deliveryOrderId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tracking events:', error);
      return [];
    }

    return data as unknown as TrackingEvent[];
  },

  // Update delivery status (for manual entries)
  updateDeliveryStatus: async (
    deliveryOrderId: string,
    status: string,
    description?: string,
    location?: string
  ): Promise<boolean> => {
    const now = new Date().toISOString();
    const updates: Record<string, any> = { status };

    // Set timestamp based on status
    if (status === 'picked_up') updates.picked_up_at = now;
    if (status === 'delivered') updates.delivered_at = now;
    if (status === 'cancelled') updates.cancelled_at = now;

    const { error: updateError } = await supabase
      .from('delivery_orders')
      .update(updates)
      .eq('id', deliveryOrderId);

    if (updateError) {
      console.error('Error updating delivery status:', updateError);
      return false;
    }

    // Add tracking event
    const { error: eventError } = await supabase
      .from('delivery_tracking_events')
      .insert({
        delivery_order_id: deliveryOrderId,
        status,
        description: description || `Status updated to ${status}`,
        location,
      });

    if (eventError) {
      console.error('Error creating tracking event:', eventError);
    }

    return true;
  },

  // Get shop addresses (pickup locations)
  getShopAddresses: async (shopId: string) => {
    const { data, error } = await supabase
      .from('shop_addresses')
      .select('*')
      .eq('shop_id', shopId)
      .order('is_default', { ascending: false });

    if (error) {
      console.error('Error fetching shop addresses:', error);
      return [];
    }

    return data;
  },

  // Save shop address
  saveShopAddress: async (data: {
    shop_id: string;
    label: string;
    contact_name: string;
    contact_phone: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state: string;
    postal_code?: string;
    is_default?: boolean;
  }) => {
    const { data: address, error } = await supabase
      .from('shop_addresses')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return address;
  },

  // Delete shop address
  deleteShopAddress: async (addressId: string) => {
    const { error } = await supabase
      .from('shop_addresses')
      .delete()
      .eq('id', addressId);

    if (error) throw error;
    return true;
  },
};

export default deliveryService;
