import { v2 as cloudinary } from 'cloudinary';
import Product from '../models/Product';

class CloudinaryCleanupService {
  /**
   * Limpiar todas las imágenes de productos de una tienda específica
   */
  async cleanupStoreImages(storeId: string): Promise<{ deleted: number; errors: string[] }> {
    try {
      console.log(`🗑️ Iniciando limpieza de imágenes para tienda: ${storeId}`);
      
      // Obtener todos los productos de la tienda
      const products = await Product.find({ store: storeId });
      console.log(`📦 Encontrados ${products.length} productos para limpiar`);
      
      let deletedCount = 0;
      const errors: string[] = [];
      
      // Procesar cada producto
      for (const product of products) {
        if (product.images && product.images.length > 0) {
          for (const imageUrl of product.images) {
            try {
              // Extraer public_id de la URL de Cloudinary
              const publicId = this.extractPublicIdFromUrl(imageUrl);
              if (publicId) {
                await cloudinary.uploader.destroy(publicId);
                deletedCount++;
                console.log(`✅ Imagen eliminada: ${publicId}`);
              }
            } catch (error) {
              const errorMsg = `Error eliminando imagen ${imageUrl}: ${error}`;
              console.error(errorMsg);
              errors.push(errorMsg);
            }
          }
        }
      }
      
      console.log(`✅ Limpieza completada. Eliminadas ${deletedCount} imágenes`);
      return { deleted: deletedCount, errors };
      
    } catch (error) {
      console.error('❌ Error en limpieza de imágenes:', error);
      throw error;
    }
  }

  /**
   * Limpiar todas las imágenes de productos de prueba
   */
  async cleanupAllTestImages(): Promise<{ deleted: number; errors: string[] }> {
    try {
      console.log('🗑️ Iniciando limpieza de todas las imágenes de productos de prueba');
      
      // Obtener todos los productos
      const products = await Product.find({});
      console.log(`📦 Encontrados ${products.length} productos para limpiar`);
      
      let deletedCount = 0;
      const errors: string[] = [];
      
      // Procesar cada producto
      for (const product of products) {
        if (product.images && product.images.length > 0) {
          for (const imageUrl of product.images) {
            try {
              // Extraer public_id de la URL de Cloudinary
              const publicId = this.extractPublicIdFromUrl(imageUrl);
              if (publicId) {
                await cloudinary.uploader.destroy(publicId);
                deletedCount++;
                console.log(`✅ Imagen eliminada: ${publicId}`);
              }
            } catch (error) {
              const errorMsg = `Error eliminando imagen ${imageUrl}: ${error}`;
              console.error(errorMsg);
              errors.push(errorMsg);
            }
          }
        }
      }
      
      console.log(`✅ Limpieza completada. Eliminadas ${deletedCount} imágenes`);
      return { deleted: deletedCount, errors };
      
    } catch (error) {
      console.error('❌ Error en limpieza de imágenes:', error);
      throw error;
    }
  }

  /**
   * Limpiar imágenes de una carpeta específica en Cloudinary
   */
  async cleanupFolder(folderPath: string): Promise<{ deleted: number; errors: string[] }> {
    try {
      console.log(`🗑️ Iniciando limpieza de carpeta: ${folderPath}`);
      
      // Listar todos los recursos en la carpeta
      const result = await cloudinary.api.resources({
        type: 'upload',
        prefix: folderPath,
        max_results: 500
      });
      
      console.log(`📦 Encontrados ${result.resources.length} recursos en la carpeta`);
      
      let deletedCount = 0;
      const errors: string[] = [];
      
      // Eliminar cada recurso
      for (const resource of result.resources) {
        try {
          await cloudinary.uploader.destroy(resource.public_id);
          deletedCount++;
          console.log(`✅ Recurso eliminado: ${resource.public_id}`);
        } catch (error) {
          const errorMsg = `Error eliminando recurso ${resource.public_id}: ${error}`;
          console.error(errorMsg);
          errors.push(errorMsg);
        }
      }
      
      console.log(`✅ Limpieza de carpeta completada. Eliminados ${deletedCount} recursos`);
      return { deleted: deletedCount, errors };
      
    } catch (error) {
      console.error('❌ Error en limpieza de carpeta:', error);
      throw error;
    }
  }

  /**
   * Extraer public_id de una URL de Cloudinary
   */
  private extractPublicIdFromUrl(url: string): string | null {
    try {
      // Patrón para URLs de Cloudinary
      const cloudinaryPattern = /upload\/(?:v\d+\/)?([^\/]+(?:\/[^\/]+)*?)(?:\.[a-zA-Z]+)?$/;
      const match = url.match(cloudinaryPattern);
      
      if (match && match[1]) {
        // Decodificar el public_id
        return decodeURIComponent(match[1]);
      }
      
      return null;
    } catch (error) {
      console.error('Error extrayendo public_id de URL:', url, error);
      return null;
    }
  }

  /**
   * Obtener estadísticas de uso de Cloudinary
   */
  async getUsageStats(): Promise<any> {
    try {
      const result = await cloudinary.api.usage();
      return result;
    } catch (error) {
      console.error('Error obteniendo estadísticas de uso:', error);
      throw error;
    }
  }
}

export default new CloudinaryCleanupService();
