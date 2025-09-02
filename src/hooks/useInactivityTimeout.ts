import { useEffect, useRef, useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface UseInactivityTimeoutOptions {
  timeoutMinutes?: number;
  warningMinutes?: number;
  onTimeout?: () => void;
}

export const useInactivityTimeout = (options: UseInactivityTimeoutOptions = {}) => {
  const { 
    timeoutMinutes = 30, 
    warningMinutes = 5, 
    onTimeout 
  } = options;
  
  const { logout } = useAuth();
  const location = useLocation();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Verificar si estamos en una ruta de verificación de email o google-callback
  const isEmailVerificationRoute = 
    location.pathname === '/verify-email' || 
    location.pathname === '/email-verification' ||
    location.pathname === '/google-callback/verify-email' ||
    location.pathname === '/google-callback/register-with-code';

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    setShowWarning(false);
    
    // Limpiar timers existentes
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current);
    }

    // Timer para mostrar advertencia
    const warningTime = (timeoutMinutes - warningMinutes) * 60 * 1000;
    warningRef.current = setTimeout(() => {
      setShowWarning(true);
      setTimeRemaining(warningMinutes * 60 * 1000);
    }, warningTime);

    // Timer para cerrar sesión
    timeoutRef.current = setTimeout(() => {
      console.log('Sesión cerrada por inactividad');
      logout();
      if (onTimeout) {
        onTimeout();
      }
    }, timeoutMinutes * 60 * 1000);
  }, [timeoutMinutes, warningMinutes, logout, onTimeout]);

  const handleActivity = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  const extendSession = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  const forceLogout = useCallback(() => {
    logout();
    if (onTimeout) {
      onTimeout();
    }
  }, [logout, onTimeout]);

  useEffect(() => {
    // No activar el timer de inactividad en rutas de verificación de email
    if (isEmailVerificationRoute) {
      return;
    }

    // Eventos que indican actividad del usuario
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
      'focus'
    ];

    // Agregar event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Iniciar el timer
    resetTimer();

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningRef.current) {
        clearTimeout(warningRef.current);
      }
    };
  }, [handleActivity, resetTimer, isEmailVerificationRoute]);

  return {
    showWarning,
    timeRemaining,
    extendSession,
    forceLogout,
    resetTimer,
    getTimeRemaining: () => {
      const timeElapsed = Date.now() - lastActivityRef.current;
      const timeRemaining = (timeoutMinutes * 60 * 1000) - timeElapsed;
      return Math.max(0, timeRemaining);
    }
  };
};
