import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import SalesChart from '../components/SalesChart';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Building2,
  User,
  Target,
  PieChart,
  Activity,
  BarChart,
  LineChart,
  PieChart as PieChartIcon,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Search,
  X
} from 'lucide-react';

interface SalesOverview {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  totalCustomers: number;
  newCustomers: number;
  repeatCustomers: number;
  conversionRate: number;
  refundRate: number;
  averageItemsPerOrder: number;
  totalItemsSold: number;
}

interface SalesTrends {
  daily: Array<{
    date: string;
    sales: number;
    orders: number;
    customers: number;
  }>;
  weekly: Array<{
    week: string;
    sales: number;
    orders: number;
    customers: number;
  }>;
  monthly: Array<{
    month: string;
    sales: number;
    orders: number;
    customers: number;
  }>;
}

interface TopProduct {
  productId: string;
  productName: string;
  sku: string;
  category: string;
  quantitySold: number;
  totalRevenue: number;
  averagePrice: number;
  profitMargin: number;
}

interface TopCategory {
  categoryId: string;
  categoryName: string;
  quantitySold: number;
  totalRevenue: number;
  averageOrderValue: number;
  orderCount: number;
}

interface CustomerAnalytics {
  topCustomers: Array<{
    customerId: string;
    customerName: string;
    email: string;
    totalSpent: number;
    orderCount: number;
    averageOrderValue: number;
    lastOrderDate: string;
  }>;
  customerSegments: {
    new: number;
    returning: number;
    loyal: number;
    inactive: number;
  };
  customerRetention: {
    rate: number;
    averageLifetime: number;
    repeatPurchaseRate: number;
  };
}

interface PaymentAnalytics {
  paymentMethods: Array<{
    method: string;
    count: number;
    totalAmount: number;
    percentage: number;
  }>;
  paymentTrends: Array<{
    date: string;
    method: string;
    amount: number;
  }>;
}

interface Store {
  _id: string;
  name: string;
  location: string;
  status: string;
  manager?: string;
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  stores?: string[]; // IDs de las tiendas asignadas al usuario
}

interface SalesReport {
  overview: SalesOverview;
  trends: SalesTrends;
  topProducts: TopProduct[];
  topCategories: TopCategory[];
  customerAnalytics: CustomerAnalytics;
  paymentAnalytics: PaymentAnalytics;
  period: {
    from: string;
    to: string;
    days: number;
  };
}

const AdminSalesReports: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { t } = useLanguage();

  // Estados principales
  const [report, setReport] = useState<SalesReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de filtros avanzados
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [selectedOrderStatus, setSelectedOrderStatus] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Estados de datos de filtros
  const [stores, setStores] = useState<Store[]>([]);
  const [allStores, setAllStores] = useState<Store[]>([]); // Todas las tiendas disponibles
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [filtersLoading, setFiltersLoading] = useState(false);
  const [filtersError, setFiltersError] = useState<string | null>(null);

  // Estados de visualización
  const [selectedView, setSelectedView] = useState<'overview' | 'trends' | 'products' | 'customers' | 'payments' | 'stores'>('overview');
  const [trendPeriod, setTrendPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [showFilters, setShowFilters] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Estados para el select de usuario con búsqueda
  const [userSearchTerm, setUserSearchTerm] = useState<string>('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Configurar fechas por defecto (últimos 30 días)
  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    setDateTo(today.toISOString().split('T')[0]);
    setDateFrom(thirtyDaysAgo.toISOString().split('T')[0]);
  }, []);

  // Cargar datos de filtros
  useEffect(() => {
    console.log('🔍 AdminSalesReports: Iniciando carga de filtros');
    console.log('🔍 AdminSalesReports: Usuario actual:', user);
    loadFilterData();
  }, []);

  // Actualizar tiendas cuando cambie el usuario seleccionado
  useEffect(() => {
    if (allStores.length > 0 && users.length > 0) {
      const filteredStores = filterStoresByUser(selectedUser, allStores, users);
      setStores(filteredStores);
      
      // Si la tienda seleccionada no está en las tiendas filtradas, limpiarla
      if (selectedStore && !filteredStores.find(store => store._id === selectedStore)) {
        setSelectedStore('');
      }
    }
  }, [selectedUser, allStores, users]);

  // Cargar reporte cuando cambien los filtros
  useEffect(() => {
    if (dateFrom && dateTo) {
      loadSalesReport();
    }
  }, [dateFrom, dateTo, selectedStore, selectedUser, selectedCategory, selectedPaymentMethod, selectedOrderStatus, searchTerm]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadSalesReport();
    }, 300000); // 5 minutos

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const loadFilterData = async () => {
    try {
      setFiltersLoading(true);
      setFiltersError(null);
      console.log('🔍 Cargando datos de filtros...');
      
      // Verificar si el usuario está autenticado
      if (!user) {
        setFiltersError('Usuario no autenticado');
        return;
      }

      // Verificar si el token existe
      const token = localStorage.getItem('token');
      if (!token) {
        setFiltersError('Token de autenticación no encontrado');
        return;
      }

      // Verificar si la autenticación es válida
      const isAuthValid = await refreshAuth();
      if (!isAuthValid) {
        setFiltersError('Sesión expirada, redirigiendo al login...');
        return;
      }
      
      // Cargar tiendas
      console.log('📊 Cargando tiendas...');
      console.log('📊 Token:', token ? 'Presente' : 'Ausente');
      
      const storesResponse = await fetch('/api/stores', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('📊 Respuesta tiendas:', storesResponse.status, storesResponse.statusText);
      
      if (storesResponse.ok) {
        const storesData = await storesResponse.json();
        console.log('📊 Datos de tiendas:', storesData);
        
        // Extraer las tiendas del objeto data.stores o data.data.stores
        let storesArray = [];
        if (storesData.data && storesData.data.stores) {
          storesArray = storesData.data.stores;
        } else if (storesData.data && Array.isArray(storesData.data)) {
          storesArray = storesData.data;
        } else if (Array.isArray(storesData)) {
          storesArray = storesData;
        }
        
        // Mapear las tiendas para incluir el campo location basado en address
        const mappedStores = storesArray.map((store: any) => ({
          ...store,
          location: store.location || store.address || `${store.city}, ${store.state}` || 'Sin ubicación'
        }));
        
        setStores(mappedStores);
        setAllStores(mappedStores); // Actualizar todas las tiendas disponibles
        console.log('📊 Tiendas mapeadas:', mappedStores.length);
      } else {
        console.error('❌ Error cargando tiendas:', storesResponse.status, storesResponse.statusText);
        setStores([]); // Establecer array vacío en caso de error
        setAllStores([]); // Establecer array vacío en caso de error
        setFiltersError(`Error cargando tiendas: ${storesResponse.status}`);
      }

      // Cargar usuarios
      console.log('👥 Cargando usuarios...');
      const usersResponse = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('👥 Respuesta usuarios:', usersResponse.status, usersResponse.statusText);
      
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        console.log('👥 Datos de usuarios:', usersData);
        
        // Extraer usuarios del campo 'users' o 'data'
        let usersArray = [];
        if (usersData.users && Array.isArray(usersData.users)) {
          usersArray = usersData.users;
        } else if (usersData.data && Array.isArray(usersData.data)) {
          usersArray = usersData.data;
        } else if (Array.isArray(usersData)) {
          usersArray = usersData;
        }
        
        setUsers(usersArray);
        console.log('👥 Usuarios cargados:', usersArray.length);
        
        // Si hay un usuario seleccionado, actualizar el término de búsqueda
        if (selectedUser && usersArray.length > 0) {
          const selectedUserData = usersArray.find((u: User) => u._id === selectedUser);
          if (selectedUserData) {
            setUserSearchTerm(`${selectedUserData.firstName} ${selectedUserData.lastName}`);
          }
        }
      } else {
        console.error('❌ Error cargando usuarios:', usersResponse.status, usersResponse.statusText);
        setUsers([]); // Establecer array vacío en caso de error
        setFiltersError(`Error cargando usuarios: ${usersResponse.status}`);
      }

      // Cargar categorías
      console.log('📂 Cargando categorías...');
      const categoriesResponse = await fetch('/api/categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('📂 Respuesta categorías:', categoriesResponse.status, categoriesResponse.statusText);
      
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        console.log('📂 Datos de categorías:', categoriesData);
        // Asegurar que categories sea siempre un array
        const categoriesArray = Array.isArray(categoriesData.data) ? categoriesData.data.map((cat: any) => cat.name) : 
                              Array.isArray(categoriesData) ? categoriesData.map((cat: any) => cat.name) : [];
        setCategories(categoriesArray);
      } else {
        console.error('❌ Error cargando categorías:', categoriesResponse.status, categoriesResponse.statusText);
        setCategories([]); // Establecer array vacío en caso de error
        setFiltersError(`Error cargando categorías: ${categoriesResponse.status}`);
      }
      
      console.log('✅ Carga de filtros completada');
    } catch (error) {
      console.error('❌ Error loading filter data:', error);
      setFiltersError('Error de conexión al cargar filtros');
    } finally {
      setFiltersLoading(false);
    }
  };

  const loadSalesReport = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        dateFrom,
        dateTo,
        ...(selectedStore && { storeId: selectedStore }),
        ...(selectedUser && { userId: selectedUser }),
        ...(selectedCategory && { categoryId: selectedCategory }),
        ...(selectedPaymentMethod && { paymentMethod: selectedPaymentMethod }),
        ...(selectedOrderStatus.length > 0 && { orderStatus: selectedOrderStatus.join(',') }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`/api/sales-reports/admin?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar el reporte');
      }

      const data = await response.json();
      setReport(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      const params = new URLSearchParams({
        dateFrom,
        dateTo,
        format,
        ...(selectedStore && { storeId: selectedStore }),
        ...(selectedUser && { userId: selectedUser }),
        ...(selectedCategory && { categoryId: selectedCategory }),
        ...(selectedPaymentMethod && { paymentMethod: selectedPaymentMethod }),
        ...(selectedOrderStatus.length > 0 && { orderStatus: selectedOrderStatus.join(',') }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`/api/sales-reports/admin/export?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al exportar');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `admin-sales-report-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error exporting:', err);
    }
  };

  const handleGenerateTestData = async () => {
    try {
      const response = await fetch('/api/sales-reports/generate-test-data', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al generar datos de prueba');
      }

      const data = await response.json();
      alert(data.message);
      
      // Recargar el reporte después de generar datos
      loadSalesReport();
    } catch (err) {
      console.error('Error generating test data:', err);
      alert('Error al generar datos de prueba');
    }
  };



  // Función para filtrar tiendas basada en el usuario seleccionado
  const filterStoresByUser = (userId: string, allStoresList: Store[], usersList: User[]) => {
    if (!userId) {
      // Si no hay usuario seleccionado, mostrar todas las tiendas
      return allStoresList;
    }

    // Buscar el usuario seleccionado
    const selectedUserData = usersList.find(user => user._id === userId);
    if (!selectedUserData) {
      return allStoresList;
    }

    // Si el usuario es store_manager, mostrar solo sus tiendas asignadas
    if (selectedUserData.role === 'store_manager' && selectedUserData.stores) {
      return allStoresList.filter(store => 
        selectedUserData.stores?.includes(store._id)
      );
    }

    // Para otros roles, mostrar todas las tiendas
    return allStoresList;
  };

  const clearFilters = () => {
    setSelectedStore('');
    setSelectedUser('');
    setSelectedCategory('');
    setSelectedPaymentMethod('');
    setSelectedOrderStatus([]);
    setSearchTerm('');
    setUserSearchTerm('');
    setFilteredUsers([]);
    setShowUserDropdown(false);
    // Restaurar todas las tiendas cuando se limpian los filtros
    setStores(allStores);
  };

  const refreshAuth = async () => {
    try {
      console.log('🔄 Refrescando autenticación...');
      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Token válido, usuario:', data.user?.email);
        return true;
      } else {
        console.log('❌ Token inválido, redirigiendo al login...');
        localStorage.removeItem('token');
        window.location.href = '/login';
        return false;
      }
    } catch (error) {
      console.error('❌ Error verificando token:', error);
      return false;
    }
  };

  const testEndpointsWithoutAuth = async () => {
    try {
      console.log('🧪 Probando endpoints sin autenticación...');
      
      // Probar endpoint de tiendas sin auth
      const storesResponse = await fetch('/api/stores');
      console.log('📊 Tiendas sin auth:', storesResponse.status, storesResponse.statusText);
      
      // Probar endpoint de categorías sin auth
      const categoriesResponse = await fetch('/api/categories');
      console.log('📂 Categorías sin auth:', categoriesResponse.status, categoriesResponse.statusText);

      // Probar endpoint de usuarios sin auth
      const usersResponse = await fetch('/api/admin/users');
      console.log('👥 Usuarios sin auth:', usersResponse.status, usersResponse.statusText);
      
             if (storesResponse.ok) {
         const storesData = await storesResponse.json();
         console.log('📊 Datos de tiendas sin auth:', storesData);
         
         // Extraer las tiendas del objeto data.stores o data.data.stores
         let storesArray = [];
         if (storesData.data && storesData.data.stores) {
           storesArray = storesData.data.stores;
         } else if (storesData.data && Array.isArray(storesData.data)) {
           storesArray = storesData.data;
         } else if (Array.isArray(storesData)) {
           storesArray = storesData;
         }
         
         // Mapear las tiendas para incluir el campo location basado en address
         const mappedStores = storesArray.map((store: any) => ({
           ...store,
           location: store.location || store.address || `${store.city}, ${store.state}` || 'Sin ubicación'
         }));
         
         setStores(mappedStores);
         setAllStores(mappedStores); // Actualizar todas las tiendas disponibles
         console.log('📊 Tiendas mapeadas sin auth:', mappedStores.length);
       }
      
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        console.log('📂 Datos de categorías sin auth:', categoriesData);
        const categoriesArray = Array.isArray(categoriesData.data) ? categoriesData.data.map((cat: any) => cat.name) : 
                              Array.isArray(categoriesData) ? categoriesData.map((cat: any) => cat.name) : [];
        setCategories(categoriesArray);
      } else {
        // Si el endpoint de categorías falla, usar categorías estáticas
        console.log('📂 Usando categorías estáticas...');
        const staticCategories = [
          'Transmisión', 'Sistema de Combustible', 'Suspensión Neumática', 
          'Aceite y líquidos', 'Frenos', 'Motor', 'Sistema Eléctrico',
          'Carrocería', 'Interior', 'Exterior', 'Neumáticos', 'Suspensión'
        ];
        setCategories(staticCategories);
      }
      
    } catch (error) {
      console.error('❌ Error probando endpoints sin auth:', error);
      // En caso de error, usar datos estáticos
      const staticCategories = [
        'Transmisión', 'Sistema de Combustible', 'Suspensión Neumática', 
        'Aceite y líquidos', 'Frenos', 'Motor', 'Sistema Eléctrico',
        'Carrocería', 'Interior', 'Exterior', 'Neumáticos', 'Suspensión'
      ];
      setCategories(staticCategories);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-ES').format(num);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getGrowthIndicator = (current: number, previous: number) => {
    if (current > previous) return <ArrowUpRight className="h-4 w-4 text-green-500" />;
    if (current < previous) return <ArrowDownRight className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  if (loading && !report) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Cargando reporte de ventas...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <TrendingDown className="h-5 w-5 text-red-400" />
            <span className="ml-2 text-red-800">Error: {error}</span>
          </div>
          <button
            onClick={loadSalesReport}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Reportes de Ventas - Administrador
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Análisis global de ventas con filtros avanzados
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-2 rounded-lg border ${
              autoRefresh
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-gray-50 border-gray-200 text-gray-700'
            }`}
          >
            <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
          >
            <Filter className="h-4 w-4" />
            <span className="ml-2">Filtros Avanzados</span>
          </button>

                     <button
             onClick={() => {
               setSelectedStore('');
               setSelectedUser('');
               setSelectedCategory('');
               setSelectedPaymentMethod('');
               setSelectedOrderStatus([]);
               setSearchTerm('');
               setUserSearchTerm('');
               setFilteredUsers([]);
               setShowUserDropdown(false);
               // Restaurar todas las tiendas
               setStores(allStores);
             }}
             className="px-4 py-2 bg-blue-100 dark:bg-blue-700 rounded-lg border border-blue-200 dark:border-blue-600 text-blue-700 dark:text-blue-300"
           >
             <RefreshCw className="h-4 w-4" />
             <span className="ml-2">Limpiar Filtros</span>
           </button>

          <div className="relative">
            <button
              onClick={() => handleExport('csv')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="h-4 w-4" />
              <span className="ml-2">Exportar</span>
            </button>
          </div>

          <button
            onClick={handleGenerateTestData}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="ml-2">Generar Datos de Prueba</span>
          </button>


        </div>
      </div>

             {/* Indicador de filtros activos */}
       {(selectedStore || selectedUser || selectedCategory || selectedPaymentMethod || selectedOrderStatus.length > 0 || searchTerm) && (
         <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
           <div className="flex items-center justify-between">
             <div className="flex items-center gap-2">
               <Filter className="h-4 w-4 text-blue-600" />
               <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Filtros activos:</span>
               <div className="flex gap-2">
                 {selectedUser && (
                   <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                     Usuario: {Array.isArray(users) ? `${users.find(u => u._id === selectedUser)?.firstName || ''} ${users.find(u => u._id === selectedUser)?.lastName || ''}` : 'N/A'}
                     {Array.isArray(users) && users.find(u => u._id === selectedUser)?.role === 'store_manager' && (
                       <span className="ml-1 text-blue-500">(Gestor)</span>
                     )}
                   </span>
                 )}
                 {selectedStore && (
                   <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                     Tienda: {Array.isArray(stores) ? stores.find(s => s._id === selectedStore)?.name : 'N/A'}
                   </span>
                 )}
                 {selectedCategory && (
                   <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Categoría: {selectedCategory}</span>
                 )}
                 {selectedPaymentMethod && (
                   <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Pago: {selectedPaymentMethod}</span>
                 )}
                 {selectedOrderStatus.length > 0 && (
                   <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                     Estados: {selectedOrderStatus.length}
                   </span>
                 )}
                 {searchTerm && (
                   <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Búsqueda: {searchTerm}</span>
                 )}
               </div>
             </div>
             <button
               onClick={() => {
                 setSelectedStore('');
                 setSelectedUser('');
                 setSelectedCategory('');
                 setSelectedPaymentMethod('');
                 setSelectedOrderStatus([]);
                 setSearchTerm('');
                 setUserSearchTerm('');
                 setFilteredUsers([]);
                 setShowUserDropdown(false);
                 // Restaurar todas las tiendas
                 setStores(allStores);
               }}
               className="text-sm text-blue-600 hover:text-blue-800"
             >
               Limpiar todos
             </button>
           </div>
         </div>
       )}
        

      {/* Filtros Avanzados */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                     <div className="flex items-center justify-between mb-4">
             <h3 className="text-lg font-semibold">Filtros Avanzados</h3>
           </div>
          
          {filtersError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{filtersError}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Fechas */}
            <div>
              <label className="block text-sm font-medium mb-2">Fecha Desde</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Fecha Hasta</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Tienda */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Tienda {filtersLoading && <span className="text-blue-500">(Cargando...)</span>}
                {selectedUser && (
                  <span className="text-xs text-blue-600 ml-2">
                    (Filtrado por usuario)
                  </span>
                )}
              </label>
              <select
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={filtersLoading}
              >
                <option value="">
                  {selectedUser 
                    ? `Tiendas del usuario (${Array.isArray(stores) ? stores.length : 0})` 
                    : `Todas las tiendas (${Array.isArray(stores) ? stores.length : 0})`
                  }
                </option>
                {Array.isArray(stores) && stores.map((store) => (
                  <option key={store._id} value={store._id}>
                    {store.name} - {store.location}
                  </option>
                ))}
              </select>
              {(!Array.isArray(stores) || stores.length === 0) && !filtersLoading && (
                <p className="text-xs text-red-500 mt-1">
                  {selectedUser 
                    ? 'El usuario seleccionado no tiene tiendas asignadas' 
                    : 'No se pudieron cargar las tiendas'
                  }
                </p>
              )}
            </div>

            {/* Usuario */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Usuario {filtersLoading && <span className="text-blue-500">(Cargando...)</span>}
                {selectedUser && Array.isArray(users) && (
                  <span className="text-xs text-blue-600 ml-2">
                    ({users.find(u => u._id === selectedUser)?.role || 'N/A'})
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                   type="text"
                   value={userSearchTerm}
                   placeholder="Buscar usuario por nombre o correo..."
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                   onChange={(e) => {
                     const searchTerm = e.target.value.toLowerCase();
                     const filteredUsers = Array.isArray(users) ? users.filter(user => 
                       `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm) ||
                       user.email.toLowerCase().includes(searchTerm)
                     ) : [];
                     setFilteredUsers(filteredUsers);
                     setUserSearchTerm(e.target.value);
                   }}
                   onFocus={() => setShowUserDropdown(true)}
                   onBlur={() => {
                     // Delay para permitir hacer clic en las opciones
                     setTimeout(() => setShowUserDropdown(false), 200);
                   }}
                 />
                <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                
                {/* Dropdown de usuarios */}
                {showUserDropdown && Array.isArray(filteredUsers) && filteredUsers.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredUsers.map((user) => (
                      <div
                        key={user._id}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                                                 onClick={() => {
                           setSelectedUser(user._id);
                           setShowUserDropdown(false);
                           setUserSearchTerm(`${user.firstName} ${user.lastName}`);
                           
                           // Filtrar tiendas inmediatamente
                           const filteredStores = filterStoresByUser(user._id, allStores, users);
                           setStores(filteredStores);
                           
                           // Limpiar tienda seleccionada si no está en las filtradas
                           if (selectedStore && !filteredStores.find(store => store._id === selectedStore)) {
                             setSelectedStore('');
                           }
                         }}
                      >
                        <div className="font-medium text-sm">{user.firstName} {user.lastName}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                        <div className="text-xs text-blue-500 capitalize">{user.role}</div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Usuario seleccionado */}
                {selectedUser && Array.isArray(users) && (
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">
                          {users.find(u => u._id === selectedUser)?.firstName} {users.find(u => u._id === selectedUser)?.lastName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {users.find(u => u._id === selectedUser)?.email}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedUser('');
                          setUserSearchTerm('');
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
                             {(!Array.isArray(users) || users.length === 0) && !filtersLoading && (
                 <p className="text-xs text-red-500 mt-1">No se pudieron cargar los usuarios</p>
               )}
               {selectedUser && Array.isArray(users) && users.find(u => u._id === selectedUser)?.role === 'store_manager' && (
                 <p className="text-xs text-blue-600 mt-1">
                   💡 Al seleccionar un gestor de tienda, solo se mostrarán sus tiendas asignadas
                 </p>
               )}
             </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Categoría {filtersLoading && <span className="text-blue-500">(Cargando...)</span>}
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={filtersLoading}
              >
                                 <option value="">Todas las categorías ({Array.isArray(categories) ? categories.length : 0})</option>
                 {Array.isArray(categories) && categories.map((category) => (
                   <option key={category} value={category}>
                     {category}
                   </option>
                 ))}
              </select>
                             {(!Array.isArray(categories) || categories.length === 0) && !filtersLoading && (
                 <p className="text-xs text-red-500 mt-1">No se pudieron cargar las categorías</p>
               )}
            </div>

            {/* Método de Pago */}
            <div>
              <label className="block text-sm font-medium mb-2">Método de Pago</label>
              <select
                value={selectedPaymentMethod}
                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los métodos</option>
                <option value="credit_card">Tarjeta de Crédito</option>
                <option value="debit_card">Tarjeta de Débito</option>
                <option value="cash">Efectivo</option>
                <option value="transfer">Transferencia</option>
              </select>
            </div>

            {/* Estado de Orden */}
            <div>
              <label className="block text-sm font-medium mb-2">Estado de Orden</label>
              <select
                multiple
                value={selectedOrderStatus}
                onChange={(e) => setSelectedOrderStatus(Array.from(e.target.selectedOptions, option => option.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">Pendiente</option>
                <option value="confirmed">Confirmado</option>
                <option value="processing">Procesando</option>
                <option value="shipped">Enviado</option>
                <option value="delivered">Entregado</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>

            {/* Búsqueda */}
            <div>
              <label className="block text-sm font-medium mb-2">Búsqueda</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por producto, cliente..."
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Resumen de filtros activos */}
          {(selectedStore || selectedUser || selectedCategory || selectedPaymentMethod || selectedOrderStatus.length > 0 || searchTerm) && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">Filtros Activos:</h4>
              <div className="flex flex-wrap gap-2">
                                 {selectedStore && (
                   <span className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs rounded">
                     Tienda: {Array.isArray(stores) ? stores.find(s => s._id === selectedStore)?.name : 'N/A'}
                   </span>
                 )}
                                 {selectedUser && (
                   <span className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs rounded">
                     Usuario: {Array.isArray(users) ? `${users.find(u => u._id === selectedUser)?.firstName || ''} ${users.find(u => u._id === selectedUser)?.lastName || ''}` : 'N/A'}
                   </span>
                 )}
                {selectedCategory && (
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs rounded">
                    Categoría: {selectedCategory}
                  </span>
                )}
                {selectedPaymentMethod && (
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs rounded">
                    Pago: {selectedPaymentMethod}
                  </span>
                )}
                {selectedOrderStatus.length > 0 && (
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs rounded">
                    Estados: {selectedOrderStatus.join(', ')}
                  </span>
                )}
                {searchTerm && (
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs rounded">
                    Búsqueda: {searchTerm}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navegación de vistas */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'overview', label: 'Vista General', icon: BarChart3 },
          { id: 'trends', label: 'Tendencias', icon: TrendingUp },
          { id: 'products', label: 'Productos', icon: Package },
          { id: 'customers', label: 'Clientes', icon: Users },
          { id: 'payments', label: 'Pagos', icon: DollarSign },
          { id: 'stores', label: 'Por Tiendas', icon: Building2 }
        ].map((view) => (
          <button
            key={view.id}
            onClick={() => setSelectedView(view.id as any)}
            className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
              selectedView === view.id
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <view.icon className="h-4 w-4 mr-2" />
            {view.label}
          </button>
        ))}
      </div>

      {/* Vista General */}
      {selectedView === 'overview' && report && (
        <div className="space-y-6">
          {/* Métricas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Total Ventas Global</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(report.overview.totalSales)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {report.overview.totalOrders} órdenes
                  </p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Valor Promedio</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(report.overview.averageOrderValue)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    por orden
                  </p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Total Clientes</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(report.overview.totalCustomers)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {report.overview.newCustomers} nuevos
                  </p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Tasa Conversión</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatPercentage(report.overview.conversionRate)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatNumber(report.overview.totalItemsSold)} items vendidos
                  </p>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <Activity className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Gráficos principales */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de tendencias */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Tendencias de Ventas Globales</h3>
                <select
                  value={trendPeriod}
                  onChange={(e) => setTrendPeriod(e.target.value as any)}
                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="daily">Diario</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensual</option>
                </select>
              </div>
              <SalesChart
                type="bar"
                data={report.trends[trendPeriod].map((trend: any) => ({
                  name: trendPeriod === 'daily' ? trend.date : trendPeriod === 'weekly' ? trend.week : trend.month,
                  value: trend.sales,
                  orders: trend.orders,
                  customers: trend.customers
                }))}
                xKey="name"
                yKey="value"
                height={250}
                colors={['#3B82F6']}
              />
            </div>

            {/* Gráfico de productos top */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-4">Productos Más Vendidos Globales</h3>
              <div className="space-y-3">
                {report.topProducts.slice(0, 5).map((product, index) => (
                  <div key={product.productId} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </span>
                      <div className="ml-3">
                        <p className="text-sm font-medium">{product.productName}</p>
                        <p className="text-xs text-gray-500">{product.sku}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatNumber(product.quantitySold)}</p>
                      <p className="text-xs text-gray-500">{formatCurrency(product.totalRevenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vista de Tiendas */}
      {selectedView === 'stores' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold mb-6">Análisis por Tiendas</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium">Tienda</th>
                    <th className="text-left py-3 px-4 font-medium">Ubicación</th>
                    <th className="text-right py-3 px-4 font-medium">Ventas</th>
                    <th className="text-right py-3 px-4 font-medium">Órdenes</th>
                    <th className="text-right py-3 px-4 font-medium">Clientes</th>
                    <th className="text-right py-3 px-4 font-medium">Valor Prom.</th>
                    <th className="text-right py-3 px-4 font-medium">Rendimiento</th>
                  </tr>
                </thead>
                <tbody>
                                     {Array.isArray(stores) && stores.map((store) => (
                     <tr key={store._id} className="border-b border-gray-100 dark:border-gray-800">
                       <td className="py-3 px-4">
                         <div>
                           <p className="font-medium">{store.name}</p>
                           <p className="text-sm text-gray-500">{store.location}</p>
                         </div>
                       </td>
                       <td className="py-3 px-4 text-sm text-gray-600">{store.location}</td>
                       <td className="py-3 px-4 text-right font-medium">$0.00</td>
                       <td className="py-3 px-4 text-right">0</td>
                       <td className="py-3 px-4 text-right">0</td>
                       <td className="py-3 px-4 text-right text-sm">$0.00</td>
                       <td className="py-3 px-4 text-right">
                         <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                           N/A
                         </span>
                       </td>
                     </tr>
                   ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Información del período */}
      {report && (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>
              Período: {new Date(report.period.from).toLocaleDateString()} - {new Date(report.period.to).toLocaleDateString()}
            </span>
            <span>
              {report.period.days} días de datos
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSalesReports;
