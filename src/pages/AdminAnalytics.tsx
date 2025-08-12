import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
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
      setMessage({ type: 'error', text: 'Acceso denegado. Solo administradores pueden acceder a esta página.' });
      return;
    }
    
    fetchConfiguration();
  }, [user]);

  const fetchConfiguration = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/analytics/configuration', {
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
      setMessage({ type: 'error', text: 'Error cargando configuración' });
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
      const response = await fetch('http://localhost:5000/api/analytics/configuration', {
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
        setMessage({ type: 'success', text: 'Configuración guardada exitosamente' });
        fetchConfiguration(); // Recargar configuración
      } else {
        setMessage({ type: 'error', text: result.message || 'Error guardando configuración' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAnalytics = async (enabled: boolean) => {
    try {
      const response = await fetch('http://localhost:5000/api/analytics/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ enabled })
      });

      const result = await response.json();
      if (result.success) {
        setMessage({ type: 'success', text: `Google Analytics ${enabled ? 'habilitado' : 'deshabilitado'} exitosamente` });
        fetchConfiguration();
      } else {
        setMessage({ type: 'error', text: result.message || 'Error cambiando estado' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' });
    }
  };

  const handleMeasurementIdChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      measurementId: value,
      trackingCode: generateTrackingCode(value)
    }));
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="flex items-center justify-center mb-4">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">
            Acceso Denegado
          </h2>
          <p className="text-gray-600 text-center">
            Solo los administradores pueden acceder a esta página.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando configuración...</p>
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
            <BarChart3 className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">
              Configuración de Google Analytics
            </h1>
          </div>
          <p className="text-gray-600">
            Configura Google Analytics para rastrear el comportamiento de los usuarios en tu aplicación.
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
              <h2 className="text-xl font-semibold text-gray-900">Estado Actual</h2>
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  config.isConfigured ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {config.isConfigured ? 'Configurado' : 'No Configurado'}
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
                      Deshabilitar
                    </>
                  ) : (
                    <>
                      <ToggleRight className="w-4 h-4 mr-2" />
                      Habilitar
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {config.isConfigured && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Measurement ID:</span>
                  <p className="text-gray-900">{config.measurementId}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Property ID:</span>
                  <p className="text-gray-900">{config.propertyId}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Última configuración:</span>
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
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Configuración</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Measurement ID (G-XXXXXXXXXX)
                </label>
                <input
                  type="text"
                  value={formData.measurementId}
                  onChange={(e) => handleMeasurementIdChange(e.target.value)}
                  placeholder="G-XXXXXXXXXX"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Encuentra esto en tu cuenta de Google Analytics
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property ID
                </label>
                <input
                  type="text"
                  value={formData.propertyId}
                  onChange={(e) => setFormData(prev => ({ ...prev, propertyId: e.target.value }))}
                  placeholder="123456789"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Eventos personalizados */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Eventos Personalizados</h3>
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
                    <span className="text-sm text-gray-700 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Dimensiones personalizadas */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Dimensiones Personalizadas</h3>
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
                    <span className="text-sm text-gray-700 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Métricas personalizadas */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Métricas Personalizadas</h3>
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
                    <span className="text-sm text-gray-700 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Código de seguimiento generado */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Código de Seguimiento</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-x-auto">
                  {formData.trackingCode}
                </pre>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Este código debe ser incluido en el &lt;head&gt; de tu aplicación
              </p>
            </div>

            {/* Botón de guardar */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Configuración
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