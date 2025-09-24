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
import { useTheme } from '../contexts/ThemeContext';
import { apiConfig } from '../config/api';
import { BackendEnvironment } from '../config/environments';

interface BackendSelectorProps {
  onEnvironmentChange?: (environment: BackendEnvironment) => void;
}

export const BackendSelector: React.FC<BackendSelectorProps> = ({ onEnvironmentChange }) => {
  const { theme } = useTheme();
  
  // Verificar que el tema esté disponible
  if (!theme || !theme.colors) {
    console.warn('BackendSelector: Theme not available, using fallback colors');
    return null; // No renderizar si no hay tema
  }
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentEnvironment, setCurrentEnvironment] = useState<BackendEnvironment | null>(null);
  const [availableEnvironments, setAvailableEnvironments] = useState<BackendEnvironment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [testingEnvironment, setTestingEnvironment] = useState<string | null>(null);

  useEffect(() => {
    loadCurrentEnvironment();
  }, []);

  const loadCurrentEnvironment = async () => {
    try {
      const current = apiConfig.getCurrentEnvironment();
      const available = apiConfig.getAvailableEnvironments();
      
      setCurrentEnvironment(current);
      setAvailableEnvironments(available);
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

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    text: {
      color: theme.colors.text,
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
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 20,
      width: '90%',
      maxHeight: '80%',
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    environmentItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderRadius: 8,
      marginBottom: 8,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    environmentInfo: {
      flex: 1,
    },
    environmentName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 4,
    },
    environmentDescription: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginBottom: 2,
    },
    environmentUrl: {
      fontSize: 10,
      color: theme.colors.textSecondary,
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
      backgroundColor: theme.colors.primary + '20',
    },
    selectButton: {
      backgroundColor: theme.colors.primary,
    },
    currentIndicator: {
      backgroundColor: theme.colors.success,
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
      backgroundColor: theme.colors.error,
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

  return (
    <>
      <TouchableOpacity 
        style={styles.container}
        onPress={() => setIsModalVisible(true)}
      >
        <Ionicons 
          name="server-outline" 
          size={16} 
          color={theme.colors.primary} 
        />
        <Text style={styles.text}>
          {currentEnvironment?.name || 'Seleccionar Backend'}
        </Text>
        <Ionicons 
          name="chevron-down" 
          size={16} 
          color={theme.colors.textSecondary} 
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
                        <ActivityIndicator size="small" color={theme.colors.primary} />
                      ) : (
                        <Ionicons name="wifi-outline" size={16} color={theme.colors.primary} />
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
