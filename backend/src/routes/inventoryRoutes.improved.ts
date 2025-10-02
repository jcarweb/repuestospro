import { Router } from 'express';
import InventoryController from '../controllers/inventoryController.improved';
import { validateSchema, validateParams, validateQuery } from '../utils/validation';
import { z } from 'zod';
import { authMiddleware } from '../middleware/authMiddleware';
import { AuthenticatedRouteRequest } from '../types/common';

const router = Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Esquemas de validación
const storeIdSchema = z.object({
  storeId: z.string().min(1, 'ID de tienda es requerido')
});

const inventoryConfigSchema = z.object({
  inventoryType: z.enum(['local', 'global', 'mixed']),
  parentStore: z.string().optional(),
  childStores: z.array(z.string()).optional().default([]),
  allowLocalStock: z.boolean().default(false),
  autoDistribute: z.boolean().default(false),
  distributionRules: z.object({
    minStock: z.number().min(0).default(0),
    maxStock: z.number().min(1).default(1000),
    distributionMethod: z.enum(['equal', 'weighted', 'demand_based']).default('equal')
  })
});

const inventoryTransferSchema = z.object({
  fromStore: z.string().min(1, 'Tienda origen es requerida'),
  toStore: z.string().min(1, 'Tienda destino es requerida'),
  productId: z.string().min(1, 'ID de producto es requerido'),
  quantity: z.number().min(1, 'Cantidad debe ser mayor a 0'),
  reason: z.string().optional(),
  notes: z.string().optional()
});

const paginationSchema = z.object({
  page: z.string().transform(val => parseInt(val, 10)).pipe(z.number().min(1)).default(() => 1),
  limit: z.string().transform(val => parseInt(val, 10)).pipe(z.number().min(1).max(100)).default(() => 10),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional()
});

// Rutas con validación
router.post(
  '/:storeId/configure',
  validateParams(storeIdSchema),
  validateSchema(inventoryConfigSchema),
  InventoryController.configureInventory
);

router.get(
  '/:storeId/config',
  validateParams(storeIdSchema),
  InventoryController.getInventoryConfig
);

router.post(
  '/transfer',
  validateSchema(inventoryTransferSchema),
  InventoryController.transferInventory
);

router.get(
  '/transfers',
  validateQuery(paginationSchema),
  InventoryController.getInventoryTransfers
);

export default router;
