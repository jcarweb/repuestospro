/**
 * Sistema de logging seguro que no expone información sensible
 */

interface LogLevel {
  ERROR: 'error';
  WARN: 'warn';
  INFO: 'info';
  DEBUG: 'debug';
}

const LOG_LEVELS: LogLevel = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug'
};

class SecureLogger {
  private isProduction: boolean;
  private logLevel: string;

  constructor() {
    this.isProduction = process.env['NODE_ENV'] === 'production';
    this.logLevel = process.env['LOG_LEVEL'] || (this.isProduction ? 'warn' : 'debug');
  }

  /**
   * Log de error - siempre se muestra
   */
  error(message: string, error?: Error, context?: Record<string, any>): void {
    const logData = {
      level: LOG_LEVELS.ERROR,
      message,
      timestamp: new Date().toISOString(),
      ...(error && { error: this.sanitizeError(error) }),
      ...(context && { context: this.sanitizeContext(context) })
    };

    console.error(JSON.stringify(logData));
  }

  /**
   * Log de advertencia - se muestra en producción
   */
  warn(message: string, context?: Record<string, any>): void {
    if (this.shouldLog('warn')) {
      const logData = {
        level: LOG_LEVELS.WARN,
        message,
        timestamp: new Date().toISOString(),
        ...(context && { context: this.sanitizeContext(context) })
      };

      console.warn(JSON.stringify(logData));
    }
  }

  /**
   * Log de información - solo en desarrollo
   */
  info(message: string, context?: Record<string, any>): void {
    if (this.shouldLog('info')) {
      const logData = {
        level: LOG_LEVELS.INFO,
        message,
        timestamp: new Date().toISOString(),
        ...(context && { context: this.sanitizeContext(context) })
      };

      console.log(JSON.stringify(logData));
    }
  }

  /**
   * Log de debug - solo en desarrollo
   */
  debug(message: string, context?: Record<string, any>): void {
    if (this.shouldLog('debug')) {
      const logData = {
        level: LOG_LEVELS.DEBUG,
        message,
        timestamp: new Date().toISOString(),
        ...(context && { context: this.sanitizeContext(context) })
      };

      console.log(JSON.stringify(logData));
    }
  }

  /**
   * Verifica si debe loggear según el nivel
   */
  private shouldLog(level: string): boolean {
    if (this.isProduction && level === 'debug') {
      return false;
    }

    const levels = ['error', 'warn', 'info', 'debug'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const requestedLevelIndex = levels.indexOf(level);

    return requestedLevelIndex <= currentLevelIndex;
  }

  /**
   * Sanitiza errores para no exponer información sensible
   */
  private sanitizeError(error: Error): Record<string, any> {
    return {
      name: error.name,
      message: error.message,
      stack: this.isProduction ? undefined : error.stack
    };
  }

  /**
   * Sanitiza contexto para no exponer información sensible
   */
  private sanitizeContext(context: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(context)) {
      if (this.isSensitiveField(key)) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeContext(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Verifica si un campo contiene información sensible
   */
  private isSensitiveField(key: string): boolean {
    const sensitiveFields = [
      'password', 'token', 'secret', 'key', 'credential',
      'authorization', 'auth', 'jwt', 'session',
      'email', 'phone', 'address', 'ssn', 'credit',
      'bank', 'account', 'pin', 'otp', 'code'
    ];

    const lowerKey = key.toLowerCase();
    return sensitiveFields.some(field => lowerKey.includes(field));
  }

  /**
   * Log de autenticación seguro
   */
  auth(message: string, userId?: string, action?: string): void {
    this.info(`Auth: ${message}`, {
      userId: userId ? `user_${userId.substring(0, 8)}` : undefined,
      action
    });
  }

  /**
   * Log de operaciones de base de datos seguro
   */
  database(operation: string, collection: string, success: boolean, duration?: number): void {
    this.info(`DB ${operation}`, {
      collection,
      success,
      duration: duration ? `${duration}ms` : undefined
    });
  }

  /**
   * Log de API requests seguro
   */
  apiRequest(method: string, path: string, statusCode: number, duration?: number): void {
    this.info(`API ${method} ${path}`, {
      statusCode,
      duration: duration ? `${duration}ms` : undefined
    });
  }
}

// Instancia singleton
export const secureLogger = new SecureLogger();

// Exportar también la clase para testing
export { SecureLogger };
