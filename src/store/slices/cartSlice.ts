import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string | null;
  type?: string | null;
}

interface CartState {
  items: CartItem[];
  shopId: string | null;
  shopSlug: string | null;
  lastUpdated: string | null;
}

const initialState: CartState = {
  items: [],
  shopId: null,
  shopSlug: null,
  lastUpdated: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<{ item: CartItem; shopId: string; shopSlug: string }>) => {
      const { item, shopId, shopSlug } = action.payload;
      
      // Clear cart if switching shops
      if (state.shopId && state.shopId !== shopId) {
        state.items = [];
      }
      
      state.shopId = shopId;
      state.shopSlug = shopSlug;
      
      const existingItem = state.items.find((i) => i.id === item.id);
      if (existingItem) {
        existingItem.quantity += item.quantity;
      } else {
        state.items.push(item);
      }
      state.lastUpdated = new Date().toISOString();
    },
    updateCartQuantity: (state, action: PayloadAction<{ itemId: string; quantity: number }>) => {
      const { itemId, quantity } = action.payload;
      const item = state.items.find((i) => i.id === itemId);
      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter((i) => i.id !== itemId);
        } else {
          item.quantity = quantity;
        }
        state.lastUpdated = new Date().toISOString();
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((i) => i.id !== action.payload);
      state.lastUpdated = new Date().toISOString();
      if (state.items.length === 0) {
        state.shopId = null;
        state.shopSlug = null;
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.shopId = null;
      state.shopSlug = null;
      state.lastUpdated = null;
    },
  },
});

export const { addToCart, updateCartQuantity, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
