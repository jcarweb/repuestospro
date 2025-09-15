import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { getNetworkConfig, rescanNetwork } from '../utils/networkUtils';

interface NetworkDiagnosticProps {
  onClose: () => void;
}

const NetworkDiagnostic: React.FC<NetworkDiagnosticProps> = ({ onClose }) => {
  const { colors } = useTheme();
  const [isScanning, setIsScanning] = useState(false);
  const [networkInfo, setNetworkInfo] = useState<any>(null);
  const [testResults, setTestResults] = useState<any[]>([]);

  useEffect(() => {
    loadNetworkInfo();
  }, []);

  const loadNetworkInfo = async () => {
    try {
      const config = await getNetworkConfig();
      setNetworkInfo(config);
    } catch (error) {
      console.error('Error loading network info:', error);
    }
  };

  const testConnection = async (url: string) => {
    try {
      const response = await fetch(`${url}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      return {
        url,
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
      };
    } catch (error: any) {
      return {
        url,
        success: false,
        error: error.message,
      };
    }
  };

  const runDiagnostic = async () => {
    setIsScanning(true);
    setTestResults([]);

    const testUrls = [
      'http://192.168.0.110:5000/api',
      'http://192.168.0.110:5000/api',
      'http://192.168.1.1:5000/api',
    ];

    const results = [];
    for (const url of testUrls) {
      const result = await testConnection(url);
      results.push(result);
      setTestResults([...results]);
    }

    setIsScanning(false);
  };

  const rescanNetworkConfig = async () => {
    setIsScanning(true);
    try {
      const newConfig = await rescanNetwork();
      setNetworkInfo(newConfig);
    } catch (error) {
      console.error('Error rescanning network:', error);
    }
    setIsScanning(false);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 20,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.textPrimary,
    },
    closeButton: {
      padding: 10,
      backgroundColor: colors.error,
      borderRadius: 8,
    },
    closeButtonText: {
      color: colors.surface,
      fontWeight: 'bold',
    },
    section: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.textPrimary,
      marginBottom: 10,
    },
    infoItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    infoLabel: {
      color: colors.textSecondary,
    },
    infoValue: {
      color: colors.textPrimary,
      fontWeight: '500',
    },
    button: {
      backgroundColor: colors.primary,
      padding: 15,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 10,
    },
    buttonText: {
      color: colors.surface,
      fontWeight: 'bold',
    },
    testResult: {
      padding: 10,
      marginBottom: 8,
      borderRadius: 8,
      borderWidth: 1,
    },
    testResultSuccess: {
      backgroundColor: colors.success + '20',
      borderColor: colors.success,
    },
    testResultError: {
      backgroundColor: colors.error + '20',
      borderColor: colors.error,
    },
    testResultText: {
      color: colors.textPrimary,
      fontSize: 12,
    },
    loadingText: {
      color: colors.textSecondary,
      textAlign: 'center',
      fontStyle: 'italic',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Diagnóstico de Red</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Cerrar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuración Actual</Text>
          {networkInfo ? (
            <>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>URL Base:</Text>
                <Text style={styles.infoValue}>{networkInfo.baseUrl}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Red:</Text>
                <Text style={styles.infoValue}>{networkInfo.networkName}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Local:</Text>
                <Text style={styles.infoValue}>{networkInfo.isLocal ? 'Sí' : 'No'}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Funcionando:</Text>
                <Text style={[styles.infoValue, { color: networkInfo.isWorking ? colors.success : colors.error }]}>
                  {networkInfo.isWorking ? 'Sí' : 'No'}
                </Text>
              </View>
            </>
          ) : (
            <Text style={styles.loadingText}>Cargando información...</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones</Text>
          <TouchableOpacity 
            style={styles.button} 
            onPress={runDiagnostic}
            disabled={isScanning}
          >
            <Text style={styles.buttonText}>
              {isScanning ? 'Probando...' : 'Probar Conexiones'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.button} 
            onPress={rescanNetworkConfig}
            disabled={isScanning}
          >
            <Text style={styles.buttonText}>
              {isScanning ? 'Escaneando...' : 'Reescanear Red'}
            </Text>
          </TouchableOpacity>
        </View>

        {testResults.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resultados de Pruebas</Text>
            {testResults.map((result, index) => (
              <View 
                key={index}
                style={[
                  styles.testResult,
                  result.success ? styles.testResultSuccess : styles.testResultError
                ]}
              >
                <Text style={styles.testResultText}>
                  <Text style={{ fontWeight: 'bold' }}>{result.url}</Text>
                  {'\n'}
                  {result.success ? (
                    `✅ ${result.status} ${result.statusText}`
                  ) : (
                    `❌ ${result.error || 'Error de conexión'}`
                  )}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información de Red</Text>
          <Text style={styles.testResultText}>
            • Backend esperado: http://192.168.0.110:5000/api{'\n'}
            • Asegúrate de estar en la misma red WiFi{'\n'}
            • Verifica que el firewall no bloquee la conexión{'\n'}
            • Si persiste, prueba con datos móviles
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default NetworkDiagnostic;
