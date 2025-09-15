import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  Calculator,
  Receipt,
  Percent,
  DollarSign
} from 'lucide-react';
import api from '../../config/api';

interface Tax {
  _id?: string;
  name: string;
  type: 'percentage' | 'fixed';
  rate: number;
  isActive: boolean;
  description?: string;
  appliesTo: 'all' | 'products' | 'services' | 'shipping';
  minAmount?: number;
  maxAmount?: number;
  isCompound: boolean;
}

const TaxesTab: React.FC = () => {
  const { t } = useLanguage();
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTax, setEditingTax] = useState<Tax | null>(null);
  const [formData, setFormData] = useState<Partial<Tax>>({
    name: '',
    type: 'percentage',
    rate: 0,
    isActive: true,
    description: '',
    appliesTo: 'all',
    isCompound: false
  });

  useEffect(() => {
    fetchTaxes();
  }, []);

  const fetchTaxes = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/monetization/taxes');
      setTaxes(response.data.taxes);
    } catch (error) {
      console.error('Error fetching taxes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingTax) {
        await api.put(`/monetization/taxes/${editingTax._id}`, formData);
      } else {
        await api.post('/monetization/taxes', formData);
      }
      setShowForm(false);
      setEditingTax(null);
      setFormData({
        name: '',
        type: 'percentage',
        rate: 0,
        isActive: true,
        description: '',
        appliesTo: 'all',
        isCompound: false
      });
      fetchTaxes();
    } catch (error) {
      console.error('Error saving tax:', error);
    }
  };

  const handleEdit = (tax: Tax) => {
    setEditingTax(tax);
    setFormData(tax);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este impuesto?')) {
      try {
        await api.delete(`/monetization/taxes/${id}`);
        fetchTaxes();
      } catch (error) {
        console.error('Error deleting tax:', error);
      }
    }
  };

  const getTypeLabel = (type: string) => {
    return type === 'percentage' ? 'Porcentaje' : 'Monto Fijo';
  };

  const getAppliesToLabel = (appliesTo: string) => {
    switch (appliesTo) {
      case 'all': return 'Todos';
      case 'products': return 'Productos';
      case 'services': return 'Servicios';
      case 'shipping': return 'Envío';
      default: return appliesTo;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#333333] dark:text-white">
            {t('monetization.taxes.title')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Gestión de impuestos y cargos fiscales
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-[#FFC300] text-[#333333] rounded-lg hover:bg-[#FFB800] transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Impuesto</span>
        </button>
      </div>

      {/* Taxes Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FFC300] mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Cargando impuestos...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {taxes.map((tax) => (
            <div
              key={tax._id}
              className={`bg-white dark:bg-[#444444] rounded-lg border border-gray-200 dark:border-[#555555] p-6 ${
                !tax.isActive ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Calculator className="w-4 h-4 text-[#FFC300]" />
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {getTypeLabel(tax.type)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(tax)}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => tax._id && handleDelete(tax._id)}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-[#333333] dark:text-white mb-2">
                {tax.name}
              </h3>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Tasa:</span>
                  <span className="text-lg font-bold text-[#FFC300]">
                    {tax.type === 'percentage' ? `${tax.rate}%` : `$${tax.rate}`}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Aplica a:</span>
                  <span className="text-sm font-medium">{getAppliesToLabel(tax.appliesTo)}</span>
                </div>

                {tax.minAmount && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Mínimo:</span>
                    <span className="text-sm font-medium">${tax.minAmount}</span>
                  </div>
                )}

                {tax.maxAmount && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Máximo:</span>
                    <span className="text-sm font-medium">${tax.maxAmount}</span>
                  </div>
                )}
              </div>

              {tax.description && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  {tax.description}
                </p>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    tax.isActive 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                  }`}>
                    {tax.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                  {tax.isCompound && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                      Compuesto
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && taxes.length === 0 && (
        <div className="text-center py-12">
          <Receipt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No hay impuestos configurados
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Comienza creando tu primer impuesto o cargo fiscal.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-[#FFC300] text-[#333333] rounded-lg hover:bg-[#FFB800] transition-colors mx-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Primer Impuesto</span>
          </button>
        </div>
      )}

      {/* Tax Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-[#333333] rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-[#333333] dark:text-white mb-4">
                {editingTax ? 'Editar Impuesto' : 'Nuevo Impuesto'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre del Impuesto
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
                    Tipo de Impuesto
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
                    Tasa
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.rate}
                    onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#555555] rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-transparent bg-white dark:bg-[#444444] text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Aplica a
                  </label>
                  <select
                    value={formData.appliesTo}
                    onChange={(e) => setFormData({ ...formData, appliesTo: e.target.value as 'all' | 'products' | 'services' | 'shipping' })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#555555] rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-transparent bg-white dark:bg-[#444444] text-gray-900 dark:text-white"
                  >
                    <option value="all">Todos</option>
                    <option value="products">Productos</option>
                    <option value="services">Servicios</option>
                    <option value="shipping">Envío</option>
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

                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Impuesto activo</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isCompound}
                      onChange={(e) => setFormData({ ...formData, isCompound: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Impuesto compuesto (se aplica sobre otros impuestos)</span>
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingTax(null);
                      setFormData({
                        name: '',
                        type: 'percentage',
                        rate: 0,
                        isActive: true,
                        description: '',
                        appliesTo: 'all',
                        isCompound: false
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
                    <span>{editingTax ? 'Actualizar' : 'Crear'}</span>
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

export default TaxesTab;
