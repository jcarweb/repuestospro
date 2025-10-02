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

// Tipos de usuario actualizados
export type UserRole = 'admin' | 'client' | 'delivery' | 'store_manager' | 'seller';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  isEmailVerified: boolean;
  isActive: boolean;
  pin?: string;
  fingerprintEnabled?: boolean;
  twoFactorEnabled?: boolean;
  loyaltyLevel?: 'bronze' | 'silver' | 'gold' | 'platinum';
  createdAt?: string;
  
  // Ubicación GPS
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
  locationEnabled?: boolean;
  lastLocationUpdate?: string;
  
  // Sistema de fidelización
  points?: number;
  referralCode?: string;
  referredBy?: string;
  totalPurchases?: number;
  totalSpent?: number;
  
  // Configuraciones de notificaciones
  notificationsEnabled?: boolean;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  marketingEmails?: boolean;
  
  // Campos específicos para Delivery
  deliveryStatus?: 'available' | 'unavailable' | 'busy' | 'on_route' | 'returning_to_store';
  autoStatusMode?: boolean;
  currentOrder?: string;
  deliveryZone?: {
    center: [number, number];
    radius: number;
  };
  vehicleInfo?: {
    type: string;
    model: string;
    plate: string;
  };
  workSchedule?: {
    startTime: string;
    endTime: string;
    daysOfWeek: number[];
  };
  
  // Campos específicos para Store Manager
  storeInfo?: {
    name: string;
    address: string;
    phone: string;
    email: string;
    description?: string;
    logo?: string;
    banner?: string;
    businessHours?: {
      [key: string]: {
        open: string;
        close: string;
        closed: boolean;
      };
    };
    deliverySettings?: {
      enabled: boolean;
      freeDeliveryThreshold: number;
      deliveryFee: number;
      maxDeliveryDistance: number;
    };
    paymentSettings?: {
      cash: boolean;
      card: boolean;
      transfer: boolean;
      digitalWallet: boolean;
    };
  };
  commissionRate?: number;
  taxRate?: number;
  
  // Campos específicos para Admin
  adminPermissions?: {
    userManagement: boolean;
    systemConfiguration: boolean;
    analyticsAccess: boolean;
    codeGeneration: boolean;
    globalSettings: boolean;
  };
  
  // Campos específicos para Seller (Vendedor)
  sellerInfo?: {
    storeId: string;
    storeName: string;
    branchId?: string;
    branchName?: string;
    isActive: boolean;
    canViewPrices: boolean;
    canChat: boolean;
    canCreateQuotes: boolean;
    maxDiscountPercentage: number;
    assignedCategories: string[];
    workSchedule?: {
      startTime: string;
      endTime: string;
      daysOfWeek: number[];
    };
    performanceMetrics?: {
      totalQueries: number;
      successfulSales: number;
      averageResponseTime: number;
      customerRating: number;
    };
  };
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
  deliveryStatus?: DeliveryStatus;
  assignedDelivery?: string;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  customerRating?: number;
  customerReview?: string;
  deliveryRating?: number;
  deliveryReview?: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export type DeliveryStatus = 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'failed' | 'returned';

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

// Tipos para el sistema de delivery
export interface DeliveryOrder {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: Address;
  deliveryInstructions?: string;
  status: DeliveryStatus;
  assignedTo?: string;
  assignedAt?: Date;
  pickedUpAt?: Date;
  deliveredAt?: Date;
  estimatedDeliveryTime?: Date;
  actualDeliveryTime?: Date;
  customerRating?: number;
  customerReview?: string;
  deliveryRating?: number;
  deliveryReview?: string;
  route?: {
    start: [number, number];
    end: [number, number];
    waypoints?: [number, number][];
  };
}

// Tipos para el sistema de tienda
export interface Store {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  description?: string;
  logo?: string;
  banner?: string;
  businessHours: {
    [key: string]: {
      open: string;
      close: string;
      closed: boolean;
    };
  };
  deliverySettings: {
    enabled: boolean;
    freeDeliveryThreshold: number;
    deliveryFee: number;
    maxDeliveryDistance: number;
  };
  paymentSettings: {
    cash: boolean;
    card: boolean;
    transfer: boolean;
    digitalWallet: boolean;
  };
  commissionRate: number;
  taxRate: number;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

// Tipos para el sistema de lealtad
export interface LoyaltyPoints {
  userId: string;
  points: number;
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  totalEarned: number;
  totalSpent: number;
  nextLevelPoints: number;
  pointsToNextLevel: number;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  type: 'coupon' | 'product' | 'service';
  value: number;
  maxRedemptions?: number;
  currentRedemptions: number;
  isActive: boolean;
  expiresAt?: Date;
  createdAt: string;
}

export interface RewardRedemption {
  id: string;
  userId: string;
  rewardId: string;
  pointsSpent: number;
  redeemedAt: string;
  status: 'active' | 'used' | 'expired';
  usedAt?: string;
  expiresAt?: string;
} 