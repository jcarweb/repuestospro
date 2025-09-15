import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const StoreDebugTest: React.FC = () => {
  const { token } = useAuth();
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const testEndpoints = async () => {
    if (!token) return;
    
    setLoading(true);
    const testResults: any = {};

    // Test 1: /api/user/stores
    try {
      console.log('🔍 Probando /api/user/stores...');
      const response1 = await fetch('/api/user/stores', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data1 = await response1.json();
      testResults['/api/user/stores'] = {
        status: response1.status,
        success: data1.success,
        data: data1.data,
        error: data1.message
      };
      console.log('✅ /api/user/stores resultado:', testResults['/api/user/stores']);
    } catch (error) {
      testResults['/api/user/stores'] = {
        status: 'ERROR',
        success: false,
        error: error.message
      };
      console.error('❌ /api/user/stores error:', error);
    }

    // Test 2: /api/user/stores/test
    try {
      console.log('🔍 Probando /api/user/stores/test...');
      const response2 = await fetch('/api/user/stores/test', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data2 = await response2.json();
      testResults['/api/user/stores/test'] = {
        status: response2.status,
        success: data2.success,
        data: data2.data,
        debug: data2.debug,
        error: data2.message
      };
      console.log('✅ /api/user/stores/test resultado:', testResults['/api/user/stores/test']);
    } catch (error) {
      testResults['/api/user/stores/test'] = {
        status: 'ERROR',
        success: false,
        error: error.message
      };
      console.error('❌ /api/user/stores/test error:', error);
    }

    // Test 3: /api/user/stores/debug
    try {
      console.log('🔍 Probando /api/user/stores/debug...');
      const response3 = await fetch('/api/user/stores/debug', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data3 = await response3.json();
      testResults['/api/user/stores/debug'] = {
        status: response3.status,
        success: data3.success,
        data: data3.data,
        error: data3.message
      };
      console.log('✅ /api/user/stores/debug resultado:', testResults['/api/user/stores/debug']);
    } catch (error) {
      testResults['/api/user/stores/debug'] = {
        status: 'ERROR',
        success: false,
        error: error.message
      };
      console.error('❌ /api/user/stores/debug error:', error);
    }

    setResults(testResults);
    setLoading(false);
  };

  useEffect(() => {
    if (token) {
      testEndpoints();
    }
  }, [token]);

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold text-blue-900 mb-4">
        🔍 Debug: Prueba de Endpoints de Tiendas
      </h3>
      
      {loading && (
        <div className="text-blue-600 mb-4">Probando endpoints...</div>
      )}

      {Object.keys(results).map((endpoint) => (
        <div key={endpoint} className="mb-4 p-3 bg-white rounded border">
          <h4 className="font-medium text-gray-900 mb-2">{endpoint}</h4>
          <div className="text-sm">
            <div><strong>Status:</strong> {results[endpoint].status}</div>
            <div><strong>Success:</strong> {results[endpoint].success ? '✅' : '❌'}</div>
            {results[endpoint].data && (
              <div><strong>Data:</strong> {Array.isArray(results[endpoint].data) ? `${results[endpoint].data.length} items` : 'Object'}</div>
            )}
            {results[endpoint].debug && (
              <div><strong>Debug:</strong> {JSON.stringify(results[endpoint].debug)}</div>
            )}
            {results[endpoint].error && (
              <div className="text-red-600"><strong>Error:</strong> {results[endpoint].error}</div>
            )}
          </div>
        </div>
      ))}

      <button
        onClick={testEndpoints}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Probando...' : 'Probar de nuevo'}
      </button>
    </div>
  );
};

export default StoreDebugTest;
