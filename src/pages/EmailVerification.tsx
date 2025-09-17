import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config/api';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  XCircle, 
  Mail, 
  AlertCircle, 
  ArrowLeft,
  RefreshCw
} from 'lucide-react';

const EmailVerification: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const statusParam = searchParams.get('status');
    
    if (!token) {
      setStatus('error');
      setMessage('Token de verificación no encontrado');
      return;
    }

    // Si ya tenemos un status del backend, usarlo
    if (statusParam === 'success') {
      setStatus('success');
      setMessage('¡Email verificado exitosamente! Ya puedes iniciar sesión.');
      return;
    }

    if (statusParam === 'error') {
      setStatus('error');
      setMessage('Error verificando email. El token puede ser inválido o haber expirado.');
      return;
    }

    // Si no hay status, verificar manualmente
    verifyEmail(token);
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch(`API_BASE_URL/auth/verify-email/${token}`, {
        method: 'GET'
      });

      const result = await response.json();

      if (result.success) {
        setStatus('success');
        setMessage('¡Email verificado exitosamente! Ya puedes iniciar sesión.');
      } else {
        setStatus('error');
        setMessage(result.message || 'Error verificando email');
      }
    } catch (error) {
      console.error('Error verificando email:', error);
      setStatus('error');
      setMessage('Error de conexión. Verifica que el servidor esté funcionando.');
    }
  };

  const handleResendVerification = async () => {
    setStatus('loading');
    setMessage('Reenviando email de verificación...');
    
    try {
      const response = await fetch('API_BASE_URL/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: searchParams.get('email') })
      });

      const result = await response.json();

      if (result.success) {
        setStatus('success');
        setMessage('Email de verificación reenviado exitosamente. Revisa tu bandeja de entrada.');
      } else {
        setStatus('error');
        setMessage(result.message || 'Error reenviando email');
      }
    } catch (error) {
      console.error('Error reenviando verificación:', error);
      setStatus('error');
      setMessage('Error de conexión. Verifica que el servidor esté funcionando.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            {status === 'loading' && (
              <div className="flex items-center justify-center mb-4">
                <RefreshCw className="w-12 h-12 text-blue-600 animate-spin" />
              </div>
            )}
            
            {status === 'success' && (
              <div className="flex items-center justify-center mb-4">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            )}
            
            {status === 'error' && (
              <div className="flex items-center justify-center mb-4">
                <XCircle className="w-12 h-12 text-red-600" />
              </div>
            )}

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {status === 'loading' && 'Verificando email...'}
              {status === 'success' && '¡Verificación exitosa!'}
              {status === 'error' && 'Error de verificación'}
            </h2>

            <p className="text-gray-600 mb-6">
              {message}
            </p>

            {status === 'success' && (
              <div className="space-y-4">
                <button
                  onClick={() => navigate('/')}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Ir al inicio
                </button>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-4">
                <button
                  onClick={handleResendVerification}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Reenviar email de verificación
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Volver al inicio
                </button>
              </div>
            )}

            <div className="mt-6">
              <button
                onClick={() => navigate('/')}
                className="flex items-center justify-center text-blue-600 hover:text-blue-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al inicio
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification; 