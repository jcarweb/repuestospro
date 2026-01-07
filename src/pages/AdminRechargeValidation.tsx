import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye, Clock, AlertCircle, DollarSign } from 'lucide-react';

interface RechargeRequest {
  _id: string;
  amount: number;
  currency: string;
  convertedAmount: number;
  targetCurrency: string;
  paymentMethod: string;
  status: string;
  paymentReference?: string;
  paymentProof?: string;
  rejectionReason?: string;
  createdAt: string;
  userId: {
    name: string;
    email: string;
  };
  storeId: {
    name: string;
  };
}

const AdminRechargeValidation: React.FC = () => {
  const [rechargeRequests, setRechargeRequests] = useState<RechargeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<RechargeRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadPendingRecharges();
  }, []);

  const loadPendingRecharges = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/recharge/admin/pending', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setRechargeRequests(data.data.rechargeRequests);
      }
    } catch (error) {
      console.error('Error cargando recargas pendientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      setProcessing(true);
      
      const response = await fetch(`/api/recharge/${requestId}/validate`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          action,
          adminNotes: action === 'reject' ? adminNotes : undefined
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Recargar lista
        await loadPendingRecharges();
        setSelectedRequest(null);
        setAdminNotes('');
      } else {
        alert(data.message || 'Error procesando solicitud');
      }
    } catch (error) {
      console.error('Error validando solicitud:', error);
      alert('Error de conexión');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Validación de Recargas</h1>
        <p className="text-gray-600">Gestiona las solicitudes de recarga de wallet</p>
      </div>

      {/* Lista de solicitudes */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Solicitudes Pendientes</h2>
        </div>
        
        {rechargeRequests.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No hay solicitudes pendientes</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {rechargeRequests.map((request) => (
              <div key={request._id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(request.status)}
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {request.userId.name} - {request.storeId.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {request.amount} {request.currency} → {request.convertedAmount} {request.targetCurrency}
                      </p>
                      <p className="text-sm text-gray-500">
                        {getPaymentMethodName(request.paymentMethod)} • {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                    
                    <button
                      onClick={() => setSelectedRequest(request)}
                      className="p-2 text-gray-400 hover:text-gray-600"
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
      </div>

      {/* Modal de detalles */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Detalles de la Solicitud</h3>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Información del usuario */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Información del Usuario</h4>
                <div className="text-sm space-y-1">
                  <p><strong>Nombre:</strong> {selectedRequest.userId.name}</p>
                  <p><strong>Email:</strong> {selectedRequest.userId.email}</p>
                  <p><strong>Tienda:</strong> {selectedRequest.storeId.name}</p>
                </div>
              </div>

              {/* Detalles de la transacción */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Detalles de la Transacción</h4>
                <div className="text-sm space-y-1">
                  <p><strong>Monto original:</strong> {selectedRequest.amount} {selectedRequest.currency}</p>
                  <p><strong>Monto convertido:</strong> {selectedRequest.convertedAmount} {selectedRequest.targetCurrency}</p>
                  <p><strong>Método de pago:</strong> {getPaymentMethodName(selectedRequest.paymentMethod)}</p>
                  <p><strong>Referencia:</strong> {selectedRequest.paymentReference || 'No especificada'}</p>
                  <p><strong>Fecha:</strong> {new Date(selectedRequest.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {/* Comprobante de pago */}
              {selectedRequest.paymentProof && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Comprobante de Pago</h4>
                  <div className="text-sm">
                    <p><strong>Archivo:</strong> {selectedRequest.paymentProof}</p>
                    <a 
                      href={`/uploads/payment-proofs/${selectedRequest.paymentProof}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      Ver comprobante
                    </a>
                  </div>
                </div>
              )}

              {/* Notas del administrador */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas del Administrador
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Agregar notas sobre la validación..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              {/* Acciones */}
              <div className="flex space-x-3">
                <button
                  onClick={() => handleValidate(selectedRequest._id, 'reject')}
                  disabled={processing}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {processing ? 'Procesando...' : 'Rechazar'}
                </button>
                <button
                  onClick={() => handleValidate(selectedRequest._id, 'approve')}
                  disabled={processing}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {processing ? 'Procesando...' : 'Aprobar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRechargeValidation;
