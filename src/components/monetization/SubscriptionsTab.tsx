import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  CreditCard,
  Star,
  Crown,
  Check,
  Users
} from 'lucide-react';
import api from '../../config/api';

interface Subscription {
  _id?: string;
  name: string;
  type: 'basic' | 'pro' | 'elite';
  price: number;
  billingCycle: 'monthly' | 'yearly';
  features: string[];
  isActive: boolean;
  description?: string;
  maxStores?: number;
  maxProducts?: number;
  prioritySupport: boolean;
  featuredListing: boolean;
  advancedAnalytics: boolean;
  customDomain: boolean;
}

const SubscriptionsTab: React.FC = () => {
  const { t } = useLanguage();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [formData, setFormData] = useState<Partial<Subscription>>({
    name: '',
    type: 'basic',
    price: 0,
    billingCycle: 'monthly',
    features: [],
    isActive: true,
    description: '',
    prioritySupport: false,
    featuredListing: false,
    advancedAnalytics: false,
    customDomain: false
  });

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/monetization/subscriptions');
      setSubscriptions(response.data.subscriptions);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingSubscription) {
        await api.put(`/monetization/subscriptions/${editingSubscription._id}`, formData);
      } else {
        await api.post('/monetization/subscriptions', formData);
      }
      setShowForm(false);
      setEditingSubscription(null);
      setFormData({
        name: '',
        type: 'basic',
        price: 0,
        billingCycle: 'monthly',
        features: [],
        isActive: true,
        description: '',
        prioritySupport: false,
        featuredListing: false,
        advancedAnalytics: false,
        customDomain: false
      });
      fetchSubscriptions();
    } catch (error) {
      console.error('Error saving subscription:', error);
    }
  };

  const handleEdit = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setFormData(subscription);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta suscripción?')) {
      try {
        await api.delete(`/monetization/subscriptions/${id}`);
        fetchSubscriptions();
      } catch (error) {
        console.error('Error deleting subscription:', error);
      }
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'basic': return 'Básico';
      case 'pro': return 'Pro';
      case 'elite': return 'Élite';
      default: return type;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'basic': return <Users className="w-4 h-4" />;
      case 'pro': return <Star className="w-4 h-4" />;
      case 'elite': return <Crown className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getBillingCycleLabel = (cycle: string) => {
    return cycle === 'monthly' ? 'Mensual' : 'Anual';
  };

  const toggleFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features?.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...(prev.features || []), feature]
    }));
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#333333] dark:text-white">
            {t('monetization.subscriptions.title')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Gestión de planes de suscripción premium
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-[#FFC300] text-[#333333] rounded-lg hover:bg-[#FFB800] transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Plan</span>
        </button>
      </div>

      {/* Subscriptions Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FFC300] mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Cargando suscripciones...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subscriptions.map((subscription) => (
            <div
              key={subscription._id}
              className={`bg-white dark:bg-[#444444] rounded-lg border border-gray-200 dark:border-[#555555] p-6 ${
                !subscription.isActive ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  {getTypeIcon(subscription.type)}
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {getTypeLabel(subscription.type)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(subscription)}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => subscription._id && handleDelete(subscription._id)}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-[#333333] dark:text-white mb-2">
                {subscription.name}
              </h3>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Precio:</span>
                  <span className="text-lg font-bold text-[#FFC300]">
                    ${subscription.price}/{getBillingCycleLabel(subscription.billingCycle)}
                  </span>
                </div>

                {subscription.maxStores && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Tiendas máx:</span>
                    <span className="text-sm font-medium">{subscription.maxStores}</span>
                  </div>
                )}

                {subscription.maxProducts && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Productos máx:</span>
                    <span className="text-sm font-medium">{subscription.maxProducts}</span>
                  </div>
                )}
              </div>

              {subscription.description && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  {subscription.description}
                </p>
              )}

              {/* Features */}
              <div className="space-y-2 mb-4">
                {subscription.prioritySupport && (
                  <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
                    <Check className="w-4 h-4" />
                    <span>Soporte prioritario</span>
                  </div>
                )}
                {subscription.featuredListing && (
                  <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
                    <Check className="w-4 h-4" />
                    <span>Listado destacado</span>
                  </div>
                )}
                {subscription.advancedAnalytics && (
                  <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
                    <Check className="w-4 h-4" />
                    <span>Analytics avanzado</span>
                  </div>
                )}
                {subscription.customDomain && (
                  <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
                    <Check className="w-4 h-4" />
                    <span>Dominio personalizado</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  subscription.isActive 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                }`}>
                  {subscription.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && subscriptions.length === 0 && (
        <div className="text-center py-12">
          <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No hay planes de suscripción configurados
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Comienza creando tu primer plan de suscripción premium.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-[#FFC300] text-[#333333] rounded-lg hover:bg-[#FFB800] transition-colors mx-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Primer Plan</span>
          </button>
        </div>
      )}

      {/* Subscription Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-[#333333] rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-[#333333] dark:text-white mb-4">
                {editingSubscription ? 'Editar Plan' : 'Nuevo Plan'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre del Plan
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
                    Tipo de Plan
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'basic' | 'pro' | 'elite' })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#555555] rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-transparent bg-white dark:bg-[#444444] text-gray-900 dark:text-white"
                  >
                    <option value="basic">Básico</option>
                    <option value="pro">Pro</option>
                    <option value="elite">Élite</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Precio
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-[#555555] rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-transparent bg-white dark:bg-[#444444] text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Ciclo de Facturación
                    </label>
                    <select
                      value={formData.billingCycle}
                      onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value as 'monthly' | 'yearly' })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-[#555555] rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-transparent bg-white dark:bg-[#444444] text-gray-900 dark:text-white"
                    >
                      <option value="monthly">Mensual</option>
                      <option value="yearly">Anual</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tiendas Máximas (opcional)
                    </label>
                    <input
                      type="number"
                      value={formData.maxStores || ''}
                      onChange={(e) => setFormData({ ...formData, maxStores: e.target.value ? parseInt(e.target.value) : undefined })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-[#555555] rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-transparent bg-white dark:bg-[#444444] text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Productos Máximos (opcional)
                    </label>
                    <input
                      type="number"
                      value={formData.maxProducts || ''}
                      onChange={(e) => setFormData({ ...formData, maxProducts: e.target.value ? parseInt(e.target.value) : undefined })}
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

                {/* Features */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Características
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.prioritySupport}
                        onChange={(e) => setFormData({ ...formData, prioritySupport: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Soporte prioritario</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.featuredListing}
                        onChange={(e) => setFormData({ ...formData, featuredListing: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Listado destacado</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.advancedAnalytics}
                        onChange={(e) => setFormData({ ...formData, advancedAnalytics: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Analytics avanzado</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.customDomain}
                        onChange={(e) => setFormData({ ...formData, customDomain: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Dominio personalizado</span>
                    </label>
                  </div>
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
                    Plan activo
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingSubscription(null);
                      setFormData({
                        name: '',
                        type: 'basic',
                        price: 0,
                        billingCycle: 'monthly',
                        features: [],
                        isActive: true,
                        description: '',
                        prioritySupport: false,
                        featuredListing: false,
                        advancedAnalytics: false,
                        customDomain: false
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
                    <span>{editingSubscription ? 'Actualizar' : 'Crear'}</span>
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

export default SubscriptionsTab;
