import { useState, useCallback } from 'react';

interface UseImageUploadOptions {
  maxImages?: number;
  maxSize?: number; // en MB
  acceptedFormats?: string[];
  onError?: (error: string) => void;
  onSuccess?: (images: string[]) => void;
  initialImages?: string[]; // Imágenes iniciales (URLs o base64)
}

interface UseImageUploadReturn {
  images: string[];
  isLoading: boolean;
  error: string | null;
  addImages: (files: FileList | File[]) => Promise<void>;
  removeImage: (index: number) => void;
  clearImages: () => void;
  uploadToServer: (endpoint: string, additionalData?: any) => Promise<any>;
}

export const useImageUpload = (options: UseImageUploadOptions = {}): UseImageUploadReturn => {
  const {
    maxImages = 5,
    maxSize = 10,
    acceptedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    onError,
    onSuccess,
    initialImages = []
  } = options;

  const [images, setImages] = useState<string[]>(initialImages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Convertir archivo a base64
  const fileToBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }, []);

  // Validar archivo
  const validateFile = useCallback((file: File): string | null => {
    // Verificar formato
    if (!acceptedFormats.includes(file.type)) {
      return `Formato no soportado: ${file.name}`;
    }

    // Verificar tamaño
    if (file.size > maxSize * 1024 * 1024) {
      return `Archivo demasiado grande: ${file.name} (máximo ${maxSize}MB)`;
    }

    return null;
  }, [acceptedFormats, maxSize]);

  // Agregar imágenes
  const addImages = useCallback(async (files: FileList | File[]) => {
    setError(null);
    setIsLoading(true);

    try {
      const fileArray = Array.from(files);
      const newImages: string[] = [];
      const errors: string[] = [];

      // Verificar límite de imágenes
      if (images.length + fileArray.length > maxImages) {
        throw new Error(`Máximo ${maxImages} imágenes permitidas`);
      }

      for (const file of fileArray) {
        // Validar archivo
        const validationError = validateFile(file);
        if (validationError) {
          errors.push(validationError);
          continue;
        }

        try {
          const base64 = await fileToBase64(file);
          newImages.push(base64);
        } catch (err) {
          errors.push(`Error procesando ${file.name}`);
        }
      }

      if (errors.length > 0) {
        const errorMessage = errors.join('\n');
        setError(errorMessage);
        onError?.(errorMessage);
        return;
      }

      if (newImages.length > 0) {
        const updatedImages = [...images, ...newImages];
        setImages(updatedImages);
        onSuccess?.(updatedImages);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [images, maxImages, validateFile, fileToBase64, onError, onSuccess]);

  // Eliminar imagen
  const removeImage = useCallback((index: number) => {
    setImages(prev => {
      const newImages = prev.filter((_, i) => i !== index);
      onSuccess?.(newImages);
      return newImages;
    });
    setError(null);
  }, [onSuccess]);

  // Limpiar todas las imágenes
  const clearImages = useCallback(() => {
    setImages([]);
    setError(null);
  }, []);

  // Subir imágenes al servidor
  const uploadToServer = useCallback(async (endpoint: string, additionalData: any = {}) => {
    if (images.length === 0) {
      throw new Error('No hay imágenes para subir');
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({
          ...additionalData,
          images: images
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Limpiar imágenes después de subir exitosamente
      setImages([]);
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al subir las imágenes';
      setError(errorMessage);
      onError?.(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [images, onError]);

  return {
    images,
    isLoading,
    error,
    addImages,
    removeImage,
    clearImages,
    uploadToServer
  };
};
