import React from 'react';

interface AvatarImageProps {
  avatar?: string;
  alt: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const AvatarImageSimple: React.FC<AvatarImageProps> = ({ 
  avatar, 
  alt, 
  className = '', 
  size = 'md' 
}) => {
  // Tamaños predefinidos
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  // Construir la URL del avatar
  const getAvatarUrl = () => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    console.log('AvatarImageSimple - Avatar recibido:', avatar);
    
    // Si no hay avatar o es el avatar por defecto, usar el del frontend
    if (!avatar || avatar === '/uploads/perfil/default-avatar.svg') {
      console.log('AvatarImageSimple - Usando avatar por defecto');
      return '/default-avatar.svg';
    }
    
    // Si es una URL de Cloudinary, usarla directamente
    if (avatar.includes('cloudinary.com')) {
      console.log('AvatarImageSimple - URL de Cloudinary:', avatar);
      return avatar;
    }
    
    // Si es una URL completa, usarla directamente
    if (avatar.startsWith('http')) {
      console.log('AvatarImageSimple - URL completa:', avatar);
      return avatar;
    }
    
    // Si es una ruta relativa, construir la URL completa con timestamp para evitar cache
    const finalUrl = `${baseUrl}${avatar}?t=${Date.now()}`;
    console.log('AvatarImageSimple - URL final:', finalUrl);
    return finalUrl;
  };

  // Obtener la URL del avatar
  const avatarUrl = getAvatarUrl();

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-200 border-4 border-gray-300 ${className}`}>
      <img
        src={avatarUrl}
        alt={alt}
        className="w-full h-full object-cover"
        onError={(e) => {
          console.log('AvatarImageSimple - Error cargando imagen, usando fallback');
          // Si falla la carga, usar el avatar por defecto del frontend
          const target = e.target as HTMLImageElement;
          target.src = '/default-avatar.svg';
        }}
        onLoad={() => {
          console.log('AvatarImageSimple - Imagen cargada exitosamente:', avatarUrl);
        }}
      />
    </div>
  );
};

export default AvatarImageSimple;
