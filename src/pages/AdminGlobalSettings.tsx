import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  Settings, 
  Globe, 
  Database, 
  Shield, 
  Bell,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  X
} from 'lucide-react';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const ConfigModal: React.FC<ConfigModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-[#333333] rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#555555]">
          <h2 className="text-xl font-semibold text-[#333333] dark:text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

const AdminGlobalSettings: React.FC = () => {
  console.log('🔍 AdminGlobalSettings: Componente iniciando renderizado');
  
  const { t } = useLanguage();
  const { user } = useAuth();
  
  console.log('🔍 AdminGlobalSettings: User:', user);
  console.log('🔍 AdminGlobalSettings: User role:', user?.role);
  console.log('🔍 AdminGlobalSettings: isAuthenticated:', !!user);
  
  const [isLoading, setIsLoading] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Configuraciones de ejemplo
  const [configs, setConfigs] = useState({
    database: {
      connectionString: 'mongodb://localhost:27017/repuestospro',
      maxConnections: 10,
      timeout: 5000
    },
    security: {
      jwtSecret: 'tu-secreto-jwt-aqui',
      sessionTimeout: 3600,
      maxLoginAttempts: 5
    },
    notifications: {
      emailEnabled: true,
      pushEnabled: true,
      smsEnabled: false
    },
    languages: {
      default: 'es',
      supported: ['es', 'en', 'pt']
    },
    api: {
      rateLimit: 100,
      timeout: 30000,
      corsEnabled: true
    },
    monitoring: {
      logLevel: 'info',
      enableMetrics: true,
      alertEmail: 'admin@piezasya.com'
    }
  });

  const handleConfigUpdate = async (section: string, data: any) => {
    setIsLoading(true);
    try {
      // Simular actualización de configuración
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setConfigs(prev => ({
        ...prev,
        [section]: { ...prev[section as keyof typeof prev], ...data }
      }));
      
      setMessage({ type: 'success', text: `Configuración de ${section} actualizada exitosamente` });
      setActiveModal(null);
    } catch (error) {
      setMessage({ type: 'error', text: `Error al actualizar configuración de ${section}` });
    } finally {
      setIsLoading(false);
    }
  };

  const renderDatabaseConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Cadena de Conexión
        </label>
        <input
          type="text"
          value={configs.database.connectionString}
          onChange={(e) => setConfigs(prev => ({
            ...prev,
            database: { ...prev.database, connectionString: e.target.value }
          }))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-[#555555] rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-transparent bg-white dark:bg-[#444444] text-gray-900 dark:text-white"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Máx. Conexiones
          </label>
          <input
            type="number"
            value={configs.database.maxConnections}
            onChange={(e) => setConfigs(prev => ({
              ...prev,
              database: { ...prev.database, maxConnections: parseInt(e.target.value) }
            }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-[#555555] rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-transparent bg-white dark:bg-[#444444] text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Timeout (ms)
          </label>
          <input
            type="number"
            value={configs.database.timeout}
            onChange={(e) => setConfigs(prev => ({
              ...prev,
              database: { ...prev.database, timeout: parseInt(e.target.value) }
            }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-[#555555] rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-transparent bg-white dark:bg-[#444444] text-gray-900 dark:text-white"
          />
        </div>
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <button
          onClick={() => setActiveModal(null)}
          className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
        >
          Cancelar
        </button>
        <button
          onClick={() => handleConfigUpdate('database', configs.database)}
          disabled={isLoading}
          className="px-4 py-2 bg-[#FFC300] text-[#333333] rounded-lg hover:bg-[#FFB800] disabled:opacity-50"
        >
          {isLoading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </div>
  );

  const renderSecurityConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          JWT Secret
        </label>
        <input
          type="password"
          value={configs.security.jwtSecret}
          onChange={(e) => setConfigs(prev => ({
            ...prev,
            security: { ...prev.security, jwtSecret: e.target.value }
          }))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-[#555555] rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-transparent bg-white dark:bg-[#444444] text-gray-900 dark:text-white"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Timeout de Sesión (s)
          </label>
          <input
            type="number"
            value={configs.security.sessionTimeout}
            onChange={(e) => setConfigs(prev => ({
              ...prev,
              security: { ...prev.security, sessionTimeout: parseInt(e.target.value) }
            }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-[#555555] rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-transparent bg-white dark:bg-[#444444] text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Máx. Intentos de Login
          </label>
          <input
            type="number"
            value={configs.security.maxLoginAttempts}
            onChange={(e) => setConfigs(prev => ({
              ...prev,
              security: { ...prev.security, maxLoginAttempts: parseInt(e.target.value) }
            }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-[#555555] rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-transparent bg-white dark:bg-[#444444] text-gray-900 dark:text-white"
          />
        </div>
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <button
          onClick={() => setActiveModal(null)}
          className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
        >
          Cancelar
        </button>
        <button
          onClick={() => handleConfigUpdate('security', configs.security)}
          disabled={isLoading}
          className="px-4 py-2 bg-[#FFC300] text-[#333333] rounded-lg hover:bg-[#FFB800] disabled:opacity-50"
        >
          {isLoading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </div>
  );

  const renderNotificationsConfig = () => (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Notificaciones por Email</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={configs.notifications.emailEnabled}
              onChange={(e) => setConfigs(prev => ({
                ...prev,
                notifications: { ...prev.notifications, emailEnabled: e.target.checked }
              }))}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 dark:bg-[#555555] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#FFC300] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FFC300]"></div>
          </label>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Notificaciones Push</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={configs.notifications.pushEnabled}
              onChange={(e) => setConfigs(prev => ({
                ...prev,
                notifications: { ...prev.notifications, pushEnabled: e.target.checked }
              }))}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 dark:bg-[#555555] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#FFC300] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FFC300]"></div>
          </label>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Notificaciones SMS</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={configs.notifications.smsEnabled}
              onChange={(e) => setConfigs(prev => ({
                ...prev,
                notifications: { ...prev.notifications, smsEnabled: e.target.checked }
              }))}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 dark:bg-[#555555] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#FFC300] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FFC300]"></div>
          </label>
        </div>
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <button
          onClick={() => setActiveModal(null)}
          className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
        >
          Cancelar
        </button>
        <button
          onClick={() => handleConfigUpdate('notifications', configs.notifications)}
          disabled={isLoading}
          className="px-4 py-2 bg-[#FFC300] text-[#333333] rounded-lg hover:bg-[#FFB800] disabled:opacity-50"
        >
          {isLoading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </div>
  );

  const renderLanguagesConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Idioma por Defecto
        </label>
        <select
          value={configs.languages.default}
          onChange={(e) => setConfigs(prev => ({
            ...prev,
            languages: { ...prev.languages, default: e.target.value }
          }))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-[#555555] rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-transparent bg-white dark:bg-[#444444] text-gray-900 dark:text-white"
        >
          <option value="es">Español</option>
          <option value="en">English</option>
          <option value="pt">Português</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Idiomas Soportados
        </label>
        <div className="space-y-2">
          {['es', 'en', 'pt'].map(lang => (
            <label key={lang} className="flex items-center">
              <input
                type="checkbox"
                checked={configs.languages.supported.includes(lang)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setConfigs(prev => ({
                      ...prev,
                      languages: {
                        ...prev.languages,
                        supported: [...prev.languages.supported, lang]
                      }
                    }));
                  } else {
                    setConfigs(prev => ({
                      ...prev,
                      languages: {
                        ...prev.languages,
                        supported: prev.languages.supported.filter(l => l !== lang)
                      }
                    }));
                  }
                }}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {lang === 'es' ? 'Español' : lang === 'en' ? 'English' : 'Português'}
              </span>
            </label>
          ))}
        </div>
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <button
          onClick={() => setActiveModal(null)}
          className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
        >
          Cancelar
        </button>
        <button
          onClick={() => handleConfigUpdate('languages', configs.languages)}
          disabled={isLoading}
          className="px-4 py-2 bg-[#FFC300] text-[#333333] rounded-lg hover:bg-[#FFB800] disabled:opacity-50"
        >
          {isLoading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </div>
  );

  const renderApiConfig = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Rate Limit (req/min)
          </label>
          <input
            type="number"
            value={configs.api.rateLimit}
            onChange={(e) => setConfigs(prev => ({
              ...prev,
              api: { ...prev.api, rateLimit: parseInt(e.target.value) }
            }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-[#555555] rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-transparent bg-white dark:bg-[#444444] text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Timeout (ms)
          </label>
          <input
            type="number"
            value={configs.api.timeout}
            onChange={(e) => setConfigs(prev => ({
              ...prev,
              api: { ...prev.api, timeout: parseInt(e.target.value) }
            }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-[#555555] rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-transparent bg-white dark:bg-[#444444] text-gray-900 dark:text-white"
          />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">CORS Habilitado</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={configs.api.corsEnabled}
            onChange={(e) => setConfigs(prev => ({
              ...prev,
              api: { ...prev.api, corsEnabled: e.target.checked }
            }))}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 dark:bg-[#555555] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#FFC300] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FFC300]"></div>
        </label>
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <button
          onClick={() => setActiveModal(null)}
          className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
        >
          Cancelar
        </button>
        <button
          onClick={() => handleConfigUpdate('api', configs.api)}
          disabled={isLoading}
          className="px-4 py-2 bg-[#FFC300] text-[#333333] rounded-lg hover:bg-[#FFB800] disabled:opacity-50"
        >
          {isLoading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </div>
  );

  const renderMonitoringConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Nivel de Log
        </label>
        <select
          value={configs.monitoring.logLevel}
          onChange={(e) => setConfigs(prev => ({
            ...prev,
            monitoring: { ...prev.monitoring, logLevel: e.target.value }
          }))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-[#555555] rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-transparent bg-white dark:bg-[#444444] text-gray-900 dark:text-white"
        >
          <option value="error">Error</option>
          <option value="warn">Warning</option>
          <option value="info">Info</option>
          <option value="debug">Debug</option>
        </select>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Métricas Habilitadas</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={configs.monitoring.enableMetrics}
            onChange={(e) => setConfigs(prev => ({
              ...prev,
              monitoring: { ...prev.monitoring, enableMetrics: e.target.checked }
            }))}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 dark:bg-[#555555] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#FFC300] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FFC300]"></div>
        </label>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Email de Alertas
        </label>
        <input
          type="email"
          value={configs.monitoring.alertEmail}
          onChange={(e) => setConfigs(prev => ({
            ...prev,
            monitoring: { ...prev.monitoring, alertEmail: e.target.value }
          }))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-[#555555] rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-transparent bg-white dark:bg-[#444444] text-gray-900 dark:text-white"
        />
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <button
          onClick={() => setActiveModal(null)}
          className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
        >
          Cancelar
        </button>
        <button
          onClick={() => handleConfigUpdate('monitoring', configs.monitoring)}
          disabled={isLoading}
          className="px-4 py-2 bg-[#FFC300] text-[#333333] rounded-lg hover:bg-[#FFB800] disabled:opacity-50"
        >
          {isLoading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </div>
  );

  if (!user || user.role !== 'admin') {
    console.log('❌ AdminGlobalSettings: Acceso denegado - User:', user, 'Role:', user?.role);
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Acceso Denegado
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            No tienes permisos para acceder a esta página.
          </p>
          <div className="mt-4 p-4 bg-gray-100 rounded-lg text-left">
            <h3 className="font-semibold mb-2">Información de diagnóstico:</h3>
            <p><strong>Usuario autenticado:</strong> {user ? 'Sí' : 'No'}</p>
            <p><strong>Rol:</strong> {user?.role || 'No disponible'}</p>
            <p><strong>Email:</strong> {user?.email || 'No disponible'}</p>
          </div>
        </div>
      </div>
    );
  }

  console.log('✅ AdminGlobalSettings: Renderizando página principal');
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a1a]">
      {/* Header */}
      <div className="bg-white dark:bg-[#333333] shadow-sm border-b border-gray-200 dark:border-[#555555]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-[#333333] dark:text-white">
                  Configuración Global del Sistema
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  Gestión de configuraciones generales de la aplicación
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>Última actualización: {new Date().toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-[#FFC300] animate-spin mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300">
                Cargando configuraciones...
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Configuración de Base de Datos */}
            <div className="bg-white dark:bg-[#333333] rounded-lg shadow-sm border border-gray-200 dark:border-[#555555] p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Database className="w-6 h-6 text-[#FFC300]" />
                <h3 className="text-lg font-semibold text-[#333333] dark:text-white">
                  Base de Datos
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Configuración de conexión y mantenimiento de la base de datos.
              </p>
              <button 
                onClick={() => setActiveModal('database')}
                className="w-full px-4 py-2 bg-[#FFC300] text-[#333333] rounded-lg hover:bg-[#FFB800] transition-colors"
              >
                Configurar
              </button>
            </div>

            {/* Configuración de Seguridad */}
            <div className="bg-white dark:bg-[#333333] rounded-lg shadow-sm border border-gray-200 dark:border-[#555555] p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Shield className="w-6 h-6 text-[#FFC300]" />
                <h3 className="text-lg font-semibold text-[#333333] dark:text-white">
                  Seguridad
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Configuración de políticas de seguridad y autenticación.
              </p>
              <button 
                onClick={() => setActiveModal('security')}
                className="w-full px-4 py-2 bg-[#FFC300] text-[#333333] rounded-lg hover:bg-[#FFB800] transition-colors"
              >
                Configurar
              </button>
            </div>

            {/* Configuración de Notificaciones */}
            <div className="bg-white dark:bg-[#333333] rounded-lg shadow-sm border border-gray-200 dark:border-[#555555] p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Bell className="w-6 h-6 text-[#FFC300]" />
                <h3 className="text-lg font-semibold text-[#333333] dark:text-white">
                  Notificaciones
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Configuración de notificaciones push y por email.
              </p>
              <button 
                onClick={() => setActiveModal('notifications')}
                className="w-full px-4 py-2 bg-[#FFC300] text-[#333333] rounded-lg hover:bg-[#FFB800] transition-colors"
              >
                Configurar
              </button>
            </div>

            {/* Configuración de Internacionalización */}
            <div className="bg-white dark:bg-[#333333] rounded-lg shadow-sm border border-gray-200 dark:border-[#555555] p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Globe className="w-6 h-6 text-[#FFC300]" />
                <h3 className="text-lg font-semibold text-[#333333] dark:text-white">
                  Idiomas
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Configuración de idiomas soportados y traducciones.
              </p>
              <button 
                onClick={() => setActiveModal('languages')}
                className="w-full px-4 py-2 bg-[#FFC300] text-[#333333] rounded-lg hover:bg-[#FFB800] transition-colors"
              >
                Configurar
              </button>
            </div>

            {/* Configuración de API */}
            <div className="bg-white dark:bg-[#333333] rounded-lg shadow-sm border border-gray-200 dark:border-[#555555] p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Settings className="w-6 h-6 text-[#FFC300]" />
                <h3 className="text-lg font-semibold text-[#333333] dark:text-white">
                  API
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Configuración de endpoints y límites de la API.
              </p>
              <button 
                onClick={() => setActiveModal('api')}
                className="w-full px-4 py-2 bg-[#FFC300] text-[#333333] rounded-lg hover:bg-[#FFB800] transition-colors"
              >
                Configurar
              </button>
            </div>

            {/* Configuración de Monitoreo */}
            <div className="bg-white dark:bg-[#333333] rounded-lg shadow-sm border border-gray-200 dark:border-[#555555] p-6">
              <div className="flex items-center space-x-3 mb-4">
                <RefreshCw className="w-6 h-6 text-[#FFC300]" />
                <h3 className="text-lg font-semibold text-[#333333] dark:text-white">
                  Monitoreo
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Configuración de logs y monitoreo del sistema.
              </p>
              <button 
                onClick={() => setActiveModal('monitoring')}
                className="w-full px-4 py-2 bg-[#FFC300] text-[#333333] rounded-lg hover:bg-[#FFB800] transition-colors"
              >
                Configurar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modales */}
      <ConfigModal
        isOpen={activeModal === 'database'}
        onClose={() => setActiveModal(null)}
        title="Configuración de Base de Datos"
      >
        {renderDatabaseConfig()}
      </ConfigModal>

      <ConfigModal
        isOpen={activeModal === 'security'}
        onClose={() => setActiveModal(null)}
        title="Configuración de Seguridad"
      >
        {renderSecurityConfig()}
      </ConfigModal>

      <ConfigModal
        isOpen={activeModal === 'notifications'}
        onClose={() => setActiveModal(null)}
        title="Configuración de Notificaciones"
      >
        {renderNotificationsConfig()}
      </ConfigModal>

      <ConfigModal
        isOpen={activeModal === 'languages'}
        onClose={() => setActiveModal(null)}
        title="Configuración de Idiomas"
      >
        {renderLanguagesConfig()}
      </ConfigModal>

      <ConfigModal
        isOpen={activeModal === 'api'}
        onClose={() => setActiveModal(null)}
        title="Configuración de API"
      >
        {renderApiConfig()}
      </ConfigModal>

      <ConfigModal
        isOpen={activeModal === 'monitoring'}
        onClose={() => setActiveModal(null)}
        title="Configuración de Monitoreo"
      >
        {renderMonitoringConfig()}
      </ConfigModal>

      {/* Success/Error Messages */}
      {message && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className={`px-6 py-3 rounded-lg shadow-lg ${
            message.type === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            <div className="flex items-center space-x-2">
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span>{message.text}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGlobalSettings;
