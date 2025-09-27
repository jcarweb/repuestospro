import { Response } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import InventoryConfig from '../models/InventoryConfig';
import ProductInventory from '../models/ProductInventory';
import InventoryTransfer from '../models/InventoryTransfer';
import Store from '../models/Store';
import Product from '../models/Product';
import { AuthenticatedRequest, ApiResponse } from '../types/common';
import { validateSchema, validateParams, handleValidationError } from '../utils/validation';

// Esquemas de validación con Zod
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

const storeIdSchema = z.object({
  storeId: z.string().min(1, 'ID de tienda es requerido')
});

const inventoryTransferSchema = z.object({
  fromStore: z.string().min(1, 'Tienda origen es requerida'),
  toStore: z.string().min(1, 'Tienda destino es requerida'),
  productId: z.string().min(1, 'ID de producto es requerido'),
  quantity: z.number().min(1, 'Cantidad debe ser mayor a 0'),
  reason: z.string().optional(),
  notes: z.string().optional()
});

class InventoryController {
  // Configurar tipo de inventario para una tienda
  static async configureInventory(req: AuthenticatedRequest, res: Response) {
    try {
      const { storeId } = req.params;
      const validatedData = inventoryConfigSchema.parse(req.body);

      console.log('Configurando inventario para tienda:', storeId);
      console.log('Datos validados:', validatedData);

      // Verificar que la tienda existe
      const store = await Store.findById(storeId);
      if (!store) {
        const response: ApiResponse = {
          success: false,
          message: 'Tienda no encontrada'
        };
        return res.status(404).json(response);
      }

      // Verificar si la tienda es una sucursal con inventario global configurado
      const existingConfig = await InventoryConfig.findOne({ store: storeId });
      if (existingConfig && 
          existingConfig.inventoryType === 'global' && 
          existingConfig.parentStore && 
          !store.isMainStore) {
        const response: ApiResponse = {
          success: false,
          message: 'No puedes modificar la configuración de inventario. Esta sucursal tiene inventario global configurado por la tienda principal.'
        };
        return res.status(403).json(response);
      }

      // Crear o actualizar configuración de inventario
      let config = await InventoryConfig.findOne({ store: storeId });
      
      if (!config) {
        console.log('Creando nueva configuración de inventario');
        config = new InventoryConfig({
          store: storeId,
          ...validatedData
        });
      } else {
        console.log('Actualizando configuración existente');
        Object.assign(config, validatedData);
      }

      console.log('Guardando configuración...');
      await config.save();
      console.log('Configuración guardada exitosamente');

      // Si es inventario global, actualizar configuración de las sucursales
      if (validatedData.inventoryType === 'global' && validatedData.childStores.length > 0) {
        console.log('Actualizando configuración de sucursales para inventario global...');
        
        for (const childStoreId of validatedData.childStores) {
          try {
            let childConfig = await InventoryConfig.findOne({ store: childStoreId });
            
            if (!childConfig) {
              childConfig = new InventoryConfig({
                store: childStoreId,
                inventoryType: 'global',
                parentStore: storeId,
                allowLocalStock: false,
                autoDistribute: false
              });
            } else {
              childConfig.inventoryType = 'global';
              childConfig.parentStore = new mongoose.Types.ObjectId(storeId!);
              childConfig.allowLocalStock = false;
              childConfig.autoDistribute = false;
            }
            
            await childConfig.save();
            console.log(`Configuración actualizada para sucursal: ${childStoreId}`);
          } catch (error) {
            console.error(`Error actualizando sucursal ${childStoreId}:`, error);
          }
        }
      }

      const response: ApiResponse = {
        success: true,
        message: 'Configuración de inventario actualizada exitosamente',
        data: config
      };

      return res.json(response);

    } catch (error) {
      console.error('Error configurando inventario:', error);
      
      if (error instanceof z.ZodError) {
        return handleValidationError(error, res);
      }

      const response: ApiResponse = {
        success: false,
        message: 'Error interno del servidor'
      };
      return res.status(500).json(response);
    }
  }

  // Obtener configuración de inventario
  static async getInventoryConfig(req: AuthenticatedRequest, res: Response) {
    try {
      const { storeId } = req.params;

      if (!storeId) {
        const response: ApiResponse = {
          success: false,
          message: 'ID de tienda es requerido'
        };
        return res.status(400).json(response);
      }

      const config = await InventoryConfig.findOne({ store: storeId })
        .populate('parentStore', 'name address')
        .populate('childStores', 'name address');

      if (!config) {
        const response: ApiResponse = {
          success: false,
          message: 'Configuración de inventario no encontrada'
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse = {
        success: true,
        message: 'Configuración obtenida exitosamente',
        data: config
      };

      return res.json(response);

    } catch (error) {
      console.error('Error obteniendo configuración:', error);
      
      const response: ApiResponse = {
        success: false,
        message: 'Error interno del servidor'
      };
      return res.status(500).json(response);
    }
  }

  // Transferir inventario entre tiendas
  static async transferInventory(req: AuthenticatedRequest, res: Response) {
    try {
      const validatedData = inventoryTransferSchema.parse(req.body);

      // Verificar que ambas tiendas existen
      const [fromStore, toStore] = await Promise.all([
        Store.findById(validatedData.fromStore),
        Store.findById(validatedData.toStore)
      ]);

      if (!fromStore || !toStore) {
        const response: ApiResponse = {
          success: false,
          message: 'Una o ambas tiendas no existen'
        };
        return res.status(404).json(response);
      }

      // Verificar que el producto existe
      const product = await Product.findById(validatedData.productId);
      if (!product) {
        const response: ApiResponse = {
          success: false,
          message: 'Producto no encontrado'
        };
        return res.status(404).json(response);
      }

      // Verificar stock disponible en tienda origen
      const fromInventory = await ProductInventory.findOne({
        product: validatedData.productId,
        store: validatedData.fromStore
      });

      if (!fromInventory || fromInventory.mainStock.quantity < validatedData.quantity) {
        const response: ApiResponse = {
          success: false,
          message: 'Stock insuficiente en tienda origen'
        };
        return res.status(400).json(response);
      }

      // Crear transferencia
      const transfer = new InventoryTransfer({
        fromStore: validatedData.fromStore,
        toStore: validatedData.toStore,
        product: validatedData.productId,
        quantity: validatedData.quantity,
        reason: validatedData.reason,
        notes: validatedData.notes,
        status: 'pending'
      });

      await transfer.save();

      // Actualizar inventarios
      fromInventory.mainStock.quantity -= validatedData.quantity;
      await fromInventory.save();

      let toInventory = await ProductInventory.findOne({
        product: validatedData.productId,
        store: validatedData.toStore
      });

      if (!toInventory) {
        toInventory = new ProductInventory({
          product: validatedData.productId,
          store: validatedData.toStore,
          quantity: validatedData.quantity
        });
      } else {
        toInventory.mainStock.quantity += validatedData.quantity;
      }

      await toInventory.save();

      const response: ApiResponse = {
        success: true,
        message: 'Transferencia de inventario creada exitosamente',
        data: transfer
      };

      return res.json(response);

    } catch (error) {
      console.error('Error en transferencia de inventario:', error);
      
      if (error instanceof z.ZodError) {
        return handleValidationError(error, res);
      }

      const response: ApiResponse = {
        success: false,
        message: 'Error interno del servidor'
      };
      return res.status(500).json(response);
    }
  }

  // Obtener transferencias de inventario
  static async getInventoryTransfers(req: AuthenticatedRequest, res: Response) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const transfers = await InventoryTransfer.find()
        .populate('fromStore', 'name')
        .populate('toStore', 'name')
        .populate('product', 'name sku')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

      const total = await InventoryTransfer.countDocuments();

      const response: ApiResponse = {
        success: true,
        message: 'Transferencias obtenidas exitosamente',
        data: {
          transfers,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit))
          }
        }
      };
      return res.json(response);
    } catch (error) {
      console.error('Error obteniendo transferencias:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Error interno del servidor'
      };
      return res.status(500).json(response);
    }
  }
}

export default InventoryController;
