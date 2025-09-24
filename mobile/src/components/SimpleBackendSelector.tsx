import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiConfig } from '../config/api';
import { BackendEnvironment } from '../config/environments';

interface SimpleBackendSelectorProps {
  onEnvironmentChange?: (environment: BackendEnvironment) => void;
}

export const SimpleBackendSelector: React.FC<SimpleBackendSelectorProps> = ({ onEnvironmentChange }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentEnvironment, setCurrentEnvironment] = useState<BackendEnvironment | null>(null);
  const [availableEnvironments, setAvailableEnvironments] = useState<BackendEnvironment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [testingEnvironment, setTestingEnvironment] = useState<string | null>(null);

  // Verificación de seguridad al inicio
  if (!apiConfig) {
    console.warn('SimpleBackendSelector: apiConfig no disponible, no renderizando');
    return null;
  }

  useEffect(() => {
    loadCurrentEnvironment();
  }, []);

  const loadCurrentEnvironment = async () => {
    try {
      // Verificar que apiConfig esté disponible
      if (!apiConfig) {
        console.warn('SimpleBackendSelector: apiConfig no disponible');
        return;
      }

      const current = apiConfig.getCurrentEnvironment();
      const available = apiConfig.getAvailableEnvironments();
      
      // Verificar que los datos sean válidos
      if (current && current.name && current.baseUrl) {
        setCurrentEnvironment(current);
      } else {
        console.warn('SimpleBackendSelector: Entorno actual inválido:', current);
      }
      
      if (available && Array.isArray(available) && available.length > 0) {
        setAvailableEnvironments(available);
      } else {
        console.warn('SimpleBackendSelector: Entornos disponibles inválidos:', available);
      }
    } catch (error) {
      console.error('Error loading current environment:', error);
    }
  };

  const handleEnvironmentSelect = async (environment: BackendEnvironment) => {
    setIsLoading(true);
    setTestingEnvironment(environment.id);
    
    try {
      // Cambiar al nuevo entorno
      const newEnvironment = await apiConfig.switchEnvironment(environment.id);
      
      // Probar conectividad
      const isWorking = await apiConfig.testCurrentEnvironment();
      
      if (isWorking) {
        setCurrentEnvironment(newEnvironment);
        setIsModalVisible(false);
        onEnvironmentChange?.(newEnvironment);
        
        Alert.alert(
          '✅ Entorno Cambiado',
          `Conectado exitosamente a: ${newEnvironment.name}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          '⚠️ Sin Conectividad',
          `No se pudo conectar a: ${newEnvironment.name}\n\n¿Deseas cambiar de todos modos?`,
          [
            { text: 'Cancelar', style: 'cancel' },
            { 
              text: 'Cambiar', 
              onPress: () => {
                setCurrentEnvironment(newEnvironment);
                setIsModalVisible(false);
                onEnvironmentChange?.(newEnvironment);
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error switching environment:', error);
      Alert.alert('Error', 'No se pudo cambiar el entorno');
    } finally {
      setIsLoading(false);
      setTestingEnvironment(null);
    }
  };

  const testEnvironment = async (environment: BackendEnvironment) => {
    setTestingEnvironment(environment.id);
    
    try {
      // Crear una instancia temporal para probar
      const testUrl = environment.baseUrl.replace('/api', '/api/health');
      const response = await fetch(testUrl, {
        method: 'GET',
        timeout: 5000,
      });
      
      const isWorking = response.ok;
      
      Alert.alert(
        `🔍 Test de Conectividad`,
        `${environment.name}\n\nEstado: ${isWorking ? '✅ Conectado' : '❌ Sin conexión'}\nURL: ${environment.baseUrl}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        `🔍 Test de Conectividad`,
        `${environment.name}\n\nEstado: ❌ Sin conexión\nError: ${error.message}`,
        [{ text: 'OK' }]
      );
    } finally {
      setTestingEnvironment(null);
    }
  };

  return (
    <>
      <TouchableOpacity 
        style={styles.container}
        onPress={() => setIsModalVisible(true)}
      >
        <Ionicons 
          name="server-outline" 
          size={16} 
          color="#FFC300" 
        />
        <Text style={styles.text}>
          {currentEnvironment?.name || 'Seleccionar Backend'}
        </Text>
        <Ionicons 
          name="chevron-down" 
          size={16} 
          color="#666" 
        />
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🌐 Seleccionar Backend</Text>
            
            {currentEnvironment && (
              <View style={styles.currentIndicator}>
                <Text style={styles.currentText}>
                  Actual: {currentEnvironment.name}
                </Text>
              </View>
            )}

            <ScrollView showsVerticalScrollIndicator={false}>
              {availableEnvironments.map((environment) => (
                <View key={environment.id} style={styles.environmentItem}>
                  <View style={styles.environmentInfo}>
                    <Text style={styles.environmentName}>
                      {environment.name}
                    </Text>
                    <Text style={styles.environmentDescription}>
                      {environment.description}
                    </Text>
                    <Text style={styles.environmentUrl}>
                      {environment.baseUrl}
                    </Text>
                  </View>
                  
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.testButton]}
                      onPress={() => testEnvironment(environment)}
                      disabled={testingEnvironment === environment.id}
                    >
                      {testingEnvironment === environment.id ? (
                        <ActivityIndicator size="small" color="#FFC300" />
                      ) : (
                        <Ionicons name="wifi-outline" size={16} color="#FFC300" />
                      )}
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.actionButton, styles.selectButton]}
                      onPress={() => handleEnvironmentSelect(environment)}
                      disabled={isLoading || currentEnvironment?.id === environment.id}
                    >
                      {isLoading && testingEnvironment === environment.id ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <Ionicons 
                          name={currentEnvironment?.id === environment.id ? "checkmark" : "arrow-forward"} 
                          size={16} 
                          color="white" 
                        />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  environmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#444',
  },
  environmentInfo: {
    flex: 1,
  },
  environmentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  environmentDescription: {
    fontSize: 12,
    color: '#CCCCCC',
    marginBottom: 2,
  },
  environmentUrl: {
    fontSize: 10,
    color: '#999',
    fontFamily: 'monospace',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    minWidth: 40,
    alignItems: 'center',
  },
  testButton: {
    backgroundColor: '#FFC30020',
  },
  selectButton: {
    backgroundColor: '#FFC300',
  },
  currentIndicator: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  currentText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});
