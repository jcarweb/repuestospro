import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar,
  TextInput,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { fetchUsers, createUser, updateUser, deleteUser } from '../../services/userService';
import type { User } from '../../services/userService';
import { Ionicons } from '@expo/vector-icons';

const AdminUsersScreen: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'createdAt' | 'lastLogin'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Estados para mejoras de UI
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  
  const { user } = useAuth();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();

  // Verificar permisos
  const canManageUsers = user?.role === 'admin';

  const loadUsers = async (isFilterChange = false) => {
    try {
      if (isFilterChange) {
        setIsFiltering(true);
      } else {
        setIsLoading(true);
      }
      
      const response = await userService.getUsers({
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery,
        role: selectedRole !== 'all' ? selectedRole : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        sortBy: sortBy,
        sortOrder: sortOrder
      });
      
      if (response.success && response.data) {
        setUsers(response.data.users);
        console.log(`✅ Cargados ${response.data.users.length} usuarios`);
        console.log(`📊 Total: ${response.data.pagination.total} usuarios`);
        console.log(`🔍 Filtros aplicados: rol=${selectedRole}, estado=${selectedStatus}, búsqueda="${searchQuery}"`);
      } else {
        console.warn('⚠️ No se pudieron cargar los usuarios:', response.message);
        setUsers([]);
      }
      
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      showToast('Error al cargar usuarios', 'error');
      setUsers([]);
    } finally {
      if (isFilterChange) {
        setIsFiltering(false);
      } else {
        setIsLoading(false);
      }
    }
  };

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadUsers();
    setIsRefreshing(false);
  }, []);

  const getFilteredUsers = () => {
    // Los filtros ya se aplican en el backend, solo devolvemos los usuarios
    return users;
  };

  const getPaginatedUsers = () => {
    const filtered = getFilteredUsers();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    return Math.ceil(getFilteredUsers().length / itemsPerPage);
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    Alert.alert(
      'Cambiar Estado del Usuario',
      `¿Estás seguro de que quieres ${currentStatus ? 'desactivar' : 'activar'} este usuario?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await userService.toggleUserStatus(userId, !currentStatus);
              
              if (response.success) {
                setUsers(prev => prev.map(user =>
                  user._id === userId ? { ...user, isActive: !currentStatus } : user
                ));
                showToast(`Usuario ${!currentStatus ? 'activado' : 'desactivado'} exitosamente`, 'success');
              } else {
                showToast(response.message || 'Error al actualizar usuario', 'error');
              }
            } catch (error) {
              console.error('Error actualizando usuario:', error);
              showToast('Error al actualizar usuario', 'error');
            }
          }
        }
      ]
    );
  };

  const deleteUser = async (userId: string, userName: string) => {
    Alert.alert(
      'Eliminar Usuario',
      `¿Estás seguro de que quieres eliminar a ${userName}? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await userService.deleteUser(userId);
              
              if (response.success) {
                setUsers(prev => prev.filter(user => user._id !== userId));
                showToast('Usuario eliminado exitosamente', 'success');
              } else {
                showToast(response.message || 'Error al eliminar usuario', 'error');
              }
            } catch (error) {
              console.error('Error eliminando usuario:', error);
              showToast('Error al eliminar usuario', 'error');
            }
          }
        }
      ]
    );
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return '#DC2626';
      case 'store_manager': return '#2563EB';
      case 'seller': return '#7C3AED';
      case 'client': return '#059669';
      case 'delivery': return '#D97706';
      default: return '#6B7280';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'store_manager': return 'Gestor de Tienda';
      case 'seller': return 'Vendedor';
      case 'client': return 'Cliente';
      case 'delivery': return 'Repartidor';
      default: return role;
    }
  };

  const renderUserCard = ({ item }: { item: User }) => (
    <View style={styles.userCard}>
      <View style={styles.userHeader}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
          {item.phone && <Text style={styles.userPhone}>{item.phone}</Text>}
        </View>
        <View style={styles.userBadges}>
          <View style={[styles.roleBadge, { backgroundColor: getRoleColor(item.role) }]}>
            <Text style={styles.roleBadgeText}>{getRoleLabel(item.role)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: item.isActive ? '#10B981' : '#EF4444' }]}>
            <Text style={styles.statusBadgeText}>
              {item.isActive ? 'Activo' : 'Inactivo'}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.userDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Verificación Email:</Text>
          <Text style={[styles.detailValue, { color: item.isEmailVerified ? '#10B981' : '#EF4444' }]}>
            {item.isEmailVerified ? 'Verificado' : 'No verificado'}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Último acceso:</Text>
          <Text style={styles.detailValue}>
            {item.lastLogin ? new Date(item.lastLogin).toLocaleDateString() : 'Nunca'}
          </Text>
        </View>
        {item.stores && item.stores.length > 0 && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Tiendas:</Text>
            <Text style={styles.detailValue}>{item.stores.join(', ')}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.userActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => {/* Implementar edición */}}
        >
          <Ionicons name="pencil" size={16} color="#3B82F6" />
          <Text style={styles.actionButtonText}>Editar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.toggleButton]}
          onPress={() => toggleUserStatus(item._id, item.isActive)}
        >
          <Ionicons name={item.isActive ? "pause" : "play"} size={16} color="#F59E0B" />
          <Text style={styles.actionButtonText}>
            {item.isActive ? 'Desactivar' : 'Activar'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => deleteUser(item._id, item.name)}
        >
          <Ionicons name="trash" size={16} color="#EF4444" />
          <Text style={styles.actionButtonText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTableRow = (item: User, index: number) => (
    <View key={item._id} style={[styles.tableRow, index % 2 === 0 && styles.tableRowEven]}>
      <Text style={styles.tableCell} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.tableCell} numberOfLines={1}>{item.email}</Text>
      <View style={styles.tableCell}>
        <View style={[styles.roleBadge, { backgroundColor: getRoleColor(item.role) }]}>
          <Text style={styles.roleBadgeText}>{getRoleLabel(item.role)}</Text>
        </View>
      </View>
      <View style={styles.tableCell}>
        <View style={[styles.statusBadge, { backgroundColor: item.isActive ? '#10B981' : '#EF4444' }]}>
          <Text style={styles.statusBadgeText}>
            {item.isActive ? 'Activo' : 'Inactivo'}
          </Text>
        </View>
      </View>
      <Text style={styles.tableCell} numberOfLines={1}>
        {item.lastLogin ? new Date(item.lastLogin).toLocaleDateString() : 'Nunca'}
      </Text>
      <View style={styles.tableActions}>
        <TouchableOpacity
          style={styles.tableActionButton}
          onPress={() => toggleUserStatus(item._id, item.isActive)}
        >
          <Ionicons name={item.isActive ? "pause" : "play"} size={16} color="#F59E0B" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tableActionButton}
          onPress={() => deleteUser(item._id, item.name)}
        >
          <Ionicons name="trash" size={16} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFilterButton = (label: string, value: string, currentValue: string, onPress: () => void) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        currentValue === value && styles.filterButtonActive
      ]}
      onPress={onPress}
    >
      <Text style={[
        styles.filterButtonText,
        currentValue === value && styles.filterButtonTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  useEffect(() => {
    loadUsers();
  }, []);

  // Recargar usuarios cuando cambien los filtros
  useEffect(() => {
    if (selectedRole !== 'all' || selectedStatus !== 'all' || searchQuery) {
      loadUsers(true); // isFilterChange = true
    }
  }, [selectedRole, selectedStatus, searchQuery, sortBy, sortOrder]);

  useFocusEffect(
    useCallback(() => {
      if (canManageUsers) {
        loadUsers();
      }
    }, [canManageUsers])
  );

  if (!canManageUsers) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
        <View style={styles.accessDeniedContainer}>
          <Ionicons name="lock-closed" size={64} color="#EF4444" />
          <Text style={styles.accessDeniedTitle}>Acceso Denegado</Text>
          <Text style={styles.accessDeniedMessage}>
            No tienes permisos para acceder a la gestión de usuarios.
          </Text>
          <Text style={styles.accessDeniedMessage}>
            Tu rol actual: {user?.role || 'No definido'}
          </Text>
        </View>
      </View>
    );
  }

  const filteredUsers = getFilteredUsers();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gestión de Usuarios</Text>
        <Text style={styles.headerSubtitle}>
          Administra usuarios del sistema
        </Text>
      </View>

      {/* Search and Controls */}
      <View style={styles.controlsContainer}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar usuarios..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>
        
        <View style={styles.controlButtons}>
          <TouchableOpacity
            style={[styles.controlButton, showFilters && styles.controlButtonActive]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Ionicons name="filter" size={20} color={showFilters ? "#FFFFFF" : "#6B7280"} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.controlButton, viewMode === 'table' && styles.controlButtonActive]}
            onPress={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
          >
            <Ionicons name={viewMode === 'table' ? 'grid' : 'list'} size={20} color={viewMode === 'table' ? "#FFFFFF" : "#6B7280"} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Collapsible Filters */}
      {showFilters && (
        <ScrollView 
          style={styles.filtersContainer}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
        >
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Rol:</Text>
            <View style={styles.filterButtons}>
              {renderFilterButton('Todos', 'all', selectedRole, () => setSelectedRole('all'))}
              {renderFilterButton('Admin', 'admin', selectedRole, () => setSelectedRole('admin'))}
              {renderFilterButton('Gestor', 'store_manager', selectedRole, () => setSelectedRole('store_manager'))}
              {renderFilterButton('Vendedor', 'seller', selectedRole, () => setSelectedRole('seller'))}
              {renderFilterButton('Cliente', 'client', selectedRole, () => setSelectedRole('client'))}
              {renderFilterButton('Repartidor', 'delivery', selectedRole, () => setSelectedRole('delivery'))}
            </View>
          </View>
          
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Estado:</Text>
            <View style={styles.filterButtons}>
              {renderFilterButton('Todos', 'all', selectedStatus, () => setSelectedStatus('all'))}
              {renderFilterButton('Activos', 'active', selectedStatus, () => setSelectedStatus('active'))}
              {renderFilterButton('Inactivos', 'inactive', selectedStatus, () => setSelectedStatus('inactive'))}
            </View>
          </View>
        </ScrollView>
      )}

      {/* Users List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Cargando usuarios...</Text>
        </View>
      ) : (
        <View style={styles.usersContainer}>
          {isFiltering && (
            <View style={styles.filteringIndicator}>
              <ActivityIndicator size="small" color="#3B82F6" />
              <Text style={styles.filteringText}>Aplicando filtros...</Text>
            </View>
          )}
          {viewMode === 'table' ? (
            <View style={styles.tableContainer}>
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderText}>Nombre</Text>
                <Text style={styles.tableHeaderText}>Email</Text>
                <Text style={styles.tableHeaderText}>Rol</Text>
                <Text style={styles.tableHeaderText}>Estado</Text>
                <Text style={styles.tableHeaderText}>Último Acceso</Text>
                <Text style={styles.tableHeaderText}>Acciones</Text>
              </View>
              {/* Table Body */}
              <ScrollView style={styles.tableBody} showsVerticalScrollIndicator={false}>
                {getPaginatedUsers().map((item, index) => renderTableRow(item, index))}
              </ScrollView>
            </View>
          ) : (
            <FlatList
              data={getPaginatedUsers()}
              renderItem={renderUserCard}
              keyExtractor={(item) => item._id}
              contentContainerStyle={styles.usersList}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={onRefresh}
                  colors={['#3B82F6']}
                  tintColor="#3B82F6"
                />
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="people-outline" size={64} color="#9CA3AF" />
                  <Text style={styles.emptyTitle}>No se encontraron usuarios</Text>
                  <Text style={styles.emptyMessage}>
                    Intenta ajustar los filtros de búsqueda
                  </Text>
                </View>
              }
            />
          )}
          
          {/* Pagination */}
          {getTotalPages() > 1 && (
            <View style={styles.paginationContainer}>
              <TouchableOpacity
                style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
                onPress={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <Ionicons name="chevron-back" size={20} color={currentPage === 1 ? "#9CA3AF" : "#3B82F6"} />
              </TouchableOpacity>
              
              <Text style={styles.paginationText}>
                Página {currentPage} de {getTotalPages()}
              </Text>
              
              <TouchableOpacity
                style={[styles.paginationButton, currentPage === getTotalPages() && styles.paginationButtonDisabled]}
                onPress={() => setCurrentPage(Math.min(getTotalPages(), currentPage + 1))}
                disabled={currentPage === getTotalPages()}
              >
                <Ionicons name="chevron-forward" size={20} color={currentPage === getTotalPages() ? "#9CA3AF" : "#3B82F6"} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginVertical: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    marginLeft: 8,
  },
  controlButtons: {
    flexDirection: 'row',
    marginRight: -8,
    marginBottom: -8,
  },
  controlButton: {
    padding: 8,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#F3F4F6',
  },
  controlButtonActive: {
    backgroundColor: '#3B82F6',
  },
  filtersContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    maxHeight: 300,
  },
  filterRow: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginRight: 8,
    marginBottom: 8,
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  usersList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  userCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: '#6B7280',
  },
  userBadges: {
    alignItems: 'flex-end',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  roleBadgeText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  userDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 12,
    color: '#111827',
    fontWeight: '500',
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 2,
    justifyContent: 'center',
  },
  editButton: {
    backgroundColor: '#EBF8FF',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  toggleButton: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  deleteButton: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  tableContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  tableBody: {
    maxHeight: 400,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tableRowEven: {
    backgroundColor: '#F9FAFB',
  },
  tableCell: {
    fontSize: 12,
    color: '#111827',
    flex: 1,
    justifyContent: 'center',
  },
  tableActions: {
    flexDirection: 'row',
    flex: 1,
  },
  tableActionButton: {
    padding: 4,
    marginHorizontal: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 12,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  paginationButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 8,
  },
  paginationButtonDisabled: {
    backgroundColor: '#F9FAFB',
  },
  paginationText: {
    fontSize: 14,
    color: '#374151',
    marginHorizontal: 16,
  },
  accessDeniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  accessDeniedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#EF4444',
    marginTop: 16,
    textAlign: 'center',
  },
  accessDeniedMessage: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 24,
  },
  usersContainer: {
    flex: 1,
  },
  filteringIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 8,
  },
  filteringText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
});

export default AdminUsersScreen;