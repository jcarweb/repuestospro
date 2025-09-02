import React, { useState, useEffect } from 'react';
import { pushNotificationService } from '../services/pushNotificationService';

interface ServiceWorkerStatus {
  autoUpdateEnabled: boolean;
  cacheName: string;
  cacheVersion: string;
  timestamp: string;
}

const ServiceWorkerDiagnostic: React.FC = () => {
  const [status, setStatus] = useState<ServiceWorkerStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    checkServiceWorkerStatus();
  }, []);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const checkServiceWorkerStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      addLog('Verificando estado del Service Worker...');
      
      const swStatus = await pushNotificationService.getServiceWorkerStatus();
      if (swStatus) {
        setStatus(swStatus);
        addLog('Estado del Service Worker obtenido correctamente');
      } else {
        addLog('No se pudo obtener el estado del Service Worker');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMessage);
      addLog(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReinstall = async () => {
    try {
      setLoading(true);
      setError(null);
      
      addLog('Reinstalando Service Worker...');
      
      await pushNotificationService.reinstallServiceWorker();
      
      addLog('Service Worker reinstalado correctamente');
      
      // Verificar estado nuevamente
      setTimeout(() => {
        checkServiceWorkerStatus();
      }, 1000);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMessage);
      addLog(`Error reinstalando: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleForceUpdate = async () => {
    try {
      setLoading(true);
      setError(null);
      
      addLog('Forzando actualización del Service Worker...');
      
      await pushNotificationService.forceUpdate();
      
      addLog('Actualización forzada completada');
      
      // Verificar estado nuevamente
      setTimeout(() => {
        checkServiceWorkerStatus();
      }, 1000);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMessage);
      addLog(`Error forzando actualización: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClearCaches = async () => {
    try {
      setLoading(true);
      setError(null);
      
      addLog('Limpiando caches del Service Worker...');
      
      await pushNotificationService.clearServiceWorkerCaches();
      
      addLog('Caches limpiados correctamente');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMessage);
      addLog(`Error limpiando caches: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    addLog('Recargando página...');
    window.location.reload();
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Diagnóstico del Service Worker
      </h3>
      
      {/* Estado del Service Worker */}
      {status && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <h4 className="font-medium text-blue-900 mb-2">Estado Actual:</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p><strong>Actualizaciones automáticas:</strong> {status.autoUpdateEnabled ? 'HABILITADAS' : 'DESHABILITADAS'}</p>
            <p><strong>Cache:</strong> {status.cacheName} (v{status.cacheVersion})</p>
            <p><strong>Última verificación:</strong> {new Date(status.timestamp).toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Mensaje de error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Botones de acción */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={checkServiceWorkerStatus}
          disabled={loading}
          className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Verificando...' : 'Verificar Estado'}
        </button>
        
        <button
          onClick={handleReinstall}
          disabled={loading}
          className="px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? 'Reinstalando...' : 'Reinstalar SW'}
        </button>
        
        <button
          onClick={handleForceUpdate}
          disabled={loading}
          className="px-3 py-2 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
        >
          {loading ? 'Actualizando...' : 'Forzar Actualización'}
        </button>
        
        <button
          onClick={handleClearCaches}
          disabled={loading}
          className="px-3 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? 'Limpiando...' : 'Limpiar Caches'}
        </button>
        
        <button
          onClick={handleRefresh}
          className="px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700"
        >
          Recargar Página
        </button>
        
        <button
          onClick={handleClearLogs}
          className="px-3 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Limpiar Logs
        </button>
      </div>

      {/* Logs de actividad */}
      <div className="border border-gray-200 rounded-md">
        <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
          <h4 className="font-medium text-gray-900">Logs de Actividad</h4>
        </div>
        <div className="p-3 max-h-40 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-gray-500 text-sm">No hay logs disponibles</p>
          ) : (
            <div className="space-y-1">
              {logs.map((log, index) => (
                <div key={index} className="text-xs font-mono text-gray-700 bg-gray-50 p-1 rounded">
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Información adicional */}
      <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
        <h4 className="font-medium text-gray-900 mb-2">Información de Ayuda:</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p>• <strong>Reinstalar SW:</strong> Elimina y vuelve a instalar completamente el Service Worker</p>
          <p>• <strong>Forzar Actualización:</strong> Intenta actualizar el Service Worker manualmente</p>
          <p>• <strong>Limpiar Caches:</strong> Elimina todos los caches del Service Worker</p>
          <p>• <strong>Recargar Página:</strong> Recarga la página para aplicar cambios</p>
        </div>
      </div>
    </div>
  );
};

export default ServiceWorkerDiagnostic;
