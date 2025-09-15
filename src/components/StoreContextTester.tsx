import React, { useEffect } from 'react';
import { useActiveStore } from '../contexts/ActiveStoreContext';

const StoreContextTester: React.FC = () => {
  const { activeStore, userStores, loading, refreshStores } = useActiveStore();

  useEffect(() => {
    console.log('StoreContextTester: useEffect triggered');
    console.log('StoreContextTester: loading:', loading);
    console.log('StoreContextTester: userStores:', userStores);
    console.log('StoreContextTester: activeStore:', activeStore);
  }, [loading, userStores, activeStore]);

  const handleRefresh = async () => {
    console.log('StoreContextTester: Manual refresh triggered');
    await refreshStores();
  };

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold text-red-800 mb-2">Store Context Tester</h3>
      <button
        onClick={handleRefresh}
        disabled={loading}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 mb-4"
      >
        {loading ? 'Refrescando...' : 'Refresh Context'}
      </button>
      
      <div className="space-y-2 text-sm">
        <div><strong>Loading:</strong> {loading ? 'Sí' : 'No'}</div>
        <div><strong>User Stores Count:</strong> {userStores.length}</div>
        <div><strong>Active Store:</strong> {activeStore ? activeStore.name : 'Ninguna'}</div>
        <div><strong>User Stores:</strong></div>
        <ul className="ml-4">
          {userStores.map((store, index) => (
            <li key={index}>
              • {store.name} (ID: {store._id.slice(-8)}) - {store.isMainStore ? 'Principal' : 'Sucursal'}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default StoreContextTester;
