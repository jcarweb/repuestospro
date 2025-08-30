import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useActiveStore } from '../contexts/ActiveStoreContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useSidebarConfig, type SidebarConfig } from '../hooks/useSidebarConfig';
import { 
  Settings, 
  Layout, 
  Eye, 
  EyeOff, 
  Move, 
  Palette, 
  Save, 
  RotateCcw,
  ChevronUp,
  ChevronDown,
  Home,
  Package,
  Tag,
  ShoppingCart,
  ShoppingBag,
  Truck,
  BarChart3,
  MessageSquare,
  Star,
  Building2,
  Users,
  Bell,
  CreditCard,
  MapPin,
  Clock,
  Gift,
  TrendingUp,
  Database,
  FileText,
  Shield,
  Key,
  Smartphone,
  Navigation,
  Calendar,
  DollarSign,
  Heart
} from 'lucide-react';

const StoreManagerSettings: React.FC = () => {
  const { user } = useAuth();
  const { activeStore } = useActiveStore();
  const { t } = useLanguage();
  
  const { config, saveConfig, resetConfig } = useSidebarConfig();
  const [localConfig, setLocalConfig] = useState<SidebarConfig>(config);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Sincronizar configuración local con la del hook
  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const handleSave = async () => {
    setLoading(true);
    const success = await saveConfig(localConfig);
    if (success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setLoading(false);
  };

  const handleReset = async () => {
    if (window.confirm('¿Estás seguro de que quieres restaurar la configuración por defecto?')) {
      await resetConfig();
      setLocalConfig(config);
    }
  };

  const toggleMenuItemVisibility = (itemId: string) => {
    setLocalConfig(prev => ({
      ...prev,
      menuItems: prev.menuItems.map(item =>
        item.id === itemId ? { ...item, visible: !item.visible } : item
      )
    }));
  };

  const moveMenuItem = (itemId: string, direction: 'up' | 'down') => {
    setLocalConfig(prev => {
      const items = [...prev.menuItems];
      const currentIndex = items.findIndex(item => item.id === itemId);
      
      if (direction === 'up' && currentIndex > 0) {
        [items[currentIndex], items[currentIndex - 1]] = [items[currentIndex - 1], items[currentIndex]];
      } else if (direction === 'down' && currentIndex < items.length - 1) {
        [items[currentIndex], items[currentIndex + 1]] = [items[currentIndex + 1], items[currentIndex]];
      }
      
      return {
        ...prev,
        menuItems: items.map((item, index) => ({ ...item, order: index + 1 }))
      };
    });
  };

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      Home, Package, Tag, ShoppingCart, ShoppingBag, Truck, BarChart3,
      MessageSquare, Star, Building2, Users, Bell, CreditCard, MapPin,
      Clock, Gift, TrendingUp, Database, FileText, Shield, Key,
      Smartphone, Navigation, Calendar, DollarSign, Heart
    };
    return iconMap[iconName] || Home;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Configuración del Sidebar
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Personaliza la apariencia y funcionalidad del sidebar para {activeStore?.name || 'tu tienda'}
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                previewMode
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {previewMode ? 'Ocultar Vista Previa' : 'Vista Previa'}
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              <RotateCcw className="w-4 h-4 inline mr-2" />
              Restaurar
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </span>
              ) : (
                <span className="flex items-center">
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </span>
              )}
            </button>
          </div>
        </div>
        
        {saved && (
          <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            ✅ Configuración guardada exitosamente
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Panel de Configuración */}
        <div className="lg:col-span-2 space-y-6">
          {/* Configuración General */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Configuración General
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tema del Sidebar
                </label>
                <select
                  value={localConfig.theme}
                  onChange={(e) => setLocalConfig(prev => ({ ...prev, theme: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="light">Claro</option>
                  <option value="dark">Oscuro</option>
                  <option value="auto">Automático</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ancho del Sidebar
                </label>
                <select
                  value={localConfig.width}
                  onChange={(e) => setLocalConfig(prev => ({ ...prev, width: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="compact">Compacto (200px)</option>
                  <option value="normal">Normal (256px)</option>
                  <option value="wide">Ancho (320px)</option>
                </select>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Mostrar Iconos</h3>
                  <p className="text-xs text-gray-500">Mostrar iconos junto a los elementos del menú</p>
                </div>
                <button
                  onClick={() => setLocalConfig(prev => ({ ...prev, showIcons: !prev.showIcons }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    localConfig.showIcons ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    localConfig.showIcons ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Mostrar Descripciones</h3>
                  <p className="text-xs text-gray-500">Mostrar tooltips con descripciones</p>
                </div>
                <button
                  onClick={() => setLocalConfig(prev => ({ ...prev, showDescriptions: !prev.showDescriptions }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    localConfig.showDescriptions ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    localConfig.showDescriptions ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Mostrar Información de Usuario</h3>
                  <p className="text-xs text-gray-500">Mostrar perfil de usuario en el footer</p>
                </div>
                <button
                  onClick={() => setLocalConfig(prev => ({ ...prev, showUserInfo: !prev.showUserInfo }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    localConfig.showUserInfo ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    localConfig.showUserInfo ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Mostrar Información de Tienda</h3>
                  <p className="text-xs text-gray-500">Mostrar información de la tienda activa</p>
                </div>
                <button
                  onClick={() => setLocalConfig(prev => ({ ...prev, showStoreInfo: !prev.showStoreInfo }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    localConfig.showStoreInfo ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    localConfig.showStoreInfo ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Animaciones</h3>
                  <p className="text-xs text-gray-500">Habilitar transiciones y animaciones</p>
                </div>
                <button
                  onClick={() => setLocalConfig(prev => ({ ...prev, enableAnimations: !prev.enableAnimations }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    localConfig.enableAnimations ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    localConfig.enableAnimations ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Configuración de Menú */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Layout className="w-5 h-5 mr-2" />
              Configuración del Menú
            </h2>
            
            <div className="space-y-3">
              {localConfig.menuItems
                .sort((a, b) => a.order - b.order)
                .map((item) => {
                  const IconComponent = getIconComponent(item.icon);
                  return (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        item.visible ? 'bg-gray-50 border-gray-200' : 'bg-gray-100 border-gray-300 opacity-60'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <IconComponent className="w-5 h-5 text-gray-500" />
                        <div>
                          <h3 className="font-medium text-gray-900">{item.title}</h3>
                          <p className="text-sm text-gray-500">{item.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => moveMenuItem(item.id, 'up')}
                          disabled={item.order === 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => moveMenuItem(item.id, 'down')}
                          disabled={item.order === localConfig.menuItems.length}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleMenuItemVisibility(item.id)}
                          className={`p-1 rounded ${
                            item.visible ? 'text-green-600 hover:text-green-700' : 'text-red-600 hover:text-red-700'
                          }`}
                        >
                          {item.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Configuración de Notificaciones */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Configuración de Notificaciones
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Mostrar Badges</h3>
                  <p className="text-xs text-gray-500">Mostrar indicadores de notificaciones</p>
                </div>
                <button
                  onClick={() => setLocalConfig(prev => ({ 
                    ...prev, 
                    notifications: { ...prev.notifications, showBadge: !prev.notifications.showBadge }
                  }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    localConfig.notifications.showBadge ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    localConfig.notifications.showBadge ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Mostrar Contador</h3>
                  <p className="text-xs text-gray-500">Mostrar número de notificaciones</p>
                </div>
                <button
                  onClick={() => setLocalConfig(prev => ({ 
                    ...prev, 
                    notifications: { ...prev.notifications, showCount: !prev.notifications.showCount }
                  }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    localConfig.notifications.showCount ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    localConfig.notifications.showCount ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Posición de Notificaciones
                </label>
                <select
                  value={localConfig.notifications.position}
                  onChange={(e) => setLocalConfig(prev => ({ 
                    ...prev, 
                    notifications: { ...prev.notifications, position: e.target.value as 'top' | 'bottom' }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="top">Arriba</option>
                  <option value="bottom">Abajo</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Vista Previa */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Palette className="w-5 h-5 mr-2" />
                Vista Previa del Sidebar
              </h2>
              
              {previewMode && (
                <div className={`bg-gray-50 dark:bg-gray-900 rounded-lg p-4 ${
                  localConfig.width === 'compact' ? 'w-48' : 
                  localConfig.width === 'wide' ? 'w-80' : 'w-64'
                }`}>
                  {/* Header del Sidebar */}
                  <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                        <span className="text-white font-bold text-sm">P</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">PIEZAS YA</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Gestor de Tienda</p>
                      </div>
                    </div>
                    
                    {localConfig.showStoreInfo && activeStore && localConfig.width !== 'compact' && (
                      <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900 rounded text-xs">
                        <p className="font-medium text-blue-900 dark:text-blue-100">{activeStore.name}</p>
                        <p className="text-blue-700 dark:text-blue-300">{activeStore.city}</p>
                      </div>
                    )}
                  </div>

                  {/* Menú */}
                  <nav className="space-y-1">
                    {localConfig.menuItems
                      .filter(item => item.visible)
                      .sort((a, b) => a.order - b.order)
                      .slice(0, 6)
                      .map((item) => {
                        const IconComponent = getIconComponent(item.icon);
                        return (
                          <div
                            key={item.id}
                            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900"
                          >
                            {localConfig.showIcons && <IconComponent className="w-4 h-4" />}
                            <span className={localConfig.width === 'compact' ? 'hidden' : ''}>
                              {item.title}
                            </span>
                          </div>
                        );
                      })}
                  </nav>

                  {/* Footer */}
                  {localConfig.showUserInfo && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                        </div>
                        <div className={localConfig.width === 'compact' ? 'hidden' : ''}>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {!previewMode && (
                <div className="text-center py-8 text-gray-500">
                  <Layout className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Haz clic en "Vista Previa" para ver cómo se verá tu sidebar</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreManagerSettings;
