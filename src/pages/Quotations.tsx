import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
// import WhatsAppTestModal from '../components/WhatsAppTestModal';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon,
  DocumentArrowDownIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/outline';

interface Quotation {
  _id: string;
  quotationNumber: string;
  title: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  total: number;
  currency: string;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired';
  validUntil: string;
  createdAt: string;
  items: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
}

interface QuotationStats {
  totalQuotations: number;
  totalValue: number;
  byStatus: Array<{
    _id: string;
    count: number;
    totalValue: number;
  }>;
}

const Quotations: React.FC = () => {
  const { user } = useAuth();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [stats, setStats] = useState<QuotationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showWhatsAppTest, setShowWhatsAppTest] = useState(false);

  useEffect(() => {
    fetchQuotations();
    fetchStats();
  }, []);

  const fetchQuotations = async () => {
    try {
      const response = await fetch('/api/quotations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setQuotations(data.data.quotations);
      }
    } catch (error) {
      console.error('Error fetching quotations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/quotations/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleDeleteQuotation = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta cotización?')) {
      return;
    }

    try {
      const response = await fetch(`/api/quotations/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setQuotations(quotations.filter(q => q._id !== id));
      }
    } catch (error) {
      console.error('Error deleting quotation:', error);
    }
  };

  const handleSendQuotation = async (id: string, method: 'email' | 'whatsapp' | 'both') => {
    try {
      const response = await fetch(`/api/quotations/${id}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ method })
      });
      const data = await response.json();
      if (data.success) {
        fetchQuotations();
        alert('Cotización enviada exitosamente');
      }
    } catch (error) {
      console.error('Error sending quotation:', error);
    }
  };

  const handleDownloadPDF = async (id: string) => {
    try {
      const response = await fetch(`/api/quotations/${id}/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cotizacion-${id}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
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

  const filteredQuotations = quotations.filter(quotation => {
    const matchesSearch = quotation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quotation.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quotation.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || quotation.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cotizaciones</h1>
          <p className="text-gray-600">Gestiona tus cotizaciones y presupuestos</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Nueva Cotización
        </button>
        {/* <button
          onClick={() => setShowWhatsAppTest(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <ChatBubbleLeftRightIcon className="h-5 w-5" />
          Probar WhatsApp
        </button> */}
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DocumentArrowDownIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Cotizaciones</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalQuotations}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalValue.toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <EyeIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Vistas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.byStatus.find(s => s._id === 'viewed')?.count || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CalendarIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Aceptadas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.byStatus.find(s => s._id === 'accepted')?.count || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar cotizaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los estados</option>
              <option value="draft">Borrador</option>
              <option value="sent">Enviado</option>
              <option value="viewed">Visto</option>
              <option value="accepted">Aceptado</option>
              <option value="rejected">Rechazado</option>
              <option value="expired">Expirado</option>
            </select>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2">
              <FunnelIcon className="h-5 w-5" />
              Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Quotations Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cotización
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Válido hasta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredQuotations.map((quotation) => (
                <tr key={quotation._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {quotation.quotationNumber}
                      </div>
                      <div className="text-sm text-gray-500">{quotation.title}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {quotation.customer.name}
                      </div>
                      <div className="text-sm text-gray-500">{quotation.customer.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {quotation.currency} {quotation.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(quotation.status)}`}>
                      {getStatusText(quotation.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(quotation.validUntil).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedQuotation(quotation);
                          setShowDetailsModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="Ver detalles"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      {quotation.status === 'draft' && (
                        <button
                          onClick={() => {/* TODO: Implement edit */}}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Editar"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDownloadPDF(quotation._id)}
                        className="text-green-600 hover:text-green-900"
                        title="Descargar PDF"
                      >
                        <DocumentArrowDownIcon className="h-4 w-4" />
                      </button>
                      {quotation.status === 'draft' && (
                        <button
                          onClick={() => handleSendQuotation(quotation._id, 'email')}
                          className="text-blue-600 hover:text-blue-900"
                          title="Enviar por email"
                        >
                          <EnvelopeIcon className="h-4 w-4" />
                        </button>
                      )}
                      {quotation.status === 'draft' && (
                        <button
                          onClick={() => handleSendQuotation(quotation._id, 'whatsapp')}
                          className="text-green-600 hover:text-green-900"
                          title="Enviar por WhatsApp"
                        >
                          <ChatBubbleLeftRightIcon className="h-4 w-4" />
                        </button>
                      )}
                      {quotation.status === 'draft' && (
                        <button
                          onClick={() => handleDeleteQuotation(quotation._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Quotation Modal */}
      {showCreateModal && (
        <CreateQuotationModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchQuotations();
          }}
        />
      )}

      {/* Quotation Details Modal */}
      {showDetailsModal && selectedQuotation && (
        <QuotationDetailsModal
          quotation={selectedQuotation}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedQuotation(null);
          }}
        />
      )}

      {/* {showWhatsAppTest && (
        <WhatsAppTestModal
          isOpen={showWhatsAppTest}
          onClose={() => setShowWhatsAppTest(false)}
        />
      )} */}
    </div>
  );
};

export default Quotations;
