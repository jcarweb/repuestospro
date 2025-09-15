import { Request, Response, NextFunction } from 'express';
type UserRole = 'admin' | 'client' | 'delivery' | 'store_manager';

// Middleware para verificar si el usuario es cliente
export const clientMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Acceso no autorizado'
    });
  }

  if (user.role !== 'client') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requiere rol de cliente.'
    });
  }

  next();
};

// Middleware para verificar si el usuario es store manager
export const storeManagerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Acceso no autorizado'
    });
  }

  if (user.role !== 'store_manager') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requiere rol de store manager.'
    });
  }

  next();
};

// Middleware para verificar si el usuario es admin
export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Acceso no autorizado'
    });
  }

  if (user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requiere rol de administrador.'
    });
  }

  next();
};

// Middleware para verificar múltiples roles
export const hasAnyRole = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Acceso no autorizado'
      });
    }

    if (!roles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: `Acceso denegado. Se requiere uno de los siguientes roles: ${roles.join(', ')}`
      });
    }

    next();
  };
};

// Middleware para verificar si el usuario es delivery
export const deliveryMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Acceso no autorizado'
    });
  }

  if (user.role !== 'delivery') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requiere rol de delivery.'
    });
  }

  next();
};

// Middleware genérico para verificar roles (alias de hasAnyRole para compatibilidad)
export const roleMiddleware = hasAnyRole;
