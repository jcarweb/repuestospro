import React, { useState, useEffect } from 'react';
import { Server, Wifi, WifiOff } from 'lucide-react';

interface ServerStatusProps {
  className?: string;
}

const ServerStatus: React.FC<ServerStatusProps> = ({ className = '' }) => {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkServerStatus = async () => {
    if (isChecking) return; // Evitar peticiones simultáneas
    
    setIsChecking(true);
    try {
      const response = await fetch('http://localhost:3001/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Timeout de 5 segundos
        signal: AbortSignal.timeout(5000)
      });
      setIsOnline(response.ok);
    } catch (error) {
      setIsOnline(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkServerStatus();
    
    // Verificar cada 60 segundos (menos frecuente)
    const interval = setInterval(checkServerStatus, 60000);
    
    return () => clearInterval(interval);
  }, []);

  if (isOnline === null && !isChecking) {
    return null; // No mostrar nada hasta la primera verificación
  }

  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      <Server className="w-4 h-4" />
      {isChecking ? (
        <span className="text-yellow-600">Verificando...</span>
      ) : isOnline ? (
        <>
          <Wifi className="w-4 h-4 text-green-600" />
          <span className="text-green-600">Backend Online</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4 text-red-600" />
          <span className="text-red-600">Backend Offline</span>
        </>
      )}
    </div>
  );
};

export default ServerStatus;
