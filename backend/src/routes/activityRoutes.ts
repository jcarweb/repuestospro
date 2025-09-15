import express from 'express';
import activityController from '../controllers/activityController';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Rutas para usuarios autenticados
router.use(authMiddleware);

// Obtener actividades del usuario autenticado
router.get('/user', activityController.getUserActivities);

// Obtener estadísticas de actividades del usuario
router.get('/stats', activityController.getActivityStats);

// Crear una nueva actividad
router.post('/', activityController.createActivity);

// Rutas solo para administradores
router.use(adminMiddleware);

// Obtener todas las actividades
router.get('/', activityController.getAllActivities);

// Obtener actividades por tipo
router.get('/type/:type', activityController.getActivitiesByType);

// Obtener estadísticas globales
router.get('/global-stats', activityController.getGlobalStats);

export default router;
