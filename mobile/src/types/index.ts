export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'client' | 'store_manager' | 'delivery';
  referralCode?: string;
  isEmailVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: 'client';
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  subcategory?: string;
  store: string;
  stock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Store {
  _id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Subcategory {
  _id: string;
  name: string;
  description?: string;
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  _id: string;
  user: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}
