import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import Brand, { IBrand } from '../models/Brand';
import Activity from '../models/Activity';

export class BrandController {
  // Obtener todas las marcas
  static async getAllBrands(req: Request, res: Response): Promise<void> {
    try {
      const { vehicleType, isActive } = req.query;
      
      const filter: any = {};
      if (vehicleType) filter.vehicleType = vehicleType;
      if (isActive !== undefined) filter.isActive = isActive === 'true';

      const brands = await Brand.find(filter)
        .sort({ order: 1, name: 1 } as any)
        .select('-__v');

      res.json({
        success: true,
        data: brands
      });
    } catch (error) {
      console.error('Error obteniendo marcas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener una marca por ID
  static async getBrandById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const brand = await Brand.findById(id).select('-__v');
      
      if (!brand) {
        res.status(404).json({
          success: false,
          message: 'Marca no encontrada'
        });
        return;
      }

      res.json({
        success: true,
        data: brand
      });
    } catch (error) {
      console.error('Error obteniendo marca:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Crear una nueva marca
  static async createBrand(req: Request, res: Response): Promise<void> {
    try {
      const { name, description, vehicleType, order, logo, country, website } = req.body;

      // Validar campos requeridos
      if (!name || !vehicleType) {
        res.status(400).json({
          success: false,
          message: 'Nombre y tipo de vehículo son requeridos'
        });
        return;
      }

      // Verificar si ya existe una marca con el mismo nombre para el mismo tipo de vehículo
      const existingBrand = await Brand.findOne({ 
        name: name.trim(), 
        vehicleType 
      });

      if (existingBrand) {
        res.status(400).json({
          success: false,
          message: 'Ya existe una marca con este nombre para este tipo de vehículo'
        });
        return;
      }

      const brandData: any = {
        name: name.trim(),
        vehicleType,
        isActive: true
      };

      if (description) brandData.description = description.trim();
      if (order !== undefined) brandData.order = order;
      if (logo) brandData.logo = logo.trim();
      if (country) brandData.country = country.trim();
      if (website) brandData.website = website.trim();

      const brand = await Brand.create(brandData);

      // Registrar actividad
      await Activity.create({
        userId: (req as AuthenticatedRequest).user?._id,
        type: 'brand_created',
        description: `Marca "${brand.name}" creada`,
        metadata: { brandId: brand._id, vehicleType }
      });

      res.status(201).json({
        success: true,
        message: 'Marca creada exitosamente',
        data: brand
      });
    } catch (error) {
      console.error('Error creando marca:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Actualizar una marca
  static async updateBrand(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, description, vehicleType, isActive, order, logo, country, website } = req.body;

      const brand = await Brand.findById(id);
      
      if (!brand) {
        res.status(404).json({
          success: false,
          message: 'Marca no encontrada'
        });
        return;
      }

      // Si se está cambiando el nombre, verificar que no exista duplicado
      if (name && name.trim() !== brand.name) {
        const existingBrand = await Brand.findOne({ 
          name: name.trim(), 
          vehicleType: vehicleType || (brand as any).vehicleType,
          _id: { $ne: id }
        });

        if (existingBrand) {
          res.status(400).json({
            success: false,
            message: 'Ya existe una marca con este nombre para este tipo de vehículo'
          });
          return;
        }
      }

      // Actualizar campos
      if (name !== undefined) brand.name = name.trim();
      if (description !== undefined) brand.description = description.trim();
      if (vehicleType !== undefined) (brand as any).vehicleType = vehicleType;
      if (isActive !== undefined) brand.isActive = isActive;
      if (order !== undefined) (brand as any).order = order;
      if (logo !== undefined) brand.logo = logo.trim();
      if (country !== undefined) brand.country = country.trim();
      if (website !== undefined) brand.website = website.trim();

      await brand.save();

      // Registrar actividad
      await Activity.create({
        userId: (req as AuthenticatedRequest).user?._id,
        type: 'brand_updated',
        description: `Marca "${brand.name}" actualizada`,
        metadata: { brandId: brand._id, vehicleType: (brand as any).vehicleType }
      });

      res.json({
        success: true,
        message: 'Marca actualizada exitosamente',
        data: brand
      });
    } catch (error) {
      console.error('Error actualizando marca:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Eliminar una marca
  static async deleteBrand(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const brand = await Brand.findById(id);
      
      if (!brand) {
        res.status(404).json({
          success: false,
          message: 'Marca no encontrada'
        });
        return;
      }

      await Brand.findByIdAndDelete(id);

      // Registrar actividad
      await Activity.create({
        userId: (req as AuthenticatedRequest).user?._id,
        type: 'brand_deleted',
        description: `Marca "${brand.name}" eliminada`,
        metadata: { brandId: brand._id, vehicleType: (brand as any).vehicleType }
      });

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
  }

  // Cambiar estado de una marca
  static async toggleBrandStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const brand = await Brand.findById(id);
      
      if (!brand) {
        res.status(404).json({
          success: false,
          message: 'Marca no encontrada'
        });
        return;
      }

      brand.isActive = !brand.isActive;
      await brand.save();

      // Registrar actividad
      await Activity.create({
        userId: (req as AuthenticatedRequest).user?._id,
        type: 'brand_status_changed',
        description: `Marca "${brand.name}" ${brand.isActive ? 'activada' : 'desactivada'}`,
        metadata: { brandId: brand._id, vehicleType: (brand as any).vehicleType }
      });

      res.json({
        success: true,
        message: `Marca ${brand.isActive ? 'activada' : 'desactivada'} exitosamente`,
        data: brand
      });
    } catch (error) {
      console.error('Error cambiando estado de marca:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
} 