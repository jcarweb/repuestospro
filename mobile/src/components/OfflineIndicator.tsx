import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { OFFLINE_MODE } from '../config/offline-mode';

const OfflineIndicator: React.FC = () => {
  const { colors } = useTheme();

  if (!OFFLINE_MODE) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.warning }]}>
      <Ionicons name="wifi-outline" size={16} color="white" />
      <Text style={styles.text}>
        Modo Offline - Datos de Prueba
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FF9500',
  },
  text: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default OfflineIndicator;
