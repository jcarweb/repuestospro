import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useActiveStore } from '../contexts/ActiveStoreContext';
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Settings,
  Building2,
  Share2,
  Info
} from 'lucide-react';

interface InventoryStatusCardProps {
  onConfigureClick: () => void;
}

interface InventoryConfig {
  inventoryType: 'global' | 'separate' | 'hybrid';
  parentStore?: {
    _id: string;
    name: string;
    address: string;
    city: string;
  };
  childStores: Array<{
    _id: string;
    name: string;
    address: string;
    city: string;
  }>;
  allowLocalStock: boolean;
  autoDistribute: boolean;
  distributionRules: {
    minStock: number;
    maxStock: number;
    distributionMethod: 'equal' | 'proportional' | 'manual';
  };
}

const InventoryStatusCard: React.FC<InventoryStatusCardProps> = ({ onConfigureClick }) => {
  const { token } = useAuth();
  const { activeStore } = useActiveStore();
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<InventoryConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeStore) {
      loadInventoryConfig();
    }
  }, [activeStore]);

  const loadInventoryConfig = async () => {
    if (!activeStore || !token) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "http://localhost:5000""/api/inventory/config/${activeStore._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setConfig(data.data);
        } else {
          setError('No se pudo cargar la configuración');
        }
      } else {
        setError('Error al cargar la configuración');
      }
    } catch (error) {
      console.error('Error cargando configuración:', error);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const getInventoryTypeInfo = (type: string) => {
    switch (type) {
      case 'global':
        return {
          name: 'Inventario Global',
          description: 'Stock centralizado compartido entre tiendas',
          icon: <Building2 className="h-5 w-5" />,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
      case 'separate':
        return {
          name: 'Inventario Separado',
          description: 'Cada tienda maneja su propio stock',
          icon: <Package className="h-5 w-5" />,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'hybrid':
        return {
          name: 'Inventario Híbrido',
          description: 'Combinación de stock global y local',
          icon: <Share2 className="h-5 w-5" />,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200'
        };
      default:
        return {
          name: 'No configurado',
          description: 'Configuración de inventario no establecida',
          icon: <Settings className="h-5 w-5" />,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center space-x-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <h3 className="text-lg font-medium text-gray-900">Error de configuración</h3>
        </div>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={onConfigureClick}
          className="px-4 py-2 bg-[#FFC300] text-[#333333] font-medium rounded-md hover:bg-[#E6B800] focus:outline-none focus:ring-2 focus:ring-[#FFC300] focus:ring-offset-2"
        >
          Configurar Inventario
        </button>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Info className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900">Configuración de Inventario</h3>
        </div>
        <p className="text-gray-600 mb-4">
          No se ha configurado el tipo de inventario para esta tienda. 
          Configura cómo deseas manejar el stock entre tiendas y sucursales.
        </p>
        <button
          onClick={onConfigureClick}
          className="px-4 py-2 bg-[#FFC300] text-[#333333] font-medium rounded-md hover:bg-[#E6B800] focus:outline-none focus:ring-2 focus:ring-[#FFC300] focus:ring-offset-2"
        >
          Configurar Inventario
        </button>
      </div>
    );
  }

  const typeInfo = getInventoryTypeInfo(config.inventoryType);

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Package className="h-6 w-6 text-[#FFC300]" />
          <h3 className="text-lg font-medium text-gray-900">Estado del Inventario</h3>
        </div>
        <button
          onClick={onConfigureClick}
          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>

      {/* Tipo de inventario */}
      <div className={`${typeInfo.bgColor} ${typeInfo.borderColor} border rounded-lg p-4 mb-4`}>
        <div className="flex items-center space-x-2 mb-2">
          <span className={typeInfo.color}>{typeInfo.icon}</span>
          <span className="font-medium text-gray-900">{typeInfo.name}</span>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </div>
        <p className="text-sm text-gray-600">{typeInfo.description}</p>
      </div>

      {/* Configuración específica */}
      {config.inventoryType === 'global' && (
        <div className="space-y-3">
          {/* Si es tienda principal (tiene childStores) */}
          {config.childStores && config.childStores.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Inventario compartido con</h4>
              <div className="space-y-1">
                {config.childStores.map(store => (
                  <div key={store._id} className="flex items-center space-x-2 text-sm text-gray-600">
                    <Building2 className="h-3 w-3" />
                    <span>{store.name} - {store.city}</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Sucursal</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Si es sucursal (tiene parentStore) */}
          {config.parentStore && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Tienda Principal</h4>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Building2 className="h-3 w-3" />
                <span>{config.parentStore.name} - {config.parentStore.city}</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Tienda Principal</span>
              </div>
            </div>
          )}

          {config.autoDistribute && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span>Distribución automática: {config.distributionRules.distributionMethod}</span>
            </div>
          )}

          {/* Información adicional para sucursales con inventario global */}
          {(config as any).globalConfig && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="font-medium text-blue-900 mb-2">Configuración Global</h4>
              <div className="space-y-1 text-sm text-blue-800">
                <div>• El inventario se comparte con {(config as any).globalConfig.childStores.length} sucursales</div>
                {(config as any).globalConfig.autoDistribute && (
                  <div>• Distribución automática habilitada</div>
                )}
                <div>• Método: {(config as any).globalConfig.distributionRules.distributionMethod}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {config.inventoryType === 'hybrid' && config.allowLocalStock && (
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Share2 className="h-4 w-4 text-purple-600" />
          <span>Stock local habilitado en sucursales</span>
        </div>
      )}

      {/* Reglas de stock */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <h4 className="font-medium text-gray-900 mb-2">Reglas de Stock</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Mínimo:</span>
            <span className="ml-2 font-medium">{config.distributionRules.minStock}</span>
          </div>
          <div>
            <span className="text-gray-500">Máximo:</span>
            <span className="ml-2 font-medium">{config.distributionRules.maxStock}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryStatusCard;
