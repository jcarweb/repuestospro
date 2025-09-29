import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  QrCode, 
  Key, 
  CheckCircle, 
  X, 
  AlertCircle,
  Download,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';

interface TwoFactorSetupProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  token: string;
}

const TwoFactorSetup: React.FC<TwoFactorSetupProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  token 
}) => {
  const [step, setStep] = useState<'loading' | 'qr' | 'verify' | 'backup' | 'success'>('loading');
  const [secret, setSecret] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  useEffect(() => {
    if (isOpen) {
      generateSecret();
    }
  }, [isOpen]);

  const generateSecret = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Generando secreto 2FA...');
      console.log('Token:', token ? 'Presente' : 'Ausente');
      
      const baseUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
      const response = await fetch(`${baseUrl}/api/auth/2fa/generate-secret`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Respuesta del servidor:', response.status, response.statusText);
      
      const result = await response.json();
      console.log('Resultado:', result);
      
      if (result.success) {
        setSecret(result.data.secret);
        setQrCode(result.data.qrCode);
        setStep('qr');
      } else {
        setError(result.message || 'Error generando secreto');
      }
    } catch (error) {
      console.error('Error en generateSecret:', error);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleEnable2FA = async () => {
    if (!verificationCode.trim()) {
      setError('Por favor ingresa el código de verificación');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Habilitando 2FA...');
      console.log('Datos enviados:', { secret: secret ? '***' : 'undefined', code: verificationCode });
      
      const baseUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
      const response = await fetch(`${baseUrl}/api/auth/2fa/enable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          secret,
          code: verificationCode
        })
      });

      console.log('Respuesta del servidor:', response.status, response.statusText);
      
      const result = await response.json();
      console.log('Resultado:', result);

      if (result.success) {
        setBackupCodes(result.data.backupCodes);
        setStep('backup');
      } else {
        setError(result.message || 'Error habilitando 2FA');
      }
    } catch (error) {
      console.error('Error en handleEnable2FA:', error);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    setStep('success');
    setTimeout(() => {
      onSuccess();
      onClose();
    }, 2000);
  };

  const downloadBackupCodes = () => {
    const codesText = backupCodes.join('\n');
    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
  };

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Shield className="w-6 h-6 mr-2 text-green-600" />
            Configurar 2FA
          </h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {step === 'loading' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Generando configuración...</p>
          </div>
        )}

        {step === 'qr' && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Escanea el código QR
              </h3>
              <p className="text-gray-600 mb-4">
                Usa tu aplicación de autenticación (Google Authenticator, Authy, etc.) para escanear este código
              </p>
            </div>

            <div className="flex justify-center">
              <div className="border-2 border-gray-200 rounded-lg p-4">
                <img src={qrCode} alt="QR Code" className="w-48 h-48" />
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Código secreto (manual)</h4>
              <p className="text-sm text-gray-600 mb-2">
                Si no puedes escanear el código, ingresa manualmente este secreto:
              </p>
              <div className="flex items-center space-x-2">
                <code className="bg-white px-3 py-2 rounded border text-sm font-mono flex-1">
                  {secret}
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(secret)}
                  className="text-blue-600 hover:text-blue-800"
                  title="Copiar"
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código de verificación
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="000000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  maxLength={6}
                />
              </div>

              {error && (
                <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                  <span className="text-red-800 text-sm">{error}</span>
                </div>
              )}

              <button
                onClick={handleEnable2FA}
                disabled={loading || !verificationCode.trim()}
                className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Verificando...' : 'Habilitar 2FA'}
              </button>
            </div>
          </div>
        )}

        {step === 'backup' && (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                ¡2FA Habilitado!
              </h3>
              <p className="text-gray-600 mb-4">
                Guarda estos códigos de respaldo en un lugar seguro. Los necesitarás si pierdes acceso a tu dispositivo.
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800 mb-1">Códigos de respaldo</h4>
                  <p className="text-yellow-700 text-sm">
                    Cada código solo se puede usar una vez. Guárdalos en un lugar seguro.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Códigos:</span>
                <button
                  onClick={() => setShowBackupCodes(!showBackupCodes)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {showBackupCodes ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              
              {showBackupCodes && (
                <div className="grid grid-cols-2 gap-2">
                  {backupCodes.map((code, index) => (
                    <div
                      key={index}
                      className="bg-white border border-gray-200 rounded px-3 py-2 text-center font-mono text-sm"
                    >
                      {code}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <button
                onClick={downloadBackupCodes}
                className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Descargar
              </button>
              <button
                onClick={copyBackupCodes}
                className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copiar
              </button>
            </div>

            <button
              onClick={handleComplete}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Completar configuración
            </button>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              ¡Configuración completada!
            </h3>
            <p className="text-gray-600">
              Tu autenticación de dos factores está activa.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TwoFactorSetup; 