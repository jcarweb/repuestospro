import express, { Request, Response, RequestHandler } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import profileController from '../controllers/profileController';
import { profileUpload } from '../config/cloudinary';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Obtener perfil del usuario
router.get('/', profileController.getProfile as RequestHandler);

// Actualizar información del perfil
router.put('/', profileController.updateProfile as RequestHandler);

// Cambiar contraseña
router.put('/password', profileController.changePassword as RequestHandler);

// Configurar PIN
router.put('/pin', profileController.setPin as RequestHandler);

// Configurar huella digital
router.put('/fingerprint', profileController.setFingerprint as RequestHandler);

// Configurar autenticación de dos factores
router.put('/two-factor', profileController.setTwoFactor as RequestHandler);

// Actualizar configuraciones de notificaciones
router.put('/notifications', profileController.updateNotifications as RequestHandler);    

// Actualizar configuraciones de privacidad
router.put('/privacy', profileController.updatePrivacy as RequestHandler);

// Actualizar configuración de tema e idioma
router.put('/preferences', profileController.updatePreferences as RequestHandler);        

// Actualizar configuraciones de notificaciones push
router.put('/push-notifications', profileController.updatePushNotifications as RequestHandler);

// Subir foto de perfil
router.post('/avatar', profileUpload.single('avatar'), profileController.uploadAvatar as RequestHandler);

// Eliminar foto de perfil
router.delete('/avatar', profileController.deleteAvatar as RequestHandler);

// Obtener historial de actividades
router.get('/activities', profileController.getActivities as RequestHandler);

export default router;
