import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useActiveStore } from '../contexts/ActiveStoreContext';
import { RefreshCw, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const StoreDebugInfo: React.FC = () => {
  const { user, token } = useAuth();
  const { activeStore, userStores, loading, refreshStores } = useActiveStore();
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [apiTestResult, setApiTestResult] = useState<any>(null);
  const [apiTestLoading, setApiTestLoading] = useState(false);

  const handleRefresh = async () => {
    setLastRefresh(new Date());
    await refreshStores();
  };

  const testApiDirectly = async () => {
    setApiTestLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/user/stores/complete', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      setApiTestResult({
        status: response.status,
        success: data.success,
        data: data.data,
        timestamp: new Date().toLocaleTimeString()
      });
    } catch (error) {
      setApiTestResult({
        error: error.message,
        timestamp: new Date().toLocaleTimeString()
      });
    } finally {
      setApiTestLoading(false);
    }
  };

  const getStatusIcon = () => {
    if (loading) return <Clock className="h-4 w-4 text-yellow-500" />;
    if (userStores.length > 0) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <AlertCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusText = () => {
    if (loading) return 'Cargando...';
    if (userStores.length > 0) return `${userStores.length} tienda(s) encontrada(s)`;
    return 'No se encontraron tiendas';
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-yellow-800">Debug Info - Tiendas</h3>
          {getStatusIcon()}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center space-x-1 px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={testApiDirectly}
            disabled={apiTestLoading}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {apiTestLoading ? 'Probando...' : 'Test API'}
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 text-sm">
          <div><strong>Usuario:</strong> {user?.name} ({user?.role})</div>
          <div><strong>Token:</strong> {token ? '✅ Presente' : '❌ Ausente'}</div>
          <div><strong>Estado:</strong> {getStatusText()}</div>
          <div><strong>Loading:</strong> {loading ? '🔄 Sí' : '✅ No'}</div>
          <div><strong>Tienda activa:</strong> {activeStore ? activeStore.name : 'Ninguna'}</div>
          {lastRefresh && (
            <div><strong>Último refresh:</strong> {lastRefresh.toLocaleTimeString()}</div>
          )}
        </div>
        
        <div className="space-y-2 text-sm">
          <div><strong>Tiendas disponibles ({userStores.length}):</strong></div>
          {userStores.length > 0 ? (
            <ul className="ml-4 space-y-1">
              {userStores.map((store, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <span>• {store.name}</span>
                  <span className="text-xs text-gray-500">(ID: {store._id.slice(-8)})</span>
                  <span className={`px-1 py-0.5 text-xs rounded ${
                    store.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {store.isActive ? 'Activa' : 'Inactiva'}
                  </span>
                  {store.isMainStore && (
                    <span className="px-1 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                      Principal
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500 italic">No hay tiendas cargadas</div>
          )}
        </div>
      </div>

      {apiTestResult && (
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <h4 className="font-semibold text-gray-800 mb-2">Test API Directo ({apiTestResult.timestamp}):</h4>
          <pre className="bg-white p-2 rounded text-xs overflow-auto max-h-32">
            {JSON.stringify(apiTestResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default StoreDebugInfo;
