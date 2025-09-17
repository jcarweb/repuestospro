import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';

const DebugAPI: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const fullUrl = `${API_BASE_URL}/debug/users`;
      
      console.log('🔍 DebugAPI - Testing API:', {
        API_BASE_URL,
        fullUrl,
        hasToken: !!token,
        hostname: window.location.hostname,
        isVercel: window.location.hostname.includes('vercel.app')
      });

      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('🔍 DebugAPI - Response:', {
        status: response.status,
        ok: response.ok,
        url: response.url,
        headers: Object.fromEntries(response.headers.entries())
      });

      const contentType = response.headers.get('content-type');
      console.log('🔍 DebugAPI - Content-Type:', contentType);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔍 DebugAPI - Error response:', errorText);
        setDebugInfo({
          error: true,
          status: response.status,
          message: errorText,
          contentType
        });
        return;
      }

      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.error('🔍 DebugAPI - Non-JSON response:', responseText.substring(0, 200));
        setDebugInfo({
          error: true,
          status: response.status,
          message: `Expected JSON but received ${contentType}`,
          responseText: responseText.substring(0, 200)
        });
        return;
      }

      const data = await response.json();
      console.log('🔍 DebugAPI - Success data:', data);
      setDebugInfo({
        success: true,
        data,
        status: response.status
      });

    } catch (error: any) {
      console.error('🔍 DebugAPI - Catch error:', error);
      setDebugInfo({
        error: true,
        message: error.message,
        stack: error.stack
      });
    } finally {
      setLoading(false);
    }
  };

  const testAdminAPI = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const fullUrl = `${API_BASE_URL}/admin/users`;

      // Decodificar el token para ver su contenido
      let tokenInfo = null;
      if (token) {
        try {
          const parts = token.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            tokenInfo = payload;
          }
        } catch (e) {
          console.log('No se pudo decodificar el token');
        }
      }

      console.log('🔍 DebugAPI - Testing Admin API:', {
        API_BASE_URL,
        fullUrl,
        hasToken: !!token,
        tokenInfo,
        hostname: window.location.hostname,
        isVercel: window.location.hostname.includes('vercel.app')
      });

      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('🔍 DebugAPI - Admin Response:', {
        status: response.status,
        ok: response.ok,
        url: response.url,
        headers: Object.fromEntries(response.headers.entries())
      });

      const contentType = response.headers.get('content-type');
      console.log('🔍 DebugAPI - Admin Content-Type:', contentType);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔍 DebugAPI - Admin Error response:', errorText);
        setDebugInfo({
          error: true,
          status: response.status,
          message: errorText,
          contentType,
          tokenInfo
        });
        return;
      }

      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.error('🔍 DebugAPI - Admin Non-JSON response:', responseText.substring(0, 200));
        setDebugInfo({
          error: true,
          status: response.status,
          message: `Expected JSON but received ${contentType}`,
          responseText: responseText.substring(0, 200),
          tokenInfo
        });
        return;
      }

      const data = await response.json();
      console.log('🔍 DebugAPI - Admin Success data:', data);
      setDebugInfo({
        success: true,
        data,
        status: response.status,
        tokenInfo
      });

    } catch (error: any) {
      console.error('🔍 DebugAPI - Admin Catch error:', error);
      setDebugInfo({
        error: true,
        message: error.message,
        stack: error.stack
      });
    } finally {
      setLoading(false);
    }
  };

  // Función para decodificar el token actual
  const getCurrentTokenInfo = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        return {
          userId: payload.userId || payload.sub,
          role: payload.role,
          exp: payload.exp,
          iat: payload.iat,
          isExpired: payload.exp ? payload.exp < Date.now() / 1000 : false
        };
      }
    } catch (e) {
      console.log('Error decodificando token:', e);
    }
    return null;
  };

  const currentTokenInfo = getCurrentTokenInfo();

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg m-4">
      <h3 className="text-lg font-bold mb-4">🔍 Debug API</h3>
      
      <div className="mb-4">
        <p><strong>API_BASE_URL:</strong> {API_BASE_URL}</p>
        <p><strong>Hostname:</strong> {window.location.hostname}</p>
        <p><strong>Is Vercel:</strong> {window.location.hostname.includes('vercel.app') ? 'Yes' : 'No'}</p>
        <p><strong>Has Token:</strong> {localStorage.getItem('token') ? 'Yes' : 'No'}</p>
        {currentTokenInfo && (
          <div className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-900 rounded">
            <p><strong>Token Info:</strong></p>
            <p><strong>User ID:</strong> {currentTokenInfo.userId}</p>
            <p><strong>Role:</strong> {currentTokenInfo.role}</p>
            <p><strong>Expired:</strong> {currentTokenInfo.isExpired ? 'Yes' : 'No'}</p>
            <p><strong>Expires:</strong> {currentTokenInfo.exp ? new Date(currentTokenInfo.exp * 1000).toLocaleString() : 'Unknown'}</p>
          </div>
        )}
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={testAPI}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Debug API'}
        </button>
        
        <button
          onClick={testAdminAPI}
          disabled={loading}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Admin API'}
        </button>
      </div>

      {debugInfo && (
        <div className="mt-4 p-4 bg-white dark:bg-gray-700 rounded">
          <h4 className="font-bold mb-2">Debug Results:</h4>
          <pre className="text-xs overflow-auto max-h-96">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default DebugAPI;
