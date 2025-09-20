import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface EmailVerificationScreenProps {
  navigation: any;
  route: any;
}

const EmailVerificationScreen: React.FC<EmailVerificationScreenProps> = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { showToast } = useToast();
  const { resendVerificationEmail, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const email = route.params?.email || '';

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResendEmail = async () => {
    if (countdown > 0) return;
    
    try {
      setIsLoading(true);
      await resendVerificationEmail(email);
      showToast('Email de verificación enviado nuevamente', 'success');
      setCountdown(60); // 60 segundos de espera
    } catch (error: any) {
      showToast(error.message || 'Error al reenviar el email', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = async () => {
    try {
      await logout();
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error logging out:', error);
      navigation.navigate('Login');
    }
  };

  const handleCheckVerification = async () => {
    try {
      setIsLoading(true);
      
      // Simular verificación exitosa y actualizar el estado del usuario
      showToast('Email verificado exitosamente. Puedes iniciar sesión ahora.', 'success');
      
      // Simular que el usuario ahora está verificado
      // En una implementación real, esto vendría del backend
      const mockVerifiedUser = {
        id: '1',
        name: 'Usuario',
        email: email,
        emailVerified: true, // Marcar como verificado
        role: 'client'
      };
      
      // Guardar el usuario verificado en AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(mockVerifiedUser));
      
      // Navegar a la pantalla de éxito
      setTimeout(() => {
        navigation.navigate('EmailVerificationSuccess');
      }, 1500);
      
    } catch (error: any) {
      showToast(error.message || 'Error al verificar', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          {/* Header con botón de regreso */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackToLogin}
            >
              <Ionicons name="arrow-back" size={24} color={colors.textTertiary} />
            </TouchableOpacity>
          </View>

          {/* Icono de verificación */}
          <View style={styles.iconContainer}>
            <View style={[styles.iconCircle, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="mail" size={60} color={colors.primary} />
            </View>
          </View>

          {/* Título y descripción */}
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              Verifica tu Email
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Hemos enviado un enlace de verificación a:
            </Text>
            <Text style={[styles.email, { color: colors.primary }]}>
              {email}
            </Text>
          </View>

          {/* Instrucciones */}
          <View style={styles.instructionsContainer}>
            <Text style={[styles.instructionsTitle, { color: colors.textPrimary }]}>
              Para continuar, necesitas:
            </Text>
            <View style={styles.instructionItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={[styles.instructionText, { color: colors.textSecondary }]}>
                Revisar tu bandeja de entrada
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={[styles.instructionText, { color: colors.textSecondary }]}>
                Hacer clic en el enlace de verificación
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={[styles.instructionText, { color: colors.textSecondary }]}>
                Volver a la aplicación
              </Text>
            </View>
          </View>

          {/* Botones de acción */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: colors.primary }]}
              onPress={handleCheckVerification}
              disabled={isLoading}
            >
              <Text style={[styles.primaryButtonText, { color: colors.textPrimary }]}>
                Ya verifiqué mi email
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.secondaryButton, 
                { 
                  backgroundColor: countdown > 0 ? colors.border : colors.surface,
                  borderColor: colors.border 
                }
              ]}
              onPress={handleResendEmail}
              disabled={isLoading || countdown > 0}
            >
              <Text style={[styles.secondaryButtonText, { color: colors.textSecondary }]}>
                {countdown > 0 
                  ? `Reenviar en ${countdown}s` 
                  : 'Reenviar email de verificación'
                }
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backToLoginButton}
              onPress={handleBackToLogin}
              disabled={isLoading}
            >
              <Text style={[styles.backToLoginText, { color: colors.primary }]}>
                Volver al inicio de sesión
              </Text>
            </TouchableOpacity>

            {/* Botón de prueba para deep linking */}
            <TouchableOpacity
              style={[styles.testButton, { backgroundColor: colors.warning }]}
              onPress={() => {
                // Simular el deep link con el token del email
                const testToken = 'a8b07d9e09be54362bb92617c49066d5030981898fcaa889c10e68aad2491de4';
                navigation.navigate('EmailVerificationCallback', { token: testToken });
              }}
            >
              <Text style={[styles.testButtonText, { color: colors.textPrimary }]}>
                🔗 Probar Deep Link (Testing)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backToLoginButton}
              onPress={handleBackToLogin}
              disabled={isLoading}
            >
              <Text style={[styles.backToLoginText, { color: colors.primary }]}>
                Volver al inicio de sesión
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  instructionsContainer: {
    marginBottom: 32,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  instructionText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  actionsContainer: {
    gap: 16,
  },
  primaryButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  backToLoginButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  backToLoginText: {
    fontSize: 14,
    fontWeight: '600',
  },
  testButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EmailVerificationScreen;

