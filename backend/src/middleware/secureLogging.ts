import { Request, Response, NextFunction } from 'express';
import { secureLogger } from '../utils/secureLogger';

/**
 * Middleware para logging seguro de requests
 */
export const secureRequestLogging = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Log del request (sin información sensible)
  secureLogger.apiRequest(
    req.method,
    req.path,
    0, // Se actualizará en el response
    undefined
  );
  
  // Interceptar el response para logging
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - startTime;
    
    // Log del response
    secureLogger.apiRequest(
      req.method,
      req.path,
      res.statusCode,
      duration
    );
    
    return originalSend.call(this, data);
  };
  
  next();
};

/**
 * Middleware para logging seguro de errores
 */
export const secureErrorLogging = (error: Error, req: Request, res: Response, next: NextFunction) => {
  // Log del error (sin información sensible)
  secureLogger.error(
    `Error en ${req.method} ${req.path}`,
    error,
    {
      method: req.method,
      path: req.path,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    }
  );
  
  next(error);
};

/**
 * Función para reemplazar console.log con logging seguro
 */
export function replaceConsoleLogs() {
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  
  console.log = (...args: any[]) => {
    // Filtrar logs que contengan información sensible
    const message = args.join(' ');
    
    if (containsSensitiveInfo(message)) {
      secureLogger.debug('Log removido por contener información sensible');
      return;
    }
    
    // Si es un log seguro, usar el logger seguro
    if (message.includes('✅') || message.includes('🔍') || message.includes('📋')) {
      secureLogger.info(message);
      return;
    }
    
    originalConsoleLog(...args);
  };
  
  console.error = (...args: any[]) => {
    const message = args.join(' ');
    
    if (containsSensitiveInfo(message)) {
      secureLogger.error('Error log removido por contener información sensible');
      return;
    }
    
    originalConsoleError(...args);
  };
  
  console.warn = (...args: any[]) => {
    const message = args.join(' ');
    
    if (containsSensitiveInfo(message)) {
      secureLogger.warn('Warning log removido por contener información sensible');
      return;
    }
    
    originalConsoleWarn(...args);
  };
}

/**
 * Verifica si un mensaje contiene información sensible
 */
function containsSensitiveInfo(message: string): boolean {
  const sensitivePatterns = [
    /password/i,
    /token/i,
    /secret/i,
    /credential/i,
    /key/i,
    /auth/i,
    /jwt/i,
    /session/i,
    /email/i,
    /phone/i,
    /address/i,
    /pin/i,
    /otp/i,
    /code/i,
    /user.*id/i,
    /user.*data/i,
    /req\.body/i,
    /tempToken/i,
    /twoFactorSecret/i,
    /backupCodes/i
  ];
  
  return sensitivePatterns.some(pattern => pattern.test(message));
}
