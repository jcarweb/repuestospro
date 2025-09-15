import api from '../config/api';

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'promotion' | 'order' | 'delivery' | 'system';
  category: 'order' | 'delivery' | 'promotion' | 'security' | 'system' | 'marketing';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  isArchived: boolean;
  readAt?: string;
  archivedAt?: string;
  data?: {
    orderId?: string;
    deliveryId?: string;
    productId?: string;
    promotionId?: string;
    url?: string;
    actionUrl?: string;
    actionText?: string;
    imageUrl?: string;
    [key: string]: any;
  };
  delivery: {
    push: boolean;
    email: boolean;
    sms: boolean;
    inApp: boolean;
    pushSent?: boolean;
    emailSent?: boolean;
    smsSent?: boolean;
  };
  metadata: {
    source: string;
    trigger: string;
    ipAddress?: string;
    userAgent?: string;
  };
  scheduledFor?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  read: number;
  byCategory: Array<{
    _id: string;
    total: number;
    unread: number;
  }>;
  byType: Array<{
    _id: string;
    total: number;
    unread: number;
  }>;
  byPriority: Array<{
    _id: string;
    total: number;
    unread: number;
  }>;
}

export interface NotificationFilters {
  page?: number;
  limit?: number;
  category?: string;
  isRead?: boolean;
}

export interface NotificationResponse {
  success: boolean;
  data: {
    notifications: Notification[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
    unreadCount: number;
  };
}

export interface UnreadNotificationsResponse {
  success: boolean;
  data: {
    notifications: Notification[];
    unreadCount: number;
  };
}

class NotificationService {
  // Obtener notificaciones del usuario
  async getNotifications(filters: NotificationFilters = {}): Promise<NotificationResponse> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.category) params.append('category', filters.category);
    if (filters.isRead !== undefined) params.append('isRead', filters.isRead.toString());

    const response = await api.get(`/client/notifications?${params.toString()}`);
    return response.data;
  }

  // Obtener notificaciones no leídas (para el header)
  async getUnreadNotifications(limit: number = 10): Promise<UnreadNotificationsResponse> {
    const response = await api.get(`/client/notifications/unread?limit=${limit}`);
    return response.data;
  }

  // Obtener estadísticas de notificaciones
  async getNotificationStats(): Promise<{ success: boolean; data: NotificationStats }> {
    const response = await api.get('/client/notifications/stats');
    return response.data;
  }

  // Marcar notificación como leída
  async markAsRead(notificationId: string): Promise<{ success: boolean; data: { notification: Notification; unreadCount: number } }> {
    const response = await api.patch(`/client/notifications/${notificationId}/read`);
    return response.data;
  }

  // Marcar múltiples notificaciones como leídas
  async markMultipleAsRead(notificationIds: string[]): Promise<{ success: boolean; data: { unreadCount: number } }> {
    const response = await api.patch('/client/notifications/mark-multiple-read', {
      notificationIds
    });
    return response.data;
  }

  // Marcar todas las notificaciones como leídas
  async markAllAsRead(): Promise<{ success: boolean; data: { unreadCount: number } }> {
    const response = await api.patch('/client/notifications/mark-all-read');
    return response.data;
  }

  // Archivar notificación
  async archiveNotification(notificationId: string): Promise<{ success: boolean; data: { notification: Notification } }> {
    const response = await api.patch(`/client/notifications/${notificationId}/archive`);
    return response.data;
  }

  // Crear notificación de prueba (solo para desarrollo)
  async createTestNotification(data: {
    type?: Notification['type'];
    category?: Notification['category'];
    priority?: Notification['priority'];
  } = {}): Promise<{ success: boolean; data: { notification: Notification } }> {
    const response = await api.post('/client/notifications/test', data);
    return response.data;
  }

  // Obtener icono para el tipo de notificación
  getNotificationIcon(type: Notification['type']): string {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      case 'promotion':
        return '🎉';
      case 'order':
        return '📦';
      case 'delivery':
        return '🚚';
      case 'system':
        return '⚙️';
      default:
        return 'ℹ️';
    }
  }

  // Obtener color para el tipo de notificación
  getNotificationColor(type: Notification['type']): string {
    switch (type) {
      case 'success':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'error':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'promotion':
        return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20';
      case 'order':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'delivery':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      case 'system':
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  }

  // Obtener color para la prioridad
  getPriorityColor(priority: Notification['priority']): string {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'high':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'low':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  }

  // Formatear fecha de notificación
  formatNotificationDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) {
      return 'Ahora mismo';
    } else if (diffInMinutes < 60) {
      return `Hace ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
    } else if (diffInMinutes < 10080) {
      const days = Math.floor(diffInMinutes / 1440);
      return `Hace ${days} día${days > 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
  }

  // Verificar si la notificación tiene acción
  hasAction(notification: Notification): boolean {
    return !!(notification.data?.actionUrl && notification.data?.actionText);
  }

  // Obtener texto de acción
  getActionText(notification: Notification): string {
    return notification.data?.actionText || 'Ver más';
  }

  // Obtener URL de acción
  getActionUrl(notification: Notification): string {
    return notification.data?.actionUrl || notification.data?.url || '#';
  }
}

export const notificationService = new NotificationService();
export default notificationService;
