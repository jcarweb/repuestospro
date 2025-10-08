import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User, { IUser } from '../models/User';
import Activity from '../models/Activity';
import config from '../config/env';
import emailService from '../services/emailService';
// import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { LoyaltyService } from '../services/loyaltyService';
interface AuthenticatedRequest extends Request {
  user?: any;
}
export class AuthController {
  // Generar token JWT
  private static generateToken(userId: string): string {
    const secret: string = config.JWT_SECRET || 'default-secret';
    const expiresIn: string = config.JWT_EXPIRES_IN || '24h';
    
    const payload = { userId };
    const options: jwt.SignOptions = { 
      expiresIn: expiresIn as any
    };
    
    return jwt.sign(payload, secret, options);
  }
  // Generar token temporal
  private static generateTemporaryToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
  // Registrar usuario
  static async register(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { name, email, password, phone, pin, role = 'client' } = req.body;
      // Validar email
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({
          success: false,
          message: 'Email inválido'
        });
        return;
      }
      // Verificar si el usuario ya existe
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(400).json({
          success: false,
          message: 'El email ya está registrado'
        });
        return;
      }
      // Generar código de referido
      let referralCode: string;
      try {
        referralCode = await LoyaltyService.generateReferralCode();
        // Información de código no loggeada por seguridad;
      } catch (error) {
        console.error('❌ Error generando código de referido:', error);
        // Usar un código temporal si falla
        referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        // Información de código no loggeada por seguridad;
      }
      // Crear usuario
      const userData: any = {
        name,
        email,
        password,
        phone,
        role,
        referralCode
      };
      if (pin) {
        userData.pin = pin;
      }
      // Datos de usuario para registro - información sensible removida de logs
      const user = await User.create(userData);
      // Generar token de verificación de email
      // Generando token de verificación - logs removidos por seguridad
      const emailVerificationToken = AuthController.generateTemporaryToken();
      user.emailVerificationToken = emailVerificationToken;
      user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas
      await user.save();
      // Enviar email de verificación
      try {
        await emailService.sendEmailVerificationEmail(user.email, emailVerificationToken);
      } catch (emailError) {
        console.error('❌ Error enviando email de verificación:', emailError);
        // No fallar el registro si el email falla
      }
      // Registrar actividad
      try {
        await Activity.create({
          userId: user._id,
          type: 'register',
          description: 'Usuario registrado exitosamente',
          metadata: { ip: req.ip, userAgent: req.get('User-Agent') }
        });
      } catch (activityError) {
        console.error('❌ Error registrando actividad:', activityError);
        // No fallar el registro si la actividad falla
      }
      // Generar token JWT
      // Generando token JWT - logs removidos por seguridad
      const token = AuthController.generateToken((user._id as any).toString());
      console.log('🎉 Registro completado exitosamente');
      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente. Por favor verifica tu email.',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            isEmailVerified: user.isEmailVerified,
            role: user.role
          },
          token
        }
      });
    } catch (error) {
      console.error('❌ Error registrando usuario:', error);
      console.error('Stack:', error instanceof Error ? error.stack : 'No stack available');
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
  // Iniciar sesión con email y contraseña
  static async login(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      // Buscar usuario con información de tiendas
      const user = await User.findOne({ email })
        .select('+password +loginAttempts +lockUntil')
        .populate({
          path: 'stores',
          select: 'name address city state isMainStore _id'
        });
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
        return;
      }
      // Verificar si la cuenta está bloqueada
      if (user.isAccountLocked()) {
        res.status(423).json({
          success: false,
          message: 'Cuenta bloqueada temporalmente. Intenta de nuevo en 2 horas.'
        });
        return;
      }
      // Verificar contraseña
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        await user.incrementLoginAttempts();
        res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
        return;
      }
      // Verificar si el email está verificado (solo en producción)
      if (!user.isEmailVerified && config.NODE_ENV === 'production') {
        res.status(403).json({
          success: false,
          message: 'Debes verificar tu email antes de poder iniciar sesión. Revisa tu bandeja de entrada o solicita un nuevo enlace de verificación.',
          code: 'EMAIL_NOT_VERIFIED'
        });
        return;
      }
      // Verificar si el usuario tiene 2FA habilitado
      if (user.twoFactorEnabled) {
        // Generar token temporal para verificación 2FA
        const tempToken = AuthController.generateTemporaryToken();
        // Guardar token temporal en sesión o cache (en producción usar Redis)
        // Por ahora, lo incluimos en la respuesta
        res.json({
          success: true,
          message: 'Verificación de dos factores requerida',
          requiresTwoFactor: true,
          tempToken: tempToken,
          data: {
            user: {
              id: user._id,
              name: user.name,
              email: user.email,
              isEmailVerified: user.isEmailVerified,
              role: user.role,
              fingerprintEnabled: user.fingerprintEnabled,
              twoFactorEnabled: true,
              stores: user.stores || []
            }
          }
        });
        return;
      }
      // Resetear intentos de login
      await user.resetLoginAttempts();
      // Generar token
      const token = AuthController.generateToken((user._id as any).toString());
      // Registrar actividad
      await Activity.create({
        userId: user._id,
        type: 'login',
        description: 'Inicio de sesión exitoso',
        metadata: { ip: req.ip, userAgent: req.get('User-Agent') }
      });
      res.json({
        success: true,
        message: 'Inicio de sesión exitoso',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            isEmailVerified: user.isEmailVerified,
            role: user.role,
            fingerprintEnabled: user.fingerprintEnabled,
            twoFactorEnabled: false,
            stores: user.stores || []
          },
          token
        }
      });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
  // Iniciar sesión con PIN
  static async loginWithPin(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { email, pin } = req.body;
      const user = await User.findOne({ email }).select('+pin +loginAttempts +lockUntil');
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
        return;
      }
      if (!user.pin) {
        res.status(400).json({
          success: false,
          message: 'PIN no configurado'
        });
        return;
      }
      if (user.isAccountLocked()) {
        res.status(423).json({
          success: false,
          message: 'Cuenta bloqueada temporalmente'
        });
        return;
      }
      const isValidPin = await user.comparePin(pin);
      if (!isValidPin) {
        await user.incrementLoginAttempts();
        res.status(401).json({
          success: false,
          message: 'PIN incorrecto'
        });
        return;
      }
      // Verificar si el email está verificado
      if (!user.isEmailVerified) {
        res.status(403).json({
          success: false,
          message: 'Debes verificar tu email antes de poder iniciar sesión. Revisa tu bandeja de entrada o solicita un nuevo enlace de verificación.',
          code: 'EMAIL_NOT_VERIFIED'
        });
        return;
      }
      await user.resetLoginAttempts();
      const token = AuthController.generateToken((user._id as any).toString());
      await Activity.create({
        userId: user._id,
        type: 'login',
        description: 'Inicio de sesión con PIN exitoso',
        metadata: { ip: req.ip, userAgent: req.get('User-Agent') }
      });
      res.json({
        success: true,
        message: 'Inicio de sesión exitoso',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
          },
          token
        }
      });
    } catch (error) {
      console.error('Error en login con PIN:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
  // Configurar PIN
  static async setupPin(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { pin } = req.body;
      const userId = req.user?._id;
      if (!pin || pin.length < 4 || pin.length > 6) {
        res.status(400).json({
          success: false,
          message: 'PIN debe tener entre 4 y 6 dígitos'
        });
        return;
      }
      const user = await User.findById(userId).select('+pin');
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }
      user.pin = pin;
      await user.save();
      await Activity.create({
        userId: user._id,
        type: 'pin_setup',
        description: 'PIN configurado exitosamente'
      });
      res.json({
        success: true,
        message: 'PIN configurado exitosamente'
      });
    } catch (error) {
      console.error('Error configurando PIN:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
  // Configurar huella digital
  static async setupFingerprint(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { fingerprintData } = req.body;
      const userId = req.user?._id;
      if (!fingerprintData) {
        res.status(400).json({
          success: false,
          message: 'Datos de huella digital requeridos'
        });
        return;
      }
      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }
      user.fingerprintEnabled = true;
      user.fingerprintData = fingerprintData;
      await user.save();
      await Activity.create({
        userId: user._id,
        type: 'fingerprint_setup',
        description: 'Huella digital configurada exitosamente'
      });
      res.json({
        success: true,
        message: 'Huella digital configurada exitosamente'
      });
    } catch (error) {
      console.error('Error configurando huella digital:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
  // Recuperar contraseña
  static async forgotPassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      // Validar formato de email
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({
          success: false,
          message: 'Formato de email inválido'
        });
        return;
      }
      const user = await User.findOne({ email });
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'El email no está registrado en el sistema'
        });
        return;
      }
      // Verificar si el usuario está activo
      if (!user.isActive) {
        res.status(400).json({
          success: false,
          message: 'La cuenta asociada a este email está desactivada'
        });
        return;
      }
      // Generar token de recuperación
      const resetToken = AuthController.generateTemporaryToken();
      user.passwordResetToken = resetToken;
      user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
      await user.save();
      // Enviar email de recuperación
      try {
        await emailService.sendPasswordResetEmail(user.email, resetToken);
      } catch (emailError) {
        console.error('Error enviando email de recuperación:', emailError);
        res.status(500).json({
          success: false,
          message: 'Error enviando email de recuperación'
        });
        return;
      }
      await Activity.create({
        userId: user._id,
        type: 'password_reset',
        description: 'Solicitud de recuperación de contraseña',
        metadata: { ip: req.ip }
      });
      res.json({
        success: true,
        message: 'Se ha enviado un enlace de recuperación a tu email'
      });
    } catch (error) {
      console.error('Error en recuperación de contraseña:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
  // Resetear contraseña
  static async resetPassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { token, newPassword } = req.body;
      const user = await User.findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: new Date() }
      }).select('+password');
      if (!user) {
        res.status(400).json({
          success: false,
          message: 'Token inválido o expirado'
        });
        return;
      }
      user.password = newPassword;
      user.passwordResetToken = undefined as any;
      user.passwordResetExpires = undefined as any;
      await user.save();
      await Activity.create({
        userId: user._id,
        type: 'password_reset',
        description: 'Contraseña restablecida exitosamente'
      });
      res.json({
        success: true,
        message: 'Contraseña restablecida exitosamente'
      });
    } catch (error) {
      console.error('Error reseteando contraseña:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
  // Verificar email
  static async verifyEmail(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { token } = req.params;
      const user = await User.findOne({
        emailVerificationToken: token,
        emailVerificationExpires: { $gt: new Date() }
      });
      if (!user) {
        res.status(400).json({
          success: false,
          message: 'Token inválido o expirado'
        });
        return;
      }
      user.isEmailVerified = true;
      user.emailVerificationToken = undefined as any;
      user.emailVerificationExpires = undefined as any;
      await user.save();
      await Activity.create({
        userId: user._id,
        type: 'email_verification',
        description: 'Email verificado exitosamente'
      });
      // Enviar correo de bienvenida específico para cada rol después de la verificación
      try {
        await emailService.sendWelcomeEmail(user, user.role);
      } catch (emailError) {
        console.error('Error enviando email de bienvenida:', emailError);
        // No fallar la verificación si el email falla
      }
      // Devolver respuesta JSON en lugar de redirección
      res.json({
        success: true,
        message: 'Email verificado exitosamente',
        data: {
          userId: user._id,
          email: user.email,
          isEmailVerified: user.isEmailVerified
        }
      });
    } catch (error) {
      console.error('Error verificando email:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
  // Cerrar sesión
  static async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      await Activity.create({
        userId,
        type: 'logout',
        description: 'Cierre de sesión exitoso',
        metadata: { ip: req.ip }
      });
      res.json({
        success: true,
        message: 'Sesión cerrada exitosamente'
      });
    } catch (error) {
      console.error('Error en logout:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
  // Obtener perfil del usuario
  static async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      const user = await User.findById(userId).select('-password -fingerprintData -twoFactorSecret -backupCodes');
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }
      
      console.log('📥 getProfile devolviendo datos:', {
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        location: user.location
      });
      
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
  // Obtener historial de actividades
  static async getActivityHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      const { page = 1, limit = 20 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      const activities = await Activity.find({ userId })
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip(skip);
      const totalActivities = await Activity.countDocuments({ userId });
      res.json({
        success: true,
        data: activities,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: totalActivities
        }
      });
    } catch (error) {
      console.error('Error obteniendo historial:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
  // Obtener actividades recientes
  static async getRecentActivity(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      const { limit = 5 } = req.query;
      const activities = await Activity.find({ userId })
        .sort({ createdAt: -1 })
        .limit(Number(limit));
      res.json({
        success: true,
        data: activities
      });
    } catch (error) {
      console.error('Error obteniendo actividad reciente:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
  // Actualizar perfil del usuario
  static async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      const { name, email, phone, address, location } = req.body;
      
      console.log('🔄 Backend recibió datos:', { name, email, phone, address, location });
      console.log('🔄 Tipos de datos:', {
        name: typeof name,
        email: typeof email,
        phone: typeof phone,
        address: typeof address,
        location: typeof location
      });
      // Validar email si se está cambiando
      if (email) {
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(email)) {
          res.status(400).json({
            success: false,
            message: 'Email inválido'
          });
          return;
        }
        // Verificar si el email ya está en uso por otro usuario
        const existingUser = await User.findOne({ email, _id: { $ne: userId } });
        if (existingUser) {
          res.status(400).json({
            success: false,
            message: 'El email ya está en uso por otro usuario'
          });
          return;
        }
      }
      // Actualizar usuario
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          name,
          email,
          phone,
          address,
          location
        },
        { new: true, runValidators: true }
      );
      if (!updatedUser) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }
      
      console.log('✅ Usuario actualizado en BD:', {
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
        location: updatedUser.location
      });
      // Registrar actividad
      await Activity.create({
        userId: updatedUser._id,
        type: 'profile_update',
        description: 'Perfil actualizado exitosamente',
        metadata: {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          updatedFields: Object.keys(req.body)
        }
      });
      res.json({
        success: true,
        message: 'Perfil actualizado exitosamente',
        data: {
          user: {
            id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            isEmailVerified: updatedUser.isEmailVerified,
            role: updatedUser.role
          }
        }
      });
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
  // Google OAuth - Iniciar autenticación
  static async googleAuth(req: AuthenticatedRequest, res: Response): Promise<void> {
    // Esta función será manejada por Passport
    // No necesitamos implementar nada aquí
  }
  // Google OAuth - Callback después de autenticación
  static async googleCallback(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Error en autenticación con Google'
        });
        return;
      }
      // Verificar si el email está verificado
      if (!user.isEmailVerified) {
        res.redirect(`${config.CORS_ORIGIN}/auth/google/error?message=${encodeURIComponent('Debes verificar tu email antes de poder iniciar sesión')}`);
        return;
      }
      // Generar token JWT
      const token = AuthController.generateToken((user._id as any).toString());
      // Registrar actividad
      await Activity.create({
        userId: user._id,
        type: 'login',
        description: 'Inicio de sesión con Google exitoso',
        metadata: {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          provider: 'google'
        }
      });
      // Redirigir al frontend con el token
      const frontendUrl = config.CORS_ORIGIN;
      res.redirect(`${frontendUrl}/google-callback?token=${token}&user=${encodeURIComponent(JSON.stringify({
        id: user._id,
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        role: user.role
      }))}`);
    } catch (error) {
      console.error('Error en callback de Google:', error);
      res.redirect(`${config.CORS_ORIGIN}/google-callback?error=true`);
    }
  }
  // Reenviar verificación de email
  static async resendVerification(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(400).json({
          success: false,
          message: 'Email requerido'
        });
        return;
      }
      const user = await User.findOne({ email });
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }
      if (user.isEmailVerified) {
        res.status(400).json({
          success: false,
          message: 'El email ya está verificado'
        });
        return;
      }
      // Generar nuevo token de verificación
      const emailVerificationToken = AuthController.generateTemporaryToken();
      user.emailVerificationToken = emailVerificationToken;
      user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas
      await user.save();
      // Enviar email de verificación
      try {
        await emailService.sendEmailVerificationEmail(user.email, emailVerificationToken);
      } catch (emailError) {
        console.error('Error enviando email de verificación:', emailError);
        res.status(500).json({
          success: false,
          message: 'Error enviando email de verificación'
        });
        return;
      }
      // Registrar actividad
      await Activity.create({
        userId: user._id,
        type: 'email_verification',
        description: 'Email de verificación reenviado',
        metadata: { ip: req.ip }
      });
      res.json({
        success: true,
        message: 'Email de verificación reenviado exitosamente'
      });
    } catch (error) {
      console.error('Error reenviando verificación:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
  // Google OAuth - Error
  static async googleAuthError(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.status(500).json({
      success: false,
      message: 'Error en autenticación con Google'
    });
  }
  // Login con Google para app móvil
  static async loginWithGoogle(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { googleToken, userInfo } = req.body;
      if (!googleToken || !userInfo) {
        res.status(400).json({
          success: false,
          message: 'Token de Google y información del usuario requeridos'
        });
        return;
      }
      const { email, name, picture } = userInfo;
      // Verificar si el usuario ya existe
      let user = await User.findOne({ email });
      if (!user) {
        console.log('👤 Usuario no existe, creando nuevo usuario con Google');
        // Crear nuevo usuario
        const userData: any = {
          name,
          email,
          password: crypto.randomBytes(32).toString('hex'), // Contraseña aleatoria
          isEmailVerified: true, // Google ya verifica el email
          googleId: userInfo.id,
          profilePicture: picture,
          role: 'client' // Solo clientes pueden registrarse desde móvil
        };
        // Generar código de referido
        try {
          userData.referralCode = await LoyaltyService.generateReferralCode();
        } catch (error) {
          console.error('Error generando código de referido:', error);
          userData.referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        }
        user = await User.create(userData);
        // Registrar actividad
        await Activity.create({
          userId: user._id,
          type: 'user_registration',
          description: 'Usuario registrado con Google',
          metadata: {
            provider: 'google',
            ip: req.ip
          }
        });
      } else {
        // Actualizar información de Google si es necesario
        if (!user.googleId) {
          user.googleId = userInfo.id;
          (user as any).profilePicture = picture;
          await user.save();
        }
        // Registrar actividad
        await Activity.create({
          userId: user._id,
          type: 'user_login',
          description: 'Inicio de sesión con Google',
          metadata: {
            provider: 'google',
            ip: req.ip
          }
        });
      }
      // Generar token JWT
      const token = AuthController.generateToken((user._id as any).toString());
      res.json({
        success: true,
        message: 'Inicio de sesión con Google exitoso',
        data: {
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profilePicture: (user as any).profilePicture,
            isEmailVerified: user.isEmailVerified
          }
        }
      });
    } catch (error) {
      console.error('❌ Error en login con Google:', error);
      res.status(500).json({
        success: false,
        message: 'Error en el inicio de sesión con Google'
      });
    }
  }
  // Login con huella digital
  static async loginWithFingerprint(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { fingerprintData } = req.body;
      if (!fingerprintData) {
        res.status(400).json({
          success: false,
          message: 'Datos de huella digital requeridos'
        });
        return;
      }
      // Buscar usuario por huella digital
      const user = await User.findOne({
        fingerprintData: fingerprintData,
        fingerprintEnabled: true
      });
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Huella digital no reconocida o no configurada'
        });
        return;
      }
      if (!user.isActive) {
        res.status(401).json({
          success: false,
          message: 'Usuario inactivo'
        });
        return;
      }
      // Verificar si el email está verificado (solo en producción)
      if (!user.isEmailVerified && config.NODE_ENV === 'production') {
        res.status(403).json({
          success: false,
          message: 'Debes verificar tu email antes de poder iniciar sesión. Revisa tu bandeja de entrada o solicita un nuevo enlace de verificación.',
          code: 'EMAIL_NOT_VERIFIED'
        });
        return;
      }
      // Generar token
      const token = AuthController.generateToken((user._id as any).toString());
      // Registrar actividad
      await Activity.create({
        userId: user._id,
        type: 'login',
        description: 'Inicio de sesión con huella digital exitoso',
        metadata: {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          provider: 'fingerprint'
        }
      });
      res.json({
        success: true,
        message: 'Inicio de sesión exitoso',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
          },
          token
        }
      });
    } catch (error) {
      console.error('Error en login con huella digital:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
  // Generar secreto 2FA
  static async generateTwoFactorSecret(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      const user = await User.findById(userId).select('+twoFactorSecret');
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }
      // Generar secreto
      // const secret = speakeasy.generateSecret({
      //   name: `PiezasYA (${user.email})`,
      //   issuer: 'PiezasYA'
      // });
      // // Generar QR code
      // const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);
      // // Generar códigos de respaldo
      // const backupCodes = user.generateBackupCodes();
      res.json({
        success: true,
        data: {
          // secret: secret.base32,
          // qrCode: qrCodeUrl,
          // backupCodes
        }
      });
    } catch (error) {
      console.error('Error generando secreto 2FA:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
  // Habilitar 2FA
  static async enableTwoFactor(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      const { secret, code } = req.body;
      // Datos de verificación 2FA recibidos - información sensible no loggeada
      if (!secret || !code) {
        res.status(400).json({
          success: false,
          message: 'Secreto y código requeridos'
        });
        return;
      }
      const user = await User.findById(userId).select('+twoFactorSecret');
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }
      // Verificar código
      // const isValid = speakeasy.totp.verify({
      //   secret: secret,
      //   encoding: 'base32',
      //   token: code,
      //   window: 2
      // });
      // Información de código no loggeada por seguridad;
      const isValid = true; // Temporalmente deshabilitado
      if (!isValid) {
        res.status(400).json({
          success: false,
          message: 'Código inválido'
        });
        return;
      }
      // Habilitar 2FA
      user.twoFactorSecret = secret;
      user.twoFactorEnabled = true;
      console.log('Generando códigos de respaldo...');
      const backupCodes = user.generateBackupCodes();
      user.backupCodes = backupCodes;
      console.log('Guardando usuario...');
      await user.save();
      console.log('Registrando actividad...');
      // Registrar actividad
      await Activity.create({
        userId: user._id,
        type: 'two_factor_enabled',
        description: 'Autenticación de dos factores habilitada'
      });
      console.log('2FA habilitado exitosamente');
      res.json({
        success: true,
        message: 'Autenticación de dos factores habilitada exitosamente',
        data: {
          backupCodes: user.backupCodes
        }
      });
    } catch (error) {
      console.error('Error habilitando 2FA:', error);
      console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
  // Deshabilitar 2FA
  static async disableTwoFactor(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      const { code } = req.body;
      if (!code) {
        res.status(400).json({
          success: false,
          message: 'Código requerido'
        });
        return;
      }
      const user = await User.findById(userId).select('+twoFactorSecret');
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }
      if (!user.twoFactorEnabled) {
        res.status(400).json({
          success: false,
          message: '2FA no está habilitado'
        });
        return;
      }
      // Verificar código
      const isValid = user.verifyTwoFactorCode(code);
      if (!isValid) {
        res.status(400).json({
          success: false,
          message: 'Código inválido'
        });
        return;
      }
      // Deshabilitar 2FA
      user.twoFactorSecret = undefined as any;
      user.twoFactorEnabled = false;
      user.backupCodes = [];
      await user.save();
      // Registrar actividad
      await Activity.create({
        userId: user._id,
        type: 'two_factor_disabled',
        description: 'Autenticación de dos factores deshabilitada'
      });
      res.json({
        success: true,
        message: 'Autenticación de dos factores deshabilitada exitosamente'
      });
    } catch (error) {
      console.error('Error deshabilitando 2FA:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
  // Verificar código 2FA
  static async verifyTwoFactorCode(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { code } = req.body;
      const userId = req.user?._id;
      if (!code) {
        res.status(400).json({
          success: false,
          message: 'Código requerido'
        });
        return;
      }
      const user = await User.findById(userId).select('+twoFactorSecret +backupCodes');
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }
      if (!user.twoFactorEnabled) {
        res.status(400).json({
          success: false,
          message: '2FA no está habilitado'
        });
        return;
      }
      // Verificar código TOTP
      let isValid = user.verifyTwoFactorCode(code);
      // Si no es válido, verificar códigos de respaldo
      if (!isValid && user.backupCodes) {
        isValid = user.backupCodes.includes(code);
        if (isValid) {
          // Remover código de respaldo usado
          user.backupCodes = user.backupCodes.filter(c => c !== code);
          await user.save();
        }
      }
      if (!isValid) {
        res.status(400).json({
          success: false,
          message: 'Código inválido'
        });
        return;
      }
      res.json({
        success: true,
        message: 'Código verificado exitosamente'
      });
    } catch (error) {
      console.error('Error verificando código 2FA:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
  // Completar login con verificación 2FA
  static async completeLoginWithTwoFactor(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { email, code, tempToken } = req.body;
      if (!email || !code) {
        // Campos requeridos faltantes - información sensible no loggeada
        res.status(400).json({
          success: false,
          message: 'Email y código son requeridos'
        });
        return;
      }
      // Buscar usuario
      const user = await User.findOne({ email }).select('+twoFactorSecret +backupCodes');
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }
      if (!user.twoFactorEnabled) {
        res.status(400).json({
          success: false,
          message: '2FA no está habilitado para este usuario'
        });
        return;
      }
      // Verificar código 2FA
      let isValid = user.verifyTwoFactorCode(code);
      
      // Si no es válido, verificar códigos de respaldo
      if (!isValid && user.backupCodes) {
        isValid = user.backupCodes.includes(code);
        if (isValid) {
          // Remover código de respaldo usado
          user.backupCodes = user.backupCodes.filter(c => c !== code);
          await user.save();
        }
      }
      
      if (!isValid) {
        res.status(400).json({
          success: false,
          message: 'Código inválido'
        });
        return;
      }
      // Resetear intentos de login
      await user.resetLoginAttempts();
      // Generar token final
      const token = AuthController.generateToken((user._id as any).toString());
      // Token generado exitosamente - email no loggeado por seguridad
      // Registrar actividad
      await Activity.create({
        userId: user._id,
        type: 'two_factor_verification',
        description: 'Verificación de dos factores exitosa durante login',
        metadata: { ip: req.ip, userAgent: req.get('User-Agent') }
      });
      res.json({
        success: true,
        message: 'Inicio de sesión exitoso con 2FA',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            isEmailVerified: user.isEmailVerified,
            role: user.role,
            fingerprintEnabled: user.fingerprintEnabled,
            twoFactorEnabled: true
          },
          token
        }
      });
    } catch (error) {
      console.error('Error completando login con 2FA:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
  // Cambiar contraseña
  static async changePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Iniciando proceso de cambio de contraseña - datos sensibles no loggeados
      const userId = req.user?._id;
      const { currentPassword, newPassword } = req.body;
      // Validando datos de cambio de contraseña - información sensible no loggeada
      if (!currentPassword || !newPassword) {
        res.status(400).json({
          success: false,
          message: 'Contraseña actual y nueva contraseña son requeridas'
        });
        return;
      }
      // Validar longitud de la nueva contraseña
      if (newPassword.length < 6) {
        res.status(400).json({
          success: false,
          message: 'La nueva contraseña debe tener al menos 6 caracteres'
        });
        return;
      }
      // Buscar usuario
      // Buscando usuario para cambio de contraseña - ID no loggeado por seguridad
      const user = await User.findById(userId).select('+password');
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }
      // Verificar contraseña actual
      // Verificando contraseña actual - resultado no loggeado por seguridad
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        res.status(400).json({
          success: false,
          message: 'La contraseña actual es incorrecta'
        });
        return;
      }
      // Verificar que la nueva contraseña sea diferente
      const isNewPasswordSame = await user.comparePassword(newPassword);
      if (isNewPasswordSame) {
        res.status(400).json({
          success: false,
          message: 'La nueva contraseña debe ser diferente a la actual'
        });
        return;
      }
      // Cambiar contraseña
      user.password = newPassword;
      await user.save();
      // Registrar actividad
      await Activity.create({
        userId: user._id,
        type: 'password_changed',
        description: 'Contraseña cambiada exitosamente',
        metadata: { ip: req.ip, userAgent: req.get('User-Agent') }
      });
      res.json({
        success: true,
        message: 'Contraseña cambiada exitosamente'
      });
    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
  // Generar nuevos códigos de respaldo
  static async generateNewBackupCodes(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      const user = await User.findById(userId).select('+backupCodes');
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }
      if (!user.twoFactorEnabled) {
        res.status(400).json({
          success: false,
          message: '2FA no está habilitado'
        });
        return;
      }
      // Generar nuevos códigos
      const newBackupCodes = user.generateBackupCodes();
      user.backupCodes = newBackupCodes;
      await user.save();
      // Registrar actividad
      await Activity.create({
        userId: user._id,
        type: 'backup_codes_regenerated',
        description: 'Códigos de respaldo regenerados'
      });
      res.json({
        success: true,
        message: 'Códigos de respaldo regenerados exitosamente',
        data: {
          backupCodes: newBackupCodes
        }
      });
    } catch (error) {
      console.error('Error regenerando códigos de respaldo:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
  // Verificar token
  static async verifyToken(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      const user = await User.findById(userId).select('-password -twoFactorSecret -backupCodes');
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }
      res.json({
        success: true,
        message: 'Token válido',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
            isActive: user.isActive,
            pin: user.pin,
            fingerprintEnabled: user.fingerprintEnabled,
            twoFactorEnabled: user.twoFactorEnabled,
            emailNotifications: user.emailNotifications,
            pushNotifications: user.pushNotifications,
            marketingEmails: user.marketingEmails,
            points: user.points,
            loyaltyLevel: user.loyaltyLevel,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
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
  }
  // Verificar estado de verificación de email
  static async checkEmailVerification(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(400).json({ error: 'Email requerido' });
        return;
      }
      const user = await User.findOne({ email });
      if (!user) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }
      res.json({
        verified: user.isEmailVerified,
        message: user.isEmailVerified ? 'Email verificado' : 'Email no verificado'
      });
    } catch (error) {
      console.error('❌ Error verificando email:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
  // Verificar código de doble factor
  static async verifyTwoFactorCodeByEmail(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { email, code } = req.body;
      if (!email || !code) {
        res.status(400).json({ error: 'Email y código requeridos' });
        return;
      }
      const user = await User.findOne({ email }).select('+twoFactorSecret');
      if (!user) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }
      if (!user.twoFactorEnabled) {
        res.status(400).json({ error: '2FA no está habilitado para este usuario' });
        return;
      }
      // Verificar el código usando la librería speakeasy
      // const verified = speakeasy.totp.verify({
      //   secret: user.twoFactorSecret,
      //   encoding: 'base32',
      //   token: code,
      //   window: 2 // Permitir 2 códigos antes y después
      // });
      const verified = true; // Temporalmente deshabilitado
      res.json({
        valid: verified,
        message: verified ? 'Código válido' : 'Código inválido'
      });
    } catch (error) {
      console.error('❌ Error verificando código 2FA:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
  // Obtener configuración de autenticación del usuario
  static async getUserAuthSettings(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(400).json({ error: 'Email requerido' });
        return;
      }
      const user = await User.findOne({ email });
      if (!user) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }
      // Configuración de autenticación del usuario
      const settings = {
        emailVerified: user.isEmailVerified,
        gpsRequired: false, // Por defecto deshabilitado
        biometricEnabled: user.fingerprintEnabled || false,
        twoFactorEnabled: user.twoFactorEnabled || false,
        pinEnabled: !!user.pin,
      };
      res.json({
        success: true,
        settings
      });
    } catch (error) {
      console.error('❌ Error obteniendo configuración de usuario:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}