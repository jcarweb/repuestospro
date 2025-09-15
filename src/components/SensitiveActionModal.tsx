import React, { useState } from 'react';
import { X, Shield, Smartphone, AlertTriangle } from 'lucide-react';
import { useTwoFactor } from '../contexts/TwoFactorContext';

interface SensitiveActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: string;
  onVerify: (code: string) => Promise<boolean>;
  isLoading: boolean;
}

const SensitiveActionModal: React.FC<SensitiveActionModalProps> = ({
  isOpen,
  onClose,
  action,
  onVerify,
  isLoading
}) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      setError('El código debe tener 6 dígitos');
      return;
    }

    try {
      setError(null);
      const isValid = await onVerify(verificationCode);
      
      if (!isValid) {
        setError('Código de verificación incorrecto');
      }
    } catch (error: any) {
      setError(error.message || 'Error al verificar código');
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setVerificationCode('');
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Shield className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Verificación Requerida</h2>
              <p className="text-sm text-gray-500">Acción sensible detectada</p>
            </div>
          </div>
          <button 
            onClick={handleClose} 
            className="text-gray-400 hover:text-gray-600"
            disabled={isLoading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Warning */}
          <div className="bg-orange-50 border border-orange-200 rounded-md p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-orange-800">
                  Acción Sensible Detectada
                </h3>
                <p className="text-sm text-orange-700 mt-1">
                  {action}
                </p>
                <p className="text-sm text-orange-700 mt-2">
                  Por seguridad, se requiere verificación de dos factores para continuar.
                </p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex items-start gap-3">
              <Smartphone className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-blue-800">
                  Instrucciones
                </h3>
                <ol className="text-sm text-blue-700 mt-2 space-y-1 list-decimal list-inside">
                  <li>Abre Google Authenticator en tu dispositivo</li>
                  <li>Busca la entrada "PiezasYA"</li>
                  <li>Ingresa el código de 6 dígitos que aparece</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                <span className="text-sm text-red-800">{error}</span>
              </div>
            </div>
          )}

          {/* Code Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Código de Verificación
            </label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="w-full px-4 py-3 text-center text-lg font-mono border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              maxLength={6}
              autoFocus
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-2">
              El código cambia cada 30 segundos
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={handleVerify}
            disabled={isLoading || verificationCode.length !== 6}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Verificando...' : 'Verificar y Continuar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SensitiveActionModal;
