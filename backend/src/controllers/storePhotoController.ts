import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import StorePhoto from '../models/StorePhoto';
import { enrichmentWorker } from '../services/enrichmentWorker';
import { CryptoAuth } from '../utils/cryptoAuth';
import { storePhotoUpload, deleteImage } from '../config/cloudinary';

export class StorePhotoController {
  /**
   * Sube una foto de local con GPS
   */
  static uploadStorePhoto = [
    storePhotoUpload.single('image'),
    async (req: any, res: Response) => {
      try {
        const user = req.user;
        const { name, phone, lat, lng } = req.body;

        if (!req.file) {
          return res.status(400).json({
            success: false,
            message: 'Imagen requerida'
          });
        }

        if (!name || !lat || !lng) {
          return res.status(400).json({
            success: false,
            message: 'Nombre, latitud y longitud son requeridos'
          });
        }

        // La imagen ya está en Cloudinary, usar la URL directamente
        const imageUrl = req.file.path;

        // Crear el documento en la base de datos
        const storePhoto = new StorePhoto({
          name,
          phone,
          imageUrl,
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          uploadedBy: (user as any)._id,
          status: 'pending'
        });

        await storePhoto.save();

        res.status(201).json({
          success: true,
          message: 'Foto subida exitosamente a Cloudinary',
          data: {
            id: storePhoto._id,
            name: storePhoto.name,
            imageUrl: storePhoto.imageUrl,
            lat: storePhoto.lat,
            lng: storePhoto.lng,
            status: storePhoto.status,
            createdAt: storePhoto.createdAt
          }
        });
      } catch (error) {
        console.error('Error subiendo foto:', error);
        res.status(500).json({
          success: false,
          message: 'Error interno del servidor'
        });
      }
    }
  ];

  /**
   * Obtiene todas las fotos de locales
   */
  static getStorePhotos = async (req: any, res: Response) => {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const user = req.user;

      const filter: any = {};
      if (status) {
        filter.status = status;
      }

      // Solo admin puede ver todas las fotos, otros usuarios solo las suyas
      if (user.role !== 'admin') {
        filter.uploadedBy = (user as any)._id;
      }

      const photos = await StorePhoto.find(filter)
        .populate('uploadedBy', 'name email')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await StorePhoto.countDocuments(filter);

      res.json({
        success: true,
        data: {
          photos,
          pagination: {
            current: parseInt(page),
            pages: Math.ceil(total / limit),
            total
          }
        }
      });
    } catch (error) {
      console.error('Error obteniendo fotos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * Obtiene una foto específica
   */
  static getStorePhoto = async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const user = req.user;

      const photo = await StorePhoto.findById(id).populate('uploadedBy', 'name email');

      if (!photo) {
        return res.status(404).json({
          success: false,
          message: 'Foto no encontrada'
        });
      }

      // Verificar permisos
      if (user.role !== 'admin' && photo.uploadedBy._id.toString() !== (user as any)._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Acceso denegado'
        });
      }

      res.json({
        success: true,
        data: photo
      });
    } catch (error) {
      console.error('Error obteniendo foto:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * Ejecuta el proceso de enriquecimiento manualmente
   */
  static runEnrichment = async (req: any, res: Response) => {
    try {
      const { photoId } = req.body;

      if (photoId) {
        // Procesar una foto específica
        const success = await enrichmentWorker.processPhotoById(photoId);
        
        if (success) {
          res.json({
            success: true,
            message: 'Foto enriquecida exitosamente'
          });
        } else {
          res.status(400).json({
            success: false,
            message: 'Error procesando la foto'
          });
        }
      } else {
        // Procesar todas las fotos pendientes
        await (enrichmentWorker as any).processPendingPhotos();
        
        res.json({
          success: true,
          message: 'Proceso de enriquecimiento iniciado'
        });
      }
    } catch (error) {
      console.error('Error ejecutando enriquecimiento:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * Obtiene estadísticas del enriquecimiento
   */
  static getEnrichmentStats = async (req: any, res: Response) => {
    try {
      const stats = await enrichmentWorker.getStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * Inicia/detiene el worker de enriquecimiento
   */
  static controlWorker = async (req: any, res: Response) => {
    try {
      const { action } = req.body;

      if (action === 'start') {
        await enrichmentWorker.startWorker();
        res.json({
          success: true,
          message: 'Worker iniciado'
        });
      } else if (action === 'stop') {
        enrichmentWorker.stopWorker();
        res.json({
          success: true,
          message: 'Worker detenido'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Acción inválida. Use "start" o "stop"'
        });
      }
    } catch (error) {
      console.error('Error controlando worker:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * Elimina una foto
   */
  static deleteStorePhoto = async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const user = req.user;

      const photo = await StorePhoto.findById(id);

      if (!photo) {
        return res.status(404).json({
          success: false,
          message: 'Foto no encontrada'
        });
      }

      // Verificar permisos
      if (user.role !== 'admin' && photo.uploadedBy.toString() !== (user as any)._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Acceso denegado'
        });
      }

      // Extraer public_id de la URL de Cloudinary
      const imageUrl = photo.imageUrl;
      const publicIdMatch = imageUrl.match(/\/v\d+\/(.+)\.(jpg|jpeg|png|gif|webp)$/);
      
      if (publicIdMatch) {
        const publicId = publicIdMatch[1];
        try {
          await deleteImage(publicId);
          console.log(`Imagen eliminada de Cloudinary: ${publicId}`);
        } catch (cloudinaryError) {
          console.error('Error eliminando imagen de Cloudinary:', cloudinaryError);
          // Continuar con la eliminación del documento aunque falle la eliminación de la imagen
        }
      }

      await StorePhoto.findByIdAndDelete(id);

      res.json({
        success: true,
        message: 'Foto eliminada exitosamente de Cloudinary y base de datos'
      });
    } catch (error) {
      console.error('Error eliminando foto:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };
}
