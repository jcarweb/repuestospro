import React, { useState } from 'react';
import SimpleClientSidebar from './SimpleClientSidebar';
import { useAuth } from '../contexts/AuthContext';

const TestSimpleSidebar: React.FC = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header de prueba */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          Prueba del Sidebar Simple del Cliente
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Verificando que NO aparezca el logo
        </p>
      </header>

      {/* Contenido principal */}
      <div className="flex pt-16">
        {/* Sidebar */}
        <SimpleClientSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapse}
        />

        {/* Contenido principal */}
        <main className={`
          flex-1 transition-all duration-300 p-6
          ${isSidebarOpen ? 'lg:ml-64' : ''}
          ${isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}
        `}>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Contenido Principal
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Este es el contenido principal. El sidebar debería estar a la izquierda <strong>SIN LOGO</strong>.
            </p>
            
            <div className="mb-4 p-4 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg">
              <h3 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                ⚠️ Verificación Importante:
              </h3>
              <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                <li>• El sidebar NO debe mostrar el logo de PIEZAS YA</li>
                <li>• Solo debe mostrar botones de control (colapsar/cerrar)</li>
                <li>• El menú debe estar limpio sin logo en la parte superior</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <button
                onClick={toggleSidebar}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 mr-2"
              >
                {isSidebarOpen ? 'Ocultar Sidebar' : 'Mostrar Sidebar'}
              </button>
              
              <button
                onClick={toggleSidebarCollapse}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                {isSidebarCollapsed ? 'Expandir Sidebar' : 'Colapsar Sidebar'}
              </button>
            </div>

            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                Estado del Sidebar:
              </h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Abierto: {isSidebarOpen ? 'Sí' : 'No'}</li>
                <li>• Colapsado: {isSidebarCollapsed ? 'Sí' : 'No'}</li>
                <li>• Usuario: {user?.name || 'No autenticado'}</li>
                <li>• Email: {user?.email || 'No disponible'}</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TestSimpleSidebar;
