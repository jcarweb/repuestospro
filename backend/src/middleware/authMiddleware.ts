import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export interface AuthRequest extends Request {
  user?: any;
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token de autenticación requerido'
      });
    }

    const token = authHeader.substring(7); // Remover 'Bearer ' del inicio
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de autenticación requerido'
      });
    }

    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }

    // Buscar el usuario en la base de datos
    const user = await User.findById(decoded.userId).select('-password -pin -fingerprintData');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Usuario inactivo'
      });
    }

    // Agregar el usuario al request
    (req as any).user = user;
    
    next();
  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Middleware para Administrador
export const adminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Autenticación requerida'
      });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Se requieren permisos de administrador'
      });
    }

    next();
  } catch (error) {
    console.error('Error en middleware de administrador:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Middleware para Cliente
export const clientMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Autenticación requerida'
      });
    }

    if (user.role !== 'client') {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Solo clientes pueden acceder a esta funcionalidad'
      });
    }

    next();
  } catch (error) {
    console.error('Error en middleware de cliente:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Middleware para Delivery
export const deliveryMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Autenticación requerida'
      });
    }

    if (user.role !== 'delivery') {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Solo personal de delivery puede acceder a esta funcionalidad'
      });
    }

    next();
  } catch (error) {
    console.error('Error en middleware de delivery:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Middleware para Gestor de Tienda
export const storeManagerMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Autenticación requerida'
      });
    }

    if (user.role !== 'store_manager') {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Solo gestores de tienda pueden acceder a esta funcionalidad'
      });
    }

    next();
  } catch (error) {
    console.error('Error en middleware de gestor de tienda:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Middleware para Admin o Store Manager
export const adminOrStoreManagerMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Autenticación requerida'
      });
    }

    if (user.role !== 'admin' && user.role !== 'store_manager') {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Solo administradores y gestores de tienda pueden acceder a esta funcionalidad'
      });
    }

    next();
  } catch (error) {
    console.error('Error en middleware de admin o store manager:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Middleware para Admin o Delivery
export const adminOrDeliveryMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Autenticación requerida'
      });
    }

    if (user.role !== 'admin' && user.role !== 'delivery') {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Solo administradores y personal de delivery pueden acceder a esta funcionalidad'
      });
    }

    next();
  } catch (error) {
    console.error('Error en middleware de admin o delivery:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Middleware para cualquier usuario autenticado (excepto clientes)
export const staffMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Autenticación requerida'
      });
    }

    if (user.role === 'client') {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Solo personal autorizado puede acceder a esta funcionalidad'
      });
    }

    next();
  } catch (error) {
    console.error('Error en middleware de staff:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}; 