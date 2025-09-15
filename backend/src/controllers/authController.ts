import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User, { IUser } from '../models/User';
import Activity from '../models/Activity';
import config from '../config/env';
import emailService from '../services/emailService';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { LoyaltyService } from '../services/loyaltyService';

export class AuthController {
  // Generar token JWT
  private static generateToken(userId: string): string {
    return jwt.sign(
      { userId },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN }
    );
  }

  // Generar token temporal
  private static generateTemporaryToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Registrar usuario
  static async register(req: Request, res: Response): Promise<void> {
    try {
      console.log('🔍 Iniciando registro de usuario:', req.body);
      const { name, email, password, phone, pin, role = 'client' } = req.body;

      // Validar email
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(email)) {
        console.log('❌ Email inválido:', email);
        res.status(400).json({
          success: false,
          message: 'Email inválido'
        });
        return;
      }

      // Verificar si el usuario ya existe
      console.log('🔍 Verificando si el usuario ya existe...');
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.log('❌ Usuario ya existe:', existingUser._id);
        res.status(400).json({
          success: false,
          message: 'El email ya está registrado'
        });
        return;
      }

      console.log('✅ Usuario no existe, procediendo con el registro');

      // Generar código de referido
      console.log('🔍 Generando código de referido...');
      let referralCode: string;
      try {
        referralCode = await LoyaltyService.generateReferralCode();
        console.log('✅ Código de referido generado:', referralCode);
      } catch (error) {
        console.error('❌ Error generando código de referido:', error);
        // Usar un código temporal si falla
        referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        console.log('⚠️ Usando código temporal:', referralCode);
      }

      // Crear usuario
      console.log('🔍 Creando usuario...');
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

      console.log('📋 Datos del usuario a crear:', { ...userData, password: '[HIDDEN]' });

      const user = await User.create(userData);
      console.log('✅ Usuario creado exitosamente:', user._id);

      // Generar token de verificación de email
      console.log('🔍 Generando token de verificación...');
      const emailVerificationToken = AuthController.generateTemporaryToken();
      user.emailVerificationToken = emailVerificationToken;
      user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas
      await user.save();
      console.log('✅ Token de verificación generado');

      // Enviar email de verificación
      try {
        console.log('🔍 Enviando email de verificación...');
        await emailService.sendEmailVerificationEmail(user.email, emailVerificationToken);
        console.log('✅ Email de verificación enviado');
      } catch (emailError) {
        console.error('❌ Error enviando email de verificación:', emailError);
        console.log('⚠️ Continuando sin email de verificación');
        // No fallar el registro si el email falla
      }

      // Registrar actividad
      try {
        console.log('🔍 Registrando actividad...');
        await Activity.create({
          userId: user._id,
          type: 'register',
          description: 'Usuario registrado exitosamente',
          metadata: { ip: req.ip, userAgent: req.get('User-Agent') }
        });
        console.log('✅ Actividad registrada');
      } catch (activityError) {
        console.error('❌ Error registrando actividad:', activityError);
        // No fallar el registro si la actividad falla
      }

      // Generar token JWT
      console.log('🔍 Generando token JWT...');
      const token = AuthController.generateToken(user._id.toString());
      console.log('✅ Token JWT generado');

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
  static async login(req: Request, res: Response): Promise<void> {
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
      const token = AuthController.generateToken(user._id.toString());

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
  static async loginWithPin(req: Request, res: Response): Promise<void> {
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
      const token = AuthController.generateToken(user._id.toString());

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
  static async setupPin(req: Request, res: Response): Promise<void> {
    try {
      const { pin } = req.body;
      const userId = (req as any).user._id;

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
  static async setupFingerprint(req: Request, res: Response): Promise<void> {
    try {
      const { fingerprintData } = req.body;
      const userId = (req as any).user._id;

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
  static async forgotPassword(req: Request, res: Response): Promise<void> {
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
        await emailService.sendPasswordResetEmail(user.email, resetToken, user.name);
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
  static async resetPassword(req: Request, res: Response): Promise<void> {
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
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
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
  static async verifyEmail(req: Request, res: Response): Promise<void> {
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
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      await user.save();

      await Activity.create({
        userId: user._id,
        type: 'email_verification',
        description: 'Email verificado exitosamente'
      });

      // Enviar correo de bienvenida específico para cada rol después de la verificación
      try {
        await emailService.sendWelcomeEmailByRole(user.email, user.name, user.role);
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
  static async logout(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user._id;

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
  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user._id;
      console.log('getProfile - User ID:', userId);

      const user = await User.findById(userId).select('-password -fingerprintData -twoFactorSecret -backupCodes');
      if (!user) {
        console.log('getProfile - User not found');
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }

      console.log('getProfile - User found:', {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
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
  static async getActivityHistory(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user._id;
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
  static async getRecentActivity(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user._id;
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
  static async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user._id;
      const { name, email, phone } = req.body;

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
          phone
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
  static async googleAuth(req: Request, res: Response): Promise<void> {
    // Esta función será manejada por Passport
    // No necesitamos implementar nada aquí
  }

  // Google OAuth - Callback después de autenticación
  static async googleCallback(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as any;
      
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
      const token = AuthController.generateToken(user._id.toString());

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
  static async resendVerification(req: Request, res: Response): Promise<void> {
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
  static async googleAuthError(req: Request, res: Response): Promise<void> {
    res.status(500).json({
      success: false,
      message: 'Error en autenticación con Google'
    });
  }

  // Login con Google para app móvil
  static async loginWithGoogle(req: Request, res: Response): Promise<void> {
    try {
      console.log('🔐 Iniciando login con Google para app móvil');
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
        console.log('✅ Usuario creado exitosamente con Google:', user._id);

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
        console.log('👤 Usuario existente encontrado:', user._id);
        
        // Actualizar información de Google si es necesario
        if (!user.googleId) {
          user.googleId = userInfo.id;
          user.profilePicture = picture;
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
      const token = AuthController.generateToken(user._id);

      console.log('✅ Login con Google exitoso para usuario:', user._id);

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
            profilePicture: user.profilePicture,
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
  static async loginWithFingerprint(req: Request, res: Response): Promise<void> {
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
      const token = AuthController.generateToken(user._id.toString());

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
  static async generateTwoFactorSecret(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user._id;
      const user = await User.findById(userId).select('+twoFactorSecret');

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }

      // Generar secreto
      const secret = speakeasy.generateSecret({
        name: `PiezasYA (${user.email})`,
        issuer: 'PiezasYA'
      });

      // Generar QR code
      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

      // Generar códigos de respaldo
      const backupCodes = user.generateBackupCodes();

      res.json({
        success: true,
        data: {
          secret: secret.base32,
          qrCode: qrCodeUrl,
          backupCodes
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
  static async enableTwoFactor(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user._id;
      const { secret, code } = req.body;

      console.log('Habilitando 2FA para usuario:', userId);
      console.log('Datos recibidos:', { secret: secret ? '***' : 'undefined', code });

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

      console.log('Usuario encontrado:', user.email);

      // Verificar código
      const isValid = speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: code,
        window: 2
      });

      console.log('Verificación de código:', { isValid, code });

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
  static async disableTwoFactor(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user._id;
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
      user.twoFactorSecret = undefined;
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
  static async verifyTwoFactorCode(req: Request, res: Response): Promise<void> {
    try {
      const { code } = req.body;
      const userId = (req as any).user._id;

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
  static async completeLoginWithTwoFactor(req: Request, res: Response): Promise<void> {
    try {
      const { email, code, tempToken } = req.body;

      if (!email || !code || !tempToken) {
        res.status(400).json({
          success: false,
          message: 'Email, código y token temporal requeridos'
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
      const token = AuthController.generateToken(user._id.toString());

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
  static async changePassword(req: Request, res: Response): Promise<void> {
    try {
      console.log('🔍 ChangePassword - Request body:', req.body);
      console.log('🔍 ChangePassword - User from request:', (req as any).user);
      
      const userId = (req as any).user._id;
      const { currentPassword, newPassword } = req.body;

      console.log('🔍 ChangePassword - UserId:', userId);
      console.log('🔍 ChangePassword - Current password provided:', !!currentPassword);
      console.log('🔍 ChangePassword - New password provided:', !!newPassword);

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
      console.log('🔍 ChangePassword - Searching for user with ID:', userId);
      const user = await User.findById(userId).select('+password');
      
      console.log('🔍 ChangePassword - User found:', !!user);
      
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }

      // Verificar contraseña actual
      console.log('🔍 ChangePassword - Comparing current password...');
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      console.log('🔍 ChangePassword - Current password valid:', isCurrentPasswordValid);
      
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
  static async generateNewBackupCodes(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user._id;
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
  static async verifyToken(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user._id;
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
  static async checkEmailVerification(req: Request, res: Response): Promise<void> {
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
  static async verifyTwoFactorCode(req: Request, res: Response): Promise<void> {
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
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: code,
        window: 2 // Permitir 2 códigos antes y después
      });

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
  static async getUserAuthSettings(req: Request, res: Response): Promise<void> {
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