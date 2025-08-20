import React, { useState, useEffect } from 'react';
import { X, Lock, Shield, Smartphone, Mail, Eye, EyeOff, Key, Fingerprint, QrCode, Download, Smartphone as PhoneIcon } from 'lucide-react';
import QRCode from 'qrcode';
import { useLanguage } from '../contexts/LanguageContext';

// ===== MODAL PARA CONFIGURAR PIN =====
interface PinSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { pin: string; currentPassword: string }) => Promise<void>;
  hasPin: boolean;
}

export const PinSetupModal: React.FC<PinSetupModalProps> = ({ isOpen, onClose, onSubmit, hasPin }) => {
  const { t } = useLanguage();
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
      setError(t('securityModals.pin.pinMustBe4Digits'));
      return;
    }
    
    if (pin !== confirmPin) {
      setError(t('securityModals.pin.pinMismatch'));
      return;
    }
    
    if (!currentPassword) {
      setError(t('securityModals.pin.currentPasswordRequired'));
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await onSubmit({ pin, currentPassword });
      setSuccess(hasPin ? t('securityModals.pin.pinUpdated') : t('securityModals.pin.pinConfigured'));
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error: any) {
      setError(error.message || t('securityModals.pin.errorConfiguring'));
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
              {hasPin ? t('securityModals.pin.updateTitle') : t('securityModals.pin.title')}
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
              {t('securityModals.pin.currentPassword')}
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t('securityModals.pin.currentPasswordPlaceholder')}
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
              {t('securityModals.pin.newPin')}
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
            <p className="text-xs text-gray-500 mt-1">{t('securityModals.pin.exactly4Digits')}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('securityModals.pin.confirmPin')}
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
                <p className="font-medium mb-1">{t('securityModals.pin.pinInfo')}</p>
                <ul className="text-xs space-y-1">
                  <li>• {t('securityModals.pin.pinRules')}</li>
                  <li>• {t('securityModals.pin.pinRules2')}</li>
                  <li>• {t('securityModals.pin.pinRules3')}</li>
                  <li>• {t('securityModals.pin.pinRules4')}</li>
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
            {t('button.cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !pin || !confirmPin || !currentPassword || pin.length !== 4}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? t('securityModals.pin.saving') : (hasPin ? t('securityModals.pin.updatePin') : t('securityModals.pin.setupPin'))}
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
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleToggle = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await onSubmit({ enabled: !isEnabled });
      setSuccess(isEnabled ? t('securityModals.fingerprint.deactivated') : t('securityModals.fingerprint.activated'));
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error: any) {
      setError(error.message || t('securityModals.fingerprint.errorConfiguring'));
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
              {isEnabled ? t('securityModals.fingerprint.deactivateTitle') : t('securityModals.fingerprint.activateTitle')}
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
              {isEnabled ? t('securityModals.fingerprint.deactivateQuestion') : t('securityModals.fingerprint.activateQuestion')}
            </h3>
            <p className="text-gray-600 mb-6">
              {isEnabled 
                ? t('securityModals.fingerprint.deactivateDescription')
                : t('securityModals.fingerprint.activateDescription')
              }
            </p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
            <div className="flex items-start gap-2">
              <div className="h-2 w-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
              <div className="text-sm text-purple-700">
                <p className="font-medium mb-1">{t('securityModals.fingerprint.information')}</p>
                <ul className="text-xs space-y-1">
                  <li>• {t('securityModals.fingerprint.info1')}</li>
                  <li>• {t('securityModals.fingerprint.info2')}</li>
                  <li>• {t('securityModals.fingerprint.info3')}</li>
                  <li>• {t('securityModals.fingerprint.info4')}</li>
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
            {t('button.cancel')}
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
            {isLoading ? t('securityModals.fingerprint.processing') : (isEnabled ? t('securityModals.fingerprint.deactivate') : t('securityModals.fingerprint.activate'))}
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
  onSubmit: (data: { enabled: boolean; code?: string }) => Promise<{ secret?: string; backupCodes?: string[]; googleAuthUrl?: string }>;
  onComplete?: () => Promise<void>;
  isEnabled: boolean;
  userEmail?: string;
}

export const TwoFactorModal: React.FC<TwoFactorModalProps> = ({ isOpen, onClose, onSubmit, onComplete, isEnabled, userEmail }) => {
  const { t } = useLanguage();
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
      setError(t('securityModals.2fa.codeMustBe6Digits'));
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await onSubmit({ enabled: true, code: verificationCode });
      setSuccess(t('securityModals.2fa.activatedSuccessfully'));
      
      // Llamar a onComplete si está disponible
      if (onComplete) {
        await onComplete();
      }
      
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error: any) {
      setError(error.message || t('securityModals.2fa.invalidCode'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivate = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await onSubmit({ enabled: false });
      setSuccess(t('securityModals.2fa.deactivatedSuccessfully'));
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error: any) {
      setError(error.message || t('securityModals.2fa.errorDeactivating'));
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
              {t('securityModals.2fa.title')}
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
                {isEnabled ? t('securityModals.2fa.deactivateQuestion') : t('securityModals.2fa.activateQuestion')}
              </h3>
              <p className="text-gray-600 mb-6">
                {isEnabled 
                  ? t('securityModals.2fa.deactivateDescription')
                  : t('securityModals.2fa.activateDescription')
                }
              </p>
            </div>
          )}

          {step === 'setup' && qrData && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-4">{t('securityModals.2fa.setupGoogleAuthenticator')}</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {t('securityModals.2fa.scanQRDescription')}
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
                  <p className="text-xs text-gray-600 mb-1">{t('securityModals.2fa.manualCodeTitle')}</p>
                  <div className="bg-white border border-gray-300 rounded px-3 py-2">
                    <code className="text-sm font-mono text-gray-800 break-all">{qrData.secret}</code>
                  </div>
                </div>

                {/* Instrucciones */}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                  <div className="flex items-start gap-2">
                    <PhoneIcon className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-700">
                      <p className="font-medium mb-1">{t('securityModals.2fa.instructionsTitle')}</p>
                      <ol className="text-xs space-y-1 list-decimal list-inside">
                        <li>{t('securityModals.2fa.instruction1')}</li>
                        <li>{t('securityModals.2fa.instruction2')}</li>
                        <li>{t('securityModals.2fa.instruction3')}</li>
                        <li>{t('securityModals.2fa.instruction4')}</li>
                        <li>{t('securityModals.2fa.instruction5')}</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-md p-4">
                <div className="flex items-start gap-2">
                  <div className="h-2 w-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="text-sm text-orange-700">
                    <p className="font-medium mb-1">{t('securityModals.2fa.backupCodesTitle')}</p>
                    <p className="text-xs mb-2">{t('securityModals.2fa.backupCodesSaveDescription')}</p>
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
                      {t('securityModals.2fa.downloadCodesButton')}
                    </button>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <h4 className="text-md font-medium text-gray-900 mb-3">{t('securityModals.2fa.verifyConfiguration')}</h4>
                <p className="text-sm text-gray-600 mb-4">
                  {t('securityModals.2fa.verifyConfigurationDescription')}
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
                    {t('securityModals.2fa.codeChangesEvery30Seconds')}
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
            {t('securityModal.cancel')}
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
              {isLoading ? t('securityModals.2fa.processing') : (isEnabled ? t('securityModals.2fa.deactivate') : t('securityModals.2fa.activate'))}
            </button>
          )}

          {step === 'setup' && (
            <div className="flex gap-2">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                {t('securityModal.cancel')}
              </button>
              <button
                onClick={handleVerify}
                disabled={isLoading || verificationCode.length !== 6}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? t('securityModals.2fa.verifying') : t('securityModals.2fa.verifyAndActivate')}
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
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleResendEmail = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await onResendEmail();
      setSuccess(t('securityModals.email.emailSentSuccessfully'));
    } catch (error: any) {
      setError(error.message || t('securityModals.email.errorSendingEmail'));
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
              {t('securityModals.email.title')}
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('securityModals.email.verified')}</h3>
                <p className="text-gray-600 mb-4">
                  Tu email <strong>{email}</strong> está verificado y tu cuenta está completamente activa.
                </p>
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-800">{t('securityModals.email.accountVerified')}</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('securityModals.email.verifyEmail')}</h3>
                <p className="text-gray-600 mb-4">
                  Necesitas verificar tu email <strong>{email}</strong> para completar la configuración de tu cuenta.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <div className="flex items-start gap-2">
                    <div className="h-2 w-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="text-sm text-yellow-700">
                      <p className="font-medium mb-1">{t('securityModals.email.verificationSteps')}</p>
                      <ul className="text-xs space-y-1">
                        <li>• {t('securityModals.email.step1')}</li>
                        <li>• {t('securityModals.email.step2')}</li>
                        <li>• {t('securityModals.email.step3')}</li>
                        <li>• {t('securityModals.email.step4')}</li>
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
            {t('securityModals.email.close')}
          </button>
          
          {!isVerified && (
            <button
              onClick={handleResendEmail}
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? t('securityModals.email.sending') : t('securityModals.email.resendEmail')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
