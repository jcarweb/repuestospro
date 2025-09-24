import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { offlineService } from '../services/offlineService';

interface ConnectionStatus {
  isConnected: boolean;
  isOnline: boolean;
  connectionType: string | null;
  isReconnecting: boolean;
  lastConnected: number | null;
}

export const useConnectionStatus = () => {
  const [status, setStatus] = useState<ConnectionStatus>({
    isConnected: true,
    isOnline: true,
    connectionType: null,
    isReconnecting: false,
    lastConnected: Date.now(),
  });

  useEffect(() => {
    let reconnectTimeout: NodeJS.Timeout;

    const unsubscribe = NetInfo.addEventListener(state => {
      const isConnected = state.isConnected ?? false;
      const connectionType = state.type;
      
      setStatus(prevStatus => {
        const wasConnected = prevStatus.isConnected;
        const isReconnecting = !wasConnected && isConnected;

        // Si se perdió la conexión, marcar como reconectando
        if (wasConnected && !isConnected) {
          console.log('📱 Conexión perdida');
        }

        // Si se restauró la conexión, marcar como reconectando temporalmente
        if (!wasConnected && isConnected) {
          console.log('🌐 Conexión restaurada');
          
          // Limpiar el estado de reconexión después de 3 segundos
          if (reconnectTimeout) {
            clearTimeout(reconnectTimeout);
          }
          reconnectTimeout = setTimeout(() => {
            setStatus(prev => ({ ...prev, isReconnecting: false }));
          }, 3000);
        }

        return {
          isConnected,
          isOnline: isConnected,
          connectionType,
          isReconnecting,
          lastConnected: isConnected ? Date.now() : prevStatus.lastConnected,
        };
      });
    });

    return () => {
      unsubscribe();
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, []);

  return status;
};

// Hook para mostrar notificaciones de conexión
export const useConnectionNotifications = () => {
  const { isConnected, isReconnecting } = useConnectionStatus();
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  useEffect(() => {
    if (!isConnected) {
      setNotificationMessage('Sin conexión a internet');
      setShowNotification(true);
    } else if (isReconnecting) {
      setNotificationMessage('Conexión restaurada');
      setShowNotification(true);
      
      // Ocultar notificación después de 3 segundos
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    } else {
      setShowNotification(false);
    }
  }, [isConnected, isReconnecting]);

  return {
    showNotification,
    notificationMessage,
    hideNotification: () => setShowNotification(false),
  };
};

export default useConnectionStatus;
