import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export interface NotificationProps {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  show: boolean;
  onClose: () => void;
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

const Notification: React.FC<NotificationProps> = ({
  type,
  message,
  show,
  onClose,
  duration = 5000,
  position = 'top-right'
}) => {
  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show) return null;

  const getIcon = () => {
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

  const getStyles = () => {
    const baseStyles = 'fixed z-50 p-4 rounded-lg shadow-lg max-w-sm transition-all duration-300 ease-in-out';
    
    const typeStyles = {
      success: 'bg-green-500 text-white border border-green-400',
      error: 'bg-red-500 text-white border border-red-400',
      warning: 'bg-yellow-500 text-yellow-900 border border-yellow-400',
      info: 'bg-blue-500 text-white border border-blue-400'
    };

    const positionStyles = {
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4',
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
      'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
    };

    return `${baseStyles} ${typeStyles[type]} ${positionStyles[position]}`;
  };

  return (
    <div className={getStyles()}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-5">{message}</p>
        </div>
        <div className="flex-shrink-0">
          <button
            onClick={onClose}
            className="inline-flex text-current hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent rounded-md transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Notification;
