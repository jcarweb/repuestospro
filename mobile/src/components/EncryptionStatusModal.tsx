import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Icon';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import encryptionService from '../services/encryptionService';

interface EncryptionStatusModalProps {
  visible: boolean;
  onClose: () => void;
}

const EncryptionStatusModal: React.FC<EncryptionStatusModalProps> = ({
  visible,
  onClose,
}) => {
  const { colors } = useTheme();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<{
    totalEncryptedKeys: number;
    lastEncryption: number | null;
    dataIntegrity: { [key: string]: boolean };
  } | null>(null);

  useEffect(() => {
    if (visible) {
      loadEncryptionStats();
    }
  }, [visible]);

  const loadEncryptionStats = async () => {
    try {
      setLoading(true);
      const encryptionStats = await encryptionService.getEncryptionStats();
      setStats(encryptionStats);
    } catch (error) {
      console.error('Error loading encryption stats:', error);
      showToast('Error al cargar estadísticas de encriptación', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getDataKeyName = (key: string) => {
    switch (key) {
      case 'encrypted_pin':
        return 'PIN de Acceso';
      case 'encrypted_2fa_data':
        return 'Datos 2FA';
      case 'encrypted_biometric_data':
        return 'Datos Biométricos';
      default:
        return key;
    }
  };

  const formatLastEncryption = (timestamp: number | null) => {
    if (!timestamp) {
      return 'Nunca';
    }

    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 60) {
      return `hace ${minutes} min`;
    } else if (hours < 24) {
      return `hace ${hours}h`;
    } else {
      return `hace ${days} días`;
    }
  };

  const clearAllEncryptedData = () => {
    Alert.alert(
      'Limpiar Datos Encriptados',
      '¿Estás seguro de que quieres eliminar todos los datos encriptados? Esta acción no se puede deshacer y tendrás que reconfigurar todas las opciones de seguridad.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpiar',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await encryptionService.clearAllEncryptedData();
              showToast('Datos encriptados eliminados', 'success');
              await loadEncryptionStats();
            } catch (error) {
              showToast('Error al limpiar datos encriptados', 'error');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderDataItem = (key: string, isEncrypted: boolean) => (
    <View key={key} style={[styles.dataItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.dataHeader}>
        <View style={styles.dataIconContainer}>
          <Icon 
            name={isEncrypted ? "shield-checkmark" : "shield"} 
            size={24} 
            color={isEncrypted ? colors.success : colors.textTertiary} 
          />
        </View>
        <View style={styles.dataInfo}>
          <Text style={[styles.dataTitle, { color: colors.textPrimary }]}>
            {getDataKeyName(key)}
          </Text>
          <Text style={[styles.dataStatus, { color: isEncrypted ? colors.success : colors.textSecondary }]}>
            {isEncrypted ? 'Encriptado' : 'No encriptado'}
          </Text>
        </View>
        {isEncrypted && (
          <View style={[styles.encryptedBadge, { backgroundColor: colors.success }]}>
            <Icon name="lock-closed" size={16} color="white" />
          </View>
        )}
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.headerBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Estado de Encriptación
          </Text>
          <TouchableOpacity onPress={clearAllEncryptedData} style={styles.clearButton}>
            <Icon name="trash" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                Cargando estadísticas...
              </Text>
            </View>
          ) : stats ? (
            <>
              {/* Resumen general */}
              <View style={[styles.summaryContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.summaryHeader}>
                  <Icon name="shield-checkmark" size={32} color={colors.primary} />
                  <Text style={[styles.summaryTitle, { color: colors.textPrimary }]}>
                    Resumen de Seguridad
                  </Text>
                </View>
                
                <View style={styles.summaryStats}>
                  <View style={styles.statItem}>
                    <Text style={[styles.statNumber, { color: colors.primary }]}>
                      {stats.totalEncryptedKeys}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                      Datos Encriptados
                    </Text>
                  </View>
                  
                  <View style={styles.statItem}>
                    <Text style={[styles.statNumber, { color: colors.success }]}>
                      {Object.values(stats.dataIntegrity).filter(Boolean).length}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                      Integridad OK
                    </Text>
                  </View>
                </View>

                <View style={[styles.lastEncryptionContainer, { backgroundColor: colors.background }]}>
                  <Icon name="time" size={20} color={colors.textSecondary} />
                  <Text style={[styles.lastEncryptionText, { color: colors.textSecondary }]}>
                    Última encriptación: {formatLastEncryption(stats.lastEncryption)}
                  </Text>
                </View>
              </View>

              {/* Lista de datos */}
              <View style={styles.dataSection}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                  Datos Sensibles
                </Text>
                
                {Object.entries(stats.dataIntegrity).map(([key, isEncrypted]) => 
                  renderDataItem(key, isEncrypted)
                )}
              </View>

              {/* Información de seguridad */}
              <View style={[styles.infoContainer, { backgroundColor: colors.info + '20', borderColor: colors.info }]}>
                <Icon name="information-circle" size={24} color={colors.info} />
                <View style={styles.infoContent}>
                  <Text style={[styles.infoTitle, { color: colors.info }]}>
                    Información de Seguridad
                  </Text>
                  <Text style={[styles.infoText, { color: colors.info }]}>
                    Todos los datos sensibles están encriptados usando algoritmos seguros. 
                    Solo tú puedes acceder a esta información con tu contraseña.
                  </Text>
                </View>
              </View>

              {/* Recomendaciones */}
              <View style={[styles.recommendationsContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.recommendationsTitle, { color: colors.textPrimary }]}>
                  Recomendaciones
                </Text>
                
                <View style={styles.recommendationItem}>
                  <Icon name="checkmark-circle" size={20} color={colors.success} />
                  <Text style={[styles.recommendationText, { color: colors.textSecondary }]}>
                    Mantén tu contraseña segura y no la compartas
                  </Text>
                </View>
                
                <View style={styles.recommendationItem}>
                  <Icon name="checkmark-circle" size={20} color={colors.success} />
                  <Text style={[styles.recommendationText, { color: colors.textSecondary }]}>
                    Activa 2FA para mayor protección
                  </Text>
                </View>
                
                <View style={styles.recommendationItem}>
                  <Icon name="checkmark-circle" size={20} color={colors.success} />
                  <Text style={[styles.recommendationText, { color: colors.textSecondary }]}>
                    Revisa regularmente el historial de seguridad
                  </Text>
                </View>
              </View>
            </>
          ) : (
            <View style={styles.errorContainer}>
              <Icon name="alert-circle" size={64} color={colors.error} />
              <Text style={[styles.errorTitle, { color: colors.textPrimary }]}>
                Error al cargar datos
              </Text>
              <Text style={[styles.errorSubtitle, { color: colors.textSecondary }]}>
                No se pudieron cargar las estadísticas de encriptación
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  clearButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  summaryContainer: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  summaryHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 12,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  lastEncryptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  lastEncryptionText: {
    marginLeft: 8,
    fontSize: 14,
  },
  dataSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  dataItem: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  dataHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dataIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dataInfo: {
    flex: 1,
  },
  dataTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  dataStatus: {
    fontSize: 14,
  },
  encryptedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  recommendationsContainer: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendationText: {
    marginLeft: 12,
    fontSize: 14,
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default EncryptionStatusModal;
