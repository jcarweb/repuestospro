import React, { useEffect, useState } from 'react';
import { AlertCircle, X } from 'lucide-react';

interface SessionTimeoutNotificationProps {
  isVisible: boolean;
  onClose: () => void;
}

const SessionTimeoutNotification: React.FC<SessionTimeoutNotificationProps> = ({
  isVisible,
  onClose
}) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // Auto-cerrar después de 5 segundos
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
      isClosing ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'
    }`}>
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg max-w-sm">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-red-800">
              Sesión cerrada
            </h4>
            <p className="text-sm text-red-700 mt-1">
              Tu sesión ha sido cerrada por inactividad. Por favor, inicia sesión nuevamente.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="ml-3 text-red-400 hover:text-red-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionTimeoutNotification;
