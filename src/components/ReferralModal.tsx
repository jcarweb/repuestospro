import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle, Users, Gift } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';
import { useAuth } from '../contexts/AuthContext';

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReferralApplied?: (referrerName: string, pointsEarned: number) => void;
}

const ReferralModal: React.FC<ReferralModalProps> = ({
  isOpen,
  onClose,
  onReferralApplied
}) => {
  const { token } = useAuth();
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [referrerInfo, setReferrerInfo] = useState<{ name: string; email: string } | null>(null);

  const handleVerifyCode = async () => {
    if (!referralCode.trim()) {
      setMessage({ type: 'error', text: 'Por favor ingresa un código de referido' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('API_BASE_URL/loyalty/verify-referral', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code: referralCode.toUpperCase() })
      });

      const result = await response.json();

      if (result.success) {
        setReferrerInfo(result.data);
        setMessage({ 
          type: 'success', 
          text: `¡Código válido! Te registraste con ${result.data.referrerName}` 
        });
      } else {
        setMessage({ type: 'error', text: result.message || 'Código de referido inválido' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyReferral = async () => {
    if (!referrerInfo) return;

    setLoading(true);
    try {
      // Aquí se procesaría el referido en el backend
      // Por ahora simulamos el éxito
      setTimeout(() => {
        setMessage({ 
          type: 'success', 
          text: '¡Referido aplicado exitosamente! Ganaste 200 puntos de bienvenida.' 
        });
        onReferralApplied?.(referrerInfo.name, 200);
        
        // Cerrar modal después de 2 segundos
        setTimeout(() => {
          onClose();
          setReferralCode('');
          setReferrerInfo(null);
          setMessage(null);
        }, 2000);
      }, 1000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error aplicando el referido' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Usar Código de Referido
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Información del Referido */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Users className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="font-semibold text-blue-900">¿Tienes un código de referido?</h3>
              <p className="text-sm text-blue-700">
                Ingresa el código de un amigo y ambos ganarán puntos
              </p>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Código de Referido
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                placeholder="Ej: ABC12345"
                maxLength={8}
              />
              <button
                onClick={handleVerifyCode}
                disabled={loading || !referralCode.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Verificando...' : 'Verificar'}
              </button>
            </div>
          </div>

          {/* Mensaje de estado */}
          {message && (
            <div className={`p-3 rounded-lg flex items-center space-x-2 ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : message.type === 'error'
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* Información del Referidor */}
          {referrerInfo && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-3 mb-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <h3 className="font-semibold text-green-900">Código Verificado</h3>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-green-700">
                  <span className="font-medium">Referidor:</span> {referrerInfo.referrerName}
                </p>
                <p className="text-sm text-green-700">
                  <span className="font-medium">Email:</span> {referrerInfo.referrerEmail}
                </p>
                <div className="flex items-center space-x-2 mt-3">
                  <Gift className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">
                    Ganarás 200 puntos de bienvenida
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Beneficios */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Beneficios del Referido</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">200 puntos de bienvenida</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Acceso inmediato al programa de fidelización</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Tu referidor gana 500 puntos</span>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex space-x-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          {referrerInfo && (
            <button
              onClick={handleApplyReferral}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Aplicando...' : 'Aplicar Referido'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReferralModal; 