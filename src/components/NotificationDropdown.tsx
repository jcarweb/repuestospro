import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X, Check, Archive, Settings, ExternalLink } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { notificationService, Notification } from '../services/notificationService';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onNotificationCountChange: (count: number) => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
  onNotificationCountChange
}) => {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

  // Cargar notificaciones no leídas
  const loadUnreadNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getUnreadNotifications(10);
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unreadCount);
      onNotificationCountChange(response.data.unreadCount);
    } catch (error) {
      console.error('Error loading unread notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar notificaciones cuando se abre el dropdown
  useEffect(() => {
    if (isOpen) {
      loadUnreadNotifications();
    }
  }, [isOpen]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Marcar notificación como leída
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const response = await notificationService.markAsRead(notificationId);
      setUnreadCount(response.data.unreadCount);
      onNotificationCountChange(response.data.unreadCount);
      
      // Actualizar la notificación en la lista
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, isRead: true, readAt: new Date().toISOString() }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Marcar múltiples notificaciones como leídas
  const handleMarkMultipleAsRead = async () => {
    if (selectedNotifications.length === 0) return;
    
    try {
      const response = await notificationService.markMultipleAsRead(selectedNotifications);
      setUnreadCount(response.data.unreadCount);
      onNotificationCountChange(response.data.unreadCount);
      
      // Actualizar las notificaciones en la lista
      setNotifications(prev => 
        prev.map(notification => 
          selectedNotifications.includes(notification._id)
            ? { ...notification, isRead: true, readAt: new Date().toISOString() }
            : notification
        )
      );
      
      setSelectedNotifications([]);
    } catch (error) {
      console.error('Error marking multiple notifications as read:', error);
    }
  };

  // Marcar todas como leídas
  const handleMarkAllAsRead = async () => {
    try {
      const response = await notificationService.markAllAsRead();
      setUnreadCount(response.data.unreadCount);
      onNotificationCountChange(response.data.unreadCount);
      
      // Marcar todas las notificaciones como leídas
      setNotifications(prev => 
        prev.map(notification => ({
          ...notification,
          isRead: true,
          readAt: new Date().toISOString()
        }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Archivar notificación
  const handleArchive = async (notificationId: string) => {
    try {
      await notificationService.archiveNotification(notificationId);
      
      // Remover la notificación de la lista
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      
      // Actualizar conteo si no estaba leída
      const notification = notifications.find(n => n._id === notificationId);
      if (notification && !notification.isRead) {
        const newCount = Math.max(0, unreadCount - 1);
        setUnreadCount(newCount);
        onNotificationCountChange(newCount);
      }
    } catch (error) {
      console.error('Error archiving notification:', error);
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

  // Manejar clic en notificación
  const handleNotificationClick = async (notification: Notification) => {
    // Marcar como leída si no lo está
    if (!notification.isRead) {
      await handleMarkAsRead(notification._id);
    }

    // Navegar si tiene URL
    if (notification.data?.url) {
      navigate(notification.data.url);
      onClose();
    } else if (notification.data?.actionUrl) {
      navigate(notification.data.actionUrl);
      onClose();
    }
  };

  // Manejar acción de notificación
  const handleNotificationAction = (notification: Notification) => {
    if (notification.data?.actionUrl) {
      navigate(notification.data.actionUrl);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end pt-16">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-25"
        onClick={onClose}
      />
      
      {/* Dropdown */}
      <div
        ref={dropdownRef}
        className={`relative w-96 max-h-96 overflow-hidden rounded-lg shadow-xl border ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-blue-600" />
            <h3 className={`font-semibold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {t('notifications.title')}
            </h3>
            {unreadCount > 0 && (
              <span className="px-2 py-1 text-xs font-medium text-white bg-red-500 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {selectedNotifications.length > 0 && (
              <button
                onClick={handleMarkMultipleAsRead}
                className="p-1 text-green-600 hover:text-green-700"
                title={t('notifications.markSelectedAsRead')}
              >
                <Check className="w-4 h-4" />
              </button>
            )}
            
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="p-1 text-blue-600 hover:text-blue-700"
                title={t('notifications.markAllAsRead')}
              >
                <Check className="w-4 h-4" />
              </button>
            )}
            
            <button
              onClick={() => navigate('/notifications')}
              className="p-1 text-gray-600 hover:text-gray-700"
              title={t('notifications.viewAll')}
            >
              <Settings className="w-4 h-4" />
            </button>
            
            <button
              onClick={onClose}
              className="p-1 text-gray-600 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className={`flex flex-col items-center justify-center p-8 text-center ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <Bell className="w-12 h-12 mb-4 opacity-50" />
              <p className="text-sm">{t('notifications.noNotifications')}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Checkbox para selección múltiple */}
                    <input
                      type="checkbox"
                      checked={selectedNotifications.includes(notification._id)}
                      onChange={() => handleNotificationSelect(notification._id)}
                      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    
                    {/* Icono de tipo */}
                    <div className="flex-shrink-0">
                      <span className="text-lg">
                        {notificationService.getNotificationIcon(notification.type)}
                      </span>
                    </div>
                    
                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className={`text-sm font-medium ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}>
                            {notification.title}
                          </h4>
                          <p className={`text-sm mt-1 ${
                            isDark ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            {notification.message}
                          </p>
                          
                          {/* Badges */}
                          <div className="flex items-center space-x-2 mt-2">
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
                          </div>
                          
                          {/* Fecha */}
                          <p className={`text-xs mt-2 ${
                            isDark ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {notificationService.formatNotificationDate(notification.createdAt)}
                          </p>
                        </div>
                        
                        {/* Acciones */}
                        <div className="flex items-center space-x-1 ml-2">
                          {notificationService.hasAction(notification) && (
                            <button
                              onClick={() => handleNotificationAction(notification)}
                              className="p-1 text-blue-600 hover:text-blue-700"
                              title={notificationService.getActionText(notification)}
                            >
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          )}
                          
                          {!notification.isRead && (
                            <button
                              onClick={() => handleMarkAsRead(notification._id)}
                              className="p-1 text-green-600 hover:text-green-700"
                              title={t('notifications.markAsRead')}
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleArchive(notification._id)}
                            className="p-1 text-gray-600 hover:text-gray-700"
                            title={t('notifications.archive')}
                          >
                            <Archive className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Click handler para toda la notificación */}
                  <div
                    className="absolute inset-0 cursor-pointer"
                    onClick={() => handleNotificationClick(notification)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className={`p-3 border-t ${
            isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
          }`}>
            <button
              onClick={() => navigate('/notifications')}
              className={`w-full text-sm font-medium ${
                isDark 
                  ? 'text-blue-400 hover:text-blue-300' 
                  : 'text-blue-600 hover:text-blue-700'
              }`}
            >
              {t('notifications.viewAll')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;
