import { Request, Response } from 'express';
import User from '../models/User';
import Activity from '../models/Activity';
import * as argon2 from 'argon2';
import { generateTwoFactorSecret, verifyTwoFactorCode, generateGoogleAuthenticatorUrl } from '../utils/twoFactorUtils';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configuración de multer para subida de imágenes de perfil
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/perfil/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'profile-' + uniqueSuffix + ext);
  }
});

export const profileUpload = multer({ 
  storage: profileStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  },
  fileFilter: (req, file, cb) => {
    // Verificar que sea una imagen
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'));
    }
  }
});

// Extend Request interface to include user
interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    id: string;
    email: string;
    role: string;
  };
}

class ProfileController {
  // Obtener perfil del usuario
  async getProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?._id;
      
      const user = await User.findById(userId).select('-password -twoFactorSecret -backupCodes');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Error getting profile:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Actualizar información del perfil
  async updateProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?._id;
      const { name, email, phone } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // Verificar si el email ya existe (si se está cambiando)
      if (email && email !== user.email) {
        const existingUser = await User.findOne({ email, _id: { $ne: userId } });
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: 'El email ya está en uso'
          });
        }
      }

      // Actualizar campos
      const updatedFields: string[] = [];
      if (name && name !== user.name) {
        user.name = name;
        updatedFields.push('name');
      }
      if (email && email !== user.email) {
        user.email = email;
        updatedFields.push('email');
      }
      if (phone !== undefined && phone !== user.phone) {
        user.phone = phone;
        updatedFields.push('phone');
      }

      await user.save();

      // Registrar actividad
      if (updatedFields.length > 0) {
        await Activity.createActivity(
          userId,
          'profile_update',
          `Usuario actualizó su perfil: ${updatedFields.join(', ')}`,
          { updatedFields },
          true
        );
      }

      res.json({
        success: true,
        message: 'Perfil actualizado correctamente',
        data: {
          name: user.name,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar
        }
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Cambiar contraseña
  async changePassword(req: AuthenticatedRequest, res: Response) {
    try {
      console.log('🔍 Iniciando cambio de contraseña...');
      const userId = req.user?._id;
      const { currentPassword, newPassword } = req.body;

      console.log('📋 Datos recibidos:', { userId, hasCurrentPassword: !!currentPassword, hasNewPassword: !!newPassword });

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Contraseña actual y nueva contraseña son requeridas'
        });
      }

      console.log('🔍 Buscando usuario...');
      const user = await User.findById(userId).select('+password');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      console.log('✅ Usuario encontrado, verificando contraseña...');
      // Verificar contraseña actual
      const isPasswordValid = await user.comparePassword(currentPassword);
      console.log('🔍 Resultado verificación:', isPasswordValid);
      if (!isPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Contraseña actual incorrecta'
        });
      }

      console.log('✅ Contraseña válida, cambiando...');
      // Cambiar contraseña
      user.password = newPassword;
      console.log('🔍 Guardando usuario...');
      await user.save();

      // Registrar actividad
      try {
        await Activity.createActivity(
          userId,
          'password_changed',
          'Usuario cambió su contraseña',
          {},
          true
        );
      } catch (activityError) {
        console.error('Error creating activity:', activityError);
        // No fallar el cambio de contraseña si la actividad falla
      }

      res.json({
        success: true,
        message: 'Contraseña cambiada correctamente'
      });
    } catch (error) {
      console.error('Error changing password:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Configurar PIN
  async setPin(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?._id;
      const { pin, currentPassword } = req.body;

      if (!pin || !currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'PIN y contraseña actual son requeridos'
        });
      }

      const user = await User.findById(userId).select('+password');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // Verificar contraseña actual
      const isPasswordValid = await user.comparePassword(currentPassword);
      if (!isPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Contraseña actual incorrecta'
        });
      }

      // Configurar PIN
      user.pin = pin;
      await user.save();

      // Registrar actividad
      await Activity.createActivity(
        userId,
        'pin_setup',
        'Usuario configuró PIN de acceso',
        {},
        true
      );

      res.json({
        success: true,
        message: 'PIN configurado correctamente'
      });
    } catch (error) {
      console.error('Error setting PIN:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Configurar huella digital
  async setFingerprint(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?._id;
      const { fingerprintData, enabled } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      if (enabled && !fingerprintData) {
        return res.status(400).json({
          success: false,
          message: 'Datos de huella digital son requeridos'
        });
      }

      user.fingerprintEnabled = enabled;
      if (fingerprintData) {
        user.fingerprintData = fingerprintData;
      }
      await user.save();

      // Registrar actividad
      await Activity.createActivity(
        userId,
        'fingerprint_setup',
        `Usuario ${enabled ? 'configuró' : 'deshabilitó'} acceso por huella digital`,
        { enabled },
        true
      );

      res.json({
        success: true,
        message: `Huella digital ${enabled ? 'configurada' : 'deshabilitada'} correctamente`
      });
    } catch (error) {
      console.error('Error setting fingerprint:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Configurar autenticación de dos factores
  async setTwoFactor(req: AuthenticatedRequest, res: Response) {
    try {
      console.log('🔍 Iniciando configuración de 2FA...');
      const userId = req.user?._id;
      const { enabled, code } = req.body;

      console.log('📋 Datos recibidos:', { userId, enabled, hasCode: !!code });

      const user = await User.findById(userId).select('+twoFactorSecret');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      console.log('✅ Usuario encontrado');

      if (enabled) {
        console.log('🔍 Habilitando 2FA...');
        if (!user.twoFactorSecret) {
          console.log('🔍 Generando nuevo secreto...');
          // Generar nuevo secreto
          const secret = generateTwoFactorSecret();
          user.twoFactorSecret = secret;
          user.backupCodes = user.generateBackupCodes();
          console.log('✅ Secreto y códigos de respaldo generados');
        }

        if (code) {
          console.log('🔍 Verificando código...');
          // Verificar código
          const isValid = verifyTwoFactorCode(user.twoFactorSecret, code);
          if (!isValid) {
            return res.status(400).json({
              success: false,
              message: 'Código de verificación incorrecto'
            });
          }
          console.log('✅ Código verificado');
        }

        user.twoFactorEnabled = true;
        console.log('✅ 2FA habilitado');
      } else {
        console.log('🔍 Deshabilitando 2FA...');
        user.twoFactorEnabled = false;
        user.twoFactorSecret = undefined;
        user.backupCodes = undefined;
        console.log('✅ 2FA deshabilitado');
      }

      console.log('🔍 Guardando usuario...');
      await user.save();
      console.log('✅ Usuario guardado');

      // Registrar actividad
      await Activity.createActivity(
        userId,
        enabled ? 'two_factor_enabled' : 'two_factor_disabled',
        `Usuario ${enabled ? 'habilitó' : 'deshabilitó'} autenticación de dos factores`,
        { enabled },
        true
      );

      res.json({
        success: true,
        message: `Autenticación de dos factores ${enabled ? 'habilitada' : 'deshabilitada'} correctamente`,
        data: enabled ? {
          secret: user.twoFactorSecret,
          backupCodes: user.backupCodes,
          googleAuthUrl: generateGoogleAuthenticatorUrl(user.twoFactorSecret, user.email)
        } : undefined
      });
    } catch (error) {
      console.error('Error setting two factor:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Actualizar configuraciones de notificaciones
  async updateNotifications(req: AuthenticatedRequest, res: Response) {
    try {
      console.log('🔍 updateNotifications - Request body:', req.body);
      const userId = req.user?._id;
      const { emailNotifications, pushNotifications, marketingEmails } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      const updatedFields: string[] = [];
      if (emailNotifications !== undefined && emailNotifications !== user.emailNotifications) {
        user.emailNotifications = emailNotifications;
        updatedFields.push('emailNotifications');
      }
      if (pushNotifications !== undefined && pushNotifications !== user.pushNotifications) {
        user.pushNotifications = pushNotifications;
        updatedFields.push('pushNotifications');
      }
      if (marketingEmails !== undefined && marketingEmails !== user.marketingEmails) {
        user.marketingEmails = marketingEmails;
        updatedFields.push('marketingEmails');
      }

      await user.save();

      // Registrar actividad
      if (updatedFields.length > 0) {
        await Activity.createActivity(
          userId,
          'notifications_update',
          `Usuario actualizó configuraciones de notificaciones: ${updatedFields.join(', ')}`,
          { updatedFields },
          true
        );
      }

      res.json({
        success: true,
        message: 'Configuraciones de notificaciones actualizadas correctamente'
      });
    } catch (error) {
      console.error('Error updating notifications:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Actualizar configuraciones de privacidad
  async updatePrivacy(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?._id;
      const { profileVisibility, showEmail, showPhone } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // Actualizar campos de privacidad
      const updatedFields: string[] = [];
      if (profileVisibility && profileVisibility !== user.profileVisibility) {
        user.profileVisibility = profileVisibility;
        updatedFields.push('profileVisibility');
      }
      if (showEmail !== undefined && showEmail !== user.showEmail) {
        user.showEmail = showEmail;
        updatedFields.push('showEmail');
      }
      if (showPhone !== undefined && showPhone !== user.showPhone) {
        user.showPhone = showPhone;
        updatedFields.push('showPhone');
      }

      await user.save();

      // Registrar actividad
      if (updatedFields.length > 0) {
        await Activity.createActivity(
          userId,
          'privacy_update',
          'Usuario actualizó configuraciones de privacidad',
          { updatedFields },
          true
        );
      }

      res.json({
        success: true,
        message: 'Configuraciones de privacidad actualizadas correctamente'
      });
    } catch (error) {
      console.error('Error updating privacy:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Actualizar configuración de tema e idioma
  async updatePreferences(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?._id;
      const { theme, language } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // Actualizar campos de preferencias
      const updatedFields: string[] = [];
      if (theme && theme !== user.theme) {
        user.theme = theme;
        updatedFields.push('theme');
      }
      if (language && language !== user.language) {
        user.language = language;
        updatedFields.push('language');
      }

      await user.save();

      // Registrar actividad
      if (updatedFields.length > 0) {
        await Activity.createActivity(
          userId,
          'preferences_update',
          'Usuario actualizó preferencias de tema e idioma',
          { updatedFields },
          true
        );
      }

      res.json({
        success: true,
        message: 'Preferencias actualizadas correctamente'
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Actualizar configuraciones de notificaciones push
  async updatePushNotifications(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?._id;
      const { pushEnabled, pushToken } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // Actualizar campos de notificaciones push
      const updatedFields: string[] = [];
      if (pushEnabled !== undefined && pushEnabled !== user.pushEnabled) {
        user.pushEnabled = pushEnabled;
        updatedFields.push('pushEnabled');
      }
      if (pushToken && pushToken !== user.pushToken) {
        user.pushToken = pushToken;
        updatedFields.push('pushToken');
      }

      await user.save();

      // Registrar actividad
      if (updatedFields.length > 0) {
        await Activity.createActivity(
          userId,
          'push_notifications_update',
          'Usuario actualizó configuraciones de notificaciones push',
          { updatedFields },
          true
        );
      }

      res.json({
        success: true,
        message: 'Configuraciones de notificaciones push actualizadas correctamente'
      });
    } catch (error) {
      console.error('Error updating push notifications:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Subir foto de perfil
  async uploadAvatar(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?._id;
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se ha proporcionado ninguna imagen'
        });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // Eliminar imagen anterior si existe y no es el avatar por defecto
      if (user.avatar && user.avatar !== '/uploads/perfil/default-avatar.svg') {
        const oldAvatarPath = path.join(process.cwd(), user.avatar);
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
        }
      }

      // Actualizar avatar del usuario
      const avatarUrl = `/uploads/perfil/${req.file.filename}`;
      user.avatar = avatarUrl;
      await user.save();

      // Registrar actividad
      await Activity.createActivity(
        userId,
        'avatar_upload',
        'Usuario subió nueva foto de perfil',
        { avatarUrl },
        true
      );

      res.json({
        success: true,
        message: 'Foto de perfil actualizada correctamente',
        data: {
          avatar: avatarUrl
        }
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Eliminar foto de perfil
  async deleteAvatar(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?._id;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // Eliminar imagen anterior si existe y no es el avatar por defecto
      if (user.avatar && user.avatar !== '/uploads/perfil/default-avatar.svg') {
        try {
          const oldAvatarPath = path.join(process.cwd(), user.avatar);
          if (fs.existsSync(oldAvatarPath)) {
            fs.unlinkSync(oldAvatarPath);
            console.log('Archivo eliminado:', oldAvatarPath);
          }
        } catch (fileError) {
          console.warn('Error eliminando archivo físico:', fileError);
          // Continuar aunque falle la eliminación del archivo
        }
      }

      // Restablecer al avatar por defecto
      user.avatar = '/uploads/perfil/default-avatar.svg';
      await user.save();

      // Registrar actividad
      try {
        await Activity.createActivity(
          userId,
          'avatar_deleted',
          'Usuario eliminó su foto de perfil',
          {},
          true
        );
      } catch (activityError) {
        console.warn('Error registrando actividad:', activityError);
        // Continuar aunque falle el registro de actividad
      }

      res.json({
        success: true,
        message: 'Foto de perfil eliminada correctamente',
        data: {
          avatar: user.avatar
        }
      });
    } catch (error) {
      console.error('Error deleting avatar:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener historial de actividades
  async getActivities(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?._id;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = parseInt(req.query.skip as string) || 0;

      const activities = await Activity.getUserActivities(userId, limit, skip);

      res.json({
        success: true,
        data: activities
      });
    } catch (error) {
      console.error('Error getting activities:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}

export default new ProfileController();