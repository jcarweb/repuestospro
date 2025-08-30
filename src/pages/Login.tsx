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