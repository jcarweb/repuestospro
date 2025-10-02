import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  Star,
  Settings,
  Shield,
  Bell,
  Globe,
  Camera,
  Edit,
  Save,
  X,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  RefreshCcw,
  Upload,
  Download,
  Trash2,
} from 'lucide-react';

interface SellerProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  address?: string;
  birthDate?: string;
  hireDate: string;
  position: string;
  department: string;
  store: {
    _id: string;
    name: string;
    address: string;
    phone: string;
  };
  permissions: {
    catalogAccess: boolean;
    manualDeliveryAssignment: boolean;
    chatAccess: boolean;
    orderManagement: boolean;
    inventoryView: boolean;
  };
  performance: {
    totalQuotes: number;
    acceptedQuotes: number;
    conversionRate: number;
    customerSatisfaction: number;
    totalRevenue: number;
  };
  preferences: {
    language: string;
    timezone: string;
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    theme: 'light' | 'dark' | 'auto';
  };
  security: {
    twoFactorEnabled: boolean;
    lastPasswordChange: string;
    lastLogin: string;
    loginAttempts: number;
  };
}

interface NotificationSettings {
  newQuotes: boolean;
  quoteAccepted: boolean;
  quoteRejected: boolean;
  newMessages: boolean;
  lowStock: boolean;
  systemUpdates: boolean;
  marketing: boolean;
}

const SellerProfile: React.FC = () => {
  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<boolean>(false);
  const [showPasswordForm, setShowPasswordForm] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showSecurity, setShowSecurity] = useState<boolean>(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState<boolean>(false);
  const [showAvatar, setShowAvatar] = useState<boolean>(false);
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [showCurrentPassword, setShowCurrentPassword] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<NotificationSettings>({
    newQuotes: true,
    quoteAccepted: true,
    quoteRejected: true,
    newMessages: true,
    lowStock: true,
    systemUpdates: true,
    marketing: false,
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    birthDate: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock profile data
      const mockProfile: SellerProfile = {
        _id: 'seller1',
        name: 'Carlos Vendedor',
        email: 'carlos.vendedor@piezasya.com',
        phone: '0412-1234567',
        avatar: '/api/placeholder/150/150',
        address: 'Av. Principal 123, Caracas, Venezuela',
        birthDate: '1985-06-15',
        hireDate: '2023-01-15T10:30:00Z',
        position: 'Vendedor Senior',
        department: 'Ventas',
        store: {
          _id: 'store1',
          name: 'PiezasYa Centro',
          address: 'Av. Libertador 456, Caracas',
          phone: '0212-555-0123',
        },
        permissions: {
          catalogAccess: true,
          manualDeliveryAssignment: false,
          chatAccess: true,
          orderManagement: true,
          inventoryView: true,
        },
        performance: {
          totalQuotes: 145,
          acceptedQuotes: 98,
          conversionRate: 67.6,
          customerSatisfaction: 4.7,
          totalRevenue: 8750.00,
        },
        preferences: {
          language: 'es',
          timezone: 'America/Caracas',
          notifications: {
            email: true,
            push: true,
            sms: false,
          },
          theme: 'light',
        },
        security: {
          twoFactorEnabled: true,
          lastPasswordChange: '2023-09-15T14:30:00Z',
          lastLogin: '2023-10-26T08:45:00Z',
          loginAttempts: 0,
        },
      };

      setProfile(mockProfile);
      setFormData({
        name: mockProfile.name,
        email: mockProfile.email,
        phone: mockProfile.phone,
        address: mockProfile.address || '',
        birthDate: mockProfile.birthDate || '',
      });
    } catch (err) {
      setError('Error al cargar el perfil.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      if (profile) {
        setProfile({
          ...profile,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          birthDate: formData.birthDate,
        });
      }
      
      setEditing(false);
      alert('Perfil actualizado exitosamente');
    } catch (err) {
      console.error('Error actualizando perfil:', err);
      alert('Error al actualizar el perfil');
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    if (newPassword.length < 8) {
      alert('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      setNewPassword('');
      setConfirmPassword('');
      setCurrentPassword('');
      setShowPasswordForm(false);
      alert('Contraseña actualizada exitosamente');
    } catch (err) {
      console.error('Error cambiando contraseña:', err);
      alert('Error al cambiar la contraseña');
    }
  };

  const handleSaveNotifications = async () => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      setShowNotifications(false);
      alert('Configuración de notificaciones guardada');
    } catch (err) {
      console.error('Error guardando notificaciones:', err);
      alert('Error al guardar la configuración');
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert('Cuenta eliminada exitosamente');
      // Redirect to login or home page
    } catch (err) {
      console.error('Error eliminando cuenta:', err);
      alert('Error al eliminar la cuenta');
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Simulate upload
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (profile) {
        setProfile({
          ...profile,
          avatar: URL.createObjectURL(file),
        });
      }
      alert('Avatar actualizado exitosamente');
    } catch (err) {
      console.error('Error subiendo avatar:', err);
      alert('Error al subir el avatar');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <RefreshCcw className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-3" />
        <p className="text-gray-600">Cargando perfil...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 text-red-600">
        <AlertCircle className="h-10 w-10 mb-4" />
        <p className="text-lg">{error}</p>
        <button
          onClick={fetchProfile}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
            <p className="text-gray-600 mt-2">Gestiona tu información personal y configuración</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setEditing(!editing)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              <span>{editing ? 'Cancelar' : 'Editar'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Información personal */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Información Personal</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre completo</label>
                  {editing ? (
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  ) : (
                    <p className="text-gray-900">{profile.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  {editing ? (
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  ) : (
                    <p className="text-gray-900">{profile.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                  {editing ? (
                    <input
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  ) : (
                    <p className="text-gray-900">{profile.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de nacimiento</label>
                  {editing ? (
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.birthDate}
                      onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    />
                  ) : (
                    <p className="text-gray-900">
                      {profile.birthDate ? new Date(profile.birthDate).toLocaleDateString() : 'No especificada'}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
                  {editing ? (
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  ) : (
                    <p className="text-gray-900">{profile.address || 'No especificada'}</p>
                  )}
                </div>
              </div>

              {editing && (
                <div className="mt-6 flex space-x-3">
                  <button
                    onClick={handleSaveProfile}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>Guardar</span>
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancelar</span>
                  </button>
                </div>
              )}
            </div>

            {/* Información laboral */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Información Laboral</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Posición</label>
                  <p className="text-gray-900">{profile.position}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Departamento</label>
                  <p className="text-gray-900">{profile.department}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de contratación</label>
                  <p className="text-gray-900">{new Date(profile.hireDate).toLocaleDateString()}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tienda asignada</label>
                  <p className="text-gray-900">{profile.store.name}</p>
                </div>
              </div>
            </div>

            {/* Rendimiento */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Rendimiento</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{profile.performance.totalQuotes}</div>
                  <div className="text-sm text-gray-500">Cotizaciones Totales</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{profile.performance.acceptedQuotes}</div>
                  <div className="text-sm text-gray-500">Cotizaciones Aceptadas</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{profile.performance.conversionRate.toFixed(1)}%</div>
                  <div className="text-sm text-gray-500">Tasa de Conversión</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">{profile.performance.customerSatisfaction}</div>
                  <div className="text-sm text-gray-500">Satisfacción del Cliente</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-600">${profile.performance.totalRevenue.toFixed(2)}</div>
                  <div className="text-sm text-gray-500">Ingresos Totales</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Avatar */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Foto de Perfil</h3>
              <div className="text-center">
                <div className="relative inline-block">
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="w-32 h-32 rounded-full object-cover mx-auto"
                  />
                  <button
                    onClick={() => setShowAvatar(true)}
                    className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-2">Haz clic en la cámara para cambiar</p>
              </div>
            </div>

            {/* Acciones rápidas */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setShowPasswordForm(true)}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Shield className="w-5 h-5" />
                  <span>Cambiar contraseña</span>
                </button>
                <button
                  onClick={() => setShowNotifications(true)}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  <span>Notificaciones</span>
                </button>
                <button
                  onClick={() => setShowSecurity(true)}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Settings className="w-5 h-5" />
                  <span>Seguridad</span>
                </button>
              </div>
            </div>

            {/* Permisos */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Permisos</h3>
              <div className="space-y-3">
                {Object.entries(profile.permissions).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </span>
                    {value ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <X className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de cambio de contraseña */}
      {showPasswordForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Cambiar Contraseña</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña actual</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nueva contraseña</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar contraseña</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex space-x-3">
              <button
                onClick={handleChangePassword}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Cambiar Contraseña
              </button>
              <button
                onClick={() => setShowPasswordForm(false)}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de notificaciones */}
      {showNotifications && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Configuración de Notificaciones</h3>
            </div>
            <div className="p-6 space-y-4">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </span>
                  <button
                    onClick={() => setNotifications({ ...notifications, [key]: !value })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      value ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        value ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-gray-200 flex space-x-3">
              <button
                onClick={handleSaveNotifications}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Guardar
              </button>
              <button
                onClick={() => setShowNotifications(false)}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de subida de avatar */}
      {showAvatar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Cambiar Foto de Perfil</h3>
            </div>
            <div className="p-6">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setShowAvatar(false)}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerProfile;
