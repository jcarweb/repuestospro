import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import VerifyEmail from '../pages/VerifyEmail';
import EmailVerification from '../pages/EmailVerification';
import CleanLayout from './CleanLayout';

interface EmailVerificationRouteProps {
  children?: React.ReactNode;
}

const EmailVerificationRoute: React.FC<EmailVerificationRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // Si hay un usuario autenticado, redirigir inmediatamente
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('Usuario autenticado detectado en ruta de verificación de email, redirigiendo...');
      
      // Redirigir según el rol del usuario
      if (user.role === 'admin') {
        window.location.href = '/admin/dashboard';
      } else if (user.role === 'store_manager') {
        window.location.href = '/store-manager/dashboard';
      } else if (user.role === 'delivery') {
        window.location.href = '/delivery/dashboard';
      } else {
        window.location.href = '/';
      }
    }
  }, [isAuthenticated, user]);

  // Si hay un usuario autenticado, no mostrar nada mientras se redirige
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFC300] mx-auto mb-4"></div>
          <p className="text-[#333333]">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario autenticado, mostrar la página de verificación correspondiente
  const pathname = location.pathname;
  
  if (pathname === '/verify-email' || pathname === '/google-callback/verify-email') {
    return (
      <CleanLayout>
        <VerifyEmail />
      </CleanLayout>
    );
  } else if (pathname === '/email-verification') {
    return (
      <CleanLayout>
        <EmailVerification />
      </CleanLayout>
    );
  }

  // Si no es una ruta de verificación conocida, redirigir al login
  return <Navigate to="/login" replace />;
};

export default EmailVerificationRoute;
