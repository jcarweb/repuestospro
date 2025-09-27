import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const SimpleStoreTest: React.FC = () => {
  const { token } = useAuth();
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStores = async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('SimpleStoreTest: Haciendo petición directa...');
      const response = await fetch('process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "http://localhost:5000""/api/user/stores/complete', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('SimpleStoreTest: Status:', response.status);
      const data = await response.json();
      console.log('SimpleStoreTest: Data:', data);
      
      if (data.success) {
        setStores(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error('SimpleStoreTest: Error:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [token]);

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold text-green-800 mb-2">Simple Store Test</h3>
      <button
        onClick={fetchStores}
        disabled={loading}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 mb-4"
      >
        {loading ? 'Cargando...' : 'Probar Fetch Directo'}
      </button>
      
      <div className="space-y-2 text-sm">
        <div><strong>Token:</strong> {token ? 'Presente' : 'Ausente'}</div>
        <div><strong>Loading:</strong> {loading ? 'Sí' : 'No'}</div>
        <div><strong>Error:</strong> {error || 'Ninguno'}</div>
        <div><strong>Tiendas encontradas:</strong> {stores.length}</div>
        <div><strong>Tiendas:</strong></div>
        <ul className="ml-4">
          {stores.map((store, index) => (
            <li key={index}>
              • {store.name} (ID: {store._id.slice(-8)}) - {store.isMainStore ? 'Principal' : 'Sucursal'}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SimpleStoreTest;
