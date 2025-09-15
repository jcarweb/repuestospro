import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useActiveStore } from '../contexts/ActiveStoreContext';
import { 
  Crown, 
  Star, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Zap,
  Shield
} from 'lucide-react';

interface SubscriptionStatusProps {
  className?: string;
}

interface Subscription {
  _id: string;
  name: string;
  type: 'basic' | 'pro' | 'elite';
  price: number;
  features: string[];
}

interface SubscriptionInfo {
  plan: Subscription;
  status: string;
  expiresAt?: string;
  hasAccess: boolean;
  reason?: string;
}

const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { activeStore } = useActiveStore();
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeStore) {
      fetchSubscriptionInfo();
    }
  }, [activeStore]);

  const fetchSubscriptionInfo = async () => {
    if (!activeStore) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/promotions/check-access?storeId=${activeStore._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSubscriptionInfo(data);
      }
    } catch (error) {
      console.error('Error obteniendo información de suscripción:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!activeStore || loading) {
    return null;
  }

  if (!subscriptionInfo) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-3">
          <Crown className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-900">Plan Básico</p>
            <p className="text-xs text-gray-500">Funcionalidades limitadas</p>
          </div>
        </div>
      </div>
    );
  }

  const getPlanIcon = (type: string) => {
    switch (type) {
      case 'basic':
        return <Shield className="h-5 w-5 text-gray-400" />;
      case 'pro':
        return <Star className="h-5 w-5 text-blue-500" />;
      case 'elite':
        return <Crown className="h-5 w-5 text-purple-500" />;
      default:
        return <Shield className="h-5 w-5 text-gray-400" />;
    }
  };

  const getPlanColor = (type: string) => {
    switch (type) {
      case 'basic':
        return 'text-gray-600';
      case 'pro':
        return 'text-blue-600';
      case 'elite':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'expired':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'expired':
        return 'Expirado';
      case 'pending':
        return 'Pendiente';
      default:
        return 'Inactivo';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600';
      case 'expired':
        return 'text-red-600';
      case 'pending':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          {getPlanIcon(subscriptionInfo.plan.type)}
          <div>
            <p className={`text-sm font-semibold ${getPlanColor(subscriptionInfo.plan.type)}`}>
              {subscriptionInfo.plan.name}
            </p>
            <p className="text-xs text-gray-500">
              ${subscriptionInfo.plan.price}/mes
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusIcon(subscriptionInfo.status)}
          <span className={`text-xs font-medium ${getStatusColor(subscriptionInfo.status)}`}>
            {getStatusText(subscriptionInfo.status)}
          </span>
        </div>
      </div>

      {/* Funcionalidades disponibles */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-4 w-4 text-gray-400" />
          <span className="text-xs text-gray-600">Promociones</span>
          {subscriptionInfo.hasAccess ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-red-500" />
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Zap className="h-4 w-4 text-gray-400" />
          <span className="text-xs text-gray-600">Analytics Avanzado</span>
          {subscriptionInfo.plan.type !== 'basic' ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-red-500" />
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Crown className="h-4 w-4 text-gray-400" />
          <span className="text-xs text-gray-600">Soporte Prioritario</span>
          {subscriptionInfo.plan.type !== 'basic' ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-red-500" />
          )}
        </div>
      </div>

      {/* Mensaje de upgrade si es necesario */}
      {!subscriptionInfo.hasAccess && (
        <div className="mt-3 p-2 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded">
          <p className="text-xs text-purple-700 font-medium">
            {subscriptionInfo.reason}
          </p>
                     <button
             onClick={() => navigate('/admin/monetization')}
             className="mt-2 text-xs bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 transition-colors"
           >
             Actualizar Plan
           </button>
        </div>
      )}

      {/* Fecha de expiración */}
      {subscriptionInfo.expiresAt && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-xs text-gray-500">
              Expira: {new Date(subscriptionInfo.expiresAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionStatus;
