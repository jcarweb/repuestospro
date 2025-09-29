import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Switch,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { apiService } from '../../services/api';

interface StoreConfiguration {
  currency: string;
  taxRate: number;
  deliveryRadius: number;
  minimumOrder: number;
  autoAcceptOrders: boolean;
  preferredExchangeRate: 'USD' | 'EUR';
}

interface ExchangeRate {
  rate: number;
  currency: string;
  source: string;
  lastUpdated: string;
  isActive: boolean;
}

const StoreConfigurationScreen: React.FC = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate | null>(null);
  const [loadingRate, setLoadingRate] = useState(false);
  
  const [config, setConfig] = useState<StoreConfiguration>({
    currency: 'USD',
    taxRate: 16.0,
    deliveryRadius: 10,
    minimumOrder: 0,
    autoAcceptOrders: false,
    preferredExchangeRate: 'USD'
  });

  useEffect(() => {
    loadStoreConfiguration();
    loadExchangeRate();
  }, []);

  const loadStoreConfiguration = async () => {
    setLoading(true);
    try {
      // TODO: Obtener el ID de la tienda activa del contexto
      // Por ahora usamos un ID mock
      const storeId = 'mock-store-id';
      
      const response = await apiService.getStoreConfiguration(storeId);
      if (response.success && response.data) {
        const store = response.data.store || response.data;
        setConfig({
          currency: store.settings?.currency || 'USD',
          taxRate: store.settings?.taxRate || 16.0,
          deliveryRadius: store.settings?.deliveryRadius || 10,
          minimumOrder: store.settings?.minimumOrder || 0,
          autoAcceptOrders: store.settings?.autoAcceptOrders || false,
          preferredExchangeRate: store.settings?.preferredExchangeRate || 'USD'
        });
      }
    } catch (error) {
      console.error('Error cargando configuración:', error);
      showToast('Error al cargar la configuración de la tienda', 'error');
      
      // Fallback a datos por defecto
      setConfig({
        currency: 'USD',
        taxRate: 16.0,
        deliveryRadius: 10,
        minimumOrder: 0,
        autoAcceptOrders: false,
        preferredExchangeRate: 'USD'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadExchangeRate = async () => {
    setLoadingRate(true);
    try {
      // TODO: Obtener el ID de la tienda activa del contexto
      const storeId = 'mock-store-id';
      
      const response = await apiService.getStoreExchangeRate(storeId);
      if (response.success && response.data) {
        setExchangeRate({
          rate: response.data.rate,
          currency: response.data.currency,
          source: response.data.source,
          lastUpdated: response.data.lastUpdated,
          isActive: response.data.isActive
        });
      }
    } catch (error) {
      console.error('Error cargando tasa de cambio:', error);
      
      // Fallback a datos mock
      setExchangeRate({
        rate: 36.5,
        currency: config.preferredExchangeRate,
        source: 'BCV',
        lastUpdated: new Date().toISOString(),
        isActive: true
      });
    } finally {
      setLoadingRate(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const storeId = 'mock-store-id';
      
      // Actualizar configuración de la tienda
      await apiService.updateStoreConfiguration(storeId, {
        settings: {
          currency: config.currency,
          taxRate: config.taxRate,
          deliveryRadius: config.deliveryRadius,
          minimumOrder: config.minimumOrder,
          autoAcceptOrders: config.autoAcceptOrders,
          preferredExchangeRate: config.preferredExchangeRate
        }
      });
      
      // Actualizar preferencia de tasa de cambio
      await apiService.updateStoreExchangeRatePreference(storeId, config.preferredExchangeRate);
      
      showToast('Configuración guardada exitosamente', 'success');
      // Recargar la tasa de cambio con la nueva preferencia
      loadExchangeRate();
    } catch (error) {
      console.error('Error guardando configuración:', error);
      showToast('Error al guardar la configuración', 'error');
    } finally {
      setSaving(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadStoreConfiguration(), loadExchangeRate()]);
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-VE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const ConfigurationSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
        {title}
      </Text>
      {children}
    </View>
  );

  const ConfigItem = ({ 
    label, 
    children, 
    description 
  }: { 
    label: string; 
    children: React.ReactNode;
    description?: string;
  }) => (
    <View style={styles.configItem}>
      <View style={styles.configLabel}>
        <Text style={[styles.configLabelText, { color: colors.textPrimary }]}>
          {label}
        </Text>
        {description && (
          <Text style={[styles.configDescription, { color: colors.textSecondary }]}>
            {description}
          </Text>
        )}
      </View>
      {children}
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
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Configuración de Tienda
        </Text>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.primary }]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Guardando...' : 'Guardar'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Configuración Básica */}
      <ConfigurationSection title="Configuración Básica">
        <ConfigItem label="Moneda Principal" description="Moneda principal de la tienda">
          <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
            <Text style={[styles.pickerText, { color: colors.textPrimary }]}>
              {config.currency === 'USD' ? 'USD - Dólar' : 
               config.currency === 'EUR' ? 'EUR - Euro' : 
               'VES - Bolívar'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
          </View>
        </ConfigItem>

        <ConfigItem label="Tasa de IVA (%)" description="Porcentaje de impuesto">
          <TextInput
            style={[styles.textInput, { 
              borderColor: colors.border, 
              color: colors.textPrimary,
              backgroundColor: colors.surface 
            }]}
            value={config.taxRate.toString()}
            onChangeText={(text) => setConfig(prev => ({ 
              ...prev, 
              taxRate: parseFloat(text) || 0 
            }))}
            keyboardType="numeric"
            placeholder="16.0"
          />
        </ConfigItem>

        <ConfigItem label="Radio de Entrega (km)" description="Distancia máxima de entrega">
          <TextInput
            style={[styles.textInput, { 
              borderColor: colors.border, 
              color: colors.textPrimary,
              backgroundColor: colors.surface 
            }]}
            value={config.deliveryRadius.toString()}
            onChangeText={(text) => setConfig(prev => ({ 
              ...prev, 
              deliveryRadius: parseInt(text) || 0 
            }))}
            keyboardType="numeric"
            placeholder="10"
          />
        </ConfigItem>

        <ConfigItem label="Pedido Mínimo" description="Monto mínimo para pedidos">
          <TextInput
            style={[styles.textInput, { 
              borderColor: colors.border, 
              color: colors.textPrimary,
              backgroundColor: colors.surface 
            }]}
            value={config.minimumOrder.toString()}
            onChangeText={(text) => setConfig(prev => ({ 
              ...prev, 
              minimumOrder: parseFloat(text) || 0 
            }))}
            keyboardType="numeric"
            placeholder="0"
          />
        </ConfigItem>

        <ConfigItem 
          label="Aceptar Pedidos Automáticamente" 
          description="Los pedidos se aceptarán sin revisión manual"
        >
          <Switch
            value={config.autoAcceptOrders}
            onValueChange={(value) => setConfig(prev => ({ 
              ...prev, 
              autoAcceptOrders: value 
            }))}
            trackColor={{ false: colors.border, true: colors.primary + '50' }}
            thumbColor={config.autoAcceptOrders ? colors.primary : colors.textSecondary}
          />
        </ConfigItem>
      </ConfigurationSection>

      {/* Preferencia de Tasa de Cambio */}
      <ConfigurationSection title="Preferencia de Tasa de Cambio">
        <View style={[styles.infoCard, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '30' }]}>
          <Ionicons name="information-circle" size={20} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.textPrimary }]}>
            Selecciona con qué tasa de cambio prefieres trabajar. Esta configuración afectará los cálculos de precios y conversiones en tu tienda.
          </Text>
        </View>

        <ConfigItem label="Tasa de Cambio Preferida">
          <View style={styles.radioGroup}>
            <TouchableOpacity
              style={[
                styles.radioOption,
                { 
                  borderColor: config.preferredExchangeRate === 'USD' ? colors.primary : colors.border,
                  backgroundColor: config.preferredExchangeRate === 'USD' ? colors.primary + '10' : colors.surface
                }
              ]}
              onPress={() => setConfig(prev => ({ ...prev, preferredExchangeRate: 'USD' }))}
            >
              <View style={styles.radioContent}>
                <Ionicons 
                  name="dollar" 
                  size={24} 
                  color={config.preferredExchangeRate === 'USD' ? colors.primary : colors.textSecondary} 
                />
                <View style={styles.radioText}>
                  <Text style={[
                    styles.radioTitle, 
                    { color: config.preferredExchangeRate === 'USD' ? colors.primary : colors.textPrimary }
                  ]}>
                    Dólar Estadounidense (USD)
                  </Text>
                  <Text style={[styles.radioDescription, { color: colors.textSecondary }]}>
                    Tasa oficial del BCV
                  </Text>
                </View>
              </View>
              <View style={[
                styles.radioButton,
                { borderColor: config.preferredExchangeRate === 'USD' ? colors.primary : colors.border }
              ]}>
                {config.preferredExchangeRate === 'USD' && (
                  <View style={[styles.radioButtonInner, { backgroundColor: colors.primary }]} />
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.radioOption,
                { 
                  borderColor: config.preferredExchangeRate === 'EUR' ? colors.primary : colors.border,
                  backgroundColor: config.preferredExchangeRate === 'EUR' ? colors.primary + '10' : colors.surface
                }
              ]}
              onPress={() => setConfig(prev => ({ ...prev, preferredExchangeRate: 'EUR' }))}
            >
              <View style={styles.radioContent}>
                <Ionicons 
                  name="euro" 
                  size={24} 
                  color={config.preferredExchangeRate === 'EUR' ? colors.primary : colors.textSecondary} 
                />
                <View style={styles.radioText}>
                  <Text style={[
                    styles.radioTitle, 
                    { color: config.preferredExchangeRate === 'EUR' ? colors.primary : colors.textPrimary }
                  ]}>
                    Euro (EUR)
                  </Text>
                  <Text style={[styles.radioDescription, { color: colors.textSecondary }]}>
                    Tasa oficial del BCV
                  </Text>
                </View>
              </View>
              <View style={[
                styles.radioButton,
                { borderColor: config.preferredExchangeRate === 'EUR' ? colors.primary : colors.border }
              ]}>
                {config.preferredExchangeRate === 'EUR' && (
                  <View style={[styles.radioButtonInner, { backgroundColor: colors.primary }]} />
                )}
              </View>
            </TouchableOpacity>
          </View>
        </ConfigItem>

        <ConfigItem label="Tasa Actual">
          {loadingRate ? (
            <View style={styles.loadingRate}>
              <Text style={[styles.loadingRateText, { color: colors.textSecondary }]}>
                Cargando tasa...
              </Text>
            </View>
          ) : exchangeRate ? (
            <View style={[styles.rateCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.rateInfo}>
                <Text style={[styles.rateValue, { color: colors.textPrimary }]}>
                  {exchangeRate.rate.toLocaleString('es-VE')}
                </Text>
                <Text style={[styles.rateCurrency, { color: colors.textSecondary }]}>
                  {exchangeRate.currency} por Bs.
                </Text>
              </View>
              <View style={styles.rateDetails}>
                <Text style={[styles.rateSource, { color: colors.textSecondary }]}>
                  Fuente: {exchangeRate.source}
                </Text>
                <Text style={[styles.rateDate, { color: colors.textSecondary }]}>
                  {formatDate(exchangeRate.lastUpdated)}
                </Text>
              </View>
            </View>
          ) : (
            <View style={[styles.errorCard, { backgroundColor: '#FFEAA7', borderColor: '#FDCB6E' }]}>
              <Ionicons name="warning" size={20} color="#E17055" />
              <Text style={[styles.errorText, { color: '#E17055' }]}>
                No se pudo cargar la tasa de cambio
              </Text>
            </View>
          )}
        </ConfigItem>
      </ConfigurationSection>
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
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  configItem: {
    marginBottom: 20,
  },
  configLabel: {
    marginBottom: 8,
  },
  configLabelText: {
    fontSize: 16,
    fontWeight: '600',
  },
  configDescription: {
    fontSize: 14,
    marginTop: 2,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  pickerText: {
    fontSize: 16,
  },
  textInput: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 16,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    marginLeft: 8,
    lineHeight: 20,
  },
  radioGroup: {
    gap: 12,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
  },
  radioContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioText: {
    marginLeft: 12,
    flex: 1,
  },
  radioTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  radioDescription: {
    fontSize: 14,
    marginTop: 2,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  loadingRate: {
    padding: 16,
    alignItems: 'center',
  },
  loadingRateText: {
    fontSize: 14,
  },
  rateCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  rateInfo: {
    marginBottom: 8,
  },
  rateValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  rateCurrency: {
    fontSize: 14,
  },
  rateDetails: {
    alignItems: 'flex-end',
  },
  rateSource: {
    fontSize: 12,
  },
  rateDate: {
    fontSize: 12,
    marginTop: 2,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  errorText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default StoreConfigurationScreen;
