import { useState, useCallback } from 'react';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  type: NotificationType;
  message: string;
  show: boolean;
  id?: string;
}

export const useNotification = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback((type: NotificationType, message: string, duration: number = 5000) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      type,
      message,
      show: true,
      id
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-hide after duration
    if (duration > 0) {
      setTimeout(() => {
        hideNotification(id);
      }, duration);
    }

    return id;
  }, []);

  const hideNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const hideAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const showSuccess = useCallback((message: string, duration?: number) => {
    return showNotification('success', message, duration);
  }, [showNotification]);

  const showError = useCallback((message: string, duration?: number) => {
    return showNotification('error', message, duration);
  }, [showNotification]);

  const showInfo = useCallback((message: string, duration?: number) => {
    return showNotification('info', message, duration);
  }, [showNotification]);

  const showWarning = useCallback((message: string, duration?: number) => {
    return showNotification('warning', message, duration);
  }, [showNotification]);

  return {
    notifications,
    showNotification,
    hideNotification,
    hideAllNotifications,
    showSuccess,
    showError,
    showInfo,
    showWarning
  };
};
