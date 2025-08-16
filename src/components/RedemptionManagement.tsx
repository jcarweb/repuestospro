import React, { useState, useEffect } from 'react';
import { Search, Filter, CheckCircle, XCircle, Truck, Eye, Clock } from 'lucide-react';

interface Redemption {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  rewardId: {
    _id: string;
    name: string;
    description: string;
    image?: string;
  };
  pointsSpent: number;
  cashSpent: number;
  status: 'pending' | 'approved' | 'rejected' | 'shipped' | 'delivered';
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface RedemptionManagementProps {
  redemptions: Redemption[];
  onStatusChange: (redemptionId: string, status: string, notes?: string) => void;
  onUpdateTracking: (redemptionId: string, trackingNumber: string) => void;
  isLoading?: boolean;
}

const RedemptionManagement: React.FC<RedemptionManagementProps> = ({
  redemptions,
  onStatusChange,
  onUpdateTracking,
  isLoading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRedemption, setSelectedRedemption] = useState<Redemption | null>(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [notes, setNotes] = useState('');

  const statusOptions = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'pending', label: 'Pendiente' },
    { value: 'approved', label: 'Aprobado' },
    { value: 'rejected', label: 'Rechazado' },
    { value: 'shipped', label: 'Enviado' },
    { value: 'delivered', label: 'Entregado' }
  ];

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-blue-100 text-blue-800',
    rejected: 'bg-red-100 text-red-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800'
  };

  const statusIcons = {
    pending: Clock,
    approved: CheckCircle,
    rejected: XCircle,
    shipped: Truck,
    delivered: CheckCircle
  };

  const filteredRedemptions = redemptions.filter(redemption => {
    const matchesSearch = 
      redemption.userId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      redemption.userId.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      redemption.rewardId.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || redemption.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (redemptionId: string, newStatus: string) => {
    onStatusChange(redemptionId, newStatus, notes);
    setNotes('');
    setSelectedRedemption(null);
  };

  const handleUpdateTracking = (redemptionId: string) => {
    if (trackingNumber.trim()) {
      onUpdateTracking(redemptionId, trackingNumber);
      setTrackingNumber('');
      setSelectedRedemption(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAddress = (address?: any) => {
    if (!address) return 'No especificada';
    return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`;
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header con filtros */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por cliente o premio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Filtro por estado */}
          <div className="sm:w-48">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de canjes */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Premio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Costo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
                    Cargando canjes...
                  </div>
                </td>
              </tr>
            ) : filteredRedemptions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No se encontraron canjes
                </td>
              </tr>
            ) : (
              filteredRedemptions.map((redemption) => {
                const StatusIcon = statusIcons[redemption.status];
                return (
                  <tr key={redemption._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {redemption.userId.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {redemption.userId.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {redemption.rewardId.image && (
                          <img
                            src={redemption.rewardId.image}
                            alt={redemption.rewardId.name}
                            className="w-10 h-10 rounded-lg object-cover mr-3"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {redemption.rewardId.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {redemption.rewardId.description.substring(0, 50)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {redemption.pointsSpent} pts
                      </div>
                      {redemption.cashSpent > 0 && (
                        <div className="text-sm text-gray-500">
                          + ${redemption.cashSpent}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[redemption.status]}`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusOptions.find(opt => opt.value === redemption.status)?.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(redemption.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedRedemption(redemption)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de detalles */}
      {selectedRedemption && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Detalles del Canje</h3>
              <button
                onClick={() => setSelectedRedemption(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Información del cliente */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Cliente</h4>
                <p className="text-sm text-gray-600">{selectedRedemption.userId.name}</p>
                <p className="text-sm text-gray-600">{selectedRedemption.userId.email}</p>
              </div>

              {/* Información del premio */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Premio</h4>
                <div className="flex items-center">
                  {selectedRedemption.rewardId.image && (
                    <img
                      src={selectedRedemption.rewardId.image}
                      alt={selectedRedemption.rewardId.name}
                      className="w-16 h-16 rounded-lg object-cover mr-3"
                    />
                  )}
                  <div>
                    <p className="text-sm font-medium">{selectedRedemption.rewardId.name}</p>
                    <p className="text-sm text-gray-600">{selectedRedemption.rewardId.description}</p>
                  </div>
                </div>
              </div>

              {/* Costo */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Costo</h4>
                <p className="text-sm text-gray-600">
                  {selectedRedemption.pointsSpent} puntos
                  {selectedRedemption.cashSpent > 0 && ` + $${selectedRedemption.cashSpent}`}
                </p>
              </div>

              {/* Dirección de envío */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Dirección de Envío</h4>
                <p className="text-sm text-gray-600">{formatAddress(selectedRedemption.shippingAddress)}</p>
              </div>

              {/* Estado actual */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Estado Actual</h4>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[selectedRedemption.status]}`}>
                  {statusOptions.find(opt => opt.value === selectedRedemption.status)?.label}
                </span>
              </div>

              {/* Tracking number */}
              {selectedRedemption.trackingNumber && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Número de Seguimiento</h4>
                  <p className="text-sm text-gray-600">{selectedRedemption.trackingNumber}</p>
                </div>
              )}

              {/* Notas */}
              {selectedRedemption.notes && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Notas</h4>
                  <p className="text-sm text-gray-600">{selectedRedemption.notes}</p>
                </div>
              )}

              {/* Acciones */}
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-3">Acciones</h4>
                
                {/* Cambiar estado */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Cambiar Estado</label>
                  <div className="flex flex-wrap gap-2">
                    {['pending', 'approved', 'rejected', 'shipped', 'delivered'].map(status => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(selectedRedemption._id, status)}
                        disabled={selectedRedemption.status === status}
                        className={`px-3 py-1 text-xs rounded-md ${
                          selectedRedemption.status === status
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
                      >
                        {statusOptions.find(opt => opt.value === status)?.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Agregar tracking */}
                {selectedRedemption.status === 'approved' && (
                  <div className="space-y-2 mt-4">
                    <label className="block text-sm font-medium text-gray-700">Número de Seguimiento</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        placeholder="Ingrese número de tracking"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => handleUpdateTracking(selectedRedemption._id)}
                        disabled={!trackingNumber.trim()}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                      >
                        Agregar
                      </button>
                    </div>
                  </div>
                )}

                {/* Notas */}
                <div className="space-y-2 mt-4">
                  <label className="block text-sm font-medium text-gray-700">Notas (opcional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Agregar notas sobre el canje..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RedemptionManagement;
