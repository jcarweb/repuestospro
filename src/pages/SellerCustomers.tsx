import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Phone,
  Mail,
  MapPin,
  Star,
  ShoppingCart,
  DollarSign,
  Calendar,
  MessageSquare,
  Eye,
  UserPlus,
  RefreshCcw,
  AlertCircle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Clock,
  Award,
  Tag,
  BarChart3,
} from 'lucide-react';

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  avatar?: string;
  registrationDate: string;
  lastActivity: string;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  loyaltyLevel: 'bronze' | 'silver' | 'gold' | 'platinum';
  rating: number;
  isActive: boolean;
  isVIP: boolean;
  tags: string[];
  notes?: string;
  preferredContactMethod: 'phone' | 'email' | 'whatsapp';
  lastOrderDate?: string;
  lastOrderValue?: number;
  favoriteCategories: string[];
  totalQuotes: number;
  acceptedQuotes: number;
  rejectedQuotes: number;
}

interface CustomerStats {
  total: number;
  active: number;
  vip: number;
  newThisMonth: number;
  totalRevenue: number;
  averageOrderValue: number;
  topCustomers: Customer[];
  loyaltyDistribution: {
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
  };
}

const SellerCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterLoyalty, setFilterLoyalty] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const loyaltyOptions = [
    { value: 'all', label: 'Todos los niveles' },
    { value: 'bronze', label: 'Bronce' },
    { value: 'silver', label: 'Plata' },
    { value: 'gold', label: 'Oro' },
    { value: 'platinum', label: 'Platino' },
  ];

  const statusOptions = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'active', label: 'Activos' },
    { value: 'inactive', label: 'Inactivos' },
    { value: 'vip', label: 'VIP' },
  ];

  const sortOptions = [
    { value: 'name', label: 'Nombre' },
    { value: 'totalSpent', label: 'Total gastado' },
    { value: 'totalOrders', label: 'Total órdenes' },
    { value: 'lastActivity', label: 'Última actividad' },
    { value: 'registrationDate', label: 'Fecha de registro' },
    { value: 'rating', label: 'Calificación' },
  ];

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock customers data
      const mockCustomers: Customer[] = [
        {
          _id: 'cust1',
          name: 'Juan Pérez',
          email: 'juan.perez@email.com',
          phone: '0412-1234567',
          address: 'Av. Principal 123, Caracas',
          avatar: '/api/placeholder/40/40',
          registrationDate: '2023-01-15T10:30:00Z',
          lastActivity: '2023-10-26T14:30:00Z',
          totalOrders: 15,
          totalSpent: 1250.00,
          averageOrderValue: 83.33,
          loyaltyLevel: 'gold',
          rating: 4.8,
          isActive: true,
          isVIP: true,
          tags: ['VIP', 'Frecuente', 'Puntual'],
          notes: 'Cliente preferido, siempre paga al contado',
          preferredContactMethod: 'phone',
          lastOrderDate: '2023-10-20T16:45:00Z',
          lastOrderValue: 95.00,
          favoriteCategories: ['Filtros', 'Aceites'],
          totalQuotes: 8,
          acceptedQuotes: 6,
          rejectedQuotes: 2,
        },
        {
          _id: 'cust2',
          name: 'María García',
          email: 'maria.garcia@email.com',
          phone: '0424-9876543',
          address: 'Calle 2da 456, Valencia',
          avatar: '/api/placeholder/40/40',
          registrationDate: '2023-03-22T14:15:00Z',
          lastActivity: '2023-10-26T13:45:00Z',
          totalOrders: 3,
          totalSpent: 180.00,
          averageOrderValue: 60.00,
          loyaltyLevel: 'bronze',
          rating: 4.5,
          isActive: true,
          isVIP: false,
          tags: ['Nuevo'],
          preferredContactMethod: 'email',
          lastOrderDate: '2023-10-15T11:20:00Z',
          lastOrderValue: 45.00,
          favoriteCategories: ['Frenos'],
          totalQuotes: 2,
          acceptedQuotes: 1,
          rejectedQuotes: 1,
        },
        {
          _id: 'cust3',
          name: 'Carlos Ruiz',
          email: 'carlos.ruiz@email.com',
          phone: '0416-5554433',
          address: 'Urbanización Los Palos Grandes, Caracas',
          avatar: '/api/placeholder/40/40',
          registrationDate: '2022-11-08T09:20:00Z',
          lastActivity: '2023-10-26T12:15:00Z',
          totalOrders: 8,
          totalSpent: 650.00,
          averageOrderValue: 81.25,
          loyaltyLevel: 'silver',
          rating: 4.2,
          isActive: true,
          isVIP: false,
          tags: ['Cotización'],
          notes: 'Siempre pide cotizaciones antes de comprar',
          preferredContactMethod: 'whatsapp',
          lastOrderDate: '2023-10-18T14:30:00Z',
          lastOrderValue: 120.00,
          favoriteCategories: ['Eléctrico', 'Frenos'],
          totalQuotes: 12,
          acceptedQuotes: 8,
          rejectedQuotes: 4,
        },
        {
          _id: 'cust4',
          name: 'Ana López',
          email: 'ana.lopez@email.com',
          phone: '0426-7778899',
          address: 'Zona Industrial, Maracay',
          avatar: '/api/placeholder/40/40',
          registrationDate: '2023-09-10T16:45:00Z',
          lastActivity: '2023-10-25T16:20:00Z',
          totalOrders: 1,
          totalSpent: 45.00,
          averageOrderValue: 45.00,
          loyaltyLevel: 'bronze',
          rating: 4.0,
          isActive: false,
          isVIP: false,
          tags: ['Consulta'],
          preferredContactMethod: 'email',
          lastOrderDate: '2023-10-05T10:15:00Z',
          lastOrderValue: 45.00,
          favoriteCategories: ['Aceites'],
          totalQuotes: 1,
          acceptedQuotes: 1,
          rejectedQuotes: 0,
        },
        {
          _id: 'cust5',
          name: 'Roberto Silva',
          email: 'roberto.silva@email.com',
          phone: '0414-3332211',
          address: 'Centro Comercial, Barquisimeto',
          avatar: '/api/placeholder/40/40',
          registrationDate: '2021-05-12T08:30:00Z',
          lastActivity: '2023-10-24T15:45:00Z',
          totalOrders: 25,
          totalSpent: 2100.00,
          averageOrderValue: 84.00,
          loyaltyLevel: 'platinum',
          rating: 4.9,
          isActive: true,
          isVIP: true,
          tags: ['VIP', 'Mayorista', 'Fiel'],
          notes: 'Cliente mayorista, compra grandes cantidades',
          preferredContactMethod: 'phone',
          lastOrderDate: '2023-10-22T09:30:00Z',
          lastOrderValue: 180.00,
          favoriteCategories: ['Filtros', 'Aceites', 'Frenos'],
          totalQuotes: 15,
          acceptedQuotes: 12,
          rejectedQuotes: 3,
        },
      ];

      // Calculate stats
      const total = mockCustomers.length;
      const active = mockCustomers.filter(c => c.isActive).length;
      const vip = mockCustomers.filter(c => c.isVIP).length;
      const newThisMonth = mockCustomers.filter(c => {
        const regDate = new Date(c.registrationDate);
        const now = new Date();
        return regDate.getMonth() === now.getMonth() && regDate.getFullYear() === now.getFullYear();
      }).length;
      const totalRevenue = mockCustomers.reduce((sum, c) => sum + c.totalSpent, 0);
      const averageOrderValue = totalRevenue / mockCustomers.reduce((sum, c) => sum + c.totalOrders, 0);
      const topCustomers = [...mockCustomers].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 3);
      
      const loyaltyDistribution = {
        bronze: mockCustomers.filter(c => c.loyaltyLevel === 'bronze').length,
        silver: mockCustomers.filter(c => c.loyaltyLevel === 'silver').length,
        gold: mockCustomers.filter(c => c.loyaltyLevel === 'gold').length,
        platinum: mockCustomers.filter(c => c.loyaltyLevel === 'platinum').length,
      };

      setCustomers(mockCustomers);
      setStats({
        total,
        active,
        vip,
        newThisMonth,
        totalRevenue,
        averageOrderValue,
        topCustomers,
        loyaltyDistribution,
      });
    } catch (err) {
      setError('Error al cargar los clientes.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm);
    
    const matchesLoyalty = filterLoyalty === 'all' || customer.loyaltyLevel === filterLoyalty;
    
    let matchesStatus = true;
    switch (filterStatus) {
      case 'active':
        matchesStatus = customer.isActive;
        break;
      case 'inactive':
        matchesStatus = !customer.isActive;
        break;
      case 'vip':
        matchesStatus = customer.isVIP;
        break;
    }
    
    return matchesSearch && matchesLoyalty && matchesStatus;
  });

  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name;
        bValue = b.name;
        break;
      case 'totalSpent':
        aValue = a.totalSpent;
        bValue = b.totalSpent;
        break;
      case 'totalOrders':
        aValue = a.totalOrders;
        bValue = b.totalOrders;
        break;
      case 'lastActivity':
        aValue = new Date(a.lastActivity).getTime();
        bValue = new Date(b.lastActivity).getTime();
        break;
      case 'registrationDate':
        aValue = new Date(a.registrationDate).getTime();
        bValue = new Date(b.registrationDate).getTime();
        break;
      case 'rating':
        aValue = a.rating;
        bValue = b.rating;
        break;
      default:
        aValue = a.name;
        bValue = b.name;
    }
    
    if (typeof aValue === 'string') {
      return sortOrder === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    } else {
      return sortOrder === 'asc' 
        ? aValue - bValue
        : bValue - aValue;
    }
  });

  const getLoyaltyColor = (level: Customer['loyaltyLevel']) => {
    switch (level) {
      case 'bronze':
        return 'bg-orange-100 text-orange-800';
      case 'silver':
        return 'bg-gray-100 text-gray-800';
      case 'gold':
        return 'bg-yellow-100 text-yellow-800';
      case 'platinum':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLoyaltyLabel = (level: Customer['loyaltyLevel']) => {
    switch (level) {
      case 'bronze':
        return 'Bronce';
      case 'silver':
        return 'Plata';
      case 'gold':
        return 'Oro';
      case 'platinum':
        return 'Platino';
      default:
        return level;
    }
  };

  const getContactIcon = (method: Customer['preferredContactMethod']) => {
    switch (method) {
      case 'phone':
        return Phone;
      case 'email':
        return Mail;
      case 'whatsapp':
        return MessageSquare;
      default:
        return Phone;
    }
  };

  const getDaysSinceLastActivity = (lastActivity: string) => {
    const last = new Date(lastActivity);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - last.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <RefreshCcw className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-3" />
        <p className="text-gray-600">Cargando clientes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 text-red-600">
        <AlertCircle className="h-10 w-10 mb-4" />
        <p className="text-lg">{error}</p>
        <button
          onClick={fetchCustomers}
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
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Clientes</h1>
          <p className="text-gray-600 mt-2">Administra y mantén contacto con tus clientes</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>Filtros</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <UserPlus className="w-4 h-4" />
            <span>Nuevo Cliente</span>
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Clientes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
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
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">VIP</p>
                <p className="text-2xl font-bold text-gray-900">{stats.vip}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nivel de Lealtad</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={filterLoyalty}
                onChange={(e) => setFilterLoyalty(e.target.value)}
              >
                {loyaltyOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Estado</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Ordenar por</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Orden</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSortOrder('asc')}
                  className={`flex-1 px-3 py-2 rounded-lg border ${
                    sortOrder === 'asc' 
                      ? 'bg-blue-100 border-blue-300 text-blue-700' 
                      : 'border-gray-300 text-gray-700'
                  }`}
                >
                  <TrendingUp className="w-4 h-4 mx-auto" />
                </button>
                <button
                  onClick={() => setSortOrder('desc')}
                  className={`flex-1 px-3 py-2 rounded-lg border ${
                    sortOrder === 'desc' 
                      ? 'bg-blue-100 border-blue-300 text-blue-700' 
                      : 'border-gray-300 text-gray-700'
                  }`}
                >
                  <TrendingDown className="w-4 h-4 mx-auto" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Búsqueda */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar clientes por nombre, email o teléfono..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Lista de clientes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Órdenes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Gastado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nivel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Última Actividad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedCustomers.map(customer => {
                const ContactIcon = getContactIcon(customer.preferredContactMethod);
                const daysSinceActivity = getDaysSinceLastActivity(customer.lastActivity);
                
                return (
                  <tr key={customer._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={customer.avatar}
                          alt={customer.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="ml-4">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900">
                              {customer.name}
                            </div>
                            {customer.isVIP && (
                              <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                                VIP
                              </span>
                            )}
                          </div>
                          <div className="flex items-center mt-1">
                            <Star className="w-4 h-4 text-yellow-400" />
                            <span className="ml-1 text-sm text-gray-500">{customer.rating}</span>
                            <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLoyaltyColor(customer.loyaltyLevel)}`}>
                              {getLoyaltyLabel(customer.loyaltyLevel)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <ContactIcon className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-900">{customer.phone}</div>
                          <div className="text-sm text-gray-500">{customer.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{customer.totalOrders}</div>
                      <div className="text-sm text-gray-500">
                        Promedio: ${customer.averageOrderValue.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ${customer.totalSpent.toFixed(2)}
                      </div>
                      {customer.lastOrderValue && (
                        <div className="text-sm text-gray-500">
                          Última: ${customer.lastOrderValue.toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {customer.tags.map(tag => (
                          <span key={tag} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(customer.lastActivity).toLocaleDateString()}
                      </div>
                      <div className={`text-sm ${
                        daysSinceActivity > 30 ? 'text-red-500' : 
                        daysSinceActivity > 7 ? 'text-yellow-500' : 'text-green-500'
                      }`}>
                        {daysSinceActivity === 0 ? 'Hoy' : 
                         daysSinceActivity === 1 ? 'Ayer' : 
                         `${daysSinceActivity} días`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedCustomer(customer)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="text-green-600 hover:text-green-900"
                          title="Llamar"
                        >
                          <Phone className="w-4 h-4" />
                        </button>
                        <button
                          className="text-purple-600 hover:text-purple-900"
                          title="Enviar mensaje"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalle de Cliente */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedCustomer.name}
              </h2>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Información personal */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Información Personal</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-sm text-gray-900">{selectedCustomer.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-sm text-gray-900">{selectedCustomer.phone}</span>
                    </div>
                    {selectedCustomer.address && (
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-900">{selectedCustomer.address}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-sm text-gray-900">
                        Registrado: {new Date(selectedCustomer.registrationDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Estadísticas */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Estadísticas</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total de órdenes:</span>
                      <span className="text-sm text-gray-900">{selectedCustomer.totalOrders}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total gastado:</span>
                      <span className="text-sm text-gray-900">${selectedCustomer.totalSpent.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Valor promedio por orden:</span>
                      <span className="text-sm text-gray-900">${selectedCustomer.averageOrderValue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Calificación:</span>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span className="ml-1 text-sm text-gray-900">{selectedCustomer.rating}</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Nivel de lealtad:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLoyaltyColor(selectedCustomer.loyaltyLevel)}`}>
                        {getLoyaltyLabel(selectedCustomer.loyaltyLevel)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cotizaciones */}
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Historial de Cotizaciones</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{selectedCustomer.totalQuotes}</div>
                    <div className="text-sm text-blue-800">Total Cotizaciones</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{selectedCustomer.acceptedQuotes}</div>
                    <div className="text-sm text-green-800">Aceptadas</div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-red-600">{selectedCustomer.rejectedQuotes}</div>
                    <div className="text-sm text-red-800">Rechazadas</div>
                  </div>
                </div>
              </div>

              {/* Categorías favoritas */}
              {selectedCustomer.favoriteCategories.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Categorías Favoritas</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCustomer.favoriteCategories.map(category => (
                      <span key={category} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Notas */}
              {selectedCustomer.notes && (
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Notas</h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">{selectedCustomer.notes}</p>
                  </div>
                </div>
              )}

              {/* Acciones */}
              <div className="mt-8 flex space-x-3">
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Crear Cotización
                </button>
                <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Enviar Mensaje
                </button>
                <button className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  Llamar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerCustomers;
