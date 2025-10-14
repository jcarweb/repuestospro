// Product Service for Mobile App - Real Database Connection Only
import { getBaseURL } from '../config/api';

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  brand?: string;
  subcategory?: string;
  vehicleType?: string;
  sku: string;
  originalPartCode?: string;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  images: string[];
  tags: string[];
  specifications: Record<string, any>;
  store: {
    _id: string;
    name: string;
    city: string;
    state?: string;
  };
  createdBy?: {
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Store {
  _id: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  phone?: string;
  email?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  isActive: boolean;
  owner: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  category?: string;
  brand?: string;
  subcategory?: string;
  vehicleType?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  storeId?: string;
  isFeatured?: boolean;
}

export interface ProductResponse {
  success: boolean;
  data?: Product[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  error?: string;
}

export interface StoreResponse {
  success: boolean;
  data?: {
    stores: Store[];
    pagination: {
      currentPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  error?: string;
}

export interface CategoryResponse {
  success: boolean;
  data?: string[];
  error?: string;
}

export interface BrandResponse {
  success: boolean;
  data?: string[];
  error?: string;
}

export interface VehicleTypeResponse {
  success: boolean;
  data?: string[];
  error?: string;
}

export interface SubcategoryResponse {
  success: boolean;
  data?: string[];
  error?: string;
}

export interface DashboardStatsResponse {
  success: boolean;
  data?: {
    users: {
      total: number;
      active: number;
      newThisMonth: number;
      byRole: Array<{ _id: string; count: number }>;
    };
    products: {
      total: number;
      active: number;
      lowStock: number;
      outOfStock: number;
      byCategory: Array<{ _id: string; count: number; avgPrice: number }>;
    };
    stores: {
      total: number;
      active: number;
      byCity: Array<{ _id: string; count: number }>;
    };
    orders: {
      total: number;
      pending: number;
      completed: number;
      pendingDeliveries: number;
      recent: Array<any>;
    };
    revenue: {
      total: number;
      monthly: number;
    };
  };
  error?: string;
}

class ProductService {
  private baseUrl: string;
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  constructor() {
    this.baseUrl = '';
    this.initializeBaseUrl();
  }

  private async initializeBaseUrl() {
    try {
      this.baseUrl = await getBaseURL();
      console.log('🔧 ProductService initialized with base URL:', this.baseUrl);
    } catch (error) {
      console.error('❌ Error initializing ProductService base URL:', error);
    }
  }

  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  private setCachedData<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  async getProducts(filters: ProductFilters = {}): Promise<ProductResponse> {
    try {
      // Verificar caché primero
      const cacheKey = `products_${JSON.stringify(filters)}`;
      const cached = this.getCachedData<ProductResponse>(cacheKey);
      if (cached) {
        return cached;
      }

      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const url = `${this.baseUrl}/products?${queryParams.toString()}`;
      console.log('📦 Fetching products from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        this.setCachedData(cacheKey, data);
        return data;
      } else {
        return {
          success: false,
          error: data.message || 'Error desconocido'
        };
      }
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async getStores(): Promise<StoreResponse> {
    try {
      // Verificar caché primero
      const cacheKey = 'stores';
      const cached = this.getCachedData<StoreResponse>(cacheKey);
      if (cached) {
        return cached;
      }

      const url = `${this.baseUrl}/stores`;
      console.log('🏪 Fetching stores from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        this.setCachedData(cacheKey, data);
        return data;
      } else {
        return {
          success: false,
          error: data.message || 'Error desconocido'
        };
      }
    } catch (error) {
      console.error('❌ Error fetching stores:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async getCategories(): Promise<CategoryResponse> {
    try {
      // Verificar caché primero
      const cacheKey = 'categories';
      const cached = this.getCachedData<CategoryResponse>(cacheKey);
      if (cached) {
        return cached;
      }

      const url = `${this.baseUrl}/categories`;
      console.log('📂 Fetching categories from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        this.setCachedData(cacheKey, data);
        return data;
      } else {
        return {
          success: false,
          error: data.message || 'Error desconocido'
        };
      }
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async getBrands(): Promise<BrandResponse> {
    try {
      // Verificar caché primero
      const cacheKey = 'brands';
      const cached = this.getCachedData<BrandResponse>(cacheKey);
      if (cached) {
        return cached;
      }

      const url = `${this.baseUrl}/products/brands`;
      console.log('🏷️ Fetching brands from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        this.setCachedData(cacheKey, data);
        return data;
      } else {
        return {
          success: false,
          error: data.message || 'Error desconocido'
        };
      }
    } catch (error) {
      console.error('❌ Error fetching brands:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async getBrandsByVehicleType(vehicleType: string): Promise<BrandResponse> {
    try {
      // Verificar caché primero
      const cacheKey = `brands_${vehicleType}`;
      const cached = this.getCachedData<BrandResponse>(cacheKey);
      if (cached) {
        return cached;
      }

      const url = `${this.baseUrl}/products/brands/vehicle-type/${vehicleType}`;
      console.log('🏷️ Fetching brands by vehicle type from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        this.setCachedData(cacheKey, data);
        return data;
      } else {
        return {
          success: false,
          error: data.message || 'Error desconocido'
        };
      }
    } catch (error) {
      console.error('❌ Error fetching brands by vehicle type:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async getVehicleTypes(): Promise<VehicleTypeResponse> {
    try {
      // Verificar caché primero
      const cacheKey = 'vehicleTypes';
      const cached = this.getCachedData<VehicleTypeResponse>(cacheKey);
      if (cached) {
        return cached;
      }

      const url = `${this.baseUrl}/products/vehicle-types`;
      console.log('🚗 Fetching vehicle types from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        this.setCachedData(cacheKey, data);
        return data;
      } else {
        return {
          success: false,
          error: data.message || 'Error desconocido'
        };
      }
    } catch (error) {
      console.error('❌ Error fetching vehicle types:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async getSubcategories(category?: string): Promise<SubcategoryResponse> {
    try {
      // Verificar caché primero
      const cacheKey = `subcategories_${category || 'all'}`;
      const cached = this.getCachedData<SubcategoryResponse>(cacheKey);
      if (cached) {
        return cached;
      }

      const url = category 
        ? `${this.baseUrl}/products/subcategories?category=${category}`
        : `${this.baseUrl}/products/subcategories`;
      console.log('📁 Fetching subcategories from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        this.setCachedData(cacheKey, data);
        return data;
      } else {
        return {
          success: false,
          error: data.message || 'Error desconocido'
        };
      }
    } catch (error) {
      console.error('❌ Error fetching subcategories:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async getDashboardStats(): Promise<DashboardStatsResponse> {
    try {
      const url = `${this.baseUrl}/admin/dashboard/stats`;
      console.log('📊 Fetching dashboard stats from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        return data;
      } else {
        return {
          success: false,
          error: data.message || 'Error desconocido'
        };
      }
    } catch (error) {
      console.error('❌ Error fetching dashboard stats:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  private async getAuthToken(): Promise<string> {
    try {
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      const token = await AsyncStorage.default.getItem('authToken');
      return token || '';
    } catch (error) {
      console.error('Error getting auth token:', error);
      return '';
    }
  }

  // Limpiar caché
  clearCache(): void {
    this.cache.clear();
    console.log('🗑️ ProductService cache cleared');
  }
}

export const productService = new ProductService();
export default productService;