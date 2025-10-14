import { Request, Response } from 'express';
import StorePhoto from '../models/StorePhoto';
import { enrichmentWorker } from '../services/enrichmentWorker';
import { CryptoAuth } from '../utils/cryptoAuth';
import { storePhotoUpload, deleteImage } from '../config/cloudinary';

interface AuthenticatedRequest extends Request {
  user?: any;
}

export class StorePhotoController {
  /**
   * Sube una foto de local con GPS
   */
  static uploadStorePhoto = [
    storePhotoUpload.single('image'),
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      try {
        const user = req.user;
        const { name, phone, lat, lng } = req.body;

        if (!req.file) {
          res.status(400).json({
            success: false,
            message: 'Imagen requerida'
          });
        }

        if (!name || !lat || !lng) {
          res.status(400).json({
            success: false,
            message: 'Nombre, latitud y longitud son requeridos'
          });
        }

        // La imagen ya está en Cloudinary, usar la URL directamente
        const imageUrl = req.file?.path;
        if (!imageUrl) {
          res.status(400).json({
            success: false,
            message: 'No se pudo procesar la imagen'
          });
          return;
        }

        // Crear el documento en la base de datos
        const storePhoto = new StorePhoto({
          name,
          phone,
          imageUrl,
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          uploadedBy: user?._id || user?.id,
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
  static getStorePhotos = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { page = 1, limit = 50, status } = req.query;
      const user = req.user;

      const filter: any = {};
      if (status) {
        filter.status = status;
      }

      // Solo admin puede ver todas las fotos, otros usuarios solo las suyas
      if (user && user.role !== 'admin') {
        filter.uploadedBy = user._id;
      }

      const photos = await StorePhoto.find(filter)
        .populate('uploadedBy', 'name email')
        .sort({ createdAt: -1 })
        .limit(Number(limit) * 1)
        .skip((Number(page) - 1) * Number(limit));

      const total = await StorePhoto.countDocuments(filter);

      res.json({
        success: true,
        data: photos, // Enviar directamente las fotos, no un objeto con paginación
        pagination: {
          current: parseInt(String(page)),
          pages: Math.ceil(total / Number(limit)),
          total
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
  static getStorePhoto = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const user = req.user;

      const photo = await StorePhoto.findById(id).populate('uploadedBy', 'name email');

      if (!photo) {
        res.status(404).json({
          success: false,
          message: 'Foto no encontrada'
        });
      }

      // Verificar permisos
      if (user.role !== 'admin' && photo?.uploadedBy._id.toString() !== user._id.toString()) {
        res.status(403).json({
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
  static runEnrichment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      console.log('🔄 StorePhotoController.runEnrichment - Iniciando proceso de enriquecimiento');
      const { photoId } = req.body;
      console.log('📸 photoId recibido:', photoId);

      if (photoId) {
        console.log(`🎯 Procesando foto específica con ID: ${photoId}`);
        // Procesar una foto específica
        const success = await enrichmentWorker.processPhotoById(photoId);
        console.log(`✅ Resultado del procesamiento: ${success}`);
        
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
        console.log('🔄 Procesando todas las fotos pendientes');
        // Procesar todas las fotos pendientes
        await (enrichmentWorker as any).processPendingPhotos();
        
        res.json({
          success: true,
          message: 'Proceso de enriquecimiento iniciado'
        });
      }
    } catch (error) {
      console.error('❌ Error ejecutando enriquecimiento:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * Obtiene estadísticas del enriquecimiento
   */
  static getEnrichmentStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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
  static controlWorker = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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
  static deleteStorePhoto = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const user = req.user;

      const photo = await StorePhoto.findById(id);

      if (!photo) {
        res.status(404).json({
          success: false,
          message: 'Foto no encontrada'
        });
        return;
      }

      // Verificar permisos
      if (user.role !== 'admin' && photo.uploadedBy.toString() !== user._id.toString()) {
        res.status(403).json({
          success: false,
          message: 'Acceso denegado'
        });
        return;
      }

      // Extraer public_id de la URL de Cloudinary
      const imageUrl = photo?.imageUrl;
      if (!imageUrl) {
        res.status(400).json({
          success: false,
          message: 'No se encontró URL de imagen'
        });
        return;
      }
      const publicIdMatch = imageUrl.match(/\/v\d+\/(.+)\.(jpg|jpeg|png|gif|webp)$/);
      
      if (publicIdMatch) {
        const publicId = publicIdMatch[1];
        try {
          await deleteImage(publicId || '');
          console.log(`Imagen eliminada de Cloudinary: ${publicId}`);
        } catch (cloudinaryError) {
          console.error('Error eliminando imagen de Cloudinary:', cloudinaryError);
          // Continuar con la eliminación del documento aunque falle la eliminación de la imagen
        }
      }

      const deletedPhoto = await StorePhoto.findByIdAndDelete(id);
      console.log('🗑️ Foto eliminada de la base de datos:', deletedPhoto ? 'Sí' : 'No');

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

  /**
   * Endpoint de prueba para verificar el sistema
   */
  static testSystem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const stats = await StorePhoto.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const total = await StorePhoto.countDocuments();
      const recentPhotos = await StorePhoto.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('uploadedBy', 'name email');

      res.json({
        success: true,
        message: 'Sistema de enriquecimiento funcionando correctamente',
        data: {
          total,
          stats: stats.reduce((acc, stat) => {
            acc[stat._id] = stat.count;
            return acc;
          }, {}),
          recentPhotos,
          cloudinaryConfigured: !!(process.env['CLOUDINARY_CLOUD_NAME'] && 
                                  process.env['CLOUDINARY_CLOUD_NAME'] !== 'your_cloud_name')
        }
      });
    } catch (error) {
      console.error('Error en test del sistema:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };
}
