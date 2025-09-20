import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useActiveStore } from '../contexts/ActiveStoreContext';
import { RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';

const ContextVsDirectTest: React.FC = () => {
  const { token } = useAuth();
  const { userStores, loading } = useActiveStore();
  const [directApiResult, setDirectApiResult] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [lastTest, setLastTest] = useState<Date | null>(null);

  const testDirectApi = async () => {
    setIsTesting(true);
    setLastTest(new Date());
    
    try {
      console.log('ContextVsDirectTest: Iniciando test directo a API...');
      
      const response = await fetch('http://localhost:5000/api/user/stores/complete', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      console.log('ContextVsDirectTest: Respuesta directa de API:', data);
      
      setDirectApiResult({
        status: response.status,
        success: data.success,
        data: data.data,
        timestamp: new Date().toLocaleTimeString(),
        storesCount: data.data?.length || 0
      });
    } catch (error) {
      console.error('ContextVsDirectTest: Error en test directo:', error);
      setDirectApiResult({
        error: error.message,
        timestamp: new Date().toLocaleTimeString()
      });
    } finally {
      setIsTesting(false);
    }
  };

  const getComparisonStatus = () => {
    if (!directApiResult || !directApiResult.success) return 'pending';
    
    const contextCount = userStores.length;
    const apiCount = directApiResult.storesCount;
    
    if (contextCount === apiCount) return 'match';
    return 'mismatch';
  };

  const getStatusIcon = () => {
    const status = getComparisonStatus();
    switch (status) {
      case 'match':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'mismatch':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <RefreshCw className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    const status = getComparisonStatus();
    switch (status) {
      case 'match':
        return '✅ Coinciden';
      case 'mismatch':
        return '❌ No coinciden';
      default:
        return '⏳ Sin comparar';
    }
  };

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-purple-800">Context vs API Directo</h3>
          {getStatusIcon()}
        </div>
        <button
          onClick={testDirectApi}
          disabled={isTesting}
          className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 disabled:opacity-50"
        >
          {isTesting ? 'Probando...' : 'Comparar'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 text-sm">
          <h4 className="font-semibold text-purple-800">Estado del Contexto:</h4>
          <div><strong>Loading:</strong> {loading ? '🔄 Sí' : '✅ No'}</div>
          <div><strong>Tiendas en contexto:</strong> {userStores.length}</div>
          <div><strong>Estado:</strong> {getStatusText()}</div>
          {userStores.length > 0 && (
            <div>
              <strong>Tiendas:</strong>
              <ul className="ml-4 mt-1">
                {userStores.map((store, index) => (
                  <li key={index} className="text-xs">
                    • {store.name} ({store.isActive ? 'Activa' : 'Inactiva'})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="space-y-2 text-sm">
          <h4 className="font-semibold text-purple-800">Llamada Directa a API:</h4>
          {directApiResult ? (
            <>
              <div><strong>Status HTTP:</strong> {directApiResult.status}</div>
              <div><strong>Success:</strong> {directApiResult.success ? '✅ Sí' : '❌ No'}</div>
              <div><strong>Tiendas en API:</strong> {directApiResult.storesCount}</div>
              <div><strong>Timestamp:</strong> {directApiResult.timestamp}</div>
              {directApiResult.data && directApiResult.data.length > 0 && (
                <div>
                  <strong>Tiendas:</strong>
                  <ul className="ml-4 mt-1">
                    {directApiResult.data.map((store: any, index: number) => (
                      <li key={index} className="text-xs">
                        • {store.name} ({store.isActive ? 'Activa' : 'Inactiva'})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <div className="text-gray-500 italic">No se ha realizado test directo</div>
          )}
        </div>
      </div>

      {getComparisonStatus() === 'mismatch' && directApiResult && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
          <h4 className="font-semibold text-red-800 mb-2">⚠️ Diferencia Detectada:</h4>
          <div className="text-sm text-red-700">
            <p>• Contexto tiene {userStores.length} tienda(s)</p>
            <p>• API directa tiene {directApiResult.storesCount} tienda(s)</p>
            <p className="mt-2 font-medium">Esto indica un problema de sincronización entre el contexto y la API.</p>
          </div>
        </div>
      )}

      {lastTest && (
        <div className="mt-2 text-xs text-gray-500">
          Último test: {lastTest.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

export default ContextVsDirectTest;
