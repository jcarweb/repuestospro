import React, { useState } from 'react';
import { API_BASE_URL } from '../../config/api';

interface AvatarImageProps {
  avatar?: string;
  alt: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const AvatarImage: React.FC<AvatarImageProps> = ({ 
  avatar, 
  alt, 
  className = '', 
  size = 'md' 
}) => {
  // Construir la URL del avatar usando useMemo para evitar recálculos
  const avatarUrl = React.useMemo(() => {
    const baseUrl = import.meta.env.VITE_API_URL || 'API_BASE_URL';
    
    if (!avatar || avatar === '/uploads/perfil/default-avatar.svg') {
      return '/default-avatar.svg'; // Usar avatar del frontend
    }
    
    // Si es una URL de Cloudinary, usarla directamente
    if (avatar.includes('cloudinary.com')) {
      console.log('AvatarImage - URL de Cloudinary:', avatar);
      return avatar;
    }
    
    // Si es una URL completa, usarla directamente
    if (avatar.startsWith('http')) {
      return avatar;
    }
    
    // Si es una ruta relativa, construir la URL completa
    const fullUrl = `${baseUrl}${avatar}`;
    console.log('AvatarImage - Avatar URL:', fullUrl); // Debug
    return fullUrl;
  }, [avatar]); // Solo recalcular cuando cambie el avatar

  // Estado para manejar errores de carga
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Resetear estado cuando cambie el avatar
  React.useEffect(() => {
    setImageError(false);
    setIsLoading(true);
  }, [avatar]);

  // Tamaños predefinidos
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-200 border-4 border-gray-300 ${className}`}>
      <img
        src={imageError ? '/default-avatar.svg' : avatarUrl}
        alt={alt}
        className="w-full h-full object-cover"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setImageError(true);
          setIsLoading(false);
        }}
      />
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
        </div>
      )}
    </div>
  );
};

export default AvatarImage;
