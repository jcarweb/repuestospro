import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { devAuthMiddleware } from '../middleware/devAuthMiddleware';
import profileController from '../controllers/profileController';
import { profileUpload } from '../config/cloudinary';

const router = express.Router();

// Usar middleware de desarrollo en lugar de autenticación real
router.use(devAuthMiddleware);

// Obtener perfil del usuario
router.get('/', profileController.getProfile);

// Actualizar información del perfil
router.put('/', profileController.updateProfile);

// Cambiar contraseña
router.put('/password', profileController.changePassword);

// Configurar PIN
router.put('/pin', profileController.setPin);

// Configurar huella digital
router.put('/fingerprint', profileController.setFingerprint);

// Configurar autenticación de dos factores
router.put('/two-factor', profileController.setTwoFactor);

// Actualizar configuraciones de notificaciones
router.put('/notifications', profileController.updateNotifications);

// Actualizar configuraciones de privacidad
router.put('/privacy', profileController.updatePrivacy);

// Actualizar configuración de tema e idioma
router.put('/preferences', profileController.updatePreferences);

// Actualizar configuraciones de notificaciones push
router.put('/push-notifications', profileController.updatePushNotifications);

// Subir foto de perfil
router.post('/avatar', profileUpload.single('avatar'), profileController.uploadAvatar);

// Eliminar foto de perfil
router.delete('/avatar', profileController.deleteAvatar);

// Obtener historial de actividades
router.get('/activities', profileController.getActivities);

export default router;
