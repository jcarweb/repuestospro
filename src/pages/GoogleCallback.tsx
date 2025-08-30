import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

const GoogleCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const userParam = searchParams.get('user');
    const error = searchParams.get('error');

    if (error) {
      setStatus('error');
      setMessage('Error en la autenticación con Google');
      setTimeout(() => navigate('/'), 3000);
      return;
    }

    if (token && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam));
        
        // Guardar en localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Actualizar contexto
        login(user, token);
        
        setStatus('success');
        setMessage('¡Autenticación exitosa! Redirigiendo...');
        
        // Redirigir según el rol del usuario
        setTimeout(() => {
          if (user.role === 'admin') {
            navigate('/admin/dashboard');
          } else if (user.role === 'store_manager') {
            navigate('/store-manager');
          } else if (user.role === 'delivery') {
            navigate('/delivery/dashboard');
          } else {
            // Para clientes, navegar a una ruta específica del cliente
            navigate('/profile');
          }
        }, 2000);
      } catch (error) {
        setStatus('error');
        setMessage('Error procesando la autenticación');
        setTimeout(() => navigate('/'), 3000);
      }
    } else {
      setStatus('error');
      setMessage('Datos de autenticación incompletos');
      setTimeout(() => navigate('/'), 3000);
    }
  }, [searchParams, navigate, login]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {status === 'loading' && (
          <>
            <Loader className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Procesando autenticación...
            </h2>
            <p className="text-gray-600">
              Estamos verificando tus credenciales de Google
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Autenticación exitosa!
            </h2>
            <p className="text-gray-600 mb-4">
              {message}
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 text-sm">
                Has sido autenticado correctamente con Google
              </p>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Error en la autenticación
            </h2>
            <p className="text-gray-600 mb-4">
              {message}
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">
                No se pudo completar la autenticación con Google
              </p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Volver al inicio
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default GoogleCallback;