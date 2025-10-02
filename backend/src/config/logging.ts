/**
 * Configuración de logging seguro para el proyecto
 */

export const loggingConfig = {
  // Niveles de log por ambiente
  development: {
    level: 'debug',
    enableConsole: true,
    enableFile: false,
    sensitiveFields: [
      'password', 'token', 'secret', 'key', 'credential',
      'authorization', 'auth', 'jwt', 'session',
      'email', 'phone', 'address', 'ssn', 'credit',
      'bank', 'account', 'pin', 'otp', 'code'
    ]
  },
  
  production: {
    level: 'warn',
    enableConsole: true,
    enableFile: true,
    sensitiveFields: [
      'password', 'token', 'secret', 'key', 'credential',
      'authorization', 'auth', 'jwt', 'session',
      'email', 'phone', 'address', 'ssn', 'credit',
      'bank', 'account', 'pin', 'otp', 'code'
    ]
  },
  
  test: {
    level: 'error',
    enableConsole: false,
    enableFile: false,
    sensitiveFields: [
      'password', 'token', 'secret', 'key', 'credential',
      'authorization', 'auth', 'jwt', 'session',
      'email', 'phone', 'address', 'ssn', 'credit',
      'bank', 'account', 'pin', 'otp', 'code'
    ]
  }
};

/**
 * Obtiene la configuración de logging según el ambiente
 */
export function getLoggingConfig() {
  const env = process.env['NODE_ENV'] || 'development';
  return loggingConfig[env as keyof typeof loggingConfig] || loggingConfig.development;
}

/**
 * Verifica si un campo es sensible
 */
export function isSensitiveField(fieldName: string): boolean {
  const config = getLoggingConfig();
  const lowerFieldName = fieldName.toLowerCase();
  
  return config.sensitiveFields.some(sensitiveField => 
    lowerFieldName.includes(sensitiveField.toLowerCase())
  );
}

/**
 * Sanitiza un objeto para logging seguro
 */
export function sanitizeForLogging(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeForLogging(item));
  }
  
  if (typeof obj === 'object') {
    const sanitized: any = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (isSensitiveField(key)) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitizeForLogging(value);
      }
    }
    
    return sanitized;
  }
  
  return obj;
}
