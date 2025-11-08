// types/order.ts
export type OrderStatus = 
  | "awaiting_approval"    // For pay-on-delivery orders waiting for shop confirmation
  | "pending"              // Payment pending (for pay-before orders)
  | "confirmed"            // Payment confirmed, ready for processing
  | "processing"           // Order being prepared
  | "out_for_delivery"     // Order out for delivery
  | "delivered"            // Order delivered and completed
  | "cancelled";           // Order cancelled

export type PaymentStatus = 
  | "pending"
  | "paid"
  | "failed"
  | "refunded"
  | "on_delivery";        // For pay-on-delivery orders