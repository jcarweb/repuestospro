import { Request, Response } from 'express';
import Subcategory, { ISubcategory } from '../models/Subcategory';
import Category from '../models/Category';
import Activity from '../models/Activity';
import Product from '../models/Product';
interface AuthenticatedRequest extends Request {
  user?: any;
}
export class SubcategoryController {
  // Obtener todas las subcategorías
  static async getAllSubcategories(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { search, categoryId, vehicleType, isActive } = req.query;
      const filter: any = {};
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }
      if (categoryId) filter.categoryId = categoryId;
      if (vehicleType) filter.vehicleType = vehicleType;
      if (isActive !== undefined) filter.isActive = isActive === 'true';
      const subcategories = await Subcategory.find(filter)
        .populate('categoryId', 'name vehicleType')
        .sort({ order: 1, name: 1 })
        .select('-__v');
      console.log('📊 Subcategorías encontradas:', subcategories.length);
      // Agregar conteo de productos para cada subcategoría
      const subcategoriesWithProductCount = await Promise.all(
        subcategories.map(async (subcategory) => {
          const productCount = await Product.countDocuments({
            subcategory: subcategory.name, // Usar el nombre en lugar del ID
            isActive: true
          });
          return {
            ...subcategory.toObject(),
            productCount
          };
        })
      );
      res.json({
        success: true,
        data: subcategoriesWithProductCount
      });
    } catch (error) {
      console.error('❌ Error obteniendo subcategorías:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
  // Obtener una subcategoría por ID
  static async getSubcategoryById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const subcategory = await Subcategory.findById(id)
        .populate('categoryId', 'name vehicleType')
        .select('-__v');
      if (!subcategory) {
        res.status(404).json({
          success: false,
          message: 'Subcategoría no encontrada'
        });
        return;
      }
      // Agregar conteo de productos
      const productCount = await Product.countDocuments({
        subcategory: subcategory.name, // Usar el nombre en lugar del ID
        isActive: true
      });
      const subcategoryWithProductCount = {
        ...subcategory.toObject(),
        productCount
      };
      res.json({
        success: true,
        data: subcategoryWithProductCount
      });
    } catch (error) {
      console.error('Error obteniendo subcategoría:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
  // Crear una nueva subcategoría
  static async createSubcategory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { name, description, categoryId, vehicleType, order, icon, image } = req.body;
      // Validar campos requeridos
      if (!name || !categoryId || !vehicleType) {
        res.status(400).json({
          success: false,
          message: 'Nombre, categoría y tipo de vehículo son requeridos'
        });
        return;
      }
      // Verificar que la categoría existe
      const category = await Category.findById(categoryId);
      if (!category) {
        res.status(404).json({
          success: false,
          message: 'Categoría no encontrada'
        });
        return;
      }
      // Verificar si ya existe una subcategoría con el mismo nombre en la misma categoría
      const existingSubcategory = await Subcategory.findOne({
        name: name.trim(),
        categoryId
      });
      if (existingSubcategory) {
        res.status(400).json({
          success: false,
          message: 'Ya existe una subcategoría con este nombre en esta categoría'
        });
        return;
      }
      const subcategoryData: any = {
        name: name.trim(),
        categoryId,
        vehicleType,
        isActive: true
      };
      if (description) subcategoryData.description = description.trim();
      if (order !== undefined) subcategoryData.order = order;
      if (icon) subcategoryData.icon = icon.trim();
      if (image) subcategoryData.image = image.trim();
      const subcategory = await Subcategory.create(subcategoryData);
      // Registrar actividad
      await Activity.create({
        userId: req.user?._id || req.user?.id,
        type: 'subcategory_created',
        description: `Subcategoría "${subcategory.name}" creada`,
        metadata: { subcategoryId: subcategory._id, categoryId, vehicleType }
      });
      res.status(201).json({
        success: true,
        message: 'Subcategoría creada exitosamente',
        data: subcategory
      });
    } catch (error) {
      console.error('Error creando subcategoría:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
  // Actualizar una subcategoría
  static async updateSubcategory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, description, categoryId, vehicleType, order, icon, image } = req.body;
      // Validar campos requeridos
      if (!name || !categoryId || !vehicleType) {
        res.status(400).json({
          success: false,
          message: 'Nombre, categoría y tipo de vehículo son requeridos'
        });
        return;
      }
      // Verificar que la subcategoría existe
      const existingSubcategory = await Subcategory.findById(id);
      if (!existingSubcategory) {
        res.status(404).json({
          success: false,
          message: 'Subcategoría no encontrada'
        });
        return;
      }
      // Verificar que la categoría existe
      const category = await Category.findById(categoryId);
      if (!category) {
        res.status(404).json({
          success: false,
          message: 'Categoría no encontrada'
        });
        return;
      }
      // Verificar si ya existe otra subcategoría con el mismo nombre en la misma categoría
      const duplicateSubcategory = await Subcategory.findOne({
        name: name.trim(),
        categoryId,
        _id: { $ne: id }
      });
      if (duplicateSubcategory) {
        res.status(400).json({
          success: false,
          message: 'Ya existe una subcategoría con este nombre en esta categoría'
        });
        return;
      }
      const updateData: any = {
        name: name.trim(),
        categoryId,
        vehicleType
      };
      if (description !== undefined) updateData.description = description.trim();
      if (order !== undefined) updateData.order = order;
      if (icon !== undefined) updateData.icon = icon.trim();
      if (image !== undefined) updateData.image = image.trim();
      const updatedSubcategory = await Subcategory.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate('categoryId', 'name vehicleType');
      // Registrar actividad
      await Activity.create({
        userId: req.user?._id || req.user?.id,
        type: 'subcategory_updated',
        description: `Subcategoría "${updatedSubcategory?.name}" actualizada`,
        metadata: { subcategoryId: updatedSubcategory?._id, categoryId, vehicleType }
      });
      res.json({
        success: true,
        message: 'Subcategoría actualizada exitosamente',
        data: updatedSubcategory
      });
    } catch (error) {
      console.error('Error actualizando subcategoría:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
  // Eliminar una subcategoría
  static async deleteSubcategory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      // Verificar que la subcategoría existe
      const subcategory = await Subcategory.findById(id);
      if (!subcategory) {
        res.status(404).json({
          success: false,
          message: 'Subcategoría no encontrada'
        });
        return;
      }
      // Verificar si hay productos asociados
      const productCount = await Product.countDocuments({ subcategory: id });
      if (productCount > 0) {
        res.status(400).json({
          success: false,
          message: `No se puede eliminar la subcategoría porque tiene ${productCount} productos asociados`
        });
        return;
      }
      await Subcategory.findByIdAndDelete(id);
      // Registrar actividad
      await Activity.create({
        userId: req.user?._id || req.user?.id,
        type: 'subcategory_deleted',
        description: `Subcategoría "${subcategory.name}" eliminada`,
        metadata: { subcategoryId: subcategory._id, categoryId: subcategory.category }
      });
      res.json({
        success: true,
        message: 'Subcategoría eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error eliminando subcategoría:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
  // Cambiar estado de una subcategoría
  static async toggleSubcategoryStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      // Verificar que la subcategoría existe
      const subcategory = await Subcategory.findById(id);
      if (!subcategory) {
        res.status(404).json({
          success: false,
          message: 'Subcategoría no encontrada'
        });
        return;
      }
      // Cambiar estado
      subcategory.isActive = !subcategory.isActive;
      await subcategory.save();
      // Registrar actividad
      await Activity.create({
        userId: req.user?._id || req.user?.id,
        type: 'subcategory_status_changed',
        description: `Subcategoría "${subcategory.name}" ${subcategory.isActive ? 'activada' : 'desactivada'}`,
        metadata: { subcategoryId: subcategory._id, isActive: subcategory.isActive }
      });
      res.json({
        success: true,
        message: `Subcategoría ${subcategory.isActive ? 'activada' : 'desactivada'} exitosamente`,
        data: subcategory
      });
    } catch (error) {
      console.error('Error cambiando estado de subcategoría:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
  // Obtener estadísticas de subcategorías
  static async getSubcategoryStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Total de subcategorías
      const totalSubcategories = await Subcategory.countDocuments();
      // Subcategorías activas e inactivas
      const activeSubcategories = await Subcategory.countDocuments({ isActive: true });
      const inactiveSubcategories = await Subcategory.countDocuments({ isActive: false });
      // Subcategorías con productos - usar un enfoque diferente
      const allSubcategories = await Subcategory.find({}, 'name');
      let subcategoriesWithProductsCount = 0;
      for (const subcategory of allSubcategories) {
        const productCount = await Product.countDocuments({
          subcategory: subcategory.name,
          isActive: true
        });
        if (productCount > 0) {
          subcategoriesWithProductsCount++;
        }
      }
      // Estadísticas por tipo de vehículo
      const byVehicleType = await Subcategory.aggregate([
        {
          $group: {
            _id: '$vehicleType',
            count: { $sum: 1 }
          }
        }
      ]);
      // Convertir a objeto
      const vehicleTypeStats = {
        car: 0,
        motorcycle: 0,
        truck: 0,
        bus: 0
      };
      byVehicleType.forEach(stat => {
        vehicleTypeStats[stat._id as keyof typeof vehicleTypeStats] = stat.count;
      });
      const stats = {
        totalSubcategories,
        activeSubcategories,
        inactiveSubcategories,
        subcategoriesWithProducts: subcategoriesWithProductsCount,
        byVehicleType: vehicleTypeStats
      };
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas de subcategorías:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}