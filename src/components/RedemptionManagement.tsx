import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
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
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRedemption, setSelectedRedemption] = useState<Redemption | null>(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [notes, setNotes] = useState('');

  const statusOptions = [
    { value: 'all', label: t('redemptionManagement.filterAll') },
    { value: 'pending', label: t('redemptionManagement.filterPending') },
    { value: 'approved', label: t('redemptionManagement.filterApproved') },
    { value: 'rejected', label: t('redemptionManagement.filterRejected') },
    { value: 'shipped', label: t('redemptionManagement.filterShipped') },
    { value: 'delivered', label: t('redemptionManagement.filterDelivered') },
    { value: 'delivered_only', label: t('redemptionManagement.filterDeliveredOnly') }
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
    
    let matchesStatus = false;
    if (statusFilter === 'all') {
      matchesStatus = true;
    } else if (statusFilter === 'delivered_only') {
      matchesStatus = redemption.status === 'delivered';
    } else {
      matchesStatus = redemption.status === statusFilter;
    }
    
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
    if (!address) return t('redemptionManagement.modal.addressNotSpecified');
    return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`;
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header con filtros */}
      <div className="p-6 border-b border-gray-200">
        {/* Estadísticas rápidas */}
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            <span>{t('redemptionManagement.stats.total')}: {redemptions.length}</span>
          </div>
          <div className="flex items-center space-x-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
            <span>{t('redemptionManagement.stats.pending')}: {redemptions.filter(r => r.status === 'pending').length}</span>
          </div>
          <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
            <CheckCircle className="w-4 h-4" />
            <span>{t('redemptionManagement.stats.delivered')}: {redemptions.filter(r => r.status === 'delivered').length}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={t('redemptionManagement.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300] appearance-none"
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
                {t('redemptionManagement.table.customer')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('redemptionManagement.table.reward')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('redemptionManagement.table.points')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('redemptionManagement.table.status')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('redemptionManagement.table.date')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('redemptionManagement.table.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
                    {t('redemptionManagement.loading')}
                  </div>
                </td>
              </tr>
            ) : filteredRedemptions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  {t('redemptionManagement.noRedemptions')}
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
                      {redemption.status === 'delivered' && (
                        <div className="mt-1">
                          <span className="inline-flex items-center px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {t('redemptionManagement.actions.deliver')}
                          </span>
                        </div>
                      )}
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
              <h3 className="text-lg font-semibold">{t('redemptionManagement.modal.title')}</h3>
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
                <h4 className="font-medium text-gray-900 mb-2">{t('redemptionManagement.modal.customer')}</h4>
                <p className="text-sm text-gray-600">{selectedRedemption.userId.name}</p>
                <p className="text-sm text-gray-600">{selectedRedemption.userId.email}</p>
              </div>

              {/* Información del premio */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">{t('redemptionManagement.modal.reward')}</h4>
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
                <h4 className="font-medium text-gray-900 mb-2">{t('redemptionManagement.modal.pointsSpent')}</h4>
                <p className="text-sm text-gray-600">
                  {selectedRedemption.pointsSpent} {t('redemptionManagement.modal.points')}
                  {selectedRedemption.cashSpent > 0 && ` + $${selectedRedemption.cashSpent}`}
                </p>
              </div>

              {/* Dirección de envío */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">{t('redemptionManagement.modal.shippingAddress')}</h4>
                <p className="text-sm text-gray-600">{formatAddress(selectedRedemption.shippingAddress)}</p>
              </div>

              {/* Estado actual */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">{t('redemptionManagement.modal.status')}</h4>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[selectedRedemption.status]}`}>
                  {statusOptions.find(opt => opt.value === selectedRedemption.status)?.label}
                </span>
              </div>

              {/* Tracking number */}
              {selectedRedemption.trackingNumber && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">{t('redemptionManagement.modal.trackingNumber')}</h4>
                  <p className="text-sm text-gray-600">{selectedRedemption.trackingNumber}</p>
                </div>
              )}

              {/* Notas */}
              {selectedRedemption.notes && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">{t('redemptionManagement.modal.notes')}</h4>
                  <p className="text-sm text-gray-600">{selectedRedemption.notes}</p>
                </div>
              )}

              {/* Acciones */}
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-3">{t('redemptionManagement.modal.actions')}</h4>
                
                {/* Cambiar estado */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">{t('redemptionManagement.modal.changeStatus')}</label>
                  <div className="flex flex-wrap gap-2">
                    {['pending', 'approved', 'rejected', 'shipped', 'delivered'].map(status => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(selectedRedemption._id, status)}
                        disabled={selectedRedemption.status === status}
                        className={`px-3 py-1 text-xs rounded-md ${
                          selectedRedemption.status === status
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : status === 'delivered'
                            ? 'bg-green-100 text-green-700 hover:bg-green-200 font-semibold'
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
                      >
                        {statusOptions.find(opt => opt.value === status)?.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Botón destacado para marcar como entregado */}
                {selectedRedemption.status !== 'delivered' && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-sm font-medium text-green-800">{t('redemptionManagement.modal.markAsDelivered')}</h5>
                        <p className="text-xs text-green-600 mt-1">
                          {t('redemptionManagement.modal.markAsDeliveredDesc')}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          if (window.confirm(t('redemptionManagement.modal.confirmDelivered'))) {
                            handleStatusChange(selectedRedemption._id, 'delivered');
                          }
                        }}
                        className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4 inline mr-1" />
                        {t('redemptionManagement.actions.deliver')}
                      </button>
                    </div>
                  </div>
                )}

                {/* Agregar tracking */}
                {selectedRedemption.status === 'approved' && (
                  <div className="space-y-2 mt-4">
                    <label className="block text-sm font-medium text-gray-700">{t('redemptionManagement.modal.trackingNumber')}</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        placeholder={t('redemptionManagement.modal.trackingNumberPlaceholder')}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => handleUpdateTracking(selectedRedemption._id)}
                        disabled={!trackingNumber.trim()}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                      >
                        {t('redemptionManagement.modal.add')}
                      </button>
                    </div>
                  </div>
                )}

                {/* Notas */}
                <div className="space-y-2 mt-4">
                  <label className="block text-sm font-medium text-gray-700">{t('redemptionManagement.modal.notesOptional')}</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t('redemptionManagement.modal.notesPlaceholder')}
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
