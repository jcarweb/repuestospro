// Utilidades para manejar requests con throttling y retry logic

interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
}

interface ThrottleOptions {
  delay?: number;
  leading?: boolean;
  trailing?: boolean;
}

// Función para retry con backoff exponencial mejorado
export const withRetry = async <T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> => {
  const {
    maxRetries = 5, // Aumentar intentos
    baseDelay = 2000, // Delay inicial más largo
    maxDelay = 30000, // Delay máximo más largo
    backoffFactor = 2.5 // Factor más agresivo
  } = options;

  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Si es el último intento, lanzar el error
      if (attempt === maxRetries) {
        console.log(`❌ Máximo de intentos alcanzado (${maxRetries + 1}), fallando...`);
        throw lastError;
      }

      // Si es un error 429 (rate limiting), usar backoff más agresivo
      const isRateLimit = error instanceof Error && 
        (error.message.includes('429') || error.message.includes('Too Many Requests'));
      
      if (isRateLimit) {
        // Para rate limiting, usar backoff exponencial más agresivo
        const delay = Math.min(baseDelay * Math.pow(backoffFactor, attempt), maxDelay);
        console.log(`🔄 Rate limit detectado (intento ${attempt + 1}/${maxRetries + 1}), esperando ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        // Para otros errores, usar backoff exponencial normal
        const delay = Math.min(baseDelay * Math.pow(backoffFactor, attempt), maxDelay);
        console.log(`🔄 Error en intento ${attempt + 1}, reintentando en ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
};

// Función para throttling
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  options: ThrottleOptions = {}
): T => {
  const {
    delay = 1000,
    leading = true,
    trailing = true
  } = options;

  let timeoutId: NodeJS.Timeout | null = null;
  let lastExecTime = 0;
  let lastArgs: Parameters<T>;

  return ((...args: Parameters<T>) => {
    const now = Date.now();
    const timeSinceLastExec = now - lastExecTime;

    const execute = () => {
      lastExecTime = now;
      timeoutId = null;
      return func(...args);
    };

    if (timeoutId === null) {
      if (leading && timeSinceLastExec >= delay) {
        return execute();
      } else if (trailing) {
        timeoutId = setTimeout(execute, delay - timeSinceLastExec);
      }
    }

    lastArgs = args;
  }) as T;
};

// Función para debounce
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number = 300
): T => {
  let timeoutId: NodeJS.Timeout | null = null;

  return ((...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, delay);
  }) as T;
};

// Función para hacer requests con retry automático
export const makeRequestWithRetry = async <T>(
  requestFn: () => Promise<T>,
  retryOptions: RetryOptions = {}
): Promise<T> => {
  return withRetry(requestFn, {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 5000,
    backoffFactor: 2,
    ...retryOptions
  });
};

// Función para manejar errores de rate limiting específicamente
export const handleRateLimitError = (error: any): boolean => {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return message.includes('429') || 
           message.includes('too many requests') || 
           message.includes('rate limit');
  }
  return false;
};

// Función para esperar un tiempo aleatorio (jitter) para evitar thundering herd
export const randomDelay = (min: number = 100, max: number = 1000): Promise<void> => {
  const delay = Math.random() * (max - min) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
};

// Función para crear un semáforo para limitar requests concurrentes
export class RequestSemaphore {
  private permits: number;
  private waitingQueue: Array<() => void> = [];

  constructor(permits: number = 5) {
    this.permits = permits;
  }

  async acquire(): Promise<void> {
    if (this.permits > 0) {
      this.permits--;
      return;
    }

    return new Promise(resolve => {
      this.waitingQueue.push(resolve);
    });
  }

  release(): void {
    if (this.waitingQueue.length > 0) {
      const next = this.waitingQueue.shift();
      if (next) next();
    } else {
      this.permits++;
    }
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquire();
    try {
      return await fn();
    } finally {
      this.release();
    }
  }
}

// Instancia global del semáforo
export const requestSemaphore = new RequestSemaphore(2); // Reducir a 2 requests concurrentes

// Sistema de caché simple para requests
class RequestCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttl: number = 300000) { // 5 minutos por defecto
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear() {
    this.cache.clear();
  }

  // Limpiar entradas expiradas
  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

export const requestCache = new RequestCache();

// Circuit Breaker Pattern
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  
  private readonly failureThreshold = 3;
  private readonly timeout = 60000; // 1 minuto
  private readonly retryTimeout = 30000; // 30 segundos

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.retryTimeout) {
        this.state = 'HALF_OPEN';
        console.log('🔄 Circuit breaker: Cambiando a HALF_OPEN');
      } else {
        throw new Error('Circuit breaker OPEN - Servicio temporalmente no disponible');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
      console.log('🚨 Circuit breaker: Cambiando a OPEN - Demasiados fallos');
    }
  }

  getState() {
    return this.state;
  }

  reset() {
    this.failures = 0;
    this.state = 'CLOSED';
    console.log('🔄 Circuit breaker: Reset a CLOSED');
  }
}

export const circuitBreaker = new CircuitBreaker();

// Función para hacer requests con caché y circuit breaker
export const makeCachedRequest = async <T>(
  cacheKey: string,
  requestFn: () => Promise<T>,
  ttl: number = 300000 // 5 minutos
): Promise<T> => {
  // Verificar caché primero
  const cached = requestCache.get(cacheKey);
  if (cached) {
    console.log(`📦 Cache hit para: ${cacheKey}`);
    return cached;
  }

  console.log(`🌐 Cache miss, haciendo request para: ${cacheKey}`);
  
  // Usar circuit breaker
  const result = await circuitBreaker.execute(requestFn);
  requestCache.set(cacheKey, result, ttl);
  
  return result;
};
