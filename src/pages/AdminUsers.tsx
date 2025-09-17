import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useLanguageChange } from '../hooks/useLanguageChange';
import { Users, Search, Filter, MoreVertical, Edit, Trash2, Eye, Plus, X, Save, UserPlus, Key } from 'lucide-react';
import type { User, UserRole } from '../types';
import { API_BASE_URL } from '../../config/api';
import DebugAPI from '../components/DebugAPI';

interface UserFormData {
  name: string;
  email: string;
  phone: string;
  role: UserRole;
}

const AdminUsers: React.FC = () => {
  const { t, tWithParams } = useLanguage();
  const { forceUpdate } = useLanguageChange(); // Para asegurar re-renders
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [hasIdFilter, setHasIdFilter] = useState(false);
  
  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    phone: '',
    role: 'client'
  });

  // Cargar usuarios cuando cambien los filtros o paginación
  useEffect(() => {
    fetchUsers();
  }, [currentPage, itemsPerPage, searchTerm, roleFilter, statusFilter, hasIdFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No hay token de autenticación');
        return;
      }

      console.log('🔐 Token encontrado, haciendo petición a usuarios...');
      
      // Construir parámetros de consulta
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(roleFilter && { role: roleFilter }),
        ...(statusFilter && { status: statusFilter }),
        ...(hasIdFilter && { hasId: 'true' })
      });
      
      const response = await fetch(`API_BASE_URL/admin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.message || t('adminUsers.errors.loadUsers'));
      }

      const data = await response.json();
      console.log('📄 Users data:', data);
      console.log('📄 Pagination data:', data.pagination);
      console.log('📄 Query params:', params.toString());
      console.log('📄 First user sample:', data.data?.[0]);
      
      if (data.success && data.data) {
        setUsers(data.data);
        
        // Manejar tanto la estructura nueva (con paginación) como la antigua (sin paginación)
        if (data.pagination) {
          setTotalUsers(data.pagination.totalUsers);
          setTotalPages(data.pagination.totalPages);
        } else {
          // Estructura antigua sin paginación
          setTotalUsers(data.total || data.data.length);
          setTotalPages(1);
        }
      } else {
        console.error('Respuesta inesperada:', data);
        setUsers([]);
        setTotalUsers(0);
        setTotalPages(0);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
      setTotalUsers(0);
      setTotalPages(0);
      alert(t('adminUsers.errors.loadUsers') + ': ' + (error instanceof Error ? error.message : 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  // Función para cambiar página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Función para cambiar elementos por página
  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1); // Resetear a la primera página
  };

  // Función para resetear filtros
  const resetFilters = () => {
    setSearchTerm('');
    setRoleFilter('');
    setStatusFilter('');
    setHasIdFilter(false);
    setCurrentPage(1);
  };

  const handleCreateUser = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert(t('adminUsers.errors.noToken'));
        return;
      }

      console.log('📤 Enviando datos desde frontend:', formData);

      const response = await fetch('API_BASE_URL/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || t('adminUsers.errors.createUser'));
      }

      alert(t('adminUsers.messages.userCreated'));
      await fetchUsers();
      setShowCreateModal(false);
      setFormData({ name: '', email: '', phone: '', role: 'client' });
      console.log('🔄 Formulario reseteado a:', { name: '', email: '', phone: '', role: 'client' });
    } catch (error) {
      console.error('Error creating user:', error);
      alert(t('adminUsers.errors.createUser') + ': ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert(t('adminUsers.errors.noToken'));
        return;
      }

      const response = await fetch(`API_BASE_URL/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || t('adminUsers.errors.updateUser'));
      }

      alert(t('adminUsers.messages.userUpdated'));
      await fetchUsers();
      setShowEditModal(false);
      setSelectedUser(null);
      setFormData({ name: '', email: '', phone: '', role: 'client' });
    } catch (error) {
      console.error('Error updating user:', error);
      alert(t('adminUsers.errors.updateUser') + ': ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const confirmed = window.confirm(t('adminUsers.confirmations.deactivate'));

    if (!confirmed) return;

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert(t('adminUsers.errors.noToken'));
        return;
      }

      const response = await fetch(`API_BASE_URL/admin/users/${userId}/deactivate`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || t('adminUsers.errors.deactivateUser'));
      }

      await fetchUsers();
      alert(t('adminUsers.messages.userDeactivated'));
    } catch (error) {
      console.error('Error deactivating user:', error);
      alert(t('adminUsers.errors.deactivateUser') + ': ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  const handleResetPassword = async (userId: string, userName: string) => {
    const confirmed = window.confirm(tWithParams('adminUsers.confirmations.resetPassword', { userName }));

    if (!confirmed) return;

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert(t('adminUsers.errors.noToken'));
        return;
      }

      const response = await fetch(`API_BASE_URL/admin/users/${userId}/reset-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || t('adminUsers.errors.resetPassword'));
      }

      alert(t('adminUsers.messages.passwordReset'));
    } catch (error) {
      console.error('Error resetting password:', error);
      alert(t('adminUsers.errors.resetPassword') + ': ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role
    });
    setShowEditModal(true);
  };

  const openViewModal = (user: User) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const getRoleLabel = (role: UserRole) => {
    const labels = {
      admin: t('adminUsers.roles.admin'),
      client: t('adminUsers.roles.client'),
      delivery: t('adminUsers.roles.delivery'),
      store_manager: t('adminUsers.roles.storeManager')
    };
    return labels[role];
  };

  const getRoleColor = (role: UserRole) => {
    const colors = {
      admin: 'bg-blue-100 text-blue-800',
      client: 'bg-green-100 text-green-800',
      delivery: 'bg-yellow-100 text-yellow-800',
      store_manager: 'bg-purple-100 text-purple-800'
    };
    return colors[role];
  };

  const getStatusColor = (user: User) => {
    if (!user.isActive) return 'bg-red-100 text-red-800';
    if (!user.isEmailVerified) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusLabel = (user: User) => {
    if (!user.isActive) return t('adminUsers.status.inactive');
    if (!user.isEmailVerified) return t('adminUsers.status.pending');
    return t('adminUsers.status.active');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFC300]"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Debug Component - Temporal */}
      <DebugAPI />
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#333333] dark:text-[#FFC300]">{t('adminUsers.title')}</h1>
            <p className="text-gray-600 dark:text-white">{t('adminUsers.subtitle')}</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-[#FFC300] text-[#333333] px-4 py-2 rounded-lg hover:bg-[#E6B800] transition-colors font-semibold flex items-center space-x-2"
          >
            <UserPlus className="w-5 h-5" />
            <span>{t('adminUsers.addUser')}</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#333333] rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t('adminUsers.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-[#555555] dark:bg-[#444444] dark:text-white rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-[#555555] dark:bg-[#444444] dark:text-white rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-transparent"
            >
              <option value="">{t('adminUsers.filters.allRoles')}</option>
              <option value="admin">{t('adminUsers.roles.admin')}</option>
              <option value="store_manager">{t('adminUsers.roles.storeManager')}</option>
              <option value="delivery">{t('adminUsers.roles.delivery')}</option>
              <option value="client">{t('adminUsers.roles.client')}</option>
            </select>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-[#555555] dark:bg-[#444444] dark:text-white rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-transparent"
            >
              <option value="">{t('adminUsers.filters.allStatuses')}</option>
              <option value="active">{t('adminUsers.filters.active')}</option>
              <option value="inactive">{t('adminUsers.filters.inactive')}</option>
              <option value="pending">{t('adminUsers.filters.pending')}</option>
            </select>
            <label className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-[#555555] dark:bg-[#444444] rounded-lg">
              <input
                type="checkbox"
                checked={hasIdFilter}
                onChange={(e) => setHasIdFilter(e.target.checked)}
                className="rounded border-gray-300 text-[#FFC300] focus:ring-[#FFC300]"
              />
              <span className="text-sm text-gray-700 dark:text-white">Solo con ID</span>
            </label>
            <button
              onClick={resetFilters}
              className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-[#333333] rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-[#555555]">
          <h3 className="text-lg font-semibold text-[#333333] dark:text-[#FFC300]">
            {t('adminUsers.table.title')} ({totalUsers})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-[#555555]">
            <thead className="bg-gray-50 dark:bg-[#444444]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                  {t('adminUsers.table.headers.user')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                  {t('adminUsers.table.headers.email')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                  {t('adminUsers.table.headers.role')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                  {t('adminUsers.table.headers.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                  {t('adminUsers.table.headers.registrationDate')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                  {t('adminUsers.table.headers.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-[#333333] divide-y divide-gray-200 dark:divide-[#555555]">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-[#444444]">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-[#FFC300] bg-opacity-20 flex items-center justify-center">
                          <Users className="w-5 h-5 text-[#FFC300]" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-[#333333] dark:text-white">{user.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-300">ID: {user._id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-[#333333] dark:text-white">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user)}`}>
                      {getStatusLabel(user)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {user.createdAt ? formatDate(user.createdAt) : t('adminUsers.details.na')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => openViewModal(user)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title={t('adminUsers.actions.view')}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => openEditModal(user)}
                        className="text-green-600 hover:text-green-900 p-1 rounded"
                        title={t('adminUsers.actions.edit')}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleResetPassword(user.id, user.name)}
                        className="text-orange-600 hover:text-orange-900 p-1 rounded"
                        title={t('adminUsers.actions.resetPassword')}
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded"
                        title={t('adminUsers.actions.deactivate')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="bg-white dark:bg-[#333333] rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Items per page selector */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-white">Mostrar:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="px-3 py-1 border border-gray-300 dark:border-[#555555] dark:bg-[#444444] dark:text-white rounded focus:ring-2 focus:ring-[#FFC300] focus:border-transparent"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-gray-600 dark:text-white">por página</span>
          </div>

          {/* Pagination info */}
          <div className="text-sm text-gray-600 dark:text-white">
            Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalUsers)} de {totalUsers} usuarios
          </div>

          {/* Pagination buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 dark:border-[#555555] dark:bg-[#444444] dark:text-white rounded hover:bg-gray-50 dark:hover:bg-[#555555] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            
            {/* Page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
              if (pageNum > totalPages) return null;
              
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-1 border rounded ${
                    pageNum === currentPage
                      ? 'bg-[#FFC300] text-[#333333] border-[#FFC300]'
                      : 'border-gray-300 dark:border-[#555555] dark:bg-[#444444] dark:text-white hover:bg-gray-50 dark:hover:bg-[#555555]'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 dark:border-[#555555] dark:bg-[#444444] dark:text-white rounded hover:bg-gray-50 dark:hover:bg-[#555555] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[#333333]">{t('adminUsers.modals.create.title')}</h2>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleCreateUser(); }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#333333] mb-1">
                    {t('adminUsers.form.fullName')}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#333333] mb-1">
                    {t('adminUsers.form.email')}
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#333333] mb-1">
                    {t('adminUsers.form.phone')}
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#333333] mb-1">
                    {t('adminUsers.form.role')}
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-transparent"
                  >
                    <option value="client">{t('adminUsers.roles.client')}</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {t('adminUsers.form.roleNote')}
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {t('adminUsers.form.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#FFC300] text-[#333333] rounded-lg hover:bg-[#E6B800] font-semibold"
                >
                  {t('adminUsers.form.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[#333333]">{t('adminUsers.modals.edit.title')}</h2>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleUpdateUser(); }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#333333] mb-1">
                    {t('adminUsers.form.fullName')}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#333333] mb-1">
                    {t('adminUsers.form.email')}
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#333333] mb-1">
                    {t('adminUsers.form.phone')}
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#333333] mb-1">
                    {t('adminUsers.form.role')}
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-transparent"
                  >
                    <option value="admin">{t('adminUsers.roles.admin')}</option>
                    <option value="store_manager">{t('adminUsers.roles.storeManager')}</option>
                    <option value="delivery">{t('adminUsers.roles.delivery')}</option>
                    <option value="client">{t('adminUsers.roles.client')}</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {t('adminUsers.form.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#FFC300] text-[#333333] rounded-lg hover:bg-[#E6B800] font-semibold"
                >
                  {t('adminUsers.form.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[#333333]">{t('adminUsers.modals.view.title')}</h2>
              <button 
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">{t('adminUsers.form.fullName')}</label>
                <p className="text-[#333333]">{selectedUser.name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">{t('adminUsers.form.email')}</label>
                <p className="text-[#333333]">{selectedUser.email}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">{t('adminUsers.details.phone')}</label>
                <p className="text-[#333333]">{selectedUser.phone || t('adminUsers.details.notSpecified')}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">{t('adminUsers.details.role')}</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(selectedUser.role)}`}>
                  {getRoleLabel(selectedUser.role)}
                </span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">{t('adminUsers.details.status')}</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedUser)}`}>
                  {getStatusLabel(selectedUser)}
                </span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">{t('adminUsers.details.emailVerified')}</label>
                <p className="text-[#333333]">{selectedUser.isEmailVerified ? t('adminUsers.details.yes') : t('adminUsers.details.no')}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">{t('adminUsers.details.registrationDate')}</label>
                <p className="text-[#333333]">
                  {selectedUser.createdAt ? formatDate(selectedUser.createdAt) : t('adminUsers.details.na')}
                </p>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-[#FFC300] text-[#333333] rounded-lg hover:bg-[#E6B800] font-semibold"
              >
                {t('adminUsers.form.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers; 