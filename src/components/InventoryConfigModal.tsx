import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useActiveStore } from '../contexts/ActiveStoreContext';
import { 
  Settings, 
  X, 
  CheckCircle, 
  Building2, 
  Package, 
  Share2,
  AlertTriangle,
  Info,
  Save
} from 'lucide-react';

interface InventoryConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved: () => void;
}

interface InventoryConfig {
  inventoryType: 'global' | 'separate' | 'hybrid';
  parentStore?: string;
  childStores: string[];
  allowLocalStock: boolean;
  autoDistribute: boolean;
  distributionRules: {
    minStock: number;
    maxStock: number;
    distributionMethod: 'equal' | 'proportional' | 'manual';
  };
}

const InventoryConfigModal: React.FC<InventoryConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved
}) => {
  const { token } = useAuth();
  const { activeStore, userStores } = useActiveStore();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<InventoryConfig | null>(null);
  
  const [config, setConfig] = useState<InventoryConfig>({
    inventoryType: 'separate',
    childStores: [],
    allowLocalStock: false,
    autoDistribute: false,
    distributionRules: {
      minStock: 0,
      maxStock: 1000,
      distributionMethod: 'equal'
    }
  });

  // Cargar configuración actual
  useEffect(() => {
    if (isOpen && activeStore) {
      loadCurrentConfig();
    }
  }, [isOpen, activeStore]);

  const loadCurrentConfig = async () => {
    if (!activeStore || !token) return;

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/inventory/config/${activeStore._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCurrentConfig(data.data);
          setConfig(data.data);
        }
      }
    } catch (error) {
      console.error('Error cargando configuración:', error);
    } finally {
      setLoading(false);
    }
  };

  // Verificar si la tienda actual es una sucursal con inventario global configurado
  const isBranchWithGlobalInventory = () => {
    // Solo es una sucursal con inventario global si:
    // 1. Tiene inventario global configurado
    // 2. Tiene una tienda padre (es decir, es una sucursal)
    // 3. NO es la tienda principal
    return currentConfig?.inventoryType === 'global' && 
           currentConfig?.parentStore && 
           !activeStore?.isMainStore;
  };

  // Verificar si la tienda actual es la tienda principal
  const isMainStore = () => {
    return activeStore?.isMainStore;
  };

  // Verificar si se puede editar la configuración
  const canEditConfig = () => {
    // Si es sucursal con inventario global, no puede editar
    if (isBranchWithGlobalInventory()) {
      return false;
    }
    // Si es tienda principal o tiene inventario separado, puede editar
    return true;
  };

  const handleSave = async () => {
    if (!activeStore || !token) return;

    setSaving(true);
    try {
      console.log('Enviando configuración:', config);
      
      const response = await fetch(`http://localhost:5000/api/inventory/config/${activeStore._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(config)
      });

      console.log('Status de respuesta:', response.status);
      const data = await response.json();
      console.log('Respuesta del servidor:', data);
      
      if (data.success) {
        console.log('Configuración guardada exitosamente');
        onConfigSaved();
        onClose();
      } else {
        console.error('Error del servidor:', data.message);
        alert(`Error al guardar la configuración: ${data.message}`);
      }
    } catch (error) {
      console.error('Error guardando configuración:', error);
      alert('Error de conexión al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const getInventoryTypeDescription = (type: string) => {
    switch (type) {
      case 'global':
        return 'Inventario centralizado en la tienda principal. Las sucursales comparten el mismo stock.';
      case 'separate':
        return 'Cada tienda y sucursal maneja su propio inventario de forma independiente.';
      case 'hybrid':
        return 'Combinación de inventario global y local. Permite stock local en sucursales.';
      default:
        return '';
    }
  };

  const getInventoryTypeIcon = (type: string) => {
    switch (type) {
      case 'global':
        return <Building2 className="h-5 w-5" />;
      case 'separate':
        return <Package className="h-5 w-5" />;
      case 'hybrid':
        return <Share2 className="h-5 w-5" />;
      default:
        return <Settings className="h-5 w-5" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Settings className="h-6 w-6 text-[#FFC300]" />
            <h2 className="text-xl font-semibold text-gray-900">
              Configuración de Inventario
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FFC300] mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando configuración...</p>
          </div>
        ) : isBranchWithGlobalInventory() ? (
          <div className="p-6 space-y-6">
            {/* Mensaje de restricción para sucursales */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <AlertTriangle className="h-8 w-8 text-orange-600" />
                <h3 className="text-lg font-semibold text-orange-900">
                  Configuración Bloqueada
                </h3>
              </div>
              <p className="text-orange-700 mb-4">
                Esta sucursal tiene inventario global configurado por la tienda principal.
              </p>
              <div className="bg-white border border-orange-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-orange-900 mb-2">Configuración Actual:</h4>
                <div className="space-y-2 text-sm text-orange-800">
                  <div><strong>Tipo:</strong> Inventario Global</div>
                  <div><strong>Tienda Principal:</strong> {(currentConfig?.parentStore as any)?.name || 'N/A'}</div>
                  <div><strong>Dirección:</strong> {(currentConfig?.parentStore as any)?.address ? `${(currentConfig?.parentStore as any)?.address}, ${(currentConfig?.parentStore as any)?.city}` : 'N/A'}</div>
                  {currentConfig?.autoDistribute && (
                    <div><strong>Distribución:</strong> {currentConfig?.distributionRules?.distributionMethod}</div>
                  )}
                </div>
              </div>
              <p className="text-sm text-orange-600">
                Solo la tienda principal puede modificar la configuración de inventario global.
                Contacta al administrador de la tienda principal para realizar cambios.
              </p>
            </div>
            
            {/* Botón de cerrar */}
            <div className="flex justify-center">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Información de la tienda */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <h3 className="font-medium text-blue-900">Tienda: {activeStore?.name}</h3>
              </div>
              <p className="text-blue-700 text-sm">
                {activeStore?.address}, {activeStore?.city}
              </p>
            </div>

            {/* Tipo de Inventario */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Tipo de Inventario</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['separate', 'global', 'hybrid'].map((type) => (
                  <div
                    key={type}
                    className={`border-2 rounded-lg p-4 transition-all ${
                      config.inventoryType === type
                        ? 'border-[#FFC300] bg-yellow-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${!canEditConfig() ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    onClick={() => canEditConfig() && setConfig({ ...config, inventoryType: type as any })}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      {getInventoryTypeIcon(type)}
                      <span className="font-medium text-gray-900 capitalize">
                        {type === 'separate' ? 'Separado' : type === 'global' ? 'Global' : 'Híbrido'}
                      </span>
                      {config.inventoryType === type && (
                        <CheckCircle className="h-4 w-4 text-[#FFC300]" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {getInventoryTypeDescription(type)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Configuración específica según el tipo */}
            {config.inventoryType === 'global' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Configuración de Inventario Global</h3>
                
                {/* Selección de sucursales */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sucursales que comparten el inventario
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {userStores
                      .filter(store => store._id !== activeStore?._id)
                      .map(store => (
                        <label key={store._id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={config.childStores.includes(store._id)}
                            disabled={!canEditConfig()}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setConfig({
                                  ...config,
                                  childStores: [...config.childStores, store._id]
                                });
                              } else {
                                setConfig({
                                  ...config,
                                  childStores: config.childStores.filter(id => id !== store._id)
                                });
                              }
                            }}
                            className={`rounded border-gray-300 text-[#FFC300] focus:ring-[#FFC300] ${
                              !canEditConfig() ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          />
                          <span className={`text-sm ${!canEditConfig() ? 'text-gray-500' : 'text-gray-700'}`}>
                            {store.name} - {store.address}, {store.city}
                          </span>
                        </label>
                      ))}
                  </div>
                </div>

                {/* Distribución automática */}
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={config.autoDistribute}
                      disabled={!canEditConfig()}
                      onChange={(e) => setConfig({ ...config, autoDistribute: e.target.checked })}
                      className={`rounded border-gray-300 text-[#FFC300] focus:ring-[#FFC300] ${
                        !canEditConfig() ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    />
                    <span className={`text-sm font-medium ${!canEditConfig() ? 'text-gray-500' : 'text-gray-700'}`}>
                      Distribución automática de stock
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Distribuir automáticamente el stock entre las sucursales cuando se agregue inventario
                  </p>
                </div>

                {/* Método de distribución */}
                {config.autoDistribute && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Método de distribución
                    </label>
                    <select
                      value={config.distributionRules.distributionMethod}
                      disabled={!canEditConfig()}
                      onChange={(e) => setConfig({
                        ...config,
                        distributionRules: {
                          ...config.distributionRules,
                          distributionMethod: e.target.value as any
                        }
                      })}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300] focus:border-transparent ${
                        !canEditConfig() ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''
                      }`}
                    >
                      <option value="equal">Igual para todas las sucursales</option>
                      <option value="proportional">Proporcional según ventas</option>
                      <option value="manual">Manual (requiere aprobación)</option>
                    </select>
                  </div>
                )}
              </div>
            )}

            {config.inventoryType === 'hybrid' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Configuración de Inventario Híbrido</h3>
                
                {/* Stock local */}
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={config.allowLocalStock}
                      disabled={!canEditConfig()}
                      onChange={(e) => setConfig({ ...config, allowLocalStock: e.target.checked })}
                      className={`rounded border-gray-300 text-[#FFC300] focus:ring-[#FFC300] ${
                        !canEditConfig() ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    />
                    <span className={`text-sm font-medium ${!canEditConfig() ? 'text-gray-500' : 'text-gray-700'}`}>
                      Permitir stock local en sucursales
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Las sucursales pueden mantener un stock local adicional al inventario global
                  </p>
                </div>
              </div>
            )}

            {/* Reglas de distribución */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Reglas de Stock</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock mínimo
                  </label>
                  <input
                    type="number"
                    value={config.distributionRules.minStock}
                    disabled={!canEditConfig()}
                    onChange={(e) => setConfig({
                      ...config,
                      distributionRules: {
                        ...config.distributionRules,
                        minStock: parseInt(e.target.value) || 0
                      }
                    })}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300] focus:border-transparent ${
                      !canEditConfig() ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''
                    }`}
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock máximo
                  </label>
                  <input
                    type="number"
                    value={config.distributionRules.maxStock}
                    disabled={!canEditConfig()}
                    onChange={(e) => setConfig({
                      ...config,
                      distributionRules: {
                        ...config.distributionRules,
                        maxStock: parseInt(e.target.value) || 1000
                      }
                    })}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300] focus:border-transparent ${
                      !canEditConfig() ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''
                    }`}
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Advertencia sobre cambio de configuración */}
            {currentConfig && currentConfig.inventoryType !== config.inventoryType && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-900">Cambio de configuración</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Al cambiar el tipo de inventario, se mantendrá la trazabilidad de los productos existentes, 
                      pero el comportamiento del sistema cambiará. Asegúrate de que este cambio sea el correcto.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Información adicional */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <Info className="h-5 w-5 text-gray-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900">Información importante</h4>
                  <ul className="text-sm text-gray-700 mt-1 space-y-1">
                    <li>• La configuración se aplica inmediatamente después de guardar</li>
                    <li>• Los productos existentes mantendrán su trazabilidad</li>
                    <li>• Puedes cambiar esta configuración en cualquier momento</li>
                    <li>• Las transferencias entre tiendas se registrarán automáticamente</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !canEditConfig()}
            className="px-4 py-2 bg-[#FFC300] text-[#333333] font-medium rounded-md hover:bg-[#E6B800] focus:outline-none focus:ring-2 focus:ring-[#FFC300] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#333333] mr-2"></div>
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {canEditConfig() ? 'Guardar Configuración' : 'Configuración Bloqueada'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryConfigModal;
