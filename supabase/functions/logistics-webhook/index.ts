import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-terminal-signature, x-terminal-timestamp',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const TERMINAL_WEBHOOK_SECRET = Deno.env.get('TERMINAL_WEBHOOK_SECRET');

// Status mapping from Terminal Africa to our statuses
const STATUS_MAP: Record<string, string> = {
  'pending': 'pending',
  'confirmed': 'confirmed',
  'picked-up': 'picked_up',
  'picked_up': 'picked_up',
  'in-transit': 'in_transit',
  'in_transit': 'in_transit',
  'out-for-delivery': 'out_for_delivery',
  'out_for_delivery': 'out_for_delivery',
  'delivered': 'delivered',
  'cancelled': 'cancelled',
  'failed': 'failed',
  'return': 'returned',
};

// Key statuses that should trigger customer/vendor notifications
const NOTIFY_STATUSES = ['picked_up', 'out_for_delivery', 'delivered', 'failed', 'cancelled'];

/**
 * Verify Terminal Africa webhook signature
 * Terminal sends: x-terminal-signature = HMAC-SHA256(timestamp + "." + rawBody, secret)
 */
function verifyTerminalSignature(timestamp: string, signature: string, rawBody: string): boolean {
  if (!TERMINAL_WEBHOOK_SECRET) {
    console.warn('TERMINAL_WEBHOOK_SECRET not configured - skipping signature verification');
    return true; // Allow in development if no secret configured
  }

  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(TERMINAL_WEBHOOK_SECRET);
    const messageData = encoder.encode(`${timestamp}.${rawBody}`);

    // Use Web Crypto API for HMAC
    const cryptoKey = crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signatureBuffer = crypto.subtle.sign('HMAC', await cryptoKey, messageData);
    
    // Convert to hex string
    const signatureArray = new Uint8Array(signatureBuffer);
    const expectedSignature = Array.from(signatureArray)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    return signature === expectedSignature;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-terminal-signature') || '';
    const timestamp = req.headers.get('x-terminal-timestamp') || '';

    // Verify Terminal signature
    if (signature && !verifyTerminalSignature(timestamp, signature, rawBody)) {
      console.error('Invalid Terminal webhook signature');
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = JSON.parse(rawBody);
    console.log('Webhook received:', JSON.stringify(body));

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Handle different webhook formats
    const event = body.event || body.type;
    const data = body.data || body;

    // Find the delivery order
    let deliveryOrder = null;
    
    // Try by provider_shipment_id first (most reliable for Terminal)
    if (data.shipment_id || data.id) {
      const shipmentId = data.shipment_id || data.id;
      const { data: order } = await supabase
        .from('delivery_orders')
        .select('*')
        .eq('provider_shipment_id', shipmentId)
        .maybeSingle();
      deliveryOrder = order;
    }

    // Try by order_id in metadata
    if (!deliveryOrder && data.metadata?.order_id) {
      const { data: order } = await supabase
        .from('delivery_orders')
        .select('*')
        .eq('order_id', data.metadata.order_id)
        .maybeSingle();
      deliveryOrder = order;
    }

    // Try by provider_tracking_code
    if (!deliveryOrder && data.tracking_number) {
      const { data: order } = await supabase
        .from('delivery_orders')
        .select('*')
        .eq('provider_tracking_code', data.tracking_number)
        .maybeSingle();
      deliveryOrder = order;
    }

    if (!deliveryOrder) {
      console.log('Delivery order not found for webhook');
      return new Response(
        JSON.stringify({ success: true, message: 'Delivery order not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Map status
    const rawStatus = data.status || event?.replace('shipment.', '');
    const mappedStatus = STATUS_MAP[rawStatus] || rawStatus;

    // Build updates
    const updates: Record<string, any> = { status: mappedStatus };
    
    if (mappedStatus === 'picked_up') {
      updates.picked_up_at = new Date().toISOString();
    }
    if (mappedStatus === 'delivered') {
      updates.delivered_at = new Date().toISOString();
    }
    if (mappedStatus === 'cancelled') {
      updates.cancelled_at = new Date().toISOString();
    }

    // Update tracking code if provided
    if (data.tracking_number && !deliveryOrder.provider_tracking_code) {
      updates.provider_tracking_code = data.tracking_number;
    }

    // Update label URL if provided
    if (data.label_url && !deliveryOrder.label_url) {
      updates.label_url = data.label_url;
    }

    // Update delivery order
    await supabase
      .from('delivery_orders')
      .update(updates)
      .eq('id', deliveryOrder.id);

    // Create tracking event with notification flags
    const shouldNotifyVendor = NOTIFY_STATUSES.includes(mappedStatus);
    const shouldNotifyCustomer = NOTIFY_STATUSES.includes(mappedStatus) && ['delivered', 'out_for_delivery'].includes(mappedStatus);

    await supabase.from('delivery_tracking_events').insert({
      delivery_order_id: deliveryOrder.id,
      status: mappedStatus,
      description: data.description || `Status updated to ${mappedStatus}`,
      location: data.location || data.current_location || null,
      provider_event_id: data.event_id || data.id || null,
      notify_vendor: shouldNotifyVendor,
      notify_customer: shouldNotifyCustomer,
    });

    // Update related order status
    if (mappedStatus === 'delivered') {
      await supabase
        .from('orders')
        .update({
          status: 'delivered',
          delivered_at: new Date().toISOString(),
        })
        .eq('id', deliveryOrder.order_id);

      // Queue delivery confirmation notification
      await queueDeliveryNotification(supabase, deliveryOrder.order_id, 'delivered');
    }

    if (mappedStatus === 'out_for_delivery') {
      await supabase
        .from('orders')
        .update({
          status: 'out_for_delivery',
          out_for_delivery_at: new Date().toISOString(),
        })
        .eq('id', deliveryOrder.order_id);

      await queueDeliveryNotification(supabase, deliveryOrder.order_id, 'out_for_delivery');
    }

    if (mappedStatus === 'failed') {
      await supabase
        .from('orders')
        .update({
          status: 'failed',
        })
        .eq('id', deliveryOrder.order_id);

      await queueDeliveryNotification(supabase, deliveryOrder.order_id, 'failed');
    }

    // Queue notifications asynchronously
    if (shouldNotifyVendor || shouldNotifyCustomer) {
      // Notifications are queued via the trigger, actual email sending handled by process-email-queue
      console.log(`Notification queued - vendor: ${shouldNotifyVendor}, customer: ${shouldNotifyCustomer}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Webhook processed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 200, // Return 200 to prevent webhook retries for our own errors
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

/**
 * Queue a delivery notification email via the email queue
 */
async function queueDeliveryNotification(
  supabase: any, 
  orderId: string, 
  eventType: 'picked_up' | 'out_for_delivery' | 'delivered' | 'failed'
) {
  try {
    // Get order and customer details
    const { data: order } = await supabase
      .from('orders')
      .select(`
        *,
        customer:profiles!orders_customer_id_fkey (
          email,
          full_name
        ),
        shop:shops (
          shop_name,
          owner_id
        )
      `)
      .eq('id', orderId)
      .single();

    if (!order) return;

    const customerEmail = order.customer?.email;
    const customerName = order.customer?.full_name || 'Customer';
    const shopName = order.shop?.shop_name;

    // Queue customer notification
    if (customerEmail) {
      const subjectLines: Record<string, string> = {
        'picked_up': `📦 Your order from ${shopName} has been picked up!`,
        'out_for_delivery': `🚚 Your order from ${shopName} is out for delivery!`,
        'delivered': `✅ Your order from ${shopName} has been delivered!`,
        'failed': `⚠️ Issue with your order from ${shopName}`,
      };

      const emailBody = getDeliveryEmailTemplate(eventType, customerName, shopName, order);

      await supabase.rpc('pgmq_send', {
        queue_name: 'transactional_emails',
        msg: {
          to: customerEmail,
          subject: subjectLines[eventType],
          html: emailBody,
          label: `delivery_${eventType}`,
          metadata: { order_id: orderId }
        }
      }).catch(() => {
        // Fallback: just log it
        console.log(`Would send ${eventType} email to ${customerEmail}`);
      });
    }
  } catch (error) {
    console.error('Error queuing delivery notification:', error);
  }
}

function getDeliveryEmailTemplate(eventType: string, customerName: string, shopName: string, order: any): string {
  const baseStyles = 'font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;';
  
  const templates: Record<string, { subject: string; body: string }> = {
    'picked_up': {
      subject: `📦 Your order has been picked up!`,
      body: `
        <div style="${baseStyles}">
          <h2 style="color: #123C72;">Hi ${customerName},</h2>
          <p>Great news! Your order from <strong>${shopName}</strong> has been picked up by the delivery carrier.</p>
          <p>Track your package using the tracking details in your order confirmation email.</p>
          <p>We'll notify you when it's out for delivery!</p>
        </div>
      `
    },
    'out_for_delivery': {
      subject: `🚚 Your order is out for delivery!`,
      body: `
        <div style="${baseStyles}">
          <h2 style="color: #123C72;">Hi ${customerName},</h2>
          <p>Your order from <strong>${shopName}</strong> is out for delivery today!</p>
          <p>Please ensure someone is available to receive the package. The delivery person may call you before arriving.</p>
        </div>
      `
    },
    'delivered': {
      subject: `✅ Your order has been delivered!`,
      body: `
        <div style="${baseStyles}">
          <h2 style="color: #123C72;">Hi ${customerName},</h2>
          <p>Your order from <strong>${shopName}</strong> has been delivered!</p>
          <p>We hope you enjoy your purchase. If you have any issues, please contact the seller.</p>
        </div>
      `
    },
    'failed': {
      subject: `⚠️ Issue with your delivery`,
      body: `
        <div style="${baseStyles}">
          <h2 style="color: #e74c3c;">Hi ${customerName},</h2>
          <p>There was an issue delivering your order from <strong>${shopName}</strong>.</p>
          <p>The seller has been notified and will reach out to resolve this. Please check your WhatsApp for updates.</p>
        </div>
      `
    }
  };

  return templates[eventType]?.body || templates['picked_up'].body;
}
