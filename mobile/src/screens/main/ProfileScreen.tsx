import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await logout();
            } catch (error) {
              console.error('Error al cerrar sesión:', error);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      id: 'orders',
      title: 'Mis Pedidos',
      icon: 'receipt-outline',
      onPress: () => Alert.alert('Mis Pedidos', 'Funcionalidad próximamente'),
    },
    {
      id: 'favorites',
      title: 'Favoritos',
      icon: 'heart-outline',
      onPress: () => Alert.alert('Favoritos', 'Funcionalidad próximamente'),
    },
    {
      id: 'addresses',
      title: 'Direcciones',
      icon: 'location-outline',
      onPress: () => Alert.alert('Direcciones', 'Funcionalidad próximamente'),
    },
    {
      id: 'payment',
      title: 'Métodos de Pago',
      icon: 'card-outline',
      onPress: () => Alert.alert('Métodos de Pago', 'Funcionalidad próximamente'),
    },
    {
      id: 'notifications',
      title: 'Notificaciones',
      icon: 'notifications-outline',
      onPress: () => Alert.alert('Notificaciones', 'Funcionalidad próximamente'),
    },
    {
      id: 'settings',
      title: 'Configuración',
      icon: 'settings-outline',
      onPress: () => Alert.alert('Configuración', 'Funcionalidad próximamente'),
    },
    {
      id: 'help',
      title: 'Ayuda y Soporte',
      icon: 'help-circle-outline',
      onPress: () => Alert.alert('Ayuda y Soporte', 'Funcionalidad próximamente'),
    },
  ];

  const renderMenuItem = (item: any) => (
    <TouchableOpacity key={item.id} style={styles.menuItem} onPress={item.onPress}>
      <View style={styles.menuItemLeft}>
        <View style={styles.menuIcon}>
          <Ionicons name={item.icon as any} size={24} color="#6B7280" />
        </View>
        <Text style={styles.menuTitle}>{item.title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Mi Perfil</Text>
      </View>

      {/* User Info */}
      <View style={styles.userSection}>
        <View style={styles.userAvatar}>
          {user?.profilePicture ? (
            <Image source={{ uri: user.profilePicture }} style={styles.avatarImage} />
          ) : (
            <Ionicons name="person" size={40} color="#FFFFFF" />
          )}
        </View>
        
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.name || 'Usuario'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'usuario@email.com'}</Text>
          <View style={styles.verificationBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={styles.verificationText}>Email verificado</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.editButton}>
          <Ionicons name="pencil" size={20} color="#FFC300" />
        </TouchableOpacity>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsSection}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>5</Text>
          <Text style={styles.statLabel}>Pedidos</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>12</Text>
          <Text style={styles.statLabel}>Favoritos</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>3</Text>
          <Text style={styles.statLabel}>Direcciones</Text>
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Mi Cuenta</Text>
        <View style={styles.menuContainer}>
          {menuItems.slice(0, 4).map(renderMenuItem)}
        </View>
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Configuración</Text>
        <View style={styles.menuContainer}>
          {menuItems.slice(4, 6).map(renderMenuItem)}
        </View>
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Soporte</Text>
        <View style={styles.menuContainer}>
          {menuItems.slice(6).map(renderMenuItem)}
        </View>
      </View>

      {/* Logout Button */}
      <View style={styles.logoutSection}>
        <TouchableOpacity
          style={[styles.logoutButton, loading && styles.logoutButtonDisabled]}
          onPress={handleLogout}
          disabled={loading}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <Ionicons name="hourglass-outline" size={20} color="#FFFFFF" />
              <Text style={styles.logoutButtonText}>Cerrando sesión...</Text>
            </View>
          ) : (
            <>
              <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
              <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* App Version */}
      <View style={styles.versionSection}>
        <Text style={styles.versionText}>PiezasYA v1.0.0</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 8,
  },
  userAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFC300',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verificationText: {
    fontSize: 12,
    color: '#10B981',
    marginLeft: 4,
  },
  editButton: {
    padding: 8,
  },
  statsSection: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    marginBottom: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFC300',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },
  menuSection: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuTitle: {
    fontSize: 16,
    color: '#111827',
  },
  logoutSection: {
    padding: 20,
    marginTop: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  logoutButtonDisabled: {
    backgroundColor: '#F3F4F6',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  versionSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  versionText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});

export default ProfileScreen;
