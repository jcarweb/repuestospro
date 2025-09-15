import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  Megaphone, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Edit, 
  Search, 
  Filter,
  Calendar,
  DollarSign,
  Store,
  User,
  MessageSquare,
  AlertCircle,
  Star,
  Zap,
  Crown,
  ArrowRight,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';

interface AdvertisementRequest {
  _id: string;
  title: string;
  description: string;
  content: string;
  store: {
    _id: string;
    name: string;
    address: string;
    city: string;
    state: string;
  };
  advertisingLevel: 'self_managed' | 'premium_managed';
  templateId?: string;
  
  // Configuración específica por nivel
  selfManagedConfig?: {
    template: 'basic_banner' | 'product_highlight' | 'promotion_card' | 'featured_item';
    colors: {
      primary: string;
      secondary: string;
      text: string;
    };
    duration: number;
    zones: string[];
    productId?: string;
  };
  
  premiumManagedConfig?: {
    campaignType: 'social_media' | 'banner_special' | 'featured_campaign' | 'custom_design';
    requirements: string;
    budget: number;
    targetAudience: string;
    specialFeatures: string[];
  };
  
  status: 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed';
  rejectionReason?: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  createdAt: string;
  updatedAt: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedCompletion?: string;
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  };
  notes?: string[];
}

const AdvertisementRequestsTab: React.FC = () => {
  const { t } = useLanguage();
  const { token } = useAuth();
  const [requests, setRequests] = useState<AdvertisementRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<AdvertisementRequest | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'assign' | 'complete'>('approve');
  const [actionData, setActionData] = useState({
    notes: '',
    rejectionReason: '',
    assignedTo: '',
    estimatedCompletion: ''
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/advertisements/requests', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRequests(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching advertisement requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'in_progress':
        return <Zap className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <Star className="h-4 w-4 text-purple-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'self_managed':
        return <Megaphone className="h-4 w-4 text-blue-500" />;
      case 'premium_managed':
        return <Crown className="h-4 w-4 text-purple-500" />;
      default:
        return <Megaphone className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.createdBy.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesLevel = levelFilter === 'all' || request.advertisingLevel === levelFilter;
    const matchesPriority = priorityFilter === 'all' || request.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesLevel && matchesPriority;
  });

  const handleAction = async () => {
    if (!selectedRequest) return;

    try {
      const response = await fetch(`/api/advertisements/requests/${selectedRequest._id}/${actionType}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(actionData)
      });

      if (response.ok) {
        await fetchRequests();
        setShowActionModal(false);
        setSelectedRequest(null);
        setActionData({ notes: '', rejectionReason: '', assignedTo: '', estimatedCompletion: '' });
      }
    } catch (error) {
      console.error('Error performing action:', error);
    }
  };

  const openActionModal = (request: AdvertisementRequest, type: 'approve' | 'reject' | 'assign' | 'complete') => {
    setSelectedRequest(request);
    setActionType(type);
    setShowActionModal(true);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Solicitudes de Publicidad
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Gestiona las solicitudes de publicidad de los gestores de tienda
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {filteredRequests.length} solicitudes
          </span>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-[#333333] p-4 rounded-lg shadow-sm border border-gray-200 dark:border-[#555555] mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar solicitudes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-[#555555] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-[#444444] dark:text-white"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-[#555555] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-[#444444] dark:text-white"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendiente</option>
              <option value="in_progress">En Progreso</option>
              <option value="approved">Aprobada</option>
              <option value="rejected">Rechazada</option>
              <option value="completed">Completada</option>
            </select>

            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-[#555555] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-[#444444] dark:text-white"
            >
              <option value="all">Todos los niveles</option>
              <option value="self_managed">Autogestionado</option>
              <option value="premium_managed">Premium</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-[#555555] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-[#444444] dark:text-white"
            >
              <option value="all">Todas las prioridades</option>
              <option value="urgent">Urgente</option>
              <option value="high">Alta</option>
              <option value="medium">Media</option>
              <option value="low">Baja</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white dark:bg-[#333333] rounded-lg shadow-sm border border-gray-200 dark:border-[#555555] overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Cargando solicitudes...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-8 text-center">
            <Megaphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No hay solicitudes de publicidad
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {searchTerm || statusFilter !== 'all' || levelFilter !== 'all' || priorityFilter !== 'all'
                ? 'No se encontraron solicitudes con los filtros aplicados'
                : 'Los gestores de tienda pueden enviar solicitudes de publicidad aquí'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-[#444444]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Solicitud
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tienda
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Nivel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Prioridad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-[#333333] divide-y divide-gray-200 dark:divide-[#555555]">
                {filteredRequests.map((request) => (
                  <tr key={request._id} className="hover:bg-gray-50 dark:hover:bg-[#444444]">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {request.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-300">
                          {request.description}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-400">
                          Por: {request.createdBy.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Store className="h-4 w-4 mr-2 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {request.store.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-300">
                            {request.store.city}, {request.store.state}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getLevelIcon(request.advertisingLevel)}
                        <span className="ml-2 text-sm text-gray-900 dark:text-white capitalize">
                          {request.advertisingLevel === 'self_managed' ? 'Autogestionado' : 'Premium'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1 capitalize">
                          {request.status === 'in_progress' ? 'En Progreso' : request.status}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(request.priority)}`}>
                        {request.priority === 'urgent' ? 'Urgente' : 
                         request.priority === 'high' ? 'Alta' :
                         request.priority === 'medium' ? 'Media' : 'Baja'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowDetailsModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        {request.status === 'pending' && (
                          <>
                            <button
                              onClick={() => openActionModal(request, 'approve')}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                              title="Aprobar"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openActionModal(request, 'reject')}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                              title="Rechazar"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        
                        {request.status === 'approved' && (
                          <button
                            onClick={() => openActionModal(request, 'assign')}
                            className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
                            title="Asignar"
                          >
                            <User className="h-4 w-4" />
                          </button>
                        )}
                        
                        {request.status === 'in_progress' && (
                          <button
                            onClick={() => openActionModal(request, 'complete')}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                            title="Marcar como completada"
                          >
                            <Star className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Detalles */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#333333] rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-[#555555]">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Detalles de la Solicitud
              </h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Información General */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Información General
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-300">Título</label>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedRequest.title}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-300">Descripción</label>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedRequest.description}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-300">Contenido</label>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedRequest.content}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-300">Nivel de Publicidad</label>
                      <div className="flex items-center mt-1">
                        {getLevelIcon(selectedRequest.advertisingLevel)}
                        <span className="ml-2 text-sm text-gray-900 dark:text-white capitalize">
                          {selectedRequest.advertisingLevel === 'self_managed' ? 'Autogestionado' : 'Premium'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información de la Tienda */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Información de la Tienda
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-300">Nombre de la Tienda</label>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedRequest.store.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-300">Dirección</label>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedRequest.store.address}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-300">Ubicación</label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {selectedRequest.store.city}, {selectedRequest.store.state}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Información del Solicitante */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Información del Solicitante
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-300">Nombre</label>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedRequest.createdBy.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-300">Email</label>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedRequest.createdBy.email}</p>
                    </div>
                    {selectedRequest.createdBy.phone && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-300">Teléfono</label>
                        <p className="text-sm text-gray-900 dark:text-white">{selectedRequest.createdBy.phone}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Configuración Específica */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Configuración Específica
                  </h3>
                  {selectedRequest.advertisingLevel === 'self_managed' && selectedRequest.selfManagedConfig && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-300">Plantilla</label>
                        <p className="text-sm text-gray-900 dark:text-white capitalize">
                          {selectedRequest.selfManagedConfig.template.replace('_', ' ')}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-300">Duración</label>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {selectedRequest.selfManagedConfig.duration} días
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-300">Zonas</label>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {selectedRequest.selfManagedConfig.zones.join(', ')}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {selectedRequest.advertisingLevel === 'premium_managed' && selectedRequest.premiumManagedConfig && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-300">Tipo de Campaña</label>
                        <p className="text-sm text-gray-900 dark:text-white capitalize">
                          {selectedRequest.premiumManagedConfig.campaignType.replace('_', ' ')}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-300">Presupuesto</label>
                        <p className="text-sm text-gray-900 dark:text-white">
                          ${selectedRequest.premiumManagedConfig.budget}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-300">Audiencia Objetivo</label>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {selectedRequest.premiumManagedConfig.targetAudience}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-300">Requerimientos</label>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {selectedRequest.premiumManagedConfig.requirements}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Acción */}
      {showActionModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#333333] rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-[#555555]">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {actionType === 'approve' && 'Aprobar Solicitud'}
                {actionType === 'reject' && 'Rechazar Solicitud'}
                {actionType === 'assign' && 'Asignar Solicitud'}
                {actionType === 'complete' && 'Marcar como Completada'}
              </h2>
              <button
                onClick={() => setShowActionModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {actionType === 'reject' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Motivo del Rechazo
                    </label>
                    <textarea
                      value={actionData.rejectionReason}
                      onChange={(e) => setActionData({...actionData, rejectionReason: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-[#555555] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-[#444444] dark:text-white"
                      rows={3}
                      placeholder="Explica el motivo del rechazo..."
                    />
                  </div>
                )}
                
                {actionType === 'assign' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Asignar a
                      </label>
                      <input
                        type="text"
                        value={actionData.assignedTo}
                        onChange={(e) => setActionData({...actionData, assignedTo: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-[#555555] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-[#444444] dark:text-white"
                        placeholder="Nombre del responsable"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Fecha Estimada de Completado
                      </label>
                      <input
                        type="date"
                        value={actionData.estimatedCompletion}
                        onChange={(e) => setActionData({...actionData, estimatedCompletion: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-[#555555] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-[#444444] dark:text-white"
                      />
                    </div>
                  </>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notas Adicionales
                  </label>
                  <textarea
                    value={actionData.notes}
                    onChange={(e) => setActionData({...actionData, notes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#555555] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-[#444444] dark:text-white"
                    rows={3}
                    placeholder="Notas adicionales..."
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowActionModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-[#555555] rounded-lg hover:bg-gray-50 dark:hover:bg-[#444444] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAction}
                  className={`px-4 py-2 text-white rounded-lg transition-colors ${
                    actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                    actionType === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                    actionType === 'assign' ? 'bg-blue-600 hover:bg-blue-700' :
                    'bg-purple-600 hover:bg-purple-700'
                  }`}
                >
                  {actionType === 'approve' && 'Aprobar'}
                  {actionType === 'reject' && 'Rechazar'}
                  {actionType === 'assign' && 'Asignar'}
                  {actionType === 'complete' && 'Completar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvertisementRequestsTab;
