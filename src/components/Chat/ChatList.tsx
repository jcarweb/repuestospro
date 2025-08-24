import React, { useState, useEffect } from 'react';
import { MessageCircle, User, Clock, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Chat } from '../../hooks/useChat';

interface ChatListProps {
  onChatSelect: (chatId: string) => void;
  selectedChatId?: string;
  className?: string;
}

const ChatList: React.FC<ChatListProps> = ({
  onChatSelect,
  selectedChatId,
  className = ''
}) => {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar chats del usuario
  useEffect(() => {
    const fetchChats = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        
        const response = await fetch(`${import.meta.env.VITE_API_URL}/chat/my-chats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Error cargando chats');
        }

        const data = await response.json();
        if (data.success) {
          setChats(data.data.chats);
        } else {
          throw new Error(data.message || 'Error desconocido');
        }
      } catch (error) {
        console.error('Error cargando chats:', error);
        setError(error instanceof Error ? error.message : 'Error desconocido');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchChats();
    }
  }, [user]);

  // Función para obtener el nombre del contacto
  const getContactName = (chat: Chat) => {
    if (user?.role === 'client') {
      return chat.metadata.storeName;
    } else {
      return chat.metadata.clientName;
    }
  };

  // Función para obtener el estado en línea del contacto
  const getContactOnlineStatus = (chat: Chat) => {
    if (user?.role === 'client') {
      return chat.isStoreOnline;
    } else {
      return chat.isClientOnline;
    }
  };

  // Función para formatear la última actividad
  const formatLastActivity = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  };

  // Función para obtener el estado del último mensaje
  const getMessageStatus = (chat: Chat) => {
    if (!chat.lastMessage) return null;
    
    const isOwnMessage = chat.lastMessage.sender.userId === user?._id;
    if (!isOwnMessage) return null;

    switch (chat.lastMessage.status) {
      case 'sent':
        return <Clock className="w-3 h-3 text-gray-400" />;
      case 'delivered':
        return <CheckCircle className="w-3 h-3 text-gray-400" />;
      case 'read':
        return <CheckCircle className="w-3 h-3 text-blue-500" />;
      case 'blocked':
        return <AlertTriangle className="w-3 h-3 text-red-500" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center gap-3 p-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="text-center py-8">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="text-center py-8">
          <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No tienes chats aún
          </h3>
          <p className="text-gray-500 mb-4">
            {user?.role === 'client' 
              ? 'Comienza una conversación con una tienda desde un producto'
              : 'Los clientes pueden contactarte desde tus productos'
            }
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-green-600">
            <Shield className="w-4 h-4" />
            <span>Todas las comunicaciones son seguras</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Chats ({chats.length})
        </h2>
      </div>
      
      <div className="overflow-y-auto">
        {chats.map((chat) => (
          <div
            key={chat._id}
            onClick={() => onChatSelect(chat._id)}
            className={`flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors ${
              selectedChatId === chat._id ? 'bg-blue-50 border-blue-200' : ''
            }`}
          >
            {/* Avatar */}
            <div className="relative">
              <div className="w-12 h-12 bg-[#FFC300] rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-gray-900" />
              </div>
              
              {/* Indicador en línea */}
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                getContactOnlineStatus(chat) ? 'bg-green-500' : 'bg-gray-400'
              }`}></div>
            </div>

            {/* Información del chat */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-gray-900 truncate">
                  {getContactName(chat)}
                </h3>
                <div className="flex items-center gap-1">
                  {getMessageStatus(chat)}
                  <span className="text-xs text-gray-500">
                    {formatLastActivity(chat.lastActivity)}
                  </span>
                </div>
              </div>
              
              {/* Información del producto */}
              {chat.product && (
                <div className="text-xs text-gray-500 mb-1 truncate">
                  📦 {chat.product.name}
                </div>
              )}
              
              {/* Último mensaje */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 truncate">
                  {chat.lastMessage ? (
                    <>
                      {chat.lastMessage.sender.userId === user?._id && 'Tú: '}
                      {chat.lastMessage.messageType === 'system' ? (
                        <span className="italic">{chat.lastMessage.content}</span>
                      ) : (
                        chat.lastMessage.content
                      )}
                    </>
                  ) : (
                    'Inicia la conversación'
                  )}
                </p>
                
                {/* Indicador de estado del chat */}
                {chat.status === 'closed' && (
                  <span className="text-xs text-red-500 ml-2">Cerrado</span>
                )}
                {chat.status === 'blocked' && (
                  <span className="text-xs text-red-600 ml-2">Bloqueado</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Footer informativo */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-center gap-2 text-sm text-green-600">
          <Shield className="w-4 h-4" />
          <span>Chats protegidos y monitoreados por seguridad</span>
        </div>
      </div>
    </div>
  );
};

export default ChatList;

