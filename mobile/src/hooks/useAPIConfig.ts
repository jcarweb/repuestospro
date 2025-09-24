import { useEffect, useState } from 'react';
import { apiConfig } from '../config/api';
import { BackendEnvironment } from '../config/environments';

export const useAPIConfig = () => {
  const [currentEnvironment, setCurrentEnvironment] = useState<BackendEnvironment | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCurrentConfig();
  }, []);

  const loadCurrentConfig = async () => {
    try {
      setIsLoading(true);
      await apiConfig.reloadConfiguration();
      const environment = apiConfig.getCurrentEnvironment();
      
      // Verificar que el entorno sea válido
      if (environment && environment.name && environment.baseUrl) {
        setCurrentEnvironment(environment);
        console.log('🔧 useAPIConfig: Configuración cargada:', environment.name);
      } else {
        console.warn('useAPIConfig: Entorno inválido recibido:', environment);
        setCurrentEnvironment(null);
      }
    } catch (error) {
      console.error('Error loading API config:', error);
      setCurrentEnvironment(null);
    } finally {
      setIsLoading(false);
    }
  };

  const switchEnvironment = async (environmentId: string) => {
    try {
      setIsLoading(true);
      const newEnvironment = await apiConfig.switchEnvironment(environmentId);
      setCurrentEnvironment(newEnvironment);
      console.log('🔄 useAPIConfig: Entorno cambiado a:', newEnvironment.name);
      return newEnvironment;
    } catch (error) {
      console.error('Error switching environment:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const testCurrentEnvironment = async () => {
    try {
      return await apiConfig.testCurrentEnvironment();
    } catch (error) {
      console.error('Error testing environment:', error);
      return false;
    }
  };

  return {
    currentEnvironment,
    isLoading,
    loadCurrentConfig,
    switchEnvironment,
    testCurrentEnvironment,
    getBaseURL: () => apiConfig.getBaseURL(),
    getCurrentConfig: () => apiConfig.getCurrentConfig(),
  };
};
