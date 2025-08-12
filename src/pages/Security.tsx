import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Lock, Key, Fingerprint, Mail, Bell, AlertTriangle } from 'lucide-react';

const Security: React.FC = () => {
  const { user } = useAuth();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showTwoFactor, setShowTwoFactor] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Seguridad</h1>
            <p className="text-gray-600">Gestiona la seguridad de tu cuenta</p>
          </div>

          {/* Security Options */}
          <div className="px-6 py-6">
            <div className="space-y-6">
              {/* Password */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Lock className="w-6 h-6 text-blue-600" />
                    <div>
                      <h3 className="font-medium text-gray-900">Contraseña</h3>
                      <p className="text-sm text-gray-600">Cambiar tu contraseña de acceso</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowChangePassword(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Cambiar
                  </button>
                </div>
              </div>

              {/* PIN */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Key className="w-6 h-6 text-purple-600" />
                    <div>
                      <h3 className="font-medium text-gray-900">PIN de Acceso</h3>
                      <p className="text-sm text-gray-600">Configura un PIN para acceso rápido</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {user?.pin ? 'Configurado' : 'No configurado'}
                    </span>
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                      {user?.pin ? 'Cambiar' : 'Configurar'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Two Factor Authentication */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-6 h-6 text-green-600" />
                    <div>
                      <h3 className="font-medium text-gray-900">Autenticación de Dos Factores</h3>
                      <p className="text-sm text-gray-600">Seguridad adicional para tu cuenta</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {user?.twoFactorEnabled ? 'Habilitado' : 'No habilitado'}
                    </span>
                    <button
                      onClick={() => setShowTwoFactor(true)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      {user?.twoFactorEnabled ? 'Configurar' : 'Habilitar'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Fingerprint */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Fingerprint className="w-6 h-6 text-orange-600" />
                    <div>
                      <h3 className="font-medium text-gray-900">Huella Digital</h3>
                      <p className="text-sm text-gray-600">Acceso biométrico (solo móviles)</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {user?.fingerprintEnabled ? 'Habilitado' : 'No habilitado'}
                    </span>
                    <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                      {user?.fingerprintEnabled ? 'Cambiar' : 'Configurar'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Email Notifications */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-6 h-6 text-blue-600" />
                    <div>
                      <h3 className="font-medium text-gray-900">Notificaciones por Email</h3>
                      <p className="text-sm text-gray-600">Recibe notificaciones importantes</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              {/* Security Alerts */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="w-6 h-6 text-yellow-600" />
                    <div>
                      <h3 className="font-medium text-gray-900">Alertas de Seguridad</h3>
                      <p className="text-sm text-gray-600">Notificaciones de actividad sospechosa</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Security; 