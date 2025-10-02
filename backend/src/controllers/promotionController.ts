import { Request, Response } from 'express';
import PromotionService from '../services/promotionService';
import { SubscriptionService } from '../services/subscriptionService';
import Product from '../models/Product';
import Category from '../models/Category';
import Store from '../models/Store';
import Promotion from '../models/Promotion';
interface AuthenticatedRequest extends Request {
  user?: any;
}
export class PromotionController {
  // Crear nueva promoción
  static async createPromotion(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id || req.user?.id;
      const userRole = req.user?.role;
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
      // Obtener la tienda del usuario
      let userStore;
      if (userRole === 'store_manager') {
        userStore = await Store.findOne({ managers: userId });
      } else if (userRole === 'admin') {
        // Para admin, usar la tienda especificada en promotionData.store
        if (promotionData.store) {
          userStore = await Store.findById(promotionData.store);
        }
      }
      if (!userStore) {
        res.status(403).json({
          success: false,
          message: 'No tienes una tienda asignada'
        });
        return;
      }
      // Verificar acceso a promociones según el plan de suscripción
      const accessCheck = await SubscriptionService.hasPromotionsAccess((userStore._id as any).toString());
      if (!accessCheck.hasAccess) {
        res.status(403).json({
          success: false,
          message: accessCheck.reason || 'No tienes acceso a promociones',
          subscription: accessCheck.subscription,
          requiresUpgrade: true
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
        // Configurar alcance según el tipo de tienda
        if (store.isMainStore) {
          promotionData.isMainStorePromotion = true;
          // Si no se especifica scope, por defecto es 'store'
          if (!promotionData.scope) {
            promotionData.scope = 'store';
          }
        }
      } else if (userRole === 'store_manager') {
        // Store manager solo puede crear promociones para su tienda
        const userStore = await Store.findOne({ managers: userId });
        if (!userStore) {
          res.status(403).json({
            success: false,
            message: 'No tienes una tienda asignada'
          });
          return;
        }
        // Asignar automáticamente la tienda del manager
        promotionData.store = userStore._id;
        // Configurar alcance según el tipo de tienda
        if (userStore.isMainStore) {
          promotionData.isMainStorePromotion = true;
          // Tienda principal puede crear promociones para todas las sucursales
          if (!promotionData.scope) {
            promotionData.scope = 'store';
          }
          // Validar que si es scope 'specific_branches', se especifiquen las sucursales
          if (promotionData.scope === 'specific_branches' && (!promotionData.targetBranches || promotionData.targetBranches.length === 0)) {
            res.status(400).json({
              success: false,
              message: 'Debe especificar las sucursales objetivo para promociones específicas'
            });
            return;
          }
        } else {
          // Sucursal solo puede crear promociones para sí misma
          promotionData.scope = 'store';
          promotionData.isMainStorePromotion = false;
        }
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
        message: (error as Error).message || 'Error interno del servidor'
      });
    }
  }
  // Obtener todas las promociones
  static async getAllPromotions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id || req.user?.id;
      const userRole = req.user?.role;
      const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc', search, type, status, store } = req.query;
      // Construir filtros base
      let filters: any = {};
      // Filtros de búsqueda
      if (search) {
        filters.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }
      // Filtro por tipo
      if (type && type !== 'all') {
        filters.type = type;
      }
      // Filtro por estado
      if (status && status !== 'all') {
        if (status === 'active') {
          filters.isActive = true;
        } else if (status === 'inactive') {
          filters.isActive = false;
        }
      }
      // Filtro por tienda según el rol y permisos
      let userStore: any = null;
      if (userRole === 'admin') {
        // Admin puede ver todas las promociones o filtrar por tienda específica
        if (store) {
          filters.store = store;
        }
      } else if (userRole === 'store_manager') {
        // Store manager ve promociones según su tienda y permisos
        userStore = await Store.findOne({ managers: userId });
        if (!userStore) {
          res.status(403).json({
            success: false,
            message: 'No tienes una tienda asignada'
          });
          return;
        }
        // Simplificar: store_manager ve solo las promociones de sus tiendas asignadas
        filters.store = userStore._id;
      } else {
        res.status(403).json({
          success: false,
          message: 'No tienes permisos para ver promociones'
        });
        return;
      }
      // Calcular paginación
      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
      const sort = { [sortBy as string]: sortOrder === 'desc' ? -1 : 1 };
      // Obtener promociones con consulta directa a MongoDB
      let promotions;
      try {
         // Usar consulta directa a MongoDB con populate
         promotions = await Promotion.find(filters)
           .populate('store', 'name isMainStore')
           .populate('products', 'name price image')
           .populate('categories', 'name')
           .populate('createdBy', 'name email')
           .populate('targetBranches', 'name')
            .sort(sort as any)
           .skip(skip)
           .limit(parseInt(limit as string));
       } catch (dbError) {
         console.error('Error en consulta de promociones:', dbError);
         // Si hay error, intentar con consulta simple
         const simpleFilters = { store: userStore?._id };
         promotions = await Promotion.find(simpleFilters)
           .populate('store', 'name isMainStore')
           .populate('products', 'name price image')
           .populate('categories', 'name')
           .populate('createdBy', 'name email')
           .populate('targetBranches', 'name')
            .sort(sort as any)
           .skip(skip)
           .limit(parseInt(limit as string));
       }
             // Contar total con consulta directa
       let total;
       try {
         total = await Promotion.countDocuments(filters);
       } catch (countError) {
         console.error('Error contando promociones:', countError);
         // Si hay error, intentar con consulta simple
         const simpleFilters = { store: userStore?._id };
         total = await Promotion.countDocuments(simpleFilters);
       }
      const totalPages = Math.ceil(total / parseInt(limit as string));
      res.json({
        success: true,
        promotions,
        total,
        totalPages,
        currentPage: parseInt(page as string)
      });
    } catch (error) {
      console.error('Error obteniendo promociones:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
  // Verificar acceso a promociones
  static async checkPromotionsAccess(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id || req.user?.id;
      const userRole = req.user?.role;
      const { storeId } = req.query;
      if (!storeId) {
        res.status(400).json({
          success: false,
          message: 'ID de tienda requerido'
        });
        return;
      }
      // Verificar acceso a promociones según el plan de suscripción
      const accessCheck = await SubscriptionService.hasPromotionsAccess(storeId as string);
      res.json({
        success: true,
        hasAccess: accessCheck.hasAccess,
        reason: accessCheck.reason,
        subscription: accessCheck.subscription,
        requiresUpgrade: !accessCheck.hasAccess
      });
    } catch (error) {
      console.error('Error verificando acceso a promociones:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
  // Obtener promoción por ID
  static async getPromotionById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const promotion = await PromotionService.getPromotionById(id || '');
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
        message: (error as Error).message || 'Error interno del servidor'
      });
    }
  }
  // Actualizar promoción
  static async updatePromotion(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const promotion = await PromotionService.updatePromotion(id || '', updateData);
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
        message: (error as Error).message || 'Error interno del servidor'
      });
    }
  }
  // Eliminar promoción
  static async deletePromotion(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await PromotionService.deletePromotion(id || '');
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
        message: (error as Error).message || 'Error interno del servidor'
      });
    }
  }
  // Activar/Desactivar promoción
  static async togglePromotionStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const promotion = await PromotionService.togglePromotionStatus(id || '');
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
        message: (error as Error).message || 'Error interno del servidor'
      });
    }
  }
  // Obtener estadísticas de promociones
  static async getPromotionStats(req: AuthenticatedRequest, res: Response): Promise<void> {
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
        message: (error as Error).message || 'Error interno del servidor'
      });
    }
  }
  // Obtener productos disponibles para promociones
  static async getAvailableProducts(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id || req.user?.id;
      const userRole = req.user?.role;
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
        message: (error as Error).message || 'Error interno del servidor'
      });
    }
  }
  // Obtener tiendas disponibles para promociones (solo admin)
  static async getAvailableStores(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userRole = req.user?.role;
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
        message: (error as Error).message || 'Error interno del servidor'
      });
    }
  }
  // Obtener categorías disponibles para promociones
  static async getAvailableCategories(req: AuthenticatedRequest, res: Response): Promise<void> {
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
        message: (error as Error).message || 'Error interno del servidor'
      });
    }
  }
  // Calcular precio con promociones para un producto
  static async calculateProductPrice(req: AuthenticatedRequest, res: Response): Promise<void> {
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
        productId || '',
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
        message: (error as Error).message || 'Error interno del servidor'
      });
    }
  }
  // Obtener promociones próximas a expirar
  static async getExpiringPromotions(req: AuthenticatedRequest, res: Response): Promise<void> {
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
        message: (error as Error).message || 'Error interno del servidor'
      });
    }
  }
  // Validar promoción para un producto
  static async validatePromotion(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { promotionId, productId } = req.params;
      const isValid = await PromotionService.validatePromotionForProduct(promotionId || '', productId || '');
      res.json({
        success: true,
        data: { isValid }
      });
    } catch (error) {
      console.error('Error validando promoción:', error);
      res.status(500).json({
        success: false,
        message: (error as Error).message || 'Error interno del servidor'
      });
    }
  }
  // Incrementar uso de promoción
  static async incrementPromotionUsage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await PromotionService.incrementPromotionUsage(id || '');
      res.json({
        success: true,
        message: 'Uso de promoción incrementado exitosamente'
      });
    } catch (error) {
      console.error('Error incrementando uso de promoción:', error);
      res.status(500).json({
        success: false,
        message: (error as Error).message || 'Error interno del servidor'
      });
    }
  }
}