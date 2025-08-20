import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import profileController from '../controllers/profileController';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

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
router.post('/avatar', profileController.uploadAvatar);

// Obtener historial de actividades
router.get('/activities', profileController.getActivities);

export default router;
