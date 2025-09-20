import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useActiveStore } from '../contexts/ActiveStoreContext';
import { RefreshCw, AlertTriangle, CheckCircle, Clock, Bug } from 'lucide-react';

const ActiveStoreDebugger: React.FC = () => {
  const { user, token } = useAuth();
  const { activeStore, userStores, loading, refreshStores } = useActiveStore();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    const updateDebugInfo = () => {
      setDebugInfo({
        timestamp: new Date().toLocaleTimeString(),
        auth: {
          user: user ? { id: user.id, name: user.name, role: user.role } : null,
          token: !!token,
          tokenLength: token?.length || 0
        },
        context: {
          loading,
          userStoresCount: userStores.length,
          activeStore: activeStore ? { id: activeStore._id, name: activeStore.name } : null,
          userStores: userStores.map(s => ({ id: s._id, name: s.name, isActive: s.isActive }))
        },
        conditions: {
          hasToken: !!token,
          isStoreManager: user?.role === 'store_manager',
          shouldLoad: !!(token && user?.role === 'store_manager'),
          isEmpty: userStores.length === 0
        }
      });
    };

    updateDebugInfo();
    const interval = setInterval(updateDebugInfo, 1000);
    return () => clearInterval(interval);
  }, [user, token, loading, userStores, activeStore]);

  const testDirectApi = async () => {
    setIsTesting(true);
    try {
      console.log('ActiveStoreDebugger: Test directo iniciado...');
      
      const response = await fetch('http://localhost:5000/api/user/stores/complete', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log('ActiveStoreDebugger: Respuesta directa:', data);
      
      setDebugInfo(prev => ({
        ...prev,
        directApiTest: {
          status: response.status,
          success: data.success,
          data: data.data,
          timestamp: new Date().toLocaleTimeString()
        }
      }));
    } catch (error) {
      console.error('ActiveStoreDebugger: Error en test directo:', error);
      setDebugInfo(prev => ({
        ...prev,
        directApiTest: {
          error: error.message,
          timestamp: new Date().toLocaleTimeString()
        }
      }));
    } finally {
      setIsTesting(false);
    }
  };

  const forceContextRefresh = async () => {
    console.log('ActiveStoreDebugger: Forzando refresh del contexto...');
    await refreshStores();
  };

  const getContextStatus = () => {
    if (loading) return { status: 'loading', icon: <Clock className="h-4 w-4 text-yellow-500" />, text: '🔄 Cargando...' };
    if (userStores.length > 0) return { status: 'success', icon: <CheckCircle className="h-4 w-4 text-green-500" />, text: '✅ Cargado' };
    if (token && user?.role === 'store_manager') return { status: 'error', icon: <AlertTriangle className="h-4 w-4 text-red-500" />, text: '❌ Error' };
    return { status: 'idle', icon: <Bug className="h-4 w-4 text-gray-500" />, text: '⏳ Inactivo' };
  };

  const contextStatus = getContextStatus();

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-red-800">ActiveStore Context Debugger</h3>
          {contextStatus.icon}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={forceContextRefresh}
            disabled={loading}
            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Cargando...' : 'Force Refresh'}
          </button>
          <button
            onClick={testDirectApi}
            disabled={isTesting}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {isTesting ? 'Probando...' : 'Test API'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="space-y-2 text-sm">
          <h4 className="font-semibold text-red-800">Estado del Contexto:</h4>
          <div><strong>Estado:</strong> {contextStatus.text}</div>
          <div><strong>Loading:</strong> {loading ? '🔄 Sí' : '✅ No'}</div>
          <div><strong>Tiendas:</strong> {userStores.length}</div>
          <div><strong>Tienda activa:</strong> {activeStore ? activeStore.name : 'Ninguna'}</div>
        </div>

        <div className="space-y-2 text-sm">
          <h4 className="font-semibold text-red-800">Condiciones:</h4>
          <div><strong>Token:</strong> {debugInfo.conditions?.hasToken ? '✅ Presente' : '❌ Ausente'}</div>
          <div><strong>Rol:</strong> {debugInfo.conditions?.isStoreManager ? '✅ store_manager' : '❌ Otro'}</div>
          <div><strong>Debería cargar:</strong> {debugInfo.conditions?.shouldLoad ? '✅ Sí' : '❌ No'}</div>
          <div><strong>Array vacío:</strong> {debugInfo.conditions?.isEmpty ? '✅ Sí' : '❌ No'}</div>
        </div>

        <div className="space-y-2 text-sm">
          <h4 className="font-semibold text-red-800">Usuario:</h4>
          <div><strong>ID:</strong> {debugInfo.auth?.user?.id || 'N/A'}</div>
          <div><strong>Nombre:</strong> {debugInfo.auth?.user?.name || 'N/A'}</div>
          <div><strong>Rol:</strong> {debugInfo.auth?.user?.role || 'N/A'}</div>
          <div><strong>Token:</strong> {debugInfo.auth?.token ? `${debugInfo.auth.tokenLength} chars` : 'N/A'}</div>
        </div>
      </div>

      {debugInfo.directApiTest && (
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <h4 className="font-semibold text-gray-800 mb-2">Test API Directo ({debugInfo.directApiTest.timestamp}):</h4>
          <div className="text-sm space-y-1">
            <div><strong>Status:</strong> {debugInfo.directApiTest.status}</div>
            <div><strong>Success:</strong> {debugInfo.directApiTest.success ? '✅ Sí' : '❌ No'}</div>
            {debugInfo.directApiTest.data && (
              <div><strong>Tiendas:</strong> {debugInfo.directApiTest.data.length}</div>
            )}
            {debugInfo.directApiTest.error && (
              <div><strong>Error:</strong> {debugInfo.directApiTest.error}</div>
            )}
          </div>
          <pre className="bg-white p-2 rounded text-xs overflow-auto max-h-32 mt-2">
            {JSON.stringify(debugInfo.directApiTest, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
        <h4 className="font-semibold text-yellow-800 mb-2">🔍 Diagnóstico:</h4>
        <div className="text-sm text-yellow-700 space-y-1">
          {contextStatus.status === 'error' && (
            <>
              <p>• El contexto no está cargando tiendas a pesar de tener token y rol correcto</p>
              <p>• Posibles causas:</p>
              <ul className="ml-4 space-y-1">
                <li>• El useEffect no se está ejecutando</li>
                <li>• Error en la llamada a fetchUserStores</li>
                <li>• Problema de timing en la inicialización</li>
                <li>• El callback fetchUserStores no está definido correctamente</li>
              </ul>
            </>
          )}
          {contextStatus.status === 'loading' && (
            <p>• El contexto está cargando. Si tarda más de 10 segundos, hay un problema.</p>
          )}
          {contextStatus.status === 'success' && (
            <p>• ✅ El contexto está funcionando correctamente.</p>
          )}
          <p className="mt-2 font-medium">Última actualización: {debugInfo.timestamp}</p>
        </div>
      </div>
    </div>
  );
};

export default ActiveStoreDebugger;
