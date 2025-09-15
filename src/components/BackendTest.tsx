import React, { useState, useEffect } from 'react';

const BackendTest: React.FC = () => {
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testBackend = async () => {
    setLoading(true);
    try {
      console.log('🔍 Probando conectividad con backend...');
      const response = await fetch('/api/products/test');
      console.log('🔍 Response status:', response.status);
      console.log('🔍 Response ok:', response.ok);
      
      const data = await response.json();
      console.log('🔍 Response data:', data);
      
      setTestResult({
        status: response.status,
        ok: response.ok,
        data: data
      });
    } catch (error) {
      console.error('❌ Error probando backend:', error);
      setTestResult({
        status: 'ERROR',
        ok: false,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testBackend();
  }, []);

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold text-yellow-900 mb-4">
        🔧 Test de Conectividad Backend
      </h3>
      
      {loading && (
        <div className="text-yellow-600 mb-4">Probando conectividad...</div>
      )}

      {testResult && (
        <div className="p-3 bg-white rounded border">
          <div className="text-sm">
            <div><strong>Status:</strong> {testResult.status}</div>
            <div><strong>OK:</strong> {testResult.ok ? '✅' : '❌'}</div>
            {testResult.data && (
              <div><strong>Data:</strong> {JSON.stringify(testResult.data)}</div>
            )}
            {testResult.error && (
              <div className="text-red-600"><strong>Error:</strong> {testResult.error}</div>
            )}
          </div>
        </div>
      )}

      <button
        onClick={testBackend}
        disabled={loading}
        className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
      >
        {loading ? 'Probando...' : 'Probar de nuevo'}
      </button>
    </div>
  );
};

export default BackendTest;
