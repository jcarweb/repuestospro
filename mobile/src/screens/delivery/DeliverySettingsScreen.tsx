import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Switch,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { apiService } from '../../services/api';

interface VehicleInfo {
  type: 'motorcycle' | 'bicycle' | 'car' | 'truck';
  brand: string;
  model: string;
  year: string;
  plate: string;
  color: string;
}

interface DeliveryZone {
  center: {
    latitude: number;
    longitude: number;
  };
  radius: number; // en km
  name: string;
}

interface DeliverySettings {
  vehicle: VehicleInfo;
  deliveryZone: DeliveryZone;
  notifications: {
    newOrders: boolean;
    orderUpdates: boolean;
    locationSharing: boolean;
    earningsUpdates: boolean;
    systemAlerts: boolean;
  };
  privacy: {
    shareLocation: boolean;
    showOnlineStatus: boolean;
    allowDirectCalls: boolean;
  };
  performance: {
    autoAcceptOrders: boolean;
    maxOrdersPerDay: number;
    preferredDeliveryTime: string;
  };
}

const DeliverySettingsScreen: React.FC = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigation = useNavigation();
  const [settings, setSettings] = useState<DeliverySettings>({
    vehicle: {
      type: 'motorcycle',
      brand: '',
      model: '',
      year: '',
      plate: '',
      color: '',
    },
    deliveryZone: {
      center: {
        latitude: 10.4806,
        longitude: -66.9036,
      },
      radius: 10,
      name: 'Zona Central',
    },
    notifications: {
      newOrders: true,
      orderUpdates: true,
      locationSharing: true,
      earningsUpdates: true,
      systemAlerts: true,
    },
    privacy: {
      shareLocation: true,
      showOnlineStatus: true,
      allowDirectCalls: true,
    },
    performance: {
      autoAcceptOrders: false,
      maxOrdersPerDay: 20,
      preferredDeliveryTime: '08:00',
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadSettings = async () => {
    try {
      setLoading(true);
      // TODO: Implementar endpoint real para configuración de delivery
      // const response = await apiService.getDeliverySettings();
      // setSettings(response.data);
      
      // Datos mock por ahora - ya están en el estado inicial
    } catch (error) {
      console.error('Error loading settings:', error);
      showToast('Error al cargar configuración', 'error');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      // TODO: Implementar endpoint real para guardar configuración
      // await apiService.updateDeliverySettings(settings);
      
      showToast('Configuración guardada exitosamente', 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      showToast('Error al guardar configuración', 'error');
    } finally {
      setSaving(false);
    }
  };

  const updateVehicleInfo = (field: keyof VehicleInfo, value: string) => {
    setSettings(prev => ({
      ...prev,
      vehicle: {
        ...prev.vehicle,
        [field]: value,
      },
    }));
  };

  const updateNotification = (type: keyof typeof settings.notifications, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: value,
      },
    }));
  };

  const updatePrivacy = (type: keyof typeof settings.privacy, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [type]: value,
      },
    }));
  };

  const updatePerformance = (type: keyof typeof settings.performance, value: boolean | number | string) => {
    setSettings(prev => ({
      ...prev,
      performance: {
        ...prev.performance,
        [type]: value,
      },
    }));
  };

  const resetToDefault = () => {
    Alert.alert(
      'Restablecer Configuración',
      '¿Deseas restablecer toda la configuración a los valores por defecto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Restablecer', style: 'destructive', onPress: () => {
          loadSettings();
          showToast('Configuración restablecida', 'info');
        }}
      ]
    );
  };

  const exportSettings = () => {
    Alert.alert(
      'Exportar Configuración',
      '¿Deseas exportar tu configuración actual?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Exportar', onPress: () => {
          // TODO: Implementar exportación de configuración
          showToast('Exportación próximamente', 'info');
        }}
      ]
    );
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const SettingItem = ({ 
    title, 
    subtitle, 
    icon, 
    onPress, 
    rightComponent 
  }: {
    title: string;
    subtitle?: string;
    icon: keyof typeof Ionicons.glyphMap;
    onPress?: () => void;
    rightComponent?: React.ReactNode;
  }) => (
    <TouchableOpacity
      style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.settingIcon, { backgroundColor: colors.primary + '20' }]}>
          <Ionicons name={icon} size={20} color={colors.primary} />
        </View>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {rightComponent || (onPress && (
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      ))}
    </TouchableOpacity>
  );

  const SwitchItem = ({ 
    title, 
    subtitle, 
    icon, 
    value, 
    onValueChange 
  }: {
    title: string;
    subtitle?: string;
    icon: keyof typeof Ionicons.glyphMap;
    value: boolean;
    onValueChange: (value: boolean) => void;
  }) => (
    <View style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.settingLeft}>
        <View style={[styles.settingIcon, { backgroundColor: colors.primary + '20' }]}>
          <Ionicons name={icon} size={20} color={colors.primary} />
        </View>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.primary + '50' }}
        thumbColor={value ? colors.primary : colors.textTertiary}
      />
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Cargando configuración...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Configuración de Repartidor
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: colors.primary }]}
            onPress={saveSettings}
            disabled={saving}
          >
            <Ionicons name="save" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: colors.secondary, borderColor: colors.border }]}
            onPress={exportSettings}
          >
            <Ionicons name="download" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Vehicle Information */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Información del Vehículo
        </Text>
        
        <View style={[styles.inputGroup, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
            Tipo de Vehículo
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border }]}
            value={settings.vehicle.type}
            onChangeText={(value) => updateVehicleInfo('type', value)}
            placeholder="Ej: Moto, Bicicleta, Carro"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <View style={[styles.inputGroup, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
            Marca
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border }]}
            value={settings.vehicle.brand}
            onChangeText={(value) => updateVehicleInfo('brand', value)}
            placeholder="Ej: Honda, Yamaha, Toyota"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <View style={[styles.inputGroup, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
            Modelo
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border }]}
            value={settings.vehicle.model}
            onChangeText={(value) => updateVehicleInfo('model', value)}
            placeholder="Ej: CBR 150, Corolla"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <View style={[styles.inputGroup, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
            Año
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border }]}
            value={settings.vehicle.year}
            onChangeText={(value) => updateVehicleInfo('year', value)}
            placeholder="Ej: 2020"
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
          />
        </View>

        <View style={[styles.inputGroup, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
            Placa
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border }]}
            value={settings.vehicle.plate}
            onChangeText={(value) => updateVehicleInfo('plate', value)}
            placeholder="Ej: ABC-123"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="characters"
          />
        </View>

        <View style={[styles.inputGroup, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
            Color
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border }]}
            value={settings.vehicle.color}
            onChangeText={(value) => updateVehicleInfo('color', value)}
            placeholder="Ej: Rojo, Azul, Negro"
            placeholderTextColor={colors.textSecondary}
          />
        </View>
      </View>

      {/* Delivery Zone */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Zona de Entrega
        </Text>
        
        <SettingItem
          title="Zona de Trabajo"
          subtitle={`${settings.deliveryZone.name} - ${settings.deliveryZone.radius} km de radio`}
          icon="location"
          onPress={() => {
            // TODO: Implementar selector de zona
            showToast('Selector de zona próximamente', 'info');
          }}
        />

        <View style={[styles.inputGroup, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
            Radio de Cobertura (km)
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border }]}
            value={settings.deliveryZone.radius.toString()}
            onChangeText={(value) => {
              const radius = parseInt(value) || 0;
              setSettings(prev => ({
                ...prev,
                deliveryZone: {
                  ...prev.deliveryZone,
                  radius,
                },
              }));
            }}
            placeholder="10"
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Notifications */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Notificaciones
        </Text>
        
        <SwitchItem
          title="Nuevas Órdenes"
          subtitle="Recibir notificaciones de nuevas órdenes asignadas"
          icon="notifications"
          value={settings.notifications.newOrders}
          onValueChange={(value) => updateNotification('newOrders', value)}
        />

        <SwitchItem
          title="Actualizaciones de Órdenes"
          subtitle="Notificaciones sobre cambios en el estado de las órdenes"
          icon="refresh"
          value={settings.notifications.orderUpdates}
          onValueChange={(value) => updateNotification('orderUpdates', value)}
        />

        <SwitchItem
          title="Compartir Ubicación"
          subtitle="Permitir que la tienda vea tu ubicación en tiempo real"
          icon="location"
          value={settings.notifications.locationSharing}
          onValueChange={(value) => updateNotification('locationSharing', value)}
        />

        <SwitchItem
          title="Actualizaciones de Ganancias"
          subtitle="Notificaciones sobre ganancias y comisiones"
          icon="cash"
          value={settings.notifications.earningsUpdates}
          onValueChange={(value) => updateNotification('earningsUpdates', value)}
        />

        <SwitchItem
          title="Alertas del Sistema"
          subtitle="Notificaciones importantes del sistema"
          icon="warning"
          value={settings.notifications.systemAlerts}
          onValueChange={(value) => updateNotification('systemAlerts', value)}
        />
      </View>

      {/* Privacy */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Privacidad
        </Text>
        
        <SwitchItem
          title="Compartir Ubicación"
          subtitle="Permitir que otros vean tu ubicación actual"
          icon="location"
          value={settings.privacy.shareLocation}
          onValueChange={(value) => updatePrivacy('shareLocation', value)}
        />

        <SwitchItem
          title="Mostrar Estado Online"
          subtitle="Mostrar cuando estás disponible para entregas"
          icon="eye"
          value={settings.privacy.showOnlineStatus}
          onValueChange={(value) => updatePrivacy('showOnlineStatus', value)}
        />

        <SwitchItem
          title="Permitir Llamadas Directas"
          subtitle="Permitir que los clientes te llamen directamente"
          icon="call"
          value={settings.privacy.allowDirectCalls}
          onValueChange={(value) => updatePrivacy('allowDirectCalls', value)}
        />
      </View>

      {/* Performance */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Rendimiento
        </Text>
        
        <SwitchItem
          title="Aceptar Órdenes Automáticamente"
          subtitle="Aceptar automáticamente las órdenes asignadas"
          icon="checkmark-circle"
          value={settings.performance.autoAcceptOrders}
          onValueChange={(value) => updatePerformance('autoAcceptOrders', value)}
        />

        <View style={[styles.inputGroup, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
            Máximo de Órdenes por Día
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border }]}
            value={settings.performance.maxOrdersPerDay.toString()}
            onChangeText={(value) => {
              const maxOrders = parseInt(value) || 0;
              updatePerformance('maxOrdersPerDay', maxOrders);
            }}
            placeholder="20"
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
          />
        </View>

        <View style={[styles.inputGroup, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
            Hora Preferida de Entrega
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border }]}
            value={settings.performance.preferredDeliveryTime}
            onChangeText={(value) => updatePerformance('preferredDeliveryTime', value)}
            placeholder="08:00"
            placeholderTextColor={colors.textSecondary}
          />
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={saveSettings}
          disabled={saving}
        >
          <Ionicons name="save" size={20} color="white" />
          <Text style={styles.actionButtonText}>
            {saving ? 'Guardando...' : 'Guardar Configuración'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.error }]}
          onPress={resetToDefault}
        >
          <Ionicons name="refresh" size={20} color="white" />
          <Text style={styles.actionButtonText}>
            Restablecer por Defecto
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  section: {
    padding: 16,
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
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  settingLeft: {
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
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
  },
  inputGroup: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  actionsSection: {
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default DeliverySettingsScreen;
