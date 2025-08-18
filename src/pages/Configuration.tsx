import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Settings, Globe, Moon, Sun, Bell, Eye, EyeOff, Palette, Activity } from 'lucide-react';
import ActivityHistory from '../components/ActivityHistory';
import { useLayoutContext } from '../hooks/useLayoutContext';
import { profileService } from '../services/profileService';
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
  const { containerClasses, contentClasses } = useLayoutContext();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
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

  // Cargar perfil del usuario
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const userProfile = await profileService.getProfile();
        setProfile(userProfile);
        
        // Actualizar configuraciones con datos del perfil
        setSettings(prev => ({
          ...prev,
          notifications: {
            email: userProfile.emailNotifications,
            push: userProfile.pushNotifications,
            sms: userProfile.marketingEmails
          }
        }));
      } catch (error) {
        console.error('Error loading profile:', error);
        setMessage({ type: 'error', text: 'Error al cargar el perfil' });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

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

  const updatePrivacySetting = (key: keyof SettingsState['privacy'], value: boolean | string) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value
      }
    }));
  };

  if (loading && !profile) {
    return (
      <div className={containerClasses}>
        <div className={contentClasses}>
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Cargando configuración...</span>
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

        <div className="bg-white shadow rounded-lg">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
            <p className="text-gray-600">Personaliza tu experiencia</p>
          </div>

          {/* Configuration Options */}
          <div className="px-6 py-6">
            <div className="space-y-8">
              {/* Theme */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Apariencia</h3>
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Palette className="w-6 h-6 text-blue-600" />
                        <div>
                          <h4 className="font-medium text-gray-900">Tema</h4>
                          <p className="text-sm text-gray-600">Elige entre tema claro u oscuro</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSettings(prev => ({ ...prev, theme: 'light' }))}
                          className={`p-2 rounded-lg ${
                            settings.theme === 'light' 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          <Sun className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setSettings(prev => ({ ...prev, theme: 'dark' }))}
                          className={`p-2 rounded-lg ${
                            settings.theme === 'dark' 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-200 text-gray-600'
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
                <h3 className="text-lg font-medium text-gray-900 mb-4">Idioma</h3>
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Globe className="w-6 h-6 text-green-600" />
                        <div>
                          <h4 className="font-medium text-gray-900">Idioma de la aplicación</h4>
                          <p className="text-sm text-gray-600">Selecciona tu idioma preferido</p>
                        </div>
                      </div>
                      <select
                        value={settings.language}
                        onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="es">Español</option>
                        <option value="en">English</option>
                        <option value="pt">Português</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Notificaciones</h3>
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Bell className="w-6 h-6 text-yellow-600" />
                        <div>
                          <h4 className="font-medium text-gray-900">Notificaciones por Email</h4>
                          <p className="text-sm text-gray-600">Recibe notificaciones importantes por email</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.notifications.email}
                          onChange={(e) => updateNotificationSetting('email', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Bell className="w-6 h-6 text-orange-600" />
                        <div>
                          <h4 className="font-medium text-gray-900">Notificaciones Push</h4>
                          <p className="text-sm text-gray-600">Notificaciones en tiempo real</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.notifications.push}
                          onChange={(e) => updateNotificationSetting('push', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Bell className="w-6 h-6 text-red-600" />
                        <div>
                          <h4 className="font-medium text-gray-900">Notificaciones SMS</h4>
                          <p className="text-sm text-gray-600">Mensajes de texto importantes</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.notifications.sms}
                          onChange={(e) => updateNotificationSetting('sms', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Privacy */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Privacidad</h3>
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Eye className="w-6 h-6 text-purple-600" />
                        <div>
                          <h4 className="font-medium text-gray-900">Visibilidad del Perfil</h4>
                          <p className="text-sm text-gray-600">Quién puede ver tu perfil</p>
                        </div>
                      </div>
                      <select
                        value={settings.privacy.profileVisibility}
                        onChange={(e) => updatePrivacySetting('profileVisibility', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="public">Público</option>
                        <option value="friends">Solo amigos</option>
                        <option value="private">Privado</option>
                      </select>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Eye className="w-6 h-6 text-blue-600" />
                        <div>
                          <h4 className="font-medium text-gray-900">Mostrar Email</h4>
                          <p className="text-sm text-gray-600">Permitir que otros vean tu email</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.privacy.showEmail}
                          onChange={(e) => updatePrivacySetting('showEmail', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Eye className="w-6 h-6 text-green-600" />
                        <div>
                          <h4 className="font-medium text-gray-900">Mostrar Teléfono</h4>
                          <p className="text-sm text-gray-600">Permitir que otros vean tu teléfono</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.privacy.showPhone}
                          onChange={(e) => updatePrivacySetting('showPhone', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity History Section */}
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Historial de Actividades</h3>
              </div>
              <button
                onClick={() => setShowActivityHistory(!showActivityHistory)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {showActivityHistory ? 'Ocultar' : 'Ver historial'}
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