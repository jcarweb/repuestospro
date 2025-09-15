import { Request, Response, NextFunction } from 'express';
import { CryptoAuth } from '../utils/cryptoAuth';
import User from '../models/User';

export interface CryptoAuthRequest extends Request {
  user?: any;
}

export const cryptoAuthMiddleware = async (req: CryptoAuthRequest, res: Response, next: NextFunction) => {
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

    // Verificar el token usando crypto
    const decoded = CryptoAuth.verifyToken(token);
    
    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }

    // Buscar el usuario en la base de datos
    const user = await User.findById(decoded.id).select('-password -pin -fingerprintData');
    
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

    // Verificar que el rol en el token coincida con el de la base de datos
    if (decoded.role !== user.role) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido - rol no coincide'
      });
    }

    // Agregar el usuario al request
    req.user = user;
    
    next();
  } catch (error) {
    console.error('Error en middleware de autenticación crypto:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Middleware específico para Administrador
export const cryptoAdminMiddleware = async (req: CryptoAuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    
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
    console.error('Error en middleware de administrador crypto:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Middleware para verificar múltiples roles
export const cryptoRoleMiddleware = (allowedRoles: string[]) => {
  return async (req: CryptoAuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Autenticación requerida'
        });
      }

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: `Acceso denegado. Se requiere uno de los siguientes roles: ${allowedRoles.join(', ')}`
        });
      }

      next();
    } catch (error) {
      console.error('Error en middleware de roles crypto:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };
};
