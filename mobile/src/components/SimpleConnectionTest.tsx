import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { connectionMonitorService } from '../services/connectionMonitorService';
import { getBaseURL } from '../config/api';
import { getBackendDebugInfo, testDirectConnection, resetBackendConfig } from '../utils/backendDebugger';

interface SimpleConnectionTestProps {
  onResult?: (connected: boolean, message: string) => void;
}

const SimpleConnectionTest: React.FC<SimpleConnectionTestProps> = ({ onResult }) => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{ connected: boolean; message: string } | null>(null);
  const [diagnostic, setDiagnostic] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const testConnection = async () => {
    setTesting(true);
    setResult(null);
    setDiagnostic(null);

    try {
      console.log('🧪 Iniciando diagnóstico completo...');
      
      // Obtener información de debug del backend
      const debugInfoResult = await getBackendDebugInfo();
      setDebugInfo(debugInfoResult);
      console.log('🔍 Debug info:', debugInfoResult);
      
      // Probar conexión directa
      const directTest = await testDirectConnection(debugInfoResult.baseURL + '/products');
      console.log('🔍 Prueba directa:', directTest);
      
      // Usar el diagnóstico completo
      const diagnosticResult = await connectionMonitorService.fullDiagnostic();
      setDiagnostic(diagnosticResult);
      
      // Verificar si algún endpoint funcionó
      const successfulTests = diagnosticResult.tests.filter(test => test.status === 'success');
      
      if (successfulTests.length > 0) {
        setResult({
          connected: true,
          message: `${successfulTests.length} endpoints funcionando`
        });
        
        if (onResult) {
          onResult(true, `${successfulTests.length} endpoints funcionando`);
        }
      } else {
        setResult({
          connected: false,
          message: 'Todos los endpoints fallaron'
        });
        
        if (onResult) {
          onResult(false, 'Todos los endpoints fallaron');
        }
      }

    } catch (error: any) {
      console.error('❌ Error en diagnóstico:', error);
      setResult({
        connected: false,
        message: error.message
      });
      
      if (onResult) {
        onResult(false, error.message);
      }
    } finally {
      setTesting(false);
    }
  };

  const resetConfig = async () => {
    try {
      await resetBackendConfig();
      Alert.alert('Configuración Limpiada', 'La configuración del backend ha sido limpiada. Reinicia la app.');
    } catch (error) {
      Alert.alert('Error', 'No se pudo limpiar la configuración');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={[styles.button, testing && styles.buttonDisabled]} 
          onPress={testConnection}
          disabled={testing}
        >
          <Text style={styles.buttonText}>
            {testing ? 'Diagnosticando...' : 'Diagnóstico'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.resetButton]} 
          onPress={resetConfig}
        >
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>
      </View>

      {result && (
        <View style={[styles.result, result.connected ? styles.resultSuccess : styles.resultError]}>
          <Text style={styles.resultText}>
            {result.connected ? '✅' : '❌'} {result.message}
          </Text>
        </View>
      )}

      {debugInfo && (
        <View style={styles.debugInfoContainer}>
          <Text style={styles.debugTitle}>Configuración Backend</Text>
          <Text style={styles.debugText}>Entorno: {debugInfo.selectedEnvironment}</Text>
          <Text style={styles.debugText}>URL: {debugInfo.baseURL}</Text>
        </View>
      )}

      {diagnostic && (
        <ScrollView style={styles.diagnosticContainer}>
          <Text style={styles.diagnosticTitle}>URL Base: {diagnostic.baseURL}</Text>
          {diagnostic.tests.map((test: any, index: number) => (
            <View key={index} style={styles.testItem}>
              <Text style={styles.testEndpoint}>{test.endpoint}</Text>
              <Text style={[
                styles.testStatus, 
                test.status === 'success' ? styles.testSuccess : styles.testError
              ]}>
                {test.status === 'success' ? '✅' : '❌'} 
                {test.httpStatus ? ` HTTP ${test.httpStatus}` : ''} 
                ({test.responseTime}ms)
              </Text>
              {test.error && (
                <Text style={styles.testError}>{test.error}</Text>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  button: {
    backgroundColor: '#6366f1',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  result: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
  },
  resultSuccess: {
    backgroundColor: '#dcfce7',
  },
  resultError: {
    backgroundColor: '#fef2f2',
  },
  resultText: {
    fontSize: 14,
    fontWeight: '500',
  },
  diagnosticContainer: {
    marginTop: 12,
    maxHeight: 200,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 8,
  },
  diagnosticTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#374151',
  },
  testItem: {
    marginBottom: 4,
    padding: 4,
  },
  testEndpoint: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6b7280',
  },
  testStatus: {
    fontSize: 10,
    marginTop: 2,
  },
  testSuccess: {
    color: '#059669',
  },
  testError: {
    color: '#dc2626',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  resetButton: {
    backgroundColor: '#dc2626',
  },
  debugInfoContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
  },
  debugTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#374151',
  },
  debugText: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 2,
  },
});

export default SimpleConnectionTest;
