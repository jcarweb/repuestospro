const API_BASE_URL = 'http://localhost:5000/api';

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  vehicleType?: string;
  deliveryType?: string;
  brand: string;
  subcategory: string;
  stock: number;
  isFeatured: boolean;
  popularity: number;
  sku: string;
  originalPartCode?: string;
  specifications: Record<string, any>;
  tags: string[];
  store?: {
    name: string;
    location?: string;
  };
  isActive: boolean;
  deleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RelatedProduct {
  _id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
  brand: string;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  category?: string;
  brand?: string;
  subcategory?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  isFeatured?: boolean;
}

export interface ProductResponse {
  success: boolean;
  data: {
    product?: Product;
    products?: Product[];
    relatedProducts?: RelatedProduct[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    subcategories?: string[];
  };
  message?: string;
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
  image: string;
  productCount: number;
  subcategories?: string[];
}

class ProductService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Obtener todos los productos con filtros
  async getProducts(filters: ProductFilters = {}): Promise<ProductResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const endpoint = `/products${params.toString() ? `?${params.toString()}` : ''}`;
    return this.request<ProductResponse>(endpoint);
  }

  // Obtener un producto específico por ID
  async getProductById(id: string): Promise<ProductResponse> {
    return this.request<ProductResponse>(`/products/${id}`);
  }

  // Obtener productos por categoría
  async getProductsByCategory(category: string, filters: ProductFilters = {}): Promise<ProductResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const endpoint = `/products/category/${category}${params.toString() ? `?${params.toString()}` : ''}`;
    return this.request<ProductResponse>(endpoint);
  }

  // Obtener productos destacados
  async getFeaturedProducts(limit: number = 8): Promise<ProductResponse> {
    return this.request<ProductResponse>(`/products/featured?limit=${limit}`);
  }

  // Obtener productos por búsqueda
  async searchProducts(query: string, filters: ProductFilters = {}): Promise<ProductResponse> {
    const searchFilters = { ...filters, search: query };
    return this.getProducts(searchFilters);
  }

  // Obtener todas las categorías
  async getCategories(): Promise<{ success: boolean; data: Category[] }> {
    return this.request<{ success: boolean; data: Category[] }>('/categories');
  }

  // Obtener productos relacionados
  async getRelatedProducts(productId: string, limit: number = 4): Promise<ProductResponse> {
    return this.request<ProductResponse>(`/products/${productId}/related?limit=${limit}`);
  }

  // Obtener productos por marca
  async getProductsByBrand(brand: string, filters: ProductFilters = {}): Promise<ProductResponse> {
    const brandFilters = { ...filters, brand };
    return this.getProducts(brandFilters);
  }

  // Obtener productos por subcategoría
  async getProductsBySubcategory(subcategory: string, filters: ProductFilters = {}): Promise<ProductResponse> {
    const subcategoryFilters = { ...filters, subcategory };
    return this.getProducts(subcategoryFilters);
  }

  // Obtener productos por rango de precios
  async getProductsByPriceRange(minPrice: number, maxPrice: number, filters: ProductFilters = {}): Promise<ProductResponse> {
    const priceFilters = { ...filters, minPrice, maxPrice };
    return this.getProducts(priceFilters);
  }

  // Obtener productos populares
  async getPopularProducts(limit: number = 8): Promise<ProductResponse> {
    return this.getProducts({ limit, sortBy: 'popularity', sortOrder: 'desc' });
  }

  // Obtener productos recientes
  async getRecentProducts(limit: number = 8): Promise<ProductResponse> {
    return this.getProducts({ limit, sortBy: 'createdAt', sortOrder: 'desc' });
  }

  // Obtener productos por tienda (para gestores de tienda)
  async getProductsByStore(storeId: string, filters: ProductFilters = {}, token: string): Promise<ProductResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const endpoint = `/products/store-manager/all?${params.toString()}`;
    return this.request<ProductResponse>(endpoint, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  // Obtener productos eliminados (papelera)
  async getDeletedProducts(filters: ProductFilters = {}, token: string): Promise<ProductResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const endpoint = `/products/store-manager/trash?${params.toString()}`;
    return this.request<ProductResponse>(endpoint, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  // Crear nuevo producto (para gestores de tienda)
  async createProduct(productData: Partial<Product>, token: string): Promise<ProductResponse> {
    return this.request<ProductResponse>('/products', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(productData)
    });
  }

  // Actualizar producto (para gestores de tienda)
  async updateProduct(id: string, productData: Partial<Product>, token: string): Promise<ProductResponse> {
    return this.request<ProductResponse>(`/products/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(productData)
    });
  }

  // Eliminar producto (para gestores de tienda)
  async deleteProduct(id: string, token: string): Promise<ProductResponse> {
    return this.request<ProductResponse>(`/products/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  // Restaurar producto eliminado (para gestores de tienda)
  async restoreProduct(id: string, token: string): Promise<ProductResponse> {
    return this.request<ProductResponse>(`/products/${id}/restore`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  // Obtener estadísticas de productos (para gestores de tienda)
  async getProductStats(token: string): Promise<{ success: boolean; data: any }> {
    return this.request<{ success: boolean; data: any }>('/products/store-manager/stats', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }
}

export const productService = new ProductService();
export default productService;
