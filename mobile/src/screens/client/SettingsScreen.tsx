import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import Icon from 'react-native-vector-icons/Icon';
import AsyncStorage from '@react-native-async-storage/async-storage';
// expo-notifications removido para evitar errores de dependencias
import { useNavigation } from '@react-navigation/native';

const SettingsScreen: React.FC = () => {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const navigation = useNavigation();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailMarketing, setEmailMarketing] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);

  useEffect(() => {
    loadSettings();
    requestNotificationPermissions();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('userSettings');
      if (settings) {
        const parsedSettings = JSON.parse(settings);
        setNotificationsEnabled(parsedSettings.notificationsEnabled ?? true);
        setEmailMarketing(parsedSettings.emailMarketing ?? false);
        setBiometricEnabled(parsedSettings.biometricEnabled ?? false);
        setPushNotifications(parsedSettings.pushNotifications ?? true);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings: any) => {
    try {
      const currentSettings = await AsyncStorage.getItem('userSettings');
      const settings = currentSettings ? JSON.parse(currentSettings) : {};
      const updatedSettings = { ...settings, ...newSettings };
      await AsyncStorage.setItem('userSettings', JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const requestNotificationPermissions = async () => {
    try {
      // Simular solicitud de permisos de notificación
      showToast('Permisos de notificación simulados', 'info');
      console.log('Solicitando permisos de notificación (simulado)');
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
    }
  };

  const handleNotificationToggle = async (value: boolean) => {
    setNotificationsEnabled(value);
    await saveSettings({ notificationsEnabled: value });
    showToast(
      value ? 'Notificaciones activadas' : 'Notificaciones desactivadas',
      'info'
    );
  };

  const handlePushNotificationToggle = async (value: boolean) => {
    if (value) {
      try {
        // Verificar si estamos en Expo Go (limitaciones conocidas)
        if (__DEV__) {
          setPushNotifications(true);
          await saveSettings({ pushNotifications: true });
          showToast('Notificaciones push activadas (modo desarrollo)', 'success');
        } else {
          // Simular solicitud de permisos
          setPushNotifications(true);
          await saveSettings({ pushNotifications: true });
          showToast('Notificaciones push activadas (simulado)', 'success');
        }
      } catch (error) {
        console.error('Error requesting notification permissions:', error);
        // En caso de error, activar de todas formas en modo desarrollo
        if (__DEV__) {
          setPushNotifications(true);
          await saveSettings({ pushNotifications: true });
          showToast('Notificaciones push activadas (modo limitado)', 'info');
        } else {
          showToast('Error al activar notificaciones push', 'error');
        }
      }
    } else {
      setPushNotifications(false);
      await saveSettings({ pushNotifications: false });
      showToast('Notificaciones push desactivadas', 'info');
    }
  };

  const handleEmailMarketingToggle = async (value: boolean) => {
    setEmailMarketing(value);
    await saveSettings({ emailMarketing: value });
    showToast(
      value ? 'Marketing por email activado' : 'Marketing por email desactivado',
      'info'
    );
  };

  const handleBiometricToggle = async (value: boolean) => {
    setBiometricEnabled(value);
    await saveSettings({ biometricEnabled: value });
    showToast(
      value ? 'Autenticación biométrica activada' : 'Autenticación biométrica desactivada',
      'info'
    );
  };

  const handleDarkModeToggle = () => {
    toggleTheme();
    showToast(
      isDarkMode ? 'Modo claro activado' : 'Modo oscuro activado',
      'info'
    );
  };

  const handleSecuritySettings = () => {
    navigation.navigate('SecuritySettings' as never);
  };

  const handlePrivacySettings = () => {
    navigation.navigate('PrivacySettings' as never);
  };

  const handleDataExport = async () => {
    Alert.alert(
      'Exportar Datos',
      'Se generará un archivo con todos tus datos personales. ¿Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Exportar', 
          onPress: async () => {
            try {
              showToast('Preparando exportación...', 'info');
              
              // Simular exportación de datos
              const userData = {
                profile: {
                  name: 'Usuario',
                  email: 'usuario@email.com',
                  phone: '+57 300 123 4567',
                  createdAt: new Date().toISOString(),
                },
                settings: {
                  notifications: notificationsEnabled,
                  emailMarketing: emailMarketing,
                  biometric: biometricEnabled,
                  pushNotifications: pushNotifications,
                  darkMode: isDarkMode,
                },
                orders: [],
                favorites: [],
                reviews: [],
                exportDate: new Date().toISOString(),
              };

              // En una implementación real, aquí generarías y descargarías el archivo
              await new Promise(resolve => setTimeout(resolve, 2000));
              
              showToast('Datos exportados correctamente', 'success');
            } catch (error) {
              showToast('Error al exportar datos', 'error');
            }
          }
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Eliminar Cuenta',
      '¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: () => showToast('Solicitud de eliminación enviada', 'warning')
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Configuración
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Personaliza tu experiencia
          </Text>
        </View>

        {/* Notificaciones */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Notificaciones
          </Text>
          
          <View style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.settingLeft}>
              <Image 
                source={require('../../../assets/piezasya.png')} 
                style={styles.logoIcon}
                resizeMode="contain"
              />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>
                  Notificaciones Push
                </Text>
                <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                  Recibe alertas de pedidos y ofertas
                </Text>
              </View>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={handlePushNotificationToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={pushNotifications ? '#000000' : colors.textTertiary}
            />
          </View>

          <View style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.settingLeft}>
              <Image 
                source={require('../../../assets/piezasya.png')} 
                style={styles.logoIcon}
                resizeMode="contain"
              />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>
                  Notificaciones en App
                </Text>
                <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                  Alertas dentro de la aplicación
                </Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={notificationsEnabled ? '#000000' : colors.textTertiary}
            />
          </View>

        <View style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.settingLeft}>
            <Icon name="mail-outline" size={24} color={colors.primary} />
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>
                Marketing por Email
              </Text>
              <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                Recibe ofertas y novedades
              </Text>
            </View>
          </View>
          <Switch
            value={emailMarketing}
            onValueChange={handleEmailMarketingToggle}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={emailMarketing ? '#000000' : colors.textTertiary}
          />
        </View>
      </View>

      {/* Seguridad */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Seguridad
        </Text>
        
        <View style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.settingLeft}>
            <Icon name="finger-print-outline" size={24} color={colors.primary} />
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>
                Autenticación Biométrica
              </Text>
              <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                Usar huella dactilar o Face ID
              </Text>
            </View>
          </View>
          <Switch
            value={biometricEnabled}
            onValueChange={handleBiometricToggle}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={biometricEnabled ? '#000000' : colors.textTertiary}
          />
        </View>

        <TouchableOpacity
          style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={handleSecuritySettings}
        >
          <View style={styles.settingLeft}>
            <Icon name="shield-outline" size={24} color={colors.primary} />
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>
                Configuración de Seguridad
              </Text>
              <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                Contraseñas, PIN y verificación
              </Text>
            </View>
          </View>
          <Icon name="chevron-forward" size={20} color={colors.textTertiary} />
        </TouchableOpacity>
      </View>

      {/* Apariencia */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Apariencia
        </Text>
        
        <View style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.settingLeft}>
            <Icon name="moon-outline" size={24} color={colors.primary} />
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>
                Modo Oscuro
              </Text>
              <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                Tema oscuro para la aplicación
              </Text>
            </View>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={handleDarkModeToggle}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={isDarkMode ? '#000000' : colors.textTertiary}
          />
        </View>
      </View>

      {/* Privacidad */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Privacidad
        </Text>
        
        <TouchableOpacity
          style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={handlePrivacySettings}
        >
          <View style={styles.settingLeft}>
            <Icon name="lock-closed-outline" size={24} color={colors.primary} />
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>
                Configuración de Privacidad
              </Text>
              <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                Controla tu información personal
              </Text>
            </View>
          </View>
          <Icon name="chevron-forward" size={20} color={colors.textTertiary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={handleDataExport}
        >
          <View style={styles.settingLeft}>
            <Icon name="download-outline" size={24} color={colors.primary} />
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>
                Exportar Mis Datos
              </Text>
              <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                Descarga toda tu información
              </Text>
            </View>
          </View>
          <Icon name="chevron-forward" size={20} color={colors.textTertiary} />
        </TouchableOpacity>
      </View>

      {/* Cuenta */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Cuenta
        </Text>
        
        <TouchableOpacity
          style={[styles.settingItem, { backgroundColor: colors.error + '20', borderColor: colors.error }]}
          onPress={handleDeleteAccount}
        >
          <View style={styles.settingLeft}>
            <Icon name="trash-outline" size={24} color={colors.error} />
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, { color: colors.error }]}>
                Eliminar Cuenta
              </Text>
              <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                Elimina permanentemente tu cuenta
              </Text>
            </View>
          </View>
          <Icon name="chevron-forward" size={20} color={colors.error} />
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
  logoIcon: {
    width: 24,
    height: 24,
  },
});

export default SettingsScreen;
