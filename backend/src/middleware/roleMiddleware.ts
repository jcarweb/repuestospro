import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  user?: any;
}

type UserRole = 'admin' | 'client' | 'delivery' | 'store_manager' | 'seller';

// Middleware para verificar si el usuario es cliente
export const clientMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const user = req.user;
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Acceso no autorizado'
    });
  }

  if ((user.role as string) !== 'client') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requiere rol de cliente.'
    });
  }

  return next();
};

// Middleware para verificar si el usuario es store manager
export const storeManagerMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const user = req.user;
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Acceso no autorizado'
    });
  }

  if ((user.role as string) !== 'store_manager') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requiere rol de store manager.'
    });
  }

  return next();
};

// Middleware para verificar si el usuario es admin
export const adminMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const user = req.user;
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Acceso no autorizado'
    });
  }

  if ((user.role as string) !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requiere rol de administrador.'
    });
  }

  return next();
};

// Middleware para verificar múltiples roles
export const hasAnyRole = (roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Acceso no autorizado'
      });
    }

    if (!roles.includes(user.role as UserRole)) {
      return res.status(403).json({
        success: false,
        message: `Acceso denegado. Se requiere uno de los siguientes roles: ${roles.join(', ')}`
      });
    }

    return next();
  };
};

// Middleware para verificar si el usuario es delivery
export const deliveryMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const user = req.user;
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Acceso no autorizado'
    });
  }

  if ((user.role as string) !== 'delivery') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requiere rol de delivery.'
    });
  }

  return next();
};

// Middleware genérico para verificar roles (alias de hasAnyRole para compatibilidad)
export const roleMiddleware = hasAnyRole;
