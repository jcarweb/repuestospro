import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  MapPin, 
  Clock, 
  Package, 
  User, 
  Phone, 
  Mail, 
  Navigation,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Truck,
  Timer,
  Star,
  MessageSquare,
  Camera,
  FileText,
  ArrowLeft,
  ArrowRight,
  Pause,
  Play,
  StopCircle
} from 'lucide-react';

interface DeliveryOrder {
  _id: string;
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
    email: string;
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  store: {
    name: string;
    address: string;
    phone: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedTime: number; // en minutos
  actualTime?: number; // en minutos
  notes?: string;
  deliveryProof?: string;
  createdAt: string;
  updatedAt: string;
}

interface DeliveryStats {
  totalDeliveries: number;
  completedToday: number;
  averageTime: number;
  rating: number;
  totalEarnings: number;
  currentStatus: 'online' | 'offline' | 'busy';
}

const DeliveryStatus: React.FC = () => {
  const { user, token } = useAuth();
  const { t } = useLanguage();
  
  const [currentOrder, setCurrentOrder] = useState<DeliveryOrder | null>(null);
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [stats, setStats] = useState<DeliveryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [showMap, setShowMap] = useState(false);

  // Cargar datos del delivery
  const fetchDeliveryData = async () => {
    try {
      setLoading(true);
      
      // Simular carga de datos
      const mockOrders: DeliveryOrder[] = [
        {
          _id: '1',
          orderNumber: 'ORD-001',
          customer: {
            name: 'Juan Pérez',
            phone: '+58 412 123 4567',
            email: 'juan@email.com',
            address: 'Av. Francisco de Miranda, Torre Parque Cristal, Caracas',
            coordinates: { lat: 10.4806, lng: -66.9036 }
          },
          store: {
            name: 'Repuestos El Motor',
            address: 'C.C. Sambil, Nivel 2, Local 45',
            phone: '+58 212 555 0123',
            coordinates: { lat: 10.4969, lng: -66.8539 }
          },
          items: [
            { name: 'Filtro de Aceite', quantity: 2, price: 25.00 },
            { name: 'Bujías NGK', quantity: 4, price: 15.00 }
          ],
          total: 110.00,
          status: 'assigned',
          priority: 'high',
          estimatedTime: 45,
          notes: 'Entregar en horario de oficina',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      const mockStats: DeliveryStats = {
        totalDeliveries: 156,
        completedToday: 8,
        averageTime: 35,
        rating: 4.8,
        totalEarnings: 1250.50,
        currentStatus: 'online'
      };

      setOrders(mockOrders);
      setCurrentOrder(mockOrders[0]);
      setStats(mockStats);
    } catch (error) {
      console.error('Error cargando datos del delivery:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchDeliveryData();
    }
  }, [user, token]);

  // Toggle estado online/offline
  const handleToggleStatus = () => {
    setIsOnline(!isOnline);
    // Aquí se enviaría la actualización al backend
  };

  // Actualizar estado de la orden
  const handleUpdateOrderStatus = (newStatus: DeliveryOrder['status']) => {
    if (!currentOrder) return;

    const updatedOrder = { ...currentOrder, status: newStatus };
    setCurrentOrder(updatedOrder);
    
    // Aquí se enviaría la actualización al backend
    console.log('Actualizando estado de orden:', newStatus);
  };

  // Obtener color del estado
  const getStatusColor = (status: DeliveryOrder['status']) => {
    switch (status) {
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'picked_up': return 'bg-yellow-100 text-yellow-800';
      case 'in_transit': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Obtener icono del estado
  const getStatusIcon = (status: DeliveryOrder['status']) => {
    switch (status) {
      case 'assigned': return <Package className="w-4 h-4" />;
      case 'picked_up': return <Truck className="w-4 h-4" />;
      case 'in_transit': return <Navigation className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  // Obtener color de prioridad
  const getPriorityColor = (priority: DeliveryOrder['priority']) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Estado de Delivery</h1>
          <p className="text-gray-600 mt-2">Gestiona tus entregas en tiempo real</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm font-medium text-gray-700">
              {isOnline ? 'En línea' : 'Desconectado'}
            </span>
          </div>
          
          <button
            onClick={handleToggleStatus}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isOnline 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {isOnline ? 'Desconectar' : 'Conectar'}
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Entregas Hoy</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedToday}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Entregas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDeliveries}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Timer className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tiempo Promedio</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageTime} min</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Calificación</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rating}/5</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Orden Actual */}
      {currentOrder && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Orden #{currentOrder.orderNumber}
                </h2>
                <p className="text-gray-600 mt-1">
                  {currentOrder.store.name} → {currentOrder.customer.name}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(currentOrder.status)}`}>
                  {getStatusIcon(currentOrder.status)}
                  <span className="ml-1 capitalize">{currentOrder.status.replace('_', ' ')}</span>
                </span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(currentOrder.priority)}`}>
                  {currentOrder.priority.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Progreso de la entrega */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Progreso de la Entrega</h3>
              <div className="flex items-center justify-between">
                {[
                  { key: 'assigned', label: 'Asignada', icon: Package },
                  { key: 'picked_up', label: 'Recogida', icon: Truck },
                  { key: 'in_transit', label: 'En Tránsito', icon: Navigation },
                  { key: 'delivered', label: 'Entregada', icon: CheckCircle }
                ].map((step, index) => {
                  const StepIcon = step.icon;
                  const isActive = currentOrder.status === step.key;
                  const isCompleted = ['assigned', 'picked_up', 'in_transit', 'delivered'].indexOf(currentOrder.status) > index;
                  
                  return (
                    <div key={step.key} className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isCompleted ? 'bg-green-500 text-white' :
                        isActive ? 'bg-[#FFC300] text-white' :
                        'bg-gray-200 text-gray-500'
                      }`}>
                        <StepIcon className="w-5 h-5" />
                      </div>
                      <span className={`text-xs mt-2 font-medium ${
                        isActive ? 'text-[#FFC300]' : 'text-gray-500'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Información del cliente */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Información del Cliente</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{currentOrder.customer.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{currentOrder.customer.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{currentOrder.customer.email}</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                    <span className="text-gray-900">{currentOrder.customer.address}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Información de la Tienda</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{currentOrder.store.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{currentOrder.store.phone}</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                    <span className="text-gray-900">{currentOrder.store.address}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Items de la orden */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Items de la Orden</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                {currentOrder.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                    <div>
                      <span className="font-medium text-gray-900">{item.name}</span>
                      <span className="text-gray-500 ml-2">x{item.quantity}</span>
                    </div>
                    <span className="font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-2 font-bold text-lg">
                  <span>Total:</span>
                  <span>${currentOrder.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Notas y tiempo estimado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Tiempo Estimado</h3>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-[#FFC300]" />
                  <span className="text-lg font-medium">{currentOrder.estimatedTime} minutos</span>
                </div>
              </div>
              
              {currentOrder.notes && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Notas</h3>
                  <p className="text-gray-600">{currentOrder.notes}</p>
                </div>
              )}
            </div>

            {/* Acciones */}
            <div className="flex flex-wrap gap-3">
              {currentOrder.status === 'assigned' && (
                <button
                  onClick={() => handleUpdateOrderStatus('picked_up')}
                  className="flex items-center space-x-2 px-4 py-2 bg-[#FFC300] text-white rounded-lg hover:bg-[#E6B000] transition-colors"
                >
                  <Truck className="w-4 h-4" />
                  <span>Marcar como Recogida</span>
                </button>
              )}
              
              {currentOrder.status === 'picked_up' && (
                <button
                  onClick={() => handleUpdateOrderStatus('in_transit')}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Iniciar Entrega</span>
                </button>
              )}
              
              {currentOrder.status === 'in_transit' && (
                <button
                  onClick={() => handleUpdateOrderStatus('delivered')}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Marcar como Entregada</span>
                </button>
              )}
              
              <button
                onClick={() => setShowMap(!showMap)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <MapPin className="w-4 h-4" />
                <span>{showMap ? 'Ocultar Mapa' : 'Ver Mapa'}</span>
              </button>
              
              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
                <MessageSquare className="w-4 h-4" />
                <span>Contactar Cliente</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de órdenes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Todas las Órdenes</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {orders.map((order) => (
            <div key={order._id} className="p-6 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-medium text-gray-900">#{order.orderNumber}</h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="ml-1 capitalize">{order.status.replace('_', ' ')}</span>
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(order.priority)}`}>
                      {order.priority.toUpperCase()}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-2">
                    {order.store.name} → {order.customer.name}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{order.estimatedTime} min</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{order.customer.address.split(',')[0]}</span>
                    </span>
                    <span className="font-medium text-gray-900">
                      ${order.total.toFixed(2)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentOrder(order)}
                    className="px-3 py-1 text-sm bg-[#FFC300] text-white rounded hover:bg-[#E6B000] transition-colors"
                  >
                    Ver Detalles
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DeliveryStatus;
