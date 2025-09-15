import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useActiveStore } from '../contexts/ActiveStoreContext';
import { Clock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

const ContextInitializationTest: React.FC = () => {
  const { user, token } = useAuth();
  const { userStores, loading, refreshStores } = useActiveStore();
  const [initializationSteps, setInitializationSteps] = useState<string[]>([]);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [currentStep, setCurrentStep] = useState<string>('');

  useEffect(() => {
    if (user?.role === 'store_manager') {
      setStartTime(new Date());
      setCurrentStep('Iniciando verificación...');
      
      const steps: string[] = [];
      
      // Paso 1: Verificar autenticación
      if (token) {
        steps.push('✅ Token presente');
        setCurrentStep('Token verificado');
      } else {
        steps.push('❌ Token ausente');
        setCurrentStep('Error: Token ausente');
        setInitializationSteps(steps);
        return;
      }

      // Paso 2: Verificar rol de usuario
      if (user.role === 'store_manager') {
        steps.push('✅ Rol store_manager verificado');
        setCurrentStep('Rol verificado');
      } else {
        steps.push(`❌ Rol incorrecto: ${user.role}`);
        setCurrentStep('Error: Rol incorrecto');
        setInitializationSteps(steps);
        return;
      }

      // Paso 3: Verificar estado de carga
      if (loading) {
        steps.push('🔄 Contexto cargando...');
        setCurrentStep('Contexto en carga');
      } else {
        steps.push('✅ Contexto no está cargando');
        setCurrentStep('Contexto listo');
      }

      // Paso 4: Verificar tiendas
      if (userStores.length > 0) {
        steps.push(`✅ ${userStores.length} tienda(s) encontrada(s)`);
        setCurrentStep('Tiendas cargadas');
      } else {
        steps.push('❌ No se encontraron tiendas');
        setCurrentStep('Sin tiendas');
      }

      setInitializationSteps(steps);
    }
  }, [user, token, loading, userStores.length]);

  const getInitializationStatus = () => {
    if (!user || user.role !== 'store_manager') return 'not_applicable';
    if (loading) return 'loading';
    if (userStores.length > 0) return 'success';
    return 'error';
  };

  const getStatusIcon = () => {
    const status = getInitializationStatus();
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'loading':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <RefreshCw className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    const status = getInitializationStatus();
    switch (status) {
      case 'success':
        return '✅ Inicialización exitosa';
      case 'loading':
        return '🔄 Inicializando...';
      case 'error':
        return '❌ Error en inicialización';
      default:
        return '⏳ No aplicable';
    }
  };

  const handleForceRefresh = async () => {
    setCurrentStep('Forzando refresh...');
    await refreshStores();
    setCurrentStep('Refresh completado');
  };

  const getElapsedTime = () => {
    if (!startTime) return null;
    const elapsed = Date.now() - startTime.getTime();
    return `${(elapsed / 1000).toFixed(1)}s`;
  };

  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-indigo-800">Test de Inicialización</h3>
          {getStatusIcon()}
        </div>
        <div className="flex items-center space-x-2">
          {getElapsedTime() && (
            <span className="text-sm text-indigo-600">
              Tiempo: {getElapsedTime()}
            </span>
          )}
          <button
            onClick={handleForceRefresh}
            disabled={loading}
            className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Cargando...' : 'Force Refresh'}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-sm">
          <strong>Estado actual:</strong> {getStatusText()}
        </div>
        
        {currentStep && (
          <div className="text-sm">
            <strong>Paso actual:</strong> {currentStep}
          </div>
        )}

        <div className="space-y-2">
          <strong className="text-sm text-indigo-800">Pasos de inicialización:</strong>
          <div className="space-y-1">
            {initializationSteps.map((step, index) => (
              <div key={index} className="text-sm flex items-center space-x-2">
                <span className="text-indigo-600">•</span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>

        {getInitializationStatus() === 'error' && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
            <h4 className="font-semibold text-red-800 mb-2">🔍 Diagnóstico del Problema:</h4>
            <div className="text-sm text-red-700 space-y-1">
              <p>• El contexto no está cargando tiendas correctamente</p>
              <p>• Posibles causas:</p>
              <ul className="ml-4 space-y-1">
                <li>• Problema de timing en la inicialización</li>
                <li>• Error en la llamada a la API</li>
                <li>• Problema de autenticación</li>
                <li>• El usuario realmente no tiene tiendas asignadas</li>
              </ul>
              <p className="mt-2 font-medium">Sugerencia: Usa el botón "Force Refresh" para intentar recargar.</p>
            </div>
          </div>
        )}

        {getInitializationStatus() === 'loading' && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <h4 className="font-semibold text-yellow-800 mb-2">⏳ Inicialización en Progreso:</h4>
            <div className="text-sm text-yellow-700">
              <p>• El contexto está cargando las tiendas</p>
              <p>• Esto puede tomar unos segundos</p>
              <p>• Si tarda más de 10 segundos, puede haber un problema</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContextInitializationTest;
