import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Icon';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

interface ForgotPasswordScreenProps {
  navigation: any;
}

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const { forgotPassword, error, clearError } = useAuth();

  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  const handleSendResetEmail = async () => {
    if (!email) {
      Alert.alert('Error', 'Por favor ingresa tu correo electrónico');
      return;
    }

    // Validar formato de email
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Por favor ingresa un correo electrónico válido');
      return;
    }

    try {
      setIsLoading(true);
      
      await forgotPassword(email);
      
      setIsEmailSent(true);
      Alert.alert(
        'Email Enviado',
        'Se ha enviado un enlace de recuperación a tu correo electrónico. Por favor revisa tu bandeja de entrada.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al enviar el email de recuperación');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.goBack();
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
              <Icon name="arrow-back" size={24} color={colors.textTertiary} />
            </TouchableOpacity>
          </View>

          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../../../assets/logo-piezasya-light.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Título y descripción */}
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Recuperar Contraseña</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña
            </Text>
          </View>

          {/* Formulario */}
          <View style={styles.form}>
            {error && (
              <View style={[styles.errorContainer, { backgroundColor: colors.error + '20' }]}>
                <Icon name="alert-circle" size={20} color={colors.error} />
                <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
              </View>
            )}

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>Correo electrónico</Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <TextInput
                  style={[styles.input, { color: colors.textPrimary }]}
                  placeholder="tu@email.com"
                  placeholderTextColor={colors.textTertiary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
                <Icon
                  name="mail-outline"
                  size={20}
                  color={colors.textTertiary}
                  style={styles.inputIcon}
                />
              </View>
            </View>

            {/* Botón de envío */}
            <TouchableOpacity
              style={[styles.sendButton, { backgroundColor: colors.primary }, isLoading && styles.sendButtonDisabled]}
              onPress={handleSendResetEmail}
              disabled={isLoading}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <Icon name="hourglass-outline" size={20} color={colors.textPrimary} />
                  <Text style={[styles.sendButtonText, { color: colors.textPrimary }]}>Enviando...</Text>
                </View>
              ) : (
                <Text style={[styles.sendButtonText, { color: colors.textPrimary }]}>Enviar Email de Recuperación</Text>
              )}
            </TouchableOpacity>

            {/* Enlace de regreso */}
            <TouchableOpacity
              style={styles.backToLoginButton}
              onPress={handleBackToLogin}
              disabled={isLoading}
            >
              <Text style={[styles.backToLoginText, { color: colors.primary }]}>
                ¿Recordaste tu contraseña? Iniciar sesión
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 200,
    height: 100,
  },
  titleContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    gap: 24,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  inputIcon: {
    marginLeft: 12,
  },
  sendButton: {
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
  sendButtonDisabled: {
    backgroundColor: '#F3F4F6',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sendButtonText: {
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
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    marginLeft: 8,
    flexShrink: 1,
  },
});

export default ForgotPasswordScreen;
