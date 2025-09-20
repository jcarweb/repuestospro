import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Platform,
  RefreshControl,
  Alert,
  Switch,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import Icon from 'react-native-vector-icons/Icon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

interface SystemSettings {
  general: {
    appName: string;
    appVersion: string;
    maintenanceMode: boolean;
    registrationEnabled: boolean;
    emailVerificationRequired: boolean;
  };
  business: {
    currency: string;
    taxRate: number;
    deliveryFee: number;
    minimumOrderAmount: number;
    businessHours: {
      open: string;
      close: string;
    };
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    orderNotifications: boolean;
    marketingNotifications: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    passwordMinLength: number;
    sessionTimeout: number;
    maxLoginAttempts: number;
  };
  integrations: {
    googleMapsApiKey: string;
    paymentGateway: string;
    emailService: string;
    smsService: string;
  };
}

type AdminStackParamList = {
  AdminDashboard: undefined;
  AdminSettings: undefined;
  MasterConfiguration: undefined;
  GlobalSettings: undefined;
  SecuritySettings: undefined;
  IntegrationSettings: undefined;
};

type AdminSettingsNavigationProp = StackNavigationProp<AdminStackParamList, 'AdminSettings'>;

const AdminSettingsScreen: React.FC = () => {
  const { colors } = useTheme();
  const { user, token } = useAuth();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<AdminSettingsNavigationProp>();
  
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (token) {
      loadSettings();
    }
  }, [token]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setSettings(data.data);
      }
    } catch (error) {
      console.error('Error cargando configuraciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSettings();
    setRefreshing(false);
  };

  const updateSetting = async (category: string, key: string, value: any) => {
    try {
      setSaving(true);
      const response = await fetch('http://localhost:5000/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          category,
          key,
          value
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setSettings(prev => prev ? {
          ...prev,
          [category]: {
            ...prev[category as keyof SystemSettings],
            [key]: value
          }
        } : null);
        Alert.alert('Éxito', 'Configuración actualizada');
      } else {
        Alert.alert('Error', data.message || 'Error actualizando configuración');
      }
    } catch (error) {
      console.error('Error actualizando configuración:', error);
      Alert.alert('Error', 'Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  const renderSettingCard = (title: string, children: React.ReactNode) => (
    <View style={[styles.settingCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.settingCardTitle, { color: colors.textPrimary }]}>
        {title}
      </Text>
      {children}
    </View>
  );

  const renderSettingRow = (
    icon: string,
    title: string,
    description: string,
    rightElement: React.ReactNode,
    onPress?: () => void
  ) => (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingRowLeft}>
        <View style={[styles.settingIcon, { backgroundColor: colors.primary }]}>
          <Icon name={icon as any} size={20} color="#000000" />
        </View>
        <View style={styles.settingInfo}>
          <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>
            {title}
          </Text>
          <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
            {description}
          </Text>
        </View>
      </View>
      <View style={styles.settingRowRight}>
        {rightElement}
      </View>
    </TouchableOpacity>
  );

  const renderSwitchSetting = (
    icon: string,
    title: string,
    description: string,
    value: boolean,
    onValueChange: (value: boolean) => void
  ) => (
    renderSettingRow(
      icon,
      title,
      description,
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={value ? '#000000' : colors.textTertiary}
        disabled={saving}
      />
    )
  );

  const renderNavigationSetting = (
    icon: string,
    title: string,
    description: string,
    onPress: () => void
  ) => (
    renderSettingRow(
      icon,
      title,
      description,
      <Icon name="chevron-forward" size={20} color={colors.textTertiary} />,
      onPress
    )
  );

  if (loading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Cargando configuraciones...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar 
        barStyle={colors.textPrimary === '#000000' ? 'dark-content' : 'light-content'} 
        backgroundColor={colors.surface}
        translucent={false}
      />
      
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Platform.OS === 'ios' ? insets.top + 10 : insets.top + 20 }
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Configuraciones del Sistema
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Administra la configuración global de la aplicación
          </Text>
        </View>

        {/* Configuraciones Generales */}
        {settings && (
          <View style={styles.settingsSection}>
            {renderSettingCard(
              'Configuración General',
              <View>
                {renderSwitchSetting(
                  'settings-outline',
                  'Modo Mantenimiento',
                  'Activa el modo mantenimiento para deshabilitar el acceso público',
                  settings.general.maintenanceMode,
                  (value) => updateSetting('general', 'maintenanceMode', value)
                )}
                {renderSwitchSetting(
                  'person-add-outline',
                  'Registro Habilitado',
                  'Permite a nuevos usuarios registrarse en la aplicación',
                  settings.general.registrationEnabled,
                  (value) => updateSetting('general', 'registrationEnabled', value)
                )}
                {renderSwitchSetting(
                  'mail-outline',
                  'Verificación de Email',
                  'Requiere verificación de email para activar cuentas',
                  settings.general.emailVerificationRequired,
                  (value) => updateSetting('general', 'emailVerificationRequired', value)
                )}
                {renderNavigationSetting(
                  'cog-outline',
                  'Configuración Avanzada',
                  'Configuraciones adicionales del sistema',
                  () => navigation.navigate('GlobalSettings')
                )}
              </View>
            )}

            {renderSettingCard(
              'Configuración de Negocio',
              <View>
                {renderSettingRow(
                  'cash-outline',
                  'Moneda',
                  `Moneda principal: ${settings.business.currency}`,
                  <Text style={[styles.settingValue, { color: colors.textPrimary }]}>
                    {settings.business.currency}
                  </Text>
                )}
                {renderSettingRow(
                  'calculator-outline',
                  'Tasa de Impuestos',
                  `Impuesto actual: ${settings.business.taxRate}%`,
                  <Text style={[styles.settingValue, { color: colors.textPrimary }]}>
                    {settings.business.taxRate}%
                  </Text>
                )}
                {renderSettingRow(
                  'car-outline',
                  'Tarifa de Delivery',
                  `Costo de delivery: $${settings.business.deliveryFee}`,
                  <Text style={[styles.settingValue, { color: colors.textPrimary }]}>
                    ${settings.business.deliveryFee}
                  </Text>
                )}
                {renderSettingRow(
                  'receipt-outline',
                  'Pedido Mínimo',
                  `Monto mínimo: $${settings.business.minimumOrderAmount}`,
                  <Text style={[styles.settingValue, { color: colors.textPrimary }]}>
                    ${settings.business.minimumOrderAmount}
                  </Text>
                )}
              </View>
            )}

            {renderSettingCard(
              'Notificaciones',
              <View>
                {renderSwitchSetting(
                  'mail-outline',
                  'Notificaciones por Email',
                  'Enviar notificaciones por correo electrónico',
                  settings.notifications.emailNotifications,
                  (value) => updateSetting('notifications', 'emailNotifications', value)
                )}
                {renderSwitchSetting(
                  'chatbubble-outline',
                  'Notificaciones SMS',
                  'Enviar notificaciones por mensaje de texto',
                  settings.notifications.smsNotifications,
                  (value) => updateSetting('notifications', 'smsNotifications', value)
                )}
                {renderSwitchSetting(
                  'notifications-outline',
                  'Notificaciones Push',
                  'Enviar notificaciones push a dispositivos móviles',
                  settings.notifications.pushNotifications,
                  (value) => updateSetting('notifications', 'pushNotifications', value)
                )}
                {renderSwitchSetting(
                  'receipt-outline',
                  'Notificaciones de Pedidos',
                  'Notificar sobre cambios en el estado de pedidos',
                  settings.notifications.orderNotifications,
                  (value) => updateSetting('notifications', 'orderNotifications', value)
                )}
              </View>
            )}

            {renderSettingCard(
              'Seguridad',
              <View>
                {renderSwitchSetting(
                  'shield-checkmark-outline',
                  'Autenticación de Dos Factores',
                  'Requerir 2FA para administradores',
                  settings.security.twoFactorAuth,
                  (value) => updateSetting('security', 'twoFactorAuth', value)
                )}
                {renderSettingRow(
                  'key-outline',
                  'Longitud Mínima de Contraseña',
                  `Mínimo ${settings.security.passwordMinLength} caracteres`,
                  <Text style={[styles.settingValue, { color: colors.textPrimary }]}>
                    {settings.security.passwordMinLength}
                  </Text>
                )}
                {renderSettingRow(
                  'time-outline',
                  'Timeout de Sesión',
                  `${settings.security.sessionTimeout} minutos`,
                  <Text style={[styles.settingValue, { color: colors.textPrimary }]}>
                    {settings.security.sessionTimeout} min
                  </Text>
                )}
                {renderNavigationSetting(
                  'lock-closed-outline',
                  'Configuración de Seguridad',
                  'Configuraciones avanzadas de seguridad',
                  () => navigation.navigate('SecuritySettings')
                )}
              </View>
            )}

            {renderSettingCard(
              'Integraciones',
              <View>
                {renderSettingRow(
                  'map-outline',
                  'Google Maps',
                  'API Key para mapas y geolocalización',
                  <Icon name="checkmark-circle" size={20} color="#10B981" />
                )}
                {renderSettingRow(
                  'card-outline',
                  'Pasarela de Pago',
                  settings.integrations.paymentGateway,
                  <Text style={[styles.settingValue, { color: colors.textPrimary }]}>
                    {settings.integrations.paymentGateway}
                  </Text>
                )}
                {renderSettingRow(
                  'mail-outline',
                  'Servicio de Email',
                  settings.integrations.emailService,
                  <Text style={[styles.settingValue, { color: colors.textPrimary }]}>
                    {settings.integrations.emailService}
                  </Text>
                )}
                {renderNavigationSetting(
                  'link-outline',
                  'Configuración de Integraciones',
                  'Gestionar integraciones externas',
                  () => navigation.navigate('IntegrationSettings')
                )}
              </View>
            )}

            {renderSettingCard(
              'Configuración de Maestros',
              <View>
                {renderNavigationSetting(
                  'car-outline',
                  'Tipos de Vehículo',
                  'Gestionar tipos de vehículos para delivery',
                  () => navigation.navigate('MasterConfiguration')
                )}
                {renderNavigationSetting(
                  'award-outline',
                  'Marcas',
                  'Gestionar marcas de productos',
                  () => navigation.navigate('MasterConfiguration')
                )}
                {renderNavigationSetting(
                  'layers-outline',
                  'Categorías y Subcategorías',
                  'Gestionar categorías de productos',
                  () => navigation.navigate('MasterConfiguration')
                )}
              </View>
            )}
          </View>
        )}

        {/* Información del Sistema */}
        <View style={[styles.systemInfoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.systemInfoTitle, { color: colors.textPrimary }]}>
            Información del Sistema
          </Text>
          <View style={styles.systemInfoRow}>
            <Text style={[styles.systemInfoLabel, { color: colors.textSecondary }]}>
              Nombre de la App:
            </Text>
            <Text style={[styles.systemInfoValue, { color: colors.textPrimary }]}>
              {settings?.general.appName || 'PiezasYA'}
            </Text>
          </View>
          <View style={styles.systemInfoRow}>
            <Text style={[styles.systemInfoLabel, { color: colors.textSecondary }]}>
              Versión:
            </Text>
            <Text style={[styles.systemInfoValue, { color: colors.textPrimary }]}>
              {settings?.general.appVersion || '1.0.0'}
            </Text>
          </View>
          <View style={styles.systemInfoRow}>
            <Text style={[styles.systemInfoLabel, { color: colors.textSecondary }]}>
              Última Actualización:
            </Text>
            <Text style={[styles.systemInfoValue, { color: colors.textPrimary }]}>
              {new Date().toLocaleDateString('es-ES')}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    padding: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  settingsSection: {
    paddingHorizontal: 16,
    gap: 16,
  },
  settingCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  settingCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
  },
  settingRowRight: {
    marginLeft: 12,
  },
  settingValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  systemInfoCard: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  systemInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  systemInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  systemInfoLabel: {
    fontSize: 14,
  },
  systemInfoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
});

export default AdminSettingsScreen;
