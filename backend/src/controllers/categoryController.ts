import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import Category, { ICategory } from '../models/Category';
import Activity from '../models/Activity';
import Product from '../models/Product';

export class CategoryController {
  // Obtener todas las categorías
  static async getAllCategories(req: Request, res: Response): Promise<void> {
    try {
      const { search, isActive } = req.query;
      
      const filter: any = {};
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }
      if (isActive !== undefined) filter.isActive = isActive === 'true';

      const categories = await Category.find(filter)
        .populate('parentCategory', 'name')
        .sort({ order: 1, name: 1 } as any)
        .select('-__v');

      // Obtener conteo de productos para cada categoría
      const categoriesWithProductCount = await Promise.all(
        categories.map(async (category) => {
          const productCount = await Product.countDocuments({ category: category._id });
          return {
            ...category.toObject(),
            productCount
          };
        })
      );

      res.json({
        success: true,
        data: categoriesWithProductCount
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
      
      const category = await Category.findById(id)
        .populate('parentCategory', 'name')
        .select('-__v');
      
      if (!category) {
        res.status(404).json({
          success: false,
          message: 'Categoría no encontrada'
        });
        return;
      }

      // Obtener conteo de productos
      const productCount = await Product.countDocuments({ category: category._id });

      res.json({
        success: true,
        data: {
          ...category.toObject(),
          productCount
        }
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
      const { name, description, image, parentCategory, order } = req.body;

      // Validar campos requeridos
      if (!name || !description) {
        res.status(400).json({
          success: false,
          message: 'Nombre y descripción son requeridos'
        });
        return;
      }

      // Verificar si ya existe una categoría con el mismo nombre
      const existingCategory = await Category.findOne({ 
        name: name.trim()
      });

      if (existingCategory) {
        res.status(400).json({
          success: false,
          message: 'Ya existe una categoría con este nombre'
        });
        return;
      }

      const categoryData: any = {
        name: name.trim(),
        description: description.trim(),
        isActive: true
      };

      if (image) categoryData.image = image.trim();
      if (parentCategory) categoryData.parentCategory = parentCategory;
      if (order !== undefined) categoryData.order = order;

      const category = await Category.create(categoryData);

      // Registrar actividad
      await Activity.create({
        userId: (req as AuthenticatedRequest).user?._id,
        type: 'category_created',
        description: `Categoría "${category.name}" creada`,
        metadata: { categoryId: category._id }
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
      const { name, description, image, parentCategory, isActive, order } = req.body;

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
          _id: { $ne: id }
        });

        if (existingCategory) {
          res.status(400).json({
            success: false,
            message: 'Ya existe una categoría con este nombre'
          });
          return;
        }
      }

      // Verificar que no se asigne como padre a sí misma
      if (parentCategory && parentCategory === id) {
        res.status(400).json({
          success: false,
          message: 'Una categoría no puede ser padre de sí misma'
        });
        return;
      }

      // Actualizar campos
      if (name !== undefined) category.name = name.trim();
      if (description !== undefined) category.description = description.trim();
      if (image !== undefined) (category as any).image = image.trim();
      if (parentCategory !== undefined) (category as any).parentCategory = parentCategory || undefined;
      if (isActive !== undefined) category.isActive = isActive;
      if (order !== undefined) (category as any).order = order;

      await category.save();

      // Registrar actividad
      await Activity.create({
        userId: (req as AuthenticatedRequest).user?._id,
        type: 'category_updated',
        description: `Categoría "${category.name}" actualizada`,
        metadata: { categoryId: category._id }
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
      const childCategoriesCount = await Category.countDocuments({ parentCategory: id });

      if (childCategoriesCount > 0) {
        res.status(400).json({
          success: false,
          message: `No se puede eliminar la categoría porque tiene ${childCategoriesCount} subcategoría(s) asociada(s)`
        });
        return;
      }

      // Verificar si hay productos asociados
      const productsCount = await Product.countDocuments({ category: id });

      if (productsCount > 0) {
        res.status(400).json({
          success: false,
          message: `No se puede eliminar la categoría porque tiene ${productsCount} producto(s) asociado(s)`
        });
        return;
      }

      await Category.findByIdAndDelete(id);

      // Registrar actividad
      await Activity.create({
        userId: (req as AuthenticatedRequest).user?._id,
        type: 'category_deleted',
        description: `Categoría "${category.name}" eliminada`,
        metadata: { categoryId: category._id }
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
        userId: (req as AuthenticatedRequest).user?._id,
        type: 'category_status_changed',
        description: `Categoría "${category.name}" ${category.isActive ? 'activada' : 'desactivada'}`,
        metadata: { categoryId: category._id }
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

  // Obtener estadísticas de categorías
  static async getCategoryStats(req: Request, res: Response): Promise<void> {
    try {
      const totalCategories = await Category.countDocuments();
      const activeCategories = await Category.countDocuments({ isActive: true });
      const inactiveCategories = await Category.countDocuments({ isActive: false });
      
      // Contar categorías que tienen productos
      const categoriesWithProducts = await Category.aggregate([
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: 'category',
            as: 'products'
          }
        },
        {
          $match: {
            'products.0': { $exists: true }
          }
        },
        {
          $count: 'count'
        }
      ]);

      const stats = {
        totalCategories,
        activeCategories,
        inactiveCategories,
        categoriesWithProducts: categoriesWithProducts[0]?.count || 0
      };

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas de categorías:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
} 