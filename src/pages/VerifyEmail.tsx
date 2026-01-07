import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';
import { CheckCircle, XCircle, Mail, AlertCircle, ArrowLeft } from 'lucide-react';

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const hasVerified = useRef(false);

  const verifyToken = useCallback(async (token: string) => {
    // Evitar verificación múltiple
    if (hasVerified.current) {
      console.log('VerifyEmail - Token already verified, skipping');
      return;
    }

    console.log('VerifyEmail - Starting token verification for:', token);
    hasVerified.current = true;
    
    try {
      const response = await fetch(`process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "process.env.REACT_APP_BACKEND_URL || "process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"""/api/auth/verify-email/${token}`);
      console.log('VerifyEmail - Response status:', response.status);
      console.log('VerifyEmail - Response ok:', response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('VerifyEmail - Response data:', data);
        setStatus('success');
        setMessage('¡Tu email ha sido verificado exitosamente! Ya puedes usar todas las funciones del sistema.');
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.log('VerifyEmail - Error response:', errorData);
        setStatus('error');
        setMessage('Error al verificar el email. El enlace puede haber expirado o ser inválido.');
      }
    } catch (error) {
      console.error('VerifyEmail - Fetch error:', error);
      setStatus('error');
      setMessage('Error de conexión. Por favor, intenta nuevamente.');
    }
  }, []);

  useEffect(() => {
    const token = searchParams.get('token');
    const statusParam = searchParams.get('status');

    console.log('VerifyEmail - Token:', token);
    console.log('VerifyEmail - Status:', statusParam);
    console.log('VerifyEmail - All params:', Object.fromEntries(searchParams.entries()));

    if (statusParam === 'success') {
      console.log('VerifyEmail - Setting success status');
      setStatus('success');
      setMessage('¡Tu email ha sido verificado exitosamente! Ya puedes usar todas las funciones del sistema.');
    } else if (statusParam === 'error') {
      console.log('VerifyEmail - Setting error status');
      setStatus('error');
      setMessage('Error al verificar el email. El enlace puede haber expirado o ser inválido.');
    } else if (token && !hasVerified.current) {
      console.log('VerifyEmail - Verifying token:', token);
      // Si hay token pero no status, verificar el token
      verifyToken(token);
    } else if (!token) {
      console.log('VerifyEmail - No token found, showing help message');
      setStatus('error');
      setMessage('No se encontró un enlace de verificación válido. Por favor, revisa tu email y haz clic en el enlace de verificación.');
    }
  }, [searchParams, verifyToken]);

  const handleResendVerification = async () => {
    try {
      const response = await fetch('process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: searchParams.get('email') })
      });

      if (response.ok) {
        setMessage('Se ha enviado un nuevo email de verificación. Revisa tu bandeja de entrada.');
      } else {
        setMessage('Error al enviar el email de verificación. Intenta nuevamente.');
      }
    } catch (error) {
      setMessage('Error de conexión. Por favor, intenta nuevamente.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Verificación de Email
          </h2>
        </div>

        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {status === 'loading' && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Verificando tu email...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                ¡Verificación Exitosa!
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                {message}
              </p>
              <div className="mt-6">
                <button
                  onClick={() => navigate('/')}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Ir al Inicio
                </button>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Error de Verificación
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                {message}
              </p>
              <div className="mt-6 space-y-3">
                <button
                  onClick={handleResendVerification}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Reenviar Email de Verificación
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Ir al Inicio
                </button>
              </div>
            </div>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  ¿Necesitas ayuda?
                </span>
              </div>
            </div>
            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/')}
                className="flex items-center justify-center text-sm text-blue-600 hover:text-blue-500"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Volver al inicio
              </button>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Información Importante
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc pl-5 space-y-1">
                  <li>El enlace de verificación expira en 24 horas</li>
                  <li>Revisa tu carpeta de spam si no recibes el email</li>
                  <li>Puedes solicitar un nuevo email de verificación</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail; 