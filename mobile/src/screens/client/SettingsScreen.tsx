import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { Ionicons } from '@expo/vector-icons';

const SettingsScreen: React.FC = () => {
  const { colors } = useTheme();
  const { showToast } = useToast();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailMarketing, setEmailMarketing] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const handleNotificationToggle = (value: boolean) => {
    setNotificationsEnabled(value);
    showToast(
      value ? 'Notificaciones activadas' : 'Notificaciones desactivadas',
      'info'
    );
  };

  const handleEmailMarketingToggle = (value: boolean) => {
    setEmailMarketing(value);
    showToast(
      value ? 'Marketing por email activado' : 'Marketing por email desactivado',
      'info'
    );
  };

  const handleBiometricToggle = (value: boolean) => {
    setBiometricEnabled(value);
    showToast(
      value ? 'Autenticación biométrica activada' : 'Autenticación biométrica desactivada',
      'info'
    );
  };

  const handleDarkModeToggle = (value: boolean) => {
    setDarkMode(value);
    showToast(
      value ? 'Modo oscuro activado' : 'Modo claro activado',
      'info'
    );
  };

  const handleSecuritySettings = () => {
    showToast('Abriendo configuración de seguridad...', 'info');
  };

  const handlePrivacySettings = () => {
    showToast('Abriendo configuración de privacidad...', 'info');
  };

  const handleDataExport = () => {
    Alert.alert(
      'Exportar Datos',
      '¿Quieres exportar todos tus datos personales?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Exportar', 
          onPress: () => showToast('Exportando datos...', 'info')
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
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
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
            <Ionicons name="notifications-outline" size={24} color={colors.primary} />
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
            value={notificationsEnabled}
            onValueChange={handleNotificationToggle}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={notificationsEnabled ? '#000000' : colors.textTertiary}
          />
        </View>

        <View style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.settingLeft}>
            <Ionicons name="mail-outline" size={24} color={colors.primary} />
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
            <Ionicons name="finger-print-outline" size={24} color={colors.primary} />
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
            <Ionicons name="shield-outline" size={24} color={colors.primary} />
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>
                Configuración de Seguridad
              </Text>
              <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                Contraseñas, PIN y verificación
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
        </TouchableOpacity>
      </View>

      {/* Apariencia */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Apariencia
        </Text>
        
        <View style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.settingLeft}>
            <Ionicons name="moon-outline" size={24} color={colors.primary} />
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
            value={darkMode}
            onValueChange={handleDarkModeToggle}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={darkMode ? '#000000' : colors.textTertiary}
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
            <Ionicons name="lock-closed-outline" size={24} color={colors.primary} />
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>
                Configuración de Privacidad
              </Text>
              <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                Controla tu información personal
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={handleDataExport}
        >
          <View style={styles.settingLeft}>
            <Ionicons name="download-outline" size={24} color={colors.primary} />
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>
                Exportar Mis Datos
              </Text>
              <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                Descarga toda tu información
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
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
            <Ionicons name="trash-outline" size={24} color={colors.error} />
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, { color: colors.error }]}>
                Eliminar Cuenta
              </Text>
              <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                Elimina permanentemente tu cuenta
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
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

export default SettingsScreen;
