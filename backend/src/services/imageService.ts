import { v2 as cloudinary } from 'cloudinary';
import { deleteImage, getOptimizedUrl } from '../config/cloudinary';

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
      const reader = new FileReader();
      
      reader.onload = () => {
        const result = reader.result as string;
        const format = file.mimetype.split('/')[1] || 'jpg';
        
        resolve({
          data: result,
          format: format,
          filename: file.originalname
        });
      };
      
      reader.onerror = () => {
        reject(new Error('Error convirtiendo archivo a base64'));
      };
      
      reader.readAsDataURL(file);
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
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
          size: Math.ceil((base64Data.length * 3) / 4), // Aproximación del tamaño en bytes
          format: base64Data.split(';')[0].split('/')[1]
        });
      };
      
      img.onerror = () => {
        reject(new Error('Error obteniendo información de la imagen'));
      };
      
      img.src = base64Data;
    });
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
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('No se pudo obtener el contexto del canvas'));
          return;
        }

        // Calcular nuevas dimensiones manteniendo proporción
        let { width, height } = img;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        // Dibujar imagen redimensionada
        ctx.drawImage(img, 0, 0, width, height);

        // Convertir a base64 con calidad especificada
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      
      img.onerror = () => {
        reject(new Error('Error cargando la imagen'));
      };
      
      img.src = base64Data;
    });
  }
}

export default new ImageService();
