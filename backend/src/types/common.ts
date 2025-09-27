import { Request } from 'express';
import { Document } from 'mongoose';

// Tipos base mejorados
export interface BaseEntity {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Request types mejorados
export interface AuthenticatedRequest extends Request {
  user?: {
    _id?: string;
    id?: string;
    email?: string;
    role?: string;
    storeId?: string;
  } | undefined;
}

// Request type for routes that require authentication
export interface AuthenticatedRouteRequest extends Request {
  user: {
    _id: string;
    id: string;
    email: string;
    role: string;
    storeId?: string;
  };
}

export interface AdminRequest extends AuthenticatedRequest {
  user: {
    id: string;
    email: string;
    role: 'admin' | 'super_admin';
    storeId?: string;
  };
}

export interface StoreOwnerRequest extends AuthenticatedRequest {
  user: {
    id: string;
    email: string;
    role: 'store_owner' | 'admin' | 'super_admin';
    storeId: string;
  };
}

// Tipos de respuesta estandarizados
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{
    field: string;
    message: string;
  }>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// Tipos de coordenadas
export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Location {
  address: string;
  coordinates: Coordinates;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

// Tipos de inventario
export interface InventoryConfig {
  inventoryType: 'local' | 'global' | 'mixed';
  parentStore?: string;
  childStores?: string[];
  allowLocalStock: boolean;
  autoDistribute: boolean;
  distributionRules?: {
    minStock: number;
    maxStock: number;
    reorderPoint: number;
  };
}

// Tipos de delivery
export interface DeliveryLocation {
  address: string;
  coordinates: Coordinates;
  contactName?: string;
  contactPhone?: string;
  instructions?: string;
}

export interface DeliveryAssignment {
  riderId: string;
  estimatedTime: number;
  distance: number;
  cost: number;
  status: 'pending' | 'accepted' | 'rejected' | 'in_progress' | 'completed' | 'cancelled';
}

// Tipos de moneda
export interface Currency {
  code: string;
  symbol: string;
  rate: number;
}

// Tipos de notificación
export interface NotificationData {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  data?: Record<string, any>;
}

// Tipos de filtros
export interface FilterOptions {
  search?: string;
  category?: string;
  subcategory?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  storeId?: string;
  location?: Coordinates;
  radius?: number;
}

// Tipos de ordenamiento
export interface SortOptions {
  field: string;
  order: 'asc' | 'desc';
}

// Tipos de estadísticas
export interface Statistics {
  total: number;
  active: number;
  inactive: number;
  percentage: number;
}

// Tipos de archivo
export interface FileUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer?: Buffer;
}

// Tipos de configuración
export interface AppConfig {
  environment: 'development' | 'production' | 'test';
  port: number;
  database: {
    uri: string;
    options: Record<string, any>;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  cloudinary: {
    cloud_name: string;
    api_key: string;
    api_secret: string;
  };
}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

// Tipos de estado
export type Status = 'active' | 'inactive' | 'pending' | 'suspended' | 'deleted';
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
export type DeliveryStatus = 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'failed' | 'cancelled';
