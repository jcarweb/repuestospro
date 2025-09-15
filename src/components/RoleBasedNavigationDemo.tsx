import React, { useState } from 'react';
import RoleBasedNavigation from './RoleBasedNavigation';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  Menu, 
  X, 
  User, 
  Shield, 
  Store, 
  Truck,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react';

const RoleBasedNavigationDemo: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { theme, isDark } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<'sidebar' | 'header' | 'mobile'>('sidebar');

  const variants = [
    { id: 'sidebar', label: 'Sidebar', icon: Monitor },
    { id: 'header', label: 'Header', icon: Tablet },
    { id: 'mobile', label: 'Mobile', icon: Smartphone }
  ] as const;

  const roles = [
    { id: 'admin', label: 'Administrador', icon: Shield, color: 'text-red-600' },
    { id: 'store_manager', label: 'Gestor de Tienda', icon: Store, color: 'text-blue-600' },
    { id: 'delivery', label: 'Delivery', icon: Truck, color: 'text-green-600' },
    { id: 'client', label: 'Cliente', icon: User, color: 'text-purple-600' }
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header de demostración */}
      <header className={`
        fixed top-0 left-0 right-0 z-40 border-b
        ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
      `}>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">RoleBasedNavigation Demo</h1>
            
            {/* Selector de variante */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Variante:</span>
              <div className="flex space-x-1">
                {variants.map((variant) => {
                  const Icon = variant.icon;
                  return (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant.id)}
                      className={`
                        p-2 rounded-lg transition-colors
                        ${selectedVariant === variant.id
                          ? 'bg-blue-500 text-white'
                          : isDark 
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }
                      `}
                      title={variant.label}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Información del usuario actual */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {roles.map((role) => {
                if (user?.role === role.id) {
                  const Icon = role.icon;
                  return (
                    <div key={role.id} className="flex items-center space-x-2">
                      <Icon className={`w-5 h-5 ${role.color}`} />
                      <span className="text-sm font-medium">{role.label}</span>
                    </div>
                  );
                }
                return null;
              })}
            </div>

            {/* Botón de menú móvil */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`
                p-2 rounded-lg lg:hidden
                ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}
              `}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <div className="pt-16 flex">
        {/* Sidebar para variante sidebar */}
        {selectedVariant === 'sidebar' && (
          <RoleBasedNavigation
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            variant="sidebar"
          />
        )}

        {/* Contenido principal */}
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Demostración de Navegación Basada en Roles</h2>
              <p className="text-lg mb-6">
                Este componente demuestra cómo la navegación se adapta automáticamente según el rol del usuario,
                incluyendo temas claro/oscuro y traducciones en tiempo real.
              </p>
            </div>

            {/* Información del usuario */}
            <div className={`
              p-6 rounded-lg mb-6
              ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}
            `}>
              <h3 className="text-lg font-semibold mb-4">Información del Usuario</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Nombre:</p>
                  <p className="font-medium">{user?.name || 'No disponible'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email:</p>
                  <p className="font-medium">{user?.email || 'No disponible'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Rol:</p>
                  <div className="flex items-center space-x-2">
                    {roles.map((role) => {
                      if (user?.role === role.id) {
                        const Icon = role.icon;
                        return (
                          <div key={role.id} className="flex items-center space-x-2">
                            <Icon className={`w-4 h-4 ${role.color}`} />
                            <span className="font-medium">{role.label}</span>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tema:</p>
                  <p className="font-medium capitalize">{theme}</p>
                </div>
              </div>
            </div>

            {/* Características del componente */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className={`
                p-6 rounded-lg
                ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}
              `}>
                <h4 className="font-semibold mb-2">🎨 Temas</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Soporte completo para tema claro y oscuro con transiciones suaves
                </p>
              </div>

              <div className={`
                p-6 rounded-lg
                ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}
              `}>
                <h4 className="font-semibold mb-2">🌍 Traducciones</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Traducciones en tiempo real para español, inglés y portugués
                </p>
              </div>

              <div className={`
                p-6 rounded-lg
                ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}
              `}>
                <h4 className="font-semibold mb-2">👥 Roles</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Menús específicos para admin, gestor, delivery y cliente
                </p>
              </div>

              <div className={`
                p-6 rounded-lg
                ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}
              `}>
                <h4 className="font-semibold mb-2">📱 Responsive</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Adaptable a desktop, tablet y móvil con diferentes variantes
                </p>
              </div>

              <div className={`
                p-6 rounded-lg
                ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}
              `}>
                <h4 className="font-semibold mb-2">⚡ Performance</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Re-renders optimizados y lazy loading de componentes
                </p>
              </div>

              <div className={`
                p-6 rounded-lg
                ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}
              `}>
                <h4 className="font-semibold mb-2">🔧 Configurable</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Fácil personalización de colores, iconos y estructura
                </p>
              </div>
            </div>

            {/* Instrucciones de uso */}
            <div className={`
              mt-8 p-6 rounded-lg
              ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}
            `}>
              <h3 className="text-lg font-semibold mb-4">Instrucciones de Uso</h3>
              <div className="space-y-3 text-sm">
                <p>
                  <strong>1. Variantes:</strong> Usa los botones en la parte superior para cambiar entre sidebar, header y móvil.
                </p>
                <p>
                  <strong>2. Roles:</strong> El componente detecta automáticamente el rol del usuario y muestra el menú correspondiente.
                </p>
                <p>
                  <strong>3. Temas:</strong> El tema se sincroniza con el contexto global de la aplicación.
                </p>
                <p>
                  <strong>4. Traducciones:</strong> Los textos se actualizan automáticamente al cambiar el idioma.
                </p>
                <p>
                  <strong>5. Responsive:</strong> En móvil, el menú se convierte en un overlay deslizable.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Navegación móvil */}
      {selectedVariant === 'mobile' && (
        <RoleBasedNavigation
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          variant="mobile"
        />
      )}

      {/* Navegación en header */}
      {selectedVariant === 'header' && (
        <div className="fixed top-16 left-0 right-0 z-30 border-b bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <div className="px-4 py-2">
            <RoleBasedNavigation
              isOpen={true}
              onClose={() => {}}
              variant="header"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleBasedNavigationDemo;
