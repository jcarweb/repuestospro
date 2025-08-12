import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  CheckCircle,
  AlertCircle,
  Clock,
  UserPlus,
  Mail,
  Shield,
  Truck,
  Store,
  Users,
  ArrowRight,
  XCircle
} from 'lucide-react';

interface CodeData {
  email: string;
  role: 'admin' | 'store_manager' | 'delivery';
  expiresAt: string;
  status: string;
}

const RegisterWithCode: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [code, setCode] = useState('');
  const [codeData, setCodeData] = useState<CodeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });

  useEffect(() => {
    const codeParam = searchParams.get('code');
    if (codeParam) {
      setCode(codeParam);
      verifyCode(codeParam);
    }
  }, [searchParams]);

  const verifyCode = async (codeToVerify: string) => {
    setVerifying(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:5000/api/registration-codes/verify/${codeToVerify}`);
      const result = await response.json();

      if (result.success) {
        setCodeData(result.data);
        setFormData(prev => ({ ...prev, email: result.data.email }));
      } else {
        setError(result.message || 'Código inválido o expirado');
      }
    } catch (error) {
      setError('Error verificando código');
    } finally {
      setVerifying(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code.trim()) {
      setError('Por favor ingresa un código de registro');
      return;
    }

    await verifyCode(code);
  };

  const handleStartRegistration = async () => {
    if (!codeData) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/registration-codes/start-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code })
      });

      const result = await response.json();
      if (result.success) {
        setCodeData(result.data);
      } else {
        setError(result.message || 'Error iniciando registro');
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegistering(true);
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setRegistering(false);
      return;
    }

    try {
      // Registrar usuario
      const registerResponse = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          role: codeData?.role || 'user'
        })
      });

      const registerResult = await registerResponse.json();

      if (registerResult.success) {
        // Completar registro con código
        const completeResponse = await fetch('http://localhost:5000/api/registration-codes/complete-registration', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${registerResult.data.token}`
          },
          body: JSON.stringify({ code })
        });

        const completeResult = await completeResponse.json();

        if (completeResult.success) {
          // Login automático
          login(registerResult.data.user, registerResult.data.token);
          navigate('/');
        } else {
          setError(completeResult.message || 'Error completando registro');
        }
      } else {
        setError(registerResult.message || 'Error registrando usuario');
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setRegistering(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-6 h-6 text-red-600" />;
      case 'store_manager':
        return <Store className="w-6 h-6 text-blue-600" />;
      case 'delivery':
        return <Truck className="w-6 h-6 text-purple-600" />;
      default:
        return <Users className="w-6 h-6 text-gray-600" />;
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'store_manager':
        return 'Gestor de Tienda';
      case 'delivery':
        return 'Delivery';
      default:
        return 'Usuario';
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Acceso completo al sistema de administración';
      case 'store_manager':
        return 'Gestión de inventario y ventas de la tienda';
      case 'delivery':
        return 'Gestión de entregas y logística';
      default:
        return 'Acceso básico al sistema';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center py-12">
      <div className="max-w-md w-full mx-auto px-4">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <UserPlus className="w-12 h-12 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Registro con Código
            </h1>
            <p className="text-gray-600">
              Completa tu registro usando el código proporcionado
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <span className="text-red-800">{error}</span>
              </div>
            </div>
          )}

          {/* Step 1: Verify Code */}
          {!codeData && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código de Registro
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="Ingresa el código"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleVerifyCode}
                    disabled={verifying || !code.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {verifying ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      'Verificar'
                    )}
                  </button>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  ¿No tienes un código? Contacta con la administración.
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Code Verified */}
          {codeData && (
            <div className="space-y-6">
              {/* Code Info */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="font-medium text-green-800">Código Válido</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-700">{codeData.email}</span>
                  </div>
                  <div className="flex items-center">
                    {getRoleIcon(codeData.role)}
                    <span className="text-gray-700 ml-2">{getRoleName(codeData.role)}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-700">
                      Expira: {new Date(codeData.expiresAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  {getRoleDescription(codeData.role)}
                </p>
              </div>

              {/* Registration Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    El email no se puede cambiar
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar Contraseña
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    minLength={6}
                  />
                </div>

                <button
                  type="submit"
                  disabled={registering}
                  className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {registering ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Registrando...
                    </>
                  ) : (
                    <>
                      Completar Registro
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </button>
              </form>

              <div className="text-center">
                <button
                  onClick={() => {
                    setCodeData(null);
                    setCode('');
                    setFormData({ name: '', email: '', password: '', confirmPassword: '', phone: '' });
                  }}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Usar otro código
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterWithCode; 