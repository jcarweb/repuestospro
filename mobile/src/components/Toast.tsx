import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import Icon from 'react-native-vector-icons/Icon';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  visible: boolean;
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  type,
  onClose,
  duration = 4000
}) => {
  const { colors } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      // Animar entrada
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto cerrar después del tiempo especificado
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const getToastStyle = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: colors.success,
          borderColor: colors.success,
        };
      case 'error':
        return {
          backgroundColor: colors.error,
          borderColor: colors.error,
        };
      case 'warning':
        return {
          backgroundColor: colors.warning,
          borderColor: colors.warning,
        };
      case 'info':
        return {
          backgroundColor: colors.info,
          borderColor: colors.info,
        };
      default:
        return {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
        };
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <Icon name="checkmark-circle" size={20} color="white" />;
      case 'error':
        return <Icon name="alert-circle" size={20} color="white" />;
      case 'warning':
        return <Icon name="warning" size={20} color="white" />;
      case 'info':
        return <Icon name="information-circle" size={20} color="white" />;
      default:
        return <Icon name="information-circle" size={20} color="white" />;
    }
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View
        style={[
          styles.toast,
          getToastStyle(),
        ]}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            {getIcon()}
          </View>
          <Text style={styles.message}>{message}</Text>
        </View>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Icon name="close" size={16} color="white" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  message: {
    flex: 1,
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  closeButton: {
    marginLeft: 12,
    padding: 4,
  },
});

export default Toast;
