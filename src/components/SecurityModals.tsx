import React, { useState, useEffect } from 'react';
import { X, Lock, Shield, Smartphone, Mail, Eye, EyeOff, Key, Fingerprint, QrCode, Download, Smartphone as PhoneIcon } from 'lucide-react';
import QRCode from 'qrcode';

// ===== MODAL PARA CONFIGURAR PIN =====
interface PinSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { pin: string; currentPassword: string }) => Promise<void>;
  hasPin: boolean;
}

export const PinSetupModal: React.FC<PinSetupModalProps> = ({ isOpen, onClose, onSubmit, hasPin }) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (pin.length !== 4) {
      setError('El PIN debe tener exactamente 4 dígitos');
      return;
    }
    
    if (pin !== confirmPin) {
      setError('Los PINs no coinciden');
      return;
    }
    
    if (!currentPassword) {
      setError('Debes ingresar tu contraseña actual');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await onSubmit({ pin, currentPassword });
      setSuccess(hasPin ? 'PIN actualizado correctamente' : 'PIN configurado correctamente');
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error: any) {
      setError(error.message || 'Error al configurar el PIN');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setPin('');
    setConfirmPin('');
    setCurrentPassword('');
    setError(null);
    setSuccess(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Key className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              {hasPin ? 'Actualizar PIN' : 'Configurar PIN'}
            </h2>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-800">{success}</span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                <span className="text-sm text-red-800">{error}</span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña actual
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ingresa tu contraseña actual"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showCurrentPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nuevo PIN (4 dígitos)
            </label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0000"
              maxLength={4}
              required
            />
            <p className="text-xs text-gray-500 mt-1">Ingresa exactamente 4 dígitos numéricos</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar PIN
            </label>
            <input
              type="password"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0000"
              maxLength={4}
              required
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex items-start gap-2">
              <div className="h-2 w-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">Información del PIN:</p>
                <ul className="text-xs space-y-1">
                  <li>• El PIN debe tener exactamente 4 dígitos</li>
                  <li>• Solo se permiten números del 0 al 9</li>
                  <li>• Se usará para acceso rápido a la aplicación</li>
                  <li>• Mantén tu PIN en un lugar seguro</li>
                </ul>
              </div>
            </div>
          </div>
        </form>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !pin || !confirmPin || !currentPassword || pin.length !== 4}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Guardando...' : (hasPin ? 'Actualizar PIN' : 'Configurar PIN')}
          </button>
        </div>
      </div>
    </div>
  );
};

// ===== MODAL PARA CONFIGURAR HUELLA DIGITAL =====
interface FingerprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { enabled: boolean }) => Promise<void>;
  isEnabled: boolean;
}

export const FingerprintModal: React.FC<FingerprintModalProps> = ({ isOpen, onClose, onSubmit, isEnabled }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleToggle = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await onSubmit({ enabled: !isEnabled });
      setSuccess(isEnabled ? 'Huella digital desactivada' : 'Huella digital activada');
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error: any) {
      setError(error.message || 'Error al configurar la huella digital');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setSuccess(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Fingerprint className="h-5 w-5 text-purple-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              {isEnabled ? 'Desactivar Huella Digital' : 'Activar Huella Digital'}
            </h2>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-800">{success}</span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                <span className="text-sm text-red-800">{error}</span>
              </div>
            </div>
          )}

          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Fingerprint className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {isEnabled ? '¿Desactivar huella digital?' : '¿Activar huella digital?'}
            </h3>
            <p className="text-gray-600 mb-6">
              {isEnabled 
                ? 'Tu huella digital será removida del dispositivo. Podrás volver a configurarla más tarde.'
                : 'Podrás usar tu huella digital para acceder rápidamente a la aplicación.'
              }
            </p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
            <div className="flex items-start gap-2">
              <div className="h-2 w-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
              <div className="text-sm text-purple-700">
                <p className="font-medium mb-1">Información:</p>
                <ul className="text-xs space-y-1">
                  <li>• Solo funciona en dispositivos con sensor de huella</li>
                  <li>• Los datos se almacenan de forma segura en tu dispositivo</li>
                  <li>• Puedes desactivarla en cualquier momento</li>
                  <li>• Siempre tendrás acceso con tu contraseña</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancelar
          </button>
          <button
            onClick={handleToggle}
            disabled={isLoading}
            className={`px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              isEnabled 
                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' 
                : 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500'
            }`}
          >
            {isLoading ? 'Procesando...' : (isEnabled ? 'Desactivar' : 'Activar')}
          </button>
        </div>
      </div>
    </div>
  );
};

// ===== MODAL PARA CONFIGURAR 2FA =====
interface TwoFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { enabled: boolean; code?: string }) => Promise<{ secret?: string; backupCodes?: string[] }>;
  onComplete?: () => Promise<void>;
  isEnabled: boolean;
  userEmail?: string;
}

export const TwoFactorModal: React.FC<TwoFactorModalProps> = ({ isOpen, onClose, onSubmit, onComplete, isEnabled, userEmail }) => {
  const [step, setStep] = useState<'confirm' | 'setup' | 'verify'>('confirm');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [qrData, setQrData] = useState<{ secret: string; backupCodes: string[]; qrUrl: string; googleAuthUrl?: string } | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  const handleActivate = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await onSubmit({ enabled: true });
              if (result.secret && result.backupCodes) {
          // Usar la URL que viene del backend o generar una con el email real
          const email = userEmail || 'usuario@email.com';
          const otpauthUrl = result.googleAuthUrl || `otpauth://totp/PiezasYA:${encodeURIComponent(email)}?secret=${result.secret}&issuer=PiezasYA&algorithm=SHA1&digits=6&period=30`;
        
        // Generar QR code
        try {
          const qrUrl = await QRCode.toDataURL(otpauthUrl);
          setQrCodeUrl(qrUrl);
        } catch (qrError) {
          console.error('Error generating QR code:', qrError);
        }
        
        setQrData({ 
          secret: result.secret, 
          backupCodes: result.backupCodes,
          qrUrl: otpauthUrl,
          googleAuthUrl: result.googleAuthUrl
        });
        setStep('setup');
      }
    } catch (error: any) {
      setError(error.message || 'Error al activar 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      setError('El código debe tener 6 dígitos');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await onSubmit({ enabled: true, code: verificationCode });
      setSuccess('Autenticación de dos factores activada correctamente');
      
      // Llamar a onComplete si está disponible
      if (onComplete) {
        await onComplete();
      }
      
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error: any) {
      setError(error.message || 'Código inválido');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivate = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await onSubmit({ enabled: false });
      setSuccess('Autenticación de dos factores desactivada');
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error: any) {
      setError(error.message || 'Error al desactivar 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep('confirm');
    setVerificationCode('');
    setError(null);
    setSuccess(null);
    setQrData(null);
    onClose();
  };

  const downloadBackupCodes = () => {
    if (!qrData?.backupCodes) return;
    
    const codesText = qrData.backupCodes.join('\n');
    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Shield className="h-5 w-5 text-orange-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Autenticación de Dos Factores
            </h2>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-800">{success}</span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                <span className="text-sm text-red-800">{error}</span>
              </div>
            </div>
          )}

          {step === 'confirm' && (
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {isEnabled ? '¿Desactivar 2FA?' : '¿Activar 2FA?'}
              </h3>
              <p className="text-gray-600 mb-6">
                {isEnabled 
                  ? 'Tu cuenta volverá a usar solo contraseña para el acceso.'
                  : 'Añadirá una capa extra de seguridad a tu cuenta usando códigos de verificación.'
                }
              </p>
            </div>
          )}

          {step === 'setup' && qrData && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Configurar Google Authenticator</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Escanea este código QR con Google Authenticator o cualquier aplicación compatible
                </p>
                
                {/* QR Code */}
                <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
                  {qrCodeUrl ? (
                    <img src={qrCodeUrl} alt="QR Code" className="mx-auto" />
                  ) : (
                    <div className="h-32 w-32 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                      <QrCode className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Código manual */}
                <div className="bg-gray-50 border border-gray-200 rounded-md p-3 mb-4">
                  <p className="text-xs text-gray-600 mb-1">Código manual (si no puedes escanear):</p>
                  <div className="bg-white border border-gray-300 rounded px-3 py-2">
                    <code className="text-sm font-mono text-gray-800 break-all">{qrData.secret}</code>
                  </div>
                </div>

                {/* Instrucciones */}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                  <div className="flex items-start gap-2">
                    <PhoneIcon className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-700">
                      <p className="font-medium mb-1">Instrucciones:</p>
                      <ol className="text-xs space-y-1 list-decimal list-inside">
                        <li>Descarga Google Authenticator desde tu tienda de aplicaciones</li>
                        <li>Abre la aplicación y toca el botón "+"</li>
                        <li>Selecciona "Escanear código QR"</li>
                        <li>Apunta la cámara al código QR de arriba</li>
                        <li>O ingresa manualmente el código secreto</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-md p-4">
                <div className="flex items-start gap-2">
                  <div className="h-2 w-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="text-sm text-orange-700">
                    <p className="font-medium mb-1">Códigos de respaldo:</p>
                    <p className="text-xs mb-2">Guarda estos códigos en un lugar seguro. Te permitirán acceder si pierdes tu dispositivo.</p>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      {qrData.backupCodes.map((code, index) => (
                        <div key={index} className="bg-white px-2 py-1 rounded border">
                          {code}
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={downloadBackupCodes}
                      className="mt-2 flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700"
                    >
                      <Download className="h-3 w-3" />
                      Descargar códigos
                    </button>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <h4 className="text-md font-medium text-gray-900 mb-3">Verificar configuración</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Abre Google Authenticator y ingresa el código de 6 dígitos que aparece
                </p>
                
                {/* Icono de Google Authenticator */}
                <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                  <PhoneIcon className="h-6 w-6 text-orange-600" />
                </div>
                
                <div className="max-w-xs mx-auto">
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="w-full px-4 py-3 text-center text-lg font-mono border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    maxLength={6}
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    El código cambia cada 30 segundos
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancelar
          </button>
          
          {step === 'confirm' && (
            <button
              onClick={isEnabled ? handleDeactivate : handleActivate}
              disabled={isLoading}
              className={`px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                isEnabled 
                  ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' 
                  : 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500'
              }`}
            >
              {isLoading ? 'Procesando...' : (isEnabled ? 'Desactivar' : 'Activar')}
            </button>
          )}

          {step === 'setup' && (
            <div className="flex gap-2">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancelar
              </button>
              <button
                onClick={handleVerify}
                disabled={isLoading || verificationCode.length !== 6}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Verificando...' : 'Verificar y Activar'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ===== MODAL PARA VERIFICACIÓN DE EMAIL =====
interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResendEmail: () => Promise<void>;
  email: string;
  isVerified: boolean;
}

export const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({ 
  isOpen, 
  onClose, 
  onResendEmail, 
  email, 
  isVerified 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleResendEmail = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await onResendEmail();
      setSuccess('Email de verificación enviado correctamente');
    } catch (error: any) {
      setError(error.message || 'Error al enviar el email de verificación');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setSuccess(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Mail className="h-5 w-5 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Verificación de Email
            </h2>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-800">{success}</span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                <span className="text-sm text-red-800">{error}</span>
              </div>
            </div>
          )}

          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            
            {isVerified ? (
              <>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Email Verificado</h3>
                <p className="text-gray-600 mb-4">
                  Tu email <strong>{email}</strong> está verificado y tu cuenta está completamente activa.
                </p>
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-800">Cuenta verificada y segura</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Verificar Email</h3>
                <p className="text-gray-600 mb-4">
                  Necesitas verificar tu email <strong>{email}</strong> para completar la configuración de tu cuenta.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <div className="flex items-start gap-2">
                    <div className="h-2 w-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="text-sm text-yellow-700">
                      <p className="font-medium mb-1">Pasos para verificar:</p>
                      <ul className="text-xs space-y-1">
                        <li>• Revisa tu bandeja de entrada</li>
                        <li>• Busca el email de verificación</li>
                        <li>• Haz clic en el enlace de verificación</li>
                        <li>• Si no lo encuentras, revisa la carpeta de spam</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cerrar
          </button>
          
          {!isVerified && (
            <button
              onClick={handleResendEmail}
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Enviando...' : 'Reenviar Email'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
