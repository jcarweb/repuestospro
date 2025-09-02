import React, { useState, useEffect } from 'react';

interface ImageTestProps {
  imageUrl: string;
  alt: string;
  fallbackUrl?: string;
}

const ImageTest: React.FC<ImageTestProps> = ({ imageUrl, alt, fallbackUrl }) => {
  const [imageSrc, setImageSrc] = useState(imageUrl);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setImageSrc(imageUrl);
    setHasError(false);
    setIsLoading(true);
  }, [imageUrl]);

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleImageError = () => {
    console.error(`❌ Error cargando imagen: ${imageUrl}`);
    setHasError(true);
    setIsLoading(false);
    
    if (fallbackUrl) {
      setImageSrc(fallbackUrl);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-48 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  if (hasError && !fallbackUrl) {
    return (
      <div className="w-full h-48 bg-red-100 border-2 border-red-300 rounded-lg flex items-center justify-center">
        <div className="text-red-600 text-center">
          <div className="text-2xl mb-2">❌</div>
          <div className="text-sm">Error cargando imagen</div>
          <div className="text-xs text-red-500 mt-1 break-all">{imageUrl}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <img
        src={imageSrc}
        alt={alt}
        className="w-full h-48 object-cover rounded-lg"
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
      {hasError && fallbackUrl && (
        <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
          Fallback
        </div>
      )}
    </div>
  );
};

export default ImageTest;
