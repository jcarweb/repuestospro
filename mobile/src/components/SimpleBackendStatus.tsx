import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiConfig } from '../config/api';

export const SimpleBackendStatus: React.FC = () => {
  const [currentEnvironment, setCurrentEnvironment] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCurrentEnvironment();
  }, []);

  const loadCurrentEnvironment = async () => {
    try {
      setIsLoading(true);
      const environment = apiConfig.getCurrentEnvironment();
      
      if (environment && environment.name && environment.baseUrl) {
        setCurrentEnvironment(environment);
        console.log('🔧 SimpleBackendStatus: Entorno cargado:', environment.name);
      } else {
        console.warn('SimpleBackendStatus: Entorno inválido:', environment);
        setCurrentEnvironment(null);
      }
    } catch (error) {
      console.error('Error loading environment:', error);
      setCurrentEnvironment(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Si está cargando o no hay entorno, no renderizar nada
  if (isLoading || !currentEnvironment) {
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
