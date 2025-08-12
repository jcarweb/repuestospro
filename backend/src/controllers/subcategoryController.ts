import { Request, Response } from 'express';
import Subcategory, { ISubcategory } from '../models/Subcategory';
import Category from '../models/Category';
import Activity from '../models/Activity';

export class SubcategoryController {
  // Obtener todas las subcategorías
  static async getAllSubcategories(req: Request, res: Response): Promise<void> {
    try {
      const { categoryId, vehicleType, isActive } = req.query;
      
      const filter: any = {};
      if (categoryId) filter.categoryId = categoryId;
      if (vehicleType) filter.vehicleType = vehicleType;
      if (isActive !== undefined) filter.isActive = isActive === 'true';

      const subcategories = await Subcategory.find(filter)
        .populate('categoryId', 'name vehicleType')
        .sort({ order: 1, name: 1 })
        .select('-__v');

      res.json({
        success: true,
        data: subcategories
      });
    } catch (error) {
      console.error('Error obteniendo subcategorías:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener una subcategoría por ID
  static async getSubcategoryById(req: Request, res: Response): Promise<void> {
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

      res.json({
        success: true,
        data: subcategory
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
  static async createSubcategory(req: Request, res: Response): Promise<void> {
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
        userId: (req as any).user._id,
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
  static async updateSubcategory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, description, categoryId, vehicleType, isActive, order, icon, image } = req.body;

      const subcategory = await Subcategory.findById(id);
      
      if (!subcategory) {
        res.status(404).json({
          success: false,
          message: 'Subcategoría no encontrada'
        });
        return;
      }

      // Si se está cambiando la categoría, verificar que existe
      if (categoryId && categoryId !== subcategory.categoryId.toString()) {
        const category = await Category.findById(categoryId);
        if (!category) {
          res.status(404).json({
            success: false,
            message: 'Categoría no encontrada'
          });
          return;
        }
      }

      // Si se está cambiando el nombre, verificar que no exista duplicado
      if (name && name.trim() !== subcategory.name) {
        const existingSubcategory = await Subcategory.findOne({ 
          name: name.trim(), 
          categoryId: categoryId || subcategory.categoryId,
          _id: { $ne: id }
        });

        if (existingSubcategory) {
          res.status(400).json({
            success: false,
            message: 'Ya existe una subcategoría con este nombre en esta categoría'
          });
          return;
        }
      }

      // Actualizar campos
      if (name !== undefined) subcategory.name = name.trim();
      if (description !== undefined) subcategory.description = description.trim();
      if (categoryId !== undefined) subcategory.categoryId = categoryId;
      if (vehicleType !== undefined) subcategory.vehicleType = vehicleType;
      if (isActive !== undefined) subcategory.isActive = isActive;
      if (order !== undefined) subcategory.order = order;
      if (icon !== undefined) subcategory.icon = icon.trim();
      if (image !== undefined) subcategory.image = image.trim();

      await subcategory.save();

      // Registrar actividad
      await Activity.create({
        userId: (req as any).user._id,
        type: 'subcategory_updated',
        description: `Subcategoría "${subcategory.name}" actualizada`,
        metadata: { subcategoryId: subcategory._id, categoryId: subcategory.categoryId, vehicleType: subcategory.vehicleType }
      });

      res.json({
        success: true,
        message: 'Subcategoría actualizada exitosamente',
        data: subcategory
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
  static async deleteSubcategory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const subcategory = await Subcategory.findById(id);
      
      if (!subcategory) {
        res.status(404).json({
          success: false,
          message: 'Subcategoría no encontrada'
        });
        return;
      }

      await Subcategory.findByIdAndDelete(id);

      // Registrar actividad
      await Activity.create({
        userId: (req as any).user._id,
        type: 'subcategory_deleted',
        description: `Subcategoría "${subcategory.name}" eliminada`,
        metadata: { subcategoryId: subcategory._id, categoryId: subcategory.categoryId, vehicleType: subcategory.vehicleType }
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
  static async toggleSubcategoryStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const subcategory = await Subcategory.findById(id);
      
      if (!subcategory) {
        res.status(404).json({
          success: false,
          message: 'Subcategoría no encontrada'
        });
        return;
      }

      subcategory.isActive = !subcategory.isActive;
      await subcategory.save();

      // Registrar actividad
      await Activity.create({
        userId: (req as any).user._id,
        type: 'subcategory_status_changed',
        description: `Subcategoría "${subcategory.name}" ${subcategory.isActive ? 'activada' : 'desactivada'}`,
        metadata: { subcategoryId: subcategory._id, categoryId: subcategory.categoryId, vehicleType: subcategory.vehicleType }
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
} 