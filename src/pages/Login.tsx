import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import TwoFactorVerification from '../components/TwoFactorVerification';
import Test2FAModal from '../components/Test2FAModal';
import Debug2FAModal from '../components/Debug2FAModal';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [userData, setUserData] = useState<any>(null);
  const navigate = useNavigate();
  const { loginAsync, login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔐 Iniciando login...', { email });
      
      // Usar loginAsync del AuthContext
      await loginAsync(email, password);
      
      // Si llegamos aquí, el login fue exitoso sin 2FA
      console.log('✅ Login exitoso, navegando...');
      // Redirigir según el rol del usuario
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      if (userData.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (userData.role === 'store_manager') {
        navigate('/store-manager');
      } else if (userData.role === 'delivery') {
        navigate('/delivery/dashboard');
      } else {
        // Para clientes, navegar a una ruta específica del cliente
        navigate('/profile');
      }
      
    } catch (error: any) {
      console.error('❌ Error en handleSubmit:', error);
      
      // Verificar si es un error de 2FA requerido
      console.log('🔍 Verificando tipo de error:', error.message);
      console.log('🔍 Error completo:', error);
      
      if (error.message === '2FA_REQUIRED' && (error as any).requiresTwoFactor) {
        console.log('🔐 2FA requerido, mostrando modal...');
        console.log('📋 Datos del error:', {
          userData: (error as any).userData,
          tempToken: (error as any).tempToken ? 'existe' : 'no existe'
        });
        setError(''); // Limpiar cualquier error previo
        setUserData((error as any).userData);
        setTempToken((error as any).tempToken);
        setShowTwoFactor(true);
        console.log('🔍 Estado showTwoFactor establecido a true');
        setLoading(false);
        return;
      } else {
        console.log('❌ No es error de 2FA requerido');
        console.log('❌ Error message:', error.message);
        console.log('❌ requiresTwoFactor:', (error as any).requiresTwoFactor);
      }
      
      // Solo mostrar error si no es 2FA requerido
      if (error.message !== '2FA_REQUIRED') {
        setError(error.message || 'Error al iniciar sesión');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTwoFactorSuccess = (user: any, token: string) => {
    login(user, token);
    setShowTwoFactor(false);
    // Redirigir según el rol del usuario
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
  };

  const handleTwoFactorClose = () => {
    setShowTwoFactor(false);
    setTempToken('');
    setUserData(null);
  };

  console.log('🔍 Login render - Estado del modal:', { 
    showTwoFactor, 
    tempToken: tempToken ? 'existe' : 'no existe',
    userData: userData ? 'existe' : 'no existe'
  });
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src="/logo-piezasya-light.png"
            alt="PiezasYA Logo"
            className="h-20 w-auto"
          />
        </div>
        
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Iniciar Sesión
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Accede a tu cuenta de PiezasYA
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo electrónico
              </label>
              <div className="mt-1 relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="admin@piezasyaya.com"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="admin123"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  'Iniciar Sesión'
                )}
              </button>
            </div>

            {/* Botón de prueba para forzar modal */}
            <div>
              <button
                type="button"
                onClick={() => {
                  console.log('🧪 Botón de prueba clickeado');
                  setShowTwoFactor(true);
                  setTempToken('test-token');
                  setUserData({ email: 'test@test.com' });
                }}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                🧪 Probar Modal 2FA
              </button>
            </div>

            {/* Componente de debug */}
            <div className="mt-4">
              <Debug2FAModal />
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Credenciales de prueba</span>
              </div>
            </div>
            <div className="mt-4 text-center text-sm text-gray-600">
              <p>Email: admin@piezasyaya.com</p>
              <p>Password: admin123</p>
            </div>
          </div>

          {/* Separador para opciones alternativas */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">O continúa con</span>
              </div>
            </div>

            {/* Botones alternativos - Movidos hacia abajo */}
            <div className="mt-4 space-y-3">
              {/* Botón de Google */}
              <button
                type="button"
                className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Iniciar sesión con Google
              </button>

              {/* Botón de huella dactilar */}
              <button
                type="button"
                className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Iniciar sesión con huella dactilar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de prueba */}
      <Test2FAModal
        isOpen={showTwoFactor}
        onClose={handleTwoFactorClose}
      />

      {/* Modal de verificación 2FA */}
      <TwoFactorVerification
        isOpen={showTwoFactor}
        onClose={handleTwoFactorClose}
        onSuccess={handleTwoFactorSuccess}
        email={email}
        tempToken={tempToken}
      />
    </div>
  );
};

export default Login; 