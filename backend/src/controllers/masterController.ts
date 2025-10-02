import { Request, Response } from 'express';
import VehicleType from '../models/VehicleType';
import Brand from '../models/Brand';
import Category from '../models/Category';
import Subcategory from '../models/Subcategory';
interface AuthenticatedRequest extends Request {
  user?: any;
}
export default {
  // ===== VEHICLE TYPES =====
  async getVehicleTypes(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query['page'] as string) || 1;
      const limit = parseInt(req.query['limit'] as string) || 10;
      const skip = (page - 1) * limit;
      const search = req.query['search'] as string;
      let filter: any = {};
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }
      const total = await VehicleType.countDocuments(filter);
      const vehicleTypes = await VehicleType.find(filter)
        .sort({ name: 1 })
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email')
        .skip(skip)
        .limit(limit);
      res.json({
        success: true,
        data: vehicleTypes,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error obteniendo tipos de vehículo:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },
  async createVehicleType(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { name, description, deliveryType, icon } = req.body;
      const userId = req.user?.id;
      const vehicleType = new VehicleType({
        name: name.toLowerCase(),
        description,
        deliveryType,
        icon,
        createdBy: userId
      });
      await vehicleType.save();
      res.status(201).json({
        success: true,
        data: vehicleType,
        message: 'Tipo de vehículo creado exitosamente'
      });
    } catch (error: any) {
      console.error('Error creando tipo de vehículo:', error);
      if (error.code === 11000) {
        res.status(400).json({
          success: false,
          message: 'Ya existe un tipo de vehículo con ese nombre'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Error interno del servidor'
        });
      }
    }
  },
  async updateVehicleType(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, description, deliveryType, icon, isActive } = req.body;
      const userId = req.user?.id;
      const vehicleType = await VehicleType.findByIdAndUpdate(
        id,
        {
          name: name?.toLowerCase(),
          description,
          deliveryType,
          icon,
          isActive,
          updatedBy: userId
        },
        { new: true, runValidators: true }
      );
      if (!vehicleType) {
        res.status(404).json({
          success: false,
          message: 'Tipo de vehículo no encontrado'
        });
      }
      res.json({
        success: true,
        data: vehicleType,
        message: 'Tipo de vehículo actualizado exitosamente'
      });
    } catch (error: any) {
      console.error('Error actualizando tipo de vehículo:', error);
      if (error.code === 11000) {
        res.status(400).json({
          success: false,
          message: 'Ya existe un tipo de vehículo con ese nombre'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Error interno del servidor'
        });
      }
    }
  },
  async deleteVehicleType(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      // Verificar si hay productos usando este tipo de vehículo
      const Product = require('../models/Product').default;
      const productsCount = await Product.countDocuments({ vehicleType: id });
      if (productsCount > 0) {
        res.status(400).json({
          success: false,
          message: `No se puede eliminar. Hay ${productsCount} productos usando este tipo de vehículo`
        });
      }
      const vehicleType = await VehicleType.findByIdAndDelete(id);
      if (!vehicleType) {
        res.status(404).json({
          success: false,
          message: 'Tipo de vehículo no encontrado'
        });
      }
      res.json({
        success: true,
        message: 'Tipo de vehículo eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error eliminando tipo de vehículo:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },
  // ===== BRANDS =====
  async getBrands(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query['page'] as string) || 1;
      const limit = parseInt(req.query['limit'] as string) || 10;
      const skip = (page - 1) * limit;
      const search = req.query['search'] as string;
      const vehicleType = req.query['vehicleType'] as string;
      let filter: any = {};
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { country: { $regex: search, $options: 'i' } }
        ];
      }
      // Filtro por tipo de vehículo
      if (vehicleType) {
        // Convertir string a ObjectId si es necesario
        const mongoose = require('mongoose');
        try {
          const objectId = new mongoose.Types.ObjectId(vehicleType);
          filter.vehicleTypes = objectId;
        } catch (error) {
          // Si no es un ObjectId válido, usar como string
          filter.vehicleTypes = vehicleType;
        }
      }
      const total = await Brand.countDocuments(filter);
      const brands = await Brand.find(filter)
        .populate('vehicleTypes', 'name')
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email')
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit);
      res.json({
        success: true,
        data: brands,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error obteniendo marcas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },
  async createBrand(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { name, description, vehicleTypes, country, website, logo, history } = req.body;
      const userId = req.user?.id;
      const brand = new Brand({
        name,
        description,
        vehicleTypes,
        country,
        website,
        logo,
        history,
        createdBy: userId
      });
      await brand.save();
      await brand.populate('vehicleTypes', 'name');
      res.status(201).json({
        success: true,
        data: brand,
        message: 'Marca creada exitosamente'
      });
    } catch (error: any) {
      console.error('Error creando marca:', error);
      if (error.code === 11000) {
        res.status(400).json({
          success: false,
          message: 'Ya existe una marca con ese nombre'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Error interno del servidor'
        });
      }
    }
  },
  async updateBrand(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, description, vehicleTypes, country, website, logo, history, isActive } = req.body;
      const userId = req.user?.id;
      const brand = await Brand.findByIdAndUpdate(
        id,
        {
          name,
          description,
          vehicleTypes,
          country,
          website,
          logo,
          history,
          isActive,
          updatedBy: userId
        },
        { new: true, runValidators: true }
      ).populate('vehicleTypes', 'name');
      if (!brand) {
        res.status(404).json({
          success: false,
          message: 'Marca no encontrada'
        });
      }
      res.json({
        success: true,
        data: brand,
        message: 'Marca actualizada exitosamente'
      });
    } catch (error: any) {
      console.error('Error actualizando marca:', error);
      if (error.code === 11000) {
        res.status(400).json({
          success: false,
          message: 'Ya existe una marca con ese nombre'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Error interno del servidor'
        });
      }
    }
  },
  async deleteBrand(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      // Verificar si hay productos usando esta marca
      const Product = require('../models/Product').default;
      const productsCount = await Product.countDocuments({ brand: id });
      if (productsCount > 0) {
        res.status(400).json({
          success: false,
          message: `No se puede eliminar. Hay ${productsCount} productos usando esta marca`
        });
      }
      const brand = await Brand.findByIdAndDelete(id);
      if (!brand) {
        res.status(404).json({
          success: false,
          message: 'Marca no encontrada'
        });
      }
      res.json({
        success: true,
        message: 'Marca eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error eliminando marca:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },
  // ===== CATEGORIES =====
  async getCategories(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query['page'] as string) || 1;
      const limit = parseInt(req.query['limit'] as string) || 10;
      const skip = (page - 1) * limit;
      const search = req.query['search'] as string;
      let filter: any = {};
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }
      const total = await Category.countDocuments(filter);
      const categories = await Category.find(filter)
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email')
        .sort({ sortOrder: 1, name: 1 })
        .skip(skip)
        .limit(limit);
      res.json({
        success: true,
        data: categories,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error obteniendo categorías:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },
  async createCategory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { name, description, icon, color, sortOrder } = req.body;
      const userId = req.user?.id;
      const category = new Category({
        name: name.toLowerCase(),
        description,
        icon,
        color,
        sortOrder,
        createdBy: userId
      });
      await category.save();
      res.status(201).json({
        success: true,
        data: category,
        message: 'Categoría creada exitosamente'
      });
    } catch (error: any) {
      console.error('Error creando categoría:', error);
      if (error.code === 11000) {
        res.status(400).json({
          success: false,
          message: 'Ya existe una categoría con ese nombre'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Error interno del servidor'
        });
      }
    }
  },
  async updateCategory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, description, icon, color, sortOrder, isActive } = req.body;
      const userId = req.user?.id;
      const category = await Category.findByIdAndUpdate(
        id,
        {
          name: name?.toLowerCase(),
          description,
          icon,
          color,
          sortOrder,
          isActive,
          updatedBy: userId
        },
        { new: true, runValidators: true }
      );
      if (!category) {
        res.status(404).json({
          success: false,
          message: 'Categoría no encontrada'
        });
      }
      res.json({
        success: true,
        data: category,
        message: 'Categoría actualizada exitosamente'
      });
    } catch (error: any) {
      console.error('Error actualizando categoría:', error);
      if (error.code === 11000) {
        res.status(400).json({
          success: false,
          message: 'Ya existe una categoría con ese nombre'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Error interno del servidor'
        });
      }
    }
  },
  async deleteCategory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      // Verificar si hay productos usando esta categoría
      const Product = require('../models/Product').default;
      const productsCount = await Product.countDocuments({ category: id });
      if (productsCount > 0) {
        res.status(400).json({
          success: false,
          message: `No se puede eliminar. Hay ${productsCount} productos usando esta categoría`
        });
      }
      // Verificar si hay subcategorías usando esta categoría
      const subcategoriesCount = await Subcategory.countDocuments({ category: id });
      if (subcategoriesCount > 0) {
        res.status(400).json({
          success: false,
          message: `No se puede eliminar. Hay ${subcategoriesCount} subcategorías usando esta categoría`
        });
      }
      const category = await Category.findByIdAndDelete(id);
      if (!category) {
        res.status(404).json({
          success: false,
          message: 'Categoría no encontrada'
        });
      }
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
  },
  // ===== SUBCATEGORIES =====
  async getSubcategories(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query['page'] as string) || 1;
      const limit = parseInt(req.query['limit'] as string) || 10;
      const skip = (page - 1) * limit;
      const search = req.query['search'] as string;
      const { categoryId } = req.query;
      let filter: any = {};
      if (categoryId) {
        filter.category = categoryId;
      }
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }
      const total = await Subcategory.countDocuments(filter);
      const subcategories = await Subcategory.find(filter)
        .populate('category', 'name')
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email')
        .sort({ sortOrder: 1, name: 1 })
        .skip(skip)
        .limit(limit);
      res.json({
        success: true,
        data: subcategories,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error obteniendo subcategorías:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },
  async createSubcategory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { name, description, category, sortOrder } = req.body;
      const userId = req.user?.id;
      const subcategory = new Subcategory({
        name: name.toLowerCase(),
        description,
        category,
        sortOrder,
        createdBy: userId
      });
      await subcategory.save();
      await subcategory.populate('category', 'name');
      res.status(201).json({
        success: true,
        data: subcategory,
        message: 'Subcategoría creada exitosamente'
      });
    } catch (error: any) {
      console.error('Error creando subcategoría:', error);
      if (error.code === 11000) {
        res.status(400).json({
          success: false,
          message: 'Ya existe una subcategoría con ese nombre en esta categoría'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Error interno del servidor'
        });
      }
    }
  },
  async updateSubcategory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, description, category, sortOrder, isActive } = req.body;
      const userId = req.user?.id;
      const subcategory = await Subcategory.findByIdAndUpdate(
        id,
        {
          name: name?.toLowerCase(),
          description,
          category,
          sortOrder,
          isActive,
          updatedBy: userId
        },
        { new: true, runValidators: true }
      ).populate('category', 'name');
      if (!subcategory) {
        res.status(404).json({
          success: false,
          message: 'Subcategoría no encontrada'
        });
      }
      res.json({
        success: true,
        data: subcategory,
        message: 'Subcategoría actualizada exitosamente'
      });
    } catch (error: any) {
      console.error('Error actualizando subcategoría:', error);
      if (error.code === 11000) {
        res.status(400).json({
          success: false,
          message: 'Ya existe una subcategoría con ese nombre en esta categoría'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Error interno del servidor'
        });
      }
    }
  },
  async deleteSubcategory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      // Verificar si hay productos usando esta subcategoría
      const Product = require('../models/Product').default;
      const productsCount = await Product.countDocuments({ subcategory: id });
      if (productsCount > 0) {
        res.status(400).json({
          success: false,
          message: `No se puede eliminar. Hay ${productsCount} productos usando esta subcategoría`
        });
      }
      const subcategory = await Subcategory.findByIdAndDelete(id);
      if (!subcategory) {
        res.status(404).json({
          success: false,
          message: 'Subcategoría no encontrada'
        });
      }
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
};