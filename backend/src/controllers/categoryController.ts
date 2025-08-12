import { Request, Response } from 'express';
import Category, { ICategory } from '../models/Category';
import Activity from '../models/Activity';

export class CategoryController {
  // Obtener todas las categorías
  static async getAllCategories(req: Request, res: Response): Promise<void> {
    try {
      const { vehicleType, isActive } = req.query;
      
      const filter: any = {};
      if (vehicleType) filter.vehicleType = vehicleType;
      if (isActive !== undefined) filter.isActive = isActive === 'true';

      const categories = await Category.find(filter)
        .sort({ order: 1, name: 1 })
        .select('-__v');

      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      console.error('Error obteniendo categorías:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener una categoría por ID
  static async getCategoryById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const category = await Category.findById(id).select('-__v');
      
      if (!category) {
        res.status(404).json({
          success: false,
          message: 'Categoría no encontrada'
        });
        return;
      }

      res.json({
        success: true,
        data: category
      });
    } catch (error) {
      console.error('Error obteniendo categoría:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Crear una nueva categoría
  static async createCategory(req: Request, res: Response): Promise<void> {
    try {
      const { name, description, vehicleType, order, icon } = req.body;

      // Validar campos requeridos
      if (!name || !vehicleType) {
        res.status(400).json({
          success: false,
          message: 'Nombre y tipo de vehículo son requeridos'
        });
        return;
      }

      // Verificar si ya existe una categoría con el mismo nombre para el mismo tipo de vehículo
      const existingCategory = await Category.findOne({ 
        name: name.trim(), 
        vehicleType 
      });

      if (existingCategory) {
        res.status(400).json({
          success: false,
          message: 'Ya existe una categoría con este nombre para este tipo de vehículo'
        });
        return;
      }

      const categoryData: any = {
        name: name.trim(),
        vehicleType,
        isActive: true
      };

      if (description) categoryData.description = description.trim();
      if (order !== undefined) categoryData.order = order;
      if (icon) categoryData.icon = icon.trim();

      const category = await Category.create(categoryData);

      // Registrar actividad
      await Activity.create({
        userId: (req as any).user._id,
        type: 'category_created',
        description: `Categoría "${category.name}" creada`,
        metadata: { categoryId: category._id, vehicleType }
      });

      res.status(201).json({
        success: true,
        message: 'Categoría creada exitosamente',
        data: category
      });
    } catch (error) {
      console.error('Error creando categoría:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Actualizar una categoría
  static async updateCategory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, description, vehicleType, isActive, order, icon } = req.body;

      const category = await Category.findById(id);
      
      if (!category) {
        res.status(404).json({
          success: false,
          message: 'Categoría no encontrada'
        });
        return;
      }

      // Si se está cambiando el nombre, verificar que no exista duplicado
      if (name && name.trim() !== category.name) {
        const existingCategory = await Category.findOne({ 
          name: name.trim(), 
          vehicleType: vehicleType || category.vehicleType,
          _id: { $ne: id }
        });

        if (existingCategory) {
          res.status(400).json({
            success: false,
            message: 'Ya existe una categoría con este nombre para este tipo de vehículo'
          });
          return;
        }
      }

      // Actualizar campos
      if (name !== undefined) category.name = name.trim();
      if (description !== undefined) category.description = description.trim();
      if (vehicleType !== undefined) category.vehicleType = vehicleType;
      if (isActive !== undefined) category.isActive = isActive;
      if (order !== undefined) category.order = order;
      if (icon !== undefined) category.icon = icon.trim();

      await category.save();

      // Registrar actividad
      await Activity.create({
        userId: (req as any).user._id,
        type: 'category_updated',
        description: `Categoría "${category.name}" actualizada`,
        metadata: { categoryId: category._id, vehicleType: category.vehicleType }
      });

      res.json({
        success: true,
        message: 'Categoría actualizada exitosamente',
        data: category
      });
    } catch (error) {
      console.error('Error actualizando categoría:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Eliminar una categoría
  static async deleteCategory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const category = await Category.findById(id);
      
      if (!category) {
        res.status(404).json({
          success: false,
          message: 'Categoría no encontrada'
        });
        return;
      }

      // Verificar si hay subcategorías asociadas
      const Subcategory = require('../models/Subcategory').default;
      const subcategoriesCount = await Subcategory.countDocuments({ categoryId: id });

      if (subcategoriesCount > 0) {
        res.status(400).json({
          success: false,
          message: `No se puede eliminar la categoría porque tiene ${subcategoriesCount} subcategoría(s) asociada(s)`
        });
        return;
      }

      await Category.findByIdAndDelete(id);

      // Registrar actividad
      await Activity.create({
        userId: (req as any).user._id,
        type: 'category_deleted',
        description: `Categoría "${category.name}" eliminada`,
        metadata: { categoryId: category._id, vehicleType: category.vehicleType }
      });

      res.json({
        success: true,
        message: 'Categoría eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error eliminando categoría:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Cambiar estado de una categoría
  static async toggleCategoryStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const category = await Category.findById(id);
      
      if (!category) {
        res.status(404).json({
          success: false,
          message: 'Categoría no encontrada'
        });
        return;
      }

      category.isActive = !category.isActive;
      await category.save();

      // Registrar actividad
      await Activity.create({
        userId: (req as any).user._id,
        type: 'category_status_changed',
        description: `Categoría "${category.name}" ${category.isActive ? 'activada' : 'desactivada'}`,
        metadata: { categoryId: category._id, vehicleType: category.vehicleType }
      });

      res.json({
        success: true,
        message: `Categoría ${category.isActive ? 'activada' : 'desactivada'} exitosamente`,
        data: category
      });
    } catch (error) {
      console.error('Error cambiando estado de categoría:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
} 