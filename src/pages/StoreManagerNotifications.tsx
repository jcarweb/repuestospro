import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  Package, 
  CheckCircle,
  XCircle,
  Filter,
  Search,
  RefreshCw
} from 'lucide-react';
import { API_BASE_URL } from '../config/api';

interface Notification {
  _id: string;
  product: {
    _id: string;
    name: string;
    sku: string;
    category: string;
    brand: string;
  };
  store: {
    _id: string;
    name: string;
    city: string;
  };
  type: 'low_stock' | 'out_of_stock' | 'custom';
  title: string;
  message: string;
  currentStock: number;
  threshold: number;
  isRead: boolean;
  isSent: boolean;
  createdAt: string;
  readAt?: string;
}

const StoreManagerNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [stores, setStores] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterRead, setFilterRead] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUserStores();
  }, []);

  useEffect(() => {
    if (selectedStore) {
      fetchNotifications();
    }
  }, [selectedStore]);

  const fetchUserStores = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/stores/user-stores`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        let storesArray = [];
        if (Array.isArray(data.data)) {
          storesArray = data.data;
        } else if (data.data && Array.isArray(data.data.stores)) {
          storesArray = data.data.stores;
        }
        setStores(storesArray);
        if (storesArray.length > 0) {
          setSelectedStore(storesArray[0]._id);
        }
      }
    } catch (error) {
      console.error('Error fetching user stores:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (selectedStore) params.append('storeId', selectedStore);
      if (filterType !== 'all') params.append('type', filterType);
      if (filterRead !== 'all') params.append('isRead', filterRead);

      const response = await fetch(`${API_BASE_URL}/api/inventory-alerts/notifications?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setNotifications(data.data.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/inventory-alerts/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        fetchNotifications();
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      for (const notification of unreadNotifications) {
        await markAsRead(notification._id);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case 'low_stock': return 'Stock Bajo';
      case 'out_of_stock': return 'Sin Stock';
      case 'custom': return 'Personalizada';
      default: return type;
    }
  };

  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case 'low_stock': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200';
      case 'out_of_stock': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200';
      case 'custom': return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'low_stock': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'out_of_stock': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'custom': return <Bell className="w-5 h-5 text-blue-600" />;
      default: return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesRead = filterRead === 'all' || 
                       (filterRead === 'read' && notification.isRead) ||
                       (filterRead === 'unread' && !notification.isRead);
    const matchesSearch = notification.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesRead && matchesSearch;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (!Array.isArray(stores) || stores.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
              No tienes tiendas asignadas
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Contacta al administrador para que te asigne una tienda.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Bell className="w-8 h-8 text-blue-600" />
                Notificaciones de Inventario
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-sm px-2 py-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Alertas y notificaciones sobre el estado de tu inventario
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchNotifications}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Actualizar
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Marcar todas como leídas
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tienda
              </label>
              <select
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                {Array.isArray(stores) && stores.map(store => (
                  <option key={store._id} value={store._id}>{store.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">Todos</option>
                <option value="low_stock">Stock Bajo</option>
                <option value="out_of_stock">Sin Stock</option>
                <option value="custom">Personalizada</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Estado
              </label>
              <select
                value={filterRead}
                onChange={(e) => setFilterRead(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">Todos</option>
                <option value="unread">No leídas</option>
                <option value="read">Leídas</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Buscar
              </label>
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar notificaciones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchNotifications}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Filter className="w-4 h-4" />
                Filtrar
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Notificaciones */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Cargando notificaciones...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
              <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No hay notificaciones
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                No se encontraron notificaciones con los filtros aplicados
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification._id}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border-l-4 ${
                  notification.isRead 
                    ? 'border-gray-300 dark:border-gray-600' 
                    : 'border-blue-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className={`text-lg font-medium ${
                          notification.isRead 
                            ? 'text-gray-900 dark:text-white' 
                            : 'text-gray-900 dark:text-white font-semibold'
                        }`}>
                          {notification.title}
                        </h3>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getNotificationTypeColor(notification.type)}`}>
                          {getNotificationTypeLabel(notification.type)}
                        </span>
                        {!notification.isRead && (
                          <span className="inline-flex w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-3">
                        {notification.message}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Package className="w-4 h-4" />
                          <span>{notification.product.name} ({notification.product.sku})</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>Stock actual: <strong>{notification.currentStock}</strong></span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>Umbral: <strong>{notification.threshold}</strong></span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>{new Date(notification.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification._id)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                      >
                        Marcar como leída
                      </button>
                    )}
                    {notification.isRead && (
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Leída
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StoreManagerNotifications;
