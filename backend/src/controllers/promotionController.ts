import { Request, Response } from 'express';
import PromotionService from '../services/promotionService';
import Product from '../models/Product';
import Category from '../models/Category';
import Store from '../models/Store';

export class PromotionController {
  // Crear nueva promoción
  static async createPromotion(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user._id;
      const userRole = (req as any).user.role;
      const promotionData = req.body;

      // Validar datos requeridos
      if (!promotionData.name || !promotionData.description || !promotionData.type) {
        res.status(400).json({
          success: false,
          message: 'Nombre, descripción y tipo son requeridos'
        });
        return;
      }

      // Validar fechas
      if (!promotionData.startDate || !promotionData.endDate) {
        res.status(400).json({
          success: false,
          message: 'Fechas de inicio y fin son requeridas'
        });
        return;
      }

      // Validar productos
      if (!promotionData.products || promotionData.products.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Al menos un producto debe ser seleccionado'
        });
        return;
      }

      // Lógica de tienda según el rol
      if (userRole === 'admin') {
        // Admin debe especificar la tienda
        if (!promotionData.store) {
          res.status(400).json({
            success: false,
            message: 'La tienda es requerida para administradores'
          });
          return;
        }
        
        // Verificar que la tienda existe
        const store = await Store.findById(promotionData.store);
        if (!store) {
          res.status(404).json({
            success: false,
            message: 'Tienda no encontrada'
          });
          return;
        }
      } else if (userRole === 'store_manager') {
        // Store manager solo puede crear promociones para su tienda
        const userStore = await Store.findOne({ manager: userId });
        if (!userStore) {
          res.status(403).json({
            success: false,
            message: 'No tienes una tienda asignada'
          });
          return;
        }
        
        // Asignar automáticamente la tienda del manager
        promotionData.store = userStore._id;
      } else {
        res.status(403).json({
          success: false,
          message: 'No tienes permisos para crear promociones'
        });
        return;
      }

      const promotion = await PromotionService.createPromotion(promotionData, userId);

      res.status(201).json({
        success: true,
        message: 'Promoción creada exitosamente',
        data: promotion
      });
    } catch (error) {
      console.error('Error creando promoción:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  }

  // Obtener todas las promociones
  static async getAllPromotions(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user._id;
      const userRole = (req as any).user.role;
      const filters = req.query;

      let promotions;
      
      if (userRole === 'admin') {
        // Admin puede ver todas las promociones o filtrar por tienda
        promotions = await PromotionService.getAllPromotions(filters);
      } else if (userRole === 'store_manager') {
        // Store manager solo ve promociones de su tienda
        const userStore = await Store.findOne({ manager: userId });
        if (!userStore) {
          res.status(403).json({
            success: false,
            message: 'No tienes una tienda asignada'
          });
          return;
        }
        
        // Agregar filtro de tienda
        filters.store = userStore._id.toString();
        promotions = await PromotionService.getAllPromotions(filters);
      } else {
        res.status(403).json({
          success: false,
          message: 'No tienes permisos para ver promociones'
        });
        return;
      }

      res.json({
        success: true,
        data: promotions
      });
    } catch (error) {
      console.error('Error obteniendo promociones:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  }

  // Obtener promoción por ID
  static async getPromotionById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const promotion = await PromotionService.getPromotionById(id);

      if (!promotion) {
        res.status(404).json({
          success: false,
          message: 'Promoción no encontrada'
        });
        return;
      }

      res.json({
        success: true,
        data: promotion
      });
    } catch (error) {
      console.error('Error obteniendo promoción:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  }

  // Actualizar promoción
  static async updatePromotion(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const promotion = await PromotionService.updatePromotion(id, updateData);

      if (!promotion) {
        res.status(404).json({
          success: false,
          message: 'Promoción no encontrada'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Promoción actualizada exitosamente',
        data: promotion
      });
    } catch (error) {
      console.error('Error actualizando promoción:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  }

  // Eliminar promoción
  static async deletePromotion(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await PromotionService.deletePromotion(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Promoción no encontrada'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Promoción eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error eliminando promoción:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  }

  // Activar/Desactivar promoción
  static async togglePromotionStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const promotion = await PromotionService.togglePromotionStatus(id);

      if (!promotion) {
        res.status(404).json({
          success: false,
          message: 'Promoción no encontrada'
        });
        return;
      }

      res.json({
        success: true,
        message: `Promoción ${promotion.isActive ? 'activada' : 'desactivada'} exitosamente`,
        data: promotion
      });
    } catch (error) {
      console.error('Error cambiando estado de promoción:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  }

  // Obtener estadísticas de promociones
  static async getPromotionStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await PromotionService.getPromotionStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  }

  // Obtener productos disponibles para promociones
  static async getAvailableProducts(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user._id;
      const userRole = (req as any).user.role;
      const { storeId } = req.query; // Para admin que puede especificar tienda

      let productFilter: any = { isActive: true };

      if (userRole === 'admin') {
        // Admin puede ver productos de todas las tiendas o filtrar por tienda específica
        if (storeId) {
          productFilter.store = storeId;
        }
      } else if (userRole === 'store_manager') {
        // Store manager solo ve productos de su tienda
        const userStore = await Store.findOne({ manager: userId });
        if (!userStore) {
          res.status(403).json({
            success: false,
            message: 'No tienes una tienda asignada'
          });
          return;
        }
        productFilter.store = userStore._id;
      } else {
        res.status(403).json({
          success: false,
          message: 'No tienes permisos para ver productos'
        });
        return;
      }

      const products = await Product.find(productFilter)
        .select('name price image description category store')
        .populate('category', 'name')
        .populate('store', 'name')
        .sort({ name: 1 });

      res.json({
        success: true,
        data: products
      });
    } catch (error) {
      console.error('Error obteniendo productos:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  }

  // Obtener tiendas disponibles para promociones (solo admin)
  static async getAvailableStores(req: Request, res: Response): Promise<void> {
    try {
      const userRole = (req as any).user.role;

      if (userRole !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Solo los administradores pueden ver la lista de tiendas'
        });
        return;
      }

      const stores = await Store.find({ isActive: true })
        .select('name description address city state')
        .sort({ name: 1 });

      res.json({
        success: true,
        data: stores
      });
    } catch (error) {
      console.error('Error obteniendo tiendas:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  }

  // Obtener categorías disponibles para promociones
  static async getAvailableCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await Category.find({ isActive: true })
        .select('name description')
        .sort({ name: 1 });

      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      console.error('Error obteniendo categorías:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  }

  // Calcular precio con promociones para un producto
  static async calculateProductPrice(req: Request, res: Response): Promise<void> {
    try {
      const { productId } = req.params;
      const { originalPrice } = req.body;

      if (!originalPrice) {
        res.status(400).json({
          success: false,
          message: 'Precio original es requerido'
        });
        return;
      }

      const priceInfo = await PromotionService.calculateProductPriceWithPromotions(
        productId,
        originalPrice
      );

      res.json({
        success: true,
        data: priceInfo
      });
    } catch (error) {
      console.error('Error calculando precio:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  }

  // Obtener promociones próximas a expirar
  static async getExpiringPromotions(req: Request, res: Response): Promise<void> {
    try {
      const { days = 7 } = req.query;
      const promotions = await PromotionService.getExpiringPromotions(Number(days));

      res.json({
        success: true,
        data: promotions
      });
    } catch (error) {
      console.error('Error obteniendo promociones próximas a expirar:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  }

  // Validar promoción para un producto
  static async validatePromotion(req: Request, res: Response): Promise<void> {
    try {
      const { promotionId, productId } = req.params;
      const isValid = await PromotionService.validatePromotionForProduct(promotionId, productId);

      res.json({
        success: true,
        data: { isValid }
      });
    } catch (error) {
      console.error('Error validando promoción:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  }

  // Incrementar uso de promoción
  static async incrementPromotionUsage(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await PromotionService.incrementPromotionUsage(id);

      res.json({
        success: true,
        message: 'Uso de promoción incrementado exitosamente'
      });
    } catch (error) {
      console.error('Error incrementando uso de promoción:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  }
} 