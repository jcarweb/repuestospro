import { Request, Response, NextFunction } from 'express';
import User from '../models/User';

export interface DevAuthRequest extends Request {
  user?: any;
}

// Middleware de desarrollo que permite acceso sin autenticación
export const devAuthMiddleware = async (req: DevAuthRequest, res: Response, next: NextFunction) => {
  try {
    // En desarrollo, usar un usuario de prueba
    const testUserId = '68b3667c391eb9a20750d0aa'; // ID del usuario de los logs
    
    const user = await User.findById(testUserId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario de prueba no encontrado'
      });
    }

    // Agregar usuario a la request
    req.user = {
      _id: user._id,
      id: user._id,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    console.error('Error in dev auth middleware:', error);
    res.status(500).json({
      success: false,
      message: 'Error en middleware de desarrollo'
    });
  }
};
