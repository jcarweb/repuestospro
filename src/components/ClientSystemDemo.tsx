import React, { useState } from 'react';
import ClientLayout from './ClientLayout';
import ClientDashboard from '../pages/ClientDashboard';
import { 
  ShoppingCart, 
  Package, 
  Heart, 
  User, 
  Settings, 
  Shield,
  LogOut,
  Menu,
  X
} from 'lucide-react';

const ClientSystemDemo: React.FC = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'products' | 'cart' | 'profile'>('dashboard');
  const [cartItemCount, setCartItemCount] = useState(3);

  const views = [
    { id: 'dashboard', label: 'Dashboard', icon: Package, color: 'bg-blue-500' },
    { id: 'products', label: 'Productos', icon: Package, color: 'bg-green-500' },
    { id: 'cart', label: 'Carrito', icon: ShoppingCart, color: 'bg-purple-500' },
    { id: 'profile', label: 'Perfil', icon: User, color: 'bg-orange-500' }
  ];

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <ClientDashboard />;
      case 'products':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Catálogo de Productos</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Aquí verías el catálogo completo de productos para comprar.
            </p>
          </div>
        );
      case 'cart':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Carrito de Compras</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Aquí verías los productos en tu carrito.
            </p>
          </div>
        );
      case 'profile':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Perfil del Usuario</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Aquí verías la información de tu perfil.
            </p>
          </div>
        );
      default:
        return <ClientDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header de Demostración */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Sistema del Cliente - Demostración
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Prueba las diferentes funcionalidades del sistema del cliente
          </p>
        </div>
      </header>

      {/* Selector de Vistas */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 py-3">
          <div className="flex flex-wrap gap-2">
            {views.map((view) => {
              const Icon = view.icon;
              return (
                <button
                  key={view.id}
                  onClick={() => setCurrentView(view.id as any)}
                  className={`
                    flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${currentView === view.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{view.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <ClientLayout>
        {renderContent()}
      </ClientLayout>

      {/* Información de la Demostración */}
      <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 max-w-sm">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
          Características del Sistema
        </h3>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• Header limpio con logo y usuario</li>
          <li>• Sidebar ocultable para el cliente</li>
          <li>• Acceso al carrito en el header</li>
          <li>• Menú de usuario completo</li>
          <li>• Acceso al ecommerce</li>
          <li>• Dashboard personalizado</li>
        </ul>
      </div>
    </div>
  );
};

export default ClientSystemDemo;
