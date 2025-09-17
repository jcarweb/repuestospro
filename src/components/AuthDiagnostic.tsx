import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { profileService } from '../services/profileService';
import { API_BASE_URL } from '../../config/api';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';

const AuthDiagnostic: React.FC = () => {
  const { user, token, isAuthenticated } = useAuth();
  const [diagnostics, setDiagnostics] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const runDiagnostics = async () => {
    setIsLoading(true);
    const results: any[] = [];

    // 1. Verificar localStorage
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    results.push({
      name: 'LocalStorage Token',
      status: storedToken ? 'success' : 'error',
      message: storedToken ? 'Token encontrado' : 'No hay token en localStorage',
      details: storedToken ? `Token: ${storedToken.substring(0, 20)}...` : null
    });

    results.push({
      name: 'LocalStorage User',
      status: storedUser ? 'success' : 'error',
      message: storedUser ? 'Usuario encontrado' : 'No hay usuario en localStorage',
      details: storedUser ? `Usuario: ${JSON.parse(storedUser).name}` : null
    });

    // 2. Verificar AuthContext
    results.push({
      name: 'AuthContext User',
      status: user ? 'success' : 'error',
      message: user ? 'Usuario en contexto' : 'No hay usuario en contexto',
      details: user ? `Usuario: ${user.name} (${user.role})` : null
    });

    results.push({
      name: 'AuthContext Token',
      status: token ? 'success' : 'error',
      message: token ? 'Token en contexto' : 'No hay token en contexto',
      details: token ? `Token: ${token.substring(0, 20)}...` : null
    });

    results.push({
      name: 'AuthContext isAuthenticated',
      status: isAuthenticated ? 'success' : 'warning',
      message: isAuthenticated ? 'Usuario autenticado' : 'Usuario no autenticado',
      details: null
    });

    // 3. Verificar token expiración
    if (storedToken) {
      try {
        const tokenPayload = JSON.parse(atob(storedToken.split('.')[1]));
        const currentTime = Date.now() / 1000;
        const isExpired = tokenPayload.exp && tokenPayload.exp < currentTime;
        
        results.push({
          name: 'Token Expiración',
          status: isExpired ? 'error' : 'success',
          message: isExpired ? 'Token expirado' : 'Token válido',
          details: isExpired ? `Expirado hace ${Math.floor((currentTime - tokenPayload.exp) / 60)} minutos` : `Expira en ${Math.floor((tokenPayload.exp - currentTime) / 60)} minutos`
        });
      } catch (error) {
        results.push({
          name: 'Token Expiración',
          status: 'error',
          message: 'Error verificando token',
          details: 'Token malformado'
        });
      }
    }

    // 4. Verificar ProfileService
    try {
      const profile = await profileService.getProfile();
      results.push({
        name: 'ProfileService',
        status: 'success',
        message: 'Perfil cargado correctamente',
        details: `Usuario: ${profile.name} (${profile.role})`
      });
    } catch (error: any) {
      results.push({
        name: 'ProfileService',
        status: 'error',
        message: 'Error cargando perfil',
        details: error.message
      });
    }

    // 5. Verificar API
    try {
      const response = await fetch('API_BASE_URL/health');
      results.push({
        name: 'API Backend',
        status: response.ok ? 'success' : 'error',
        message: response.ok ? 'Backend disponible' : 'Backend no disponible',
        details: response.ok ? 'Conexión exitosa' : `Status: ${response.status}`
      });
    } catch (error: any) {
      results.push({
        name: 'API Backend',
        status: 'error',
        message: 'Error conectando al backend',
        details: error.message
      });
    }

    setDiagnostics(results);
    setIsLoading(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Diagnóstico de Autenticación</h3>
        <button
          onClick={runDiagnostics}
          disabled={isLoading}
          className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Actualizar</span>
        </button>
      </div>

      <div className="space-y-3">
        {diagnostics.map((diagnostic, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border ${getStatusColor(diagnostic.status)}`}
          >
            <div className="flex items-start space-x-3">
              {getStatusIcon(diagnostic.status)}
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{diagnostic.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{diagnostic.message}</p>
                {diagnostic.details && (
                  <p className="text-xs text-gray-500 mt-1 font-mono">{diagnostic.details}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Acciones Recomendadas:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Si hay errores de token, hacer logout y login nuevamente</li>
          <li>• Si el backend no está disponible, verificar que esté ejecutándose</li>
          <li>• Si hay problemas de perfil, limpiar cache del navegador</li>
        </ul>
      </div>
    </div>
  );
};

export default AuthDiagnostic;
