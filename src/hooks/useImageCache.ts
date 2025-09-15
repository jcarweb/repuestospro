import { useState, useEffect, useRef } from 'react';

interface UseImageCacheOptions {
  fallbackSrc?: string;
  cacheTime?: number; // en milisegundos
}

export const useImageCache = (src: string, options: UseImageCacheOptions = {}) => {
  const { fallbackSrc = '/default-avatar.svg', cacheTime = 300000 } = options; // 5 minutos por defecto
  
  const [imageSrc, setImageSrc] = useState<string>(src);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const cacheRef = useRef<Map<string, { src: string; timestamp: number }>>(new Map());

  useEffect(() => {
    if (!src) {
      setImageSrc(fallbackSrc);
      setIsLoading(false);
      return;
    }

    // Para avatares del backend, no usar cache para asegurar actualización
    const isBackendAvatar = src.includes('/uploads/perfil/') && !src.includes('default-avatar.svg');
    
    // Verificar cache solo si no es un avatar del backend
    if (!isBackendAvatar) {
      const cached = cacheRef.current.get(src);
      const now = Date.now();
      
      if (cached && (now - cached.timestamp) < cacheTime) {
        setImageSrc(cached.src);
        setIsLoading(false);
        setHasError(false);
        return;
      }
    }

    // Crear nueva imagen para precargar
    const img = new Image();
    imgRef.current = img;

    const handleLoad = () => {
      if (imgRef.current === img) {
        setImageSrc(src);
        setIsLoading(false);
        setHasError(false);
        // Guardar en cache solo si no es un avatar del backend
        if (!isBackendAvatar) {
          cacheRef.current.set(src, { src, timestamp: Date.now() });
        }
      }
    };

    const handleError = () => {
      if (imgRef.current === img) {
        setImageSrc(fallbackSrc);
        setIsLoading(false);
        setHasError(true);
      }
    };

    img.addEventListener('load', handleLoad);
    img.addEventListener('error', handleError);

    setIsLoading(true);
    setHasError(false);
    img.src = src;

    return () => {
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
      if (imgRef.current === img) {
        imgRef.current = null;
      }
    };
  }, [src, fallbackSrc, cacheTime]);

  // Limpiar cache expirado
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      for (const [key, value] of cacheRef.current.entries()) {
        if (now - value.timestamp > cacheTime) {
          cacheRef.current.delete(key);
        }
      }
    }, 60000); // Limpiar cada minuto

    return () => clearInterval(interval);
  }, [cacheTime]);

  return {
    src: imageSrc,
    isLoading,
    hasError,
    clearCache: () => cacheRef.current.clear()
  };
};
