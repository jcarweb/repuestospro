import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Mail, Lock, User, Phone, Key, AlertCircle, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';
import { useLocation } from '../hooks/useLocation';
import LocationPermissionModal from './LocationPermissionModal';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot-password' | 'pin-login'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationGranted, setLocationGranted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    pin: '',
    phone: ''
  });
  
  const { loginAsync, user } = useAuth();
  const { location } = useLocation();
  
  // Google Analytics hook
  const { trackUserRegistration } = useGoogleAnalytics();

  // Verificar ubicación al abrir el modal
  useEffect(() => {
    if (isOpen && !locationGranted && !location) {
      setShowLocationModal(true);
    }
  }, [isOpen, locationGranted, location]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLocationGranted = () => {
    setLocationGranted(true);
    setShowLocationModal(false);
  };

  const handleLocationDenied = () => {
    setError('El acceso a ubicación es obligatorio para usar la aplicación');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verificar que se tenga ubicación antes de proceder
    if (!location && !locationGranted) {
      setShowLocationModal(true);
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (mode === 'login') {
        await loginAsync(formData.email, formData.password);
        onClose();
      } else if (mode === 'register') {
        const response = await fetch('http://localhost:5000/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            phone: formData.phone,
            location: location ? {
              latitude: location.latitude,
              longitude: location.longitude
            } : null
          })
        });

        const result = await response.json();

        if (result.success) {
          // Track user registration in Google Analytics
          if (result.data && result.data.user) {
            trackUserRegistration(result.data.user._id || result.data.user.id, 'user');
          }
          setError('Registro exitoso. Por favor verifica tu email.');
          setMode('login');
        } else {
          setError(result.message || 'Error en el registro');
        }
      } else if (mode === 'pin-login') {
        const response = await fetch('http://localhost:5000/api/auth/login/pin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: formData.email,
            pin: formData.pin
          })
        });

        const result = await response.json();

        if (result.success) {
          // Usar el login del contexto
          const { login } = useAuth();
          login(result.data.user, result.data.token);
          onClose();
        } else {
          setError(result.message || 'Error en la autenticación');
        }
      } else if (mode === 'forgot-password') {
        const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: formData.email
          })
        });

        const result = await response.json();

        if (result.success) {
          setError('Se ha enviado un enlace de recuperación a tu email.');
        } else {
          setError(result.message || 'Error al enviar el enlace');
        }
      }
    } catch (error: any) {
      setError(error.message || 'Error de conexión. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      pin: '',
      phone: ''
    });
    setError('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowPin(false);
  };

  const handleModeChange = (newMode: typeof mode) => {
    setMode(newMode);
    resetForm();
  };

  const handleGoogleLogin = () => {
    // Verificar ubicación antes de redirigir
    if (!location && !locationGranted) {
      setShowLocationModal(true);
      return;
    }
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  const handleFingerprintLogin = async () => {
    // Verificar ubicación antes de proceder
    if (!location && !locationGranted) {
      setShowLocationModal(true);
      return;
    }

    try {
      // Verificar si el navegador soporta WebAuthn
      if (!window.PublicKeyCredential) {
        setError('Tu navegador no soporta autenticación biométrica');
        return;
      }

      // Verificar si el dispositivo tiene autenticación biométrica
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      if (!available) {
        setError('Tu dispositivo no tiene autenticación biométrica disponible');
        return;
      }

      // Obtener credenciales almacenadas
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array(32),
          rpId: window.location.hostname,
          userVerification: 'required'
        }
      });

      if (credential) {
        // Enviar al servidor para verificar
        const response = await fetch('http://localhost:5000/api/auth/login/fingerprint', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            credentialId: Array.from(new Uint8Array(credential.rawId)),
            clientDataJSON: Array.from(new Uint8Array(credential.response.clientDataJSON)),
            authenticatorData: Array.from(new Uint8Array((credential.response as any).authenticatorData)),
            signature: Array.from(new Uint8Array((credential.response as any).signature))
          })
        });

        const result = await response.json();

        if (result.success) {
          const { login } = useAuth();
          login(result.data.user, result.data.token);
          onClose();
        } else {
          setError(result.message || 'Error en la autenticación biométrica');
        }
      }
    } catch (error: any) {
      if (error.name === 'NotAllowedError') {
        setError('Autenticación cancelada por el usuario');
      } else {
        setError('Error en la autenticación biométrica');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {mode === 'login' && 'Iniciar Sesión'}
              {mode === 'register' && 'Registrarse'}
              {mode === 'forgot-password' && 'Recuperar Contraseña'}
              {mode === 'pin-login' && 'Iniciar con PIN'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center mb-2">
                <AlertCircle className="text-red-500 mr-2" size={20} />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Botones de autenticación alternativa - solo en modo login */}
          {mode === 'login' && (
            <div className="mb-6 space-y-3">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Iniciar sesión con Google
              </button>
              
              <button
                type="button"
                onClick={handleFingerprintLogin}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Iniciar sesión con huella dactilar
              </button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">O continúa con</span>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tu nombre completo"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="tu@email.com"
                  required
                />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+1234567890"
                  />
                </div>
              </div>
            )}

            {(mode === 'login' || mode === 'register') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'pin-login' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PIN
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type={showPin ? 'text' : 'password'}
                    name="pin"
                    value={formData.pin}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••"
                    maxLength={6}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPin ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Procesando...' : (
                mode === 'login' ? 'Iniciar Sesión' :
                mode === 'register' ? 'Registrarse' :
                mode === 'forgot-password' ? 'Enviar enlace' :
                'Iniciar con PIN'
              )}
            </button>
          </form>

          {/* Enlaces de navegación */}
          <div className="mt-6 text-center space-y-2">
            {mode === 'login' && (
              <>
                <button
                  onClick={() => handleModeChange('pin-login')}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  Iniciar sesión con PIN
                </button>
                <div className="text-sm text-gray-600">
                  ¿No tienes cuenta?{' '}
                  <button
                    onClick={() => handleModeChange('register')}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Regístrate aquí
                  </button>
                </div>
                <button
                  onClick={() => handleModeChange('forgot-password')}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </>
            )}

            {mode === 'register' && (
              <div className="text-sm text-gray-600">
                ¿Ya tienes cuenta?{' '}
                <button
                  onClick={() => handleModeChange('login')}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Inicia sesión aquí
                </button>
              </div>
            )}

            {mode === 'forgot-password' && (
              <div className="text-sm text-gray-600">
                <button
                  onClick={() => handleModeChange('login')}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Volver al inicio de sesión
                </button>
              </div>
            )}

            {mode === 'pin-login' && (
              <div className="text-sm text-gray-600">
                <button
                  onClick={() => handleModeChange('login')}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Volver al inicio de sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de verificación de ubicación */}
      <LocationPermissionModal
        isOpen={showLocationModal}
        onLocationGranted={handleLocationGranted}
        onLocationDenied={handleLocationDenied}
      />
    </>
  );
};

export default AuthModal;