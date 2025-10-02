import { Request, Response } from 'express';
import User from '../models/User';
import { CryptoAuth } from '../utils/cryptoAuth';

interface AuthenticatedRequest extends Request {
  user?: any;
}

export class CryptoAuthController {
  /**
   * Login con autenticación crypto
   */
  static login = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Email y contraseña son requeridos'
        });
      }

      // Buscar usuario por email
      const user = await User.findOne({ email: email.toLowerCase() });
      
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      // Verificar si la cuenta está bloqueada
      if (user?.isAccountLocked()) {
        res.status(401).json({
          success: false,
          message: 'Cuenta bloqueada. Intente más tarde'
        });
      }

      // Verificar contraseña
      const isPasswordValid = await user?.comparePassword(password);
      
      if (!isPasswordValid) {
        await user?.incrementLoginAttempts();
        res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      // Resetear intentos de login
      await user?.resetLoginAttempts();

      // Generar token con crypto
      const token = CryptoAuth.generateToken({
        id: (user?._id as any).toString(),
        email: user?.email || '',
        role: user?.role || ''
      });

      res.json({
        success: true,
        message: 'Login exitoso',
        data: {
          token,
          user: {
            id: user?._id,
            name: user?.name,
            email: user?.email,
            role: user?.role,
            avatar: user?.avatar,
            isEmailVerified: user?.isEmailVerified
          }
        }
      });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * Registro con autenticación crypto
   */
  static register = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { name, email, password, phone, role = 'client' } = req.body;

      if (!name || !email || !password) {
        res.status(400).json({
          success: false,
          message: 'Nombre, email y contraseña son requeridos'
        });
      }

      // Verificar si el usuario ya existe
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      
      if (existingUser) {
        res.status(400).json({
          success: false,
          message: 'El email ya está registrado'
        });
      }

      // Crear nuevo usuario
      const user = new User({
        name,
        email: email.toLowerCase(),
        password, // Se hasheará automáticamente en el middleware pre-save
        phone,
        role
      });

      await user.save();

      // Generar token
      const token = CryptoAuth.generateToken({
        id: (user?._id as any).toString(),
        email: user?.email,
        role: user?.role
      });

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: {
          token,
          user: {
            id: user?._id,
            name: user?.name,
            email: user?.email,
            role: user?.role,
            avatar: user?.avatar,
            isEmailVerified: user?.isEmailVerified
          }
        }
      });
    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * Verificar token
   */
  static verifyToken = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          success: false,
          message: 'Token requerido'
        });
      }

      const token = authHeader?.substring(7);
      if (!token) {
        res.status(401).json({
          success: false,
          message: 'Token no proporcionado'
        });
        return;
      }
      const decoded = CryptoAuth.verifyToken(token);
      
      if (!decoded) {
        res.status(401).json({
          success: false,
          message: 'Token inválido'
        });
      }

      // Buscar usuario
      const user = await User.findById(decoded?.id).select('-password -pin -fingerprintData');
      
      if (!user || !user.isActive) {
        res.status(401).json({
          success: false,
          message: 'Usuario no encontrado o inactivo'
        });
      }

      res.json({
        success: true,
        data: {
          user: {
            id: user?._id,
            name: user?.name,
            email: user?.email,
            role: user?.role,
            avatar: user?.avatar,
            isEmailVerified: user?.isEmailVerified
          }
        }
      });
    } catch (error) {
      console.error('Error verificando token:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * Obtener perfil del usuario autenticado
   */
  static getProfile = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = req.user;
      
      res.json({
        success: true,
        data: {
          user: {
            id: user?._id,
            name: user?.name,
            email: user?.email,
            role: user?.role,
            avatar: user?.avatar,
            phone: user.phone,
            isEmailVerified: user?.isEmailVerified,
            points: user.points,
            loyaltyLevel: user.loyaltyLevel,
            theme: user.theme,
            language: user.language
          }
        }
      });
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };
}
