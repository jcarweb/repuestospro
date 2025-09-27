import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configuración de Cloudinary
import { secureConfig } from './secureConfig';

const cloudinaryConfig = secureConfig.get('cloudinary');

cloudinary.config({
  cloud_name: cloudinaryConfig.cloudName,
  api_key: cloudinaryConfig.apiKey,
  api_secret: cloudinaryConfig.apiSecret
});

// Verificar configuración de Cloudinary
if (!cloudinaryConfig.isConfigured) {
  console.warn('⚠️  Cloudinary no está configurado correctamente. Las imágenes no se subirán a Cloudinary.');
}

// Configuración de almacenamiento para productos
export const productStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'piezasya/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 800, height: 600, crop: 'limit' },
      { quality: 'auto', fetch_format: 'auto' }
    ],
    resource_type: 'image'
  } as any
});

// Configuración de almacenamiento para avatares de perfil
export const profileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'piezasya/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 300, height: 300, crop: 'fill', gravity: 'face' },
      { quality: 'auto', fetch_format: 'auto' }
    ],
    resource_type: 'image'
  } as any
});

// Configuración de almacenamiento para premios de fidelización
export const rewardStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'piezasya/rewards',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 400, height: 300, crop: 'limit' },
      { quality: 'auto', fetch_format: 'auto' }
    ],
    resource_type: 'image'
  } as any
});

// Configuración de almacenamiento para anuncios
export const advertisementStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'piezasya/advertisements',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 1200, height: 600, crop: 'limit' },
      { quality: 'auto', fetch_format: 'auto' }
    ],
    resource_type: 'image'
  } as any
});

// Middleware de multer para productos
export const productUpload = multer({
  storage: productStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'));
    }
  }
});

// Middleware de multer para perfiles
export const profileUpload = multer({
  storage: profileStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'));
    }
  }
});

// Middleware de multer para premios
export const rewardUpload = multer({
  storage: rewardStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'));
    }
  }
});

// Middleware de multer para anuncios
export const advertisementUpload = multer({
  storage: advertisementStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'));
    }
  }
});

// Configuración de almacenamiento para fotos de locales
export const storePhotoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'piezasya/store-photos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 1200, height: 800, crop: 'limit' },
      { quality: 'auto', fetch_format: 'auto' }
    ],
    resource_type: 'image'
  } as any
});

// Middleware de multer para fotos de locales
export const storePhotoUpload = multer({
  storage: storePhotoStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'));
    }
  }
});

// Función para eliminar imagen de Cloudinary
export const deleteImage = async (publicId: string) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error eliminando imagen de Cloudinary:', error);
    throw error;
  }
};

// Función para obtener URL optimizada
export const getOptimizedUrl = (publicId: string, options: any = {}) => {
  const defaultOptions = {
    quality: 'auto',
    fetch_format: 'auto',
    ...options
  };
  
  return cloudinary.url(publicId, defaultOptions);
};

export default cloudinary;
