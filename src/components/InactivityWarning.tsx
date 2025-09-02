import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock } from 'lucide-react';

interface InactivityWarningProps {
  isVisible: boolean;
  timeRemaining: number;
  onExtend: () => void;
  onLogout: () => void;
}

const InactivityWarning: React.FC<InactivityWarningProps> = ({
  isVisible,
  timeRemaining,
  onExtend,
  onLogout
}) => {
  const [countdown, setCountdown] = useState(timeRemaining);

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1000) {
          onLogout();
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible, onLogout]);

  useEffect(() => {
    setCountdown(timeRemaining);
  }, [timeRemaining]);

  if (!isVisible) return null;

  const minutes = Math.floor(countdown / 60000);
  const seconds = Math.floor((countdown % 60000) / 1000);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center mb-4">
          <AlertTriangle className="h-8 w-8 text-yellow-500 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900">
            Sesión por expirar
          </h3>
        </div>
        
        <p className="text-gray-600 mb-4">
          Tu sesión expirará en breve por inactividad. ¿Deseas continuar con tu sesión activa?
        </p>
        
        <div className="flex items-center justify-center mb-6">
          <Clock className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-lg font-mono text-red-600">
            {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
          </span>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={onExtend}
            className="flex-1 bg-[#FFC300] hover:bg-[#E6B800] text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Continuar sesión
          </button>
          <button
            onClick={onLogout}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default InactivityWarning;
