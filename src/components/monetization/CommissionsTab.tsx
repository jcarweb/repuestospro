import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  DollarSign,
  TrendingUp,
  Store,
  Users
} from 'lucide-react';
import api from '../../config/api';

interface Commission {
  _id?: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  minAmount?: number;
  maxAmount?: number;
  storeType: 'new' | 'growing' | 'established';
  isActive: boolean;
  description?: string;
}

const CommissionsTab: React.FC = () => {
  const { t } = useLanguage();
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCommission, setEditingCommission] = useState<Commission | null>(null);
  const [formData, setFormData] = useState<Partial<Commission>>({
    name: '',
    type: 'percentage',
    value: 0,
    storeType: 'new',
    isActive: true,
    description: ''
  });

  useEffect(() => {
    fetchCommissions();
  }, []);

  const fetchCommissions = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/monetization/commissions');
      setCommissions(response.data.commissions);
    } catch (error) {
      console.error('Error fetching commissions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCommission) {
        await api.put(`/monetization/commissions/${editingCommission._id}`, formData);
      } else {
        await api.post('/monetization/commissions', formData);
      }
      setShowForm(false);
      setEditingCommission(null);
      setFormData({
        name: '',
        type: 'percentage',
        value: 0,
        storeType: 'new',
        isActive: true,
        description: ''
      });
      fetchCommissions();
    } catch (error) {
      console.error('Error saving commission:', error);
    }
  };

  const handleEdit = (commission: Commission) => {
    setEditingCommission(commission);
    setFormData(commission);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta comisión?')) {
      try {
        await api.delete(`/monetization/commissions/${id}`);
        fetchCommissions();
      } catch (error) {
        console.error('Error deleting commission:', error);
      }
    }
  };

  const getStoreTypeLabel = (type: string) => {
    switch (type) {
      case 'new': return 'Tienda Nueva';
      case 'growing': return 'Tienda en Crecimiento';
      case 'established': return 'Tienda Establecida';
      default: return type;
    }
  };

  const getStoreTypeIcon = (type: string) => {
    switch (type) {
      case 'new': return <Store className="w-4 h-4" />;
      case 'growing': return <TrendingUp className="w-4 h-4" />;
      case 'established': return <Users className="w-4 h-4" />;
      default: return <Store className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#333333] dark:text-white">
            {t('monetization.commissions.title')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Configuración de comisiones por tipo de tienda
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-[#FFC300] text-[#333333] rounded-lg hover:bg-[#FFB800] transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Comisión</span>
        </button>
      </div>

      {/* Commissions Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FFC300] mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Cargando comisiones...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {commissions.map((commission) => (
            <div
              key={commission._id}
              className={`bg-white dark:bg-[#444444] rounded-lg border border-gray-200 dark:border-[#555555] p-6 ${
                !commission.isActive ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  {getStoreTypeIcon(commission.storeType)}
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {getStoreTypeLabel(commission.storeType)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(commission)}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => commission._id && handleDelete(commission._id)}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-[#333333] dark:text-white mb-2">
                {commission.name}
              </h3>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Comisión:</span>
                  <span className="text-lg font-bold text-[#FFC300]">
                    {commission.type === 'percentage' ? `${commission.value}%` : `$${commission.value}`}
                  </span>
                </div>

                {commission.minAmount && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Mínimo:</span>
                    <span className="text-sm font-medium">${commission.minAmount}</span>
                  </div>
                )}

                {commission.maxAmount && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Máximo:</span>
                    <span className="text-sm font-medium">${commission.maxAmount}</span>
                  </div>
                )}
              </div>

              {commission.description && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  {commission.description}
                </p>
              )}

              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  commission.isActive 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                }`}>
                  {commission.isActive ? 'Activa' : 'Inactiva'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && commissions.length === 0 && (
        <div className="text-center py-12">
          <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No hay comisiones configuradas
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Comienza creando tu primera comisión para diferentes tipos de tiendas.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-[#FFC300] text-[#333333] rounded-lg hover:bg-[#FFB800] transition-colors mx-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Primera Comisión</span>
          </button>
        </div>
      )}

      {/* Commission Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-[#333333] rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-[#333333] dark:text-white mb-4">
                {editingCommission ? 'Editar Comisión' : 'Nueva Comisión'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre de la Comisión
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#555555] rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-transparent bg-white dark:bg-[#444444] text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo de Comisión
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'percentage' | 'fixed' })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#555555] rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-transparent bg-white dark:bg-[#444444] text-gray-900 dark:text-white"
                  >
                    <option value="percentage">Porcentaje (%)</option>
                    <option value="fixed">Monto Fijo ($)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Valor
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#555555] rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-transparent bg-white dark:bg-[#444444] text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo de Tienda
                  </label>
                  <select
                    value={formData.storeType}
                    onChange={(e) => setFormData({ ...formData, storeType: e.target.value as 'new' | 'growing' | 'established' })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#555555] rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-transparent bg-white dark:bg-[#444444] text-gray-900 dark:text-white"
                  >
                    <option value="new">Tienda Nueva</option>
                    <option value="growing">Tienda en Crecimiento</option>
                    <option value="established">Tienda Establecida</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Monto Mínimo (opcional)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.minAmount || ''}
                      onChange={(e) => setFormData({ ...formData, minAmount: e.target.value ? parseFloat(e.target.value) : undefined })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-[#555555] rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-transparent bg-white dark:bg-[#444444] text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Monto Máximo (opcional)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.maxAmount || ''}
                      onChange={(e) => setFormData({ ...formData, maxAmount: e.target.value ? parseFloat(e.target.value) : undefined })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-[#555555] rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-transparent bg-white dark:bg-[#444444] text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Descripción (opcional)
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#555555] rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-transparent bg-white dark:bg-[#444444] text-gray-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-700 dark:text-gray-300">
                    Comisión activa
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingCommission(null);
                      setFormData({
                        name: '',
                        type: 'percentage',
                        value: 0,
                        storeType: 'new',
                        isActive: true,
                        description: ''
                      });
                    }}
                    className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex items-center space-x-2 px-4 py-2 bg-[#FFC300] text-[#333333] rounded-lg hover:bg-[#FFB800]"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingCommission ? 'Actualizar' : 'Crear'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommissionsTab;
