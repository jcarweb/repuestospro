import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Check, 
  Archive, 
  Filter, 
  Search, 
  Trash2, 
  Settings,
  ExternalLink,
  RefreshCw,
  Plus
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  notificationService, 
  Notification, 
  NotificationFilters,
  NotificationStats 
} from '../services/notificationService';

const ClientNotifications: React.FC = () => {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [filters, setFilters] = useState<NotificationFilters>({
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Cargar notificaciones
  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getNotifications(filters);
      setNotifications(response.data.notifications);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar estadísticas
  const loadStats = async () => {
    try {
      const response = await notificationService.getNotificationStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error loading notification stats:', error);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    loadNotifications();
    loadStats();
  }, [filters]);

  // Aplicar filtros de búsqueda
  const applySearch = () => {
    setFilters(prev => ({
      ...prev,
      page: 1
    }));
  };

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 20
    });
    setSearchQuery('');
  };

  // Marcar notificación como leída
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, isRead: true, readAt: new Date().toISOString() }
            : notification
        )
      );
      loadStats(); // Recargar estadísticas
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Marcar múltiples notificaciones como leídas
  const handleMarkMultipleAsRead = async () => {
    if (selectedNotifications.length === 0) return;
    
    try {
      await notificationService.markMultipleAsRead(selectedNotifications);
      setNotifications(prev => 
        prev.map(notification => 
          selectedNotifications.includes(notification._id)
            ? { ...notification, isRead: true, readAt: new Date().toISOString() }
            : notification
        )
      );
      setSelectedNotifications([]);
      loadStats(); // Recargar estadísticas
    } catch (error) {
      console.error('Error marking multiple notifications as read:', error);
    }
  };

  // Marcar todas como leídas
  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => 
        prev.map(notification => ({
          ...notification,
          isRead: true,
          readAt: new Date().toISOString()
        }))
      );
      loadStats(); // Recargar estadísticas
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Archivar notificación
  const handleArchive = async (notificationId: string) => {
    try {
      await notificationService.archiveNotification(notificationId);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      loadStats(); // Recargar estadísticas
    } catch (error) {
      console.error('Error archiving notification:', error);
    }
  };

  // Archivar múltiples notificaciones
  const handleArchiveMultiple = async () => {
    if (selectedNotifications.length === 0) return;
    
    try {
      await Promise.all(
        selectedNotifications.map(id => notificationService.archiveNotification(id))
      );
      setNotifications(prev => prev.filter(n => !selectedNotifications.includes(n._id)));
      setSelectedNotifications([]);
      loadStats(); // Recargar estadísticas
    } catch (error) {
      console.error('Error archiving multiple notifications:', error);
    }
  };

  // Manejar selección de notificaciones
  const handleNotificationSelect = (notificationId: string) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  // Seleccionar todas las notificaciones
  const handleSelectAll = () => {
    if (selectedNotifications.length === notifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(notifications.map(n => n._id));
    }
  };

  // Manejar clic en notificación
  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await handleMarkAsRead(notification._id);
    }

    if (notification.data?.url) {
      navigate(notification.data.url);
    } else if (notification.data?.actionUrl) {
      navigate(notification.data.actionUrl);
    }
  };

  // Crear notificación de prueba
  const handleCreateTestNotification = async () => {
    try {
      await notificationService.createTestNotification({
        type: 'info',
        category: 'system',
        priority: 'medium'
      });
      loadNotifications();
      loadStats();
    } catch (error) {
      console.error('Error creating test notification:', error);
    }
  };

  // Filtrar notificaciones por búsqueda
  const filteredNotifications = notifications.filter(notification =>
    notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    notification.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('notifications.title')}
          </h1>
          <p className={`text-lg mt-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {t('notifications.description')}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleCreateTestNotification}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Prueba</span>
          </button>
          
          <button
            onClick={() => {
              loadNotifications();
              loadStats();
            }}
            className="p-2 text-gray-600 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className={`p-6 rounded-lg border ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center">
              <Bell className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total
                </p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stats.total}
                </p>
              </div>
            </div>
          </div>
          
          <div className={`p-6 rounded-lg border ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-sm font-bold">{stats.unread}</span>
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  No leídas
                </p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stats.unread}
                </p>
              </div>
            </div>
          </div>
          
          <div className={`p-6 rounded-lg border ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-sm font-bold">{stats.read}</span>
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Leídas
                </p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stats.read}
                </p>
              </div>
            </div>
          </div>
          
          <div className={`p-6 rounded-lg border ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center">
              <Settings className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Categorías
                </p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stats.byCategory.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros y búsqueda */}
      <div className={`p-6 rounded-lg border mb-6 ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Filtros y Búsqueda
          </h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg"
          >
            <Filter className="w-4 h-4" />
            <span>Filtros</span>
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar notificaciones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <button
            onClick={applySearch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Buscar
          </button>
          
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Limpiar
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={filters.category || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value || undefined }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            >
              <option value="">Todas las categorías</option>
              <option value="order">Pedidos</option>
              <option value="delivery">Entrega</option>
              <option value="promotion">Promociones</option>
              <option value="security">Seguridad</option>
              <option value="system">Sistema</option>
              <option value="marketing">Marketing</option>
            </select>
            
            <select
              value={filters.isRead === undefined ? '' : filters.isRead.toString()}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                isRead: e.target.value === '' ? undefined : e.target.value === 'true'
              }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            >
              <option value="">Todas las notificaciones</option>
              <option value="false">No leídas</option>
              <option value="true">Leídas</option>
            </select>
            
            <select
              value={filters.limit || 20}
              onChange={(e) => setFilters(prev => ({ ...prev, limit: Number(e.target.value) }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            >
              <option value={10}>10 por página</option>
              <option value={20}>20 por página</option>
              <option value={50}>50 por página</option>
            </select>
          </div>
        )}
      </div>

      {/* Acciones masivas */}
      {selectedNotifications.length > 0 && (
        <div className={`p-4 rounded-lg border mb-6 ${
          isDark ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-sm font-medium ${
              isDark ? 'text-blue-300' : 'text-blue-700'
            }`}>
              {selectedNotifications.length} notificación{selectedNotifications.length > 1 ? 'es' : ''} seleccionada{selectedNotifications.length > 1 ? 's' : ''}
            </span>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleMarkMultipleAsRead}
                className="flex items-center space-x-1 px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
              >
                <Check className="w-3 h-3" />
                <span>Marcar como leídas</span>
              </button>
              
              <button
                onClick={handleArchiveMultiple}
                className="flex items-center space-x-1 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                <Archive className="w-3 h-3" />
                <span>Archivar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de notificaciones */}
      <div className={`rounded-lg border ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        {/* Header de la tabla */}
        <div className={`p-4 border-b ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <input
                type="checkbox"
                checked={selectedNotifications.length === notifications.length && notifications.length > 0}
                onChange={handleSelectAll}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              
              <span className={`text-sm font-medium ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {notifications.length} notificación{notifications.length !== 1 ? 'es' : ''}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                <Check className="w-3 h-3" />
                <span>Marcar todas como leídas</span>
              </button>
            </div>
          </div>
        </div>

        {/* Contenido */}
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className={`flex flex-col items-center justify-center p-12 text-center ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <Bell className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No hay notificaciones</p>
            <p className="text-sm">No se encontraron notificaciones con los filtros aplicados.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredNotifications.map((notification) => (
              <div
                key={notification._id}
                className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                <div className="flex items-start space-x-4">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedNotifications.includes(notification._id)}
                    onChange={() => handleNotificationSelect(notification._id)}
                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  
                  {/* Icono */}
                  <div className="flex-shrink-0">
                    <span className="text-2xl">
                      {notificationService.getNotificationIcon(notification.type)}
                    </span>
                  </div>
                  
                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className={`text-lg font-semibold ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}>
                            {notification.title}
                          </h4>
                          
                          {!notification.isRead && (
                            <span className="px-2 py-1 text-xs font-medium text-white bg-red-500 rounded-full">
                              Nueva
                            </span>
                          )}
                        </div>
                        
                        <p className={`text-base mb-3 ${
                          isDark ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          {notification.message}
                        </p>
                        
                        {/* Badges */}
                        <div className="flex items-center space-x-2 mb-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            notificationService.getNotificationColor(notification.type)
                          }`}>
                            {notification.type}
                          </span>
                          
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            notificationService.getPriorityColor(notification.priority)
                          }`}>
                            {notification.priority}
                          </span>
                          
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                          }`}>
                            {notification.category}
                          </span>
                        </div>
                        
                        {/* Fecha */}
                        <p className={`text-sm ${
                          isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {notificationService.formatNotificationDate(notification.createdAt)}
                        </p>
                      </div>
                      
                      {/* Acciones */}
                      <div className="flex items-center space-x-2 ml-4">
                        {notificationService.hasAction(notification) && (
                          <button
                            onClick={() => handleNotificationClick(notification)}
                            className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>{notificationService.getActionText(notification)}</span>
                          </button>
                        )}
                        
                        {!notification.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(notification._id)}
                            className="p-2 text-green-600 hover:text-green-700 hover:bg-green-100 dark:hover:bg-green-900/20 rounded"
                            title="Marcar como leída"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleArchive(notification._id)}
                          className="p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          title="Archivar"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Paginación */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className={`text-sm ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Mostrando {((pagination.page - 1) * pagination.limit) + 1} a {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} notificaciones
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, prev.page! - 1) }))}
              disabled={pagination.page === 1}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            
            <span className={`px-3 py-2 text-sm ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Página {pagination.page} de {pagination.pages}
            </span>
            
            <button
              onClick={() => setFilters(prev => ({ ...prev, page: Math.min(pagination.pages, prev.page! + 1) }))}
              disabled={pagination.page === pagination.pages}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientNotifications;
