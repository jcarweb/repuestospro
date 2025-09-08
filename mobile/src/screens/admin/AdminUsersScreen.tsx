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
  Platform,
  TextInput,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Ionicons } from '@expo/vector-icons';
import { userService, User } from '../../services/userService';

const AdminUsersScreen: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const loadUsers = async () => {
    try {
      console.log('🔄 Cargando usuarios desde la base de datos...');
      const response = await userService.getUsers();
      
      if (response.success && response.data) {
        console.log(`✅ Se cargaron ${response.data.total} usuarios`);
        setUsers(response.data.data);
      } else {
        console.error('❌ Error cargando usuarios:', response.error);
        showToast(response.error || 'Error cargando usuarios', 'error');
        
        // Fallback a datos mock si falla la conexión
        const mockUsers: User[] = [
          {
            _id: '1',
            name: 'Usuario Admin',
            email: 'admin@example.com',
            role: 'admin',
            isActive: true,
            isEmailVerified: true,
            fingerprintEnabled: false,
            twoFactorEnabled: false,
            emailNotifications: true,
            pushNotifications: true,
            marketingEmails: false,
            theme: 'light',
            language: 'es',
            profileVisibility: 'private',
            showEmail: false,
            showPhone: false,
            pushEnabled: false,
            points: 0,
            loyaltyLevel: 'bronze',
            locationEnabled: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];
        setUsers(mockUsers);
      }
    } catch (error) {
      console.error('❌ Error en loadUsers:', error);
      showToast('Error de conexión cargando usuarios', 'error');
      
      // Fallback a datos mock en caso de error
      const mockUsers: User[] = [
        {
          _id: '1',
          name: 'Usuario Admin',
          email: 'admin@example.com',
          role: 'admin',
          isActive: true,
          isEmailVerified: true,
          fingerprintEnabled: false,
          twoFactorEnabled: false,
          emailNotifications: true,
          pushNotifications: true,
          marketingEmails: false,
          theme: 'light',
          language: 'es',
          profileVisibility: 'private',
          showEmail: false,
          showPhone: false,
          pushEnabled: false,
          points: 0,
          loyaltyLevel: 'bronze',
          locationEnabled: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      setUsers(mockUsers);
    }
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    await loadUsers();
    setIsRefreshing(false);
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    Alert.alert(
      'Cambiar Estado',
      `¿Estás seguro de que quieres ${currentStatus ? 'desactivar' : 'activar'} este usuario?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: currentStatus ? 'Desactivar' : 'Activar',
          style: currentStatus ? 'destructive' : 'default',
          onPress: async () => {
            try {
              console.log(`🔄 Cambiando estado del usuario ${userId}...`);
              const response = await userService.updateUserStatus(userId, !currentStatus);
              
              if (response.success && response.data) {
                // Actualizar la lista local con el usuario actualizado
                setUsers(prevUsers =>
                  (prevUsers || []).map(user =>
                    user._id === userId
                      ? { ...user, isActive: !currentStatus }
                      : user
                  )
                );
                showToast(response.data.message, 'success');
              } else {
                console.error('❌ Error actualizando estado:', response.error);
                showToast(response.error || 'Error cambiando estado del usuario', 'error');
              }
            } catch (error) {
              console.error('❌ Error en toggleUserStatus:', error);
              showToast('Error de conexión cambiando estado del usuario', 'error');
            }
          },
        },
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
              console.log(`🗑️ Eliminando usuario ${userId}...`);
              const response = await userService.deleteUser(userId);
              
              if (response.success && response.data) {
                // Remover el usuario de la lista local
                setUsers(prevUsers => (prevUsers || []).filter(user => user._id !== userId));
                showToast(response.data.message, 'success');
              } else {
                console.error('❌ Error eliminando usuario:', response.error);
                showToast(response.error || 'Error eliminando usuario', 'error');
              }
            } catch (error) {
              console.error('❌ Error en deleteUser:', error);
              showToast('Error de conexión eliminando usuario', 'error');
            }
          },
        },
      ]
    );
  };

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        setIsLoading(true);
        await loadUsers();
        setIsLoading(false);
      };
      loadData();
    }, [])
  );

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return '#FF3B30';
      case 'store_manager': return '#007AFF';
      case 'delivery': return '#34C759';
      case 'client': return '#FF9500';
      default: return '#8E8E93';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'store_manager': return 'Gestor';
      case 'delivery': return 'Delivery';
      case 'client': return 'Cliente';
      default: return 'Desconocido';
    }
  };

  const filteredUsers = (users || []).filter(user => {
    const matchesSearch = (user.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (user.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const renderUserItem = ({ item }: { item: User }) => (
    <View style={styles.userCard}>
      <View style={styles.userHeader}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name || 'Sin nombre'}</Text>
          <Text style={styles.userEmail}>{item.email || 'Sin email'}</Text>
        </View>
        <View style={[styles.roleBadge, { backgroundColor: getRoleColor(item.role) }]}>
          <Text style={styles.roleText}>{getRoleText(item.role)}</Text>
        </View>
      </View>

      <View style={styles.userDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="checkmark-circle" size={16} color={item.isActive ? '#34C759' : '#FF3B30'} />
          <Text style={[styles.detailText, { color: item.isActive ? '#34C759' : '#FF3B30' }]}>
            {item.isActive ? 'Activo' : 'Inactivo'}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="mail" size={16} color={item.isEmailVerified ? '#34C759' : '#FF9500'} />
          <Text style={[styles.detailText, { color: item.isEmailVerified ? '#34C759' : '#FF9500' }]}>
            {item.isEmailVerified ? 'Email verificado' : 'Email no verificado'}
          </Text>
        </View>

        {(item.points || 0) > 0 && (
          <View style={styles.detailRow}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.detailText}>
              {item.points || 0} puntos - Nivel {item.loyaltyLevel || 'bronze'}
            </Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <Ionicons name="calendar" size={16} color="#8E8E93" />
          <Text style={styles.detailText}>
            Registrado: {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Fecha no disponible'}
          </Text>
        </View>

        {item.phone && (
          <View style={styles.detailRow}>
            <Ionicons name="call" size={16} color="#8E8E93" />
            <Text style={styles.detailText}>
              {item.phone}
            </Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <Ionicons name="globe" size={16} color="#8E8E93" />
          <Text style={styles.detailText}>
            Idioma: {(item.language || 'es').toUpperCase()} - Tema: {item.theme || 'light'}
          </Text>
        </View>
      </View>

      <View style={styles.userActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: item.isActive ? '#FF3B30' : '#34C759' }]}
          onPress={() => toggleUserStatus(item._id, item.isActive)}
        >
          <Ionicons 
            name={item.isActive ? 'pause-circle' : 'play-circle'} 
            size={20} 
            color="white" 
          />
          <Text style={styles.actionButtonText}>
            {item.isActive ? 'Desactivar' : 'Activar'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#FF3B30' }]}
          onPress={() => deleteUser(item._id, item.name || 'Usuario sin nombre')}
        >
          <Ionicons name="trash" size={20} color="white" />
          <Text style={styles.actionButtonText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Verificar si el usuario es admin
  if (!isAdmin) {
    return (
      <View style={styles.container}>
        <View style={styles.restrictedContainer}>
          <Text style={styles.restrictedTitle}>Acceso Restringido</Text>
          <Text style={styles.restrictedText}>
            Solo los administradores pueden acceder a esta funcionalidad.
          </Text>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Cargando usuarios...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="#fff"
        translucent={false}
      />
      
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? insets.top + 10 : insets.top + 20 }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text style={styles.title}>Gestión de Usuarios</Text>
            <Text style={styles.subtitle}>
              Administrar usuarios, roles y permisos
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              navigation.navigate('AdminCreateUser' as never);
            }}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filtros */}
      <View style={styles.filtersContainer}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#8E8E93" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar usuarios..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#8E8E93"
          />
        </View>

        <View style={styles.roleFilter}>
          <TouchableOpacity
            style={[styles.filterButton, selectedRole === 'all' && styles.filterButtonActive]}
            onPress={() => setSelectedRole('all')}
          >
            <Text style={[styles.filterButtonText, selectedRole === 'all' && styles.filterButtonTextActive]}>
              Todos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, selectedRole === 'admin' && styles.filterButtonActive]}
            onPress={() => setSelectedRole('admin')}
          >
            <Text style={[styles.filterButtonText, selectedRole === 'admin' && styles.filterButtonTextActive]}>
              Admin
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, selectedRole === 'store_manager' && styles.filterButtonActive]}
            onPress={() => setSelectedRole('store_manager')}
          >
            <Text style={[styles.filterButtonText, selectedRole === 'store_manager' && styles.filterButtonTextActive]}>
              Gestores
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, selectedRole === 'delivery' && styles.filterButtonActive]}
            onPress={() => setSelectedRole('delivery')}
          >
            <Text style={[styles.filterButtonText, selectedRole === 'delivery' && styles.filterButtonTextActive]}>
              Delivery
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, selectedRole === 'client' && styles.filterButtonActive]}
            onPress={() => setSelectedRole('client')}
          >
            <Text style={[styles.filterButtonText, selectedRole === 'client' && styles.filterButtonTextActive]}>
              Clientes
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Lista de usuarios */}
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item._id}
        renderItem={renderUserItem}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshData}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#8E8E93" />
            <Text style={styles.emptyText}>No se encontraron usuarios</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  addButton: {
    backgroundColor: '#007AFF',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  filtersContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  roleFilter: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  listContainer: {
    padding: 16,
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  userDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  userActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  restrictedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  restrictedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 16,
    textAlign: 'center',
  },
  restrictedText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default AdminUsersScreen;
