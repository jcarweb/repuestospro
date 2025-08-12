import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Fingerprint, 
  Key, 
  Smartphone, 
  CheckCircle, 
  AlertCircle, 
  Settings,
  Lock,
  User,
  Mail,
  LogIn,
  Clock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import FingerprintSetup from '../components/FingerprintSetup';
import MobileFingerprintTest from '../components/MobileFingerprintTest';
import PinSetup from '../components/PinSetup';
import ActivityHistory from '../components/ActivityHistory';

const SecuritySettings: React.FC = () => {
  const { user, token, isAuthenticated, checkAuthStatus } = useAuth();
  const navigate = useNavigate();
  const [showFingerprintSetup, setShowFingerprintSetup] = useState(false);
  const [showMobileTest, setShowMobileTest] = useState(false);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [showActivityHistory, setShowActivityHistory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    // Verificar autenticación al cargar la página
    if (!isAuthenticated) {
      setMessage('Debes iniciar sesión para acceder a esta página');
      setMessageType('error');
    }
  }, [isAuthenticated]);

  const handleSetupFingerprint = () => {
    if (!isAuthenticated) {
      setMessage('Debes iniciar sesión para configurar la huella digital');
      setMessageType('error');
      return;
    }
    setShowFingerprintSetup(true);
  };

  const handleFingerprintSuccess = () => {
    setShowFingerprintSetup(false);
    setMessage('Huella digital configurada exitosamente');
    setMessageType('success');
  };

  const handleMobileTest = () => {
    setShowMobileTest(true);
  };

  const handleMobileTestSuccess = (fingerprintData: string) => {
    setShowMobileTest(false);
    setMessage('Prueba de huella digital completada');
    setMessageType('success');
  };

  const setupPin = () => {
    if (!isAuthenticated || !token) {
      setMessage('Debes iniciar sesión para configurar el PIN');
      setMessageType('error');
      return;
    }
    setShowPinSetup(true);
  };

  const handlePinSetupSuccess = () => {
    setShowPinSetup(false);
    setMessage('PIN configurado exitosamente');
    setMessageType('success');
  };

  const openActivityHistory = () => {
    if (!isAuthenticated || !token) {
      setMessage('Debes iniciar sesión para ver el historial');
      setMessageType('error');
      return;
    }
    setShowActivityHistory(true);
  };

  const handleLogin = () => {
    navigate('/');
  };

  // Si no está autenticado, mostrar mensaje de login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Acceso Requerido
            </h1>
            <p className="text-gray-600 mb-6">
              Debes iniciar sesión para acceder a la configuración de seguridad.
            </p>
            <button
              onClick={handleLogin}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Iniciar Sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center mb-8">
            <Shield className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">
              Configuración de Seguridad
            </h1>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-lg flex items-center ${
              messageType === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {messageType === 'success' ? (
                <CheckCircle className="w-5 h-5 mr-2" />
              ) : (
                <AlertCircle className="w-5 h-5 mr-2" />
              )}
              <span className="text-sm">{message}</span>
            </div>
          )}

          {/* Información del usuario */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              Información de la cuenta
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                <p className="text-gray-900">{user?.name || 'No disponible'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="text-gray-900 flex items-center">
                  <Mail className="w-4 h-4 mr-1" />
                  {user?.email || 'No disponible'}
                </p>
              </div>
            </div>
          </div>

          {/* Opciones de seguridad */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Métodos de Autenticación
            </h2>

            {/* Huella Digital */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Fingerprint className="w-8 h-8 text-blue-600 mr-4" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Huella Digital
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Configura tu huella digital para un acceso rápido y seguro
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleSetupFingerprint}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Configurar
                  </button>
                  <button
                    onClick={handleMobileTest}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Probar
                  </button>
                </div>
              </div>
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-yellow-800 text-sm">
                  <strong>Nota:</strong> Esta función solo funciona en dispositivos móviles con sensor de huella digital.
                </p>
              </div>
            </div>

            {/* PIN */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Key className="w-8 h-8 text-green-600 mr-4" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      PIN de Acceso
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Configura un PIN de 6 dígitos para acceso rápido
                    </p>
                  </div>
                </div>
                <button
                  onClick={setupPin}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Configurar PIN
                </button>
              </div>
            </div>

            {/* Contraseña */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Lock className="w-8 h-8 text-purple-600 mr-4" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Contraseña
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Tu contraseña principal está configurada
                    </p>
                  </div>
                </div>
                <span className="text-green-600 text-sm font-medium">
                  Configurada
                </span>
              </div>
            </div>

            {/* Google OAuth */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg className="w-8 h-8 mr-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Google OAuth
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Inicia sesión con tu cuenta de Google
                    </p>
                  </div>
                </div>
                <span className="text-green-600 text-sm font-medium">
                  Disponible
                </span>
              </div>
            </div>
          </div>

          {/* Historial de actividad */}
          <div className="mt-8 border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-blue-600" />
                Historial de Actividad
              </h3>
              <button
                onClick={openActivityHistory}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Clock className="w-4 h-4 mr-2" />
                Ver historial
              </button>
            </div>
            <p className="text-gray-600 text-sm">
              Revisa tu historial de inicios de sesión y actividades recientes.
            </p>
          </div>
        </div>
      </div>

      {/* Modales */}
      {showFingerprintSetup && (
        <FingerprintSetup
          isOpen={showFingerprintSetup}
          onClose={() => setShowFingerprintSetup(false)}
          onSuccess={handleFingerprintSuccess}
          userId={user?.id || ''}
          token={token || ''}
        />
      )}

      {showMobileTest && (
        <MobileFingerprintTest
          isOpen={showMobileTest}
          onClose={() => setShowMobileTest(false)}
          onSuccess={handleMobileTestSuccess}
        />
      )}

      {showPinSetup && (
        <PinSetup
          isOpen={showPinSetup}
          onClose={() => setShowPinSetup(false)}
          onSuccess={handlePinSetupSuccess}
          token={token || ''}
        />
      )}

      {showActivityHistory && (
        <ActivityHistory
          isOpen={showActivityHistory}
          onClose={() => setShowActivityHistory(false)}
          token={token || ''}
        />
      )}
    </div>
  );
};

export default SecuritySettings;