import Promotion, { IPromotion } from '../models/Promotion';
import Product from '../models/Product';
import Category from '../models/Category';
import mongoose from 'mongoose';

export class PromotionService {
  // Crear una nueva promoción
  static async createPromotion(promotionData: any, createdBy: string): Promise<IPromotion> {
    try {
      console.log('🔍 Debug - CreateData recibido:', promotionData);

      // Convertir fechas si vienen como strings
      if (promotionData.startDate && typeof promotionData.startDate === 'string') {
        promotionData.startDate = new Date(promotionData.startDate);
        console.log('🔍 Debug - startDate convertida:', promotionData.startDate);
      }
      if (promotionData.endDate && typeof promotionData.endDate === 'string') {
        promotionData.endDate = new Date(promotionData.endDate);
        console.log('🔍 Debug - endDate convertida:', promotionData.endDate);
      }

      // Asegurar que isActive sea boolean
      if (promotionData.isActive !== undefined) {
        promotionData.isActive = Boolean(promotionData.isActive);
        console.log('🔍 Debug - isActive convertido:', promotionData.isActive);
      }

      // Validar fechas antes de crear
      if (promotionData.startDate && promotionData.endDate) {
        const startDate = new Date(promotionData.startDate);
        const endDate = new Date(promotionData.endDate);
        
        console.log('🔍 Debug - Validando fechas:', { startDate, endDate });
        
        if (startDate >= endDate) {
          throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
        }
      }

      const promotion = new Promotion({
        ...promotionData,
        createdBy: new mongoose.Types.ObjectId(createdBy)
      });

      await promotion.save();
      
      console.log('🔍 Debug - Promoción creada:', promotion);
      
      // Retornar la promoción con populate
      return await promotion.populate([
        { path: 'products', select: 'name price image description store' },
        { path: 'categories', select: 'name' },
        { path: 'createdBy', select: 'name email' },
        { path: 'store', select: 'name address city state' }
      ]);
    } catch (error) {
      console.error('❌ Error creando promoción:', error);
      throw new Error(`Error creando promoción: ${error.message}`);
    }
  }

  // Obtener todas las promociones
  static async getAllPromotions(filters: any = {}): Promise<IPromotion[]> {
    try {
      const query = Promotion.find()
        .populate('products', 'name price image store')
        .populate('categories', 'name')
        .populate('createdBy', 'name email')
        .populate('store', 'name address city state')
        .sort({ createdAt: -1 });

      // Aplicar filtros
      if (filters.isActive !== undefined) {
        query.where('isActive', filters.isActive);
      }

      if (filters.type) {
        query.where('type', filters.type);
      }

      if (filters.startDate) {
        query.where('startDate', { $gte: new Date(filters.startDate) });
      }

      if (filters.endDate) {
        query.where('endDate', { $lte: new Date(filters.endDate) });
      }

      // Filtro por tienda
      if (filters.store) {
        query.where('store', filters.store);
      }

      return await query.exec();
    } catch (error) {
      throw new Error(`Error obteniendo promociones: ${error.message}`);
    }
  }

  // Obtener promoción por ID
  static async getPromotionById(id: string): Promise<IPromotion | null> {
    try {
      return await Promotion.findById(id)
        .populate('products', 'name price image description store')
        .populate('categories', 'name')
        .populate('createdBy', 'name email')
        .populate('store', 'name address city state');
    } catch (error) {
      throw new Error(`Error obteniendo promoción: ${error.message}`);
    }
  }

  // Actualizar promoción
  static async updatePromotion(id: string, updateData: any): Promise<IPromotion | null> {
    try {
      console.log('🔍 Debug - UpdateData recibido:', updateData);

      // Convertir fechas si vienen como strings
      if (updateData.startDate && typeof updateData.startDate === 'string') {
        updateData.startDate = new Date(updateData.startDate);
        console.log('🔍 Debug - startDate convertida:', updateData.startDate);
      }
      if (updateData.endDate && typeof updateData.endDate === 'string') {
        updateData.endDate = new Date(updateData.endDate);
        console.log('🔍 Debug - endDate convertida:', updateData.endDate);
      }

      // Asegurar que isActive sea boolean
      if (updateData.isActive !== undefined) {
        updateData.isActive = Boolean(updateData.isActive);
        console.log('🔍 Debug - isActive convertido:', updateData.isActive);
      }

      // Validar fechas antes de actualizar
      if (updateData.startDate && updateData.endDate) {
        const startDate = new Date(updateData.startDate);
        const endDate = new Date(updateData.endDate);
        
        console.log('🔍 Debug - Validando fechas:', { startDate, endDate });
        
        if (startDate >= endDate) {
          throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
        }
      }

      const promotion = await Promotion.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: false } // Desactivar validadores del modelo temporalmente
      )
      .populate('products', 'name price image description store')
      .populate('categories', 'name')
      .populate('createdBy', 'name email')
      .populate('store', 'name address city state');

      console.log('🔍 Debug - Promoción actualizada:', promotion);

      return promotion;
    } catch (error) {
      console.error('❌ Error actualizando promoción:', error);
      throw new Error(`Error actualizando promoción: ${error.message}`);
    }
  }

  // Eliminar promoción
  static async deletePromotion(id: string): Promise<boolean> {
    try {
      const result = await Promotion.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      throw new Error(`Error eliminando promoción: ${error.message}`);
    }
  }

  // Activar/Desactivar promoción
  static async togglePromotionStatus(id: string): Promise<IPromotion | null> {
    try {
      const promotion = await Promotion.findById(id);
      if (!promotion) {
        throw new Error('Promoción no encontrada');
      }

      promotion.isActive = !promotion.isActive;
      await promotion.save();
      return promotion;
    } catch (error) {
      throw new Error(`Error cambiando estado de promoción: ${error.message}`);
    }
  }

  // Obtener promociones activas para un producto
  static async getActivePromotionsForProduct(productId: string): Promise<IPromotion[]> {
    try {
      const now = new Date();
      return await Promotion.find({
        products: productId,
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now }
      }).populate('products categories');
    } catch (error) {
      throw new Error(`Error obteniendo promociones del producto: ${error.message}`);
    }
  }

  // Obtener promociones activas para una categoría
  static async getActivePromotionsForCategory(categoryId: string): Promise<IPromotion[]> {
    try {
      const now = new Date();
      return await Promotion.find({
        categories: categoryId,
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now }
      }).populate('products categories');
    } catch (error) {
      throw new Error(`Error obteniendo promociones de la categoría: ${error.message}`);
    }
  }

  // Calcular precio con descuento para un producto
  static async calculateProductPriceWithPromotions(productId: string, originalPrice: number): Promise<{
    finalPrice: number;
    discountAmount: number;
    discountPercentage: number;
    activePromotions: IPromotion[];
    originalPrice: number;
  }> {
    try {
      const activePromotions = await this.getActivePromotionsForProduct(productId);
      
      if (activePromotions.length === 0) {
        return {
          finalPrice: originalPrice,
          discountAmount: 0,
          discountPercentage: 0,
          activePromotions: [],
          originalPrice
        };
      }

      // Tomar la promoción con mayor descuento
      let bestPromotion = activePromotions[0];
      let maxDiscount = 0;

      for (const promotion of activePromotions) {
        let discount = 0;
        
        if (promotion.type === 'percentage' && promotion.discountPercentage) {
          discount = originalPrice * (promotion.discountPercentage / 100);
        } else if (promotion.type === 'fixed' && promotion.discountAmount) {
          discount = promotion.discountAmount;
        }

        if (discount > maxDiscount) {
          maxDiscount = discount;
          bestPromotion = promotion;
        }
      }

      const finalPrice = Math.max(0, originalPrice - maxDiscount);
      const discountPercentage = maxDiscount > 0 ? (maxDiscount / originalPrice) * 100 : 0;

      return {
        finalPrice,
        discountAmount: maxDiscount,
        discountPercentage,
        activePromotions: [bestPromotion],
        originalPrice
      };
    } catch (error) {
      throw new Error(`Error calculando precio con promociones: ${error.message}`);
    }
  }

  // Obtener estadísticas de promociones
  static async getPromotionStats(): Promise<{
    total: number;
    active: number;
    expired: number;
    upcoming: number;
    byType: Record<string, number>;
  }> {
    try {
      const now = new Date();
      
      const [total, active, expired, upcoming] = await Promise.all([
        Promotion.countDocuments(),
        Promotion.countDocuments({
          isActive: true,
          startDate: { $lte: now },
          endDate: { $gte: now }
        }),
        Promotion.countDocuments({
          endDate: { $lt: now }
        }),
        Promotion.countDocuments({
          startDate: { $gt: now }
        })
      ]);

      const byType = await Promotion.aggregate([
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 }
          }
        }
      ]);

      const byTypeMap = byType.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {} as Record<string, number>);

      return {
        total,
        active,
        expired,
        upcoming,
        byType: byTypeMap
      };
    } catch (error) {
      throw new Error(`Error obteniendo estadísticas: ${error.message}`);
    }
  }

  // Incrementar uso de promoción
  static async incrementPromotionUsage(id: string): Promise<void> {
    try {
      await Promotion.findByIdAndUpdate(id, {
        $inc: { currentUses: 1 }
      });
    } catch (error) {
      throw new Error(`Error incrementando uso de promoción: ${error.message}`);
    }
  }

  // Validar promoción antes de aplicar
  static async validatePromotionForProduct(promotionId: string, productId: string): Promise<boolean> {
    try {
      const promotion = await Promotion.findById(promotionId);
      if (!promotion) return false;

      // Verificar si el producto está en la promoción
      const hasProduct = promotion.products.some(p => p.toString() === productId);
      if (!hasProduct) return false;

      // Verificar si la promoción es válida
      return (promotion as any).isValid();
    } catch (error) {
      return false;
    }
  }

  // Obtener promociones próximas a expirar
  static async getExpiringPromotions(days: number = 7): Promise<IPromotion[]> {
    try {
      const now = new Date();
      const expirationDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

      return await Promotion.find({
        isActive: true,
        endDate: { $gte: now, $lte: expirationDate }
      }).populate('products categories createdBy');
    } catch (error) {
      throw new Error(`Error obteniendo promociones próximas a expirar: ${error.message}`);
    }
  }
}

export default PromotionService; 