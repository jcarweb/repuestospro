import { Request, Response } from 'express';
import InventoryConfig from '../models/InventoryConfig';
import ProductInventory from '../models/ProductInventory';
import InventoryTransfer from '../models/InventoryTransfer';
import Store from '../models/Store';
import Product from '../models/Product';

class InventoryController {
  // Configurar tipo de inventario para una tienda
  async configureInventory(req: Request, res: Response) {
    try {
      const { storeId } = req.params;
      const { 
        inventoryType, 
        parentStore, 
        childStores, 
        allowLocalStock, 
        autoDistribute, 
        distributionRules 
      } = req.body;

      console.log('Configurando inventario para tienda:', storeId);
      console.log('Datos recibidos:', req.body);

      // Verificar que la tienda existe
      const store = await Store.findById(storeId);
      if (!store) {
        console.log('Tienda no encontrada:', storeId);
        return res.status(404).json({ success: false, message: 'Tienda no encontrada' });
      }

      // Verificar si la tienda es una sucursal con inventario global configurado
      const existingConfig = await InventoryConfig.findOne({ store: storeId });
      if (existingConfig && existingConfig.inventoryType === 'global' && existingConfig.parentStore && !store.isMainStore) {
        console.log('Intento de modificar configuración de sucursal con inventario global');
        return res.status(403).json({ 
          success: false, 
          message: 'No puedes modificar la configuración de inventario. Esta sucursal tiene inventario global configurado por la tienda principal.' 
        });
      }

      // Validar datos requeridos
      if (!inventoryType) {
        return res.status(400).json({ success: false, message: 'El tipo de inventario es requerido' });
      }

      if (!distributionRules) {
        return res.status(400).json({ success: false, message: 'Las reglas de distribución son requeridas' });
      }

      // Crear o actualizar configuración de inventario
      let config = await InventoryConfig.findOne({ store: storeId });
      
      if (!config) {
        console.log('Creando nueva configuración de inventario');
        config = new InventoryConfig({
          store: storeId,
          inventoryType,
          parentStore,
          childStores: childStores || [],
          allowLocalStock: allowLocalStock || false,
          autoDistribute: autoDistribute || false,
          distributionRules: {
            minStock: distributionRules.minStock || 0,
            maxStock: distributionRules.maxStock || 1000,
            distributionMethod: distributionRules.distributionMethod || 'equal'
          }
        });
      } else {
        console.log('Actualizando configuración existente');
        config.inventoryType = inventoryType;
        config.parentStore = parentStore;
        config.childStores = childStores || [];
        config.allowLocalStock = allowLocalStock || false;
        config.autoDistribute = autoDistribute || false;
        config.distributionRules = {
          minStock: distributionRules.minStock || 0,
          maxStock: distributionRules.maxStock || 1000,
          distributionMethod: distributionRules.distributionMethod || 'equal'
        };
      }

      console.log('Guardando configuración...');
      await config.save();
      console.log('Configuración guardada exitosamente');

      // Si es inventario global, actualizar configuración de las sucursales
      if (inventoryType === 'global' && childStores && childStores.length > 0) {
        console.log('Actualizando configuración de sucursales para inventario global...');
        
        for (const childStoreId of childStores) {
          try {
            // Buscar o crear configuración para la sucursal
            let childConfig = await InventoryConfig.findOne({ store: childStoreId });
            
            if (!childConfig) {
              console.log(`Creando configuración para sucursal: ${childStoreId}`);
              childConfig = new InventoryConfig({
                store: childStoreId,
                inventoryType: 'global',
                parentStore: storeId, // La tienda principal es el padre
                childStores: [],
                allowLocalStock: allowLocalStock || false,
                autoDistribute: false, // Las sucursales no distribuyen automáticamente
                distributionRules: {
                  minStock: distributionRules.minStock || 0,
                  maxStock: distributionRules.maxStock || 1000,
                  distributionMethod: distributionRules.distributionMethod || 'equal'
                }
              });
            } else {
              console.log(`Actualizando configuración para sucursal: ${childStoreId}`);
              childConfig.inventoryType = 'global';
              childConfig.parentStore = storeId; // La tienda principal es el padre
              childConfig.allowLocalStock = allowLocalStock || false;
              childConfig.autoDistribute = false; // Las sucursales no distribuyen automáticamente
              childConfig.distributionRules = {
                minStock: distributionRules.minStock || 0,
                maxStock: distributionRules.maxStock || 1000,
                distributionMethod: distributionRules.distributionMethod || 'equal'
              };
            }
            
            await childConfig.save();
            console.log(`Configuración actualizada para sucursal: ${childStoreId}`);
          } catch (error) {
            console.error(`Error actualizando configuración para sucursal ${childStoreId}:`, error);
          }
        }
      }

      // Si se cambió de global a otro tipo, limpiar referencias de las sucursales
      if (inventoryType !== 'global' && config.childStores && config.childStores.length > 0) {
        console.log('Limpiando referencias de sucursales...');
        
        for (const childStoreId of config.childStores) {
          try {
            const childConfig = await InventoryConfig.findOne({ store: childStoreId });
            if (childConfig && childConfig.parentStore && childConfig.parentStore.toString() === storeId) {
              console.log(`Limpiando configuración de sucursal: ${childStoreId}`);
              childConfig.inventoryType = 'separate';
              childConfig.parentStore = undefined;
              await childConfig.save();
            }
          } catch (error) {
            console.error(`Error limpiando configuración de sucursal ${childStoreId}:`, error);
          }
        }
      }

      res.json({
        success: true,
        message: 'Configuración de inventario actualizada exitosamente',
        data: config
      });
    } catch (error) {
      console.error('Error configurando inventario:', error);
      console.error('Stack trace:', error.stack);
      res.status(500).json({ 
        success: false, 
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Obtener configuración de inventario de una tienda
  async getInventoryConfig(req: Request, res: Response) {
    try {
      const { storeId } = req.params;

      const config = await InventoryConfig.findOne({ store: storeId })
        .populate('parentStore', 'name address city')
        .populate('childStores', 'name address city');

      // Si no hay configuración, retornar configuración por defecto
      if (!config) {
        return res.json({
          success: true,
          data: {
            inventoryType: 'separate',
            childStores: [],
            allowLocalStock: false,
            autoDistribute: false,
            distributionRules: {
              minStock: 0,
              maxStock: 1000,
              distributionMethod: 'equal'
            }
          }
        });
      }

      // Si es una sucursal con inventario global, obtener información adicional
      if (config.inventoryType === 'global' && config.parentStore) {
        // Buscar la configuración de la tienda principal para obtener información completa
        const parentConfig = await InventoryConfig.findOne({ store: config.parentStore })
          .populate('childStores', 'name address city');
        
        if (parentConfig) {
          // Agregar información adicional sobre la configuración global
          const enhancedConfig = {
            ...config.toObject(),
            globalConfig: {
              parentStore: config.parentStore,
              childStores: parentConfig.childStores,
              autoDistribute: parentConfig.autoDistribute,
              distributionRules: parentConfig.distributionRules
            }
          };
          
          return res.json({
            success: true,
            data: enhancedConfig
          });
        }
      }

      res.json({
        success: true,
        data: config
      });
    } catch (error) {
      console.error('Error obteniendo configuración:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  // Obtener configuración de inventario de todas las tiendas del usuario
  async getUserInventoryConfigs(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      
      // Obtener todas las tiendas del usuario
      const stores = await Store.find({ owner: userId });
      const storeIds = stores.map(store => store._id);
      
      // Obtener todas las configuraciones de inventario
      const configs = await InventoryConfig.find({ store: { $in: storeIds } })
        .populate('store', 'name address city isMainStore')
        .populate('parentStore', 'name address city')
        .populate('childStores', 'name address city');
      
      // Organizar las configuraciones por tienda
      const configsByStore = configs.reduce((acc, config) => {
        acc[config.store._id.toString()] = config;
        return acc;
      }, {});
      
      // Crear respuesta con información completa
      const response = stores.map(store => {
        const config = configsByStore[store._id.toString()];
        return {
          store: {
            _id: store._id,
            name: store.name,
            address: store.address,
            city: store.city,
            isMainStore: store.isMainStore
          },
          inventoryConfig: config ? {
            inventoryType: config.inventoryType,
            parentStore: config.parentStore,
            childStores: config.childStores,
            allowLocalStock: config.allowLocalStock,
            autoDistribute: config.autoDistribute,
            distributionRules: config.distributionRules
          } : {
            inventoryType: 'separate',
            childStores: [],
            allowLocalStock: false,
            autoDistribute: false,
            distributionRules: {
              minStock: 0,
              maxStock: 1000,
              distributionMethod: 'equal'
            }
          }
        };
      });
      
      res.json({
        success: true,
        data: response
      });
    } catch (error) {
      console.error('Error obteniendo configuraciones de inventario:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  // Actualizar stock de un producto
  async updateStock(req: Request, res: Response) {
    try {
      const { storeId, productId } = req.params;
      const { 
        quantity, 
        type, 
        reason, 
        reference,
        inventoryType = 'main' // 'main', 'local', 'assigned'
      } = req.body;

      const userId = (req as any).user.id;

      // Verificar configuración de inventario
      const config = await InventoryConfig.findOne({ store: storeId });
      if (!config) {
        return res.status(404).json({ success: false, message: 'Configuración de inventario no encontrada' });
      }

      // Buscar o crear registro de inventario
      let inventory = await ProductInventory.findOne({ 
        product: productId, 
        store: storeId 
      });

      if (!inventory) {
        inventory = new ProductInventory({
          product: productId,
          store: storeId,
          inventoryType: config.inventoryType,
          parentStore: config.parentStore,
          lastUpdatedBy: userId
        });
      }

      // Actualizar stock según el tipo
      const previousQuantity = inventory.mainStock.quantity;
      
      if (inventoryType === 'main') {
        inventory.mainStock.quantity = Math.max(0, inventory.mainStock.quantity + quantity);
      } else if (inventoryType === 'local' && config.allowLocalStock) {
        if (!inventory.localStock) {
          inventory.localStock = {
            quantity: 0,
            reserved: 0,
            available: 0,
            minStock: 0,
            maxStock: 1000
          };
        }
        inventory.localStock.quantity = Math.max(0, inventory.localStock.quantity + quantity);
      } else if (inventoryType === 'assigned' && config.inventoryType === 'global') {
        if (!inventory.assignedStock) {
          inventory.assignedStock = {
            quantity: 0,
            reserved: 0,
            available: 0
          };
        }
        inventory.assignedStock.quantity = Math.max(0, inventory.assignedStock.quantity + quantity);
      }

      // Registrar en el historial
      inventory.updateHistory.push({
        date: new Date(),
        user: userId,
        type: quantity > 0 ? 'stock_in' : 'stock_out',
        quantity: Math.abs(quantity),
        previousQuantity,
        newQuantity: inventory.mainStock.quantity,
        reason,
        reference
      });

      inventory.lastUpdated = new Date();
      inventory.lastUpdatedBy = userId;

      await inventory.save();

      res.json({
        success: true,
        message: 'Stock actualizado correctamente',
        data: inventory
      });
    } catch (error) {
      console.error('Error actualizando stock:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  // Obtener inventario de una tienda
  async getStoreInventory(req: Request, res: Response) {
    try {
      const { storeId } = req.params;
      const { page = 1, limit = 20, search, lowStock, outOfStock } = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      
      // Construir filtros
      const filters: any = { store: storeId };
      
      if (lowStock === 'true') {
        filters['alerts.lowStock'] = true;
      }
      
      if (outOfStock === 'true') {
        filters['alerts.outOfStock'] = true;
      }

      const inventory = await ProductInventory.find(filters)
        .populate('product', 'name sku price category')
        .populate('lastUpdatedBy', 'name email')
        .sort({ 'mainStock.available': 1 })
        .skip(skip)
        .limit(Number(limit));

      const total = await ProductInventory.countDocuments(filters);

      res.json({
        success: true,
        data: inventory,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error obteniendo inventario:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  // Distribuir stock automáticamente (para inventarios globales)
  async distributeStock(req: Request, res: Response) {
    try {
      const { storeId } = req.params;
      const { productId, distributionMethod = 'equal' } = req.body;

      const config = await InventoryConfig.findOne({ store: storeId });
      if (!config || config.inventoryType !== 'global') {
        return res.status(400).json({ 
          success: false, 
          message: 'Esta tienda no tiene inventario global configurado' 
        });
      }

      // Obtener inventario principal
      const mainInventory = await ProductInventory.findOne({ 
        product: productId, 
        store: storeId 
      });

      if (!mainInventory || mainInventory.mainStock.available <= 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'No hay stock disponible para distribuir' 
        });
      }

      const childStores = await Store.find({ _id: { $in: config.childStores } });
      const availableStock = mainInventory.mainStock.available;
      
      let distributionAmount: number;

      if (distributionMethod === 'equal') {
        distributionAmount = Math.floor(availableStock / childStores.length);
      } else if (distributionMethod === 'proportional') {
        // Distribuir proporcionalmente según algún criterio (ej: ventas históricas)
        distributionAmount = Math.floor(availableStock / childStores.length);
      } else {
        return res.status(400).json({ 
          success: false, 
          message: 'Método de distribución no válido' 
        });
      }

      // Crear transferencias para cada sucursal
      const transfers = [];
      
      for (const childStore of childStores) {
        if (distributionAmount > 0) {
          const transfer = new InventoryTransfer({
            fromStore: storeId,
            toStore: childStore._id,
            transferType: 'distribution',
            status: 'pending',
            items: [{
              product: productId,
              productName: mainInventory.product.toString(), // Esto debería ser el nombre real
              requestedQuantity: distributionAmount,
              transferredQuantity: 0,
              unitPrice: 0, // Obtener precio real del producto
              totalValue: 0
            }],
            requestedBy: (req as any).user.id,
            notes: 'Distribución automática de stock'
          });

          await transfer.save();
          transfers.push(transfer);
        }
      }

      res.json({
        success: true,
        message: `Stock distribuido a ${transfers.length} sucursales`,
        data: transfers
      });
    } catch (error) {
      console.error('Error distribuyendo stock:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  // Crear transferencia manual
  async createTransfer(req: Request, res: Response) {
    try {
      const { fromStoreId, toStoreId, items, notes, isUrgent, priority } = req.body;

      // Verificar que ambas tiendas existen
      const [fromStore, toStore] = await Promise.all([
        Store.findById(fromStoreId),
        Store.findById(toStoreId)
      ]);

      if (!fromStore || !toStore) {
        return res.status(404).json({ 
          success: false, 
          message: 'Una o ambas tiendas no encontradas' 
        });
      }

      // Crear transferencia
      const transfer = new InventoryTransfer({
        fromStore: fromStoreId,
        toStore: toStoreId,
        transferType: 'manual',
        items: items.map((item: any) => ({
          ...item,
          totalValue: item.requestedQuantity * item.unitPrice
        })),
        requestedBy: (req as any).user.id,
        notes: notes || '',
        isUrgent: isUrgent || false,
        priority: priority || 'medium'
      });

      await transfer.save();

      res.json({
        success: true,
        message: 'Transferencia creada correctamente',
        data: transfer
      });
    } catch (error) {
      console.error('Error creando transferencia:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  // Obtener transferencias de una tienda
  async getTransfers(req: Request, res: Response) {
    try {
      const { storeId } = req.params;
      const { page = 1, limit = 20, status, type } = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      
      const filters: any = {
        $or: [
          { fromStore: storeId },
          { toStore: storeId }
        ]
      };

      if (status) filters.status = status;
      if (type) filters.transferType = type;

      const transfers = await InventoryTransfer.find(filters)
        .populate('fromStore', 'name address city')
        .populate('toStore', 'name address city')
        .populate('requestedBy', 'name email')
        .populate('approvedBy', 'name email')
        .populate('shippedBy', 'name email')
        .populate('receivedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

      const total = await InventoryTransfer.countDocuments(filters);

      res.json({
        success: true,
        data: transfers,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error obteniendo transferencias:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  // Aprobar transferencia
  async approveTransfer(req: Request, res: Response) {
    try {
      const { transferId } = req.params;

      const transfer = await InventoryTransfer.findById(transferId);
      if (!transfer) {
        return res.status(404).json({ success: false, message: 'Transferencia no encontrada' });
      }

      transfer.status = 'in_transit';
      transfer.approvedBy = (req as any).user.id;
      await transfer.save();

      res.json({
        success: true,
        message: 'Transferencia aprobada',
        data: transfer
      });
    } catch (error) {
      console.error('Error aprobando transferencia:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  // Completar transferencia
  async completeTransfer(req: Request, res: Response) {
    try {
      const { transferId } = req.params;

      const transfer = await InventoryTransfer.findById(transferId);
      if (!transfer) {
        return res.status(404).json({ success: false, message: 'Transferencia no encontrada' });
      }

      // Actualizar inventarios
      for (const item of transfer.items) {
        // Reducir stock de la tienda origen
        await ProductInventory.findOneAndUpdate(
          { product: item.product, store: transfer.fromStore },
          { 
            $inc: { 'mainStock.quantity': -item.transferredQuantity },
            $set: { lastUpdated: new Date(), lastUpdatedBy: (req as any).user.id }
          }
        );

        // Aumentar stock de la tienda destino
        await ProductInventory.findOneAndUpdate(
          { product: item.product, store: transfer.toStore },
          { 
            $inc: { 'mainStock.quantity': item.transferredQuantity },
            $set: { lastUpdated: new Date(), lastUpdatedBy: (req as any).user.id }
          },
          { upsert: true }
        );
      }

      transfer.status = 'completed';
      transfer.actualDeliveryDate = new Date();
      transfer.receivedBy = (req as any).user.id;
      await transfer.save();

      res.json({
        success: true,
        message: 'Transferencia completada',
        data: transfer
      });
    } catch (error) {
      console.error('Error completando transferencia:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  // Limpiar configuraciones duplicadas de inventario
  async cleanDuplicateConfigs(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      
      console.log('Iniciando limpieza de configuraciones duplicadas...');
      
      // Obtener todas las tiendas del usuario
      const stores = await Store.find({ owner: userId });
      const storeIds = stores.map(store => store._id);
      
      // Obtener todas las configuraciones
      const configs = await InventoryConfig.find({ store: { $in: storeIds } });
      
      console.log(`Encontradas ${configs.length} configuraciones para ${stores.length} tiendas`);
      
      // Agrupar configuraciones por tienda
      const configsByStore = {};
      configs.forEach(config => {
        const storeId = config.store.toString();
        if (!configsByStore[storeId]) {
          configsByStore[storeId] = [];
        }
        configsByStore[storeId].push(config);
      });
      
      // Identificar y eliminar duplicados
      let deletedCount = 0;
      for (const [storeId, storeConfigs] of Object.entries(configsByStore)) {
        if (storeConfigs.length > 1) {
          console.log(`Tienda ${storeId} tiene ${storeConfigs.length} configuraciones`);
          
          // Mantener la más reciente y eliminar las demás
          const sortedConfigs = storeConfigs.sort((a, b) => 
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
          
          const configToKeep = sortedConfigs[0];
          const configsToDelete = sortedConfigs.slice(1);
          
          console.log(`Manteniendo configuración más reciente: ${configToKeep._id}`);
          console.log(`Eliminando ${configsToDelete.length} configuraciones duplicadas`);
          
          for (const configToDelete of configsToDelete) {
            await InventoryConfig.findByIdAndDelete(configToDelete._id);
            deletedCount++;
          }
        }
      }
      
      // Limpiar childStores duplicados en configuraciones globales
      const globalConfigs = await InventoryConfig.find({ 
        store: { $in: storeIds },
        inventoryType: 'global'
      });
      
      let cleanedChildStores = 0;
      for (const config of globalConfigs) {
        if (config.childStores && config.childStores.length > 0) {
          // Remover duplicados de childStores
          const uniqueChildStores = [...new Set(config.childStores.map(id => id.toString()))];
          
          if (uniqueChildStores.length !== config.childStores.length) {
            console.log(`Limpiando childStores duplicados en configuración ${config._id}`);
            console.log(`Antes: ${config.childStores.length}, Después: ${uniqueChildStores.length}`);
            
            config.childStores = uniqueChildStores;
            await config.save();
            cleanedChildStores++;
          }
        }
      }
      
      console.log(`Limpieza completada. Eliminadas ${deletedCount} configuraciones duplicadas, limpiadas ${cleanedChildStores} configuraciones de childStores`);
      
      res.json({
        success: true,
        message: 'Limpieza de configuraciones duplicadas completada',
        data: {
          deletedConfigs: deletedCount,
          cleanedChildStores: cleanedChildStores,
          totalStores: stores.length,
          totalConfigs: configs.length - deletedCount
        }
      });
    } catch (error) {
      console.error('Error limpiando configuraciones duplicadas:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // ===== MÉTODOS PARA ADMIN =====

  // Obtener inventario de todas las tiendas (Admin)
  async getAdminInventory(req: Request, res: Response) {
    try {
      const { storeId, inventoryType, alert, search } = req.query;
      
      // Construir filtros
      const filters: any = {};
      
      if (storeId && storeId !== 'all') {
        filters.store = storeId;
      }
      
      if (inventoryType && inventoryType !== 'all') {
        filters.inventoryType = inventoryType;
      }
      
      if (alert && alert !== 'all') {
        if (alert === 'lowStock') filters['alerts.lowStock'] = true;
        if (alert === 'outOfStock') filters['alerts.outOfStock'] = true;
        if (alert === 'overStock') filters['alerts.overStock'] = true;
        if (alert === 'normal') {
          filters['alerts.lowStock'] = false;
          filters['alerts.outOfStock'] = false;
          filters['alerts.overStock'] = false;
        }
      }

      let query = ProductInventory.find(filters)
        .populate('product', 'name sku price category brand')
        .populate('store', 'name address')
        .populate('lastUpdatedBy', 'name email')
        .sort({ lastUpdated: -1 });

      // Aplicar búsqueda si existe
      if (search) {
        const searchRegex = new RegExp(search as string, 'i');
        query = ProductInventory.find({
          ...filters,
          $or: [
            { 'product.name': searchRegex },
            { 'product.sku': searchRegex },
            { 'store.name': searchRegex }
          ]
        })
        .populate('product', 'name sku price category brand')
        .populate('store', 'name address')
        .populate('lastUpdatedBy', 'name email')
        .sort({ lastUpdated: -1 });
      }

      const inventory = await query;

      res.json({
        success: true,
        data: inventory
      });
    } catch (error) {
      console.error('Error obteniendo inventario admin:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  // Obtener estadísticas globales (Admin)
  async getAdminStats(req: Request, res: Response) {
    try {
      const totalProducts = await ProductInventory.countDocuments();
      const totalStores = await ProductInventory.distinct('store').length;
      const lowStockItems = await ProductInventory.countDocuments({ 'alerts.lowStock': true });
      const outOfStockItems = await ProductInventory.countDocuments({ 'alerts.outOfStock': true });
      
      // Calcular valor total del inventario
      const inventoryWithProducts = await ProductInventory.find()
        .populate('product', 'price')
        .select('mainStock.quantity product');
      
      const totalValue = inventoryWithProducts.reduce((total, item) => {
        return total + (item.mainStock.quantity * (item.product as any).price);
      }, 0);

      res.json({
        success: true,
        data: {
          totalProducts,
          totalStores,
          lowStockItems,
          outOfStockItems,
          totalValue
        }
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas admin:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  // Exportar inventario (Admin)
  async exportAdminInventory(req: Request, res: Response) {
    try {
      const { storeId, inventoryType, alert, search } = req.query;
      
      // Usar la misma lógica que getAdminInventory
      const filters: any = {};
      
      if (storeId && storeId !== 'all') {
        filters.store = storeId;
      }
      
      if (inventoryType && inventoryType !== 'all') {
        filters.inventoryType = inventoryType;
      }
      
      if (alert && alert !== 'all') {
        if (alert === 'lowStock') filters['alerts.lowStock'] = true;
        if (alert === 'outOfStock') filters['alerts.outOfStock'] = true;
        if (alert === 'overStock') filters['alerts.overStock'] = true;
        if (alert === 'normal') {
          filters['alerts.lowStock'] = false;
          filters['alerts.outOfStock'] = false;
          filters['alerts.overStock'] = false;
        }
      }

      let query = ProductInventory.find(filters)
        .populate('product', 'name sku price category brand')
        .populate('store', 'name address')
        .sort({ lastUpdated: -1 });

      if (search) {
        const searchRegex = new RegExp(search as string, 'i');
        query = ProductInventory.find({
          ...filters,
          $or: [
            { 'product.name': searchRegex },
            { 'product.sku': searchRegex },
            { 'store.name': searchRegex }
          ]
        })
        .populate('product', 'name sku price category brand')
        .populate('store', 'name address')
        .sort({ lastUpdated: -1 });
      }

      const inventory = await query;

      // Generar CSV
      const csvHeader = 'Producto,SKU,Precio,Categoría,Marca,Tienda,Tipo Inventario,Stock Total,Stock Disponible,Stock Reservado,Stock Mínimo,Stock Máximo,Estado,Última Actualización\n';
      
      const csvRows = inventory.map(item => {
        const product = item.product as any;
        const store = item.store as any;
        
        let estado = 'Normal';
        if (item.alerts.outOfStock) estado = 'Sin Stock';
        else if (item.alerts.lowStock) estado = 'Stock Bajo';
        else if (item.alerts.overStock) estado = 'Stock Alto';
        
        return `"${product.name}","${product.sku}",${product.price},"${product.category}","${product.brand}","${store.name}","${item.inventoryType}",${item.mainStock.quantity},${item.mainStock.available},${item.mainStock.reserved},${item.mainStock.minStock},${item.mainStock.maxStock},"${estado}","${item.lastUpdated.toISOString()}"`;
      }).join('\n');

      const csvContent = csvHeader + csvRows;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="inventario_admin_${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvContent);
    } catch (error) {
      console.error('Error exportando inventario admin:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  // Importar inventario (Admin)
  async importAdminInventory(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No se proporcionó archivo CSV' });
      }

      const csvContent = req.file.buffer.toString('utf-8');
      const lines = csvContent.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '') continue;
        
        try {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
          const row: any = {};
          
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });

          // Buscar producto por SKU
          const product = await Product.findOne({ sku: row.SKU });
          if (!product) {
            errors.push(`Fila ${i + 1}: Producto con SKU ${row.SKU} no encontrado`);
            errorCount++;
            continue;
          }

          // Buscar tienda por nombre
          const store = await Store.findOne({ name: row.Tienda });
          if (!store) {
            errors.push(`Fila ${i + 1}: Tienda ${row.Tienda} no encontrada`);
            errorCount++;
            continue;
          }

          // Buscar o crear inventario
          let inventory = await ProductInventory.findOne({
            product: product._id,
            store: store._id
          });

          if (!inventory) {
            inventory = new ProductInventory({
              product: product._id,
              store: store._id,
              inventoryType: row['Tipo Inventario'] || 'separate',
              lastUpdatedBy: (req as any).user.id
            });
          }

          // Actualizar stock
          inventory.mainStock.quantity = parseInt(row['Stock Total']) || 0;
          inventory.mainStock.reserved = parseInt(row['Stock Reservado']) || 0;
          inventory.mainStock.minStock = parseInt(row['Stock Mínimo']) || 0;
          inventory.mainStock.maxStock = parseInt(row['Stock Máximo']) || 1000;
          inventory.lastUpdated = new Date();
          inventory.lastUpdatedBy = (req as any).user.id;

          await inventory.save();
          successCount++;

        } catch (error) {
          errors.push(`Fila ${i + 1}: ${error.message}`);
          errorCount++;
        }
      }

      res.json({
        success: true,
        data: {
          successCount,
          errorCount,
          errors: errors.slice(0, 10) // Solo mostrar los primeros 10 errores
        }
      });
    } catch (error) {
      console.error('Error importando inventario admin:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  // ===== MÉTODOS PARA STORE MANAGER =====

  // Obtener inventario de tiendas del usuario (Store Manager)
  async getStoreManagerInventory(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { storeId, inventoryType, alert, search } = req.query;
      
      // Obtener tiendas del usuario
      const user = await User.findById(userId).populate('stores');
      if (!user || !user.stores || user.stores.length === 0) {
        return res.status(404).json({ success: false, message: 'No se encontraron tiendas asignadas' });
      }

      const userStoreIds = (user.stores as any[]).map(store => store._id);
      
      // Construir filtros
      const filters: any = { store: { $in: userStoreIds } };
      
      if (storeId && storeId !== 'all') {
        filters.store = storeId;
      }
      
      if (inventoryType && inventoryType !== 'all') {
        filters.inventoryType = inventoryType;
      }
      
      if (alert && alert !== 'all') {
        if (alert === 'lowStock') filters['alerts.lowStock'] = true;
        if (alert === 'outOfStock') filters['alerts.outOfStock'] = true;
        if (alert === 'overStock') filters['alerts.overStock'] = true;
        if (alert === 'normal') {
          filters['alerts.lowStock'] = false;
          filters['alerts.outOfStock'] = false;
          filters['alerts.overStock'] = false;
        }
      }

      let query = ProductInventory.find(filters)
        .populate('product', 'name sku price category brand')
        .populate('store', 'name address')
        .populate('lastUpdatedBy', 'name email')
        .sort({ lastUpdated: -1 });

      // Aplicar búsqueda si existe
      if (search) {
        const searchRegex = new RegExp(search as string, 'i');
        query = ProductInventory.find({
          ...filters,
          $or: [
            { 'product.name': searchRegex },
            { 'product.sku': searchRegex }
          ]
        })
        .populate('product', 'name sku price category brand')
        .populate('store', 'name address')
        .populate('lastUpdatedBy', 'name email')
        .sort({ lastUpdated: -1 });
      }

      const inventory = await query;

      res.json({
        success: true,
        data: inventory
      });
    } catch (error) {
      console.error('Error obteniendo inventario store manager:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  // Obtener estadísticas de tienda (Store Manager)
  async getStoreManagerStats(req: Request, res: Response) {
    try {
      const { storeId } = req.params;
      const userId = (req as any).user.id;
      
      // Verificar que el usuario tenga acceso a la tienda
      const user = await User.findById(userId).populate('stores');
      if (!user || !user.stores) {
        return res.status(404).json({ success: false, message: 'No se encontraron tiendas asignadas' });
      }

      const userStoreIds = (user.stores as any[]).map(store => store._id);
      if (!userStoreIds.includes(storeId)) {
        return res.status(403).json({ success: false, message: 'No tienes acceso a esta tienda' });
      }

      const totalProducts = await ProductInventory.countDocuments({ store: storeId });
      const lowStockItems = await ProductInventory.countDocuments({ 
        store: storeId, 
        'alerts.lowStock': true 
      });
      const outOfStockItems = await ProductInventory.countDocuments({ 
        store: storeId, 
        'alerts.outOfStock': true 
      });
      
      // Calcular valor total del inventario
      const inventoryWithProducts = await ProductInventory.find({ store: storeId })
        .populate('product', 'price')
        .select('mainStock.quantity product');
      
      const totalValue = inventoryWithProducts.reduce((total, item) => {
        return total + (item.mainStock.quantity * (item.product as any).price);
      }, 0);

      // Contar movimientos recientes (últimos 7 días)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentMovements = await ProductInventory.countDocuments({
        store: storeId,
        lastUpdated: { $gte: sevenDaysAgo }
      });

      res.json({
        success: true,
        data: {
          totalProducts,
          lowStockItems,
          outOfStockItems,
          totalValue,
          recentMovements
        }
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas store manager:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  // Obtener movimientos recientes (Store Manager)
  async getStoreManagerMovements(req: Request, res: Response) {
    try {
      const { storeId } = req.params;
      const userId = (req as any).user.id;
      
      // Verificar que el usuario tenga acceso a la tienda
      const user = await User.findById(userId).populate('stores');
      if (!user || !user.stores) {
        return res.status(404).json({ success: false, message: 'No se encontraron tiendas asignadas' });
      }

      const userStoreIds = (user.stores as any[]).map(store => store._id);
      if (!userStoreIds.includes(storeId)) {
        return res.status(403).json({ success: false, message: 'No tienes acceso a esta tienda' });
      }

      // Obtener historial de actualizaciones de inventario
      const inventory = await ProductInventory.find({ store: storeId })
        .populate('product', 'name sku')
        .populate('lastUpdatedBy', 'name')
        .sort({ lastUpdated: -1 })
        .limit(50);

      const movements = inventory.map(item => ({
        _id: item._id,
        type: 'adjustment',
        quantity: item.mainStock.quantity,
        reason: 'Actualización de stock',
        date: item.lastUpdated,
        user: (item.lastUpdatedBy as any)?.name || 'Sistema'
      }));

      res.json({
        success: true,
        data: movements
      });
    } catch (error) {
      console.error('Error obteniendo movimientos store manager:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  // Exportar inventario (Store Manager)
  async exportStoreManagerInventory(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { storeId, inventoryType, alert, search } = req.query;
      
      // Obtener tiendas del usuario
      const user = await User.findById(userId).populate('stores');
      if (!user || !user.stores || user.stores.length === 0) {
        return res.status(404).json({ success: false, message: 'No se encontraron tiendas asignadas' });
      }

      const userStoreIds = (user.stores as any[]).map(store => store._id);
      
      // Construir filtros
      const filters: any = { store: { $in: userStoreIds } };
      
      if (storeId && storeId !== 'all') {
        filters.store = storeId;
      }
      
      if (inventoryType && inventoryType !== 'all') {
        filters.inventoryType = inventoryType;
      }
      
      if (alert && alert !== 'all') {
        if (alert === 'lowStock') filters['alerts.lowStock'] = true;
        if (alert === 'outOfStock') filters['alerts.outOfStock'] = true;
        if (alert === 'overStock') filters['alerts.overStock'] = true;
        if (alert === 'normal') {
          filters['alerts.lowStock'] = false;
          filters['alerts.outOfStock'] = false;
          filters['alerts.overStock'] = false;
        }
      }

      let query = ProductInventory.find(filters)
        .populate('product', 'name sku price category brand')
        .populate('store', 'name address')
        .sort({ lastUpdated: -1 });

      if (search) {
        const searchRegex = new RegExp(search as string, 'i');
        query = ProductInventory.find({
          ...filters,
          $or: [
            { 'product.name': searchRegex },
            { 'product.sku': searchRegex }
          ]
        })
        .populate('product', 'name sku price category brand')
        .populate('store', 'name address')
        .sort({ lastUpdated: -1 });
      }

      const inventory = await query;

      // Generar CSV
      const csvHeader = 'Producto,SKU,Precio,Categoría,Marca,Tienda,Tipo Inventario,Stock Total,Stock Disponible,Stock Reservado,Stock Mínimo,Stock Máximo,Estado,Última Actualización\n';
      
      const csvRows = inventory.map(item => {
        const product = item.product as any;
        const store = item.store as any;
        
        let estado = 'Normal';
        if (item.alerts.outOfStock) estado = 'Sin Stock';
        else if (item.alerts.lowStock) estado = 'Stock Bajo';
        else if (item.alerts.overStock) estado = 'Stock Alto';
        
        return `"${product.name}","${product.sku}",${product.price},"${product.category}","${product.brand}","${store.name}","${item.inventoryType}",${item.mainStock.quantity},${item.mainStock.available},${item.mainStock.reserved},${item.mainStock.minStock},${item.mainStock.maxStock},"${estado}","${item.lastUpdated.toISOString()}"`;
      }).join('\n');

      const csvContent = csvHeader + csvRows;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="inventario_store_manager_${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvContent);
    } catch (error) {
      console.error('Error exportando inventario store manager:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  // Importar inventario (Store Manager)
  async importStoreManagerInventory(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No se proporcionó archivo CSV' });
      }

      const userId = (req as any).user.id;
      const { storeId } = req.body;
      
      // Verificar que el usuario tenga acceso a la tienda
      const user = await User.findById(userId).populate('stores');
      if (!user || !user.stores) {
        return res.status(404).json({ success: false, message: 'No se encontraron tiendas asignadas' });
      }

      const userStoreIds = (user.stores as any[]).map(store => store._id);
      if (!userStoreIds.includes(storeId)) {
        return res.status(403).json({ success: false, message: 'No tienes acceso a esta tienda' });
      }

      const csvContent = req.file.buffer.toString('utf-8');
      const lines = csvContent.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '') continue;
        
        try {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
          const row: any = {};
          
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });

          // Buscar producto por SKU
          const product = await Product.findOne({ sku: row.SKU });
          if (!product) {
            errors.push(`Fila ${i + 1}: Producto con SKU ${row.SKU} no encontrado`);
            errorCount++;
            continue;
          }

          // Buscar o crear inventario
          let inventory = await ProductInventory.findOne({
            product: product._id,
            store: storeId
          });

          if (!inventory) {
            inventory = new ProductInventory({
              product: product._id,
              store: storeId,
              inventoryType: row['Tipo Inventario'] || 'separate',
              lastUpdatedBy: userId
            });
          }

          // Actualizar stock
          inventory.mainStock.quantity = parseInt(row['Stock Total']) || 0;
          inventory.mainStock.reserved = parseInt(row['Stock Reservado']) || 0;
          inventory.mainStock.minStock = parseInt(row['Stock Mínimo']) || 0;
          inventory.mainStock.maxStock = parseInt(row['Stock Máximo']) || 1000;
          inventory.lastUpdated = new Date();
          inventory.lastUpdatedBy = userId;

          await inventory.save();
          successCount++;

        } catch (error) {
          errors.push(`Fila ${i + 1}: ${error.message}`);
          errorCount++;
        }
      }

      res.json({
        success: true,
        data: {
          successCount,
          errorCount,
          errors: errors.slice(0, 10) // Solo mostrar los primeros 10 errores
        }
      });
    } catch (error) {
      console.error('Error importando inventario store manager:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }
}

export default new InventoryController();
