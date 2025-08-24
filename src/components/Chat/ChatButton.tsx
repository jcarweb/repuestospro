import React, { useState } from 'react';
import { MessageCircle, Shield, User, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface ChatButtonProps {
  storeId: string;
  productId?: string;
  storeName: string;
  productName?: string;
  onChatCreated?: (chatId: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'outline';
}

const ChatButton: React.FC<ChatButtonProps> = ({
  storeId,
  productId,
  storeName,
  productName,
  onChatCreated,
  className = '',
  size = 'md',
  variant = 'primary'
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Configuración de tamaños
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  // Configuración de variantes
  const variantClasses = {
    primary: 'bg-[#FFC300] text-gray-900 hover:bg-[#E6B800]',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700',
    outline: 'border-2 border-[#FFC300] text-[#FFC300] hover:bg-[#FFC300] hover:text-gray-900'
  };

  // Función para crear o abrir chat
  const handleChatClick = async () => {
    // Verificar que el usuario esté autenticado
    if (!user) {
      alert('Debes iniciar sesión para chatear');
      return;
    }

    // Solo clientes pueden iniciar chats
    if (user.role !== 'client') {
      alert('Solo los clientes pueden iniciar chats con las tiendas');
      return;
    }

    // No permitir chat consigo mismo (si es el dueño de la tienda)
    if (user._id === storeId) {
      alert('No puedes chatear contigo mismo');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/chat/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          storeId,
          productId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error creando chat');
      }

      const data = await response.json();
      
      if (data.success) {
        console.log('Chat creado/encontrado:', data.data.chatId);
        
        if (onChatCreated) {
          onChatCreated(data.data.chatId);
        } else {
          // Redirigir a la página de chat (implementar según tu routing)
          window.location.href = `/chat/${data.data.chatId}`;
        }
      } else {
        throw new Error(data.message || 'Error desconocido');
      }
    } catch (error) {
      console.error('Error creando chat:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
      
      // Mostrar error temporalmente
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  // Renderizar error si existe
  if (error) {
    return (
      <div className={`flex items-center gap-2 text-red-600 text-sm ${className}`}>
        <AlertTriangle className="w-4 h-4" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className={className}>
      <button
        onClick={handleChatClick}
        disabled={isLoading || !user}
        className={`
          ${sizeClasses[size]} 
          ${variantClasses[variant]}
          rounded-lg font-medium transition-colors duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          flex items-center gap-2 justify-center
          focus:outline-none focus:ring-2 focus:ring-[#FFC300] focus:ring-offset-2
        `}
      >
        {isLoading ? (
          <>
            <div className={`animate-spin rounded-full border-2 border-current border-t-transparent ${iconSizes[size]}`}></div>
            <span>Conectando...</span>
          </>
        ) : (
          <>
            <MessageCircle className={iconSizes[size]} />
            <span>Chat con {storeName}</span>
          </>
        )}
      </button>

      {/* Información de seguridad */}
      {user && (
        <div className="mt-2 flex items-center justify-center gap-1 text-xs text-green-600">
          <Shield className="w-3 h-3" />
          <span>Chat seguro y protegido</span>
        </div>
      )}

      {/* Información del producto */}
      {productName && (
        <div className="mt-1 text-xs text-gray-500 text-center">
          Consulta sobre: {productName}
        </div>
      )}

      {/* Mensaje para usuarios no autenticados */}
      {!user && (
        <div className="mt-2 text-xs text-gray-500 text-center">
          <User className="w-3 h-3 inline mr-1" />
          Inicia sesión para chatear
        </div>
      )}
    </div>
  );
};

export default ChatButton;

