import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, Eye, DollarSign, Euro, Building } from 'lucide-react';

interface RechargeRequest {
  _id: string;
  amount: number;
  currency: string;
  convertedAmount: number;
  targetCurrency: string;
  paymentMethod: string;
  status: string;
  paymentReference?: string;
  rejectionReason?: string;
  createdAt: string;
  storeId: {
    name: string;
  };
}

const RechargeHistory: React.FC<{ storeId: string }> = ({ storeId }) => {
  const [rechargeRequests, setRechargeRequests] = useState<RechargeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<RechargeRequest | null>(null);

  useEffect(() => {
    loadRechargeRequests();
  }, [storeId]);

  const loadRechargeRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/recharge/user', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setRechargeRequests(data.data.rechargeRequests);
      }
    } catch (error) {
      console.error('Error cargando solicitudes de recarga:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'approved': return 'Aprobada';
      case 'rejected': return 'Rechazada';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const getPaymentMethodName = (method: string) => {
    const methods: { [key: string]: string } = {
      paypal: 'PayPal',
      stripe: 'Stripe',
      zelle: 'Zelle',
      bank_transfer: 'Transferencia Bancaria',
      pago_movil: 'Pago Móvil'
    };
    return methods[method] || method;
  };

  const getCurrencyIcon = (currency: string) => {
    switch (currency) {
      case 'USD': return <DollarSign className="h-4 w-4" />;
      case 'EUR': return <Euro className="h-4 w-4" />;
      case 'VES': return <Building className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Historial de Recargas</h3>
        <p className="text-sm text-gray-600">Todas tus solicitudes de recarga</p>
      </div>

      {rechargeRequests.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No tienes solicitudes de recarga</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rechargeRequests.map((request) => (
            <div key={request._id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(request.status)}
                  <div>
                    <div className="flex items-center space-x-2">
                      {getCurrencyIcon(request.currency)}
                      <span className="font-medium">
                        {request.amount} {request.currency}
                      </span>
                      <span className="text-gray-500">→</span>
                      <span className="font-medium text-green-600">
                        {request.convertedAmount} {request.targetCurrency}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {getPaymentMethodName(request.paymentMethod)} • {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                    {getStatusText(request.status)}
                  </span>
                  
                  <button
                    onClick={() => setSelectedRequest(request)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                    title="Ver detalles"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de detalles */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Detalles de la Solicitud</h3>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Información de la Transacción</h4>
                <div className="text-sm space-y-1">
                  <p><strong>ID:</strong> {selectedRequest._id}</p>
                  <p><strong>Monto original:</strong> {selectedRequest.amount} {selectedRequest.currency}</p>
                  <p><strong>Monto convertido:</strong> {selectedRequest.convertedAmount} {selectedRequest.targetCurrency}</p>
                  <p><strong>Método:</strong> {getPaymentMethodName(selectedRequest.paymentMethod)}</p>
                  <p><strong>Estado:</strong> {getStatusText(selectedRequest.status)}</p>
                  <p><strong>Fecha:</strong> {new Date(selectedRequest.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {selectedRequest.paymentReference && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Referencia de Pago</h4>
                  <p className="text-sm">{selectedRequest.paymentReference}</p>
                </div>
              )}

              {selectedRequest.rejectionReason && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Razón del Rechazo</h4>
                  <p className="text-sm text-red-700">{selectedRequest.rejectionReason}</p>
                </div>
              )}

              <button
                onClick={() => setSelectedRequest(null)}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RechargeHistory;
