import React from 'react';
import { Folder, Plus, Edit, Trash2 } from 'lucide-react';

const AdminCategories: React.FC = () => {
  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Categorías</h1>
        <p className="text-gray-600 mt-2">Organiza los productos por categorías</p>
      </div>

      {/* Barra de herramientas */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-5 h-5" />
            Nueva Categoría
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Categorías Existentes</h3>
          <div className="text-center py-12">
            <Folder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Esta funcionalidad estará disponible próximamente</p>
            <p className="text-sm text-gray-500 mt-2">Aquí podrás crear y gestionar las categorías de productos</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCategories; 