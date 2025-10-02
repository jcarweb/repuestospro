import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  UserPlus,
  Users,
  Store,
  Building2,
  Clock,
  Star,
  MessageSquare,
  DollarSign,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCcw,
  Download,
  Upload,
  Settings,
  Shield,
  Phone,
  Mail,
  MapPin,
  Calendar,
  BarChart3,
} from 'lucide-react';

interface Seller {
  _id: string;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  canViewPrices: boolean;
  canChat: boolean;
  canCreateQuotes: boolean;
  maxDiscountPercentage: number;
  assignedCategories: string[];
  workSchedule: {
    startTime: string;
    endTime: string;
    daysOfWeek: number[];
  };
  performanceMetrics: {
    totalQueries: number;
    successfulSales: number;
    averageResponseTime: number;
    customerRating: number;
  };
  createdAt: string;
  lastActive: string;
  branchId?: string;
  branchName?: string;
}

interface StoreBranch {
  _id: string;
  name: string;
  address: string;
  phone: string;
  isActive: boolean;
}

const StoreManagerSellers: React.FC = () => {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [branches, setBranches] = useState<StoreBranch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterBranch, setFilterBranch] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [showStats, setShowStats] = useState<boolean>(false);

  // Formulario para crear/editar vendedor
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    branchId: '',
    canViewPrices: true,
    canChat: true,
    canCreateQuotes: true,
    maxDiscountPercentage: 10,
    assignedCategories: [] as string[],
    workSchedule: {
      startTime: '08:00',
      endTime: '17:00',
      daysOfWeek: [1, 2, 3, 4, 5], // Lunes a Viernes
    },
  });

  const categories = [
    'Motores',
    'Frenos',
    'Suspensión',
    'Transmisión',
    'Eléctrico',
    'Filtros',
    'Aceites',
    'Neumáticos',
    'Accesorios',
    'Herramientas',
  ];

  const daysOfWeek = [
    'Domingo',
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
  ];

  useEffect(() => {
    fetchSellers();
    fetchBranches();
  }, []);

  const fetchSellers = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockSellers: Seller[] = [
        {
          _id: 'seller1',
          name: 'Carlos Mendoza',
          email: 'carlos.mendoza@repuestospro.com',
          phone: '0412-1234567',
          isActive: true,
          canViewPrices: true,
          canChat: true,
          canCreateQuotes: true,
          maxDiscountPercentage: 15,
          assignedCategories: ['Motores', 'Frenos', 'Suspensión'],
          workSchedule: {
            startTime: '08:00',
            endTime: '17:00',
            daysOfWeek: [1, 2, 3, 4, 5],
          },
          performanceMetrics: {
            totalQueries: 245,
            successfulSales: 89,
            averageResponseTime: 2.5,
            customerRating: 4.8,
          },
          createdAt: '2023-10-01T00:00:00Z',
          lastActive: '2023-10-26T14:30:00Z',
          branchId: 'branch1',
          branchName: 'Sucursal Centro',
        },
        {
          _id: 'seller2',
          name: 'Ana Rodríguez',
          email: 'ana.rodriguez@repuestospro.com',
          phone: '0424-9876543',
          isActive: true,
          canViewPrices: true,
          canChat: true,
          canCreateQuotes: false,
          maxDiscountPercentage: 10,
          assignedCategories: ['Eléctrico', 'Filtros', 'Aceites'],
          workSchedule: {
            startTime: '09:00',
            endTime: '18:00',
            daysOfWeek: [1, 2, 3, 4, 5, 6],
          },
          performanceMetrics: {
            totalQueries: 189,
            successfulSales: 67,
            averageResponseTime: 3.2,
            customerRating: 4.6,
          },
          createdAt: '2023-10-15T00:00:00Z',
          lastActive: '2023-10-26T12:15:00Z',
          branchId: 'branch2',
          branchName: 'Sucursal Este',
        },
        {
          _id: 'seller3',
          name: 'Luis Herrera',
          email: 'luis.herrera@repuestospro.com',
          phone: '0416-5554433',
          isActive: false,
          canViewPrices: true,
          canChat: false,
          canCreateQuotes: true,
          maxDiscountPercentage: 20,
          assignedCategories: ['Neumáticos', 'Accesorios', 'Herramientas'],
          workSchedule: {
            startTime: '07:00',
            endTime: '16:00',
            daysOfWeek: [1, 2, 3, 4, 5],
          },
          performanceMetrics: {
            totalQueries: 156,
            successfulSales: 45,
            averageResponseTime: 4.1,
            customerRating: 4.2,
          },
          createdAt: '2023-09-20T00:00:00Z',
          lastActive: '2023-10-25T16:45:00Z',
          branchId: 'branch1',
          branchName: 'Sucursal Centro',
        },
      ];

      setSellers(mockSellers);
    } catch (err) {
      setError('Error al cargar los vendedores.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      // Simulate API call
      const mockBranches: StoreBranch[] = [
        {
          _id: 'branch1',
          name: 'Sucursal Centro',
          address: 'Av. Libertador, Centro, Caracas',
          phone: '0212-7654321',
          isActive: true,
        },
        {
          _id: 'branch2',
          name: 'Sucursal Este',
          address: 'C.C. Sambil, Chacao, Caracas',
          phone: '0212-9988776',
          isActive: true,
        },
        {
          _id: 'branch3',
          name: 'Sucursal Oeste',
          address: 'Av. Fuerzas Armadas, Catia, Caracas',
          phone: '0212-5544332',
          isActive: false,
        },
      ];

      setBranches(mockBranches);
    } catch (err) {
      console.error('Error cargando sucursales:', err);
    }
  };

  const handleCreateSeller = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newSeller: Seller = {
        _id: `seller${Date.now()}`,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        isActive: true,
        canViewPrices: formData.canViewPrices,
        canChat: formData.canChat,
        canCreateQuotes: formData.canCreateQuotes,
        maxDiscountPercentage: formData.maxDiscountPercentage,
        assignedCategories: formData.assignedCategories,
        workSchedule: formData.workSchedule,
        performanceMetrics: {
          totalQueries: 0,
          successfulSales: 0,
          averageResponseTime: 0,
          customerRating: 0,
        },
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        branchId: formData.branchId,
        branchName: branches.find(b => b._id === formData.branchId)?.name || '',
      };

      setSellers([...sellers, newSeller]);
      setShowCreateModal(false);
      resetForm();
      alert('Vendedor creado exitosamente');
    } catch (err) {
      setError('Error al crear el vendedor.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSeller = async (sellerId: string, updates: Partial<Seller>) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSellers(prevSellers =>
        prevSellers.map(seller =>
          seller._id === sellerId ? { ...seller, ...updates } : seller
        )
      );

      setShowEditModal(false);
      setSelectedSeller(null);
      alert('Vendedor actualizado exitosamente');
    } catch (err) {
      setError('Error al actualizar el vendedor.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSeller = async (sellerId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este vendedor?')) return;

    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSellers(prevSellers => prevSellers.filter(seller => seller._id !== sellerId));
      alert('Vendedor eliminado exitosamente');
    } catch (err) {
      setError('Error al eliminar el vendedor.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      branchId: '',
      canViewPrices: true,
      canChat: true,
      canCreateQuotes: true,
      maxDiscountPercentage: 10,
      assignedCategories: [],
      workSchedule: {
        startTime: '08:00',
        endTime: '17:00',
        daysOfWeek: [1, 2, 3, 4, 5],
      },
    });
  };

  const filteredSellers = sellers.filter(seller => {
    const matchesSearch = 
      seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.phone.includes(searchTerm);
    
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && seller.isActive) ||
      (filterStatus === 'inactive' && !seller.isActive);
    
    const matchesBranch = filterBranch === 'all' || seller.branchId === filterBranch;
    
    return matchesSearch && matchesStatus && matchesBranch;
  });

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? CheckCircle : XCircle;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <RefreshCcw className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-3" />
        <p className="text-gray-600">Cargando vendedores...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 text-red-600">
        <AlertCircle className="h-10 w-10 mb-4" />
        <p className="text-lg">{error}</p>
        <button
          onClick={fetchSellers}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Vendedores</h1>
          <p className="text-gray-600 mt-2">Administra los vendedores de tu tienda</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowStats(!showStats)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Estadísticas</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Nuevo Vendedor</span>
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Vendedores</p>
                <p className="text-2xl font-bold text-gray-900">{sellers.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Activos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {sellers.filter(s => s.isActive).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Consultas Totales</p>
                <p className="text-2xl font-bold text-gray-900">
                  {sellers.reduce((sum, s) => sum + s.performanceMetrics.totalQueries, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Calificación Promedio</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(sellers.reduce((sum, s) => sum + s.performanceMetrics.customerRating, 0) / sellers.length).toFixed(1)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar vendedores..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value)}
            >
              <option value="all">Todas las sucursales</option>
              {branches.map(branch => (
                <option key={branch._id} value={branch._id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabla de vendedores */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendedor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sucursal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permisos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rendimiento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSellers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No se encontraron vendedores.
                  </td>
                </tr>
              ) : (
                filteredSellers.map((seller) => {
                  const StatusIcon = getStatusIcon(seller.isActive);
                  return (
                    <tr key={seller._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-gray-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{seller.name}</div>
                            <div className="text-sm text-gray-500">{seller.email}</div>
                            <div className="text-sm text-gray-500">{seller.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Building2 className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{seller.branchName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            seller.isActive
                          )}`}
                        >
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {seller.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {seller.canViewPrices && (
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                              Precios
                            </span>
                          )}
                          {seller.canChat && (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                              Chat
                            </span>
                          )}
                          {seller.canCreateQuotes && (
                            <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                              Cotizaciones
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div>Consultas: {seller.performanceMetrics.totalQueries}</div>
                          <div>Ventas: {seller.performanceMetrics.successfulSales}</div>
                          <div className="flex items-center">
                            <Star className="w-3 h-3 text-yellow-400 mr-1" />
                            {seller.performanceMetrics.customerRating.toFixed(1)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedSeller(seller);
                              setShowEditModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSeller(seller._id)}
                            className="text-red-600 hover:text-red-900"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para crear vendedor */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Crear Nuevo Vendedor</h2>
            </div>
            <div className="p-6">
              <form onSubmit={(e) => { e.preventDefault(); handleCreateSeller(); }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <input
                      type="tel"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sucursal</label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.branchId}
                      onChange={(e) => setFormData({...formData, branchId: e.target.value})}
                    >
                      <option value="">Seleccionar sucursal</option>
                      {branches.filter(b => b.isActive).map(branch => (
                        <option key={branch._id} value={branch._id}>
                          {branch.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Permisos</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.canViewPrices}
                        onChange={(e) => setFormData({...formData, canViewPrices: e.target.checked})}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Ver Precios</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.canChat}
                        onChange={(e) => setFormData({...formData, canChat: e.target.checked})}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Chat con Clientes</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.canCreateQuotes}
                        onChange={(e) => setFormData({...formData, canCreateQuotes: e.target.checked})}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Crear Cotizaciones</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descuento Máximo (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.maxDiscountPercentage}
                    onChange={(e) => setFormData({...formData, maxDiscountPercentage: Number(e.target.value)})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categorías Asignadas</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {categories.map(category => (
                      <label key={category} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.assignedCategories.includes(category)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                assignedCategories: [...formData.assignedCategories, category]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                assignedCategories: formData.assignedCategories.filter(c => c !== category)
                              });
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Horario de Trabajo</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Hora de Inicio</label>
                      <input
                        type="time"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.workSchedule.startTime}
                        onChange={(e) => setFormData({
                          ...formData,
                          workSchedule: {...formData.workSchedule, startTime: e.target.value}
                        })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Hora de Fin</label>
                      <input
                        type="time"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.workSchedule.endTime}
                        onChange={(e) => setFormData({
                          ...formData,
                          workSchedule: {...formData.workSchedule, endTime: e.target.value}
                        })}
                      />
                    </div>
                  </div>
                  <div className="mt-2">
                    <label className="block text-sm text-gray-600 mb-1">Días de Trabajo</label>
                    <div className="grid grid-cols-7 gap-2">
                      {daysOfWeek.map((day, index) => (
                        <label key={day} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.workSchedule.daysOfWeek.includes(index)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  workSchedule: {
                                    ...formData.workSchedule,
                                    daysOfWeek: [...formData.workSchedule.daysOfWeek, index]
                                  }
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  workSchedule: {
                                    ...formData.workSchedule,
                                    daysOfWeek: formData.workSchedule.daysOfWeek.filter(d => d !== index)
                                  }
                                });
                              }
                            }}
                            className="mr-1"
                          />
                          <span className="text-xs text-gray-700">{day.substring(0, 3)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Crear Vendedor
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar vendedor */}
      {showEditModal && selectedSeller && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Editar Vendedor</h2>
            </div>
            <div className="p-6">
              <form onSubmit={(e) => { 
                e.preventDefault(); 
                handleUpdateSeller(selectedSeller._id, {
                  ...selectedSeller,
                  name: formData.name,
                  email: formData.email,
                  phone: formData.phone,
                  branchId: formData.branchId,
                  canViewPrices: formData.canViewPrices,
                  canChat: formData.canChat,
                  canCreateQuotes: formData.canCreateQuotes,
                  maxDiscountPercentage: formData.maxDiscountPercentage,
                  assignedCategories: formData.assignedCategories,
                  workSchedule: formData.workSchedule,
                });
              }} className="space-y-4">
                {/* Mismo formulario que crear, pero con datos precargados */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedSeller(null);
                      resetForm();
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Actualizar Vendedor
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

export default StoreManagerSellers;