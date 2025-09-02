import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { NetworkConfig, getNetworkConfig, rescanNetwork } from '../utils/networkUtils';
import { apiService } from '../services/apiService';

// Interfaz para el contexto de red
interface NetworkContextType {
  // Estado de la red
  networkConfig: NetworkConfig | null;
  isScanning: boolean;
  isConnected: boolean;
  lastError: string | null;
  
  // Acciones
  rescanNetwork: () => Promise<void>;
  checkConnection: () => Promise<boolean>;
  clearError: () => void;
  
  // Información de la red
  networkName: string;
  baseUrl: string;
  connectionStatus: 'connected' | 'disconnected' | 'scanning' | 'error';
}

// Contexto por defecto
const defaultContext: NetworkContextType = {
  networkConfig: null,
  isScanning: false,
  isConnected: false,
  lastError: null,
  rescanNetwork: async () => {},
  checkConnection: async () => false,
  clearError: () => {},
  networkName: 'Desconocida',
  baseUrl: 'http://localhost:5000/api',
  connectionStatus: 'disconnected',
};

// Crear el contexto
const NetworkContext = createContext<NetworkContextType>(defaultContext);

// Hook personalizado para usar el contexto
export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};

// Props del provider
interface NetworkProviderProps {
  children: ReactNode;
  autoScan?: boolean;
  scanInterval?: number; // en milisegundos
}

// Provider del contexto
export const NetworkProvider: React.FC<NetworkProviderProps> = ({
  children,
  autoScan = true,
  scanInterval = 30000, // 30 segundos por defecto
}) => {
  // Estado local
  const [networkConfig, setNetworkConfig] = useState<NetworkConfig | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'scanning' | 'error'>('disconnected');

  // Inicializar la configuración de red
  useEffect(() => {
    initializeNetwork();
  }, []);

  // Configurar escaneo automático
  useEffect(() => {
    if (!autoScan) return;

    const interval = setInterval(() => {
      checkConnection();
    }, scanInterval);

    return () => clearInterval(interval);
  }, [autoScan, scanInterval]);

  // Inicializar la red
  const initializeNetwork = async () => {
    try {
      setIsScanning(true);
      setConnectionStatus('scanning');
      
      const config = await getNetworkConfig();
      setNetworkConfig(config);
      setIsConnected(config.isWorking);
      setConnectionStatus(config.isWorking ? 'connected' : 'disconnected');
      
      // Inicializar el servicio de API
      await apiService.initialize();
      
    } catch (error) {
      console.error('Error initializing network:', error);
      setLastError(error instanceof Error ? error.message : 'Error desconocido');
      setConnectionStatus('error');
      setIsConnected(false);
    } finally {
      setIsScanning(false);
    }
  };

  // Verificar conexión
  const checkConnection = async (): Promise<boolean> => {
    try {
      const isWorking = await apiService.checkStatus();
      setIsConnected(isWorking);
      setConnectionStatus(isWorking ? 'connected' : 'disconnected');
      
      if (isWorking && networkConfig) {
        setNetworkConfig({ ...networkConfig, isWorking: true });
      }
      
      return isWorking;
    } catch (error) {
      console.error('Error checking connection:', error);
      setIsConnected(false);
      setConnectionStatus('error');
      setLastError(error instanceof Error ? error.message : 'Error de conexión');
      return false;
    }
  };

  // Rescanear la red
  const rescanNetworkHandler = async () => {
    try {
      setIsScanning(true);
      setConnectionStatus('scanning');
      setLastError(null);
      
      const newConfig = await rescanNetwork();
      setNetworkConfig(newConfig);
      setIsConnected(newConfig.isWorking);
      setConnectionStatus(newConfig.isWorking ? 'connected' : 'disconnected');
      
      // Actualizar el servicio de API
      await apiService.initialize();
      
    } catch (error) {
      console.error('Error rescanning network:', error);
      setLastError(error instanceof Error ? error.message : 'Error de escaneo');
      setConnectionStatus('error');
      setIsConnected(false);
    } finally {
      setIsScanning(false);
    }
  };

  // Limpiar error
  const clearError = () => {
    setLastError(null);
    if (isConnected) {
      setConnectionStatus('connected');
    } else {
      setConnectionStatus('disconnected');
    }
  };

  // Valores del contexto
  const contextValue: NetworkContextType = {
    networkConfig,
    isScanning,
    isConnected,
    lastError,
    rescanNetwork: rescanNetworkHandler,
    checkConnection,
    clearError,
    networkName: networkConfig?.networkName || 'Desconocida',
    baseUrl: networkConfig?.baseUrl || 'http://localhost:5000/api',
    connectionStatus,
  };

  return (
    <NetworkContext.Provider value={contextValue}>
      {children}
    </NetworkContext.Provider>
  );
};

export default NetworkContext;
