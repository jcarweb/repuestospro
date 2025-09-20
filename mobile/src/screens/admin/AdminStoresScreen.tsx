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
  Image,
  RefreshControl,
  ScrollView,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { storeService, Store, StoreStats } from '../../services/storeService';
import { userService, User } from '../../services/userService';
import { administrativeDivisionService, State, Municipality, Parish } from '../../services/administrativeDivisionService';
import { requestCache, circuitBreaker } from '../../utils/requestUtils';
import { Ionicons } from '@expo/vector-icons';

const AdminStoresScreen: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [stats, setStats] = useState<StoreStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStores, setTotalStores] = useState(0);
  
  // Estados para modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showManagersModal, setShowManagersModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  
  // Estados para formularios
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Venezuela',
    phone: '',
    email: '',
    website: '',
    latitude: '',
    longitude: '',
    currency: 'USD',
    taxRate: '16.0',
    deliveryRadius: '10',
    minimumOrder: '0',
    autoAcceptOrders: false
  });

  // Estados para gestión de managers
  const [newManagerEmail, setNewManagerEmail] = useState('');
  
  // Estados para usuarios disponibles
  const [availableOwners, setAvailableOwners] = useState<User[]>([]);
  const [availableManagers, setAvailableManagers] = useState<User[]>([]);
  const [selectedOwner, setSelectedOwner] = useState<string>('');
  const [selectedManagers, setSelectedManagers] = useState<string[]>([]);
  
  // Estados para divisiones administrativas
  const [states, setStates] = useState<State[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [parishes, setParishes] = useState<Parish[]>([]);
  const [selectedStateId, setSelectedStateId] = useState<string>('');
  const [selectedMunicipalityId, setSelectedMunicipalityId] = useState<string>('');
  const [selectedParishId, setSelectedParishId] = useState<string>('');
  
  const { user } = useAuth();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();

  // Verificar permisos
  const isAdmin = user?.role === 'admin';

  const loadStores = async () => {
    try {
      setIsLoading(true);
      
      const response = await storeService.getStores({
        page: currentPage,
        limit: 1000, // Cargar todas las tiendas
        search: searchQuery || undefined,
        city: selectedCity !== 'all' ? selectedCity : undefined,
        state: selectedState !== 'all' ? selectedState : undefined,
        isActive: selectedStatus !== 'all' ? selectedStatus === 'active' : undefined
      });
      
      if (response.success && response.data) {
        setStores(response.data.stores || []);
        setTotalStores(response.data.pagination?.total || 0);
        setTotalPages(response.data.pagination?.totalPages || 1);
        console.log(`✅ Cargadas ${response.data.stores?.length || 0} tiendas`);
      } else {
        console.error('❌ Error cargando tiendas:', response.error);
        showToast('Error al cargar tiendas', 'error');
      }
      
    } catch (error) {
      console.error('Error cargando tiendas:', error);
      showToast('Error al cargar tiendas', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await storeService.getStoreStats();
      if (response.success && response.data) {
        setStats(response.data);
        console.log(`✅ Estadísticas cargadas: ${response.data.totalStores} tiendas totales`);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadAvailableUsers = async () => {
    try {
      const [ownersResponse, managersResponse] = await Promise.all([
        storeService.getAvailableOwners(),
        storeService.getAvailableManagers()
      ]);

      if (ownersResponse.success && ownersResponse.data) {
        setAvailableOwners(ownersResponse.data);
        console.log(`✅ Cargados ${ownersResponse.data.length} propietarios disponibles`);
      }

      if (managersResponse.success && managersResponse.data) {
        setAvailableManagers(managersResponse.data);
        console.log(`✅ Cargados ${managersResponse.data.length} managers disponibles`);
      }
    } catch (error) {
      console.error('Error loading available users:', error);
    }
  };

  const loadStates = async () => {
    try {
      const response = await administrativeDivisionService.getStates();
      if (response.success && response.data) {
        setStates(response.data);
        console.log(`✅ Cargados ${response.data.length} estados`);
      }
    } catch (error) {
      console.error('Error loading states:', error);
    }
  };

  const loadMunicipalities = async (stateId: string) => {
    try {
      const response = await administrativeDivisionService.getMunicipalitiesByState(stateId);
      if (response.success && response.data) {
        setMunicipalities(response.data);
        console.log(`✅ Cargados ${response.data.length} municipios`);
      }
    } catch (error) {
      console.error('Error loading municipalities:', error);
    }
  };

  const loadParishes = async (municipalityId: string) => {
    try {
      const response = await administrativeDivisionService.getParishesByMunicipality(municipalityId);
      if (response.success && response.data) {
        setParishes(response.data);
        console.log(`✅ Cargadas ${response.data.length} parroquias`);
      }
    } catch (error) {
      console.error('Error loading parishes:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Limpiar caché y resetear circuit breaker antes de refrescar
      requestCache.clear();
      circuitBreaker.reset();
      console.log('🧹 Cache limpiado y circuit breaker reseteado para refresh');
      
      // Cargar datos de manera secuencial para evitar rate limiting
      await loadStores();
      await loadStats();
      await loadAvailableUsers();
      await loadStates();
    } catch (error) {
      console.error('Error during refresh:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [searchQuery, selectedCity, selectedState, selectedStatus, currentPage]);

  const toggleStoreStatus = async (storeId: string, currentStatus: boolean) => {
    try {
      const response = await storeService.toggleStoreStatus(storeId);
      
      if (response.success && response.data) {
              setStores(prevStores =>
                prevStores.map(store =>
            store._id === storeId ? response.data! : store
          )
        );
        showToast(
          `Tienda ${!currentStatus ? 'activada' : 'desactivada'} exitosamente`,
          'success'
        );
      } else {
        showToast(response.error || 'Error al cambiar estado de la tienda', 'error');
      }
            } catch (error) {
      console.error('Error toggling store status:', error);
      showToast('Error al cambiar estado de la tienda', 'error');
            }
  };

  const deleteStore = async (storeId: string, storeName: string) => {
    Alert.alert(
      'Eliminar Tienda',
      `¿Estás seguro de que quieres eliminar "${storeName}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await storeService.deleteStore(storeId);
              
              if (response.success) {
                setStores(prevStores => 
                  prevStores.filter(store => store._id !== storeId)
                );
              showToast('Tienda eliminada exitosamente', 'success');
              } else {
                showToast(response.error || 'Error al eliminar tienda', 'error');
              }
            } catch (error) {
              console.error('Error deleting store:', error);
              showToast('Error al eliminar tienda', 'error');
            }
          }
        }
      ]
    );
  };

  const openCreateModal = () => {
    setFormData({
      name: '',
      description: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Venezuela',
      phone: '',
      email: '',
      website: '',
      latitude: '',
      longitude: '',
      currency: 'USD',
      taxRate: '16.0',
      deliveryRadius: '10',
      minimumOrder: '0',
      autoAcceptOrders: false
    });
    setSelectedOwner('');
    setSelectedManagers([]);
    setSelectedStateId('');
    setSelectedMunicipalityId('');
    setSelectedParishId('');
    setMunicipalities([]);
    setParishes([]);
    setShowCreateModal(true);
  };

  const openEditModal = async (store: Store) => {
    setSelectedStore(store);
    setFormData({
      name: store.name,
      description: store.description || '',
      address: store.address,
      city: store.city,
      state: store.state,
      zipCode: store.zipCode,
      country: store.country,
      phone: store.phone,
      email: store.email,
      website: store.website || '',
      latitude: store.coordinates.latitude.toString(),
      longitude: store.coordinates.longitude.toString(),
      currency: store.settings.currency,
      taxRate: store.settings.taxRate.toString(),
      deliveryRadius: store.settings.deliveryRadius.toString(),
      minimumOrder: store.settings.minimumOrder.toString(),
      autoAcceptOrders: store.settings.autoAcceptOrders
    });
    
    // Cargar usuarios disponibles para edición
    await loadAvailableUsers();
    
    // Cargar divisiones administrativas
    await loadStates();
    
    setShowEditModal(true);
  };

  const openViewModal = (store: Store) => {
    setSelectedStore(store);
    setShowViewModal(true);
  };

  const openManagersModal = (store: Store) => {
    setSelectedStore(store);
    setShowManagersModal(true);
  };

  const handleCreateStore = async () => {
    // Validar campos obligatorios
    if (!formData.name || !formData.address || !formData.city || !formData.state || !formData.zipCode || !formData.phone || !formData.email) {
      showToast('Por favor completa todos los campos obligatorios', 'error');
      return;
    }

    // Validar que se haya seleccionado un propietario
    if (!selectedOwner) {
      showToast('Por favor selecciona un propietario para la tienda', 'error');
      return;
    }

    try {
      const storeData = {
        ...formData,
        owner: selectedOwner,
        managers: selectedManagers,
        coordinates: {
          latitude: Number(formData.latitude) || 0,
          longitude: Number(formData.longitude) || 0
        },
        businessHours: {
          monday: { open: '08:00', close: '18:00', isOpen: true },
          tuesday: { open: '08:00', close: '18:00', isOpen: true },
          wednesday: { open: '08:00', close: '18:00', isOpen: true },
          thursday: { open: '08:00', close: '18:00', isOpen: true },
          friday: { open: '08:00', close: '18:00', isOpen: true },
          saturday: { open: '08:00', close: '18:00', isOpen: true },
          sunday: { open: '08:00', close: '18:00', isOpen: false }
        },
        settings: {
          currency: formData.currency,
          taxRate: Number(formData.taxRate),
          deliveryRadius: Number(formData.deliveryRadius),
          minimumOrder: Number(formData.minimumOrder),
          autoAcceptOrders: formData.autoAcceptOrders
        }
      };

      const response = await storeService.createStore(storeData);
      
      if (response.success && response.data) {
        setShowCreateModal(false);
        loadStores();
        showToast('Tienda creada exitosamente', 'success');
      } else {
        showToast(response.error || 'Error al crear tienda', 'error');
      }
    } catch (error) {
      console.error('Error creating store:', error);
      showToast('Error al crear tienda', 'error');
    }
  };

  const handleUpdateStore = async () => {
    if (!selectedStore) return;
    
    // Validar campos obligatorios
    if (!formData.name || !formData.address || !formData.city || !formData.state || !formData.zipCode || !formData.phone || !formData.email) {
      showToast('Por favor completa todos los campos obligatorios', 'error');
      return;
    }
    
    try {
      const storeData = {
        ...formData,
        coordinates: {
          latitude: Number(formData.latitude) || 0,
          longitude: Number(formData.longitude) || 0
        },
        settings: {
          currency: formData.currency,
          taxRate: Number(formData.taxRate),
          deliveryRadius: Number(formData.deliveryRadius),
          minimumOrder: Number(formData.minimumOrder),
          autoAcceptOrders: formData.autoAcceptOrders
        }
      };

      const response = await storeService.updateStore(selectedStore._id, storeData);
      
      if (response.success && response.data) {
        setShowEditModal(false);
        setSelectedStore(null);
        loadStores();
        showToast('Tienda actualizada exitosamente', 'success');
      } else {
        showToast(response.error || 'Error al actualizar tienda', 'error');
      }
    } catch (error) {
      console.error('Error updating store:', error);
      showToast('Error al actualizar tienda', 'error');
    }
  };

  const addManager = async () => {
    if (!selectedStore || !newManagerEmail) {
      showToast('Por favor ingresa un email válido', 'error');
      return;
    }

    try {
      const response = await storeService.addManager(selectedStore._id, newManagerEmail);
      
      if (response.success && response.data) {
        setNewManagerEmail('');
        setSelectedStore(response.data);
        showToast('Manager agregado exitosamente', 'success');
      } else {
        showToast(response.error || 'Error al agregar manager', 'error');
      }
    } catch (error) {
      console.error('Error adding manager:', error);
      showToast('Error al agregar manager', 'error');
    }
  };

  const removeManager = async (managerId: string) => {
    if (!selectedStore) return;

    try {
      const response = await storeService.removeManager(selectedStore._id, managerId);
      
      if (response.success && response.data) {
        setSelectedStore(response.data);
        showToast('Manager removido exitosamente', 'success');
      } else {
        showToast(response.error || 'Error al remover manager', 'error');
      }
    } catch (error) {
      console.error('Error removing manager:', error);
      showToast('Error al remover manager', 'error');
    }
  };

  const renderStoreItem = ({ item }: { item: Store }) => (
    <View style={styles.storeCard}>
      <View style={styles.storeHeader}>
        <View style={styles.storeInfo}>
          <Text style={styles.storeName}>{item.name || 'Sin nombre'}</Text>
          <Text style={styles.storeAddress}>
            {item.address || 'Sin dirección'}, {item.city || 'Sin ciudad'}, {item.state || 'Sin estado'}
          </Text>
          <Text style={styles.storeContact}>
            📞 {item.phone || 'Sin teléfono'} | ✉️ {item.email || 'Sin email'}
          </Text>
        </View>
      <View style={styles.storeActions}>
        <TouchableOpacity
            style={[
              styles.statusButton,
              { backgroundColor: item.isActive ? '#10B981' : '#EF4444' }
            ]}
          onPress={() => toggleStoreStatus(item._id, item.isActive)}
        >
          <Ionicons 
              name={item.isActive ? 'checkmark' : 'close'}
              size={16}
            color="white" 
          />
        </TouchableOpacity>
        <TouchableOpacity
            style={styles.actionButton}
            onPress={() => openViewModal(item)}
          >
            <Ionicons name="eye" size={16} color="#3B82F6" />
        </TouchableOpacity>
        <TouchableOpacity
            style={styles.actionButton}
            onPress={() => openEditModal(item)}
          >
            <Ionicons name="pencil" size={16} color="#F59E0B" />
        </TouchableOpacity>
        <TouchableOpacity
            style={styles.actionButton}
            onPress={() => openManagersModal(item)}
          >
            <Ionicons name="people" size={16} color="#8B5CF6" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
          onPress={() => deleteStore(item._id, item.name)}
        >
            <Ionicons name="trash" size={16} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
      
      <View style={styles.storeDetails}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Propietario:</Text>
          <Text style={styles.detailValue}>{item.owner?.name || 'Sin propietario'}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Managers:</Text>
          <Text style={styles.detailValue}>{item.managers?.length || 0}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Moneda:</Text>
          <Text style={styles.detailValue}>{item.settings?.currency || 'N/A'}</Text>
        </View>
      </View>
      
      <View style={styles.storeFooter}>
        <Text style={styles.storeDate}>
          Creado: {new Date(item.createdAt).toLocaleDateString()}
        </Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: item.isActive ? '#D1FAE5' : '#FEE2E2' }
        ]}>
          <Text style={[
            styles.statusText,
            { color: item.isActive ? '#065F46' : '#991B1B' }
          ]}>
            {item.isActive ? 'Activa' : 'Inactiva'}
          </Text>
        </View>
        </View>
      </View>
    );

  useEffect(() => {
    const loadDataSequentially = async () => {
      try {
        // Cargar datos de manera secuencial para evitar rate limiting
        await loadStores();
        await loadStats();
        await loadAvailableUsers();
        await loadStates();
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    
    loadDataSequentially();
  }, [searchQuery, selectedCity, selectedState, selectedStatus, currentPage]);

  useFocusEffect(
    useCallback(() => {
      if (isAdmin) {
        const loadDataSequentially = async () => {
          try {
            // Cargar datos de manera secuencial para evitar rate limiting
            await loadStores();
            await loadStats();
            await loadAvailableUsers();
            await loadStates();
          } catch (error) {
            console.error('Error loading data on focus:', error);
          }
        };
        
        loadDataSequentially();
      }
    }, [isAdmin])
  );

  if (!isAdmin) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
        <View style={styles.accessDeniedContainer}>
          <Ionicons name="lock-closed" size={64} color="#EF4444" />
          <Text style={styles.accessDeniedTitle}>Acceso Denegado</Text>
          <Text style={styles.accessDeniedMessage}>
            No tienes permisos para acceder a la gestión de tiendas.
          </Text>
          <Text style={styles.accessDeniedMessage}>
            Tu rol actual: {user?.role || 'No definido'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gestión de Tiendas</Text>
        <Text style={styles.headerSubtitle}>
          {totalStores} tiendas encontradas
        </Text>
      </View>

      {/* Estadísticas */}
      {stats && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalStores}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.activeStores}</Text>
            <Text style={styles.statLabel}>Activas</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.inactiveStores}</Text>
            <Text style={styles.statLabel}>Inactivas</Text>
          </View>
        </View>
      )}

      {/* Search Bar and Controls */}
        <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar tiendas..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          placeholderTextColor="#9CA3AF"
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={openCreateModal}
        >
          <Ionicons name="add" size={20} color="white" />
        </TouchableOpacity>
        </View>

      {/* Stores List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Cargando tiendas...</Text>
        </View>
      ) : (
        <FlatList
          data={stores}
          renderItem={renderStoreItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.storesList}
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
              <Ionicons name="storefront-outline" size={64} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>No se encontraron tiendas</Text>
              <Text style={styles.emptyMessage}>
                Intenta ajustar los filtros de búsqueda
              </Text>
            </View>
          }
        />
      )}

      {/* Modal para crear/editar tienda */}
      <Modal
        visible={showCreateModal || showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {showCreateModal ? 'Crear Tienda' : 'Editar Tienda'}
              </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setShowCreateModal(false);
                setShowEditModal(false);
                setSelectedStore(null);
              }}
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Nombre de la tienda *"
              value={formData.name}
              onChangeText={(text) => setFormData({...formData, name: text})}
            />
            <TextInput
              style={styles.input}
              placeholder="Descripción"
              value={formData.description}
              onChangeText={(text) => setFormData({...formData, description: text})}
              multiline
            />
            <TextInput
              style={styles.input}
              placeholder="Dirección *"
              value={formData.address}
              onChangeText={(text) => setFormData({...formData, address: text})}
            />
            {/* Selector de Estado */}
            <View style={styles.selectContainer}>
              <Text style={styles.selectLabel}>Estado *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.userSelector}>
                {states.map((state) => (
                  <TouchableOpacity
                    key={state._id}
                    style={[
                      styles.userOption,
                      selectedStateId === state._id && styles.userOptionSelected
                    ]}
                    onPress={() => {
                      setSelectedStateId(state._id);
                      setFormData({...formData, state: state.name});
                      setSelectedMunicipalityId('');
                      setSelectedParishId('');
                      setMunicipalities([]);
                      setParishes([]);
                      loadMunicipalities(state._id);
                    }}
                  >
                    <Text style={[
                      styles.userOptionText,
                      selectedStateId === state._id && styles.userOptionTextSelected
                    ]}>
                      {state.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Selector de Municipio */}
            {municipalities.length > 0 && (
              <View style={styles.selectContainer}>
                <Text style={styles.selectLabel}>Municipio *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.userSelector}>
                  {municipalities.map((municipality) => (
                    <TouchableOpacity
                      key={municipality._id}
                      style={[
                        styles.userOption,
                        selectedMunicipalityId === municipality._id && styles.userOptionSelected
                      ]}
                      onPress={() => {
                        setSelectedMunicipalityId(municipality._id);
                        setFormData({...formData, city: municipality.name});
                        setSelectedParishId('');
                        setParishes([]);
                        loadParishes(municipality._id);
                      }}
                    >
                      <Text style={[
                        styles.userOptionText,
                        selectedMunicipalityId === municipality._id && styles.userOptionTextSelected
                      ]}>
                        {municipality.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Selector de Parroquia */}
            {parishes.length > 0 && (
              <View style={styles.selectContainer}>
                <Text style={styles.selectLabel}>Parroquia (opcional)</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.userSelector}>
                  {parishes.map((parish) => (
                    <TouchableOpacity
                      key={parish._id}
                      style={[
                        styles.userOption,
                        selectedParishId === parish._id && styles.userOptionSelected
                      ]}
                      onPress={() => {
                        setSelectedParishId(parish._id);
                      }}
                    >
                      <Text style={[
                        styles.userOptionText,
                        selectedParishId === parish._id && styles.userOptionTextSelected
                      ]}>
                        {parish.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
            <TextInput
              style={styles.input}
              placeholder="Código postal *"
              value={formData.zipCode}
              onChangeText={(text) => setFormData({...formData, zipCode: text})}
            />
            <TextInput
              style={styles.input}
              placeholder="Teléfono *"
              value={formData.phone}
              onChangeText={(text) => setFormData({...formData, phone: text})}
            />
            <TextInput
              style={styles.input}
              placeholder="Email *"
              value={formData.email}
              onChangeText={(text) => setFormData({...formData, email: text})}
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              placeholder="Sitio web"
              value={formData.website}
              onChangeText={(text) => setFormData({...formData, website: text})}
            />
            
            {/* Selección de Propietario */}
            <View style={styles.selectContainer}>
              <Text style={styles.selectLabel}>Propietario *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.userSelector}>
                {availableOwners.map((owner) => (
            <TouchableOpacity
                    key={owner._id}
                    style={[
                      styles.userOption,
                      selectedOwner === owner._id && styles.userOptionSelected
                    ]}
                    onPress={() => setSelectedOwner(owner._id)}
                  >
                    <Text style={[
                      styles.userOptionText,
                      selectedOwner === owner._id && styles.userOptionTextSelected
                    ]}>
                      {owner.name}
              </Text>
            </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Selección de Managers */}
            <View style={styles.selectContainer}>
              <Text style={styles.selectLabel}>Managers (opcional)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.userSelector}>
                {availableManagers.map((manager) => (
            <TouchableOpacity
                    key={manager._id}
                    style={[
                      styles.userOption,
                      selectedManagers.includes(manager._id) && styles.userOptionSelected
                    ]}
                    onPress={() => {
                      if (selectedManagers.includes(manager._id)) {
                        setSelectedManagers(selectedManagers.filter(id => id !== manager._id));
                      } else {
                        setSelectedManagers([...selectedManagers, manager._id]);
                      }
                    }}
                  >
                    <Text style={[
                      styles.userOptionText,
                      selectedManagers.includes(manager._id) && styles.userOptionTextSelected
                    ]}>
                      {manager.name}
              </Text>
            </TouchableOpacity>
                ))}
              </ScrollView>
          </View>

            <TextInput
              style={styles.input}
              placeholder="Latitud"
              value={formData.latitude}
              onChangeText={(text) => setFormData({...formData, latitude: text})}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Longitud"
              value={formData.longitude}
              onChangeText={(text) => setFormData({...formData, longitude: text})}
              keyboardType="numeric"
            />
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowCreateModal(false);
                setShowEditModal(false);
                setSelectedStore(null);
              }}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={showCreateModal ? handleCreateStore : handleUpdateStore}
            >
              <Text style={styles.saveButtonText}>
                {showCreateModal ? 'Crear' : 'Actualizar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal para ver detalles de tienda */}
      <Modal
        visible={showViewModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Detalles de la Tienda</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setShowViewModal(false);
                setSelectedStore(null);
              }}
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
      </View>

          {selectedStore && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Información General</Text>
                <Text style={styles.detailText}>Nombre: {selectedStore.name}</Text>
                <Text style={styles.detailText}>Descripción: {selectedStore.description || 'N/A'}</Text>
                <Text style={styles.detailText}>Dirección: {selectedStore.address}</Text>
                <Text style={styles.detailText}>Ciudad: {selectedStore.city}</Text>
                <Text style={styles.detailText}>Estado: {selectedStore.state}</Text>
                <Text style={styles.detailText}>Código Postal: {selectedStore.zipCode}</Text>
                <Text style={styles.detailText}>País: {selectedStore.country}</Text>
          </View>
              
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Contacto</Text>
                <Text style={styles.detailText}>Teléfono: {selectedStore.phone}</Text>
                <Text style={styles.detailText}>Email: {selectedStore.email}</Text>
                <Text style={styles.detailText}>Sitio Web: {selectedStore.website || 'N/A'}</Text>
      </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Propietario</Text>
                <Text style={styles.detailText}>Nombre: {selectedStore.owner?.name || 'Sin propietario'}</Text>
                <Text style={styles.detailText}>Email: {selectedStore.owner?.email || 'Sin email'}</Text>
          </View>
              
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Managers ({selectedStore.managers?.length || 0})</Text>
                {selectedStore.managers?.map((manager, index) => (
                  <Text key={index} style={styles.detailText}>
                    {manager.name || 'Sin nombre'} ({manager.email || 'Sin email'})
                  </Text>
                )) || <Text style={styles.detailText}>No hay managers asignados</Text>}
              </View>
              
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Configuración</Text>
                <Text style={styles.detailText}>Moneda: {selectedStore.settings?.currency || 'N/A'}</Text>
                <Text style={styles.detailText}>Tasa de impuesto: {selectedStore.settings?.taxRate || 0}%</Text>
                <Text style={styles.detailText}>Radio de entrega: {selectedStore.settings?.deliveryRadius || 0} km</Text>
                <Text style={styles.detailText}>Pedido mínimo: ${selectedStore.settings?.minimumOrder || 0}</Text>
                <Text style={styles.detailText}>
                  Aceptar pedidos automáticamente: {selectedStore.settings?.autoAcceptOrders ? 'Sí' : 'No'}
                </Text>
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>

      {/* Modal para gestión de managers */}
      <Modal
        visible={showManagersModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Gestión de Managers</Text>
      <TouchableOpacity
              style={styles.closeButton}
        onPress={() => {
                setShowManagersModal(false);
                setSelectedStore(null);
                setNewManagerEmail('');
        }}
      >
              <Ionicons name="close" size={24} color="#6B7280" />
      </TouchableOpacity>
          </View>
          
          {selectedStore && (
            <View style={styles.modalContent}>
              <View style={styles.addManagerContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Email del nuevo manager"
                  value={newManagerEmail}
                  onChangeText={setNewManagerEmail}
                  keyboardType="email-address"
                />
                <TouchableOpacity
                  style={styles.addManagerButton}
                  onPress={addManager}
                >
                  <Text style={styles.addManagerButtonText}>Agregar Manager</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.managersList}>
                <Text style={styles.managersTitle}>Managers Actuales ({selectedStore.managers?.length || 0})</Text>
                {selectedStore.managers?.map((manager, index) => (
                  <View key={index} style={styles.managerItem}>
                    <View style={styles.managerInfo}>
                      <Text style={styles.managerName}>{manager.name || 'Sin nombre'}</Text>
                      <Text style={styles.managerEmail}>{manager.email || 'Sin email'}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.removeManagerButton}
                      onPress={() => removeManager(manager._id)}
                    >
                      <Ionicons name="trash" size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                )) || <Text style={styles.detailText}>No hay managers asignados</Text>}
              </View>
            </View>
          )}
        </View>
      </Modal>
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
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginVertical: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  addButton: {
    backgroundColor: '#3B82F6',
    padding: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  storesList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  storeCard: {
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
  storeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  storeAddress: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  storeContact: {
    fontSize: 12,
    color: '#6B7280',
  },
  storeActions: {
    flexDirection: 'row',
    gap: 8,
  },
  statusButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFE5E5',
    borderWidth: 1,
    borderColor: '#FFB3B3',
  },
  storeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  storeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  storeDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  accessDeniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  accessDeniedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  accessDeniedMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  // Estilos para modales
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    marginBottom: 16,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  detailSection: {
    marginBottom: 24,
  },
  detailSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 20,
  },
  addManagerContainer: {
    marginBottom: 24,
  },
  addManagerButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addManagerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  managersList: {
    flex: 1,
  },
  managersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  managerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  managerInfo: {
    flex: 1,
  },
  managerName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  managerEmail: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  removeManagerButton: {
    padding: 8,
  },
  // Estilos para selección de usuarios
  selectContainer: {
    marginBottom: 16,
  },
  selectLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  userSelector: {
    flexDirection: 'row',
  },
  userOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  userOptionSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  userOptionText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  userOptionTextSelected: {
    color: 'white',
  },
});

export default AdminStoresScreen;