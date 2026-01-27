import { supabase } from "@/integrations/supabase/client";

export interface MarketingService {
  id: string;
  shop_id: string;
  service_type: 'youtube_ads' | 'google_ads' | 'consultation' | 'seo' | 'google_my_business';
  status: 'pending' | 'scheduled' | 'in_progress' | 'completed';
  consultation_date?: string;
  consultation_notes?: string;
  amount?: number;
  payment_reference?: string;
  payment_status: 'pending' | 'paid' | 'failed';
  google_profile_url?: string;
  created_at: string;
  updated_at: string;
}

const marketingServicesService = {
  getServicesByShop: async (shopId: string) => {
    const { data, error } = await supabase
      .from('marketing_services')
      .select('*')
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data: data as MarketingService[] };
  },

  requestConsultation: async (shopId: string, serviceType: string, notes?: string) => {
    const { data, error } = await supabase
      .from('marketing_services')
      .insert({
        shop_id: shopId,
        service_type: serviceType,
        status: 'pending',
        consultation_notes: notes,
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data: data as MarketingService };
  },

  updateGoogleProfile: async (shopId: string, profileUrl: string) => {
    // First check if there's an existing google_my_business service
    const { data: existing } = await supabase
      .from('marketing_services')
      .select('*')
      .eq('shop_id', shopId)
      .eq('service_type', 'google_my_business')
      .maybeSingle();

    if (existing) {
      const { data, error } = await supabase
        .from('marketing_services')
        .update({ google_profile_url: profileUrl })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data: data as MarketingService };
    } else {
      const { data, error } = await supabase
        .from('marketing_services')
        .insert({
          shop_id: shopId,
          service_type: 'google_my_business',
          status: 'completed',
          google_profile_url: profileUrl,
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data: data as MarketingService };
    }
  },

  updateServiceStatus: async (serviceId: string, status: string, notes?: string) => {
    const updates: any = { status };
    if (notes) updates.consultation_notes = notes;
    
    const { data, error } = await supabase
      .from('marketing_services')
      .update(updates)
      .eq('id', serviceId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data: data as MarketingService };
  },

  scheduleConsultation: async (serviceId: string, consultationDate: string) => {
    const { data, error } = await supabase
      .from('marketing_services')
      .update({ 
        consultation_date: consultationDate,
        status: 'scheduled'
      })
      .eq('id', serviceId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data: data as MarketingService };
  },
};

export default marketingServicesService;
