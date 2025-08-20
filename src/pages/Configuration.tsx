import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Settings, Globe, Moon, Sun, Bell, Eye, EyeOff, Palette, Activity, Smartphone } from 'lucide-react';
import ActivityHistory from '../components/ActivityHistory';
import { useLayoutContext } from '../hooks/useLayoutContext';
import { profileService } from '../services/profileService';
import { pushNotificationService } from '../services/pushNotificationService';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSelector from '../components/LanguageSelector';
import type { UserProfile } from '../services/profileService';

interface SettingsState {
  theme: string;
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    profileVisibility: string;
    showEmail: boolean;
    showPhone: boolean;
  };
}

const Configuration: React.FC = () => {
  const { user } = useAuth();
  const { theme, language, toggleTheme, setLanguage } = useTheme();
  const { t } = useLanguage();
  const { containerClasses, contentClasses } = useLayoutContext();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [pushStatus, setPushStatus] = useState<{
    supported: boolean;
    subscribed: boolean;
    permission: NotificationPermission;
  }>({
    supported: false,
    subscribed: false,
    permission: 'default'
  });
  const [settings, setSettings] = useState<SettingsState>({
    theme: 'light',
    language: 'es',
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showPhone: false
    }
  });
  const [showActivityHistory, setShowActivityHistory] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Cargar perfil del usuario y verificar estado de push notifications
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const userProfile = await profileService.getProfile();
        setProfile(userProfile);
        
        // Actualizar configuraciones con datos del perfil
        setSettings(prev => ({
          ...prev,
          theme: userProfile.theme || 'light',
          language: userProfile.language || 'es',
          notifications: {
            email: userProfile.emailNotifications,
            push: userProfile.pushNotifications,
            sms: userProfile.marketingEmails
          },
          privacy: {
            profileVisibility: userProfile.profileVisibility || 'public',
            showEmail: userProfile.showEmail || false,
            showPhone: userProfile.showPhone || false
          }
        }));

        // Verificar estado de push notifications
        const pushSupported = pushNotificationService.isPushSupported();
        if (pushSupported) {
          const status = await pushNotificationService.getSubscriptionStatus();
          setPushStatus({
            supported: true,
            subscribed: status.subscribed,
            permission: status.permission
          });
        } else {
          setPushStatus({
            supported: false,
            subscribed: false,
            permission: 'denied'
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        setMessage({ type: 'error', text: t('message.error') });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []); // Removido [t] para evitar múltiples llamadas

  const updateNotificationSetting = async (key: keyof SettingsState['notifications'], value: boolean) => {
    try {
      setLoading(true);
      
      // Actualizar estado local
      setSettings(prev => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          [key]: value
        }
      }));

      // Actualizar en el backend
      const notificationData = {
        emailNotifications: key === 'email' ? value : settings.notifications.email,
        pushNotifications: key === 'push' ? value : settings.notifications.push,
        marketingEmails: key === 'sms' ? value : settings.notifications.sms
      };

      const result = await profileService.updateNotifications(notificationData);
      setMessage({ type: 'success', text: result.message });
    } catch (error: any) {
      console.error('Error updating notification settings:', error);
      console.error('Error response:', error.response);
      console.error('Error request:', error.request);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Error al actualizar las notificaciones' 
      });
      
      // Revertir cambios en caso de error
      setSettings(prev => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          [key]: !value
        }
      }));
    } finally {
      setLoading(false);
    }
  };

  const updatePrivacySetting = async (key: keyof SettingsState['privacy'], value: boolean | string) => {
    try {
      setLoading(true);
      
      // Actualizar estado local
      setSettings(prev => ({
        ...prev,
        privacy: {
          ...prev.privacy,
          [key]: value
        }
      }));

      // Actualizar en el backend
      const privacyData = {
        profileVisibility: key === 'profileVisibility' ? value as string : settings.privacy.profileVisibility,
        showEmail: key === 'showEmail' ? value as boolean : settings.privacy.showEmail,
        showPhone: key === 'showPhone' ? value as boolean : settings.privacy.showPhone
      };

      const result = await profileService.updatePrivacy(privacyData);
      setMessage({ type: 'success', text: result.message });
    } catch (error: any) {
      console.error('Error updating privacy settings:', error);
      console.error('Error response:', error.response);
      console.error('Error request:', error.request);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || t('message.error')
      });
      
      // Revertir cambios en caso de error
      setSettings(prev => ({
        ...prev,
        privacy: {
          ...prev.privacy,
          [key]: key === 'profileVisibility' ? settings.privacy.profileVisibility : !value
        }
      }));
    } finally {
      setLoading(false);
    }
  };

  const updateThemeSetting = async (newTheme: 'light' | 'dark') => {
    try {
      setLoading(true);
      
      // Actualizar tema local usando el contexto
      toggleTheme();
      
      // Actualizar en el backend
      await profileService.updatePreferences({
        theme: newTheme,
        language: settings.language
      });
      
      setMessage({ type: 'success', text: t('message.preferences.updated') });
    } catch (error: any) {
      console.error('Error updating theme:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || t('message.error')
      });
    } finally {
      setLoading(false);
    }
  };

  const updateLanguageSetting = async (newLanguage: 'es' | 'en' | 'pt') => {
    try {
      setLoading(true);
      
      // Actualizar idioma local usando el contexto
      setLanguage(newLanguage);
      
      // Actualizar configuración local
      setSettings(prev => ({
        ...prev,
        language: newLanguage
      }));
      
      // Actualizar en el backend
      await profileService.updatePreferences({
        theme: settings.theme,
        language: newLanguage
      });
      
      setMessage({ type: 'success', text: t('message.preferences.updated') });
    } catch (error: any) {
      console.error('Error updating language:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || t('message.error')
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePushNotificationToggle = async (enabled: boolean) => {
    try {
      setLoading(true);
      
      if (enabled) {
        // Suscribirse a notificaciones push
        await pushNotificationService.subscribeToPush();
        setPushStatus(prev => ({ ...prev, subscribed: true }));
        setMessage({ type: 'success', text: t('notifications.push.subscribed') });
      } else {
        // Desuscribirse de notificaciones push
        await pushNotificationService.unsubscribeFromPush();
        setPushStatus(prev => ({ ...prev, subscribed: false }));
        setMessage({ type: 'success', text: t('notifications.push.unsubscribed') });
      }

      // Actualizar configuración en el backend
      await profileService.updatePushNotifications({
        pushEnabled: enabled
      });
    } catch (error: any) {
      console.error('Error toggling push notifications:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || t('message.error')
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className={containerClasses}>
        <div className={contentClasses}>
          <div className="bg-white dark:bg-dark-secondary shadow rounded-lg p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-racing-500"></div>
              <span className="ml-2 text-gray-600 dark:text-dark-secondary">{t('configuration.loading')}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <div className={contentClasses}>
        {/* Mensaje de estado */}
        {message && (
          <div className={`mb-4 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        <div className="bg-white dark:bg-dark-secondary shadow rounded-lg">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-dark">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-dark">{t('configuration.title')}</h1>
            <p className="text-gray-600 dark:text-dark-secondary">{t('configuration.subtitle')}</p>
          </div>

          {/* Configuration Options */}
          <div className="px-6 py-6">
            <div className="space-y-8">
              {/* Theme */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-dark mb-4">{t('appearance.title')}</h3>
                <div className="space-y-4">
                  <div className="border border-gray-200 dark:border-dark rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Palette className="w-6 h-6 text-racing-500" />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-dark">{t('appearance.theme')}</h4>
                          <p className="text-sm text-gray-600 dark:text-dark-secondary">{t('appearance.theme.description')}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateThemeSetting('light')}
                          className={`p-2 rounded-lg transition-colors ${
                            theme === 'light' 
                              ? 'bg-racing-500 text-white' 
                              : 'bg-gray-200 dark:bg-dark-tertiary text-gray-600 dark:text-dark-secondary'
                          }`}
                        >
                          <Sun className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => updateThemeSetting('dark')}
                          className={`p-2 rounded-lg transition-colors ${
                            theme === 'dark' 
                              ? 'bg-racing-500 text-white' 
                              : 'bg-gray-200 dark:bg-dark-tertiary text-gray-600 dark:text-dark-secondary'
                          }`}
                        >
                          <Moon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Language */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-dark mb-4">{t('language.title')}</h3>
                <div className="space-y-4">
                  <div className="border border-gray-200 dark:border-dark rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Globe className="w-6 h-6 text-racing-500" />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-dark">{t('language.description')}</h4>
                          <p className="text-sm text-gray-600 dark:text-dark-secondary">{t('language.description')}</p>
                        </div>
                      </div>
                      <LanguageSelector 
                        onChange={updateLanguageSetting}
                        className="px-3 py-2 border border-gray-300 dark:border-dark rounded-lg focus:ring-2 focus:ring-racing-500 focus:border-transparent bg-white dark:bg-dark-tertiary text-gray-900 dark:text-dark"
                        showLabel={false}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-dark mb-4">{t('notifications.title')}</h3>
                <div className="space-y-4">
                  <div className="border border-gray-200 dark:border-dark rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Bell className="w-6 h-6 text-racing-500" />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-dark">{t('notifications.email')}</h4>
                          <p className="text-sm text-gray-600 dark:text-dark-secondary">{t('notifications.email.description')}</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.notifications.email}
                          onChange={(e) => updateNotificationSetting('email', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 dark:bg-dark-tertiary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-racing-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-racing-500"></div>
                      </label>
                    </div>
                  </div>

                  <div className="border border-gray-200 dark:border-dark rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Smartphone className="w-6 h-6 text-racing-500" />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-dark">{t('notifications.push')}</h4>
                          <p className="text-sm text-gray-600 dark:text-dark-secondary">{t('notifications.push.description')}</p>
                          {!pushStatus.supported && (
                            <p className="text-xs text-red-500 mt-1">No soportado en este navegador</p>
                          )}
                          {pushStatus.permission === 'denied' && (
                            <p className="text-xs text-red-500 mt-1">Permisos denegados</p>
                          )}
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={pushStatus.subscribed}
                          onChange={(e) => handlePushNotificationToggle(e.target.checked)}
                          disabled={!pushStatus.supported || pushStatus.permission === 'denied'}
                          className="sr-only peer"
                        />
                        <div className={`w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-racing-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                          !pushStatus.supported || pushStatus.permission === 'denied'
                            ? 'bg-gray-300 cursor-not-allowed'
                            : pushStatus.subscribed
                            ? 'bg-racing-500'
                            : 'bg-gray-200 dark:bg-dark-tertiary'
                        }`}></div>
                      </label>
                    </div>
                  </div>

                  <div className="border border-gray-200 dark:border-dark rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Bell className="w-6 h-6 text-alert-600" />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-dark">{t('notifications.sms')}</h4>
                          <p className="text-sm text-gray-600 dark:text-dark-secondary">{t('notifications.sms.description')}</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.notifications.sms}
                          onChange={(e) => updateNotificationSetting('sms', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 dark:bg-dark-tertiary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-racing-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-racing-500"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Privacy */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-dark mb-4">{t('privacy.title')}</h3>
                <div className="space-y-4">
                  <div className="border border-gray-200 dark:border-dark rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Eye className="w-6 h-6 text-racing-500" />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-dark">{t('privacy.profile.visibility')}</h4>
                          <p className="text-sm text-gray-600 dark:text-dark-secondary">{t('privacy.profile.visibility.description')}</p>
                        </div>
                      </div>
                      <select
                        value={settings.privacy.profileVisibility}
                        onChange={(e) => updatePrivacySetting('profileVisibility', e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-dark rounded-lg focus:ring-2 focus:ring-racing-500 focus:border-transparent bg-white dark:bg-dark-tertiary text-gray-900 dark:text-dark"
                      >
                        <option value="public">{t('privacy.profile.public')}</option>
                        <option value="friends">{t('privacy.profile.friends')}</option>
                        <option value="private">{t('privacy.profile.private')}</option>
                      </select>
                    </div>
                  </div>

                  <div className="border border-gray-200 dark:border-dark rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Eye className="w-6 h-6 text-racing-500" />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-dark">{t('privacy.show.email')}</h4>
                          <p className="text-sm text-gray-600 dark:text-dark-secondary">{t('privacy.show.email.description')}</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.privacy.showEmail}
                          onChange={(e) => updatePrivacySetting('showEmail', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 dark:bg-dark-tertiary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-racing-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-racing-500"></div>
                      </label>
                    </div>
                  </div>

                  <div className="border border-gray-200 dark:border-dark rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Eye className="w-6 h-6 text-racing-500" />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-dark">{t('privacy.show.phone')}</h4>
                          <p className="text-sm text-gray-600 dark:text-dark-secondary">{t('privacy.show.phone.description')}</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.privacy.showPhone}
                          onChange={(e) => updatePrivacySetting('showPhone', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 dark:bg-dark-tertiary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-racing-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-racing-500"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity History Section */}
        <div className="mt-8 bg-white dark:bg-dark-secondary shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-dark">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-gray-600 dark:text-dark-secondary" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-dark">{t('activity.title')}</h3>
              </div>
              <button
                onClick={() => setShowActivityHistory(!showActivityHistory)}
                className="text-sm text-racing-600 hover:text-racing-700 dark:text-racing-400 dark:hover:text-racing-300"
              >
                {showActivityHistory ? t('activity.hide') : t('activity.show')}
              </button>
            </div>
          </div>
          
          {showActivityHistory && (
            <div className="px-6 py-4">
              <ActivityHistory />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Configuration; 