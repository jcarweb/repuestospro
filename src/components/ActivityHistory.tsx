import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  LogIn, 
  LogOut, 
  Shield, 
  Key, 
  Fingerprint, 
  Mail, 
  User,
  Calendar,
  MapPin,
  Monitor,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface Activity {
  _id: string;
  type: string;
  description: string;
  metadata?: {
    ip?: string;
    userAgent?: string;
    provider?: string;
  };
  createdAt: string;
}

interface ActivityHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
}

const ActivityHistory: React.FC<ActivityHistoryProps> = ({ isOpen, onClose, token }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login':
        return <LogIn className="w-5 h-5 text-green-600" />;
      case 'logout':
        return <LogOut className="w-5 h-5 text-red-600" />;
      case 'register':
        return <User className="w-5 h-5 text-blue-600" />;
      case 'profile_update':
        return <User className="w-5 h-5 text-blue-600" />;
      case 'setup_pin':
        return <Key className="w-5 h-5 text-purple-600" />;
      case 'setup_fingerprint':
        return <Fingerprint className="w-5 h-5 text-orange-600" />;
      case 'email_verification':
        return <Mail className="w-5 h-5 text-indigo-600" />;
      case 'password_reset':
        return <Shield className="w-5 h-5 text-yellow-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getActivityTypeLabel = (type: string) => {
    switch (type) {
      case 'login':
        return 'Inicio de sesión';
      case 'logout':
        return 'Cierre de sesión';
      case 'register':
        return 'Registro';
      case 'profile_update':
        return 'Actualización de perfil';
      case 'setup_pin':
        return 'Configuración de PIN';
      case 'setup_fingerprint':
        return 'Configuración de huella digital';
      case 'email_verification':
        return 'Verificación de email';
      case 'password_reset':
        return 'Restablecimiento de contraseña';
      default:
        return 'Actividad';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDeviceInfo = (userAgent: string) => {
    if (!userAgent) return 'Dispositivo desconocido';
    
    if (userAgent.includes('Mobile')) {
      return 'Dispositivo móvil';
    } else if (userAgent.includes('Tablet')) {
      return 'Tablet';
    } else {
      return 'Computadora';
    }
  };

  const fetchActivities = async (page: number = 1) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`http://localhost:5000/api/auth/activity-history?page=${page}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        setActivities(result.data);
        setTotalPages(Math.ceil(result.pagination.total / result.pagination.limit));
        setCurrentPage(page);
      } else {
        setError(result.message || 'Error cargando historial');
      }
    } catch (error) {
      console.error('Error cargando historial:', error);
      setError('Error de conexión. Verifica que el servidor esté funcionando.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchActivities();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Clock className="w-6 h-6 mr-2 text-blue-600" />
            Historial de Actividad
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Cargando historial...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-600 mb-4">
                <Shield className="w-12 h-12 mx-auto mb-2" />
                <p>{error}</p>
              </div>
              <button
                onClick={() => fetchActivities()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Reintentar
              </button>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No hay actividad registrada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div
                  key={activity._id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getActivityIcon(activity.type)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-semibold text-gray-900">
                            {getActivityTypeLabel(activity.type)}
                          </span>
                          {activity.metadata?.provider && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {activity.metadata.provider}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-2">
                          {activity.description}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(activity.createdAt)}
                          </div>
                          {activity.metadata?.ip && (
                            <div className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {activity.metadata.ip}
                            </div>
                          )}
                          {activity.metadata?.userAgent && (
                            <div className="flex items-center">
                              <Monitor className="w-3 h-3 mr-1" />
                              {getDeviceInfo(activity.metadata.userAgent)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {activities.length > 0 && (
          <div className="flex items-center justify-between p-6 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Página {currentPage} de {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => fetchActivities(currentPage - 1)}
                disabled={currentPage <= 1}
                className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Anterior
              </button>
              <button
                onClick={() => fetchActivities(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityHistory; 