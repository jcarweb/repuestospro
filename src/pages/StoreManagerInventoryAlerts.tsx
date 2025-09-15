import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  Package, 
  Settings,
  Filter,
  Search,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface Alert {
  _id: string;
  product: {
    _id: string;
    name: string;
    sku: string;
    category: string;
    brand: string;
  };
  alertType: 'low_stock' | 'out_of_stock' | 'custom';
  threshold: number;
  isActive: boolean;
  lastTriggered?: string;
  notificationSettings: {
    email: boolean;
    inApp: boolean;
    sms: boolean;
  };
  createdAt: string;
}

interface Product {
  _id: string;
  name: string;
  sku: string;
  category: string;
  brand: string;
  currentStock: number;
}

const StoreManagerInventoryAlerts: React.FC = () => {
  const { t } = useLanguage();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null);
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [stores, setStores] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Formulario para crear/editar alerta
  const [formData, setFormData] = useState({
    productId: '',
    alertType: 'low_stock' as 'low_stock' | 'out_of_stock' | 'custom',
    threshold: 5,
    notificationSettings: {
      email: true,
      inApp: true,
      sms: false
    }
  });

  useEffect(() => {
    fetchUserStores();
  }, []);

  useEffect(() => {
    if (selectedStore) {
      fetchAlerts();
      fetchProducts();
    }
  }, [selectedStore]);

  const fetchUserStores = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/stores/user-stores', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        let storesArray = [];
        if (Array.isArray(data.data)) {
          storesArray = data.data;
        } else if (data.data && Array.isArray(data.data.stores)) {
          storesArray = data.data.stores;
        }
        setStores(storesArray);
        if (storesArray.length > 0) {
          setSelectedStore(storesArray[0]._id);
        }
      }
    } catch (error) {
      console.error('Error fetching user stores:', error);
    }
  };

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/inventory-alerts/store/${selectedStore}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setAlerts(data.data.alerts);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/inventory/store-manager/inventory?storeId=${selectedStore}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        const productsWithStock = data.data.inventory.map((item: any) => ({
          _id: item.product._id,
          name: item.product.name,
          sku: item.product.sku,
          category: item.product.category,
          brand: item.product.brand,
          currentStock: item.mainStock.available
        }));
        setProducts(productsWithStock);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/inventory-alerts/store/${selectedStore}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        setShowCreateModal(false);
        setFormData({
          productId: '',
          alertType: 'low_stock',
          threshold: 5,
          notificationSettings: {
            email: true,
            inApp: true,
            sms: false
          }
        });
        fetchAlerts();
      } else {
        alert(data.message || 'Error creando alerta');
      }
    } catch (error) {
      console.error('Error creating alert:', error);
      alert('Error creando alerta');
    }
  };

  const handleEditAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAlert) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/inventory-alerts/${editingAlert._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        setShowEditModal(false);
        setEditingAlert(null);
        fetchAlerts();
      } else {
        alert(data.message || 'Error actualizando alerta');
      }
    } catch (error) {
      console.error('Error updating alert:', error);
      alert('Error actualizando alerta');
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta alerta?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/inventory-alerts/${alertId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        fetchAlerts();
      } else {
        alert(data.message || 'Error eliminando alerta');
      }
    } catch (error) {
      console.error('Error deleting alert:', error);
      alert('Error eliminando alerta');
    }
  };

  const handleToggleAlert = async (alertId: string, isActive: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/inventory-alerts/${alertId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !isActive })
      });
      const data = await response.json();
      if (data.success) {
        fetchAlerts();
      }
    } catch (error) {
      console.error('Error toggling alert:', error);
    }
  };

  const openEditModal = (alert: Alert) => {
    setEditingAlert(alert);
    setFormData({
      productId: alert.product._id,
      alertType: alert.alertType,
      threshold: alert.threshold,
      notificationSettings: alert.notificationSettings
    });
    setShowEditModal(true);
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesType = filterType === 'all' || alert.alertType === filterType;
    const matchesSearch = alert.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getAlertTypeLabel = (type: string) => {
    switch (type) {
      case 'low_stock': return 'Stock Bajo';
      case 'out_of_stock': return 'Sin Stock';
      case 'custom': return 'Personalizada';
      default: return type;
    }
  };

  const getAlertTypeColor = (type: string) => {
    switch (type) {
      case 'low_stock': return 'text-yellow-600 bg-yellow-100';
      case 'out_of_stock': return 'text-red-600 bg-red-100';
      case 'custom': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (!Array.isArray(stores) || stores.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
              No tienes tiendas asignadas
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Contacta al administrador para que te asigne una tienda.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Bell className="w-8 h-8 text-blue-600" />
                Alertas de Inventario
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Configura alertas para recibir notificaciones cuando tus productos se agoten
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nueva Alerta
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tienda
              </label>
              <select
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                {Array.isArray(stores) && stores.map(store => (
                  <option key={store._id} value={store._id}>{store.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo de Alerta
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">Todas</option>
                <option value="low_stock">Stock Bajo</option>
                <option value="out_of_stock">Sin Stock</option>
                <option value="custom">Personalizada</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Buscar
              </label>
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchAlerts}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Filter className="w-4 h-4" />
                Filtrar
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Alertas */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Cargando alertas...</p>
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No hay alertas configuradas
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Crea tu primera alerta para recibir notificaciones cuando tus productos se agoten
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto transition-colors"
              >
                <Plus className="w-5 h-5" />
                Crear Primera Alerta
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Umbral
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Notificaciones
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredAlerts.map((alert) => (
                    <tr key={alert._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {alert.product.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            SKU: {alert.product.sku}
                          </div>
                          <div className="text-xs text-gray-400">
                            {alert.product.brand} • {alert.product.category}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAlertTypeColor(alert.alertType)}`}>
                          {getAlertTypeLabel(alert.alertType)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {alert.threshold} unidades
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleAlert(alert._id, alert.isActive)}
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            alert.isActive
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                          }`}
                        >
                          {alert.isActive ? (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          ) : (
                            <XCircle className="w-3 h-3 mr-1" />
                          )}
                          {alert.isActive ? 'Activa' : 'Inactiva'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex flex-col space-y-1">
                          {alert.notificationSettings.email && (
                            <span className="text-xs">📧 Email</span>
                          )}
                          {alert.notificationSettings.inApp && (
                            <span className="text-xs">🔔 App</span>
                          )}
                          {alert.notificationSettings.sms && (
                            <span className="text-xs">📱 SMS</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openEditModal(alert)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAlert(alert._id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Crear Alerta */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Crear Nueva Alerta
              </h3>
              <form onSubmit={handleCreateAlert}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Producto
                    </label>
                    <select
                      value={formData.productId}
                      onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                    >
                      <option value="">Seleccionar producto</option>
                      {products.map(product => (
                        <option key={product._id} value={product._id}>
                          {product.name} ({product.sku}) - Stock: {product.currentStock}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tipo de Alerta
                    </label>
                    <select
                      value={formData.alertType}
                      onChange={(e) => setFormData({ ...formData, alertType: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="low_stock">Stock Bajo</option>
                      <option value="out_of_stock">Sin Stock</option>
                      <option value="custom">Personalizada</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Umbral (unidades)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.threshold}
                      onChange={(e) => setFormData({ ...formData, threshold: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Notificaciones
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.notificationSettings.email}
                          onChange={(e) => setFormData({
                            ...formData,
                            notificationSettings: {
                              ...formData.notificationSettings,
                              email: e.target.checked
                            }
                          })}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Email</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.notificationSettings.inApp}
                          onChange={(e) => setFormData({
                            ...formData,
                            notificationSettings: {
                              ...formData.notificationSettings,
                              inApp: e.target.checked
                            }
                          })}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">En la App</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.notificationSettings.sms}
                          onChange={(e) => setFormData({
                            ...formData,
                            notificationSettings: {
                              ...formData.notificationSettings,
                              sms: e.target.checked
                            }
                          })}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">SMS</span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Crear Alerta
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Editar Alerta */}
        {showEditModal && editingAlert && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Editar Alerta
              </h3>
              <form onSubmit={handleEditAlert}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Producto
                    </label>
                    <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-400">
                      {editingAlert.product.name} ({editingAlert.product.sku})
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tipo de Alerta
                    </label>
                    <select
                      value={formData.alertType}
                      onChange={(e) => setFormData({ ...formData, alertType: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="low_stock">Stock Bajo</option>
                      <option value="out_of_stock">Sin Stock</option>
                      <option value="custom">Personalizada</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Umbral (unidades)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.threshold}
                      onChange={(e) => setFormData({ ...formData, threshold: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Notificaciones
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.notificationSettings.email}
                          onChange={(e) => setFormData({
                            ...formData,
                            notificationSettings: {
                              ...formData.notificationSettings,
                              email: e.target.checked
                            }
                          })}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Email</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.notificationSettings.inApp}
                          onChange={(e) => setFormData({
                            ...formData,
                            notificationSettings: {
                              ...formData.notificationSettings,
                              inApp: e.target.checked
                            }
                          })}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">En la App</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.notificationSettings.sms}
                          onChange={(e) => setFormData({
                            ...formData,
                            notificationSettings: {
                              ...formData.notificationSettings,
                              sms: e.target.checked
                            }
                          })}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">SMS</span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Actualizar Alerta
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreManagerInventoryAlerts;
