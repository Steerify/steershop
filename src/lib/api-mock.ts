// src/lib/api-mock.ts

export const mockProfiles = [
  {
    id: "33344",
    email: "oladimejivictor611@gmail.com",
    full_name: "Mocked User",
    role: "shop_owner",
    onboarding_completed: true,
    created_at: new Date().toISOString(),
  }
];

export const mockShops = [
  {
    id: "shop-1",
    owner_id: "33344",
    name: "My Awesome Shop",
    slug: "my-awesome-shop",
    description: "A great place for great things.",
    created_at: new Date().toISOString(),
  }
];

export const mockProducts = [
  {
    id: "prod-1",
    shop_id: "shop-1",
    name: "Cool Product",
    price: 1000,
    description: "This is a cool product.",
    image_url: "https://picsum.photos/200/300",
  }
];

export const mockOrders = [
  {
    id: "order-1",
    user_id: "33344",
    shop_id: "shop-1",
    total: 1000,
    status: "pending",
    created_at: new Date().toISOString(),
  }
];

// generic mock fetcher to replace supabase calls
export const mockApi = {
  profiles: {
    get: async (id: string) => mockProfiles.find(p => p.id === id) || null,
  },
  shops: {
    list: async () => mockShops,
    getByOwner: async (ownerId: string) => mockShops.find(s => s.owner_id === ownerId) || null,
  },
  products: {
    list: async (shopId?: string) => shopId ? mockProducts.filter(p => p.shop_id === shopId) : mockProducts,
  },
  orders: {
    list: async (userId: string) => mockOrders.filter(o => o.user_id === userId),
  }
};
