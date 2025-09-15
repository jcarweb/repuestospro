import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useActiveStore } from '../contexts/ActiveStoreContext';
import { useLanguage } from '../contexts/LanguageContext';
import ViolationsPanel from '../components/Chat/ViolationsPanel';
import { 
  MessageCircle, 
  Search, 
  Filter, 
  MoreVertical, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Shield,
  Users,
  TrendingUp,
  Eye,
  EyeOff,
  Archive,
  Flag,
  User,
  Store,
  Calendar,
  Phone,
  Mail,
  ExternalLink,
  Ban,
  Star,
  StarOff
} from 'lucide-react';

interface ChatMessage {
  _id: string;
  content: string;
  sender: {
    userId: string;
    userType: 'client' | 'store_manager' | 'admin';
    userName: string;
  };
  status: 'sent' | 'delivered' | 'read' | 'blocked';
  validation: {
    isBlocked: boolean;
    violations: string[];
    blockedContent: string[];
  };
  createdAt: string;
}

interface Chat {
  _id: string;
  participants: {
    client: string;
    store: string;
  };
  product?: {
    _id: string;
    name: string;
    image: string;
  };
  status: 'active' | 'closed' | 'blocked';
  lastMessage?: ChatMessage;
  lastActivity: string;
  isClientOnline: boolean;
  metadata: {
    clientName: string;
    storeName: string;
    productName?: string;
  };
  messageCount: number;
  unreadCount: number;
  violationsCount: number;
}

interface ChatStats {
  totalChats: number;
  activeChats: number;
  unreadMessages: number;
  violationsToday: number;
  averageResponseTime: number;
  customerSatisfaction: number;
}

const StoreManagerMessages: React.FC = () => {
  const { user } = useAuth();
  const { activeStore } = useActiveStore();
  const { t } = useLanguage();
  
  const [chats, setChats] = useState<Chat[]>([]);
  const [filteredChats, setFilteredChats] = useState<Chat[]>([]);
  const [stats, setStats] = useState<ChatStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'unread' | 'violations'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'unread' | 'violations'>('recent');
  
  // Estados de UI
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [showChatDetail, setShowChatDetail] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'chats' | 'violations'>('chats');

  useEffect(() => {
    if (activeStore?._id) {
      loadChatsAndStats();
    }
  }, [activeStore]);

  useEffect(() => {
    filterAndSortChats();
  }, [chats, searchTerm, statusFilter, sortBy]);

  const loadChatsAndStats = async () => {
    if (!activeStore?._id) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Cargar chats de la tienda
      const chatsResponse = await fetch(`/api/chat/store/${activeStore._id}`, {
        headers
      });

      if (chatsResponse.ok) {
        const chatsData = await chatsResponse.json();
        setChats(chatsData.data.chats);
      }

      // Cargar estadísticas
      const statsResponse = await fetch(`/api/chat/store/${activeStore._id}/stats`, {
        headers
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.data);
      }

    } catch (err) {
      console.error('Error cargando mensajes:', err);
      setError('Error al cargar los mensajes');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortChats = () => {
    let filtered = [...chats];

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(chat => 
        chat.metadata.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.metadata.productName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por estado
    switch (statusFilter) {
      case 'active':
        filtered = filtered.filter(chat => chat.status === 'active');
        break;
      case 'unread':
        filtered = filtered.filter(chat => chat.unreadCount > 0);
        break;
      case 'violations':
        filtered = filtered.filter(chat => chat.violationsCount > 0);
        break;
    }

    // Ordenar
    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());
        break;
      case 'unread':
        filtered.sort((a, b) => b.unreadCount - a.unreadCount);
        break;
      case 'violations':
        filtered.sort((a, b) => b.violationsCount - a.violationsCount);
        break;
    }

    setFilteredChats(filtered);
  };

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat);
    setShowChatDetail(true);
  };

  const handleCloseChat = async (chatId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/chat/${chatId}/close`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Actualizar estado local
        setChats(prev => prev.map(chat => 
          chat._id === chatId ? { ...chat, status: 'closed' as const } : chat
        ));
        setSelectedChat(null);
        setShowChatDetail(false);
      }
    } catch (error) {
      console.error('Error cerrando chat:', error);
    }
  };

  const handleBlockUser = async (chatId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/chat/${chatId}/block`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setChats(prev => prev.map(chat => 
          chat._id === chatId ? { ...chat, status: 'blocked' as const } : chat
        ));
        setSelectedChat(null);
        setShowChatDetail(false);
      }
    } catch (error) {
      console.error('Error bloqueando usuario:', error);
    }
  };

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

  const getStatusIcon = (chat: Chat) => {
    if (chat.status === 'blocked') {
      return <Ban className="w-4 h-4 text-red-500" />;
    }
    if (chat.unreadCount > 0) {
      return <MessageCircle className="w-4 h-4 text-blue-500" />;
    }
    if (chat.violationsCount > 0) {
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={loadChatsAndStats}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mensajes de Tienda</h1>
            <p className="text-gray-600 mt-2">
              Gestiona las conversaciones con clientes de {activeStore?.name || 'tu tienda'}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
                showFilters 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filtros
            </button>
            
            <button
              onClick={loadChatsAndStats}
              className="px-4 py-2 bg-[#FFC300] text-gray-900 rounded-lg font-medium hover:bg-[#E6B800]"
            >
              Actualizar
            </button>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total de Chats</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalChats}</p>
                <p className="text-sm text-blue-600">{stats.activeChats} activos</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Mensajes Sin Leer</p>
                <p className="text-2xl font-bold text-gray-900">{stats.unreadMessages}</p>
                <p className="text-sm text-green-600">Requieren atención</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Violaciones Hoy</p>
                <p className="text-2xl font-bold text-gray-900">{stats.violationsToday}</p>
                <p className="text-sm text-yellow-600">Necesitan revisión</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Tiempo Respuesta</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageResponseTime}m</p>
                <p className="text-sm text-purple-600">Promedio</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Búsqueda */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por cliente o producto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-transparent"
                />
              </div>
            </div>

            {/* Filtro de estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-transparent"
              >
                <option value="all">Todos los chats</option>
                <option value="active">Chats activos</option>
                <option value="unread">Con mensajes sin leer</option>
                <option value="violations">Con violaciones</option>
              </select>
            </div>

            {/* Ordenar por */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ordenar por
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-transparent"
              >
                <option value="recent">Más recientes</option>
                <option value="unread">Más mensajes sin leer</option>
                <option value="violations">Más violaciones</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Navegación de pestañas */}
      <div className="flex space-x-1 mb-6">
        <button
          onClick={() => setActiveTab('chats')}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === 'chats'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <MessageCircle className="w-4 h-4 inline mr-2" />
          Conversaciones ({filteredChats.length})
        </button>
        <button
          onClick={() => setActiveTab('violations')}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === 'violations'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <AlertTriangle className="w-4 h-4 inline mr-2" />
          Violaciones
        </button>
      </div>

      {/* Contenido de pestañas */}
      {activeTab === 'chats' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Conversaciones ({filteredChats.length})
            </h2>
          </div>

        {filteredChats.length === 0 ? (
          <div className="p-8 text-center">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              No hay conversaciones
            </h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'No se encontraron conversaciones con los filtros aplicados'
                : 'Los clientes pueden contactarte desde tus productos'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredChats.map((chat) => (
              <div
                key={chat._id}
                onClick={() => handleChatSelect(chat)}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-12 h-12 bg-[#FFC300] rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-900" />
                      </div>
                      {chat.isClientOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>

                    {/* Información del chat */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {chat.metadata.clientName}
                        </h3>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(chat)}
                          <span className="text-xs text-gray-500">
                            {formatLastActivity(chat.lastActivity)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-sm text-gray-500 truncate">
                          {chat.metadata.productName || 'Chat general'}
                        </p>
                        <div className="flex items-center space-x-2">
                          {chat.unreadCount > 0 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {chat.unreadCount} nuevo{chat.unreadCount > 1 ? 's' : ''}
                            </span>
                          )}
                          {chat.violationsCount > 0 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              {chat.violationsCount} violación{chat.violationsCount > 1 ? 'es' : ''}
                            </span>
                          )}
                        </div>
                      </div>

                      {chat.lastMessage && (
                        <p className="text-sm text-gray-400 mt-1 truncate">
                          {chat.lastMessage.sender.userName}: {chat.lastMessage.content}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleChatSelect(chat);
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Implementar menú de acciones
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      )}

      {/* Pestaña de Violaciones */}
      {activeTab === 'violations' && (
        <div className="bg-white rounded-lg shadow">
          <ViolationsPanel 
            storeId={activeStore?._id || ''}
            onViolationUpdate={(violationId, action) => {
              console.log('Violación actualizada:', violationId, action);
              // Recargar estadísticas si es necesario
              loadChatsAndStats();
            }}
            className="p-6"
          />
        </div>
      )}

      {/* Modal de Detalle del Chat */}
      {showChatDetail && selectedChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Header del modal */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-[#FFC300] rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-900" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedChat.metadata.clientName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedChat.metadata.productName || 'Chat general'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleCloseChat(selectedChat._id)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100"
                  >
                    Cerrar Chat
                  </button>
                  <button
                    onClick={() => handleBlockUser(selectedChat._id)}
                    className="px-4 py-2 text-red-600 hover:text-red-800 rounded-lg hover:bg-red-50"
                  >
                    Bloquear Usuario
                  </button>
                  <button
                    onClick={() => {
                      setShowChatDetail(false);
                      setSelectedChat(null);
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>

            {/* Contenido del modal */}
            <div className="p-6">
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Información del Chat</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Estado:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                      selectedChat.status === 'active' ? 'bg-green-100 text-green-800' :
                      selectedChat.status === 'closed' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedChat.status === 'active' ? 'Activo' :
                       selectedChat.status === 'closed' ? 'Cerrado' : 'Bloqueado'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Mensajes:</span>
                    <span className="ml-2 font-medium">{selectedChat.messageCount}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Sin leer:</span>
                    <span className="ml-2 font-medium">{selectedChat.unreadCount}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Violaciones:</span>
                    <span className="ml-2 font-medium">{selectedChat.violationsCount}</span>
                  </div>
                </div>
              </div>

              <div className="text-center py-8">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Vista previa del chat
                </h3>
                <p className="text-gray-500 mb-4">
                  Para ver la conversación completa, usa el botón "Ver Chat"
                </p>
                <button
                  onClick={() => {
                    window.open(`/chat/${selectedChat._id}`, '_blank');
                  }}
                  className="px-6 py-3 bg-[#FFC300] text-gray-900 rounded-lg font-medium hover:bg-[#E6B800]"
                >
                  Ver Chat Completo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreManagerMessages;
