import React, { useState, useEffect } from 'react';
import { 
  UserGroupIcon, 
  MapPinIcon, 
  CurrencyDollarIcon,
  ClockIcon,
  StarIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface Delivery {
  _id: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  workInfo: {
    zones: string[];
    availabilityStatus: 'available' | 'busy' | 'offline' | 'break';
    currentLocation?: {
      lat: number;
      lng: number;
    };
  };
  performance: {
    rating: number;
    totalDeliveries: number;
    completedDeliveries: number;
    averageDeliveryTime: number;
    totalEarnings: number;
  };
  status: 'pending' | 'approved' | 'suspended' | 'rejected' | 'inactive';
  isActive: boolean;
  createdAt: string;
}

const AdminDeliverys: React.FC = () => {
  const [deliverys, setDeliverys] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [zoneFilter, setZoneFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchDeliverys();
  }, [searchTerm, statusFilter, zoneFilter, sortBy, sortOrder, currentPage]);

  const fetchDeliverys = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(zoneFilter !== 'all' && { zone: zoneFilter }),
        sortBy,
        sortOrder
      });

      const response = await fetch(`/api/admin/delivery/deliverys?${params}`);
      const data = await response.json();

      if (data.success) {
        setDeliverys(data.data.deliverys);
        setTotalPages(data.data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching deliverys:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (deliveryId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/delivery/deliverys/${deliveryId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchDeliverys();
      }
    } catch (error) {
      console.error('Error updating delivery status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'rejected': return 'bg-gray-100 text-gray-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-blue-100 text-blue-800';
      case 'offline': return 'bg-gray-100 text-gray-800';
      case 'break': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-VE');
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Deliverys</h1>
        <p className="text-gray-600">Administra los deliverys registrados en el sistema</p>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nombre, email o teléfono"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos</option>
              <option value="pending">Pendiente</option>
              <option value="approved">Aprobado</option>
              <option value="suspended">Suspendido</option>
              <option value="rejected">Rechazado</option>
              <option value="inactive">Inactivo</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Zona
            </label>
            <select
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas</option>
              <option value="centro">Centro</option>
              <option value="norte">Norte</option>
              <option value="sur">Sur</option>
              <option value="este">Este</option>
              <option value="oeste">Oeste</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ordenar por
            </label>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="createdAt-desc">Más recientes</option>
              <option value="createdAt-asc">Más antiguos</option>
              <option value="performance.rating-desc">Mejor rating</option>
              <option value="performance.totalDeliveries-desc">Más entregas</option>
              <option value="performance.totalEarnings-desc">Mayores ganancias</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de deliverys */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Delivery
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Disponibilidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entregas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ganancias
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : deliverys.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    No se encontraron deliverys
                  </td>
                </tr>
              ) : (
                deliverys.map((delivery) => (
                  <tr key={delivery._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <UserGroupIcon className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {delivery.personalInfo.firstName} {delivery.personalInfo.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {delivery.personalInfo.email}
                          </div>
                          <div className="text-sm text-gray-500">
                            {delivery.personalInfo.phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(delivery.status)}`}>
                        {delivery.status === 'approved' ? 'Aprobado' :
                         delivery.status === 'pending' ? 'Pendiente' :
                         delivery.status === 'suspended' ? 'Suspendido' :
                         delivery.status === 'rejected' ? 'Rechazado' :
                         delivery.status === 'inactive' ? 'Inactivo' : delivery.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAvailabilityColor(delivery.workInfo.availabilityStatus)}`}>
                        {delivery.workInfo.availabilityStatus === 'available' ? 'Disponible' :
                         delivery.workInfo.availabilityStatus === 'busy' ? 'Ocupado' :
                         delivery.workInfo.availabilityStatus === 'offline' ? 'Desconectado' :
                         delivery.workInfo.availabilityStatus === 'break' ? 'Descanso' : delivery.workInfo.availabilityStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="text-sm text-gray-900">
                          {delivery.performance.rating.toFixed(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {delivery.performance.totalDeliveries}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(delivery.performance.totalEarnings)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(delivery.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedDelivery(delivery);
                            setShowModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        {delivery.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(delivery._id, 'approved')}
                              className="text-green-600 hover:text-green-900"
                            >
                              <CheckCircleIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(delivery._id, 'rejected')}
                              className="text-red-600 hover:text-red-900"
                            >
                              <XCircleIcon className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {delivery.status === 'approved' && (
                          <button
                            onClick={() => handleStatusChange(delivery._id, 'suspended')}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            <ExclamationTriangleIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Página <span className="font-medium">{currentPage}</span> de{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === currentPage
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de detalles */}
      {showModal && selectedDelivery && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Detalles del Delivery
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">Información Personal</h4>
                  <p className="text-sm text-gray-600">
                    {selectedDelivery.personalInfo.firstName} {selectedDelivery.personalInfo.lastName}
                  </p>
                  <p className="text-sm text-gray-600">{selectedDelivery.personalInfo.email}</p>
                  <p className="text-sm text-gray-600">{selectedDelivery.personalInfo.phone}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900">Zonas de Trabajo</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedDelivery.workInfo.zones.map((zone) => (
                      <span key={zone} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {zone}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900">Rendimiento</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Rating:</span>
                      <span className="ml-2 font-medium">{selectedDelivery.performance.rating.toFixed(1)}/5</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Entregas:</span>
                      <span className="ml-2 font-medium">{selectedDelivery.performance.totalDeliveries}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Completadas:</span>
                      <span className="ml-2 font-medium">{selectedDelivery.performance.completedDeliveries}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Tiempo promedio:</span>
                      <span className="ml-2 font-medium">{selectedDelivery.performance.averageDeliveryTime} min</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Ganancias totales:</span>
                      <span className="ml-2 font-medium">{formatCurrency(selectedDelivery.performance.totalEarnings)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDeliverys;
