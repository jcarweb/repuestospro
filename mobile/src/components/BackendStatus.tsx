import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAPIConfig } from '../hooks/useAPIConfig';

export const BackendStatus: React.FC = () => {
  const { currentEnvironment, isLoading } = useAPIConfig();

  // Si está cargando o no hay entorno, no renderizar nada
  if (isLoading || !currentEnvironment) {
    return null;
  }

  // Verificar que el entorno tenga las propiedades necesarias
  if (!currentEnvironment.name || !currentEnvironment.baseUrl) {
    console.warn('BackendStatus: Entorno inválido:', currentEnvironment);
    return null;
  }

  return (
    <View style={styles.container}>
      <Ionicons 
        name="server-outline" 
        size={16} 
        color="#FFC300" 
      />
      <Text style={styles.text}>
        {currentEnvironment.name}
      </Text>
      <View style={[
        styles.statusIndicator, 
        { backgroundColor: currentEnvironment.isLocal ? '#4CAF50' : '#2196F3' }
      ]}>
        <Text style={styles.statusText}>
          {currentEnvironment.isLocal ? 'LOCAL' : 'REMOTE'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#444',
    marginBottom: 8,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 11,
    marginLeft: 6,
    flex: 1,
  },
  statusIndicator: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    color: 'white',
    fontSize: 9,
    fontWeight: '600',
  },
});
