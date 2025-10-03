import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { connectionMonitorService, ConnectionStatus } from '../services/connectionMonitorService';
import { getBaseURL } from '../config/api';

interface ConnectionDiagnosticModalProps {
  visible: boolean;
  onClose: () => void;
}

const ConnectionDiagnosticModal: React.FC<ConnectionDiagnosticModalProps> = ({
  visible,
  onClose,
}) => {
  const { colors } = useTheme();
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isConnected: false,
    lastCheck: '',
    responseTime: 0,
    backend: '',
  });
  const [isChecking, setIsChecking] = useState(false);
  const [diagnostics, setDiagnostics] = useState<any[]>([]);
  const [currentBackend, setCurrentBackend] = useState('');

  useEffect(() => {
    if (visible) {
      loadCurrentBackend();
      runDiagnostics();
    }
  }, [visible]);

  const loadCurrentBackend = async () => {
    try {
      const backend = await getBaseURL();
      setCurrentBackend(backend);
    } catch (error) {
      console.error('Error cargando backend:', error);
    }
  };

  const runDiagnostics = async () => {
    setIsChecking(true);
    setDiagnostics([]);

    try {
      // 1. Verificar conexión general
      const generalCheck = await connectionMonitorService.checkConnection();
      setConnectionStatus(generalCheck);
      
      setDiagnostics(prev => [...prev, {
        test: 'Conexión General',
        status: generalCheck.isConnected ? 'success' : 'error',
        message: generalCheck.isConnected 
          ? `Conectado (${generalCheck.responseTime}ms)` 
          : generalCheck.error || 'Sin conexión',
        details: `Backend: ${generalCheck.backend}`,
      }]);

      // 2. Verificar endpoint de salud
      const healthCheck = await connectionMonitorService.checkSpecificEndpoint('/api/health');
      setDiagnostics(prev => [...prev, {
        test: 'Endpoint de Salud',
        status: healthCheck.isConnected ? 'success' : 'error',
        message: healthCheck.isConnected 
          ? `OK (${healthCheck.responseTime}ms)` 
          : healthCheck.error || 'Error',
        details: '/api/health',
      }]);

      // 3. Verificar endpoint de autenticación
      const authCheck = await connectionMonitorService.checkSpecificEndpoint('/api/auth/login');
      setDiagnostics(prev => [...prev, {
        test: 'Endpoint de Autenticación',
        status: authCheck.isConnected ? 'success' : 'error',
        message: authCheck.isConnected 
          ? `OK (${authCheck.responseTime}ms)` 
          : authCheck.error || 'Error',
        details: '/api/auth/login',
      }]);

      // 4. Verificar conectividad de red
      const networkCheck = await checkNetworkConnectivity();
      setDiagnostics(prev => [...prev, {
        test: 'Conectividad de Red',
        status: networkCheck.isConnected ? 'success' : 'error',
        message: networkCheck.isConnected 
          ? 'Internet disponible' 
          : 'Sin conexión a internet',
        details: networkCheck.details,
      }]);

    } catch (error) {
      console.error('Error en diagnósticos:', error);
      setDiagnostics(prev => [...prev, {
        test: 'Error General',
        status: 'error',
        message: 'Error ejecutando diagnósticos',
        details: error instanceof Error ? error.message : 'Error desconocido',
      }]);
    } finally {
      setIsChecking(false);
    }
  };

  const checkNetworkConnectivity = async (): Promise<{
    isConnected: boolean;
    details: string;
  }> => {
    try {
      // Intentar conectar a un servicio externo
      const response = await fetch('https://www.google.com', {
        method: 'HEAD',
        timeout: 5000,
      });
      
      return {
        isConnected: response.ok,
        details: 'Conexión a internet disponible',
      };
    } catch (error) {
      return {
        isConnected: false,
        details: 'Sin conexión a internet',
      };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return 'checkmark-circle';
      case 'error':
        return 'close-circle';
      case 'warning':
        return 'warning';
      default:
        return 'help-circle';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return '#10B981';
      case 'error':
        return '#EF4444';
      case 'warning':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  const handleRetry = () => {
    runDiagnostics();
  };

  const handleRefreshBackend = async () => {
    try {
      await loadCurrentBackend();
      await runDiagnostics();
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar la configuración del backend');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>
            Diagnóstico de Conexión
          </Text>
          <TouchableOpacity onPress={handleRetry} style={styles.retryButton}>
            <Ionicons name="refresh" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={styles.content}>
          {/* Backend Info */}
          <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Configuración Actual
            </Text>
            <Text style={[styles.backendUrl, { color: colors.textSecondary }]}>
              {currentBackend}
            </Text>
            <TouchableOpacity 
              style={[styles.refreshButton, { backgroundColor: colors.primary }]}
              onPress={handleRefreshBackend}
            >
              <Ionicons name="refresh" size={16} color="white" />
              <Text style={styles.refreshButtonText}>Actualizar Backend</Text>
            </TouchableOpacity>
          </View>

          {/* Connection Status */}
          <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Estado de Conexión
            </Text>
            <View style={styles.statusRow}>
              <Ionicons
                name={connectionStatus.isConnected ? 'checkmark-circle' : 'close-circle'}
                size={20}
                color={connectionStatus.isConnected ? '#10B981' : '#EF4444'}
              />
              <Text style={[styles.statusText, { color: colors.text }]}>
                {connectionStatus.isConnected ? 'Conectado' : 'Sin conexión'}
              </Text>
            </View>
            {connectionStatus.responseTime > 0 && (
              <Text style={[styles.responseTime, { color: colors.textSecondary }]}>
                Tiempo de respuesta: {connectionStatus.responseTime}ms
              </Text>
            )}
            {connectionStatus.error && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                Error: {connectionStatus.error}
              </Text>
            )}
          </View>

          {/* Diagnostics */}
          <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Diagnósticos Detallados
            </Text>
            
            {isChecking && (
              <View style={styles.checkingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.checkingText, { color: colors.textSecondary }]}>
                  Ejecutando diagnósticos...
                </Text>
              </View>
            )}

            {diagnostics.map((diagnostic, index) => (
              <View key={index} style={styles.diagnosticItem}>
                <View style={styles.diagnosticHeader}>
                  <Ionicons
                    name={getStatusIcon(diagnostic.status)}
                    size={16}
                    color={getStatusColor(diagnostic.status)}
                  />
                  <Text style={[styles.diagnosticTest, { color: colors.text }]}>
                    {diagnostic.test}
                  </Text>
                </View>
                <Text style={[styles.diagnosticMessage, { color: colors.textSecondary }]}>
                  {diagnostic.message}
                </Text>
                <Text style={[styles.diagnosticDetails, { color: colors.textTertiary }]}>
                  {diagnostic.details}
                </Text>
              </View>
            ))}
          </View>

          {/* Recommendations */}
          <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Recomendaciones
            </Text>
            <Text style={[styles.recommendation, { color: colors.textSecondary }]}>
              • Verifica tu conexión a internet
            </Text>
            <Text style={[styles.recommendation, { color: colors.textSecondary }]}>
              • Asegúrate de que los servicios estén activos
            </Text>
            <Text style={[styles.recommendation, { color: colors.textSecondary }]}>
              • Revisa la configuración del backend
            </Text>
            <Text style={[styles.recommendation, { color: colors.textSecondary }]}>
              • Intenta cambiar entre diferentes redes
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  retryButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  backendUrl: {
    fontSize: 14,
    marginBottom: 12,
    fontFamily: 'monospace',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  responseTime: {
    fontSize: 14,
    marginTop: 4,
  },
  errorText: {
    fontSize: 14,
    marginTop: 4,
  },
  checkingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  checkingText: {
    marginLeft: 8,
    fontSize: 14,
  },
  diagnosticItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  diagnosticHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  diagnosticTest: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  diagnosticMessage: {
    fontSize: 13,
    marginLeft: 24,
    marginBottom: 2,
  },
  diagnosticDetails: {
    fontSize: 12,
    marginLeft: 24,
    fontFamily: 'monospace',
  },
  recommendation: {
    fontSize: 14,
    marginBottom: 4,
    lineHeight: 20,
  },
});

export default ConnectionDiagnosticModal;
