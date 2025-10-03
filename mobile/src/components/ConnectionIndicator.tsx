import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { connectionMonitorService, ConnectionStatus } from '../services/connectionMonitorService';

interface ConnectionIndicatorProps {
  onPress?: () => void;
  showDetails?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const ConnectionIndicator: React.FC<ConnectionIndicatorProps> = ({
  onPress,
  showDetails = false,
  size = 'small',
}) => {
  const { colors } = useTheme();
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isConnected: false,
    lastCheck: '',
    responseTime: 0,
    backend: '',
  });
  const [isChecking, setIsChecking] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    // Suscribirse a cambios de estado
    const handleStatusChange = (status: ConnectionStatus) => {
      setConnectionStatus(status);
    };

    connectionMonitorService.addListener(handleStatusChange);
    
    // Verificar conexión inicial
    connectionMonitorService.checkConnection();

    return () => {
      connectionMonitorService.removeListener(handleStatusChange);
    };
  }, []);

  useEffect(() => {
    // Animación de pulso cuando está conectado
    if (connectionStatus.isConnected) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [connectionStatus.isConnected]);

  const handlePress = async () => {
    if (isChecking) return;
    
    setIsChecking(true);
    try {
      await connectionMonitorService.forceCheck();
    } finally {
      setIsChecking(false);
    }
    
    if (onPress) {
      onPress();
    }
  };

  const getStatusColor = () => {
    if (connectionStatus.isConnected) {
      return '#10B981'; // Verde
    } else if (connectionStatus.error) {
      return '#EF4444'; // Rojo
    } else {
      return '#F59E0B'; // Amarillo
    }
  };

  const getStatusIcon = () => {
    if (isChecking) {
      return 'refresh';
    } else if (connectionStatus.isConnected) {
      return 'checkmark-circle';
    } else if (connectionStatus.error) {
      return 'close-circle';
    } else {
      return 'warning';
    }
  };

  const getStatusText = () => {
    if (isChecking) {
      return 'Verificando...';
    } else if (connectionStatus.isConnected) {
      return `Conectado (${connectionStatus.responseTime}ms)`;
    } else if (connectionStatus.error) {
      return 'Sin conexión';
    } else {
      return 'Verificando...';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: styles.smallContainer,
          icon: 16,
          text: styles.smallText,
        };
      case 'medium':
        return {
          container: styles.mediumContainer,
          icon: 20,
          text: styles.mediumText,
        };
      case 'large':
        return {
          container: styles.largeContainer,
          icon: 24,
          text: styles.largeText,
        };
      default:
        return {
          container: styles.smallContainer,
          icon: 16,
          text: styles.smallText,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity
      style={[
        sizeStyles.container,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
      onPress={handlePress}
      disabled={isChecking}
    >
      <View style={styles.content}>
        {isChecking ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Animated.View
            style={[
              styles.iconContainer,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <Ionicons
              name={getStatusIcon()}
              size={sizeStyles.icon}
              color={getStatusColor()}
            />
          </Animated.View>
        )}
        
        {showDetails && (
          <View style={styles.details}>
            <Text style={[sizeStyles.text, { color: colors.text }]}>
              {getStatusText()}
            </Text>
            {connectionStatus.backend && (
              <Text style={[styles.backendText, { color: colors.textSecondary }]}>
                {connectionStatus.backend.replace('https://', '').replace('http://', '')}
              </Text>
            )}
            {connectionStatus.error && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {connectionStatus.error}
              </Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  smallContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  mediumContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  largeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 4,
  },
  details: {
    marginLeft: 4,
  },
  smallText: {
    fontSize: 10,
    fontWeight: '500',
  },
  mediumText: {
    fontSize: 12,
    fontWeight: '500',
  },
  largeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  backendText: {
    fontSize: 8,
    marginTop: 1,
  },
  errorText: {
    fontSize: 8,
    marginTop: 1,
  },
});

export default ConnectionIndicator;