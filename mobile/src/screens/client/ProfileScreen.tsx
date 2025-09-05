import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const ProfileScreen: React.FC = () => {
  const { colors } = useTheme();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigation = useNavigation();
  
  // Estado para controlar si el componente está listo para renderizar
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Pequeño delay para asegurar que el contexto esté estable
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleEditProfile = () => {
    console.log('Botón Editar presionado');
    navigation.navigate('EditProfile' as never);
  };



  const handleOrdersPress = () => {
    // Navegar a la pestaña de Pedidos
    (navigation as any).navigate('ClientTabs', { screen: 'Orders' });
  };

  const handleFavoritesPress = () => {
    // Navegar a la pestaña de Favoritos
    (navigation as any).navigate('ClientTabs', { screen: 'Favorites' });
  };

  const handleRatingPress = () => {
    navigation.navigate('Reviews' as never);
  };

  const handleSettingsPress = () => {
    navigation.navigate('Settings' as never);
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              showToast('Cerrando sesión...', 'info');
              await logout();
              showToast('Sesión cerrada correctamente', 'success');
            } catch (error) {
              showToast('Error al cerrar sesión', 'error');
            }
          },
        },
      ]
    );
  };

  console.log('ProfileScreen render - user:', user, 'isReady:', isReady);

  // Si no está listo o no hay usuario, no renderizar nada
  if (!isReady || !user) {
    return null;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header simple */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        {/* Foto de perfil */}
        <View style={styles.profileImageContainer}>
          {user?.profileImage ? (
            <Image source={{ uri: user.profileImage }} style={styles.profileImage} />
          ) : (
            <View style={[styles.profileImagePlaceholder, { backgroundColor: colors.primary }]}>
              <Ionicons name="person" size={40} color="#000000" />
            </View>
          )}
        </View>
        
        <Text style={[styles.userName, { color: colors.textPrimary }]}>
          {user?.name || 'Juan Carlos Hernandez'}
        </Text>
        <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
          {user?.email || 'juan.hernandez@email.com'}
        </Text>
        
        <TouchableOpacity
          style={[styles.editButton, { backgroundColor: colors.primary }]}
          onPress={handleEditProfile}
        >
          <Ionicons name="pencil" size={16} color="#000000" />
          <Text style={[styles.editButtonText, { color: '#000000' }]}>
            Editar
          </Text>
        </TouchableOpacity>
      </View>



      {/* Información básica */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Información de la Cuenta
        </Text>
        
        <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Miembro desde:
            </Text>
            <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : 'No disponible'}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Último acceso:
            </Text>
            <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
              {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : 'No disponible'}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Tipo de cuenta:
            </Text>
            <Text style={[styles.infoValue, { color: colors.primary }]}>
              {user?.role === 'client' ? 'Cliente' : 
               user?.role === 'admin' ? 'Administrador' :
               user?.role === 'store_manager' ? 'Gestor de Tienda' :
               user?.role === 'delivery' ? 'Repartidor' : 'Usuario'}
            </Text>
          </View>
        </View>
      </View>

      {/* Estadísticas */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Mis Estadísticas
        </Text>
        
        <View style={styles.statsContainer}>
          <TouchableOpacity 
            style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={handleOrdersPress}
          >
            <Ionicons name="bag-outline" size={24} color={colors.primary} />
            <Text style={[styles.statNumber, { color: colors.textPrimary }]}>12</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pedidos</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={handleFavoritesPress}
          >
            <Ionicons name="heart-outline" size={24} color={colors.primary} />
            <Text style={[styles.statNumber, { color: colors.textPrimary }]}>8</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Favoritos</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={handleRatingPress}
          >
            <Ionicons name="star-outline" size={24} color={colors.primary} />
            <Text style={[styles.statNumber, { color: colors.textPrimary }]}>4.8</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Calificación</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Configuración rápida */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Configuración Rápida
        </Text>
        
        <TouchableOpacity
          style={[styles.settingsButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={handleSettingsPress}
        >
          <View style={styles.settingsButtonContent}>
            <Ionicons name="settings-outline" size={24} color={colors.primary} />
            <View style={styles.settingsButtonText}>
              <Text style={[styles.settingsButtonTitle, { color: colors.textPrimary }]}>
                Configuración General
              </Text>
              <Text style={[styles.settingsButtonSubtitle, { color: colors.textSecondary }]}>
                Notificaciones, seguridad y privacidad
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Botón de cerrar sesión */}
      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.error }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="white" />
          <Text style={styles.logoutButtonText}>
            Cerrar Sesión
          </Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    padding: 20,
    marginBottom: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  profileImageContainer: {
    marginBottom: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    marginBottom: 16,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  editButtonText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  settingsButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  settingsButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsButtonText: {
    flex: 1,
    marginLeft: 12,
  },
  settingsButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingsButtonSubtitle: {
    fontSize: 14,
  },
});

export default ProfileScreen;
