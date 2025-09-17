import React, { useState } from 'react';
import { API_BASE_URL } from '../../config/api';
import { useAuth } from '../contexts/AuthContext';

const ApiTestComponent: React.FC = () => {
  const { token } = useAuth();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testApi = async () => {
    setLoading(true);
    try {
      const response = await fetch('API_BASE_URL/user/stores/complete', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      setResult(data);
      console.log('API Test Result:', data);
    } catch (error) {
      console.error('API Test Error:', error);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold text-blue-800 mb-2">API Test</h3>
      <button 
        onClick={testApi}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Probando...' : 'Probar API'}
      </button>
      
      {result && (
        <div className="mt-4">
          <h4 className="font-semibold text-blue-800">Resultado:</h4>
          <pre className="bg-white p-2 rounded text-xs overflow-auto max-h-40">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ApiTestComponent;
