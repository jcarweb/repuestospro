import React from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { Notification } from '../hooks/useNotification';

interface NotificationContainerProps {
  notifications: Notification[];
  onClose: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  maxNotifications?: number;
}

const NotificationContainer: React.FC<NotificationContainerProps> = ({
  notifications,
  onClose,
  position = 'top-right',
  maxNotifications = 5
}) => {
  const getPositionStyles = () => {
    const positionStyles = {
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4',
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
      'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
    };

    return positionStyles[position];
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getTypeStyles = (type: string) => {
    const typeStyles = {
      success: 'bg-green-500 text-white border border-green-400',
      error: 'bg-red-500 text-white border border-red-400',
      warning: 'bg-yellow-500 text-yellow-900 border border-yellow-400',
      info: 'bg-blue-500 text-white border border-blue-400'
    };

    return typeStyles[type as keyof typeof typeStyles] || typeStyles.info;
  };

  // Limitar el número de notificaciones mostradas
  const visibleNotifications = notifications.slice(0, maxNotifications);

  if (visibleNotifications.length === 0) return null;

  return (
    <div className={`fixed z-50 ${getPositionStyles()} space-y-2`}>
      {visibleNotifications.map((notification, index) => (
        <div
          key={notification.id}
          className={`p-4 rounded-lg shadow-lg max-w-sm transition-all duration-300 ease-in-out transform ${
            notification.show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
          } ${getTypeStyles(notification.type)}`}
          style={{
            animationDelay: `${index * 100}ms`
          }}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {getIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium leading-5">{notification.message}</p>
            </div>
            <div className="flex-shrink-0">
              <button
                onClick={() => onClose(notification.id!)}
                className="inline-flex text-current hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent rounded-md transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationContainer;
