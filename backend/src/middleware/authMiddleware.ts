import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

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