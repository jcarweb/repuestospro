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

      res.json({
        success: true,
        data: config
      });
    } catch (error) {
      console.error('Error obteniendo configuración:', error);
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
}

export default new InventoryController();
