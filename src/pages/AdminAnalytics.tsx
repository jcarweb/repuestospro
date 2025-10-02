import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../../config/api';
import { useLanguage } from '../contexts/LanguageContext';
import {
  BarChart3,
  Settings,
  ToggleLeft,
  ToggleRight,
  Save,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';

interface AnalyticsConfig {
  isConfigured: boolean;
  isEnabled: boolean;
  measurementId?: string;
  propertyId?: string;
  lastConfiguredBy?: string;
  lastConfiguredAt?: string;
  customEvents: {
    userRegistration: boolean;
    userLogin: boolean;
    purchase: boolean;
    review: boolean;
    referral: boolean;
    rewardRedemption: boolean;
    locationUpdate: boolean;
  };
  customDimensions: {
    userId: boolean;
    userRole: boolean;
    loyaltyLevel: boolean;
    locationEnabled: boolean;
  };
  customMetrics: {
    pointsEarned: boolean;
    totalSpent: boolean;
    referralCount: boolean;
  };
}

const AdminAnalytics: React.FC = () => {
  const { token, user } = useAuth();
  const { t } = useLanguage();
  const [config, setConfig] = useState<AnalyticsConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Formulario de configuración
  const [formData, setFormData] = useState({
    measurementId: '',
    propertyId: '',
    trackingCode: '',
    customEvents: {
      userRegistration: true,
      userLogin: true,
      purchase: true,
      review: true,
      referral: true,
      rewardRedemption: true,
      locationUpdate: true
    },
    customDimensions: {
      userId: true,
      userRole: true,
      loyaltyLevel: true,
      locationEnabled: true
    },
    customMetrics: {
      pointsEarned: true,
      totalSpent: true,
      referralCount: true
    }
  });

  useEffect(() => {
    if (user?.role !== 'admin') {
      setMessage({ type: 'error', text: t('adminAnalytics.accessDeniedMessage') });
      return;
    }
    
    fetchConfiguration();
  }, [user]);

  const fetchConfiguration = async () => {
    try {
      const response = await fetch('process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "process.env.REACT_APP_BACKEND_URL || "process.env.REACT_APP_BACKEND_URL || "process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "http://localhost:5000""""/api/analytics/configuration', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      if (result.success) {
        setConfig(result.data);
        if (result.data.measurementId) {
          setFormData(prev => ({
            ...prev,
            measurementId: result.data.measurementId,
            propertyId: result.data.propertyId || '',
            trackingCode: generateTrackingCode(result.data.measurementId),
            customEvents: result.data.customEvents || prev.customEvents,
            customDimensions: result.data.customDimensions || prev.customDimensions,
            customMetrics: result.data.customMetrics || prev.customMetrics
          }));
        }
      }
    } catch (error) {
      console.error('Error obteniendo configuración:', error);
      setMessage({ type: 'error', text: t('adminAnalytics.errorLoading') });
    } finally {
      setLoading(false);
    }
  };

  const generateTrackingCode = (measurementId: string): string => {
    return `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${measurementId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${measurementId}');
</script>`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"/api/analytics/configuration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          measurementId: formData.measurementId,
          propertyId: formData.propertyId,
          trackingCode: formData.trackingCode,
          customEvents: formData.customEvents,
          customDimensions: formData.customDimensions,
          customMetrics: formData.customMetrics
        })
      });

      const result = await response.json();
      if (result.success) {
        setMessage({ type: 'success', text: t('adminAnalytics.configurationSaved') });
        fetchConfiguration(); // Recargar configuración
      } else {
        setMessage({ type: 'error', text: result.message || t('adminAnalytics.errorSaving') });
      }
    } catch (error) {
      setMessage({ type: 'error', text: t('adminAnalytics.connectionError') });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAnalytics = async (enabled: boolean) => {
    try {
      const response = await fetch('process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"/api/analytics/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ enabled })
      });

      const result = await response.json();
      if (result.success) {
        setMessage({ type: 'success', text: enabled ? t('adminAnalytics.analyticsEnabled') : t('adminAnalytics.analyticsDisabled') });
        fetchConfiguration();
      } else {
        setMessage({ type: 'error', text: result.message || t('adminAnalytics.errorChangingStatus') });
      }
    } catch (error) {
      setMessage({ type: 'error', text: t('adminAnalytics.connectionError') });
    }
  };

  const handleMeasurementIdChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      measurementId: value,
      trackingCode: generateTrackingCode(value)
    }));
  };

  // Funciones para obtener traducciones de eventos, dimensiones y métricas
  const getEventLabel = (key: string) => {
    const eventLabels: { [key: string]: string } = {
      userRegistration: t('adminAnalytics.events.userRegistration'),
      userLogin: t('adminAnalytics.events.userLogin'),
      purchase: t('adminAnalytics.events.purchase'),
      review: t('adminAnalytics.events.review'),
      referral: t('adminAnalytics.events.referral'),
      rewardRedemption: t('adminAnalytics.events.rewardRedemption'),
      locationUpdate: t('adminAnalytics.events.locationUpdate')
    };
    return eventLabels[key] || key.replace(/([A-Z])/g, ' $1').trim();
  };

  const getDimensionLabel = (key: string) => {
    const dimensionLabels: { [key: string]: string } = {
      userId: t('adminAnalytics.dimensions.userId'),
      userRole: t('adminAnalytics.dimensions.userRole'),
      loyaltyLevel: t('adminAnalytics.dimensions.loyaltyLevel'),
      locationEnabled: t('adminAnalytics.dimensions.locationEnabled')
    };
    return dimensionLabels[key] || key.replace(/([A-Z])/g, ' $1').trim();
  };

  const getMetricLabel = (key: string) => {
    const metricLabels: { [key: string]: string } = {
      pointsEarned: t('adminAnalytics.metrics.pointsEarned'),
      totalSpent: t('adminAnalytics.metrics.totalSpent'),
      referralCount: t('adminAnalytics.metrics.referralCount')
    };
    return metricLabels[key] || key.replace(/([A-Z])/g, ' $1').trim();
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="flex items-center justify-center mb-4">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">
            {t('adminAnalytics.accessDenied')}
          </h2>
          <p className="text-gray-600 text-center">
            {t('adminAnalytics.accessDeniedMessage')}
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFC300] mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('adminAnalytics.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <BarChart3 className="w-8 h-8 text-[#FFC300] mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">
              {t('adminAnalytics.title')}
            </h1>
          </div>
          <p className="text-gray-600">
            {t('adminAnalytics.subtitle')}
          </p>
        </div>

        {/* Mensaje de estado */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            <div className="flex items-center">
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 mr-2" />
              ) : (
                <AlertCircle className="w-5 h-5 mr-2" />
              )}
              {message.text}
            </div>
          </div>
        )}

        {/* Estado actual */}
        {config && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">{t('adminAnalytics.currentStatus')}</h2>
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  config.isConfigured ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {config.isConfigured ? t('adminAnalytics.configured') : t('adminAnalytics.notConfigured')}
                </span>
                <button
                  onClick={() => handleToggleAnalytics(!config.isEnabled)}
                  className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                    config.isEnabled
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {config.isEnabled ? (
                    <>
                      <ToggleLeft className="w-4 h-4 mr-2" />
                      {t('adminAnalytics.disable')}
                    </>
                  ) : (
                    <>
                      <ToggleRight className="w-4 h-4 mr-2" />
                      {t('adminAnalytics.enable')}
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {config.isConfigured && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">{t('adminAnalytics.measurementId')}</span>
                  <p className="text-gray-900">{config.measurementId}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">{t('adminAnalytics.propertyId')}</span>
                  <p className="text-gray-900">{config.propertyId}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">{t('adminAnalytics.lastConfiguration')}</span>
                  <p className="text-gray-900">
                    {config.lastConfiguredBy} - {new Date(config.lastConfiguredAt!).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Formulario de configuración */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('adminAnalytics.configuration')}</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('adminAnalytics.measurementIdLabel')}
                </label>
                <input
                  type="text"
                  value={formData.measurementId}
                  onChange={(e) => handleMeasurementIdChange(e.target.value)}
                  placeholder={t('adminAnalytics.measurementIdPlaceholder')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t('adminAnalytics.measurementIdHelp')}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('adminAnalytics.propertyIdLabel')}
                </label>
                <input
                  type="text"
                  value={formData.propertyId}
                  onChange={(e) => setFormData(prev => ({ ...prev, propertyId: e.target.value }))}
                  placeholder={t('adminAnalytics.propertyIdPlaceholder')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
                  required
                />
              </div>
            </div>

            {/* Eventos personalizados */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">{t('adminAnalytics.customEvents')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(formData.customEvents).map(([key, value]) => (
                  <label key={key} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        customEvents: {
                          ...prev.customEvents,
                          [key]: e.target.checked
                        }
                      }))}
                      className="mr-3"
                    />
                    <span className="text-sm text-gray-700">
                      {getEventLabel(key)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Dimensiones personalizadas */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">{t('adminAnalytics.customDimensions')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(formData.customDimensions).map(([key, value]) => (
                  <label key={key} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        customDimensions: {
                          ...prev.customDimensions,
                          [key]: e.target.checked
                        }
                      }))}
                      className="mr-3"
                    />
                    <span className="text-sm text-gray-700">
                      {getDimensionLabel(key)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Métricas personalizadas */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">{t('adminAnalytics.customMetrics')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(formData.customMetrics).map(([key, value]) => (
                  <label key={key} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        customMetrics: {
                          ...prev.customMetrics,
                          [key]: e.target.checked
                        }
                      }))}
                      className="mr-3"
                    />
                    <span className="text-sm text-gray-700">
                      {getMetricLabel(key)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Código de seguimiento generado */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">{t('adminAnalytics.trackingCode')}</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-x-auto">
                  {formData.trackingCode}
                </pre>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {t('adminAnalytics.trackingCodeHelp')}
              </p>
            </div>

            {/* Botón de guardar */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center px-6 py-3 bg-[#FFC300] text-white rounded-lg hover:bg-[#E6B000] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {t('adminAnalytics.saving')}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {t('adminAnalytics.saveConfiguration')}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics; 