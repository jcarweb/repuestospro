import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  Lock, 
  Shield, 
  Key,
  Fingerprint,
  Mail,
  Settings
} from 'lucide-react';
import ChangePasswordModal from '../components/ChangePasswordModal';
import { 
  PinSetupModal, 
  FingerprintModal, 
  TwoFactorModal, 
  EmailVerificationModal 
} from '../components/SecurityModals';
import SensitiveActionModal from '../components/SensitiveActionModal';
import { useLayoutContext } from '../hooks/useLayoutContext';
import { profileService } from '../services/profileService';
import type { UserProfile } from '../services/profileService';
import { TwoFactorProvider, useTwoFactor } from '../contexts/TwoFactorContext';
import { useSensitiveAction, SENSITIVE_ACTIONS } from '../hooks/useSensitiveAction';

const SecurityContent: React.FC = () => {
  const { user, token } = useAuth();
  const { t } = useLanguage();
  const { containerClasses, contentClasses } = useLayoutContext();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showFingerprintModal, setShowFingerprintModal] = useState(false);
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  const [showEmailVerificationModal, setShowEmailVerificationModal] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Hook para acciones sensibles
  const { executeSensitiveAction, handleVerifyCode, showTwoFactorModal: showSensitiveModal, closeModal, currentAction, isLoading } = useSensitiveAction();

  // Ejemplo de función que requiere 2FA
  const handleSensitivePasswordChange = async (currentPassword: string, newPassword: string) => {
    const result = await executeSensitiveAction(
      SENSITIVE_ACTIONS.CHANGE_PASSWORD,
      async () => {
        await profileService.changePassword({ currentPassword, newPassword });
        setMessage({ type: 'success', text: 'Contraseña cambiada correctamente' });
        setShowChangePasswordModal(false);
      }
    );
    
    if (result === null) {
      setMessage({ type: 'error', text: 'Operación cancelada por el usuario' });
    }
  };

  // Cargar perfil del usuario
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const userProfile = await profileService.getProfile();
        console.log('🔍 Perfil cargado:', userProfile);
        console.log('🔍 2FA habilitado:', userProfile.twoFactorEnabled);
        setProfile(userProfile);
      } catch (error) {
        console.error('Error loading profile:', error);
        setMessage({ type: 'error', text: t('security.errorLoading') });
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadProfile();
    }
  }, [token]);

  // Handlers para las funcionalidades de seguridad
  const handleChangePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await profileService.changePassword({ currentPassword, newPassword });
      setMessage({ type: 'success', text: t('security.passwordChanged') });
      setShowChangePasswordModal(false);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || t('security.errorChangingPassword') });
    }
  };

  const handlePinSetup = async (data: { pin: string; currentPassword: string }) => {
    try {
      await profileService.setPin(data);
      setMessage({ type: 'success', text: t('security.pinConfigured') });
      setShowPinModal(false);
      // Recargar perfil para actualizar el estado
      const updatedProfile = await profileService.getProfile();
      setProfile(updatedProfile);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || t('security.errorSettingPin') });
    }
  };

  const handleFingerprintSetup = async (data: { enabled: boolean }) => {
    try {
      await profileService.setFingerprint(data);
      setMessage({ 
        type: 'success', 
        text: `Huella digital ${data.enabled ? 'activada' : 'desactivada'} correctamente` 
      });
      setShowFingerprintModal(false);
      // Recargar perfil para actualizar el estado
      const updatedProfile = await profileService.getProfile();
      setProfile(updatedProfile);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || t('security.errorSettingFingerprint') });
    }
  };

  const handleTwoFactorSetup = async (data: { enabled: boolean; code?: string }) => {
    try {
      console.log('🔍 Intentando configurar 2FA:', data);
      const result = await profileService.setTwoFactor(data);
      console.log('🔍 Resultado de configuración 2FA:', result);
      
      if (data.enabled && result.data) {
        // Si se está activando y hay datos de respuesta, mantener el modal abierto
        // El modal manejará la visualización del QR y códigos
        return {
          secret: result.data.secret,
          backupCodes: result.data.backupCodes
        };
      } else {
        setMessage({ 
          type: 'success', 
          text: data.enabled ? t('security.2FAEnabledSuccess') : t('security.2FADisabledSuccess')
        });
        setShowTwoFactorModal(false);
        // Recargar perfil para actualizar el estado
        const updatedProfile = await profileService.getProfile();
        console.log('🔍 Perfil actualizado después de 2FA:', updatedProfile);
        setProfile(updatedProfile);
        return { secret: undefined, backupCodes: undefined };
      }
    } catch (error: any) {
      console.error('🔍 Error en configuración 2FA:', error);
              setMessage({ type: 'error', text: error.response?.data?.message || t('security.errorSetting2FA') });
      throw error; // Re-lanzar el error para que el modal lo maneje
    }
  };

  // Función para recargar el perfil después de que se complete la configuración de 2FA
  const handleTwoFactorComplete = async () => {
    try {
      const updatedProfile = await profileService.getProfile();
      setProfile(updatedProfile);
      setShowTwoFactorModal(false);
      setMessage({ 
        type: 'success', 
        text: t('security.2FAConfigured') 
      });
    } catch (error: any) {
      console.error('Error reloading profile:', error);
    }
  };

  const handleResendVerificationEmail = async () => {
    try {
      // Nota: Este método no existe en el servicio, se puede implementar si es necesario
      setMessage({ type: 'success', text: t('security.emailSentSuccess') });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || t('security.errorSendingEmail') });
    }
  };

  if (loading) {
    return (
      <div className={containerClasses}>
        <div className={contentClasses}>
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <div className={contentClasses}>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{t('security.title')}</h1>
          <p className="text-gray-600 mt-2">
            {t('security.subtitle')}
          </p>
        </div>

        {/* Mensajes de estado */}
        {message && (
          <div className={`mb-6 p-4 rounded-md ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.text}
            <button
              onClick={() => setMessage(null)}
              className="float-right text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        )}

        {/* Sección de Seguridad */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">{t('security.securityOptions')}</h2>
            </div>
          </div>
          
          <div className="px-6 py-4">
            <div className="space-y-4">
              {/* Cambio de contraseña */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Lock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{t('security.password')}</h3>
                    <p className="text-sm text-gray-500">{t('security.changePasswordDescription')}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowChangePasswordModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {t('security.changePassword')}
                </button>
              </div>

              {/* Configuración de PIN */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Key className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{t('security.pin')} de Acceso</h3>
                    <p className="text-sm text-gray-500">
                      {profile?.pin ? t('security.pinDescription') : t('security.pinNotConfigured')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    profile?.pin 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {profile?.pin ? t('security.configured') : t('security.notConfigured')}
                  </div>
                  <button
                    onClick={() => setShowPinModal(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    {profile?.pin ? t('security.changePassword') : t('security.setupPin')}
                  </button>
                </div>
              </div>

              {/* Verificación de email */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Mail className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{t('security.emailVerification')}</h3>
                    <p className="text-sm text-gray-500">
                      {profile?.isEmailVerified ? t('security.emailVerified') : t('security.emailNotVerified')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    profile?.isEmailVerified 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {profile?.isEmailVerified ? t('security.verified') : t('security.pending')}
                  </div>
                  <button
                    onClick={() => setShowEmailVerificationModal(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    {t('security.view')}
                  </button>
                </div>
              </div>

              {/* Huella Digital */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Fingerprint className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{t('security.fingerprint')}</h3>
                    <p className="text-sm text-gray-500">
                      {profile?.fingerprintEnabled ? t('security.fingerprintConfigured') : t('security.fingerprintNotConfigured')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    profile?.fingerprintEnabled 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {profile?.fingerprintEnabled ? t('security.active') : t('security.inactive')}
                  </div>
                  <button
                    onClick={() => setShowFingerprintModal(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                  >
                    {profile?.fingerprintEnabled ? t('security.deactivate') : t('security.activate')}
                  </button>
                </div>
              </div>

              {/* Autenticación de dos factores */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Shield className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{t('security.twoFactor')}</h3>
                    <p className="text-sm text-gray-500">
                      {profile?.twoFactorEnabled ? t('security.2FAEnabled') : t('security.2FANotEnabled')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    profile?.twoFactorEnabled 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {profile?.twoFactorEnabled ? t('security.active') : t('security.inactive')}
                  </div>
                  <button
                    onClick={() => setShowTwoFactorModal(true)}
                    className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                  >
                    {profile?.twoFactorEnabled ? t('security.deactivate') : t('security.activate')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modales de Seguridad */}
        <ChangePasswordModal
          isOpen={showChangePasswordModal}
          onClose={() => setShowChangePasswordModal(false)}
          onSubmit={handleChangePassword}
        />
        
        <PinSetupModal
          isOpen={showPinModal}
          onClose={() => setShowPinModal(false)}
          onSubmit={handlePinSetup}
          hasPin={!!profile?.pin}
        />
        
        <FingerprintModal
          isOpen={showFingerprintModal}
          onClose={() => setShowFingerprintModal(false)}
          onSubmit={handleFingerprintSetup}
          isEnabled={!!profile?.fingerprintEnabled}
        />
        
        <TwoFactorModal
          isOpen={showTwoFactorModal}
          onClose={() => setShowTwoFactorModal(false)}
          onSubmit={handleTwoFactorSetup}
          onComplete={handleTwoFactorComplete}
          isEnabled={!!profile?.twoFactorEnabled}
          userEmail={profile?.email}
        />
        
        <EmailVerificationModal
          isOpen={showEmailVerificationModal}
          onClose={() => setShowEmailVerificationModal(false)}
          onResendEmail={handleResendVerificationEmail}
          email={profile?.email || ''}
          isVerified={!!profile?.isEmailVerified}
        />

        {/* Modal para acciones sensibles */}
        <SensitiveActionModal
          isOpen={showSensitiveModal}
          onClose={closeModal}
          action={currentAction || ''}
          onVerify={handleVerifyCode}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

// Componente principal que envuelve con el provider
const Security: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar perfil para obtener el estado de 2FA
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const userProfile = await profileService.getProfile();
        setProfile(userProfile);
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadProfile();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <TwoFactorProvider isTwoFactorEnabled={!!profile?.twoFactorEnabled}>
      <SecurityContent />
    </TwoFactorProvider>
  );
};

export default Security; 