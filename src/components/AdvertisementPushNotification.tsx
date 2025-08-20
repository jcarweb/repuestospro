import React, { useState, useEffect } from 'react';
import { Bell, X, ExternalLink, Settings } from 'lucide-react';

interface AdvertisementPushNotificationProps {
  advertisement: {
    _id: string;
    title: string;
    description: string;
    navigationUrl?: string;
    imageUrl?: string;
  };
  onClose: () => void;
  onTrack: (action: 'impression' | 'click' | 'close' | 'dismiss') => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  autoClose?: number; // milliseconds
}

const AdvertisementPushNotification: React.FC<AdvertisementPushNotificationProps> = ({
  advertisement,
  onClose,
  onTrack,
  position = 'top-right',
  autoClose = 5000
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Track impression when notification appears
    onTrack('impression');
    
    // Show notification with animation
    const showTimer = setTimeout(() => setIsVisible(true), 100);
    
    // Auto close after specified time
    const closeTimer = setTimeout(() => {
      handleClose();
    }, autoClose);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(closeTimer);
    };
  }, [onTrack, autoClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onTrack('close');
      onClose();
    }, 300);
  };

  const handleClick = () => {
    onTrack('click');
    if (advertisement.navigationUrl) {
      window.open(advertisement.navigationUrl, '_blank');
    }
    handleClose();
  };

  const handleDismiss = () => {
    onTrack('dismiss');
    handleClose();
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      default:
        return 'top-4 right-4';
    }
  };

  return (
    <div className={`fixed ${getPositionClasses()} z-50 transition-all duration-300 ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
    }`}>
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 max-w-sm w-80 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4 text-[#FFC300]" />
            <span className="text-sm font-medium text-gray-700">Publicidad</span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <Settings className="w-3 h-3" />
            </button>
            <button
              onClick={handleDismiss}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-3">
          <div className="flex space-x-3">
            {advertisement.imageUrl && (
              <img
                src={advertisement.imageUrl}
                alt={advertisement.title}
                className="w-12 h-12 rounded object-cover flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm text-gray-900 mb-1 truncate">
                {advertisement.title}
              </h4>
              <p className="text-xs text-gray-600 line-clamp-2">
                {advertisement.description}
              </p>
            </div>
          </div>

          {/* Expanded content */}
          {isExpanded && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-600 mb-3">
                {advertisement.description}
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={handleClick}
                  className="flex-1 px-3 py-2 bg-[#FFC300] text-white text-xs rounded hover:bg-[#E6B000] flex items-center justify-center space-x-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Ver más</span>
                </button>
                <button
                  onClick={handleClose}
                  className="px-3 py-2 text-gray-600 text-xs border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}

          {/* Collapsed actions */}
          {!isExpanded && (
            <div className="mt-3 flex space-x-2">
              <button
                onClick={handleClick}
                className="flex-1 px-3 py-2 bg-[#FFC300] text-white text-xs rounded hover:bg-[#E6B000]"
              >
                Ver más
              </button>
              <button
                onClick={handleClose}
                className="px-3 py-2 text-gray-600 text-xs border border-gray-300 rounded hover:bg-gray-50"
              >
                Cerrar
              </button>
            </div>
          )}
        </div>

        {/* Progress bar for auto-close */}
        <div className="h-1 bg-gray-200">
          <div 
            className="h-full bg-[#FFC300] transition-all duration-100 ease-linear"
            style={{ width: '100%' }}
          />
        </div>
      </div>
    </div>
  );
};

export default AdvertisementPushNotification;
