import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useActiveStore } from '../contexts/ActiveStoreContext';

const SimpleContextTest: React.FC = () => {
  const { user, token } = useAuth();
  const { activeStore, userStores, loading, refreshStores } = useActiveStore();

  useEffect(() => {
    console.log('SimpleContextTest: Component mounted');
    console.log('SimpleContextTest: Auth state:', { user: !!user, token: !!token, role: user?.role });
    console.log('SimpleContextTest: ActiveStore state:', { loading, userStoresCount: userStores.length, activeStore: !!activeStore });
  }, []);

  useEffect(() => {
    console.log('SimpleContextTest: Auth changed:', { user: !!user, token: !!token, role: user?.role });
  }, [user, token]);

  useEffect(() => {
    console.log('SimpleContextTest: ActiveStore changed:', { loading, userStoresCount: userStores.length, activeStore: !!activeStore });
  }, [loading, userStores, activeStore]);

  const handleRefresh = async () => {
    console.log('SimpleContextTest: Manual refresh triggered');
    await refreshStores();
  };

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-green-800">Simple Context Test</h3>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Cargando...' : 'Refresh'}
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 text-sm">
          <h4 className="font-semibold text-green-800">Auth State:</h4>
          <div><strong>User:</strong> {user ? `${user.name} (${user.role})` : 'No user'}</div>
          <div><strong>Token:</strong> {token ? 'Presente' : 'Ausente'}</div>
          <div><strong>Role:</strong> {user?.role || 'No role'}</div>
        </div>
        
        <div className="space-y-2 text-sm">
          <h4 className="font-semibold text-green-800">ActiveStore State:</h4>
          <div><strong>Loading:</strong> {loading ? 'Sí' : 'No'}</div>
          <div><strong>User Stores:</strong> {userStores.length}</div>
          <div><strong>Active Store:</strong> {activeStore ? activeStore.name : 'Ninguna'}</div>
          <div><strong>Context Available:</strong> Sí</div>
        </div>
      </div>
      
      {userStores.length > 0 && (
        <div className="mt-4 p-3 bg-white rounded border">
          <h5 className="font-semibold text-green-700 mb-2">Tiendas en Contexto:</h5>
          <ul className="space-y-1">
            {userStores.map((store, index) => (
              <li key={index} className="text-sm">
                • {store.name} ({store.isActive ? 'Activa' : 'Inactiva'}) - {store.isMainStore ? 'Principal' : 'Sucursal'}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="mt-4 p-3 bg-white rounded border">
        <h5 className="font-semibold text-green-700 mb-2">Diagnóstico:</h5>
        <div className="text-sm space-y-1">
          <div><strong>Context inicializado:</strong> {userStores !== undefined ? 'Sí' : 'No'}</div>
          <div><strong>Auth disponible:</strong> {user !== undefined ? 'Sí' : 'No'}</div>
          <div><strong>Condiciones para fetch:</strong> {token && user?.role === 'store_manager' ? 'Cumplidas' : 'No cumplidas'}</div>
          <div><strong>Estado de carga:</strong> {loading ? 'En progreso' : 'Completado'}</div>
          <div><strong>Tiendas cargadas:</strong> {userStores.length > 0 ? 'Sí' : 'No'}</div>
        </div>
      </div>
    </div>
  );
};

export default SimpleContextTest;
