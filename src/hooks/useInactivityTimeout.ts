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
    timeoutMinutes = 60, // Aumentado por defecto
    warningMinutes = 10, // Aumentado por defecto
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

    // Iniciar el timer con un pequeño delay para evitar logout inmediato después del login
    const initialDelay = setTimeout(() => {
      resetTimer();
    }, 2000); // 2 segundos de delay inicial

    // Cleanup
    return () => {
      clearTimeout(initialDelay);
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

  // Reiniciar timer cuando cambia la ruta (navegación)
  useEffect(() => {
    if (!isEmailVerificationRoute) {
      // Pequeño delay para permitir que la página se cargue completamente
      const routeChangeDelay = setTimeout(() => {
        resetTimer();
      }, 1000);
      
      return () => clearTimeout(routeChangeDelay);
    }
  }, [location.pathname, resetTimer, isEmailVerificationRoute]);

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
