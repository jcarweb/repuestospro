import React, { useState, useEffect } from 'react';
import { activityService, Activity } from '../services/activityService';
import { Clock, CheckCircle, XCircle, Activity as ActivityIcon } from 'lucide-react';

const ActivityHistory: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const newActivities = await activityService.getUserActivities(20, page * 20);
      
      if (page === 0) {
        setActivities(newActivities);
      } else {
        setActivities(prev => [...prev, ...newActivities]);
      }
      
      setHasMore(newActivities.length === 20);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
      loadActivities();
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'logout':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'password_changed':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'profile_update':
        return <CheckCircle className="w-4 h-4 text-purple-500" />;
      case 'pin_setup':
        return <CheckCircle className="w-4 h-4 text-orange-500" />;
      case 'fingerprint_setup':
        return <CheckCircle className="w-4 h-4 text-indigo-500" />;
      case 'two_factor_enabled':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <ActivityIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Hace unos minutos';
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'login':
        return 'bg-green-50 border-green-200';
      case 'logout':
        return 'bg-red-50 border-red-200';
      case 'password_changed':
        return 'bg-blue-50 border-blue-200';
      case 'profile_update':
        return 'bg-purple-50 border-purple-200';
      case 'pin_setup':
        return 'bg-orange-50 border-orange-200';
      case 'fingerprint_setup':
        return 'bg-indigo-50 border-indigo-200';
      case 'two_factor_enabled':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-6">
        <ActivityIcon className="w-6 h-6 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Historial de Actividades</h3>
      </div>

      {activities.length === 0 && !loading ? (
        <div className="text-center py-8">
          <ActivityIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No hay actividades registradas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <div
              key={activity._id}
              className={`p-4 rounded-lg border ${getActivityColor(activity.type)}`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.description}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {formatDate(activity.createdAt)}
                    </span>
                  </div>
                  {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                    <div className="mt-2 text-xs text-gray-600">
                      {activity.metadata.device && (
                        <span className="inline-block bg-gray-200 rounded px-2 py-1 mr-2">
                          {activity.metadata.device}
                        </span>
                      )}
                      {activity.metadata.location && (
                        <span className="inline-block bg-gray-200 rounded px-2 py-1">
                          {activity.metadata.location}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0">
                  {activity.success ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {hasMore && (
        <div className="text-center pt-4">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Cargando...' : 'Cargar más'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityHistory; 