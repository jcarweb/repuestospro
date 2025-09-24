import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConnectionStatus } from '../hooks/useConnectionStatus';
import { useTheme } from '../contexts/ThemeContext';

interface ConnectionIndicatorProps {
  showDetails?: boolean;
  onPress?: () => void;
}

export const ConnectionIndicator: React.FC<ConnectionIndicatorProps> = ({ 
  showDetails = false, 
  onPress 
}) => {
  const { isConnected, connectionType, isReconnecting } = useConnectionStatus();
  const { colors } = useTheme();

  const getConnectionIcon = () => {
    if (isReconnecting) {
      return 'sync-outline';
    }
    if (isConnected) {
      switch (connectionType) {
        case 'wifi':
          return 'wifi-outline';
        case 'cellular':
          return 'cellular-outline';
        case 'ethernet':
          return 'hardware-chip-outline';
        default:
          return 'checkmark-circle-outline';
      }
    }
    return 'cloud-offline-outline';
  };

  const getConnectionText = () => {
    if (isReconnecting) {
      return 'Reconectando...';
    }
    if (isConnected) {
      switch (connectionType) {
        case 'wifi':
          return 'WiFi';
        case 'cellular':
          return 'Datos móviles';
        case 'ethernet':
          return 'Ethernet';
        default:
          return 'Conectado';
      }
    }
    return 'Sin conexión';
  };

  const getConnectionColor = () => {
    if (isReconnecting) {
      return colors.warning || '#FFA500';
    }
    return isConnected ? colors.success || '#4CAF50' : colors.error || '#F44336';
  };

  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      style={[
        styles.container,
        { backgroundColor: colors.surface },
        onPress && styles.pressable
      ]}
      onPress={onPress}
    >
      <View style={styles.content}>
        <Ionicons
          name={getConnectionIcon()}
          size={16}
          color={getConnectionColor()}
          style={styles.icon}
        />
        <Text style={[styles.text, { color: colors.text }]}>
          {getConnectionText()}
        </Text>
        {showDetails && (
          <Text style={[styles.details, { color: colors.textSecondary }]}>
            {connectionType || 'Desconocido'}
          </Text>
        )}
      </View>
    </Component>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginHorizontal: 4,
  },
  pressable: {
    // Estilos adicionales para cuando es presionable
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
  },
  details: {
    fontSize: 10,
    marginLeft: 4,
    opacity: 0.7,
  },
});

export default ConnectionIndicator;
