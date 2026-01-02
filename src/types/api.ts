// src/types/api.ts

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: boolean;
  message: string;
  error?: any;
  errors?: any;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
}

export enum UserRole {
  CUSTOMER = "CUSTOMER",
  ENTREPRENEUR = "ENTREPRENEUR",
  ADMIN = "ADMIN",
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  phone?: string;
  profile?: any;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthData {
  user: User;
  tokens: AuthTokens;
}

export interface Shop {
  id: string;
  name: string;
  slug: string;
  description?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  city?: string;
  state?: string;
}

export interface ProductImage {
  url: string;
  alt: string;
  position: number;
}

export interface Product {
  id: string;
  shopId: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number;
  inventory: number;
  images: ProductImage[];
  averageRating?: number;
  totalReviews?: number;
  type?: 'product' | 'service';
  reviews?: any[];
}

export interface OrderItem {
  productId: string;
  quantity: number;
}

export interface Order {
  id: string;
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
  status: string;
}

export interface PaymentInitialization {
  authorizationUrl: string;
  reference: string;
}

export interface PaymentVerification {
  status: "SUCCESS" | "FAILED" | "PENDING";
}
