import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  MapPin, 
  Clock, 
  Package, 
  Star, 
  Navigation,
  CheckCircle,
  AlertCircle,
  Truck,
  DollarSign,
  Calendar
} from 'lucide-react';

const DeliveryDashboard: React.FC = () => {
  const { user } = useAuth();
  const [deliveryStatus, setDeliveryStatus] = useState('available');

  // Datos de ejemplo
  const currentOrder = {
    id: 'ORD-001',
    customer: 'Juan Pérez',
    address: 'Av. Principal 123, Ciudad',
    items: ['Filtro de Aceite', 'Pastillas de Freno'],
    total: 115.50,
    estimatedTime: '15 min',
    distance: '2.5 km'
  };

  const stats = {
    completedToday: 8,
    totalEarnings: 45.20,
    averageRating: 4.6,
    totalDeliveries: 156,
    activeHours: 6.5
  };

  const recentDeliveries = [
    { id: '1', customer: 'María García', status: 'completed', rating: 5, earnings: 8.50 },
    { id: '2', customer: 'Carlos López', status: 'completed', rating: 4, earnings: 12.00 },
    { id: '3', customer: 'Ana Martínez', status: 'completed', rating: 5, earnings: 9.75 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-yellow-100 text-yellow-800';
      case 'offline': return 'bg-red-100 text-red-800';
      case 'on_route': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Disponible';
      case 'busy': return 'Ocupado';
      case 'offline': return 'No Disponible';
      case 'on_route': return 'En Ruta';
      default: return 'Desconocido';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard de Delivery
        </h1>
        <p className="text-gray-600 mt-2">
          Bienvenido, {user?.name || 'Repartidor'}
        </p>
      </div>

      {/* Estado actual */}
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Estado Actual</h3>
            <p className="text-sm text-gray-600">Controla tu disponibilidad</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(deliveryStatus)}`}>
              {getStatusText(deliveryStatus)}
            </span>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Cambiar Estado
            </button>
          </div>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Entregas Hoy</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedToday}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ganancias Hoy</p>
              <p className="text-2xl font-bold text-gray-900">${stats.totalEarnings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Calificación</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageRating}/5</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Horas Activas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeHours}h</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pedido actual */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pedido Actual</h3>
          {currentOrder ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">ID del Pedido:</span>
                <span className="text-sm text-gray-900">{currentOrder.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Cliente:</span>
                <span className="text-sm text-gray-900">{currentOrder.customer}</span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-sm font-medium text-gray-600">Dirección:</span>
                <span className="text-sm text-gray-900 text-right max-w-xs">{currentOrder.address}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Total:</span>
                <span className="text-sm font-bold text-gray-900">${currentOrder.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Tiempo Estimado:</span>
                <span className="text-sm text-gray-900">{currentOrder.estimatedTime}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Distancia:</span>
                <span className="text-sm text-gray-900">{currentOrder.distance}</span>
              </div>
              
              <div className="pt-4 space-y-2">
                <button className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <Navigation className="h-4 w-4 mr-2" />
                  Ver Ruta
                </button>
                <button className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Marcar como Entregado
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No hay pedidos asignados actualmente</p>
            </div>
          )}
        </div>

        {/* Entregas recientes */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Entregas Recientes</h3>
          <div className="space-y-4">
            {recentDeliveries.map((delivery) => (
              <div key={delivery.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{delivery.customer}</p>
                  <p className="text-xs text-gray-600">ID: {delivery.id}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <Star className="h-3 w-3 text-yellow-400" />
                    <span className="text-sm text-gray-900">{delivery.rating}</span>
                  </div>
                  <p className="text-sm font-medium text-green-600">${delivery.earnings}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <MapPin className="h-6 w-6 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-gray-700">Ver Mapa</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Calendar className="h-6 w-6 text-green-600 mb-2" />
            <span className="text-sm font-medium text-gray-700">Horario</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Truck className="h-6 w-6 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-gray-700">Reportes</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Star className="h-6 w-6 text-yellow-600 mb-2" />
            <span className="text-sm font-medium text-gray-700">Calificaciones</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDashboard;
