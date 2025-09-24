import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

// Interfaz para el cache de datos
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

// Configuración del cache
const CACHE_CONFIG = {
  DEFAULT_TTL: 5 * 60 * 1000, // 5 minutos por defecto
  MAX_CACHE_SIZE: 50, // Máximo 50 items en cache
  CLEANUP_INTERVAL: 10 * 60 * 1000, // Limpiar cache cada 10 minutos
};

class OfflineService {
  private static instance: OfflineService;
  private isOnline: boolean = true;
  private cache: Map<string, CacheItem<any>> = new Map();
  private cleanupTimer: NodeJS.Timeout | null = null;

  static getInstance(): OfflineService {
    if (!OfflineService.instance) {
      OfflineService.instance = new OfflineService();
    }
    return OfflineService.instance;
  }

  constructor() {
    this.initializeNetworkListener();
    this.startCacheCleanup();
  }

  // Inicializar listener de red
  private initializeNetworkListener() {
    NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected ?? false;
      
      if (wasOffline && this.isOnline) {
        console.log('🌐 Conexión restaurada - sincronizando datos...');
        this.syncPendingData();
      } else if (!wasOffline && !this.isOnline) {
        console.log('📱 Sin conexión - usando datos en cache');
      }
    });
  }

  // Verificar si hay conexión
  isConnected(): boolean {
    return this.isOnline;
  }

  // Obtener datos del cache o hacer petición
  async getData<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    ttl: number = CACHE_CONFIG.DEFAULT_TTL
  ): Promise<T> {
    // Si hay conexión, intentar obtener datos frescos
    if (this.isOnline) {
      try {
        const freshData = await fetchFunction();
        this.setCache(key, freshData, ttl);
        return freshData;
      } catch (error) {
        console.log(`⚠️ Error obteniendo datos frescos para ${key}, usando cache:`, error);
        // Si falla, intentar usar cache
        const cachedData = this.getCache<T>(key);
        if (cachedData) {
          return cachedData;
        }
        throw error;
      }
    } else {
      // Sin conexión, usar cache
      const cachedData = this.getCache<T>(key);
      if (cachedData) {
        console.log(`📱 Usando datos en cache para ${key}`);
        return cachedData;
      }
      throw new Error('Sin conexión y no hay datos en cache');
    }
  }

  // Guardar datos en cache
  private setCache<T>(key: string, data: T, ttl: number): void {
    const now = Date.now();
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: now,
      expiresAt: now + ttl,
    };

    this.cache.set(key, cacheItem);
    this.enforceMaxCacheSize();
  }

  // Obtener datos del cache
  private getCache<T>(key: string): T | null {
    const cacheItem = this.cache.get(key);
    
    if (!cacheItem) {
      return null;
    }

    // Verificar si ha expirado
    if (Date.now() > cacheItem.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return cacheItem.data;
  }

  // Limitar el tamaño del cache
  private enforceMaxCacheSize(): void {
    if (this.cache.size > CACHE_CONFIG.MAX_CACHE_SIZE) {
      // Eliminar los items más antiguos
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toDelete = entries.slice(0, this.cache.size - CACHE_CONFIG.MAX_CACHE_SIZE);
      toDelete.forEach(([key]) => this.cache.delete(key));
    }
  }

  // Limpiar cache expirado
  private startCacheCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      const now = Date.now();
      for (const [key, item] of this.cache.entries()) {
        if (now > item.expiresAt) {
          this.cache.delete(key);
        }
      }
    }, CACHE_CONFIG.CLEANUP_INTERVAL);
  }

  // Sincronizar datos pendientes cuando se restaura la conexión
  private async syncPendingData(): Promise<void> {
    // Aquí se pueden implementar colas de sincronización
    // Por ejemplo, para datos que se intentaron guardar sin conexión
    console.log('🔄 Sincronizando datos pendientes...');
  }

  // Limpiar todo el cache
  clearCache(): void {
    this.cache.clear();
    console.log('🗑️ Cache limpiado');
  }

  // Obtener estadísticas del cache
  getCacheStats(): {
    size: number;
    maxSize: number;
    isOnline: boolean;
  } {
    return {
      size: this.cache.size,
      maxSize: CACHE_CONFIG.MAX_CACHE_SIZE,
      isOnline: this.isOnline,
    };
  }

  // Destruir el servicio
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }
}

export const offlineService = OfflineService.getInstance();
export default offlineService;
