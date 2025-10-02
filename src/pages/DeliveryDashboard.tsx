import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Link } from 'react-router-dom';
import {
  Truck,
  MapPin,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  BarChart3,
  Activity,
  Package,
  UserCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Navigation,
  Star,
  Calendar,
  Bell,
  Settings,
  User,
  FileText,
  Phone,
  Mail,
  Car,
  Wifi,
  WifiOff,
  Play,
  Pause,
  Home,
  ShoppingBag,
  Map
} from 'lucide-react';

interface DeliveryOrder {
  _id: string;
  orderId: any;
  storeId: any;
  customerId: any;
  status: 'pending' | 'assigned' | 'accepted' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled' | 'failed';
  pickupLocation: {
    address: string;
    coordinates: { lat: number; lng: number };
    storeName: string;
  };
  deliveryLocation: {
    address: string;
    coordinates: { lat: number; lng: number };
    customerName: string;
    customerPhone: string;
    instructions?: string;
  };
  deliveryFee: number;
  riderPayment: number;
  trackingCode: string;
  estimatedPickupTime?: string;
  estimatedDeliveryTime?: string;
  actualPickupTime?: string;
  actualDeliveryTime?: string;
  createdAt: string;
  updatedAt: string;
}

interface DeliveryStats {
  totalDeliveries: number;
  completedDeliveries: number;
  cancelledDeliveries: number;
  totalEarnings: number;
  totalDistance: number;
  averageDeliveryTime: number;
  onTimeDeliveries: number;
  lateDeliveries: number;
  onTimeRate: number;
  currentMonthDeliveries: number;
  currentMonthEarnings: number;
  averageRating: number;
  totalReviews: number;
}

interface DeliveryProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  deliveryStatus: 'available' | 'unavailable' | 'busy' | 'on_route' | 'returning_to_store';
  autoStatusMode: boolean;
  currentOrder?: string;
  deliveryZone: {
    center: [number, number];
    radius: number;
  };
  vehicleInfo: {
    type: string;
    model: string;
    plate: string;
  };
  workSchedule: {
    startTime: string;
    endTime: string;
    daysOfWeek: number[];
  };
  rating: {
    average: number;
    totalReviews: number;
  };
  stats: {
    totalDeliveries: number;
    completedDeliveries: number;
    totalEarnings: number;
    averageDeliveryTime: number;
  };
}

const DeliveryDashboard: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { t } = useLanguage();

  // Estados principales
  const [assignedOrders, setAssignedOrders] = useState<DeliveryOrder[]>([]);
  const [profile, setProfile] = useState<DeliveryProfile | null>(null);
  const [stats, setStats] = useState<DeliveryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de control
  const [isOnline, setIsOnline] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadData();
    loadUserLocation();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Intentar cargar datos del backend
      try {
        // Cargar órdenes asignadas al delivery
        const ordersResponse = await fetch('/api/orders/delivery', {
          headers
        });

        if (ordersResponse.ok) {
          try {
            const ordersData = await ordersResponse.json();
            console.log('Orders data:', ordersData);
            const orders = Array.isArray(ordersData.data?.orders) ? ordersData.data.orders : [];
            setAssignedOrders(orders);
          } catch (jsonError) {
            console.warn('Error parsing orders JSON, using mock data:', jsonError);
            setAssignedOrders(getMockOrders());
          }
        } else {
          console.warn('Error loading orders, using mock data');
          setAssignedOrders(getMockOrders());
        }

        // Cargar perfil del delivery
        const profileResponse = await fetch('/api/delivery/profile', {
          headers
        });

        if (profileResponse.ok) {
          try {
            const profileData = await profileResponse.json();
            console.log('Profile data:', profileData);
            setProfile(profileData.data);
            setIsOnline(profileData.data.deliveryStatus !== 'unavailable');
            setIsAvailable(profileData.data.deliveryStatus === 'available');
          } catch (jsonError) {
            console.warn('Error parsing profile JSON, using mock data:', jsonError);
            setProfile(getMockProfile());
            setIsOnline(true);
            setIsAvailable(true);
          }
        } else {
          console.warn('Error loading profile, using mock data');
          setProfile(getMockProfile());
          setIsOnline(true);
          setIsAvailable(true);
        }

        // Cargar estadísticas del delivery
        const statsResponse = await fetch('/api/delivery/stats/personal', {
          headers
        });

        if (statsResponse.ok) {
          try {
            const statsData = await statsResponse.json();
            console.log('Stats data:', statsData);
            setStats(statsData.data);
          } catch (jsonError) {
            console.warn('Error parsing stats JSON, using mock data:', jsonError);
            setStats(getMockStats());
          }
        } else {
          console.warn('Error loading stats, using mock data');
          setStats(getMockStats());
        }

      } catch (fetchError) {
        console.warn('Backend not available, using mock data:', fetchError);
        // Usar datos mock si el backend no está disponible
        setAssignedOrders(getMockOrders());
        setProfile(getMockProfile());
        setStats(getMockStats());
        setIsOnline(true);
        setIsAvailable(true);
      }

    } catch (err) {
      console.error('Error loading data:', err);
      setError('Error cargando datos del delivery. Verifique su conexión e intente nuevamente.');
      setAssignedOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Datos mock para cuando el backend no esté disponible
  const getMockOrders = (): DeliveryOrder[] => [
    {
      _id: 'order1',
      orderId: 'ORD-001',
      storeId: 'store1',
      customerId: 'customer1',
      status: 'assigned',
      pickupLocation: {
        address: 'Av. Principal 123, Caracas',
        coordinates: { lat: 10.4806, lng: -66.9036 },
        storeName: 'PiezasYA Centro'
      },
      deliveryLocation: {
        address: 'Calle 5 de Julio 456, Caracas',
        coordinates: { lat: 10.4906, lng: -66.8936 },
        customerName: 'Juan Pérez',
        customerPhone: '+58 412 1234567',
        instructions: 'Entregar en recepción'
      },
      deliveryFee: 5.00,
      riderPayment: 8.00,
      trackingCode: 'TRK001',
      estimatedPickupTime: '2024-01-20T10:00:00Z',
      estimatedDeliveryTime: '2024-01-20T11:30:00Z',
      createdAt: '2024-01-20T09:00:00Z',
      updatedAt: '2024-01-20T09:00:00Z'
    }
  ];

  const getMockProfile = (): DeliveryProfile => ({
    _id: 'delivery1',
    name: 'Juan Delivery',
    email: 'juanchospot74@gmail.com',
    phone: '+58 412 1234567',
    vehicle: {
      type: 'motorcycle',
      brand: 'Honda',
      model: 'CB 250',
      year: 2020,
      plate: 'ABC-123'
    },
    deliveryZone: {
      center: { lat: 10.4806, lng: -66.9036 },
      radius: 10
    },
    workSchedule: {
      monday: { start: '08:00', end: '17:00', isWorking: true },
      tuesday: { start: '08:00', end: '17:00', isWorking: true },
      wednesday: { start: '08:00', end: '17:00', isWorking: true },
      thursday: { start: '08:00', end: '17:00', isWorking: true },
      friday: { start: '08:00', end: '17:00', isWorking: true },
      saturday: { start: '08:00', end: '15:00', isWorking: true },
      sunday: { start: '09:00', end: '14:00', isWorking: false }
    },
    deliveryStatus: 'available',
    isOnline: true,
    currentLocation: { lat: 10.4806, lng: -66.9036 },
    rating: 4.8,
    totalDeliveries: 156,
    totalEarnings: 1250.00,
    averageDeliveryTime: 25
  });

  const getMockStats = (): DeliveryStats => ({
    totalDeliveries: 156,
    completedToday: 8,
    pendingDeliveries: 2,
    averageRating: 4.8,
    totalEarnings: 1250.00,
    todayEarnings: 45.00,
    averageDeliveryTime: 25,
    onTimeDeliveries: 95
  });

  const loadUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const updateAvailabilityStatus = async (status: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/delivery/status', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          deliveryStatus: status,
          currentLocation: currentLocation
        })
      });

      if (response.ok) {
        setIsOnline(status !== 'unavailable');
        setIsAvailable(status === 'available');
        await loadData(); // Recargar datos
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'assigned': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'accepted': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'picked_up': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'in_transit': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      case 'delivered': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'failed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'assigned': return <UserCheck className="h-4 w-4" />;
      case 'accepted': return <CheckCircle className="h-4 w-4" />;
      case 'picked_up': return <Package className="h-4 w-4" />;
      case 'in_transit': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      case 'failed': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES');
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600 dark:text-gray-300">Cargando dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#333333] flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-[#444444] rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded-full">
                <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
            </div>
            
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Error al Cargar Dashboard
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {error}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Verifique su conexión a internet y que el servidor esté funcionando correctamente.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={loadData}
                className="w-full px-4 py-3 bg-[#FFC300] text-[#333333] rounded-lg hover:bg-[#E6B800] transition-colors font-medium"
              >
                <RefreshCw className="w-4 h-4 inline mr-2" />
                Reintentar
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Recargar Página
              </button>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Si el problema persiste, contacte al administrador del sistema.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header del dashboard */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard de Delivery
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Bienvenido, {profile?.firstName} {profile?.lastName}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Control de disponibilidad */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateAvailabilityStatus(isOnline ? 'unavailable' : 'available')}
              className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
                isOnline
                  ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300'
                  : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'
              }`}
            >
              {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
              <span className="ml-2">{isOnline ? 'Online' : 'Offline'}</span>
            </button>

            {isOnline && (
              <button
                onClick={() => updateAvailabilityStatus(isAvailable ? 'busy' : 'available')}
                className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
                  isAvailable
                    ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300'
                    : 'bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300'
                }`}
              >
                {isAvailable ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                <span className="ml-2">{isAvailable ? 'Disponible' : 'Ocupado'}</span>
              </button>
            )}
          </div>

          <button
            onClick={loadData}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="ml-2">Actualizar</span>
          </button>
        </div>
      </div>

      {/* Información del perfil y vehículo */}
      {profile && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600 dark:text-gray-300">Vehículo</p>
                <p className="font-medium">
                  {profile?.vehicleInfo?.type || 'N/A'} - {profile?.vehicleInfo?.model || 'N/A'}
                </p>
                {profile?.vehicleInfo?.plate && (
                  <p className="text-xs text-gray-500">{profile.vehicleInfo.plate}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Star className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600 dark:text-gray-300">Calificación</p>
                <p className="font-medium">{profile?.rating?.average?.toFixed(1) || '0.0'} ⭐</p>
                <p className="text-xs text-gray-500">{profile?.rating?.totalReviews || 0} reseñas</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600 dark:text-gray-300">Horario</p>
                <p className="font-medium">{profile?.workSchedule?.startTime || 'N/A'} - {profile?.workSchedule?.endTime || 'N/A'}</p>
                <p className="text-xs text-gray-500">{profile?.workSchedule?.daysOfWeek?.length || 0} días/semana</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <MapPin className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600 dark:text-gray-300">Zona de trabajo</p>
                <p className="font-medium">{profile?.deliveryZone?.radius || 0} km</p>
                <p className="text-xs text-gray-500">Radio de cobertura</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Accesos rápidos */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {[
          { title: 'Órdenes', icon: ShoppingBag, path: '/delivery/orders', color: 'blue' },
          { title: 'Mapa', icon: Map, path: '/delivery/map', color: 'green' },
          { title: 'Reportes', icon: FileText, path: '/delivery/report', color: 'purple' },
          { title: 'Calificaciones', icon: Star, path: '/delivery/ratings', color: 'yellow' },
          { title: 'Horario', icon: Calendar, path: '/delivery/schedule', color: 'indigo' },
          { title: 'Estado', icon: Bell, path: '/delivery/status', color: 'orange' },
          { title: 'Perfil', icon: User, path: '/delivery/profile', color: 'pink' },
          { title: 'Configuración', icon: Settings, path: '/delivery/settings', color: 'gray' }
        ].map((item) => (
          <Link
            key={item.title}
            to={item.path}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-center hover:shadow-lg transition-shadow"
          >
            <div className={`p-2 bg-${item.color}-100 dark:bg-${item.color}-900 rounded-lg mx-auto w-fit mb-2`}>
              <item.icon className={`h-6 w-6 text-${item.color}-600 dark:text-${item.color}-400 mx-auto`} />
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{item.title}</p>
          </Link>
        ))}
      </div>

      {/* Estadísticas principales */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Entregas Completadas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.completedDeliveries || 0}
                </p>
                <p className="text-xs text-gray-500">Total: {stats?.totalDeliveries || 0}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Ganancias Totales</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(stats?.totalEarnings || 0)}
                </p>
                <p className="text-xs text-gray-500">Este mes: {formatCurrency(stats?.currentMonthEarnings || 0)}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Tiempo Promedio</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.averageDeliveryTime || 0} min
                </p>
                <p className="text-xs text-gray-500">A tiempo: {stats?.onTimeRate?.toFixed(1) || '0.0'}%</p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Distancia Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.totalDistance?.toFixed(1) || '0.0'} km
                </p>
                <p className="text-xs text-gray-500">Promedio por entrega</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Navigation className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Órdenes asignadas */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Órdenes Asignadas ({Array.isArray(assignedOrders) ? assignedOrders.length : 0})
          </h3>
          <Link
            to="/delivery/orders"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Ver todas
          </Link>
        </div>

        {!Array.isArray(assignedOrders) || assignedOrders.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No tienes órdenes asignadas actualmente</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Asegúrate de estar disponible para recibir nuevas asignaciones
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {assignedOrders.slice(0, 5).map((order) => (
              <div
                key={order._id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1 capitalize">{order.status.replace('_', ' ')}</span>
                      </span>
                      <span className="text-sm text-gray-500">#{order.trackingCode}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Recoger en:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{order.pickupLocation.storeName}</p>
                        <p className="text-xs text-gray-500">{order.pickupLocation.address}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Entregar a:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{order.deliveryLocation.customerName}</p>
                        <p className="text-xs text-gray-500">{order.deliveryLocation.address}</p>
                      </div>
                    </div>

                    {order.deliveryLocation.instructions && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500">Instrucciones: {order.deliveryLocation.instructions}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <p className="font-medium text-green-600 dark:text-green-400">
                      {formatCurrency(order.riderPayment)}
                    </p>
                    <div className="flex gap-2">
                      <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <Phone className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Información de contacto de emergencia */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Contacto de Emergencia</h4>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-blue-800 dark:text-blue-200">Soporte: +58 412-123-4567</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-blue-800 dark:text-blue-200">soporte@piezasyapp.com</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDashboard;
