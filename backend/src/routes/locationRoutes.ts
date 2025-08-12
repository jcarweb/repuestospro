import express from 'express';
import { LocationController } from '../controllers/locationController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Actualizar ubicación del usuario
router.post('/update', LocationController.updateLocation);

// Obtener ubicación actual del usuario
router.get('/current', LocationController.getLocation);

// Habilitar/deshabilitar ubicación
router.post('/toggle', LocationController.toggleLocation);

// Verificar estado de ubicación
router.get('/status', LocationController.checkLocationStatus);

export default router; 