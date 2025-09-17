import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config/api';
import { Fingerprint, CheckCircle, AlertCircle, Smartphone } from 'lucide-react';

interface FingerprintSetupProps {
  onFingerprintSet: () => void;
  onCancel: () => void;
}

const FingerprintSetup: React.FC<FingerprintSetupProps> = ({ onFingerprintSet, onCancel }) => {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    checkBiometricSupport();
  }, []);

  const checkBiometricSupport = async () => {
    try {
      // Verificar si el navegador soporta WebAuthn
      if (!window.PublicKeyCredential) {
        setIsSupported(false);
        setError('Tu navegador no soporta autenticación biométrica');
        return;
      }

      // Verificar si el dispositivo tiene autenticación biométrica
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      setIsSupported(available);

      if (!available) {
        setError('Tu dispositivo no tiene autenticación biométrica disponible');
      }
    } catch (error) {
      setIsSupported(false);
      setError('Error verificando soporte biométrico');
    }
  };

  const setupFingerprint = async () => {
    setLoading(true);
    setError('');

    try {
      // Generar un challenge aleatorio
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      // Crear las opciones de registro
      const publicKeyOptions: PublicKeyCredentialCreationOptions = {
        challenge,
        rp: {
          name: 'PiezasYA',
          id: window.location.hostname
        },
        user: {
          id: new Uint8Array(16),
          name: 'user@example.com',
          displayName: 'Usuario'
        },
        pubKeyCredParams: [
          {
            type: 'public-key',
            alg: -7 // ES256
          }
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required'
        },
        timeout: 60000
      };

      // Crear la credencial
      const credential = await navigator.credentials.create({
        publicKey: publicKeyOptions
      }) as PublicKeyCredential;

      if (credential) {
        // Enviar al servidor para registrar
        const response = await fetch('API_BASE_URL/auth/setup-fingerprint', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            credentialId: Array.from(new Uint8Array(credential.rawId)),
            clientDataJSON: Array.from(new Uint8Array(credential.response.clientDataJSON)),
            attestationObject: Array.from(new Uint8Array((credential.response as any).attestationObject))
          })
        });

        const result = await response.json();

        if (result.success) {
          setIsEnrolled(true);
          setTimeout(() => {
            onFingerprintSet();
          }, 2000);
        } else {
          setError(result.message || 'Error registrando huella dactilar');
        }
      }
    } catch (error: any) {
      console.error('Error setup fingerprint:', error);
      
      if (error.name === 'NotAllowedError') {
        setError('Registro cancelado por el usuario');
      } else if (error.name === 'NotSupportedError') {
        setError('Este tipo de autenticación no está soportado');
      } else if (error.name === 'InvalidStateError') {
        setError('Ya existe una credencial registrada');
      } else {
        setError('Error configurando huella dactilar. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (isSupported === null) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 w-full max-w-md mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Verificando soporte biométrico...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md mx-4">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
            <Fingerprint className="h-8 w-8 text-blue-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Configurar Huella Dactilar
          </h2>

          {!isSupported ? (
            <>
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="text-red-500 mr-2" size={20} />
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              </div>
              
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Smartphone className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-left">
                    <h4 className="font-medium text-blue-900 mb-1">Requisitos:</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Dispositivo móvil Android o iOS</li>
                      <li>• Sensor de huella dactilar</li>
                      <li>• Navegador compatible (Chrome, Safari)</li>
                      <li>• HTTPS habilitado</li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          ) : isEnrolled ? (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="text-green-500 mr-2" size={20} />
                <span className="text-green-700 text-sm">
                  ¡Huella dactilar configurada exitosamente!
                </span>
              </div>
            </div>
          ) : (
            <>
              <p className="text-gray-600 mb-6">
                Configura tu huella dactilar para acceder rápidamente a tu cuenta. 
                Esta opción solo está disponible en dispositivos móviles con sensor biométrico.
              </p>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="text-red-500 mr-2" size={20} />
                    <span className="text-red-700 text-sm">{error}</span>
                  </div>
                </div>
              )}

              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Smartphone className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-left">
                    <h4 className="font-medium text-blue-900 mb-1">Instrucciones:</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Toca el sensor de huella dactilar</li>
                      <li>• Sigue las instrucciones en pantalla</li>
                      <li>• Puedes registrar múltiples dedos</li>
                      <li>• Mantén presionado hasta completar</li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="space-y-3">
            {isSupported && !isEnrolled && (
              <button
                onClick={setupFingerprint}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Configurando...' : 'Configurar Huella Dactilar'}
              </button>
            )}
            
            <button
              onClick={onCancel}
              className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              {isEnrolled ? 'Continuar' : 'Cancelar'}
            </button>
          </div>

          <div className="mt-6 text-xs text-gray-500">
            <p className="mb-2">
              <strong>Información de seguridad:</strong>
            </p>
            <ul className="text-left space-y-1">
              <li>• Tu huella dactilar se almacena de forma segura</li>
              <li>• Solo se usa para autenticación local</li>
              <li>• Puedes desactivarla en cualquier momento</li>
              <li>• Funciona offline una vez configurada</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FingerprintSetup;