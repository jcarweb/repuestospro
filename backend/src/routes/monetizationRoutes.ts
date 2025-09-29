import express from 'express';
import monetizationController from '../controllers/monetizationController';
import { authenticateToken, requireAdmin } from '../middleware';

const router = express.Router();

// ===== TASAS DE CAMBIO =====

// Obtener tasa actual (público)
router.get('/exchange-rate/current', monetizationController.getCurrentExchangeRate);

// Configurar URL de fuente (público)
router.put('/exchange-rate/config', monetizationController.updateExchangeRateConfig);

// Actualizar tasa desde BCV (público)
router.post('/exchange-rate/update', monetizationController.updateExchangeRateFromBcv);

// Obtener historial de tasas (público)
router.get('/exchange-rate/history', monetizationController.getExchangeRateHistory);

// ===== COMISIONES =====

// Obtener todas las comisiones (público)
router.get('/commissions', monetizationController.getCommissions);

// Rutas protegidas para administradores
router.use('/commissions', authenticateToken, requireAdmin);

// Crear nueva comisión
router.post('/commissions', monetizationController.createCommission);

// Actualizar comisión
router.put('/commissions/:id', monetizationController.updateCommission);

// Eliminar comisión
router.delete('/commissions/:id', monetizationController.deleteCommission);

// ===== SUSCRIPCIONES =====

// Obtener planes de suscripción (público)
router.get('/subscriptions', monetizationController.getSubscriptions);

// Rutas protegidas para administradores
router.use('/subscriptions', authenticateToken, requireAdmin);

// Crear nuevo plan de suscripción
router.post('/subscriptions', monetizationController.createSubscription);

// Actualizar plan de suscripción
router.put('/subscriptions/:id', monetizationController.updateSubscription);

// Eliminar plan de suscripción
router.delete('/subscriptions/:id', monetizationController.deleteSubscription);

// ===== IMPUESTOS =====

// Obtener impuestos (público)
router.get('/taxes', monetizationController.getTaxes);

// Rutas protegidas para administradores
router.use('/taxes', authenticateToken, requireAdmin);

// Crear nuevo impuesto
router.post('/taxes', monetizationController.createTax);

// Actualizar impuesto
router.put('/taxes/:id', monetizationController.updateTax);

// Eliminar impuesto
router.delete('/taxes/:id', monetizationController.deleteTax);

// ===== CONFIGURACIÓN DE TASA POR TIENDA =====

// Rutas protegidas para gestores de tienda
router.use('/store/:storeId/exchange-rate', authenticateToken);

// Obtener preferencia de tasa de una tienda
router.get('/store/:storeId/exchange-rate/preference', monetizationController.getStoreExchangeRatePreference);

// Actualizar preferencia de tasa de una tienda
router.put('/store/:storeId/exchange-rate/preference', monetizationController.updateStoreExchangeRatePreference);

// Obtener tasa de cambio según preferencia de la tienda
router.get('/store/:storeId/exchange-rate/current', monetizationController.getStoreExchangeRate);

// ===== CÁLCULOS =====

// Calculadora general (público)
router.post('/calculator', monetizationController.calculateCommission);

export default router;
