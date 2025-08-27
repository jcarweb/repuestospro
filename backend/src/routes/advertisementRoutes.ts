import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware';
import {
  getAllAdvertisements,
  getAdvertisementById,
  createAdvertisement,
  updateAdvertisement,
  deleteAdvertisement,
  changeAdvertisementStatus,
  getAdvertisementStats,
  getActiveAdvertisements,
  recordImpression,
  recordClick,
  getAnalyticsData,
  checkAdvertisingAccess,
  // 🚀 Modelo Híbrido - Nuevas funciones
  getAdvertisementTemplates,
  createSelfManagedAdvertisement,
  requestPremiumAdvertisement,
  getAvailableProductsForAdvertising,
  calculateSelfManagedPrice,
  // 🚀 Gestión de Solicitudes - Funciones para admin
  getAdvertisementRequests,
  approveAdvertisementRequest,
  rejectAdvertisementRequest,
  assignAdvertisementRequest,
  completeAdvertisementRequest
} from '../controllers/advertisementController';

const router = express.Router();

// Middleware de autenticación para todas las rutas
router.use(authenticateToken);

// Rutas para administradores
router.get('/admin', requireAdmin, getAllAdvertisements);
router.get('/admin/stats', requireAdmin, getAdvertisementStats);
router.get('/admin/analytics', requireAdmin, getAnalyticsData);
router.get('/admin/:id', requireAdmin, getAdvertisementById);
router.post('/admin', requireAdmin, createAdvertisement);
router.put('/admin/:id', requireAdmin, updateAdvertisement);
router.delete('/admin/:id', requireAdmin, deleteAdvertisement);
router.patch('/admin/:id/status', requireAdmin, changeAdvertisementStatus);

// Ruta para verificar acceso a publicidad
router.get('/check-access', checkAdvertisingAccess);

// Rutas públicas para obtener publicidades activas (sin autenticación requerida)
router.get('/active', getActiveAdvertisements);

// Rutas para tracking (sin autenticación requerida)
router.post('/:id/impression', recordImpression);
router.post('/:id/click', recordClick);

// 🚀 MODELO HÍBRIDO - Nuevas rutas para publicidad autogestionada y premium

// Obtener plantillas de publicidad disponibles
router.get('/templates', getAdvertisementTemplates);

// Crear publicidad autogestionada (Nivel 1)
router.post('/self-managed', createSelfManagedAdvertisement);

// Solicitar publicidad premium gestionada (Nivel 2)
router.post('/premium-request', requestPremiumAdvertisement);

// Obtener productos disponibles para publicidad
router.get('/products/available', getAvailableProductsForAdvertising);

// Calcular precio de publicidad autogestionada
router.post('/calculate-price', calculateSelfManagedPrice);

// 🚀 GESTIÓN DE SOLICITUDES - Rutas para administradores

// Obtener todas las solicitudes de publicidad
router.get('/requests', requireAdmin, getAdvertisementRequests);

// Aprobar solicitud de publicidad
router.put('/requests/:id/approve', requireAdmin, approveAdvertisementRequest);

// Rechazar solicitud de publicidad
router.put('/requests/:id/reject', requireAdmin, rejectAdvertisementRequest);

// Asignar solicitud de publicidad
router.put('/requests/:id/assign', requireAdmin, assignAdvertisementRequest);

// Marcar solicitud como completada
router.put('/requests/:id/complete', requireAdmin, completeAdvertisementRequest);

export default router;
