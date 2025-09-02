import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNetwork } from '../contexts/NetworkContext';

// Componente para mostrar el estado de la red
export const NetworkStatus: React.FC = () => {
  const {
    networkConfig,
    isScanning,
    isConnected,
    lastError,
    rescanNetwork,
    checkConnection,
    clearError,
    networkName,
    baseUrl,
    connectionStatus,
  } = useNetwork();

  // Manejar rescan manual
  const handleRescan = async () => {
    Alert.alert(
      'Rescanear Red',
      '¿Deseas escanear la red para encontrar la API?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Escanear',
          onPress: async () => {
            try {
              await rescanNetwork();
            } catch (error) {
              Alert.alert('Error', 'No se pudo escanear la red');
            }
          },
        },
      ]
    );
  };

  // Manejar verificación manual
  const handleCheckConnection = async () => {
    try {
      const isWorking = await checkConnection();
      if (isWorking) {
        Alert.alert('Conexión', 'La API está funcionando correctamente');
      } else {
        Alert.alert('Conexión', 'No se pudo conectar con la API');
      }
    } catch (error) {
      Alert.alert('Error', 'Error al verificar la conexión');
    }
  };

  // Obtener el color del estado
  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return '#4CAF50'; // Verde
      case 'disconnected':
        return '#FF9800'; // Naranja
      case 'scanning':
        return '#2196F3'; // Azul
      case 'error':
        return '#F44336'; // Rojo
      default:
        return '#9E9E9E'; // Gris
    }
  };

  // Obtener el texto del estado
  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Conectado';
      case 'disconnected':
        return 'Desconectado';
      case 'scanning':
        return 'Escaneando...';
      case 'error':
        return 'Error';
      default:
        return 'Desconocido';
    }
  };

  // Obtener el icono del estado
  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return '●';
      case 'disconnected':
        return '○';
      case 'scanning':
        return '⟳';
      case 'error':
        return '✕';
      default:
        return '?';
    }
  };

  return (
    <View style={styles.container}>
      {/* Estado de conexión */}
      <View style={styles.statusRow}>
        <View style={styles.statusIndicator}>
          <Text style={[styles.statusIcon, { color: getStatusColor() }]}>
            {getStatusIcon()}
          </Text>
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>
        
        {isScanning && (
          <Text style={styles.scanningText}>Escaneando red...</Text>
        )}
      </View>

      {/* Información de la red */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoLabel}>Red:</Text>
        <Text style={styles.infoValue}>{networkName}</Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoLabel}>URL:</Text>
        <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode="middle">
          {baseUrl}
        </Text>
      </View>

      {/* Última verificación */}
      {networkConfig?.lastTested && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Última verificación:</Text>
          <Text style={styles.infoValue}>
            {new Date(networkConfig.lastTested).toLocaleTimeString()}
          </Text>
        </View>
      )}

      {/* Error si existe */}
      {lastError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorLabel}>Error:</Text>
          <Text style={styles.errorText}>{lastError}</Text>
          <TouchableOpacity onPress={clearError} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Limpiar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Botones de acción */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={handleCheckConnection}
          style={[styles.button, styles.checkButton]}
          disabled={isScanning}
        >
          <Text style={styles.buttonText}>Verificar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleRescan}
          style={[styles.button, styles.rescanButton]}
          disabled={isScanning}
        >
          <Text style={styles.buttonText}>
            {isScanning ? 'Escaneando...' : 'Rescanear'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Estilos
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    margin: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  statusIcon: {
    fontSize: 20,
    marginRight: 8,
    fontWeight: 'bold',
  },
  
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  
  scanningText: {
    fontSize: 14,
    color: '#2196F3',
    fontStyle: 'italic',
  },
  
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    width: 120,
  },
  
  infoValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    fontFamily: 'monospace',
  },
  
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 6,
    marginTop: 8,
    marginBottom: 16,
  },
  
  errorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#c62828',
    marginBottom: 4,
  },
  
  errorText: {
    fontSize: 14,
    color: '#c62828',
    marginBottom: 8,
  },
  
  clearButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#c62828',
    borderRadius: 4,
  },
  
  clearButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  
  checkButton: {
    backgroundColor: '#2196F3',
  },
  
  rescanButton: {
    backgroundColor: '#4CAF50',
  },
  
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default NetworkStatus;
