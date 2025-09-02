import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useInactivityTimeout } from '../hooks/useInactivityTimeout';
import InactivityWarning from './InactivityWarning';
import SessionTimeoutNotification from './SessionTimeoutNotification';
import InactivitySettings from './InactivitySettings';

interface InactivityProviderProps {
  children: React.ReactNode;
  timeoutMinutes?: number;
  warningMinutes?: number;
}

const InactivityProvider: React.FC<InactivityProviderProps> = ({ 
  children, 
  timeoutMinutes = 30,
  warningMinutes = 5 
}) => {
  const [showNotification, setShowNotification] = useState(false);
  const [currentTimeoutMinutes, setCurrentTimeoutMinutes] = useState(timeoutMinutes);
  const [currentWarningMinutes, setCurrentWarningMinutes] = useState(warningMinutes);
  const location = useLocation();
  
  // Verificar si estamos en una ruta de verificación de email o google-callback
  const isEmailVerificationRoute = 
    location.pathname === '/verify-email' || 
    location.pathname === '/email-verification' ||
    location.pathname === '/google-callback/verify-email' ||
    location.pathname === '/google-callback/register-with-code';
  
  const {
    showWarning,
    timeRemaining,
    extendSession,
    forceLogout,
    resetTimer
  } = useInactivityTimeout({
    timeoutMinutes: currentTimeoutMinutes,
    warningMinutes: currentWarningMinutes,
    onTimeout: () => {
      console.log('Sesión cerrada por inactividad');
      setShowNotification(true);
    }
  });

  const handleLogout = () => {
    forceLogout();
    setShowNotification(true);
  };

  const handleSettingsChange = (newTimeoutMinutes: number, newWarningMinutes: number) => {
    setCurrentTimeoutMinutes(newTimeoutMinutes);
    setCurrentWarningMinutes(newWarningMinutes);
    resetTimer(); // Reiniciar el timer con las nuevas configuraciones
  };

  return (
    <>
      {children}
      {/* Solo mostrar elementos de inactividad si NO estamos en rutas de verificación de email */}
      {!isEmailVerificationRoute && (
        <>
          <InactivityWarning
            isVisible={showWarning}
            timeRemaining={timeRemaining}
            onExtend={extendSession}
            onLogout={handleLogout}
          />
          <SessionTimeoutNotification
            isVisible={showNotification}
            onClose={() => setShowNotification(false)}
          />
          {/* Configuración de inactividad - Posicionamiento mejorado */}
          <div className="fixed bottom-6 right-6 z-50">
            <InactivitySettings
              onSettingsChange={handleSettingsChange}
              currentTimeoutMinutes={currentTimeoutMinutes}
              currentWarningMinutes={currentWarningMinutes}
            />
          </div>
        </>
      )}
    </>
  );
};

export default InactivityProvider;
