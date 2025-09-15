import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Shield, 
  Eye, 
  Ban, 
  CheckCircle, 
  Clock, 
  User,
  MessageCircle,
  Phone,
  Mail,
  ExternalLink,
  Flag,
  MoreVertical
} from 'lucide-react';

interface Violation {
  _id: string;
  chatId: string;
  messageId: string;
  clientName: string;
  productName?: string;
  violationType: 'phone' | 'email' | 'external_link' | 'forbidden_keyword' | 'fraud_pattern';
  violationDetails: string;
  blockedContent: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  action?: 'warning' | 'block' | 'none';
}

interface ViolationsPanelProps {
  storeId: string;
  onViolationUpdate?: (violationId: string, action: string) => void;
  className?: string;
}

const ViolationsPanel: React.FC<ViolationsPanelProps> = ({
  storeId,
  onViolationUpdate,
  className = ''
}) => {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed'>('all');
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);

  useEffect(() => {
    loadViolations();
  }, [storeId]);

  const loadViolations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/chat/store/${storeId}/violations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setViolations(data.data.violations);
      } else {
        throw new Error('Error cargando violaciones');
      }
    } catch (err) {
      console.error('Error cargando violaciones:', err);
      setError('Error al cargar las violaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleViolationAction = async (violationId: string, action: 'warning' | 'block' | 'dismiss') => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/chat/violations/${violationId}/action`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action })
      });

      if (response.ok) {
        // Actualizar estado local
        setViolations(prev => prev.map(v => 
          v._id === violationId 
            ? { ...v, status: 'resolved', action, reviewedAt: new Date().toISOString() }
            : v
        ));
        
        onViolationUpdate?.(violationId, action);
        setSelectedViolation(null);
      }
    } catch (error) {
      console.error('Error aplicando acción:', error);
    }
  };

  const getViolationIcon = (type: string) => {
    switch (type) {
      case 'phone':
        return <Phone className="w-4 h-4 text-red-500" />;
      case 'email':
        return <Mail className="w-4 h-4 text-orange-500" />;
      case 'external_link':
        return <ExternalLink className="w-4 h-4 text-yellow-500" />;
      case 'forbidden_keyword':
        return <Flag className="w-4 h-4 text-purple-500" />;
      case 'fraud_pattern':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'dismissed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredViolations = violations.filter(v => {
    if (filter === 'pending') return v.status === 'pending';
    if (filter === 'reviewed') return v.status !== 'pending';
    return true;
  });

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={loadViolations}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-yellow-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Violaciones de Chat
          </h3>
          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
            {filteredViolations.length}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option value="all">Todas</option>
            <option value="pending">Pendientes</option>
            <option value="reviewed">Revisadas</option>
          </select>
          
          <button
            onClick={loadViolations}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <Clock className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Lista de violaciones */}
      {filteredViolations.length === 0 ? (
        <div className="text-center py-8">
          <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-700 mb-2">
            No hay violaciones
          </h4>
          <p className="text-gray-500">
            {filter === 'pending' 
              ? 'No hay violaciones pendientes de revisión'
              : 'No se encontraron violaciones con los filtros aplicados'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredViolations.map((violation) => (
            <div
              key={violation._id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedViolation(violation)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {getViolationIcon(violation.violationType)}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900 truncate">
                        {violation.clientName}
                      </h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(violation.severity)}`}>
                        {violation.severity}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(violation.status)}`}>
                        {violation.status === 'pending' ? 'Pendiente' :
                         violation.status === 'reviewed' ? 'Revisada' :
                         violation.status === 'resolved' ? 'Resuelta' : 'Descartada'}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {violation.productName ? `Producto: ${violation.productName}` : 'Chat general'}
                    </p>
                    
                    <p className="text-sm text-gray-700 mb-2">
                      {violation.violationDetails}
                    </p>
                    
                    {violation.blockedContent.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {violation.blockedContent.map((content, index) => (
                          <span
                            key={index}
                            className="inline-block bg-red-50 text-red-700 text-xs px-2 py-1 rounded border border-red-200"
                          >
                            {content}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-500 mt-2">
                      {formatDate(violation.createdAt)}
                    </p>
                  </div>
                </div>
                
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de detalle de violación */}
      {selectedViolation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            {/* Header del modal */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getViolationIcon(selectedViolation.violationType)}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Violación de {selectedViolation.clientName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formatDate(selectedViolation.createdAt)}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => setSelectedViolation(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Contenido del modal */}
            <div className="p-6">
              <div className="space-y-4">
                {/* Información de la violación */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Detalles de la Violación</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Tipo:</span>
                      <span className="ml-2 font-medium capitalize">
                        {selectedViolation.violationType.replace('_', ' ')}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Severidad:</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getSeverityColor(selectedViolation.severity)}`}>
                        {selectedViolation.severity}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Estado:</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedViolation.status)}`}>
                        {selectedViolation.status === 'pending' ? 'Pendiente' :
                         selectedViolation.status === 'reviewed' ? 'Revisada' :
                         selectedViolation.status === 'resolved' ? 'Resuelta' : 'Descartada'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Producto:</span>
                      <span className="ml-2 font-medium">
                        {selectedViolation.productName || 'Chat general'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contenido bloqueado */}
                {selectedViolation.blockedContent.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Contenido Bloqueado</h4>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex flex-wrap gap-2">
                        {selectedViolation.blockedContent.map((content, index) => (
                          <span
                            key={index}
                            className="inline-block bg-red-100 text-red-800 text-sm px-3 py-1 rounded border border-red-300"
                          >
                            {content}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Descripción */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Descripción</h4>
                  <p className="text-gray-700 bg-gray-50 rounded-lg p-3">
                    {selectedViolation.violationDetails}
                  </p>
                </div>

                {/* Acciones */}
                {selectedViolation.status === 'pending' && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Acciones Disponibles</h4>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleViolationAction(selectedViolation._id, 'warning')}
                        className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center justify-center gap-2"
                      >
                        <AlertTriangle className="w-4 h-4" />
                        Advertencia
                      </button>
                      
                      <button
                        onClick={() => handleViolationAction(selectedViolation._id, 'block')}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                      >
                        <Ban className="w-4 h-4" />
                        Bloquear Usuario
                      </button>
                      
                      <button
                        onClick={() => handleViolationAction(selectedViolation._id, 'dismiss')}
                        className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Descartar
                      </button>
                    </div>
                  </div>
                )}

                {/* Información adicional */}
                {selectedViolation.reviewedAt && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Información de Revisión</h4>
                    <div className="text-sm text-blue-800">
                      <p>Revisada el: {formatDate(selectedViolation.reviewedAt)}</p>
                      {selectedViolation.reviewedBy && (
                        <p>Por: {selectedViolation.reviewedBy}</p>
                      )}
                      {selectedViolation.action && (
                        <p>Acción tomada: {selectedViolation.action}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViolationsPanel;
