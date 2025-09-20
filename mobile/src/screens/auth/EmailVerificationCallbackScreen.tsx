import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import Icon from 'react-native-vector-icons/Icon';
import mobileVerificationService from '../../services/mobileVerification';

interface EmailVerificationCallbackScreenProps {
  navigation: any;
  route: any;
}

const EmailVerificationCallbackScreen: React.FC<EmailVerificationCallbackScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const { colors } = useTheme();
  const { showToast } = useToast();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    handleEmailVerification();
  }, []);

  const handleEmailVerification = async () => {
    try {
      setIsVerifying(true);
      
      // Obtener el token de los parámetros de la ruta
      const token = route.params?.token;
      
      if (!token) {
        setVerificationStatus('error');
        showToast('Token de verificación no encontrado', 'error');
        return;
      }

      // Usar el servicio de verificación móvil
      const success = await mobileVerificationService.verifyEmailInMobile(
        token, 
        'somoselson@gmail.com' // Email del usuario actual
      );
      
      if (success) {
        setVerificationStatus('success');
        showToast('Email verificado exitosamente en la app móvil', 'success');
        
        // Navegar al login después de un delay
        setTimeout(() => {
          navigation.navigate('Login');
        }, 3000);
      } else {
        setVerificationStatus('error');
        showToast('Error al verificar el email', 'error');
      }
      
    } catch (error: any) {
      console.error('Email verification error:', error);
      setVerificationStatus('error');
      showToast(error.message || 'Error al verificar el email', 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  const renderContent = () => {
    if (isVerifying) {
      return (
        <View style={styles.content}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.message, { color: colors.textPrimary }]}>
            Verificando tu email...
          </Text>
        </View>
      );
    }

    if (verificationStatus === 'success') {
      return (
        <View style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: colors.success + '20' }]}>
            <Icon name="checkmark-circle" size={60} color={colors.success} />
          </View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            ¡Email Verificado!
          </Text>
          <Text style={[styles.message, { color: colors.textSecondary }]}>
            Tu email ha sido verificado exitosamente. Serás redirigido al inicio de sesión.
          </Text>
        </View>
      );
    }

    if (verificationStatus === 'error') {
      return (
        <View style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: colors.error + '20' }]}>
            <Icon name="close-circle" size={60} color={colors.error} />
          </View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Error de Verificación
          </Text>
          <Text style={[styles.message, { color: colors.textSecondary }]}>
            No se pudo verificar tu email. Por favor, intenta nuevamente o contacta soporte.
          </Text>
        </View>
      );
    }

    return null;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
});

export default EmailVerificationCallbackScreen;
