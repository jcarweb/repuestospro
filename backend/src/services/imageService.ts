import { v2 as cloudinary } from 'cloudinary';
import { deleteImage, getOptimizedUrl } from '../config/cloudinary';
import * as fs from 'fs';

export interface ImageUploadResult {
  publicId: string;
  url: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  size: number;
}

export interface Base64ImageData {
  data: string;
  format: string;
  filename?: string;
}

class ImageService {
  /**
   * Subir imagen desde base64 a Cloudinary
   */
  async uploadBase64Image(base64Data: Base64ImageData, folder: string = 'piezasya'): Promise<ImageUploadResult> {
    try {
      // Extraer el formato de la cadena base64
      const format = base64Data.format || 'jpg';
      
      // Crear un nombre único para la imagen
      const filename = base64Data.filename || `image_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Configurar opciones de upload
      const uploadOptions = {
        folder: folder,
        public_id: filename,
        resource_type: 'image' as const,
        transformation: [
          { quality: 'auto', fetch_format: 'auto' }
        ]
      };

      // Subir a Cloudinary
      const result = await cloudinary.uploader.upload(base64Data.data, uploadOptions);

      return {
        publicId: result.public_id,
        url: result.url,
        secureUrl: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes
      };
    } catch (error) {
      console.error('Error subiendo imagen base64 a Cloudinary:', error);
      throw new Error('Error al subir la imagen');
    }
  }

  /**
   * Subir múltiples imágenes desde base64
   */
  async uploadMultipleBase64Images(
    base64Images: Base64ImageData[], 
    folder: string = 'piezasya'
  ): Promise<ImageUploadResult[]> {
    try {
      const uploadPromises = base64Images.map((image, index) => {
        const imageData = {
          ...image,
          filename: image.filename || `image_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`
        };
        return this.uploadBase64Image(imageData, folder);
      });

      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      console.error('Error subiendo múltiples imágenes:', error);
      throw new Error('Error al subir las imágenes');
    }
  }

  /**
   * Convertir archivo a base64
   */
  async fileToBase64(file: Express.Multer.File): Promise<Base64ImageData> {
    return new Promise((resolve, reject) => {
      try {
        const base64 = file.buffer.toString('base64');
        const format = file.mimetype.split('/')[1] || 'jpg';
        const dataUrl = `data:${file.mimetype};base64,${base64}`;
        
        resolve({
          data: dataUrl,
          format: format,
          filename: file.originalname
        });
      } catch (error) {
        reject(new Error('Error convirtiendo archivo a base64'));
      }
    });
  }

  /**
   * Optimizar imagen existente en Cloudinary
   */
  async optimizeImage(publicId: string, options: any = {}): Promise<string> {
    try {
      const defaultOptions = {
        quality: 'auto',
        fetch_format: 'auto',
        ...options
      };
      
      return getOptimizedUrl(publicId, defaultOptions);
    } catch (error) {
      console.error('Error optimizando imagen:', error);
      throw new Error('Error al optimizar la imagen');
    }
  }

  /**
   * Eliminar imagen de Cloudinary
   */
  async deleteImage(publicId: string): Promise<boolean> {
    try {
      const result = await deleteImage(publicId);
      return result.result === 'ok';
    } catch (error) {
      console.error('Error eliminando imagen:', error);
      return false;
    }
  }

  /**
   * Eliminar múltiples imágenes
   */
  async deleteMultipleImages(publicIds: string[]): Promise<{ success: string[], failed: string[] }> {
    const results = {
      success: [] as string[],
      failed: [] as string[]
    };

    for (const publicId of publicIds) {
      try {
        const success = await this.deleteImage(publicId);
        if (success) {
          results.success.push(publicId);
        } else {
          results.failed.push(publicId);
        }
      } catch (error) {
        results.failed.push(publicId);
      }
    }

    return results;
  }

  /**
   * Validar formato de imagen base64
   */
  validateBase64Image(base64String: string): boolean {
    try {
      // Verificar que sea una cadena base64 válida
      if (!base64String.startsWith('data:image/')) {
        return false;
      }

      // Verificar que tenga el formato correcto
      const regex = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/;
      return regex.test(base64String);
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtener información de imagen sin subirla
   */
  async getImageInfo(base64Data: string): Promise<{ width: number; height: number; size: number; format: string }> {
    try {
      // Para Node.js, usamos una aproximación básica
      const format = base64Data.split(';')[0]?.split('/')[1] || 'unknown';
      const size = Math.ceil((base64Data.length * 3) / 4); // Aproximación del tamaño en bytes
      
      return {
        width: 0, // No podemos obtener dimensiones reales en Node.js sin librerías adicionales
        height: 0,
        size,
        format
      };
    } catch (error) {
      throw new Error('Error al procesar información de imagen');
    }
  }

  /**
   * Comprimir imagen base64 antes de subir
   */
  async compressBase64Image(
    base64Data: string, 
    maxWidth: number = 800, 
    maxHeight: number = 600, 
    quality: number = 0.8
  ): Promise<string> {
    try {
      // Para Node.js, retornamos la imagen original ya que no tenemos canvas
      // En un entorno de producción, se podría usar sharp o jimp para redimensionar
      console.warn('compressBase64Image: Funcionalidad limitada en Node.js. Retornando imagen original.');
      return base64Data;
    } catch (error) {
      throw new Error('Error al procesar imagen');
    }
  }
}

export default new ImageService();
