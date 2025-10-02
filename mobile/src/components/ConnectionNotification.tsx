import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConnectionNotifications } from '../hooks/useConnectionStatus';

const { width } = Dimensions.get('window');

interface ConnectionNotificationProps {
  style?: any;
}

export const ConnectionNotification: React.FC<ConnectionNotificationProps> = ({ style }) => {
  const { showNotification, notificationMessage, hideNotification } = useConnectionNotifications();
  const slideAnim = React.useRef(new Animated.Value(-100)).current;

  React.useEffect(() => {
    if (showNotification) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [showNotification, slideAnim]);

  if (!showNotification) {
    return null;
  }

  const isOffline = notificationMessage.includes('Sin conexión');
  const isReconnecting = notificationMessage.includes('restaurada');

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          backgroundColor: isOffline ? '#FF6B6B' : '#4ECDC4',
        },
        style,
      ]}
    >
      <View style={styles.content}>
        <Ionicons
          name={isOffline ? 'wifi-outline' : 'checkmark-circle-outline'}
          size={20}
          color="white"
          style={styles.icon}
        />
        <Text style={styles.message}>{notificationMessage}</Text>
        {isReconnecting && (
          <TouchableOpacity onPress={hideNotification} style={styles.closeButton}>
            <Ionicons name="close" size={16} color="white" />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingTop: 50, // Para evitar el notch
    paddingBottom: 10,
    paddingHorizontal: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  icon: {
    marginRight: 8,
  },
  message: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    marginLeft: 8,
    padding: 4,
  },
});

export default ConnectionNotification;
