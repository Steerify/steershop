// hooks/useOrderManagement.ts
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

export const useOrderManagement = () => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const updateOrderStatus = async (orderId: string, updates: {
    status: string;
    payment_status?: string;
    payment_reference?: string;
  }) => {
    setIsProcessing(true);
    
    try {
      const updateData: any = {
        status: updates.status,
        ...updates
      };

      // Add timestamps based on status
      const timestampFields = {
        confirmed: 'confirmed_at',
        paid_awaiting_delivery: 'confirmed_at',
        processing: 'processing_at',
        out_for_delivery: 'out_for_delivery_at',
        delivered: 'delivered_at',
        completed: 'completed_at',
        cancelled: 'cancelled_at'
      };

      if (timestampFields[updates.status as keyof typeof timestampFields]) {
        updateData[timestampFields[updates.status as keyof typeof timestampFields]] = new Date().toISOString();
      }

      const { error } = await supabase
        .from("orders")
        .update(updateData)
        .eq("id", orderId);

      if (error) throw error;

      toast({
        title: "Order Updated",
        description: `Order status changed to ${updates.status}`,
      });

      return { success: true };
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error: error.message };
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentVerification = async (orderId: string, paymentReference: string) => {
    return await updateOrderStatus(orderId, {
      status: "confirmed",
      payment_status: "paid",
      payment_reference: paymentReference
    });
  };

const getOrderStatusFlow = (currentStatus: string) => {
  const flows: Record<string, string[]> = {
    awaiting_approval: ["confirmed", "cancelled"],
    pending: ["confirmed", "cancelled"],
    confirmed: ["processing", "cancelled"],
    paid_awaiting_delivery: ["processing", "cancelled"],
    processing: ["out_for_delivery", "cancelled"],
    out_for_delivery: ["delivered", "cancelled"],
    delivered: ["completed"],
    completed: [],
    cancelled: []
  };

  return flows[currentStatus] || [];
};

  return {
    updateOrderStatus,
    handlePaymentVerification,
    getOrderStatusFlow,
    isProcessing
  };
};