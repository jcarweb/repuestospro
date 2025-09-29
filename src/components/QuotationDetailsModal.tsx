import React from 'react';
import { XMarkIcon, DocumentArrowDownIcon, EnvelopeIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/outline';

interface Quotation {
  _id: string;
  quotationNumber: string;
  title: string;
  description?: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    address?: string;
  };
  total: number;
  currency: string;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired';
  validUntil: string;
  createdAt: string;
  items: Array<{
    productName: string;
    productSku: string;
    productOriginalCode?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    specifications?: Record<string, any>;
    notes?: string;
  }>;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountRate: number;
  discountAmount: number;
  notes?: string;
  terms?: string;
  conditions?: string;
}

interface QuotationDetailsModalProps {
  quotation: Quotation;
  onClose: () => void;
}

const QuotationDetailsModal: React.FC<QuotationDetailsModalProps> = ({ quotation, onClose }) => {
  const handleDownloadPDF = async () => {
    try {
      const response = await fetch(`/api/quotations/${quotation._id}/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cotizacion-${quotation.quotationNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  const handleSendEmail = async () => {
    try {
      const response = await fetch(`/api/quotations/${quotation._id}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ method: 'email' })
      });
      const data = await response.json();
      if (data.success) {
        alert('Cotización enviada por email exitosamente');
      }
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  const handleSendWhatsApp = async () => {
    try {
      const response = await fetch(`/api/quotations/${quotation._id}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ method: 'whatsapp' })
      });
      const data = await response.json();
      if (data.success) {
        alert('Cotización enviada por WhatsApp exitosamente');
      }
    } catch (error) {
      console.error('Error sending WhatsApp:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      viewed: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-600'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts = {
      draft: 'Borrador',
      sent: 'Enviado',
      viewed: 'Visto',
      accepted: 'Aceptado',
      rejected: 'Rechazado',
      expired: 'Expirado'
    };
    return texts[status as keyof typeof texts] || status;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {quotation.quotationNumber}
            </h2>
            <p className="text-gray-600">{quotation.title}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(quotation.status)}`}>
              {getStatusText(quotation.status)}
            </span>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Información del Cliente</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Nombre</div>
                  <div className="font-medium text-gray-900">{quotation.customer.name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Email</div>
                  <div className="font-medium text-gray-900">{quotation.customer.email}</div>
                </div>
                {quotation.customer.phone && (
                  <div>
                    <div className="text-sm text-gray-600">Teléfono</div>
                    <div className="font-medium text-gray-900">{quotation.customer.phone}</div>
                  </div>
                )}
                {quotation.customer.company && (
                  <div>
                    <div className="text-sm text-gray-600">Empresa</div>
                    <div className="font-medium text-gray-900">{quotation.customer.company}</div>
                  </div>
                )}
              </div>
              {quotation.customer.address && (
                <div className="mt-4">
                  <div className="text-sm text-gray-600">Dirección</div>
                  <div className="font-medium text-gray-900">{quotation.customer.address}</div>
                </div>
              )}
            </div>
          </div>

          {/* Quotation Details */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Detalles de la Cotización</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Fecha de creación</div>
                  <div className="font-medium text-gray-900">
                    {new Date(quotation.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Válido hasta</div>
                  <div className="font-medium text-gray-900">
                    {new Date(quotation.validUntil).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Total</div>
                  <div className="font-medium text-gray-900 text-lg">
                    {quotation.currency} {quotation.total.toFixed(2)}
                  </div>
                </div>
              </div>
              {quotation.description && (
                <div className="mt-4">
                  <div className="text-sm text-gray-600">Descripción</div>
                  <div className="font-medium text-gray-900">{quotation.description}</div>
                </div>
              )}
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Productos</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SKU
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cantidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio Unit.
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {quotation.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                          {item.productOriginalCode && (
                            <div className="text-sm text-gray-500">
                              Código: {item.productOriginalCode}
                            </div>
                          )}
                          {item.notes && (
                            <div className="text-sm text-gray-500 mt-1">
                              Notas: {item.notes}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.productSku}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {quotation.currency} {item.unitPrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {quotation.currency} {item.totalPrice.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Totales</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{quotation.currency} {quotation.subtotal.toFixed(2)}</span>
                </div>
                {quotation.taxRate > 0 && (
                  <div className="flex justify-between">
                    <span>Impuestos ({quotation.taxRate}%):</span>
                    <span>{quotation.currency} {quotation.taxAmount.toFixed(2)}</span>
                  </div>
                )}
                {quotation.discountRate > 0 && (
                  <div className="flex justify-between">
                    <span>Descuento ({quotation.discountRate}%):</span>
                    <span>-{quotation.currency} {quotation.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t pt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>{quotation.currency} {quotation.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          {(quotation.terms || quotation.conditions || quotation.notes) && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Términos y Condiciones</h3>
              <div className="space-y-4">
                {quotation.terms && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Términos</div>
                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                      {quotation.terms}
                    </div>
                  </div>
                )}
                {quotation.conditions && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Condiciones</div>
                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                      {quotation.conditions}
                    </div>
                  </div>
                )}
                {quotation.notes && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Notas adicionales</div>
                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                      {quotation.notes}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <DocumentArrowDownIcon className="h-4 w-4" />
              Descargar PDF
            </button>
            {quotation.status === 'draft' && (
              <>
                <button
                  onClick={handleSendEmail}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <EnvelopeIcon className="h-4 w-4" />
                  Enviar por Email
                </button>
                <button
                  onClick={handleSendWhatsApp}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <ChatBubbleLeftRightIcon className="h-4 w-4" />
                  Enviar por WhatsApp
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationDetailsModal;
