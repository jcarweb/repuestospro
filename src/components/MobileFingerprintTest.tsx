import React, { useState, useEffect } from 'react';
import { Smartphone, Fingerprint, CheckCircle, AlertCircle, X } from 'lucide-react';

interface MobileFingerprintTestProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (fingerprintData: string) => void;
}

const MobileFingerprintTest: React.FC<MobileFingerprintTestProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [hasFingerprint, setHasFingerprint] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'check' | 'setup' | 'test' | 'success'>('check');

  useEffect(() => {
    if (isOpen) {
      checkDeviceCapabilities();
    }
  }, [isOpen]);

  const checkDeviceCapabilities = async () => {
    // Verificar si es dispositivo móvil
    const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsMobile(mobile);

    if (!mobile) {
      setStep('check');
      return;
    }

    // Verificar soporte de WebAuthn
    if (!window.PublicKeyCredential) {
      setStep('check');
      return;
    }

    try {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      setHasFingerprint(available);
      
      if (available) {
        setStep('setup');
      } else {
        setStep('check');
      }
    } catch (error) {
      setStep('check');
    }
  };

  const simulateFingerprintSetup = async () => {
    setIsLoading(true);
    
    // Simular proceso de configuración
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockFingerprintData = `fingerprint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    setStep('success');
    onSuccess(mockFingerprintData);
    setIsLoading(false);
  };

  const simulateFingerprintAuth = async () => {
    setIsLoading(true);
    
    // Simular autenticación
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setStep('success');
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Prueba de Huella Digital
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {step === 'check' && (
          <div className="text-center space-y-4">
            <Smartphone className="w-16 h-16 text-blue-600 mx-auto" />
            <h3 className="text-lg font-semibold text-gray-900">
              Verificando dispositivo
            </h3>
            <p className="text-gray-600 text-sm">
              {!isMobile ? (
                'Esta función solo está disponible en dispositivos móviles'
              ) : !hasFingerprint ? (
                'Tu dispositivo no tiene sensor de huella digital'
              ) : (
                'Dispositivo compatible detectado'
              )}
            </p>
            
            {!isMobile && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-yellow-800 text-xs">
                  <strong>Nota:</strong> Para probar esta función, usa un dispositivo móvil con sensor de huella digital.
                </p>
              </div>
            )}
            
            <button
              onClick={onClose}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Entendido
            </button>
          </div>
        )}

        {step === 'setup' && (
          <div className="space-y-4">
            <div className="text-center">
              <Fingerprint className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Configurar huella digital
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Simulando configuración de huella digital para pruebas
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="font-semibold text-blue-900 text-sm mb-2">Instrucciones de prueba:</h4>
              <ol className="text-xs text-blue-800 space-y-1">
                <li>1. En un dispositivo real, aquí se configuraría la huella</li>
                <li>2. Para esta demo, simularemos el proceso</li>
                <li>3. Haz clic en "Simular configuración"</li>
              </ol>
            </div>

            <button
              onClick={simulateFingerprintSetup}
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
                  Simular configuración
                </>
              )}
            </button>
          </div>
        )}

        {step === 'test' && (
          <div className="space-y-4">
            <div className="text-center">
              <Fingerprint className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Probar autenticación
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Simulando autenticación con huella digital
              </p>
            </div>

            <button
              onClick={simulateFingerprintAuth}
              disabled={isLoading}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Verificando...
                </>
              ) : (
                <>
                  <Fingerprint size={20} className="mr-2" />
                  Simular autenticación
                </>
              )}
            </button>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center space-y-4">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
            <h3 className="text-lg font-semibold text-gray-900">
              ¡Prueba exitosa!
            </h3>
            <p className="text-gray-600 text-sm">
              La funcionalidad de huella digital está funcionando correctamente.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-green-800 text-xs">
                <strong>En producción:</strong> Aquí se integraría con la WebAuthn API real del dispositivo.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
            >
              Continuar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileFingerprintTest;