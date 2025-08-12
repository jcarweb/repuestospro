import React from 'react';
import { Package, Plus, Search, Filter } from 'lucide-react';

const AdminProducts: React.FC = () => {
  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Productos</h1>
        <p className="text-gray-600 mt-2">Administra el catálogo de productos</p>
      </div>

      {/* Barra de herramientas */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar productos..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
          <Filter className="w-5 h-5" />
          Filtros
        </button>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-5 h-5" />
          Agregar Producto
        </button>
      </div>

      {/* Contenido principal */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Lista de Productos</h3>
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Esta funcionalidad estará disponible próximamente</p>
            <p className="text-sm text-gray-500 mt-2">Aquí podrás gestionar todos los productos del catálogo</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts; 