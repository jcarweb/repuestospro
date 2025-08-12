export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: VehicleCategory;
  subcategory: string;
  brand: string;
  stock: number;
  rating: number;
  reviews: number;
  specifications: ProductSpecification[];
  compatibleVehicles: string[];
  isNew?: boolean;
  isOnSale?: boolean;
  discountPercentage?: number;
}

export interface ProductSpecification {
  name: string;
  value: string;
}

export type VehicleCategory = 'car' | 'motorcycle' | 'truck';

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  productCount: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: Address;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  createdAt: Date;
  shippingAddress: Address;
  paymentMethod: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface SearchFilters {
  category?: VehicleCategory;
  brand?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: number;
  inStock?: boolean;
} 