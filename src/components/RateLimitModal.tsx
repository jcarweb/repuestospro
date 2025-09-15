import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface RateLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  retryAfter?: number; // segundos
}

const RateLimitModal: React.FC<RateLimitModalProps> = ({ isOpen, onClose, retryAfter }) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds} segundos`;
    }
    const minutes = Math.ceil(seconds / 60);
    return `${minutes} minuto${minutes > 1 ? 's' : ''}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
            <svg
              className="h-6 w-6 text-yellow-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Demasiadas solicitudes
          </h3>
          
          <p className="text-sm text-gray-500 mb-4">
            {retryAfter 
              ? `Por favor, espera ${formatTime(retryAfter)} antes de intentar de nuevo.`
              : 'Por favor, espera un momento antes de intentar de nuevo.'
            }
          </p>
          
          <div className="flex justify-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RateLimitModal;
