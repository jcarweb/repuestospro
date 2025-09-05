import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { Ionicons } from '@expo/vector-icons';

const PrivacySettingsScreen: React.FC = () => {
  const { colors } = useTheme();
  const { showToast } = useToast();
  
  const [profileVisibility, setProfileVisibility] = useState('public');
  const [dataCollection, setDataCollection] = useState(true);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [locationTracking, setLocationTracking] = useState(false);
  const [adPersonalization, setAdPersonalization] = useState(false);
  const [dataSharing, setDataSharing] = useState(false);

  useEffect(() => {
    loadPrivacySettings();
  }, []);

  const loadPrivacySettings = async () => {
    // Aquí cargarías las configuraciones desde AsyncStorage o backend
    // Por ahora usamos valores por defecto
    setProfileVisibility('public');
    setDataCollection(true);
    setAnalyticsEnabled(true);
    setLocationTracking(false);
    setAdPersonalization(false);
    setDataSharing(false);
  };

  const handleProfileVisibilityChange = () => {
    Alert.alert(
      'Visibilidad del Perfil',
      'Selecciona quién puede ver tu perfil:',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Público',
          onPress: () => {
            setProfileVisibility('public');
            showToast('Perfil configurado como público', 'info');
          },
        },
        {
          text: 'Solo Amigos',
          onPress: () => {
            setProfileVisibility('friends');
            showToast('Perfil visible solo para amigos', 'info');
          },
        },
        {
          text: 'Privado',
          onPress: () => {
            setProfileVisibility('private');
            showToast('Perfil configurado como privado', 'info');
          },
        },
      ]
    );
  };

  const handleDataCollectionToggle = (value: boolean) => {
    if (!value) {
      Alert.alert(
        'Desactivar Recopilación de Datos',
        'Al desactivar esto, algunas funciones de la aplicación pueden no funcionar correctamente.',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Desactivar',
            style: 'destructive',
            onPress: () => {
              setDataCollection(false);
              showToast('Recopilación de datos desactivada', 'info');
            },
          },
        ]
      );
    } else {
      setDataCollection(true);
      showToast('Recopilación de datos activada', 'info');
    }
  };

  const handleAnalyticsToggle = (value: boolean) => {
    setAnalyticsEnabled(value);
    showToast(
      value ? 'Analíticas activadas' : 'Analíticas desactivadas',
      'info'
    );
  };

  const handleLocationTrackingToggle = (value: boolean) => {
    if (value) {
      Alert.alert(
        'Activar Seguimiento de Ubicación',
        'Esto nos permite ofrecerte productos y servicios más relevantes basados en tu ubicación.',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Activar',
            onPress: () => {
              setLocationTracking(true);
              showToast('Seguimiento de ubicación activado', 'info');
            },
          },
        ]
      );
    } else {
      setLocationTracking(false);
      showToast('Seguimiento de ubicación desactivado', 'info');
    }
  };

  const handleAdPersonalizationToggle = (value: boolean) => {
    setAdPersonalization(value);
    showToast(
      value ? 'Personalización de anuncios activada' : 'Personalización de anuncios desactivada',
      'info'
    );
  };

  const handleDataSharingToggle = (value: boolean) => {
    if (value) {
      Alert.alert(
        'Compartir Datos con Terceros',
        'Esto permite que compartamos datos anónimos con socios para mejorar nuestros servicios.',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Permitir',
            onPress: () => {
              setDataSharing(true);
              showToast('Compartir datos con terceros activado', 'info');
            },
          },
        ]
      );
    } else {
      setDataSharing(false);
      showToast('Compartir datos con terceros desactivado', 'info');
    }
  };

  const handleDeleteData = () => {
    Alert.alert(
      'Eliminar Datos Personales',
      'Esto eliminará todos tus datos personales de nuestros servidores. Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            showToast('Solicitud de eliminación de datos enviada', 'warning');
          },
        },
      ]
    );
  };

  const handleDownloadData = () => {
    showToast('Preparando descarga de datos...', 'info');
    // Aquí implementarías la lógica de descarga
  };

  const getVisibilityText = (visibility: string) => {
    switch (visibility) {
      case 'public': return 'Público';
      case 'friends': return 'Solo Amigos';
      case 'private': return 'Privado';
      default: return 'Público';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Configuración de Privacidad
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Controla cómo se usa y comparte tu información
          </Text>
        </View>

        {/* Perfil */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Perfil
          </Text>
          
          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={handleProfileVisibilityChange}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="eye-outline" size={24} color={colors.primary} />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>
                  Visibilidad del Perfil
                </Text>
                <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                  {getVisibilityText(profileVisibility)}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Datos y Analíticas */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Datos y Analíticas
          </Text>
          
          <View style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.settingLeft}>
              <Ionicons name="analytics-outline" size={24} color={colors.primary} />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>
                  Recopilación de Datos
                </Text>
                <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                  Permite recopilar datos para mejorar la app
                </Text>
              </View>
            </View>
            <Switch
              value={dataCollection}
              onValueChange={handleDataCollectionToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={dataCollection ? '#000000' : colors.textTertiary}
            />
          </View>

          <View style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.settingLeft}>
              <Ionicons name="bar-chart-outline" size={24} color={colors.primary} />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>
                  Analíticas de Uso
                </Text>
                <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                  Ayuda a mejorar la experiencia de usuario
                </Text>
              </View>
            </View>
            <Switch
              value={analyticsEnabled}
              onValueChange={handleAnalyticsToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={analyticsEnabled ? '#000000' : colors.textTertiary}
            />
          </View>
        </View>

        {/* Ubicación */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Ubicación
          </Text>
          
          <View style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.settingLeft}>
              <Ionicons name="location-outline" size={24} color={colors.primary} />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>
                  Seguimiento de Ubicación
                </Text>
                <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                  Ofrecer productos basados en tu ubicación
                </Text>
              </View>
            </View>
            <Switch
              value={locationTracking}
              onValueChange={handleLocationTrackingToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={locationTracking ? '#000000' : colors.textTertiary}
            />
          </View>
        </View>

        {/* Publicidad */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Publicidad
          </Text>
          
          <View style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.settingLeft}>
              <Ionicons name="megaphone-outline" size={24} color={colors.primary} />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>
                  Personalización de Anuncios
                </Text>
                <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                  Mostrar anuncios relevantes para ti
                </Text>
              </View>
            </View>
            <Switch
              value={adPersonalization}
              onValueChange={handleAdPersonalizationToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={adPersonalization ? '#000000' : colors.textTertiary}
            />
          </View>
        </View>

        {/* Compartir Datos */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Compartir Datos
          </Text>
          
          <View style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.settingLeft}>
              <Ionicons name="share-outline" size={24} color={colors.primary} />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>
                  Compartir con Terceros
                </Text>
                <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                  Datos anónimos para mejorar servicios
                </Text>
              </View>
            </View>
            <Switch
              value={dataSharing}
              onValueChange={handleDataSharingToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={dataSharing ? '#000000' : colors.textTertiary}
            />
          </View>
        </View>

        {/* Gestión de Datos */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Gestión de Datos
          </Text>
          
          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={handleDownloadData}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="download-outline" size={24} color={colors.primary} />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>
                  Descargar Mis Datos
                </Text>
                <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                  Obtener una copia de tu información
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: colors.error + '20', borderColor: colors.error }]}
            onPress={handleDeleteData}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="trash-outline" size={24} color={colors.error} />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: colors.error }]}>
                  Eliminar Datos Personales
                </Text>
                <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                  Eliminar permanentemente tu información
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.error} />
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
    marginBottom: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
  },
});

export default PrivacySettingsScreen;
