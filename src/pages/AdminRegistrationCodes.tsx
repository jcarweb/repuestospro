import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Users,
  Plus,
  Trash2,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Mail,
  UserPlus,
  Settings,
  BarChart3
} from 'lucide-react';

interface RegistrationCode {
  _id: string;
  code: string;
  email: string;
  role: 'admin' | 'store_manager' | 'delivery';
  status: 'pending' | 'used' | 'expired' | 'revoked';
  expiresAt: string;
  usedAt?: string;
  usedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  sentAt: string;
  clickedAt?: string;
  registrationStartedAt?: string;
  registrationCompletedAt?: string;
}

interface CodeStats {
  total: number;
  pending: number;
  used: number;
  expired: number;
  revoked: number;
  roleStats: Array<{
    _id: string;
    count: number;
    used: number;
    pending: number;
  }>;
}

const AdminRegistrationCodes: React.FC = () => {
  const { token, user } = useAuth();
  const { t } = useLanguage();
  const [codes, setCodes] = useState<RegistrationCode[]>([]);
  const [stats, setStats] = useState<CodeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    email: '',
    role: 'store_manager' as 'admin' | 'store_manager' | 'delivery',
    expiresInDays: 7
  });
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchCodes = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/registration-codes/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      if (result.success) {
        setCodes(result.data);
      }
    } catch (error) {
      console.error('Error obteniendo códigos:', error);
      setMessage({ type: 'error', text: t('adminRegistrationCodes.errorLoadingCodes') });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/registration-codes/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
    }
  };

  useEffect(() => {
    console.log('AdminRegistrationCodes - User:', user);
    console.log('AdminRegistrationCodes - User role:', user?.role);
    
    if (!user) {
      console.log('AdminRegistrationCodes - No user found');
      return;
    }
    
    if (user.role !== 'admin') {
      console.log('AdminRegistrationCodes - User is not admin, role:', user.role);
      setMessage({ type: 'error', text: t('adminRegistrationCodes.accessDeniedMessage') });
      return;
    }
    
    console.log('AdminRegistrationCodes - User is admin, fetching data');
    fetchCodes();
    fetchStats();
  }, [user]);

  const handleCreateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setMessage(null);

    try {
      const response = await fetch('http://localhost:5000/api/registration-codes/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(createForm)
      });

      const result = await response.json();
      if (result.success) {
        setMessage({ type: 'success', text: t('adminRegistrationCodes.codeCreated') });
        setShowCreateModal(false);
        setCreateForm({ email: '', role: 'store_manager', expiresInDays: 7 });
        fetchCodes();
        fetchStats();
      } else {
        setMessage({ type: 'error', text: result.message || t('adminRegistrationCodes.errorCreatingCode') });
      }
    } catch (error) {
      setMessage({ type: 'error', text: t('adminRegistrationCodes.connectionError') });
    } finally {
      setCreating(false);
    }
  };

  const handleRevokeCode = async (codeId: string) => {
    if (!confirm(t('adminRegistrationCodes.confirmRevoke'))) return;

    try {
      const response = await fetch(`http://localhost:5000/api/registration-codes/revoke/${codeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      if (result.success) {
        setMessage({ type: 'success', text: t('adminRegistrationCodes.codeRevoked') });
        fetchCodes();
        fetchStats();
      } else {
        setMessage({ type: 'error', text: result.message || t('adminRegistrationCodes.errorRevokingCode') });
      }
    } catch (error) {
      setMessage({ type: 'error', text: t('adminRegistrationCodes.connectionError') });
    }
  };

  const handleCleanExpired = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/registration-codes/clean-expired', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        fetchCodes();
        fetchStats();
      } else {
        setMessage({ type: 'error', text: result.message || t('adminRegistrationCodes.errorCleaningCodes') });
      }
    } catch (error) {
      setMessage({ type: 'error', text: t('adminRegistrationCodes.connectionError') });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'used':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'expired':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'revoked':
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'used':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'revoked':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'store_manager':
        return 'bg-blue-100 text-blue-800';
      case 'delivery':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Funciones para obtener traducciones de roles y estados
  const getRoleLabel = (role: string) => {
    const roleLabels: { [key: string]: string } = {
      admin: t('adminRegistrationCodes.roles.admin'),
      store_manager: t('adminRegistrationCodes.roles.storeManager'),
      delivery: t('adminRegistrationCodes.roles.delivery')
    };
    return roleLabels[role] || role;
  };

  const getStatusLabel = (status: string) => {
    const statusLabels: { [key: string]: string } = {
      pending: t('adminRegistrationCodes.status.pending'),
      used: t('adminRegistrationCodes.status.used'),
      expired: t('adminRegistrationCodes.status.expired'),
      revoked: t('adminRegistrationCodes.status.revoked')
    };
    return statusLabels[status] || status;
  };

  // Verificar si el usuario está cargando
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFC300] mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('adminRegistrationCodes.loadingUser')}</p>
        </div>
      </div>
    );
  }

  // Verificar si el usuario es administrador
  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="flex items-center justify-center mb-4">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">
            {t('adminRegistrationCodes.accessDenied')}
          </h2>
          <p className="text-gray-600 text-center">
            {t('adminRegistrationCodes.accessDeniedMessage')}
            <br />
            <span className="text-sm text-gray-500">{t('adminRegistrationCodes.currentRole')} {user.role}</span>
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFC300] mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('adminRegistrationCodes.loadingCodes')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-[#FFC300] mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">
              {t('adminRegistrationCodes.title')}
            </h1>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleCleanExpired}
              className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {t('adminRegistrationCodes.cleanExpired')}
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-4 py-2 bg-[#FFC300] text-white rounded-lg hover:bg-[#E6B000] transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('adminRegistrationCodes.createCode')}
            </button>
          </div>
        </div>
        <p className="text-gray-600">
          {t('adminRegistrationCodes.subtitle')}
        </p>
      </div>

      {/* Mensaje de estado */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          <div className="flex items-center">
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 mr-2" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-2" />
            )}
            {message.text}
          </div>
        </div>
      )}

      {/* Botón de recargar */}
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => {
            console.log('Forzando recarga de usuario...');
            window.location.reload();
          }}
          className="flex items-center px-3 py-2 bg-[#FFC300] text-white rounded-lg hover:bg-[#E6B000] transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          {t('adminRegistrationCodes.reload')}
        </button>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <BarChart3 className="w-8 h-8 text-[#FFC300] mr-3" />
              <div>
                <p className="text-sm text-gray-600">{t('adminRegistrationCodes.stats.total')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">{t('adminRegistrationCodes.stats.pending')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">{t('adminRegistrationCodes.stats.used')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.used}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <XCircle className="w-8 h-8 text-red-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">{t('adminRegistrationCodes.stats.expired')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.expired}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <AlertCircle className="w-8 h-8 text-gray-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">{t('adminRegistrationCodes.stats.revoked')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.revoked}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de códigos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{t('adminRegistrationCodes.table.title')}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('adminRegistrationCodes.table.code')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('adminRegistrationCodes.table.email')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('adminRegistrationCodes.table.role')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('adminRegistrationCodes.table.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('adminRegistrationCodes.table.expires')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('adminRegistrationCodes.table.usedBy')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('adminRegistrationCodes.table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {codes.map((code) => (
                <tr key={code._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                        {code.code}
                      </code>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {code.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(code.role)}`}>
                      {getRoleLabel(code.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(code.status)}
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(code.status)}`}>
                        {getStatusLabel(code.status)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(code.expiresAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {code.usedBy ? (
                      <div>
                        <div className="font-medium">{code.usedBy.name}</div>
                        <div className="text-gray-500">{code.usedBy.email}</div>
                      </div>
                    ) : (
                      <span className="text-gray-400">{t('adminRegistrationCodes.notUsed')}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {code.status === 'pending' && (
                        <button
                          onClick={() => handleRevokeCode(code._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para crear código */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {t('adminRegistrationCodes.modal.title')}
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateCode} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('adminRegistrationCodes.modal.email')}
                </label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('adminRegistrationCodes.modal.role')}
                </label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, role: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
                >
                  <option value="admin">{t('adminRegistrationCodes.roles.admin')}</option>
                  <option value="store_manager">{t('adminRegistrationCodes.roles.storeManager')}</option>
                  <option value="delivery">{t('adminRegistrationCodes.roles.delivery')}</option>
                  <option value="seller">{t('adminRegistrationCodes.roles.seller')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('adminRegistrationCodes.modal.expirationDays')}
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={createForm.expiresInDays}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, expiresInDays: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  {t('adminRegistrationCodes.modal.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex items-center px-4 py-2 bg-[#FFC300] text-white rounded-lg hover:bg-[#E6B000] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {creating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {t('adminRegistrationCodes.modal.creating')}
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      {t('adminRegistrationCodes.modal.createCode')}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRegistrationCodes; 