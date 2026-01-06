import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CheckoutDraft {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  deliveryAddress?: string;
  paymentOption?: string;
}

interface ProductDraft {
  name?: string;
  description?: string;
  price?: number;
  stockQuantity?: number;
  type?: string;
  isAvailable?: boolean;
  imageUrl?: string;
}

interface OnboardingDraft {
  businessType?: string;
  businessName?: string;
  shopDescription?: string;
  currentStep?: number;
}

interface FormState {
  checkoutDraft: CheckoutDraft | null;
  productDraft: ProductDraft | null;
  onboardingDraft: OnboardingDraft | null;
  lastSaved: string | null;
}

const initialState: FormState = {
  checkoutDraft: null,
  productDraft: null,
  onboardingDraft: null,
  lastSaved: null,
};

const formSlice = createSlice({
  name: 'forms',
  initialState,
  reducers: {
    saveCheckoutDraft: (state, action: PayloadAction<CheckoutDraft>) => {
      state.checkoutDraft = { ...state.checkoutDraft, ...action.payload };
      state.lastSaved = new Date().toISOString();
    },
    clearCheckoutDraft: (state) => {
      state.checkoutDraft = null;
    },
    saveProductDraft: (state, action: PayloadAction<ProductDraft>) => {
      state.productDraft = { ...state.productDraft, ...action.payload };
      state.lastSaved = new Date().toISOString();
    },
    clearProductDraft: (state) => {
      state.productDraft = null;
    },
    saveOnboardingDraft: (state, action: PayloadAction<OnboardingDraft>) => {
      state.onboardingDraft = { ...state.onboardingDraft, ...action.payload };
      state.lastSaved = new Date().toISOString();
    },
    clearOnboardingDraft: (state) => {
      state.onboardingDraft = null;
    },
    clearAllDrafts: (state) => {
      state.checkoutDraft = null;
      state.productDraft = null;
      state.onboardingDraft = null;
      state.lastSaved = null;
    },
  },
});

export const {
  saveCheckoutDraft,
  clearCheckoutDraft,
  saveProductDraft,
  clearProductDraft,
  saveOnboardingDraft,
  clearOnboardingDraft,
  clearAllDrafts,
} = formSlice.actions;
export default formSlice.reducer;
