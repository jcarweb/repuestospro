import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const BackendSwitcher: React.FC = () => {
  const [currentBackend, setCurrentBackend] = useState('local');

  useEffect(() => {
    loadCurrentBackend();
  }, []);

  const loadCurrentBackend = async () => {
    try {
      const saved = await AsyncStorage.getItem('selected_backend_environment');
      if (saved) {
        setCurrentBackend(saved);
      }
    } catch (error) {
      console.error('Error loading backend:', error);
    }
  };

  const switchBackend = async () => {
    try {
      const backends = [
        { id: 'local', name: 'Local', url: '192.168.0.106:5000' },
        { id: 'render', name: 'Render', url: 'piezasya-back.onrender.com' },
        { id: 'localhost', name: 'Localhost', url: 'localhost:5000' }
      ];

      const currentIndex = backends.findIndex(b => b.id === currentBackend);
      const nextIndex = (currentIndex + 1) % backends.length;
      const newBackend = backends[nextIndex];
      
      await AsyncStorage.setItem('selected_backend_environment', newBackend.id);
      setCurrentBackend(newBackend.id);
      
      Alert.alert(
        '✅ Backend Cambiado',
        `Ahora usando: ${newBackend.name}\nURL: ${newBackend.url}\n\nReinicia la app para aplicar los cambios.`,
        [{ text: 'OK' }]
      );
      
      console.log('🔄 Backend cambiado a:', newBackend.id);
    } catch (error) {
      console.error('Error changing backend:', error);
      Alert.alert('Error', 'No se pudo cambiar el backend');
    }
  };

  const getBackendInfo = () => {
    switch (currentBackend) {
      case 'render':
        return { name: 'Render', color: '#2196F3', icon: 'cloud-outline' };
      case 'localhost':
        return { name: 'Localhost', color: '#FF9800', icon: 'desktop-outline' };
      default:
        return { name: 'Local', color: '#4CAF50', icon: 'home-outline' };
    }
  };

  const backendInfo = getBackendInfo();

  return (
    <TouchableOpacity 
      style={[styles.container, { borderColor: backendInfo.color }]}
      onPress={switchBackend}
    >
      <Ionicons 
        name={backendInfo.icon} 
        size={16} 
        color={backendInfo.color} 
      />
      <Text style={[styles.text, { color: backendInfo.color }]}>
        {backendInfo.name}
      </Text>
      <Ionicons 
        name="swap-horizontal-outline" 
        size={14} 
        color={backendInfo.color} 
      />
    </TouchableOpacity>
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
    marginBottom: 16,
  },
  text: {
    fontSize: 12,
    marginLeft: 6,
    marginRight: 6,
    fontWeight: '600',
  },
});
