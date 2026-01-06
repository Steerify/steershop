// Offer service - using mock data since offers table may not exist
export interface Offer {
  id: string;
  title: string;
  description: string;
  code?: string;
  discount_percentage?: number;
  valid_until?: string;
  target_audience: string;
  button_text: string;
  button_link: string;
  is_active: boolean;
  image_url?: string;
}

const offerService = {
  getOffers: async () => {
    // Return empty array - offers feature not yet implemented in database
    return {
      success: true,
      data: [] as Offer[],
      message: 'Offers fetched successfully'
    };
  },

  createOffer: async (data: Omit<Offer, 'id'>) => {
    return { success: false, data: null, message: 'Offers not implemented' };
  },

  updateOffer: async (id: string, data: Partial<Offer>) => {
    return { success: false, data: null, message: 'Offers not implemented' };
  },

  deleteOffer: async (id: string) => {
    return { success: false, data: null, message: 'Offers not implemented' };
  },
};

export default offerService;
