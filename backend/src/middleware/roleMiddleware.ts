import { Request, Response, NextFunction } from 'express';

interface AuthenticatedRequest extends Request {
  user?: any;
}

// Middleware para verificar roles específicos
export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Token de autenticación requerido'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para acceder a este recurso'
      });
    }

    return next();
  };
};

// Export roleMiddleware for backward compatibility
export const roleMiddleware = requireRole;

// Export hasAnyRole for backward compatibility
export const hasAnyRole = requireRole;

// Export additional middleware for backward compatibility
export const clientMiddleware = requireRole(['client']);
export const storeManagerMiddleware = requireRole(['store_manager', 'admin']);
export const adminMiddleware = requireRole(['admin']);

// Middleware para verificar si es admin
export const requireAdmin = requireRole(['admin']);

// Middleware para verificar si es store_manager o admin
export const requireStoreManager = requireRole(['admin', 'store_manager']);

// Middleware para verificar si es store_manager, seller o admin
export const requireStoreAccess = requireRole(['admin', 'store_manager', 'seller']);