import { Request, Response } from 'express';
import User from '../models/User';
import Activity from '../models/Activity';
import * as argon2 from 'argon2';
import { generateTwoFactorSecret, verifyTwoFactorCode, generateGoogleAuthenticatorUrl } from '../utils/twoFactorUtils';
import { profileUpload, deleteImage } from '../config/cloudinary';
// Extend Request interface to include user
interface AuthenticatedRequest extends Request {
  user?: {
    _id?: string;
    id?: string;
    email?: string;
    role?: string;
  };
}
// Obtener perfil del usuario
const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?._id || req.user?.id;
      const user = await User.findById(userId).select('-password -twoFactorSecret -backupCodes');
      if (!user) {
        res.status(404).json({
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
  };
// Actualizar información del perfil
const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?._id || req.user?.id;
      const { name, email, phone } = req.body;
      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }
      // Verificar si el email ya existe (si se está cambiando)
      if (email && email !== user!.email) {
        const existingUser = await User.findOne({ email, _id: { $ne: userId } });
        if (existingUser) {
          res.status(400).json({
            success: false,
            message: 'El email ya está en uso'
          });
        }
      }
      // Actualizar campos
      const updatedFields: string[] = [];
      if (name && name !== user!.name) {
        user!.name = name;
        updatedFields.push('name');
      }
      if (email && email !== user!.email) {
        user!.email = email;
        updatedFields.push('email');
      }
      if (phone !== undefined && phone !== user!.phone) {
        user!.phone = phone;
        updatedFields.push('phone');
      }
      await user!.save();
      // Registrar actividad
      if (updatedFields.length > 0) {
        await (Activity as any).createActivity(
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
          name: user!.name,
          email: user!.email,
          phone: user!.phone,
          avatar: user!.avatar
        }
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };
// Cambiar contraseña
const changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?._id || req.user?.id;
      const { currentPassword, newPassword } = req.body;
      // Datos de cambio de contraseña recibidos - logs removidos por seguridad
      if (!currentPassword || !newPassword) {
        res.status(400).json({
          success: false,
          message: 'Contraseña actual y nueva contraseña son requeridas'
        });
      }
      const user = await User.findById(userId).select('+password');
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }
      // Verificar contraseña actual
      const isPasswordValid = await user!.comparePassword(currentPassword);
      // Verificación de contraseña completada - resultado no loggeado por seguridad
      if (!isPasswordValid) {
        res.status(400).json({
          success: false,
          message: 'Contraseña actual incorrecta'
        });
      }
      // Cambiar contraseña
      user!.password = newPassword;
      await user!.save();
      // Registrar actividad
      try {
        await (Activity as any).createActivity(
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
const setPin = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?._id || req.user?.id;
      const { pin, currentPassword } = req.body;
      if (!pin || !currentPassword) {
        res.status(400).json({
          success: false,
          message: 'PIN y contraseña actual son requeridos'
        });
      }
      const user = await User.findById(userId).select('+password');
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }
      // Verificar contraseña actual
      const isPasswordValid = await user!.comparePassword(currentPassword);
      if (!isPasswordValid) {
        res.status(400).json({
          success: false,
          message: 'Contraseña actual incorrecta'
        });
      }
      // Configurar PIN
      user!.pin = pin;
      await user!.save();
      // Registrar actividad
      await (Activity as any).createActivity(
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
const setFingerprint = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?._id || req.user?.id;
      const { fingerprintData, enabled } = req.body;
      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }
      if (enabled && !fingerprintData) {
        res.status(400).json({
          success: false,
          message: 'Datos de huella digital son requeridos'
        });
      }
      user!.fingerprintEnabled = enabled;
      if (fingerprintData) {
        user!.fingerprintData = fingerprintData;
      }
      await user!.save();
      // Registrar actividad
      await (Activity as any).createActivity(
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
  };
// Configurar autenticación de dos factores
const setTwoFactor = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?._id || req.user?.id;
      const { enabled, code } = req.body;
      // Información de código no loggeada por seguridad;
      const user = await User.findById(userId).select('+twoFactorSecret');
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }
      if (enabled) {
        if (!user!.twoFactorSecret) {
          // Generando nuevo secreto 2FA - logs removidos por seguridad
          const secret = generateTwoFactorSecret();
          user!.twoFactorSecret = secret;
          user!.backupCodes = user!.generateBackupCodes();
        }
        if (code) {
          // Verificar código
          const isValid = verifyTwoFactorCode(user!.twoFactorSecret, code);
          if (!isValid) {
            res.status(400).json({
              success: false,
              message: 'Código de verificación incorrecto'
            });
          }
        }
        user!.twoFactorEnabled = true;
      } else {
        user!.twoFactorEnabled = false;
        user!.twoFactorSecret = undefined as any;
        user!.backupCodes = undefined as any;
      }
      await user!.save();
      // Registrar actividad
      await (Activity as any).createActivity(
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
          secret: user!.twoFactorSecret,
          backupCodes: user!.backupCodes,
          googleAuthUrl: generateGoogleAuthenticatorUrl(user!.twoFactorSecret || '', user!.email || '')
        } : undefined
      });
    } catch (error) {
      console.error('Error setting two factor:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };
// Actualizar configuraciones de notificaciones
const updateNotifications = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?._id || req.user?.id;
      const { emailNotifications, pushNotifications, marketingEmails } = req.body;
      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }
      const updatedFields: string[] = [];
      if (emailNotifications !== undefined && emailNotifications !== user!.emailNotifications) {
        user!.emailNotifications = emailNotifications;
        updatedFields.push('emailNotifications');
      }
      if (pushNotifications !== undefined && pushNotifications !== user!.pushNotifications) {
        user!.pushNotifications = pushNotifications;
        updatedFields.push('pushNotifications');
      }
      if (marketingEmails !== undefined && marketingEmails !== user!.marketingEmails) {
        user!.marketingEmails = marketingEmails;
        updatedFields.push('marketingEmails');
      }
      await user!.save();
      // Registrar actividad
      if (updatedFields.length > 0) {
        await (Activity as any).createActivity(
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
  };
// Actualizar configuraciones de privacidad
const updatePrivacy = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?._id || req.user?.id;
      const { profileVisibility, showEmail, showPhone } = req.body;
      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }
      // Actualizar campos de privacidad
      const updatedFields: string[] = [];
      if (profileVisibility && profileVisibility !== user!.profileVisibility) {
        user!.profileVisibility = profileVisibility;
        updatedFields.push('profileVisibility');
      }
      if (showEmail !== undefined && showEmail !== user!.showEmail) {
        user!.showEmail = showEmail;
        updatedFields.push('showEmail');
      }
      if (showPhone !== undefined && showPhone !== user!.showPhone) {
        user!.showPhone = showPhone;
        updatedFields.push('showPhone');
      }
      await user!.save();
      // Registrar actividad
      if (updatedFields.length > 0) {
        await (Activity as any).createActivity(
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
const updatePreferences = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?._id || req.user?.id;
      const { theme, language } = req.body;
      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }
      // Actualizar campos de preferencias
      const updatedFields: string[] = [];
      if (theme && theme !== user!.theme) {
        user!.theme = theme;
        updatedFields.push('theme');
      }
      if (language && language !== user!.language) {
        user!.language = language;
        updatedFields.push('language');
      }
      await user!.save();
      // Registrar actividad
      if (updatedFields.length > 0) {
        await (Activity as any).createActivity(
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
  };
// Actualizar configuraciones de notificaciones push
const updatePushNotifications = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?._id || req.user?.id;
      const { pushEnabled, pushToken } = req.body;
      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }
      // Actualizar campos de notificaciones push
      const updatedFields: string[] = [];
      if (pushEnabled !== undefined && pushEnabled !== user!.pushEnabled) {
        user!.pushEnabled = pushEnabled;
        updatedFields.push('pushEnabled');
      }
      if (pushToken && pushToken !== user!.pushToken) {
        user!.pushToken = pushToken;
        updatedFields.push('pushToken');
      }
      await user!.save();
      // Registrar actividad
      if (updatedFields.length > 0) {
        await (Activity as any).createActivity(
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
const uploadAvatar = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?._id || req.user?.id;
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No se ha proporcionado ninguna imagen'
        });
      }
      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }
      // Eliminar imagen anterior de Cloudinary si existe y no es el avatar por defecto
      if (user!.avatar &&
          user!.avatar !== '/uploads/perfil/default-avatar.svg' &&
          user!.avatar.includes('cloudinary.com')) {
        try {
          // Extraer el public_id de la URL de Cloudinary
          const urlParts = user!.avatar.split('/');
          const publicId = urlParts[urlParts.length - 1]?.split('.')[0];
          const folder = 'piezasya/profiles/';
          const fullPublicId = folder + publicId;
          await deleteImage(fullPublicId);
          console.log('Avatar anterior eliminado de Cloudinary:', fullPublicId);
        } catch (deleteError) {
          console.warn('Error eliminando avatar anterior de Cloudinary:', deleteError);
          // Continuar aunque falle la eliminación
        }
      }
      // Actualizar avatar del usuario con la URL de Cloudinary
      const avatarUrl = req.file?.path; // Cloudinary devuelve la URL completa
      if (!avatarUrl) {
        res.status(400).json({
          success: false,
          message: 'No se pudo procesar la imagen'
        });
      }
      user!.avatar = avatarUrl!;
      await user!.save();
      // Registrar actividad
      await (Activity as any).createActivity(
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
const deleteAvatar = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?._id || req.user?.id;
      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }
      // Eliminar imagen anterior de Cloudinary si existe y no es el avatar por defecto
      if (user!.avatar &&
          user!.avatar !== '/uploads/perfil/default-avatar.svg' &&
          user!.avatar.includes('cloudinary.com')) {
        try {
          // Extraer el public_id de la URL de Cloudinary
          const urlParts = user!.avatar.split('/');
          const publicId = urlParts[urlParts.length - 1]?.split('.')[0];
          const folder = 'piezasya/profiles/';
          const fullPublicId = folder + publicId;
          await deleteImage(fullPublicId);
          console.log('Avatar eliminado de Cloudinary:', fullPublicId);
        } catch (deleteError) {
          console.warn('Error eliminando avatar de Cloudinary:', deleteError);
          // Continuar aunque falle la eliminación
        }
      }
      // Restablecer al avatar por defecto
      user!.avatar = '/uploads/perfil/default-avatar.svg';
      await user!.save();
      // Registrar actividad
      try {
        await (Activity as any).createActivity(
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
          avatar: user!.avatar
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
const getActivities = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?._id || req.user?.id;
      const limit = parseInt(req.query['limit'] as string) || 20;
      const skip = parseInt(req.query['skip'] as string) || 0;
      const activities = await (Activity as any).getUserActivities(userId, limit, skip);
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
  };
export default {
  getProfile,
  updateProfile,
  changePassword,
  setPin,
  setFingerprint,
  setTwoFactor,
  updateNotifications,
  updatePrivacy,
  updatePreferences,
  updatePushNotifications,
  uploadAvatar,
  deleteAvatar,
  getActivities
};