import React, { useState, useEffect } from 'react';
import { X, Fingerprint, CheckCircle, AlertCircle, Smartphone } from 'lucide-react';

interface FingerprintSetupProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
  token: string;
}

const FingerprintSetup: React.FC<FingerprintSetupProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  userId, 
  token 
}) => {
  const [step, setStep] = useState<'check' | 'setup' | 'success' | 'error'>('check');
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fingerprintData, setFingerprintData] = useState('');

  useEffect(() => {
    if (isOpen) {
      checkFingerprintSupport();
    }
  }, [isOpen]);

  const checkFingerprintSupport = async () => {
    try {
      // Verificar si el navegador soporta WebAuthn
      if (!window.PublicKeyCredential) {
        setIsSupported(false);
        setStep('error');
        setError('Tu navegador no soporta autenticación biométrica');
        return;
      }

      // Verificar si el dispositivo tiene sensor de huella
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      setIsSupported(available);
      
      if (available) {
        setStep('setup');
      } else {
        setStep('error');
        setError('Tu dispositivo no tiene sensor de huella digital o no está configurado');
      }
    } catch (error) {
      setIsSupported(false);
      setStep('error');
      setError('Error verificando soporte de huella digital');
    }
  };

  const setupFingerprint = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Simular captura de huella digital
      // En un entorno real, aquí se usaría la WebAuthn API
      const mockFingerprintData = `fingerprint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Enviar al backend
      const response = await fetch('http://localhost:5000/api/auth/setup-fingerprint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fingerprintData: mockFingerprintData
        })
      });

      const result = await response.json();

      if (result.success) {
        setFingerprintData(mockFingerprintData);
        setStep('success');
      } else {
        setError(result.message || 'Error configurando huella digital');
      }
    } catch (error) {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFingerprintAuth = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Simular autenticación con huella
      // En un entorno real, aquí se verificaría la huella
      const response = await fetch('http://localhost:5000/api/auth/login/fingerprint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fingerprintData: fingerprintData
        })
      });

      const result = await response.json();

      if (result.success) {
        onSuccess();
      } else {
        setError(result.message || 'Error en autenticación con huella');
      }
    } catch (error) {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {step === 'check' && 'Verificando huella digital'}
            {step === 'setup' && 'Configurar huella digital'}
            {step === 'success' && 'Huella configurada'}
            {step === 'error' && 'Error de configuración'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {step === 'check' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Verificando soporte de huella digital...</p>
          </div>
        )}

        {step === 'setup' && (
          <div className="space-y-6">
            <div className="text-center">
              <Smartphone className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Configurar huella digital
              </h3>
              <p className="text-gray-600 mb-4">
                Para usar la autenticación con huella digital, primero debes configurarla en tu dispositivo.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Instrucciones:</h4>
              <ol className="text-sm text-blue-800 space-y-1">
                <li>1. Asegúrate de estar en un dispositivo móvil</li>
                <li>2. Ve a Configuración → Seguridad → Huella digital</li>
                <li>3. Agrega tu huella digital</li>
                <li>4. Regresa aquí y haz clic en "Configurar"</li>
              </ol>
            </div>

            <button
              onClick={setupFingerprint}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Configurando...
                </>
              ) : (
                <>
                  <Fingerprint size={20} className="mr-2" />
                  Configurar huella digital
                </>
              )}
            </button>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center space-y-4">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
            <h3 className="text-lg font-semibold text-gray-900">
              ¡Huella digital configurada!
            </h3>
            <p className="text-gray-600">
              Ahora puedes usar tu huella digital para iniciar sesión de forma rápida y segura.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 text-sm">
                <strong>Nota:</strong> Esta función solo funciona en dispositivos móviles con sensor de huella digital.
              </p>
            </div>
            <button
              onClick={onSuccess}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
            >
              Continuar
            </button>
          </div>
        )}

        {step === 'error' && (
          <div className="text-center space-y-4">
            <AlertCircle className="w-16 h-16 text-red-600 mx-auto" />
            <h3 className="text-lg font-semibold text-gray-900">
              No se puede configurar huella digital
            </h3>
            <p className="text-gray-600 mb-4">
              {error}
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm">
                <strong>Alternativas:</strong> Puedes usar tu contraseña, PIN o Google para iniciar sesión.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Entendido
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FingerprintSetup;