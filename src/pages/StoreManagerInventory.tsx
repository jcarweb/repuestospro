import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../../config/api';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  Package, 
  Download, 
  Upload, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Plus,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Store,
  BarChart3,
  Settings,
  ArrowUpDown,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface Store {
  _id: string;
  name: string;
  address: string;
  isActive: boolean;
}

interface InventoryItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    sku: string;
    price: number;
    category: string;
    brand: string;
  };
  store: {
    _id: string;
    name: string;
  };
  inventoryType: 'global' | 'separate' | 'hybrid';
  mainStock: {
    quantity: number;
    reserved: number;
    available: number;
    minStock: number;
    maxStock: number;
  };
  localStock?: {
    quantity: number;
    reserved: number;
    available: number;
    minStock: number;
    maxStock: number;
  };
  assignedStock?: {
    quantity: number;
    reserved: number;
    available: number;
  };
  alerts: {
    lowStock: boolean;
    outOfStock: boolean;
    overStock: boolean;
  };
  lastUpdated: string;
}

interface InventoryStats {
  totalProducts: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalValue: number;
  recentMovements: number;
}

interface StockMovement {
  _id: string;
  type: 'in' | 'out' | 'adjustment' | 'transfer';
  quantity: number;
  reason: string;
  date: string;
  user: string;
}

const StoreManagerInventory: React.FC = () => {
  const { user, token } = useAuth();
  const { t } = useLanguage();
  
  // Estados principales
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<InventoryStats>({
    totalProducts: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    totalValue: 0,
    recentMovements: 0
  });
  const [recentMovements, setRecentMovements] = useState<StockMovement[]>([]);
  
  // Estados de filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterAlert, setFilterAlert] = useState<string>('all');
  
  // Estados de UI
  const [loading, setLoading] = useState(true);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null);
  const [stockForm, setStockForm] = useState({
    quantity: 0,
    type: 'adjustment',
    reason: '',
    inventoryType: 'main'
  });

  // Cargar datos iniciales
  useEffect(() => {
    fetchUserStores();
  }, []);

  // Cargar inventario cuando cambie la tienda seleccionada
  useEffect(() => {
    if (selectedStore) {
      fetchInventory();
      fetchStats();
      fetchRecentMovements();
    }
  }, [selectedStore]);

  const fetchUserStores = async () => {
    try {
      const response = await fetch('API_BASE_URL/stores/user-stores', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        // Manejar diferentes estructuras de respuesta
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
      } else {
        console.error('Error: user stores request failed', data);
        setStores([]);
      }
    } catch (error) {
      console.error('Error fetching user stores:', error);
      setStores([]);
    }
  };

  const fetchInventory = async () => {
    if (!selectedStore) return;
    
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('storeId', selectedStore);
      if (filterType !== 'all') params.append('inventoryType', filterType);
      if (filterAlert !== 'all') params.append('alert', filterAlert);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`API_BASE_URL/inventory/store-manager/inventory?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setInventory(data.data);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!selectedStore) return;
    
    try {
      const response = await fetch(`API_BASE_URL/inventory/store-manager/stats/${selectedStore}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRecentMovements = async () => {
    if (!selectedStore) return;
    
    try {
      const response = await fetch(`API_BASE_URL/inventory/store-manager/movements/${selectedStore}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setRecentMovements(data.data);
      }
    } catch (error) {
      console.error('Error fetching movements:', error);
    }
  };

  const handleUpdateStock = async () => {
    if (!selectedProduct || !selectedStore) return;
    
    try {
      const response = await fetch(`API_BASE_URL/inventory/stock/${selectedStore}/${selectedProduct.product._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          quantity: stockForm.quantity,
          type: stockForm.type,
          reason: stockForm.reason,
          inventoryType: stockForm.inventoryType
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Stock actualizado exitosamente');
        setShowStockModal(false);
        setSelectedProduct(null);
        setStockForm({ quantity: 0, type: 'adjustment', reason: '', inventoryType: 'main' });
        fetchInventory();
        fetchStats();
        fetchRecentMovements();
      } else {
        alert(data.message || 'Error al actualizar el stock');
      }
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('Error al actualizar el stock');
    }
  };

  const handleExportInventory = async () => {
    if (!selectedStore) return;
    
    try {
      const params = new URLSearchParams();
      params.append('storeId', selectedStore);
      if (filterType !== 'all') params.append('inventoryType', filterType);
      if (filterAlert !== 'all') params.append('alert', filterAlert);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`API_BASE_URL/inventory/store-manager/export?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inventario_${stores.find(s => s._id === selectedStore)?.name}_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting inventory:', error);
      alert('Error al exportar el inventario');
    }
  };

  const handleImportInventory = async (file: File) => {
    if (!selectedStore) return;
    
    try {
      const formData = new FormData();
      formData.append('csvFile', file);
      formData.append('storeId', selectedStore);

      const response = await fetch('API_BASE_URL/inventory/store-manager/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        alert(`Inventario importado exitosamente: ${data.data.successCount} elementos procesados`);
        fetchInventory();
        fetchStats();
        fetchRecentMovements();
      } else {
        alert(data.message || 'Error al importar el inventario');
      }
    } catch (error) {
      console.error('Error importing inventory:', error);
      alert('Error al importar el inventario');
    }
  };

  const openStockModal = (item: InventoryItem) => {
    setSelectedProduct(item);
    setStockForm({
      quantity: item.mainStock.quantity,
      type: 'adjustment',
      reason: '',
      inventoryType: 'main'
    });
    setShowStockModal(true);
  };

  const getAlertIcon = (alerts: any) => {
    if (alerts.outOfStock) return <XCircle className="w-4 h-4 text-red-500" />;
    if (alerts.lowStock) return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    if (alerts.overStock) return <AlertTriangle className="w-4 h-4 text-orange-500" />;
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  const getAlertText = (alerts: any) => {
    if (alerts.outOfStock) return 'Sin stock';
    if (alerts.lowStock) return 'Stock bajo';
    if (alerts.overStock) return 'Stock alto';
    return 'Normal';
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'in': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'out': return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'adjustment': return <ArrowUpDown className="w-4 h-4 text-blue-500" />;
      case 'transfer': return <ArrowUpDown className="w-4 h-4 text-purple-500" />;
      default: return <ArrowUpDown className="w-4 h-4 text-gray-500" />;
    }
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (!Array.isArray(stores) || stores.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No tienes tiendas asignadas
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
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
                <Package className="w-8 h-8 text-blue-600" />
                Gestión de Inventario
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Administra el inventario de tus tiendas
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Importar
              </button>
              <button
                onClick={handleExportInventory}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Exportar
              </button>
            </div>
          </div>
        </div>

        {/* Selector de tienda */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Tienda:
            </label>
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              {Array.isArray(stores) && stores.map(store => (
                <option key={store._id} value={store._id}>{store.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Productos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalProducts}</p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Stock Bajo</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.lowStockItems}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Sin Stock</p>
                <p className="text-2xl font-bold text-red-600">{stats.outOfStockItems}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Valor Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${stats.totalValue.toLocaleString()}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Filtros y tabla de inventario */}
          <div className="lg:col-span-2">
            {/* Filtros */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Buscar
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar por producto o SKU..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo de Inventario
                  </label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">Todos los tipos</option>
                    <option value="global">Global</option>
                    <option value="separate">Separado</option>
                    <option value="hybrid">Híbrido</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Estado de Stock
                  </label>
                  <select
                    value={filterAlert}
                    onChange={(e) => setFilterAlert(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">Todos los estados</option>
                    <option value="lowStock">Stock bajo</option>
                    <option value="outOfStock">Sin stock</option>
                    <option value="overStock">Stock alto</option>
                    <option value="normal">Normal</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Tabla de inventario */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Producto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                          Cargando inventario...
                        </td>
                      </tr>
                    ) : filteredInventory.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                          No se encontraron elementos de inventario
                        </td>
                      </tr>
                    ) : (
                      filteredInventory.map((item) => (
                        <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {item.product.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                SKU: {item.product.sku}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {item.product.brand} - {item.product.category}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">
                              <div>Disponible: {item.mainStock.available}</div>
                              <div className="text-gray-500">Reservado: {item.mainStock.reserved}</div>
                              <div className="text-gray-500">Total: {item.mainStock.quantity}</div>
                              {item.localStock && (
                                <div className="text-gray-500">Local: {item.localStock.available}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {getAlertIcon(item.alerts)}
                              <span className="text-sm text-gray-900 dark:text-white">
                                {getAlertText(item.alerts)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => openStockModal(item)}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                title="Actualizar stock"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Panel lateral - Movimientos recientes */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Movimientos Recientes
              </h3>
              <div className="space-y-3">
                {recentMovements.length === 0 ? (
                  <p className="text-gray-500 text-sm">No hay movimientos recientes</p>
                ) : (
                  recentMovements.slice(0, 10).map((movement) => (
                    <div key={movement._id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex-shrink-0">
                        {getMovementIcon(movement.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {movement.reason}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(movement.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modales */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Importar Inventario
              </h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Seleccionar archivo CSV
                </label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleImportInventory(file);
                      setShowImportModal(false);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {showStockModal && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Actualizar Stock - {selectedProduct.product.name}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    value={stockForm.quantity}
                    onChange={(e) => setStockForm({...stockForm, quantity: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo de Movimiento
                  </label>
                  <select
                    value={stockForm.type}
                    onChange={(e) => setStockForm({...stockForm, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="adjustment">Ajuste</option>
                    <option value="in">Entrada</option>
                    <option value="out">Salida</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Razón
                  </label>
                  <input
                    type="text"
                    value={stockForm.reason}
                    onChange={(e) => setStockForm({...stockForm, reason: e.target.value})}
                    placeholder="Motivo del cambio de stock..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowStockModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpdateStock}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Actualizar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreManagerInventory;
