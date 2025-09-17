import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../../config/api';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Mail, 
  Phone, 
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserPlus,
  Key
} from 'lucide-react';

interface Seller {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  isActive: boolean;
  assignedStore?: {
    _id: string;
    name: string;
  };
  sellerPermissions?: {
    catalogAccess: boolean;
    manualDeliveryAssignment: boolean;
    chatAccess: boolean;
    orderManagement: boolean;
    inventoryView: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

interface CreateSellerForm {
  name: string;
  email: string;
  phone: string;
  expiresInDays: number;
}

const StoreManagerSellers: React.FC = () => {
  const { token, user } = useAuth();
  const { t } = useLanguage();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState<CreateSellerForm>({
    name: '',
    email: '',
    phone: '',
    expiresInDays: 7
  });

  // Cargar vendedores
  const fetchSellers = async () => {
    try {
      setLoading(true);
      const response = await fetch('API_BASE_URL/admin/users?role=seller&limit=1000', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success && data.data) {
        setSellers(data.data);
      } else {
        console.error('Error cargando vendedores:', data);
        setSellers([]);
      }
    } catch (error) {
      console.error('Error cargando vendedores:', error);
      setSellers([]);
    } finally {
      setLoading(false);
    }
  };

  // Crear código de registro para vendedor
  const handleCreateSeller = async () => {
    if (!createForm.name || !createForm.email) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      const response = await fetch('API_BASE_URL/admin/registration-codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: createForm.email,
          role: 'seller',
          expiresInDays: createForm.expiresInDays
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`Código de registro creado exitosamente para ${createForm.email}`);
        setShowCreateModal(false);
        setCreateForm({
          name: '',
          email: '',
          phone: '',
          expiresInDays: 7
        });
        fetchSellers();
      } else {
        alert(data.message || 'Error al crear código de registro');
      }
    } catch (error) {
      console.error('Error creando código de registro:', error);
      alert('Error al crear código de registro');
    }
  };

  // Filtrar vendedores
  const filteredSellers = sellers.filter(seller =>
    seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seller.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (token) {
      fetchSellers();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFC300] mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando vendedores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <Users className="mr-3 text-[#FFC300]" />
                Gestión de Vendedores
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Administra los vendedores de tu tienda
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-[#FFC300] text-[#333333] px-6 py-3 rounded-lg font-semibold hover:bg-[#E6B800] transition-colors flex items-center"
            >
              <UserPlus className="mr-2" size={20} />
              Crear Vendedor
            </button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Vendedores</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{sellers.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Activos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {sellers.filter(s => s.isActive).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Inactivos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {sellers.filter(s => !s.isActive).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Sin Asignar</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {sellers.filter(s => !s.assignedStore).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Búsqueda */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-6">
          <div className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar vendedores por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC300] dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Lista de vendedores */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Vendedores ({filteredSellers.length})
            </h3>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredSellers.length === 0 ? (
              <div className="p-6 text-center">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No hay vendedores</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {searchTerm ? 'No se encontraron vendedores con ese criterio de búsqueda.' : 'Comienza creando tu primer vendedor.'}
                </p>
              </div>
            ) : (
              filteredSellers.map((seller) => (
                <div key={seller._id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-[#FFC300] flex items-center justify-center">
                          <span className="text-[#333333] font-semibold text-sm">
                            {seller.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {seller.name}
                          </p>
                          {seller.isActive ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <Mail className="h-4 w-4 mr-1" />
                            {seller.email}
                          </div>
                          {seller.phone && (
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                              <Phone className="h-4 w-4 mr-1" />
                              {seller.phone}
                            </div>
                          )}
                        </div>
                        
                        {seller.assignedStore && (
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                            <MapPin className="h-4 w-4 mr-1" />
                            {seller.assignedStore.name}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Modal para crear vendedor */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white dark:bg-gray-800">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Crear Vendedor
                  </h3>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      value={createForm.name}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC300] dark:bg-gray-700 dark:text-white"
                      placeholder="Nombre del vendedor"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={createForm.email}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC300] dark:bg-gray-700 dark:text-white"
                      placeholder="Email del vendedor"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={createForm.phone}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC300] dark:bg-gray-700 dark:text-white"
                      placeholder="Teléfono del vendedor"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Días de expiración del código
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={createForm.expiresInDays}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, expiresInDays: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC300] dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCreateSeller}
                    className="px-4 py-2 bg-[#FFC300] text-[#333333] rounded-lg hover:bg-[#E6B800] font-semibold flex items-center"
                  >
                    <Key className="mr-2" size={16} />
                    Crear Código
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreManagerSellers;
